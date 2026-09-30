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

let pageTopMiniBannerTimer = null;
let pageTopMiniBannerIndex = 0;

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

function clearDiscoveryKeywordForCategorySelection() {
  const mobileInput = document.getElementById('mobileDiscoverySearchInput');
  const desktopInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('mobileDiscoverySearchClear');
  const instantRoot = document.getElementById('mobileInstantResults');
  const fallback = document.getElementById('quoteSearchFallback');

  if (mobileInput) mobileInput.value = '';
  if (desktopInput) desktopInput.value = '';
  clearButton?.classList.add('hidden');
  instantRoot?.classList.add('hidden');
  fallback?.classList.add('hidden');
  document.getElementById('mobileCategoryResultBtn')?.setAttribute('aria-expanded','false');
}

function syncExploreQuickFilterState() {
  const videoOnly = document.getElementById('videoOnly');
  const offerOnly = document.getElementById('offerOnly');
  const tour360Only = document.getElementById('tour360Only');

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
  const hasQuickFilter = Boolean(
    videoOnly?.checked || offerOnly?.checked || tour360Only?.checked
  );
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
  const tour360Only = document.getElementById('tour360Only');

  document.getElementById('mobileVideoOnlyBtn')
    ?.classList.toggle('active', Boolean(videoOnly?.checked));
  document.getElementById('mobileOfferOnlyBtn')
    ?.classList.toggle('active', Boolean(offerOnly?.checked));
  document.getElementById('mobileTour360Btn')
    ?.classList.toggle('active', Boolean(tour360Only?.checked));

  syncExploreQuickFilterState();
}

function getSelectedMainCategory() {
  const checkedSub = document.querySelector('.subCategoryFilter:checked');
  if (checkedSub) return checkedSub.dataset.mainCategory || '';

  const checkedMain = document.querySelector('.categoryFilter:checked');
  return checkedMain?.value || '';
}

function openInstitutionDirectQuote(institutionOrId) {
  const id = typeof institutionOrId === 'object'
    ? institutionOrId?.id
    : institutionOrId;

  if (!id) return;

  window.location.href =
    'kurum.html?id=' + encodeURIComponent(String(id)) + '&teklif=1';
}

function mobileInstantInstitutionCardHtml(inst) {
  const cover = inst.coverUrl ? safePublicProfileUrl(inst.coverUrl) : '';
  const logo = inst.logoUrl ? safePublicProfileUrl(inst.logoUrl) : '';
  const visual = cover || logo;
  const location = [inst.district, inst.city].filter(Boolean).join(' / ') || inst.location || '';
  const rating = Number(inst.rating || 0).toFixed(1);

  return `
    <article class="mobile-instant-result-card" data-mobile-instant-id="${escapeHtml(String(inst.id))}">
      <div class="mobile-instant-result-logo ${visual ? 'has-logo' : ''} ${cover ? 'has-cover' : ''}">
        ${visual
          ? '<img src="' + visual + '" alt="' + escapeHtml(inst.name || 'Kurum') + (cover ? ' kapak görseli' : ' logosu') + '">'
          : '<span>' + escapeHtml(inst.emoji || '🏢') + '</span>'}
      </div>

      <div class="mobile-instant-result-copy">
        <strong>${escapeHtml(inst.name || 'Kurum')}</strong>
        <span>📍 ${escapeHtml(location || 'Konum bilgisi')}</span>
        <small>⭐ ${rating}${Number(inst.reviewCount || 0) ? ' · ' + Number(inst.reviewCount || 0) + ' değerlendirme' : ''}</small>
        <div>
          ${inst.offer ? '<em>Teklif veriyor</em>' : ''}
          ${inst.video ? '<em>🎥 Videolu</em>' : ''}
        </div>
      </div>

      <div class="mobile-instant-result-actions">
        <button type="button" data-mobile-instant-view="${escapeHtml(String(inst.id))}">Kurumu Gör</button>
        ${inst.offer
          ? '<button type="button" class="offer" data-mobile-instant-offer="' + escapeHtml(String(inst.id)) + '">Fiyat Al</button>'
          : ''}
      </div>
    </article>
  `;
}

function showMobileInstitutionResults(shouldScroll = true) {
  const root = document.getElementById('mobileInstantResults');
  const list = document.getElementById('mobileInstantResultsList');
  const title = document.getElementById('mobileInstantResultsTitle');
  const resultPanel = document.getElementById('mobileCategoryResult');

  if (!root || !list || !resultPanel) return;

  let data = [];
  try {
    data = getFilteredInstitutions();
  } catch (_) {
    data = [];
  }

  // Sonuçlar her zaman arama özetinin hemen altında açılsın.
  resultPanel.insertAdjacentElement('afterend', root);

  const keyword = String(
    document.getElementById('mobileDiscoverySearchInput')?.value || ''
  ).trim();

  if (title) {
    title.textContent = keyword
      ? '“' + keyword + '” için ' + data.length + ' kurum'
      : data.length + ' uygun kurum';
  }

  list.innerHTML = data.length
    ? data.slice(0, 8).map(mobileInstantInstitutionCardHtml).join('')
    : `
      <div class="mobile-instant-results-empty">
        <strong>Bu aramaya uygun kurum bulunamadı.</strong>
        <span>Arama kelimesini veya konumu değiştirerek tekrar deneyin.</span>
      </div>
    `;

  root.classList.remove('hidden');

  root.querySelectorAll('[data-mobile-instant-view]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const id = button.dataset.mobileInstantView;
      if (id) window.location.href = 'kurum.html?id=' + encodeURIComponent(id);
    });
  });

  root.querySelectorAll('[data-mobile-instant-offer]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      openInstitutionDirectQuote(button.dataset.mobileInstantOffer);
    });
  });

  root.querySelectorAll('[data-mobile-instant-id]').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      const id = card.dataset.mobileInstantId;
      if (id) window.location.href = 'kurum.html?id=' + encodeURIComponent(id);
    });
  });

  document.getElementById('mobileCategoryResultBtn')?.setAttribute('aria-expanded','true');

  if (shouldScroll) {
    /* Mobil klavye kapanırken viewport yüksekliği değişebiliyor.
       Eski davranış doğrudan mutlak konuma kaydırdığı için ilk kartlar
       ekranın üstünde kalabiliyordu. Artık yalnızca gerektiği kadar kaydır. */
    try { document.activeElement?.blur?.(); } catch (_) {}

    setTimeout(() => {
      const rect = root.getBoundingClientRect();
      const stickyOffset = 72;
      const comfortableTop = Math.max(stickyOffset, Math.round(window.innerHeight * .28));

      if (rect.top < stickyOffset) {
        window.scrollBy({
          top: rect.top - stickyOffset,
          behavior:'smooth'
        });
      } else if (rect.top > window.innerHeight - 120) {
        window.scrollBy({
          top: rect.top - comfortableTop,
          behavior:'smooth'
        });
      }
    }, 180);
  }
}

function scrollToMobileResults() {
  const resultsSection = document.getElementById('resultsSection');

  if (window.matchMedia('(max-width: 820px)').matches) {
    showMobileInstitutionResults(true);
    return;
  }

  resultsSection?.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });
}

function updateMobileCategoryResult() {
  const root = document.getElementById('mobileCategoryResult');
  if (!root) return;

  const activeMain = getSelectedMainCategory();
  const selectedSub = document.querySelector('.subCategoryFilter:checked');
  const keyword = String(
    document.getElementById('mobileDiscoverySearchInput')?.value ||
    document.getElementById('searchInput')?.value ||
    ''
  ).trim();

  if (!activeMain && !keyword) {
    root.classList.add('hidden');
    document.getElementById('quoteSearchFallback')?.classList.add('hidden');
    return;
  }

  const hasSubcategories =
    Object.keys(categoryTaxonomy[activeMain]?.subs || {}).length > 0;

  // Alt kategorisi olan bir ana kategoride, sonuç kutusunu
  // kullanıcı alt kategori seçtikten sonra göster.
  if (activeMain && hasSubcategories && !selectedSub && !keyword) {
    root.classList.add('hidden');
    document.getElementById('quoteSearchFallback')?.classList.add('hidden');
    return;
  }

  const mainLabel =
    activeMain
      ? (categoryTaxonomy[activeMain]?.label || activeMain)
      : '';

  const subLabel = selectedSub && activeMain
    ? categoryTaxonomy[activeMain]?.subs?.[selectedSub.value] || selectedSub.value
    : '';

  let count = 0;
  try {
    count = getFilteredInstitutions().length;
  } catch (_) {
    count = Number(document.getElementById('exploreResultCount')?.textContent || 0);
  }

  const label = document.getElementById('mobileCategoryResultLabel');
  const countEl = document.getElementById('mobileCategoryResultCount');
  const hint = document.getElementById('mobileCategoryResultHint');
  const locationEl = document.getElementById('mobileCategoryResultLocation');
  const offerBtn = document.getElementById('mobileCategoryOfferBtn');
  const videoBtn = document.getElementById('mobileCategoryVideoBtn');
  const resultBtn = document.getElementById('mobileCategoryResultBtn');
  const keywordHints = document.querySelector('.mobile-keyword-hints');
  const legacySubRoot = document.getElementById('mobileSubcategories');

  // Kelimeyle aramada sonuç özeti kategori kutularının altına kaçmasın.
  // Arama alanının hemen altında göster.
  if (keyword && keywordHints) {
    keywordHints.insertAdjacentElement('afterend', root);
  } else if (!keyword && selectedSub) {
    const inlineSubPanel = document.querySelector(
      '[data-mobile-inline-subs="' + activeMain + '"]'
    );
    if (inlineSubPanel) inlineSubPanel.appendChild(root);
  } else if (!keyword && legacySubRoot?.parentNode) {
    legacySubRoot.insertAdjacentElement('afterend', root);
  }

  root.classList.remove('hidden');

  if (label) {
    label.textContent = keyword
      ? '“' + keyword + '” araması'
      : (subLabel ? mainLabel + ' · ' + subLabel : mainLabel);
  }

  if (countEl) countEl.textContent = String(count);

  if (resultBtn) {
    resultBtn.textContent = count > 0
      ? (count === 1 ? '1 Sonucu Göster' : count + ' Sonucu Göster')
      : 'Sonuç Bulunamadı';
    resultBtn.disabled = count < 1;
    resultBtn.setAttribute('aria-expanded',
      String(!document.getElementById('mobileInstantResults')?.classList.contains('hidden'))
    );
  }

  if (hint) {
    const inferred = keyword ? inferQuoteCategory(keyword) : null;
    const inferredLabel = inferred
      ? categoryTaxonomy[inferred.mainCategory]?.subs?.[inferred.subCategory] || ''
      : '';

    hint.textContent = keyword
      ? (inferredLabel
          ? inferredLabel + ' dahil eşleşen kurumlar gösteriliyor.'
          : 'Kurum adı, hizmet, kategori ve konuma göre eşleşen sonuçlar.')
      : (subLabel || !hasSubcategories
          ? 'Uygun kurumları inceleyin, karşılaştırın veya teklif alın.'
          : 'Alt kategori seçerek sonuçları daha da daraltabilirsiniz.');
  }

  if (locationEl) {
    locationEl.textContent =
      [activeLocationCity, activeLocationDistrict].filter(Boolean).join(' / ') ||
      'Tüm bölgeler';
  }

  offerBtn?.classList.toggle('active', Boolean(document.getElementById('offerOnly')?.checked));
  videoBtn?.classList.toggle('active', Boolean(document.getElementById('videoOnly')?.checked));

  updateQuoteSearchFallback({
    keyword,
    count,
    activeMain,
    inferred: keyword ? inferQuoteCategory(keyword) : null
  });
}

function setMobileDiscoverySearch(value, options = {}) {
  const mobileInput = document.getElementById('mobileDiscoverySearchInput');
  const desktopInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('mobileDiscoverySearchClear');
  const nextValue = String(value || '');

  if (mobileInput && mobileInput.value !== nextValue) mobileInput.value = nextValue;
  if (desktopInput && desktopInput.value !== nextValue) desktopInput.value = nextValue;

  clearButton?.classList.toggle('hidden', !nextValue.trim());

  renderList();
  updateMobileCategoryResult();

  const instantRoot = document.getElementById('mobileInstantResults');
  if (instantRoot && !instantRoot.classList.contains('hidden')) {
    showMobileInstitutionResults(false);
  }

  if (options.scroll === true && nextValue.trim()) {
    setTimeout(scrollToMobileResults, 80);
  }
}

const mobileDiscoverySearchInput = document.getElementById('mobileDiscoverySearchInput');

mobileDiscoverySearchInput?.addEventListener('input', event => {
  setMobileDiscoverySearch(event.target.value);
});

mobileDiscoverySearchInput?.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  event.preventDefault();

  const value = String(event.target.value || '').trim();
  if (!value) return;

  setMobileDiscoverySearch(value, { scroll:true });
});

document.getElementById('mobileDiscoverySearchBtn')?.addEventListener('click', () => {
  const value = String(mobileDiscoverySearchInput?.value || '').trim();
  if (!value) {
    mobileDiscoverySearchInput?.focus();
    return;
  }

  setMobileDiscoverySearch(value, { scroll:true });
});

document.getElementById('mobileDiscoverySearchClear')?.addEventListener('click', () => {
  setMobileDiscoverySearch('');
  mobileDiscoverySearchInput?.focus();
});

document.querySelectorAll('[data-mobile-search-example]').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.mobileSearchExample || '';
    setMobileDiscoverySearch(value, { scroll:true });
  });
});

// Masaüstü aramasındaki değer mobil alana da yansısın.
document.getElementById('searchInput')?.addEventListener('input', event => {
  const mobileInput = document.getElementById('mobileDiscoverySearchInput');
  const clearButton = document.getElementById('mobileDiscoverySearchClear');
  if (mobileInput && document.activeElement !== mobileInput) {
    mobileInput.value = event.target.value;
  }
  clearButton?.classList.toggle('hidden', !String(event.target.value || '').trim());
  updateMobileCategoryResult();
});

document.getElementById('mobileCategoryResultBtn')?.addEventListener('click', scrollToMobileResults);

document.getElementById('mobileInstantResultsClose')?.addEventListener('click', () => {
  document.getElementById('mobileInstantResults')?.classList.add('hidden');
  document.getElementById('mobileCategoryResultBtn')?.setAttribute('aria-expanded','false');
});

document.getElementById('mobileCategoryOfferBtn')?.addEventListener('click', () => {
  const input = document.getElementById('offerOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
  updateMobileCategoryResult();
});

document.getElementById('mobileCategoryVideoBtn')?.addEventListener('click', () => {
  const input = document.getElementById('videoOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
  updateMobileCategoryResult();
});

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
  }).join('') +
    '<button type="button" class="mobile-subcategory-btn mobile-subcategory-missing" data-mobile-subcategory-missing="' +
    mainKey +
    '"><span class="missing-service-icon" aria-hidden="true">✦</span><span class="missing-service-copy"><strong>Aradığın hizmeti bulamadın mı?</strong><small>Hizmeti yaz, sana uygun kurumları bulalım.</small></span><span class="missing-service-action">Hizmeti Yaz <span aria-hidden="true">→</span></span></button>';

  root.querySelectorAll('[data-mobile-subcategory]').forEach(button => {
    button.addEventListener('click', () => {
      clearDiscoveryKeywordForCategorySelection();
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
      updateMobileCategoryResult();
    });
  });
}

function renderMobileCategories() {
  const root = document.getElementById('mobileCategories');
  if (!root) return;

  const resultPanel = document.getElementById('mobileCategoryResult');
  const legacySubRoot = document.getElementById('mobileSubcategories');

  // Sonuç paneli bir önceki render'da kategori gridinin içine taşındıysa,
  // root.innerHTML yenilenmeden önce güvenli sabit konumuna geri al.
  if (
    resultPanel &&
    root.contains(resultPanel) &&
    legacySubRoot?.parentNode
  ) {
    legacySubRoot.parentNode.insertBefore(resultPanel, legacySubRoot.nextSibling);
  }

  const activeMain = getSelectedMainCategory();
  const entries = getSortedMainCategories();
  const categoryColumns = window.innerWidth > 820 ? 6 : 3;
  const activeIndex = entries.findIndex(([key]) => key === activeMain);
  const activeRowStart = activeIndex >= 0
    ? Math.floor(activeIndex / categoryColumns) * categoryColumns
    : -1;
  const activeRowEnd = activeRowStart >= 0
    ? Math.min(activeRowStart + categoryColumns - 1, entries.length - 1)
    : -1;

  const htmlParts = [];

  entries.forEach(([key, item], index) => {
    htmlParts.push(`
      <button
        type="button"
        class="mobile-category-btn ${activeMain === key ? 'active' : ''}"
        data-mobile-category="${key}"
        aria-expanded="${activeMain === key ? 'true' : 'false'}"
      >
        <span class="mobile-category-icon">${categoryIcons[key] || '•'}</span>
        <span>${item.label}</span>
      </button>
    `);

    if (activeMain && index === activeRowEnd) {
      const rows = Object.entries(categoryTaxonomy[activeMain]?.subs || {});

      if (rows.length) {
        htmlParts.push(`
          <div class="mobile-inline-subcategories" data-mobile-inline-subs="${activeMain}">
            <div class="mobile-inline-subcategories-head">
              <strong>${categoryTaxonomy[activeMain]?.label || 'Alt kategoriler'}</strong>
              <span>Alt kategori seçin</span>
            </div>
            <div class="mobile-inline-subcategories-grid">
              ${rows.map(([subKey, label]) => {
                const input = document.querySelector(
                  '.subCategoryFilter[data-main-category="' + activeMain + '"][value="' + subKey + '"]'
                );
                return `
                  <button
                    type="button"
                    class="mobile-subcategory-btn ${input?.checked ? 'active' : ''}"
                    data-mobile-subcategory="${subKey}"
                    data-mobile-main="${activeMain}"
                  >${label}</button>
                `;
              }).join('')}
              <button
                type="button"
                class="mobile-subcategory-btn mobile-subcategory-missing"
                data-mobile-subcategory-missing="${activeMain}"
              ><span class="missing-service-icon" aria-hidden="true">✦</span><span class="missing-service-copy"><strong>Aradığın hizmeti bulamadın mı?</strong><small>Hizmeti yaz, sana uygun kurumları bulalım.</small></span><span class="missing-service-action">Hizmeti Yaz <span aria-hidden="true">→</span></span></button>
            </div>
          </div>
        `);
      }
    }
  });

  root.innerHTML = htmlParts.join('');

  // Eski alt kategori alanını artık kullanmıyoruz; satırın altında açılır.
  if (legacySubRoot) {
    legacySubRoot.innerHTML = '';
    legacySubRoot.classList.add('hidden');
  }

  root.querySelectorAll('[data-mobile-category]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.mobileCategory;
      const currentlyActive = getSelectedMainCategory() === key;

      clearDiscoveryKeywordForCategorySelection();
      clearAllCategorySelections();

      if (!currentlyActive) {
        const parent = document.querySelector('.categoryFilter[value="' + key + '"]');
        if (parent) parent.checked = true;
      }

      renderMobileCategories();
      renderList();
      updateMobileCategoryResult();
    });
  });

  root.querySelectorAll('[data-mobile-subcategory]').forEach(button => {
    button.addEventListener('click', () => {
      clearDiscoveryKeywordForCategorySelection();
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
      updateMobileCategoryResult();
    });
  });

  const selectedSub = document.querySelector('.subCategoryFilter:checked');
  const inlineSubPanel = activeMain
    ? root.querySelector('[data-mobile-inline-subs="' + activeMain + '"]')
    : null;

  if (resultPanel && selectedSub && inlineSubPanel) {
    inlineSubPanel.appendChild(resultPanel);
  }

  syncMobileQuickFilterState();
  updateMobileCategoryResult();
}

document.getElementById('mobileClearCategoriesBtn')?.addEventListener('click', () => {
  clearDiscoveryKeywordForCategorySelection();
  clearAllCategorySelections();
  renderMobileCategories();
  renderList();
  updateMobileCategoryResult();
});

document.getElementById('mobileVideoOnlyBtn')?.addEventListener('click', () => {
  const input = document.getElementById('videoOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
  updateMobileCategoryResult();
});

document.getElementById('mobileOfferOnlyBtn')?.addEventListener('click', () => {
  const input = document.getElementById('offerOnly');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
});

document.getElementById('mobileTour360Btn')?.addEventListener('click', () => {
  const input = document.getElementById('tour360Only');
  if (!input) return;
  input.checked = !input.checked;
  syncMobileQuickFilterState();
  renderList();
  updateMobileCategoryResult();
});

document.querySelectorAll('.categoryFilter, .subCategoryFilter').forEach(input => {
  input.addEventListener('change', () => {
    renderMobileCategories();
  });
});

document.getElementById('videoOnly')?.addEventListener('change', () => {
  syncMobileQuickFilterState();
  updateMobileCategoryResult();
});
document.getElementById('offerOnly')?.addEventListener('change', () => {
  syncMobileQuickFilterState();
  updateMobileCategoryResult();
});

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
const compareInstitutionIds = new Set();

/* =========================================================
   DİJİYER KAZANÇ · PİLOT DAVET SİSTEMİ
   Davet kodu cihazda tutulur; işletme başvurusuna referralCode eklenir.
   ========================================================= */
const DIJIYER_REFERRAL_PROFILE_KEY = 'dijiyerReferralProfileV1';
const DIJIYER_REFERRAL_SOURCE_KEY = 'dijiyerReferralSourceV1';
const DIJIYER_REFERRAL_REWARD = 250;
const DIJIYER_REFERRAL_DAYS = 30;

function makeDijiyerReferralCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes=new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const body=Array.from(bytes)
    .map(byte=>alphabet[byte%alphabet.length])
    .join('');
  return 'DJY-KZ-'+body.slice(0,4)+'-'+body.slice(4,8);
}

function getDijiyerReferralProfile(){
  try{
    const parsed=JSON.parse(localStorage.getItem(DIJIYER_REFERRAL_PROFILE_KEY)||'{}');
    if(parsed.code){
      return {
        code:String(parsed.code),
        pending:Number(parsed.pending||0),
        approved:Number(parsed.approved||0),
        invited:Number(parsed.invited||0)
      };
    }
  }catch(_){}

  const profile={
    code:makeDijiyerReferralCode(),
    pending:0,
    approved:0,
    invited:0
  };

  localStorage.setItem(DIJIYER_REFERRAL_PROFILE_KEY,JSON.stringify(profile));
  return profile;
}

function getDijiyerReferralUrl(){
  const profile=getDijiyerReferralProfile();
  const url=new URL('index.html',window.location.href);
  url.searchParams.set('ref',profile.code);
  url.searchParams.set('davet','1');
  return url.toString();
}

function captureDijiyerReferralSource(){
  const params=new URLSearchParams(window.location.search);
  const code=String(params.get('ref')||'').trim().toUpperCase();
  if(!/^DJY-KZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code))return;

  const ownCode=getDijiyerReferralProfile().code;
  if(code===ownCode)return;

  const source={
    code,
    capturedAt:new Date().toISOString(),
    expiresAt:Date.now()+(DIJIYER_REFERRAL_DAYS*24*60*60*1000)
  };
  localStorage.setItem(DIJIYER_REFERRAL_SOURCE_KEY,JSON.stringify(source));

  if(params.get('davet')==='1'){
    setTimeout(()=>{
      const addButton=document.getElementById('institutionAddBtn');
      if(addButton){
        addButton.click();
        showToast('Davet kodu uygulandı. İşletme başvurusunu tamamlayabilirsiniz.');
      }
    },700);
  }
}

function getActiveDijiyerReferralSource(){
  try{
    const parsed=JSON.parse(localStorage.getItem(DIJIYER_REFERRAL_SOURCE_KEY)||'{}');
    if(!parsed.code)return null;
    if(Number(parsed.expiresAt||0)<Date.now()){
      localStorage.removeItem(DIJIYER_REFERRAL_SOURCE_KEY);
      return null;
    }
    return parsed;
  }catch(_){
    return null;
  }
}

function dijiyerEarningsCardHtml(){
  return `
    <article class="dijiyer-earnings-card" aria-label="Dijiyer Kazanç pilot programı">
      <div class="dijiyer-earnings-icon">₺</div>
      <div class="dijiyer-earnings-copy">
        <div class="dijiyer-earnings-kicker">
          <span>DİJİYER KAZANÇ</span>
          <b>PİLOT</b>
        </div>
        <strong>İşletme tavsiye et, kazanç fırsatı yakala</strong>
        <p>Davet ettiğin işletme ilk ücretli Dijiyer hizmetini onayladığında <b>${DIJIYER_REFERRAL_REWARD} TL Dijiyer bakiyesi</b> kazan.</p>
      </div>
      <div class="dijiyer-earnings-actions">
        <button type="button" class="primary" data-dijiyer-invite>İşletme Davet Et</button>
        <button type="button" data-dijiyer-earnings>Kazancım</button>
      </div>
    </article>
  `;
}

