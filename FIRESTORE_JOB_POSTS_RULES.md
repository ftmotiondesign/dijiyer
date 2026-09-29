# Dijiyer – İş Fırsatları Firestore Rules

Bu blok, mevcut Firestore rules dosyanızdaki en sondaki catch-all
`match /{document=**} { allow read, write: if false; }` kuralından **önce**
eklenmelidir.

> Not: Aşağıdaki kural yeni ilanları doğrudan yayınlamaz. Kullanıcı ilanı
> `pending` durumuyla gönderir. Yalnızca `published` ilanlar herkese görünür.
> Yönetici Firebase Console veya ileride eklenecek yönetim panelinden ilanı
> `published` yapabilir.

```firestore
match /jobPosts/{jobId} {

  // Ziyaretçiler yalnızca onaylanmış/yayındaki ilanları okuyabilir.
  allow get, list: if resource.data.status == "published";

  // Herkes ilanı yalnızca "pending" durumuyla gönderebilir.
  allow create: if
    request.resource.data.keys().hasOnly([
      "type",
      "title",
      "city",
      "district",
      "workMode",
      "wage",
      "description",
      "contactName",
      "phone",
      "status",
      "date",
      "createdAt"
    ])
    && request.resource.data.type in ["hire", "work"]
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
    && request.resource.data.status == "pending"
    && request.resource.data.date is string
    && request.resource.data.createdAt == request.time;

  // İlan onayı, düzenleme ve silme yalnızca yöneticide.
  allow update, delete: if isAdmin();
}
```

## İlan durumları

- `pending`: Onay bekliyor, halka görünmez.
- `published`: Yayında, İş Fırsatları bölümünde görünür.
- `rejected`: Reddedildi.
- `expired`: Süresi doldu.

## Mevcut mobil akış

- **Eleman Arıyorum**: işletme veya kişi yardımcı/çalışan arar.
- **İş Arıyorum**: kullanıcı yapabileceği işleri ve müsaitliğini paylaşır.
- **Günlük / Ek İş**: çalışma şekli filtresidir.
- Telefon numarası kart üzerinde yazı olarak gösterilmez; iletişim butonunda WhatsApp için kullanılır.
