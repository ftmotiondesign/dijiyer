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

let regionalBannerAds = [];
let regionalBannerUnsubscribe = null;
let regionalBannerTimer = null;
let regionalBannerIndex = 0;
let regionalBannerRegionFilter = "";
let regionalBannerSectorFilter = "";

let premiumShowcaseTimer = null;
let premiumShowcaseIndex = 0;
const PREMIUM_SHOWCASE_DURATION = 5500;

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

function getSortedCategoryEntries() {
  return Object.entries(categoryTaxonomy).sort(([keyA, a], [keyB, b]) => {
    if (keyA === 'diger') return 1;
    if (keyB === 'diger') return -1;
    return String(a.label || '').localeCompare(String(b.label || ''), 'tr');
  });
}

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

function getSortedMainCategories() {
  return Object.entries(categoryTaxonomy).sort(([keyA,a],[keyB,b]) => {
    if (keyA === 'diger') return 1;
    if (keyB === 'diger') return -1;

    return String(a.label || '').localeCompare(
      String(b.label || ''),
      'tr',
      { sensitivity:'base' }
    );
  });
}

function populateMainCategorySelect(selectId, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">' + placeholder + '</option>' +
    getSortedMainCategories()
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

  root.innerHTML = getSortedMainCategories().map(([mainKey,item]) => {
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

function syncExploreQuickFilterState() {
  const videoOnly = document.getElementById('videoOnly');
  const offerOnly = document.getElementById('offerOnly');

  document.getElementById('exploreVideoBtn')
    ?.classList.toggle('active', Boolean(videoOnly?.checked));
  document.getElementById('exploreOfferBtn')
    ?.classList.toggle('active', Boolean(offerOnly?.checked));

  const hasCategoryFilter = Boolean(
    document.querySelector('.categoryFilter:checked, .subCategoryFilter:checked')
  );
  const hasSearch = Boolean(
    document.getElementById('searchInput')?.value.trim()
  );
  const hasQuickFilter = Boolean(videoOnly?.checked || offerOnly?.checked);
  const hasLocationFilter = Boolean(activeLocationCity || activeLocationDistrict);

  document.getElementById('exploreClearFiltersBtn')
    ?.classList.toggle(
      'hidden',
      !(hasCategoryFilter || hasSearch || hasQuickFilter || hasLocationFilter)
    );
}

function syncMobileQuickFilterState() {
  const videoOnly = document.getElementById('videoOnly');
  const offerOnly = document.getElementById('offerOnly');
  document.getElementById('mobileVideoOnlyBtn')?.classList.toggle('active', Boolean(videoOnly?.checked));
  document.getElementById('mobileOfferOnlyBtn')?.classList.toggle('active', Boolean(offerOnly?.checked));
  syncExploreQuickFilterState();
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

  root.innerHTML = getSortedMainCategories().map(([key, item]) => `
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

// Konum değişkenleri hazır olduktan sonra mobil filtreleri oluştur.
renderMobileCategories();

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

  const exploreResultCount = document.getElementById('exploreResultCount');
  const exploreResultLabel = document.getElementById('exploreResultLabel');

  if (exploreResultCount) exploreResultCount.textContent = data.length;
  if (exploreResultLabel) {
    exploreResultLabel.textContent =
      data.length === 1 ? 'kurum listeleniyor' : 'kurum listeleniyor';
  }

  syncExploreQuickFilterState();
  renderSponsoredAds();

  list.innerHTML = data.map(inst => `
    <article class="institution-card ${String(inst.id) === String(selectedId) ? 'active' : ''}" data-id="${inst.id}">
      <div class="thumb ${inst.logoUrl ? 'has-logo' : ''}">
        ${inst.logoUrl
          ? '<img src="' + safePublicProfileUrl(inst.logoUrl) + '" alt="' + escapeHtml(inst.name) + ' logosu">'
          : '<span>' + inst.emoji + '</span>'}
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
      window.location.href =
        'kurum.html?id=' + encodeURIComponent(card.dataset.id);
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

function isInstitutionPreviewMode(){
  const params=new URLSearchParams(window.location.search);
  return params.get("onizleme")==="1" && Boolean(params.get("kurum"));
}

function getRequestedInstitutionId(){
  const params=new URLSearchParams(window.location.search);
  return String(params.get("kurum")||"").trim();
}

function applyRequestedInstitutionPreview(){
  const requestedId=getRequestedInstitutionId();
  if(!requestedId)return false;

  const inst=institutions.find(item=>String(item.id)===requestedId);
  if(!inst)return false;

  // Önizlemede kurumun kendi şehri/ilçesi seçilsin; varsayılan filtre seçimi
  // profil görünümünü yanlışlıkla başka kuruma çevirmesin.
  activeLocationCity=inst.city || "";
  activeLocationDistrict=inst.district || "";

  document.querySelectorAll(".categoryFilter,.subCategoryFilter").forEach(input=>{
    input.checked=false;
  });
  const videoOnlyInput=document.getElementById("videoOnly");
  const offerOnlyInput=document.getElementById("offerOnly");
  if(videoOnlyInput)videoOnlyInput.checked=false;
  if(offerOnlyInput)offerOnlyInput.checked=false;

  selectedId=inst.id;
  updateMainLocationButton();
  renderMobileCategories();
  renderList();
  renderDetail();

  const params=new URLSearchParams(window.location.search);
  if(params.get("teklif")==="1"){
    const mainCategory=inst.mainCategory || resolveTaxonomy(inst)[0];
    const subCategory=inst.subCategory || resolveTaxonomy(inst)[1];
    const categorySelect=document.getElementById("quoteCategory");
    const serviceSelect=document.getElementById("quoteService");

    if(categorySelect){
      categorySelect.value=mainCategory || "";
      fillQuoteServices(mainCategory || "");
    }
    if(serviceSelect && subCategory){
      serviceSelect.value=subCategory;
    }

    setTimeout(()=>openModal("quoteModal"),80);
  }else{
    requestAnimationFrame(()=>{
      const panel=document.getElementById("detailPanel");
      if(panel){
        panel.id="kurum-profili";
        panel.scrollIntoView({behavior:"smooth",block:"start"});
      }
    });
  }

  return true;
}

function safePublicProfileUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (_) {
    return "";
  }
}

function publicInstagramUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("@")) {
    return "https://www.instagram.com/" + encodeURIComponent(raw.slice(1));
  }
  if (/^[a-zA-Z0-9._]+$/.test(raw)) {
    return "https://www.instagram.com/" + encodeURIComponent(raw);
  }
  return safePublicProfileUrl(raw);
}

function normalizeWhatsappNumber(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "90" + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith("5")) {
    digits = "90" + digits;
  }
  return digits;
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
    ${isInstitutionPreviewMode() ? `
      <div class="public-preview-banner">
        <div>
          <strong>👁 Önizleme Modu</strong>
          <span>Müşteriler kurum profilinizi bu şekilde görür.</span>
        </div>
        <button type="button" id="closePublicPreviewBtn">Önizlemeyi Kapat</button>
      </div>
    ` : ""}
    <div class="detail-top">
      <div class="video-box profile-cover-box ${inst.coverUrl ? 'has-cover' : ''}">
        ${inst.coverUrl
          ? '<img src="' + safePublicProfileUrl(inst.coverUrl) + '" alt="' + escapeHtml(inst.name) + ' kapak görseli">'
          : '<div class="video-scene"></div><div class="play">▶</div><div class="video-title">🎥 Rota & Mekan Videosu</div>'}
      </div>

      <div class="detail-info">
        <div class="profile-title-row">
          ${inst.logoUrl
            ? '<img class="public-profile-logo" src="' + safePublicProfileUrl(inst.logoUrl) + '" alt="' + escapeHtml(inst.name) + ' logosu">'
            : '<div class="public-profile-logo fallback">' + (inst.emoji || '🏢') + '</div>'}
          <div>
            <h1>${inst.name}${inst.vip ? '<span class="vip-inline">VIP</span>' : ''}</h1>
            <div class="rating" id="detailRating">⭐ ${inst.rating} <span>(${inst.reviewCount} değerlendirme)</span></div>
          </div>
        </div>

        <div class="address">📍 ${[inst.address, inst.location].filter(Boolean).join(', ')}</div>

        ${inst.description
          ? '<div class="public-profile-description">' + escapeHtml(inst.description) + '</div>'
          : ''}

        <div class="info-boxes public-profile-info-boxes">
          <div class="info-box">
            <strong>🧭 Hizmet Bölgesi</strong>
            <div>${escapeHtml(inst.serviceAreas || inst.location || '-')}</div>
          </div>
          <div class="info-box">
            <strong>🕒 Çalışma Saatleri</strong>
            <div class="public-hours-row"><span>Hafta içi</span><b>${escapeHtml(inst.weekdayHours || '-')}</b></div>
            <div class="public-hours-row"><span>Cumartesi</span><b>${escapeHtml(inst.saturdayHours || '-')}</b></div>
            <div class="public-hours-row"><span>Pazar</span><b>${escapeHtml(inst.sundayHours || '-')}</b></div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-row">
      <button class="cta whatsapp" id="whatsappBtn">💬 WhatsApp ile Fiyat Al</button>
      <button class="cta offer" id="quoteBtn">📄 Toplu Teklif Al</button>
    </div>

    <div class="secondary-actions public-profile-actions">
      <button id="routeBtn">🧭 Yol Tarifi Al</button>
      ${inst.website ? '<button id="websiteBtn">🌐 Web Sitesi</button>' : ''}
      ${inst.instagram ? '<button id="instagramBtn">📷 Instagram</button>' : ''}
      <button id="reviewBtn">⭐ Yorum Yap / Puan Ver</button>
      <button id="favoriteBtn">♡ Favoriye Ekle</button>
    </div>

    <div class="gallery-head">
      <h3>🖼️ Kurum Galerisi</h3>
      <small>${Array.isArray(inst.galleryUrls) && inst.galleryUrls.length ? inst.galleryUrls.length + ' görsel' : 'Henüz görsel eklenmedi'}</small>
    </div>
    <div class="gallery public-profile-gallery">
      ${Array.isArray(inst.galleryUrls) && inst.galleryUrls.length
        ? inst.galleryUrls.slice(0,6).map((url,index) =>
            '<div class="gallery-item has-image"><img src="' + safePublicProfileUrl(url) + '" alt="Galeri görseli ' + (index + 1) + '"></div>'
          ).join('')
        : '<div class="gallery-empty">Kurum henüz galeri görseli eklemedi.</div>'}
    </div>

    <section class="regional-banner-zone hidden" id="regionalBannerZone">
      <div class="regional-banner-head">
        <div>
          <span>SPONSORLU</span>
          <strong>Bölgenizde Öne Çıkanlar</strong>
        </div>
        <div class="regional-banner-filters">
          <select id="regionalBannerRegionFilter" aria-label="Reklam bölgesi">
            <option value="">Tüm Bölgeler</option>
          </select>
          <select id="regionalBannerSectorFilter" aria-label="Reklam sektörü">
            <option value="">Tüm Sektörler</option>
          </select>
        </div>
      </div>
      <div id="regionalBannerStage" class="regional-banner-stage"></div>
    </section>

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

  document.getElementById('closePublicPreviewBtn')?.addEventListener('click',()=>{
    const url=new URL(window.location.href);
    url.searchParams.delete("onizleme");
    url.searchParams.delete("kurum");
    url.hash="";
    window.location.href=url.toString();
  });

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
    const number = normalizeWhatsappNumber(inst.whatsapp || inst.phone);
    window.open(number
      ? `https://wa.me/${number}?text=${msg}`
      : `https://wa.me/?text=${msg}`, '_blank');
  };

  document.getElementById('websiteBtn')?.addEventListener('click', () => {
    const url = safePublicProfileUrl(inst.website);
    if (url) window.open(url, '_blank', 'noopener');
  });

  document.getElementById('instagramBtn')?.addEventListener('click', () => {
    const url = publicInstagramUrl(inst.instagram);
    if (url) window.open(url, '_blank', 'noopener');
  });

  document.getElementById('favoriteBtn').onclick = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favs.includes(inst.id)) favs.push(inst.id);
    localStorage.setItem('favorites', JSON.stringify(favs));
    showToast('Kurum favorilere eklendi.');
  };

  setupRegionalBannerZone();
}


