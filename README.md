# CarbonSmart

A full-stack Web3 application for tracking carbon emissions and earning blockchain-verified NFT carbon credits for environmental activities.

## Features

- **Carbon Footprint Tracking**: Log daily activities and monitor their environmental impact
- **AI-Powered Calculation**: ML model predicts carbon emissions from activity descriptions
- **NFT Carbon Credits**: Earn ERC-721 tokens for offset activities (tree planting, renewable energy, recycling)
- **Blockchain Verified**: Credits are minted on Ethereum Sepolia testnet
- **Marketplace**: Buy and sell carbon credits
- **User & Company Accounts**: Support for individual users and company accounts with GSTIN verification

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Authentication | NextAuth.js with Prisma adapter |
| Database | SQLite with Prisma ORM |
| Backend API | Django REST Framework |
| AI Engine | FastAPI with scikit-learn |
| Blockchain | Solidity, Hardhat, ethers.js |
| Web3 Integration | RainbowKit, wagmi, viem |

## Project Structure

```
CarbonSmart/
├── carbonsmart-frontend/    # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── prisma/             # Database schema
├── backend/                 # Django REST API
│   └── api/                # API endpoints
├── ai_engine/              # FastAPI ML service
│   ├── ai_predict.py       # Prediction endpoint
│   └── model.pkl           # Pre-trained model
└── blockchain/             # Smart contracts
    ├── contracts/          # Solidity contracts
    └── scripts/            # Deployment scripts
```

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.9
- **SQLite** (included with Python/Node.js)
- **MetaMask** or compatible Web3 wallet
- **Sepolia testnet ETH** (for minting NFTs)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CarbonSmart.git
cd CarbonSmart
```

### 2. Frontend Setup

```bash
cd carbonsmart-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 3. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Run migrations
python manage.py migrate

# Run server
python manage.py runserver 8000
```

Backend API runs at: `http://localhost:8000`

### 4. AI Engine Setup (FastAPI)

```bash
cd ai_engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn ai_predict:app --reload --port 8002
```

AI Engine runs at: `http://localhost:8002`

### 5. Blockchain Setup (Optional - for NFT minting)

```bash
cd blockchain

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Alchemy/Infura RPC URL and private key

# Compile contracts
npx hardhat compile

# Deploy to Sepolia (requires testnet ETH)
npx hardhat run scripts/deploy.js --network sepolia
```

## Environment Variables

### Frontend (`carbonsmart-frontend/.env.local`)

```env
# Database (SQLite - file will be created automatically)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Backend APIs
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_AI_API_URL="http://127.0.0.1:8002"

# Blockchain (Sepolia Testnet)
NEXT_PUBLIC_CONTRACT_ADDRESS="0x_your_deployed_contract_address"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_api_key"
NEXT_PUBLIC_ETHERSCAN_URL="https://sepolia.etherscan.io"

# WalletConnect (get from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
```

### Backend (`backend/.env`)

```env
# Blockchain
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
CONTRACT_ADDRESS=0x_your_deployed_contract_address
PRIVATE_KEY=your_wallet_private_key_without_0x

# AI Engine
AI_ENGINE_URL=http://127.0.0.1:8002/predict
```

### Blockchain (`blockchain/.env`)

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_wallet_private_key_without_0x
```

## API Endpoints

### Backend (Django)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/log/` | Log carbon activity |
| GET | `/api/activities/<username>/` | Get user activities |
| GET | `/api/stats/<username>/` | Get user statistics |

### AI Engine (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict CO2 emissions |

**Request body:**
```json
{
  "activity_type": "transportation",
  "activity": "Drove 50 miles in a gasoline car"
}
```

## Smart Contract

The `CarbonCredit` contract is an ERC-721 NFT that stores:
- CO2 amount (in grams)
- Timestamp
- Activity type

**Deployed on Sepolia Testnet**

## Running All Services

Run each service in a separate terminal:

```bash
# Terminal 1 - Frontend
cd carbonsmart-frontend && npm run dev

# Terminal 2 - Backend
cd backend && source venv/bin/activate && python manage.py runserver 8000

# Terminal 3 - AI Engine
cd ai_engine && source venv/bin/activate && uvicorn ai_predict:app --reload --port 8002
```

## Usage

1. **Create Account**: Sign up as a User or Company (with GSTIN)
2. **Connect Wallet**: Link MetaMask for NFT minting
3. **Log Activities**: Choose between Carbon Emitting or Carbon Offset activities
4. **Earn Credits**: Offset activities mint NFT carbon credits to your wallet
5. **Trade Credits**: Buy/sell credits in the marketplace

## Screenshots

<!-- Add screenshots here -->

## License

MIT License
