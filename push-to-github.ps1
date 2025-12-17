# 🚀 Push to GitHub Script
# Run this to commit and push your cleaned repository

Write-Host "🧹 Cleaning repository and preparing for deployment..." -ForegroundColor Cyan

# Check git status
Write-Host "`n📋 Current Git Status:" -ForegroundColor Yellow
git status

# Add all files (respecting .gitignore)
Write-Host "`n➕ Adding files to git..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "`n📦 Files to be committed:" -ForegroundColor Yellow
git status --short

# Commit
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Clean repo and prepare for deployment - Remove docs, add deployment configs"

# Push to GitHub
Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Done! Your repository is ready for deployment." -ForegroundColor Green
Write-Host "`n📖 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy backend on Render.com" -ForegroundColor White
Write-Host "   2. Deploy frontend on Vercel.com" -ForegroundColor White
Write-Host "   3. See DEPLOYMENT.md for detailed instructions" -ForegroundColor White
