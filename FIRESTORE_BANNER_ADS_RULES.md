# Firestore - Bölgesel Banner Reklamları

Ana sayfadaki sponsorlu banner alanının ve yönetim panelindeki **Reklam → Banner Reklamları**
bölümünün çalışması için aşağıdaki kuralı
`match /databases/{database}/documents {` bloğunun içine ekleyin.

```firestore
match /bannerAds/{bannerId} {

  // Yönetim tüm banner reklamlarını oluşturabilir, düzenleyebilir ve silebilir.
  allow create, update, delete: if isAdmin();

  // Yönetim bütün kayıtları görebilir.
  // Ziyaretçiler sadece aktif reklamları okuyabilir.
  allow get: if isAdmin() || resource.data.active == true;

  allow list: if
    isAdmin()
    ||
    (
      resource.data.active == true
      && request.query.limit <= 100
    );
}
```

Ana sayfa sorgusu:

```javascript
db.collection("bannerAds")
  .where("active","==",true)
```

şeklinde çalışır.

## Banner belgesi alanları

```text
adCode
institutionId
institutionName
logoUrl

headline
text
imageUrl

city
district
category
categoryLabel

durationSeconds   // 3 veya 5
startAt           // YYYY-MM-DD veya boş
endAt             // YYYY-MM-DD veya boş

active
createdAt
updatedAt
```

Hedefleme mantığı:
- city + district boşsa: tüm bölgelerde
- city dolu, district boşsa: şehrin tamamında
- city + district doluysa: ilgili ilçede
- category boşsa: tüm sektörlerde
- category doluysa: ilgili sektörde

Kullanıcı ana sayfada filtre seçmezse aktif bannerlar sırayla döner.
Bölge veya sektör seçerse seçime uygun bannerlar gösterilir.
