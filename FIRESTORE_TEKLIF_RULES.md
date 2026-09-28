# Garantili Teklif Sistemi – Firestore Rules

Bu bloklar mevcut `rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { ... } }`
yapısında, en sondaki catch-all `match /{document=**} { allow read, write: if false; }` kuralından **önce** eklenmelidir.

Mevcut `isAdmin()` fonksiyonunuzu koruyun.

## 1) Yardımcı fonksiyonlar

```firestore
function isApprovedInstitutionUser() {
  return request.auth != null
    && exists(/databases/$(database)/documents/institutionUsers/$(request.auth.uid))
    && get(/databases/$(database)/documents/institutionUsers/$(request.auth.uid)).data.status == "approved";
}

function currentInstitutionId() {
  return get(/databases/$(database)/documents/institutionUsers/$(request.auth.uid)).data.institutionId;
}
```

## 2) Kurumun gerçek fiyat teklifleri

```firestore
match /quoteRequests/{quoteId}/offers/{institutionId} {
  // Müşteri yalnızca kendi cihazında bildiği quoteId altındaki teklifleri görüntüler.
  // Bu dokümanlarda müşteri telefon/ad bilgisi tutulmaz.
  allow get, list: if true;

  allow create: if isApprovedInstitutionUser()
    && currentInstitutionId() == institutionId
    && request.resource.data.keys().hasOnly([
      "institutionId",
      "institutionName",
      "offerCode",
      "price",
      "vatStatus",
      "scope",
      "extraFee",
      "conditions",
      "expiresAt",
      "expiresAtTs",
      "status",
      "createdAt",
      "updatedAt"
    ])
    && request.resource.data.institutionId == institutionId
    && request.resource.data.offerCode is string
    && request.resource.data.price is number
    && request.resource.data.price > 0
    && request.resource.data.scope is string
    && request.resource.data.scope.size() > 0
    && request.resource.data.status == "offered"
    && request.resource.data.expiresAtTs is timestamp
    && request.resource.data.expiresAtTs > request.time;

  // Müşteri fiyatı kilitledikten sonra satıcı artık teklifi değiştiremez.
  allow update: if isApprovedInstitutionUser()
    && currentInstitutionId() == institutionId
    && resource.data.institutionId == institutionId
    && request.resource.data.institutionId == institutionId
    && request.resource.data.offerCode == resource.data.offerCode
    && request.resource.data.status == "offered"
    && !exists(/databases/$(database)/documents/quoteRequests/$(quoteId)/locks/main)
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      "institutionName",
      "price",
      "vatStatus",
      "scope",
      "extraFee",
      "conditions",
      "expiresAt",
      "expiresAtTs",
      "status",
      "updatedAt"
    ])
    && request.resource.data.expiresAtTs > request.time;

  allow delete: if isAdmin();
}
```

## 3) Müşterinin fiyat kilidi

```firestore
match /quoteRequests/{quoteId}/locks/{lockId} {
  allow get: if lockId == "main";
  allow list: if false;

  // Aynı talepte yalnızca bir adet ana kilit oluşturulabilir.
  allow create: if lockId == "main"
    && !exists(/databases/$(database)/documents/quoteRequests/$(quoteId)/locks/main)
    && request.resource.data.keys().hasOnly([
      "quoteId",
      "institutionId",
      "institutionName",
      "offerCode",
      "price",
      "vatStatus",
      "scope",
      "conditions",
      "expiresAt",
      "expiresAtTs",
      "status",
      "lockedAt",
      "lockedAtTs",
      "lockedPrice",
      "lockedScope"
    ])
    && request.resource.data.quoteId == quoteId
    && request.resource.data.status == "locked"
    && request.resource.data.lockedAtTs == request.time
    && exists(
      /databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)
    )
    && request.resource.data.offerCode ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.offerCode
    && request.resource.data.price ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.price
    && request.resource.data.lockedPrice ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.price
    && request.resource.data.scope ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.scope
    && request.resource.data.lockedScope ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.scope
    && request.resource.data.expiresAt ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.expiresAt
    && request.resource.data.expiresAtTs ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.expiresAtTs
    && request.time <
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.expiresAtTs;

  // Kilit kaydını yalnızca seçilen kurum "kullanıldı" durumuna çevirebilir.
  allow update: if lockId == "main"
    && isApprovedInstitutionUser()
    && currentInstitutionId() == resource.data.institutionId
    && resource.data.status == "locked"
    && request.resource.data.status == "used"
    && request.resource.data.usedAtTs == request.time
    && request.time < resource.data.expiresAtTs
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      "status",
      "usedAt",
      "usedAtTs"
    ]);

  allow delete: if isAdmin();
}
```

## 4) QR / teklif kodu doğrulama indeksi

```firestore
match /offerLookup/{offerCode} {
  allow get: if true;
  allow list: if false;

  allow create: if isApprovedInstitutionUser()
    && currentInstitutionId() == request.resource.data.institutionId
    && request.resource.data.keys().hasOnly([
      "quoteId",
      "institutionId",
      "offerCode",
      "updatedAt"
    ])
    && request.resource.data.offerCode == offerCode;

  allow update: if isApprovedInstitutionUser()
    && currentInstitutionId() == resource.data.institutionId
    && request.resource.data.quoteId == resource.data.quoteId
    && request.resource.data.institutionId == resource.data.institutionId
    && request.resource.data.offerCode == resource.data.offerCode
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      "updatedAt"
    ]);

  allow delete: if isAdmin();
}
```

## 5) Teklife uyulmaması bildirimi

```firestore
match /quoteRequests/{quoteId}/offerIssues/{issueId} {
  allow create: if request.resource.data.keys().hasOnly([
      "offerCode",
      "reason",
      "status",
      "date"
    ])
    && request.resource.data.offerCode is string
    && request.resource.data.reason is string
    && request.resource.data.reason.size() > 0
    && request.resource.data.reason.size() <= 500
    && request.resource.data.status == "new";

  allow read, update, delete: if isAdmin();
}
```

## Not

Mevcut `quoteRequests`, `institutionUsers`, `institutions` ve yönetici kurallarınızı silmeyin.
Bu dosya yalnızca Garantili Teklif Sistemi için ek kural bloklarını içerir.


## 6) Müşteri teklif takip erişimi

Takip linki için Firestore yolu:

```text
quoteAccess/{phoneHash}/codes/{trackingCode}
```

Bu yapıda özel link yalnızca takip kodunu taşır. Kullanıcı ayrıca talep formunda kullandığı telefon numarasını girer; tarayıcı telefonun SHA-256 özetini üretir ve ancak iki bilgi birlikte doğruysa erişim belgesinin yolu bulunur. Koleksiyon listeleme kapalı tutulmalıdır.

Tam uygulanabilir sürüm için sohbet içinde üretilen `firestore_garantili_teklif_takip.rules` dosyasını kullanın.
