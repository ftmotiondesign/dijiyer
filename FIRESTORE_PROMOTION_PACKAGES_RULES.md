# Firestore - Reklam Paket Yönetimi

Yönetim panelindeki **Reklam → Paket Yönetimi** ve kurum panelindeki dinamik paketlerin çalışması için
aşağıdaki kuralı `match /databases/{database}/documents {` bloğunun içine ekleyin.

```firestore
match /promotionPackages/{packageId} {

  // Yönetici paket oluşturabilir, düzenleyebilir, pasife alabilir ve silebilir.
  allow create, update, delete: if isAdmin();

  // Yönetici ve onaylı kurum hesapları paket kataloğunu okuyabilir.
  allow get, list: if
    isAdmin()
    || isApprovedInstitutionUser();
}
```

## Paket belgesi alanları

```text
serviceKey
name
badge
description
benefit
includes[]
basePrice
priceLabel
duration
delivery
revision
process
required
example
extras[] {
  name,
  price
}
featured
active
sortOrder
createdAt
updatedAt
```

Aktif paketler kurum panelindeki **Tanıtım Hizmetleri → Paketler** bölümüne otomatik yansır.
`active: false` yapılan paket kurumlara gösterilmez.

## İlk kurulum

Yönetim panelinde:

**Reklam → Paket Yönetimi → Mevcut 5 Paketi Aktar**

butonuna bir kez basarak mevcut statik paketleri Firestore paket kataloğuna aktarabilirsiniz.
