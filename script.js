const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wS18oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

// Firebase Başlatma
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Kurum Oturumu İçin İkinci Uygulama
const institutionSessionApp =
  firebase.apps.find(app => app.name === 'institutionSession') ||
  firebase.initializeApp(firebaseConfig, 'institutionSession');

const institutionAuth = firebase.auth(institutionSessionApp);

// ==========================================
// KOTA VE BELLEK KORUMA DEĞİŞKENLERİ
// ==========================================
let regionalBannerAds = [];
let regionalBannerUnsubscribe = null; // Listener referansı
let regionalBannerTimer = null;       // Timer referansı
let regionalBannerIndex = 0;
let regionalBannerRegionFilter = "";
let regionalBannerSectorFilter = "";

let premiumShowcaseTimer = null;
let premiumShowcaseIndex = 0;
const PREMIUM_SHOWCASE_DURATION = 5500;

let pageTopMiniBannerTimer = null;
let pageTopMiniBannerIndex = 0;

// ==========================================
// 1. DİNLEYİCİ VE TIMER TEMİZLEME YÖNETİMİ
// ==========================================

// Banners veya diğer koleksiyonları dinlerken eski dinleyiciyi kapatır
function stopRegionalBannerListener() {
  if (regionalBannerUnsubscribe) {
    regionalBannerUnsubscribe();
    regionalBannerUnsubscribe = null;
  }
}

// Timer birikmesini engeller
function stopBannerTimer() {
  if (regionalBannerTimer) {
    clearInterval(regionalBannerTimer);
    regionalBannerTimer = null;
  }
}

function startBannerAutoSlide() {
  stopBannerTimer(); // Önceki zamanlayıcıyı temizle
  regionalBannerTimer = setInterval(() => {
    if (regionalBannerAds.length > 0) {
      regionalBannerIndex = (regionalBannerIndex + 1) % regionalBannerAds.length;
      // Banner geçiş tetikleyicisi
    }
  }, 5000);
}

// ==========================================
// 2. MERKEZİ KİLİT KONTROLÜ
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
// 3. MÜŞTERİ TEKLİF ONAYLAMA (TEK SEFERLİK GET SORGUSU)
// ==========================================
async function respondOfferAction(demandId, offerId, action) {
  if (!demandId || !offerId) {
    alert("Hata: Talep veya Teklif kimliği bulunamadı.");
    return;
  }

  const isAccept = action === 'accept' || action === 'kabul';
  const confirmMessage = isAccept
    ? 'Bu teklifi kabul etmek istiyor musunuz? Seçiminiz sonrasında fiyat ve şartlar kilitlenecektir.'
    : 'Bu teklifi reddetmek istiyor musunuz?';

  if (!confirm(confirmMessage)) return;

  try {
    const demandRef = db.collection('demands').doc(demandId);
    // Kota tasarrufu için tek seferlik .get() kullanımı
    const snap = await demandRef.get();

    if (!snap.exists) {
      alert('Talep kaydı veritabanında bulunamadı.');
      return;
    }

    const data = snap.data() || {};
    const rawOffers = data.teklifler || data.offers || [];
    const offers = Array.isArray(rawOffers) ? rawOffers : [];
    
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
      offers: updatedOffers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (isAccept) {
      updatePayload.durum = 'kabulEdildi';
      updatePayload.status = 'ACCEPTED';
      updatePayload.kabulEdilenTeklifId = offerId;
      updatePayload.kilitli = true;
      updatePayload.isLocked = true;
    }

    await demandRef.update(updatePayload);

    alert(isAccept ? 'Teklif başarıyla kabul edildi ve fiyat kilitlendi!' : 'Teklif reddedildi.');
    
    if (typeof loadCustomerOffers === 'function') {
      loadCustomerOffers();
    } else {
      location.reload();
    }

  } catch (error) {
    console.error('Teklif kilitleme hatası:', error);
    alert('İşlem başarısız: ' + error.message);
  }
}

// Geriye dönük uyumluluk için
function acceptOffer(demandId, offerId) { respondOfferAction(demandId, offerId, 'accept'); }
function kabulEt(demandId, offerId) { respondOfferAction(demandId, offerId, 'accept'); }

