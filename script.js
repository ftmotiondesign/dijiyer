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

const institutionSessionApp =
  firebase.apps.find(app => app.name === 'institutionSession') ||
  firebase.initializeApp(firebaseConfig, 'institutionSession');

const institutionAuth = institutionSessionApp.auth();
const institutionDb = institutionSessionApp.firestore();

const institutionRegistrationApp =
  firebase.apps.find(app => app.name === 'institutionRegistration') ||
  firebase.initializeApp(firebaseConfig, 'institutionRegistration');

const institutionRegistrationAuth = institutionRegistrationApp.auth();
const institutionRegistrationDb = institutionRegistrationApp.firestore();

const categoryTaxonomy = {
  egitim: { label:'Eğitim', subs:{
    kres:'Kreş & Anaokulu', dershane:'Dershane / Kurs Merkezi', surucu:'Sürücü Kursu',
    ozel_ders:'Özel Ders', dil_kursu:'Dil Kursu', etut:'Etüt Merkezi',
    ozel_okul:'Özel Okul', yurt:'Öğrenci Yurdu'
  }},
  otomotiv: { label:'Otomotiv', subs:{
    oto_servis:'Oto Servis / Tamir', kaporta_boya:'Kaporta / Boya', oto_elektrik:'Oto Elektrik',
    lastik_jant:'Lastik / Jant', oto_yikama:'Oto Yıkama / Kuaför', ekspertiz:'Oto Ekspertiz',
    galeri:'Oto Galeri', rentacar:'Rent a Car', yedek_parca:'Yedek Parça', motosiklet:'Motosiklet Servisi'
  }},
  yemeicme: { label:'Yeme & İçme', subs:{
    restoran:'Restoran', kafe:'Kafe', fastfood:'Fast Food', pastane:'Pastane', pizza:'Pizza',
    doner:'Döner', pide_lahmacun:'Pide / Lahmacun', catering:'Catering', ev_yemekleri:'Ev Yemekleri'
  }},
  saglikguzellik: { label:'Sağlık & Güzellik', subs:{
    dis_klinigi:'Diş Kliniği', klinik:'Sağlık Kliniği', psikolog:'Psikolog', diyetisyen:'Diyetisyen',
    fizyoterapi:'Fizyoterapi', guzellik:'Güzellik Merkezi', kuafor:'Kuaför', berber:'Berber',
    spor:'Pilates / Fitness'
  }},
  evyapi: { label:'Ev & Yapı', subs:{
    mobilya:'Mobilya', dekorasyon:'Dekorasyon', insaat:'İnşaat / Tadilat', elektrikci:'Elektrikçi',
    tesisatci:'Tesisatçı', teknik_servis:'Beyaz Eşya / Teknik Servis', klima:'Klima Servisi',
    cam_balkon:'Cam Balkon / PVC', temizlik:'Temizlik Hizmetleri'
  }},
  emlak: { label:'Emlak', subs:{
    emlak_ofisi:'Emlak Ofisi', konut:'Konut', arsa:'Arsa / Tarla',
    ticari:'Ticari Gayrimenkul', gunluk_kiralik:'Günlük Kiralık'
  }},
  turizm: { label:'Turizm & Konaklama', subs:{
    otel:'Otel', pansiyon:'Pansiyon', apart:'Apart', bungalov:'Bungalov',
    seyahat:'Seyahat Acentesi / Tur', kamp:'Kamp / Karavan'
  }},
  organizasyonmedya: { label:'Organizasyon & Medya', subs:{
    dugun_salonu:'Düğün Salonu', organizasyon:'Organizasyon Firması', fotograf:'Fotoğrafçı',
    video:'Video Çekimi', drone:'Drone Çekimi', gelinlik:'Gelinlik', cicekci:'Çiçekçi',
    reklam:'Reklam / Tasarım / Matbaa'
  }},
  tasimacilik: { label:'Taşımacılık & Teslimat', subs:{
    nakliyat:'Evden Eve Nakliyat', kurye:'Kurye', sehirici:'Şehir İçi Taşımacılık', depolama:'Depolama'
  }},
  profesyonel: { label:'Profesyonel Hizmetler', subs:{
    hukuk:'Avukat / Hukuk', muhasebe:'Muhasebe / Mali Müşavir', web:'Web Tasarım',
    sosyal_medya:'Sosyal Medya / Ajans', bilgisayar:'Bilgisayar / Teknoloji', danismanlik:'Danışmanlık',
    veteriner:'Veteriner / Pet Hizmetleri', tarim:'Tarım / Hayvancılık'
  }},
  alisveris: { label:'Alışveriş & Yerel Esnaf', subs:{
    giyim:'Giyim', ayakkabi:'Ayakkabı', market:'Market', elektronik:'Elektronik / Telefon',
    kirtasiye:'Kırtasiye', petshop:'Pet Shop', zuccaciye:'Züccaciye', esnaf:'Diğer Yerel Esnaf'
  }},
  diger: { label:'Diğer', subs:{ diger:'Diğer Hizmet' }}
};

const legacyCategoryToTaxonomy = {
  // Eğitim
  kres:['egitim','kres'], dershane:['egitim','dershane'], surucu:['egitim','surucu'],
  ozel_ders:['egitim','ozel_ders'], dil_kursu:['egitim','dil_kursu'], etut:['egitim','etut'],
  ozel_okul:['egitim','ozel_okul'], yurt:['egitim','yurt'], egitim:['egitim','dershane'],

  // Otomotiv
  oto:['otomotiv','oto_servis'], oto_servis:['otomotiv','oto_servis'],
  kaporta_boya:['otomotiv','kaporta_boya'], oto_elektrik:['otomotiv','oto_elektrik'],
  lastik_jant:['otomotiv','lastik_jant'], oto_yikama:['otomotiv','oto_yikama'],
  ekspertiz:['otomotiv','ekspertiz'], galeri:['otomotiv','galeri'], rentacar:['otomotiv','rentacar'],
  yedek_parca:['otomotiv','yedek_parca'], motosiklet:['otomotiv','motosiklet'],

  // Yeme & İçme
  restoran:['yemeicme','restoran'], kafe:['yemeicme','kafe'], fastfood:['yemeicme','fastfood'],
  pastane:['yemeicme','pastane'], pizza:['yemeicme','pizza'], doner:['yemeicme','doner'],
  pide_lahmacun:['yemeicme','pide_lahmacun'], catering:['yemeicme','catering'],
  ev_yemekleri:['yemeicme','ev_yemekleri'],

  // Sağlık & Güzellik
  saglik:['saglikguzellik','klinik'], dis_klinigi:['saglikguzellik','dis_klinigi'],
  klinik:['saglikguzellik','klinik'], psikolog:['saglikguzellik','psikolog'],
  diyetisyen:['saglikguzellik','diyetisyen'], fizyoterapi:['saglikguzellik','fizyoterapi'],
  guzellik:['saglikguzellik','guzellik'], kuafor:['saglikguzellik','kuafor'],
  berber:['saglikguzellik','berber'], spor:['saglikguzellik','spor'],

  // Ev & Yapı
  mobilya:['evyapi','mobilya'], dekorasyon:['evyapi','dekorasyon'], insaat:['evyapi','insaat'],
  elektrikci:['evyapi','elektrikci'], tesisatci:['evyapi','tesisatci'],
  teknik_servis:['evyapi','teknik_servis'], evteknik:['evyapi','teknik_servis'],
  klima:['evyapi','klima'], cam_balkon:['evyapi','cam_balkon'], temizlik:['evyapi','temizlik'],

  // Emlak
  emlak:['emlak','emlak_ofisi'], emlak_ofisi:['emlak','emlak_ofisi'], konut:['emlak','konut'],
  arsa:['emlak','arsa'], ticari:['emlak','ticari'], gunluk_kiralik:['emlak','gunluk_kiralik'],

  // Turizm
  turizm:['turizm','otel'], otel:['turizm','otel'], pansiyon:['turizm','pansiyon'],
  apart:['turizm','apart'], bungalov:['turizm','bungalov'], seyahat:['turizm','seyahat'],
  kamp:['turizm','kamp'],

  // Organizasyon & Medya
  dugun:['organizasyonmedya','organizasyon'], dugun_salonu:['organizasyonmedya','dugun_salonu'],
  organizasyon:['organizasyonmedya','organizasyon'], fotograf:['organizasyonmedya','fotograf'],
  medya:['organizasyonmedya','video'], video:['organizasyonmedya','video'],
  drone:['organizasyonmedya','drone'], gelinlik:['organizasyonmedya','gelinlik'],
  cicekci:['organizasyonmedya','cicekci'], reklam:['organizasyonmedya','reklam'],

  // Taşımacılık
  nakliyat:['tasimacilik','nakliyat'], kurye:['tasimacilik','kurye'],
  sehirici:['tasimacilik','sehirici'], depolama:['tasimacilik','depolama'],

  // Profesyonel
  hukuk:['profesyonel','hukuk'], muhasebe:['profesyonel','muhasebe'], web:['profesyonel','web'],
  sosyal_medya:['profesyonel','sosyal_medya'], teknoloji:['profesyonel','bilgisayar'],
  bilgisayar:['profesyonel','bilgisayar'], danismanlik:['profesyonel','danismanlik'],
  veteriner:['profesyonel','veteriner'], tarim:['profesyonel','tarim'],

  // Alışveriş
  perakende:['alisveris','esnaf'], giyim:['alisveris','giyim'], ayakkabi:['alisveris','ayakkabi'],
  market:['alisveris','market'], elektronik:['alisveris','elektronik'], kirtasiye:['alisveris','kirtasiye'],
  petshop:['alisveris','petshop'], zuccaciye:['alisveris','zuccaciye'], esnaf:['alisveris','esnaf'],

  diger:['diger','diger']
}