function bannerCategoryLabel(value){
  if(!value)return "Tüm Sektörler";
  for(const [mainKey,main] of Object.entries(categoryTaxonomy)){
    if(mainKey===value)return main.label||value;
    if(main.subs?.[value])return main.subs[value];
  }
  return value;
}

function activeRegionalBannerAds(){
  const today=localDayKey();
  return regionalBannerAds.filter(ad=>{
    if(ad.active===false)return false;
    if(ad.startAt && String(ad.startAt)>today)return false;
    if(ad.endAt && String(ad.endAt)<today)return false;
    return true;
  });
}

function regionalBannerRegionValue(ad){
  return [ad.city||"",ad.district||""].join("|");
}

function populateRegionalBannerFilters(){
  const region=document.getElementById("regionalBannerRegionFilter");
  const sector=document.getElementById("regionalBannerSectorFilter");
  if(!region||!sector)return;
  const ads=activeRegionalBannerAds();
  const regionMap=new Map();
  ads.filter(ad=>ad.city).forEach(ad=>regionMap.set(regionalBannerRegionValue(ad),[ad.city,ad.district].filter(Boolean).join(" / ")));
  const regions=[...regionMap.entries()].sort((a,b)=>a[1].localeCompare(b[1],"tr"));
  const sectorMap=new Map();
  ads.filter(ad=>ad.category).forEach(ad=>sectorMap.set(String(ad.category),String(ad.categoryLabel||bannerCategoryLabel(ad.category))));
  const sectors=[...sectorMap.entries()].sort((a,b)=>a[1].localeCompare(b[1],"tr"));

  region.innerHTML='<option value="">Tüm Bölgeler</option>'+regions.map(([value,label])=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(label)+'</option>').join("");
  sector.innerHTML='<option value="">Tüm Sektörler</option>'+sectors.map(([value,label])=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(label)+'</option>').join("");
  region.value=regions.some(([value])=>value===regionalBannerRegionFilter)?regionalBannerRegionFilter:"";
  sector.value=sectors.some(([value])=>value===regionalBannerSectorFilter)?regionalBannerSectorFilter:"";
}

