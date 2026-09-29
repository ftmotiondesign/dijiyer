# Dijiyer Firebase Storage Rules

Firebase Console → Storage → Rules bölümüne aşağıdaki kuralları yapıştırıp **Publish** edin.

Bu sürüm kurum profilinde şu medyaları destekler:

- Logo / kapak / galeri görselleri
- 360° panoramik görsel
- Profil / konum videosu

```firestore
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    match /institution-media/{userId}/{institutionId}/{kind}/{fileName} {

      // Kurum profil medyaları müşteri sayfasında herkese gösterilir.
      allow read: if true;

      // Her kullanıcı yalnızca kendi kurum klasörüne yükleme yapabilir.
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && (
          (
            (kind == "logo" || kind == "cover" || kind == "gallery")
            && request.resource.size <= 8 * 1024 * 1024
            && request.resource.contentType.matches('image/(jpeg|png|webp)')
          )
          ||
          (
            kind == "panorama360"
            && request.resource.size <= 20 * 1024 * 1024
            && request.resource.contentType.matches('image/(jpeg|png|webp)')
          )
          ||
          (
            kind == "video"
            && request.resource.size <= 80 * 1024 * 1024
            && request.resource.contentType.matches('video/(mp4|webm)')
          )
        );

      // Kullanıcı yalnızca kendi yüklediği medyayı silebilir.
      allow delete: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

## Kullanılan klasör yapısı

```
institution-media/{firebaseAuthUid}/{institutionId}/logo/...
institution-media/{firebaseAuthUid}/{institutionId}/cover/...
institution-media/{firebaseAuthUid}/{institutionId}/gallery/...
institution-media/{firebaseAuthUid}/{institutionId}/panorama360/...
institution-media/{firebaseAuthUid}/{institutionId}/video/...
```

## Uygulama sınırları

- Logo / kapak / galeri: JPG, PNG, WebP · en fazla 8 MB
- 360° panorama: JPG, PNG, WebP · en fazla 20 MB
- Video: MP4 veya WebM · en fazla 80 MB

360° görseller için en iyi sonuç **2:1 equirectangular** panoramik görsellerle alınır.