function ensureDijiyerEarningsModal(){
  let modal=document.getElementById('dijiyerEarningsModal');
  if(modal)return modal;

  modal=document.createElement('div');
  modal.id='dijiyerEarningsModal';
  modal.className='modal hidden dijiyer-earnings-modal';
  modal.innerHTML=`
    <div class="modal-card dijiyer-earnings-modal-card">
      <button type="button" class="modal-close" data-dijiyer-earnings-close aria-label="Kapat">×</button>

      <div class="dijiyer-earnings-modal-head">
        <span>DİJİYER KAZANÇ · PİLOT</span>
        <h2>İşletme davet et, Dijiyer bakiyesi kazan</h2>
        <p>Davet bağlantını tanıdığın işletmelerle paylaş. İşletme ücretsiz başvuru yapar; ilk ücretli tanıtım veya reklam siparişi onaylandığında ödül hesabına tanımlanır.</p>
      </div>

      <div class="dijiyer-earnings-tabs">
        <button type="button" class="active" data-earnings-tab="invite">Davet Et</button>
        <button type="button" data-earnings-tab="wallet">Kazancım</button>
      </div>

      <section class="dijiyer-earnings-pane active" data-earnings-pane="invite">
        <div class="dijiyer-referral-reward">
          <div><small>PİLOT ÖDÜL</small><strong>${DIJIYER_REFERRAL_REWARD} TL</strong><span>Dijiyer bakiyesi</span></div>
          <p>Ödül, davet edilen işletmenin ilk ücretli Dijiyer hizmeti yönetim tarafından onaylandığında geçerli olur.</p>
        </div>

        <label class="dijiyer-referral-field">
          <span>Davet Kodun</span>
          <div><input id="dijiyerReferralCode" readonly><button type="button" id="copyDijiyerReferralCode">Kopyala</button></div>
        </label>

        <label class="dijiyer-referral-field">
          <span>Özel Davet Linkin</span>
          <div><input id="dijiyerReferralUrl" readonly><button type="button" id="copyDijiyerReferralUrl">Kopyala</button></div>
        </label>

        <div class="dijiyer-referral-share">
          <button type="button" class="whatsapp" id="shareDijiyerReferralWhatsapp">WhatsApp'ta Paylaş</button>
          <button type="button" id="shareDijiyerReferralNative">Diğer Uygulamalar</button>
        </div>

        <div class="dijiyer-referral-steps">
          <div><b>1</b><span><strong>Linkini paylaş</strong><small>Tanıdığın işletmeye özel davet linkini gönder.</small></span></div>
          <div><b>2</b><span><strong>İşletme başvursun</strong><small>Davet kodu işletme başvurusuna otomatik eklenir.</small></span></div>
          <div><b>3</b><span><strong>Ücretli hizmet alsın</strong><small>İlk onaylı reklam / tanıtım siparişinden sonra ödül oluşur.</small></span></div>
        </div>
      </section>

      <section class="dijiyer-earnings-pane" data-earnings-pane="wallet">
        <div class="dijiyer-wallet-grid">
          <article><span>Toplam Kazanç</span><strong id="dijiyerWalletApproved">0 TL</strong><small>Onaylanan bakiye</small></article>
          <article><span>Bekleyen</span><strong id="dijiyerWalletPending">0 TL</strong><small>Onay sürecindeki ödül</small></article>
          <article><span>Davetler</span><strong id="dijiyerWalletInvited">0</strong><small>Takip edilen işletme</small></article>
        </div>

        <div class="dijiyer-wallet-code">
          <span>Davet Kodun</span>
          <strong id="dijiyerWalletCode">-</strong>
        </div>

        <div class="dijiyer-wallet-empty">
          <span>💸</span>
          <div>
            <strong>Kazançlar burada görünecek</strong>
            <p>Pilot aşamada başvurular davet koduyla eşleştiriliyor. İşletmenin ücretli hizmeti onaylandığında ödül durumu güncellenecek.</p>
          </div>
        </div>
      </section>

      <div class="dijiyer-earnings-note">
        Pilot program koşulları ve ödül tutarı daha sonra güncellenebilir. Sahte / mükerrer başvurular ödüle dahil edilmez.
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener('click',event=>{
    if(event.target===modal)modal.classList.add('hidden');
  });

  modal.querySelector('[data-dijiyer-earnings-close]')?.addEventListener('click',()=>{
    modal.classList.add('hidden');
  });

  modal.querySelectorAll('[data-earnings-tab]').forEach(button=>{
    button.addEventListener('click',()=>{
      const tab=button.dataset.earningsTab;
      modal.querySelectorAll('[data-earnings-tab]').forEach(item=>item.classList.toggle('active',item===button));
      modal.querySelectorAll('[data-earnings-pane]').forEach(pane=>pane.classList.toggle('active',pane.dataset.earningsPane===tab));
    });
  });

  modal.querySelector('#copyDijiyerReferralCode')?.addEventListener('click',async()=>{
    const value=document.getElementById('dijiyerReferralCode')?.value||'';
    try{await navigator.clipboard.writeText(value);}catch(_){
      const input=document.getElementById('dijiyerReferralCode');
      input?.select();
      document.execCommand('copy');
    }
    showToast('Davet kodu kopyalandı.');
  });

  modal.querySelector('#copyDijiyerReferralUrl')?.addEventListener('click',async()=>{
    const value=document.getElementById('dijiyerReferralUrl')?.value||'';
    try{await navigator.clipboard.writeText(value);}catch(_){
      const input=document.getElementById('dijiyerReferralUrl');
      input?.select();
      document.execCommand('copy');
    }
    showToast('Davet linki kopyalandı.');
  });

  modal.querySelector('#shareDijiyerReferralWhatsapp')?.addEventListener('click',()=>{
    const url=getDijiyerReferralUrl();
    const message=encodeURIComponent(
      'Dijiyer\'e işletmeni ücretsiz ekleyebilirsin. Bu davet linkinden başvurunu oluştur:\n'+url
    );
    window.open('https://wa.me/?text='+message,'_blank','noopener');
  });

  modal.querySelector('#shareDijiyerReferralNative')?.addEventListener('click',async()=>{
    const url=getDijiyerReferralUrl();
    if(navigator.share){
      try{
        await navigator.share({
          title:'Dijiyer İşletme Daveti',
          text:'İşletmeni Dijiyer\'e ücretsiz eklemek için davet linki:',
          url
        });
        return;
      }catch(_){}
    }
    try{await navigator.clipboard.writeText(url);}catch(_){}
    showToast('Davet linki kopyalandı.');
  });

  return modal;
}

function openDijiyerEarningsModal(tab='invite'){
  const modal=ensureDijiyerEarningsModal();
  const profile=getDijiyerReferralProfile();
  const url=getDijiyerReferralUrl();

  const codeInput=modal.querySelector('#dijiyerReferralCode');
  const urlInput=modal.querySelector('#dijiyerReferralUrl');
  const walletCode=modal.querySelector('#dijiyerWalletCode');
  const approved=modal.querySelector('#dijiyerWalletApproved');
  const pending=modal.querySelector('#dijiyerWalletPending');
  const invited=modal.querySelector('#dijiyerWalletInvited');

  if(codeInput)codeInput.value=profile.code;
  if(urlInput)urlInput.value=url;
  if(walletCode)walletCode.textContent=profile.code;
  if(approved)approved.textContent=new Intl.NumberFormat('tr-TR').format(profile.approved)+' TL';
  if(pending)pending.textContent=new Intl.NumberFormat('tr-TR').format(profile.pending)+' TL';
  if(invited)invited.textContent=String(profile.invited||0);

  modal.querySelectorAll('[data-earnings-tab]').forEach(button=>{
    button.classList.toggle('active',button.dataset.earningsTab===tab);
  });
  modal.querySelectorAll('[data-earnings-pane]').forEach(pane=>{
    pane.classList.toggle('active',pane.dataset.earningsPane===tab);
  });

  modal.classList.remove('hidden');
}

function bindDijiyerEarningsActions(){
  document.querySelectorAll('[data-dijiyer-invite]').forEach(button=>{
    if(button.dataset.dijiyerEarningsBound==='1')return;
    button.dataset.dijiyerEarningsBound='1';
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      if(followManagedSectionLink(button))return;
      openDijiyerEarningsModal('invite');
    });
  });

  document.querySelectorAll('[data-dijiyer-earnings]').forEach(button=>{
    if(button.dataset.dijiyerEarningsBound==='1')return;
    button.dataset.dijiyerEarningsBound='1';
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      if(followManagedSectionLink(button))return;
      openDijiyerEarningsModal('wallet');
    });
  });
}

function renderDijiyerEarningsBottom(){
  const root=document.getElementById('dijiyerEarningsBottom');
  if(!root)return;

  root.innerHTML=`
    <div class="dijiyer-earnings-bottom-inner">
      <div class="dijiyer-earnings-bottom-head">
        <span>DAHA FAZLA</span>
        <strong>Dijiyer Kazanç</strong>
        <small>Pilot özellik · detayları geliştirme aşamasında</small>
      </div>
      ${dijiyerEarningsCardHtml()}
    </div>
  `;

  bindDijiyerEarningsActions();
}

captureDijiyerReferralSource();
renderDijiyerEarningsBottom();


const HOME_EDITABLE_CONTENT_DEFAULTS = {
  dailyStats:{
    eyebrow:"BUGÜN DİJİYER'DE",
    title:'Günlük teklif hareketleri',
    liveLabel:'Canlı',
    requestLabel:'Teklif İstendi',
    offerLabel:'Teklif Verildi',
    acceptedLabel:'Kabul Edildi',
    topLabel:'En Çok Teklif Alınan'
  },
  bottomQuote:{
    kicker:'İŞLETMELER İÇİN',
    title:'Yeni müşteriler seni arasın, sen teklifini ver.',
    description:"İşletmeni Dijiyer'e ücretsiz ekle. Bölgen ve sektörünle eşleşen talepleri gör, teklif ver ve kurum panelinden süreci takip et.",
    benefits:'Üyelik ücretsiz\nTeklif vermek ücretsiz\nAylık zorunlu ücret yok\nKazandığın işten %0 komisyon',
    primaryLabel:'İşletmeni Ücretsiz Ekle',
    primaryUrl:'',
    secondaryLabel:'Kurum Paneline Gir',
    secondaryUrl:'',
    cardLabel:'İŞLETME MALİYETİ',
    cardValue:'0 TL',
    cardDescription:'Başlangıçta kayıt ücreti, teklif verme ücreti veya satış komisyonu yok.',
    cardItems:'Ücretsiz|Kurum profili\nÜcretsiz|Teklif verme\n%0|İş / satış komisyonu'
  },
  earnings:{
    sectionEyebrow:'DAHA FAZLA',
    sectionTitle:'Dijiyer Kazanç',
    sectionSubtitle:'Pilot özellik · detayları geliştirme aşamasında',
    kicker:'DİJİYER KAZANÇ',
    badge:'PİLOT',
    title:'İşletme tavsiye et, kazanç fırsatı yakala',
    description:'Davet ettiğin işletme ilk ücretli Dijiyer hizmetini onayladığında Dijiyer bakiyesi kazan.',
    primaryLabel:'İşletme Davet Et',
    primaryUrl:'',
    secondaryLabel:'Kazancım',
    secondaryUrl:''
  },
  homeFooter:{
    brandTitle:'Dijiyer',
    brandTagline:'Bul. Karşılaştır. Teklif Al.',
    title:'Yerel işletmeler ve müşteriler tek yerde.',
    description:'Ücretsiz teklif al, ücretsiz teklif ver, komisyonsuz ilerle.',
    primaryLabel:'Teklif Al',
    primaryUrl:'',
    secondaryLabel:'İşletme Ekle',
    secondaryUrl:'',
    thirdLabel:'Kurumları İncele',
    thirdUrl:'#resultsSection'
  }
};

function managedContentValue(saved,defaults,key){
  return saved && Object.prototype.hasOwnProperty.call(saved,key)
    ? String(saved[key] ?? '')
    : String(defaults[key] ?? '');
}

function safeManagedContentLink(value){
  const raw=String(value||'').trim();
  if(!raw)return '';
  if(raw.startsWith('#'))return raw;
  try{
    const url=new URL(raw,window.location.href);
    return ['http:','https:'].includes(url.protocol) ? url.href : '';
  }catch(_){
    return '';
  }
}

function setManagedText(element,value){
  if(element)element.textContent=String(value ?? '');
}

function setManagedButtonLink(element,value){
  if(!element)return;
  const link=safeManagedContentLink(value);
  if(link)element.dataset.customSectionLink=link;
  else delete element.dataset.customSectionLink;
}

function applyHomeEditableContent(data={}){
  const dailySaved=data.dailyStatsContent || {};
  const dailyDefaults=HOME_EDITABLE_CONTENT_DEFAULTS.dailyStats;
  const dailyRoot=document.getElementById('mobileDailyStats');
  if(dailyRoot){
    setManagedText(dailyRoot.querySelector('.mobile-daily-stats-head span'),managedContentValue(dailySaved,dailyDefaults,'eyebrow'));
    setManagedText(dailyRoot.querySelector('.mobile-daily-stats-head strong'),managedContentValue(dailySaved,dailyDefaults,'title'));
    const live=dailyRoot.querySelector('.mobile-daily-stats-head > small');
    if(live){
      const label=managedContentValue(dailySaved,dailyDefaults,'liveLabel');
      live.innerHTML='<i></i> '+String(label).replace(/</g,'&lt;');
    }
    setManagedText(dailyRoot.querySelector('#dailyQuoteRequestCount + small'),managedContentValue(dailySaved,dailyDefaults,'requestLabel'));
    setManagedText(dailyRoot.querySelector('#dailyOfferCount + small'),managedContentValue(dailySaved,dailyDefaults,'offerLabel'));
    setManagedText(dailyRoot.querySelector('#dailyAcceptedCount + small'),managedContentValue(dailySaved,dailyDefaults,'acceptedLabel'));
    setManagedText(dailyRoot.querySelector('#dailyTopService + small'),managedContentValue(dailySaved,dailyDefaults,'topLabel'));
  }

  const quoteSaved=data.bottomQuoteContent || {};
  const quoteDefaults=HOME_EDITABLE_CONTENT_DEFAULTS.bottomQuote;
  const quoteRoot=document.querySelector('.business-cta-section');
  if(quoteRoot){
    setManagedText(quoteRoot.querySelector('.business-cta-copy > span'),managedContentValue(quoteSaved,quoteDefaults,'kicker'));
    setManagedText(quoteRoot.querySelector('.business-cta-copy > h2'),managedContentValue(quoteSaved,quoteDefaults,'title'));
    setManagedText(quoteRoot.querySelector('.business-cta-copy > p'),managedContentValue(quoteSaved,quoteDefaults,'description'));

    const benefits=managedContentValue(quoteSaved,quoteDefaults,'benefits').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const benefitsRoot=quoteRoot.querySelector('.business-benefits');
    if(benefitsRoot){
      benefitsRoot.innerHTML='';
      benefits.forEach(item=>{
        const span=document.createElement('span');
        span.textContent='✓ '+item;
        benefitsRoot.appendChild(span);
      });
    }

    const primary=quoteRoot.querySelector('#businessAddBtn');
    const secondary=quoteRoot.querySelector('#businessPanelBtn');
    setManagedText(primary,managedContentValue(quoteSaved,quoteDefaults,'primaryLabel'));
    setManagedText(secondary,managedContentValue(quoteSaved,quoteDefaults,'secondaryLabel'));
    setManagedButtonLink(primary,managedContentValue(quoteSaved,quoteDefaults,'primaryUrl'));
    setManagedButtonLink(secondary,managedContentValue(quoteSaved,quoteDefaults,'secondaryUrl'));

    setManagedText(quoteRoot.querySelector('.business-card-label'),managedContentValue(quoteSaved,quoteDefaults,'cardLabel'));
    setManagedText(quoteRoot.querySelector('.business-cta-card > strong'),managedContentValue(quoteSaved,quoteDefaults,'cardValue'));
    setManagedText(quoteRoot.querySelector('.business-cta-card > p'),managedContentValue(quoteSaved,quoteDefaults,'cardDescription'));

    const items=managedContentValue(quoteSaved,quoteDefaults,'cardItems').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const list=quoteRoot.querySelector('.business-card-list');
    if(list){
      list.innerHTML='';
      items.forEach(row=>{
        const [value,...rest]=row.split('|');
        const div=document.createElement('div');
        const b=document.createElement('b');
        const span=document.createElement('span');
        b.textContent=(value||'').trim();
        span.textContent=rest.join('|').trim();
        div.append(b,span);
        list.appendChild(div);
      });
    }
  }

  const earningsSaved=data.earningsContent || {};
  const earningsDefaults=HOME_EDITABLE_CONTENT_DEFAULTS.earnings;
  const earningsRoot=document.getElementById('dijiyerEarningsBottom');
  if(earningsRoot){
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-bottom-head > span'),managedContentValue(earningsSaved,earningsDefaults,'sectionEyebrow'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-bottom-head > strong'),managedContentValue(earningsSaved,earningsDefaults,'sectionTitle'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-bottom-head > small'),managedContentValue(earningsSaved,earningsDefaults,'sectionSubtitle'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-kicker > span'),managedContentValue(earningsSaved,earningsDefaults,'kicker'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-kicker > b'),managedContentValue(earningsSaved,earningsDefaults,'badge'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-copy > strong'),managedContentValue(earningsSaved,earningsDefaults,'title'));
    setManagedText(earningsRoot.querySelector('.dijiyer-earnings-copy > p'),managedContentValue(earningsSaved,earningsDefaults,'description'));

    const primary=earningsRoot.querySelector('[data-dijiyer-invite]');
    const secondary=earningsRoot.querySelector('[data-dijiyer-earnings]');
    setManagedText(primary,managedContentValue(earningsSaved,earningsDefaults,'primaryLabel'));
    setManagedText(secondary,managedContentValue(earningsSaved,earningsDefaults,'secondaryLabel'));
    setManagedButtonLink(primary,managedContentValue(earningsSaved,earningsDefaults,'primaryUrl'));
    setManagedButtonLink(secondary,managedContentValue(earningsSaved,earningsDefaults,'secondaryUrl'));
  }

  const footerSaved=data.homeFooterContent || {};
  const footerDefaults=HOME_EDITABLE_CONTENT_DEFAULTS.homeFooter;
  const footer=document.getElementById('homeFooterSection') || document.querySelector('.home-footer');
  if(footer){
    setManagedText(footer.querySelector('.home-footer-brand strong'),managedContentValue(footerSaved,footerDefaults,'brandTitle'));
    setManagedText(footer.querySelector('.home-footer-brand span'),managedContentValue(footerSaved,footerDefaults,'brandTagline'));
    setManagedText(footer.querySelector('.home-footer-copy strong'),managedContentValue(footerSaved,footerDefaults,'title'));
    setManagedText(footer.querySelector('.home-footer-copy span'),managedContentValue(footerSaved,footerDefaults,'description'));

    const primary=footer.querySelector('#footerQuoteBtn');
    const secondary=footer.querySelector('#footerInstitutionBtn');
    const third=footer.querySelector('.home-footer-actions a');
    setManagedText(primary,managedContentValue(footerSaved,footerDefaults,'primaryLabel'));
    setManagedText(secondary,managedContentValue(footerSaved,footerDefaults,'secondaryLabel'));
    setManagedText(third,managedContentValue(footerSaved,footerDefaults,'thirdLabel'));
    setManagedButtonLink(primary,managedContentValue(footerSaved,footerDefaults,'primaryUrl'));
    setManagedButtonLink(secondary,managedContentValue(footerSaved,footerDefaults,'secondaryUrl'));
    if(third)third.href=safeManagedContentLink(managedContentValue(footerSaved,footerDefaults,'thirdUrl')) || '#resultsSection';
  }
}

function followManagedSectionLink(element){
  const link=element?.dataset?.customSectionLink || '';
  if(!link)return false;
  window.location.href=link;
  return true;
}

function applyHomeBottomSectionVisibility(data={}){
  const bottomQuote=document.querySelector('.business-cta-section');
  const earnings=document.getElementById('dijiyerEarningsBottom');
  const homeFooter=document.getElementById('homeFooterSection') || document.querySelector('.home-footer');

  const bottomQuoteVisible=data.bottomQuoteVisible !== false;
  const earningsVisible=data.earningsVisible === true;
  const homeFooterVisible=data.homeFooterVisible === true;

  if(bottomQuote){
    bottomQuote.hidden=!bottomQuoteVisible;
    bottomQuote.classList.toggle('site-section-disabled',!bottomQuoteVisible);
    bottomQuote.style.display=bottomQuoteVisible ? '' : 'none';
  }

  if(earnings){
    earnings.hidden=!earningsVisible;
    earnings.classList.toggle('site-section-disabled',!earningsVisible);
    earnings.style.display=earningsVisible ? '' : 'none';
  }

  if(homeFooter){
    homeFooter.hidden=!homeFooterVisible;
    homeFooter.classList.toggle('site-section-disabled',!homeFooterVisible);
    homeFooter.style.display=homeFooterVisible ? '' : 'none';
  }
}

function watchHomeBottomSectionVisibility(){
  try{
    return db.collection('siteSettings').doc('home').onSnapshot(snap=>{
      const data=snap.exists ? (snap.data() || {}) : {};
      applyHomeBottomSectionVisibility(data);
      applyHomeEditableContent(data);
    },error=>{
      console.warn('Ana sayfa alt bölüm görünürlük ayarları dinlenemedi:',error);
      applyHomeBottomSectionVisibility({earningsVisible:false,homeFooterVisible:false});
      applyHomeEditableContent({});
    });
  }catch(error){
    console.warn('Ana sayfa alt bölüm görünürlük ayarı başlatılamadı:',error);
    applyHomeBottomSectionVisibility({earningsVisible:false,homeFooterVisible:false});
    applyHomeEditableContent({});
    return null;
  }
}

watchHomeBottomSectionVisibility();

function dijiyerInitialGlobalValue(paramName,storageKey,fallback){
  const params=new URLSearchParams(window.location.search);
  if(params.has(paramName))return String(params.get(paramName)||"");
  try{
    const stored=localStorage.getItem(storageKey);
    if(stored!==null)return String(stored);
  }catch(_){}
  return fallback;
}

let activeLocationCity = dijiyerInitialGlobalValue('city','dijiyerGlobalCity','Çanakkale');
let activeLocationDistrict = dijiyerInitialGlobalValue('district','dijiyerGlobalDistrict','Merkez');

const dijiyerInitialSearchQuery=String(
  new URLSearchParams(window.location.search).get('q')||''
).trim();
if(dijiyerInitialSearchQuery){
  const initialSearchInput=document.getElementById('searchInput');
  if(initialSearchInput)initialSearchInput.value=dijiyerInitialSearchQuery;
}

/* =========================================================
   DİJİYER İŞ FIRSATLARI · MOBİL PİLOT
   Yayındaki ilanları Firestore'dan okur; yeni ilanı onaya gönderir.
   ========================================================= */
const MOBILE_JOB_CATEGORIES = [
  {key:'yeme_servis',icon:'🍽',label:'Yeme & Servis',keywords:['yemek','mutfak','garson','servis','aşçı','bulaşık','kafe','restoran','şarküteri','börek']},
  {key:'usta_yardimci',icon:'🔧',label:'Usta & Yardımcı',keywords:['usta','boya','boyacı','elektrik','tesisat','marangoz','montaj','tadilat','kaynak','inşaat']},
  {key:'temizlik',icon:'🧹',label:'Temizlik',keywords:['temizlik','temiz','apartman','ofis temizliği','ev temizliği']},
  {key:'tasima_kurye',icon:'📦',label:'Taşıma & Kurye',keywords:['taşıma','nakliye','kurye','paket','depo','yükleme','şoför','dağıtım']},
  {key:'satis_magaza',icon:'🛍',label:'Satış & Mağaza',keywords:['satış','mağaza','market','kasiyer','tezgahtar','reyon','müşteri']},
  {key:'evden_uretim',icon:'🏠',label:'Evden İş',keywords:['evden','paketleme','dikiş','örgü','üretim','hazırlama']},
  {key:'dijital_ofis',icon:'💻',label:'Dijital & Ofis',keywords:['ofis','bilgisayar','sosyal medya','tasarım','video','muhasebe','excel','çağrı','uzaktan']},
  {key:'organizasyon',icon:'🎪',label:'Organizasyon',keywords:['organizasyon','düğün','etkinlik','fuar','stand','hostes','karşılama']},
  {key:'bakim_egitim',icon:'🤝',label:'Bakım & Eğitim',keywords:['bakıcı','çocuk','yaşlı','evcil','hayvan','özel ders','öğretmen','eğitim']},
  {key:'diger',icon:'➕',label:'Diğer',keywords:[]}
];

const MOBILE_JOB_DEMOS = [
  {
    id:'demo-borek',
    type:'hire',
    category:'yeme_servis',
    categoryLabel:'Yeme & Servis',
    title:'Evde börek sarabilecek kişi aranıyor',
    city:'Çanakkale',
    district:'Merkez',
    locationMode:'home',
    workMode:'Esnek',
    wage:'Ücret görüşülür',
    description:'Şarküteri için düzenli olarak evde börek sarabilecek, el işi hızlı ve temiz çalışan kişi aranıyor.',
    contactName:'Örnek Şarküteri',
    demo:true,
    createdAt:Date.now()-15*60*1000
  },
  {
    id:'demo-boyaci',
    type:'hire',
    category:'usta_yardimci',
    categoryLabel:'Usta & Yardımcı',
    title:'Boyacı yanına yardımcı aranıyor',
    city:'Çanakkale',
    district:'Kepez',
    locationMode:'onsite',
    workMode:'Günlük / Ek İş',
    wage:'Günlük 1.500 TL',
    description:'3 günlük iç cephe boya işinde malzeme taşıma, bantlama ve boya hazırlığında yardımcı olacak kişi aranıyor.',
    contactName:'Örnek İlan',
    demo:true,
    createdAt:Date.now()-55*60*1000
  },
  {
    id:'demo-weekend',
    type:'work',
    category:'usta_yardimci',
    categoryLabel:'Usta & Yardımcı',
    title:'Hafta sonu ek iş arıyorum',
    city:'Çanakkale',
    district:'Merkez',
    locationMode:'onsite',
    workMode:'Hafta sonu',
    wage:'Görüşülür',
    description:'Taşıma, montaj ve boya işlerinde yardımcı olabilirim. Cumartesi ve pazar günleri müsaitim.',
    contactName:'Örnek İş Arayan',
    demo:true,
    createdAt:Date.now()-2*60*60*1000
  },
  {
    id:'demo-social',
    type:'work',
    category:'dijital_ofis',
    categoryLabel:'Dijital & Ofis',
    title:'Akşamları sosyal medya ve video işi yapabilirim',
    city:'Çanakkale',
    district:'',
    locationMode:'remote',
    workMode:'Proje bazlı',
    wage:'İşe göre görüşülür',
    description:'Reels düzenleme, sosyal medya görseli ve kısa video montajı için akşam saatlerinde ek iş alabilirim.',
    contactName:'Örnek İş Arayan',
    demo:true,
    createdAt:Date.now()-3*60*60*1000
  }
];

let mobileJobPosts = [];
let activeMobileJobFilter = 'all';
let activeMobileJobQuick = 'all';
let activeMobileJobCategory = 'all';
let mobileJobCategoryShowAll = false;
let mobileJobSearchQuery = '';
let mobileJobSearchTimer = null;
let mobileJobSearchShowAll = false;

let activeMobileJobLocationMode = 'local';
let activeMobileJobCity = activeLocationCity || 'Çanakkale';
let activeMobileJobDistrict = activeLocationDistrict || 'Merkez';

let mobileJobProvinceCache = null;
const mobileJobDistrictCache = new Map();

function normalizeMobileJobText(value){
  return String(value||'')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/ı/g,'i')
    .replace(/ş/g,'s')
    .replace(/ğ/g,'g')
    .replace(/ü/g,'u')
    .replace(/ö/g,'o')
    .replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function mobileJobCategoryMeta(key){
  return MOBILE_JOB_CATEGORIES.find(item=>item.key===key)
    || MOBILE_JOB_CATEGORIES[MOBILE_JOB_CATEGORIES.length-1];
}

function inferMobileJobCategory(post){
  const explicit=String(post?.category||'').trim();
  if(MOBILE_JOB_CATEGORIES.some(item=>item.key===explicit))return explicit;

  const haystack=normalizeMobileJobText([
    post?.title,
    post?.description,
    post?.workMode
  ].filter(Boolean).join(' '));

  for(const item of MOBILE_JOB_CATEGORIES){
    if(item.key==='diger')continue;
    if(item.keywords.some(keyword=>haystack.includes(normalizeMobileJobText(keyword)))){
      return item.key;
    }
  }
  return 'diger';
}

function normalizeMobileJobPost(post){
  const category=inferMobileJobCategory(post);
  const meta=mobileJobCategoryMeta(category);
  return {
    ...post,
    category,
    categoryLabel:String(post?.categoryLabel||meta.label)
  };
}

function mobileJobLocationMode(post){
  const explicit=String(post?.locationMode||'').trim();
  if(['onsite','remote','home','hybrid'].includes(explicit))return explicit;

  const text=normalizeMobileJobText([
    post?.title,
    post?.description,
    post?.workMode
  ].filter(Boolean).join(' '));

  if(text.includes('online')||text.includes('uzaktan'))return 'remote';
  if(text.includes('evden'))return 'home';
  if(text.includes('hibrit'))return 'hybrid';
  return 'onsite';
}

function mobileJobLocationLabel(post){
  const mode=mobileJobLocationMode(post);
  const place=[post?.city,post?.district].filter(Boolean).join(' / ');

  if(mode==='remote')return '🌐 Online / Uzaktan';
  if(mode==='home')return place ? '🏠 Evden · '+place : '🏠 Evden / Sipariş';
  if(mode==='hybrid')return place ? '🔄 Hibrit · '+place : '🔄 Hibrit';
  return place ? '📍 '+place : '📍 Konum belirtilmedi';
}

function mobileJobMatchesLocation(post){
  const mode=mobileJobLocationMode(post);

  if(activeMobileJobLocationMode==='remote'){
    return ['remote','home','hybrid'].includes(mode);
  }

  if(activeMobileJobLocationMode==='all'){
    return true;
  }

  // Yerel aramada tamamen online ilanları dışarıda tut.
  if(mode==='remote')return false;

  const cityMatches=
    !activeMobileJobCity ||
    normalizeMobileJobText(post?.city)===normalizeMobileJobText(activeMobileJobCity);

  const districtMatches=
    !activeMobileJobDistrict ||
    normalizeMobileJobText(post?.district)===normalizeMobileJobText(activeMobileJobDistrict);

  return cityMatches && districtMatches;
}

const TURKEY_PROVINCES_STATIC = [
  {id:1,name:'Adana'},{id:2,name:'Adıyaman'},{id:3,name:'Afyonkarahisar'},
  {id:4,name:'Ağrı'},{id:5,name:'Amasya'},{id:6,name:'Ankara'},
  {id:7,name:'Antalya'},{id:8,name:'Artvin'},{id:9,name:'Aydın'},
  {id:10,name:'Balıkesir'},{id:11,name:'Bilecik'},{id:12,name:'Bingöl'},
  {id:13,name:'Bitlis'},{id:14,name:'Bolu'},{id:15,name:'Burdur'},
  {id:16,name:'Bursa'},{id:17,name:'Çanakkale'},{id:18,name:'Çankırı'},
  {id:19,name:'Çorum'},{id:20,name:'Denizli'},{id:21,name:'Diyarbakır'},
  {id:22,name:'Edirne'},{id:23,name:'Elazığ'},{id:24,name:'Erzincan'},
  {id:25,name:'Erzurum'},{id:26,name:'Eskişehir'},{id:27,name:'Gaziantep'},
  {id:28,name:'Giresun'},{id:29,name:'Gümüşhane'},{id:30,name:'Hakkâri'},
  {id:31,name:'Hatay'},{id:32,name:'Isparta'},{id:33,name:'Mersin'},
  {id:34,name:'İstanbul'},{id:35,name:'İzmir'},{id:36,name:'Kars'},
  {id:37,name:'Kastamonu'},{id:38,name:'Kayseri'},{id:39,name:'Kırklareli'},
  {id:40,name:'Kırşehir'},{id:41,name:'Kocaeli'},{id:42,name:'Konya'},
  {id:43,name:'Kütahya'},{id:44,name:'Malatya'},{id:45,name:'Manisa'},
  {id:46,name:'Kahramanmaraş'},{id:47,name:'Mardin'},{id:48,name:'Muğla'},
  {id:49,name:'Muş'},{id:50,name:'Nevşehir'},{id:51,name:'Niğde'},
  {id:52,name:'Ordu'},{id:53,name:'Rize'},{id:54,name:'Sakarya'},
  {id:55,name:'Samsun'},{id:56,name:'Siirt'},{id:57,name:'Sinop'},
  {id:58,name:'Sivas'},{id:59,name:'Tekirdağ'},{id:60,name:'Tokat'},
  {id:61,name:'Trabzon'},{id:62,name:'Tunceli'},{id:63,name:'Şanlıurfa'},
  {id:64,name:'Uşak'},{id:65,name:'Van'},{id:66,name:'Yozgat'},
  {id:67,name:'Zonguldak'},{id:68,name:'Aksaray'},{id:69,name:'Bayburt'},
  {id:70,name:'Karaman'},{id:71,name:'Kırıkkale'},{id:72,name:'Batman'},
  {id:73,name:'Şırnak'},{id:74,name:'Bartın'},{id:75,name:'Ardahan'},
  {id:76,name:'Iğdır'},{id:77,name:'Yalova'},{id:78,name:'Karabük'},
  {id:79,name:'Kilis'},{id:80,name:'Osmaniye'},{id:81,name:'Düzce'}
];

function fetchWithTimeout(url,timeoutMs=6000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);

  return fetch(url,{signal:controller.signal})
    .finally(()=>clearTimeout(timer));
}

async function fetchMobileJobProvinces(){
  if(Array.isArray(mobileJobProvinceCache))return mobileJobProvinceCache;

  // İl listesi sayfanın açılması için dış servisi beklemez.
  mobileJobProvinceCache=TURKEY_PROVINCES_STATIC.slice();
  return mobileJobProvinceCache;
}
async function fetchMobileJobDistricts(provinceId){
  if(!provinceId)return [];
  const key=String(provinceId);

  if(mobileJobDistrictCache.has(key)){
    return mobileJobDistrictCache.get(key);
  }

  const urls=[
    'https://api.turkiyeapi.dev/v2/provinces/'+encodeURIComponent(provinceId)+'/districts?fields=id,name&limit=100',
    'https://api.turkiyeapi.dev/v2/districts?provinceId='+encodeURIComponent(provinceId)+'&fields=id,name,provinceId&limit=100'
  ];

  let lastError=null;

  for(const url of urls){
    try{
      const response=await fetchWithTimeout(url,6000);
      if(!response.ok)throw new Error('İlçe verisi alınamadı');

      const result=await response.json();
      const rows=Array.isArray(result.data)?result.data:[];

      if(rows.length){
        mobileJobDistrictCache.set(key,rows);
        return rows;
      }
    }catch(error){
      lastError=error;
    }
  }

  throw lastError||new Error('İlçe verisi alınamadı');
}
async function fillMobileJobProvinceSelect(select,selectedCity='',allowAll=false){
  if(!select)return;

  select.disabled=true;
  select.innerHTML='<option value="">İller yükleniyor...</option>';

  try{
    const provinces=await fetchMobileJobProvinces();
    select.innerHTML='<option value="">'+(allowAll?'Tüm İller':'İl seçin')+'</option>';

    provinces.forEach(city=>{
      const option=document.createElement('option');
      option.value=city.name;
      option.textContent=city.name;
      option.dataset.id=city.id;
      select.appendChild(option);
    });

    const wanted=[...select.options].find(
      option=>normalizeMobileJobText(option.value)===normalizeMobileJobText(selectedCity)
    );
    if(wanted)select.value=wanted.value;
    select.disabled=false;
  }catch(error){
    console.error('İş fırsatları il listesi yüklenemedi:',error);
    select.innerHTML='<option value="">İller yüklenemedi</option>';
  }
}

async function fillMobileJobDistrictSelect(citySelect,districtSelect,selectedDistrict='',allowAll=false){
  if(!citySelect||!districtSelect)return;

  const option=citySelect.options[citySelect.selectedIndex];
  const provinceId=option?.dataset?.id||'';

  districtSelect.disabled=true;

  if(!provinceId){
    districtSelect.innerHTML='<option value="">'+(allowAll?'Tüm İlçeler':'Önce il seçin')+'</option>';
    return;
  }

  districtSelect.innerHTML='<option value="">İlçeler yükleniyor...</option>';

  try{
    const districts=await fetchMobileJobDistricts(provinceId);
    districtSelect.innerHTML='<option value="">'+(allowAll?'Tüm İlçeler':'İlçe seçin')+'</option>';

    districts.forEach(district=>{
      const item=document.createElement('option');
      item.value=district.name;
      item.textContent=district.name;
      districtSelect.appendChild(item);
    });

    const wanted=[...districtSelect.options].find(
      item=>normalizeMobileJobText(item.value)===normalizeMobileJobText(selectedDistrict)
    );
    if(wanted)districtSelect.value=wanted.value;

    districtSelect.disabled=false;
  }catch(error){
    console.error('İş fırsatları ilçe listesi yüklenemedi:',error);
    districtSelect.innerHTML='<option value="">İlçeler alınamadı · ili tekrar seçin</option>';
  }
}

function syncMobileJobLocationControls(){
  const selects=document.getElementById('mobileJobsLocationSelects');
  const note=document.getElementById('mobileJobsLocationNote');
  const label=document.getElementById('mobileJobsLocationLabel');

  document.querySelectorAll('[data-job-location-mode]').forEach(button=>{
    button.classList.toggle('active',button.dataset.jobLocationMode===activeMobileJobLocationMode);
  });

  selects?.classList.toggle('hidden',activeMobileJobLocationMode!=='local');

  if(label){
    if(activeMobileJobLocationMode==='remote'){
      label.textContent='Online / Evden';
    }else if(activeMobileJobLocationMode==='all'){
      label.textContent='Tüm Türkiye';
    }else{
      label.textContent=[activeMobileJobCity,activeMobileJobDistrict].filter(Boolean).join(' / ')||'Yerel';
    }
  }

  if(note){
    note.innerHTML=
      activeMobileJobLocationMode==='remote'
        ? '🌐 <b>Online / Evden</b> yapılabilen, şehir bağımsız veya evden sipariş alınabilen işler gösteriliyor.'
        : activeMobileJobLocationMode==='all'
          ? '🇹🇷 <b>Tüm Türkiye</b> içindeki yerel, online ve evden iş ilanları birlikte gösteriliyor.'
          : '📍 <b>'+escapeHtml([activeMobileJobCity,activeMobileJobDistrict].filter(Boolean).join(' / ')||'Seçili bölge')+'</b> içindeki yerel ilanlar gösteriliyor.';
  }
}

async function initializeMobileJobLocationControls(){
  const city=document.getElementById('mobileJobsCitySelect');
  const district=document.getElementById('mobileJobsDistrictSelect');

  if(city){
    await fillMobileJobProvinceSelect(city,activeMobileJobCity,true);
    await fillMobileJobDistrictSelect(city,district,activeMobileJobDistrict,true);
  }

  syncMobileJobLocationControls();
}

async function syncJobPostLocationForm(mode){
  const city=document.getElementById('jobPostCity');
  const district=document.getElementById('jobPostDistrict');
  const selects=document.getElementById('jobPostLocationSelects');
  const helper=document.getElementById('jobPostLocationHelper');

  const isRemote=mode==='remote';

  selects?.classList.toggle('is-remote',isRemote);

  if(city){
    city.required=!isRemote;
    city.disabled=isRemote;
  }
  if(district){
    district.disabled=isRemote || !city?.value;
  }

  if(helper){
    helper.textContent=
      mode==='remote'
        ? 'Online / uzaktan ilanlarda il ve ilçe seçmeniz gerekmez.'
        : mode==='home'
          ? 'Evden üretim / sipariş işlerinde teslim veya hizmet bölgenizi seçin.'
          : mode==='hybrid'
            ? 'Hibrit işler için yüz yüze çalışılacak ana bölgeyi seçin.'
            : 'Yerel ilanlarda il seçimi zorunludur.';
  }
}

function mobileJobTimestamp(value){
  if(!value)return 0;
  if(typeof value==='number')return value;
  if(value?.toMillis)return value.toMillis();
  const parsed=Date.parse(String(value));
  return Number.isFinite(parsed)?parsed:0;
}

function isMobileJobExpired(post){
  const ts=mobileJobTimestamp(post?.expiresAtTs||post?.expiresAt);
  return Boolean(ts && ts<=Date.now());
}

function mobileJobRelativeTime(value){
  const ts=mobileJobTimestamp(value);
  if(!ts)return 'Yeni';
  const minutes=Math.max(1,Math.floor((Date.now()-ts)/60000));
  if(minutes<60)return minutes+' dk önce';
  const hours=Math.floor(minutes/60);
  if(hours<24)return hours+' sa önce';
  const days=Math.floor(hours/24);
  return days+' gün önce';
}

function mobileJobTypeLabel(post){
  return post.type==='work' ? 'İŞ ARIYOR' : 'ELEMAN ARIYOR';
}

function mobileJobTypeIcon(post){
  return post.type==='work' ? '👤' : '🏢';
}

function isMobileJobExtra(post){
  const mode=normalizeMobileJobText(post.workMode||'');
  return ['gunluk','ek is','part time','hafta sonu','proje'].some(key=>mode.includes(key));
}

function mobileJobMatchesQuick(post){
  const mode=normalizeMobileJobText(post.workMode||'');

  if(activeMobileJobQuick==='extra')return isMobileJobExtra(post);
  if(activeMobileJobQuick==='parttime')return mode.includes('part time');
  if(activeMobileJobQuick==='weekend')return mode.includes('hafta sonu');
  if(activeMobileJobQuick==='project')return mode.includes('proje');
  return true;
}

function mobileJobMatchesSearch(post){
  if(!mobileJobSearchQuery)return true;
  const category=mobileJobCategoryMeta(inferMobileJobCategory(post));
  const haystack=normalizeMobileJobText([
    post.title,
    post.description,
    post.city,
    post.district,
    post.workMode,
    mobileJobLocationLabel(post),
    post.wage,
    post.contactName,
    post.categoryLabel,
    category.label,
    ...category.keywords
  ].filter(Boolean).join(' '));

  const terms=normalizeMobileJobText(mobileJobSearchQuery).split(' ').filter(Boolean);
  return terms.every(term=>haystack.includes(term));
}

function mobileJobFacetRows(){
  return mobileJobPosts
    .filter(post=>!isMobileJobExpired(post))
    .filter(post=>activeMobileJobFilter==='all'||post.type===activeMobileJobFilter)
    .filter(mobileJobMatchesLocation)
    .filter(mobileJobMatchesQuick)
    .filter(mobileJobMatchesSearch)
    .sort((a,b)=>mobileJobTimestamp(b.createdAt||b.date)-mobileJobTimestamp(a.createdAt||a.date));
}

function getFilteredMobileJobs(){
  return mobileJobFacetRows()
    .filter(post=>activeMobileJobCategory==='all'||inferMobileJobCategory(post)===activeMobileJobCategory);
}

function renderMobileJobCategories(){
  const root=document.getElementById('mobileJobsCategories');
  if(!root)return;

  const facetRows=mobileJobFacetRows();
  const counts=new Map();

  facetRows.forEach(post=>{
    const category=inferMobileJobCategory(post);
    counts.set(category,(counts.get(category)||0)+1);
  });

  const items=[
    {key:'all',icon:'⌘',label:'Tümü',count:facetRows.length},
    ...MOBILE_JOB_CATEGORIES.map(item=>({
      ...item,
      count:counts.get(item.key)||0
    }))
  ];

  const selectedIndex=items.findIndex(item=>item.key===activeMobileJobCategory);
  const jobCategoryColumns=window.innerWidth>820 ? 5 : 3;
  const rowEndIndex=activeMobileJobCategory==='all'
    ? -1
    : Math.min(
        items.length,
        Math.ceil((selectedIndex+1)/jobCategoryColumns)*jobCategoryColumns
      );

  const selectedRows=activeMobileJobCategory==='all'
    ? []
    : facetRows.filter(post=>inferMobileJobCategory(post)===activeMobileJobCategory);

  const selectedMeta=activeMobileJobCategory==='all'
    ? null
    : mobileJobCategoryMeta(activeMobileJobCategory);

  const visibleSelectedRows=mobileJobCategoryShowAll
    ? selectedRows
    : selectedRows.slice(0,4);

  const expandHtml=selectedMeta ? `
    <div class="mobile-jobs-category-expand" data-job-category-expand="${escapeHtml(activeMobileJobCategory)}">
      <div class="mobile-jobs-category-expand-head">
        <div class="mobile-jobs-category-expand-title">
          <span>${selectedMeta.icon}</span>
          <div>
            <strong>${escapeHtml(selectedMeta.label)}</strong>
            <small>${selectedRows.length} ilan · kategori sonuçları</small>
          </div>
        </div>
        <button type="button" data-job-category-close aria-label="Kategoriyi kapat">×</button>
      </div>

      <div class="mobile-jobs-category-expand-list">
        ${visibleSelectedRows.length
          ? visibleSelectedRows.map(mobileJobCardHtml).join('')
          : `
            <div class="mobile-jobs-category-no-result">
              <span>💼</span>
              <div>
                <strong>Bu kategoride uygun ilan yok</strong>
                <small>Filtreleri temizleyebilir veya ilk ilanı sen verebilirsin.</small>
              </div>
              <button type="button" data-job-post-empty>İlan Ver</button>
            </div>
          `}
      </div>

      ${selectedRows.length>4 ? `
        <button type="button" class="mobile-jobs-category-more" data-job-category-more>
          ${mobileJobCategoryShowAll
            ? 'Daha az göster'
            : 'Bu kategorideki tüm '+selectedRows.length+' ilanı göster'}
        </button>
      ` : ''}
    </div>
  ` : '';

  let output='';

  items.forEach((item,index)=>{
    const active=activeMobileJobCategory===item.key;
    output+=`
      <button
        type="button"
        class="${active?'active':''}"
        data-job-category="${item.key}"
        ${item.count===0&&item.key!=='all'?'aria-disabled="true"':''}
      >
        <span>${item.icon}</span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${item.count}</small>
      </button>
    `;

    if(rowEndIndex>0 && index+1===rowEndIndex){
      output+=expandHtml;
    }
  });

  root.innerHTML=output;

  root.querySelectorAll('[data-job-category]').forEach(button=>{
    button.addEventListener('click',()=>{
      const next=button.dataset.jobCategory||'all';

      if(next===activeMobileJobCategory && next!=='all'){
        activeMobileJobCategory='all';
      }else{
        activeMobileJobCategory=next;
      }

      mobileJobCategoryShowAll=false;
      renderMobileJobs();
    });
  });

  root.querySelector('[data-job-category-close]')?.addEventListener('click',()=>{
    activeMobileJobCategory='all';
    mobileJobCategoryShowAll=false;
    renderMobileJobs();
  });

  root.querySelector('[data-job-category-more]')?.addEventListener('click',()=>{
    mobileJobCategoryShowAll=!mobileJobCategoryShowAll;
    renderMobileJobs();
  });

  root.querySelector('[data-job-post-empty]')?.addEventListener('click',()=>openJobPostModal('hire'));

  bindMobileJobContactButtons(root);
}
function updateMobileJobsUi(filtered){
  const count=document.getElementById('mobileJobsResultCount');
  const location=document.getElementById('mobileJobsLocationLabel');
  const title=document.getElementById('mobileJobsResultsTitle');
  const hint=document.getElementById('mobileJobsResultsHint');
  const clear=document.getElementById('mobileJobsClearFilters');
  const searchClear=document.getElementById('mobileJobsSearchClear');

  if(count)count.textContent=String(filtered.length);

  if(location){
    location.textContent=
      activeMobileJobLocationMode==='remote'
        ? 'Online / Evden'
        : activeMobileJobLocationMode==='all'
          ? 'Tüm Türkiye'
          : ([activeMobileJobCity,activeMobileJobDistrict].filter(Boolean).join(' / ')||'Yerel');
  }

  syncMobileJobLocationControls();

  const typeText=
    activeMobileJobFilter==='hire' ? 'Eleman arayan ilanlar' :
    activeMobileJobFilter==='work' ? 'İş arayan ilanlar' :
    'Tüm iş fırsatları';

  const categoryText=
    activeMobileJobCategory==='all'
      ? ''
      : mobileJobCategoryMeta(activeMobileJobCategory).label;

  if(title){
    title.textContent=categoryText ? categoryText+' · '+typeText : typeText;
  }

  if(hint){
    if(mobileJobSearchQuery){
      hint.textContent='“'+mobileJobSearchQuery+'” aramasına uygun '+filtered.length+' ilan bulundu.';
    }else if(activeMobileJobLocationMode==='remote'){
      hint.textContent='Online, uzaktan ve evden yapılabilen ilanlar gösteriliyor.';
    }else if(activeMobileJobLocationMode==='local'&&activeMobileJobCity){
      hint.textContent=activeMobileJobCity+' içindeki en yeni ilanlar gösteriliyor.';
    }else{
      hint.textContent='En yeni ilanlar önce gösteriliyor.';
    }
  }

  const hasFilters=
    activeMobileJobFilter!=='all' ||
    activeMobileJobQuick!=='all' ||
    activeMobileJobCategory!=='all' ||
    Boolean(mobileJobSearchQuery);

  clear?.classList.toggle('hidden',!hasFilters);
  searchClear?.classList.toggle('hidden',!mobileJobSearchQuery);

  document.querySelectorAll('[data-job-filter]').forEach(button=>{
    button.classList.toggle('active',button.dataset.jobFilter===activeMobileJobFilter);
  });

  document.querySelectorAll('[data-job-quick]').forEach(button=>{
    button.classList.toggle('active',button.dataset.jobQuick===activeMobileJobQuick);
  });
}

function mobileJobCardHtml(post){
  const category=mobileJobCategoryMeta(inferMobileJobCategory(post));
  const locationLabel=mobileJobLocationLabel(post);
  const wage=String(post.wage||'').trim()||'Ücret görüşülür';

  return `
    <article class="mobile-job-card ${post.type==='work'?'worker':'employer'}" data-job-id="${escapeHtml(String(post.id||''))}">
      <div class="mobile-job-card-top">
        <div class="mobile-job-card-badges">
          <span class="mobile-job-type">${mobileJobTypeIcon(post)} ${mobileJobTypeLabel(post)}</span>
          <span class="mobile-job-category-badge">${category.icon} ${escapeHtml(category.label)}</span>
        </div>
        <span class="mobile-job-time">${post.demo?'ÖRNEK · ':''}${mobileJobRelativeTime(post.createdAt||post.date)}</span>
      </div>

      <h3>${escapeHtml(String(post.title||'İş fırsatı'))}</h3>

      <div class="mobile-job-meta">
        <span>${escapeHtml(locationLabel)}</span>
        <span>🕒 ${escapeHtml(String(post.workMode||'Çalışma şekli görüşülür'))}</span>
      </div>

      <p>${escapeHtml(String(post.description||''))}</p>

      <div class="mobile-job-card-footer">
        <div>
          <small>ÜCRET</small>
          <strong>${escapeHtml(wage)}</strong>
        </div>
        <button type="button" data-job-contact="${escapeHtml(String(post.id||''))}">
          ${post.type==='work'?'İletişime Geç':'Başvur / İletişim'}
        </button>
      </div>
    </article>
  `;
}

function mobileJobSearchResultHtml(post){
  const category=mobileJobCategoryMeta(inferMobileJobCategory(post));
  const wage=String(post.wage||'').trim()||'Ücret görüşülür';

  return `
    <article class="mobile-job-search-result-row">
      <div class="mobile-job-search-result-main">
        <div class="mobile-job-search-result-badges">
          <span class="${post.type==='work'?'worker':'employer'}">
            ${mobileJobTypeIcon(post)} ${mobileJobTypeLabel(post)}
          </span>
          <span>${category.icon} ${escapeHtml(category.label)}</span>
        </div>
        <strong>${escapeHtml(String(post.title||'İş fırsatı'))}</strong>
        <small>${escapeHtml(mobileJobLocationLabel(post))} · ${escapeHtml(String(post.workMode||'Esnek'))}</small>
      </div>
      <div class="mobile-job-search-result-side">
        <b>${escapeHtml(wage)}</b>
        <button type="button" data-job-contact="${escapeHtml(String(post.id||''))}">
          ${post.type==='work'?'İletişim':'Başvur'}
        </button>
      </div>
    </article>
  `;
}

function renderMobileJobSearchResults(){
  const panel=document.getElementById('mobileJobsSearchResults');
  const list=document.getElementById('mobileJobsSearchResultsList');
  const count=document.getElementById('mobileJobsSearchResultCount');
  if(!panel||!list)return;

  const query=String(mobileJobSearchQuery||'').trim();

  if(!query){
    panel.classList.add('hidden');
    list.innerHTML='';
    if(count)count.textContent='0';
    return;
  }

  const rows=mobileJobFacetRows();
  if(count)count.textContent=String(rows.length);
  panel.classList.remove('hidden');

  if(!rows.length){
    list.innerHTML=`
      <div class="mobile-job-search-no-result">
        <span>⌕</span>
        <div>
          <strong>“${escapeHtml(query)}” için ilan bulunamadı</strong>
          <small>Farklı bir kelime deneyin veya konum filtresini genişletin.</small>
        </div>
      </div>
    `;
    return;
  }

  const visible=mobileJobSearchShowAll ? rows : rows.slice(0,4);

  list.innerHTML=
    visible.map(mobileJobSearchResultHtml).join('')+
    (rows.length>4
      ? `
        <button type="button" class="mobile-job-search-more" data-job-search-more>
          ${mobileJobSearchShowAll
            ? 'Daha az göster'
            : 'Tüm '+rows.length+' sonucu burada göster'}
        </button>
      `
      : '');

  bindMobileJobContactButtons(list);

  list.querySelector('[data-job-search-more]')?.addEventListener('click',()=>{
    mobileJobSearchShowAll=!mobileJobSearchShowAll;
    renderMobileJobSearchResults();
  });
}

function bindMobileJobContactButtons(scope=document){
  scope.querySelectorAll('[data-job-contact]').forEach(button=>{
    if(button.dataset.jobContactBound==='1')return;
    button.dataset.jobContactBound='1';

    button.addEventListener('click',()=>{
      const post=mobileJobPosts.find(item=>String(item.id)===String(button.dataset.jobContact));
      if(!post)return;

      if(post.demo){
        showToast('Bu bir örnek ilan. Gerçek ilanlar yayınlandığında iletişim butonu aktif olacak.');
        return;
      }

      const phone=normalizeWhatsappNumber(post.phone||'');
      if(!phone){
        showToast('Bu ilanda iletişim numarası bulunmuyor.');
        return;
      }

      const text=encodeURIComponent(
        'Merhaba, Dijiyer İş Fırsatları bölümündeki "'+String(post.title||'ilan')+'" ilanınız için yazıyorum.'
      );
      window.open('https://wa.me/'+phone+'?text='+text,'_blank','noopener');
    });
  });
}

function renderMobileJobs(){
  const list=document.getElementById('mobileJobsList');
  const resultsHead=document.querySelector('.mobile-jobs-results-head');
  if(!list)return;

  const filtered=getFilteredMobileJobs();
  const inlineCategoryActive=activeMobileJobCategory!=='all';

  renderMobileJobCategories();
  updateMobileJobsUi(filtered);
  renderMobileJobSearchResults();

  resultsHead?.classList.toggle('hidden',inlineCategoryActive);
  list.classList.toggle('hidden',inlineCategoryActive);

  if(inlineCategoryActive){
    list.innerHTML='';
    return;
  }

  list.innerHTML=filtered.length
    ? filtered.slice(0,12).map(mobileJobCardHtml).join('')
    : `
      <div class="mobile-jobs-empty">
        <span>💼</span>
        <div>
          <strong>Aramana uygun ilan bulunamadı</strong>
          <small>Filtreyi temizleyebilir veya ilk ilanı sen verebilirsin.</small>
        </div>
        <button type="button" data-job-post-empty>İlan Ver</button>
      </div>
    `;

  bindMobileJobContactButtons(list);
  list.querySelector('[data-job-post-empty]')?.addEventListener('click',()=>openJobPostModal('hire'));
}
async function loadMobileJobs(){
  const list=document.getElementById('mobileJobsList');
  if(!list)return;

  try{
    const snapshot=await db.collection('jobPosts')
      .where('status','==','published')
      .limit(50)
      .get();

    const published=snapshot.docs
      .map(doc=>normalizeMobileJobPost({id:doc.id,...doc.data()}))
      .filter(post=>!isMobileJobExpired(post))
      .sort((a,b)=>mobileJobTimestamp(b.createdAt||b.date)-mobileJobTimestamp(a.createdAt||a.date));

    mobileJobPosts=published.length
      ? published
      : MOBILE_JOB_DEMOS.map(normalizeMobileJobPost);
  }catch(error){
    console.warn('İş ilanları şu anda Firestore’dan okunamadı:',error);
    mobileJobPosts=MOBILE_JOB_DEMOS.map(normalizeMobileJobPost);
  }

  renderMobileJobs();
}

function setMobileJobFilter(filter){
  activeMobileJobFilter=filter||'all';
  mobileJobCategoryShowAll=false;
  renderMobileJobs();
}

function setMobileJobQuickFilter(filter){
  activeMobileJobQuick=filter||'all';
  mobileJobCategoryShowAll=false;
  renderMobileJobs();
}

function populateMobileJobCategorySelect(){
  const select=document.getElementById('jobPostCategory');
  if(!select)return;

  select.innerHTML='<option value="">Kategori seçin</option>'+
    MOBILE_JOB_CATEGORIES.map(item=>
      '<option value="'+item.key+'">'+item.icon+' '+escapeHtml(item.label)+'</option>'
    ).join('');
}

async function openJobPostModal(type='hire'){
  const modal=document.getElementById('jobPostModal');
  const form=document.getElementById('jobPostForm');
  if(!modal||!form)return;

  form.reset();

  const selected=form.querySelector('input[name="jobPostType"][value="'+(type==='work'?'work':'hire')+'"]');
  if(selected)selected.checked=true;

  const onsite=form.querySelector('input[name="jobPostLocationMode"][value="onsite"]');
  if(onsite)onsite.checked=true;

  const city=document.getElementById('jobPostCity');
  const district=document.getElementById('jobPostDistrict');
  const category=document.getElementById('jobPostCategory');
  const duration=document.getElementById('jobPostDuration');
  const message=document.getElementById('jobPostMessage');

  if(category && activeMobileJobCategory!=='all')category.value=activeMobileJobCategory;
  if(duration)duration.value='15';
  if(message){
    message.textContent='';
    message.classList.remove('success');
  }

  openModal('jobPostModal');

  await fillMobileJobProvinceSelect(city,activeMobileJobCity||activeLocationCity||'',false);
  await fillMobileJobDistrictSelect(city,district,activeMobileJobDistrict||activeLocationDistrict||'',false);
  await syncJobPostLocationForm('onsite');
}

document.querySelectorAll('[data-job-filter]').forEach(button=>{
  button.addEventListener('click',()=>setMobileJobFilter(button.dataset.jobFilter));
});

document.querySelectorAll('[data-job-quick]').forEach(button=>{
  button.addEventListener('click',()=>setMobileJobQuickFilter(button.dataset.jobQuick));
});

document.getElementById('mobileJobsSearchInput')?.addEventListener('input',event=>{
  clearTimeout(mobileJobSearchTimer);
  mobileJobSearchShowAll=false;
  mobileJobSearchTimer=setTimeout(()=>{
    mobileJobSearchQuery=String(event.target.value||'').trim();
    renderMobileJobs();
  },80);
});

document.getElementById('mobileJobsSearchClear')?.addEventListener('click',()=>{
  const input=document.getElementById('mobileJobsSearchInput');
  if(input)input.value='';
  mobileJobSearchQuery='';
  mobileJobSearchShowAll=false;
  renderMobileJobs();
  input?.focus();
});

document.getElementById('mobileJobsSearchResultsClose')?.addEventListener('click',()=>{
  const input=document.getElementById('mobileJobsSearchInput');
  if(input)input.value='';
  mobileJobSearchQuery='';
  mobileJobSearchShowAll=false;
  renderMobileJobs();
  input?.focus();
});

document.getElementById('mobileJobsClearFilters')?.addEventListener('click',()=>{
  activeMobileJobFilter='all';
  activeMobileJobQuick='all';
  activeMobileJobCategory='all';
  mobileJobSearchQuery='';
  mobileJobSearchShowAll=false;
  const input=document.getElementById('mobileJobsSearchInput');
  if(input)input.value='';
  renderMobileJobs();
});

document.querySelectorAll('[data-job-location-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
    activeMobileJobLocationMode=button.dataset.jobLocationMode||'local';
    activeMobileJobCategory='all';
    mobileJobCategoryShowAll=false;
    renderMobileJobs();
  });
});

document.getElementById('mobileJobsCitySelect')?.addEventListener('change',async function(){
  activeMobileJobCity=this.value||'';
  activeMobileJobDistrict='';
  await fillMobileJobDistrictSelect(
    this,
    document.getElementById('mobileJobsDistrictSelect'),
    '',
    true
  );
  renderMobileJobs();
});

document.getElementById('mobileJobsDistrictSelect')?.addEventListener('change',function(){
  activeMobileJobDistrict=this.value||'';
  renderMobileJobs();
});

document.querySelectorAll('input[name="jobPostLocationMode"]').forEach(input=>{
  input.addEventListener('change',async()=>{
    const mode=document.querySelector('input[name="jobPostLocationMode"]:checked')?.value||'onsite';
    await syncJobPostLocationForm(mode);
  });
});

document.getElementById('jobPostCity')?.addEventListener('change',async function(){
  await fillMobileJobDistrictSelect(
    this,
    document.getElementById('jobPostDistrict'),
    '',
    false
  );
});

document.getElementById('mobileJobsPostBtn')?.addEventListener('click',()=>openJobPostModal('hire'));
document.getElementById('mobileJobsHireBtn')?.addEventListener('click',()=>openJobPostModal('hire'));
document.getElementById('mobileJobsWorkBtn')?.addEventListener('click',()=>openJobPostModal('work'));

document.getElementById('jobPostForm')?.addEventListener('submit',async event=>{
  event.preventDefault();

  const form=event.currentTarget;
  const submit=document.getElementById('jobPostSubmitBtn');
  const message=document.getElementById('jobPostMessage');
  const phone=normalizeQuoteTrackingPhone(document.getElementById('jobPostPhone')?.value||'');
  const categoryKey=String(document.getElementById('jobPostCategory')?.value||'').trim();
  const categoryMeta=mobileJobCategoryMeta(categoryKey);
  const durationDays=Math.max(7,Math.min(30,Number(document.getElementById('jobPostDuration')?.value||15)));
  const locationMode=form.querySelector('input[name="jobPostLocationMode"]:checked')?.value||'onsite';
  const cityValue=locationMode==='remote'
    ? ''
    : String(document.getElementById('jobPostCity')?.value||'').trim();
  const districtValue=locationMode==='remote'
    ? ''
    : String(document.getElementById('jobPostDistrict')?.value||'').trim();

  if(!categoryKey){
    if(message)message.textContent='Lütfen ilan kategorisini seçin.';
    return;
  }

  if(locationMode!=='remote' && !cityValue){
    if(message)message.textContent='Lütfen il seçin veya Online / Uzaktan seçeneğini kullanın.';
    return;
  }

  if(phone.length<10){
    if(message)message.textContent='Telefon numarasını kontrol edin.';
    return;
  }

  const expiresDate=new Date(Date.now()+durationDays*24*60*60*1000);

  const payload={
    type:form.querySelector('input[name="jobPostType"]:checked')?.value==='work'?'work':'hire',
    category:categoryKey,
    categoryLabel:categoryMeta.label,
    title:String(document.getElementById('jobPostTitle')?.value||'').trim(),
    locationMode,
    city:cityValue,
    district:districtValue,
    workMode:String(document.getElementById('jobPostWorkMode')?.value||'').trim(),
    wage:String(document.getElementById('jobPostWage')?.value||'').trim(),
    description:String(document.getElementById('jobPostDescription')?.value||'').trim(),
    contactName:String(document.getElementById('jobPostContactName')?.value||'').trim(),
    phone,
    durationDays,
    expiresAt:expiresDate.toISOString(),
    expiresAtTs:firebase.firestore.Timestamp.fromDate(expiresDate),
    status:'pending',
    date:new Date().toISOString(),
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };

  const oldText=submit?.textContent||'İlanı Gönder';
  if(submit){
    submit.disabled=true;
    submit.textContent='Gönderiliyor...';
  }
  if(message){
    message.textContent='';
    message.classList.remove('success');
  }

  try{
    await db.collection('jobPosts').add(payload);

    if(message){
      message.textContent='İlanınız alındı. Kontrol sonrası İş Fırsatları bölümünde yayınlanacak.';
      message.classList.add('success');
    }

    setTimeout(()=>{
      closeModal('jobPostModal');
      form.reset();
    },1100);
  }catch(error){
    console.error('İş ilanı gönderilemedi:',error);
    if(message){
      message.textContent='İlan gönderilemedi. İş ilanı Firestore kuralının güncel olduğundan emin olun.';
      message.classList.remove('success');
    }
  }finally{
    if(submit){
      submit.disabled=false;
      submit.textContent=oldText;
    }
  }
});

populateMobileJobCategorySelect();
initializeMobileJobLocationControls();
loadMobileJobs();

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
  const queryRaw = document.getElementById('searchInput').value.trim();
  const query = normalizeQuoteSearch(queryRaw);
  const inferredQueryCategory = query ? inferQuoteCategory(queryRaw) : null;
  const checkedCategories = [...document.querySelectorAll('.categoryFilter:checked')].map(x => x.value);
  const checkedSubCategories = [...document.querySelectorAll('.subCategoryFilter:checked')].map(x => ({
    mainCategory: x.dataset.mainCategory,
    subCategory: x.value
  }));
  const videoOnly = document.getElementById('videoOnly').checked;
  const offerOnly = document.getElementById('offerOnly').checked;
  const tour360Only = document.getElementById('tour360Only')?.checked || false;

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

    const searchableText = normalizeQuoteSearch(
      [
        inst.name,
        inst.location,
        inst.address,
        inst.city,
        inst.district,
        inst.classes,
        inst.description,
        mainLabel,
        subLabel
      ].filter(Boolean).join(' ')
    );

    const inferredCategoryMatch = Boolean(
      inferredQueryCategory &&
      inferredQueryCategory.mainCategory === mainCategory &&
      inferredQueryCategory.subCategory === subCategory
    );

    const matchesQuery = !query ||
      searchableText.includes(query) ||
      inferredCategoryMatch;

    const matchesVideo = !videoOnly || inst.video;
    const matchesOffer = !offerOnly || inst.offer;
    const has360Tour = Boolean(
      inst.has360Tour ||
      inst.tour360Url ||
      inst.virtualTourUrl ||
      inst.tour360
    );
    const matches360Tour = !tour360Only || has360Tour;

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

    return matchesCategory &&
      matchesQuery &&
      matchesVideo &&
      matchesOffer &&
      matches360Tour &&
      matchesLocation;
  });

  const sort = document.getElementById('sortSelect').value;
  if (sort === 'rating') data.sort((a,b) => b.rating - a.rating);
  return data;
}

const comparedInstitutionIds = new Set();

function institutionCategoryText(inst){
  const [mainCategory,subCategory]=resolveTaxonomy(inst);
  return categoryTaxonomy[mainCategory]?.subs?.[subCategory]
    || categoryTaxonomy[mainCategory]?.label
    || String(inst.category||"");
}

function comparisonInstitutionRows(){
  return [...comparedInstitutionIds]
    .map(id=>institutions.find(inst=>String(inst.id)===String(id)))
    .filter(Boolean);
}

function renderComparisonBar(){
  let bar=document.getElementById("institutionComparisonBar");
  const rows=comparisonInstitutionRows();

  if(!bar){
    bar=document.createElement("div");
    bar.id="institutionComparisonBar";
    bar.className="institution-comparison-bar hidden";
    document.body.appendChild(bar);
  }

  if(!rows.length){
    bar.classList.add("hidden");
    bar.innerHTML="";
    return;
  }

  bar.classList.remove("hidden");
  bar.innerHTML=`
    <div class="comparison-bar-copy">
      <strong>${rows.length} kurum seçildi</strong>
      <small>${rows.length<2?"Karşılaştırmak için bir kurum daha seçin.":"Puan, konum ve hizmetleri yan yana görün."}</small>
    </div>
    <div class="comparison-bar-names">
      ${rows.map(inst=>'<span>'+escapeHtml(String(inst.short||inst.name||"Kurum"))+'</span>').join("")}
    </div>
    <div class="comparison-bar-actions">
      <button type="button" class="comparison-clear-btn" id="clearComparisonBtn">Temizle</button>
      <button type="button" class="comparison-open-btn" id="openComparisonBtn" ${rows.length<2?"disabled":""}>
        Karşılaştır
      </button>
    </div>
  `;

  document.getElementById("clearComparisonBtn")?.addEventListener("click",()=>{
    comparedInstitutionIds.clear();
    renderList();
  });

  document.getElementById("openComparisonBtn")?.addEventListener("click",openComparisonModal);
}

function toggleInstitutionComparison(id){
  const key=String(id);
  if(comparedInstitutionIds.has(key)){
    comparedInstitutionIds.delete(key);
  }else{
    if(comparedInstitutionIds.size>=3){
      showToast("En fazla 3 kurumu aynı anda karşılaştırabilirsiniz.");
      return;
    }
    comparedInstitutionIds.add(key);
  }
  renderList();
}

function openComparisonModal(){
  const rows=comparisonInstitutionRows();
  if(rows.length<2){
    showToast("Karşılaştırmak için en az 2 kurum seçin.");
    return;
  }

  document.getElementById("institutionComparisonModal")?.remove();

  const modal=document.createElement("div");
  modal.id="institutionComparisonModal";
  modal.className="institution-comparison-modal";
  modal.innerHTML=`
    <div class="institution-comparison-card" role="dialog" aria-modal="true" aria-label="Kurum karşılaştırma">
      <div class="comparison-modal-head">
        <div>
          <span>KURUMLARI KARŞILAŞTIR</span>
          <h2>Seçtiğiniz kurumları yan yana inceleyin</h2>
          <p>Karar vermenize yardımcı olacak temel kurum bilgileri birlikte gösterilir.</p>
        </div>
        <button type="button" class="comparison-modal-close" aria-label="Kapat">×</button>
      </div>

      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Özellik</th>
              ${rows.map(inst=>`
                <th>
                  <div class="comparison-brand">
                    <span>${inst.logoUrl
                      ? '<img src="'+safePublicProfileUrl(inst.logoUrl)+'" alt="">'
                      : escapeHtml(String(inst.emoji||"🏢"))}</span>
                    <strong>${escapeHtml(String(inst.name||"Kurum"))}</strong>
                  </div>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            <tr><td>Puan</td>${rows.map(inst=>'<td><b>⭐ '+escapeHtml(String(inst.rating||0))+'</b><small>'+escapeHtml(String(inst.reviewCount||0))+' değerlendirme</small></td>').join("")}</tr>
            <tr><td>Kategori</td>${rows.map(inst=>'<td>'+escapeHtml(institutionCategoryText(inst))+'</td>').join("")}</tr>
            <tr><td>Konum</td>${rows.map(inst=>'<td>'+escapeHtml(String(inst.location||"-"))+'</td>').join("")}</tr>
            <tr><td>Teklif</td>${rows.map(inst=>'<td>'+(inst.offer?'<span class="comparison-yes">✓ Fiyat teklifi veriyor</span>':'<span class="comparison-muted">Belirtilmemiş</span>')+'</td>').join("")}</tr>
            <tr><td>Videolu Profil</td>${rows.map(inst=>'<td>'+(inst.video?'<span class="comparison-yes">✓ Var</span>':'<span class="comparison-muted">Yok</span>')+'</td>').join("")}</tr>
            <tr><td>Hizmet / Sınıflar</td>${rows.map(inst=>'<td>'+escapeHtml(String(inst.classes||"-"))+'</td>').join("")}</tr>
            <tr><td>Hizmet Bölgesi</td>${rows.map(inst=>'<td>'+escapeHtml(String(inst.serviceAreas||inst.location||"-"))+'</td>').join("")}</tr>
          </tbody>
        </table>
      </div>

      <div class="comparison-profile-actions">
        ${rows.map(inst=>'<a href="kurum.html?id='+encodeURIComponent(inst.id)+'">'+escapeHtml(String(inst.short||inst.name||"Profili Gör"))+' →</a>').join("")}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close=()=>modal.remove();
  modal.querySelector(".comparison-modal-close")?.addEventListener("click",close);
  modal.addEventListener("click",event=>{
    if(event.target===modal)close();
  });
}

function getInstitutionListSponsorAds(){
  return getBannerAdsForPlacement('search');
}

function institutionListSponsorHtml(){
  const ads=getInstitutionListSponsorAds();

  if(!ads.length){
    return `
      <article class="institution-list-sponsored institution-list-sponsored-empty">
        <div class="institution-list-sponsored-empty-icon">📣</div>
        <div class="institution-list-sponsored-empty-copy">
          <span>SPONSORLU REKLAM ALANI</span>
          <strong>İşletmeni burada göster</strong>
          <small>Kurum listesinde müşterilerin karşısına görsel veya video reklamla çık.</small>
        </div>
        <button type="button" data-advertise-home data-ad-service="regionalAd" data-ad-order="1">Reklam Ver</button>
      </article>
    `;
  }

  const ad=ads[0];
  const image=safePublicProfileUrl(ad.imageUrl || ad.logoUrl || '');
  const video=safePublicProfileUrl(ad.videoUrl || '');
  const isVideo=String(ad.mediaType || '')==='video' && Boolean(video);
  const regionText=[ad.city,ad.district].filter(Boolean).join(' / ');
  const sectorText=ad.categoryLabel || bannerCategoryLabel(ad.category);
  const href='kurum.html?id='+encodeURIComponent(ad.institutionId || '');
  trackBannerAdImpression(ad);

  return `
    <article class="institution-list-sponsored">
      <a class="institution-list-sponsored-link" data-banner-ad-id="${escapeHtml(String(ad.id||""))}" href="${href}">
        <div class="institution-list-sponsored-media ${isVideo ? 'is-video' : ''}">
          ${isVideo
            ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+image+'"></video>'
            : (image
                ? '<img src="'+image+'" alt="'+escapeHtml(ad.institutionName || 'Sponsorlu kurum')+'">'
                : '<div class="institution-list-sponsored-fallback">📣</div>')}
          <span class="institution-list-sponsored-badge">SPONSORLU</span>
          ${isVideo ? '<span class="institution-list-sponsored-video-badge">▶ Video Reklam</span>' : ''}
        </div>
        <div class="institution-list-sponsored-body">
          <strong>${escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')}</strong>
          <p>${escapeHtml(ad.text || '')}</p>
          <div>
            <small>${escapeHtml([regionText,sectorText].filter(Boolean).join(' · '))}</small>
            <b>İncele →</b>
          </div>
        </div>
      </a>
    </article>
  `;
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
    exploreResultLabel.textContent = 'kurum listeleniyor';
  }

  syncExploreQuickFilterState();
  renderSponsoredAds();

  const institutionCards = data.map(inst => {
    const compared = compareInstitutionIds.has(String(inst.id));
    return `
      <article class="institution-card ${String(inst.id) === String(selectedId) ? 'active' : ''}" data-id="${escapeHtml(String(inst.id))}">
        <div class="thumb ${inst.logoUrl ? 'has-logo' : ''}">
          ${inst.logoUrl
            ? '<img src="' + safePublicProfileUrl(inst.logoUrl) + '" alt="' + escapeHtml(inst.name) + ' logosu">'
            : '<span>' + escapeHtml(inst.emoji || '🏢') + '</span>'}
          ${inst.video ? '<div class="video-badge">▶ Videolu</div>' : ''}
        </div>
        ${inst.vip ? '<div class="vip">VIP</div>' : ''}
        <div class="card-body">
          <h3>${escapeHtml(inst.name)}</h3>
          <div class="rating" id="detailRating">⭐ ${Number(inst.rating || 0).toFixed(1)} <span>(${Number(inst.reviewCount || 0)} değerlendirme)</span>${Number(inst.recommendationCount||0)>0 && Number.isFinite(Number(inst.recommendationRate)) ? '<em class="institution-recommendation">👍 '+Number(inst.recommendationYes||0)+' kişi · %'+Math.round(Number(inst.recommendationRate))+'</em>' : ''}</div>
          <div class="meta">📍 ${escapeHtml(inst.location || '')}<br>${escapeHtml(inst.address || '')}</div>
          <div class="card-actions">
            ${inst.offer ? '<span class="chip positive">Teklif veriyor</span>' : ''}
            ${inst.video ? '<span class="chip">Videolu profil</span>' : ''}
            <button
              type="button"
              class="compare-mini-btn ${compared ? 'selected' : ''}"
              data-compare-toggle="${escapeHtml(String(inst.id))}"
              aria-pressed="${compared ? 'true' : 'false'}"
            >${compared ? '✓ Seçildi' : '＋ Karşılaştır'}</button>
            <button class="small-btn" data-quick-offer="${escapeHtml(String(inst.id))}">Fiyat Al</button>
          </div>
        </div>
      </article>
    `;
  });

  if (institutionCards.length >= 2) {
    institutionCards.splice(2, 0, institutionListSponsorHtml());
  } else if (institutionCards.length) {
    institutionCards.push(institutionListSponsorHtml());
  }

  list.innerHTML = institutionCards.join('') ||
    `<div class="institution-list-empty">Filtreye uygun kurum bulunamadı.</div>`;

  bindHomepageAdvertiseButtons();

  document.querySelectorAll('.institution-card').forEach(card => {
    card.addEventListener('click', e => {
      if (
        e.target.closest('[data-quick-offer]') ||
        e.target.closest('[data-compare-toggle]')
      ) return;

      const id = card.dataset.id;

      if (window.matchMedia('(max-width: 820px)').matches) {
        window.location.href = 'kurum.html?id=' + encodeURIComponent(id);
        return;
      }

      selectedId = id;
      document.querySelectorAll('.institution-card').forEach(item => {
        item.classList.toggle('active', String(item.dataset.id) === String(id));
      });
      renderDecisionAlternatives();
      renderDetail();
      requestAnimationFrame(() => {
        document.getElementById('detailPanel')
          ?.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
  });

  document.querySelectorAll('[data-quick-offer]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openInstitutionDirectQuote(btn.dataset.quickOffer);
    });
  });

  document.querySelectorAll('[data-compare-toggle]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleCompareInstitution(btn.dataset.compareToggle);
    });
  });

  renderCompareBar();
  renderDecisionAlternatives();
  renderDetail();
  updateMobileCategoryResult();
}
function toggleCompareInstitution(id) {
  const key = String(id || '');
  if (!key) return;

  if (compareInstitutionIds.has(key)) {
    compareInstitutionIds.delete(key);
  } else {
    if (compareInstitutionIds.size >= 3) {
      showToast('En fazla 3 kurumu karşılaştırabilirsiniz.');
      return;
    }
    compareInstitutionIds.add(key);
  }

  renderList();
}

function ensureCompareUi() {
  if (!document.getElementById('institutionCompareBar')) {
    const bar = document.createElement('div');
    bar.id = 'institutionCompareBar';
    bar.className = 'institution-compare-bar hidden';
    document.body.appendChild(bar);
  }

  if (!document.getElementById('institutionCompareModal')) {
    const modal = document.createElement('div');
    modal.id = 'institutionCompareModal';
    modal.className = 'modal hidden institution-compare-modal';
    modal.innerHTML = `
      <div class="modal-card compare-modal-card">
        <button type="button" class="modal-close" id="institutionCompareClose" aria-label="Kapat">×</button>
        <div class="compare-modal-head">
          <span>KURUMLARI KARŞILAŞTIR</span>
          <h2>Seçtiğiniz kurumları yan yana inceleyin</h2>
          <p>Puan, teklif durumu, video, konum ve temel kurum bilgilerini karşılaştırın.</p>
        </div>
        <div class="compare-table-wrap" id="institutionCompareContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', event => {
      if (event.target === modal) modal.classList.add('hidden');
    });
    modal.querySelector('#institutionCompareClose')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
}

function renderCompareBar() {
  ensureCompareUi();
  const bar = document.getElementById('institutionCompareBar');
  if (!bar) return;

  const selected = [...compareInstitutionIds]
    .map(id => institutions.find(inst => String(inst.id) === String(id)))
    .filter(Boolean);

  const trackingButton = document.getElementById('trackingMainBtn');
  const opportunitiesButton = document.getElementById('opportunitiesMainBtn');

  if (!selected.length) {
    bar.classList.add('hidden');
    bar.innerHTML = '';
    trackingButton?.classList.remove('compare-active');
    opportunitiesButton?.classList.remove('compare-active');
    return;
  }

  trackingButton?.classList.add('compare-active');
  opportunitiesButton?.classList.add('compare-active');
  bar.classList.remove('hidden');
  bar.innerHTML = `
    <div class="compare-bar-copy">
      <strong>${selected.length} kurum seçildi</strong>
      <small>${selected.map(inst => escapeHtml(inst.short || inst.name)).join(' · ')}</small>
    </div>
    <div class="compare-bar-actions">
      <button type="button" class="compare-clear-btn" id="compareClearBtn">Temizle</button>
      <button type="button" class="compare-open-btn" id="compareOpenBtn" ${selected.length < 2 ? 'disabled' : ''}>
        Karşılaştır ${selected.length > 1 ? '(' + selected.length + ')' : ''}
      </button>
    </div>
  `;

  document.getElementById('compareClearBtn')?.addEventListener('click', () => {
    compareInstitutionIds.clear();
    renderList();
  });

  document.getElementById('compareOpenBtn')?.addEventListener('click', () => {
    if (compareInstitutionIds.size < 2) {
      showToast('Karşılaştırmak için en az 2 kurum seçin.');
      return;
    }
    openInstitutionCompareModal();
  });
}

function openInstitutionCompareModal() {
  ensureCompareUi();

  const selected = [...compareInstitutionIds]
    .map(id => institutions.find(inst => String(inst.id) === String(id)))
    .filter(Boolean);

  if (selected.length < 2) return;

  const content = document.getElementById('institutionCompareContent');
  if (!content) return;

  const cells = (render) => selected.map(render).join('');

  content.innerHTML = `
    <div class="compare-grid" style="--compare-count:${selected.length}">
      <div class="compare-label-cell"></div>
      ${cells(inst => `
        <div class="compare-institution-head">
          ${inst.logoUrl
            ? '<img src="' + safePublicProfileUrl(inst.logoUrl) + '" alt="">'
            : '<span>' + escapeHtml(inst.emoji || '🏢') + '</span>'}
          <strong>${escapeHtml(inst.name)}</strong>
          <small>📍 ${escapeHtml(inst.location || '-')}</small>
        </div>
      `)}

      <div class="compare-label-cell">Puan</div>
      ${cells(inst => '<div class="compare-value-cell"><b>⭐ ' + Number(inst.rating || 0).toFixed(1) + '</b><small>' + Number(inst.reviewCount || 0) + ' değerlendirme</small></div>')}

      <div class="compare-label-cell">Teklif</div>
      ${cells(inst => '<div class="compare-value-cell">' + (inst.offer ? '<b class="compare-yes">✓ Teklif veriyor</b>' : '<span>Teklif kapalı</span>') + '</div>')}

      <div class="compare-label-cell">Tanıtım</div>
      ${cells(inst => '<div class="compare-value-cell">' + (inst.video ? '<b class="compare-yes">▶ Videolu profil</b>' : '<span>Standart profil</span>') + '</div>')}

      <div class="compare-label-cell">Hizmet Bölgesi</div>
      ${cells(inst => '<div class="compare-value-cell"><span>' + escapeHtml(inst.serviceAreas || inst.location || '-') + '</span></div>')}

      <div class="compare-label-cell">Çalışma</div>
      ${cells(inst => '<div class="compare-value-cell"><span>' + escapeHtml(inst.weekdayHours || 'Bilgi yok') + '</span></div>')}

      <div class="compare-label-cell">İşlem</div>
      ${cells(inst => '<div class="compare-value-cell"><a href="kurum.html?id=' + encodeURIComponent(inst.id) + '">Profili Gör →</a></div>')}
    </div>
  `;

  document.getElementById('institutionCompareModal')?.classList.remove('hidden');
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
    openInstitutionDirectQuote(inst);
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

function getInstitutionCurrentCampaign(inst) {
  if (!inst) return null;

  try {
    return activeRegionalBannerAds().find(
      ad => String(ad.institutionId || '') === String(inst.id || '')
    ) || null;
  } catch (_) {
    return null;
  }
}

function getSimilarInstitutions(inst) {
  if (!inst) return [];

  const main = String(inst.mainCategory || '');
  const sub = String(inst.subCategory || inst.category || '');
  const city = normalizeQuoteSearch(inst.city || '');
  const district = normalizeQuoteSearch(inst.district || '');

  return institutions
    .filter(item => String(item.id) !== String(inst.id))
    .map(item => {
      let score = 0;
      if (sub && String(item.subCategory || item.category || '') === sub) score += 8;
      if (main && String(item.mainCategory || '') === main) score += 4;
      if (city && normalizeQuoteSearch(item.city || '') === city) score += 3;
      if (district && normalizeQuoteSearch(item.district || '') === district) score += 2;
      if (item.offer) score += 1;
      return { item, score };
    })
    .filter(entry => entry.score >= 4)
    .sort((a, b) =>
      b.score - a.score ||
      Number(b.item.rating || 0) - Number(a.item.rating || 0) ||
      Number(b.item.reviewCount || 0) - Number(a.item.reviewCount || 0)
    )
    .slice(0, 3)
    .map(entry => entry.item);
}

function formatInstitutionProfileDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function institutionFaqItems(inst) {
  const serviceArea = String(inst.serviceAreas || inst.location || '').trim();
  const weekday = String(inst.weekdayHours || '').trim();
  const weekend = [
    inst.saturdayHours ? 'Cumartesi ' + inst.saturdayHours : '',
    inst.sundayHours ? 'Pazar ' + inst.sundayHours : ''
  ].filter(Boolean).join(' · ');

  return [
    {
      q: 'Bu kurum hangi bölgede hizmet veriyor?',
      a: serviceArea || 'Hizmet bölgesi bilgisi henüz eklenmedi.'
    },
    {
      q: 'Fiyat bilgisini nasıl alabilirim?',
      a: inst.offer
        ? 'Kurum fiyat teklifi alıyor. “Fiyat Al” veya “Toplu Teklif Al” seçeneklerini kullanabilirsiniz.'
        : 'Kurum şu anda Dijiyer üzerinden teklif almıyor. Profildeki iletişim kanallarını kullanabilirsiniz.'
    },
    {
      q: 'Çalışma saatleri nedir?',
      a: weekday
        ? 'Hafta içi: ' + weekday + (weekend ? ' · ' + weekend : '')
        : 'Çalışma saatleri henüz eklenmedi.'
    },
    {
      q: 'Kurumu gitmeden önce inceleyebilir miyim?',
      a: inst.video
        ? 'Evet. Kurumun videolu profili mevcut' + (Array.isArray(inst.galleryUrls) && inst.galleryUrls.length ? ' ve galeri görsellerini de inceleyebilirsiniz.' : '.')
        : (Array.isArray(inst.galleryUrls) && inst.galleryUrls.length
          ? 'Kurumun galeri görsellerini inceleyebilirsiniz.'
          : 'Kurum henüz video veya galeri içeriği eklememiş.')
    }
  ];
}

function renderDecisionAlternatives() {
  const root = document.getElementById('decisionAlternativesRail');
  const section = document.getElementById('decisionAlternatives');
  const inst = institutions.find(item => String(item.id) === String(selectedId));

  if (!root || !section || !inst) {
    section?.classList.add('hidden');
    return;
  }

  const alternatives = getSimilarInstitutions(inst);

  if (!alternatives.length) {
    section.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  section.classList.remove('hidden');

  root.innerHTML = alternatives.map(item => {
    const compared = compareInstitutionIds.has(String(item.id));
    return `
      <article class="decision-alt-card ${compared ? 'is-compared' : ''}" data-alt-select="${escapeHtml(String(item.id))}">
        <div class="decision-alt-logo">
          ${item.logoUrl
            ? '<img src="' + safePublicProfileUrl(item.logoUrl) + '" alt="">'
            : '<span>' + escapeHtml(item.emoji || '🏢') + '</span>'}
        </div>
        <div class="decision-alt-copy">
          <strong>${escapeHtml(item.name)}</strong>
          <small>⭐ ${Number(item.rating || 0).toFixed(1)} · ${escapeHtml(item.location || '')}</small>
          <div>
            ${item.offer ? '<span>Teklif veriyor</span>' : ''}
            ${item.video ? '<span>Videolu</span>' : ''}
          </div>
        </div>
        <div class="decision-alt-actions">
          <button type="button" class="decision-alt-open" data-alt-open="${escapeHtml(String(item.id))}">Önizle</button>
          <button
            type="button"
            class="decision-alt-compare ${compared ? 'selected' : ''}"
            data-alt-compare="${escapeHtml(String(item.id))}"
          >${compared ? '✓' : '＋'}</button>
        </div>
      </article>
    `;
  }).join('');

  root.querySelectorAll('[data-alt-open]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      selectedId = button.dataset.altOpen;
      renderList();

      const marker = markers.get(String(selectedId));
      if (marker) map.flyTo(marker.getLatLng(), 15, { duration: .45 });
    });
  });

  root.querySelectorAll('[data-alt-compare]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      toggleCompareInstitution(button.dataset.altCompare);
    });
  });

  root.querySelectorAll('[data-alt-select]').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      selectedId = card.dataset.altSelect;
      renderList();

      const marker = markers.get(String(selectedId));
      if (marker) map.flyTo(marker.getLatLng(), 15, { duration: .45 });
    });
  });
}

