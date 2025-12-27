#!/bin/bash

# Test script to verify Sepolia testnet connection and contract deployment

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CarbonSmart - Sepolia Test Script   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if backend .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${RED}Error: backend/.env not found!${NC}"
    exit 1
fi

cd "$PROJECT_ROOT/backend"

# Create and activate virtual environment if needed
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q web3 python-dotenv 2>/dev/null

# Create test script in the backend directory
cat > test_sepolia_connection.py << 'EOF'
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

# Load .env from the backend directory
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(env_path)

RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

print("\n=== Configuration ===")
print(f"RPC URL: {RPC_URL[:50]}..." if RPC_URL else "RPC URL: NOT SET")
print(f"Contract Address: {CONTRACT_ADDRESS}")
print(f"Private Key: {'SET' if PRIVATE_KEY else 'NOT SET'}")

if not RPC_URL:
    print("\n❌ RPC_URL not found in .env")
    sys.exit(1)

if not CONTRACT_ADDRESS:
    print("\n❌ CONTRACT_ADDRESS not found in .env")
    sys.exit(1)

# Test Web3 connection
print("\n=== Testing Sepolia Connection ===")
try:
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        print("❌ Failed to connect to Sepolia RPC")
        sys.exit(1)

    print("✅ Connected to Sepolia testnet")

    # Get network info
    chain_id = w3.eth.chain_id
    block_number = w3.eth.block_number

    print(f"\nChain ID: {chain_id}")
    if chain_id == 11155111:
        print("✅ Correct network (Sepolia)")
    else:
        print(f"⚠️  Warning: Expected chain ID 11155111, got {chain_id}")

    print(f"Latest Block: {block_number}")

    # Check if contract exists
    print("\n=== Checking Smart Contract ===")
    contract_code = w3.eth.get_code(Web3.to_checksum_address(CONTRACT_ADDRESS))

    if contract_code == b'' or contract_code == b'0x':
        print(f"❌ No contract found at {CONTRACT_ADDRESS}")
        print("   You need to deploy the contract first!")
        sys.exit(1)
    else:
        print(f"✅ Contract exists at {CONTRACT_ADDRESS}")
        print(f"   Code size: {len(contract_code)} bytes")

    # Check wallet balance if private key is set
    if PRIVATE_KEY:
        print("\n=== Checking Wallet Balance ===")
        try:
            private_key = PRIVATE_KEY if PRIVATE_KEY.startswith('0x') else f'0x{PRIVATE_KEY}'
            account = w3.eth.account.from_key(private_key)
            balance = w3.eth.get_balance(account.address)
            balance_eth = w3.from_wei(balance, 'ether')

            print(f"Wallet Address: {account.address}")
            print(f"Balance: {balance_eth} ETH")

            if balance_eth < 0.01:
                print("⚠️  Warning: Low balance! You need Sepolia ETH to mint NFTs")
                print("   Get testnet ETH from: https://sepoliafaucet.com/")
            else:
                print("✅ Sufficient balance for transactions")
        except Exception as e:
            print(f"❌ Error checking wallet: {e}")
    else:
        print("\n⚠️  PRIVATE_KEY not set - cannot verify wallet balance")

    print("\n" + "="*50)
    print("✅ All tests passed!")
    print("="*50)
    print("\nYou're ready to use CarbonSmart with Sepolia testnet!")

except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)
EOF

echo -e "\n${YELLOW}Running connection tests...${NC}\n"
python3 test_sepolia_connection.py

deactivate
rm -f test_sepolia_connection.py

echo -e "\n${GREEN}Test complete!${NC}"
