# Firestore - Banner Reklamları

Dijiyer **Reklam Merkezi / Yayın Alanları** bölümünün çalışması için bu kuralı
Firebase Console > Firestore Database > Rules içinde,
`match /databases/{database}/documents {` bloğunun içine ekleyin.

> Not: Mevcut `isAdmin()` fonksiyonunuzu koruyun. Bu blok en sondaki genel
> `match /{document=**}` kapatma kuralından önce olmalıdır.

```firestore
match /bannerAds/{bannerId} {

  // Yönetici banner oluşturabilir, güncelleyebilir ve silebilir.
  allow create, update, delete: if isAdmin();

  // Yönetici bütün reklamları; ziyaretçi yalnızca aktif reklamları okuyabilir.
  allow read: if
    isAdmin()
    || resource.data.active == true;
}
```

## Gösterim yeri değerleri

Yönetim paneli şu `placement` değerlerini kullanır:

```text
search
home_sponsor
premium_home
mobile_sponsor
sidebar_sponsor
detail_banner
page_top_mini
```

Yeni eklenen:

```text
page_top_mini = Teklif Al / İş Fırsatları / Bayi & Servis sayfalarının üstündeki mini sponsor bannerı
```

Eğer mevcut Firestore kuralınızda `placement` için ayrıca bir izin listesi varsa,
listeye mutlaka `"page_top_mini"` ekleyin.

Örnek:

```firestore
request.resource.data.placement in [
  "search",
  "home_sponsor",
  "premium_home",
  "mobile_sponsor",
  "sidebar_sponsor",
  "detail_banner",
  "page_top_mini"
]
```

## Banner belgesinde kullanılan alanlar

Yönetim paneli aşağıdaki alanları yazabilir:

```text
adCode
institutionId
institutionName
logoUrl
headline
text
mediaType
imageUrl
videoUrl
city
district
category
categoryLabel
durationSeconds
salePrice
paymentStatus
paidAt
placement
startAt
endAt
active
sourceOrderId
sourceOrderCode
createdAt
updatedAt
```

Eğer Firestore Rules içinde `keys().hasOnly([...])` ile alan kısıtlaması yapıyorsanız,
yukarıdaki alanların tamamının izin listesinde bulunması gerekir.

## Public sorgu

Site aktif bannerları şu şekilde dinler:

```javascript
db.collection("bannerAds")
  .where("active","==",true)
```

Hedefleme mantığı:
- city + district boşsa: tüm bölgelerde
- city dolu, district boşsa: şehrin tamamında
- city + district doluysa: ilgili ilçede
- category boşsa: tüm sektörlerde
- category doluysa: ilgili sektörde
- placement: reklamın gösterileceği alanı belirler