function resolveTaxonomy(record) {
  if (record && record.mainCategory) {
    return [record.mainCategory, record.subCategory || record.category || ''];
  }
  return legacyCategoryToTaxonomy[(record && record.category) || ''] ||
    ['diger', (record && record.category) || 'diger'];
}

function populateMainCategorySelect(selectId, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">' + placeholder + '</option>' +
    Object.entries(categoryTaxonomy)
      .map(([key,item]) => '<option value="' + key + '">' + item.label + '</option>')
      .join('');
}

function fillSubCategorySelect(mainCategory, selectId, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const rows = Object.entries(categoryTaxonomy[mainCategory]?.subs || {});
  select.innerHTML = rows.length
    ? '<option value="">' + placeholder + '</option>' +
      rows.map(([key,label]) => '<option value="' + key + '">' + label + '</option>').join('')
    : '<option value="">Önce ana kategori seçin</option>';
  select.disabled = rows.length === 0;
}


populateMainCategorySelect('quoteCategory','Ana kategori seçin');
populateMainCategorySelect('institutionCategory','Ana kategori seçin');

const categoryIcons = {
  egitim:'📚',
  otomotiv:'🚗',
  yemeicme:'🍽️',
  saglikguzellik:'🩺',
  evyapi:'🏠',
  emlak:'🏢',
  turizm:'🏨',
  organizasyonmedya:'📸',
  tasimacilik:'🚚',
  profesyonel:'💼',
  alisveris:'🛒',
  diger:'➕'
};

function renderSidebarCategories() {
  const root = document.getElementById('sidebarCategories');
  if (!root) return;

  root.innerHTML = Object.entries(categoryTaxonomy).map(([mainKey,item]) => {
    const subs = Object.entries(item.subs || {});
    return `
      <div class="category-group" data-category-group="${mainKey}">
        <div class="category-main-row">
          <label class="category-main-label">
            <input type="checkbox" class="categoryFilter" value="${mainKey}">
            <span class="category-icon">${categoryIcons[mainKey] || '•'}</span>
            <span class="category-name">${item.label}</span>
          </label>
          <button
            type="button"
            class="category-toggle"
            data-category-toggle="${mainKey}"
            aria-expanded="false"
            aria-label="${item.label} alt kategorilerini aç"
          ><span class="category-chevron" aria-hidden="true"></span></button>
        </div>
        <div class="subcategory-list hidden" data-subcategory-list="${mainKey}">
          ${subs.map(([subKey,subLabel]) => `
            <label class="subcategory-label">
              <input
                type="checkbox"
                class="subCategoryFilter"
                value="${subKey}"
                data-main-category="${mainKey}"
              >
              <span>${subLabel}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  root.querySelectorAll('.category-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.categoryToggle;
      const list = root.querySelector('[data-subcategory-list="' + key + '"]');
      const willOpen = list.classList.contains('hidden');
      list.classList.toggle('hidden', !willOpen);
      button.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  root.querySelectorAll('.subCategoryFilter').forEach(input => {
    input.addEventListener('change', () => {
      const mainKey = input.dataset.mainCategory;
      const parent = root.querySelector('.categoryFilter[value="' + mainKey + '"]');

      // Alt kategori seçildiğinde ana kategori de görsel olarak seçili kalsın.
      if (input.checked && parent) {
        parent.checked = true;
      }

      // Son alt kategori kaldırıldıysa ana kategoriyi kullanıcı seçimine bırak.
      renderList();
    });
  });

  root.querySelectorAll('.categoryFilter').forEach(input => {
    input.addEventListener('change', () => {
      const mainKey = input.value;
      const childInputs = root.querySelectorAll(
        '.subCategoryFilter[data-main-category="' + mainKey + '"]'
      );

      // Ana kategori kapatılırsa altında seçilmiş alt kategorileri de temizle.
      if (!input.checked) {
        childInputs.forEach(child => { child.checked = false; });
      }

      renderList();
    });
  });
}

renderSidebarCategories();

function clearAllCategorySelections() {
  document.querySelectorAll('.categoryFilter, .subCategoryFilter')
    .forEach(input => { input.checked = false; });
}

function syncMobileQuickFilterState() {
  const videoOnly = document.getElementById('videoOnly');
  const offerOnly = document.getElementById('offerOnly');
  document.getElementById('mobileVideoOnlyBtn')?.classList.toggle('active', Boolean(videoOnly?.checked));
  document.getElementById('mobileOfferOnlyBtn')?.classList.toggle('active', Boolean(offerOnly?.checked));
}

function getSelectedMainCategory() {
  const checkedSub = document.querySelector('.subCategoryFilter:checked');
  if (checkedSub) return checkedSub.dataset.mainCategory || '';

  const checkedMain = document.querySelector('.categoryFilter:checked');
  return checkedMain?.value || '';
}

function renderMobileSubcategories(mainKey) {
  const root = document.getElementById('mobileSubcategories');
  if (!root) return;

  const rows = Object.entries(categoryTaxonomy[mainKey]?.subs || {});

  if (!mainKey || !rows.length) {
    root.innerHTML = '';
    root.classList.add('hidden');
    return;
  }

  root.classList.remove('hidden');
  root.innerHTML = rows.map(([subKey, label]) => {
    const input = document.querySelector(
      '.subCategoryFilter[data-main-category="' + mainKey + '"][value="' + subKey + '"]'
    );
    return `
      <button
        type="button"
        class="mobile-subcategory-btn ${input?.checked ? 'active' : ''}"
        data-mobile-subcategory="${subKey}"
        data-mobile-main="${mainKey}"
      >${label}</button>
    `;
  }).join('');

  root.querySelectorAll('[data-mobile-subcategory]').forEach(button => {
    button.addEventListener('click', () => {
      const selectedMain = button.dataset.mobileMain;
      const selectedSub = button.dataset.mobileSubcategory;
      const target = document.querySelector(
        '.subCategoryFilter[data-main-category="' + selectedMain + '"][value="' + selectedSub + '"]'
      );
      const parent = document.querySelector(
        '.categoryFilter[value="' + selectedMain + '"]'
      );

      const wasSelected = Boolean(target?.checked);

      document.querySelectorAll(
        '.subCategoryFilter[data-main-category="' + selectedMain + '"]'
      ).forEach(input => { input.checked = false; });

      if (target && !wasSelected) {
        target.checked = true;
        if (parent) parent.checked = true;
      }

      renderMobileCategories();
      renderList();
    });
  });
}

function renderMobileCategories() {
  const root = document.getElementById('mobileCategories');
  if (!root) return;

  const activeMain = getSelectedMainCategory();

  root.innerHTML = Object.entries(categoryTaxonomy).map(([key, item]) => `
    <button
      type="button"
      class="mobile-category-btn ${activeMain === key ? 'active' : ''}"
      data-mobile-category="${key}"
    >
      <span class="mobile-category-icon">${categoryIcons[key] || '•'}</span>
      <span>${item.label}</span>
    </button>
  `).join('');

  root.querySelectorAll('[data-mobile-category]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.mobileCategory;
      const currentlyActive = getSelectedMainCategory() === key;

      clearAllCategorySelections();

      if (!currentlyActive) {
        const parent = document.querySelector('.categoryFilter[value="' + key + '"]');
        if (parent) parent.checked = true;
      }

      renderMobileCategories();
      renderList();
    });
  });

  renderMobileSubcategories(activeMain);
  syncMobileQuickFilterState();
}

