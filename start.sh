#!/bin/bash

# CarbonSmart - Full Stack Startup Script
# This script starts all services: Frontend, Backend API, AI Engine, and Blockchain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   CarbonSmart - Starting All Services     ${NC}"
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
check_command node
check_command npm
check_command python3

echo -e "\n${GREEN}[1/5] Setting up Blockchain (Hardhat - Port 8545)${NC}"
cd "$PROJECT_ROOT/blockchain"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi
echo -e "${GREEN}Starting Hardhat local node...${NC}"
npx hardhat node > /tmp/hardhat_output.log 2>&1 &
BLOCKCHAIN_PID=$!
sleep 5

# Deploy contract and capture address
echo -e "${GREEN}Deploying smart contract to local network...${NC}"
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

if [ -n "$CONTRACT_ADDRESS" ]; then
    echo -e "${GREEN}Contract deployed at: ${BLUE}$CONTRACT_ADDRESS${NC}"

    # Update .env file in frontend
    ENV_FILE="$PROJECT_ROOT/carbonsmart-frontend/.env"
    if [ -f "$ENV_FILE" ]; then
        # Update or add CONTRACT_ADDRESS
        if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" "$ENV_FILE"; then
            sed -i '' "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"|" "$ENV_FILE"
        else
            echo "NEXT_PUBLIC_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"" >> "$ENV_FILE"
        fi
        echo -e "${GREEN}Updated contract address in .env${NC}"
    fi

    # Also update .env.local if it exists
    ENV_LOCAL_FILE="$PROJECT_ROOT/carbonsmart-frontend/.env.local"
    if [ -f "$ENV_LOCAL_FILE" ]; then
        if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" "$ENV_LOCAL_FILE"; then
            sed -i '' "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"|" "$ENV_LOCAL_FILE"
        else
            echo "NEXT_PUBLIC_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"" >> "$ENV_LOCAL_FILE"
        fi
        echo -e "${GREEN}Updated contract address in .env.local${NC}"
    fi
else
    echo -e "${RED}Failed to extract contract address from deployment${NC}"
fi

echo -e "\n${GREEN}[2/5] Setting up Backend (Django - Port 8000)${NC}"
cd "$PROJECT_ROOT/backend"
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null
echo -e "${GREEN}Starting Django backend...${NC}"
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
deactivate

echo -e "\n${GREEN}[3/5] Setting up AI Engine (Flask - Port 8002)${NC}"
cd "$PROJECT_ROOT/ai_engine"
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null
echo -e "${GREEN}Starting AI Engine...${NC}"
python app.py &
AI_PID=$!
deactivate

echo -e "\n${GREEN}[4/5] Setting up Frontend (Next.js - Port 3000)${NC}"
cd "$PROJECT_ROOT/carbonsmart-frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi
echo -e "${GREEN}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Starting Next.js frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}[5/5] All services started!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Services running:${NC}"
echo -e "  Frontend:   ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:    ${BLUE}http://localhost:8000${NC}"
echo -e "  AI Engine:  ${BLUE}http://localhost:8002${NC}"
echo -e "  Blockchain: ${BLUE}http://localhost:8545${NC} (Hardhat)"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait
