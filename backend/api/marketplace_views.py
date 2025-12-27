# backend/api/marketplace_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Activity
from .web3_interact import get_user_credits, transfer_nft, check_nft_approval, get_connection_status
import json
from datetime import datetime


@api_view(['GET'])
def get_marketplace_listings(request):
    """
    Get all active marketplace listings.

    For now, we'll generate listings from activities that have NFTs.
    In a full implementation, you'd have a separate MarketplaceListing table.
    """
    try:
        # Get all activities that are listed for sale in the marketplace
        activities_with_nfts = Activity.objects.filter(
            token_id__isnull=False,
            transaction_hash__isnull=False,
            marketplace_status='listed'  # Only show listed items
        ).exclude(
            transaction_hash__startswith='Error'
        ).exclude(
            transaction_hash__startswith='Emission'
        ).order_by('-timestamp')

        listings = []
        for activity in activities_with_nfts:
            # Parse user_wallet from data if available
            user_wallet = activity.user_wallet
            if not user_wallet and activity.data:
                try:
                    if isinstance(activity.data, str):
                        data = json.loads(activity.data)
                    else:
                        data = activity.data
                    user_wallet = data.get('user_wallet', '')
                except:
                    user_wallet = ''

            listing = {
                'id': str(activity.id),
                'tokenId': activity.token_id,
                'seller': activity.user,
                'sellerWallet': user_wallet or '0x0000...0000',
                'priceEth': activity.listing_price or 0.01,  # Use stored price or default
                'co2Amount': int(activity.predicted_emission * 1000),  # Convert to grams
                'activityType': activity.activity_type,
                'createdAt': activity.timestamp.strftime('%Y-%m-%d'),
                'isActive': activity.marketplace_status == 'listed',
                'transactionHash': activity.transaction_hash,
            }
            listings.append(listing)

        return Response({
            'success': True,
            'listings': listings,
            'count': len(listings)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error fetching marketplace listings: {e}")
        return Response({
            'success': False,
            'error': str(e),
            'listings': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user_nft_credits(request, wallet_address):
    """
    Get all NFT credits owned by a user's wallet address.
    This fetches directly from the blockchain.
    """
    try:
        result = get_user_credits(wallet_address)

        if result.get('success'):
            credits = result.get('credits', [])
            return Response({
                'success': True,
                'credits': credits,
                'count': len(credits)
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Failed to fetch credits'),
                'credits': []
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error fetching user NFT credits: {e}")
        return Response({
            'success': False,
            'error': str(e),
            'credits': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_listing(request):
    """
    Create a new marketplace listing.

    Request body:
    {
        "tokenId": 123,
        "sellerWallet": "0x...",
        "priceEth": 0.01,
        "seller": "username"
    }
    """
    try:
        data = request.data
        token_id = data.get('tokenId')
        seller_wallet = data.get('sellerWallet')
        price_eth = data.get('priceEth')
        seller = data.get('seller')

        if not all([token_id, seller_wallet, price_eth, seller]):
            return Response({
                'success': False,
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find the activity with this token_id owned by the seller
        try:
            activity = Activity.objects.get(
                token_id=token_id,
                user_wallet=seller_wallet
            )

            # Mark as listed and store the price
            activity.marketplace_status = 'listed'
            activity.listing_price = float(price_eth)
            activity.save()

            return Response({
                'success': True,
                'message': 'Listing created successfully',
                'listingId': str(activity.id)
            }, status=status.HTTP_201_CREATED)

        except Activity.DoesNotExist:
            return Response({
                'success': False,
                'error': 'NFT not found or you don\'t own it'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print(f"Error creating listing: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def buy_listing(request, listing_id):
    """
    Purchase a marketplace listing with blockchain NFT transfer.

    Request body:
    {
        "buyerWallet": "0x...",
        "buyer": "username"
    }
    """
    try:
        data = request.data
        buyer_wallet = data.get('buyerWallet')
        buyer = data.get('buyer')

        if not all([buyer_wallet, buyer]):
            return Response({
                'success': False,
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get the listing (Activity with NFT)
        try:
            listing = Activity.objects.get(id=listing_id)
        except Activity.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Listing not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verify the listing has an NFT token
        if not listing.token_id or not listing.transaction_hash:
            return Response({
                'success': False,
                'error': 'Invalid listing - no NFT token found'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get seller wallet from activity data
        seller_wallet = listing.user_wallet
        if not seller_wallet and listing.data:
            try:
                if isinstance(listing.data, str):
                    data_obj = json.loads(listing.data)
                else:
                    data_obj = listing.data
                seller_wallet = data_obj.get('user_wallet', '')
            except:
                seller_wallet = ''

        if not seller_wallet:
            return Response({
                'success': False,
                'error': 'Seller wallet not found'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Perform blockchain NFT transfer
        print(f"Processing marketplace purchase: NFT #{listing.token_id} from {seller_wallet} to {buyer_wallet}")
        transfer_result = transfer_nft(
            from_address=seller_wallet,
            to_address=buyer_wallet,
            token_id=listing.token_id
        )

        if not transfer_result.get('success'):
            return Response({
                'success': False,
                'error': f"Blockchain transfer failed: {transfer_result.get('error')}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mark the original listing as sold
        listing.marketplace_status = 'sold'
        listing.save()

        # Create a new activity record for the purchase
        purchase_activity = Activity.objects.create(
            user=buyer,
            activity_type='marketplace_purchase',
            data={
                'listing_id': listing_id,
                'seller': listing.user,
                'seller_wallet': seller_wallet,
                'buyer_wallet': buyer_wallet,
                'token_id': listing.token_id,
                'co2_amount': listing.predicted_emission,
                'original_activity_type': listing.activity_type,
                'price_paid': listing.listing_price,
            },
            predicted_emission=listing.predicted_emission,
            user_wallet=buyer_wallet,
            token_id=listing.token_id,
            transaction_hash=transfer_result.get('transaction_hash'),
            marketplace_status='not_listed'  # Purchased items are not listed
        )

        return Response({
            'success': True,
            'message': 'Purchase completed successfully on blockchain',
            'transactionHash': transfer_result.get('transaction_hash'),
            'blockNumber': transfer_result.get('block_number'),
            'tokenId': listing.token_id
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error processing purchase: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def check_approval_status(request, token_id, owner_address):
    """
    Check if the backend contract is approved to transfer a specific NFT

    URL: GET /api/marketplace/check-approval/<token_id>/<owner_address>/
    """
    try:
        approval_result = check_nft_approval(owner_address, int(token_id))

        if approval_result.get('success'):
            return Response({
                'success': True,
                'approved': approval_result.get('approved'),
                'backend_address': approval_result.get('backend_address'),
                'is_approved_for_all': approval_result.get('is_approved_for_all')
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': approval_result.get('error'),
                'approved': False
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error checking approval: {e}")
        return Response({
            'success': False,
            'error': str(e),
            'approved': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_marketplace_contract_address(request):
    """
    Get the marketplace backend contract address that needs approval

    URL: GET /api/marketplace/contract-address/
    """
    try:
        connection_status = get_connection_status()

        # Get the backend wallet address from the private key
        import os
        from web3 import Web3
        private_key = os.getenv('PRIVATE_KEY', '')
        if private_key:
            private_key = private_key if private_key.startswith('0x') else f'0x{private_key}'
            w3 = Web3()
            account = w3.eth.account.from_key(private_key)
            backend_address = account.address
        else:
            backend_address = None

        return Response({
            'success': True,
            'contract_address': connection_status.get('contract_address'),
            'marketplace_operator': backend_address,
            'chain_id': connection_status.get('chain_id')
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error getting contract address: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_marketplace_history(request, wallet_address):
    """
    Get marketplace transaction history for a wallet (both purchases and sales)

    URL: GET /api/marketplace/history/<wallet_address>/
    """
    try:
        # Get items sold by this wallet
        sold_items = Activity.objects.filter(
            user_wallet=wallet_address,
            marketplace_status='sold',
            token_id__isnull=False
        ).order_by('-timestamp')

        # Get items purchased by this wallet
        purchased_items = Activity.objects.filter(
            user_wallet=wallet_address,
            activity_type='marketplace_purchase',
            token_id__isnull=False
        ).order_by('-timestamp')

        history = []

        # Add sold items to history
        for item in sold_items:
            history.append({
                'id': str(item.id),
                'type': 'sale',
                'tokenId': item.token_id,
                'activityType': item.activity_type,
                'co2Amount': int(item.predicted_emission * 1000),
                'priceEth': item.listing_price or 0.01,
                'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'transactionHash': item.transaction_hash,
                'status': 'sold'
            })

        # Add purchased items to history
        for item in purchased_items:
            seller_info = item.data.get('seller', 'Unknown') if isinstance(item.data, dict) else 'Unknown'
            price_paid = item.data.get('price_paid', 0.01) if isinstance(item.data, dict) else 0.01

            history.append({
                'id': str(item.id),
                'type': 'purchase',
                'tokenId': item.token_id,
                'activityType': item.data.get('original_activity_type', 'unknown') if isinstance(item.data, dict) else 'unknown',
                'co2Amount': int(item.predicted_emission * 1000),
                'priceEth': price_paid,
                'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'transactionHash': item.transaction_hash,
                'seller': seller_info,
                'status': 'purchased'
            })

        # Sort by timestamp descending
        history.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response({
            'success': True,
            'history': history,
            'count': len(history)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error fetching marketplace history: {e}")
        return Response({
            'success': False,
            'error': str(e),
            'history': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
