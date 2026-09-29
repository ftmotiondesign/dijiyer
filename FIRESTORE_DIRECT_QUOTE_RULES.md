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