// ==========================================
// 4. MÜŞTERİ TEKLİF KARTLARI RENDER
// ==========================================
function renderOffersList(offers, demandId) {
  if (!offers || offers.length === 0) {
    return '<div class="no-offers">Henüz bu talebe gelen teklif bulunmuyor.</div>';
  }

  return offers.map(offer => {
    const isLocked = checkOfferLocked(offer);
    const isRejected = (offer.durum || offer.status || '').toLowerCase() === 'reddedildi' || (offer.durum || offer.status || '').toLowerCase() === 'rejected';

    return `
      <div class="offer-card-item ${isLocked ? 'offer-locked-card' : ''}" style="border:2px solid ${isLocked ? '#28a745' : '#e2e8f0'}; padding:15px; margin-bottom:12px; border-radius:10px; background:${isLocked ? '#f0fff4' : '#ffffff'}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:16px; color:#2d3748;">${offer.kurumAdi || offer.companyName || 'İşletme'}</strong>
          <span style="font-size:20px; font-weight:bold; color:#2b6cb0;">${offer.fiyat || offer.price || 0} TL</span>
        </div>
        <p style="margin:10px 0; color:#4a5568; font-size:14px;">${offer.aciklama || offer.description || 'Açıklama belirtilmedi.'}</p>
        
        ${isLocked ? `
          <div style="background:#c6f6d5; color:#22543d; padding:10px; border-radius:8px; font-weight:bold; text-align:center; margin-top:10px; border:1px solid #9ae6b4;">
            🔒 TEKLİF KABUL EDİLDİ (FİYAT KİLİTLENDİ)
            ${offer.kabulTarihi ? `<small style="display:block; font-weight:normal; font-size:11px; margin-top:3px; color:#276749;">Onay Zamanı: ${new Date(offer.kabulTarihi).toLocaleString('tr-TR')}</small>` : ''}
          </div>
        ` : isRejected ? `
          <div style="background:#fed7d7; color:#9b2c2c; padding:8px; border-radius:6px; text-align:center; font-size:13px;">
            ❌ Bu teklif reddedildi.
          </div>
        ` : `
          <div style="display:flex; gap:10px; margin-top:12px;">
            <button onclick="respondOfferAction('${demandId}', '${offer.id}', 'accept')" style="flex:1; background:#38a169; color:#fff; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px;">
              Teklifi Kabul Et
            </button>
            <button onclick="respondOfferAction('${demandId}', '${offer.id}', 'reject')" style="background:#e53e3e; color:#fff; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-size:14px;">
              Reddet
            </button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

// ==========================================
// 5. KURUM PANELİ MODAL VE DÜZENLEME KİLİDİ
// ==========================================
async function renderInstitutionModal(demandId) {
  try {
    const user = institutionAuth.currentUser;
    // Oturum yoksa Firestore'a erişim isteği atıp kotayı tüketme
    if (!user) return;

    const snap = await db.collection('demands').doc(demandId).get();
    if (!snap.exists) return;

    const demand = snap.data();
    const rawOffers = demand.teklifler || demand.offers || [];
    const offers = Array.isArray(rawOffers) ? rawOffers : [];
    const myOffer = offers.find(o => o.kurumId === user.uid || o.institutionId === user.uid);
    const isLocked = myOffer && checkOfferLocked(myOffer);

    const modalBody = document.getElementById('institutionModalBody');
    if (!modalBody) return;

    let html = `
      <h3>${demand.baslik || 'Teklif Talebi'}</h3>
      <p><strong>Müşteri Talebi:</strong> ${demand.aciklama || ''}</p>
      <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
    `;

    if (isLocked) {
      html += `
        <div style="background:#f0fff4; border:2px solid #38a169; color:#276749; padding:15px; border-radius:8px; margin-bottom:15px;">
          <h4 style="margin:0 0 5px 0; color:#22543d;">✓ TEKLİF MÜŞTERİ TARAFINDAN KABUL EDİLDİ</h4>
          <p style="margin:0; font-size:13px; color:#2f855a;">
            Bu teklif müşteri tarafından onaylandığı için şartlar kilitlenmiştir. Fiyat veya açıklama değiştirilemez.
          </p>
          <hr style="border:0; border-top:1px solid #c6f6d5; margin:10px 0;">
          <div><strong>Kilitlenen Fiyat:</strong> ${myOffer.fiyat || myOffer.price} TL</div>
          <div><strong>Teklif Notunuz:</strong> ${myOffer.aciklama || myOffer.description || '-'}</div>
        </div>
      `;
    } else {
      html += `
        <form id="institutionOfferForm" onsubmit="submitInstitutionOffer(event, '${demandId}')">
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Verilen Fiyat (TL):</label>
          <input type="number" id="offerPriceInput" value="${myOffer ? (myOffer.fiyat || myOffer.price) : ''}" required style="width:100%; padding:10px; margin-bottom:12px; border:1px solid #cbd5e0; border-radius:6px;">
          
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Teklif Notu / Şartlar:</label>
          <textarea id="offerDescInput" style="width:100%; padding:10px; margin-bottom:12px; border:1px solid #cbd5e0; border-radius:6px;" rows="3">${myOffer ? (myOffer.aciklama || myOffer.description) : ''}</textarea>
          
          <button type="submit" style="width:100%; background:#3182ce; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:15px;">
            ${myOffer ? 'Teklifi Güncelle' : 'Teklif Gönder'}
          </button>
        </form>
      `;
    }

    modalBody.innerHTML = html;

  } catch (error) {
    console.error('Kurum modal hatası:', error);
  }
}

// ==========================================
// 6. TEKLİF GÖNDERME / GÜNCELLEME SORGUSU
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
    const rawOffers = demand.teklifler || demand.offers || [];
    const offers = Array.isArray(rawOffers) ? rawOffers : [];
    
    const existingOfferIndex = offers.findIndex(o => o.kurumId === user.uid || o.institutionId === user.uid);
    
    if (existingOfferIndex > -1) {
      const existingOffer = offers[existingOfferIndex];
      if (checkOfferLocked(existingOffer)) {
        alert('Engellendi: Bu teklif müşteri tarafından kabul edildiği için değiştiremezsiniz!');
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
      offers: offers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('Teklifiniz kaydedildi.');
    renderInstitutionModal(demandId);

  } catch (error) {
    console.error('Teklif güncelleme hatası:', error);
    alert('Hata: ' + error.message);
  }
}

// Sayfa kapatıldığında veya ayrılındığında çalışan dinleyicileri temizle
window.addEventListener('beforeunload', () => {
  stopRegionalBannerListener();
  stopBannerTimer();
});
