const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const institutions = [
  {
    id: 1,
    name: "Özel Ayyıldız Sürücü Kursu",
    short: "Ayyıldız SK",
    category: "surucu",
    rating: 4.8,
    reviewCount: 128,
    location: "Çanakkale, Merkez",
    address: "Atatürk Cd. No:42",
    classes: "B, A1, A2, D, BE",
    video: true,
    offer: true,
    vip: true,
    lat: 40.1511,
    lng: 26.4052,
    emoji: "🚘"
  },
  {
    id: 2,
    name: "Troya Sürücü Kursu",
    short: "Troya SK",
    category: "surucu",
    rating: 4.6,
    reviewCount: 96,
    location: "Çanakkale, Merkez",
    address: "İskele Cd. No:18",
    classes: "B, A1, A2, D",
    video: true,
    offer: true,
    vip: false,
    lat: 40.1476,
    lng: 26.4022,
    emoji: "🚗"
  },
  {
    id: 3,
    name: "18 Mart Sürücü Kursu",
    short: "18 Mart SK",
    category: "surucu",
    rating: 4.5,
    reviewCount: 64,
    location: "Çanakkale, Merkez",
    address: "Barbaros Mah. Troya Cd. No:7",
    classes: "B, A1, A2",
    video: true,
    offer: true,
    vip: false,
    lat: 40.1450,
    lng: 26.4140,
    emoji: "🚙"
  }
];

let selectedId = 1;
let currentRating = 0;

let institutionMapInstance = null;
let institutionLocationMarker = null;

const map = L.map('map', { zoomControl: true }).setView([40.149, 26.407], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const markers = new Map();

function addMarkers() {
  institutions.forEach(inst => {
    if (markers.has(String(inst.id))) return;

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:${inst.vip ? 42 : 34}px;height:${inst.vip ? 42 : 34}px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:${inst.vip ? '#ff355d' : '#1677ff'};
        border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.22);
        display:grid;place-items:center;">
        <span style="transform:rotate(45deg);font-size:${inst.vip ? 18 : 15}px;">${inst.emoji}</span>
      </div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 38]
    });

    if (Number.isFinite(inst.lat) && Number.isFinite(inst.lng)) {
      const marker = L.marker([inst.lat, inst.lng], { icon })
        .addTo(map)
        .bindTooltip(`${inst.vip ? 'VIP: ' : ''}${inst.short || inst.name}`, {direction:'top', offset:[0,-30]});
      marker.on('click', () => selectInstitution(inst.id));
      markers.set(String(inst.id), marker);
    }
  });
}
addMarkers();

function getFilteredInstitutions() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const checkedCategories = [...document.querySelectorAll('.categoryFilter:checked')].map(x => x.value);
  const videoOnly = document.getElementById('videoOnly').checked;
  const offerOnly = document.getElementById('offerOnly').checked;

  let data = institutions.filter(inst => {
    const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(inst.category);
    const matchesQuery = !query || `${inst.name} ${inst.location} ${inst.address} ${inst.classes}`.toLowerCase().includes(query);
    const matchesVideo = !videoOnly || inst.video;
    const matchesOffer = !offerOnly || inst.offer;
    return matchesCategory && matchesQuery && matchesVideo && matchesOffer;
  });

  const sort = document.getElementById('sortSelect').value;
  if (sort === 'rating') data.sort((a,b) => b.rating - a.rating);
  return data;
}

function renderList() {
  const list = document.getElementById('institutionList');
  const data = getFilteredInstitutions();
  document.getElementById('resultCount').textContent = `${data.length} sonuç`;

  list.innerHTML = data.map(inst => `
    <article class="institution-card ${String(inst.id) === String(selectedId) ? 'active' : ''}" data-id="${inst.id}">
      <div class="thumb">
        <span>${inst.emoji}</span>
        ${inst.video ? '<div class="video-badge">▶ Videolu</div>' : ''}
      </div>
      ${inst.vip ? '<div class="vip">VIP</div>' : ''}
      <div class="card-body">
        <h3>${inst.name}</h3>
        <div class="rating">⭐ ${inst.rating} <span>(${inst.reviewCount} değerlendirme)</span></div>
        <div class="meta">📍 ${inst.location}<br>${inst.address}</div>
        <div class="card-actions">
          <span class="chip">🚗 ${inst.classes}</span>
          ${inst.offer ? '<span class="chip">💵 Teklif Veriyor</span>' : ''}
          <button class="small-btn" data-quick-offer="${inst.id}">Fiyat Al</button>
        </div>
      </div>
    </article>
  `).join('') || `<div style="padding:20px;color:#68758a">Filtreye uygun kurum bulunamadı.</div>`;

  document.querySelectorAll('.institution-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.matches('[data-quick-offer]')) return;
      selectInstitution(card.dataset.id);
    });
  });

  document.querySelectorAll('[data-quick-offer]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      selectedId = btn.dataset.quickOffer;
      renderDetail();
      openModal('quoteModal');
    });
  });
}

