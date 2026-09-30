# Dijiyer otomatik takip e-postası

Bu klasördeki Firebase Function, yeni bir
`quoteAccess/{phoneHash}/codes/{trackingCode}` belgesi oluştuğunda
ilgili `quoteRequests/{quoteId}` belgesinden müşterinin e-posta adresini alır
ve takip kodu + takip linkini otomatik olarak gönderir.

## Bir defalık kurulum

Firebase CLI ile proje klasöründe:

```powershell
firebase login
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
firebase deploy --only functions
```

- `SMTP_USER`: Gönderici Gmail adresi.
- `SMTP_PASS`: Gmail normal şifresi değil, Google Hesabı > Güvenlik > Uygulama şifresi.
- Gizli bilgiler GitHub dosyalarına yazılmaz.
- Functions kullanımı için Firebase projesinin uygun faturalandırma planında olması gerekebilir.

Gönderim fonksiyonu: `sendQuoteTrackingEmail`.
