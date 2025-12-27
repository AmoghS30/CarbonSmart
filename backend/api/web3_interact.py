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
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "getApproved",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "operator", "type": "address"}
        ],
        "name": "isApprovedForAll",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "operator", "type": "address"},
            {"internalType": "bool", "name": "approved", "type": "bool"}
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "from", "type": "address"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "from", "type": "address"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "ownerOf",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
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


def transfer_nft(from_address: str, to_address: str, token_id: int) -> dict:
    """
    Transfer an NFT from one address to another (for marketplace purchases)

    IMPORTANT: This function uses the backend wallet to execute the transfer.
    For this to work in production, one of the following must be true:
    1. The backend wallet is the contract owner and minted all NFTs (current setup)
    2. Sellers must approve the backend wallet using approve() or setApprovalForAll()
    3. Implement a different approach where sellers sign the transaction in MetaMask

    Current implementation assumes the backend wallet has permission to transfer NFTs
    it originally minted (as the owner/minter).

    Args:
        from_address: Current owner's address
        to_address: Buyer's address
        token_id: Token ID to transfer

    Returns:
        dict with success status and transaction_hash
    """
    try:
        if not contract:
            raise Exception("Contract not initialized")

        if not PRIVATE_KEY:
            raise Exception("PRIVATE_KEY not set in environment")

        # Validate addresses
        if not Web3.is_address(from_address) or not Web3.is_address(to_address):
            raise Exception("Invalid Ethereum addresses")

        from_address = Web3.to_checksum_address(from_address)
        to_address = Web3.to_checksum_address(to_address)

        # Get account from private key (should be contract owner)
        private_key = PRIVATE_KEY if PRIVATE_KEY.startswith('0x') else f'0x{PRIVATE_KEY}'
        account = w3.eth.account.from_key(private_key)

        print(f"Transferring NFT #{token_id} from {from_address} to {to_address}")

        # First verify the current owner
        try:
            current_owner = contract.functions.ownerOf(token_id).call()
            if current_owner.lower() != from_address.lower():
                raise Exception(f"NFT #{token_id} is not owned by {from_address}. Current owner: {current_owner}")
        except Exception as e:
            raise Exception(f"Failed to verify NFT ownership: {str(e)}")

        # Check if backend wallet is approved
        try:
            approved_address = contract.functions.getApproved(token_id).call()
            is_approved_for_all = contract.functions.isApprovedForAll(from_address, account.address).call()

            if approved_address.lower() != account.address.lower() and not is_approved_for_all:
                raise Exception(
                    f"Backend wallet {account.address} is not approved to transfer NFT #{token_id}. "
                    f"Seller must approve the marketplace before listing. "
                    f"Current approved address: {approved_address if approved_address != '0x0000000000000000000000000000000000000000' else 'None'}"
                )
        except Exception as e:
            if "not approved" in str(e):
                raise e
            print(f"Warning: Could not verify approval status: {e}")

        # Build transfer transaction
        transaction = contract.functions.transferFrom(
            from_address,
            to_address,
            token_id
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 200000,
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
            tx_hash_hex = tx_hash.hex() if tx_hash.hex().startswith('0x') else f'0x{tx_hash.hex()}'
            print(f"Transfer successful! TX: {tx_hash_hex}")
            return {
                'success': True,
                'transaction_hash': tx_hash_hex,
                'block_number': tx_receipt['blockNumber'],
                'gas_used': tx_receipt['gasUsed']
            }
        else:
            raise Exception("Transaction was mined but failed on chain. Check transaction on Sepolia Etherscan for details.")

    except Exception as e:
        error_message = str(e)
        print(f"Transfer failed: {error_message}")

        # Provide more helpful error messages
        if "not approved" in error_message.lower():
            error_message = f"NFT not approved for transfer. {error_message}"
        elif "insufficient funds" in error_message.lower():
            error_message = "Insufficient ETH for gas fees in backend wallet"
        elif "nonce" in error_message.lower():
            error_message = f"Transaction nonce error: {error_message}"

        return {
            'success': False,
            'error': error_message,
            'transaction_hash': None
        }


def check_nft_approval(owner_address: str, token_id: int) -> dict:
    """
    Check if the backend wallet is approved to transfer a specific NFT

    Args:
        owner_address: Owner's wallet address
        token_id: Token ID to check

    Returns:
        dict with approval status and approved address
    """
    try:
        if not contract:
            return {'success': False, 'approved': False, 'error': 'Contract not initialized'}

        owner_address = Web3.to_checksum_address(owner_address)

        # Get the private key account (backend wallet)
        private_key = PRIVATE_KEY if PRIVATE_KEY.startswith('0x') else f'0x{PRIVATE_KEY}'
        account = w3.eth.account.from_key(private_key)
        backend_address = account.address

        # Check if backend is approved for this specific token
        try:
            approved_address = contract.functions.getApproved(token_id).call()
            is_approved = approved_address.lower() == backend_address.lower()
        except:
            approved_address = None
            is_approved = False

        # Also check if backend has operator approval for all tokens
        try:
            is_approved_for_all = contract.functions.isApprovedForAll(
                owner_address,
                backend_address
            ).call()
        except:
            is_approved_for_all = False

        return {
            'success': True,
            'approved': is_approved or is_approved_for_all,
            'approved_address': approved_address,
            'is_approved_for_all': is_approved_for_all,
            'backend_address': backend_address
        }

    except Exception as e:
        print(f"Error checking approval: {e}")
        return {'success': False, 'approved': False, 'error': str(e)}


def get_connection_status() -> dict:
    """Check the blockchain connection status"""
    return {
        "connected": w3.is_connected(),
        "chain_id": w3.eth.chain_id if w3.is_connected() else None,
        "contract_address": CONTRACT_ADDRESS,
        "latest_block": w3.eth.block_number if w3.is_connected() else None,
    }
