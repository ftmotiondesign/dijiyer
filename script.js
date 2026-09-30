const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wS18oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

let regionalBannerAds = [];
let regionalBannerUnsubscribe = null;
let regionalBannerTimer = null;
let regionalBannerIndex = 0;
let regionalBannerRegionFilter = "";
let regionalBannerSectorFilter = "";

let premiumShowcaseTimer = null;
let premiumShowcaseIndex = 0;
const PREMIUM_SHOWCASE_DURATION = 5500;

let pageTopMiniBannerTimer = null;
let pageTopMiniBannerIndex = 0;

const institutionSessionApp =
  firebase.apps.find(app => app.name === 'institutionSession') ||
  firebase.initializeApp(firebaseConfig, 'institutionSession');

const institutionAuth = firebase.auth(institutionSessionApp);

// ==========================================
// YARDIMCI KİLİT KONTROL FONKSİYONU
// ==========================================
function checkOfferLocked(offer) {
  if (!offer) return false;
  const status = (offer.durum || offer.status || "").toString().toLowerCase();
  return offer.kilitli === true || 
         offer.isLocked === true || 
         status === "kabuledildi" || 
         status === "onaylandi" || 
         status === "accepted";
}

// ==========================================
// MÜŞTERİ TARAFINDAN TEKLİF ONAYLAMA
// ==========================================
async function respondOfferAction(demandId, offerId, action) {
  if (!demandId || !offerId || !action) return;

  const isAccept = action === 'accept';
  const confirmText = isAccept
    ? 'Bu teklifi kabul etmek istiyor musunuz? Seçiminizle birlikte fiyat kilitlenecektir.'
    : 'Bu teklifi reddetmek istiyor musunuz?';

  if (!confirm(confirmText)) return;

  try {
    const demandRef = db.collection('demands').doc(demandId);
    const snap = await demandRef.get();

    if (!snap.exists) {
      alert('Talep kaydı bulunamadı.');
      return;
    }

    const data = snap.data() || {};
    const offers = Array.isArray(data.teklifler) ? data.teklifler : [];
    
    // İşlem yapılmak istenen teklifi bul
    const targetOffer = offers.find(o => String(o.id) === String(offerId));
    if (targetOffer && checkOfferLocked(targetOffer) && isAccept) {
      alert('Bu teklif zaten kabul edilmiş ve fiyatı kilitlenmiştir.');
      return;
    }

    const updatedOffers = offers.map(offer => {
      if (String(offer.id) === String(offerId)) {
        if (isAccept) {
          return {
            ...offer,
            durum: 'kabulEdildi',
            status: 'ACCEPTED',
            kilitli: true,
            isLocked: true,
            kabulTarihi: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } else {
          return {
            ...offer,
            durum: 'reddedildi',
            status: 'REJECTED',
            updatedAt: new Date().toISOString()
          };
        }
      }
      return offer;
    });

    const updatePayload = {
      teklifler: updatedOffers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (isAccept) {
      updatePayload.durum = 'kabulEdildi';
      updatePayload.kabulEdilenTeklifId = offerId;
      updatePayload.kilitli = true;
    }

    await demandRef.update(updatePayload);

    alert(isAccept ? 'Teklif kabul edildi ve fiyat kilitlendi!' : 'Teklif reddedildi.');
    
    // Müşteri ekranını anında güncelle
    if (typeof loadCustomerOffers === 'function') {
      loadCustomerOffers();
    } else {
      location.reload();
    }

  } catch (error) {
    console.error('Teklif yanıtlanırken hata oluştu:', error);
    alert('İşlem tamamlanamadı: ' + error.message);
  }
}

// ==========================================
// MÜŞTERİ TEKLİF LİSTESİ RENDER
// ==========================================
function renderOffersList(offers, demandId) {
  if (!offers || offers.length === 0) {
    return '<div class="no-offers">Henüz bu talebe gelen teklif bulunmuyor.</div>';
  }

  return offers.map(offer => {
    const isLocked = checkOfferLocked(offer);
    const isRejected = (offer.durum || '').toLowerCase() === 'reddedildi';

    return `
      <div class="offer-card-item ${isLocked ? 'offer-locked-card' : ''}" style="border:1px solid ${isLocked ? '#28a745' : '#ccc'}; padding:12px; margin-bottom:10px; border-radius:8px; background:${isLocked ? '#f4fbf7' : '#fff'};">
        <div style="display:flex; justify-between; align-items:center;">
          <strong>${offer.kurumAdi || 'İşletme'}</strong>
          <span style="font-size:18px; font-weight:bold; color:#2c3e50;">${offer.fiyat || offer.price || 0} TL</span>
        </div>
        <p style="margin:8px 0; color:#555;">${offer.aciklama || offer.description || 'Açıklama belirtilmedi.'}</p>
        
        ${isLocked ? `
          <div style="background:#d4edda; color:#155724; padding:8px 12px; border-radius:6px; font-weight:bold; text-align:center; margin-top:10px; border:1px solid #c3e6cb;">
            🔒 TEKLİF KABUL EDİLDİ VE FİYAT KİLİTLENDİ
            ${offer.kabulTarihi ? `<small style="display:block; font-weight:normal; font-size:11px; margin-top:2px;">Onay Zamanı: ${new Date(offer.kabulTarihi).toLocaleString('tr-TR')}</small>` : ''}
          </div>
        ` : isRejected ? `
          <div style="background:#f8d7da; color:#721c24; padding:6px; border-radius:6px; text-align:center; font-size:13px;">
            ❌ Bu teklif reddedildi.
          </div>
        ` : `
          <div style="display:flex; gap:10px; margin-top:10px;">
            <button onclick="respondOfferAction('${demandId}', '${offer.id}', 'accept')" style="flex:1; background:#28a745; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold;">
              Teklifi Kabul Et
            </button>
            <button onclick="respondOfferAction('${demandId}', '${offer.id}', 'reject')" style="background:#dc3545; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer;">
              Reddet
            </button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

// ==========================================
// KURUM PANELİ MODAL VE DÜZENLEME ENGELİ
// ==========================================
async function renderInstitutionModal(demandId) {
  try {
    const snap = await db.collection('demands').doc(demandId).get();
    if (!snap.exists) return;

    const demand = snap.data();
    const user = institutionAuth.currentUser;
    if (!user) return;

    const offers = Array.isArray(demand.teklifler) ? demand.teklifler : [];
    const myOffer = offers.find(o => o.kurumId === user.uid || o.institutionId === user.uid);
    const isLocked = myOffer && checkOfferLocked(myOffer);

    const modalBody = document.getElementById('institutionModalBody');
    if (!modalBody) return;

    let html = `
      <h3>${demand.baslik || 'Teklif Talebi'}</h3>
      <p><strong>Müşteri Detayı:</strong> ${demand.aciklama || ''}</p>
      <hr>
    `;

    if (isLocked) {
      // TEKLİF KABUL EDİLDİYSE FORM GİZLENİR VE BİLGİLENDİRME GÖSTERİLİR
      html += `
        <div style="background:#d4edda; border:2px solid #28a745; color:#155724; padding:15px; border-radius:8px; margin-bottom:15px;">
          <h4 style="margin:0 0 5px 0;">✓ TEKLİF MÜŞTERİ TARAFINDAN KABUL EDİLDİ</h4>
          <p style="margin:0; font-size:13px;">
            Müşteri bu teklifinizi onaylamıştır. Şartlar ve fiyat kilitlendiği için üzerinde değişiklik yapamazsınız.
          </p>
          <hr style="border:0; border-top:1px solid #c3e6cb; margin:10px 0;">
          <div><strong>Kilitlenen Fiyat:</strong> ${myOffer.fiyat || myOffer.price} TL</div>
          <div><strong>Teklif Notunuz:</strong> ${myOffer.aciklama || myOffer.description || '-'}</div>
        </div>
      `;
    } else {
      // HENÜZ KABUL EDİLMEDİYSE TEKLİF VERME / GÜNCELLEME FORMU AÇIK KALIR
      html += `
        <form id="institutionOfferForm" onsubmit="submitInstitutionOffer(event, '${demandId}')">
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Verilen Fiyat (TL):</label>
          <input type="number" id="offerPriceInput" value="${myOffer ? (myOffer.fiyat || myOffer.price) : ''}" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
          
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Teklif Notu / Şartlar:</label>
          <textarea id="offerDescInput" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;" rows="3">${myOffer ? (myOffer.aciklama || myOffer.description) : ''}</textarea>
          
          <button type="submit" style="width:100%; background:#007bff; color:#fff; border:none; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">
            ${myOffer ? 'Teklifi Güncelle' : 'Teklif Gönder'}
          </button>
        </form>
      `;
    }

    modalBody.innerHTML = html;

  } catch (error) {
    console.error('Kurum modalı yüklenirken hata:', error);
  }
}

// ==========================================
// KURUM TEKLİF GÖNDERME / GÜNCELLEME (GÜVENLİK KONTROLÜ)
// ==========================================
async function submitInstitutionOffer(event, demandId) {
  event.preventDefault();

  const user = institutionAuth.currentUser;
  if (!user) {
    alert('Lütfen kurum girişi yapın.');
    return;
  }

  const price = document.getElementById('offerPriceInput').value;
  const description = document.getElementById('offerDescInput').value;

  try {
    const demandRef = db.collection('demands').doc(demandId);
    const snap = await demandRef.get();

    if (!snap.exists) {
      alert('Talep bulunamadı.');
      return;
    }

    const demand = snap.data();
    const offers = Array.isArray(demand.teklifler) ? demand.teklifler : [];
    
    // Kurumun varolan teklifini bul
    const existingOfferIndex = offers.findIndex(o => o.kurumId === user.uid || o.institutionId === user.uid);
    
    if (existingOfferIndex > -1) {
      const existingOffer = offers[existingOfferIndex];
      // Güvenlik Engeli: Eğer teklif kilitliyse güncellemeye izin verme
      if (checkOfferLocked(existingOffer)) {
        alert('Bu teklif müşteri tarafından kabul edildiği için değiştiremezsiniz!');
        return;
      }

      offers[existingOfferIndex] = {
        ...existingOffer,
        fiyat: price,
        price: price,
        aciklama: description,
        description: description,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Yeni Teklif Ekle
      offers.push({
        id: 'off_' + Date.now(),
        kurumId: user.uid,
        institutionId: user.uid,
        kurumAdi: user.displayName || 'İşletme',
        fiyat: price,
        price: price,
        aciklama: description,
        description: description,
        durum: 'bekliyor',
        status: 'PENDING',
        kilitli: false,
        createdAt: new Date().toISOString()
      });
    }

    await demandRef.update({
      teklifler: offers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('Teklifiniz başarıyla iletildi.');
    renderInstitutionModal(demandId);

  } catch (error) {
    console.error('Teklif gönderilirken hata:', error);
    alert('Teklif iletilemedi: ' + error.message);
  }
}
