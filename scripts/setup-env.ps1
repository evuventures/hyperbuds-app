# Setup Environment Variables Script
# Run this script to set up .env.local for Google OAuth

Write-Host "🚀 Setting up environment variables..." -ForegroundColor Cyan

# Check if .env.local exists
$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "⚠️  .env.local already exists. Checking configuration..." -ForegroundColor Yellow
    
    $content = Get-Content $envFile -Raw
    
    # Check for Google OAuth
    if ($content -match "NEXT_PUBLIC_GOOGLE_CLIENT_ID") {
        Write-Host "✅ Google OAuth Client ID found" -ForegroundColor Green
    } else {
        Write-Host "❌ Google OAuth Client ID missing" -ForegroundColor Red
    }
    
    if ($content -match "NEXT_PUBLIC_GOOGLE_REDIRECT_URI") {
        Write-Host "✅ Google OAuth Redirect URI found" -ForegroundColor Green
    } else {
        Write-Host "❌ Google OAuth Redirect URI missing" -ForegroundColor Red
    }
    
    Write-Host "`n📝 Current .env.local configuration:" -ForegroundColor Cyan
    Get-Content $envFile | Where-Object { $_ -match "^[^#].*=" } | ForEach-Object {
        if ($_ -match "(SECRET|KEY|PASSWORD|TOKEN)") {
            $key = ($_ -split "=")[0]
            Write-Host "  $key=***hidden***" -ForegroundColor Gray
        } else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Cyan
    
    $envContent = @"
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✅ .env.local created!" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add redirect URI to Google Console: http://localhost:3000/auth/google-callback" -ForegroundColor White
Write-Host "2. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "`nFor detailed guide, see: docs/backend-integration/SETUP-AND-TESTING-GUIDE.md" -ForegroundColor Gray