function filteredRegionalBannerAds(){
  let rows=activeRegionalBannerAds();
  if(regionalBannerRegionFilter){
    const parts=regionalBannerRegionFilter.split("|");
    const city=parts[0]||"";
    const district=parts[1]||"";
    rows=rows.filter(ad=>{
      if(!ad.city)return true;
      if(String(ad.city)!==String(city))return false;
      if(ad.district && String(ad.district)!==String(district))return false;
      return true;
    });
  }
  if(regionalBannerSectorFilter){
    rows=rows.filter(ad=>!ad.category||String(ad.category)===String(regionalBannerSectorFilter));
  }
  return rows;
}

function renderRegionalBannerCarousel(reset=false){
  const zone=document.getElementById("regionalBannerZone");
  const stage=document.getElementById("regionalBannerStage");
  if(!zone||!stage)return;
  clearTimeout(regionalBannerTimer);
  regionalBannerTimer=null;
  const active=activeRegionalBannerAds();
  if(!active.length){zone.classList.add("hidden");return;}
  zone.classList.remove("hidden");
  populateRegionalBannerFilters();
  const ads=filteredRegionalBannerAds();
  if(!ads.length){stage.innerHTML='<div class="regional-banner-empty">Bu bölge / sektör seçimi için aktif banner reklamı bulunmuyor.</div>';return;}
  if(reset||regionalBannerIndex>=ads.length)regionalBannerIndex=0;
  const ad=ads[regionalBannerIndex];
  const image=safePublicProfileUrl(ad.imageUrl||ad.logoUrl||"");
  const href="kurum.html?id="+encodeURIComponent(ad.institutionId||"");
  const regionText=[ad.city,ad.district].filter(Boolean).join(" / ");
  const sectorText=ad.categoryLabel||bannerCategoryLabel(ad.category);
  const duration=Number(ad.durationSeconds)===3?3:5;

  stage.innerHTML=
    '<a class="regional-banner-card '+(image?"has-image":"")+'" href="'+href+'">'+
      (image?'<img src="'+image+'" alt="'+escapeHtml(ad.institutionName||"Sponsorlu kurum")+'">':"")+
      '<div class="regional-banner-overlay"></div>'+
      '<div class="regional-banner-copy">'+
        '<span class="regional-banner-sponsored">SPONSORLU</span>'+
        '<strong>'+escapeHtml(ad.headline||ad.institutionName||"Sponsorlu Kurum")+'</strong>'+
        '<p>'+escapeHtml(ad.text||"")+'</p>'+
        '<small>'+escapeHtml([regionText,sectorText].filter(Boolean).join(" · "))+'</small>'+
      '</div>'+
      '<span class="regional-banner-cta">Kurumu Gör →</span>'+
      '<i class="regional-banner-progress" style="--banner-duration:'+duration+'s"></i>'+
    '</a>'+
    (ads.length>1?'<div class="regional-banner-dots">'+ads.map((_,index)=>'<button type="button" data-banner-index="'+index+'" class="'+(index===regionalBannerIndex?"active":"")+'" aria-label="Reklam '+(index+1)+'"></button>').join("")+'</div>':"");

  stage.querySelectorAll("[data-banner-index]").forEach(button=>{
    button.addEventListener("click",()=>{regionalBannerIndex=Number(button.dataset.bannerIndex||0);renderRegionalBannerCarousel(false);});
  });
  if(ads.length>1){
    regionalBannerTimer=setTimeout(()=>{regionalBannerIndex=(regionalBannerIndex+1)%ads.length;renderRegionalBannerCarousel(false);},duration*1000);
  }
}

