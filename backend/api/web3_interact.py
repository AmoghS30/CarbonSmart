# backend/api/web3_interact.py
import os
import json
from web3 import Web3
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

RPC_URL = os.getenv("RPC_URL", "https://eth-sepolia.g.alchemy.com/v2/YOUR-PROJECT-ID")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x100bd2512011b0e93A01266a646ba8eB4dee5312")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Contract ABI matching CarbonCredit.sol
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "uint256", "name": "co2Amount", "type": "uint256"},
            {"internalType": "string", "name": "activityType", "type": "string"}
        ],
        "name": "mintCredit",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "getCredit",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "co2Amount", "type": "uint256"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "string", "name": "activityType", "type": "string"}
                ],
                "internalType": "struct CarbonCredit.Credit",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getUserCredits",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "co2Amount", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "activityType", "type": "string"}
        ],
        "name": "CreditMinted",
        "type": "event"
    }
]

# Load ABI from file if available, otherwise use inline
def load_contract_abi():
    """Load the contract ABI from the JSON file"""
    possible_paths = [
        Path(__file__).parent / "CarbonCreditABI.json",
        Path(__file__).parent.parent / "CarbonCreditABI.json",
        Path(__file__).parent.parent.parent / "blockchain" / "CarbonCreditABI.json",
    ]

    for abi_path in possible_paths:
        if abi_path.exists():
            with open(abi_path, 'r') as f:
                abi_data = json.load(f)
                if isinstance(abi_data, list):
                    return abi_data
                elif 'abi' in abi_data:
                    return abi_data['abi']

    print("Using inline ABI for CarbonCredit contract")
    return CONTRACT_ABI

# Load ABI and create contract instance
try:
    contract_abi = load_contract_abi()
    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)
    print(f"Contract loaded at {CONTRACT_ADDRESS}")
except Exception as e:
    print(f"Error loading contract: {e}")
    contract = None


def mint_credit(user_address: str, emission_amount: float, activity_type: str = "general") -> dict:
    """
    Mint carbon credits to a user address as an NFT

    Args:
        user_address: Ethereum address of the user
        emission_amount: Amount of CO2 emissions in kg
        activity_type: Type of activity (transport, electricity, etc.)

    Returns:
        dict with success status, token_id, and transaction_hash
    """
    try:
        if not contract:
            raise Exception("Contract not initialized")

        if not PRIVATE_KEY:
            raise Exception("PRIVATE_KEY not set in environment")

        # Validate address
        if not Web3.is_address(user_address):
            raise Exception(f"Invalid Ethereum address: {user_address}")

        user_address = Web3.to_checksum_address(user_address)

        # Get account from private key
        private_key = PRIVATE_KEY if PRIVATE_KEY.startswith('0x') else f'0x{PRIVATE_KEY}'
        account = w3.eth.account.from_key(private_key)

        # Convert kg to grams for contract (contract stores in grams)
        co2_grams = int(emission_amount * 1000)

        print(f"Minting {co2_grams}g CO2 credit to {user_address} for {activity_type}")

        # Build transaction
        transaction = contract.functions.mintCredit(
            user_address,
            co2_grams,
            activity_type
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })

        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)

        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        if tx_receipt['status'] == 1:
            # Extract token ID from CreditMinted event
            token_id = None
            try:
                logs = contract.events.CreditMinted().process_receipt(tx_receipt)
                if logs:
                    token_id = logs[0]['args']['tokenId']
            except Exception as e:
                print(f"Could not extract token ID from logs: {e}")

            tx_hash_hex = tx_hash.hex() if tx_hash.hex().startswith('0x') else f'0x{tx_hash.hex()}'
            print(f"Successfully minted! TX: {tx_hash_hex}, Token ID: {token_id}")
            return {
                'success': True,
                'token_id': token_id,
                'transaction_hash': tx_hash_hex,
                'co2_grams': co2_grams,
                'block_number': tx_receipt['blockNumber'],
                'gas_used': tx_receipt['gasUsed']
            }
        else:
            raise Exception("Transaction failed on chain")

    except Exception as e:
        print(f"Minting failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'token_id': None,
            'transaction_hash': None
        }


def get_user_balance(user_address: str) -> int:
    """Get the NFT token count of a user"""
    try:
        if not contract:
            return 0

        user_address = Web3.to_checksum_address(user_address)
        balance = contract.functions.balanceOf(user_address).call()
        return balance
    except Exception as e:
        print(f"Error getting balance: {e}")
        return 0


def get_user_credits(user_address: str) -> dict:
    """Get all credit details for a user"""
    try:
        if not contract:
            return {'success': False, 'error': 'Contract not initialized', 'credits': []}

        user_address = Web3.to_checksum_address(user_address)
        token_ids = contract.functions.getUserCredits(user_address).call()

        credits = []
        for token_id in token_ids:
            credit_data = contract.functions.getCredit(token_id).call()
            credits.append({
                'token_id': token_id,
                'co2_amount_grams': credit_data[0],
                'co2_amount_kg': credit_data[0] / 1000,
                'timestamp': credit_data[1],
                'activity_type': credit_data[2]
            })

        return {'success': True, 'credits': credits}

    except Exception as e:
        print(f"Error getting user credits: {e}")
        return {'success': False, 'error': str(e), 'credits': []}


def get_connection_status() -> dict:
    """Check the blockchain connection status"""
    return {
        "connected": w3.is_connected(),
        "chain_id": w3.eth.chain_id if w3.is_connected() else None,
        "contract_address": CONTRACT_ADDRESS,
        "latest_block": w3.eth.block_number if w3.is_connected() else None,
    }
