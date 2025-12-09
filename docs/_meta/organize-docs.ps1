# PowerShell script to organize docs folder
# Run this script from the docs directory
# IMPORTANT: Close all files in VS Code before running!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Documentation Organization Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Close all files in VS Code first!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Organizing documentation files..." -ForegroundColor Green
Write-Host ""

# Move backend files
Write-Host "Moving backend files..." -ForegroundColor Yellow
$backendFiles = @(
    "BACKEND-REQUIREMENTS.md",
    "BACKEND-TEAM-QUICK-START.md",
    "BACKEND-API-INTEGRATION-PLAN.md",
    "BACKEND-DISABLED-FEATURES.md",
    "BACKEND-AVATAR-UPLOAD-FIX-NEEDED.md"
)
foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Move-Item $file "backend\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}
if (Test-Path "backend-integration") {
    Move-Item "backend-integration" "backend\" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Moved backend-integration folder" -ForegroundColor Green
}

# Move testing files
Write-Host "Moving testing files..." -ForegroundColor Yellow
$testingFiles = @(
    "TESTING-GUIDE.md",
    "TESTING-STATUS.md",
    "TESTING-NICHE-VALIDATION.md",
    "RIZZ-SCORE-TESTING.md",
    "RIZZ-SCORE-TEST-IMPROVED.md",
    "SUGGESTIONS-TESTING.md",
    "QUICK-START-TESTING.md",
    "BROWSER-TEST-RESULTS.md"
)
foreach ($file in $testingFiles) {
    if (Test-Path $file) {
        Move-Item $file "testing\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Move API files
Write-Host "Moving API files..." -ForegroundColor Yellow
$apiFiles = @(
    "API-ENDPOINTS-SUMMARY.md",
    "UPDATED-API-DOCUMENTATION.md"
)
foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        Move-Item $file "api\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}
if (Test-Path "API location") {
    Move-Item "API location" "api\" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Moved API location folder" -ForegroundColor Green
}

# Move implementation files
Write-Host "Moving implementation files..." -ForegroundColor Yellow
$implFiles = @(
    "IMPLEMENTATION-CHECKLIST.md",
    "IMMEDIATE-ACTION-PLAN.md",
    "CHANGED-FILES-SUMMARY.md",
    "KEY-CHANGES-SUMMARY.md",
    "messaging-system-integration.md",
    "AI-COLLABORATOR-RESEARCH.md",
    "AVATAR-UPLOAD-ISSUE.md"
)
foreach ($file in $implFiles) {
    if (Test-Path $file) {
        Move-Item $file "implementation\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Move setup files
Write-Host "Moving setup files..." -ForegroundColor Yellow
if (Test-Path "ENVIRONMENT-SETUP.md") {
    Move-Item "ENVIRONMENT-SETUP.md" "setup\" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Moved ENVIRONMENT-SETUP.md" -ForegroundColor Green
}
if (Test-Path "general") {
    Move-Item "general" "setup\" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Moved general folder" -ForegroundColor Green
}

# Move niche files
Write-Host "Moving niche files..." -ForegroundColor Yellow
$nicheFiles = @(
    "NICHE-100-ANALYSIS.md",
    "NICHE-ENDPOINT-FIX.md",
    "NICHE-ISSUES-FIXED.md",
    "FALLBACK-NICHES-SOLUTION.md"
)
foreach ($file in $nicheFiles) {
    if (Test-Path $file) {
        Move-Item $file "features\niche\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Organization complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Remaining files in root:" -ForegroundColor Yellow
$remaining = Get-ChildItem -File | Where-Object { 
    $_.Name -notlike "README.md" -and 
    $_.Name -notlike "ORGANIZATION*.md" -and 
    $_.Name -notlike "organize*.ps1" -and
    $_.Name -notlike "MOVE-FILES*.md"
}
if ($remaining.Count -eq 0) {
    Write-Host "  ✓ All files organized!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some files could not be moved (may be locked):" -ForegroundColor Yellow
    $remaining | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "  Solution: Close VS Code and run this script again, or move manually." -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Check the folders to verify all files were moved." -ForegroundColor Cyan