function renderDetail() {
  const inst = institutions.find(i => String(i.id) === String(selectedId)) || institutions[0];
  const panel = document.getElementById('detailPanel');

  const savedReviews = JSON.parse(localStorage.getItem(`reviews_${inst.id}`) || '[]');
  const userReviewHtml = savedReviews.slice(-2).reverse().map(r => `
    <div class="review-card">
      <strong>Kullanıcı</strong><span class="verified">✓ Doğrulanmış kullanıcı</span><br>
      <span>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
      <div style="margin-top:5px;color:#58677c">${escapeHtml(r.text)}</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="detail-top">
      <div class="video-box">
        <div class="video-scene"></div>
        <div class="play">▶</div>
        <div class="video-title">🎥 Rota & Mekan Videosu</div>
      </div>

      <div class="detail-info">
        <h1>${inst.name}${inst.vip ? '<span class="vip-inline">VIP</span>' : ''}</h1>
        <div class="rating">⭐ ${inst.rating} <span>(${inst.reviewCount} değerlendirme)</span></div>
        <div class="address">📍 ${inst.address}, ${inst.location}</div>
        <div class="info-boxes">
          <div class="info-box">
            <strong>🚗 Ehliyet Sınıfları</strong>
            ${inst.classes}
          </div>
          <div class="info-box">
            <strong>⚙️ Özel Hizmetler</strong>
            <div class="check">✓ Deneyimli Eğitmen Kadrosu</div>
            <div class="check">✓ Modern Eğitim Araçları</div>
            <div class="check">✓ Sınav Öncesi Destek</div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-row">
      <button class="cta whatsapp" id="whatsappBtn">💬 WhatsApp ile Fiyat Al</button>
      <button class="cta offer" id="quoteBtn">📄 Toplu Teklif Al</button>
    </div>

    <div class="secondary-actions">
      <button id="routeBtn">🧭 Yol Tarifi Al</button>
      <button id="reviewBtn">⭐ Yorum Yap / Puan Ver</button>
      <button id="favoriteBtn">♡ Favoriye Ekle</button>
    </div>

    <div class="gallery-head">
      <h3>🖼️ Galeri: Mekan, Pist ve Araç Filosu</h3>
      <small>Tüm fotoğrafları gör →</small>
    </div>
    <div class="gallery">
      <div class="gallery-item"><span>Sınıf Çekim</span></div>
      <div class="gallery-item"><span>Eğitim Pisti</span></div>
      <div class="gallery-item"><span>Araç Filosu</span></div>
      <div class="gallery-item"><span>Simülatör</span></div>
      <div class="gallery-item"><span>Kayıt Ofisi</span></div>
    </div>

    <div class="reviews">
      <div class="review-summary">
        <div><strong>Yorumlar</strong> · ${inst.rating} / 5</div>
        <button class="btn btn-light" id="reviewBtn2">Yorum Yap</button>
      </div>
      ${userReviewHtml || `
        <div class="review-card">
          <strong>Demo Kullanıcı</strong><span class="verified">✓ Doğrulanmış kullanıcı</span><br>
          ★★★★★
          <div style="margin-top:5px;color:#58677c">Konumu kolay bulduk, süreç hızlı ilerledi.</div>
        </div>
      `}
    </div>
  `;

  document.getElementById('quoteBtn').onclick = () => openModal('quoteModal');
  document.getElementById('reviewBtn').onclick = () => openModal('reviewModal');
  document.getElementById('reviewBtn2').onclick = () => openModal('reviewModal');

  document.getElementById('routeBtn').onclick = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${inst.lat},${inst.lng}`, '_blank');
  };

  document.getElementById('whatsappBtn').onclick = () => {
    const msg = encodeURIComponent(`Merhaba, Dijiyer üzerinden ${inst.name} profilinizi gördüm. Fiyat bilgisi almak istiyorum.`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  document.getElementById('favoriteBtn').onclick = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favs.includes(inst.id)) favs.push(inst.id);
    localStorage.setItem('favorites', JSON.stringify(favs));
    showToast('Kurum favorilere eklendi.');
  };
}

function selectInstitution(id) {
  selectedId = id;
  renderList();
  renderDetail();
  const marker = markers.get(String(id));
  if (marker) {
    map.flyTo(marker.getLatLng(), 15, {duration:.6});
    marker.openTooltip();
  }
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.querySelectorAll('[data-close]').forEach(btn => btn.onclick = () => closeModal(btn.dataset.close));

document.getElementById('quoteForm').addEventListener('submit', e => {
  e.preventDefault();
  closeModal('quoteModal');
  showToast('Teklif talebiniz demo olarak kaydedildi.');
  e.target.reset();
});

document.getElementById('reviewForm').addEventListener('submit', e => {
  e.preventDefault();
  const rating = Number(document.getElementById('ratingValue').value);
  const text = e.target.querySelector('textarea').value.trim();
  if (!rating) return showToast('Lütfen 1-5 yıldız arası puan verin.');

  const key = `reviews_${selectedId}`;
  const reviews = JSON.parse(localStorage.getItem(key) || '[]');
  reviews.push({rating, text, date: new Date().toISOString()});
  localStorage.setItem(key, JSON.stringify(reviews));

  closeModal('reviewModal');
  showToast('Yorumunuz kaydedildi.');
  e.target.reset();
  setStars(0);
  renderDetail();
});

document.querySelectorAll('#starsInput [data-star]').forEach(btn => {
  btn.addEventListener('click', () => setStars(Number(btn.dataset.star)));
});
function setStars(n) {
  currentRating = n;
  document.getElementById('ratingValue').value = n;
  document.querySelectorAll('#starsInput [data-star]').forEach(btn => {
    btn.textContent = Number(btn.dataset.star) <= n ? '★' : '☆';
  });
}

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

document.getElementById('searchInput').addEventListener('input', renderList);
document.querySelectorAll('.categoryFilter').forEach(el => el.addEventListener('change', renderList));
document.getElementById('videoOnly').addEventListener('change', renderList);
document.getElementById('offerOnly').addEventListener('change', renderList);
document.getElementById('sortSelect').addEventListener('change', renderList);
document.getElementById('addInstitutionBtn').onclick = () => openModal('quoteModal');
document.getElementById('institutionAddBtn').onclick = () => {
  openModal('institutionModal');
  setTimeout(() => initInstitutionMap(), 150);
};

document.getElementById('institutionForm').addEventListener('submit', e => {
  e.preventDefault();

  const lat = Number(document.getElementById('institutionLat').value);
  const lng = Number(document.getElementById('institutionLng').value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showToast('Lütfen haritada kurumun konumunu işaretleyin.');
    return;
  }

  const application = {
    name: document.getElementById('institutionName').value,
    category: document.getElementById('institutionCategory').value,
    city: document.getElementById('institutionCity').value,
    district: document.getElementById('institutionDistrict').value,
    address: document.getElementById('institutionAddress').value,
    phone: document.getElementById('institutionPhone').value,
    website: document.getElementById('institutionWebsite').value,
    date: new Date().toISOString(),
    lat,
    lng
  };

  db.collection('institutionApplications')
  .add(application)
  .then(() => {
    closeModal('institutionModal');
    e.target.reset();

    document.getElementById('institutionLat').value = '';
    document.getElementById('institutionLng').value = '';

    if (institutionLocationMarker && institutionMapInstance) {
      institutionMapInstance.removeLayer(institutionLocationMarker);
      institutionLocationMarker = null;
    }

    showToast('Kurum başvurunuz alındı.');
  })
  .catch(error => {
  console.error('Başvuru kaydedilemedi:', error);
  showToast('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
});

});

function initInstitutionMap() {
  const mapElement = document.getElementById('institutionMap');
  if (!mapElement) return;

  if (!institutionMapInstance) {
    institutionMapInstance = L.map('institutionMap').setView([39.0, 35.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(institutionMapInstance);

    institutionMapInstance.on('click', e => {
      const { lat, lng } = e.latlng;

      document.getElementById('institutionLat').value = lat.toFixed(6);
      document.getElementById('institutionLng').value = lng.toFixed(6);

      if (institutionLocationMarker) {
        institutionLocationMarker.setLatLng([lat, lng]);
      } else {
        institutionLocationMarker = L.marker([lat, lng]).addTo(institutionMapInstance);
      }

      showToast('Kurum konumu işaretlendi.');
    });
  }

  setTimeout(() => institutionMapInstance.invalidateSize(), 100);
}

async function centerInstitutionMapFromAddress() {
  initInstitutionMap();

  const city = document.getElementById('institutionCity').value;
  const district = document.getElementById('institutionDistrict').value;
  const address = document.getElementById('institutionAddress').value.trim();

  if (!city) return;

  const query = [address, district, city, 'Türkiye']
    .filter(Boolean)
    .join(', ');

  try {
    const response = await fetch(
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&accept-language=tr&q=' +
      encodeURIComponent(query)
    );

    if (!response.ok) return;

    const result = await response.json();

    if (result.length) {
      const lat = Number(result[0].lat);
      const lng = Number(result[0].lon);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        institutionMapInstance.setView([lat, lng], address ? 17 : 13);
      }
    }
  } catch (error) {
    console.warn('Konum merkezlenemedi:', error);
  }
}

async function loadProvinces() {
  const citySelect = document.getElementById('institutionCity');
  const districtSelect = document.getElementById('institutionDistrict');

  citySelect.innerHTML = '<option value="">Şehirler yükleniyor...</option>';

  try {
    const response = await fetch(
      'https://api.turkiyeapi.dev/v2/provinces?fields=id,name&limit=81'
    );

    if (!response.ok) {
      throw new Error('Şehir verisi alınamadı');
    }

    const result = await response.json();

    citySelect.innerHTML = '<option value="">Şehir seçin</option>';

    result.data.forEach(city => {
      const option = document.createElement('option');

      option.value = city.name;
      option.textContent = city.name;
      option.dataset.id = city.id;

      citySelect.appendChild(option);
    });

  } catch (error) {
    console.error(error);
    citySelect.innerHTML =
      '<option value="">Şehirler yüklenemedi</option>';
  }
}

document
  .getElementById('institutionCity')
  .addEventListener('change', async function () {

    const selectedOption =
      this.options[this.selectedIndex];

    const provinceId =
      selectedOption.dataset.id;

    const districtSelect =
      document.getElementById('institutionDistrict');

    if (!provinceId) {
      districtSelect.innerHTML =
        '<option value="">Önce şehir seçin</option>';

      districtSelect.disabled = true;
      return;
    }

    districtSelect.disabled = true;

    districtSelect.innerHTML =
      '<option value="">İlçeler yükleniyor...</option>';

    try {
      const response = await fetch(
        `https://api.turkiyeapi.dev/v2/provinces/${provinceId}/districts?fields=id,name&limit=100`
      );

      if (!response.ok) {
        throw new Error('İlçe verisi alınamadı');
      }

      const result = await response.json();

      districtSelect.innerHTML =
        '<option value="">İlçe seçin</option>';

      result.data.forEach(district => {
        const option =
          document.createElement('option');

        option.value = district.name;
        option.textContent = district.name;

        districtSelect.appendChild(option);
      });

      districtSelect.disabled = false;

    } catch (error) {
      console.error(error);

      districtSelect.innerHTML =
        '<option value="">İlçeler yüklenemedi</option>';
    }
  });

