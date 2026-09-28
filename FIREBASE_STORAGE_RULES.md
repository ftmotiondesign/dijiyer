# Dijiyer Firebase Storage Rules

Firebase Console → Storage → Rules bölümüne aşağıdaki kuralları yapıştırıp **Publish** edin.

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    match /institution-media/{userId}/{institutionId}/{allPaths=**} {

      // Kurum görselleri ana sayfada müşterilere gösterilir.
      allow read: if true;

      // Her kullanıcı yalnızca kendi klasörüne görsel yükleyebilir/güncelleyebilir.
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size <= 8 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');

      // Kullanıcı yalnızca kendi yüklediği görselleri silebilir.
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
```

Not: Uygulama tarafında da JPG, PNG ve WebP kontrolü ve görsel başına 8 MB sınırı uygulanır.
