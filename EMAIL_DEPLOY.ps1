$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " DIJIYER - Otomatik E-posta Kurulumu" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js bulunamadı. Önce Node.js LTS kurulmalı." -ForegroundColor Red
  exit 1
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
  Write-Host "Firebase CLI bulunamadı. Kuruluyor..." -ForegroundColor Yellow
  npm install -g firebase-tools
}

Write-Host ""
Write-Host "1/5 Firebase hesabına giriş..." -ForegroundColor Yellow
firebase login

Write-Host ""
Write-Host "2/5 Dijiyer projesi seçiliyor..." -ForegroundColor Yellow
firebase use dijiyer

Write-Host ""
Write-Host "3/5 Gönderici Gmail adresini gir." -ForegroundColor Yellow
Write-Host "Örnek: dijiyer@gmail.com" -ForegroundColor DarkGray
firebase functions:secrets:set SMTP_USER

Write-Host ""
Write-Host "4/5 Gmail Uygulama Şifresini gir." -ForegroundColor Yellow
Write-Host "NOT: Normal Gmail şifreni kullanma. Google Hesabı > Güvenlik > Uygulama Şifreleri." -ForegroundColor DarkGray
firebase functions:secrets:set SMTP_PASS

Write-Host ""
Write-Host "5/5 Function yayınlanıyor..." -ForegroundColor Yellow
firebase deploy --only functions

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Kurulum tamamlandı." -ForegroundColor Green
Write-Host " Yeni teklif talebinde takip linki e-posta ile gönderilecek." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
