# Setup Environment Variables Script
# Run this script to set up .env.local for Google OAuth and UploadThing

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
    
    # Check for UploadThing
    if ($content -match "UPLOADTHING_SECRET") {
        if ($content -match "UPLOADTHING_SECRET=sk_live_") {
            Write-Host "✅ UploadThing Secret found" -ForegroundColor Green
        } else {
            Write-Host "⚠️  UploadThing Secret needs to be configured" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ UploadThing Secret missing" -ForegroundColor Red
    }
    
    if ($content -match "NEXT_PUBLIC_UPLOADTHING_APP_ID") {
        if ($content -match "NEXT_PUBLIC_UPLOADTHING_APP_ID=your_app_id") {
            Write-Host "⚠️  UploadThing App ID needs to be configured" -ForegroundColor Yellow
        } else {
            Write-Host "✅ UploadThing App ID found" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ UploadThing App ID missing" -ForegroundColor Red
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
NEXT_PUBLIC_GOOGLE_CLIENT_ID=538397905080-9ubnk7n3tmcuhq8huetom5nomnjjrm5g.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback

# UploadThing Configuration
# Get these from https://uploadthing.com/dashboard after creating an account
UPLOADTHING_SECRET=sk_live_your_secret_key_here
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_app_id_here

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✅ .env.local created!" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up UploadThing account: https://uploadthing.com/" -ForegroundColor White
Write-Host "2. Get API keys from UploadThing dashboard" -ForegroundColor White
Write-Host "3. Update UPLOADTHING_SECRET and NEXT_PUBLIC_UPLOADTHING_APP_ID in .env.local" -ForegroundColor White
Write-Host "4. Add redirect URI to Google Console: http://localhost:3000/auth/google-callback" -ForegroundColor White
Write-Host "5. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "`nFor detailed guide, see: docs/backend-integration/SETUP-AND-TESTING-GUIDE.md" -ForegroundColor Gray