function renderDetail() {
  const panel = document.getElementById('detailPanel');
  const inst = institutions.find(item => String(item.id) === String(selectedId));

  if (!panel) return;

  if (!inst) {
    panel.innerHTML = `
      <div class="empty-detail-state">
        <strong>Önizlenecek kurum bulunamadı.</strong>
        <span>Soldaki listeden veya haritadan bir kurum seçin.</span>
      </div>
    `;
    return;
  }

  const currentCampaign = getInstitutionCurrentCampaign(inst);
  const compared = compareInstitutionIds.has(String(inst.id));

  const primaryFacts = [
    {
      label:'Hizmet Bölgesi',
      value: inst.serviceAreas || inst.location || 'Bilgi yok',
      icon:'🧭'
    },
    {
      label:'Çalışma Saatleri',
      value: inst.weekdayHours || 'Bilgi yok',
      icon:'🕒'
    },
    {
      label:'Hizmet / Sınıf',
      value: inst.classes || 'Kurumdan bilgi alın',
      icon:'▦'
    }
  ];

  panel.innerHTML = `
    <div class="desktop-detail-heading">
      <div>
        <span>SEÇİLİ KURUM</span>
        <strong>Kurum Detayı</strong>
      </div>
      <small>${escapeHtml(inst.name || "")}</small>
    </div>
    ${isInstitutionPreviewMode() ? `
      <div class="public-preview-banner">
        <div>
          <strong>👁 Önizleme Modu</strong>
          <span>Müşteriler kurum profilinizi bu şekilde görür.</span>
        </div>
        <button type="button" id="closePublicPreviewBtn">Önizlemeyi Kapat</button>
      </div>
    ` : ''}

    <div class="quick-preview-intro">
      <div>
        <span>HIZLI ÖNİZLEME</span>
        <strong>Kurumu incele, sonra aksiyon al</strong>
        <small>Temel bilgileri burada gör. Daha fazlası için kurum profilini aç.</small>
      </div>
      <button
        type="button"
        id="detailCompareBtn"
        class="${compared ? 'selected' : ''}"
      >${compared ? '✓ Karşılaştırmada' : '＋ Karşılaştır'}</button>
    </div>

    <div class="quick-preview-main">
      <div class="video-box profile-cover-box quick-preview-media ${inst.coverUrl ? 'has-cover' : ''}">
        ${inst.coverUrl
          ? '<img src="' + safePublicProfileUrl(inst.coverUrl) + '" alt="' + escapeHtml(inst.name) + ' kapak görseli">'
          : '<div class="video-scene"></div><div class="play">▶</div><div class="video-title">🎥 Rota & Mekan Videosu</div>'}
        ${inst.video ? '<span class="detail-media-badge">▶ Videolu Profil</span>' : ''}
      </div>

      <div class="quick-preview-summary">
        <div class="profile-title-row">
          ${inst.logoUrl
            ? '<img class="public-profile-logo" src="' + safePublicProfileUrl(inst.logoUrl) + '" alt="">'
            : '<div class="public-profile-logo fallback">' + escapeHtml(inst.emoji || '🏢') + '</div>'}
          <div class="profile-title-copy">
            <div class="profile-title-meta">SEÇİLİ KURUM</div>
            <h1>${escapeHtml(inst.name)}${inst.vip ? '<span class="vip-inline">VIP</span>' : ''}</h1>
            <div class="rating">⭐ ${Number(inst.rating || 0).toFixed(1)} <span>(${Number(inst.reviewCount || 0)} değerlendirme)</span></div>
          </div>
        </div>

        <div class="quick-preview-address">
          📍 ${escapeHtml([inst.address,inst.location].filter(Boolean).join(', '))}
        </div>

        <div class="quick-preview-badges">
          ${inst.offer ? '<span class="positive">✓ Teklif veriyor</span>' : '<span>Teklif kapalı</span>'}
          ${inst.video ? '<span>▶ Video mevcut</span>' : ''}
          ${inst.website ? '<span>🌐 Web sitesi</span>' : ''}
        </div>

        ${inst.description ? `
          <p class="quick-preview-description">${escapeHtml(inst.description)}</p>
        ` : ''}

        <div class="quick-preview-links">
          ${inst.website ? '<button type="button" id="websiteBtn">Web Sitesi</button>' : ''}
          ${inst.instagram ? '<button type="button" id="instagramBtn">Instagram</button>' : ''}
          <button type="button" id="favoriteBtn">♡ Favoriye Ekle</button>
        </div>
      </div>
    </div>

    <div class="quick-preview-actions">
      <button class="quick-action primary" id="whatsappBtn">💬 Fiyat Al</button>
      <button class="quick-action secondary" id="routeBtn">🧭 Yol Tarifi</button>
      <button class="quick-action dark" id="profileOpenBtn">Tam Profili Gör →</button>
    </div>

    <div class="quick-facts-grid">
      ${primaryFacts.map(fact => `
        <article>
          <span>${escapeHtml(fact.label)}</span>
          <strong>${fact.icon} ${escapeHtml(fact.value)}</strong>
        </article>
      `).join('')}
    </div>

    ${currentCampaign ? `
      <article class="quick-campaign-card">
        <div class="quick-campaign-media">
          ${safePublicProfileUrl(currentCampaign.imageUrl || currentCampaign.logoUrl || '')
            ? '<img src="' + safePublicProfileUrl(currentCampaign.imageUrl || currentCampaign.logoUrl || '') + '" alt="">'
            : '<span>📣</span>'}
        </div>
        <div class="quick-campaign-copy">
          <span>GÜNCEL KAMPANYA</span>
          <strong>${escapeHtml(currentCampaign.headline || 'Kurumun güncel kampanyası')}</strong>
          <small>${escapeHtml(currentCampaign.text || 'Detaylar için kurumdan bilgi alın.')}</small>
        </div>
        <button type="button" id="campaignQuoteBtn">Fiyat Al</button>
      </article>
    ` : ''}

    <div class="quick-preview-footer">
      <button type="button" id="quoteBtn">📄 Birden Fazla Kurumdan Teklif Al</button>
      <small>Kararsızsanız tek form ile birden fazla kurumdan fiyat isteyebilirsiniz.</small>
    </div>

    <section class="regional-banner-zone quick-preview-banner-zone hidden" id="regionalBannerZone">
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
  `;

  document.getElementById('closePublicPreviewBtn')?.addEventListener('click',()=>{
    const url=new URL(window.location.href);
    url.searchParams.delete('onizleme');
    url.searchParams.delete('kurum');
    url.hash='';
    window.location.href=url.toString();
  });

  document.getElementById('quoteBtn')?.addEventListener('click', () => openModal('quoteModal'));
  document.getElementById('campaignQuoteBtn')?.addEventListener('click', () => {
    trackInstitutionEvent(inst, 'quote_click');
    openInstitutionDirectQuote(inst);
  });

  document.getElementById('routeBtn')?.addEventListener('click', () => {
    trackInstitutionEvent(inst, 'route_click');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${inst.lat},${inst.lng}`, '_blank');
  });

  document.getElementById('whatsappBtn')?.addEventListener('click', () => {
    trackInstitutionEvent(inst, 'quote_click');
    openInstitutionDirectQuote(inst);
  });

  document.getElementById('profileOpenBtn')?.addEventListener('click', () => {
    window.location.href = 'kurum.html?id=' + encodeURIComponent(inst.id);
  });

  document.getElementById('websiteBtn')?.addEventListener('click', () => {
    const url = safePublicProfileUrl(inst.website);
    if (url) window.open(url, '_blank', 'noopener');
  });

  document.getElementById('instagramBtn')?.addEventListener('click', () => {
    const url = publicInstagramUrl(inst.instagram);
    if (url) window.open(url, '_blank', 'noopener');
  });

  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favs.includes(inst.id)) favs.push(inst.id);
    localStorage.setItem('favorites', JSON.stringify(favs));
    showToast('Kurum favorilere eklendi.');
  });

  document.getElementById('detailCompareBtn')?.addEventListener('click', () => {
    toggleCompareInstitution(inst.id);
  });

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

function normalizePublicBannerPlacement(value){
  const raw=String(value||'search');
  if(raw==='sponsor')return 'home_sponsor';
  const allowed=new Set([
    'search',
    'home_sponsor',
    'premium_home',
    'mobile_sponsor',
    'sidebar_sponsor',
    'detail_banner',
    'page_top_mini'
  ]);
  return allowed.has(raw)?raw:'search';
}

function bannerAdMatchesActiveSearchContext(ad){
  const activeMain=getSelectedMainCategory();
  const selectedSub=document.querySelector('.subCategoryFilter:checked')?.value || '';
  const activeCity=normalizeQuoteSearch(activeLocationCity || '');
  const activeDistrict=normalizeQuoteSearch(activeLocationDistrict || '');
  const adCity=normalizeQuoteSearch(ad.city || '');
  const adDistrict=normalizeQuoteSearch(ad.district || '');
  const adCategory=String(ad.category || '').trim();

  if(adCity && activeCity && adCity!==activeCity)return false;
  if(adDistrict && activeDistrict && adDistrict!==activeDistrict)return false;

  if(adCategory && (activeMain || selectedSub)){
    const matchesCategory=
      adCategory===String(activeMain || '') ||
      adCategory===String(selectedSub || '');
    if(!matchesCategory)return false;
  }

  return true;
}

function getBannerAdsForPlacement(placement, matchContext=true){
  const wanted=normalizePublicBannerPlacement(placement);
  return activeRegionalBannerAds()
    .filter(ad=>normalizePublicBannerPlacement(ad.placement)===wanted)
    .filter(ad=>!matchContext || bannerAdMatchesActiveSearchContext(ad));
}

function bannerPlacementHref(ad){
  return 'kurum.html?id='+encodeURIComponent(ad?.institutionId || '');
}

function bannerAdInstitution(ad){
  return institutions.find(inst=>String(inst.id)===String(ad?.institutionId||"")) || null;
}

function trackBannerAdImpression(ad){
  if(!ad?.id)return;
  const inst=bannerAdInstitution(ad);
  if(!inst || inst.source!=="firestore")return;

  const day=localDayKey(new Date());
  const key="dijiyer_banner_impression_"+day+"_"+String(ad.id);
  if(sessionStorage.getItem(key))return;

  sessionStorage.setItem(key,"1");
  trackInstitutionEvent(inst,"banner_ad_impression");
}

function trackBannerAdClick(ad){
  if(!ad?.id)return;
  const inst=bannerAdInstitution(ad);
  if(!inst || inst.source!=="firestore")return;
  trackInstitutionEvent(inst,"banner_ad_click");
}

document.addEventListener("click",event=>{
  const target=event.target.closest("[data-banner-ad-id]");
  if(!target)return;
  const ad=regionalBannerAds.find(item=>String(item.id)===String(target.dataset.bannerAdId));
  if(ad)trackBannerAdClick(ad);
});

function bannerPlacementMediaHtml(ad, fallbackClass){
  const image=safePublicProfileUrl(ad?.imageUrl || ad?.logoUrl || '');
  const video=safePublicProfileUrl(ad?.videoUrl || '');
  const isVideo=String(ad?.mediaType || '')==='video' && Boolean(video);

  if(isVideo){
    return '<video src="'+video+'" autoplay muted loop playsinline poster="'+image+'"></video>';
  }
  if(image){
    return '<img src="'+image+'" alt="'+escapeHtml(ad?.institutionName || 'Sponsorlu kurum')+'">';
  }
  return '<div class="'+fallbackClass+'">📣</div>';
}

function renderPageTopMiniBanner(reset=false){
  const root=document.getElementById('pageTopMiniBanner');
  if(!root)return;

  if(pageTopMiniBannerTimer){
    clearTimeout(pageTopMiniBannerTimer);
    pageTopMiniBannerTimer=null;
  }

  const ads=getBannerAdsForPlacement('page_top_mini');
  if(!ads.length){
    root.innerHTML='';
    root.classList.add('hidden');
    return;
  }

  if(reset || pageTopMiniBannerIndex>=ads.length)pageTopMiniBannerIndex=0;
  const ad=ads[pageTopMiniBannerIndex] || ads[0];
  const duration=[3,5,7].includes(Number(ad?.durationSeconds))
    ? Number(ad.durationSeconds)
    : 7;

  const logo=safePublicProfileUrl(ad.logoUrl || '');
  const campaignImage=safePublicProfileUrl(ad.imageUrl || '');
  const video=safePublicProfileUrl(ad.videoUrl || '');
  const isVideo=String(ad.mediaType || '')==='video' && Boolean(video);

  root.innerHTML=
    '<a class="page-top-mini-banner-card" data-banner-ad-id="'+escapeHtml(String(ad.id||''))+'" href="'+bannerPlacementHref(ad)+'">'+
      '<div class="page-top-mini-logo">'+
        (logo
          ? '<img src="'+logo+'" alt="'+escapeHtml(ad.institutionName || 'Kurum')+' logosu">'
          : '<span>🏢</span>')+
      '</div>'+
      '<div class="page-top-mini-campaign">'+
        (isVideo
          ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+campaignImage+'"></video>'
          : (campaignImage
              ? '<img src="'+campaignImage+'" alt="'+escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu kampanya')+'">'
              : '<div class="page-top-mini-campaign-fallback"><strong>'+escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')+'</strong><span>'+escapeHtml(ad.text || '')+'</span></div>'))+
      '</div>'+
      '<div class="page-top-mini-actions">'+
        '<span class="page-top-mini-sponsored">SPONSORLU</span>'+
        '<b class="page-top-mini-cta">İncele →</b>'+
      '</div>'+
      (ads.length>1
        ? '<div class="page-top-mini-dots">'+ads.map((_,i)=>'<i class="'+(i===pageTopMiniBannerIndex?'active':'')+'"></i>').join('')+'</div>'
        : '')+
      '<em class="page-top-mini-progress" style="--page-mini-duration:'+duration+'s"></em>'+
    '</a>';

  root.classList.remove('hidden');
  trackBannerAdImpression(ad);

  if(ads.length>1){
    pageTopMiniBannerTimer=setTimeout(()=>{
      pageTopMiniBannerIndex=(pageTopMiniBannerIndex+1)%ads.length;
      renderPageTopMiniBanner(false);
    },duration*1000);
  }
}

function regionalBannerRegionValue(ad){
  return [ad.city||"",ad.district||""].join("|");
}

function populateRegionalBannerFilters(){
  const region=document.getElementById("regionalBannerRegionFilter");
  const sector=document.getElementById("regionalBannerSectorFilter");
  if(!region||!sector)return;
  const ads=getBannerAdsForPlacement('detail_banner', false);
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
  let rows=getBannerAdsForPlacement('detail_banner', false);
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
  const video=safePublicProfileUrl(ad.videoUrl||"");
  const isVideo=ad.mediaType==="video"&&Boolean(video);
  const href="kurum.html?id="+encodeURIComponent(ad.institutionId||"");
  const regionText=[ad.city,ad.district].filter(Boolean).join(" / ");
  const sectorText=ad.categoryLabel||bannerCategoryLabel(ad.category);
  const savedDuration=Number(ad.durationSeconds);
  const duration=[3,5,7].includes(savedDuration)?savedDuration:7;

  stage.innerHTML=
    '<a class="regional-banner-card '+((image||isVideo)?"has-image":"")+'" data-banner-ad-id="'+escapeHtml(String(ad.id||""))+'" href="'+href+'">'+
      (isVideo
        ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+(image||"")+'"></video>'
        : (image?'<img src="'+image+'" alt="'+escapeHtml(ad.institutionName||"Sponsorlu kurum")+'">':""))+
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

  trackBannerAdImpression(ad);

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

    if(document.getElementById("detailPanel") && selectedId){
      renderDecisionAlternatives();
      renderDetail();
    }

    if(document.getElementById("institutionList")){
      renderList();
    }

    if(document.getElementById("homeSponsoredRail")){
      renderSponsoredAds();
    }

    if(document.getElementById("regionalBannerZone"))setupRegionalBannerZone();
    if(!window.DIJIYER_UNIFIED_PAGE_BANNER && document.getElementById("pageTopMiniBanner"))renderPageTopMiniBanner(true);
  },error=>{
    console.warn("Banner reklamları yüklenemedi:",error);
    regionalBannerAds=[];
    document.getElementById("regionalBannerZone")?.classList.add("hidden");
    if(!window.DIJIYER_UNIFIED_PAGE_BANNER)document.getElementById("pageTopMiniBanner")?.classList.add("hidden");
  });
}

let externalAds=[];
let externalAdIndex=0;
let externalAdTimer=null;
let externalAdUnsubscribe=null;
let externalAdRandomized=false;
let externalAdSwipeStartX=null;
let externalAdSwipeStartY=null;
let externalAdSuppressClickUntil=0;

function safeExternalAdUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{
    const url=new URL(raw,window.location.href);
    return ["http:","https:"].includes(url.protocol) ? url.href : "";
  }catch(_){
    return "";
  }
}

function currentExternalAdPlacement(){
  if(document.body.classList.contains("standalone-quote-page"))return "quote";
  if(document.body.classList.contains("standalone-jobs-page"))return "jobs";
  if(document.body.classList.contains("standalone-brands-page"))return "brands";
  return "home";
}

function externalAdPlacements(item){
  const valid=new Set(["home","quote","jobs","brands","opportunities"]);
  const raw=Array.isArray(item?.placements) ? item.placements : [];
  const values=[...new Set(raw.map(x=>String(x||"").trim()).filter(x=>valid.has(x)))];
  return values.length ? values : ["home"];
}

function externalAdMatchesCurrentPage(item){
  return externalAdPlacements(item).includes(currentExternalAdPlacement());
}

function externalAdIsLive(item){
  if(!item || item.active===false || item.rightsConfirmed===false)return false;
  if(!externalAdMatchesCurrentPage(item))return false;

  const now=Date.now();
  const start=item.startAt ? new Date(item.startAt).getTime() : 0;
  const end=item.endAt ? new Date(item.endAt).getTime() : 0;

  if(Number.isFinite(start) && start>now)return false;
  if(Number.isFinite(end) && end>0 && end<now)return false;

  const target=safeExternalAdUrl(item.targetUrl);
  const image=safeExternalAdUrl(item.imageUrl);
  const video=safeExternalAdUrl(item.videoUrl);
  if(!target)return false;

  const type=String(item.mediaType||"").toLowerCase();
  if(type==="video")return Boolean(video || image);
  return Boolean(image || video);
}

function externalAdCardHtml(item){
  const target=safeExternalAdUrl(item.targetUrl);
  const image=safeExternalAdUrl(item.imageUrl);
  const video=safeExternalAdUrl(item.videoUrl);
  const isVideo=String(item.mediaType||"").toLowerCase()==="video" && Boolean(video);
  const displayImage=image || (!isVideo ? video : "");
  const brand=String(item.brandName||"Reklam");
  const headline=String(item.headline||"").trim();
  return `
    <a class="external-ad-card" href="${escapeHtml(target)}" target="_blank" rel="sponsored nofollow noopener noreferrer">
      <div class="external-ad-public-media">
        ${isVideo
          ? '<video src="'+escapeHtml(video)+'" autoplay muted loop playsinline poster="'+escapeHtml(image)+'"></video>'
          : '<img src="'+escapeHtml(image || video)+'" alt="'+escapeHtml(brand)+' reklamı">'}
        <span class="external-ad-media-label">REKLAM</span>
      </div>
      <div class="external-ad-public-info">
        <div class="external-ad-public-copy">
          <span>İŞ ORTAKLIĞI · SPONSORLU BAĞLANTI</span>
          <strong>${escapeHtml(brand)}</strong>
          ${headline?'<small>'+escapeHtml(headline)+'</small>':""}
        </div>
        <b>Markayı İncele <i>→</i></b>
      </div>
    </a>
  `;
}

function moveExternalAd(direction){
  const live=externalAds.filter(externalAdIsLive);
  if(live.length<2)return;

  externalAdIndex=(externalAdIndex+direction+live.length)%live.length;
  externalAdRandomized=true;
  renderExternalAds();
}

function bindExternalAdManualNavigation(liveLength){
  const stage=document.getElementById("externalAdStage");
  if(!stage || liveLength<2)return;

  stage.querySelector('[data-external-ad-prev]')?.addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    moveExternalAd(-1);
  });

  stage.querySelector('[data-external-ad-next]')?.addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    moveExternalAd(1);
  });

  stage.onpointerdown=event=>{
    if(event.pointerType==="mouse" && event.button!==0)return;
    externalAdSwipeStartX=event.clientX;
    externalAdSwipeStartY=event.clientY;
  };

  stage.onpointerup=event=>{
    if(externalAdSwipeStartX===null || externalAdSwipeStartY===null)return;

    const dx=event.clientX-externalAdSwipeStartX;
    const dy=event.clientY-externalAdSwipeStartY;
    externalAdSwipeStartX=null;
    externalAdSwipeStartY=null;

    if(Math.abs(dx)<45 || Math.abs(dx)<=Math.abs(dy))return;

    externalAdSuppressClickUntil=Date.now()+400;
    moveExternalAd(dx<0 ? 1 : -1);
  };

  stage.onpointercancel=()=>{
    externalAdSwipeStartX=null;
    externalAdSwipeStartY=null;
  };

  stage.onclick=event=>{
    if(Date.now()<externalAdSuppressClickUntil){
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

function renderExternalAds(){
  const zone=document.getElementById("externalAdZone");
  const stage=document.getElementById("externalAdStage");
  const dots=document.getElementById("externalAdDots");
  if(!zone||!stage)return;

  if(externalAdTimer){clearTimeout(externalAdTimer);externalAdTimer=null;}

  const live=externalAds.filter(externalAdIsLive);
  if(!live.length){
    zone.classList.add("hidden");
    stage.innerHTML="";
    if(dots)dots.innerHTML="";
    return;
  }

  zone.classList.remove("hidden");
  if(!externalAdRandomized){
    externalAdIndex=Math.floor(Math.random()*live.length);
    externalAdRandomized=true;
  }
  if(externalAdIndex>=live.length)externalAdIndex=0;

  const active=live[externalAdIndex];
  stage.innerHTML=
    externalAdCardHtml(active)+
    (live.length>1
      ? '<button type="button" class="external-ad-nav prev" data-external-ad-prev aria-label="Önceki reklam">‹</button>'+
        '<button type="button" class="external-ad-nav next" data-external-ad-next aria-label="Sonraki reklam">›</button>'
      : '');

  bindExternalAdManualNavigation(live.length);

  if(dots){
    dots.innerHTML=live.length>1
      ? live.map((_,i)=>'<button type="button" class="'+(i===externalAdIndex?'active':'')+'" data-external-ad-dot="'+i+'" aria-label="'+(i+1)+'. reklam"></button>').join("")
      : "";
    dots.querySelectorAll("[data-external-ad-dot]").forEach(button=>{
      button.addEventListener("click",()=>{
        externalAdIndex=Number(button.dataset.externalAdDot||0);
        externalAdRandomized=true;
        renderExternalAds();
      });
    });
  }

  if(live.length>1){
    const seconds=Math.max(5,Math.min(60,Number(active.rotationSeconds||5)));
    externalAdTimer=setTimeout(()=>{
      externalAdIndex=(externalAdIndex+1)%live.length;
      renderExternalAds();
    },seconds*1000);
  }
}

function startExternalAds(){
  if(externalAdUnsubscribe)externalAdUnsubscribe();

  externalAdUnsubscribe=db.collection("externalAds").onSnapshot(snapshot=>{
    externalAds=snapshot.docs
      .map(doc=>({id:doc.id,...doc.data()}))
      .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

    externalAdRandomized=false;
    renderExternalAds();
  },error=>{
    console.warn("Harici reklamlar yüklenemedi:",error);
    externalAds=[];
    document.getElementById("externalAdZone")?.classList.add("hidden");
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
      .where('status', '==', 'published')
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

  if (window.innerWidth <= 820) {
    requestAnimationFrame(() => {
      document.getElementById('detailPanel')
        ?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
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
      requestType: request.requestType || '',
      targetInstitutionId: request.targetInstitutionId || '',
      targetInstitutionName: request.targetInstitutionName || '',
      responseWaitMinutes: Number(request.responseWaitMinutes || 0),
      responseDeadlineAt: request.responseDeadlineAt || '',
      allowAlternativeInstitutions: request.allowAlternativeInstitutions === true,
      status: 'active',
      createdAt: new Date().toISOString()
    });

  return {
    trackingCode,
    trackingUrl,
    normalizedPhone
  };
}

function showQuoteTrackingSuccess(tracking, matchedCount, quoteId, requestData = {}) {
  sessionStorage.setItem('dijiyerTrackingCode', tracking.trackingCode);
  sessionStorage.setItem('dijiyerTrackingPhone', tracking.normalizedPhone);
  localStorage.setItem('dijiyerLastTrackingCode', tracking.trackingCode);

  document.getElementById('quoteSuccessCode').textContent = tracking.trackingCode;
  document.getElementById('quoteSuccessLink').value = tracking.trackingUrl;

  const requestIdText = String(quoteId || '').trim();
  const shortRequestId = requestIdText
    ? 'DJY-' + requestIdText.slice(-8).toUpperCase()
    : tracking.trackingCode;

  const serviceText =
    String(requestData.service || '').trim() ||
    categoryTaxonomy[requestData.mainCategory]?.subs?.[requestData.subCategory] ||
    'Teklif Talebi';

  const locationText = [requestData.district, requestData.city]
    .filter(Boolean)
    .join(' / ') || 'Konum belirtilmedi';

  const requestIdEl = document.getElementById('quoteSuccessRequestId');
  const serviceEl = document.getElementById('quoteSuccessService');
  const locationEl = document.getElementById('quoteSuccessLocation');

  if (requestIdEl) requestIdEl.textContent = shortRequestId;
  if (serviceEl) serviceEl.textContent = serviceText;
  if (locationEl) locationEl.textContent = locationText;

  const emailStatusEl = document.getElementById('quoteSuccessEmailStatus');
  if (emailStatusEl) {
    const email = String(requestData.email || '').trim();
    emailStatusEl.textContent = email
      ? '✉ ' + email + ' adresi takip bildirimi için kaydedildi.'
      : '✉ Takip linkini kopyalayarak güvenli bir yerde saklayabilirsiniz.';
  }

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


function dijiyerTurkeyDayRange(){
  const now=new Date();
  const tr=new Date(now.getTime()+3*60*60*1000);
  const year=tr.getUTCFullYear();
  const month=tr.getUTCMonth();
  const day=tr.getUTCDate();
  const startMs=Date.UTC(year,month,day)-3*60*60*1000;
  return {
    start:new Date(startMs).toISOString(),
    end:new Date(startMs+24*60*60*1000).toISOString()
  };
}

async function createPublicStatEvent(collectionName,eventId,data){
  try{
    const ref=db.collection(collectionName).doc(String(eventId));
    const existing=await ref.get();
    if(existing.exists)return;
    await ref.set(data);
  }catch(error){
    console.warn("Günlük istatistik olayı kaydedilemedi:",collectionName,error);
  }
}

async function recordPublicQuoteRequestEvent(quoteId,requestData){
  if(!quoteId||!requestData)return;
  return createPublicStatEvent("publicQuoteRequestEvents",quoteId,{
    quoteId:String(quoteId),
    mainCategory:String(requestData.mainCategory||""),
    subCategory:String(requestData.subCategory||""),
    service:String(requestData.service||""),
    date:String(requestData.date||"")
  });
}

async function loadTodayPublicStats(){
  const root=document.getElementById("mobileDailyStats");
  if(!root)return;

  root.classList.add("stats-disabled");
  root.closest(".workspace")?.classList.add("daily-stats-off");

  try{
    const settingSnap=await db.collection("siteSettings").doc("home").get();
    const visible=settingSnap.exists && settingSnap.data()?.dailyStatsVisible === true;

    if(!visible){
      return;
    }

    root.classList.remove("stats-disabled");
    root.closest(".workspace")?.classList.remove("daily-stats-off");
  }catch(error){
    console.warn("Günlük istatistik görünürlük ayarı okunamadı:",error);
    return;
  }

  const requestEl=document.getElementById("dailyQuoteRequestCount");
  const offerEl=document.getElementById("dailyOfferCount");
  const acceptedEl=document.getElementById("dailyAcceptedCount");
  const topEl=document.getElementById("dailyTopService");
  const topCountEl=document.getElementById("dailyTopServiceCount");
  const noteEl=document.getElementById("mobileDailyStatsNote");

  try{
    const {start,end}=dijiyerTurkeyDayRange();

    const [requestsSnap,offersSnap,acceptedSnap]=await Promise.all([
      db.collection("publicQuoteRequestEvents")
        .where("date",">=",start)
        .where("date","<",end)
        .get(),
      db.collection("publicOfferEvents")
        .where("date",">=",start)
        .where("date","<",end)
        .get(),
      db.collection("publicAcceptedEvents")
        .where("date",">=",start)
        .where("date","<",end)
        .get()
    ]);

    if(requestEl)requestEl.textContent=String(requestsSnap.size);
    if(offerEl)offerEl.textContent=String(offersSnap.size);
    if(acceptedEl)acceptedEl.textContent=String(acceptedSnap.size);

    const serviceCounts=new Map();
    requestsSnap.docs.forEach(doc=>{
      const row=doc.data()||{};
      const service=String(row.service||"").trim() || "Diğer";
      serviceCounts.set(service,(serviceCounts.get(service)||0)+1);
    });

    const top=[...serviceCounts.entries()]
      .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],"tr"))[0];

    if(top){
      if(topEl)topEl.textContent=top[0];
      if(topCountEl)topCountEl.textContent=top[1]+" talep";
    }else{
      if(topEl)topEl.textContent="Henüz yok";
      if(topCountEl)topCountEl.textContent="";
    }

    if(noteEl){
      noteEl.textContent="Bugün oluşturulan talep, verilen teklif ve kabul edilen tekliflerden otomatik hesaplanır.";
    }
  }catch(error){
    console.warn("Günlük Dijiyer istatistikleri yüklenemedi:",error);
    if(noteEl)noteEl.textContent="Günlük istatistikler hazırlanıyor.";
  }
}

const rememberedQuoteEmail = localStorage.getItem('dijiyerCustomerEmail') || '';
const quoteEmailInput = document.getElementById('quoteEmail');
if (quoteEmailInput && !quoteEmailInput.value && rememberedQuoteEmail) {
  quoteEmailInput.value = rememberedQuoteEmail;
}

document.getElementById('quoteForm').addEventListener('submit', async e => {
  e.preventDefault();

  const searchText = document.getElementById('quoteSearch').value.trim();
  const selectedCategory = document.getElementById('quoteCategory').value;
  const selectedSubCategory = document.getElementById('quoteService').value;
  const normalizedPhone = normalizeQuoteTrackingPhone(
    document.getElementById('quotePhone').value
  );
  const quoteEmail = String(document.getElementById('quoteEmail')?.value || '').trim().toLowerCase();

  if (!searchText && !(selectedCategory && selectedSubCategory)) {
    showToast('Ne aradığınızı yazın veya ana kategori ve alt kategori seçin.');
    return;
  }

  if (normalizedPhone.length < 10) {
    showToast('Tekliflerinizi takip edebilmek için geçerli bir telefon numarası girin.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteEmail)) {
    showToast('Takip linkini gönderebilmemiz için geçerli bir e-posta adresi girin.');
    document.getElementById('quoteEmail')?.focus();
    return;
  }

  localStorage.setItem('dijiyerCustomerEmail', quoteEmail);

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
    email: quoteEmail,
    note: document.getElementById('quoteNote').value.trim(),
    status: 'new',
    requestType: 'bulk',
    date: new Date().toISOString()
  };

  try {
    const quoteRef = await db.collection('quoteRequests').add(request);
    await recordPublicQuoteRequestEvent(quoteRef.id, request);
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
      showQuoteTrackingSuccess(tracking, matchedCount, quoteRef.id, request);
    } else {
      showToast(
        'Talebiniz alındı. Takip linki henüz oluşturulamadı; Firestore takip kurallarını yayınlayın.'
      );
    }
  } catch (error) {
    console.error('Teklif talebi kaydedilemedi:', error);
    const errorCode = String(error?.code || 'unknown');
    showToast(
      errorCode.includes('permission-denied')
        ? 'Teklif gönderilemedi (permission-denied) · Proje: ' + (firebase.app().options.projectId || '-') + ' · ' + (error?.message || '')
        : 'Teklif gönderilemedi (' + errorCode + '). Lütfen tekrar deneyin.'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});

let currentReviewRecommendation=null;

function moderateReviewText(raw){
  const original=String(raw||"").trim();
  if(!original)return {ok:false,message:"Lütfen yorumunuzu yazın."};

  const leetMap={"0":"o","1":"i","3":"e","4":"a","5":"s","7":"t"};
  const lowered=original
    .toLocaleLowerCase("tr-TR")
    .replace(/[013457]/g,ch=>leetMap[ch]||ch)
    .replace(/(.)\1{2,}/gu,"$1$1");

  const normalized=lowered
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ")
    .trim();

  // Nokta, tire, ünlem gibi karakterlerle kelimeyi bölme denemelerini de yakalar.
  const punctuationJoined=lowered
    .replace(/[^\p{L}\p{N}\s]/gu,"")
    .replace(/\s+/g," ")
    .trim();

  const tokens=normalized.split(" ").filter(Boolean);
  const joinedTokens=punctuationJoined.split(" ").filter(Boolean);
  const compact=normalized.replace(/\s+/g,"");

  const profanityTokens=new Set([
    "amk","siktir","sktir","sikeyim","sikerim","sikik","orospu","yarrak","yarak",
    "piç","pic","pezevenk","kahpe","şerefsiz","serefsiz","gerizekalı","gerizekali"
  ]);

  const profanityCompact=[
    "orospuçocuğu","orospucocugu","ananısikeyim","ananisikeyim",
    "annenisikeyim","şerefsiz","serefsiz"
  ];

  const threatTokens=new Set([
    "öldüreceğim","oldurecegim","öldürecem","oldurecem","gebertirim",
    "vuracağım","vuracagim","vurucam","bıçaklayacağım","bicaklayacagim",
    "yakacağım","yakacagim","tecavüz","tecavuz"
  ]);

  const threatCompact=[
    "kendiniöldür","kendinioldur","intiharet",
    "bombakoy","bombayerleştir","bombayerlestir","bombapatlat",
    "patlayıcıkoy","patlayicikoy","tecavüz","tecavuz"
  ];

  const allTokens=[...tokens,...joinedTokens];

  if(
    allTokens.some(token=>profanityTokens.has(token))
    || profanityCompact.some(term=>compact.includes(term))
  ){
    return {ok:false,message:"Yorum gönderilemedi: küfür veya hakaret içeren ifadeler kullanılamaz."};
  }

  if(
    allTokens.some(token=>threatTokens.has(token))
    || threatCompact.some(term=>compact.includes(term))
  ){
    return {ok:false,message:"Yorum gönderilemedi: tehdit, şiddet veya tehlikeli içerik kullanılamaz."};
  }

  const threatSubject=tokens.some(token=>["seni","sizi","onu","onları","onlari"].includes(token));
  const threatVerb=allTokens.some(token=>[
    "öldür","oldur","öldüreceğim","oldurecegim","gebert","gebertirim",
    "vur","vuracağım","vuracagim","bıçakla","bicakla","yak","yakacağım","yakacagim"
  ].includes(token));

  if(threatSubject && threatVerb){
    return {ok:false,message:"Yorum gönderilemedi: tehdit, şiddet veya tehlikeli içerik kullanılamaz."};
  }

  return {ok:true};
}

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
  const tour360Only = document.getElementById('tour360Only');

  if (search) search.value = '';
  const mobileSearch = document.getElementById('mobileDiscoverySearchInput');
  if (mobileSearch) mobileSearch.value = '';
  document.getElementById('mobileDiscoverySearchClear')?.classList.add('hidden');
  if (videoOnly) videoOnly.checked = false;
  if (offerOnly) offerOnly.checked = false;
  if (tour360Only) tour360Only.checked = false;

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
    referralCode: getActiveDijiyerReferralSource()?.code || '',
    referralCapturedAt: getActiveDijiyerReferralSource()?.capturedAt || '',
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
  const errorCode = String(error?.code || 'unknown');
  showToast(
    errorCode.includes('permission-denied')
      ? 'Kurum kaydı gönderilemedi (permission-denied) · Proje: ' + (firebase.app().options.projectId || '-') + ' · ' + (error?.message || '')
      : 'Kurum kaydı gönderilemedi (' + errorCode + ').'
  );
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

function getQuoteFallbackSuggestions(mainCategory, keyword) {
  const rows = Object.entries(categoryTaxonomy[mainCategory]?.subs || {});
  if (!rows.length) return [];

  const q = normalizeQuoteSearch(keyword);
  const qTokens = q.split(/\s+/).filter(Boolean);

  return rows
    .map(([subCategory,label],index) => {
      const normalizedLabel = normalizeQuoteSearch(label);
      let score = 0;

      qTokens.forEach(token => {
        if (normalizedLabel.includes(token)) score += 5;
        else if (
          token.length >= 4 &&
          normalizedLabel.split(/\s+/).some(word =>
            word.startsWith(token.slice(0, Math.min(4, token.length)))
          )
        ) score += 2;
      });

      if (normalizedLabel.includes(q)) score += 8;
      return {mainCategory,subCategory,label,score,index};
    })
    .sort((a,b) => b.score - a.score || a.index - b.index)
    .slice(0,3);
}

async function logUnmatchedQuoteSearch(payload) {
  const query = String(payload?.query || '').trim();
  if (query.length < 2 || typeof db === 'undefined') return;

  const mainCategory = String(payload?.mainCategory || '');
  const reason = String(payload?.reason || 'category_not_found');
  const dedupeKey = normalizeQuoteSearch(query) + '|' + mainCategory + '|' + reason;

  try {
    const cacheKey = 'dijiyerUnmatchedSearches';
    const cache = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
    if (cache[dedupeKey]) return;
    cache[dedupeKey] = Date.now();
    sessionStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (_) {}

  try {
    await db.collection('unmatchedSearches').add({
      query,
      normalizedQuery: normalizeQuoteSearch(query),
      mainCategory,
      mainCategoryLabel: categoryTaxonomy[mainCategory]?.label || '',
      city: typeof activeLocationCity !== 'undefined' ? String(activeLocationCity || '') : '',
      district: typeof activeLocationDistrict !== 'undefined' ? String(activeLocationDistrict || '') : '',
      resultCount: Number(payload?.resultCount || 0),
      reason,
      suggestionLabels: Array.isArray(payload?.suggestions)
        ? payload.suggestions.map(item => item.label).slice(0,3)
        : [],
      status: 'new',
      source: 'teklif-al',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Bulunamayan arama kaydı Firestore’a yazılamadı:', error);
  }
}

function updateQuoteSearchFallback(options = {}) {
  const root = document.getElementById('quoteSearchFallback');
  const queryEl = document.getElementById('quoteSearchFallbackQuery');
  const suggestionsRoot = document.getElementById('quoteSearchFallbackSuggestions');
  const resultPanel = document.getElementById('mobileCategoryResult');
  const instantResults = document.getElementById('mobileInstantResults');

  if (!root) return;

  const query = String(options.keyword || '').trim();
  const count = Number(options.count || 0);
  const activeMain = String(options.activeMain || '');
  const shouldShow = query.length >= 2 && count < 1;

  if (!shouldShow) {
    root.classList.add('hidden');
    return;
  }

  const inferredCategory = options.inferred || inferQuoteCategory(query);
  const suggestionMain = activeMain || inferredCategory?.mainCategory || '';
  const suggestions = getQuoteFallbackSuggestions(suggestionMain, query);

  if (queryEl) queryEl.textContent = '“' + query + '”';

  if (suggestionsRoot) {
    suggestionsRoot.innerHTML = suggestions.map(item =>
      '<button type="button" data-quote-fallback-main="' +
      escapeHtml(item.mainCategory) +
      '" data-quote-fallback-sub="' +
      escapeHtml(item.subCategory) +
      '">' +
      escapeHtml(item.label) +
      '</button>'
    ).join('');
    suggestionsRoot.classList.toggle('hidden', !suggestions.length);
  }

  if (instantResults && !instantResults.classList.contains('hidden')) {
    instantResults.insertAdjacentElement('afterend', root);
  } else if (resultPanel) {
    resultPanel.insertAdjacentElement('afterend', root);
  }

  root.classList.remove('hidden');
  root.dataset.query = query;
  root.dataset.mainCategory = suggestionMain;

  logUnmatchedQuoteSearch({
    query,
    mainCategory:suggestionMain,
    resultCount:count,
    suggestions,
    reason: inferredCategory ? 'no_institution_result' : 'category_not_found'
  });
}

document.addEventListener('click', event => {
  const missingSubcategory = event.target.closest('[data-mobile-subcategory-missing]');

  if (missingSubcategory) {
    event.preventDefault();

    const mainCategory = String(missingSubcategory.dataset.mobileSubcategoryMissing || '').trim() || 'diger';
    const categorySelect = document.getElementById('quoteCategory');
    const subSelect = document.getElementById('quoteService');
    const searchInput = document.getElementById('quoteSearch');

    if (categorySelect) {
      categorySelect.value = categoryTaxonomy[mainCategory] ? mainCategory : 'diger';
      fillQuoteServices(categorySelect.value);
    }

    if (subSelect) {
      if (![...subSelect.options].some(option => option.value === 'diger')) {
        const option = document.createElement('option');
        option.value = 'diger';
        option.textContent = 'Özel Talep / Diğer';
        subSelect.appendChild(option);
      }
      subSelect.value = 'diger';
    }

    if (searchInput) searchInput.value = '';

    if (typeof openModal === 'function') {
      openModal('quoteModal');
    } else {
      document.getElementById('quoteModal')?.classList.remove('hidden');
    }

    showToast('Aradığınız hizmeti yazın; özel talep olarak uygun işletmelere iletelim.');
    setTimeout(() => searchInput?.focus(), 120);
    return;
  }

  const suggestion = event.target.closest('[data-quote-fallback-sub]');

  if (suggestion) {
    event.preventDefault();

    const mainCategory = suggestion.dataset.quoteFallbackMain || '';
    const subCategory = suggestion.dataset.quoteFallbackSub || '';

    if (typeof clearAllCategorySelections === 'function') {
      clearAllCategorySelections();
    } else {
      document.querySelectorAll('.categoryFilter,.subCategoryFilter').forEach(input => {
        input.checked = false;
      });
    }

    const mainInput = [...document.querySelectorAll('.categoryFilter')]
      .find(input => input.value === mainCategory);
    const subInput = [...document.querySelectorAll('.subCategoryFilter')]
      .find(input =>
        input.dataset.mainCategory === mainCategory &&
        input.value === subCategory
      );

    if (mainInput) mainInput.checked = true;
    if (subInput) subInput.checked = true;

    if (typeof renderMobileCategories === 'function') renderMobileCategories();
    if (typeof renderMobileSubcategories === 'function') renderMobileSubcategories(mainCategory);
    if (typeof renderList === 'function') renderList();
    if (typeof updateMobileCategoryResult === 'function') updateMobileCategoryResult();

    setTimeout(() => {
      if (typeof showMobileInstitutionResults === 'function') {
        showMobileInstitutionResults(true);
      }
    }, 80);

    return;
  }

  if (event.target.closest('#quoteSearchFallbackAllBtn')) {
    event.preventDefault();

    if (typeof clearAllCategorySelections === 'function') {
      clearAllCategorySelections();
    } else {
      document.querySelectorAll('.categoryFilter,.subCategoryFilter').forEach(input => {
        input.checked = false;
      });
    }

    if (typeof renderMobileCategories === 'function') renderMobileCategories();
    if (typeof renderList === 'function') renderList();
    if (typeof updateMobileCategoryResult === 'function') updateMobileCategoryResult();

    setTimeout(() => {
      if (typeof showMobileInstitutionResults === 'function') {
        showMobileInstitutionResults(true);
      }
    }, 80);

    return;
  }

  if (event.target.closest('#quoteSearchFallbackQuoteBtn')) {
    event.preventDefault();

    const fallback = document.getElementById('quoteSearchFallback');
    const query = String(fallback?.dataset.query || '').trim();
    const mainCategory = String(fallback?.dataset.mainCategory || '').trim() || 'diger';
    const searchInput = document.getElementById('quoteSearch');
    const categorySelect = document.getElementById('quoteCategory');
    const subSelect = document.getElementById('quoteService');

    if (searchInput) searchInput.value = query;

    if (categorySelect) {
      categorySelect.value = categoryTaxonomy[mainCategory] ? mainCategory : 'diger';
      fillQuoteServices(categorySelect.value);
    }

    if (subSelect) {
      if (![...subSelect.options].some(option => option.value === 'diger')) {
        const option = document.createElement('option');
        option.value = 'diger';
        option.textContent = 'Özel Talep / Diğer';
        subSelect.appendChild(option);
      }
      subSelect.value = 'diger';
    }

    if (typeof openModal === 'function') {
      openModal('quoteModal');
    } else {
      document.getElementById('quoteModal')?.classList.remove('hidden');
    }

    setTimeout(() => document.getElementById('quoteSearch')?.focus(), 120);
  }
});

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

document.getElementById('mobileSearchLocationBtn')?.addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  setLocationPopover(true);
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
  const mobileSearchLocationText = document.getElementById('mobileSearchLocationText');
  const mobileSearchLocationHint = document.getElementById('mobileSearchLocationHint');
  const mobileSearchLocationBtn = document.getElementById('mobileSearchLocationBtn');

  if (!activeLocationCity) {
    locationBtnText.textContent = 'Tüm Türkiye';
    if (exploreLocationText) exploreLocationText.textContent = 'Tüm Türkiye';
    if (mobileSearchLocationText) mobileSearchLocationText.textContent = 'Tüm Türkiye';
    if (mobileSearchLocationHint) {
      mobileSearchLocationHint.textContent = 'İstersen şehir ve ilçe seçerek sonuçları daralt';
    }
    mobileSearchLocationBtn?.classList.add('all-turkey');
    syncExploreQuickFilterState();
    if(window.__brandDirectoryReady && typeof renderBrandDirectory==='function')renderBrandDirectory();
    return;
  }

  const label = activeLocationDistrict
    ? activeLocationCity + ' / ' + activeLocationDistrict
    : activeLocationCity;

  locationBtnText.textContent = activeLocationDistrict
    ? activeLocationCity + ', ' + activeLocationDistrict
    : activeLocationCity;

  if (exploreLocationText) exploreLocationText.textContent = locationBtnText.textContent;
  if (mobileSearchLocationText) mobileSearchLocationText.textContent = label;
  if (mobileSearchLocationHint) {
    mobileSearchLocationHint.textContent = activeLocationDistrict
      ? 'Kurumlar bu ilçe içinde aranıyor'
      : 'Kurumlar bu şehir genelinde aranıyor';
  }
  mobileSearchLocationBtn?.classList.remove('all-turkey');
  syncExploreQuickFilterState();
  if(window.__brandDirectoryReady && typeof renderBrandDirectory==='function')renderBrandDirectory();
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
  renderMobileCategories();
  renderList();
  updateMobileCategoryResult();
  renderMobileJobs();

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
  renderMobileCategories();
  renderList();
  updateMobileCategoryResult();
  renderMobileJobs();
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

async function loadInstitutionReviewStats(){
  try{
    const snap=await db.collection('institutionReviews')
      .where('status','==','published')
      .get();
    const stats=new Map();

    snap.forEach(doc=>{
      const row=doc.data()||{};
      if(row.status && row.status!=='published')return;

      const institutionId=String(row.institutionId||'').trim();
      if(!institutionId)return;

      const current=stats.get(institutionId)||{
        ratingTotal:0,
        ratingCount:0,
        recommendYes:0,
        recommendCount:0
      };

      const rating=Number(row.rating||0);
      if(rating>=1 && rating<=5){
        current.ratingTotal+=rating;
        current.ratingCount+=1;
      }

      if(typeof row.recommend==='boolean'){
        current.recommendCount+=1;
        if(row.recommend)current.recommendYes+=1;
      }

      stats.set(institutionId,current);
    });

    institutions.forEach(inst=>{
      const stat=stats.get(String(inst.id));
      if(!stat)return;

      if(stat.ratingCount>0){
        inst.rating=Number((stat.ratingTotal/stat.ratingCount).toFixed(1));
        inst.reviewCount=stat.ratingCount;
      }

      inst.recommendationYes=stat.recommendYes;
      inst.recommendationCount=stat.recommendCount;
      inst.recommendationRate=stat.recommendCount>0
        ? Math.round((stat.recommendYes/stat.recommendCount)*100)
        : null;
    });
  }catch(error){
    console.warn('Kurum yorum / tavsiye puanları yüklenemedi:',error);
  }
}

async function loadApprovedInstitutions() {
  try {
    const snapshot = await db.collection('institutions').get();

    snapshot.forEach(doc => {
      const data = doc.data();

      if (String(data.status || "active") === "passive") return;

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
        recommendationRate: Number.isFinite(Number(data.recommendationRate)) ? Number(data.recommendationRate) : null,
        recommendationYes: Number(data.recommendationYes || 0),
        recommendationCount: Number(data.recommendationCount || 0),
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
        has360Tour: Boolean(data.has360Tour || data.tour360Url || data.virtualTourUrl || data.tour360),
        tour360Url: safePublicProfileUrl(
          data.tour360Url || data.virtualTourUrl || data.tour360 || ''
        ),
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
        updatedAt: data.updatedAt || data.createdAt || '',
        lat: Number.isFinite(data.lat) ? data.lat : null,
        lng: Number.isFinite(data.lng) ? data.lng : null,
        emoji: data.emoji || '🏢'
      });
    });

    await loadInstitutionReviewStats();

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
      class="premium-showcase-card premium-showcase-clean"
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

      <div class="premium-showcase-content">
        ${logo
          ? '<span class="premium-showcase-logo"><img src="' + logo + '" alt=""></span>'
          : ''}

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
      <button type="button" data-advertise-home data-ad-service="homepage" data-ad-order="1">Premium Reklam Ver</button>
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

  if (premiumShowcaseTimer) {
    clearTimeout(premiumShowcaseTimer);
    premiumShowcaseTimer = null;
  }

  const bannerAds=getBannerAdsForPlacement('premium_home');

  if (bannerAds.length) {
    paintPremiumPlacementBanners(bannerAds);

    if (bannerAds.length > 1) {
      const active=bannerAds[premiumShowcaseIndex] || bannerAds[0];
      const duration=[3,5,7].includes(Number(active?.durationSeconds))
        ? Number(active.durationSeconds)*1000
        : PREMIUM_SHOWCASE_DURATION;

      premiumShowcaseTimer=setTimeout(()=>{
        premiumShowcaseIndex=(premiumShowcaseIndex+1)%bannerAds.length;
        renderPremiumShowcase(false);
      },duration);
    }

    return;
  }

  const ads = getPremiumShowcaseInstitutions();
  paintPremiumShowcase(ads);

  if (ads.length > 1) {
    premiumShowcaseTimer = setTimeout(() => {
      premiumShowcaseIndex = (premiumShowcaseIndex + 1) % ads.length;
      renderPremiumShowcase(false);
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

function homepageSponsoredMobileHtml(inst) {
  const cover = safePublicProfileUrl(inst.coverUrl || '');
  const logo = safePublicProfileUrl(inst.logoUrl || '');
  const location = inst.location || [inst.city, inst.district].filter(Boolean).join(', ') || 'Konum bilgisi';

  return `
    <article
      class="mobile-sponsored-card"
      data-sponsored-id="${escapeHtml(String(inst.id))}"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(inst.name || 'Sponsorlu kurum')} profilini aç"
    >
      <div class="mobile-sponsored-media">
        ${cover
          ? '<img src="' + cover + '" alt="' + escapeHtml(inst.name || 'Sponsorlu kurum') + '">'
          : '<div class="mobile-sponsored-media-fallback">' + escapeHtml(inst.emoji || '🏢') + '</div>'}
        <span class="mobile-sponsored-label">SPONSORLU</span>
      </div>

      <div class="mobile-sponsored-body">
        <div class="mobile-sponsored-title">
          <div class="mobile-sponsored-logo">
            ${logo
              ? '<img src="' + logo + '" alt="">'
              : escapeHtml(inst.emoji || '🏢')}
          </div>
          <div>
            <strong>${escapeHtml(inst.name || 'Kurum')}</strong>
            <small>📍 ${escapeHtml(location)}</small>
          </div>
        </div>

        <div class="mobile-sponsored-footer">
          <span>${escapeHtml(getHomepageAdPackageLabel(inst.adPackage))}</span>
          <b>Profili Gör →</b>
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
      <button type="button" data-advertise-home data-ad-service="regionalAd" data-ad-order="1">Reklam Ver</button>
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
  const service =
    String(sessionStorage.getItem('dijiyerInstitutionAdService') || '').trim();
  const orderNow =
    sessionStorage.getItem('dijiyerInstitutionAdOrder') === '1';

  const params = new URLSearchParams({ session: 'institution' });

  if (showcaseIntent) params.set('tab', 'showcase');
  if (showcaseIntent && service) params.set('service', service);
  if (showcaseIntent && service && orderNow) params.set('order', '1');

  return 'institution.html?' + params.toString();
}

async function openAdvertisingCenter(service = '', orderNow = false) {
  sessionStorage.setItem('dijiyerInstitutionIntent', 'showcase');

  if (service) {
    sessionStorage.setItem('dijiyerInstitutionAdService', String(service));
  } else {
    sessionStorage.removeItem('dijiyerInstitutionAdService');
  }

  if (orderNow) {
    sessionStorage.setItem('dijiyerInstitutionAdOrder', '1');
  } else {
    sessionStorage.removeItem('dijiyerInstitutionAdOrder');
  }

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
      'Reklam siparişi vermek için kurum hesabınızla giriş yapın.';
  }
}

