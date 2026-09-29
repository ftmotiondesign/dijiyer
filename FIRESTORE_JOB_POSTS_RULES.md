# Dijiyer – İş Fırsatları Firestore Rules

Bu blok, mevcut Firestore rules dosyanızdaki en sondaki catch-all
`match /{document=**} { allow read, write: if false; }` kuralından **önce**
eklenmelidir.

> Yeni ilan doğrudan yayınlanmaz. Kullanıcı yalnızca `pending` ilan oluşturur.
> Yönetici onaylayıp `published` yaptığında ilan herkese görünür.

```firestore
match /jobPosts/{jobId} {

  // Halka yalnızca onaylanmış ilanlar açık.
  allow get, list: if resource.data.status == "published";

  // Ziyaretçi sadece onaya düşen ilan oluşturabilir.
  allow create: if
    request.resource.data.keys().hasOnly([
      "type",
      "category",
      "categoryLabel",
      "title",
      "city",
      "district",
      "workMode",
      "wage",
      "description",
      "contactName",
      "phone",
      "durationDays",
      "expiresAt",
      "expiresAtTs",
      "status",
      "date",
      "createdAt"
    ])

    && request.resource.data.type in ["hire", "work"]

    && request.resource.data.category in [
      "yeme_servis",
      "usta_yardimci",
      "temizlik",
      "tasima_kurye",
      "satis_magaza",
      "evden_uretim",
      "dijital_ofis",
      "organizasyon",
      "bakim_egitim",
      "diger"
    ]

    && request.resource.data.categoryLabel is string
    && request.resource.data.categoryLabel.size() >= 2
    && request.resource.data.categoryLabel.size() <= 60

    && request.resource.data.title is string
    && request.resource.data.title.size() >= 5
    && request.resource.data.title.size() <= 100

    && request.resource.data.city is string
    && request.resource.data.city.size() >= 2
    && request.resource.data.city.size() <= 60

    && request.resource.data.district is string
    && request.resource.data.district.size() <= 60

    && request.resource.data.workMode is string
    && request.resource.data.workMode.size() >= 2
    && request.resource.data.workMode.size() <= 60

    && request.resource.data.wage is string
    && request.resource.data.wage.size() <= 80

    && request.resource.data.description is string
    && request.resource.data.description.size() >= 10
    && request.resource.data.description.size() <= 700

    && request.resource.data.contactName is string
    && request.resource.data.contactName.size() >= 2
    && request.resource.data.contactName.size() <= 80

    && request.resource.data.phone is string
    && request.resource.data.phone.size() >= 10
    && request.resource.data.phone.size() <= 12

    && request.resource.data.durationDays in [7, 15, 30]

    && request.resource.data.expiresAt is string
    && request.resource.data.expiresAtTs is timestamp
    && request.resource.data.expiresAtTs > request.time
    && request.resource.data.expiresAtTs <= request.time + duration.value(31, "d")

    && request.resource.data.status == "pending"
    && request.resource.data.date is string
    && request.resource.data.createdAt == request.time;

  // Onay / red / süre sonu yönetici kontrolündedir.
  allow update, delete: if isAdmin();
}
```

## Kategoriler

- `yeme_servis` – Yeme & Servis
- `usta_yardimci` – Usta & Yardımcı
- `temizlik` – Temizlik
- `tasima_kurye` – Taşıma & Kurye
- `satis_magaza` – Satış & Mağaza
- `evden_uretim` – Evden İş
- `dijital_ofis` – Dijital & Ofis
- `organizasyon` – Organizasyon
- `bakim_egitim` – Bakım & Eğitim
- `diger` – Diğer

## İlan durumları

- `pending`: Onay bekliyor, halka görünmez.
- `published`: Yayında.
- `rejected`: Reddedildi.
- `expired`: Süresi doldu.

## Profesyonel keşif akışı

Mobil İş Fırsatları alanı aynı anda şu filtreleri destekler:

- Anahtar kelime araması
- Eleman Arayan / İş Arayan
- Günlük / Ek İş
- Evden
- Part-time
- Bulunulan şehir
- Kategori filtresi
- Süresi dolmuş ilanları otomatik gizleme

İlan formunda kategori zorunludur ve yayın süresi 7, 15 veya 30 gün seçilir.
Telefon numarası ilan kartında metin olarak gösterilmez; iletişim butonunda WhatsApp
bağlantısı için kullanılır.
