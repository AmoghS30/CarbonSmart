#!/bin/bash

# CarbonSmart - Full Stack Startup Script
# This script starts all services: Frontend, Backend API, and AI Engine
# Uses Sepolia Testnet for blockchain transactions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   CarbonSmart - Starting All Services     ${NC}"
echo -e "${BLUE}   Blockchain: Sepolia Testnet             ${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        exit 1
    fi
}

# Check required commands
echo -e "${MAGENTA}Checking prerequisites...${NC}"
check_command node
check_command npm
check_command python3

# Check if .env files exist
echo -e "\n${MAGENTA}Checking environment files...${NC}"

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${RED}Error: backend/.env not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env with your Sepolia RPC URL, contract address, and private key${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/carbonsmart-frontend/.env" ] && [ ! -f "$PROJECT_ROOT/carbonsmart-frontend/.env.local" ]; then
    echo -e "${RED}Error: Frontend .env file not found!${NC}"
    echo -e "${YELLOW}Please create carbonsmart-frontend/.env.local with your configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment files found${NC}"

# Verify Sepolia connection
echo -e "\n${MAGENTA}[1/4] Verifying Sepolia Testnet Connection${NC}"
cd "$PROJECT_ROOT/backend"

# Create a Python script in backend directory to verify connection
cat > verify_sepolia.py << 'EOF'
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

# Load .env from backend directory
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(env_path)

RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

if not RPC_URL:
    print("ERROR: RPC_URL not found in .env")
    sys.exit(1)

if not CONTRACT_ADDRESS:
    print("ERROR: CONTRACT_ADDRESS not found in .env")
    sys.exit(1)

try:
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if w3.is_connected():
        chain_id = w3.eth.chain_id
        block_number = w3.eth.block_number
        print(f"CONNECTED|{chain_id}|{block_number}|{CONTRACT_ADDRESS}")
        sys.exit(0)
    else:
        print("ERROR: Failed to connect to Sepolia")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
EOF

# Check if backend venv exists, create if not
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating backend virtual environment...${NC}"
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q web3 python-dotenv 2>/dev/null

# Run verification from backend directory
cd "$PROJECT_ROOT/backend"
VERIFY_OUTPUT=$(python3 verify_sepolia.py 2>&1)
deactivate

if [[ $VERIFY_OUTPUT == CONNECTED* ]]; then
    IFS='|' read -ra INFO <<< "$VERIFY_OUTPUT"
    CHAIN_ID="${INFO[1]}"
    BLOCK_NUMBER="${INFO[2]}"
    CONTRACT_ADDR="${INFO[3]}"

    if [ "$CHAIN_ID" == "11155111" ]; then
        echo -e "${GREEN}✓ Connected to Sepolia Testnet${NC}"
        echo -e "  Chain ID: ${BLUE}$CHAIN_ID${NC}"
        echo -e "  Latest Block: ${BLUE}$BLOCK_NUMBER${NC}"
        echo -e "  Contract: ${BLUE}$CONTRACT_ADDR${NC}"
    else
        echo -e "${YELLOW}⚠ Warning: Connected to chain ID $CHAIN_ID (expected 11155111 for Sepolia)${NC}"
    fi
else
    echo -e "${RED}✗ Failed to connect to Sepolia testnet${NC}"
    echo -e "${RED}$VERIFY_OUTPUT${NC}"
    echo -e "${YELLOW}Please check your RPC_URL in backend/.env${NC}"
    exit 1
fi

rm -f "$PROJECT_ROOT/backend/verify_sepolia.py"

echo -e "\n${MAGENTA}[2/4] Starting Backend (Django - Port 8000)${NC}"
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null

# Run migrations if needed
if [ ! -f "db.sqlite3" ]; then
    echo -e "${YELLOW}Running initial migrations...${NC}"
    python manage.py migrate --noinput
fi

echo -e "${GREEN}Starting Django backend...${NC}"
python manage.py runserver 127.0.0.1:8000 > /tmp/django_output.log 2>&1 &
BACKEND_PID=$!
deactivate

echo -e "\n${MAGENTA}[3/4] Starting AI Engine (FastAPI - Port 8002)${NC}"
cd "$PROJECT_ROOT/ai_engine"
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating AI Engine virtual environment...${NC}"
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null
echo -e "${GREEN}Starting AI prediction service...${NC}"
uvicorn ai_predict:app --host 127.0.0.1 --port 8002 > /tmp/ai_engine_output.log 2>&1 &
AI_PID=$!
deactivate

echo -e "\n${MAGENTA}[4/4] Starting Frontend (Next.js - Port 3000)${NC}"
cd "$PROJECT_ROOT/carbonsmart-frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

# Check if Prisma database exists
if [ ! -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}Initializing Prisma database...${NC}"
    npx prisma generate
    npx prisma db push --skip-generate
else
    echo -e "${GREEN}Generating Prisma client...${NC}"
    npx prisma generate
fi

echo -e "${GREEN}Starting Next.js frontend...${NC}"
npm run dev > /tmp/nextjs_output.log 2>&1 &
FRONTEND_PID=$!

# Wait for services to start
echo -e "\n${YELLOW}Waiting for services to initialize...${NC}"
sleep 5

echo -e "\n${GREEN}[✓] All services started successfully!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Services running:${NC}"
echo -e "  ${MAGENTA}Frontend:${NC}   ${BLUE}http://localhost:3000${NC}"
echo -e "  ${MAGENTA}Backend:${NC}    ${BLUE}http://localhost:8000${NC}"
echo -e "  ${MAGENTA}AI Engine:${NC}  ${BLUE}http://localhost:8002${NC}"
echo -e "  ${MAGENTA}Blockchain:${NC} ${BLUE}Sepolia Testnet${NC} (Chain ID: 11155111)"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Logs available at:${NC}"
echo -e "  Django:   /tmp/django_output.log"
echo -e "  AI:       /tmp/ai_engine_output.log"
echo -e "  Next.js:  /tmp/nextjs_output.log"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Setup complete! You can now:${NC}"
echo -e "  1. Open ${BLUE}http://localhost:3000${NC} in your browser"
echo -e "  2. Connect your MetaMask wallet (Sepolia network)"
echo -e "  3. Log activities and earn NFT carbon credits!"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for all background processes
wait
