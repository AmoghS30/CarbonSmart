# backend/api/views.py
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Activity
from .serializers import ActivitySerializer
from .web3_interact import mint_credit, get_user_credits, get_connection_status
import os
from dotenv import load_dotenv

load_dotenv()

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://127.0.0.1:8002/predict")

# Carbon offset activity types that are eligible for NFT minting
OFFSET_ACTIVITY_TYPES = [
    'tree_planting',
    'renewable_energy',
    'recycling',
    'carbon_offset',
]


@api_view(['POST'])
def log_activity(request):
    """
    Log a user activity, predict carbon emission using AI engine,
    mint blockchain NFT credit (only for offset activities), and store everything in DB.

    Request body:
    {
        "user": "username",
        "activity_type": "transport|electricity|waste|tree_planting|etc",
        "activity": "drove 20 km to work",
        "user_wallet": "0x..." (optional but required for NFT minting),
        "is_offset": true/false (optional, determines if this is an offset activity)
    }

    Response:
    {
        "id": 1,
        "user": "username",
        "activity_type": "transport",
        "data": {...},
        "predicted_emission": 4.2,
        "timestamp": "2024-12-03T10:00:00Z",
        "transaction_hash": "0x...",
        "token_id": 5,
        "user_wallet": "0x..."
    }
    """
    payload = request.data
    print(f"Received activity payload: {payload}")

    user = payload.get('user', 'anonymous')
    activity_type = payload.get('activity_type', 'unknown')
    activity_description = payload.get('activity', '')
    user_wallet = payload.get('user_wallet')
    is_offset = payload.get('is_offset', False)

    # Determine if this is an offset activity
    is_offset_activity = is_offset or activity_type in OFFSET_ACTIVITY_TYPES

    # Step 1: Get prediction from AI Engine
    predicted_emission = 0
    try:
        ai_payload = {
            "activity": activity_description,
            "activity_type": activity_type
        }
        ai_response = requests.post(AI_ENGINE_URL, json=ai_payload, timeout=10)
        ai_response.raise_for_status()
        predicted_emission = ai_response.json().get('predicted_emission', 0)
        print(f"AI Prediction: {predicted_emission} kg CO2")
    except Exception as e:
        print(f"AI Engine error: {e}")
        # Fallback: simple estimation based on activity type
        predicted_emission = estimate_emission_fallback(activity_type, activity_description)

    # Step 2: Save to database (initial save without blockchain data)
    activity = Activity.objects.create(
        user=user,
        activity_type=activity_type,
        data=payload,
        predicted_emission=predicted_emission,
        user_wallet=user_wallet
    )

    # Step 3: Mint blockchain NFT credit ONLY for offset activities with wallet
    token_id = None
    transaction_hash = None

    if is_offset_activity and user_wallet and user_wallet != '0x0000000000000000000000000000000000000000':
        print(f"Offset activity detected: {activity_type}. Proceeding with NFT minting...")
        try:
            mint_result = mint_credit(
                user_address=user_wallet,
                emission_amount=predicted_emission,
                activity_type=activity_type
            )

            if mint_result.get('success'):
                token_id = mint_result.get('token_id')
                transaction_hash = mint_result.get('transaction_hash')
                print(f"NFT Minted! Token ID: {token_id}, TX: {transaction_hash}")

                # Update activity with blockchain data
                activity.token_id = token_id
                activity.transaction_hash = transaction_hash
                activity.save()
            else:
                print(f"Minting failed: {mint_result.get('error')}")
                transaction_hash = f"Error: {mint_result.get('error', 'Unknown error')}"
                # Save error to database
                activity.transaction_hash = transaction_hash
                activity.save()

        except Exception as e:
            print(f"Blockchain mint error: {e}")
            transaction_hash = f"Error: {str(e)}"
            # Save error to database
            activity.transaction_hash = transaction_hash
            activity.save()
    elif not is_offset_activity:
        print(f"Emitting activity detected: {activity_type}. No NFT minting for carbon emissions.")
        transaction_hash = "Emission logged (no NFT for emitting activities)"
        # Save status to database
        activity.transaction_hash = transaction_hash
        activity.save()
    else:
        print("No wallet provided, skipping NFT minting")
        transaction_hash = "No wallet connected"
        # Save status to database
        activity.transaction_hash = transaction_hash
        activity.save()

    # Step 4: Serialize and return response
    result = ActivitySerializer(activity).data
    result['transaction_hash'] = transaction_hash or "Activity logged"
    result['token_id'] = token_id
    result['is_offset'] = is_offset_activity

    return Response(result, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_activities(request, username):
    """
    Retrieve all activities for a specific user.

    URL: GET /api/activities/<username>/
    """
    try:
        activities = Activity.objects.filter(user=username).order_by('-timestamp')
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error fetching activities: {e}")
        return Response(
            {"error": "Failed to fetch activities"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_blockchain_credits(request, wallet_address):
    """
    Get all carbon credit NFTs for a wallet address directly from blockchain.

    URL: GET /api/credits/<wallet_address>/
    """
    try:
        result = get_user_credits(wallet_address)
        if result.get('success'):
            return Response({
                'wallet': wallet_address,
                'credits': result.get('credits', []),
                'total_credits': len(result.get('credits', []))
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result.get('error', 'Unknown error')
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error fetching blockchain credits: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def blockchain_status(request):
    """
    Check blockchain connection status.

    URL: GET /api/blockchain/status/
    """
    try:
        status_info = get_connection_status()
        return Response(status_info, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e), "connected": False},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def estimate_emission_fallback(activity_type: str, description: str) -> float:
    """
    Fallback emission estimation when AI engine is unavailable.
    """
    import re

    # Try to extract a number from the description
    numbers = re.findall(r'\d+(?:\.\d+)?', description)
    value = float(numbers[0]) if numbers else 10

    # Emission factors (kg CO2 per unit)
    # For emitting activities: positive emissions
    # For offset activities: represents CO2 offset/saved
    factors = {
        # Emitting activities
        'driving': 0.2,      # per km
        'flight': 0.5,       # per km
        'home_energy': 0.5,  # per kWh
        'heating': 2.0,      # per hour
        'cooking': 0.3,      # per hour
        'shopping': 0.5,     # per kg
        'waste': 0.1,        # per kg
        'transport': 0.15,   # per km
        'electricity': 0.4,  # per kWh
        'other': 0.3,        # general
        # Offset activities (CO2 saved/offset per unit)
        'tree_planting': 20.0,      # per tree (annual)
        'renewable_energy': 0.5,    # per kWh generated
        'recycling': 0.5,           # per kg recycled
        'carbon_offset': 1.0,       # per kg purchased
    }

    factor = factors.get(activity_type, 0.3)
    return round(value * factor, 2)
