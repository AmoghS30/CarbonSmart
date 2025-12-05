#!/bin/bash

# CarbonSmart Frontend Setup Script
# This script will help you set up the entire application from scratch

echo "🌱 Welcome to CarbonSmart Frontend Setup!"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "---------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
    
    # Check if version is 18 or higher
    NODE_MAJOR_VERSION=$(node -v | cut -d. -f1 | cut -dv -f2)
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        print_warning "Node.js version 18+ is recommended. You have $NODE_VERSION"
    fi
else
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL is installed: $PSQL_VERSION"
else
    print_warning "PostgreSQL is not installed or not in PATH"
    echo "You'll need PostgreSQL for the database. Install from https://www.postgresql.org/download/"
fi

echo ""

# Step 2: Install dependencies
echo "Step 2: Installing project dependencies..."
echo "------------------------------------------"
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Step 3: Set up environment variables
echo "Step 3: Setting up environment variables..."
echo "-------------------------------------------"

if [ -f .env.local ]; then
    print_warning ".env.local already exists. Skipping..."
else
    cp .env.local.example .env.local
    print_success "Created .env.local from template"
    
    # Generate NextAuth secret
    print_info "Generating NextAuth secret..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update the .env.local file based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secret-key-here-generate-with-openssl-rand-base64-32/$NEXTAUTH_SECRET/" .env.local
    else
        # Linux
        sed -i "s/your-secret-key-here-generate-with-openssl-rand-base64-32/$NEXTAUTH_SECRET/" .env.local
    fi
    
    print_success "Generated and set NextAuth secret"
fi

echo ""
print_warning "Please edit .env.local and update the following:"
echo "  - DATABASE_URL with your PostgreSQL credentials"
echo "  - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (get from https://cloud.walletconnect.com)"
echo "  - Other optional settings as needed"
echo ""

# Step 4: Database setup
echo "Step 4: Database setup..."
echo "-------------------------"

read -p "Do you want to set up the PostgreSQL database now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Please enter your PostgreSQL credentials:"
    read -p "PostgreSQL username (default: postgres): " PG_USER
    PG_USER=${PG_USER:-postgres}
    
    read -s -p "PostgreSQL password: " PG_PASSWORD
    echo ""
    
    read -p "Database name (default: carbonsmart): " DB_NAME
    DB_NAME=${DB_NAME:-carbonsmart}
    
    read -p "Host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "Port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    # Create database
    print_info "Creating database..."
    PGPASSWORD=$PG_PASSWORD psql -U $PG_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Database created successfully"
    else
        print_warning "Database might already exist or creation failed"
    fi
    
    # Update .env.local with database URL
    DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|postgresql://username:password@localhost:5432/carbonsmart|$DATABASE_URL|" .env.local
    else
        # Linux
        sed -i "s|postgresql://username:password@localhost:5432/carbonsmart|$DATABASE_URL|" .env.local
    fi
    
    print_success "Updated DATABASE_URL in .env.local"
    
    # Run Prisma migrations
    print_info "Running database migrations..."
    npx prisma generate
    npx prisma migrate dev --name init
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Failed to run migrations. Please check your database connection."
    fi
else
    print_warning "Skipping database setup. Remember to:"
    echo "  1. Create a PostgreSQL database"
    echo "  2. Update DATABASE_URL in .env.local"
    echo "  3. Run: npx prisma generate"
    echo "  4. Run: npx prisma migrate dev"
fi

echo ""

# Step 5: Check backend services
echo "Step 5: Checking backend services..."
echo "-------------------------------------"

# Check Django backend
print_info "Checking Django backend at http://127.0.0.1:8000..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ | grep -q "200\|404"; then
    print_success "Django backend is reachable"
else
    print_warning "Django backend is not running at http://127.0.0.1:8000"
    echo "  Please start your Django backend server"
fi

# Check AI Engine
print_info "Checking AI Engine at http://127.0.0.1:8002..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8002/ | grep -q "200\|404\|422"; then
    print_success "AI Engine is reachable"
else
    print_warning "AI Engine is not running at http://127.0.0.1:8002"
    echo "  Please start your FastAPI AI engine"
fi

echo ""

# Step 6: Final steps
echo "Step 6: Setup complete!"
echo "-----------------------"
print_success "CarbonSmart frontend setup is complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Review and update .env.local if needed"
echo "  2. Start the Django backend (port 8000)"
echo "  3. Start the AI engine (port 8002)"
echo "  4. Run the development server: npm run dev"
echo "  5. Open http://localhost:3000 in your browser"
echo ""
echo "🚀 To start the application:"
echo "  npm run dev"
echo ""
echo "📖 For more information, check the README.md file"
echo ""
print_success "Happy coding! 🌱"
