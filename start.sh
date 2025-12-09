#!/bin/bash

# CarbonSmart - Full Stack Startup Script
# This script starts all services: Frontend, Backend API, and AI Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CarbonSmart - Starting All Services ${NC}"
echo -e "${BLUE}========================================${NC}"

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

echo -e "\n${GREEN}[1/4] Setting up Backend (Django - Port 8000)${NC}"
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

echo -e "\n${GREEN}[2/4] Setting up AI Engine (Flask - Port 8002)${NC}"
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

echo -e "\n${GREEN}[3/4] Setting up Frontend (Next.js - Port 3000)${NC}"
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

echo -e "\n${GREEN}[4/4] All services started!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Services running:${NC}"
echo -e "  Frontend:   ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:    ${BLUE}http://localhost:8000${NC}"
echo -e "  AI Engine:  ${BLUE}http://localhost:8002${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait
