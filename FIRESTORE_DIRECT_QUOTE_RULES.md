# Dijiyer – Doğrudan Kurum Teklifi Firestore Rules

Kurum profilindeki **“Bu Kurumdan Teklif Al”** akışının çalışması için iki kural güncellemesi gerekir.

## 1) quoteRequests bloğunu bununla değiştir

```firestore
match /quoteRequests/{documentId} {

  allow create: if
    request.resource.data.keys().hasOnly([
      'mainCategory',
      'subCategory',
      'category',
      'service',
      'city',
      'district',
      'name',
      'phone',
      'email',
      'note',
      'status',
      'date',
      'targetInstitutionId',
      'targetInstitutionName'
    ])
    && request.resource.data.mainCategory is string
    && request.resource.data.subCategory is string
    && request.resource.data.category is string
    && request.resource.data['service'] is string
    && request.resource.data.city is string
    && request.resource.data.district is string
    && request.resource.data.name is string
    && request.resource.data.phone is string
    && request.resource.data.email is string
    && request.resource.data.email.size() >= 5
    && request.resource.data.email.size() <= 160
    && request.resource.data.note is string
    && request.resource.data.status == 'new'
    && request.resource.data.date is string

    && (
      !request.resource.data.keys().hasAny([
        'targetInstitutionId',
        'targetInstitutionName'
      ])

      ||

      (
        request.resource.data.keys().hasAll([
          'targetInstitutionId',
          'targetInstitutionName'
        ])
        && request.resource.data.targetInstitutionId is string
        && request.resource.data.targetInstitutionId.size() > 0
        && request.resource.data.targetInstitutionName is string
        && request.resource.data.targetInstitutionName.size() > 0
        && request.resource.data.city == '__direct__'
        && exists(
          /databases/$(database)/documents/institutions/$(request.resource.data.targetInstitutionId)
        )
      )
    );

  allow read: if
    isAdmin()
    ||
    (
      isApprovedInstitutionUser()
      &&
      (
        (
          resource.data.keys().hasAll(['targetInstitutionId'])
          && resource.data.targetInstitutionId == linkedInstitutionId()
        )

        ||

        (
          resource.data.category == linkedInstitution().category
          && resource.data.city == linkedInstitution().city
          && (
            resource.data.district == ''
            ||
            resource.data.district == linkedInstitution().district
          )
        )
      )
    );

  allow update, delete: if isAdmin();
}
```

Normal toplu teklifler eski haliyle çalışmaya devam eder. Doğrudan kurum taleplerinde
`city = "__direct__"` kullanıldığı için normal konum sorgularına karışmaz; hedef kurum
ise `targetInstitutionId` üzerinden talebi görür.

## 2) Mesajlaşma kuralındaki kurum eşleşmesini genişlet

Mevcut:

```firestore
&& get(
  /databases/$(database)/documents/quoteRequests/$(quoteId)
).data.category == linkedInstitution().category

&& get(
  /databases/$(database)/documents/quoteRequests/$(quoteId)
).data.city == linkedInstitution().city

&& (
  get(
    /databases/$(database)/documents/quoteRequests/$(quoteId)
  ).data.district == ''
  ||
  get(
    /databases/$(database)/documents/quoteRequests/$(quoteId)
  ).data.district == linkedInstitution().district
)
```

yerine:

```firestore
&& (
  (
    get(
      /databases/$(database)/documents/quoteRequests/$(quoteId)
    ).data.keys().hasAll(['targetInstitutionId'])

    && get(
      /databases/$(database)/documents/quoteRequests/$(quoteId)
    ).data.targetInstitutionId == linkedInstitutionId()
  )

  ||

  (
    get(
      /databases/$(database)/documents/quoteRequests/$(quoteId)
    ).data.category == linkedInstitution().category

    && get(
      /databases/$(database)/documents/quoteRequests/$(quoteId)
    ).data.city == linkedInstitution().city

    && (
      get(
        /databases/$(database)/documents/quoteRequests/$(quoteId)
      ).data.district == ''
      ||
      get(
        /databases/$(database)/documents/quoteRequests/$(quoteId)
      ).data.district == linkedInstitution().district
    )
  )
)
```

kullanılmalıdır.

## 3) Müşteriye kurum yanıtı bildirimi

Kurumun **İlgileniyorum / İlgilenmiyorum** seçimi müşterinin teklif takip ekranına
`quoteRequests/{quoteId}/engagement/{institutionId}` üzerinden aktarılır.

Engagement belgesinde müşteri adı veya telefon tutulmaz. Kullanılan alanlar:

- `institutionId`
- `institutionName`
- `institutionResponse` (`interested` / `not_interested`)
- `institutionResponseAt`
- `lastInstitutionActionAt`

Müşteri takip ekranı toplu durum özetini gösterebilmek için engagement koleksiyonunu
listeleyebilir. Kurum ise yalnızca kendi engagement belgesindeki kurum yanıt alanlarını
yazabilir/değiştirebilir.

## 4) Doğrudan talebin takip kaydı

`quoteAccess/{phoneHash}/codes/{trackingCode}` için izin verilen alanlara opsiyonel olarak
`targetInstitutionId` ve `targetInstitutionName` eklenir. Bu iki alan ana quoteRequests
belgesindeki hedef kurumla eşleşmelidir.

Tam tek parça güncel kural dosyası: `firestore_rules_musteri_bildirim_guncel.rules`.
