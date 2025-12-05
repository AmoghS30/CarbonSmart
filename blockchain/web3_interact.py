from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SEPOLIA_RPC_URL = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x100bd2512011b0e93A01266a646ba8eB4dee5312")

# Load ABI
with open("CarbonCreditABI.json", "r") as abi_file:
    CONTRACT_ABI = json.load(abi_file)

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))

# Check connection
if not w3.is_connected():
    raise Exception("Failed to connect to Sepolia network")

# Get account from private key
account = w3.eth.account.from_key(PRIVATE_KEY)

# Initialize contract
contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=CONTRACT_ABI
)


def mint_credit(user_wallet_address, co2_amount_grams, activity_type):
    """
    Mint a carbon credit NFT
    
    Args:
        user_wallet_address: User's Ethereum wallet address
        co2_amount_grams: Amount of CO2 in grams (e.g., 1200 for 1.2 kg)
        activity_type: Type of activity (e.g., "transport", "electricity")
    
    Returns:
        dict: Transaction details including token_id
    """
    try:
        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        transaction = contract.functions.mintCredit(
            Web3.to_checksum_address(user_wallet_address),
            int(co2_amount_grams),
            activity_type
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get token ID from event logs
        event_logs = contract.events.CreditMinted().process_receipt(tx_receipt)
        token_id = event_logs[0]['args']['tokenId']
        
        return {
            'success': True,
            'token_id': token_id,
            'transaction_hash': tx_hash.hex(),
            'block_number': tx_receipt['blockNumber'],
            'gas_used': tx_receipt['gasUsed']
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_user_credits(user_wallet_address):
    """Get all credit token IDs owned by user"""
    try:
        token_ids = contract.functions.getUserCredits(
            Web3.to_checksum_address(user_wallet_address)
        ).call()
        
        credits = []
        for token_id in token_ids:
            credit_data = contract.functions.getCredit(token_id).call()
            credits.append({
                'token_id': token_id,
                'co2_amount_grams': credit_data[0],
                'timestamp': credit_data[1],
                'activity_type': credit_data[2]
            })
        
        return {'success': True, 'credits': credits}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


# Test function
if __name__ == "__main__":
    print("Testing blockchain connection...")
    print(f"Connected to: {w3.is_connected()}")
    print(f"Contract Address: {CONTRACT_ADDRESS}")
    print(f"Account: {account.address}")