document.getElementById('mobileClearCategoriesBtn')?.addEventListener('click', () => {
  clearAllCategorySelections();
  renderMobileCategories();
  renderList();
});

document.getElementById('mobileVideoOnlyBtn')?.addEventListener('click', () => {
  const input = document.getElementById('videoOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
});

document.getElementById('mobileOfferOnlyBtn')?.addEventListener('click', () => {
  const input = document.getElementById('offerOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
});

document.querySelectorAll('.categoryFilter, .subCategoryFilter').forEach(input => {
  input.addEventListener('change', () => {
    renderMobileCategories();
  });
});

document.getElementById('videoOnly')?.addEventListener('change', syncMobileQuickFilterState);
document.getElementById('offerOnly')?.addEventListener('change', syncMobileQuickFilterState);

renderMobileCategories();

const institutions = [
  {
    id: 1,
    name: "Özel Ayyıldız Sürücü Kursu",
    short: "Ayyıldız SK",
    category: "surucu",
    mainCategory: "egitim",
    subCategory: "surucu",
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
    mainCategory: "egitim",
    subCategory: "surucu",
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
    mainCategory: "egitim",
    subCategory: "surucu",
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

let activeLocationCity = 'Çanakkale';
let activeLocationDistrict = 'Merkez';

let institutionMapInstance = null;
let institutionLocationMarker = null;

const map = L.map('map', {
  zoomControl: true,
  // Fare tekerleği haritanın üzerindeyken sayfanın aşağı/yukarı kaymasını engellemesin.
  scrollWheelZoom: false
}).setView([40.149, 26.407], 14);

function configureMainMapInteraction() {
  const isMobileMap = window.matchMedia('(max-width: 820px)').matches;

  if (isMobileMap) {
    // Mobilde parmakla dikey kaydırma sayfayı hareket ettirsin; harita kaydırmayı yakalamasın.
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
  } else {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
  }

  // Her boyutta sayfa scroll'u öncelikli olsun.
  map.scrollWheelZoom.disable();
}

configureMainMapInteraction();
window.addEventListener('resize', configureMainMapInteraction);

const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
});

const satelliteLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  }
);

streetLayer.addTo(map);

const mapStreetBtn = document.getElementById('mapStreetBtn');
const mapSatelliteBtn = document.getElementById('mapSatelliteBtn');

function setMainMapView(mode) {
  if (mode === 'satellite') {
    if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
    if (!map.hasLayer(satelliteLayer)) satelliteLayer.addTo(map);
    mapSatelliteBtn.classList.add('active');
    mapStreetBtn.classList.remove('active');
  } else {
    if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
    if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
    mapStreetBtn.classList.add('active');
    mapSatelliteBtn.classList.remove('active');
  }
}

mapStreetBtn.addEventListener('click', () => setMainMapView('street'));
mapSatelliteBtn.addEventListener('click', () => setMainMapView('satellite'));

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

function updateMarkerVisibility(visibleInstitutions) {
  const visibleIds = new Set(
    visibleInstitutions.map(inst => String(inst.id))
  );

  markers.forEach((marker, id) => {
    const shouldShow = visibleIds.has(String(id));
    const isShown = map.hasLayer(marker);

    if (shouldShow && !isShown) {
      marker.addTo(map);
    } else if (!shouldShow && isShown) {
      map.removeLayer(marker);
    }
  });
}

// Temel kurum listesini ve detay kartını hemen göster.
// Aşağıdaki ek özelliklerden biri hata verse bile ana ekran boş kalmasın.
setTimeout(() => {
  try {
    renderList();
    renderDetail();
  } catch (error) {
    console.error('Ana ekran oluşturulamadı:', error);
  }
}, 0);

function getFilteredInstitutions() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const checkedCategories = [...document.querySelectorAll('.categoryFilter:checked')].map(x => x.value);
  const checkedSubCategories = [...document.querySelectorAll('.subCategoryFilter:checked')].map(x => ({
    mainCategory: x.dataset.mainCategory,
    subCategory: x.value
  }));
  const videoOnly = document.getElementById('videoOnly').checked;
  const offerOnly = document.getElementById('offerOnly').checked;

  let data = institutions.filter(inst => {
    const [mainCategory, subCategory] = resolveTaxonomy(inst);

    const mainCategorySelected = checkedCategories.includes(mainCategory);
    const selectedSubsForMain = checkedSubCategories
      .filter(item => item.mainCategory === mainCategory)
      .map(item => item.subCategory);

    const hasAnyCategoryFilter =
      checkedCategories.length > 0 || checkedSubCategories.length > 0;

    let matchesCategory = !hasAnyCategoryFilter;

    if (selectedSubsForMain.length > 0) {
      // Bu ana kategoride alt kategori seçildiyse alt kategori önceliklidir.
      matchesCategory = selectedSubsForMain.includes(subCategory);
    } else if (mainCategorySelected) {
      // Alt kategori seçilmemişse ana kategorinin tamamını göster.
      matchesCategory = true;
    }

    const mainLabel = categoryTaxonomy[mainCategory]?.label || '';
    const subLabel = categoryTaxonomy[mainCategory]?.subs?.[subCategory] || '';

    const matchesQuery = !query ||
      `${inst.name} ${inst.location} ${inst.address} ${inst.classes} ${mainLabel} ${subLabel}`
        .toLowerCase()
        .includes(query);

    const matchesVideo = !videoOnly || inst.video;
    const matchesOffer = !offerOnly || inst.offer;

    const locationParts = String(inst.location || '')
      .split(',')
      .map(part => part.trim());

    const institutionCity = String(inst.city || locationParts[0] || '').trim();
    const institutionDistrict = String(inst.district || locationParts[1] || '').trim();

    const normalizedInstitutionCity = normalizeQuoteSearch(institutionCity);
    const normalizedInstitutionDistrict = normalizeQuoteSearch(institutionDistrict);
    const normalizedActiveCity = normalizeQuoteSearch(activeLocationCity);
    const normalizedActiveDistrict = normalizeQuoteSearch(activeLocationDistrict);

    const matchesLocation =
      (!activeLocationCity || normalizedInstitutionCity === normalizedActiveCity) &&
      (!activeLocationDistrict || normalizedInstitutionDistrict === normalizedActiveDistrict);

    return matchesCategory && matchesQuery && matchesVideo && matchesOffer && matchesLocation;
  });

  const sort = document.getElementById('sortSelect').value;
  if (sort === 'rating') data.sort((a,b) => b.rating - a.rating);
  return data;
}

function renderList() {
  const list = document.getElementById('institutionList');
  const data = getFilteredInstitutions();

  const selectedStillVisible = data.some(
    inst => String(inst.id) === String(selectedId)
  );

  if (!selectedStillVisible) {
    selectedId = data.length ? data[0].id : null;
  }

  updateMarkerVisibility(data);
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
        <div class="rating" id="detailRating">⭐ ${inst.rating} <span>(${inst.reviewCount} değerlendirme)</span></div>
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

  renderDetail();
}

