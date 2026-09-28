# Dijiyer Destek Merkezi – Firestore Rules

Bu blok, mevcut Firestore Rules dosyanızda:

```firestore
service cloud.firestore {
  match /databases/{database}/documents {
    ...
  }
}
```

yapısının içine, en sondaki catch-all deny kuralından **önce** eklenmelidir.

Mevcut `isAdmin()`, `isApprovedInstitutionUser()` ve `currentInstitutionId()`
fonksiyonlarınızı koruyun.

## Destek talepleri

```firestore
match /supportTickets/{ticketId} {
  // Onaylı kurum yalnızca kendi kurum adına destek talebi oluşturabilir.
  allow create: if isApprovedInstitutionUser()
    && request.resource.data.institutionId == currentInstitutionId()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.status == "new"
    && request.resource.data.category is string
    && request.resource.data.subject is string
    && request.resource.data.message is string
    && request.resource.data.subject.size() > 0
    && request.resource.data.subject.size() <= 120
    && request.resource.data.message.size() > 0
    && request.resource.data.message.size() <= 1500
    && request.resource.data.keys().hasOnly([
      "institutionId",
      "userId",
      "institutionName",
      "email",
      "category",
      "subject",
      "message",
      "status",
      "date",
      "updatedAt",
      "adminReply",
      "adminReplyAt",
      "relatedRequestId",
      "relatedService",
      "relatedLocation",
      "relatedRequestDate",
      "relatedOfferCode",
      "relatedOfferPrice",
      "relatedOfferStatus",
      "relatedOfferStatusLabel"
    ]);

  // Kurum yalnızca kendi destek taleplerini okuyabilir.
  allow get, list: if isApprovedInstitutionUser()
    && resource.data.institutionId == currentInstitutionId();

  // Destek talebinin durumunu ve yönetici yanıtını yalnızca admin değiştirebilir.
  allow update: if isAdmin()
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      "status",
      "adminReply",
      "adminReplyAt",
      "updatedAt"
    ]);

  allow delete: if isAdmin();
}
```

## Not

Destek talebi artık teklif/talep kaydıyla ilişkilendirilebildiği için
`relatedRequestId`, `relatedOfferCode`, `relatedOfferPrice` vb. alanlar da
izin verilen alanlar listesine dahil edilmiştir.

Bu alanlar yalnızca kurum panelinden gönderilen destek kaydına açıklayıcı bağ
ekler; teklif veya müşteri kaydını değiştirme yetkisi vermez.