function bindHomepageAdvertiseButtons() {
  document.querySelectorAll('[data-advertise-home]').forEach(button => {
    if (button.dataset.advertiseBound === '1') return;
    button.dataset.advertiseBound = '1';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      openAdvertisingCenter(
        button.dataset.adService || '',
        button.dataset.adOrder === '1'
      );
    });
  });
}

function getHomepageSponsorBannerAds(){
  return getBannerAdsForPlacement('home_sponsor');
}

function homepageSponsorBannerHtml(ad){
  const image=safePublicProfileUrl(ad.imageUrl || ad.logoUrl || '');
  const video=safePublicProfileUrl(ad.videoUrl || '');
  const isVideo=String(ad.mediaType || '')==='video' && Boolean(video);
  const href='kurum.html?id='+encodeURIComponent(ad.institutionId || '');
  const region=[ad.city,ad.district].filter(Boolean).join(' / ');
  const sector=ad.categoryLabel || bannerCategoryLabel(ad.category);

  trackBannerAdImpression(ad);

  return `
    <article class="sponsored-card sponsor-banner-card">
      <a href="${href}" class="sponsor-banner-link" data-banner-ad-id="${escapeHtml(String(ad.id||""))}">
        <div class="sponsored-media">
          ${isVideo
            ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+image+'"></video>'
            : (image
                ? '<img src="'+image+'" alt="'+escapeHtml(ad.institutionName || 'Sponsorlu kurum')+'">'
                : '<div class="sponsored-media-fallback">📣</div>')}
          <span class="sponsored-label">SPONSORLU</span>
          <span class="sponsored-package">${isVideo ? 'Video Reklam' : 'Sponsor Bannerı'}</span>
        </div>
        <div class="sponsored-body">
          <div class="sponsored-title-copy">
            <strong>${escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')}</strong>
            <small>${escapeHtml([region,sector].filter(Boolean).join(' · '))}</small>
          </div>
          <p class="sponsored-description">${escapeHtml(ad.text || '')}</p>
          <div class="sponsored-meta">
            <span>Reklam</span>
            <span class="sponsored-profile-link">İncele →</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function sidebarPlacementBannerHtml(ad){
  trackBannerAdImpression(ad);
  return `
    <a class="sidebar-sponsored-card banner-placement-card" data-banner-ad-id="${escapeHtml(String(ad.id||""))}" href="${bannerPlacementHref(ad)}">
      <div class="sidebar-sponsored-cover">
        ${bannerPlacementMediaHtml(ad,'sponsored-media-fallback')}
        <span class="sponsored-label">SPONSORLU</span>
      </div>
      <div class="sidebar-sponsored-copy">
        <strong>${escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')}</strong>
        <small>${escapeHtml([ad.city,ad.district].filter(Boolean).join(' / ') || ad.categoryLabel || 'Reklam')}</small>
        <button type="button" tabindex="-1">İncele</button>
      </div>
    </a>
  `;
}

function mobilePlacementBannerHtml(ad){
  trackBannerAdImpression(ad);
  return `
    <a class="mobile-sponsored-card banner-placement-card" data-banner-ad-id="${escapeHtml(String(ad.id||""))}" href="${bannerPlacementHref(ad)}">
      <div class="mobile-sponsored-media">
        ${bannerPlacementMediaHtml(ad,'mobile-sponsored-media-fallback')}
        <span class="mobile-sponsored-label">SPONSORLU</span>
      </div>
      <div class="mobile-sponsored-body">
        <div class="mobile-sponsored-title">
          <div>
            <strong>${escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')}</strong>
            <small>${escapeHtml([ad.city,ad.district].filter(Boolean).join(' / ') || ad.categoryLabel || 'Reklam')}</small>
          </div>
        </div>
        <div class="mobile-sponsored-footer">
          <span>${escapeHtml(ad.text || 'Sponsorlu reklam')}</span>
          <b>İncele →</b>
        </div>
      </div>
    </a>
  `;
}

function premiumPlacementBannerHtml(ad){
  const image=safePublicProfileUrl(ad.imageUrl || ad.logoUrl || '');
  const video=safePublicProfileUrl(ad.videoUrl || '');
  const isVideo=String(ad.mediaType || '')==='video' && Boolean(video);
  const location=[ad.city,ad.district].filter(Boolean).join(' / ');

  trackBannerAdImpression(ad);

  return `
    <a class="premium-showcase-card premium-showcase-clean banner-placement-card" data-banner-ad-id="${escapeHtml(String(ad.id||""))}" href="${bannerPlacementHref(ad)}">
      <div class="premium-showcase-media">
        ${isVideo
          ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+image+'"></video>'
          : (image
              ? '<img src="'+image+'" alt="'+escapeHtml(ad.institutionName || 'Sponsorlu kurum')+'">'
              : '<div class="premium-showcase-fallback">📣</div>')}
      </div>

      <div class="premium-showcase-content">
        <div class="premium-showcase-copy">
          <strong>${escapeHtml(ad.headline || ad.institutionName || 'Sponsorlu Kurum')}</strong>
          <p>${escapeHtml(ad.text || '')}</p>
          ${location ? '<small>📍 '+escapeHtml(location)+'</small>' : ''}
        </div>
        <span class="premium-showcase-cta">İncele →</span>
      </div>
    </a>
  `;
}

function paintPremiumPlacementBanners(ads){
  const stage=document.getElementById('premiumShowcaseStage');
  const dots=document.getElementById('premiumShowcaseDots');
  if(!stage || !ads.length)return false;

  premiumShowcaseIndex=((premiumShowcaseIndex % ads.length)+ads.length)%ads.length;
  const active=ads[premiumShowcaseIndex];
  stage.innerHTML=premiumPlacementBannerHtml(active);

  if(dots){
    dots.innerHTML=ads.length>1
      ? ads.map((_,index)=>
          '<button type="button" class="'+(index===premiumShowcaseIndex?'active':'')+
          '" data-premium-banner-slide="'+index+'" aria-label="'+(index+1)+'. premium reklam"></button>'
        ).join('')
      : '';

    dots.querySelectorAll('[data-premium-banner-slide]').forEach(button=>{
      button.addEventListener('click',()=>{
        premiumShowcaseIndex=Number(button.dataset.premiumBannerSlide || 0);
        renderPremiumShowcase(true);
      });
    });
  }

  return true;
}

let homeSponsoredSliderTimer = null;

function stopHomeSponsoredSlider(){
  if(homeSponsoredSliderTimer){
    clearInterval(homeSponsoredSliderTimer);
    homeSponsoredSliderTimer=null;
  }
}

function homeSponsoredStep(){
  const rail=document.getElementById('homeSponsoredRail');
  if(!rail)return 0;

  const card=rail.querySelector('.sponsored-card');
  if(!card)return 0;

  const styles=getComputedStyle(rail);
  const gap=parseFloat(styles.columnGap || styles.gap || '12') || 12;
  return card.getBoundingClientRect().width + gap;
}

function moveHomeSponsoredSlider(direction=1){
  const rail=document.getElementById('homeSponsoredRail');
  if(!rail)return;

  const step=homeSponsoredStep();
  if(!step)return;

  const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
  let target=rail.scrollLeft+(step*direction);

  if(direction>0 && target>max-4)target=0;
  if(direction<0 && target<0)target=max;

  rail.scrollTo({left:target,behavior:'smooth'});
}

function setupHomeSponsoredSlider(){
  const rail=document.getElementById('homeSponsoredRail');
  const controls=document.getElementById('sponsoredSliderControls');
  const prev=document.getElementById('sponsoredPrevBtn');
  const next=document.getElementById('sponsoredNextBtn');

  stopHomeSponsoredSlider();
  if(!rail)return;

  const cards=[...rail.querySelectorAll('.sponsored-card')];
  const canSlide=cards.length>2;

  if(controls)controls.classList.toggle('hidden',!canSlide);
  if(prev)prev.onclick=()=>moveHomeSponsoredSlider(-1);
  if(next)next.onclick=()=>moveHomeSponsoredSlider(1);

  if(!canSlide)return;

  homeSponsoredSliderTimer=setInterval(()=>{
    if(document.hidden)return;
    moveHomeSponsoredSlider(1);
  },6000);

  rail.onmouseenter=stopHomeSponsoredSlider;
  rail.onmouseleave=()=>{
    if(!homeSponsoredSliderTimer){
      homeSponsoredSliderTimer=setInterval(()=>{
        if(document.hidden)return;
        moveHomeSponsoredSlider(1);
      },6000);
    }
  };
}


let mobileSponsorSliderTimer=null;

function mobileSponsorSalesCardHtml(slotNo,categoryLabel){
  return `
    <div class="mobile-sponsor-mini-card mobile-sponsor-mini-sales">
      <div class="mobile-sponsor-mini-icon">📣</div>
      <div class="mobile-sponsor-mini-copy">
        <span>SPONSORLU ALAN · ${slotNo}</span>
        <strong>Burada öne çıkın</strong>
        <small>${escapeHtml(categoryLabel)}</small>
      </div>
      <button type="button" data-advertise-home data-ad-service="regionalAd" data-ad-order="1">Reklam Ver</button>
    </div>
  `;
}

function mobileSponsorBannerCardHtml(ad){
  const image=safePublicProfileUrl(ad.imageUrl || ad.logoUrl || '');
  const video=safePublicProfileUrl(ad.videoUrl || '');
  const isVideo=String(ad.mediaType || '')==='video' && Boolean(video);
  const href=bannerPlacementHref(ad);
  const title=ad.headline || ad.institutionName || 'Sponsorlu Kurum';
  const sub=[ad.city,ad.district].filter(Boolean).join(' / ') || ad.categoryLabel || 'Sponsorlu';

  trackBannerAdImpression(ad);

  return `
    <a class="mobile-sponsor-mini-card mobile-sponsor-mini-ad" data-banner-ad-id="${escapeHtml(String(ad.id||""))}" href="${href}">
      <div class="mobile-sponsor-mini-media">
        ${isVideo
          ? '<video src="'+video+'" autoplay muted loop playsinline poster="'+image+'"></video>'
          : (image
              ? '<img src="'+image+'" alt="'+escapeHtml(title)+'">'
              : '<div class="mobile-sponsor-mini-fallback">📣</div>')}
        <span>SPONSORLU</span>
      </div>
      <div class="mobile-sponsor-mini-copy">
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(sub)}</small>
      </div>
    </a>
  `;
}

function mobileSponsorInstitutionCardHtml(inst){
  const cover=safePublicProfileUrl(inst.coverUrl || '');
  const location=inst.location || [inst.city,inst.district].filter(Boolean).join(', ') || 'Konum bilgisi';

  return `
    <article
      class="mobile-sponsor-mini-card mobile-sponsor-mini-ad"
      data-sponsored-id="${escapeHtml(String(inst.id))}"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(inst.name || 'Sponsorlu kurum')} profilini aç"
    >
      <div class="mobile-sponsor-mini-media">
        ${cover
          ? '<img src="'+cover+'" alt="'+escapeHtml(inst.name || 'Sponsorlu kurum')+'">'
          : '<div class="mobile-sponsor-mini-fallback">'+escapeHtml(inst.emoji || '🏢')+'</div>'}
        <span>SPONSORLU</span>
      </div>
      <div class="mobile-sponsor-mini-copy">
        <strong>${escapeHtml(inst.name || 'Kurum')}</strong>
        <small>📍 ${escapeHtml(location)}</small>
      </div>
    </article>
  `;
}

function stopMobileSponsorSlider(){
  if(mobileSponsorSliderTimer){
    clearInterval(mobileSponsorSliderTimer);
    mobileSponsorSliderTimer=null;
  }
}

function setupMobileSponsorSlider(){
  const slot=document.getElementById('mobileSponsoredSlot');
  const track=slot?.querySelector('.mobile-sponsored-track');
  const dots=[...(slot?.querySelectorAll('[data-mobile-sponsor-dot]') || [])];
  if(!slot||!track)return;

  stopMobileSponsorSlider();

  const pages=[...track.querySelectorAll('.mobile-sponsored-page')];
  if(pages.length<2)return;

  const setActiveDot=()=>{
    const width=track.clientWidth || 1;
    const index=Math.max(0,Math.min(pages.length-1,Math.round(track.scrollLeft/width)));
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  };

  track.addEventListener('scroll',()=>{
    window.clearTimeout(track._dijiyerSponsorScrollTimer);
    track._dijiyerSponsorScrollTimer=window.setTimeout(setActiveDot,80);
  },{passive:true});

  dots.forEach((dot,index)=>{
    dot.onclick=()=>{
      track.scrollTo({left:index*track.clientWidth,behavior:'smooth'});
    };
  });

  mobileSponsorSliderTimer=setInterval(()=>{
    if(document.hidden)return;
    const width=track.clientWidth || 1;
    const current=Math.round(track.scrollLeft/width);
    const next=(current+1)%pages.length;
    track.scrollTo({left:next*width,behavior:'smooth'});
  },5000);

  track.addEventListener('touchstart',stopMobileSponsorSlider,{passive:true,once:true});
}

function renderMobileSponsorCarousel(mobileSlot,sponsored){
  if(!mobileSlot)return;

  const mobileBanners=getBannerAdsForPlacement('mobile_sponsor');
  const homeBanners=getHomepageSponsorBannerAds();

  const seen=new Set();
  const bannerCandidates=[];

  [...mobileBanners,...homeBanners].forEach(ad=>{
    const key=String(ad.id || ad.institutionId || '');
    if(!key||seen.has(key))return;
    seen.add(key);
    bannerCandidates.push(ad);
  });

  const cards=[];
  const usedInstitutionIds=new Set();

  bannerCandidates.slice(0,8).forEach(ad=>{
    cards.push(mobileSponsorBannerCardHtml(ad));
    if(ad.institutionId)usedInstitutionIds.add(String(ad.institutionId));
  });

  sponsored
    .filter(inst=>!usedInstitutionIds.has(String(inst.id)))
    .slice(0,Math.max(0,8-cards.length))
    .forEach(inst=>{
      cards.push(mobileSponsorInstitutionCardHtml(inst));
    });

  const activeMain=getSelectedMainCategory();
  const categoryLabel=activeMain
    ? (categoryTaxonomy[activeMain]?.label || 'bu kategoriyi')
    : 'Bölgenizdeki müşteriler';

  while(cards.length<2){
    cards.push(mobileSponsorSalesCardHtml(cards.length+1,categoryLabel));
  }

  const pages=[];
  for(let i=0;i<cards.length;i+=2){
    const pair=[cards[i],cards[i+1] || mobileSponsorSalesCardHtml(i+2,categoryLabel)];
    pages.push(`
      <div class="mobile-sponsored-page">
        <div class="mobile-sponsored-pair">
          ${pair.join('')}
        </div>
      </div>
    `);
  }

  mobileSlot.innerHTML=`
    <div class="pc-sponsored-heading">
      <div>
        <span>SPONSORLU İŞLETMELER</span>
        <strong>Bölgenizde öne çıkan reklamlar</strong>
      </div>
      <small>Görsel ve video sponsorlu içerikler</small>
    </div>
    <div class="mobile-sponsored-carousel" aria-label="Sponsorlu reklamlar">
      <div class="mobile-sponsored-track">
        ${pages.join('')}
      </div>
      ${pages.length>1 ? `
        <div class="mobile-sponsored-dots" aria-label="Sponsorlu reklam geçişleri">
          ${pages.map((_,i)=>'<button type="button" class="'+(i===0?'active':'')+'" data-mobile-sponsor-dot="'+i+'" aria-label="'+(i+1)+'. sponsorlu reklam grubu"></button>').join('')}
        </div>
      ` : ''}
    </div>
  `;

  bindHomepageSponsoredCards(mobileSlot);
  bindHomepageAdvertiseButtons();
  setupMobileSponsorSlider();
}

function renderSponsoredAds() {
  const rail = document.getElementById('homeSponsoredRail');
  const sidebar = document.getElementById('sidebarSponsoredSlot');
  const mobileSlot = document.getElementById('mobileSponsoredSlot');
  const premiumStage = document.getElementById('premiumShowcaseStage');
  if (!rail && !sidebar && !mobileSlot && !premiumStage) return;

  renderPremiumShowcase();

  const sponsored = getHomepageSponsoredInstitutions();

  if (rail) {
    const sponsorBanners = getHomepageSponsorBannerAds();

    rail.innerHTML = sponsorBanners.length
      ? sponsorBanners.slice(0,8).map(homepageSponsorBannerHtml).join('')
      : homepageAdSalesHtml();

    bindHomepageAdvertiseButtons();
    setupHomeSponsoredSlider();
  }

  if (sidebar) {
    const sidebarBanners=getBannerAdsForPlacement('sidebar_sponsor');

    if (sidebarBanners.length) {
      sidebar.innerHTML=sidebarPlacementBannerHtml(sidebarBanners[0]);
    } else if (sponsored.length) {
      sidebar.innerHTML = homepageSponsoredSidebarHtml(sponsored[0]);
      bindHomepageSponsoredCards(sidebar);
    } else {
      sidebar.innerHTML = `
        <div class="sidebar-sponsored-placeholder">
          <span>SPONSORLU ALAN</span>
          <strong>İşletmeni burada göster</strong>
          <small>Ana sayfada görünürlüğünü artır.</small>
          <button type="button" data-advertise-home data-ad-service="regionalAd" data-ad-order="1">Reklam Ver</button>
        </div>
      `;
    }
  }

  if (mobileSlot) {
    renderMobileSponsorCarousel(mobileSlot,sponsored);
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
  sessionStorage.removeItem('dijiyerInstitutionAdService');
  sessionStorage.removeItem('dijiyerInstitutionAdOrder');
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
      .filter(item => String(item.status || "active") !== "passive")
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
  const button=document.getElementById(id);
  button?.addEventListener('click', () => {
    if(followManagedSectionLink(button))return;
    openModal('quoteModal');
  });
});

['businessAddBtn', 'footerInstitutionBtn'].forEach(id => {
  const button=document.getElementById(id);
  button?.addEventListener('click', () => {
    if(followManagedSectionLink(button))return;
    document.getElementById('institutionAddBtn')?.click();
  });
});

document.getElementById('businessPanelBtn')?.addEventListener('click', event => {
  const button=event.currentTarget;
  if(followManagedSectionLink(button))return;
  document.getElementById('institutionLoginBtn')?.click();
});

bindHomepageAdvertiseButtons();

function setupTrackingAdSafeMode() {
  const trackingButton = document.getElementById('trackingMainBtn');
  const zones = [
    document.getElementById('premiumHomeShowcase'),
    document.getElementById('sponsoredSection')
  ].filter(Boolean);

  if (!trackingButton || !zones.length || !('IntersectionObserver' in window)) return;

  const visibleZones = new Set();

  const sync = () => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    trackingButton.classList.toggle(
      'tracking-ad-safe',
      isMobile && visibleZones.size > 0
    );
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleZones.add(entry.target);
      else visibleZones.delete(entry.target);
    });
    sync();
  }, { threshold: 0.12 });

  zones.forEach(zone => observer.observe(zone));
  window.addEventListener('resize', sync);
}

setupTrackingAdSafeMode();

document.getElementById('exploreScrollBtn')?.addEventListener('click', () => {
  const target = document.getElementById('resultsSection');
  if (!target) return;

  target.scrollIntoView({
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
startExternalAds();


loadTodayPublicStats().catch(()=>{});


let dijiyerResponsiveCategoryMode = window.innerWidth > 820 ? "desktop" : "mobile";
window.addEventListener("resize",()=>{
  window.clearTimeout(window._dijiyerResponsiveCategoryTimer);
  window._dijiyerResponsiveCategoryTimer=window.setTimeout(()=>{
    const nextMode=window.innerWidth > 820 ? "desktop" : "mobile";
    if(nextMode===dijiyerResponsiveCategoryMode)return;
    dijiyerResponsiveCategoryMode=nextMode;
    try{ renderMobileCategories(); }catch(_){}
    try{ renderMobileJobs(); }catch(_){}
  },120);
});


/* Mobil: sayfanın başına dön butonu */
(function setupMobileBackToTop(){
  const button=document.getElementById('mobileBackToTopBtn');
  const trackingButton=document.getElementById('trackingMainBtn');
  if(!button)return;

  const updatePosition=()=>{
    const mobile=window.matchMedia('(max-width: 820px)').matches;
    if(!mobile){
      button.style.removeProperty('--mobile-back-top-bottom');
      return;
    }

    if(trackingButton){
      const rect=trackingButton.getBoundingClientRect();
      const gap=10;
      const bottom=Math.max(62,Math.round(window.innerHeight-rect.top+gap));
      button.style.setProperty('--mobile-back-top-bottom',bottom+'px');
    }else{
      button.style.setProperty('--mobile-back-top-bottom','62px');
    }
  };

  const updateVisibility=()=>{
    const mobile=window.matchMedia('(max-width: 820px)').matches;
    updatePosition();
    button.classList.toggle('is-visible',mobile && window.scrollY>360);
  };

  button.addEventListener('click',()=>{
    window.scrollTo({top:0,behavior:'smooth'});
  });

  window.addEventListener('scroll',updateVisibility,{passive:true});
  window.addEventListener('resize',updateVisibility);
  window.setTimeout(updateVisibility,120);
  updateVisibility();
})();


/* =========================================================
   MARKA BAYİ & SERVİS REHBERİ · ÇANAKKALE PİLOT
   Resmi marka sayfalarından kontrol edilen başlangıç kayıtları.
   ========================================================= */
const brandDirectoryData = [
  {
    brand:'Renault', city:'Çanakkale', district:'Merkez', type:'dealer_service',
    name:'SARUHAN - MERKEZ',
    address:'Renault Saruhan Çanakkale, İzmir Yolu, Çanakkale - İzmir Asfaltı, Kavşağı 9. Km, 17100 Merkez/Çanakkale',
    phone:'02862471717', phoneLabel:'(0286) 247 17 17',
    source:'https://saruhan.renault.com.tr/renault/bize-ulasin/'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Merkez', type:'service',
    name:'Beko Yetkili Servis - Cevatpaşa',
    address:'Barbaros Mah. Hamidiye Sk. No:34, Merkez/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-merkezilce-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Merkez', type:'service',
    name:'Beko Yetkili Servis - İsmetpaşa',
    address:'İsmetpaşa Mah. Asafpaşa Cad. No:68/1, Merkez/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-merkezilce-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Merkez', type:'dealer',
    name:'Postacılar Dayanıklı Tüketim Malları',
    address:'Namık Kemal Mah. Sakızlı Çeşme Sok. No:68, Merkez/Çanakkale',
    phone:'02862135055', phoneLabel:'(0286) 213 50 55',
    source:'https://www.beko.com.tr/canakkale-merkezilce-beko-magazalari'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Merkez', type:'dealer',
    name:'Sadettin Dönmez - Yeliz Beyazeşya ve Mobilya',
    address:'Kemalpaşa Mah. Değirmenlik Sok. No:55A, Merkez/Çanakkale',
    phone:'05497304588', phoneLabel:'0549 730 45 88',
    source:'https://www.beko.com.tr/canakkale-merkezilce-beko-magazalari'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Merkez', type:'dealer',
    name:'Tokgöz Dayanıklı Tüketim Malları',
    address:'Barbaros Mah. Atatürk Cad. Zakkum Evleri No:109, Merkez/Çanakkale',
    phone:'05339351840', phoneLabel:'0533 935 18 40',
    source:'https://www.beko.com.tr/canakkale-merkezilce-beko-magazalari'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Merkez', type:'service',
    name:'Arçelik Yetkili Servis - Cevatpaşa',
    address:'Barbaros Mah. Hamidiye Sk. No:34, Merkez/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.arcelik.com.tr/canakkale-merkezilce-yetkili-servis'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Merkez', type:'service',
    name:'Arçelik Yetkili Servis - İsmetpaşa',
    address:'İsmetpaşa Mah. Asafpaşa Cad. No:68/1, Merkez/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.arcelik.com.tr/canakkale-merkezilce-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Çan', type:'dealer',
    name:'Bilge Gökce DTM',
    address:'Cumhuriyet Mah. Vaiz Mustafa Sok. Truva Apt. No:35B, Çan/Çanakkale',
    phone:'02864161252', phoneLabel:'(0286) 416 12 52',
    source:'https://www.beko.com.tr/canakkale-can-beko-magazalari'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Çan', type:'service',
    name:'Beko Yetkili Servis - Çan',
    address:'Karşıyaka Mah. Nadir Pazarbaşı Sok. No:19 İç Kapı No:3, Çan/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-can-yetkili-servis'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Çan', type:'dealer',
    name:'Emel Aktaş - Güven Dayanıklı Tüketim Malzemeleri',
    address:'İstiklal Mah. Bülent Ecevit Cad. No:5, Çan/Çanakkale',
    phone:'05444121114', phoneLabel:'0544 412 11 14',
    source:'https://www.arcelik.com.tr/canakkale-can-arcelik-magazalari'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Çan', type:'service',
    name:'Arçelik Yetkili Servis - Çan',
    address:'Karşıyaka Mah. Nadir Pazarbaşı Sok. No:19 İç Kapı No:3, Çan/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.arcelik.com.tr/canakkale-can-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Ezine', type:'dealer',
    name:'Ceyhanlar Mobilya Dayanıklı Tüketim Malları',
    address:'Camikebir Mah. Spor Sk. No:2, Ezine/Çanakkale',
    phone:'02866181567', phoneLabel:'(0286) 618 15 67',
    source:'https://www.beko.com.tr/canakkale-ezine-beko-magazalari'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Ezine', type:'service',
    name:'Beko Yetkili Servis - Ezine',
    address:'18 Evler 5. Sok. No:2/A, Ezine/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-ezine-yetkili-servis'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Ezine', type:'service',
    name:'Arçelik Yetkili Servis - Ezine',
    address:'18 Evler 5. Sok. No:2/A, Ezine/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.arcelik.com.tr/canakkale-ezine-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Biga', type:'service',
    name:'Beko Yetkili Servis - Biga',
    address:'Hamdibey Mah. İnönü Cad. No:87/A, Biga/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-biga-yetkili-servis'
  },
  {
    brand:'Arçelik', city:'Çanakkale', district:'Biga', type:'service',
    name:'Arçelik Yetkili Servis - Biga',
    address:'Hamdibey Mah. İnönü Cad. No:87/A, Biga/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.arcelik.com.tr/canakkale-biga-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Gelibolu', type:'service',
    name:'Beko Yetkili Servis - Gelibolu',
    address:'Hoca Hamza Mah. Şehit Arif Becce Sok. No:2/B, Gelibolu/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-gelibolu-yetkili-servis'
  },
  {
    brand:'Beko', city:'Çanakkale', district:'Gökçeada', type:'service',
    name:'Beko Yetkili Servis - Gökçeada',
    address:'Fatih Mah. Bahçeler Sk. No:1/E, Gökçeada/Çanakkale',
    phone:'08502100888', phoneLabel:'0850 210 0 888',
    source:'https://www.beko.com.tr/canakkale-gokceada-yetkili-servis'
  }
];

let brandDirectoryBrand='all';
let brandDirectoryType='all';
let brandDirectoryQuery='';
let brandDirectoryShowAllResults=false;

function brandDirectoryMatchesType(row,type){
  if(type==='all')return true;
  if(row.type==='dealer_service')return type==='dealer'||type==='service';
  return row.type===type;
}

function brandDirectoryTypeLabel(type){
  if(type==='service')return 'Yetkili Servis';
  if(type==='dealer')return 'Bayi / Mağaza';
  return 'Bayi + Servis';
}

function brandDirectoryTypeClass(type){
  if(type==='dealer')return 'dealer';
  if(type==='dealer_service')return 'both';
  return 'service';
}

function brandDirectoryRouteUrl(row){
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(row.name+' '+row.address);
}

function brandDirectoryCardHtml(row){
  return `
    <article class="brand-directory-card">
      <div class="brand-directory-card-top">
        <div class="brand-directory-logo">${escapeHtml(row.brand)}</div>
        <div class="brand-directory-card-copy">
          <span>${escapeHtml(row.brand.toUpperCase())}</span>
          <strong>${escapeHtml(row.name)}</strong>
          <small>📍 ${escapeHtml(row.district+' / '+row.city)}</small>
        </div>
        <span class="brand-directory-type-badge ${brandDirectoryTypeClass(row.type)}">${escapeHtml(brandDirectoryTypeLabel(row.type))}</span>
      </div>

      <div class="brand-directory-contact">
        <p><strong>Adres:</strong> ${escapeHtml(row.address)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(row.phoneLabel)}</p>
      </div>

      <div class="brand-directory-verified">✓ Resmi marka kaynağı · 29.09.2026 kontrol</div>

      <div class="brand-directory-actions">
        <a class="call" href="tel:${escapeHtml(row.phone)}">☎ Ara</a>
        <a class="route" href="${brandDirectoryRouteUrl(row)}" target="_blank" rel="noopener">📍 Yol Tarifi</a>
        <a class="source" href="${escapeHtml(row.source)}" target="_blank" rel="noopener" aria-label="Resmi marka kaynağını aç" title="Resmi kaynak">↗</a>
      </div>
    </article>
  `;
}

function brandDirectoryGroupHtml(brand,rows){
  const serviceCount=rows.filter(row=>brandDirectoryMatchesType(row,'service')).length;
  const dealerCount=rows.filter(row=>brandDirectoryMatchesType(row,'dealer')).length;
  const districts=[...new Set(rows.map(row=>row.district).filter(Boolean))];
  const districtText=districts.slice(0,3).join(' · ')+(districts.length>3?' +'+(districts.length-3):'');

  return `
    <button type="button" class="brand-directory-group" data-brand-directory-open-brand="${escapeHtml(brand)}">
      <span class="brand-directory-group-logo">${escapeHtml(brand.slice(0,2).toUpperCase())}</span>
      <span class="brand-directory-group-copy">
        <strong>${escapeHtml(brand)}</strong>
        <small>${escapeHtml(districtText||'Bölgedeki yetkili noktalar')}</small>
        <em>
          ${serviceCount?'<i>🔧 '+serviceCount+' servis</i>':''}
          ${dealerCount?'<i>🏪 '+dealerCount+' bayi</i>':''}
        </em>
      </span>
      <span class="brand-directory-group-count">${rows.length}<small>nokta</small></span>
      <b>›</b>
    </button>
  `;
}

function brandDirectoryMoreButtonHtml(total,visible){
  if(total<=visible)return '';
  const remaining=Math.max(0,total-visible);
  return `
    <button type="button" class="brand-directory-more-btn" id="brandDirectoryMoreBtn">
      ${brandDirectoryShowAllResults
        ? 'Daralt ↑'
        : 'Daha Fazla Göster <span>+'+remaining+'</span> ↓'}
    </button>
  `;
}

function renderBrandDirectory(){
  const root=document.getElementById('brandDirectoryMobile');
  const results=document.getElementById('brandDirectoryResults');
  const brandsRoot=document.getElementById('brandDirectoryBrands');
  if(!root||!results||!brandsRoot)return;

  const locationLabel=document.getElementById('brandDirectoryLocation');
  const countEl=document.getElementById('brandDirectoryResultCount');
  const titleEl=document.getElementById('brandDirectoryResultTitle');
  const hintEl=document.getElementById('brandDirectoryResultHint');

  const activeCityNorm=normalizeQuoteSearch(activeLocationCity||'');
  const activeDistrictNorm=normalizeQuoteSearch(activeLocationDistrict||'');

  if(locationLabel){
    locationLabel.textContent=activeLocationCity
      ? (activeLocationDistrict ? activeLocationCity+' / '+activeLocationDistrict : activeLocationCity)
      : 'Tüm bölgeler';
  }

  const availableBrands=['all',...new Set(brandDirectoryData.map(row=>row.brand))];
  brandsRoot.innerHTML=availableBrands.map(brand=>`
    <button type="button" class="${brandDirectoryBrand===brand?'active':''}" data-brand-directory-brand="${escapeHtml(brand)}">
      ${brand==='all'?'Tüm Markalar':escapeHtml(brand)}
    </button>
  `).join('');

  const query=normalizeQuoteSearch(brandDirectoryQuery);

  const matchesCommonFilters=row=>{
    if(brandDirectoryBrand!=='all' && row.brand!==brandDirectoryBrand)return false;
    if(!brandDirectoryMatchesType(row,brandDirectoryType))return false;

    if(query){
      const haystack=normalizeQuoteSearch([
        row.brand,
        row.name,
        row.address,
        row.city,
        row.district,
        brandDirectoryTypeLabel(row.type)
      ].join(' '));
      if(!haystack.includes(query))return false;
    }
    return true;
  };

  const matchesExactLocation=row=>{
    const rowCity=normalizeQuoteSearch(row.city);
    const rowDistrict=normalizeQuoteSearch(row.district);
    if(activeCityNorm && rowCity!==activeCityNorm)return false;
    if(activeDistrictNorm && rowDistrict!==activeDistrictNorm)return false;
    return true;
  };

  let filtered=brandDirectoryData.filter(row=>matchesCommonFilters(row) && matchesExactLocation(row));
  let usedSearchFallback=false;

  /* Seçili ilçede kayıt yoksa kullanıcıya 0 göstermeyelim.
     Önce aynı ilde, sonra rehberdeki tüm eşleşen kayıtları göster. */
  if(!filtered.length && activeCityNorm){
    filtered=brandDirectoryData.filter(row=>
      matchesCommonFilters(row) &&
      normalizeQuoteSearch(row.city)===activeCityNorm
    );
    usedSearchFallback=filtered.length>0;
  }

  if(!filtered.length){
    filtered=brandDirectoryData.filter(matchesCommonFilters);
    usedSearchFallback=filtered.length>0;
  }

  if(countEl)countEl.textContent=String(filtered.length);
  if(titleEl){
    if(usedSearchFallback){
      titleEl.textContent=brandDirectoryBrand==='all'
        ? 'Bölgedeki bayi ve servisler'
        : brandDirectoryBrand+' noktaları';
    }else{
      titleEl.textContent=brandDirectoryBrand==='all'
        ? 'Yakındaki bayi ve servisler'
        : brandDirectoryBrand+' noktaları';
    }
  }
  if(hintEl){
    hintEl.textContent=usedSearchFallback
      ? 'Seçili ilçede kayıt yok; en yakın eşleşen kayıtlar gösteriliyor'
      : (activeCityNorm && activeCityNorm!==normalizeQuoteSearch('Çanakkale')
          ? 'Bu il için rehber kayıtları henüz ekleniyor'
          : 'Resmi marka kaynaklarından derlenen iletişim bilgileri');
  }

  const groupedMode=brandDirectoryBrand==='all' && !query;

  if(!filtered.length){
    results.innerHTML=`
      <div class="brand-directory-empty">
        <strong>Bu filtreye uygun kayıt bulunamadı.</strong>
        <span>${activeCityNorm && activeCityNorm!==normalizeQuoteSearch('Çanakkale')
          ? 'Marka rehberi şu anda Çanakkale pilot verileriyle başlıyor. Diğer iller sırayla eklenecek.'
          : 'Marka veya tür filtresini değiştirerek tekrar deneyin.'}</span>
      </div>
    `;
  }else if(groupedMode){
    const grouped=[...new Set(filtered.map(row=>row.brand))]
      .map(brand=>({
        brand,
        rows:filtered.filter(row=>row.brand===brand)
      }))
      .sort((a,b)=>b.rows.length-a.rows.length || a.brand.localeCompare(b.brand,'tr'));

    results.innerHTML=`
      <div class="brand-directory-group-list">
        ${grouped.map(group=>brandDirectoryGroupHtml(group.brand,group.rows)).join('')}
      </div>
      <div class="brand-directory-group-note">Markaya dokunarak yetkili noktaları açabilirsin.</div>
    `;

    results.querySelectorAll('[data-brand-directory-open-brand]').forEach(button=>{
      button.addEventListener('click',()=>{
        brandDirectoryBrand=button.dataset.brandDirectoryOpenBrand||'all';
        brandDirectoryShowAllResults=false;
        renderBrandDirectory();
        root.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }else{
    const firstLimit=query ? 6 : 4;
    const visibleCount=brandDirectoryShowAllResults ? filtered.length : firstLimit;
    results.innerHTML=
      filtered.slice(0,visibleCount).map(brandDirectoryCardHtml).join('')+
      brandDirectoryMoreButtonHtml(filtered.length,firstLimit);

    document.getElementById('brandDirectoryMoreBtn')?.addEventListener('click',()=>{
      brandDirectoryShowAllResults=!brandDirectoryShowAllResults;
      renderBrandDirectory();
      if(!brandDirectoryShowAllResults){
        root.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }

  brandsRoot.querySelectorAll('[data-brand-directory-brand]').forEach(button=>{
    button.addEventListener('click',()=>{
      brandDirectoryBrand=button.dataset.brandDirectoryBrand||'all';
      brandDirectoryShowAllResults=false;
      renderBrandDirectory();
    });
  });
}

window.__brandDirectoryReady=true;

(function setupBrandDirectory(){
  const search=document.getElementById('brandDirectorySearch');
  const clear=document.getElementById('brandDirectorySearchClear');
  const locationButton=document.getElementById('brandDirectoryChangeLocation');

  search?.addEventListener('input',()=>{
    brandDirectoryQuery=search.value||'';
    brandDirectoryShowAllResults=false;

    /* Serbest arama marka çipine takılmasın. Örn. daha önce Arçelik seçiliyken
       "Beko" yazıldığında da Beko sonuçları gelebilsin. */
    if(brandDirectoryQuery.trim()){
      brandDirectoryBrand='all';
    }

    clear?.classList.toggle('hidden',!brandDirectoryQuery);
    renderBrandDirectory();
  });

  clear?.addEventListener('click',()=>{
    brandDirectoryQuery='';
    brandDirectoryShowAllResults=false;
    if(search)search.value='';
    clear.classList.add('hidden');
    renderBrandDirectory();
    search?.focus();
  });

  document.querySelectorAll('[data-brand-directory-type]').forEach(button=>{
    button.addEventListener('click',()=>{
      brandDirectoryType=button.dataset.brandDirectoryType||'all';
      brandDirectoryShowAllResults=false;
      document.querySelectorAll('[data-brand-directory-type]').forEach(item=>{
        item.classList.toggle('active',item===button);
      });
      renderBrandDirectory();
    });
  });

  locationButton?.addEventListener('click',()=>{
    document.getElementById('mobileSearchLocationBtn')?.click();
  });

  renderBrandDirectory();
})();


/* Mobilde iki reklamlık sponsor alanını Marka Bayi & Servis bölümünden
   sonra, İş Fırsatları bölümünün hemen üstüne taşı. Masaüstünde eski
   konumuna geri dönsün. */
function positionMobileSponsoredSlotNearJobs(){
  const slot=document.getElementById('mobileSponsoredSlot');
  const jobs=document.getElementById('mobileJobsBoard');
  const sponsoredSection=document.getElementById('sponsoredSection');
  if(!slot)return;

  const isMobile=window.matchMedia('(max-width: 820px)').matches;
  const isHomePage=document.body.classList.contains('home-page');

  /* Ana sayfada sponsor alanının konumu HTML sırasıyla yönetilir.
     Güvenli Teklif Sistemi ile reklam alanı yer değiştirdiğinde
     JavaScript bu sıralamayı geri bozmasın. */
  if(isHomePage){
    slot.classList.remove('moved-near-jobs');
    return;
  }

  if(isMobile && jobs?.parentNode){
    if(slot.nextElementSibling!==jobs){
      jobs.parentNode.insertBefore(slot,jobs);
    }
    slot.classList.add('moved-near-jobs');
    return;
  }

  if(!isMobile && sponsoredSection?.parentNode){
    if(slot.nextElementSibling!==sponsoredSection){
      sponsoredSection.parentNode.insertBefore(slot,sponsoredSection);
    }
    slot.classList.remove('moved-near-jobs');
  }
}

window.addEventListener('resize',positionMobileSponsoredSlotNearJobs);
document.addEventListener('DOMContentLoaded',positionMobileSponsoredSlotNearJobs);
window.setTimeout(positionMobileSponsoredSlotNearJobs,120);


// =========================================================
// DIJIYER DESKTOP MARKETPLACE V1
// Üst arama + konum + hızlı kategori butonlarını mevcut
// Dijiyer filtre altyapısına bağlar.
// =========================================================
(function setupDesktopMarketplace(){
  const desktopLocationBtn = document.getElementById('desktopLocationBtn');
  const desktopLocationText = document.getElementById('desktopLocationText');
  const desktopSearchSubmitBtn = document.getElementById('desktopSearchSubmitBtn');
  const searchInput = document.getElementById('searchInput');
  const resultsSection = document.getElementById('resultsSection');
  const categoryPreview = document.getElementById('desktopCategoryPreview');
  const categoryPreviewIcon = document.getElementById('desktopCategoryPreviewIcon');
  const categoryPreviewEyebrow = document.getElementById('desktopCategoryPreviewEyebrow');
  const categoryPreviewTitle = document.getElementById('desktopCategoryPreviewTitle');
  const categoryPreviewText = document.getElementById('desktopCategoryPreviewText');
  const categoryPreviewCount = document.getElementById('desktopCategoryPreviewCount');
  const categoryPreviewSubs = document.getElementById('desktopCategoryPreviewSubs');
  const categoryPreviewOpen = document.getElementById('desktopCategoryPreviewOpen');
  const categoryInlineResults = document.getElementById('desktopCategoryInlineResults');

  function syncDesktopLocation(){
    if(!desktopLocationText)return;
    const source = document.getElementById('locationBtnText');
    desktopLocationText.textContent = source?.textContent?.trim() || 'Tüm Türkiye';
  }

  function isDesktopRealInstitution(inst){
    return Boolean(
      inst &&
      String(inst.source || '') === 'firestore' &&
      String(inst.status || 'active') !== 'passive'
    );
  }

  function desktopInstitutionMatchesLocation(inst){
    const normalizedActiveCity = normalizeQuoteSearch(activeLocationCity || '');
    const normalizedActiveDistrict = normalizeQuoteSearch(activeLocationDistrict || '');

    const locationParts = String(inst.location || '')
      .split(',')
      .map(part=>part.trim());

    const institutionCity = String(inst.city || locationParts[0] || '').trim();
    const institutionDistrict = String(inst.district || locationParts[1] || '').trim();

    return (
      (!normalizedActiveCity ||
        normalizeQuoteSearch(institutionCity)===normalizedActiveCity) &&
      (!normalizedActiveDistrict ||
        normalizeQuoteSearch(institutionDistrict)===normalizedActiveDistrict)
    );
  }

  function desktopCategoryInstitutions(mainKey,subKey=''){
    if(!Array.isArray(institutions))return [];

    return institutions.filter(inst=>{
      if(!isDesktopRealInstitution(inst))return false;
      if(!desktopInstitutionMatchesLocation(inst))return false;

      const [instMain,instSub] = resolveTaxonomy(inst);
      if(mainKey && String(instMain)!==String(mainKey))return false;
      if(subKey && String(instSub)!==String(subKey))return false;

      return true;
    });
  }

  function desktopSubcategoryInstitutionCount(mainKey,subKey){
    return desktopCategoryInstitutions(mainKey,subKey).length;
  }

  function hideDesktopInlineInstitutions(){
    if(!categoryInlineResults)return;
    categoryInlineResults.classList.add('hidden');
    categoryInlineResults.innerHTML='';
    if(categoryPreviewOpen)categoryPreviewOpen.textContent='Kurumları Gör';
  }

  function renderDesktopInlineInstitutions(rows){
    if(!categoryInlineResults)return;

    const sourceRows = Array.isArray(rows)
      ? rows
      : desktopCategoryInstitutions(
          String(categoryPreview?.dataset.category || '').trim(),
          String(categoryPreview?.dataset.subcategory || '').trim()
        );

    const realRows = sourceRows.filter(isDesktopRealInstitution);
    const mainKey = String(categoryPreview?.dataset.category || '').trim();
    const subKey = String(categoryPreview?.dataset.subcategory || '').trim();
    const mainLabel = categoryTaxonomy[mainKey]?.label || '';
    const subLabel = categoryTaxonomy[mainKey]?.subs?.[subKey] || '';
    const selectionLabel = subLabel || mainLabel || 'Seçiminiz';

    if(!realRows.length){
      categoryInlineResults.innerHTML =
        '<div class="desktop-inline-empty">' +
          '<span class="desktop-inline-empty-icon">⌕</span>' +
          '<div><strong>' + escapeHtml(selectionLabel) + ' için aktif kurum bulunamadı.</strong>' +
          '<small>Başka bir alt hizmet seçebilir veya ücretsiz teklif oluşturabilirsin.</small></div>' +
          '<button type="button" class="desktop-inline-empty-quote" data-desktop-inline-empty-quote>Teklif Al →</button>' +
        '</div>';
      categoryInlineResults.querySelector('[data-desktop-inline-empty-quote]')?.addEventListener('click',()=>{
        const categorySelect = document.getElementById('quoteCategory');
        const serviceSelect = document.getElementById('quoteService');

        if(categorySelect && mainKey){
          categorySelect.value = mainKey;
          if(typeof fillQuoteServices === 'function') fillQuoteServices(mainKey);
          else if(typeof fillSubCategorySelect === 'function') fillSubCategorySelect(mainKey,'quoteService','Alt kategori seçin');
        }
        if(serviceSelect && subKey && [...serviceSelect.options].some(option=>option.value===subKey)){
          serviceSelect.value = subKey;
        }

        if(typeof openModal === 'function') openModal('quoteModal');
        else document.getElementById('quoteModal')?.classList.remove('hidden');
      });

      categoryInlineResults.classList.remove('hidden');
      categoryInlineResults.classList.remove('is-revealed');
      void categoryInlineResults.offsetWidth;
      categoryInlineResults.classList.add('is-revealed');
      if(categoryPreviewOpen)categoryPreviewOpen.textContent='Kurumları Gizle';
      return;
    }

    const visibleRows = realRows.slice(0,12);
    categoryInlineResults.innerHTML =
      '<div class="desktop-inline-results-head">' +
        '<div class="desktop-inline-results-title">' +
          '<span class="desktop-inline-results-opened"><i>↓</i> SONUÇLAR AÇILDI</span>' +
          '<strong>' + escapeHtml(selectionLabel) + ' için ' + realRows.length + ' aktif kurum</strong>' +
          '<small>Seçtiğin hizmete uygun kurumlar aşağıda listelendi.</small>' +
        '</div>' +
        '<button type="button" class="desktop-inline-results-quote-btn" data-desktop-inline-quote data-main-category="' + escapeHtml(mainKey) + '" data-sub-category="' + escapeHtml(subKey) + '">' +
          '<span>Ücretsiz</span><strong>Teklif Al</strong><b>→</b>' +
        '</button>' +
      '</div>' +
      '<div class="desktop-inline-institution-grid">' +
        visibleRows.map((inst,index)=>{
          const logo = safePublicProfileUrl(inst.logoUrl || inst.coverUrl || '');
          const location = [inst.district,inst.city].filter(Boolean).join(' / ') || String(inst.location || '');
          const rating = Number(inst.rating || 0);
          const reviewCount = Number(inst.reviewCount || 0);
          const recommendationCount = Number(inst.recommendationCount || 0);
          const recommendationYes = Number(inst.recommendationYes || 0);
          const recommendationRate = Number(inst.recommendationRate);
          const offerText = inst.offer ? '<span class="desktop-inline-offer">Teklif veriyor</span>' : '';
          const ratingText = reviewCount > 0 ? '<span class="desktop-inline-rating">⭐ ' + rating.toFixed(1) + '</span>' : '';
          const recommendText = recommendationCount > 0 && Number.isFinite(recommendationRate)
            ? '<span class="desktop-inline-recommend">👍 ' + recommendationYes + ' kişi · %' + Math.round(recommendationRate) + '</span>'
            : '';

          return '<article class="desktop-inline-institution-card" style="--result-index:' + index + '">' +
            '<a class="desktop-inline-card-main" href="kurum.html?id=' + encodeURIComponent(inst.id) + '">' +
              '<div class="desktop-inline-institution-logo">' +
                (logo ? '<img src="' + logo + '" alt="">' : '<span>' + escapeHtml(inst.emoji || '🏢') + '</span>') +
              '</div>' +
              '<div class="desktop-inline-institution-copy">' +
                '<strong>' + escapeHtml(inst.name || 'Kurum') + '</strong>' +
                '<small>📍 ' + escapeHtml(location || 'Konum bilgisi yok') + '</small>' +
                '<div>' + ratingText + recommendText + offerText + '</div>' +
              '</div>' +
            '</a>' +
            '<div class="desktop-inline-card-actions">' +
              (inst.offer
                ? '<button type="button" class="desktop-inline-card-quote" data-desktop-inline-offer="' + escapeHtml(String(inst.id)) + '">Teklif Al</button>'
                : '') +
              '<a class="desktop-inline-card-arrow" href="kurum.html?id=' + encodeURIComponent(inst.id) + '" aria-label="' + escapeHtml(inst.name || 'Kurum') + ' kurum sayfasını aç">→</a>' +
            '</div>' +
          '</article>';
        }).join('') +
      '</div>' +
      (realRows.length > visibleRows.length
        ? '<div class="desktop-inline-more">+' + (realRows.length-visibleRows.length) + ' kurum daha</div>'
        : '');

    categoryInlineResults.querySelectorAll('[data-desktop-inline-offer]').forEach(button=>{
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        const institutionId=String(button.dataset.desktopInlineOffer||'').trim();
        if(institutionId)openInstitutionDirectQuote(institutionId);
      });
    });

    const inlineQuoteBtn = categoryInlineResults.querySelector('[data-desktop-inline-quote]');
    inlineQuoteBtn?.addEventListener('click',()=>{
      const selectedMain = String(inlineQuoteBtn.dataset.mainCategory || '').trim();
      const selectedSub = String(inlineQuoteBtn.dataset.subCategory || '').trim();

      const categorySelect = document.getElementById('quoteCategory');
      const serviceSelect = document.getElementById('quoteService');

      if(categorySelect && selectedMain){
        categorySelect.value = selectedMain;
        if(typeof fillQuoteServices === 'function'){
          fillQuoteServices(selectedMain);
        }else if(typeof fillSubCategorySelect === 'function'){
          fillSubCategorySelect(selectedMain,'quoteService','Alt kategori seçin');
        }
      }

      if(serviceSelect && selectedSub){
        const hasOption=[...serviceSelect.options].some(option=>option.value===selectedSub);
        if(hasOption)serviceSelect.value=selectedSub;
      }

      if(typeof openModal === 'function'){
        openModal('quoteModal');
      }else{
        document.getElementById('quoteModal')?.classList.remove('hidden');
      }
    });

    categoryInlineResults.classList.remove('hidden');
    categoryInlineResults.classList.remove('is-revealed');
    void categoryInlineResults.offsetWidth;
    categoryInlineResults.classList.add('is-revealed');

    if(categoryPreviewOpen)categoryPreviewOpen.textContent='Kurumları Gizle';
  }

  function renderDesktopCategoryPreview(key){
    if(!categoryPreview)return;

    const meta = key ? categoryTaxonomy[key] : null;
    const filteredCount = desktopCategoryInstitutions(key || '').length;

    categoryPreview.dataset.category = key || '';
    if(!categoryPreview.dataset.subcategory)categoryPreview.dataset.subcategory = '';
    categoryPreview.classList.remove('hidden');
    categoryPreview.classList.remove('attention');
    void categoryPreview.offsetWidth;
    categoryPreview.classList.add('attention');

    if(categoryPreviewIcon){
      categoryPreviewIcon.textContent = key ? (categoryIcons[key] || '•') : '☰';
    }
    if(categoryPreviewEyebrow){
      categoryPreviewEyebrow.textContent = key ? '✓ SEÇİMİN HAZIR' : 'TÜM KURUMLAR';
    }
    if(categoryPreviewTitle){
      categoryPreviewTitle.textContent = meta?.label || 'Tüm Kurumlar';
    }
    if(categoryPreviewText){
      categoryPreviewText.textContent = key
        ? 'Alt hizmeti seçebilir veya bu kategorideki kurumları inceleyebilirsin.'
        : 'Dijiyer’deki tüm kategorileri ve kayıtlı kurumları tek yerde inceleyebilirsin.';
    }
    if(categoryPreviewCount){
      categoryPreviewCount.textContent =
        Number.isFinite(filteredCount) && filteredCount > 0
          ? filteredCount + ' kurum'
          : '';
    }

    if(categoryPreviewSubs){
      categoryPreviewSubs.innerHTML = '';
      if(meta?.subs){
        Object.entries(meta.subs).slice(0,8).forEach(([subKey,label])=>{
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.desktopPreviewSub = subKey;
          button.dataset.desktopPreviewMain = key;

          const institutionCount = desktopSubcategoryInstitutionCount(key,subKey);
          button.dataset.desktopPreviewCount = String(institutionCount);
          button.disabled = institutionCount <= 0;
          button.classList.toggle('is-disabled',institutionCount <= 0);
          button.setAttribute(
            'aria-label',
            institutionCount > 0
              ? label + ' · ' + institutionCount + ' kurum'
              : label + ' · Yakında'
          );

          button.innerHTML =
            '<span class="desktop-preview-sub-count">' +
              (institutionCount > 0 ? institutionCount + ' kurum' : 'Yakında') +
            '</span>' +
            '<strong class="desktop-preview-sub-label">' + escapeHtml(label) + '</strong>';

          const selected = document.querySelector(
            '.subCategoryFilter[data-main-category="' + key + '"][value="' + subKey + '"]'
          )?.checked;
          button.classList.toggle('is-active',Boolean(selected));
          categoryPreviewSubs.appendChild(button);
        });
      }
    }
  }

  function selectDesktopCategory(key){
    if(typeof clearDiscoveryKeywordForCategorySelection === 'function'){
      clearDiscoveryKeywordForCategorySelection();
    }else if(searchInput){
      searchInput.value = '';
    }

    if(typeof clearAllCategorySelections === 'function'){
      clearAllCategorySelections();
    }else{
      document.querySelectorAll('.categoryFilter,.subCategoryFilter').forEach(input=>{
        input.checked=false;
      });
    }

    if(key){
      const target = [...document.querySelectorAll('.categoryFilter')]
        .find(input=>String(input.value||'')===key);
      if(target)target.checked=true;
    }

    document.querySelectorAll('[data-desktop-category]').forEach(item=>{
      item.classList.toggle(
        'is-active',
        String(item.dataset.desktopCategory || '').trim()===key
      );
    });

    if(typeof renderMobileCategories === 'function')renderMobileCategories();
    if(typeof renderList === 'function')renderList();
    if(typeof updateMobileCategoryResult === 'function')updateMobileCategoryResult();
    if(categoryPreview)categoryPreview.dataset.subcategory = '';
    hideDesktopInlineInstitutions();
    renderDesktopCategoryPreview(key);
  }

  categoryPreviewSubs?.addEventListener('click', event=>{
    const button = event.target.closest('[data-desktop-preview-sub]');
    if(!button)return;

    const institutionCount = Number(button.dataset.desktopPreviewCount || 0);
    if(institutionCount <= 0 || button.disabled)return;

    const mainKey = String(button.dataset.desktopPreviewMain || '').trim();
    const subKey = String(button.dataset.desktopPreviewSub || '').trim();
    if(!mainKey || !subKey)return;

    if(typeof clearDiscoveryKeywordForCategorySelection === 'function'){
      clearDiscoveryKeywordForCategorySelection();
    }
    if(typeof clearAllCategorySelections === 'function'){
      clearAllCategorySelections();
    }

    const mainInput = [...document.querySelectorAll('.categoryFilter')]
      .find(input=>String(input.value||'')===mainKey);
    const subInput = [...document.querySelectorAll('.subCategoryFilter')]
      .find(input=>
        String(input.dataset.mainCategory||'')===mainKey &&
        String(input.value||'')===subKey
      );

    if(mainInput)mainInput.checked=true;
    if(subInput)subInput.checked=true;

    document.querySelectorAll('[data-desktop-category]').forEach(item=>{
      item.classList.toggle(
        'is-active',
        String(item.dataset.desktopCategory || '').trim()===mainKey
      );
    });

    if(typeof renderMobileCategories === 'function')renderMobileCategories();
    if(typeof renderList === 'function')renderList();
    if(typeof updateMobileCategoryResult === 'function')updateMobileCategoryResult();
    if(categoryPreview){
      categoryPreview.dataset.category = mainKey;
      categoryPreview.dataset.subcategory = subKey;
    }
    renderDesktopCategoryPreview(mainKey);
    renderDesktopInlineInstitutions(
      desktopCategoryInstitutions(mainKey,subKey)
    );
  });

  categoryPreviewOpen?.addEventListener('click', ()=>{
    if(!categoryInlineResults)return;

    if(!categoryInlineResults.classList.contains('hidden')){
      hideDesktopInlineInstitutions();
      return;
    }

    const mainKey = String(categoryPreview?.dataset.category || '').trim();
    const subKey = String(categoryPreview?.dataset.subcategory || '').trim();
    renderDesktopInlineInstitutions(
      desktopCategoryInstitutions(mainKey,subKey)
    );
  });

  desktopLocationBtn?.addEventListener('click', event=>{
    event.preventDefault();
    event.stopPropagation();
    if(typeof setLocationPopover === 'function')setLocationPopover(true);
  });

  desktopSearchSubmitBtn?.addEventListener('click', ()=>{
    if(typeof renderList === 'function')renderList();
    resultsSection?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  searchInput?.addEventListener('keydown', event=>{
    if(event.key !== 'Enter')return;
    event.preventDefault();
    if(typeof renderList === 'function')renderList();
    resultsSection?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  document.querySelectorAll('[data-desktop-category]').forEach(button=>{
    button.addEventListener('click', ()=>{
      const key = String(button.dataset.desktopCategory || '').trim();
      selectDesktopCategory(key);
    });
  });

  const source = document.getElementById('locationBtnText');
  if(source && 'MutationObserver' in window){
    new MutationObserver(syncDesktopLocation).observe(source,{
      childList:true,
      subtree:true,
      characterData:true
    });
  }

  syncDesktopLocation();
})();

/* =========================================================
   YÖNETİM PANELİNDEN EKLENEN ÖZEL KATEGORİLER
   ========================================================= */
async function syncCustomCategoryTaxonomyFromSettings(){
  try{
    const snap=await db.collection("siteSettings").doc("home").get();
    const custom=snap.exists && snap.data()?.customCategoryTaxonomy && typeof snap.data().customCategoryTaxonomy==="object"
      ? snap.data().customCategoryTaxonomy
      : {};

    let changed=false;

    Object.entries(custom).forEach(([mainKey,main])=>{
      const key=String(mainKey||"").trim();
      const label=String(main?.label||"").trim();
      if(!key || !label)return;

      if(!categoryTaxonomy[key]){
        categoryTaxonomy[key]={label,subs:{}};
        changed=true;
      }else if(categoryTaxonomy[key].label!==label){
        categoryTaxonomy[key].label=label;
        changed=true;
      }

      const subs=main?.subs && typeof main.subs==="object" ? main.subs : {};
      Object.entries(subs).forEach(([subKey,subLabel])=>{
        const childKey=String(subKey||"").trim();
        const childLabel=String(subLabel||"").trim();
        if(!childKey || !childLabel)return;

        if(categoryTaxonomy[key].subs?.[childKey]!==childLabel){
          categoryTaxonomy[key].subs=categoryTaxonomy[key].subs||{};
          categoryTaxonomy[key].subs[childKey]=childLabel;
          changed=true;
        }
      });
    });

    if(!changed)return;

    if(typeof populateMainCategorySelect==="function"){
      populateMainCategorySelect("quoteCategory","Ana kategori seçin");
      populateMainCategorySelect("institutionCategory","Ana kategori seçin");
    }

    if(typeof renderSidebarCategories==="function")renderSidebarCategories();
    if(typeof renderMobileCategories==="function")renderMobileCategories();
    if(typeof renderList==="function")renderList();
    if(typeof updateMobileCategoryResult==="function")updateMobileCategoryResult();
  }catch(error){
    console.warn("Özel kategori tanımları yüklenemedi:",error);
  }
}

syncCustomCategoryTaxonomyFromSettings();