function setupRegionalBannerZone(){
  const region=document.getElementById("regionalBannerRegionFilter");
  const sector=document.getElementById("regionalBannerSectorFilter");
  if(!region||!sector)return;
  populateRegionalBannerFilters();
  region.onchange=()=>{regionalBannerRegionFilter=region.value||"";regionalBannerIndex=0;renderRegionalBannerCarousel(true);};
  sector.onchange=()=>{regionalBannerSectorFilter=sector.value||"";regionalBannerIndex=0;renderRegionalBannerCarousel(true);};
  renderRegionalBannerCarousel(true);
}

function startRegionalBannerAds(){
  if(regionalBannerUnsubscribe)regionalBannerUnsubscribe();
  regionalBannerUnsubscribe=db.collection("bannerAds").where("active","==",true).onSnapshot(snapshot=>{
    regionalBannerAds=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
    regionalBannerIndex=0;
    if(document.getElementById("regionalBannerZone"))setupRegionalBannerZone();
  },error=>{
    console.warn("Banner reklamları yüklenemedi:",error);
    regionalBannerAds=[];
    document.getElementById("regionalBannerZone")?.classList.add("hidden");
  });
}

function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function trackInstitutionEvent(inst, type, deduplicate = false) {
  if (!inst || inst.source !== 'firestore') return;
  if (isInstitutionPreviewMode()) return;

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

// data-close delegated handler
document.addEventListener('click', event => {
  const closeButton = event.target.closest('[data-close]');
  if (!closeButton) return;
  event.preventDefault();
  event.stopPropagation();
  closeModal(closeButton.dataset.close);
});

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

document.getElementById('exploreOfferBtn')?.addEventListener('click', () => {
  const input = document.getElementById('offerOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
});

document.getElementById('exploreVideoBtn')?.addEventListener('click', () => {
  const input = document.getElementById('videoOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
});

document.getElementById('exploreLocationBtn')?.addEventListener('click', () => {
  locationBtn?.scrollIntoView({ behavior:'smooth', block:'center' });
  setTimeout(() => setLocationPopover(true), 350);
});

document.getElementById('exploreClearFiltersBtn')?.addEventListener('click', () => {
  clearAllCategorySelections();

  const search = document.getElementById('searchInput');
  const videoOnly = document.getElementById('videoOnly');
  const offerOnly = document.getElementById('offerOnly');

  if (search) search.value = '';
  if (videoOnly) videoOnly.checked = false;
  if (offerOnly) offerOnly.checked = false;

  activeLocationCity = '';
  activeLocationDistrict = '';

  if (mainLocationCity) mainLocationCity.value = '';
  if (mainLocationDistrict) {
    mainLocationDistrict.innerHTML = '<option value="">Tüm İlçeler</option>';
    mainLocationDistrict.disabled = true;
  }

  updateMainLocationButton();
  renderMobileCategories();
  syncMobileQuickFilterState();
  renderList();

  try { map.setView([39.0, 35.0], 6); } catch (_) {}
  showToast('Filtreler temizlendi.');
});

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
  const exploreLocationText = document.getElementById('exploreLocationText');

  if (!activeLocationCity) {
    locationBtnText.textContent = 'Tüm Türkiye';
    if (exploreLocationText) exploreLocationText.textContent = 'Tüm Türkiye';
    syncExploreQuickFilterState();
    return;
  }

  const label = activeLocationDistrict
    ? activeLocationCity + ', ' + activeLocationDistrict
    : activeLocationCity;

  locationBtnText.textContent = label;
  if (exploreLocationText) exploreLocationText.textContent = label;
  syncExploreQuickFilterState();
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
        whatsapp: data.whatsapp || data.phone || '',
        website: data.website || '',
        instagram: data.instagram || '',
        description: data.description || '',
        logoUrl: safePublicProfileUrl(data.logoUrl || ''),
        coverUrl: safePublicProfileUrl(data.coverUrl || ''),
        serviceAreas: data.serviceAreas || '',
        weekdayHours: data.weekdayHours || '',
        saturdayHours: data.saturdayHours || '',
        sundayHours: data.sundayHours || '',
        galleryUrls: Array.isArray(data.galleryUrls)
          ? data.galleryUrls.map(safePublicProfileUrl).filter(Boolean).slice(0,6)
          : [],
        classes: data.classes || 'Bilgi eklenecek',
        video: Boolean(data.video),
        offer: data.offer !== false,
        vip: Boolean(data.vip),
        adStatus: String(data.adStatus || 'none'),
        adPackage: String(data.adPackage || ''),
        adStartAt: data.adStartAt || '',
        adEndAt: data.adEndAt || '',
        adBannerUrl: safePublicProfileUrl(data.adBannerUrl || data.bannerUrl || data.campaignBannerUrl || ''),
        adHeadline: String(data.adHeadline || data.campaignTitle || ''),
        adText: String(data.adText || data.campaignText || ''),
        adCta: String(data.adCta || ''),
        lat: Number.isFinite(data.lat) ? data.lat : null,
        lng: Number.isFinite(data.lng) ? data.lng : null,
        emoji: data.emoji || '🏢'
      });
    });

    addMarkers();
    if(!applyRequestedInstitutionPreview()){
      renderList();
      renderDetail();
    }
  } catch (error) {
    console.error('Onaylı kurumlar yüklenemedi:', error);
  }
}