function renderDetail() {
  const panel = document.getElementById('detailPanel');
  const inst = institutions.find(i => String(i.id) === String(selectedId));

  if (!inst) {
    panel.innerHTML = `
      <div class="empty-detail-state">
        <strong>Bu filtreye uygun kurum bulunamadı.</strong>
        <span>Farklı bir alt kategori seçebilir veya filtreyi kaldırabilirsiniz.</span>
      </div>
    `;
    return;
  }

  const savedReviews = inst.source === 'firestore'
    ? []
    : JSON.parse(localStorage.getItem(`reviews_${inst.id}`) || '[]');

  const userReviewHtml = inst.source === 'firestore'
    ? '<div class="review-card" id="reviewsLoading">Yorumlar yükleniyor...</div>'
    : savedReviews.slice(-2).reverse().map(r => `
        <div class="review-card">
          <strong>Kullanıcı</strong><br>
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
        <div id="reviewSummaryText"><strong>Yorumlar</strong> · ${inst.rating} / 5</div>
        <button class="btn btn-light" id="reviewBtn2">Yorum Yap</button>
      </div>
      <div id="reviewsContent">
      ${userReviewHtml || `
        <div class="review-card">
          <strong>Demo Kullanıcı</strong><span class="verified">✓ Doğrulanmış kullanıcı</span><br>
          ★★★★★
          <div style="margin-top:5px;color:#58677c">Konumu kolay bulduk, süreç hızlı ilerledi.</div>
        </div>
      `}
      </div>
    </div>
  `;

  if (inst.source === 'firestore') {
    loadInstitutionReviews(inst);
  }

  document.getElementById('quoteBtn').onclick = () => openModal('quoteModal');
  document.getElementById('reviewBtn').onclick = () => openModal('reviewModal');
  document.getElementById('reviewBtn2').onclick = () => openModal('reviewModal');

  document.getElementById('routeBtn').onclick = () => {
    trackInstitutionEvent(inst, 'route_click');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${inst.lat},${inst.lng}`, '_blank');
  };

  document.getElementById('whatsappBtn').onclick = () => {
    trackInstitutionEvent(inst, 'whatsapp_click');
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


function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function trackInstitutionEvent(inst, type, deduplicate = false) {
  if (!inst || inst.source !== 'firestore') return;

  if (deduplicate && type === 'profile_view') {
    const key = `dijiyer_view_${inst.id}`;
    const last = Number(localStorage.getItem(key) || 0);
    const now = Date.now();

    if (now - last < 30 * 60 * 1000) return;
    localStorage.setItem(key, String(now));
  }

  try {
    await db.collection('institutionAnalytics').add({
      institutionId: String(inst.id),
      type,
      day: localDayKey(),
      date: new Date().toISOString()
    });
  } catch (error) {
    console.warn('İstatistik kaydı oluşturulamadı:', error);
  }
}

async function loadInstitutionReviews(inst) {
  const reviewsContent = document.getElementById('reviewsContent');
  const summaryText = document.getElementById('reviewSummaryText');
  const detailRating = document.getElementById('detailRating');

  if (!reviewsContent || !summaryText || !detailRating) return;

  try {
    const snapshot = await db.collection('institutionReviews')
      .where('institutionId', '==', String(inst.id))
      .get();

    const reviews = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.status === 'published')
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

    const count = reviews.length;
    const average = count
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count
      : 0;

    inst.rating = count ? Number(average.toFixed(1)) : 0;
    inst.reviewCount = count;

    detailRating.innerHTML =
      `⭐ ${count ? average.toFixed(1) : '0.0'} <span>(${count} değerlendirme)</span>`;

    summaryText.innerHTML =
      `<strong>Yorumlar</strong> · ${count ? average.toFixed(1) : '0.0'} / 5`;

    reviewsContent.innerHTML = reviews.length
      ? reviews.slice(0, 8).map(r => `
          <div class="review-card">
            <strong>Dijiyer Kullanıcısı</strong><br>
            <span>${'★'.repeat(Number(r.rating || 0))}${'☆'.repeat(5 - Number(r.rating || 0))}</span>
            <div style="margin-top:5px;color:#58677c">${escapeHtml(r.text || '')}</div>
          </div>
        `).join('')
      : `
          <div class="review-card">
            <strong>Henüz yorum yok</strong>
            <div style="margin-top:5px;color:#58677c">Bu kurum için ilk yorumu siz yapabilirsiniz.</div>
          </div>
        `;
  } catch (error) {
    console.error('Yorumlar yüklenemedi:', error);
    reviewsContent.innerHTML =
      '<div class="review-card">Yorumlar şu anda yüklenemedi.</div>';
  }
}

function selectInstitution(id) {
  selectedId = id;
  const selectedInstitution =
    institutions.find(i => String(i.id) === String(id));

  if (selectedInstitution) {
    trackInstitutionEvent(selectedInstitution, 'profile_view', true);
  }

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

function normalizeQuoteTrackingPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

async function hashQuoteTrackingPhone(phone) {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(phone)
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function makeQuoteTrackingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);

  const body = Array.from(bytes)
    .map(byte => alphabet[byte % alphabet.length])
    .join('');

  return `DJY-T-${body.slice(0,4)}-${body.slice(4,8)}-${body.slice(8,12)}`;
}

function getQuoteTrackingUrl(trackingCode) {
  const url = new URL('teklif.html', window.location.href);
  url.searchParams.set('v', '5');
  url.searchParams.set('kod', trackingCode);
  return url.toString();
}

function getMatchingInstitutionCount(request) {
  try {
    const requestDistrict = String(request.district || '').trim().toLocaleLowerCase('tr-TR');

    return institutions.filter(inst => {
      const [, subCategory] = resolveTaxonomy(inst);
      const sameCategory =
        String(subCategory || inst.category || '') === String(request.category || '');

      const sameCity =
        String(inst.city || '').trim().toLocaleLowerCase('tr-TR') ===
        String(request.city || '').trim().toLocaleLowerCase('tr-TR');

      const sameDistrict =
        !requestDistrict ||
        String(inst.district || '').trim().toLocaleLowerCase('tr-TR') === requestDistrict;

      return sameCategory && sameCity && sameDistrict && inst.offer !== false;
    }).length;
  } catch (error) {
    console.warn('Eşleşen kurum sayısı hesaplanamadı:', error);
    return 0;
  }
}

async function createQuoteTrackingAccess(quoteId, request) {
  const normalizedPhone = normalizeQuoteTrackingPhone(request.phone);

  if (normalizedPhone.length < 10) {
    throw new Error('Telefon numarasını kontrol edin.');
  }

  const phoneHash = await hashQuoteTrackingPhone(normalizedPhone);
  const trackingCode = makeQuoteTrackingCode();
  const trackingUrl = getQuoteTrackingUrl(trackingCode);

  await db.collection('quoteAccess')
    .doc(phoneHash)
    .collection('codes')
    .doc(trackingCode)
    .set({
      quoteId,
      trackingCode,
      phoneHash,
      service: request.service,
      mainCategory: request.mainCategory || '',
      subCategory: request.subCategory || request.category || '',
      mainCategoryLabel: categoryTaxonomy[request.mainCategory]?.label || '',
      subCategoryLabel: categoryTaxonomy[request.mainCategory]?.subs?.[request.subCategory] || request.service || '',
      city: request.city,
      district: request.district,
      note: request.note || '',
      date: request.date,
      status: 'active',
      createdAt: new Date().toISOString()
    });

  return {
    trackingCode,
    trackingUrl,
    normalizedPhone
  };
}

function showQuoteTrackingSuccess(tracking, matchedCount) {
  sessionStorage.setItem('dijiyerTrackingCode', tracking.trackingCode);
  sessionStorage.setItem('dijiyerTrackingPhone', tracking.normalizedPhone);
  localStorage.setItem('dijiyerLastTrackingCode', tracking.trackingCode);

  document.getElementById('quoteSuccessCode').textContent = tracking.trackingCode;
  document.getElementById('quoteSuccessLink').value = tracking.trackingUrl;

  const areaText = tracking.requestDistrict
    ? tracking.requestDistrict + ' ilçesindeki'
    : (tracking.requestCity ? tracking.requestCity + ' genelindeki' : 'bölgedeki');

  document.getElementById('quoteSuccessCount').textContent =
    matchedCount > 0
      ? `Talebiniz ${areaText} ${matchedCount} uygun kuruma ulaştı. Gelen fiyatları bu bağlantıdan takip edebilirsiniz.`
      : `Talebiniz alındı. ${areaText.charAt(0).toUpperCase() + areaText.slice(1)} uygun kurumlar teklif verdikçe bu bağlantıda görünecek.`;

  document.getElementById('quoteOpenTrackingBtn').onclick = () => {
    window.location.href = tracking.trackingUrl;
  };

  document.getElementById('quoteCopyTrackingBtn').onclick = async () => {
    try {
      await navigator.clipboard.writeText(tracking.trackingUrl);
      showToast('Teklif takip linki kopyalandı.');
    } catch (error) {
      console.error(error);
      document.getElementById('quoteSuccessLink').select();
      document.execCommand('copy');
      showToast('Teklif takip linki kopyalandı.');
    }
  };

  document.getElementById('quoteWhatsappTrackingBtn').onclick = () => {
    let whatsappPhone = tracking.normalizedPhone;

    if (whatsappPhone.length === 10) {
      whatsappPhone = '90' + whatsappPhone;
    }

    const message = encodeURIComponent(
      `Dijiyer teklif takip bilgilerim\n\nTakip Kodu: ${tracking.trackingCode}\nTeklif Linki: ${tracking.trackingUrl}\n\nLinki açarken talepte kullandığım telefon numarasını gireceğim.`
    );

    window.open(
      `https://wa.me/${whatsappPhone}?text=${message}`,
      '_blank',
      'noopener'
    );
  };

  openModal('quoteSuccessModal');
}

