# Dijiyer - Firebase App Check kurulumu

Bu adım Firebase Console üzerinden yapılmalıdır. App Check anahtarı ve enforcement ayarı proje hesabına bağlı olduğu için kod tarafından güvenli biçimde tahmin edilemez.

## Önerilen sıra

1. Firebase Console > App Check bölümünü açın.
2. Dijiyer Web uygulamasını seçin.
3. Web için reCAPTCHA v3 veya reCAPTCHA Enterprise sağlayıcısını kaydedin.
4. Önce **monitoring** modunda çalıştırın; gerçek kullanıcı trafiğinin sorunsuz geldiğini doğrulayın.
5. Ardından Firestore için enforcement'ı etkinleştirin.
6. Functions çağrılarında App Check kullanan HTTPS/callable fonksiyonlar eklenirse onlar için de enforcement'ı ayrıca etkinleştirin.

## Neden hemen zorla etkinleştirilmedi?

Mevcut web kodunda App Check provider/site key henüz tanımlı değil. Enforcement'ı önce açmak; teklif, yorum, analitik ve diğer istemci Firestore işlemlerinin tamamını yanlışlıkla engelleyebilir.

## Bu turda yapılan güvenlik iyileştirmeleri

- Kurum yorumları artık doğrudan `published` oluşturulamıyor; `pending` olarak moderasyona düşüyor.
- Ziyaretçiler yalnızca `published` yorumları okuyabiliyor.
- `clientErrors` koleksiyonuna anonim ziyaretçiler yazamıyor.
- Hata kaydı yalnızca yönetici ve onaylı kurum hesabı için açık.
- 2. teklif daveti sunucu tarafındaki zamanlayıcı tarafından oluşturuluyor.

App Check provider anahtarı tanımlandıktan sonra istemci başlangıç koduna App Check bootstrap eklenmeli ve daha sonra enforcement açılmalıdır.
