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
  // Müşteri takip ekranında teklifleri okuyabilir; teklif belgelerinde müşteri telefon/ad bilgisi tutulmaz.
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
      "validityHours",
      "registrationRequired",
      "platformPayment",
      "paymentPolicy",
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
    && request.resource.data.validityHours is number
    && request.resource.data.validityHours > 0
    && request.resource.data.registrationRequired == true
    && request.resource.data.platformPayment == false
    && request.resource.data.paymentPolicy == "offline_direct_between_customer_and_institution"
    && request.resource.data.expiresAtTs is timestamp
    && request.resource.data.expiresAtTs > request.time;

  // Müşteri teklifi kabul ettikten sonra kurum fiyat ve şartları değiştiremez.
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
      "validityHours",
      "registrationRequired",
      "platformPayment",
      "paymentPolicy",
      "updatedAt"
    ])
    && request.resource.data.registrationRequired == true
    && request.resource.data.platformPayment == false
    && request.resource.data.paymentPolicy == "offline_direct_between_customer_and_institution"
    && request.resource.data.expiresAtTs > request.time;

  allow delete: if isAdmin();
}
```
## 3) Müşterinin doğrulanmış teklif kabulü ve gerçek kayıt

```firestore
match /quoteRequests/{quoteId}/locks/{lockId} {
  allow get: if lockId == "main";
  allow list: if false;

  // Aynı talepte yalnızca bir ana kabul kaydı oluşturulur.
  // Kabul, takip kodu + telefon özetinin ait olduğu quoteAccess kaydına bağlanır.
  allow create: if lockId == "main"
    && !exists(/databases/$(database)/documents/quoteRequests/$(quoteId)/locks/main)
    && request.resource.data.keys().hasOnly([
      "quoteId",
      "institutionId",
      "institutionName",
      "offerCode",
      "price",
      "lockedPrice",
      "vatStatus",
      "scope",
      "lockedScope",
      "conditions",
      "extraFee",
      "offerCreatedAt",
      "offerUpdatedAt",
      "offerVersion",
      "offerSnapshotVersion",
      "trackingCode",
      "phoneHash",
      "acceptanceConsent",
      "status",
      "registrationStatus",
      "acceptedAt",
      "acceptedAtTs",
      "lockedAt",
      "lockedAtTs",
      "expiresAt",
      "expiresAtTs",
      "registrationDeadlineAt",
      "registrationDeadlineAtTs",
      "platformPayment",
      "paymentPolicy"
    ])
    && request.resource.data.quoteId == quoteId
    && request.resource.data.status == "locked"
    && request.resource.data.registrationStatus == "pending"
    && request.resource.data.acceptanceConsent == true
    && request.resource.data.offerSnapshotVersion == 1
    && request.resource.data.platformPayment == false
    && request.resource.data.paymentPolicy == "offline_direct_between_customer_and_institution"
    && request.resource.data.acceptedAtTs == request.time
    && request.resource.data.lockedAtTs == request.time
    && request.resource.data.trackingCode is string
    && request.resource.data.trackingCode.size() > 0
    && request.resource.data.phoneHash is string
    && request.resource.data.phoneHash.size() > 0
    && exists(
      /databases/$(database)/documents/quoteAccess/$(request.resource.data.phoneHash)/codes/$(request.resource.data.trackingCode)
    )
    && get(
      /databases/$(database)/documents/quoteAccess/$(request.resource.data.phoneHash)/codes/$(request.resource.data.trackingCode)
    ).data.quoteId == quoteId
    && get(
      /databases/$(database)/documents/quoteAccess/$(request.resource.data.phoneHash)/codes/$(request.resource.data.trackingCode)
    ).data.phoneHash == request.resource.data.phoneHash
    && get(
      /databases/$(database)/documents/quoteAccess/$(request.resource.data.phoneHash)/codes/$(request.resource.data.trackingCode)
    ).data.trackingCode == request.resource.data.trackingCode
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
    && request.resource.data.offerCreatedAt ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.createdAt
    && request.resource.data.offerUpdatedAt ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.updatedAt
    && request.resource.data.offerVersion ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.updatedAt
    && request.resource.data.expiresAt ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.expiresAt
    && request.resource.data.expiresAtTs ==
      get(/databases/$(database)/documents/quoteRequests/$(quoteId)/offers/$(request.resource.data.institutionId)).data.expiresAtTs
    && request.resource.data.registrationDeadlineAt == request.resource.data.expiresAt
    && request.resource.data.registrationDeadlineAtTs == request.resource.data.expiresAtTs
    && request.time < request.resource.data.expiresAtTs;

  // Yalnızca teklifi veren onaylı kurum, süre dolmadan gerçek kaydı tamamlandı yapabilir.
  allow update: if lockId == "main"
    && isApprovedInstitutionUser()
    && currentInstitutionId() == resource.data.institutionId
    && resource.data.status == "locked"
    && resource.data.registrationStatus == "pending"
    && request.resource.data.status == "used"
    && request.resource.data.registrationStatus == "completed"
    && request.resource.data.registrationCompletedAtTs == request.time
    && request.resource.data.usedAtTs == request.time
    && request.time < resource.data.registrationDeadlineAtTs
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      "status",
      "registrationStatus",
      "registrationCompletedAt",
      "registrationCompletedAtTs",
      "usedAt",
      "usedAtTs"
    ]);

  allow delete: if isAdmin();
}
```
> **Ödeme politikası:** Bu kurallar Dijiyer içinde ödeme/kapora alanı açmaz. `platformPayment == false` ve sabit `paymentPolicy` alanı kabul ve teklif kayıtlarında zorunlu tutulur. Gerçek ödeme ve kayıt işlemi müşteri ile kurum arasında doğrudan yapılır.

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

### Takip ekranında “Missing or insufficient permissions” hatası için gerekli okuma bloğu

Aşağıdaki blokları mevcut Firestore Rules içinde, en sondaki genel reddetme/catch-all kuralından **önce** ekleyin. Bunlar yalnızca takip ekranının ihtiyaç duyduğu okuma izinlerini açar; mevcut create/update kurallarına dokunmaz.

```firestore
match /quoteAccess/{phoneHash}/codes/{trackingCode} {
  allow get: if resource.data.phoneHash == phoneHash
    && resource.data.trackingCode == trackingCode;
  allow list: if false;
}