document.getElementById('quoteForm').addEventListener('submit', async e => {
  e.preventDefault();

  const searchText = document.getElementById('quoteSearch').value.trim();
  const selectedCategory = document.getElementById('quoteCategory').value;
  const selectedSubCategory = document.getElementById('quoteService').value;
  const normalizedPhone = normalizeQuoteTrackingPhone(
    document.getElementById('quotePhone').value
  );

  if (!searchText && !(selectedCategory && selectedSubCategory)) {
    showToast('Ne aradığınızı yazın veya ana kategori ve alt kategori seçin.');
    return;
  }

  if (normalizedPhone.length < 10) {
    showToast('Tekliflerinizi takip edebilmek için geçerli bir telefon numarası girin.');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const oldText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Gönderiliyor...';

  const inferredCategory = searchText ? inferQuoteCategory(searchText) : null;
  const mainCategory = selectedCategory || inferredCategory?.mainCategory || 'diger';
  const subCategory = selectedSubCategory || inferredCategory?.subCategory || 'diger';

  const request = {
    mainCategory,
    subCategory,
    category: subCategory,
    service: categoryTaxonomy[mainCategory]?.subs?.[subCategory] || searchText,
    city: document.getElementById('quoteCity').value,
    district: document.getElementById('quoteDistrict').value,
    name: document.getElementById('quoteName').value.trim(),
    phone: document.getElementById('quotePhone').value.trim(),
    note: document.getElementById('quoteNote').value.trim(),
    status: 'new',
    date: new Date().toISOString()
  };

  try {
    const quoteRef = await db.collection('quoteRequests').add(request);
    let tracking = null;

    try {
      tracking = await createQuoteTrackingAccess(quoteRef.id, request);
    } catch (trackingError) {
      console.error('Teklif takip kodu oluşturulamadı:', trackingError);
    }

    const localRequest = tracking
      ? {
          ...request,
          trackingCode: tracking.trackingCode,
          trackingUrl: tracking.trackingUrl
        }
      : request;

    if (typeof window.rememberCustomerQuote === 'function') {
      window.rememberCustomerQuote(quoteRef.id, localRequest);
    } else {
      const key = 'dijiyerCustomerQuoteIds';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (!saved.includes(quoteRef.id)) saved.unshift(quoteRef.id);
      localStorage.setItem(key, JSON.stringify(saved.slice(0, 30)));

      const dataKey = 'dijiyerCustomerQuoteData';
      const dataMap = JSON.parse(localStorage.getItem(dataKey) || '{}');
      dataMap[quoteRef.id] = localRequest;
      localStorage.setItem(dataKey, JSON.stringify(dataMap));
    }

    const matchedCount = getMatchingInstitutionCount(request);

    closeModal('quoteModal');
    e.target.reset();

    document.getElementById('quoteService').innerHTML =
      '<option value="">Önce ana kategori seçin</option>';
    document.getElementById('quoteService').disabled = true;
    document.getElementById('quoteDistrict').innerHTML =
      '<option value="">Önce şehir seçin</option>';
    document.getElementById('quoteDistrict').disabled = true;

    if (tracking) {
      tracking.requestDistrict = request.district || '';
      tracking.requestCity = request.city || '';
      showQuoteTrackingSuccess(tracking, matchedCount);
    } else {
      showToast(
        'Talebiniz alındı. Takip linki henüz oluşturulamadı; Firestore takip kurallarını yayınlayın.'
      );
    }
  } catch (error) {
    console.error('Teklif talebi kaydedilemedi:', error);
    showToast('Teklif gönderilemedi. Lütfen tekrar deneyin.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});

document.getElementById('reviewForm').addEventListener('submit', async e => {
  e.preventDefault();

  const rating = Number(document.getElementById('ratingValue').value);
  const text = e.target.querySelector('textarea').value.trim();
  const inst = institutions.find(i => String(i.id) === String(selectedId));

  if (!rating) {
    showToast('Lütfen 1-5 yıldız arası puan verin.');
    return;
  }

  if (!text) {
    showToast('Lütfen yorumunuzu yazın.');
    return;
  }

  try {
    if (inst && inst.source === 'firestore') {
      await db.collection('institutionReviews').add({
        institutionId: String(inst.id),
        rating,
        text,
        status: 'published',
        date: new Date().toISOString()
      });
    } else {
      const key = `reviews_${selectedId}`;
      const reviews = JSON.parse(localStorage.getItem(key) || '[]');
      reviews.push({ rating, text, date: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(reviews));
    }

    closeModal('reviewModal');
    showToast('Yorumunuz ve puanınız kaydedildi.');
    e.target.reset();
    setStars(0);
    renderDetail();
  } catch (error) {
    console.error('Yorum kaydedilemedi:', error);
    showToast('Yorum kaydedilemedi. Lütfen tekrar deneyin.');
  }
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
document.getElementById('videoOnly').addEventListener('change', renderList);
document.getElementById('offerOnly').addEventListener('change', renderList);
document.getElementById('sortSelect').addEventListener('change', renderList);
document.getElementById('addInstitutionBtn').onclick = () => openModal('quoteModal');

const institutionActions = document.getElementById('institutionActions');
const institutionActionsBtn = document.getElementById('institutionActionsBtn');
const institutionActionsMenu = document.getElementById('institutionActionsMenu');

function setInstitutionActionsMenu(open) {
  institutionActionsMenu.classList.toggle('hidden', !open);
  institutionActionsBtn.setAttribute('aria-expanded', String(open));
  institutionActions.classList.toggle('open', open);
}

institutionActionsBtn.addEventListener('click', event => {
  event.stopPropagation();
  setInstitutionActionsMenu(institutionActionsMenu.classList.contains('hidden'));
});

institutionActionsMenu.addEventListener('click', event => event.stopPropagation());

document.addEventListener('click', event => {
  if (!institutionActions.contains(event.target)) {
    setInstitutionActionsMenu(false);
  }
});

document.getElementById('institutionAddBtn').onclick = () => {
  setInstitutionActionsMenu(false);
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
    mainCategory: document.getElementById('institutionCategory').value,
    subCategory: document.getElementById('institutionSubCategory').value,
    category: document.getElementById('institutionSubCategory').value,
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
    document.getElementById('institutionSubCategory').innerHTML =
      '<option value="">Önce ana kategori seçin</option>';
    document.getElementById('institutionSubCategory').disabled = true;

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

    const institutionStreetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    });

    const institutionSatelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }
    );

    institutionStreetLayer.addTo(institutionMapInstance);

    L.control.layers(
      {
        'Harita': institutionStreetLayer,
        'Uydu': institutionSatelliteLayer
      },
      {},
      { position: 'topright' }
    ).addTo(institutionMapInstance);

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

async function findInstitutionOnMap() {
  initInstitutionMap();

  const name = document.getElementById('institutionName').value.trim();
  const city = document.getElementById('institutionCity').value;
  const district = document.getElementById('institutionDistrict').value;
  const address = document.getElementById('institutionAddress').value.trim();

  if (!city || !district) {
    showToast('Önce şehir ve ilçeyi seçin.');
    return;
  }

  if (!address) {
    showToast('Önce açık adresi yazın.');
    return;
  }

  const button = document.getElementById('findInstitutionBtn');
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = 'Adres aranıyor...';

  const queries = [
    [address, district, city, 'Türkiye'].join(', '),
    [address, city, 'Türkiye'].join(', '),
    [name, address, district, city, 'Türkiye'].filter(Boolean).join(', ')
  ];

  try {
    let place = null;

    for (const query of queries) {
      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=tr&accept-language=tr&q=' +
        encodeURIComponent(query)
      );

      if (!response.ok) continue;

      const result = await response.json();
      if (result.length) {
        place = result[0];
        break;
      }
    }

    if (!place) {
      showToast('Adres bulunamadı. Google Maps bağlantısını kullanın veya haritada elle işaretleyin.');
      return;
    }

    const lat = Number(place.lat);
    const lng = Number(place.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showToast('Adres konumu alınamadı.');
      return;
    }

    document.getElementById('institutionLat').value = lat.toFixed(6);
    document.getElementById('institutionLng').value = lng.toFixed(6);

    institutionMapInstance.setView([lat, lng], 17);

    if (institutionLocationMarker) {
      institutionLocationMarker.setLatLng([lat, lng]);
    } else {
      institutionLocationMarker = L.marker([lat, lng]).addTo(institutionMapInstance);
    }

    institutionLocationMarker
      .bindPopup('<strong>' + escapeHtml(name || 'Kurum') + '</strong><br>Adres haritada bulundu. Yanlışsa haritadan doğru noktaya tıklayın.')
      .openPopup();

    showToast('Adres haritada bulundu.');
  } catch (error) {
    console.error('Adres arama hatası:', error);
    showToast('Adres aranamadı. Google Maps bağlantısını kullanabilirsiniz.');
  } finally {
    button.disabled = false;
    button.textContent = oldText;
  }
}

function useGoogleMapsUrl() {
  initInstitutionMap();

  const urlInput = document.getElementById('institutionGoogleMapsUrl');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    showToast('Google Maps bağlantısını yapıştırın.');
    return;
  }

  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    showToast('Kısa paylaşım linki yerine tarayıcı adres çubuğundaki uzun Google Maps linkini kullanın.');
    return;
  }

  const patterns = [
    // Önce işletmenin gerçek koordinatını taşıyan Place verisini oku.
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /!8m2!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|destination)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    // @ koordinatı çoğu zaman sadece ekranda görünen haritanın merkezidir.
    // Bu yüzden en son çare olarak kullanılır.
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
  ];

  let lat = null;
  let lng = null;

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      lat = Number(match[1]);
      lng = Number(match[2]);
      break;
    }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showToast('Bu bağlantıdan koordinat okunamadı. Google Maps sayfasının adres çubuğundaki uzun linki kullanın.');
    return;
  }

  document.getElementById('institutionLat').value = lat.toFixed(6);
  document.getElementById('institutionLng').value = lng.toFixed(6);

  institutionMapInstance.setView([lat, lng], 17);

  if (institutionLocationMarker) {
    institutionLocationMarker.setLatLng([lat, lng]);
  } else {
    institutionLocationMarker = L.marker([lat, lng]).addTo(institutionMapInstance);
  }

  const name = document.getElementById('institutionName').value.trim() || 'Kurum';
  institutionLocationMarker
    .bindPopup('<strong>' + escapeHtml(name) + '</strong><br>Google Maps bağlantısından konum alındı.')
    .openPopup();

  showToast('Google Maps konumu haritaya aktarıldı.');
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