document.getElementById('institutionDistrict').addEventListener('change', () => {
  centerInstitutionMapFromAddress();
});

document.getElementById('institutionAddress').addEventListener('blur', () => {
  centerInstitutionMapFromAddress();
});

async function loadApprovedInstitutions() {
  try {
    const snapshot = await db.collection('institutions').get();

    snapshot.forEach(doc => {
      const data = doc.data();

      const exists = institutions.some(inst => String(inst.id) === String(doc.id));
      if (exists) return;

      institutions.push({
        id: doc.id,
        name: data.name || 'Kurum',
        short: data.short || data.name || 'Kurum',
        category: data.category || 'diger',
        rating: Number(data.rating || 0),
        reviewCount: Number(data.reviewCount || 0),
        location: data.location || [data.city, data.district].filter(Boolean).join(', '),
        city: data.city || '',
        district: data.district || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        classes: data.classes || 'Bilgi eklenecek',
        video: Boolean(data.video),
        offer: data.offer !== false,
        vip: Boolean(data.vip),
        lat: Number.isFinite(data.lat) ? data.lat : null,
        lng: Number.isFinite(data.lng) ? data.lng : null,
        emoji: data.emoji || '🏢'
      });
    });

    addMarkers();
    renderList();
    renderDetail();
  } catch (error) {
    console.error('Onaylı kurumlar yüklenemedi:', error);
  }
}

loadProvinces();
renderList();
renderDetail();
loadApprovedInstitutions();
