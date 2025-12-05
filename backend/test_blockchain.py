#!/usr/bin/env python3
"""
Test script for blockchain integration
Run this from the backend directory: python test_blockchain.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    import django
    django.setup()
except Exception as e:
    print(f"⚠️ Warning: Could not setup Django: {e}")
    print("Running in standalone mode...")

from api.web3_interact import (
    get_connection_status,
    get_user_balance,
    get_user_emissions,
    mint_credit
)

def test_connection():
    """Test blockchain connection"""
    print("\n" + "="*50)
    print("🧪 Testing Blockchain Connection")
    print("="*50)
    
    status = get_connection_status()
    print(f"\n📡 Connection Status:")
    print(f"  Connected: {status['connected']}")
    print(f"  Chain ID: {status['chain_id']}")
    print(f"  Contract: {status['contract_address']}")
    print(f"  Latest Block: {status['latest_block']}")
    
    if not status['connected']:
        print("\n❌ Not connected to blockchain!")
        print("Please check your RPC_URL in .env file")
        return False
    
    print("\n✅ Successfully connected to blockchain!")
    return True

def test_read_operations():
    """Test read operations"""
    print("\n" + "="*50)
    print("🧪 Testing Read Operations")
    print("="*50)
    
    # Use a test address
    test_address = "0xC4FD834679CAFc260F16FE344805724d232Fb5Dd"
    
    try:
        balance = get_user_balance(test_address)
        print(f"\n💰 Balance for {test_address[:10]}...:")
        print(f"  {balance} CCT tokens")
        
        emissions = get_user_emissions(test_address)
        print(f"\n🏭 Total Emissions:")
        print(f"  {emissions} kg CO2")
        
        print("\n✅ Read operations successful!")
        return True
    except Exception as e:
        print(f"\n❌ Error in read operations: {e}")
        return False

def test_mint_operation():
    """Test minting operation"""
    print("\n" + "="*50)
    print("🧪 Testing Mint Operation")
    print("="*50)
    
    test_address = os.getenv("TEST_WALLET_ADDRESS", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    test_amount = 1.5
    
    print(f"\n🎯 Attempting to mint {test_amount} credits to:")
    print(f"   {test_address}")
    
    private_key = os.getenv("PRIVATE_KEY", "")
    if not private_key:
        print("\n⚠️ PRIVATE_KEY not set in .env file")
        print("Skipping mint test (read-only mode)")
        return None
    
    try:
        print("\n⏳ Sending transaction...")
        tx_hash = mint_credit(test_address, test_amount)
        print(f"\n✅ Successfully minted credits!")
        print(f"   Transaction Hash: {tx_hash}")
        print(f"\n🔗 View on Etherscan:")
        print(f"   https://sepolia.etherscan.io/tx/{tx_hash}")
        
        # Check new balance
        new_balance = get_user_balance(test_address)
        print(f"\n💰 New Balance: {new_balance} CCT")
        
        return True
    except Exception as e:
        print(f"\n❌ Minting failed: {e}")
        print("\nPossible reasons:")
        print("  1. Insufficient gas in deployer wallet")
        print("  2. Invalid RPC URL")
        print("  3. Wrong network")
        print("  4. Contract not deployed")
        return False

def main():
    """Run all tests"""
    print("\n🚀 Starting Blockchain Integration Tests")
    print(f"📅 Time: {os.popen('date').read().strip()}")
    
    # Test 1: Connection
    if not test_connection():
        print("\n❌ Connection test failed. Stopping.")
        return
    
    # Test 2: Read Operations
    test_read_operations()
    
    # Test 3: Mint Operation (optional)
    print("\n" + "="*50)
    response = input("\n⚠️  Do you want to test minting? This will cost gas! (y/n): ")
    if response.lower() == 'y':
        test_mint_operation()
    else:
        print("\n⏭️  Skipping mint test")
    
    print("\n" + "="*50)
    print("✅ All tests completed!")
    print("="*50)
    print("\n📚 Next steps:")
    print("  1. If tests passed, start your backend server")
    print("  2. Test via frontend by submitting an activity")
    print("  3. Check Etherscan for transactions")
    print("\n")

if __name__ == "__main__":
    main()