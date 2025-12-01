# Export Contract Generator - Installation Script
# Run this script to set up the complete application

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Export Contract Generator - Setup Wizard" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
    Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Step 1b: Check MongoDB service (if installed)
Write-Host "Checking MongoDB service..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -ne $null) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "[OK] MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "[WARN] MongoDB service found but not running. Attempting to start..." -ForegroundColor Yellow
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
        if ($mongoService -and $mongoService.Status -eq 'Running') {
            Write-Host "[OK] MongoDB started successfully" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Could not start MongoDB automatically. Please start it manually if required." -ForegroundColor Red
            $continue = Read-Host "Continue anyway? (y/n)"
            if ($continue -ne 'y') { exit 1 }
        }
    }
} else {
    Write-Host "[WARN] MongoDB service not found. If you plan to use a local MongoDB, please install and start it." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 1 }
}

Write-Host ""

# Step 2: Install backend dependencies
Write-Host "Step 2: Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Install frontend dependencies
Write-Host "Step 3: Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location client
npm install
$frontendResult = $LASTEXITCODE
Pop-Location

if ($frontendResult -eq 0) {
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Check for .env file and create from example if missing
Write-Host "Step 4: Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
} else {
    if (Test-Path .env.example) {
        Write-Host "[WARN] .env file not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env -Force
        Write-Host "[OK] .env file created. Please review and update if needed." -ForegroundColor Green
    } else {
        Write-Host "[WARN] .env.example not found. Please create a .env file before running the app." -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 5: Optional database seeding
Write-Host "Step 5: Database setup" -ForegroundColor Yellow
$seed = Read-Host "Would you like to seed the database with sample data? (y/n)"
if ($seed -eq 'y') {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    node server/seed.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Database seeding failed. You can run it manually later with: node server/seed.js" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review .env file if needed: notepad .env" -ForegroundColor White
Write-Host "2. Start the application: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Yellow
Write-Host "- QUICKSTART.md - Quick start guide" -ForegroundColor White
Write-Host "- README.md - Complete documentation" -ForegroundColor White
Write-Host "- docs/API.md - API reference" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Would you like to start the application now? (y/n)"
if ($startNow -eq 'y') {
    Write-Host ""
    Write-Host "Starting Export Contract Generator..." -ForegroundColor Cyan
    Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Green
    Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
}
