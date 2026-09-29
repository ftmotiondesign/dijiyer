# Firebase Storage - Banner Görsel / Video Yükleme

Yönetim panelindeki **Reklam → Banner Reklamları → Görsel Yükle / Video Yükle**
özelliği dosyaları şu klasöre yükler:

```text
bannerAds/{institutionId}/{timestamp}_{filename}
```

Mevcut Firebase Storage Rules dosyanızda `service firebase.storage` bloğunun içine
aşağıdaki kuralı ekleyin.

```firestore
match /bannerAds/{institutionId}/{fileName} {

  // Banner medyası herkese gösterilebilir.
  allow read: if true;

  // Sadece Dijiyer yönetici hesabı yükleyebilir/değiştirebilir/silebilir.
  allow write: if
    request.auth != null
    && request.auth.uid == "Et5cFLiQNtgMdQcWIAcaQIOpQBe2"
    && request.resource.size < 30 * 1024 * 1024
    && (
      request.resource.contentType.matches('image/(jpeg|png|webp)')
      || request.resource.contentType.matches('video/(mp4|webm)')
    );
}
```

Not:
- Görsel tarafında arayüz 8 MB sınırı uygular.
- Video tarafında arayüz 30 MB sınırı uygular.
- Desteklenen görseller: JPG, PNG, WebP
- Desteklenen videolar: MP4, WebM