function fillQuoteServices(mainCategory) {
  fillSubCategorySelect(mainCategory,'quoteService','Alt kategori seçin');
}

function normalizeQuoteSearch(value) {
  return String(value || '')
    .trim().toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g')
    .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');
}

function inferQuoteCategory(value) {
  const q = normalizeQuoteSearch(value);
  const rules = [
    ['egitim','kres',['kres','anaokulu','gunduz bakim','cocuk bakim']],
    ['egitim','surucu',['ehliyet','surucu kursu','direksiyon','otomatik vites','motosiklet ehliyeti']],
    ['egitim','yurt',['ogrenci yurdu','yurt','barinma']],
    ['egitim','dershane',['dershane','kurs merkezi','lgs','tyt','ayt','deneme']],
    ['egitim','ozel_ders',['ozel ders']],
    ['egitim','dil_kursu',['dil kursu','ingilizce kursu']],
    ['otomotiv','kaporta_boya',['kaporta','oto boya']],
    ['otomotiv','oto_elektrik',['oto elektrik']],
    ['otomotiv','lastik_jant',['lastik','jant']],
    ['otomotiv','oto_yikama',['oto yikama','oto kuafor']],
    ['otomotiv','ekspertiz',['ekspertiz']],
    ['otomotiv','galeri',['oto galeri']],
    ['otomotiv','rentacar',['rent a car','arac kiralama']],
    ['otomotiv','yedek_parca',['yedek parca']],
    ['otomotiv','oto_servis',['oto servis','oto tamir','araba tamir','bakim onarim']],
    ['yemeicme','pizza',['pizza']],
    ['yemeicme','doner',['doner']],
    ['yemeicme','pide_lahmacun',['pide','lahmacun']],
    ['yemeicme','pastane',['pastane','pasta']],
    ['yemeicme','kafe',['kafe','cafe','kahve']],
    ['yemeicme','restoran',['restoran','yemek']],
    ['saglikguzellik','dis_klinigi',['dis klinigi','disci']],
    ['saglikguzellik','psikolog',['psikolog']],
    ['saglikguzellik','diyetisyen',['diyetisyen']],
    ['saglikguzellik','fizyoterapi',['fizyoterapi','fizik tedavi']],
    ['saglikguzellik','guzellik',['guzellik merkezi','cilt bakimi']],
    ['saglikguzellik','kuafor',['kuafor']],
    ['saglikguzellik','berber',['berber']],
    ['saglikguzellik','spor',['pilates','fitness','spor salonu','yoga']],
    ['evyapi','mobilya',['mobilya','dolap']],
    ['evyapi','insaat',['insaat','tadilat','boya badana','seramik','fayans']],
    ['evyapi','elektrikci',['elektrikci']],
    ['evyapi','tesisatci',['tesisatci','su tesisati']],
    ['evyapi','teknik_servis',['beyaz esya','teknik servis']],
    ['evyapi','klima',['klima']],
    ['evyapi','temizlik',['temizlik']],
    ['emlak','arsa',['arsa','tarla']],
    ['emlak','konut',['kiralik daire','satilik daire','konut']],
    ['emlak','emlak_ofisi',['emlak','gayrimenkul']],
    ['turizm','otel',['otel','konaklama']],
    ['turizm','pansiyon',['pansiyon']],
    ['turizm','seyahat',['tur','gezi','seyahat acentesi']],
    ['organizasyonmedya','dugun_salonu',['dugun salonu']],
    ['organizasyonmedya','organizasyon',['organizasyon']],
    ['organizasyonmedya','fotograf',['fotografci','fotograf cekimi']],
    ['organizasyonmedya','drone',['drone']],
    ['organizasyonmedya','video',['video cekimi','tanitim videosu']],
    ['organizasyonmedya','reklam',['matbaa','baski','tabela','grafik tasarim','reklam']],
    ['tasimacilik','nakliyat',['nakliyat','evden eve','esya tasima']],
    ['tasimacilik','kurye',['kurye','teslimat']],
    ['profesyonel','hukuk',['avukat','hukuk','arabulucu']],
    ['profesyonel','muhasebe',['muhasebe','mali musavir','vergi']],
    ['profesyonel','bilgisayar',['bilgisayar','telefon tamiri','yazilim','format']],
    ['profesyonel','veteriner',['veteriner','pet','hayvan klinigi']],
    ['profesyonel','tarim',['tarim','hayvancilik','gubre','yem']],
    ['alisveris','market',['market']],
    ['alisveris','elektronik',['elektronik','telefoncu']],
    ['alisveris','kirtasiye',['kirtasiye']]
  ];

  for (const [mainCategory,subCategory,keywords] of rules) {
    if (keywords.some(keyword => q.includes(keyword))) return {mainCategory,subCategory};
  }
  return null;
}

document.getElementById('quoteCategory').addEventListener('change', function () {
  fillQuoteServices(this.value);
});

document.getElementById('institutionCategory').addEventListener('change', function () {
  fillSubCategorySelect(this.value,'institutionSubCategory','Alt kategori seçin');
});

document.getElementById('detectQuoteCategoryBtn').addEventListener('click', () => {
  const searchText = document.getElementById('quoteSearch').value.trim();
  if (!searchText) return showToast('Önce ne aradığınızı yazın.');

  const inferred = inferQuoteCategory(searchText);
  const categorySelect = document.getElementById('quoteCategory');
  const subSelect = document.getElementById('quoteService');

  if (!inferred) {
    categorySelect.value='diger';
    fillQuoteServices('diger');
    subSelect.value='diger';
    return showToast('Kategori otomatik bulunamadı. Diğer olarak devam edebilirsiniz.');
  }

  categorySelect.value=inferred.mainCategory;
  fillQuoteServices(inferred.mainCategory);
  subSelect.value=inferred.subCategory;

  const mainLabel=categoryTaxonomy[inferred.mainCategory]?.label || 'Kategori';
  const subLabel=categoryTaxonomy[inferred.mainCategory]?.subs?.[inferred.subCategory] || '';
  showToast('Uygun kategori: ' + mainLabel + (subLabel ? ' → ' + subLabel : ''));
});

async function loadQuoteProvinces() {
  const citySelect = document.getElementById('quoteCity');
  const districtSelect = document.getElementById('quoteDistrict');

  citySelect.innerHTML = '<option value="">Şehirler yükleniyor...</option>';

  try {
    const response = await fetch(
      'https://api.turkiyeapi.dev/v2/provinces?fields=id,name&limit=81'
    );

    if (!response.ok) throw new Error('Şehir verisi alınamadı');

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
    console.error('Teklif şehirleri yüklenemedi:', error);
    citySelect.innerHTML = '<option value="">Şehirler yüklenemedi</option>';
  }

  districtSelect.innerHTML = '<option value="">Önce şehir seçin</option>';
  districtSelect.disabled = true;
}

