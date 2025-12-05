# CarbonSmart Frontend Setup Script for Windows
# Run this script in PowerShell as Administrator if needed

Write-Host "🌱 Welcome to CarbonSmart Frontend Setup!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function for colored output
function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor White
Write-Host "---------------------------------" -ForegroundColor White

# Check Node.js
if (Test-CommandExists "node") {
    $nodeVersion = node -v
    Write-Success "Node.js is installed: $nodeVersion"
    
    # Check if version is 18 or higher
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Warning "Node.js version 18+ is recommended. You have $nodeVersion"
    }
}
else {
    Write-Error "Node.js is not installed"
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Check npm
if (Test-CommandExists "npm") {
    $npmVersion = npm -v
    Write-Success "npm is installed: $npmVersion"
}
else {
    Write-Error "npm is not installed"
    exit
}

# Check PostgreSQL
if (Test-CommandExists "psql") {
    $psqlVersion = psql --version
    Write-Success "PostgreSQL is installed: $psqlVersion"
}
else {
    Write-Warning "PostgreSQL is not installed or not in PATH"
    Write-Host "You'll need PostgreSQL for the database. Install from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing project dependencies..." -ForegroundColor White
Write-Host "------------------------------------------" -ForegroundColor White

npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed successfully"
}
else {
    Write-Error "Failed to install dependencies"
    exit
}

Write-Host ""

# Step 3: Set up environment variables
Write-Host "Step 3: Setting up environment variables..." -ForegroundColor White
Write-Host "-------------------------------------------" -ForegroundColor White

if (Test-Path ".env.local") {
    Write-Warning ".env.local already exists. Skipping..."
}
else {
    Copy-Item ".env.local.example" ".env.local"
    Write-Success "Created .env.local from template"
    
    # Generate NextAuth secret
    Write-Info "Generating NextAuth secret..."
    Add-Type -AssemblyName System.Security
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $nextAuthSecret = [System.Convert]::ToBase64String($bytes)
    
    # Update the .env.local file
    $envContent = Get-Content ".env.local"
    $envContent = $envContent -replace 'your-secret-key-here-generate-with-openssl-rand-base64-32', $nextAuthSecret
    Set-Content ".env.local" $envContent
    
    Write-Success "Generated and set NextAuth secret"
}

Write-Host ""
Write-Warning "Please edit .env.local and update the following:"
Write-Host "  - DATABASE_URL with your PostgreSQL credentials" -ForegroundColor White
Write-Host "  - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (get from https://cloud.walletconnect.com)" -ForegroundColor White
Write-Host "  - Other optional settings as needed" -ForegroundColor White
Write-Host ""

# Step 4: Database setup
Write-Host "Step 4: Database setup..." -ForegroundColor White
Write-Host "-------------------------" -ForegroundColor White

$setupDb = Read-Host "Do you want to set up the PostgreSQL database now? (y/n)"
if ($setupDb -eq 'y' -or $setupDb -eq 'Y') {
    Write-Host ""
    Write-Info "Please enter your PostgreSQL credentials:"
    
    $pgUser = Read-Host "PostgreSQL username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }
    
    $pgPassword = Read-Host "PostgreSQL password" -AsSecureString
    $pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))
    
    $dbName = Read-Host "Database name (default: carbonsmart)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "carbonsmart" }
    
    $dbHost = Read-Host "Host (default: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "Port (default: 5432)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
    
    # Create database
    Write-Info "Creating database..."
    $env:PGPASSWORD = $pgPasswordPlain
    psql -U $pgUser -h $dbHost -p $dbPort -c "CREATE DATABASE $dbName;" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database created successfully"
    }
    else {
        Write-Warning "Database might already exist or creation failed"
    }
    
    # Update .env.local with database URL
    $databaseUrl = "postgresql://${pgUser}:${pgPasswordPlain}@${dbHost}:${dbPort}/${dbName}"
    
    $envContent = Get-Content ".env.local"
    $envContent = $envContent -replace 'postgresql://username:password@localhost:5432/carbonsmart', $databaseUrl
    Set-Content ".env.local" $envContent
    
    Write-Success "Updated DATABASE_URL in .env.local"
    
    # Run Prisma migrations
    Write-Info "Running database migrations..."
    npx prisma generate
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database migrations completed"
    }
    else {
        Write-Error "Failed to run migrations. Please check your database connection."
    }
    
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
else {
    Write-Warning "Skipping database setup. Remember to:"
    Write-Host "  1. Create a PostgreSQL database" -ForegroundColor White
    Write-Host "  2. Update DATABASE_URL in .env.local" -ForegroundColor White
    Write-Host "  3. Run: npx prisma generate" -ForegroundColor White
    Write-Host "  4. Run: npx prisma migrate dev" -ForegroundColor White
}

Write-Host ""

# Step 5: Check backend services
Write-Host "Step 5: Checking backend services..." -ForegroundColor White
Write-Host "-------------------------------------" -ForegroundColor White

# Check Django backend
Write-Info "Checking Django backend at http://127.0.0.1:8000..."
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Success "Django backend is reachable"
}
catch {
    Write-Warning "Django backend is not running at http://127.0.0.1:8000"
    Write-Host "  Please start your Django backend server" -ForegroundColor White
}

# Check AI Engine
Write-Info "Checking AI Engine at http://127.0.0.1:8002..."
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8002/" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Success "AI Engine is reachable"
}
catch {
    Write-Warning "AI Engine is not running at http://127.0.0.1:8002"
    Write-Host "  Please start your FastAPI AI engine" -ForegroundColor White
}

Write-Host ""

# Step 6: Final steps
Write-Host "Step 6: Setup complete!" -ForegroundColor Green
Write-Host "-----------------------" -ForegroundColor Green
Write-Success "CarbonSmart frontend setup is complete!"
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor White
Write-Host "  1. Review and update .env.local if needed" -ForegroundColor White
Write-Host "  2. Start the Django backend (port 8000)" -ForegroundColor White
Write-Host "  3. Start the AI engine (port 8002)" -ForegroundColor White
Write-Host "  4. Run the development server: npm run dev" -ForegroundColor White
Write-Host "  5. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more information, check the README.md file" -ForegroundColor White
Write-Host ""
Write-Success "Happy coding! 🌱"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