match /quoteRequests/{quoteId}/offers/{institutionId} {
  allow get, list: if true;
}

match /quoteRequests/{quoteId}/locks/{lockId} {
  allow get: if lockId == "main";
  allow list: if false;
}

match /quoteRequests/{quoteId}/engagement/{institutionId} {
  // Bu koleksiyonda müşterinin adı veya telefonu tutulmaz.
  // Takip ekranı kurumların ilgileniyor / teklif veremiyor durumunu özetler.
  allow get, list: if true;
}
```

Not: `quoteAccess` belgesinin oluşturulması zaten çalışıyorsa mevcut `allow create` kuralınızı değiştirmeyin. Yukarıdaki bloklar testte görülen **okuma** hatasını çözmek içindir.

## 7) Teklif Takip Pro: mesajlaşma, revizyon ve görüntülenme

Yeni müşteri/firma iletişim yolları:

```text
quoteRequests/{quoteId}/engagement/{institutionId}
quoteRequests/{quoteId}/conversations/{institutionId}/messages/{messageId}
```

- `engagement`: teklif görüntülendi, revizyon istendi ve revizyon yanıtlandı durumlarını tutar.
- `messages`: müşteri ile teklif veren kurumun teklif bazlı mesajlarını tutar.
- Müşteri teklifleri karşılaştırabilir, mesaj gönderebilir, revizyon isteyebilir ve süreç zaman çizgisini görebilir.
- Kurum paneli teklifin görüntülenme bilgisini, revizyon bekleme durumunu ve mesajları gösterir.
- Kurum revizyon talebinden sonra teklifi güncellediğinde müşteriye otomatik revizyon yanıtı oluşturulur.

Güncel tam Rules dosyası: `firestore_teklif_takip_pro.rules` sürümüdür.


## 8) Bulunamayan Aramalar

Teklif Al sayfasında kullanıcı bir hizmet/kategori arayıp sonuç bulamadığında, kategori yapısını gerçek aramalara göre geliştirebilmek için yalnızca sınırlı arama verisi kaydedilir.

Firestore yolu:

```text
unmatchedSearches/{searchId}
```

Bu blok mevcut `match /databases/{database}/documents { ... }` yapısında, en sondaki catch-all kuralından **önce** eklenmelidir:

```firestore
match /unmatchedSearches/{searchId} {
  allow create: if request.resource.data.keys().hasOnly([
      "query",
      "normalizedQuery",
      "mainCategory",
      "mainCategoryLabel",
      "city",
      "district",
      "resultCount",
      "reason",
      "suggestionLabels",
      "status",
      "source",
      "createdAt"
    ])
    && request.resource.data.query is string
    && request.resource.data.query.size() >= 2
    && request.resource.data.query.size() <= 160
    && request.resource.data.normalizedQuery is string
    && request.resource.data.mainCategory is string
    && request.resource.data.mainCategoryLabel is string
    && request.resource.data.city is string
    && request.resource.data.district is string
    && request.resource.data.resultCount is number
    && request.resource.data.resultCount >= 0
    && request.resource.data.reason in [
      "category_not_found",
      "no_institution_result"
    ]
    && request.resource.data.suggestionLabels is list
    && request.resource.data.suggestionLabels.size() <= 3
    && request.resource.data.status == "new"
    && request.resource.data.source == "teklif-al"
    && request.resource.data.createdAt is string;

  allow read, update, delete: if isAdmin();
}
```

Bu kayıtlar telefon, ad-soyad veya serbest teklif notu içermez; yalnızca arama kelimesi, kategori bağlamı, yaklaşık seçili il/ilçe ve öneri etiketleri tutulur.