document.getElementById('quoteCity').addEventListener('change', async function () {
  const selectedOption = this.options[this.selectedIndex];
  const provinceId = selectedOption.dataset.id;
  const districtSelect = document.getElementById('quoteDistrict');

  if (!provinceId) {
    districtSelect.innerHTML = '<option value="">Önce şehir seçin</option>';
    districtSelect.disabled = true;
    return;
  }

  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">İlçeler yükleniyor...</option>';

  try {
    const response = await fetch(
      `https://api.turkiyeapi.dev/v2/provinces/${provinceId}/districts?fields=id,name&limit=100`
    );

    if (!response.ok) throw new Error('İlçe verisi alınamadı');

    const result = await response.json();
    districtSelect.innerHTML = '<option value="">Tüm şehir (ilçe seçmeden devam et)</option>';

    result.data.forEach(district => {
      const option = document.createElement('option');
      option.value = district.name;
      option.textContent = district.name;
      districtSelect.appendChild(option);
    });

    districtSelect.disabled = false;
  } catch (error) {
    console.error('Teklif ilçeleri yüklenemedi:', error);
    districtSelect.innerHTML = '<option value="">İlçeler yüklenemedi</option>';
  }
});


const locationBtn = document.getElementById('locationBtn');
const locationBtnText = document.getElementById('locationBtnText');
const locationPopover = document.getElementById('locationPopover');
const mainLocationCity = document.getElementById('mainLocationCity');
const mainLocationDistrict = document.getElementById('mainLocationDistrict');
const applyMainLocationBtn = document.getElementById('applyMainLocationBtn');
const clearMainLocationBtn = document.getElementById('clearMainLocationBtn');
const locationCloseBtn = document.getElementById('locationCloseBtn');

function setLocationPopover(open) {
  locationPopover.classList.toggle('hidden', !open);
  locationBtn.setAttribute('aria-expanded', String(open));
  document.getElementById('locationPicker')?.classList.toggle('open', open);
}

locationBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  setLocationPopover(locationPopover.classList.contains('hidden'));
});

locationCloseBtn?.addEventListener('click', () => setLocationPopover(false));

document.addEventListener('click', (event) => {
  const picker = document.getElementById('locationPicker');
  if (picker && !picker.contains(event.target)) {
    setLocationPopover(false);
  }
});

locationPopover?.addEventListener('click', event => event.stopPropagation());

function updateMainLocationButton() {
  if (!activeLocationCity) {
    locationBtnText.textContent = 'Tüm Türkiye';
    return;
  }

  locationBtnText.textContent = activeLocationDistrict
    ? activeLocationCity + ', ' + activeLocationDistrict
    : activeLocationCity;
}

async function loadMainLocationDistricts(provinceId, selectedDistrict = '') {
  mainLocationDistrict.disabled = true;
  mainLocationDistrict.innerHTML = '<option value="">İlçeler yükleniyor...</option>';

  if (!provinceId) {
    mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';
    mainLocationDistrict.disabled = true;
    return;
  }

  try {
    const response = await fetch(
      `https://api.turkiyeapi.dev/v2/provinces/${provinceId}/districts?fields=id,name&limit=100`
    );

    if (!response.ok) throw new Error('İlçe verisi alınamadı');

    const result = await response.json();
    mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';

    result.data.forEach(district => {
      const option = document.createElement('option');
      option.value = district.name;
      option.textContent = district.name;
      mainLocationDistrict.appendChild(option);
    });

    mainLocationDistrict.disabled = false;

    if (selectedDistrict) {
      const wanted = [...mainLocationDistrict.options].find(
        option => normalizeQuoteSearch(option.value) === normalizeQuoteSearch(selectedDistrict)
      );
      if (wanted) mainLocationDistrict.value = wanted.value;
    }
  } catch (error) {
    console.error('Ana konum ilçeleri yüklenemedi:', error);
    mainLocationDistrict.innerHTML = '<option value="">İlçeler yüklenemedi</option>';
  }
}

async function loadMainLocationProvinces() {
  mainLocationCity.innerHTML = '<option value="">İller yükleniyor...</option>';

  try {
    const response = await fetch(
      'https://api.turkiyeapi.dev/v2/provinces?fields=id,name&limit=81'
    );

    if (!response.ok) throw new Error('İl verisi alınamadı');

    const result = await response.json();
    mainLocationCity.innerHTML = '<option value="">Tüm İller</option>';

    result.data.forEach(city => {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = city.name;
      option.dataset.id = city.id;
      mainLocationCity.appendChild(option);
    });

    const currentCityOption = [...mainLocationCity.options].find(
      option => normalizeQuoteSearch(option.value) === normalizeQuoteSearch(activeLocationCity)
    );

    if (currentCityOption) {
      mainLocationCity.value = currentCityOption.value;
      await loadMainLocationDistricts(currentCityOption.dataset.id, activeLocationDistrict);
    } else {
      mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';
      mainLocationDistrict.disabled = true;
    }
  } catch (error) {
    console.error('Ana konum illeri yüklenemedi:', error);
    mainLocationCity.innerHTML = '<option value="">İller yüklenemedi</option>';
  }
}

mainLocationCity?.addEventListener('change', async function () {
  const option = this.options[this.selectedIndex];
  const provinceId = option?.dataset?.id || '';

  if (!this.value) {
    mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';
    mainLocationDistrict.disabled = true;
    return;
  }

  await loadMainLocationDistricts(provinceId);
});

applyMainLocationBtn?.addEventListener('click', () => {
  activeLocationCity = mainLocationCity.value || '';
  activeLocationDistrict = activeLocationCity ? (mainLocationDistrict.value || '') : '';

  updateMainLocationButton();
  setLocationPopover(false);
  renderList();

  const filtered = getFilteredInstitutions();
  const firstWithCoords = filtered.find(inst =>
    Number.isFinite(inst.lat) && Number.isFinite(inst.lng)
  );

  if (firstWithCoords) {
    map.flyTo([firstWithCoords.lat, firstWithCoords.lng], 13, { duration: .6 });
  }

  showToast(
    activeLocationCity
      ? (activeLocationDistrict
          ? activeLocationCity + ' / ' + activeLocationDistrict + ' seçildi.'
          : activeLocationCity + ' seçildi.')
      : 'Tüm Türkiye gösteriliyor.'
  );
});

clearMainLocationBtn?.addEventListener('click', () => {
  activeLocationCity = '';
  activeLocationDistrict = '';
  mainLocationCity.value = '';
  mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';
  mainLocationDistrict.disabled = true;

  updateMainLocationButton();
  setLocationPopover(false);
  renderList();
  map.setView([39.0, 35.0], 6);
  showToast('Tüm Türkiye gösteriliyor.');
});

updateMainLocationButton();

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

const findInstitutionBtn = document.getElementById('findInstitutionBtn');
if (findInstitutionBtn) {
  findInstitutionBtn.addEventListener('click', findInstitutionOnMap);
}

const useGoogleMapsUrlBtn = document.getElementById('useGoogleMapsUrlBtn');
if (useGoogleMapsUrlBtn) {
  useGoogleMapsUrlBtn.addEventListener('click', useGoogleMapsUrl);
}

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
        source: 'firestore',
        name: data.name || 'Kurum',
        short: data.short || data.name || 'Kurum',
        category: data.category || data.subCategory || 'diger',
        mainCategory: data.mainCategory || resolveTaxonomy(data)[0],
        subCategory: data.subCategory || resolveTaxonomy(data)[1],
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


const institutionLoginBtn = document.getElementById('institutionLoginBtn');
const institutionLoginTab = document.getElementById('institutionLoginTab');
const institutionRegisterTab = document.getElementById('institutionRegisterTab');
const institutionLoginForm = document.getElementById('institutionLoginForm');
const institutionRegisterForm = document.getElementById('institutionRegisterForm');
const institutionLoginMessage = document.getElementById('institutionLoginMessage');
const institutionRegisterMessage = document.getElementById('institutionRegisterMessage');

function setInstitutionAccessMode(mode) {
  const loginMode = mode === 'login';

  institutionLoginTab.classList.toggle('active', loginMode);
  institutionRegisterTab.classList.toggle('active', !loginMode);
  institutionLoginForm.classList.toggle('hidden', !loginMode);
  institutionRegisterForm.classList.toggle('hidden', loginMode);

  institutionLoginMessage.textContent = '';
  institutionRegisterMessage.textContent = '';
}

let institutionSessionUser = null;

