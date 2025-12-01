# Application Health Check Script
# Run this to diagnose issues with the Export Contract Generator

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Export Contract Generator - Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check 1: Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
        Write-Host "  [OK] Node.js installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Node.js not found" -ForegroundColor Red
        $issues += "Node.js is not installed. Download from: https://nodejs.org"
    }
} catch {
    Write-Host "  [ERROR] Node.js not found" -ForegroundColor Red
    $issues += "Node.js is not installed. Download from: https://nodejs.org"
}

# Check 2: MongoDB
Write-Host "`n[2/6] Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "  [OK] MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] MongoDB service exists but is not running" -ForegroundColor Yellow
        $warnings += "MongoDB service is stopped. Start it with: net start MongoDB"
        Write-Host "  Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service MongoDB -ErrorAction Stop
            Write-Host "  [OK] MongoDB started successfully" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Failed to start MongoDB" -ForegroundColor Red
            $issues += "Cannot start MongoDB service. Run as Administrator or check installation."
        }
    }
} else {
    Write-Host "  [ERROR] MongoDB service not found" -ForegroundColor Red
    $issues += "MongoDB is not installed. See MONGODB_INSTALL.md for installation guide."
}

# Check if MongoDB is listening on port 27017
$mongoPort = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoPort) {
    Write-Host "  [OK] MongoDB is listening on port 27017" -ForegroundColor Green
} else {
    if ($mongoService -and $mongoService.Status -eq 'Running') {
        Write-Host "  [WARNING] MongoDB service is running but not listening on default port" -ForegroundColor Yellow
        $warnings += "MongoDB might be using a different port. Check your configuration."
    }
}

# Check 3: Project Files
Write-Host "`n[3/6] Checking project files..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "server\server.js",
    "server\seed.js",
    "client\package.json",
    ".env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Missing: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    $issues += "Missing files: $($missingFiles -join ', '). Project may be corrupted."
}

# Check 4: Dependencies
Write-Host "`n[4/6] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  [OK] Backend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Backend dependencies not installed" -ForegroundColor Yellow
    $warnings += "Run 'npm install' to install backend dependencies"
}

if (Test-Path "client\node_modules") {
    Write-Host "  [OK] Frontend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Frontend dependencies not installed" -ForegroundColor Yellow
    $warnings += "Run 'npm install --prefix client' to install frontend dependencies"
}

# Check 5: Environment Configuration
Write-Host "`n[5/6] Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  [OK] .env file exists" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "MONGODB_URI") {
        Write-Host "  [OK] MONGODB_URI is configured" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] MONGODB_URI not found in .env" -ForegroundColor Yellow
        $warnings += "Add MONGODB_URI to .env file"
    }
} else {
    Write-Host "  [WARNING] .env file not found" -ForegroundColor Yellow
    $warnings += "Create .env file from .env.example"
}

# Check 6: Database Content
Write-Host "`n[6/6] Checking database content..." -ForegroundColor Yellow
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "  Attempting to check database..." -ForegroundColor Gray
    try {
        $mongoShell = Get-Command mongosh -ErrorAction SilentlyContinue
        if ($mongoShell) {
            $dbCheck = & mongosh "mongodb://localhost:27017/export-contracts" --quiet --eval "db.parties.countDocuments()" 2>$null
            if ($LASTEXITCODE -eq 0) {
                $count = [int]$dbCheck
                if ($count -gt 0) {
                    Write-Host "  [OK] Database has data ($count parties found)" -ForegroundColor Green
                } else {
                    Write-Host "  [WARNING] Database is empty" -ForegroundColor Yellow
                    $warnings += "Database needs seeding. Run: node server/seed.js"
                }
            } else {
                Write-Host "  [WARNING] Could not check database content" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [SKIP] mongosh not found, skipping database check" -ForegroundColor Gray
            $warnings += "Install mongosh for database inspection: https://www.mongodb.com/try/download/shell"
        }
    } catch {
        Write-Host "  [WARNING] Could not check database content" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [SKIP] MongoDB not running, cannot check database" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Health Check Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n[SUCCESS] All checks passed!" -ForegroundColor Green
    Write-Host "`nYour application should be ready to run." -ForegroundColor Green
    Write-Host "Start with: npm run dev" -ForegroundColor Cyan
} else {
    if ($issues.Count -gt 0) {
        Write-Host "`n[CRITICAL ISSUES]" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  ! $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n[WARNINGS]" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  * $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Recommended Actions:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($issues -match "MongoDB") {
        Write-Host "`n1. Install MongoDB:" -ForegroundColor White
        Write-Host "   See MONGODB_INSTALL.md for detailed instructions" -ForegroundColor Gray
    }
    
    if ($warnings -match "dependencies") {
        Write-Host "`n2. Install Dependencies:" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor Gray
        Write-Host "   cd client" -ForegroundColor Gray
        Write-Host "   npm install" -ForegroundColor Gray
        Write-Host "   cd .." -ForegroundColor Gray
    }
    
    if ($warnings -match "seeding") {
        Write-Host "`n3. Seed Database:" -ForegroundColor White
        Write-Host "   node server/seed.js" -ForegroundColor Gray
    }
    
    Write-Host "`n4. Start Application:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host ""
