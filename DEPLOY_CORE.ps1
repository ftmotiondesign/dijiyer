$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Dijiyer Firebase cekirdek yayin basliyor..." -ForegroundColor Cyan

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
  throw "Firebase CLI bulunamadi. Once: npm install -g firebase-tools"
}

if (-not (Test-Path ".\functions\package.json")) {
  throw "functions/package.json bulunamadi."
}

Write-Host "1/3 Functions bagimliliklari kontrol ediliyor..." -ForegroundColor Yellow
Push-Location ".\functions"
npm install
Pop-Location

Write-Host "2/3 Firestore Rules ve Cloud Functions yayinlaniyor..." -ForegroundColor Yellow
firebase deploy --only firestore:rules,functions

Write-Host "3/3 Tamamlandi." -ForegroundColor Green
Write-Host "GitHub Pages dosyalari main branch uzerinden ayrica yayinlanir." -ForegroundColor DarkGray
