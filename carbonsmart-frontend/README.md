# 🌱 CarbonSmart Frontend

A beautiful, nature-themed Next.js application for tracking carbon footprints and earning blockchain-verified carbon credits.

![CarbonSmart](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

## ✨ Features

- **🔐 Authentication System**: Secure user registration and login with NextAuth
- **📊 Dashboard**: Beautiful charts and statistics for carbon tracking
- **🌍 Activity Logging**: Track various carbon-emitting activities
- **🤖 AI-Powered**: Automatic emission calculation using AI
- **🔗 Blockchain Integration**: Ethereum Sepolia testnet for NFT credits
- **💼 Wallet Connection**: RainbowKit for Web3 wallet integration
- **📱 Responsive Design**: Mobile-first, beautiful on all devices
- **🎨 Nature Theme**: Calming green aesthetics with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Wagmi, RainbowKit, Ethers.js
- **Charts**: Recharts
- **State Management**: Zustand
- **API Integration**: Axios

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Backend API running (Django at http://127.0.0.1:8000)
- AI Engine running (FastAPI at http://127.0.0.1:8002)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd carbonsmart-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Copy the example env file and configure:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/carbonsmart"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Backend API
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_AI_API_URL="http://127.0.0.1:8002"

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS="your-deployed-contract-address"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
NEXT_PUBLIC_ETHERSCAN_URL="https://sepolia.etherscan.io"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗂️ Project Structure

```
carbonsmart-frontend/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard page
│   │   ├── activities/       # Activity logging page
│   │   ├── profile/          # User profile page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable components
│   ├── services/             # API service layer
│   ├── styles/               # Global styles
│   └── types/                # TypeScript type definitions
├── prisma/                   # Prisma schema and migrations
├── public/                   # Static assets
└── package.json             # Dependencies
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open Prisma Studio GUI
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma client

# Linting
npm run lint            # Run ESLint
```

## 🌐 API Integration

The app integrates with the backend API for:

- **Activity Logging**: `POST /api/log/`
- **User Activities**: `GET /api/activities/{username}`
- **AI Predictions**: `POST /predict` (handled automatically by backend)

## 🔗 Blockchain Features

- **Network**: Ethereum Sepolia Testnet
- **Token Standard**: ERC-721 NFTs
- **Features**:
  - Automatic NFT minting for logged activities
  - Wallet connection via RainbowKit
  - Transaction history tracking
  - Etherscan integration

## 📱 Key Pages

1. **Home** (`/`): Landing page with features
2. **Dashboard** (`/dashboard`): User statistics and charts
3. **Activities** (`/activities`): Log carbon activities
4. **Profile** (`/profile`): User profile and achievements
5. **Sign In** (`/auth/signin`): User authentication
6. **Sign Up** (`/auth/signup`): New user registration

## 🎨 Design System

- **Colors**: Forest green, Sky blue, Earth brown
- **Components**: Glass morphism cards, nature gradients
- **Animations**: Smooth Framer Motion transitions
- **Icons**: Heroicons for consistency

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to other platforms

1. Build the application:
```bash
npm run build
```

2. The build output will be in `.next` folder

3. Set up environment variables on your hosting platform

4. Run:
```bash
npm run start
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based session management
- CORS configured for API calls
- Environment variables for sensitive data
- SQL injection protection via Prisma

## 🧪 Testing

```bash
# Run tests (when configured)
npm run test

# Run E2E tests
npm run test:e2e
```

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💡 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Run `npx prisma migrate dev` to sync schema

### API Connection Issues
- Verify backend is running at configured URLs
- Check CORS settings in backend
- Ensure API endpoints match documentation

### Blockchain Issues
- Verify wallet is connected to Sepolia network
- Check contract address is deployed and correct
- Ensure sufficient test ETH for transactions

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

Built with 💚 for our planet 🌍