institutionAuth.onAuthStateChanged(user => {
  institutionSessionUser = user || null;

  const institutionLoginBtnLabel = document.getElementById('institutionLoginBtnLabel');

  if (user) {
    if (institutionLoginBtnLabel) institutionLoginBtnLabel.textContent = 'Kurum Panelim';
    institutionLoginBtn.dataset.loggedIn = 'true';
  } else {
    if (institutionLoginBtnLabel) institutionLoginBtnLabel.textContent = 'Kurum Paneli';
    institutionLoginBtn.dataset.loggedIn = 'false';
  }
});

institutionLoginBtn.addEventListener('click', async () => {
  setInstitutionActionsMenu(false);

  if (institutionSessionUser) {
    try {
      const accountDoc =
        await institutionDb.collection('institutionUsers')
          .doc(institutionSessionUser.uid)
          .get();

      if (accountDoc.exists && accountDoc.data().status === 'approved') {
        window.location.replace('institution.html?session=institution');
        return;
      }

      setInstitutionAccessMode('login');
      openModal('institutionAccessModal');

      institutionLoginMessage.textContent =
        accountDoc.exists
          ? 'Kurum hesabınız henüz yönetici onayında.'
          : 'Bu kullanıcıya bağlı kurum hesabı bulunamadı.';
      return;
    } catch (error) {
      console.error('Kurum oturumu kontrol edilemedi:', error);
    }
  }

  setInstitutionAccessMode('login');
  openModal('institutionAccessModal');
});

institutionLoginTab.addEventListener('click', () => setInstitutionAccessMode('login'));
institutionRegisterTab.addEventListener('click', () => setInstitutionAccessMode('register'));

async function loadInstitutionRegistrationOptions() {
  const select = document.getElementById('institutionAccountInstitution');
  select.innerHTML = '<option value="">Kurumlar yükleniyor...</option>';

  try {
    const snapshot = await db.collection('institutions').get();
    const rows = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr'));

    select.innerHTML = '<option value="">Kurumunuzu seçin</option>';

    rows.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent =
        (item.name || 'Kurum') +
        ([item.city, item.district].filter(Boolean).length
          ? ' — ' + [item.city, item.district].filter(Boolean).join(' / ')
          : '');
      option.dataset.name = item.name || 'Kurum';
      select.appendChild(option);
    });

    if (!rows.length) {
      select.innerHTML = '<option value="">Henüz onaylı kurum bulunmuyor</option>';
    }
  } catch (error) {
    console.error('Kurum hesap listesi yüklenemedi:', error);
    select.innerHTML = '<option value="">Kurumlar yüklenemedi</option>';
  }
}

institutionRegisterForm.addEventListener('submit', async e => {
  e.preventDefault();

  const institutionSelect = document.getElementById('institutionAccountInstitution');
  const institutionId = institutionSelect.value;
  const institutionName =
    institutionSelect.options[institutionSelect.selectedIndex]?.dataset.name || '';
  const email = document.getElementById('institutionRegisterEmail').value.trim();
  const password = document.getElementById('institutionRegisterPassword').value;

  institutionRegisterMessage.textContent = 'Hesap oluşturuluyor...';

  let createdUser = null;

  try {
    const credential =
      await institutionRegistrationAuth.createUserWithEmailAndPassword(email, password);

    createdUser = credential.user;

    await institutionRegistrationDb.collection('institutionUsers').doc(createdUser.uid).set({
      email,
      institutionId,
      institutionName,
      status: 'pending',
      date: new Date().toISOString()
    });

    await institutionRegistrationAuth.signOut();

    institutionRegisterForm.reset();
    institutionRegisterMessage.textContent =
      'Başvurunuz alındı. Yönetici onayından sonra giriş yapabilirsiniz.';
  } catch (error) {
    console.error('Kurum hesabı oluşturulamadı:', error);

    if (createdUser) {
      try { await createdUser.delete(); } catch (_) {}
    }

    const messages = {
      'auth/email-already-in-use': 'Bu e-posta ile daha önce hesap oluşturulmuş.',
      'auth/invalid-email': 'Geçerli bir e-posta adresi yazın.',
      'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
      'permission-denied': 'Kurum hesabı kaydedilemedi. Firestore yetkisini kontrol edin.'
    };

    institutionRegisterMessage.textContent =
      messages[error.code] || 'Hesap oluşturulamadı. Lütfen tekrar deneyin.';
  }
});

institutionLoginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = document.getElementById('institutionLoginEmail').value.trim();
  const password = document.getElementById('institutionLoginPassword').value;
  const rememberMe = document.getElementById('institutionRememberMe').checked;

  institutionLoginMessage.textContent = 'Giriş yapılıyor...';

  let credential;

  try {
    await institutionAuth.setPersistence(
      rememberMe
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION
    );

    credential = await institutionAuth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Kurum Firebase Auth girişi başarısız:', error);

    const authMessages = {
      'auth/invalid-credential': 'E-posta veya şifre doğru değil.',
      'auth/wrong-password': 'Şifre doğru değil.',
      'auth/user-not-found': 'Bu e-posta ile kayıtlı bir hesap bulunamadı.',
      'auth/invalid-email': 'E-posta adresi geçerli değil.',
      'auth/too-many-requests': 'Çok fazla giriş denemesi yapıldı. Bir süre sonra tekrar deneyin.',
      'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.'
    };

    institutionLoginMessage.textContent =
      authMessages[error.code] || `Giriş yapılamadı: ${error.code || 'bilinmeyen hata'}`;
    return;
  }

  try {
    const accountDoc = await institutionDb.collection('institutionUsers').doc(credential.user.uid).get();

    if (!accountDoc.exists) {
      await institutionAuth.signOut();
      institutionLoginMessage.textContent =
        'Giriş başarılı ancak bu kullanıcıya bağlı kurum hesabı bulunamadı.';
      return;
    }

    const account = accountDoc.data();

    if (account.status !== 'approved') {
      await institutionAuth.signOut();
      institutionLoginMessage.textContent =
        account.status === 'rejected'
          ? 'Kurum hesabı başvurunuz onaylanmadı.'
          : 'Kurum hesabınız henüz yönetici onayında.';
      return;
    }

    window.location.replace('institution.html?session=institution');
  } catch (error) {
    console.error('Kurum hesabı Firestore kontrolü başarısız:', error);
    await institutionAuth.signOut();

    institutionLoginMessage.textContent =
      error.code === 'permission-denied'
        ? 'Giriş başarılı ancak kurum hesabı bilgisi okunamadı. Firestore yetkisini kontrol edin.'
        : `Giriş başarılı ancak kurum hesabı kontrol edilemedi: ${error.code || 'bilinmeyen hata'}`;
  }
});

document.getElementById('institutionForgotPasswordBtn').addEventListener('click', async () => {
  const email = document.getElementById('institutionLoginEmail').value.trim();

  if (!email) {
    institutionLoginMessage.textContent =
      'Önce giriş yaptığınız e-posta adresini yazın.';
    return;
  }

  institutionLoginMessage.textContent = 'Şifre yenileme bağlantısı gönderiliyor...';

  try {
    await institutionAuth.sendPasswordResetEmail(email);
    institutionLoginMessage.textContent =
      'Şifre yenileme bağlantısı e-posta adresinize gönderildi.';
  } catch (error) {
    console.error('Şifre yenileme hatası:', error);

    const resetMessages = {
      'auth/invalid-email': 'Geçerli bir e-posta adresi yazın.',
      'auth/user-not-found': 'Bu e-posta ile kayıtlı hesap bulunamadı.'
    };

    institutionLoginMessage.textContent =
      resetMessages[error.code] || `Şifre yenileme gönderilemedi: ${error.code || 'bilinmeyen hata'}`;
  }
});


document.getElementById('heroQuoteBtn')?.addEventListener('click', () => {
  openModal('quoteModal');
});

document.getElementById('heroInstitutionBtn')?.addEventListener('click', () => {
  document.getElementById('institutionAddBtn')?.click();
});

['howQuoteBtn', 'trustQuoteBtn', 'footerQuoteBtn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    openModal('quoteModal');
  });
});

['businessAddBtn', 'footerInstitutionBtn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.getElementById('institutionAddBtn')?.click();
  });
});

document.getElementById('businessPanelBtn')?.addEventListener('click', () => {
  document.getElementById('institutionLoginBtn')?.click();
});

document.getElementById('exploreScrollBtn')?.addEventListener('click', () => {
  document.getElementById('exploreSection')?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });
});

loadMainLocationProvinces();
loadProvinces();
loadQuoteProvinces();
loadInstitutionRegistrationOptions();
renderList();
renderDetail();
loadApprovedInstitutions();
