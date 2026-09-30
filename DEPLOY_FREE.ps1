$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Dijiyer ucretsiz Firebase yayin basliyor..." -ForegroundColor Cyan

if (-not (Get-Command firebase.cmd -ErrorAction SilentlyContinue)) {
  throw "Firebase CLI bulunamadi. Once: npm install -g firebase-tools"
}

if (-not (Test-Path ".\firestore.rules")) {
  throw "firestore.rules bulunamadi."
}

Write-Host "Firestore Rules yayinlaniyor..." -ForegroundColor Yellow
firebase.cmd deploy --only firestore:rules

if ($LASTEXITCODE -ne 0) {
  throw "Firestore Rules deploy basarisiz oldu. Cikis kodu: $LASTEXITCODE"
}

Write-Host "Firestore Rules basariyla yayinlandi." -ForegroundColor Green
Write-Host "Not: Cloud Functions ucretsiz Spark planda yayinlanmaz. Admin panelindeki 2. teklif yedek sistemi kullanilir." -ForegroundColor DarkGray