/* =========================================================
   ANA SAYFA SPONSORLU ALANLAR
   Reklamlar organik kurum sıralamasına karışmaz.
   ========================================================= */

function getHomepageAdPackageLabel(packageId) {
  const labels = {
    starter: 'Başlangıç Görünürlüğü',
    regional: 'Bölgesel Vitrin',
    video: 'Video Tanıtım',
    premium: 'Premium Tanıtım'
  };
  return labels[String(packageId || '')] || 'Dijiyer Vitrini';
}

function parseHomepageAdDate(value, endOfDay = false) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const date = new Date(
    raw.length <= 10
      ? raw + (endOfDay ? 'T23:59:59' : 'T00:00:00')
      : raw
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function isHomepageAdActive(inst) {
  if (!inst || inst.source !== 'firestore') return false;
  if (String(inst.adStatus || 'none') !== 'active') return false;

  const now = Date.now();
  const start = parseHomepageAdDate(inst.adStartAt, false);
  const end = parseHomepageAdDate(inst.adEndAt, true);

  if (start && now < start.getTime()) return false;
  if (end && now > end.getTime()) return false;

  return true;
}

function matchesHomepageAdLocation(inst) {
  if (String(inst.adPackage || '') !== 'regional') return true;

  const city = normalizeQuoteSearch(inst.city || String(inst.location || '').split(',')[0] || '');
  const district = normalizeQuoteSearch(inst.district || String(inst.location || '').split(',')[1] || '');
  const activeCity = normalizeQuoteSearch(activeLocationCity || '');
  const activeDistrict = normalizeQuoteSearch(activeLocationDistrict || '');

  if (activeCity && city !== activeCity) return false;
  if (activeDistrict && district !== activeDistrict) return false;
  return true;
}

function getPremiumShowcaseInstitutions() {
  return institutions
    .filter(isHomepageAdActive)
    .filter(inst => String(inst.adPackage || '') === 'premium')
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr'))
    .slice(0, 5);
}

function premiumShowcaseCardHtml(inst) {
  const image = safePublicProfileUrl(inst.adBannerUrl || inst.coverUrl || '');
  const logo = safePublicProfileUrl(inst.logoUrl || '');
  const headline = String(inst.adHeadline || '').trim() || String(inst.name || 'Premium Marka');
  const text = String(inst.adText || '').trim() ||
    String(inst.description || '').trim() ||
    'Markayı, kampanyayı veya hizmeti Dijiyer ana sayfasının en görünür alanında keşfedin.';
  const cta = String(inst.adCta || '').trim() || 'İncele';
  const location = String(inst.location || [inst.city, inst.district].filter(Boolean).join(', ') || '').trim();

  return `
    <article
      class="premium-showcase-card"
      data-premium-id="${escapeHtml(String(inst.id))}"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(inst.name || 'Premium sponsorlu kurum')} reklamını aç"
    >
      <div class="premium-showcase-media">
        ${image
          ? '<img src="' + image + '" alt="' + escapeHtml(inst.name || 'Premium sponsorlu kurum') + '">'
          : '<div class="premium-showcase-fallback">' + escapeHtml(inst.emoji || '🏢') + '</div>'}
      </div>

      <div class="premium-showcase-overlay"></div>

      <div class="premium-showcase-content">
        <div class="premium-showcase-brand">
          <span class="premium-showcase-sponsored">PREMIUM SPONSORLU</span>
          ${logo
            ? '<span class="premium-showcase-logo"><img src="' + logo + '" alt=""></span>'
            : ''}
        </div>

        <div class="premium-showcase-copy">
          <strong>${escapeHtml(headline)}</strong>
          <p>${escapeHtml(text)}</p>
          ${location ? '<small>📍 ' + escapeHtml(location) + '</small>' : ''}
        </div>

        <span class="premium-showcase-cta">${escapeHtml(cta)} →</span>
      </div>

      <span class="premium-showcase-progress" style="--premium-duration:${PREMIUM_SHOWCASE_DURATION}ms"></span>
    </article>
  `;
}

function premiumShowcaseSalesHtml() {
  return `
    <div class="premium-showcase-empty">
      <div class="premium-showcase-empty-icon">◆</div>
      <div>
        <span>ANA SAYFANIN EN DEĞERLİ REKLAM ALANI</span>
        <strong>Markanızı Premium Vitrin'de öne çıkarın</strong>
        <small>Geniş görsel alan, ana sayfa görünürlüğü ve doğrudan kurum profilinize yönlendirme.</small>
      </div>
      <button type="button" data-advertise-home>Premium Reklam Ver</button>
    </div>
  `;
}

function trackPremiumShowcaseImpression(inst) {
  if (!inst || inst.source !== 'firestore') return;

  const day = new Date().toISOString().slice(0, 10);
  const key = 'dijiyer_premium_impression_' + day + '_' + String(inst.id);

  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  trackInstitutionEvent(inst, 'premium_ad_impression');
}

function openPremiumShowcaseInstitution(inst) {
  if (!inst) return;

  trackInstitutionEvent(inst, 'premium_ad_click');
  window.location.href = 'kurum.html?id=' + encodeURIComponent(inst.id);
}

function paintPremiumShowcase(ads) {
  const stage = document.getElementById('premiumShowcaseStage');
  const dots = document.getElementById('premiumShowcaseDots');
  if (!stage) return;

  if (!ads.length) {
    stage.innerHTML = premiumShowcaseSalesHtml();
    if (dots) dots.innerHTML = '';
    bindHomepageAdvertiseButtons();
    return;
  }

  premiumShowcaseIndex =
    ((premiumShowcaseIndex % ads.length) + ads.length) % ads.length;

  const active = ads[premiumShowcaseIndex];
  stage.innerHTML = premiumShowcaseCardHtml(active);

  const card = stage.querySelector('[data-premium-id]');
  if (card) {
    const open = () => openPremiumShowcaseInstitution(active);

    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  }

  if (dots) {
    dots.innerHTML = ads.length > 1
      ? ads.map((_, index) =>
          '<button type="button" class="' +
          (index === premiumShowcaseIndex ? 'active' : '') +
          '" data-premium-slide="' + index +
          '" aria-label="' + (index + 1) + '. premium reklam"></button>'
        ).join('')
      : '';

    dots.querySelectorAll('[data-premium-slide]').forEach(button => {
      button.addEventListener('click', () => {
        premiumShowcaseIndex = Number(button.dataset.premiumSlide || 0);
        renderPremiumShowcase(true);
      });
    });
  }

  trackPremiumShowcaseImpression(active);
}

function renderPremiumShowcase(restartTimer = false) {
  const stage = document.getElementById('premiumShowcaseStage');
  if (!stage) return;

  const ads = getPremiumShowcaseInstitutions();

  if (premiumShowcaseTimer) {
    clearInterval(premiumShowcaseTimer);
    premiumShowcaseTimer = null;
  }

  paintPremiumShowcase(ads);

  if (ads.length > 1) {
    premiumShowcaseTimer = setInterval(() => {
      premiumShowcaseIndex = (premiumShowcaseIndex + 1) % ads.length;
      paintPremiumShowcase(ads);
    }, PREMIUM_SHOWCASE_DURATION);
  }

  if (restartTimer) bindHomepageAdvertiseButtons();
}

function getHomepageSponsoredInstitutions() {
  const priority = { premium: 4, video: 3, regional: 2, starter: 1 };

  return institutions
    .filter(isHomepageAdActive)
    .filter(inst => String(inst.adPackage || '') !== 'premium')
    .filter(matchesHomepageAdLocation)
    .sort((a, b) => {
      const packageDiff =
        (priority[String(b.adPackage || '')] || 0) -
        (priority[String(a.adPackage || '')] || 0);

      if (packageDiff) return packageDiff;

      return String(a.name || '').localeCompare(String(b.name || ''), 'tr');
    })
    .slice(0, 3);
}

function homepageSponsoredCardHtml(inst) {
  const cover = safePublicProfileUrl(inst.coverUrl || '');
  const logo = safePublicProfileUrl(inst.logoUrl || '');
  const description = String(inst.description || '').trim() ||
    'Kurum profilini, hizmetlerini ve iletişim bilgilerini inceleyin.';
  const ratingText = Number(inst.reviewCount || 0) > 0
    ? '⭐ ' + Number(inst.rating || 0).toFixed(1) + ' · ' + Number(inst.reviewCount || 0) + ' değerlendirme'
    : 'Yeni sponsorlu kurum';

  return `
    <article
      class="sponsored-card"
      data-sponsored-id="${escapeHtml(String(inst.id))}"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(inst.name || 'Sponsorlu kurum')} profilini aç"
    >
      <div class="sponsored-media">
        ${cover
          ? '<img src="' + cover + '" alt="' + escapeHtml(inst.name || 'Kurum') + '">'
          : '<div class="sponsored-media-fallback">' + escapeHtml(inst.emoji || '🏢') + '</div>'}
        <span class="sponsored-label">SPONSORLU</span>
        <span class="sponsored-package">${escapeHtml(getHomepageAdPackageLabel(inst.adPackage))}</span>
      </div>

      <div class="sponsored-body">
        <div class="sponsored-title-row">
          <div class="sponsored-logo">
            ${logo
              ? '<img src="' + logo + '" alt="">'
              : escapeHtml(inst.emoji || '🏢')}
          </div>
          <div class="sponsored-title-copy">
            <strong>${escapeHtml(inst.name || 'Kurum')}</strong>
            <small>📍 ${escapeHtml(inst.location || [inst.city, inst.district].filter(Boolean).join(', ') || 'Konum bilgisi')}</small>
          </div>
        </div>

        <p class="sponsored-description">${escapeHtml(description)}</p>

        <div class="sponsored-meta">
          <span class="sponsored-rating">${escapeHtml(ratingText)}</span>
          <span class="sponsored-profile-link">Profili Gör →</span>
        </div>
      </div>
    </article>
  `;
}

function homepageSponsoredSidebarHtml(inst) {
  const cover = safePublicProfileUrl(inst.coverUrl || '');
  return `
    <article class="sidebar-sponsored-card" data-sponsored-id="${escapeHtml(String(inst.id))}" role="link" tabindex="0">
      <div class="sidebar-sponsored-cover">
        ${cover
          ? '<img src="' + cover + '" alt="' + escapeHtml(inst.name || 'Sponsorlu kurum') + '">'
          : '<div class="sponsored-media-fallback">' + escapeHtml(inst.emoji || '🏢') + '</div>'}
        <span class="sponsored-label">SPONSORLU</span>
      </div>
      <div class="sidebar-sponsored-copy">
        <strong>${escapeHtml(inst.name || 'Kurum')}</strong>
        <small>📍 ${escapeHtml(inst.location || [inst.city, inst.district].filter(Boolean).join(', ') || '')}</small>
        <button type="button" tabindex="-1">Profili Gör</button>
      </div>
    </article>
  `;
}

function homepageAdSalesHtml() {
  return `
    <div class="sponsored-self-promo">
      <span class="sponsored-self-promo-icon">📣</span>
      <div>
        <strong>Bu alanda işletmeniz görünsün</strong>
        <small>Bölge ve sektörünüze göre potansiyel müşterilere ulaşın.</small>
      </div>
      <button type="button" data-advertise-home>Reklam Ver</button>
    </div>
  `;
}

function trackHomepageAdImpression(inst) {
  if (!inst || inst.source !== 'firestore') return;

  const day = new Date().toISOString().slice(0, 10);
  const key = 'dijiyer_ad_impression_' + day + '_' + String(inst.id);

  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  trackInstitutionEvent(inst, 'ad_impression');
}

function openSponsoredInstitution(inst) {
  if (!inst) return;

  trackInstitutionEvent(inst, 'ad_click');
  window.location.href = 'kurum.html?id=' + encodeURIComponent(inst.id);
}

function bindHomepageSponsoredCards(container) {
  if (!container) return;

  container.querySelectorAll('[data-sponsored-id]').forEach(card => {
    const open = () => {
      const inst = institutions.find(
        item => String(item.id) === String(card.dataset.sponsoredId)
      );
      openSponsoredInstitution(inst);
    };

    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
}

function institutionPanelDestination() {
  const showcaseIntent =
    sessionStorage.getItem('dijiyerInstitutionIntent') === 'showcase';

  return 'institution.html?session=institution' +
    (showcaseIntent ? '&tab=showcase' : '');
}

async function openAdvertisingCenter() {
  sessionStorage.setItem('dijiyerInstitutionIntent', 'showcase');

  if (institutionSessionUser) {
    try {
      const accountDoc =
        await institutionDb.collection('institutionUsers')
          .doc(institutionSessionUser.uid)
          .get();

      if (accountDoc.exists && accountDoc.data().status === 'approved') {
        window.location.replace(institutionPanelDestination());
        return;
      }
    } catch (error) {
      console.error('Reklam merkezi için kurum oturumu kontrol edilemedi:', error);
    }
  }

  setInstitutionAccessMode('login');
  openModal('institutionAccessModal');

  if (institutionLoginMessage) {
    institutionLoginMessage.textContent =
      'Reklam seçeneklerini görmek için kurum hesabınızla giriş yapın.';
  }
}

function bindHomepageAdvertiseButtons() {
  document.querySelectorAll('[data-advertise-home]').forEach(button => {
    if (button.dataset.advertiseBound === '1') return;
    button.dataset.advertiseBound = '1';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openAdvertisingCenter();
    });
  });
}

function renderSponsoredAds() {
  const rail = document.getElementById('homeSponsoredRail');
  const sidebar = document.getElementById('sidebarSponsoredSlot');
  const premiumStage = document.getElementById('premiumShowcaseStage');
  if (!rail && !sidebar && !premiumStage) return;

  renderPremiumShowcase();

  const sponsored = getHomepageSponsoredInstitutions();

  if (rail) {
    rail.innerHTML = sponsored.length
      ? sponsored.map(homepageSponsoredCardHtml).join('')
      : homepageAdSalesHtml();

    bindHomepageSponsoredCards(rail);
  }

  if (sidebar) {
    if (sponsored.length) {
      sidebar.innerHTML = homepageSponsoredSidebarHtml(sponsored[0]);
      bindHomepageSponsoredCards(sidebar);
    } else {
      sidebar.innerHTML = `
        <div class="sidebar-sponsored-placeholder">
          <span>SPONSORLU ALAN</span>
          <strong>İşletmeni burada göster</strong>
          <small>Ana sayfada görünürlüğünü artır.</small>
          <button type="button" data-advertise-home>Reklam Ver</button>
        </div>
      `;
    }
  }

  sponsored.forEach(trackHomepageAdImpression);
  bindHomepageAdvertiseButtons();
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
  sessionStorage.removeItem('dijiyerInstitutionIntent');
  setInstitutionActionsMenu(false);

  if (institutionSessionUser) {
    try {
      const accountDoc =
        await institutionDb.collection('institutionUsers')
          .doc(institutionSessionUser.uid)
          .get();

      if (accountDoc.exists && accountDoc.data().status === 'approved') {
        window.location.replace(institutionPanelDestination());
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

    window.location.replace(institutionPanelDestination());
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

bindHomepageAdvertiseButtons();

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


startRegionalBannerAds();
