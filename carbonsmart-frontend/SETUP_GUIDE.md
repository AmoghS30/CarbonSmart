# 🌱 CarbonSmart Frontend - Complete Setup Guide

This guide will walk you through setting up the CarbonSmart frontend application from scratch on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### 1. **Node.js and npm**
- **Required**: Node.js version 18.0 or higher
- **Download**: https://nodejs.org/
- **Verify installation**:
  ```bash
  node --version  # Should show v18.x.x or higher
  npm --version   # Should show 8.x.x or higher
  ```

### 2. **PostgreSQL Database**
- **Required**: PostgreSQL 12 or higher
- **Download**: https://www.postgresql.org/download/
- **Verify installation**:
  ```bash
  psql --version  # Should show PostgreSQL 12.x or higher
  ```

### 3. **Git**
- **Download**: https://git-scm.com/downloads
- **Verify installation**:
  ```bash
  git --version
  ```

### 4. **Code Editor**
- **Recommended**: VS Code (https://code.visualstudio.com/)
- Install these VS Code extensions:
  - Prisma
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript

## 🚀 Quick Setup (Automated)

We provide automated setup scripts for different operating systems:

### For macOS/Linux:
```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### For Windows (PowerShell):
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the setup script
.\setup.ps1
```

## 📝 Manual Setup (Step-by-Step)

If you prefer to set up manually or the automated script doesn't work, follow these steps:

### Step 1: Clone or Download the Project

```bash
# If you have the files in a folder, navigate to it:
cd carbonsmart-frontend

# Or clone from a repository:
git clone <repository-url>
cd carbonsmart-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Tailwind CSS, Framer Motion
- Prisma, NextAuth
- RainbowKit, Wagmi
- And more...

### Step 3: Set Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Generate a NextAuth secret:**
   ```bash
   # On macOS/Linux:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [System.Convert]::ToBase64String((1..32 | ForEach {Get-Random -Maximum 256}))
   ```

3. **Edit `.env.local` file** and update these values:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/carbonsmart"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="paste-your-generated-secret-here"
   
   # Backend API URLs (keep these as is if using default ports)
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   NEXT_PUBLIC_AI_API_URL="http://127.0.0.1:8002"
   
   # Blockchain Configuration (optional for now)
   NEXT_PUBLIC_CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000"
   NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
   NEXT_PUBLIC_ETHERSCAN_URL="https://sepolia.etherscan.io"
   
   # WalletConnect (get from https://cloud.walletconnect.com)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id_here"
   ```

### Step 4: Set Up PostgreSQL Database

1. **Start PostgreSQL service:**
   
   **macOS:**
   ```bash
   brew services start postgresql
   ```
   
   **Linux:**
   ```bash
   sudo systemctl start postgresql
   ```
   
   **Windows:**
   - PostgreSQL should start automatically
   - Or use pgAdmin

2. **Create the database:**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE carbonsmart;
   
   # Exit
   \q
   ```

3. **Alternative using command line:**
   ```bash
   createdb -U postgres carbonsmart
   ```

### Step 5: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 6: Start Backend Services

The application requires two backend services to be running:

#### 1. **Django Backend API** (Port 8000)
```bash
# Navigate to your Django backend folder
cd ../backend-django  # Adjust path as needed

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

#### 2. **AI Engine** (Port 8002)
```bash
# Navigate to your AI engine folder
cd ../ai-engine  # Adjust path as needed

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8002
```

### Step 7: Start the Frontend Application

```bash
# Back in the frontend folder
cd carbonsmart-frontend

# Start development server
npm run dev
```

The application will start at: **http://localhost:3000**

## 🧪 Test the Application

### 1. **Create a Test Account:**
   - Go to http://localhost:3000/auth/signup
   - Create a new account
   - Or use demo credentials:
     - Username: `demo_user`
     - Password: `demo123`

### 2. **Test Features:**
   - **Dashboard**: View your carbon statistics
   - **Log Activity**: Track a carbon-emitting activity
   - **Profile**: View and edit your profile
   - **Wallet**: Connect MetaMask (optional)

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### 1. **Database Connection Error**
```
Error: Can't reach database server at `localhost:5432`
```
**Solution:**
- Ensure PostgreSQL is running
- Check credentials in `.env.local`
- Verify database exists: `psql -U postgres -l`

#### 2. **Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

#### 3. **Prisma Migration Error**
```
Error: Migration failed
```
**Solution:**
```bash
# Reset database and migrations
npx prisma migrate reset

# Generate client and migrate again
npx prisma generate
npx prisma migrate dev
```

#### 4. **Module Not Found Errors**
```
Error: Cannot find module 'xxx'
```
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. **Backend API Not Responding**
**Solution:**
- Verify Django backend is running on port 8000
- Check CORS settings in Django
- Ensure API endpoints match documentation

## 🔐 Security Setup (Optional)

### 1. **Enable HTTPS in Development:**
```bash
# Install mkcert
npm install -g mkcert

# Create certificates
mkcert -install
mkcert localhost

# Update next.config.js to use HTTPS
```

### 2. **Set Up WalletConnect:**
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Update `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

## 📦 Production Deployment

### Build for Production:
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### Deploy to Other Platforms:
- **Netlify**: Connect GitHub repo
- **Railway**: Use railway.app
- **Docker**: Use provided Dockerfile
- **AWS/GCP/Azure**: Use respective deployment guides

## 🛠️ Development Tools

### Useful Commands:
```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run tests (when configured)
npm run test

# Analyze bundle size
npm run analyze
```

### Database Management:
```bash
# View database in GUI
npx prisma studio

# Generate migration
npx prisma migrate dev

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs
- **RainbowKit**: https://www.rainbowkit.com/docs

## 💬 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Search for the error online
4. Check GitHub issues (if applicable)
5. Ask in developer forums

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Django backend running (port 8000)
- [ ] AI engine running (port 8002)
- [ ] Frontend running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can create account and login
- [ ] Can log activities

## 🎉 Congratulations!

You've successfully set up the CarbonSmart frontend application! 

Start tracking your carbon footprint and making a difference for our planet! 🌍

---

**Need more help?** Check the README.md for detailed feature documentation.
