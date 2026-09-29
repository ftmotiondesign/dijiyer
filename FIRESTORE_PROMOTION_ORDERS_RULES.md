# FIRESTORE - TANITIM SİPARİŞLERİ

Aşağıdaki blok, `match /databases/{database}/documents {` bloğunun içine eklenmelidir.

```firestore
match /promotionOrders/{orderId} {

  // Onaylı kurum yalnızca kendi adına sipariş oluşturabilir.
  allow create: if
    isApprovedInstitutionUser()
    && request.resource.data.keys().hasOnly([
      'orderCode',
      'institutionId',
      'userId',
      'institutionName',
      'serviceId',
      'serviceKey',
      'serviceName',
      'price',
      'priceLabel',
      'contactName',
      'phone',
      'note',
      'extras',
      'status',
      'paymentStatus',
      'createdAt',
      'updatedAt'
    ])
    && request.resource.data.orderCode is string
    && request.resource.data.orderCode.size() >= 10
    && request.resource.data.institutionId == linkedInstitutionId()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.institutionName is string
    && request.resource.data.serviceId is string
    && request.resource.data.serviceKey is string
    && request.resource.data.serviceName is string
    && request.resource.data.price is number
    && request.resource.data.price >= 0
    && request.resource.data.priceLabel is string
    && request.resource.data.contactName is string
    && request.resource.data.contactName.size() > 0
    && request.resource.data.contactName.size() <= 100
    && request.resource.data.phone is string
    && request.resource.data.note is string
    && request.resource.data.note.size() <= 1200
    && request.resource.data.extras is list
    && request.resource.data.status == 'new'
    && request.resource.data.paymentStatus == 'pending'
    && request.resource.data.createdAt is string
    && request.resource.data.updatedAt is string;

  // Admin tüm siparişleri; kurum yalnızca kendi siparişlerini okuyabilir.
  allow read: if
    isAdmin()
    ||
    (
      isApprovedInstitutionUser()
      && resource.data.institutionId == linkedInstitutionId()
    );

  // Sipariş durumu, ödeme ve fiyat yönetimi yalnızca admin tarafındadır.
  allow update, delete: if isAdmin();
}
```

Durum değerleri:
- new = Yeni Sipariş
- contacting = Görüşülüyor
- preparing = Hazırlanıyor
- approval = Onay Bekliyor
- completed = Tamamlandı

Ödeme:
- pending = Ödeme Bekliyor
- paid = Ödendi
