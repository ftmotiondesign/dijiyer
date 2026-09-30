const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

const adminApp =
  firebase.apps.find(app => app.name === "adminPanel") ||
  firebase.initializeApp(firebaseConfig, "adminPanel");

const auth = adminApp.auth();
const db = adminApp.firestore();
const storage = adminApp.storage();

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");
const applicationsList = document.getElementById("applicationsList");
const applicationCount = document.getElementById("applicationCount");
const institutionsList = document.getElementById("institutionsList");
const institutionCount = document.getElementById("institutionCount");
const overviewSection = document.getElementById("overviewSection");
const applicationsSection = document.getElementById("applicationsSection");
const institutionsSection = document.getElementById("institutionsSection");
const quotesSection = document.getElementById("quotesSection");
const quoteRoutingSection = document.getElementById("quoteRoutingSection");
const offerReportSection = document.getElementById("offerReportSection");
const issuesSection = document.getElementById("issuesSection");
const accountsSection = document.getElementById("accountsSection");
const unmatchedSearchesSection = document.getElementById("unmatchedSearchesSection");
const overviewTabBtn = document.getElementById("overviewTabBtn");
const dailyStatsVisibilityToggle = document.getElementById("dailyStatsVisibilityToggle");
const dailyStatsVisibilityState = document.getElementById("dailyStatsVisibilityState");
const bottomQuoteVisibilityToggle = document.getElementById("bottomQuoteVisibilityToggle");
const bottomQuoteVisibilityState = document.getElementById("bottomQuoteVisibilityState");
const earningsVisibilityToggle = document.getElementById("earningsVisibilityToggle");
const earningsVisibilityState = document.getElementById("earningsVisibilityState");
const homeFooterVisibilityToggle = document.getElementById("homeFooterVisibilityToggle");
const homeFooterVisibilityState = document.getElementById("homeFooterVisibilityState");
const homeSectionEditModal = document.getElementById("homeSectionEditModal");
const homeSectionEditForm = document.getElementById("homeSectionEditForm");
const homeSectionEditKey = document.getElementById("homeSectionEditKey");
const homeSectionEditFields = document.getElementById("homeSectionEditFields");
const homeSectionEditTitle = document.getElementById("homeSectionEditTitle");
const homeSectionEditHelp = document.getElementById("homeSectionEditHelp");
const homeSectionEditMessage = document.getElementById("homeSectionEditMessage");

const applicationsTabBtn = document.getElementById("applicationsTabBtn");
const institutionsTabBtn = document.getElementById("institutionsTabBtn");
const quotesTabBtn = document.getElementById("quotesTabBtn");
const quoteRoutingTabBtn = document.getElementById("quoteRoutingTabBtn");
const offerReportTabBtn = document.getElementById("offerReportTabBtn");
const issuesTabBtn = document.getElementById("issuesTabBtn");
const accountsTabBtn = document.getElementById("accountsTabBtn");
const unmatchedSearchesTabBtn = document.getElementById("unmatchedSearchesTabBtn");
const institutionEditModal = document.getElementById("institutionEditModal");
const institutionSearch = document.getElementById("institutionSearch");
const institutionCategoryFilter = document.getElementById("institutionCategoryFilter");
const institutionCityFilter = document.getElementById("institutionCityFilter");
const institutionStatusFilter = document.getElementById("institutionStatusFilter");
const institutionFeatureFilter = document.getElementById("institutionFeatureFilter");
const institutionSort = document.getElementById("institutionSort");
const clearInstitutionFilters = document.getElementById("clearInstitutionFilters");
const institutionFilterResult = document.getElementById("institutionFilterResult");
const institutionStatTotal = document.getElementById("institutionStatTotal");
const institutionStatActive = document.getElementById("institutionStatActive");
const institutionStatPassive = document.getElementById("institutionStatPassive");
const institutionStatOffer = document.getElementById("institutionStatOffer");
const institutionStatVip = document.getElementById("institutionStatVip");
const institutionStatVideo = document.getElementById("institutionStatVideo");
const institutionStatAdActive = document.getElementById("institutionStatAdActive");
const institutionStatAdNone = document.getElementById("institutionStatAdNone");
const institutionStatAdExpiring = document.getElementById("institutionStatAdExpiring");
const institutionStatAdPayment = document.getElementById("institutionStatAdPayment");

const quoteRequestsList = document.getElementById("quoteRequestsList");
const quoteRequestCount = document.getElementById("quoteRequestCount");
const quoteRequestSearch = document.getElementById("quoteRequestSearch");
const quoteStatusFilter = document.getElementById("quoteStatusFilter");
const quotePeriodFilter = document.getElementById("quotePeriodFilter");
const quoteSort = document.getElementById("quoteSort");
const quoteClearFilters = document.getElementById("quoteClearFilters");
const quoteRefreshBtn = document.getElementById("quoteRefreshBtn");
const quoteFilterResult = document.getElementById("quoteFilterResult");
const quoteKpiTotal = document.getElementById("quoteKpiTotal");
const quoteKpiWaiting = document.getElementById("quoteKpiWaiting");
const quoteKpiOffered = document.getElementById("quoteKpiOffered");
const quoteKpiLocked = document.getElementById("quoteKpiLocked");
const quoteKpiDone = document.getElementById("quoteKpiDone");
const quoteKpiIssue = document.getElementById("quoteKpiIssue");
const quoteRoutingTabCount = document.getElementById("quoteRoutingTabCount");
const quoteRoutingMainCount = document.getElementById("quoteRoutingMainCount");
const quoteRoutingMainBtn = document.querySelector('[data-admin-main="unanswered"]');
const quoteRoutingWaitingCount = document.getElementById("quoteRoutingWaitingCount");
const quoteRoutingVipCount = document.getElementById("quoteRoutingVipCount");
const quoteRoutingAdCount = document.getElementById("quoteRoutingAdCount");
const quoteRoutingForwardedCount = document.getElementById("quoteRoutingForwardedCount");
const quoteRoutingRespondedCount = document.getElementById("quoteRoutingRespondedCount");
const quoteRoutingStatusFilter = document.getElementById("quoteRoutingStatusFilter");
const quoteRoutingWaitMinutes = document.getElementById("quoteRoutingWaitMinutes");
const quoteRoutingAreaMode = document.getElementById("quoteRoutingAreaMode");
const quoteRoutingSearch = document.getElementById("quoteRoutingSearch");
const quoteRoutingRefreshBtn = document.getElementById("quoteRoutingRefreshBtn");
const quoteRoutingList = document.getElementById("quoteRoutingList");
const quoteRoutingListCount = document.getElementById("quoteRoutingListCount");
const leadPackageSaveBtn = document.getElementById("leadPackageSaveBtn");
const leadPriceSingle = document.getElementById("leadPriceSingle");
const leadPrice10 = document.getElementById("leadPrice10");
const leadPrice25 = document.getElementById("leadPrice25");
const leadPrice50 = document.getElementById("leadPrice50");
const leadPackageMessage = document.getElementById("leadPackageMessage");
const leadCreditBalanceTotal = document.getElementById("leadCreditBalanceTotal");
const leadCreditUsedTotal = document.getElementById("leadCreditUsedTotal");
const leadCreditLoadedTotal = document.getElementById("leadCreditLoadedTotal");
const leadCreditUsedSummary = document.getElementById("leadCreditUsedSummary");
const leadCreditBalanceSummary = document.getElementById("leadCreditBalanceSummary");
const leadCreditDebtCount = document.getElementById("leadCreditDebtCount");
const leadCreditRefreshBtn = document.getElementById("leadCreditRefreshBtn");
const leadCreditSearch = document.getElementById("leadCreditSearch");
const leadCreditStatusFilter = document.getElementById("leadCreditStatusFilter");
const leadCreditTableBody = document.getElementById("leadCreditTableBody");
const leadCreditLedgerList = document.getElementById("leadCreditLedgerList");
const leadCreditModal = document.getElementById("leadCreditModal");
const leadCreditModalInstitution = document.getElementById("leadCreditModalInstitution");
const leadCreditModalBalance = document.getElementById("leadCreditModalBalance");
const leadCreditInstitutionId = document.getElementById("leadCreditInstitutionId");
const leadCreditAction = document.getElementById("leadCreditAction");
const leadCreditAmount = document.getElementById("leadCreditAmount");
const leadCreditNote = document.getElementById("leadCreditNote");
const leadCreditModalMessage = document.getElementById("leadCreditModalMessage");
const leadCreditModalSaveBtn = document.getElementById("leadCreditModalSaveBtn");
const leadCreditModalCloseBtn = document.getElementById("leadCreditModalCloseBtn");
const leadCreditModalCancelBtn = document.getElementById("leadCreditModalCancelBtn");

const offerReportCount = document.getElementById("offerReportCount");
const offerReportInstitutionCount = document.getElementById("offerReportInstitutionCount");
const offerReportTotalOffers = document.getElementById("offerReportTotalOffers");
const offerReportAveragePrice = document.getElementById("offerReportAveragePrice");
const offerReportTotalVolume = document.getElementById("offerReportTotalVolume");
const offerReportActiveCount = document.getElementById("offerReportActiveCount");
const offerReportLockedCount = document.getElementById("offerReportLockedCount");
const offerReportUsedCount = document.getElementById("offerReportUsedCount");
const offerReportSelectionRate = document.getElementById("offerReportSelectionRate");
const offerReportSearch = document.getElementById("offerReportSearch");
const offerReportPeriod = document.getElementById("offerReportPeriod");
const offerReportCategory = document.getElementById("offerReportCategory");
const offerReportCity = document.getElementById("offerReportCity");
const offerReportSort = document.getElementById("offerReportSort");
const offerReportExportBtn = document.getElementById("offerReportExportBtn");
const offerReportTableBody = document.getElementById("offerReportTableBody");

const offerReportDetailModal = document.getElementById("offerReportDetailModal");
const closeOfferReportDetailModal = document.getElementById("closeOfferReportDetailModal");
const offerReportDetailTitle = document.getElementById("offerReportDetailTitle");
const offerReportDetailMeta = document.getElementById("offerReportDetailMeta");
const offerReportDetailSummary = document.getElementById("offerReportDetailSummary");
const offerReportDetailTableBody = document.getElementById("offerReportDetailTableBody");
const quoteActivityModal = document.getElementById("quoteActivityModal");
const closeQuoteActivityModal = document.getElementById("closeQuoteActivityModal");
const quoteActivityTitle = document.getElementById("quoteActivityTitle");
const quoteActivityMeta = document.getElementById("quoteActivityMeta");
const quoteActivitySummary = document.getElementById("quoteActivitySummary");
const quoteActivityFilter = document.getElementById("quoteActivityFilter");
const quoteActivityCopyBtn = document.getElementById("quoteActivityCopyBtn");
const quoteActivityCsvBtn = document.getElementById("quoteActivityCsvBtn");
const quoteActivityRefreshBtn = document.getElementById("quoteActivityRefreshBtn");
const quoteActivityCompleteness = document.getElementById("quoteActivityCompleteness");
const quoteActivityTimeline = document.getElementById("quoteActivityTimeline");
const quoteCompareModal = document.getElementById("quoteCompareModal");
const closeQuoteCompareModal = document.getElementById("closeQuoteCompareModal");
const quoteCompareTitle = document.getElementById("quoteCompareTitle");
const quoteCompareMeta = document.getElementById("quoteCompareMeta");
const quoteCompareHighlights = document.getElementById("quoteCompareHighlights");
const quoteCompareTableBody = document.getElementById("quoteCompareTableBody");
const quoteDetailModal = document.getElementById("quoteDetailModal");
const closeQuoteDetailModal = document.getElementById("closeQuoteDetailModal");
const quoteDetailTitle = document.getElementById("quoteDetailTitle");
const quoteDetailMeta = document.getElementById("quoteDetailMeta");
const quoteDetailBody = document.getElementById("quoteDetailBody");

const accountsList = document.getElementById("accountsList");
const accountCount = document.getElementById("accountCount");
const unmatchedSearchesList = document.getElementById("unmatchedSearchesList");
const unmatchedSearchesCount = document.getElementById("unmatchedSearchesCount");
const unmatchedSearchesTabCount = document.getElementById("unmatchedSearchesTabCount");
const unmatchedSearchQuery = document.getElementById("unmatchedSearchQuery");
const unmatchedSearchStatusFilter = document.getElementById("unmatchedSearchStatusFilter");
const unmatchedSearchReasonFilter = document.getElementById("unmatchedSearchReasonFilter");
const unmatchedSearchesRefreshBtn = document.getElementById("unmatchedSearchesRefreshBtn");
const unmatchedSearchTotal = document.getElementById("unmatchedSearchTotal");
const unmatchedSearchNew = document.getElementById("unmatchedSearchNew");
const unmatchedSearchCategoryMissing = document.getElementById("unmatchedSearchCategoryMissing");
const unmatchedSearchNoInstitution = document.getElementById("unmatchedSearchNoInstitution");

const overviewInstitutionCount = document.getElementById("overviewInstitutionCount");
const overviewPendingApplications = document.getElementById("overviewPendingApplications");
const overviewQuoteCount = document.getElementById("overviewQuoteCount");
const overviewNoOfferCount = document.getElementById("overviewNoOfferCount");
const overviewOfferCount = document.getElementById("overviewOfferCount");
const overviewLockedCount = document.getElementById("overviewLockedCount");
const overviewUsedCount = document.getElementById("overviewUsedCount");
const overviewIssueCount = document.getElementById("overviewIssueCount");
const overviewAttentionCount = document.getElementById("overviewAttentionCount");
const overviewAttentionList = document.getElementById("overviewAttentionList");
const overviewRecentActivity = document.getElementById("overviewRecentActivity");
const overviewCategoryTableBody = document.getElementById("overviewCategoryTableBody");
const overviewCityList = document.getElementById("overviewCityList");
const overviewRefreshBtn = document.getElementById("overviewRefreshBtn");

const issueSearch = document.getElementById("issueSearch");
const issueStatusFilter = document.getElementById("issueStatusFilter");
const issueDecisionFilter = document.getElementById("issueDecisionFilter");
const issueCount = document.getElementById("issueCount");
const issueTabCount = document.getElementById("issueTabCount");
const issueKpiTotal = document.getElementById("issueKpiTotal");
const issueKpiNew = document.getElementById("issueKpiNew");
const issueKpiReviewing = document.getElementById("issueKpiReviewing");
const issueKpiBusiness = document.getElementById("issueKpiBusiness");
const issueKpiCustomer = document.getElementById("issueKpiCustomer");
const issueKpiResolved = document.getElementById("issueKpiResolved");
const issuesList = document.getElementById("issuesList");

const adminSubtabs = document.getElementById("adminSubtabs");
const adminCurrentSection = document.getElementById("adminCurrentSection");
const adminCurrentHint = document.getElementById("adminCurrentHint");
const adminBackOverview = document.getElementById("adminBackOverview");
const adCenterPersistentHub = document.getElementById("adCenterPersistentHub");
const quickQuoteCount = document.getElementById("quickQuoteCount");
const quickApplicationCount = document.getElementById("quickApplicationCount");
const quickIssueCount = document.getElementById("quickIssueCount");
const quickSupportCount = document.getElementById("quickSupportCount");

const ADMIN_TAB_META = {
  overviewTabBtn:["overview","Genel Bakış","Bugün ilgilenmeniz gereken konuları ve temel rakamları görün."],
  quotesTabBtn:["quotes","Teklif Talepleri","Müşteri taleplerini, gelen teklifleri ve tüm teklif hareketlerini yönetin."],
  quoteRoutingTabBtn:["unanswered","Yanıtsız Teklifler","Cevapsız kalan özel talepleri uygun kurumlara yönlendirerek teklif kredisi ve kurum öncelik modeliyle gelir fırsatına dönüştürün."],
  issuesTabBtn:["quotes","Sorun Çözüm Merkezi","Müşteri ve firma beyanlarını kilitli teklif kayıtlarıyla birlikte tarafsız inceleyin."],
  offerReportTabBtn:["quotes","Teklif Raporu","Kurumların teklif performansını ve teklif sonuçlarını inceleyin."],
  institutionsTabBtn:["institutions","Kurumlar","Yayındaki kurumları arayın, düzenleyin ve teklif durumlarını yönetin."],
  applicationsTabBtn:["institutions","Kurum Başvuruları","Yeni kurum başvurularını inceleyip onaylayın veya reddedin."],
  accountsTabBtn:["institutions","Kurum Hesapları","Kurum paneline erişim isteyen hesapları yönetin."],
  unmatchedSearchesTabBtn:["institutions","Bulunamayan Aramalar","Kullanıcıların bulamadığı hizmetleri inceleyin; yeni alt kategori ve kurum ihtiyacını gerçek aramalardan görün."],
  businessOpportunitiesTabBtn:["business","İş & Ticaret Fırsatları","İhaleleri, tedarik taleplerini, toplu alımları, bayilikleri ve diğer ticari fırsatları yönetin."],
  bannerAdsTabBtn:["ads","Reklam Merkezi","Banner ve sponsorlu yayın alanlarını yönetin."],
  opportunitySponsorsTabBtn:["ads","KEŞFET / FIRSAT","Keşfet ve Fırsatlar ekranlarında sponsorlu görünecek kurumları, gösterim yerlerini ve mobil medyalarını yönetin."],
  mediaArchiveTabBtn:["ads","Medya Arşivi","Fırsat ve banner medyalarını, kullanım durumlarını ve temizleme işlemlerini yönetin."],
  externalAdsTabBtn:["ads","Site / Affiliate Reklamları","Harici marka ve affiliate reklamlarını seçtiğiniz Dijiyer sayfalarında yayınlayın."],
  promotionOrdersTabBtn:["ads","Siparişler","Kurumların tanıtım ve reklam siparişlerini fiyatlandırın, ödeme ve yayın sürecini yönetin."],
  promotionPackagesTabBtn:["ads","Paketler","Kurumlara sunulan reklam ve tanıtım paketlerini oluşturun ve fiyatlandırın."],
  vipInstitutionsTabBtn:["ads","VIP Kurumlar","VIP, VIP Plus ve VIP Premium üyeliklerini; fiyat, süre ve kurum atamalarıyla yönetin."],
  adCalendarTabBtn:["ads","Reklam Takvimi","Yayın tarihlerini, dolulukları ve yaklaşan reklam bitişlerini görün."],
  adRevenueTabBtn:["ads","Gelir Raporu","Reklam gelirini, tahsilatı, performansı ve yenileme fırsatlarını izleyin."],
  supportTabBtn:["support","Destek Merkezi","Kurumların destek taleplerini takip edin ve yanıtlayın."],
  announcementsTabBtn:["support","Duyurular","Kurumlara yönetim duyuruları gönderin."],
  systemTabBtn:["system","Sistem","Sistem kontrollerini, ayarları ve yönetim işlem geçmişini görüntüleyin."]
};

function syncSimpleAdminNavigation(tabId){
  const meta=ADMIN_TAB_META[tabId] || ADMIN_TAB_META.overviewTabBtn;
  const group=meta[0];

  document.querySelectorAll("[data-admin-main]").forEach(button=>{
    button.classList.toggle("active",button.dataset.adminMain===group);
  });

  document.querySelectorAll("#adminSubtabs .admin-tab").forEach(button=>{
    const visible=button.dataset.adminGroup===group;
    button.hidden=!visible;
  });

  const visibleSubtabs=[...document.querySelectorAll("#adminSubtabs .admin-tab")]
    .filter(button=>!button.hidden);

  if(adminSubtabs){
    adminSubtabs.classList.toggle(
      "single-or-hidden",
      group==="overview" || group==="system" || visibleSubtabs.length<=1
    );
  }

  if(adminCurrentSection)adminCurrentSection.textContent=meta[1];
  if(adminCurrentHint)adminCurrentHint.textContent=meta[2];
  if(adminBackOverview)adminBackOverview.hidden=group==="overview";
  if(adCenterPersistentHub)adCenterPersistentHub.hidden=group!=="ads";

  localStorage.setItem("dijiyerAdminLastTab",tabId);
}

function openSimpleAdminTab(tabId){
  const button=document.getElementById(tabId);
  if(button)button.click();
}

function initSimpleAdminNavigation(){
  document.querySelectorAll("[data-admin-main]").forEach(button=>{
    button.addEventListener("click",()=>{
      const map={
        overview:"overviewTabBtn",
        quotes:"quotesTabBtn",
        unanswered:"quoteRoutingTabBtn",
        institutions:"institutionsTabBtn",
        business:"businessOpportunitiesTabBtn",
        ads:"bannerAdsTabBtn",
        support:"supportTabBtn",
        system:"systemTabBtn"
      };
      openSimpleAdminTab(map[button.dataset.adminMain] || "overviewTabBtn");
    });
  });

  Object.keys(ADMIN_TAB_META).forEach(tabId=>{
    document.getElementById(tabId)?.addEventListener("click",()=>{
      syncSimpleAdminNavigation(tabId);
    });
  });

  document.querySelectorAll("[data-admin-open]").forEach(button=>{
    button.addEventListener("click",()=>{
      const map={
        quotes:"quotesTabBtn",
        unanswered:"quoteRoutingTabBtn",
        applications:"applicationsTabBtn",
        issues:"issuesTabBtn",
        promotionOrders:"promotionOrdersTabBtn",
        support:"supportTabBtn"
      };
      openSimpleAdminTab(map[button.dataset.adminOpen]);
    });
  });

  adminBackOverview?.addEventListener("click",()=>openSimpleAdminTab("overviewTabBtn"));
  syncSimpleAdminNavigation("overviewTabBtn");
}

function restoreSimpleAdminNavigation(){
  const saved=localStorage.getItem("dijiyerAdminLastTab");
  if(saved && ADMIN_TAB_META[saved] && document.getElementById(saved)){
    document.getElementById(saved).click();
  }else{
    syncSimpleAdminNavigation("overviewTabBtn");
  }
}

initSimpleAdminNavigation();

const ADMIN_UID = "Et5cFLiQNtgMdQcWIAcaQIOpQBe2";

let applicationRecords = [];
let institutionRecords = [];
let quoteRequestRecords = [];
let leadCreditAccountRecords = [];
let leadCreditLedgerRecords = [];
let institutionAccountRecords = [];
let unmatchedSearchRecords = [];
let institutionOfferReportRecords = [];
let institutionOfferReportEvents = [];
const adminQuoteActivityCache = new Map();
let activeAdminActivityQuoteId = null;

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  loginMessage.textContent = "Giriş yapılıyor...";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginMessage.textContent = "";
  } catch (error) {
    console.error(error);
    loginMessage.textContent = "E-posta veya şifre hatalı.";
  }
});

function paintDailyStatsVisibilityState(visible){
  if(dailyStatsVisibilityToggle){
    dailyStatsVisibilityToggle.checked=Boolean(visible);
  }

  if(dailyStatsVisibilityState){
    dailyStatsVisibilityState.textContent=visible
      ? "Aktif · Görünüyor"
      : "Pasif · Gizli";

    dailyStatsVisibilityState.classList.toggle("active",Boolean(visible));
    dailyStatsVisibilityState.classList.toggle("passive",!visible);
  }
}

async function loadDailyStatsVisibilitySetting(){
  try{
    const snap=await db.collection("siteSettings").doc("home").get();
    const visible=snap.exists && snap.data()?.dailyStatsVisible === true;
    paintDailyStatsVisibilityState(visible);
  }catch(error){
    console.error("Günlük istatistik görünürlük ayarı okunamadı:",error);
    paintDailyStatsVisibilityState(false);
  }
}

async function saveDailyStatsVisibilitySetting(visible){
  if(dailyStatsVisibilityToggle) dailyStatsVisibilityToggle.disabled=true;

  try{
    await db.collection("siteSettings").doc("home").set({
      dailyStatsVisible:Boolean(visible),
      updatedAt:new Date().toISOString()
    },{merge:true});

    paintDailyStatsVisibilityState(Boolean(visible));
  }catch(error){
    console.error("Günlük istatistik görünürlük ayarı kaydedilemedi:",error);
    paintDailyStatsVisibilityState(!visible);
    alert("Günlük istatistik görünürlük ayarı kaydedilemedi. Firestore Rules ayarını kontrol edin.");
  }finally{
    if(dailyStatsVisibilityToggle) dailyStatsVisibilityToggle.disabled=false;
  }
}

dailyStatsVisibilityToggle?.addEventListener("change",()=>{
  saveDailyStatsVisibilitySetting(dailyStatsVisibilityToggle.checked);
});

function paintHomeSectionVisibility(toggle,state,visible){
  if(toggle) toggle.checked=Boolean(visible);
  if(state){
    state.textContent=visible ? "Aktif · Görünüyor" : "Pasif · Gizli";
    state.classList.toggle("active",Boolean(visible));
    state.classList.toggle("passive",!visible);
  }
}

async function loadHomeBottomVisibilitySettings(){
  try{
    const snap=await db.collection("siteSettings").doc("home").get();
    const data=snap.exists ? (snap.data() || {}) : {};

    // Eski kurulumlarda alan yoksa mevcut görünüm bozulmasın: varsayılan aktif.
    paintHomeSectionVisibility(
      bottomQuoteVisibilityToggle,
      bottomQuoteVisibilityState,
      data.bottomQuoteVisible !== false
    );
    paintHomeSectionVisibility(
      earningsVisibilityToggle,
      earningsVisibilityState,
      data.earningsVisible === true
    );
    paintHomeSectionVisibility(
      homeFooterVisibilityToggle,
      homeFooterVisibilityState,
      data.homeFooterVisible === true
    );
  }catch(error){
    console.error("Ana sayfa alt bölüm görünürlük ayarları okunamadı:",error);
    paintHomeSectionVisibility(bottomQuoteVisibilityToggle,bottomQuoteVisibilityState,true);
    paintHomeSectionVisibility(earningsVisibilityToggle,earningsVisibilityState,false);
    paintHomeSectionVisibility(homeFooterVisibilityToggle,homeFooterVisibilityState,false);
  }
}

async function saveHomeSectionVisibilitySetting(field,toggle,state,visible){
  if(toggle) toggle.disabled=true;
  try{
    await db.collection("siteSettings").doc("home").set({
      [field]:Boolean(visible),
      updatedAt:new Date().toISOString()
    },{merge:true});

    paintHomeSectionVisibility(toggle,state,Boolean(visible));
  }catch(error){
    console.error("Ana sayfa bölüm görünürlük ayarı kaydedilemedi:",field,error);
    paintHomeSectionVisibility(toggle,state,!visible);
    alert("Görünürlük ayarı kaydedilemedi. Firestore Rules ayarını kontrol edin.");
  }finally{
    if(toggle) toggle.disabled=false;
  }
}

bottomQuoteVisibilityToggle?.addEventListener("change",()=>{
  saveHomeSectionVisibilitySetting(
    "bottomQuoteVisible",
    bottomQuoteVisibilityToggle,
    bottomQuoteVisibilityState,
    bottomQuoteVisibilityToggle.checked
  );
});

earningsVisibilityToggle?.addEventListener("change",()=>{
  saveHomeSectionVisibilitySetting(
    "earningsVisible",
    earningsVisibilityToggle,
    earningsVisibilityState,
    earningsVisibilityToggle.checked
  );
});

homeFooterVisibilityToggle?.addEventListener("change",()=>{
  saveHomeSectionVisibilitySetting(
    "homeFooterVisible",
    homeFooterVisibilityToggle,
    homeFooterVisibilityState,
    homeFooterVisibilityToggle.checked
  );
});


const HOME_SECTION_EDITOR_CONFIG = {
  dailyStats:{
    title:'“Bugün Dijiyer’de” Alanı',
    help:'Günlük istatistik kutusundaki başlık ve açıklamaları düzenleyin.',
    storageField:'dailyStatsContent',
    fields:[
      {key:'eyebrow',label:'Üst Başlık',default:"BUGÜN DİJİYER'DE"},
      {key:'title',label:'Ana Başlık',default:'Günlük teklif hareketleri'},
      {key:'liveLabel',label:'Canlı Etiketi',default:'Canlı'},
      {key:'requestLabel',label:'Teklif İstendi Yazısı',default:'Teklif İstendi'},
      {key:'offerLabel',label:'Teklif Verildi Yazısı',default:'Teklif Verildi'},
      {key:'acceptedLabel',label:'Kabul Edildi Yazısı',default:'Kabul Edildi'},
      {key:'topLabel',label:'En Çok Teklif Alınan Yazısı',default:'En Çok Teklif Alınan'}
    ]
  },
  bottomQuote:{
    title:'Alt Teklif / İşletme Alanı',
    help:'İşletme çağrı alanındaki metinleri, faydaları, butonları ve bağlantıları düzenleyin.',
    storageField:'bottomQuoteContent',
    fields:[
      {key:'kicker',label:'Üst Başlık',default:'İŞLETMELER İÇİN'},
      {key:'title',label:'Ana Başlık',default:'Yeni müşteriler seni arasın, sen teklifini ver.',full:true},
      {key:'description',label:'Açıklama',default:"İşletmeni Dijiyer'e ücretsiz ekle. Bölgen ve sektörünle eşleşen talepleri gör, teklif ver ve kurum panelinden süreci takip et.",type:'textarea',full:true},
      {key:'benefits',label:'Avantajlar · Her satıra bir madde',default:'Üyelik ücretsiz\nTeklif vermek ücretsiz\nAylık zorunlu ücret yok\nKazandığın işten %0 komisyon',type:'textarea',full:true},
      {key:'primaryLabel',label:'1. Buton Yazısı',default:'İşletmeni Ücretsiz Ekle'},
      {key:'primaryUrl',label:'1. Buton Linki',default:'',type:'url',note:'Boşsa mevcut İşletme Ekle penceresi açılır.'},
      {key:'secondaryLabel',label:'2. Buton Yazısı',default:'Kurum Paneline Gir'},
      {key:'secondaryUrl',label:'2. Buton Linki',default:'',type:'url',note:'Boşsa mevcut Kurum Paneli açılır.'},
      {key:'cardLabel',label:'Sağ Kart Üst Başlık',default:'İŞLETME MALİYETİ'},
      {key:'cardValue',label:'Sağ Kart Büyük Değer',default:'0 TL'},
      {key:'cardDescription',label:'Sağ Kart Açıklaması',default:'Başlangıçta kayıt ücreti, teklif verme ücreti veya satış komisyonu yok.',type:'textarea',full:true},
      {key:'cardItems',label:'Sağ Kart Maddeleri · Değer|Açıklama',default:'Ücretsiz|Kurum profili\nÜcretsiz|Teklif verme\n%0|İş / satış komisyonu',type:'textarea',full:true}
    ]
  },
  earnings:{
    title:'Dijiyer Kazanç Alanı',
    help:'Kazanç kartının başlıklarını ve butonlarını düzenleyin. Link boşsa mevcut pilot pencere açılır.',
    storageField:'earningsContent',
    fields:[
      {key:'sectionEyebrow',label:'Bölüm Üst Başlık',default:'DAHA FAZLA'},
      {key:'sectionTitle',label:'Bölüm Başlığı',default:'Dijiyer Kazanç'},
      {key:'sectionSubtitle',label:'Bölüm Alt Yazısı',default:'Pilot özellik · detayları geliştirme aşamasında',full:true},
      {key:'kicker',label:'Kart Üst Başlık',default:'DİJİYER KAZANÇ'},
      {key:'badge',label:'Kart Etiketi',default:'PİLOT'},
      {key:'title',label:'Kart Ana Başlığı',default:'İşletme tavsiye et, kazanç fırsatı yakala',full:true},
      {key:'description',label:'Kart Açıklaması',default:'Davet ettiğin işletme ilk ücretli Dijiyer hizmetini onayladığında Dijiyer bakiyesi kazan.',type:'textarea',full:true},
      {key:'primaryLabel',label:'1. Buton Yazısı',default:'İşletme Davet Et'},
      {key:'primaryUrl',label:'1. Buton Linki',default:'',type:'url',note:'Boşsa davet penceresi açılır.'},
      {key:'secondaryLabel',label:'2. Buton Yazısı',default:'Kazancım'},
      {key:'secondaryUrl',label:'2. Buton Linki',default:'',type:'url',note:'Boşsa kazanç penceresi açılır.'}
    ]
  },
  homeFooter:{
    title:'Yerel İşletmeler ve Müşteriler Alt Bölümü',
    help:'Alt bölümdeki marka yazılarını, açıklamayı ve üç bağlantıyı düzenleyin.',
    storageField:'homeFooterContent',
    fields:[
      {key:'brandTitle',label:'Marka Adı',default:'Dijiyer'},
      {key:'brandTagline',label:'Marka Sloganı',default:'Bul. Karşılaştır. Teklif Al.'},
      {key:'title',label:'Ana Başlık',default:'Yerel işletmeler ve müşteriler tek yerde.',full:true},
      {key:'description',label:'Açıklama',default:'Ücretsiz teklif al, ücretsiz teklif ver, komisyonsuz ilerle.',type:'textarea',full:true},
      {key:'primaryLabel',label:'1. Buton Yazısı',default:'Teklif Al'},
      {key:'primaryUrl',label:'1. Buton Linki',default:'',type:'url',note:'Boşsa teklif penceresi açılır.'},
      {key:'secondaryLabel',label:'2. Buton Yazısı',default:'İşletme Ekle'},
      {key:'secondaryUrl',label:'2. Buton Linki',default:'',type:'url',note:'Boşsa İşletme Ekle penceresi açılır.'},
      {key:'thirdLabel',label:'3. Link Yazısı',default:'Kurumları İncele'},
      {key:'thirdUrl',label:'3. Link Adresi',default:'#resultsSection',type:'url'}
    ]
  }
};

function homeSectionEditorFieldHtml(field,value){
  const type=field.type || 'text';
  const safeValue=String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const safeLabel=String(field.label||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const note=field.note ? '<span class="home-section-editor-field-note">'+String(field.note).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>' : '';
  if(type==='textarea'){
    return '<label class="'+(field.full?'full':'')+'">'+safeLabel+
      '<textarea data-home-content-field="'+field.key+'">'+safeValue+'</textarea>'+note+'</label>';
  }
  const inputType=type==='url' ? 'text' : type;
  const linkAttrs=type==='url' ? ' inputmode="url" autocomplete="off" placeholder="Örn: teklif-al.html veya https://..."' : '';
  return '<label class="'+(field.full?'full':'')+'">'+safeLabel+
    '<input type="'+inputType+'"'+linkAttrs+' data-home-content-field="'+field.key+'" value="'+safeValue+'">'+note+'</label>';
}

async function openHomeSectionEditor(sectionKey){
  const config=HOME_SECTION_EDITOR_CONFIG[sectionKey];
  if(!config || !homeSectionEditModal || !homeSectionEditFields)return;

  if(homeSectionEditKey)homeSectionEditKey.value=sectionKey;
  if(homeSectionEditTitle)homeSectionEditTitle.textContent=config.title;
  if(homeSectionEditHelp)homeSectionEditHelp.textContent=config.help;
  if(homeSectionEditMessage){
    homeSectionEditMessage.textContent='';
    homeSectionEditMessage.classList.remove('error');
  }

  let saved={};
  try{
    const snap=await db.collection("siteSettings").doc("home").get();
    saved=snap.exists ? (snap.data()?.[config.storageField] || {}) : {};
  }catch(error){
    console.warn('Bölüm içeriği okunamadı:',sectionKey,error);
  }

  homeSectionEditFields.innerHTML=config.fields.map(field=>
    homeSectionEditorFieldHtml(field,Object.prototype.hasOwnProperty.call(saved,field.key) ? saved[field.key] : field.default)
  ).join('');

  homeSectionEditModal.classList.remove('hidden');
}

document.querySelectorAll('[data-home-section-edit]').forEach(button=>{
  button.addEventListener('click',()=>{
    openHomeSectionEditor(button.dataset.homeSectionEdit);
  });
});

document.getElementById('closeHomeSectionEditModal')?.addEventListener('click',()=>{
  homeSectionEditModal?.classList.add('hidden');
});

homeSectionEditModal?.addEventListener('click',event=>{
  if(event.target===homeSectionEditModal)homeSectionEditModal.classList.add('hidden');
});

document.getElementById('homeSectionEditReset')?.addEventListener('click',()=>{
  const key=homeSectionEditKey?.value;
  const config=HOME_SECTION_EDITOR_CONFIG[key];
  if(!config || !homeSectionEditFields)return;
  homeSectionEditFields.innerHTML=config.fields.map(field=>homeSectionEditorFieldHtml(field,field.default)).join('');
  if(homeSectionEditMessage){
    homeSectionEditMessage.textContent='Varsayılan değerler forma getirildi. Kaydettiğinizde uygulanır.';
    homeSectionEditMessage.classList.remove('error');
  }
});

homeSectionEditForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const key=homeSectionEditKey?.value;
  const config=HOME_SECTION_EDITOR_CONFIG[key];
  if(!config || !homeSectionEditFields)return;

  const values={};
  config.fields.forEach(field=>{
    const input=homeSectionEditFields.querySelector('[data-home-content-field="'+field.key+'"]');
    values[field.key]=String(input?.value ?? '').trim();
  });

  const saveButton=document.getElementById('homeSectionEditSave');
  if(saveButton)saveButton.disabled=true;
  if(homeSectionEditMessage){
    homeSectionEditMessage.textContent='Kaydediliyor...';
    homeSectionEditMessage.classList.remove('error');
  }

  try{
    await db.collection("siteSettings").doc("home").set({
      [config.storageField]:values,
      updatedAt:new Date().toISOString()
    },{merge:true});
    if(homeSectionEditMessage)homeSectionEditMessage.textContent='Kaydedildi. Ana sayfaya otomatik yansıyacak.';
  }catch(error){
    console.error('Bölüm içeriği kaydedilemedi:',key,error);
    if(homeSectionEditMessage){
      homeSectionEditMessage.textContent='Kaydedilemedi. Firestore Rules ayarını kontrol edin.';
      homeSectionEditMessage.classList.add('error');
    }
  }finally{
    if(saveButton)saveButton.disabled=false;
  }
});

auth.onAuthStateChanged(async (user) => {
  if (user && user.uid === ADMIN_UID) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;

    await loadAdminAdRateSettings();
    await loadApplications();
    await loadInstitutions();
    await loadQuoteRequests();
    await loadInstitutionAccounts();
    await loadUnmatchedSearches(true);
    await loadDailyStatsVisibilitySetting();
    await loadHomeBottomVisibilitySettings();
    refreshAdminOverview();
    renderIssueCenter();
    setTimeout(restoreSimpleAdminNavigation, 120);
  } else {
    if (user && user.uid !== ADMIN_UID) {
      loginMessage.textContent = "Bu hesap yönetici hesabı değil.";
    }

    loginSection.hidden = false;
    dashboardSection.hidden = true;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await auth.signOut();
});

async function loadApplications() {
  applicationsList.innerHTML = "Başvurular yükleniyor...";

  try {
    const snapshot = await db
      .collection("institutionApplications")
      .orderBy("date", "desc")
      .get();

    applicationRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshAdminOverview();

    applicationCount.textContent =
      `${snapshot.size} kurum başvurusu`;

    if (snapshot.empty) {
      applicationsList.innerHTML =
        "<p>Henüz kurum başvurusu bulunmuyor.</p>";
      return;
    }

    applicationsList.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      const card = document.createElement("div");
      card.className = "application-card";

      card.innerHTML = `
        <div class="application-top">
          <div>
            <h3>${escapeHtml(data.name || "-")}</h3>
            <span>${escapeHtml(data.category || "-")}</span>
          </div>
        </div>

        <div class="application-info">
          <p><strong>Konum:</strong>
          ${escapeHtml(data.city || "-")} /
          ${escapeHtml(data.district || "-")}</p>

          <p><strong>Adres:</strong>
          ${escapeHtml(data.address || "-")}</p>

          <p><strong>Telefon:</strong>
          ${escapeHtml(data.phone || "-")}</p>

          <p><strong>Web / Instagram:</strong>
          ${escapeHtml(data.website || "-")}</p>

          <p><strong>Başvuru Tarihi:</strong>
          ${formatDate(data.date)}</p>
        </div>
        <div class="application-actions">
  <button class="approve-btn" data-id="${doc.id}">
    ✓ Onayla
  </button>

  <button class="reject-btn" data-id="${doc.id}">
    ✕ Reddet
  </button>

  <button class="delete-btn" data-id="${doc.id}">
    🗑 Sil
  </button>
</div>
      `;

      applicationsList.appendChild(card);

      card.querySelector(".approve-btn").addEventListener("click", () => {
        approveApplication(doc.id, data);
      });

      card.querySelector(".reject-btn").addEventListener("click", () => {
        rejectApplication(doc.id);
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteApplication(doc.id);
      });
    });

  } catch (error) {
    console.error("Başvurular yüklenemedi:", error);

    applicationsList.innerHTML =
      "<p>Başvurular yüklenemedi. Yetkinizi kontrol edin.</p>";
  }
}

async function approveApplication(id, data) {
  const ok = confirm("Bu kurumu onaylamak istiyor musunuz?");
  if (!ok) return;

  try {
    const institution = {
      name: data.name || "",
      category: data.category || "",
      city: data.city || "",
      district: data.district || "",
      location: [data.city, data.district].filter(Boolean).join(", "),
      address: data.address || "",
      phone: data.phone || "",
      website: data.website || "",
      lat: Number.isFinite(data.lat) ? data.lat : null,
      lng: Number.isFinite(data.lng) ? data.lng : null,
      rating: 0,
      reviewCount: 0,
      video: false,
      offer: true,
      vip: false,
      status: "active",
      createdAt: new Date().toISOString()
    };

    const batch = db.batch();
    batch.set(db.collection("institutions").doc(id), institution);
    batch.delete(db.collection("institutionApplications").doc(id));
    await batch.commit();

    alert("Kurum onaylandı.");
    await loadApplications();
    await loadInstitutions();
  } catch (error) {
    console.error("Onaylama hatası:", error);
    alert("Kurum onaylanamadı. Firestore kurallarını kontrol edin.");
  }
}

async function rejectApplication(id) {
  const ok = confirm("Bu başvuruyu reddetmek istiyor musunuz?");
  if (!ok) return;

  try {
    await db.collection("institutionApplications").doc(id).update({
      status: "rejected",
      rejectedAt: new Date().toISOString()
    });

    alert("Başvuru reddedildi.");
    await loadApplications();
  } catch (error) {
    console.error("Reddetme hatası:", error);
    alert("Başvuru reddedilemedi.");
  }
}

async function deleteApplication(id) {
  const ok = confirm("Bu başvuruyu kalıcı olarak silmek istiyor musunuz?");
  if (!ok) return;

  try {
    await db.collection("institutionApplications").doc(id).delete();
    await loadApplications();
  } catch (error) {
    console.error("Silme hatası:", error);
    alert("Başvuru silinemedi.");
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleString("tr-TR");
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}


[applicationsTabBtn, institutionsTabBtn, quotesTabBtn, quoteRoutingTabBtn, offerReportTabBtn, accountsTabBtn, unmatchedSearchesTabBtn]
  .forEach(button => button?.addEventListener("click", () => {
    overviewSection.hidden = true;
    issuesSection.hidden = true;
    overviewTabBtn.classList.remove("active");
    issuesTabBtn.classList.remove("active");
  }, true));

[overviewTabBtn, applicationsTabBtn, institutionsTabBtn, quotesTabBtn, offerReportTabBtn, issuesTabBtn, accountsTabBtn, unmatchedSearchesTabBtn]
  .forEach(button => button?.addEventListener("click", () => {
    if (quoteRoutingSection) quoteRoutingSection.hidden = true;
    quoteRoutingTabBtn?.classList.remove("active");
  }, true));

overviewTabBtn?.addEventListener("click", () => {
  overviewSection.hidden = false;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = true;
  issuesSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;

  [applicationsTabBtn, institutionsTabBtn, quotesTabBtn, quoteRoutingTabBtn, offerReportTabBtn, issuesTabBtn, accountsTabBtn, unmatchedSearchesTabBtn]
    .forEach(button => button?.classList.remove("active"));
  overviewTabBtn.classList.add("active");
  refreshAdminOverview();
});

issuesTabBtn?.addEventListener("click", async () => {
  overviewSection.hidden = true;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = true;
  issuesSection.hidden = false;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;

  [overviewTabBtn, applicationsTabBtn, institutionsTabBtn, quotesTabBtn, quoteRoutingTabBtn, offerReportTabBtn, accountsTabBtn, unmatchedSearchesTabBtn]
    .forEach(button => button?.classList.remove("active"));
  issuesTabBtn.classList.add("active");

  if (!quoteRequestRecords.length) {
    await loadQuoteRequests();
  }
  renderIssueCenter();
});

applicationsTabBtn.addEventListener("click", () => {
  applicationsSection.hidden = false;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;
  applicationsTabBtn.classList.add("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  quoteRoutingTabBtn?.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  unmatchedSearchesTabBtn?.classList.remove("active");
});

institutionsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = false;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.add("active");
  quotesTabBtn.classList.remove("active");
  quoteRoutingTabBtn?.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  unmatchedSearchesTabBtn?.classList.remove("active");
  await loadInstitutions();
});

quotesTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = false;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.add("active");
  quoteRoutingTabBtn?.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  unmatchedSearchesTabBtn?.classList.remove("active");
  await loadQuoteRequests();
});

quoteRoutingTabBtn?.addEventListener("click", async () => {
  overviewSection.hidden = true;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = false;
  offerReportSection.hidden = true;
  issuesSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;

  [overviewTabBtn, applicationsTabBtn, institutionsTabBtn, quotesTabBtn, offerReportTabBtn, issuesTabBtn, accountsTabBtn, unmatchedSearchesTabBtn]
    .forEach(button => button?.classList.remove("active"));
  quoteRoutingTabBtn.classList.add("active");

  if (!institutionRecords.length) await loadInstitutions();
  await loadQuoteRequests();
  await loadLeadRoutingSettings();
  await reconcileLeadCreditUsage();
  await loadLeadCreditData();
  renderQuoteRoutingAdmin();
  renderLeadCreditAdmin();
});

offerReportTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  quoteRoutingSection.hidden = true;
  offerReportSection.hidden = false;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = true;

  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  quoteRoutingTabBtn?.classList.remove("active");
  offerReportTabBtn.classList.add("active");
  accountsTabBtn.classList.remove("active");
  unmatchedSearchesTabBtn?.classList.remove("active");

  await loadQuoteRequests();
  renderInstitutionOfferReport();
});

async function loadInstitutions() {
  institutionsList.innerHTML = "Kurumlar yükleniyor...";

  try {
    const snapshot = await db.collection("institutions").get();

    institutionRecords = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const activeInstitutionCount = institutionRecords.filter(
      item => String(item.status || "active") !== "passive"
    ).length;
    const passiveInstitutionCount = institutionRecords.length - activeInstitutionCount;
    institutionCount.textContent =
      `${activeInstitutionCount} aktif · ${passiveInstitutionCount} pasif · ${institutionRecords.length} toplam`;
    populateInstitutionCityFilter();
    renderManagedInstitutions();
    refreshAdminOverview();

    if (quoteRequestRecords.length) {
      buildInstitutionOfferReport();
      renderInstitutionOfferReport();
      renderQuoteRoutingAdmin();
    }

  } catch (error) {
    console.error("Kurumlar yüklenemedi:", error);
    institutionsList.innerHTML = "<p>Kurumlar yüklenemedi.</p>";
  }
}

function populateInstitutionCityFilter() {
  const selected = institutionCityFilter.value;

  const cities = [...new Set(
    institutionRecords
      .map(item => (item.city || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "tr"));

  institutionCityFilter.innerHTML =
    '<option value="">Tüm şehirler</option>' +
    cities.map(city =>
      `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`
    ).join("");

  if (cities.includes(selected)) {
    institutionCityFilter.value = selected;
  }
}

function isInstitutionVipActive(item){
  if(!item)return false;

  // Yeni VIP yönetimi açıkça pasife aldıysa eski vip alanı olsa bile VIP sayma.
  if(item.vipActive===false)return false;

  if(item.vipActive===true){
    const end=String(item.vipEndAt||"").slice(0,10);
    if(!end)return true;

    const endTime=new Date(end+"T23:59:59").getTime();
    return !Number.isFinite(endTime) || endTime>=Date.now();
  }

  // Eski kayıtlardaki VIP işaretini geriye dönük destekle.
  return Boolean(item.vip);
}

function getFilteredManagedInstitutions() {
  const query = institutionSearch.value.trim().toLocaleLowerCase("tr-TR");
  const category = institutionCategoryFilter.value;
  const city = institutionCityFilter.value;
  const status = institutionStatusFilter?.value || "";
  const feature = institutionFeatureFilter.value;
  const sort = institutionSort.value;

  let data = institutionRecords.filter(item => {
    const haystack = [
      item.name,
      item.city,
      item.district,
      item.address,
      item.phone,
      item.website
    ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = !category || item.category === category;
    const matchesCity = !city || item.city === city;
    const isActive = String(item.status || "active") !== "passive";
    const matchesStatus =
      !status ||
      (status === "active" && isActive) ||
      (status === "passive" && !isActive);

    let matchesFeature = true;
    if (feature === "vip") matchesFeature = isInstitutionVipActive(item);
    if (feature === "video") matchesFeature = Boolean(item.video);
    if (feature === "offer") matchesFeature = item.offer !== false;
    if (feature === "offer_off") matchesFeature = item.offer === false;
    if (feature === "ad_active") matchesFeature = getInstitutionAdState(item).advertiser;
    if (feature === "ad_none") matchesFeature = !getInstitutionAdState(item).advertiser;
    if (feature === "ad_expiring") {
      const adState=getInstitutionAdState(item);
      matchesFeature=adState.active && adState.daysLeft!==null && adState.daysLeft<=7;
    }
    if (feature === "ad_payment") {
      const adState=getInstitutionAdState(item);
      matchesFeature=adState.advertiser && String(item.adPaymentStatus||"unpaid")!=="paid";
    }
    if (feature === "ad_paused") matchesFeature = getInstitutionAdState(item).status==="paused";

    return matchesQuery && matchesCategory && matchesCity && matchesStatus && matchesFeature;
  });

  if (sort === "name") {
    data.sort((a, b) => (a.name || "").localeCompare(b.name || "", "tr"));
  } else if (sort === "city") {
    data.sort((a, b) => {
      const cityCompare = (a.city || "").localeCompare(b.city || "", "tr");
      if (cityCompare !== 0) return cityCompare;
      return (a.name || "").localeCompare(b.name || "", "tr");
    });
  } else if (sort === "newest") {
    data.sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } else if (sort === "ad_expiry") {
    data.sort((a,b) => {
      const aState=getInstitutionAdState(a);
      const bState=getInstitutionAdState(b);
      const aTime=aState.advertiser && a.adEndAt ? new Date(a.adEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime=bState.advertiser && b.adEndAt ? new Date(b.adEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime-bTime;
    });
  }

  return data;
}

const ADMIN_AD_PACKAGES = {
  starter:{
    name:"Başlangıç Görünürlüğü",
    short:"İlk kez reklam verecek veya görünürlüğünü artırmak isteyen kurumlar.",
    benefits:[
      "Sponsorlu kurum rozeti",
      "Kategori / şehir vitrin alanı için uygun paket",
      "Kampanya çağrısı (CTA) kullanımı"
    ]
  },
  regional:{
    name:"Bölgesel Vitrin",
    short:"Şehir ve ilçe bazında müşteri arayan yerel işletmeler.",
    benefits:[
      "Şehir / ilçe odaklı vitrin",
      "Kategori sponsor alanı için uygun paket",
      "Dönemsel kampanya duyurusu"
    ]
  },
  video:{
    name:"Video Tanıtım",
    short:"Görsel anlatımın güçlü olduğu sektörlerde dikkat çekmek için.",
    benefits:[
      "Video odaklı vitrin tanıtımı",
      "Reels / Story kullanımına uygun içerik",
      "Kurum kartında video vurgusu"
    ]
  },
  premium:{
    name:"Premium Marka",
    short:"Daha güçlü ve sürekli marka görünürlüğü isteyen kurumlar.",
    benefits:[
      "Bölgesel vitrin + video görünürlüğü",
      "Banner / kampanya alanı için uygun paket",
      "Dönemsel marka görünürlüğü"
    ]
  }
};


const ADMIN_AD_PLACEMENTS = {
  premium_home:{
    icon:"◆",
    name:"Premium Vitrin",
    page:"Ana Sayfa",
    size:"1600 × 600 px",
    device:"Mobil + Masaüstü",
    description:"Ana sayfanın en görünür geniş reklam alanı."
  },
  home_sponsor:{
    icon:"📣",
    name:"Bölgenizde Öne Çıkanlar",
    page:"Ana Sayfa",
    size:"1500 × 600 px",
    device:"Mobil + Masaüstü",
    description:"Şehir / ilçe bazlı sponsorlu kurum görünürlüğü."
  },
  search:{
    icon:"🔎",
    name:"Kurum Listesi Banner",
    page:"Ana Sayfa",
    size:"1200 × 450 px",
    device:"Mobil + Masaüstü",
    description:"Kurum arama sonuçlarının içinde, 2. kurumdan sonra."
  },
  mobile_sponsor:{
    icon:"📱",
    name:"Mobil 2’li Sponsor",
    page:"Ana Sayfa",
    size:"1080 × 600 px",
    device:"Sadece Mobil",
    description:"Premium vitrinin altındaki iki reklamlı mobil alan."
  },
  sidebar_sponsor:{
    icon:"▤",
    name:"Masaüstü Yan Sponsor",
    page:"Ana Sayfa",
    size:"900 × 330 px",
    device:"Sadece Masaüstü",
    description:"Kurum sonuçlarının yanındaki masaüstü sponsor alanı."
  },
  detail_banner:{
    icon:"🏢",
    name:"Kurum Önizleme Banner",
    page:"Kurum Önizleme",
    size:"1200 × 300 px",
    device:"Sadece Masaüstü",
    description:"Hızlı kurum önizleme panelinin altındaki banner."
  },
  page_top_mini:{
    icon:"▰",
    name:"Üst Mini Banner",
    page:"Teklif / İş / Bayi",
    size:"728 × 90 px",
    device:"Mobil + Masaüstü",
    description:"Teklif Al, İş Fırsatları ve Bayi & Servis sayfalarının üstünde."
  }
};

const ADMIN_AD_RATE_DAYS = [7,15,30];
let adminAdRateSettings = {};

function normalizeAdminAdRates(raw){
  const source=raw && typeof raw==="object" ? raw : {};
  const normalized={};

  Object.keys(ADMIN_AD_PLACEMENTS).forEach(placement=>{
    normalized[placement]={};
    ADMIN_AD_RATE_DAYS.forEach(days=>{
      const value=Number(source?.[placement]?.[String(days)] ?? source?.[placement]?.[days] ?? 0);
      normalized[placement][String(days)]=Number.isFinite(value) && value>=0 ? value : 0;
    });
  });

  return normalized;
}

function adminAdRateFor(placement,days){
  const rates=normalizeAdminAdRates(adminAdRateSettings);
  return Math.max(0,Number(rates?.[placement]?.[String(days)]||0));
}

function adminAdRateText(value){
  const amount=Math.max(0,Number(value||0));
  if(amount===0)return "Fiyat belirlenmedi";
  return new Intl.NumberFormat("tr-TR").format(amount)+" TL";
}

async function loadAdminAdRateSettings(){
  try{
    const snap=await db.collection("siteSettings").doc("adRates").get();
    adminAdRateSettings=normalizeAdminAdRates(snap.exists ? snap.data()?.rates : {});
  }catch(error){
    console.error("Reklam tarifesi yüklenemedi:",error);
    adminAdRateSettings=normalizeAdminAdRates({});
  }

  window.DIJIYER_ADMIN_AD_RATES=adminAdRateSettings;
  renderAdminAdRateEditor();
  return adminAdRateSettings;
}

function renderAdminAdRateEditor(){
  const root=document.getElementById("adminAdRateRows");
  if(!root)return;

  root.innerHTML=Object.entries(ADMIN_AD_PLACEMENTS).map(([placement,item])=>`
    <article class="admin-ad-rate-row">
      <div class="admin-ad-rate-place">
        <span class="admin-ad-rate-icon">${item.icon}</span>
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.page)} · ${escapeHtml(item.size)} · ${escapeHtml(item.device)}</small>
        </div>
      </div>

      ${ADMIN_AD_RATE_DAYS.map(days=>`
        <label>
          <span>${days} gün</span>
          <div>
            <input
              type="number"
              min="0"
              step="1"
              data-admin-ad-rate-placement="${placement}"
              data-admin-ad-rate-days="${days}"
              value="${adminAdRateFor(placement,days)}"
            >
            <i>TL</i>
          </div>
        </label>
      `).join("")}
    </article>
  `).join("");
}

async function saveAdminAdRateSettings(){
  const button=document.getElementById("adminAdRateSaveBtn");
  const message=document.getElementById("adminAdRateMessage");
  const rates=normalizeAdminAdRates({});

  document.querySelectorAll("[data-admin-ad-rate-placement]").forEach(input=>{
    const placement=String(input.dataset.adminAdRatePlacement||"");
    const days=String(input.dataset.adminAdRateDays||"");
    if(!rates[placement] || !days)return;
    const value=Math.max(0,Number(input.value||0));
    rates[placement][days]=Number.isFinite(value)?value:0;
  });

  if(button){
    button.disabled=true;
    button.textContent="Kaydediliyor...";
  }
  if(message){
    message.textContent="Reklam ücretleri kaydediliyor...";
    message.dataset.state="saving";
  }

  try{
    await db.collection("siteSettings").doc("adRates").set({
      rates,
      updatedAt:new Date().toISOString()
    },{merge:true});

    adminAdRateSettings=normalizeAdminAdRates(rates);
    window.DIJIYER_ADMIN_AD_RATES=adminAdRateSettings;

    if(message){
      message.textContent="✓ Reklam tarifesi kaydedildi. Kurum reklam ekranlarına otomatik yansıdı.";
      message.dataset.state="success";
    }

    renderManagedInstitutions();
  }catch(error){
    console.error("Reklam tarifesi kaydedilemedi:",error);
    if(message){
      message.textContent="Reklam tarifesi kaydedilemedi. Firestore yetkisini kontrol edin.";
      message.dataset.state="error";
    }
  }finally{
    if(button){
      button.disabled=false;
      button.textContent="Reklam Tarifesini Kaydet";
    }
  }
}

document.getElementById("adminAdRateSaveBtn")?.addEventListener("click",saveAdminAdRateSettings);

function adminAdPlacementCardsHtml(inst){
  return Object.entries(ADMIN_AD_PLACEMENTS).map(([id,item])=>{
    const initialDays=30;
    const initialPrice=adminAdRateFor(id,initialDays);
    return `
      <article class="institution-ad-placement-card">
        <div class="institution-ad-placement-icon">${item.icon}</div>
        <div class="institution-ad-placement-copy">
          <span>${escapeHtml(item.page)}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.description)}</small>
        </div>
        <div class="institution-ad-placement-meta">
          <b>${escapeHtml(item.size)}</b>
          <em>${escapeHtml(item.device)}</em>
        </div>
        <div class="institution-ad-placement-sale">
          <label>
            <span>Yayın Süresi</span>
            <select data-placement-days="${id}">
              <option value="7">7 gün</option>
              <option value="15">15 gün</option>
              <option value="30" selected>30 gün</option>
            </select>
          </label>
          <div class="institution-ad-fixed-price">
            <span>Yayın Ücreti</span>
            <strong data-placement-fee="${id}">${escapeHtml(adminAdRateText(initialPrice))}</strong>
            <small>Merkez tarifeden otomatik gelir</small>
          </div>
        </div>
        <button type="button" class="institution-ad-placement-start" data-start-placement="${id}">
          Reklamı Başlat →
        </button>
      </article>
    `;
  }).join("");
}

function adminDateInputValue(value){
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return String(value).slice(0,10);
  return date.toISOString().slice(0,10);
}

function adminAddDays(dateValue,days){
  const date=dateValue ? new Date(dateValue) : new Date();
  if(Number.isNaN(date.getTime()))return "";
  date.setDate(date.getDate()+Number(days||0));
  return date.toISOString().slice(0,10);
}

function getInstitutionAdState(inst){
  const raw=String(inst.adStatus||"none");
  const endValue=inst.adEndAt || "";
  const end=endValue ? new Date(String(endValue).length<=10 ? endValue+"T23:59:59" : endValue) : null;
  const expired=Boolean(end && !Number.isNaN(end.getTime()) && end.getTime()<Date.now());
  const advertiser=["active","paused"].includes(raw) && !expired;
  const active=raw==="active" && !expired;

  let daysLeft=null;
  if(end && !Number.isNaN(end.getTime()) && !expired){
    daysLeft=Math.ceil((end.getTime()-Date.now())/86400000);
  }

  let status="none";
  let label="Reklam Vermiyor";
  let className="none";

  if(expired){
    status="expired";
    label="Reklam Süresi Doldu";
    className="expired";
  }else if(raw==="paused"){
    status="paused";
    label="Reklam Duraklatıldı";
    className="paused";
  }else if(raw==="active"){
    status="active";
    label=daysLeft!==null && daysLeft<=7
      ? "Reklam Aktif · "+daysLeft+" gün kaldı"
      : "Reklam Veren";
    className=daysLeft!==null && daysLeft<=7 ? "expiring" : "active";
  }

  return {status,label,className,advertiser,active,expired,daysLeft};
}

function getInstitutionAdPackage(inst){
  return ADMIN_AD_PACKAGES[inst.adPackage] || null;
}

function getRecommendedAdPackage(inst){
  const category=String(inst.subCategory||inst.category||"");
  const visualCategories=new Set(["restoran","guzellik","dugun","emlak","turizm","kres","mobilya","oto","medya","perakende"]);
  const localLeadCategories=new Set(["surucu","oto","guzellik","saglik","evteknik","insaat","temizlik","emlak","kres","yurt","turizm","nakliyat"]);

  const missingProfile=[
    !String(inst.phone||"").trim(),
    !String(inst.address||"").trim(),
    !String(inst.website||"").trim(),
    !(Number.isFinite(Number(inst.lat)) && Number.isFinite(Number(inst.lng)))
  ].filter(Boolean).length;

  let packageId="starter";
  let reason="İlk reklam için sade bir görünürlük paketiyle başlamak daha uygun görünüyor.";

  if(visualCategories.has(category) && !inst.video){
    packageId="video";
    reason="Bu sektörde görsel anlatım önemli ve kurumda henüz video özelliği görünmüyor.";
  }else if(localLeadCategories.has(category)){
    packageId="regional";
    reason="Bu kurumun müşterileri çoğunlukla şehir / ilçe bazında arama yaptığı için bölgesel görünürlük daha anlamlı olabilir.";
  }else if(inst.vip && inst.video){
    packageId="premium";
    reason="Kurumun VIP ve video altyapısı hazır; daha kapsamlı marka görünürlüğü paketi değerlendirilebilir.";
  }else if(missingProfile>=2){
    packageId="starter";
    reason="Profilde eksik alanlar var; önce temel görünürlüğü güçlendiren paket daha uygun.";
  }

  return {packageId,package:ADMIN_AD_PACKAGES[packageId],reason};
}

function adminAdPackageOptions(selected){
  return '<option value="">Paket seçin...</option>' +
    Object.entries(ADMIN_AD_PACKAGES).map(([id,pkg]) =>
      '<option value="'+id+'" '+(selected===id?"selected":"")+'>'+escapeHtml(pkg.name)+'</option>'
    ).join("");
}

function adminAdPaymentLabel(value){
  const map={unpaid:"Ödeme Bekliyor",partial:"Kısmi Ödendi",paid:"Ödendi"};
  return map[String(value||"unpaid")] || "Ödeme Bekliyor";
}

function adminAdHistoryHtml(inst){
  const rows=Array.isArray(inst.adHistory) ? [...inst.adHistory].slice(-5).reverse() : [];
  if(!rows.length)return '<div class="ad-history-empty">Henüz reklam işlem geçmişi yok.</div>';

  return rows.map(item=>{
    const pkg=ADMIN_AD_PACKAGES[item.packageId];
    const label=item.status==="active"
      ? "Aktif"
      : item.status==="paused"
        ? "Duraklatıldı"
        : "Kapatıldı";
    return '<div class="ad-history-row">'+
      '<div><strong>'+escapeHtml(label+(pkg?" · "+pkg.name:""))+'</strong>'+
      '<span>'+escapeHtml(item.note||"")+'</span></div>'+
      '<small>'+formatDate(item.date)+'</small>'+
    '</div>';
  }).join("");
}

function refreshInstitutionMiniStats() {
  const adStates=institutionRecords.map(item=>({item,state:getInstitutionAdState(item)}));

  if (institutionStatTotal) institutionStatTotal.textContent = institutionRecords.length;
  if (institutionStatActive) institutionStatActive.textContent =
    institutionRecords.filter(item => String(item.status || "active") !== "passive").length;
  if (institutionStatPassive) institutionStatPassive.textContent =
    institutionRecords.filter(item => String(item.status || "active") === "passive").length;
  if (institutionStatOffer) institutionStatOffer.textContent =
    institutionRecords.filter(item => item.offer !== false).length;
  if (institutionStatVip) institutionStatVip.textContent =
    institutionRecords.filter(item => isInstitutionVipActive(item)).length;
  if (institutionStatVideo) institutionStatVideo.textContent =
    institutionRecords.filter(item => Boolean(item.video)).length;

  if (institutionStatAdActive) institutionStatAdActive.textContent =
    adStates.filter(row=>row.state.advertiser).length;
  if (institutionStatAdNone) institutionStatAdNone.textContent =
    adStates.filter(row=>!row.state.advertiser).length;
  if (institutionStatAdExpiring) institutionStatAdExpiring.textContent =
    adStates.filter(row=>row.state.active && row.state.daysLeft!==null && row.state.daysLeft<=7).length;
  if (institutionStatAdPayment) institutionStatAdPayment.textContent =
    adStates.filter(row=>row.state.advertiser && String(row.item.adPaymentStatus||"unpaid")!=="paid").length;
}

function renderManagedInstitutions() {
  refreshInstitutionMiniStats();
  const data = getFilteredManagedInstitutions();

  institutionFilterResult.textContent =
    `${data.length} kurum gösteriliyor · Toplam ${institutionRecords.length}`;

  if (!data.length) {
    institutionsList.innerHTML =
      '<div class="empty-state">Aramaya veya filtrelere uygun kurum bulunamadı.</div>';
    return;
  }

  institutionsList.innerHTML = "";

  data.forEach((data) => {
    const card = document.createElement("div");
    card.className = "institution-manage-card";
    card.dataset.institutionId = data.id;

    const categoryLabels = {
      surucu: "Sürücü Kursu",
      kres: "Kreş & Anaokulu",
      yurt: "Öğrenci Yurdu",
      egitim: "Eğitim & Kurslar",
      emlak: "Emlak & Gayrimenkul",
      oto: "Oto Servis & Sanayi",
      restoran: "Restoran & Kafe",
      guzellik: "Güzellik & Bakım",
      saglik: "Sağlık & Klinik",
      dugun: "Düğün & Organizasyon",
      evteknik: "Ev & Teknik Servis",
      turizm: "Turizm & Konaklama",
      nakliyat: "Nakliyat & Taşımacılık",
      temizlik: "Temizlik Hizmetleri",
      mobilya: "Mobilya & Dekorasyon",
      teknoloji: "Bilgisayar & Teknoloji",
      veteriner: "Veteriner & Evcil Hayvan",
      spor: "Spor & Fitness",
      medya: "Fotoğraf & Video",
      reklam: "Matbaa, Reklam & Tasarım",
      insaat: "İnşaat & Tadilat",
      tarim: "Tarım & Hayvancılık",
      hukuk: "Hukuk & Danışmanlık",
      muhasebe: "Muhasebe & Mali Müşavirlik",
      kurye: "Kurye & Teslimat",
      perakende: "Mağaza & Perakende",
      esnaf: "Yerel Esnaf",
      diger: "Diğer"
    };

    const hasCoordinates =
      Number.isFinite(data.lat) && Number.isFinite(data.lng);

    const phoneDigits = String(data.phone || "").replace(/\D/g, "");
    const whatsappDigits =
      phoneDigits.startsWith("0") ? "90" + phoneDigits.slice(1) : phoneDigits;
    const isInstitutionActive = String(data.status || "active") !== "passive";
    const adState = getInstitutionAdState(data);
    const currentAdPackage = getInstitutionAdPackage(data);
    const adRecommendation = getRecommendedAdPackage(data);
    const adStartValue = adminDateInputValue(data.adStartAt) || adminDateInputValue(new Date());
    const adEndValue = adminDateInputValue(data.adEndAt) || adminAddDays(new Date(),30);

    card.innerHTML = `
      <div class="manage-main institution-compact-head">
        <div class="institution-select-slot"></div>

        <div class="manage-title">
          <div class="institution-name-row">
            <h3>${escapeHtml(data.name || "-")}</h3>
            <button class="institution-detail-btn" type="button" aria-expanded="false">Kurum Bilgileri</button>
          </div>
          <div class="institution-summary-line">
            <span>📍 ${escapeHtml([data.city, data.district].filter(Boolean).join(" / ") || "-")}</span>
            <span>☎ ${escapeHtml(data.phone || "Telefon yok")}</span>
          </div>
          <div class="manage-badges">
            <span>${escapeHtml(categoryLabels[data.category] || data.category || "Diğer")}</span>
            ${isInstitutionActive ? '<span class="badge-offer">Kurum Aktif</span>' : '<span class="badge-offer-off">Kurum Pasif</span>'}
            ${data.offer !== false ? '<span class="badge-offer">Teklif Açık</span>' : '<span class="badge-offer-off">Teklif Kapalı</span>'}
            ${data.vip ? '<span class="badge-vip">VIP</span>' : ''}
            ${data.video ? '<span class="badge-video">Videolu</span>' : ''}
            ${data.locationVideoUrl ? '<span class="badge-video">Konum Videosu</span>' : ''}
            ${data.virtualTourUrl ? '<span class="badge-tour">360° Tur</span>' : ''}
            <span class="badge-ad badge-ad-${adState.className}">
              ${escapeHtml(adState.label)}
              ${currentAdPackage ? " · "+escapeHtml(currentAdPackage.name) : ""}
            </span>
          </div>
        </div>

        <div class="manage-actions compact institution-top-status-actions">
          <button class="quick-photo-institution-btn" type="button">📷 Fotoğraf</button>
          <button class="quick-edit-institution-btn" type="button">⚡ Hızlı Düzenle</button>
          <button class="banner-ad-institution-btn" type="button">🖼️ Banner Reklama Ekle</button>
          <button class="edit-institution-btn" type="button">⚙ Detaylı Düzenle</button>
        </div>
      </div>

      <div class="institution-status-manager ${isInstitutionActive ? "is-active" : "is-passive"}">
        <div class="institution-status-copy">
          <span>KURUM DURUMU</span>
          <strong>${isInstitutionActive ? "Aktif" : "Pasif"}</strong>
          <small>${isInstitutionActive ? "Kurum kullanıcı tarafında yayında." : "Kurum kullanıcı tarafında gizli."}</small>
        </div>
        <div class="institution-status-buttons">
          <button type="button" class="institution-activate-btn" ${isInstitutionActive ? "disabled" : ""}>✓ Aktif Yap</button>
          <button type="button" class="institution-passivate-btn" ${!isInstitutionActive ? "disabled" : ""}>⏸ Pasif Yap</button>
          <button type="button" class="institution-status-delete-btn">🗑 Sil</button>
        </div>
      </div>

      <div class="institution-primary-actions">
        <button class="quick-toggle ${data.offer !== false ? "on" : ""}" data-field="offer">
          ₺ ${data.offer !== false ? "Teklif Açık" : "Teklif Kapalı"}
        </button>
        <button class="quick-toggle ${data.vip ? "on" : ""}" data-field="vip">
          ★ ${data.vip ? "VIP Açık" : "VIP Kapalı"}
        </button>
        <button class="quick-toggle ${data.video ? "on" : ""}" data-field="video">
          ▶ ${data.video ? "Video Var" : "Video Yok"}
        </button>
        ${whatsappDigits ? '<button class="whatsapp-manage-btn">WhatsApp</button>' : ''}
      </div>

      <div class="institution-detail-panel hidden">
        <div class="manage-info-grid">
          <div>
            <small>Konum</small>
            <strong>${escapeHtml([data.city, data.district].filter(Boolean).join(" / ") || "-")}</strong>
          </div>
          <div>
            <small>Telefon</small>
            <strong>${escapeHtml(data.phone || "-")}</strong>
          </div>
          <div class="wide">
            <small>Adres</small>
            <strong>${escapeHtml(data.address || "-")}</strong>
          </div>
          ${data.website ? `
            <div class="wide">
              <small>Web / Instagram</small>
              <strong>${escapeHtml(data.website)}</strong>
            </div>
          ` : ""}
        </div>

        <div class="institution-secondary-actions">
          ${hasCoordinates ? '<button class="map-institution-btn">📍 Haritada Aç</button>' : ''}
          ${data.website ? '<button class="website-manage-btn">Web / Instagram</button>' : ''}
          <button class="delete-institution-btn">🗑 Kurumu Sil</button>
        </div>

        <section class="institution-ad-manager">
          <div class="ad-manager-head">
            <div>
              <span>REKLAM YÖNETİMİ</span>
              <strong>${escapeHtml(adState.label)}</strong>
              <small>${currentAdPackage ? escapeHtml(currentAdPackage.name) : "Aktif paket yok"}</small>
            </div>
            <span class="ad-payment-chip ${String(data.adPaymentStatus||"unpaid")}">
              ${adState.advertiser ? escapeHtml(adminAdPaymentLabel(data.adPaymentStatus)) : "Reklam kaydı yok"}
            </span>
          </div>

          <div class="ad-recommendation">
            <span>ÖNERİLEN PAKET</span>
            <strong>${escapeHtml(adRecommendation.package.name)}</strong>
            <p>${escapeHtml(adRecommendation.reason)}</p>
            <ul>
              ${adRecommendation.package.benefits.map(item=>`<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
            <div class="ad-recommendation-actions">
              <button type="button" class="ad-pick-recommended" data-package="${adRecommendation.packageId}">Bu Paketi Seç</button>
              ${whatsappDigits ? '<button type="button" class="ad-whatsapp-recommend">WhatsApp ile Öner</button>' : ''}
            </div>
          </div>

          <section class="institution-ad-placement-catalog">
            <div class="institution-ad-placement-head">
              <div>
                <span>SİTEDEKİ REKLAM ALANLARI</span>
                <strong>Alanı, ölçüyü, süreyi ve fiyatı tek ekranda seçin</strong>
                <small>Bir alan seçip satış fiyatını girin. “Reklamı Başlat” dediğinizde Reklam Merkezi seçili kurum ve alanla hazır açılır.</small>
              </div>
              <button type="button" class="institution-open-ad-center">Tüm Reklam Merkezini Aç</button>
            </div>
            <div class="institution-ad-placement-grid">
              ${adminAdPlacementCardsHtml(data)}
            </div>
          </section>

          <details class="ad-package-catalog">
            <summary>Hazır görünürlük paketlerini gör</summary>
            <div class="ad-package-grid">
              ${Object.entries(ADMIN_AD_PACKAGES).map(([id,pkg])=>`
                <article class="${id===adRecommendation.packageId?"recommended":""}">
                  <span>${id===adRecommendation.packageId?"Önerilen":"Paket"}</span>
                  <strong>${escapeHtml(pkg.name)}</strong>
                  <p>${escapeHtml(pkg.short)}</p>
                  <small>${escapeHtml(pkg.benefits.join(" · "))}</small>
                </article>
              `).join("")}
            </div>
          </details>

          <form class="institution-ad-form" data-institution-id="${escapeHtml(data.id)}">
            <div class="ad-form-grid">
              <label>Reklam Durumu
                <select name="adStatus">
                  <option value="none" ${String(data.adStatus||"none")==="none"?"selected":""}>Reklam Vermiyor</option>
                  <option value="active" ${data.adStatus==="active"?"selected":""}>Aktif Reklam</option>
                  <option value="paused" ${data.adStatus==="paused"?"selected":""}>Duraklatıldı</option>
                </select>
              </label>

              <label>Paket
                <select name="adPackage">${adminAdPackageOptions(data.adPackage||"")}</select>
              </label>

              <label>Başlangıç
                <input type="date" name="adStartAt" value="${escapeHtml(adStartValue)}">
              </label>

              <label>Bitiş
                <input type="date" name="adEndAt" value="${escapeHtml(adEndValue)}">
              </label>

              <label>Satış Tutarı
                <input type="number" name="adPrice" min="0" step="1" value="${Number(data.adPrice||0)||""}" placeholder="Örn. 2500">
              </label>

              <label>Ödeme
                <select name="adPaymentStatus">
                  <option value="unpaid" ${String(data.adPaymentStatus||"unpaid")==="unpaid"?"selected":""}>Ödeme Bekliyor</option>
                  <option value="partial" ${data.adPaymentStatus==="partial"?"selected":""}>Kısmi Ödendi</option>
                  <option value="paid" ${data.adPaymentStatus==="paid"?"selected":""}>Ödendi</option>
                </select>
              </label>

              <label class="wide">Not
                <textarea name="adNote" rows="2" maxlength="500" placeholder="Kampanya, ödeme veya reklamla ilgili kısa not...">${escapeHtml(data.adNote||"")}</textarea>
              </label>
            </div>

            <div class="ad-form-actions">
              <button type="submit">Reklam Bilgilerini Kaydet</button>
              <span>Reklam paketleri keşif / vitrin alanları içindir; müşteriye gelen tekliflerin tarafsız sıralamasını değiştirmez.</span>
            </div>
          </form>

          <details class="ad-history">
            <summary>Reklam işlem geçmişi</summary>
            <div>${adminAdHistoryHtml(data)}</div>
          </details>
        </section>

        <div class="institution-health-slot"></div>
      </div>
    `;
    card.querySelector(".institution-detail-btn")?.addEventListener("click", () => {
      const panel = card.querySelector(".institution-detail-panel");
      const button = card.querySelector(".institution-detail-btn");
      const opening = panel?.classList.contains("hidden");

      document.querySelectorAll(".institution-manage-card").forEach(otherCard => {
        if (otherCard === card) return;
        otherCard.querySelector(".institution-detail-panel")?.classList.add("hidden");
        const otherButton = otherCard.querySelector(".institution-detail-btn");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded","false");
          otherButton.textContent = "Kurum Bilgileri";
        }
        otherCard.classList.remove("expanded");
      });

      if (panel) panel.classList.toggle("hidden", !opening);
      if (button) {
        button.setAttribute("aria-expanded", opening ? "true" : "false");
        button.textContent = opening ? "Bilgileri Kapat" : "Kurum Bilgileri";
      }
      card.classList.toggle("expanded", opening);
    });

    card.querySelector(".banner-ad-institution-btn")?.addEventListener("click", () => {
      if (typeof window.openBannerAdForInstitution === "function") {
        window.openBannerAdForInstitution(data.id);
      } else {
        document.getElementById("bannerAdsTabBtn")?.click();
      }
    });

    card.querySelector(".institution-open-ad-center")?.addEventListener("click", () => {
      if (typeof window.openBannerAdForInstitution === "function") {
        window.openBannerAdForInstitution(data.id);
      } else {
        document.getElementById("bannerAdsTabBtn")?.click();
      }
    });

    card.querySelectorAll("[data-placement-days]").forEach(select => {
      const syncPrice=()=>{
        const placement=select.dataset.placementDays || "search";
        const days=Math.max(1,Number(select.value||30));
        const price=adminAdRateFor(placement,days);
        const fee=card.querySelector('[data-placement-fee="'+placement+'"]');
        if(fee)fee.textContent=adminAdRateText(price);
      };
      select.addEventListener("change",syncPrice);
      syncPrice();
    });

    card.querySelectorAll("[data-start-placement]").forEach(button => {
      button.addEventListener("click", () => {
        const placement=button.dataset.startPlacement || "search";
        const daysSelect=card.querySelector('[data-placement-days="'+placement+'"]');
        const days=Math.max(1,Number(daysSelect?.value||30));
        const price=adminAdRateFor(placement,days);

        if(price<=0){
          alert("Bu reklam alanı ve süre için henüz ücret belirlenmedi. Reklam → Paketler → Yönetici Reklam Tarifesi bölümünden fiyat girin.");
          return;
        }

        if (typeof window.openBannerAdForInstitution === "function") {
          window.openBannerAdForInstitution(data.id,{placement,price,days});
        } else {
          document.getElementById("bannerAdsTabBtn")?.click();
        }
      });
    });

    card.querySelector(".quick-photo-institution-btn")?.addEventListener("click", () => {
      openInstitutionQuickEdit(data.id, data, true);
    });

    card.querySelector(".quick-edit-institution-btn")?.addEventListener("click", () => {
      openInstitutionQuickEdit(data.id, data, false);
    });

    card.querySelector(".edit-institution-btn").addEventListener("click", () => {
      openInstitutionEdit(data.id, data);
    });

    card.querySelector(".institution-top-active-btn")?.addEventListener("click", async () => {
      await updateInstitutionStatus(data.id, true);
    });

    card.querySelector(".institution-top-passive-btn")?.addEventListener("click", async () => {
      const ok = confirm(
        (data.name || "Bu kurum") +
        " pasif yapılacak. Kullanıcı tarafında kurum listelerinde ve kurum profilinde görünmeyecek. Devam edilsin mi?"
      );
      if (!ok) return;
      await updateInstitutionStatus(data.id, false);
    });

    card.querySelector(".institution-top-delete-btn")?.addEventListener("click", () => {
      deleteInstitution(data.id, data.name || "Kurum");
    });

    card.querySelector(".delete-institution-btn").addEventListener("click", () => {
      deleteInstitution(data.id, data.name || "Kurum");
    });

    card.querySelector(".institution-status-delete-btn")?.addEventListener("click", () => {
      deleteInstitution(data.id, data.name || "Kurum");
    });

    card.querySelector(".institution-activate-btn")?.addEventListener("click", async () => {
      await updateInstitutionStatus(data.id, true);
    });

    card.querySelector(".institution-passivate-btn")?.addEventListener("click", async () => {
      const ok = confirm(
        (data.name || "Bu kurum") +
        " pasif yapılacak. Kullanıcı tarafında kurum listelerinde ve kurum profilinde görünmeyecek. Devam edilsin mi?"
      );
      if (!ok) return;
      await updateInstitutionStatus(data.id, false);
    });

    const mapBtn = card.querySelector(".map-institution-btn");
    if (mapBtn) {
      mapBtn.addEventListener("click", () => {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`,
          "_blank"
        );
      });
    }

    card.querySelectorAll(".quick-toggle").forEach((button) => {
      button.addEventListener("click", async () => {
        const field = button.dataset.field;

        if (field === "status") {
          const currentlyActive = String(data.status || "active") !== "passive";
          if (currentlyActive) {
            const ok = confirm(
              (data.name || "Bu kurum") +
              " pasif yapılacak. Kullanıcı tarafında kurum listelerinde ve kurum profilinde görünmeyecek. Devam edilsin mi?"
            );
            if (!ok) return;
          }
          await updateInstitutionStatus(data.id, !currentlyActive);
          return;
        }

        const currentValue =
          field === "offer" ? data.offer !== false : Boolean(data[field]);

        await quickUpdateInstitution(data.id, field, !currentValue);
      });
    });

    const whatsappBtn = card.querySelector(".whatsapp-manage-btn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", () => {
        window.open(`https://wa.me/${whatsappDigits}`, "_blank");
      });
    }

    const websiteBtn = card.querySelector(".website-manage-btn");
    if (websiteBtn) {
      websiteBtn.addEventListener("click", () => {
        let url = data.website.trim();
        if (!/^https?:\/\//i.test(url)) {
          if (url.startsWith("@")) {
            url = "https://instagram.com/" + url.slice(1);
          } else if (!url.includes(".")) {
            url = "https://instagram.com/" + url.replace(/^\//, "");
          } else {
            url = "https://" + url;
          }
        }
        window.open(url, "_blank");
      });
    }

    const adForm = card.querySelector(".institution-ad-form");
    const adPackageSelect = adForm?.elements.adPackage;
    const adStatusSelect = adForm?.elements.adStatus;

    card.querySelector(".ad-pick-recommended")?.addEventListener("click", () => {
      if(adPackageSelect) adPackageSelect.value = adRecommendation.packageId;
      if(adStatusSelect) adStatusSelect.value = "active";
      adForm?.scrollIntoView({behavior:"smooth",block:"center"});
    });

    card.querySelector(".ad-whatsapp-recommend")?.addEventListener("click", () => {
      if(!whatsappDigits)return;
      const pkg=adRecommendation.package;
      const message=[
        "Merhaba "+(data.name||""),
        "",
        "Dijiyer'deki kurum profilinizi inceledik.",
        "Size "+pkg.name+" paketinin uygun olabileceğini düşünüyoruz.",
        "",
        "Neden: "+adRecommendation.reason,
        "Paket içeriği: "+pkg.benefits.join(", "),
        "",
        "İsterseniz detayları ve reklam süresini birlikte planlayabiliriz."
      ].join("\n");
      window.open("https://wa.me/"+whatsappDigits+"?text="+encodeURIComponent(message),"_blank");
    });

    adForm?.addEventListener("submit", async event => {
      event.preventDefault();

      const status=adForm.elements.adStatus.value;
      const packageId=adForm.elements.adPackage.value;
      const startAt=adForm.elements.adStartAt.value;
      const endAt=adForm.elements.adEndAt.value;
      const adPrice=Number(adForm.elements.adPrice.value||0);
      const paymentStatus=adForm.elements.adPaymentStatus.value;
      const note=String(adForm.elements.adNote.value||"").trim();

      if(status!=="none" && !packageId){
        alert("Aktif veya duraklatılmış reklam için bir paket seçin.");
        return;
      }
      if(status==="active" && !endAt){
        alert("Aktif reklam için bitiş tarihi girin.");
        return;
      }
      if(startAt && endAt && new Date(endAt).getTime()<new Date(startAt).getTime()){
        alert("Reklam bitiş tarihi başlangıç tarihinden önce olamaz.");
        return;
      }

      const button=adForm.querySelector('button[type="submit"]');
      const oldText=button.textContent;
      button.disabled=true;
      button.textContent="Kaydediliyor...";

      try{
        const now=new Date().toISOString();
        const record=institutionRecords.find(item=>String(item.id)===String(data.id));
        const oldHistory=Array.isArray(record?.adHistory) ? record.adHistory : [];
        const historyEntry={
          status,
          packageId:status==="none" ? "" : packageId,
          price:adPrice,
          paymentStatus,
          startAt:status==="none" ? "" : startAt,
          endAt:status==="none" ? "" : endAt,
          note,
          date:now
        };
        const updates={
          adStatus:status,
          adPackage:status==="none" ? "" : packageId,
          adStartAt:status==="none" ? "" : startAt,
          adEndAt:status==="none" ? "" : endAt,
          adPrice:status==="none" ? 0 : adPrice,
          adPaymentStatus:status==="none" ? "unpaid" : paymentStatus,
          adNote:note,
          adUpdatedAt:now,
          adHistory:[...oldHistory,historyEntry].slice(-20),
          updatedAt:now
        };

        await db.collection("institutions").doc(data.id).update(updates);
        if(record)Object.assign(record,updates);
        renderManagedInstitutions();
      }catch(error){
        console.error("Reklam bilgileri kaydedilemedi:",error);
        alert("Reklam bilgileri kaydedilemedi.");
      }finally{
        button.disabled=false;
        button.textContent=oldText;
      }
    });

    if (typeof window.decorateAdminInstitutionCard === "function") {
      window.decorateAdminInstitutionCard(card, data);
    }

    institutionsList.appendChild(card);
  });
}

async function updateInstitutionStatus(id, active) {
  const nextStatus = active ? "active" : "passive";

  try {
    await db.collection("institutions").doc(id).update({
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });

    const record = institutionRecords.find(item => item.id === id);
    if (record) record.status = nextStatus;

    const activeInstitutionCount = institutionRecords.filter(
      item => String(item.status || "active") !== "passive"
    ).length;
    const passiveInstitutionCount = institutionRecords.length - activeInstitutionCount;
    if (institutionCount) {
      institutionCount.textContent =
        `${activeInstitutionCount} aktif · ${passiveInstitutionCount} pasif · ${institutionRecords.length} toplam`;
    }

    renderManagedInstitutions();
    refreshAdminOverview();
  } catch (error) {
    console.error("Kurum aktif/pasif durumu değiştirilemedi:", error);
    alert("Kurum durumu değiştirilemedi.");
  }
}

async function quickUpdateInstitution(id, field, value) {
  try {
    await db.collection("institutions").doc(id).update({
      [field]: value,
      updatedAt: new Date().toISOString()
    });

    const record = institutionRecords.find(item => item.id === id);
    if (record) record[field] = value;

    renderManagedInstitutions();
  } catch (error) {
    console.error("Hızlı güncelleme hatası:", error);
    alert("Değişiklik kaydedilemedi.");
  }
}

[institutionSearch, institutionCategoryFilter, institutionCityFilter, institutionStatusFilter, institutionFeatureFilter, institutionSort]
  .forEach((element) => {
    element.addEventListener(
      element.tagName === "INPUT" ? "input" : "change",
      renderManagedInstitutions
    );
  });

document.querySelectorAll("[data-institution-stat-filter]").forEach(button => {
  button.addEventListener("click", () => {
    institutionFeatureFilter.value = button.dataset.institutionStatFilter || "";
    renderManagedInstitutions();
  });
});

document.querySelectorAll("[data-institution-status-filter]").forEach(button => {
  button.addEventListener("click", () => {
    if (institutionStatusFilter) {
      institutionStatusFilter.value = button.dataset.institutionStatusFilter || "";
    }
    renderManagedInstitutions();
  });
});

clearInstitutionFilters.addEventListener("click", () => {
  institutionSearch.value = "";
  institutionCategoryFilter.value = "";
  institutionCityFilter.value = "";
  if (institutionStatusFilter) institutionStatusFilter.value = "";
  institutionFeatureFilter.value = "";
  institutionSort.value = "name";
  renderManagedInstitutions();
});


function getInstitutionMediaElement(id) {
  return document.getElementById(id);
}

function setInstitutionVideoStatus(text, state = "") {
  const el = getInstitutionMediaElement("editLocationVideoUploadStatus");
  if (!el) return;

  el.textContent = text;
  el.style.color =
    state === "error" ? "#b42318" :
    state === "success" ? "#067647" :
    state === "uploading" ? "#175cd3" :
    "#667085";
}

function syncInstitutionLocationVideoPreview() {
  const urlInput = getInstitutionMediaElement("editLocationVideoUrl");
  const preview = getInstitutionMediaElement("editLocationVideoPreview");
  const previewBtn = getInstitutionMediaElement("editLocationVideoPreviewBtn");
  const removeBtn = getInstitutionMediaElement("editLocationVideoRemoveBtn");

  const url = String(urlInput?.value || "").trim();
  const hasUrl = Boolean(url);

  if (previewBtn) previewBtn.disabled = !hasUrl;
  if (removeBtn) removeBtn.disabled = !hasUrl;

  if (!preview) return;

  if (!hasUrl) {
    try { preview.pause(); } catch (_) {}
    preview.removeAttribute("src");
    preview.load();
    preview.hidden = true;
  }
}

async function uploadInstitutionLocationVideo(file) {
  const institutionId = String(
    getInstitutionMediaElement("editInstitutionId")?.value || ""
  ).trim();

  if (!institutionId) {
    setInstitutionVideoStatus("Kurum kimliği bulunamadı. Pencereyi kapatıp tekrar açın.", "error");
    return;
  }

  if (!file) return;

  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
  if (file.type && !allowedTypes.includes(file.type)) {
    setInstitutionVideoStatus("Yalnızca MP4, WebM veya MOV video yükleyebilirsiniz.", "error");
    return;
  }

  const maxBytes = 500 * 1024 * 1024;
  if (file.size > maxBytes) {
    setInstitutionVideoStatus("Video 500 MB'dan büyük olamaz.", "error");
    return;
  }

  const uploadBtn = getInstitutionMediaElement("editLocationVideoUploadBtn");
  const urlInput = getInstitutionMediaElement("editLocationVideoUrl");
  const pathInput = getInstitutionMediaElement("editLocationVideoStoragePath");
  const oldPath = String(pathInput?.value || "").trim();
  const safeName = String(file.name || "konum-video.mp4")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const storagePath =
    "institution-media/" + institutionId + "/location-video/" +
    Date.now() + "-" + safeName;

  if (uploadBtn) uploadBtn.disabled = true;
  setInstitutionVideoStatus("Video yükleniyor... %0", "uploading");

  try {
    const ref = storage.ref().child(storagePath);
    const task = ref.put(file, {
      contentType: file.type || "video/mp4",
      customMetadata: {
        institutionId,
        mediaType: "locationVideo"
      }
    });

    const snapshot = await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        snap => {
          const total = Number(snap.totalBytes || 0);
          const sent = Number(snap.bytesTransferred || 0);
          const percent = total ? Math.round((sent / total) * 100) : 0;
          setInstitutionVideoStatus("Video yükleniyor... %" + percent, "uploading");
        },
        reject,
        () => resolve(task.snapshot)
      );
    });

    const downloadURL = await snapshot.ref.getDownloadURL();

    await db.collection("institutions").doc(institutionId).update({
      locationVideoUrl: downloadURL,
      locationVideoStoragePath: storagePath,
      video: true,
      updatedAt: new Date().toISOString()
    });

    if (urlInput) urlInput.value = downloadURL;
    if (pathInput) pathInput.value = storagePath;

    const record = institutionRecords.find(item => String(item.id) === institutionId);
    if (record) {
      record.locationVideoUrl = downloadURL;
      record.locationVideoStoragePath = storagePath;
      record.video = true;
    }

    const videoCheck = getInstitutionMediaElement("editVideo");
    if (videoCheck) videoCheck.checked = true;

    syncInstitutionLocationVideoPreview();
    setInstitutionVideoStatus("✓ Video yüklendi ve kuruma bağlandı. Mobil uygulamada kullanılabilir.", "success");

    if (oldPath && oldPath !== storagePath) {
      storage.ref().child(oldPath).delete().catch(error => {
        if (String(error?.code || "").includes("object-not-found")) return;
        console.warn("Eski konum videosu silinemedi:", error);
      });
    }

    renderManagedInstitutions();
  } catch (error) {
    console.error("Konum videosu yüklenemedi:", error);

    let message = "Video yüklenemedi.";
    const code = String(error?.code || "");
    if (code.includes("storage/unauthorized")) {
      message = "Firebase Storage yükleme yetkisi reddedildi. Storage Rules ayarlarını kontrol edin.";
    } else if (code.includes("storage/retry-limit-exceeded")) {
      message = "Yükleme zaman aşımına uğradı. İnternet bağlantısını kontrol edip tekrar deneyin.";
    } else if (code.includes("storage/bucket-not-found")) {
      message = "Firebase Storage henüz etkin değil veya bucket bulunamadı.";
    }

    setInstitutionVideoStatus(message, "error");
  } finally {
    if (uploadBtn) uploadBtn.disabled = false;
    const fileInput = getInstitutionMediaElement("editLocationVideoFile");
    if (fileInput) fileInput.value = "";
  }
}

async function removeInstitutionLocationVideo() {
  const institutionId = String(
    getInstitutionMediaElement("editInstitutionId")?.value || ""
  ).trim();
  const urlInput = getInstitutionMediaElement("editLocationVideoUrl");
  const pathInput = getInstitutionMediaElement("editLocationVideoStoragePath");
  const storagePath = String(pathInput?.value || "").trim();
  const currentUrl = String(urlInput?.value || "").trim();

  if (!institutionId || !currentUrl) return;

  const ok = confirm(
    "Bu kurumun konum videosu bağlantısı kaldırılacak" +
    (storagePath ? " ve Firebase Storage'daki dosya silinecek." : ".") +
    " Devam edilsin mi?"
  );
  if (!ok) return;

  setInstitutionVideoStatus("Video kaldırılıyor...", "uploading");

  try {
    if (storagePath) {
      try {
        await storage.ref().child(storagePath).delete();
      } catch (error) {
        if (!String(error?.code || "").includes("object-not-found")) {
          throw error;
        }
      }
    }

    await db.collection("institutions").doc(institutionId).update({
      locationVideoUrl: "",
      locationVideoStoragePath: "",
      updatedAt: new Date().toISOString()
    });

    if (urlInput) urlInput.value = "";
    if (pathInput) pathInput.value = "";

    const record = institutionRecords.find(item => String(item.id) === institutionId);
    if (record) {
      record.locationVideoUrl = "";
      record.locationVideoStoragePath = "";
    }

    syncInstitutionLocationVideoPreview();
    setInstitutionVideoStatus("Konum videosu kaldırıldı.", "success");
    renderManagedInstitutions();
  } catch (error) {
    console.error("Konum videosu kaldırılamadı:", error);
    setInstitutionVideoStatus("Konum videosu kaldırılamadı.", "error");
  }
}


/* ===== KURUM HIZLI DÜZENLE ===== */
function getInstitutionQuickElement(id) {
  return document.getElementById(id);
}

function setInstitutionQuickStatus(message, state) {
  const el = getInstitutionQuickElement("institutionQuickEditStatus");
  if (!el) return;
  el.textContent = message || "";
  el.dataset.state = state || "";
}

function paintInstitutionQuickMedia(data) {
  const cover = String(data?.coverUrl || "").trim();
  const logo = String(data?.logoUrl || "").trim();
  const coverPreview = getInstitutionQuickElement("quickEditCoverPreview");
  const logoPreview = getInstitutionQuickElement("quickEditLogoPreview");

  if (coverPreview) {
    coverPreview.innerHTML = cover
      ? '<img src="' + escapeHtml(cover) + '" alt="Kapak fotoğrafı">'
      : '<div class="institution-quick-media-empty"><span>🖼️</span><small>Kapak fotoğrafı yok</small></div>';
  }

  if (logoPreview) {
    logoPreview.innerHTML = logo
      ? '<img src="' + escapeHtml(logo) + '" alt="Kurum logosu">'
      : '<div class="institution-quick-logo-empty">🏢</div>';
  }
}

function openInstitutionQuickEdit(id, data, focusMedia) {
  const modal = getInstitutionQuickElement("institutionQuickEditModal");
  if (!modal) return;

  getInstitutionQuickElement("quickEditInstitutionId").value = id;
  getInstitutionQuickElement("quickEditTitle").textContent = data.name || "Kurum";
  getInstitutionQuickElement("quickEditPhone").value = data.phone || "";
  getInstitutionQuickElement("quickEditLocationVideoUrl").value =
    data.locationVideoUrl || data.profileVideoUrl || data.videoUrl || "";
  getInstitutionQuickElement("quickEditVirtualTourUrl").value =
    data.virtualTourUrl || data.tour360Url || data.tourUrl || "";
  getInstitutionQuickElement("quickEditActive").checked =
    String(data.status || "active") !== "passive";
  getInstitutionQuickElement("quickEditOffer").checked = data.offer !== false;
  getInstitutionQuickElement("quickEditVip").checked = Boolean(data.vip);
  getInstitutionQuickElement("quickEditCoverStoragePath").value =
    data.coverStoragePath || "";
  getInstitutionQuickElement("quickEditLogoStoragePath").value =
    data.logoStoragePath || "";

  paintInstitutionQuickMedia(data);
  setInstitutionQuickStatus("", "");
  modal.classList.remove("hidden");

  if (focusMedia) {
    requestAnimationFrame(() => {
      getInstitutionQuickElement("quickEditCoverUploadBtn")?.focus();
    });
  }
}

function closeInstitutionQuickEdit() {
  getInstitutionQuickElement("institutionQuickEditModal")?.classList.add("hidden");
  const coverFile = getInstitutionQuickElement("quickEditCoverFile");
  const logoFile = getInstitutionQuickElement("quickEditLogoFile");
  if (coverFile) coverFile.value = "";
  if (logoFile) logoFile.value = "";
  setInstitutionQuickStatus("", "");
}

async function uploadInstitutionQuickImage(kind, file) {
  const institutionId = String(
    getInstitutionQuickElement("quickEditInstitutionId")?.value || ""
  ).trim();
  const userId = String(auth.currentUser?.uid || "").trim();

  if (!institutionId || !userId || !file) {
    setInstitutionQuickStatus("Kurum veya yönetici oturumu bulunamadı.", "error");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (file.type && !allowedTypes.includes(file.type)) {
    setInstitutionQuickStatus("Yalnızca JPG, PNG veya WebP görsel yükleyebilirsiniz.", "error");
    return;
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    setInstitutionQuickStatus("Görsel 8 MB'dan büyük olamaz.", "error");
    return;
  }

  const field = kind === "logo" ? "logoUrl" : "coverUrl";
  const pathField = kind === "logo" ? "logoStoragePath" : "coverStoragePath";
  const pathInputId = kind === "logo" ? "quickEditLogoStoragePath" : "quickEditCoverStoragePath";
  const oldPath = String(getInstitutionQuickElement(pathInputId)?.value || "").trim();
  const safeName = String(file.name || (kind + ".jpg"))
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const storagePath =
    "institution-media/" + userId + "/" + institutionId + "/" + kind + "/" +
    Date.now() + "-" + safeName;

  const coverBtn = getInstitutionQuickElement("quickEditCoverUploadBtn");
  const logoBtn = getInstitutionQuickElement("quickEditLogoUploadBtn");
  if (coverBtn) coverBtn.disabled = true;
  if (logoBtn) logoBtn.disabled = true;

  setInstitutionQuickStatus(
    (kind === "logo" ? "Logo" : "Kapak fotoğrafı") + " yükleniyor... %0",
    "uploading"
  );

  try {
    const ref = storage.ref().child(storagePath);
    const task = ref.put(file, {
      contentType: file.type || "image/jpeg",
      customMetadata: {
        institutionId,
        mediaType: kind
      }
    });

    const snapshot = await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        snap => {
          const total = Number(snap.totalBytes || 0);
          const sent = Number(snap.bytesTransferred || 0);
          const percent = total ? Math.round((sent / total) * 100) : 0;
          setInstitutionQuickStatus(
            (kind === "logo" ? "Logo" : "Kapak fotoğrafı") +
            " yükleniyor... %" + percent,
            "uploading"
          );
        },
        reject,
        () => resolve(task.snapshot)
      );
    });

    const downloadURL = await snapshot.ref.getDownloadURL();
    const updates = {
      [field]: downloadURL,
      [pathField]: storagePath,
      updatedAt: new Date().toISOString()
    };

    await db.collection("institutions").doc(institutionId).update(updates);

    const record = institutionRecords.find(
      item => String(item.id) === String(institutionId)
    );
    if (record) Object.assign(record, updates);

    const pathInput = getInstitutionQuickElement(pathInputId);
    if (pathInput) pathInput.value = storagePath;

    paintInstitutionQuickMedia(record || updates);
    renderManagedInstitutions();

    setInstitutionQuickStatus(
      "✓ " + (kind === "logo" ? "Logo" : "Kapak fotoğrafı") +
      " yüklendi ve kurum sayfasına bağlandı.",
      "success"
    );

    if (oldPath && oldPath !== storagePath) {
      storage.ref().child(oldPath).delete().catch(error => {
        if (String(error?.code || "").includes("object-not-found")) return;
        console.warn("Eski kurum görseli silinemedi:", error);
      });
    }
  } catch (error) {
    console.error("Kurum görseli yüklenemedi:", error);
    const code = String(error?.code || "");
    let message = "Görsel yüklenemedi.";
    if (code.includes("storage/unauthorized")) {
      message = "Firebase Storage yükleme yetkisi reddedildi. Storage Rules ayarını kontrol edin.";
    } else if (code.includes("storage/retry-limit-exceeded")) {
      message = "Görsel yükleme zaman aşımına uğradı. Tekrar deneyin.";
    }
    setInstitutionQuickStatus(message, "error");
  } finally {
    if (coverBtn) coverBtn.disabled = false;
    if (logoBtn) logoBtn.disabled = false;
  }
}

getInstitutionQuickElement("closeInstitutionQuickEditModal")?.addEventListener("click", closeInstitutionQuickEdit);
getInstitutionQuickElement("institutionQuickEditCancelBtn")?.addEventListener("click", closeInstitutionQuickEdit);
getInstitutionQuickElement("institutionQuickEditModal")?.addEventListener("click", event => {
  if (event.target?.id === "institutionQuickEditModal") closeInstitutionQuickEdit();
});

getInstitutionQuickElement("quickEditCoverUploadBtn")?.addEventListener("click", () => {
  getInstitutionQuickElement("quickEditCoverFile")?.click();
});
getInstitutionQuickElement("quickEditLogoUploadBtn")?.addEventListener("click", () => {
  getInstitutionQuickElement("quickEditLogoFile")?.click();
});

getInstitutionQuickElement("quickEditCoverFile")?.addEventListener("change", event => {
  uploadInstitutionQuickImage("cover", event.target.files?.[0]);
});
getInstitutionQuickElement("quickEditLogoFile")?.addEventListener("change", event => {
  uploadInstitutionQuickImage("logo", event.target.files?.[0]);
});

getInstitutionQuickElement("institutionQuickEditForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const institutionId = String(
    getInstitutionQuickElement("quickEditInstitutionId")?.value || ""
  ).trim();
  if (!institutionId) return;

  const phone = String(getInstitutionQuickElement("quickEditPhone")?.value || "").trim();
  const locationVideoUrl = String(
    getInstitutionQuickElement("quickEditLocationVideoUrl")?.value || ""
  ).trim();
  const virtualTourUrl = String(
    getInstitutionQuickElement("quickEditVirtualTourUrl")?.value || ""
  ).trim();
  const active = Boolean(getInstitutionQuickElement("quickEditActive")?.checked);
  const offer = Boolean(getInstitutionQuickElement("quickEditOffer")?.checked);
  const vip = Boolean(getInstitutionQuickElement("quickEditVip")?.checked);
  const saveBtn = getInstitutionQuickElement("institutionQuickEditSaveBtn");

  if (saveBtn) saveBtn.disabled = true;
  setInstitutionQuickStatus("Değişiklikler kaydediliyor...", "uploading");

  try {
    const updates = {
      phone,
      status: active ? "active" : "passive",
      offer,
      vip,
      locationVideoUrl,
      virtualTourUrl,
      updatedAt: new Date().toISOString()
    };

    if (locationVideoUrl) updates.video = true;

    await db.collection("institutions").doc(institutionId).update(updates);

    const record = institutionRecords.find(
      item => String(item.id) === String(institutionId)
    );
    if (record) Object.assign(record, updates);

    renderManagedInstitutions();
    setInstitutionQuickStatus("✓ Hızlı değişiklikler kaydedildi.", "success");

    setTimeout(() => {
      closeInstitutionQuickEdit();
    }, 550);
  } catch (error) {
    console.error("Kurum hızlı düzenleme kaydedilemedi:", error);
    setInstitutionQuickStatus("Değişiklikler kaydedilemedi.", "error");
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
});

function openInstitutionEdit(id, data) {
  const form=document.getElementById("institutionEditForm");
  const saveMessage=document.getElementById("institutionEditSaveMessage");
  const saveBtn=document.getElementById("institutionEditSaveBtn");
  const categorySelect=document.getElementById("editCategory");
  const currentCategory=String(data.category || "diger").trim() || "diger";

  document.getElementById("editInstitutionId").value = id;
  document.getElementById("editName").value = data.name || "";

  // Eski veya yeni kategori değeri listede yoksa sessizce boş kalmasın.
  // Mevcut değeri geçici seçenek olarak koruyoruz.
  [...categorySelect.querySelectorAll('option[data-current-category="true"]')]
    .forEach(option=>option.remove());

  const categoryExists=[...categorySelect.options].some(option=>option.value===currentCategory);
  if(!categoryExists){
    const option=document.createElement("option");
    option.value=currentCategory;
    option.textContent="Mevcut kategori · "+currentCategory;
    option.dataset.currentCategory="true";
    categorySelect.appendChild(option);
  }
  categorySelect.value=currentCategory;

  document.getElementById("editCity").value = data.city || "";
  document.getElementById("editDistrict").value = data.district || "";
  document.getElementById("editAddress").value = data.address || "";
  document.getElementById("editPhone").value = data.phone || "";
  document.getElementById("editWebsite").value = data.website || "";
  document.getElementById("editLocationVideoUrl").value =
    data.locationVideoUrl || data.profileVideoUrl || data.videoUrl || "";
  document.getElementById("editLocationVideoStoragePath").value =
    data.locationVideoStoragePath || "";
  document.getElementById("editVirtualTourUrl").value =
    data.virtualTourUrl || data.tour360Url || data.tourUrl || "";
  document.getElementById("editCampaignVideoUrl").value =
    data.campaignVideoUrl || "";
  document.getElementById("editLat").value =
    data.lat === null || data.lat === undefined || data.lat === "" ? "" : data.lat;
  document.getElementById("editLng").value =
    data.lng === null || data.lng === undefined || data.lng === "" ? "" : data.lng;
  document.getElementById("editVip").checked = Boolean(data.vip);
  document.getElementById("editVideo").checked = Boolean(data.video);
  document.getElementById("editOffer").checked = data.offer !== false;
  syncInstitutionLocationVideoPreview();
  setInstitutionVideoStatus(
    document.getElementById("editLocationVideoUrl").value
      ? "Kayıtlı konum videosu hazır. Önizleyebilir, değiştirebilir veya kaldırabilirsiniz."
      : "MP4 / WebM / MOV yükleyebilirsiniz. Video Firebase Storage'a yüklenir ve kuruma otomatik bağlanır."
  );

  if(form)form.dataset.originalName=String(data.name||"");
  if(saveMessage){
    saveMessage.textContent="";
    saveMessage.className="institution-edit-save-message";
  }
  if(saveBtn){
    saveBtn.disabled=false;
    saveBtn.textContent="Değişiklikleri Kaydet";
  }

  institutionEditModal.classList.remove("hidden");
}

document.getElementById("closeInstitutionEditModal").addEventListener("click", () => {
  institutionEditModal.classList.add("hidden");
});

institutionEditModal.addEventListener("click", (e) => {
  if (e.target === institutionEditModal) {
    institutionEditModal.classList.add("hidden");
  }
});


document.getElementById("editLocationVideoUploadBtn")?.addEventListener("click", () => {
  document.getElementById("editLocationVideoFile")?.click();
});

document.getElementById("editLocationVideoFile")?.addEventListener("change", event => {
  const file = event.target.files?.[0] || null;
  if (file) uploadInstitutionLocationVideo(file);
});

document.getElementById("editLocationVideoPreviewBtn")?.addEventListener("click", () => {
  const url = String(document.getElementById("editLocationVideoUrl")?.value || "").trim();
  const preview = document.getElementById("editLocationVideoPreview");
  if (!url || !preview) return;

  preview.src = url;
  preview.hidden = false;
  preview.load();
  preview.play().catch(() => {});
  preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("editLocationVideoRemoveBtn")?.addEventListener("click", () => {
  removeInstitutionLocationVideo();
});

document.getElementById("editLocationVideoUrl")?.addEventListener("input", () => {
  syncInstitutionLocationVideoPreview();
});

document.getElementById("editVirtualTourPreviewBtn")?.addEventListener("click", () => {
  const url = String(document.getElementById("editVirtualTourUrl")?.value || "").trim();
  if (!url) {
    alert("Önce 360° Sanal Tur URL alanına bir bağlantı girin.");
    return;
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("invalid");
    window.open(parsed.href, "_blank", "noopener");
  } catch (_) {
    alert("360° Sanal Tur bağlantısı geçerli bir http/https adresi olmalıdır.");
  }
});

document.getElementById("editVirtualTourClearBtn")?.addEventListener("click", () => {
  const input = document.getElementById("editVirtualTourUrl");
  if (!input || !String(input.value || "").trim()) return;

  const ok = confirm("360° Sanal Tur bağlantısı temizlensin mi? Değişikliği kalıcı yapmak için ardından Değişiklikleri Kaydet'e basın.");
  if (!ok) return;

  input.value = "";
  input.focus();
});

document.getElementById("institutionEditForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form=e.currentTarget;
  const saveBtn=document.getElementById("institutionEditSaveBtn");
  const saveMessage=document.getElementById("institutionEditSaveMessage");
  const id=String(document.getElementById("editInstitutionId").value||"").trim();
  const name=String(document.getElementById("editName").value||"").trim();
  const category=String(document.getElementById("editCategory").value||"").trim();
  const city=String(document.getElementById("editCity").value||"").trim();
  const district=String(document.getElementById("editDistrict").value||"").trim();
  const latValue=String(document.getElementById("editLat").value||"").trim();
  const lngValue=String(document.getElementById("editLng").value||"").trim();
  const locationVideoUrl=String(document.getElementById("editLocationVideoUrl").value||"").trim();
  const locationVideoStoragePath=String(document.getElementById("editLocationVideoStoragePath").value||"").trim();
  const virtualTourUrl=String(document.getElementById("editVirtualTourUrl").value||"").trim();
  const campaignVideoUrl=String(document.getElementById("editCampaignVideoUrl").value||"").trim();

  const showSaveMessage=(text,state="")=>{
    if(!saveMessage)return;
    saveMessage.textContent=text;
    saveMessage.className="institution-edit-save-message"+(state?" "+state:"");
  };

  if(!id){
    showSaveMessage("Kurum kimliği bulunamadı. Pencereyi kapatıp kurumu yeniden açın.","error");
    return;
  }
  if(!name){
    showSaveMessage("Kurum adı boş bırakılamaz.","error");
    document.getElementById("editName").focus();
    return;
  }
  if(!category){
    showSaveMessage("Kategori seçimi boş bırakılamaz.","error");
    document.getElementById("editCategory").focus();
    return;
  }

  const lat=latValue==="" ? null : Number(latValue);
  const lng=lngValue==="" ? null : Number(lngValue);

  const isValidHttpUrl=value=>{
    if(!value)return true;
    try{
      const url=new URL(value);
      return url.protocol==="http:" || url.protocol==="https:";
    }catch(_){
      return false;
    }
  };

  if(!isValidHttpUrl(locationVideoUrl)){
    showSaveMessage("Konum Videosu bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("editLocationVideoUrl").focus();
    return;
  }
  if(!isValidHttpUrl(virtualTourUrl)){
    showSaveMessage("360° Sanal Tur bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("editVirtualTourUrl").focus();
    return;
  }
  if(!isValidHttpUrl(campaignVideoUrl)){
    showSaveMessage("Kampanya videosu bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("editCampaignVideoUrl").focus();
    return;
  }

  if(lat!==null && (!Number.isFinite(lat) || lat < -90 || lat > 90)){
    showSaveMessage("Enlem (lat) -90 ile 90 arasında olmalıdır.","error");
    document.getElementById("editLat").focus();
    return;
  }
  if(lng!==null && (!Number.isFinite(lng) || lng < -180 || lng > 180)){
    showSaveMessage("Boylam (lng) -180 ile 180 arasında olmalıdır.","error");
    document.getElementById("editLng").focus();
    return;
  }

  const updates={
    name,
    category,
    city,
    district,
    location:[city,district].filter(Boolean).join(", "),
    address:String(document.getElementById("editAddress").value||"").trim(),
    phone:String(document.getElementById("editPhone").value||"").trim(),
    website:String(document.getElementById("editWebsite").value||"").trim(),
    locationVideoUrl,
    locationVideoStoragePath,
    virtualTourUrl,
    tour360Url:virtualTourUrl,
    campaignVideoUrl,
    lat,
    lng,
    vip:document.getElementById("editVip").checked,
    video:document.getElementById("editVideo").checked,
    offer:document.getElementById("editOffer").checked,
    updatedAt:new Date().toISOString()
  };

  const oldText=saveBtn?.textContent || "Değişiklikleri Kaydet";
  if(saveBtn){
    saveBtn.disabled=true;
    saveBtn.textContent="Kaydediliyor...";
  }
  showSaveMessage("Değişiklikler kaydediliyor...","saving");

  try{
    const ref=db.collection("institutions").doc(id);
    const fresh=await ref.get();

    if(!fresh.exists){
      showSaveMessage("Bu kurum kaydı artık bulunamıyor. Listeyi yenileyin.","error");
      return;
    }

    await ref.update(updates);

    const record=institutionRecords.find(item=>String(item.id)===id);
    if(record)Object.assign(record,updates);

    showSaveMessage("✓ Değişiklikler kaydedildi.","success");
    renderManagedInstitutions();
    refreshAdminOverview();

    setTimeout(()=>{
      institutionEditModal.classList.add("hidden");
    },650);
  }catch(error){
    console.error("Kurum güncellenemedi:",error);

    let message="Değişiklikler kaydedilemedi.";
    if(String(error?.code||"").includes("permission-denied")){
      message="Kaydetme yetkisi reddedildi. Yönetici oturumunu yenileyip tekrar deneyin.";
    }else if(String(error?.code||"").includes("unavailable")){
      message="Firebase'e şu anda ulaşılamıyor. İnternet bağlantısını kontrol edip tekrar deneyin.";
    }

    showSaveMessage(message,"error");
  }finally{
    if(saveBtn){
      saveBtn.disabled=false;
      saveBtn.textContent=oldText;
    }
  }
});

async function deleteInstitution(id, name) {
  const ok = confirm(`${name} kurumunu yayından kaldırıp silmek istiyor musunuz?`);
  if (!ok) return;

  try {
    await db.collection("institutions").doc(id).delete();
    await loadInstitutions();
  } catch (error) {
    console.error("Kurum silinemedi:", error);
    alert("Kurum silinemedi.");
  }
}


function quoteMoney(value) {
  return new Intl.NumberFormat("tr-TR").format(Number(value || 0)) + " TL";
}

function getAdminQuoteLiveState(request) {
  if (String(request.status || "") === "archived") return "archived";
  const lock = request.liveLock || null;
  const offers = Array.isArray(request.liveOffers) ? request.liveOffers : [];
  const now = Date.now();
  if (lock) {
    if (lock.status === "used") return "used";
    if (lock.expiresAt && new Date(lock.expiresAt).getTime() <= now) return "expired";
    return "locked";
  }
  if (offers.length) {
    const hasActiveOffer = offers.some(offer =>
      !offer.expiresAt || new Date(offer.expiresAt).getTime() > now
    );
    return hasActiveOffer ? "offered" : "expired";
  }
  if (request.status === "done") return "done";
  if (request.status === "sent") return "sent";
  return "new";
}

function getAdminQuoteStateMeta(state) {
  const map = {
    new: ["Yeni / Teklif Yok", "status-new"],
    offered: ["Teklif Aktif", "status-offered"],
    locked: ["Kayıt Bekliyor", "status-locked"],
    used: ["Gerçek Kayıt Tamamlandı", "status-used"],
    expired: ["Süresi Doldu", "status-expired"],
    sent: ["İletildi", "status-sent"],
    done: ["Sonuçlandı", "status-done"],
    archived: ["Arşivlendi", "status-expired"]
  };
  return map[state] || [state || "Yeni", "status-new"];
}

function adminOfferListHtml(request) {
  const offers = Array.isArray(request.liveOffers)
    ? [...request.liveOffers].sort((a,b) => Number(a.price || 0) - Number(b.price || 0))
    : [];
  const lock = request.liveLock || null;

  const offersHtml = offers.length
    ? offers.map(offer => {
        const isSelected =
          lock && String(lock.institutionId || "") === String(offer.institutionId || "");
        const expired =
          offer.expiresAt &&
          new Date(offer.expiresAt).getTime() <= Date.now();
        const stateText = isSelected
          ? lock.status === "used"
            ? "Kullanıldı"
            : expired
              ? "Süresi Doldu"
              : "Seçildi / Kilitli"
          : expired
            ? "Süresi Doldu"
            : "Aktif Teklif";

        return `
          <div class="admin-offer-row ${isSelected ? "selected" : ""}">
            <div class="admin-offer-main">
              <strong>${escapeHtml(offer.institutionName || "Kurum")}</strong>
              <small>
                ${escapeHtml(offer.offerCode || "-")} ·
                ${escapeHtml(offer.vatStatus || "-")} ·
                ${formatDate(offer.expiresAt)}
              </small>
            </div>
            <div class="admin-offer-price">${quoteMoney(offer.price)}</div>
            <span class="admin-offer-state">${stateText}</span>
          </div>
        `;
      }).join("")
    : '<div class="admin-offer-empty">Henüz hiçbir kurum fiyat teklifi vermedi.</div>';

  const lockHtml = lock
    ? `
      <div class="admin-lock-summary">
        <div>
          <small>Seçilen / Kilitlenen Kurum</small>
          <strong>${escapeHtml(lock.institutionName || "-")}</strong>
        </div>
        <div>
          <small>Kilitli Fiyat</small>
          <strong>${quoteMoney(lock.lockedPrice ?? lock.price)}</strong>
        </div>
        <div>
          <small>Teklif No</small>
          <strong>${escapeHtml(lock.offerCode || "-")}</strong>
        </div>
        <div>
          <small>Geçerlilik</small>
          <strong>${formatDate(lock.expiresAt)}</strong>
        </div>
        <div>
          <small>Son Durum</small>
          <strong>${lock.status === "used"
            ? "Kullanıldı"
            : (lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now()
                ? "Süresi Doldu"
                : "Fiyat Kilitli")}</strong>
        </div>
        ${lock.usedAt ? `
          <div>
            <small>Kullanım Tarihi</small>
            <strong>${formatDate(lock.usedAt)}</strong>
          </div>
        ` : ""}
      </div>
    `
    : "";

  const issueHtml = Number(request.issueCount || 0) > 0
    ? `<div class="admin-offer-issue">⚠️ ${request.issueCount} sorun / ihlal bildirimi var</div>`
    : "";

  return `
    <div class="admin-offer-progress">
      <div class="admin-offer-progress-head">
        <strong>Teklif Sürecinin Son Hali</strong>
        <span>${offers.length} kurum teklifi</span>
      </div>
      ${lockHtml}
      <div class="admin-offer-list">${offersHtml}</div>
      ${issueHtml}
    </div>
  `;
}


function normalizeCategory(value){
  const raw=String(value||"")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g,"i")
    .replace(/ş/g,"s")
    .replace(/ğ/g,"g")
    .replace(/ü/g,"u")
    .replace(/ö/g,"o")
    .replace(/ç/g,"c");

  if(["surucu","surucu kursu","surucu kurslari","ehliyet"].includes(raw))return "surucu";
  if(["kres","kres anaokulu","kres & anaokulu","anaokulu"].includes(raw))return "kres";
  if(["yurt","ogrenci yurdu","ogrenci yurtlari"].includes(raw))return "yurt";
  if(["egitim","egitim & kurslar","kurs","kurslar"].includes(raw))return "egitim";
  if(["emlak","emlak & gayrimenkul","gayrimenkul"].includes(raw))return "emlak";
  if(["oto","oto servis","oto servis & sanayi","sanayi"].includes(raw))return "oto";
  if(["restoran","restoran & kafe","kafe"].includes(raw))return "restoran";
  if(["guzellik","guzellik & bakim","bakim"].includes(raw))return "guzellik";
  if(["saglik","saglik & klinik","klinik"].includes(raw))return "saglik";
  if(["dugun","dugun & organizasyon","organizasyon"].includes(raw))return "dugun";
  if(["evteknik","ev & teknik servis","teknik servis"].includes(raw))return "evteknik";
  if(["turizm","turizm & konaklama","konaklama"].includes(raw))return "turizm";
  if(["nakliyat","nakliyat & tasimacilik","tasimacilik"].includes(raw))return "nakliyat";
  if(["temizlik","temizlik hizmetleri"].includes(raw))return "temizlik";
  if(["mobilya","mobilya & dekorasyon","dekorasyon"].includes(raw))return "mobilya";
  if(["teknoloji","bilgisayar & teknoloji","bilgisayar"].includes(raw))return "teknoloji";
  if(["veteriner","veteriner & evcil hayvan","evcil hayvan"].includes(raw))return "veteriner";
  if(["spor","spor & fitness","fitness"].includes(raw))return "spor";
  if(["medya","fotograf & video","fotograf","video"].includes(raw))return "medya";
  if(["reklam","matbaa, reklam & tasarim","matbaa","grafik tasarim"].includes(raw))return "reklam";
  if(["insaat","insaat & tadilat","tadilat"].includes(raw))return "insaat";
  if(["tarim","tarim & hayvancilik","hayvancilik"].includes(raw))return "tarim";
  if(["hukuk","hukuk & danismanlik","avukat"].includes(raw))return "hukuk";
  if(["muhasebe","muhasebe & mali musavirlik","mali musavirlik"].includes(raw))return "muhasebe";
  if(["kurye","kurye & teslimat","teslimat"].includes(raw))return "kurye";
  if(["perakende","magaza & perakende","magaza"].includes(raw))return "perakende";
  if(["esnaf","yerel esnaf"].includes(raw))return "esnaf";
  if(["diger"].includes(raw))return "diger";
  return raw;
}

function quoteRoutingAgeMinutes(request){
  const value=request?.date || request?.createdAt || "";
  const time=new Date(value).getTime();
  if(!Number.isFinite(time))return 0;
  return Math.max(0,Math.floor((Date.now()-time)/60000));
}

function quoteRoutingAgeLabel(minutes){
  const mins=Math.max(0,Number(minutes||0));
  if(mins<60)return mins+" dk";
  const hours=Math.floor(mins/60);
  const rest=mins%60;
  if(hours<24)return hours+" sa"+(rest ? " "+rest+" dk" : "");
  const days=Math.floor(hours/24);
  const h=hours%24;
  return days+" gün"+(h ? " "+h+" sa" : "");
}

function quoteRoutingDirectRequest(request){
  return String(request?.requestType||"") === "direct" || Boolean(request?.targetInstitutionId);
}

function quoteRoutingFlowStatus(request){
  if(request?.liveLock || ["done","archived"].includes(String(request?.status||"")))return "completed";
  const forwarded=Array.isArray(request?.forwardInstitutionIds) && request.forwardInstitutionIds.length>0;
  const offers=Array.isArray(request?.liveOffers) ? request.liveOffers : [];
  const forwardedSet=new Set((request?.forwardInstitutionIds||[]).map(String));
  const routedOffers=offers.filter(offer=>forwardedSet.has(String(offer.institutionId||offer.id||"")));
  if(routedOffers.length)return "responded";
  if(forwarded)return "forwarded";
  if(quoteRoutingAgeMinutes(request)>=Number(quoteRoutingWaitMinutes?.value||30))return "waiting";
  return "fresh";
}

function quoteRoutingIsWaiting(request){
  const status=quoteRoutingFlowStatus(request);
  return status==="waiting" || status==="forwarded";
}

function quoteRoutingCandidateBundle(request){
  const category=normalizeCategory(request?.subCategory || request?.category || "");
  const city=String(request?.city||"").trim().toLocaleLowerCase("tr-TR");
  const district=String(request?.district||"").trim().toLocaleLowerCase("tr-TR");
  const originalTarget=String(request?.targetInstitutionId||"");
  const areaMode=String(quoteRoutingAreaMode?.value||"district");

  let base=institutionRecords.filter(inst=>{
    const id=String(inst.id||"");
    if(!id || id===originalTarget)return false;
    if(String(inst.status||"active")==="passive")return false;
    if(inst.offer===false)return false;
    const instCategory=normalizeCategory(inst.subCategory || inst.category || "");
    const instCity=String(inst.city||"").trim().toLocaleLowerCase("tr-TR");
    return instCategory===category && instCity===city;
  });

  let scopeLabel="Aynı şehir";
  if(areaMode==="district" && district){
    const exact=base.filter(inst=>String(inst.district||"").trim().toLocaleLowerCase("tr-TR")===district);
    if(exact.length){ base=exact; scopeLabel="Aynı ilçe"; }
    else scopeLabel="İlçede kurum yok · aynı şehir";
  }

  const forwarded=new Set(Array.isArray(request?.forwardInstitutionIds)?request.forwardInstitutionIds.map(String):[]);
  const tierOf=inst=>{
    if(isInstitutionVipActive(inst))return "vip";
    const adState=typeof getInstitutionAdState==="function" ? getInstitutionAdState(inst) : {advertiser:false};
    if(Boolean(adState?.advertiser))return "ad";
    return "standard";
  };

  const all=base.map(inst=>({
    ...inst,
    routingTier:tierOf(inst),
    alreadyForwarded:forwarded.has(String(inst.id))
  })).sort((a,b)=>{
    const rank={vip:1,ad:2,standard:3};
    return ((rank[a.routingTier]||9)-(rank[b.routingTier]||9)) ||
      String(a.name||"").localeCompare(String(b.name||""),"tr");
  });

  return {
    scopeLabel,all,
    vip:all.filter(inst=>inst.routingTier==="vip"),
    ad:all.filter(inst=>inst.routingTier==="ad"),
    standard:all.filter(inst=>inst.routingTier==="standard")
  };
}

function quoteRoutingInstitutionChips(rows){
  if(!rows.length)return '<span class="quote-routing-none">Uygun kurum yok</span>';
  return rows.map(inst=>{
    const account=leadCreditAccountRecords.find(x=>String(x.id)===String(inst.id));
    const balance=Number(account?.balance||0);
    const creditText=inst.alreadyForwarded ? " · iletildi" : " · "+balance+" kredi";
    return '<span class="quote-routing-inst-chip '+inst.routingTier+(inst.alreadyForwarded?' sent':'')+'">'+
      escapeHtml(inst.name||"Kurum")+creditText+
    '</span>';
  }).join("");
}

function quoteRoutingTierCard(tier,label,rows,requestId,canForward){
  const available=rows.filter(inst=>!inst.alreadyForwarded);
  const tierText=tier==="vip" ? "VIP" : tier==="ad" ? "Reklam Veren" : "Diğer";
  const disabled=!canForward || !available.length;
  const buttonText=!canForward ? "Şu anda yönlendirilemez" :
    available.length ? available.length+" kuruma ilet" : "İletilecek kurum yok";
  return '<div class="quote-routing-tier tier-'+tier+'">'+
    '<div class="quote-routing-tier-head"><div><span>'+tierText.toUpperCase()+'</span><strong>'+escapeHtml(label)+'</strong></div>'+
    '<button type="button" data-routing-forward="'+escapeHtml(requestId)+'" data-routing-tier="'+tier+'" '+(disabled?'disabled':'')+'>'+buttonText+'</button></div>'+
    '<div class="quote-routing-inst-list">'+quoteRoutingInstitutionChips(rows)+'</div>'+
  '</div>';
}

function updateQuoteRoutingBadge(){
  const waiting=quoteRequestRecords.filter(request=>quoteRoutingDirectRequest(request) && quoteRoutingIsWaiting(request)).length;
  if(quoteRoutingTabCount)quoteRoutingTabCount.textContent=String(waiting);
  if(quoteRoutingMainCount){ quoteRoutingMainCount.textContent=String(waiting); quoteRoutingMainCount.hidden=waiting<=0; }
  if(quoteRoutingMainBtn){
    quoteRoutingMainBtn.classList.toggle("has-opportunity",waiting>0);
    quoteRoutingMainBtn.title=waiting>0 ? waiting+" yanıtsız teklif gelir fırsatı bekliyor" : "Yanıtsız teklif gelir fırsatlarını yönet";
  }
}

function renderQuoteRoutingAdmin(){
  if(!quoteRoutingList)return;

  const search=String(quoteRoutingSearch?.value||"").trim().toLocaleLowerCase("tr-TR");
  const statusFilter=String(quoteRoutingStatusFilter?.value||"all");
  const directRows=quoteRequestRecords.filter(quoteRoutingDirectRequest);
  let rows=directRows.filter(request=>{
    const status=quoteRoutingFlowStatus(request);
    return statusFilter==="all" || status===statusFilter;
  });

  if(search){
    rows=rows.filter(request=>{
      const haystack=[request.name,request.phone,request.service,request.city,request.district,request.targetInstitutionName]
        .map(value=>String(value||"").toLocaleLowerCase("tr-TR")).join(" ");
      return haystack.includes(search);
    });
  }

  const waitingRows=directRows.filter(request=>quoteRoutingIsWaiting(request));
  const bundles=waitingRows.map(request=>({request,candidates:quoteRoutingCandidateBundle(request)}));
  const vipCount=bundles.reduce((sum,row)=>sum+row.candidates.vip.filter(x=>!x.alreadyForwarded).length,0);
  const forwardedCount=directRows.filter(request=>Array.isArray(request.forwardInstitutionIds)&&request.forwardInstitutionIds.length).length;
  const respondedCount=directRows.filter(request=>quoteRoutingFlowStatus(request)==="responded").length;

  if(quoteRoutingWaitingCount)quoteRoutingWaitingCount.textContent=String(waitingRows.length);
  if(quoteRoutingVipCount)quoteRoutingVipCount.textContent=String(vipCount);
  if(quoteRoutingForwardedCount)quoteRoutingForwardedCount.textContent=String(forwardedCount);
  if(quoteRoutingRespondedCount)quoteRoutingRespondedCount.textContent=String(respondedCount);
  if(quoteRoutingListCount)quoteRoutingListCount.textContent=rows.length+" kayıt";
  updateQuoteRoutingBadge();

  if(!rows.length){
    quoteRoutingList.innerHTML='<div class="quote-routing-empty"><strong>Bu filtrede özel teklif bulunmuyor.</strong><span>Filtreyi “Tüm özel talepler” yaparak bütün akışı görüntüleyebilirsiniz.</span></div>';
    return;
  }

  const statusMeta={
    fresh:["Yeni","fresh"],
    waiting:["Dağıtım bekliyor","waiting"],
    forwarded:["Yönlendirildi · yanıt bekliyor","forwarded"],
    responded:["Yönlendirmeden teklif geldi","responded"],
    completed:["Kayıt sürecine geçti","completed"]
  };

  quoteRoutingList.innerHTML=rows.map(request=>{
    const candidates=quoteRoutingCandidateBundle(request);
    const age=quoteRoutingAgeMinutes(request);
    const history=Array.isArray(request.forwardHistory)?request.forwardHistory:[];
    const last=history.length?history[history.length-1]:null;
    const totalForwarded=Array.isArray(request.forwardInstitutionIds)?request.forwardInstitutionIds.length:0;
    const flow=quoteRoutingFlowStatus(request);
    const meta=statusMeta[flow]||[flow,"fresh"];
    const offers=Array.isArray(request.liveOffers)?request.liveOffers:[];
    const forwardedSet=new Set((request.forwardInstitutionIds||[]).map(String));
    const routedOffers=offers.filter(offer=>forwardedSet.has(String(offer.institutionId||offer.id||"")));
    const canForward=request.allowAlternativeInstitutions===true && !request.liveLock && offers.length===0 && ["waiting","forwarded"].includes(flow);
    const consentHtml=request.allowAlternativeInstitutions===true
      ? '<div class="quote-routing-consent ok"><strong>✓ Müşteri paylaşım izni var</strong><span>Uygun kurumlara yönlendirilebilir.</span></div>'
      : '<div class="quote-routing-consent blocked"><strong>⚠ Müşteri paylaşım izni yok</strong><span>Başka kuruma iletmeden önce açık izin alınmalıdır.</span><button type="button" data-routing-consent="'+escapeHtml(request.id)+'">Müşteriden İzin Alındı</button></div>';

    const offerNames=routedOffers.map(offer=>escapeHtml(offer.institutionName||"Kurum")).join(", ");
    const responseHtml=routedOffers.length
      ? '<div class="quote-routing-response"><strong>✓ '+routedOffers.length+' yönlendirilmiş kurum teklif verdi</strong><span>'+offerNames+'</span></div>'
      : '';

    return '<article class="quote-routing-card flow-'+meta[1]+'" data-routing-quote="'+escapeHtml(request.id)+'">'+
      '<div class="quote-routing-card-head">'+
        '<div><span class="quote-routing-code">#'+escapeHtml(String(request.id||"").slice(0,9).toUpperCase())+'</span>'+
        '<span class="quote-routing-flow-badge '+meta[1]+'">'+meta[0]+'</span>'+
        '<h4>'+escapeHtml(request.service||"Teklif Talebi")+'</h4>'+
        '<p>'+escapeHtml(request.name||"Müşteri")+' · '+escapeHtml([request.city,request.district].filter(Boolean).join(" / ")||"-")+'</p></div>'+
        '<div class="quote-routing-wait"><span>Geçen süre</span><strong>'+escapeHtml(quoteRoutingAgeLabel(age))+'</strong></div>'+
      '</div>'+
      '<div class="quote-routing-original">'+
        '<div><span>İlk hedef kurum</span><strong>'+escapeHtml(request.targetInstitutionName||"Kurum")+'</strong></div>'+
        '<div><span>Dağıtım kapsamı</span><strong>'+escapeHtml(candidates.scopeLabel)+'</strong></div>'+
        '<div><span>İletilen</span><strong>'+totalForwarded+' kurum</strong></div>'+
        '<div><span>Teklif</span><strong>'+offers.length+' adet</strong></div>'+
        '<div><span>Son dağıtım</span><strong>'+(last?formatDate(last.date):"-")+'</strong></div>'+
      '</div>'+
      responseHtml+
      '<div class="quote-routing-customer-note"><span>Müşteri notu</span><strong>'+escapeHtml(request.note||"Not eklenmemiş.")+'</strong></div>'+
      consentHtml+
      '<div class="quote-routing-tiers">'+
        quoteRoutingTierCard("vip","Önce VIP kurumlara",candidates.vip,request.id,canForward)+
        quoteRoutingTierCard("ad","Sonra reklam veren kurumlara",candidates.ad,request.id,canForward)+
        quoteRoutingTierCard("standard","Son olarak diğer kurumlara",candidates.standard,request.id,canForward)+
      '</div>'+
      '<div class="quote-routing-card-actions">'+
        '<button type="button" data-routing-open="'+escapeHtml(request.id)+'">Talebi Aç</button>'+
        '<a href="https://wa.me/'+normalizeWhatsApp(request.phone)+'" target="_blank" rel="noopener">Müşteriye WhatsApp</a>'+
      '</div>'+
    '</article>';
  }).join("");

  quoteRoutingList.querySelectorAll("[data-routing-forward]").forEach(button=>button.addEventListener("click",async()=>{
    await forwardQuoteRoutingTier(button.dataset.routingForward,button.dataset.routingTier,button);
  }));
  quoteRoutingList.querySelectorAll("[data-routing-open]").forEach(button=>button.addEventListener("click",()=>openQuoteDetailModal(button.dataset.routingOpen)));
  quoteRoutingList.querySelectorAll("[data-routing-consent]").forEach(button=>button.addEventListener("click",async()=>{
    await markQuoteRoutingConsent(button.dataset.routingConsent,button);
  }));
}

async function markQuoteRoutingConsent(requestId,button){
  const request=quoteRequestRecords.find(item=>String(item.id)===String(requestId));
  if(!request)return;

  const ok=confirm(
    "Müşteriden bu talebin diğer uygun kurumlarla paylaşılmasına açık izin aldığınızı onaylıyor musunuz?\n\n"+
    "Bu kayıt yönetim işlem geçmişinde saklanır."
  );
  if(!ok)return;

  const oldText=button?.textContent||"İzin Alındı";
  if(button){
    button.disabled=true;
    button.textContent="Kaydediliyor...";
  }

  try{
    const now=new Date().toISOString();
    await db.collection("quoteRequests").doc(requestId).update({
      allowAlternativeInstitutions:true,
      alternativeConsentSource:"admin_customer_confirmation",
      alternativeConsentAt:now,
      alternativeConsentRecordedBy:"admin",
      updatedAt:now
    });
    await loadQuoteRequests();
    renderQuoteRoutingAdmin();
  }catch(error){
    console.error("Müşteri paylaşım izni kaydedilemedi:",error);
    alert("Müşteri paylaşım izni kaydedilemedi.");
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=oldText;
    }
  }
}

async function forwardQuoteRoutingTier(requestId,tier,button){
  const request=quoteRequestRecords.find(item=>String(item.id)===String(requestId));
  if(!request)return;
  if(request.allowAlternativeInstitutions!==true){
    alert("Müşteri bu talebin başka kurumlarla paylaşılmasına henüz izin vermedi.");
    return;
  }

  const candidates=quoteRoutingCandidateBundle(request);
  const rows=(candidates[tier]||[]).filter(inst=>!inst.alreadyForwarded);
  if(!rows.length){
    alert("Bu öncelik grubunda iletilecek yeni kurum yok.");
    return;
  }

  const tierLabel=tier==="vip" ? "VIP kurumlara" : tier==="ad" ? "reklam veren kurumlara" : "diğer kurumlara";
  const ok=confirm(
    request.service+" talebini "+rows.length+" "+tierLabel+" iletmek istiyor musunuz?\n\n"+
    "Müşterinin talebi değişmez. Seçilen kurumlara yalnızca bu talebi görme ve teklif verme yetkisi açılır."
  );
  if(!ok)return;

  const oldText=button?.textContent||"İlet";
  if(button){
    button.disabled=true;
    button.textContent="İletiliyor...";
  }

  try{
    const ref=db.collection("quoteRequests").doc(requestId);
    const lockRef=ref.collection("locks").doc("main");
    await db.runTransaction(async tx=>{
      const [snap,lockSnap]=await Promise.all([
        tx.get(ref),
        tx.get(lockRef)
      ]);
      if(!snap.exists)throw new Error("Talep bulunamadı.");
      if(lockSnap.exists)throw new Error("Bu talepte müşteri zaten bir teklifi kabul etmiş.");

      const data=snap.data();
      if(data.allowAlternativeInstitutions!==true){
        throw new Error("Müşteri paylaşım izni bulunmuyor.");
      }
      const existingIds=Array.isArray(data.forwardInstitutionIds)
        ? data.forwardInstitutionIds.map(String)
        : [];
      const set=new Set(existingIds);
      const newIds=[];

      rows.forEach(inst=>{
        const id=String(inst.id||"");
        if(id && !set.has(id)){
          set.add(id);
          newIds.push(id);
        }
      });

      if(!newIds.length)throw new Error("Bu kurumlara daha önce iletilmiş.");

      const history=Array.isArray(data.forwardHistory)?data.forwardHistory:[];
      const now=new Date().toISOString();

      tx.update(ref,{
        forwardInstitutionIds:[...set],
        forwardHistory:[
          ...history,
          {
            tier,
            tierLabel,
            institutionIds:newIds,
            institutionNames:rows.filter(inst=>newIds.includes(String(inst.id))).map(inst=>String(inst.name||"Kurum")),
            date:now
          }
        ].slice(-50),
        redistributionStatus:"forwarded",
        lastForwardedAt:now,
        lastForwardTier:tier,
        updatedAt:now
      });
    });

    alert(rows.length+" kuruma teklif fırsatı iletildi.");
    await loadQuoteRequests();
    renderQuoteRoutingAdmin();
  }catch(error){
    console.error("Teklif dağıtımı yapılamadı:",error);
    alert(error.message||"Teklif dağıtımı yapılamadı.");
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=oldText;
    }
  }
}

async function loadLeadRoutingSettings(){
  if(!leadPriceSingle)return;
  try{
    const snap=await db.collection("siteSettings").doc("leadRouting").get();
    const data=snap.exists?snap.data():{};
    const prices=data.packagePrices||{};
    leadPriceSingle.value=prices.single??"";
    leadPrice10.value=prices.credit10??"";
    leadPrice25.value=prices.credit25??"";
    leadPrice50.value=prices.credit50??"";
  }catch(error){
    console.warn("Teklif paketi fiyatları okunamadı:",error);
  }
}

async function saveLeadRoutingSettings(){
  if(!leadPackageSaveBtn)return;
  const oldText=leadPackageSaveBtn.textContent;
  leadPackageSaveBtn.disabled=true;
  leadPackageSaveBtn.textContent="Kaydediliyor...";
  if(leadPackageMessage)leadPackageMessage.textContent="";

  try{
    await db.collection("siteSettings").doc("leadRouting").set({
      packagePrices:{
        single:Number(leadPriceSingle?.value||0),
        credit10:Number(leadPrice10?.value||0),
        credit25:Number(leadPrice25?.value||0),
        credit50:Number(leadPrice50?.value||0)
      },
      priorityOrder:["vip","advertiser","standard"],
      creditUnit:"Yönlendirilmiş kurum teklif gönderdiğinde 1 kredi kullanılır",
      platformPayment:false,
      updatedAt:new Date().toISOString()
    },{merge:true});
    if(leadPackageMessage)leadPackageMessage.textContent="✓ Teklif kredisi paketleri kaydedildi.";
  }catch(error){
    console.error("Teklif paketi kaydedilemedi:",error);
    if(leadPackageMessage)leadPackageMessage.textContent="Paket fiyatları kaydedilemedi.";
  }finally{
    leadPackageSaveBtn.disabled=false;
    leadPackageSaveBtn.textContent=oldText;
  }
}

function leadCreditAccountMap(){
  return new Map(leadCreditAccountRecords.map(item=>[String(item.id),item]));
}

function leadCreditInstitutionStats(instId){
  const id=String(instId);
  const forwarded=quoteRequestRecords.filter(request=>
    Array.isArray(request.forwardInstitutionIds) && request.forwardInstitutionIds.map(String).includes(id)
  );
  const responded=forwarded.filter(request=>
    Array.isArray(request.liveOffers) && request.liveOffers.some(offer=>String(offer.institutionId||offer.id||"")===id)
  );
  return {forwarded:forwarded.length,responded:responded.length};
}

async function loadLeadCreditData(){
  try{
    const [accountSnap,ledgerSnap]=await Promise.all([
      db.collection("leadCreditAccounts").get(),
      db.collection("leadCreditLedger").get()
    ]);
    leadCreditAccountRecords=accountSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
    leadCreditLedgerRecords=ledgerSnap.docs.map(doc=>({id:doc.id,...doc.data()}))
      .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  }catch(error){
    console.error("Teklif kredisi kayıtları yüklenemedi:",error);
    leadCreditAccountRecords=[];
    leadCreditLedgerRecords=[];
  }
}

async function reconcileLeadCreditUsage(){
  const jobs=[];
  quoteRequestRecords.forEach(request=>{
    const forwarded=new Set(Array.isArray(request.forwardInstitutionIds)?request.forwardInstitutionIds.map(String):[]);
    const offers=Array.isArray(request.liveOffers)?request.liveOffers:[];
    offers.forEach(offer=>{
      const institutionId=String(offer.institutionId||offer.id||"");
      if(!institutionId || !forwarded.has(institutionId))return;
      jobs.push({request,offer,institutionId});
    });
  });

  for(const item of jobs){
    const ledgerId="usage_"+String(item.request.id)+"_"+item.institutionId;
    const ledgerRef=db.collection("leadCreditLedger").doc(ledgerId);
    const accountRef=db.collection("leadCreditAccounts").doc(item.institutionId);
    try{
      await db.runTransaction(async tx=>{
        const [ledgerSnap,accountSnap]=await Promise.all([tx.get(ledgerRef),tx.get(accountRef)]);
        if(ledgerSnap.exists)return;
        const current=accountSnap.exists?accountSnap.data():{};
        const before=Number(current.balance||0);
        const after=before-1;
        const totalUsed=Number(current.totalUsed||0)+1;
        const institution=institutionRecords.find(x=>String(x.id)===item.institutionId);
        const institutionName=String(item.offer.institutionName||institution?.name||"Kurum");
        const now=new Date().toISOString();

        tx.set(accountRef,{
          institutionId:item.institutionId,
          institutionName,
          balance:after,
          totalLoaded:Number(current.totalLoaded||0),
          totalUsed,
          updatedAt:now
        },{merge:true});

        tx.set(ledgerRef,{
          institutionId:item.institutionId,
          institutionName,
          type:"offer_usage",
          delta:-1,
          balanceBefore:before,
          balanceAfter:after,
          quoteId:String(item.request.id),
          service:String(item.request.service||""),
          note:"Yönlendirilmiş müşteri talebine teklif gönderildi",
          createdAt:now
        });
      });
    }catch(error){
      console.warn("Kredi kullanımı işlenemedi:",item.request.id,item.institutionId,error);
    }
  }
}

function renderLeadCreditAdmin(){
  if(!leadCreditTableBody)return;
  const accountMap=leadCreditAccountMap();
  const query=String(leadCreditSearch?.value||"").trim().toLocaleLowerCase("tr-TR");
  const status=String(leadCreditStatusFilter?.value||"");

  const rows=institutionRecords.map(inst=>{
    const account=accountMap.get(String(inst.id))||{};
    const stats=leadCreditInstitutionStats(inst.id);
    const balance=Number(account.balance||0);
    const totalLoaded=Number(account.totalLoaded||0);
    const totalUsed=Number(account.totalUsed||0);
    const tier=isInstitutionVipActive(inst)?"VIP":((typeof getInstitutionAdState==="function"&&getInstitutionAdState(inst)?.advertiser)?"Reklam Veren":"Standart");
    return {inst,balance,totalLoaded,totalUsed,tier,...stats};
  }).filter(row=>{
    const haystack=[row.inst.name,row.inst.city,row.inst.district,row.inst.category].join(" ").toLocaleLowerCase("tr-TR");
    if(query&&!haystack.includes(query))return false;
    if(status==="positive"&&row.balance<=0)return false;
    if(status==="zero"&&row.balance!==0)return false;
    if(status==="debt"&&row.balance>=0)return false;
    if(status==="used"&&row.totalUsed<=0)return false;
    return true;
  }).sort((a,b)=>{
    if(a.balance<0&&b.balance>=0)return -1;
    if(b.balance<0&&a.balance>=0)return 1;
    if(b.totalUsed!==a.totalUsed)return b.totalUsed-a.totalUsed;
    return String(a.inst.name||"").localeCompare(String(b.inst.name||""),"tr");
  });

  const totals=leadCreditAccountRecords.reduce((acc,item)=>{
    acc.balance+=Number(item.balance||0);
    acc.loaded+=Number(item.totalLoaded||0);
    acc.used+=Number(item.totalUsed||0);
    if(Number(item.balance||0)<0)acc.debt++;
    return acc;
  },{balance:0,loaded:0,used:0,debt:0});

  [leadCreditBalanceTotal,leadCreditBalanceSummary].forEach(el=>{if(el)el.textContent=String(totals.balance);});
  [leadCreditUsedTotal,leadCreditUsedSummary].forEach(el=>{if(el)el.textContent=String(totals.used);});
  if(leadCreditLoadedTotal)leadCreditLoadedTotal.textContent=String(totals.loaded);
  if(leadCreditDebtCount)leadCreditDebtCount.textContent=String(totals.debt);

  if(!rows.length){
    leadCreditTableBody.innerHTML='<tr><td colspan="8" class="lead-credit-empty-cell">Bu filtreye uygun kurum yok.</td></tr>';
  }else{
    leadCreditTableBody.innerHTML=rows.map(row=>{
      const balanceClass=row.balance<0?"debt":row.balance===0?"zero":"positive";
      return '<tr>'+
        '<td><strong>'+escapeHtml(row.inst.name||"Kurum")+'</strong><small>'+escapeHtml([row.inst.city,row.inst.district].filter(Boolean).join(" / ")||"-")+'</small></td>'+
        '<td><span class="lead-credit-tier '+(row.tier==="VIP"?"vip":row.tier==="Reklam Veren"?"ad":"standard")+'">'+row.tier+'</span></td>'+
        '<td>'+row.forwarded+'</td>'+
        '<td>'+row.responded+'</td>'+
        '<td>'+row.totalLoaded+'</td>'+
        '<td>'+row.totalUsed+'</td>'+
        '<td><strong class="lead-credit-balance '+balanceClass+'">'+row.balance+'</strong></td>'+
        '<td><button type="button" class="lead-credit-manage-btn" data-lead-credit-manage="'+escapeHtml(row.inst.id)+'">Kredi Yönet</button></td>'+
      '</tr>';
    }).join("");
  }

  if(leadCreditLedgerList){
    const recent=leadCreditLedgerRecords.slice(0,20);
    leadCreditLedgerList.innerHTML=recent.length?recent.map(item=>{
      const delta=Number(item.delta||0);
      return '<div class="lead-credit-ledger-row">'+
        '<div><strong>'+escapeHtml(item.institutionName||"Kurum")+'</strong><small>'+escapeHtml(item.note||item.type||"Kredi hareketi")+'</small></div>'+
        '<span class="'+(delta<0?"minus":"plus")+'">'+(delta>0?"+":"")+delta+' kredi</span>'+
        '<small>'+escapeHtml(formatDate(item.createdAt)||"-")+'</small>'+
      '</div>';
    }).join(""):'<div class="empty-state">Henüz kredi hareketi yok.</div>';
  }

  leadCreditTableBody.querySelectorAll("[data-lead-credit-manage]").forEach(button=>{
    button.addEventListener("click",()=>openLeadCreditModal(button.dataset.leadCreditManage));
  });
}

function openLeadCreditModal(institutionId){
  const inst=institutionRecords.find(x=>String(x.id)===String(institutionId));
  if(!inst||!leadCreditModal)return;
  const account=leadCreditAccountRecords.find(x=>String(x.id)===String(institutionId));
  leadCreditInstitutionId.value=String(institutionId);
  leadCreditModalInstitution.textContent=inst.name||"Kurum";
  leadCreditModalBalance.textContent=String(Number(account?.balance||0));
  leadCreditAction.value="add";
  leadCreditAmount.value="10";
  leadCreditNote.value="";
  if(leadCreditModalMessage)leadCreditModalMessage.textContent="";
  leadCreditModal.hidden=false;
}

function closeLeadCreditModal(){
  if(leadCreditModal)leadCreditModal.hidden=true;
}

async function saveLeadCreditAdjustment(){
  const institutionId=String(leadCreditInstitutionId?.value||"");
  const inst=institutionRecords.find(x=>String(x.id)===institutionId);
  const amount=Math.max(1,Math.floor(Number(leadCreditAmount?.value||0)));
  const action=String(leadCreditAction?.value||"add");
  const note=String(leadCreditNote?.value||"").trim();
  if(!institutionId||!inst||!Number.isFinite(amount))return;

  const delta=action==="remove"?-amount:amount;
  const accountRef=db.collection("leadCreditAccounts").doc(institutionId);
  const ledgerRef=db.collection("leadCreditLedger").doc();
  const oldText=leadCreditModalSaveBtn?.textContent||"Kaydet";
  if(leadCreditModalSaveBtn){leadCreditModalSaveBtn.disabled=true;leadCreditModalSaveBtn.textContent="Kaydediliyor...";}

  try{
    await db.runTransaction(async tx=>{
      const snap=await tx.get(accountRef);
      const current=snap.exists?snap.data():{};
      const before=Number(current.balance||0);
      const after=before+delta;
      const now=new Date().toISOString();
      tx.set(accountRef,{
        institutionId,
        institutionName:String(inst.name||"Kurum"),
        balance:after,
        totalLoaded:Number(current.totalLoaded||0)+(delta>0?delta:0),
        totalUsed:Number(current.totalUsed||0),
        updatedAt:now
      },{merge:true});
      tx.set(ledgerRef,{
        institutionId,
        institutionName:String(inst.name||"Kurum"),
        type:delta>0?"credit_add":"credit_remove",
        delta,
        balanceBefore:before,
        balanceAfter:after,
        note:note||(delta>0?"Yönetim panelinden kredi yüklendi":"Yönetim panelinden kredi çıkarıldı"),
        createdAt:now
      });
    });
    if(leadCreditModalMessage)leadCreditModalMessage.textContent="✓ Kredi işlemi kaydedildi.";
    await loadLeadCreditData();
    renderLeadCreditAdmin();
    setTimeout(closeLeadCreditModal,450);
  }catch(error){
    console.error("Kredi işlemi kaydedilemedi:",error);
    if(leadCreditModalMessage)leadCreditModalMessage.textContent="Kredi işlemi kaydedilemedi.";
  }finally{
    if(leadCreditModalSaveBtn){leadCreditModalSaveBtn.disabled=false;leadCreditModalSaveBtn.textContent=oldText;}
  }
}

quoteRoutingWaitMinutes?.addEventListener("change",renderQuoteRoutingAdmin);
quoteRoutingAreaMode?.addEventListener("change",renderQuoteRoutingAdmin);
quoteRoutingStatusFilter?.addEventListener("change",renderQuoteRoutingAdmin);
quoteRoutingSearch?.addEventListener("input",renderQuoteRoutingAdmin);
quoteRoutingRefreshBtn?.addEventListener("click",async()=>{
  if(!institutionRecords.length)await loadInstitutions();
  await loadQuoteRequests();
  await reconcileLeadCreditUsage();
  await loadLeadCreditData();
  renderQuoteRoutingAdmin();
  renderLeadCreditAdmin();
});
leadPackageSaveBtn?.addEventListener("click",saveLeadRoutingSettings);
leadCreditSearch?.addEventListener("input",renderLeadCreditAdmin);
leadCreditStatusFilter?.addEventListener("change",renderLeadCreditAdmin);
leadCreditRefreshBtn?.addEventListener("click",async()=>{
  await reconcileLeadCreditUsage();
  await loadLeadCreditData();
  renderQuoteRoutingAdmin();
  renderLeadCreditAdmin();
});
leadCreditModalCloseBtn?.addEventListener("click",closeLeadCreditModal);
leadCreditModalCancelBtn?.addEventListener("click",closeLeadCreditModal);
leadCreditModalSaveBtn?.addEventListener("click",saveLeadCreditAdjustment);
document.querySelectorAll("[data-lead-credit-quick]").forEach(button=>button.addEventListener("click",()=>{
  if(leadCreditAmount)leadCreditAmount.value=button.dataset.leadCreditQuick||"1";
}));
leadCreditModal?.addEventListener("click",event=>{if(event.target===leadCreditModal)closeLeadCreditModal();});

async function loadQuoteRequests() {
  adminQuoteActivityCache.clear();
  quoteRequestsList.innerHTML = "Teklif talepleri yükleniyor...";

  try {
    const snapshot = await db
      .collection("quoteRequests")
      .orderBy("date", "desc")
      .get();

    const baseRecords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    quoteRequestRecords = await Promise.all(
      baseRecords.map(async request => {
        const quoteRef = db.collection("quoteRequests").doc(request.id);

        try {
          const [offersSnapshot, lockSnapshot, issuesSnapshot] = await Promise.all([
            quoteRef.collection("offers").get(),
            quoteRef.collection("locks").doc("main").get(),
            quoteRef.collection("offerIssues").get()
          ]);

          const liveIssues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const enriched = {
            ...request,
            liveOffers: offersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            liveLock: lockSnapshot.exists ? lockSnapshot.data() : null,
            liveIssues,
            issueCount: liveIssues.length
          };

          enriched.currentState = getAdminQuoteLiveState(enriched);
          return enriched;
        } catch (detailError) {
          console.error("Teklif süreç detayı yüklenemedi:", request.id, detailError);

          const enriched = {
            ...request,
            liveOffers: [],
            liveLock: null,
            liveIssues: [],
            issueCount: 0,
            liveDetailError: true
          };

          enriched.currentState = getAdminQuoteLiveState(enriched);
          return enriched;
        }
      })
    );

    updateQuoteDashboardStats();
    renderQuoteRequests();
    buildInstitutionOfferReport();
    renderInstitutionOfferReport();
    refreshAdminOverview();
    renderIssueCenter();
    renderQuoteRoutingAdmin();

  } catch (error) {
    console.error("Teklif talepleri yüklenemedi:", error);
    quoteRequestsList.innerHTML =
      "<p>Teklif talepleri yüklenemedi. Firestore kurallarını kontrol edin.</p>";
  }
}

const reportCategoryLabels = {
  surucu:"Sürücü Kursu",
  kres:"Kreş & Anaokulu",
  yurt:"Öğrenci Yurdu",
  egitim:"Eğitim & Kurslar",
  dershane:"Dershane / Kurs Merkezi",
  ozel_ders:"Özel Ders",
  dil_kursu:"Dil Kursu",
  etut:"Etüt Merkezi",
  ozel_okul:"Özel Okul",
  oto:"Oto Servis & Sanayi",
  oto_servis:"Oto Servis / Tamir",
  kaporta_boya:"Kaporta / Boya",
  oto_elektrik:"Oto Elektrik",
  lastik_jant:"Lastik / Jant",
  oto_yikama:"Oto Yıkama / Kuaför",
  ekspertiz:"Oto Ekspertiz",
  galeri:"Oto Galeri",
  rentacar:"Rent a Car",
  yedek_parca:"Yedek Parça",
  motosiklet:"Motosiklet Servisi",
  restoran:"Restoran & Kafe",
  kafe:"Kafe",
  fastfood:"Fast Food",
  pastane:"Pastane",
  pizza:"Pizza",
  doner:"Döner",
  saglik:"Sağlık & Klinik",
  klinik:"Sağlık Kliniği",
  dis_klinigi:"Diş Kliniği",
  psikolog:"Psikolog",
  diyetisyen:"Diyetisyen",
  fizyoterapi:"Fizyoterapi",
  guzellik:"Güzellik Merkezi",
  kuafor:"Kuaför",
  berber:"Berber",
  spor:"Pilates / Fitness",
  mobilya:"Mobilya",
  dekorasyon:"Dekorasyon",
  insaat:"İnşaat / Tadilat",
  elektrikci:"Elektrikçi",
  tesisatci:"Tesisatçı",
  teknik_servis:"Teknik Servis",
  klima:"Klima Servisi",
  cam_balkon:"Cam Balkon / PVC",
  temizlik:"Temizlik Hizmetleri",
  emlak:"Emlak",
  emlak_ofisi:"Emlak Ofisi",
  konut:"Konut",
  arsa:"Arsa / Tarla",
  ticari:"Ticari Gayrimenkul",
  turizm:"Turizm & Konaklama",
  otel:"Otel",
  pansiyon:"Pansiyon",
  apart:"Apart",
  bungalov:"Bungalov",
  seyahat:"Seyahat Acentesi / Tur",
  dugun:"Düğün & Organizasyon",
  dugun_salonu:"Düğün Salonu",
  organizasyon:"Organizasyon Firması",
  fotograf:"Fotoğrafçı",
  medya:"Fotoğraf & Video",
  video:"Video Çekimi",
  drone:"Drone Çekimi",
  reklam:"Reklam / Tasarım / Matbaa",
  nakliyat:"Evden Eve Nakliyat",
  kurye:"Kurye",
  muhasebe:"Muhasebe / Mali Müşavir",
  hukuk:"Avukat / Hukuk",
  teknoloji:"Bilgisayar & Teknoloji",
  bilgisayar:"Bilgisayar / Teknoloji",
  veteriner:"Veteriner / Pet Hizmetleri",
  tarim:"Tarım / Hayvancılık",
  perakende:"Mağaza & Perakende",
  esnaf:"Yerel Esnaf",
  diger:"Diğer"
};

function getReportCategoryLabel(value) {
  return reportCategoryLabels[value] || value || "-";
}

function getOfferEventDate(offer, request) {
  return (
    offer.updatedAt ||
    offer.createdAt ||
    offer.date ||
    request.date ||
    null
  );
}

function getAdminOfferEventState(offer, request) {
  const lock = request.liveLock || null;
  const now = Date.now();

  if (lock) {
    const sameInstitution =
      String(lock.institutionId || "") === String(offer.institutionId || offer.id || "");

    if (sameInstitution) {
      if (lock.status === "used") return "used";
      if (lock.expiresAt && new Date(lock.expiresAt).getTime() <= now) return "expired";
      return "locked";
    }

    return "lost";
  }

  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= now) {
    return "expired";
  }

  return "active";
}

function buildInstitutionOfferReport() {
  const institutionMap = new Map(
    institutionRecords.map(item => [String(item.id), item])
  );

  institutionOfferReportEvents = [];

  quoteRequestRecords.forEach(request => {
    const offers = Array.isArray(request.liveOffers) ? request.liveOffers : [];

    offers.forEach(offer => {
      const institutionId = String(
        offer.institutionId ||
        offer.id ||
        offer.institutionName ||
        "unknown"
      );

      const institution = institutionMap.get(institutionId) || {};
      const state = getAdminOfferEventState(offer, request);
      const price = Number(offer.price || 0);
      const lock = request.liveLock || null;
      const sameLock =
        lock &&
        String(lock.institutionId || "") === String(offer.institutionId || offer.id || "");

      institutionOfferReportEvents.push({
        institutionId,
        institutionName:
          offer.institutionName ||
          institution.name ||
          "Kurum",
        category:
          institution.subCategory ||
          institution.category ||
          request.subCategory ||
          request.category ||
          "",
        city:
          institution.city ||
          request.city ||
          "",
        district:
          institution.district ||
          request.district ||
          "",
        price: Number.isFinite(price) ? price : 0,
        offerCode: offer.offerCode || "-",
        vatStatus: offer.vatStatus || "-",
        scope: offer.scope || "",
        conditions: offer.conditions || "",
        expiresAt: offer.expiresAt || null,
        offerDate: getOfferEventDate(offer, request),
        state,
        requestId: request.id,
        requestDate: request.date || null,
        service: request.service || "Teklif Talebi",
        customerName: request.name || "-",
        customerPhone: request.phone || "-",
        requestCity: request.city || "",
        requestDistrict: request.district || "",
        lockedPrice: sameLock
          ? Number(lock.lockedPrice ?? lock.price ?? offer.price ?? 0)
          : 0
      });
    });
  });

  populateOfferReportFilters();
}

function getOfferReportPeriodStart() {
  const value = offerReportPeriod?.value || "all";
  if (value === "all") return null;

  const days = Number(value);
  if (!Number.isFinite(days)) return null;

  const start = new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - (days - 1));
  return start.getTime();
}

function getOfferReportFilteredEvents() {
  const periodStart = getOfferReportPeriodStart();
  const category = offerReportCategory?.value || "";
  const city = offerReportCity?.value || "";

  return institutionOfferReportEvents.filter(event => {
    if (periodStart) {
      const time = new Date(event.offerDate || 0).getTime();
      if (!time || time < periodStart) return false;
    }

    if (category && event.category !== category) return false;
    if (city && event.city !== city) return false;

    return true;
  });
}

function aggregateInstitutionOfferEvents(events) {
  const byInstitution = new Map();

  events.forEach(event => {
    if (!byInstitution.has(event.institutionId)) {
      byInstitution.set(event.institutionId, {
        institutionId: event.institutionId,
        institutionName: event.institutionName,
        category: event.category,
        city: event.city,
        district: event.district,
        offerCount: 0,
        totalPrice: 0,
        prices: [],
        activeCount: 0,
        lockedCount: 0,
        usedCount: 0,
        lostCount: 0,
        expiredCount: 0,
        responseMinutesTotal: 0,
        responseMinutesCount: 0,
        latestOfferDate: null,
        events: []
      });
    }

    const row = byInstitution.get(event.institutionId);

    row.offerCount += 1;
    row.totalPrice += event.price;
    if (event.price > 0) row.prices.push(event.price);

    if (event.state === "active") row.activeCount += 1;
    if (event.state === "locked") row.lockedCount += 1;
    if (event.state === "used") row.usedCount += 1;
    if (event.state === "lost") row.lostCount += 1;
    if (event.state === "expired") row.expiredCount += 1;

    if (event.offerDate && event.requestDate) {
      const responseMinutes =
        (new Date(event.offerDate).getTime() - new Date(event.requestDate).getTime()) / 60000;
      if (Number.isFinite(responseMinutes) && responseMinutes >= 0) {
        row.responseMinutesTotal += responseMinutes;
        row.responseMinutesCount += 1;
      }
    }

    if (
      event.offerDate &&
      (!row.latestOfferDate ||
        new Date(event.offerDate).getTime() > new Date(row.latestOfferDate).getTime())
    ) {
      row.latestOfferDate = event.offerDate;
    }

    row.events.push(event);
  });

  return [...byInstitution.values()].map(row => {
    const selectedCount = row.lockedCount + row.usedCount;

    return {
      ...row,
      selectedCount,
      averagePrice: row.offerCount ? row.totalPrice / row.offerCount : 0,
      minPrice: row.prices.length ? Math.min(...row.prices) : 0,
      maxPrice: row.prices.length ? Math.max(...row.prices) : 0,
      selectionRate: row.offerCount ? (selectedCount / row.offerCount) * 100 : 0,
      usageRate: row.offerCount ? (row.usedCount / row.offerCount) * 100 : 0,
      averageResponseMinutes: row.responseMinutesCount
        ? row.responseMinutesTotal / row.responseMinutesCount
        : 0,
      responseRate: 0,
      eligibleRequestCount: 0
    };
  });
}

function populateOfferReportFilters() {
  if (!offerReportCategory || !offerReportCity) return;

  const selectedCategory = offerReportCategory.value;
  const selectedCity = offerReportCity.value;

  const categories = [...new Set(
    institutionOfferReportEvents
      .map(item => item.category)
      .filter(Boolean)
  )].sort((a,b) =>
    getReportCategoryLabel(a).localeCompare(getReportCategoryLabel(b), "tr")
  );

  const cities = [...new Set(
    institutionOfferReportEvents
      .map(item => item.city)
      .filter(Boolean)
  )].sort((a,b) => a.localeCompare(b, "tr"));

  offerReportCategory.innerHTML =
    '<option value="">Tüm kategoriler</option>' +
    categories.map(value =>
      `<option value="${escapeHtml(value)}">${escapeHtml(getReportCategoryLabel(value))}</option>`
    ).join("");

  offerReportCity.innerHTML =
    '<option value="">Tüm şehirler</option>' +
    cities.map(value =>
      `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
    ).join("");

  if (categories.includes(selectedCategory)) {
    offerReportCategory.value = selectedCategory;
  }

  if (cities.includes(selectedCity)) {
    offerReportCity.value = selectedCity;
  }
}

function formatResponseDuration(minutes) {
  const value = Number(minutes || 0);
  if (!value) return "-";
  if (value < 60) return Math.round(value) + " dk";
  if (value < 1440) return (value / 60).toFixed(value < 120 ? 1 : 0).replace(".", ",") + " sa";
  return (value / 1440).toFixed(1).replace(".", ",") + " gün";
}

function renderInstitutionOfferReport() {
  if (!offerReportTableBody) return;

  const query = String(offerReportSearch?.value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");

  const sort = offerReportSort?.value || "offers_desc";
  const filteredEvents = getOfferReportFilteredEvents();

  let rows = aggregateInstitutionOfferEvents(filteredEvents).filter(row => {
    const haystack = [
      row.institutionName,
      getReportCategoryLabel(row.category),
      row.city,
      row.district
    ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

    return !query || haystack.includes(query);
  });

  const periodStart = getOfferReportPeriodStart();

  rows.forEach(row => {
    const eligible = quoteRequestRecords.filter(request => {
      if (periodStart) {
        const requestTime = new Date(request.date || 0).getTime();
        if (!requestTime || requestTime < periodStart) return false;
      }

      const requestCategory = String(request.subCategory || request.category || "");
      const rowCategory = String(row.category || "");
      const categoryMatch = requestCategory === rowCategory;
      const cityMatch = String(request.city || "") === String(row.city || "");

      return categoryMatch && cityMatch;
    }).length;

    row.eligibleRequestCount = eligible;
    row.responseRate = eligible
      ? Math.min(100, (row.offerCount / eligible) * 100)
      : 0;
  });

  institutionOfferReportRecords = rows;

  rows = [...rows];

  if (sort === "offers_desc") {
    rows.sort((a,b) => b.offerCount - a.offerCount);
  } else if (sort === "locked_desc") {
    rows.sort((a,b) => b.selectedCount - a.selectedCount || b.offerCount - a.offerCount);
  } else if (sort === "used_desc") {
    rows.sort((a,b) => b.usedCount - a.usedCount || b.selectedCount - a.selectedCount);
  } else if (sort === "selection_desc") {
    rows.sort((a,b) => b.selectionRate - a.selectionRate || b.offerCount - a.offerCount);
  } else if (sort === "response_desc") {
    rows.sort((a,b) => b.responseRate - a.responseRate || b.offerCount - a.offerCount);
  } else if (sort === "response_time_asc") {
    rows.sort((a,b) => {
      const av = a.averageResponseMinutes || Number.MAX_SAFE_INTEGER;
      const bv = b.averageResponseMinutes || Number.MAX_SAFE_INTEGER;
      return av - bv;
    });
  } else if (sort === "volume_desc") {
    rows.sort((a,b) => b.totalPrice - a.totalPrice);
  } else if (sort === "average_asc") {
    rows.sort((a,b) => a.averagePrice - b.averagePrice);
  } else if (sort === "average_desc") {
    rows.sort((a,b) => b.averagePrice - a.averagePrice);
  } else if (sort === "latest_desc") {
    rows.sort((a,b) =>
      new Date(b.latestOfferDate || 0).getTime() -
      new Date(a.latestOfferDate || 0).getTime()
    );
  } else if (sort === "name_asc") {
    rows.sort((a,b) =>
      String(a.institutionName || "").localeCompare(
        String(b.institutionName || ""),
        "tr"
      )
    );
  }

  const allOffers = rows.reduce((sum,row) => sum + row.offerCount, 0);
  const allVolume = rows.reduce((sum,row) => sum + row.totalPrice, 0);
  const allActive = rows.reduce((sum,row) => sum + row.activeCount, 0);
  const allLockedOnly = rows.reduce((sum,row) => sum + row.lockedCount, 0);
  const allUsed = rows.reduce((sum,row) => sum + row.usedCount, 0);
  const allSelected = allLockedOnly + allUsed;
  const selectionRate = allOffers ? (allSelected / allOffers) * 100 : 0;

  if (offerReportInstitutionCount) offerReportInstitutionCount.textContent = rows.length;
  if (offerReportTotalOffers) offerReportTotalOffers.textContent = allOffers;
  if (offerReportTotalVolume) offerReportTotalVolume.textContent = quoteMoney(allVolume);
  if (offerReportAveragePrice) {
    offerReportAveragePrice.textContent = quoteMoney(allOffers ? allVolume / allOffers : 0);
  }
  if (offerReportActiveCount) offerReportActiveCount.textContent = allActive;
  if (offerReportLockedCount) offerReportLockedCount.textContent = allSelected;
  if (offerReportUsedCount) offerReportUsedCount.textContent = allUsed;
  if (offerReportSelectionRate) {
    offerReportSelectionRate.textContent = "%" + selectionRate.toFixed(1).replace(".", ",");
  }

  if (offerReportCount) {
    const periodLabel =
      offerReportPeriod?.selectedOptions?.[0]?.textContent || "Tüm zamanlar";
    offerReportCount.textContent =
      `${rows.length} kurum · ${allOffers} teklif · ${periodLabel}`;
  }

  if (!rows.length) {
    offerReportTableBody.innerHTML = `
      <tr>
        <td colspan="13" class="offer-report-empty">
          ${institutionOfferReportEvents.length
            ? "Seçili filtrelere uygun teklif veren kurum bulunamadı."
            : "Henüz fiyat teklifi veren kurum bulunmuyor."}
        </td>
      </tr>
    `;
    return;
  }

  offerReportTableBody.innerHTML = rows.map(row => `
    <tr>
      <td>
        <div class="report-institution">
          <strong>${escapeHtml(row.institutionName || "Kurum")}</strong>
          <small>ID: ${escapeHtml(row.institutionId || "-")}</small>
        </div>
      </td>
      <td>
        <div class="report-location">
          <strong>${escapeHtml(getReportCategoryLabel(row.category))}</strong>
          <small>${escapeHtml([row.city,row.district].filter(Boolean).join(" / ") || "-")}</small>
        </div>
      </td>
      <td><strong>${row.offerCount}</strong></td>
      <td><strong>${quoteMoney(row.totalPrice)}</strong></td>
      <td>${quoteMoney(row.averagePrice)}</td>
      <td><span class="report-badge active">${row.activeCount}</span></td>
      <td><span class="report-badge locked">${row.selectedCount}</span></td>
      <td><span class="report-badge used">${row.usedCount}</span></td>
      <td>
        <div class="report-rate">
          <strong>%${row.responseRate.toFixed(1).replace(".", ",")}</strong>
          <span><i style="width:${Math.min(100,row.responseRate)}%"></i></span>
        </div>
      </td>
      <td>
        <div class="report-rate">
          <strong>%${row.selectionRate.toFixed(1).replace(".", ",")}</strong>
          <span><i style="width:${Math.min(100,row.selectionRate)}%"></i></span>
        </div>
      </td>
      <td>${formatResponseDuration(row.averageResponseMinutes)}</td>
      <td>${row.latestOfferDate ? formatDate(row.latestOfferDate) : "-"}</td>
      <td>
        <button
          type="button"
          class="report-detail-btn"
          data-report-detail="${escapeHtml(row.institutionId)}"
        >Detay</button>
      </td>
    </tr>
  `).join("");

  offerReportTableBody
    .querySelectorAll("[data-report-detail]")
    .forEach(button => {
      button.addEventListener("click", () => {
        openInstitutionOfferReportDetail(button.dataset.reportDetail);
      });
    });
}

function offerEventStateLabel(state) {
  const map = {
    active:"Aktif",
    locked:"Kilitli / Seçildi",
    used:"Kullanıldı",
    lost:"Başka Kurum Seçildi",
    expired:"Süresi Doldu"
  };
  return map[state] || state || "-";
}

function openInstitutionOfferReportDetail(institutionId) {
  const row = institutionOfferReportRecords.find(
    item => String(item.institutionId) === String(institutionId)
  );

  if (!row || !offerReportDetailModal) return;

  offerReportDetailTitle.textContent = row.institutionName || "Kurum";
  offerReportDetailMeta.textContent =
    [
      getReportCategoryLabel(row.category),
      [row.city,row.district].filter(Boolean).join(" / ")
    ].filter(Boolean).join(" · ");

  offerReportDetailSummary.innerHTML = `
    <article><span>Toplam Teklif</span><strong>${row.offerCount}</strong></article>
    <article><span>Teklif Hacmi</span><strong>${quoteMoney(row.totalPrice)}</strong></article>
    <article><span>Ortalama</span><strong>${quoteMoney(row.averagePrice)}</strong></article>
    <article><span>En Düşük</span><strong>${quoteMoney(row.minPrice)}</strong></article>
    <article><span>En Yüksek</span><strong>${quoteMoney(row.maxPrice)}</strong></article>
    <article><span>Aktif</span><strong>${row.activeCount}</strong></article>
    <article><span>Seçilen</span><strong>${row.selectedCount}</strong></article>
    <article><span>Kullanılan</span><strong>${row.usedCount}</strong></article>
    <article><span>Kaybedilen</span><strong>${row.lostCount}</strong></article>
    <article><span>Süresi Dolan</span><strong>${row.expiredCount}</strong></article>
    <article><span>Teklif Verme Oranı</span><strong>%${row.responseRate.toFixed(1).replace(".", ",")}</strong></article>
    <article><span>Seçilme Oranı</span><strong>%${row.selectionRate.toFixed(1).replace(".", ",")}</strong></article>
    <article><span>Kullanım Oranı</span><strong>%${row.usageRate.toFixed(1).replace(".", ",")}</strong></article>
    <article><span>Ort. Yanıt Süresi</span><strong>${formatResponseDuration(row.averageResponseMinutes)}</strong></article>
  `;

  const events = [...row.events].sort((a,b) =>
    new Date(b.offerDate || 0).getTime() -
    new Date(a.offerDate || 0).getTime()
  );

  offerReportDetailTableBody.innerHTML = events.map(event => `
    <tr>
      <td>${event.offerDate ? formatDate(event.offerDate) : "-"}</td>
      <td>
        <div class="offer-detail-service">
          <strong>${escapeHtml(event.service || "Teklif Talebi")}</strong>
          <small>${escapeHtml(event.customerName || "-")} · ${escapeHtml(event.customerPhone || "-")}</small>
        </div>
      </td>
      <td>${escapeHtml([event.requestCity,event.requestDistrict].filter(Boolean).join(" / ") || "-")}</td>
      <td><strong>${quoteMoney(event.price)}</strong></td>
      <td>${escapeHtml(event.offerCode || "-")}</td>
      <td>
        <span class="offer-event-state state-${escapeHtml(event.state)}">
          ${escapeHtml(offerEventStateLabel(event.state))}
        </span>
      </td>
    </tr>
  `).join("");

  offerReportDetailModal.classList.remove("hidden");
}

function closeInstitutionOfferReportDetailModalFn() {
  offerReportDetailModal?.classList.add("hidden");
}

function csvCell(value) {
  const text = String(value ?? "");
  return '"' + text.replace(/"/g,'""') + '"';
}

function exportInstitutionOfferReportCsv() {
  if (!institutionOfferReportRecords.length) {
    alert("Dışa aktarılacak rapor bulunamadı.");
    return;
  }

  const headers = [
    "Kurum","Kategori","Şehir","İlçe","Toplam Teklif",
    "Teklif Hacmi","Ortalama Teklif","En Düşük","En Yüksek",
    "Aktif","Seçilen","Kullanılan","Kaybedilen","Süresi Dolan",
    "Teklif Verme Oranı","Seçilme Oranı","Kullanım Oranı","Ortalama Yanıt Dakika","Son Teklif"
  ];

  const rows = institutionOfferReportRecords.map(row => [
    row.institutionName,
    getReportCategoryLabel(row.category),
    row.city,
    row.district,
    row.offerCount,
    row.totalPrice,
    Math.round(row.averagePrice),
    row.minPrice,
    row.maxPrice,
    row.activeCount,
    row.selectedCount,
    row.usedCount,
    row.lostCount,
    row.expiredCount,
    row.responseRate.toFixed(1),
    row.selectionRate.toFixed(1),
    row.usageRate.toFixed(1),
    Math.round(row.averageResponseMinutes || 0),
    row.latestOfferDate ? formatDate(row.latestOfferDate) : "-"
  ]);

  const csv =
    "\uFEFF" +
    [headers,...rows]
      .map(row => row.map(csvCell).join(";"))
      .join("\n");

  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dijiyer-teklif-veren-kurumlar.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

offerReportSearch?.addEventListener("input", renderInstitutionOfferReport);
offerReportPeriod?.addEventListener("change", renderInstitutionOfferReport);
offerReportCategory?.addEventListener("change", renderInstitutionOfferReport);
offerReportCity?.addEventListener("change", renderInstitutionOfferReport);
offerReportSort?.addEventListener("change", renderInstitutionOfferReport);
offerReportExportBtn?.addEventListener("click", exportInstitutionOfferReportCsv);
closeOfferReportDetailModal?.addEventListener("click", closeInstitutionOfferReportDetailModalFn);
offerReportDetailModal?.addEventListener("click", event => {
  if (event.target === offerReportDetailModal) {
    closeInstitutionOfferReportDetailModalFn();
  }
});

function adminActivityInstitutionName(request, institutionId) {
  const offers = Array.isArray(request.liveOffers) ? request.liveOffers : [];
  const offer = offers.find(item =>
    String(item.institutionId || item.id || "") === String(institutionId || "")
  );
  if (offer && offer.institutionName) return offer.institutionName;

  const institution = institutionRecords.find(item =>
    String(item.id) === String(institutionId || "")
  );
  return institution && institution.name ? institution.name : "Kurum";
}

function adminActivityDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function pushAdminActivity(events, event) {
  const date = adminActivityDate(event.date);
  if (!date) return;
  events.push({
    category:event.category || "admin",
    actor:event.actor || "Sistem",
    title:event.title || "İşlem",
    detail:event.detail || "",
    institutionId:event.institutionId || "",
    date
  });
}

function buildAdminQuoteActivityEvents(request, engagementRecords, messages) {
  const events = [];

  pushAdminActivity(events,{
    category:"request",
    actor:"Müşteri · " + (request.name || "Müşteri"),
    title:"Teklif talebi oluşturuldu",
    detail:[
      request.service || "",
      [request.city,request.district].filter(Boolean).join(" / "),
      request.note ? "Not: " + request.note : ""
    ].filter(Boolean).join(" · "),
    date:request.date
  });

  (Array.isArray(request.liveOffers) ? request.liveOffers : []).forEach(offer => {
    const institutionName = offer.institutionName || adminActivityInstitutionName(request, offer.institutionId || offer.id);
    const offerDetail = [
      "Fiyat: " + quoteMoney(offer.price),
      "KDV: " + (offer.vatStatus || "-"),
      offer.extraFee ? "Ek ücret: " + offer.extraFee : "",
      offer.scope ? "Kapsam: " + offer.scope : "",
      offer.conditions ? "Şart: " + offer.conditions : "",
      offer.expiresAt ? "Son geçerlilik: " + formatDate(offer.expiresAt) : ""
    ].filter(Boolean).join(" · ");

    pushAdminActivity(events,{
      category:"offer",
      actor:"Firma · " + institutionName,
      title:"Teklif gönderildi",
      detail:offerDetail,
      institutionId:offer.institutionId || offer.id,
      date:offer.createdAt || offer.updatedAt
    });

    const createdMs = new Date(offer.createdAt || 0).getTime();
    const updatedMs = new Date(offer.updatedAt || 0).getTime();
    if (offer.updatedAt && Number.isFinite(updatedMs) &&
        (!Number.isFinite(createdMs) || Math.abs(updatedMs - createdMs) > 5000)) {
      pushAdminActivity(events,{
        category:"offer",
        actor:"Firma · " + institutionName,
        title:"Teklifin güncel hali kaydedildi",
        detail:offerDetail,
        institutionId:offer.institutionId || offer.id,
        date:offer.updatedAt
      });
    }

    if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()) {
      pushAdminActivity(events,{
        category:"offer",
        actor:"Sistem",
        title:"Teklif süresi doldu",
        detail:"Firma: " + institutionName + " · Teklif No: " + (offer.offerCode || "-"),
        institutionId:offer.institutionId || offer.id,
        date:offer.expiresAt
      });
    }
  });

  (engagementRecords || []).forEach(engagement => {
    const institutionId = engagement.institutionId || engagement.id;
    const institutionName = adminActivityInstitutionName(request, institutionId);

    if (engagement.viewedAt) {
      pushAdminActivity(events,{
        category:"offer",
        actor:"Müşteri · " + (request.name || "Müşteri"),
        title:"Teklif görüntülendi",
        detail:"Firma: " + institutionName,
        institutionId,
        date:engagement.viewedAt
      });
    }
    if (engagement.revisionRequestedAt) {
      pushAdminActivity(events,{
        category:"revision",
        actor:"Müşteri · " + (request.name || "Müşteri"),
        title:"Teklif revizyonu istendi",
        detail:"Firma: " + institutionName,
        institutionId,
        date:engagement.revisionRequestedAt
      });
    }
    if (engagement.revisionRespondedAt) {
      pushAdminActivity(events,{
        category:"revision",
        actor:"Firma · " + institutionName,
        title:"Revizyon yanıtlandı",
        detail:"Teklif güncellemesi / revizyon yanıtı kaydedildi.",
        institutionId,
        date:engagement.revisionRespondedAt
      });
    }
  });

  (messages || []).forEach(message => {
    const institutionName = adminActivityInstitutionName(request, message.institutionId);
    const isCustomer = message.sender === "customer";
    const isOfferUpdate = /^(Teklif güncellendi|Revizyon talebinize göre teklif güncellendi)/i.test(String(message.text || ""));
    const category = isOfferUpdate
      ? "offer"
      : String(message.kind || "").startsWith("revision") ? "revision" : "message";

    pushAdminActivity(events,{
      category,
      actor:isCustomer
        ? "Müşteri · " + (request.name || "Müşteri")
        : "Firma · " + institutionName,
      title:isOfferUpdate
        ? "Fiyat / teklif güncelleme bildirimi"
        : message.kind === "revision_request" ? "Revizyon mesajı"
        : message.kind === "revision_response" ? "Revizyon yanıt mesajı"
        : "Mesaj gönderildi",
      detail:String(message.text || ""),
      institutionId:message.institutionId,
      date:message.date
    });
  });

  const lock = request.liveLock || null;
  if (lock) {
    pushAdminActivity(events,{
      category:"lock",
      actor:"Müşteri · " + (request.name || "Müşteri"),
      title:"Teklif fiyatı kilitlendi",
      detail:[
        "Firma: " + (lock.institutionName || "-"),
        "Fiyat: " + quoteMoney(lock.lockedPrice != null ? lock.lockedPrice : lock.price),
        lock.vatStatus ? "KDV: " + lock.vatStatus : "",
        lock.scope ? "Kapsam: " + lock.scope : "",
        lock.conditions ? "Şart: " + lock.conditions : ""
      ].filter(Boolean).join(" · "),
      institutionId:lock.institutionId,
      date:lock.lockedAt
    });

    if (lock.usedAt) {
      pushAdminActivity(events,{
        category:"lock",
        actor:"Firma · " + (lock.institutionName || "Kurum"),
        title:"Kilitli teklif kullanıldı / doğrulandı",
        detail:"Teklif No: " + (lock.offerCode || "-") + " · Fiyat: " + quoteMoney(lock.lockedPrice != null ? lock.lockedPrice : lock.price),
        institutionId:lock.institutionId,
        date:lock.usedAt
      });
    } else if (lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now()) {
      pushAdminActivity(events,{
        category:"lock",
        actor:"Sistem",
        title:"Kilitli teklifin süresi doldu",
        detail:"Firma: " + (lock.institutionName || "-") + " · Fiyat: " + quoteMoney(lock.lockedPrice != null ? lock.lockedPrice : lock.price),
        institutionId:lock.institutionId,
        date:lock.expiresAt
      });
    }
  }

  (Array.isArray(request.liveIssues) ? request.liveIssues : []).forEach(issue => {
    pushAdminActivity(events,{
      category:"issue",
      actor:"Müşteri · " + (request.name || "Müşteri"),
      title:"Sorun bildirimi oluşturuldu",
      detail:issue.reason || "Açıklama yok",
      date:issue.date
    });

    (Array.isArray(issue.statusHistory) ? issue.statusHistory : []).forEach(entry => {
      pushAdminActivity(events,{
        category:"issue",
        actor:"Yönetim",
        title:"Sorun dosyası güncellendi",
        detail:[
          entry.status ? "Durum: " + entry.status : "",
          entry.decision ? "Karar: " + entry.decision : "",
          entry.summary || ""
        ].filter(Boolean).join(" · "),
        date:entry.date
      });
    });
  });

  if (request.updatedAt && ["sent","done","archived"].includes(String(request.status || ""))) {
    const labels = {sent:"Talep iletildi",done:"Talep sonuçlandı",archived:"Talep arşivlendi"};
    pushAdminActivity(events,{
      category:"admin",
      actor:"Yönetim",
      title:labels[request.status] || "Talep durumu güncellendi",
      detail:"Yönetim durumu: " + request.status,
      date:request.updatedAt
    });
  }

  return events.sort((a,b) => {
    const diff = new Date(a.date) - new Date(b.date);
    if (diff !== 0) return diff;
    return String(a.title).localeCompare(String(b.title),"tr");
  });
}

async function loadAdminQuoteActivity(requestId, options = {}) {
  const force = Boolean(options.force);
  if (!force && adminQuoteActivityCache.has(requestId)) {
    return adminQuoteActivityCache.get(requestId);
  }

  const request = quoteRequestRecords.find(item => String(item.id) === String(requestId));
  if (!request) throw new Error("Teklif talebi bulunamadı.");

  const quoteRef = db.collection("quoteRequests").doc(requestId);
  const errors = [];
  let engagementRecords = [];

  try {
    const engagementSnapshot = await quoteRef.collection("engagement").get();
    engagementRecords = engagementSnapshot.docs.map(doc => ({id:doc.id,...doc.data()}));
  } catch (error) {
    console.warn("Admin engagement okunamadı:",requestId,error);
    errors.push("Görüntülenme / revizyon durumları okunamadı.");
  }

  const institutionIds = new Set();
  (Array.isArray(request.liveOffers) ? request.liveOffers : []).forEach(offer => {
    const id = offer.institutionId || offer.id;
    if (id) institutionIds.add(String(id));
  });
  if (request.liveLock && request.liveLock.institutionId) institutionIds.add(String(request.liveLock.institutionId));
  engagementRecords.forEach(item => {
    const id = item.institutionId || item.id;
    if (id) institutionIds.add(String(id));
  });

  const messageGroups = await Promise.all([...institutionIds].map(async institutionId => {
    try {
      const snapshot = await quoteRef
        .collection("conversations").doc(institutionId)
        .collection("messages").orderBy("date","asc").get();
      return snapshot.docs.map(doc => ({id:doc.id,institutionId,...doc.data()}));
    } catch (error) {
      console.warn("Admin mesajları okunamadı:",requestId,institutionId,error);
      errors.push(adminActivityInstitutionName(request,institutionId) + " mesaj geçmişi okunamadı.");
      return [];
    }
  }));

  const messages = messageGroups.flat();
  const events = buildAdminQuoteActivityEvents(request,engagementRecords,messages);
  const bundle = {
    requestId,
    engagementRecords,
    messages,
    events,
    errors:[...new Set(errors)],
    loadedAt:new Date().toISOString()
  };
  adminQuoteActivityCache.set(requestId,bundle);
  return bundle;
}

function adminActivityCategoryLabel(category) {
  const map = {
    request:"Talep",
    offer:"Teklif / Fiyat",
    message:"Mesaj",
    revision:"Revizyon",
    lock:"Kilit / Kullanım",
    issue:"Sorun",
    admin:"Yönetim"
  };
  return map[category] || category || "İşlem";
}

function quoteActivitySummaryHtml(request,bundle) {
  const revisionCount = (bundle.engagementRecords || []).filter(item => item.revisionRequestedAt).length;
  const messageCount = (bundle.messages || []).length;
  const priceUpdateCount = (bundle.messages || []).filter(item =>
    /^(Teklif güncellendi|Revizyon talebinize göre teklif güncellendi)/i.test(String(item.text || ""))
  ).length;
  const issues = Array.isArray(request.liveIssues) ? request.liveIssues.length : 0;
  const offers = Array.isArray(request.liveOffers) ? request.liveOffers.length : 0;
  const state = request.currentState || getAdminQuoteLiveState(request);
  const stateLabel = getAdminQuoteStateMeta(state)[0];

  return [
    '<article><span>Teklif</span><strong>' + offers + '</strong></article>',
    '<article><span>Mesaj</span><strong>' + messageCount + '</strong></article>',
    '<article><span>Fiyat Güncelleme</span><strong>' + priceUpdateCount + '</strong></article>',
    '<article><span>Revizyon İsteği</span><strong>' + revisionCount + '</strong></article>',
    '<article><span>Sorun Bildirimi</span><strong>' + issues + '</strong></article>',
    '<article class="wide"><span>Son Durum</span><strong>' + escapeHtml(stateLabel) + '</strong></article>'
  ].join("");
}

function getAdminOfferCompareState(offer, request) {
  const lock = request.liveLock || null;
  const now = Date.now();
  const isSelected = lock &&
    String(lock.institutionId || "") === String(offer.institutionId || offer.id || "");

  if (isSelected) {
    if (lock.status === "used") return { label:"Gerçek Kayıt Tamamlandı", cls:"used" };
    if (lock.expiresAt && new Date(lock.expiresAt).getTime() <= now) {
      return { label:"Kabul Edildi · Süresi Doldu", cls:"expired" };
    }
    return { label:"Kayıt Bekliyor", cls:"locked" };
  }

  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= now) {
    return { label:"Süresi Doldu", cls:"expired" };
  }

  return { label:"Aktif Teklif", cls:"active" };
}

function adminQuoteDetailMatchingInstitutions(request) {
  if (!request) return [];

  if (request.targetInstitutionId) {
    const target = institutionRecords.find(item =>
      String(item.id) === String(request.targetInstitutionId)
    );
    return target ? [target] : [];
  }

  const requestCategory = normalizeCategory(request.subCategory || request.category || "");
  const requestCity = String(request.city || "").trim().toLocaleLowerCase("tr-TR");
  const requestDistrict = String(request.district || "").trim().toLocaleLowerCase("tr-TR");

  const cityMatches = institutionRecords.filter(inst => {
    const active = String(inst.status || "active") !== "passive";
    const offerOpen = inst.offer !== false;
    const institutionCategory = normalizeCategory(inst.subCategory || inst.category || "");
    const institutionCity = String(inst.city || "").trim().toLocaleLowerCase("tr-TR");
    return active && offerOpen && institutionCategory === requestCategory && institutionCity === requestCity;
  });

  if (!requestDistrict) return cityMatches;

  const exact = cityMatches.filter(inst =>
    String(inst.district || "").trim().toLocaleLowerCase("tr-TR") === requestDistrict
  );

  return exact.length ? exact : cityMatches;
}

function adminQuoteDetailState(request) {
  const lock = request?.liveLock || null;
  const offers = Array.isArray(request?.liveOffers) ? request.liveOffers : [];
  if (lock) {
    if (lock.status === "used" || lock.registrationStatus === "completed") {
      return {label:"Gerçek Kayıt Tamamlandı", cls:"completed"};
    }
    const deadline = lock.registrationDeadlineAt || lock.expiresAt;
    if (deadline && new Date(deadline).getTime() <= Date.now()) {
      return {label:"Kabul Edildi · Süresi Doldu", cls:"expired"};
    }
    return {label:"Kayıt Bekliyor", cls:"locked"};
  }
  if (offers.length) return {label:"Teklif Aktif", cls:"active"};
  return {label:"Teklif Bekleniyor", cls:"waiting"};
}

function openQuoteDetailModal(requestId) {
  const request = quoteRequestRecords.find(item => String(item.id) === String(requestId));
  if (!request || !quoteDetailModal || !quoteDetailBody) return;

  const offers = Array.isArray(request.liveOffers) ? request.liveOffers : [];
  const lock = request.liveLock || null;
  const matching = adminQuoteDetailMatchingInstitutions(request);
  const state = adminQuoteDetailState(request);
  const requestCode = String(request.id || "").slice(0, 9).toUpperCase();
  const targetInstitution = request.targetInstitutionId
    ? institutionRecords.find(item => String(item.id) === String(request.targetInstitutionId))
    : null;

  if (quoteDetailTitle) quoteDetailTitle.textContent = request.service || "Teklif Talebi";
  if (quoteDetailMeta) {
    quoteDetailMeta.textContent = [
      "#" + requestCode,
      request.targetInstitutionId ? "Doğrudan teklif" : "Toplu teklif",
      formatDate(request.date)
    ].join(" · ");
  }

  const deadline = lock ? (lock.registrationDeadlineAt || lock.expiresAt || "") : "";
  const lockInstitutionName = lock
    ? (lock.institutionName || institutionRecords.find(item => String(item.id) === String(lock.institutionId || ""))?.name || "Kurum")
    : "";

  const institutionHtml = matching.length
    ? matching.slice(0, 12).map(inst => {
        const offer = offers.find(item => String(item.institutionId || item.id || "") === String(inst.id));
        const phoneDigits = normalizeWhatsApp(inst.phone || inst.whatsapp || "");
        return '<article class="quote-detail-institution-card"><div><strong>' +
          escapeHtml(inst.name || "Kurum") +
          '</strong><span>' + escapeHtml([inst.city,inst.district].filter(Boolean).join(" / ") || "-") +
          '</span><small>' + (offer ? "✓ Teklif verdi" : "Henüz teklif vermedi") +
          '</small></div><div class="quote-detail-institution-actions"><a href="kurum.html?id=' +
          encodeURIComponent(inst.id) +
          '" target="_blank" rel="noopener">Sayfayı Gör</a>' +
          (phoneDigits ? '<a class="wa" href="https://wa.me/' + phoneDigits + '" target="_blank" rel="noopener">WhatsApp</a>' : "") +
          '</div></article>';
      }).join("")
    : '<div class="quote-detail-empty warning"><strong>Uygun kurum bulunamadı.</strong><span>Bu talebin şehir, ilçe ve kategori bilgileriyle eşleşen teklif alımı açık kurum görünmüyor.</span></div>';

  const offersHtml = offers.length
    ? '<div class="quote-detail-offers">' + offers.map(offer => {
        const selected = lock && String(lock.institutionId || "") === String(offer.institutionId || offer.id || "");
        const expired = offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now();
        const offerState = selected
          ? ((lock.status === "used" || lock.registrationStatus === "completed") ? "Gerçek Kayıt Tamamlandı" : (expired ? "Kabul Edildi · Süresi Doldu" : "Kayıt Bekliyor"))
          : (expired ? "Süresi Doldu" : "Teklif Aktif");
        const institutionId = String(offer.institutionId || offer.id || "");
        return '<article class="quote-detail-offer-card"><div class="quote-detail-offer-head"><div><span class="quote-detail-mini-label">KURUM TEKLİFİ</span><h4>' +
          escapeHtml(offer.institutionName || "Kurum") + '</h4><small>Teklif No: ' + escapeHtml(offer.offerCode || "-") +
          '</small></div><div class="quote-detail-offer-side"><strong>' + quoteMoney(offer.price) +
          '</strong><span class="quote-detail-state">' + escapeHtml(offerState) + '</span></div></div>' +
          '<div class="quote-detail-offer-grid"><div><span>KDV</span><strong>' + escapeHtml(offer.vatStatus || "-") +
          '</strong></div><div><span>Ek ücret</span><strong>' + escapeHtml(offer.extraFee || "Yok") +
          '</strong></div><div><span>Son geçerlilik</span><strong>' + (offer.expiresAt ? formatDate(offer.expiresAt) : "-") +
          '</strong></div><div><span>Gönderim</span><strong>' + formatDate(offer.updatedAt || offer.createdAt) +
          '</strong></div></div><div class="quote-detail-scope"><span>Teklif kapsamı</span><strong>' + escapeHtml(offer.scope || "Kapsam belirtilmemiş.") +
          '</strong></div>' +
          (offer.conditions ? '<div class="quote-detail-condition"><span>Özel şart</span><strong>' + escapeHtml(offer.conditions) + '</strong></div>' : "") +
          (institutionId ? '<div class="quote-detail-inline-actions"><a href="kurum.html?id=' + encodeURIComponent(institutionId) + '" target="_blank" rel="noopener">Kurum Sayfasını Aç ↗</a></div>' : "") +
          '</article>';
      }).join("") + '</div>'
    : '<div class="quote-detail-empty"><strong>Henüz kurum teklifi yok.</strong><span>Uygun kurum teklif gönderdiğinde fiyat ve kapsam burada görünecek.</span></div>';

  let html = "";
  html += '<div class="quote-detail-status-strip state-' + state.cls + '"><div><span>SON DURUM</span><strong>' + escapeHtml(state.label) + '</strong></div><div class="quote-detail-status-stats"><span><b>' + offers.length + '</b> kurum teklifi</span><span><b>' + matching.length + '</b> uygun kurum</span>' + (lock ? '<span><b>✓</b> teklif kabulü var</span>' : "") + '</div></div>';

  html += '<section class="quote-detail-section"><div class="quote-detail-section-head"><div><span>MÜŞTERİ VE TALEP</span><h3>Talep Bilgileri</h3></div></div><div class="quote-detail-info-grid">' +
    '<div><span>Müşteri</span><strong>' + escapeHtml(request.name || "-") + '</strong></div>' +
    '<div><span>Telefon</span><strong>' + escapeHtml(request.phone || "-") + '</strong></div>' +
    '<div><span>E-posta</span><strong>' + escapeHtml(request.email || "-") + '</strong></div>' +
    '<div><span>Talep konusu</span><strong>' + escapeHtml(request.service || "-") + '</strong></div>' +
    '<div><span>Konum</span><strong>' + escapeHtml([request.city,request.district].filter(Boolean).join(" / ") || "-") + '</strong></div>' +
    '<div><span>Talep türü</span><strong>' + (request.targetInstitutionId ? "Doğrudan kurum talebi" : "Toplu teklif") + '</strong></div>' +
    '<div><span>Kategori</span><strong>' + escapeHtml(request.subCategory || request.category || "-") + '</strong></div>' +
    '<div><span>Talep tarihi</span><strong>' + formatDate(request.date) + '</strong></div></div>' +
    '<div class="quote-detail-note"><span>Müşteri notu</span><strong>' + escapeHtml(request.note || "Not eklenmemiş.") + '</strong></div></section>';

  if (request.targetInstitutionId) {
    html += '<section class="quote-detail-section"><div class="quote-detail-section-head"><div><span>HEDEF KURUM</span><h3>' + escapeHtml(request.targetInstitutionName || targetInstitution?.name || "Kurum") + '</h3></div>' +
      (targetInstitution ? '<a class="quote-detail-head-link" href="kurum.html?id=' + encodeURIComponent(targetInstitution.id) + '" target="_blank" rel="noopener">Kurum Sayfası ↗</a>' : "") +
      '</div><p class="quote-detail-helper">Bu talep toplu havuza açılmadan yalnızca hedef kuruma gönderilmiştir.</p></section>';
  }

  if (lock) {
    const completed = lock.status === "used" || lock.registrationStatus === "completed";
    html += '<section class="quote-detail-section accepted"><div class="quote-detail-section-head"><div><span>KABUL EDİLEN TEKLİF</span><h3>' + escapeHtml(lockInstitutionName) + '</h3></div><span class="quote-detail-state">' + escapeHtml(state.label) + '</span></div>' +
      '<div class="quote-detail-info-grid"><div><span>Kabul edilen fiyat</span><strong>' + quoteMoney(lock.price) + '</strong></div>' +
      '<div><span>Teklif no</span><strong>' + escapeHtml(lock.offerCode || "-") + '</strong></div>' +
      '<div><span>Kabul tarihi</span><strong>' + formatDate(lock.acceptedAt || lock.lockedAt) + '</strong></div>' +
      '<div><span>Gerçek kayıt son tarihi</span><strong>' + (deadline ? formatDate(deadline) : "-") + '</strong></div>' +
      '<div><span>Kayıt durumu</span><strong>' + (completed ? "Gerçek kayıt tamamlandı" : "Gerçek kayıt bekleniyor") + '</strong></div>' +
      '<div><span>Doğrulama</span><strong>' + (lock.trackingCode ? "✓ Telefon + takip kodu" : "Takip kaydı") + '</strong></div></div>' +
      '<div class="quote-detail-payment-warning"><strong>🛡️ Dijiyer üzerinden ödeme yapılmaz.</strong><span>Ücret, kapora veya kayıt bedeli yalnızca müşteri ile kurum arasında doğrudan gerçekleştirilir.</span></div></section>';
  }

  html += '<section class="quote-detail-section"><div class="quote-detail-section-head"><div><span>GELEN FİYATLAR</span><h3>Kurum Teklifleri (' + offers.length + ')</h3></div></div>' + offersHtml + '</section>';
  html += '<section class="quote-detail-section"><div class="quote-detail-section-head"><div><span>EŞLEŞME</span><h3>' + (request.targetInstitutionId ? "Hedef Kurum" : "Uygun Kurumlar") + " (" + matching.length + ')</h3></div></div><div class="quote-detail-institutions">' + institutionHtml + '</div></section>';

  html += '<div class="quote-detail-footer-actions"><a class="primary" href="https://wa.me/' + normalizeWhatsApp(request.phone) + '" target="_blank" rel="noopener">Müşteriye WhatsApp</a>' +
    (offers.length ? '<button type="button" data-detail-compare>Teklifleri Karşılaştır (' + offers.length + ')</button>' : "") +
    '<button type="button" data-detail-activity>Teklif Hareketleri</button></div>';

  quoteDetailBody.innerHTML = html;

  quoteDetailBody.querySelector("[data-detail-compare]")?.addEventListener("click",() => {
    quoteDetailModal.classList.add("hidden");
    openQuoteCompareModal(request.id);
  });

  quoteDetailBody.querySelector("[data-detail-activity]")?.addEventListener("click",async() => {
    quoteDetailModal.classList.add("hidden");
    await openQuoteActivityModal(request.id);
  });

  quoteDetailModal.classList.remove("hidden");
}

closeQuoteDetailModal?.addEventListener("click",() => quoteDetailModal?.classList.add("hidden"));
quoteDetailModal?.addEventListener("click",event => {
  if (event.target === quoteDetailModal) quoteDetailModal.classList.add("hidden");
});

document.addEventListener("keydown",event => {
  if (event.key === "Escape" && quoteDetailModal && !quoteDetailModal.classList.contains("hidden")) {
    quoteDetailModal.classList.add("hidden");
  }
});

function openQuoteCompareModal(requestId) {
  const request = quoteRequestRecords.find(item => String(item.id) === String(requestId));
  if (!request) return;

  const offers = Array.isArray(request.liveOffers)
    ? [...request.liveOffers].sort((a,b) => Number(a.price || 0) - Number(b.price || 0))
    : [];

  quoteCompareModal?.classList.remove("hidden");
  if (quoteCompareTitle) quoteCompareTitle.textContent = request.service || "Teklifleri Karşılaştır";
  if (quoteCompareMeta) {
    quoteCompareMeta.textContent = [
      request.name || "Müşteri",
      [request.city, request.district].filter(Boolean).join(" / "),
      offers.length + " kurum teklifi"
    ].filter(Boolean).join(" · ");
  }

  if (!offers.length) {
    if (quoteCompareHighlights) {
      quoteCompareHighlights.innerHTML =
        '<div class="quote-compare-empty">Henüz karşılaştırılacak kurum teklifi yok.</div>';
    }
    if (quoteCompareTableBody) quoteCompareTableBody.innerHTML = "";
    return;
  }

  const validPrices = offers
    .map(offer => Number(offer.price || 0))
    .filter(price => Number.isFinite(price) && price > 0);

  const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : 0;
  const selected = request.liveLock || null;

  if (quoteCompareHighlights) {
    quoteCompareHighlights.innerHTML = [
      '<article><span>Teklif Sayısı</span><strong>' + offers.length + '</strong></article>',
      '<article><span>En Düşük Fiyat</span><strong>' + (minPrice ? quoteMoney(minPrice) : "-") + '</strong></article>',
      '<article><span>Fiyat Aralığı</span><strong>' +
        (minPrice && maxPrice ? quoteMoney(minPrice) + " – " + quoteMoney(maxPrice) : "-") +
      '</strong></article>',
      '<article class="' + (selected ? "selected" : "") + '"><span>Kabul Edilen Teklif</span><strong>' +
        (selected ? escapeHtml(selected.institutionName || selected.offerCode || "Seçim yapıldı") : "Henüz seçilmedi") +
      '</strong></article>'
    ].join("");
  }

  if (quoteCompareTableBody) {
    quoteCompareTableBody.innerHTML = offers.map(offer => {
      const state = getAdminOfferCompareState(offer, request);
      const price = Number(offer.price || 0);
      const isLowest = minPrice > 0 && price === minPrice;
      const lock = request.liveLock || null;
      const isSelected = lock &&
        String(lock.institutionId || "") === String(offer.institutionId || offer.id || "");

      return '<tr class="' +
        (isSelected ? ' is-selected' : '') +
        (isLowest ? ' is-lowest' : '') +
        '">' +
        '<td><div class="quote-compare-institution"><strong>' +
          escapeHtml(offer.institutionName || "Kurum") +
          '</strong><small>' +
          (isLowest ? '<span class="lowest-chip">En düşük fiyat</span>' : '') +
          (isSelected ? '<span class="selected-chip">Kabul Edildi</span>' : '') +
          '</small></div></td>' +
        '<td class="quote-compare-price">' + quoteMoney(offer.price) + '</td>' +
        '<td>' + escapeHtml(offer.vatStatus || "-") + '</td>' +
        '<td>' + (offer.expiresAt ? formatDate(offer.expiresAt) : "-") + '</td>' +
        '<td><code>' + escapeHtml(offer.offerCode || "-") + '</code></td>' +
        '<td><span class="compare-state ' + state.cls + '">' + escapeHtml(state.label) + '</span></td>' +
      '</tr>';
    }).join("");
  }
}

closeQuoteCompareModal?.addEventListener("click",() => quoteCompareModal?.classList.add("hidden"));
quoteCompareModal?.addEventListener("click",event => {
  if (event.target === quoteCompareModal) quoteCompareModal.classList.add("hidden");
});

document.addEventListener("keydown",event => {
  if (event.key === "Escape" && quoteCompareModal && !quoteCompareModal.classList.contains("hidden")) {
    quoteCompareModal.classList.add("hidden");
  }
});

function renderQuoteActivityTimeline(request,bundle) {
  const filter = quoteActivityFilter ? quoteActivityFilter.value : "all";
  const events = (bundle.events || []).filter(event => filter === "all" || event.category === filter);
  quoteActivitySummary.innerHTML = quoteActivitySummaryHtml(request,bundle);

  if (bundle.errors.length) {
    quoteActivityCompleteness.className = "quote-activity-completeness warning";
    quoteActivityCompleteness.innerHTML = "<strong>⚠ Kısmi kayıt</strong><span>" + escapeHtml(bundle.errors.join(" ")) + "</span>";
  } else {
    quoteActivityCompleteness.className = "quote-activity-completeness success";
    quoteActivityCompleteness.innerHTML = "<strong>✓ Kayıtlar yüklendi</strong><span>Mevcut teklif, mesaj, revizyon, kilit ve sorun kayıtları birleştirildi. Eski sistem döneminde ayrıca saklanmamış fiyat sürümleri geriye dönük üretilemez.</span>";
  }

  if (!events.length) {
    quoteActivityTimeline.innerHTML = '<div class="empty-state">Bu filtrede hareket bulunamadı.</div>';
    return;
  }

  quoteActivityTimeline.innerHTML = events.map(event => {
    return '<div class="quote-activity-event category-' + escapeHtml(event.category) + '">' +
      '<div class="quote-activity-dot"></div>' +
      '<div class="quote-activity-event-body">' +
        '<div class="quote-activity-event-top">' +
          '<span class="quote-activity-type">' + escapeHtml(adminActivityCategoryLabel(event.category)) + '</span>' +
          '<time>' + formatDate(event.date) + '</time>' +
        '</div>' +
        '<strong>' + escapeHtml(event.title) + '</strong>' +
        '<small>' + escapeHtml(event.actor) + '</small>' +
        (event.detail ? '<p>' + escapeHtml(event.detail) + '</p>' : "") +
      '</div></div>';
  }).join("");
}

async function openQuoteActivityModal(requestId, options = {}) {
  const request = quoteRequestRecords.find(item => String(item.id) === String(requestId));
  if (!request) return;

  activeAdminActivityQuoteId = requestId;
  quoteActivityModal.classList.remove("hidden");
  quoteActivityTitle.textContent = request.service || "Teklif Hareketleri";
  quoteActivityMeta.textContent = [
    request.name || "Müşteri",
    [request.city,request.district].filter(Boolean).join(" / "),
    "Talep ID: " + request.id
  ].filter(Boolean).join(" · ");
  quoteActivitySummary.innerHTML = '<div class="quote-activity-loading">Özet yükleniyor...</div>';
  quoteActivityCompleteness.className = "quote-activity-completeness";
  quoteActivityCompleteness.textContent = "Kayıtlar okunuyor...";
  quoteActivityTimeline.innerHTML = '<div class="quote-activity-loading">Teklif hareketleri yükleniyor...</div>';

  try {
    const bundle = await loadAdminQuoteActivity(requestId,{force:Boolean(options.force)});
    renderQuoteActivityTimeline(request,bundle);
  } catch (error) {
    console.error("Teklif hareketleri yüklenemedi:",error);
    quoteActivityTimeline.innerHTML = '<div class="empty-state">Teklif hareketleri yüklenemedi.</div>';
  }
}

function getActiveQuoteActivityBundle() {
  if (!activeAdminActivityQuoteId) return null;
  return adminQuoteActivityCache.get(activeAdminActivityQuoteId) || null;
}

function quoteActivityPlainText(request,bundle) {
  const lines = [
    "Dijiyer Teklif Hareket Dökümü",
    "Talep: " + (request.service || "-"),
    "Müşteri: " + (request.name || "-"),
    "Konum: " + ([request.city,request.district].filter(Boolean).join(" / ") || "-"),
    "Talep ID: " + request.id,
    ""
  ];
  (bundle.events || []).forEach(event => {
    lines.push("[" + formatDate(event.date) + "] " +
      adminActivityCategoryLabel(event.category) + " · " +
      event.actor + " · " + event.title +
      (event.detail ? " · " + event.detail : ""));
  });
  return lines.join("\n");
}

function exportQuoteActivityCsv(request,bundle) {
  const csvCell = value => '"' + String(value == null ? "" : value).replace(/"/g,'""') + '"';
  const rows = [
    ["Tarih","Tür","Taraf","Başlık","Detay"],
    ...(bundle.events || []).map(event => [
      formatDate(event.date),
      adminActivityCategoryLabel(event.category),
      event.actor,
      event.title,
      event.detail
    ])
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dijiyer-teklif-hareketleri-" + String(request.id).slice(0,12) + ".csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

closeQuoteActivityModal?.addEventListener("click",() => quoteActivityModal.classList.add("hidden"));
quoteActivityModal?.addEventListener("click",event => {
  if (event.target === quoteActivityModal) quoteActivityModal.classList.add("hidden");
});
quoteActivityFilter?.addEventListener("change",() => {
  if (!activeAdminActivityQuoteId) return;
  const request = quoteRequestRecords.find(item => String(item.id) === String(activeAdminActivityQuoteId));
  const bundle = getActiveQuoteActivityBundle();
  if (request && bundle) renderQuoteActivityTimeline(request,bundle);
});
quoteActivityRefreshBtn?.addEventListener("click",async() => {
  if (!activeAdminActivityQuoteId) return;
  adminQuoteActivityCache.delete(activeAdminActivityQuoteId);
  await openQuoteActivityModal(activeAdminActivityQuoteId,{force:true});
});
quoteActivityCopyBtn?.addEventListener("click",async() => {
  if (!activeAdminActivityQuoteId) return;
  const request = quoteRequestRecords.find(item => String(item.id) === String(activeAdminActivityQuoteId));
  const bundle = getActiveQuoteActivityBundle();
  if (!request || !bundle) return;
  try {
    await navigator.clipboard.writeText(quoteActivityPlainText(request,bundle));
    const old = quoteActivityCopyBtn.textContent;
    quoteActivityCopyBtn.textContent = "Kopyalandı";
    setTimeout(() => quoteActivityCopyBtn.textContent = old,1200);
  } catch (error) {
    console.error(error);
    alert("Özet kopyalanamadı.");
  }
});
quoteActivityCsvBtn?.addEventListener("click",() => {
  if (!activeAdminActivityQuoteId) return;
  const request = quoteRequestRecords.find(item => String(item.id) === String(activeAdminActivityQuoteId));
  const bundle = getActiveQuoteActivityBundle();
  if (request && bundle) exportQuoteActivityCsv(request,bundle);
});
document.addEventListener("keydown",event => {
  if (event.key === "Escape" && quoteActivityModal && !quoteActivityModal.classList.contains("hidden")) {
    quoteActivityModal.classList.add("hidden");
  }
});
function quoteRequestDateValue(request) {
  const value = request?.date || request?.createdAt || request?.updatedAt || "";
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function quoteMatchesPeriod(request, period) {
  if (!period) return true;

  const time = quoteRequestDateValue(request);
  if (!time) return false;

  const now = new Date();

  if (period === "today") {
    const date = new Date(time);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const days = Number(period || 0);
  if (!days) return true;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return time >= start.getTime();
}

function updateQuoteDashboardStats() {
  const states = quoteRequestRecords.map(request =>
    request.currentState || getAdminQuoteLiveState(request)
  );

  const waiting = states.filter(state => ["new", "sent"].includes(state)).length;
  const offered = states.filter(state => state === "offered").length;
  const locked = states.filter(state => state === "locked").length;
  const completed = states.filter(state => ["done", "used"].includes(state)).length;
  const issues = quoteRequestRecords.filter(request => Number(request.issueCount || 0) > 0).length;
  const totalOffers = quoteRequestRecords.reduce(
    (sum, request) => sum + (Array.isArray(request.liveOffers) ? request.liveOffers.length : 0),
    0
  );

  if (quoteKpiTotal) quoteKpiTotal.textContent = String(quoteRequestRecords.length);
  if (quoteKpiWaiting) quoteKpiWaiting.textContent = String(waiting);
  if (quoteKpiOffered) quoteKpiOffered.textContent = String(offered);
  if (quoteKpiLocked) quoteKpiLocked.textContent = String(locked);
  if (quoteKpiDone) quoteKpiDone.textContent = String(completed);
  if (quoteKpiIssue) quoteKpiIssue.textContent = String(issues);

  if (quoteRequestCount) {
    quoteRequestCount.textContent =
      quoteRequestRecords.length + " talep · " +
      waiting + " işlem bekliyor · " +
      totalOffers + " kurum teklifi";
  }

  document.querySelectorAll("[data-quote-kpi]").forEach(button => {
    button.classList.toggle(
      "active",
      String(button.dataset.quoteKpi || "") === String(quoteStatusFilter?.value || "")
    );
  });
}

function renderQuoteRequests() {
  const query = quoteRequestSearch.value.trim().toLocaleLowerCase("tr-TR");
  const status = quoteStatusFilter.value;
  const period = quotePeriodFilter?.value || "";
  const sort = quoteSort?.value || "newest";

  let data = quoteRequestRecords.filter(item => {
    const haystack = [
      item.id,
      item.name,
      item.phone,
      item.city,
      item.district,
      item.service,
      item.note,
      item.targetInstitutionName
    ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

    const currentState = item.currentState || getAdminQuoteLiveState(item);
    const statusMatches =
      !status ||
      (status === "issue"
        ? Number(item.issueCount || 0) > 0
        : status === "waiting"
          ? ["new", "sent"].includes(currentState)
          : status === "completed"
            ? ["done", "used"].includes(currentState)
            : currentState === status);

    const offerSearch = (Array.isArray(item.liveOffers) ? item.liveOffers : [])
      .map(offer => [offer.institutionName, offer.offerCode, offer.price].filter(Boolean).join(" "))
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return (
      (!query || haystack.includes(query) || offerSearch.includes(query)) &&
      statusMatches &&
      quoteMatchesPeriod(item, period)
    );
  });

  data.sort((a, b) => {
    if (sort === "oldest") {
      return quoteRequestDateValue(a) - quoteRequestDateValue(b);
    }

    if (sort === "offers_desc") {
      const offerDiff =
        (Array.isArray(b.liveOffers) ? b.liveOffers.length : 0) -
        (Array.isArray(a.liveOffers) ? a.liveOffers.length : 0);
      return offerDiff || quoteRequestDateValue(b) - quoteRequestDateValue(a);
    }

    if (sort === "attention") {
      const attentionScore = item => {
        const state = item.currentState || getAdminQuoteLiveState(item);
        if (Number(item.issueCount || 0) > 0) return 4;
        if (state === "new") return 3;
        if (state === "sent") return 2;
        if (state === "expired") return 1;
        return 0;
      };

      const diff = attentionScore(b) - attentionScore(a);
      return diff || quoteRequestDateValue(b) - quoteRequestDateValue(a);
    }

    return quoteRequestDateValue(b) - quoteRequestDateValue(a);
  });

  updateQuoteDashboardStats();

  if (quoteFilterResult) {
    const parts = [];
    if (status) parts.push(quoteStatusFilter.options[quoteStatusFilter.selectedIndex]?.text || "Durum filtresi");
    if (period) parts.push(quotePeriodFilter.options[quotePeriodFilter.selectedIndex]?.text || "Tarih filtresi");
    if (query) parts.push('Arama: "' + quoteRequestSearch.value.trim() + '"');

    quoteFilterResult.textContent =
      data.length + " / " + quoteRequestRecords.length + " talep gösteriliyor" +
      (parts.length ? " · " + parts.join(" · ") : "");
  }

  if (!data.length) {
    quoteRequestsList.innerHTML =
      '<div class="empty-state quote-empty-state"><strong>Uygun kayıt bulunamadı.</strong><span>Filtreleri temizleyerek tüm teklif taleplerini yeniden görüntüleyebilirsiniz.</span></div>';
    return;
  }

  quoteRequestsList.innerHTML = "";

  data.forEach(request => {
    const normalizeText = (value) =>
      String(value || "").trim().toLocaleLowerCase("tr-TR");

    const normalizeCategory = (value) => {
      const raw = normalizeText(value)
        .replace(/ı/g, "i")
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c");

      if (["surucu", "surucu kursu", "surucu kurslari", "ehliyet"].includes(raw)) return "surucu";
      if (["kres", "kres anaokulu", "kres & anaokulu", "anaokulu"].includes(raw)) return "kres";
      if (["yurt", "ogrenci yurdu", "ogrenci yurtlari"].includes(raw)) return "yurt";
      if (["egitim", "egitim & kurslar", "kurs", "kurslar"].includes(raw)) return "egitim";
      if (["emlak", "emlak & gayrimenkul", "gayrimenkul"].includes(raw)) return "emlak";
      if (["oto", "oto servis", "oto servis & sanayi", "sanayi"].includes(raw)) return "oto";
      if (["restoran", "restoran & kafe", "kafe"].includes(raw)) return "restoran";
      if (["guzellik", "guzellik & bakim", "bakim"].includes(raw)) return "guzellik";
      if (["saglik", "saglik & klinik", "klinik"].includes(raw)) return "saglik";
      if (["dugun", "dugun & organizasyon", "organizasyon"].includes(raw)) return "dugun";
      if (["evteknik", "ev & teknik servis", "teknik servis"].includes(raw)) return "evteknik";
      if (["turizm", "turizm & konaklama", "konaklama"].includes(raw)) return "turizm";
      if (["nakliyat", "nakliyat & tasimacilik", "tasimacilik"].includes(raw)) return "nakliyat";
      if (["temizlik", "temizlik hizmetleri"].includes(raw)) return "temizlik";
      if (["mobilya", "mobilya & dekorasyon", "dekorasyon"].includes(raw)) return "mobilya";
      if (["teknoloji", "bilgisayar & teknoloji", "bilgisayar"].includes(raw)) return "teknoloji";
      if (["veteriner", "veteriner & evcil hayvan", "evcil hayvan"].includes(raw)) return "veteriner";
      if (["spor", "spor & fitness", "fitness"].includes(raw)) return "spor";
      if (["medya", "fotograf & video", "fotograf", "video"].includes(raw)) return "medya";
      if (["reklam", "matbaa, reklam & tasarim", "matbaa", "grafik tasarim"].includes(raw)) return "reklam";
      if (["insaat", "insaat & tadilat", "tadilat"].includes(raw)) return "insaat";
      if (["tarim", "tarim & hayvancilik", "hayvancilik"].includes(raw)) return "tarim";
      if (["hukuk", "hukuk & danismanlik", "avukat"].includes(raw)) return "hukuk";
      if (["muhasebe", "muhasebe & mali musavirlik", "mali musavirlik"].includes(raw)) return "muhasebe";
      if (["kurye", "kurye & teslimat", "teslimat"].includes(raw)) return "kurye";
      if (["perakende", "magaza & perakende", "magaza"].includes(raw)) return "perakende";
      if (["esnaf", "yerel esnaf"].includes(raw)) return "esnaf";
      if (["diger"].includes(raw)) return "diger";
      return raw;
    };

    const requestCategory = normalizeCategory(request.category);
    const requestCity = normalizeText(request.city);
    const requestDistrict = normalizeText(request.district);

    const activeInstitutions = institutionRecords.filter(inst => inst.offer !== false);

    const categoryMatches = activeInstitutions.filter(inst =>
      normalizeCategory(inst.category) === requestCategory
    );

    const exactDistrictMatches = categoryMatches.filter(inst =>
      normalizeText(inst.city) === requestCity &&
      normalizeText(inst.district) === requestDistrict
    );

    const sameCityMatches = categoryMatches.filter(inst =>
      normalizeText(inst.city) === requestCity
    );

    const directTargetInstitution = request.targetInstitutionId
      ? institutionRecords.find(inst =>
          String(inst.id) === String(request.targetInstitutionId)
        )
      : null;

    // Doğrudan profil talebi yalnızca hedef kuruma aittir.
    // Normal taleplerde mevcut konum + kategori eşleşmesi devam eder.
    const matching = request.targetInstitutionId
      ? (directTargetInstitution ? [directTargetInstitution] : [])
      : (exactDistrictMatches.length ? exactDistrictMatches : sameCityMatches);

    const cityInstitutionCount = activeInstitutions.filter(inst =>
      normalizeText(inst.city) === requestCity
    ).length;

    const categoryLabels = {
      surucu: "Sürücü Kursu",
      kres: "Kreş & Anaokulu",
      yurt: "Öğrenci Yurdu",
      egitim: "Eğitim & Kurslar",
      emlak: "Emlak & Gayrimenkul",
      oto: "Oto Servis & Sanayi",
      restoran: "Restoran & Kafe",
      guzellik: "Güzellik & Bakım",
      saglik: "Sağlık & Klinik",
      dugun: "Düğün & Organizasyon",
      evteknik: "Ev & Teknik Servis",
      turizm: "Turizm & Konaklama",
      nakliyat: "Nakliyat & Taşımacılık",
      temizlik: "Temizlik Hizmetleri",
      mobilya: "Mobilya & Dekorasyon",
      teknoloji: "Bilgisayar & Teknoloji",
      veteriner: "Veteriner & Evcil Hayvan",
      spor: "Spor & Fitness",
      medya: "Fotoğraf & Video",
      reklam: "Matbaa, Reklam & Tasarım",
      insaat: "İnşaat & Tadilat",
      tarim: "Tarım & Hayvancılık",
      hukuk: "Hukuk & Danışmanlık",
      muhasebe: "Muhasebe & Mali Müşavirlik",
      kurye: "Kurye & Teslimat",
      perakende: "Mağaza & Perakende",
      esnaf: "Yerel Esnaf",
      diger: "Diğer"
    };

    const sameCityAll = institutionRecords.filter(inst =>
      normalizeText(inst.city) === requestCity
    );

    const sameCategoryAll = institutionRecords.filter(inst =>
      normalizeCategory(inst.category) === requestCategory
    );

    const diagnosticMap = new Map();

    [...sameCityAll, ...sameCategoryAll].forEach(inst => {
      if (diagnosticMap.has(inst.id)) return;

      const sameCity = normalizeText(inst.city) === requestCity;
      const sameCategory = normalizeCategory(inst.category) === requestCategory;
      let reason = "";

      if (sameCity && sameCategory && inst.offer === false) {
        reason = "Teklif alımı kapalı";
      } else if (sameCity && !sameCategory) {
        reason = "Kategori farklı: " +
          (categoryLabels[normalizeCategory(inst.category)] || inst.category || "Belirsiz");
      } else if (!sameCity && sameCategory) {
        reason = "Şehir farklı: " +
          ([inst.city, inst.district].filter(Boolean).join(" / ") || "Belirsiz");
      } else {
        reason = "Bilgiler eşleşmiyor";
      }

      diagnosticMap.set(inst.id, { ...inst, diagnosticReason: reason });
    });

    const diagnosticInstitutions = [...diagnosticMap.values()].slice(0, 8);

    const diagnosticHtml = !request.targetInstitutionId && !matching.length && diagnosticInstitutions.length
      ? `
        <div class="match-diagnostics">
          <div class="diagnostic-title">Neden eşleşmedi?</div>
          ${diagnosticInstitutions.map(inst => `
            <div class="diagnostic-row">
              <div>
                <strong>${escapeHtml(inst.name || "Kurum")}</strong>
                <span>${escapeHtml(inst.diagnosticReason)}</span>
              </div>
              <button
                type="button"
                class="diagnostic-edit-btn"
                data-institution-id="${inst.id}"
              >Düzenle</button>
            </div>
          `).join("")}
        </div>
      `
      : "";

    const liveState = request.currentState || getAdminQuoteLiveState(request);
    const [liveStateLabel, liveStateClass] = getAdminQuoteStateMeta(liveState);
    const liveOfferCount = Array.isArray(request.liveOffers) ? request.liveOffers.length : 0;
    const liveIssueCount = Number(request.issueCount || 0);
    const requestCode = String(request.id || "").slice(0, 9).toUpperCase();

    const card = document.createElement("div");
    card.className = "quote-request-card quote-state-" + liveState +
      (liveIssueCount ? " has-issue" : "");
    card.dataset.quoteId = request.id;

    const institutionButtons = matching.length
      ? matching.map(inst => {
          const digits = String(inst.phone || "").replace(/\D/g, "");
          const whatsapp =
            digits.startsWith("0") ? "90" + digits.slice(1) : digits;

          if (!whatsapp) {
            return `<span class="match-chip">${escapeHtml(inst.name || "Kurum")} · telefon yok</span>`;
          }

          return `<button
            class="matched-institution-btn"
            data-phone="${whatsapp}"
            data-name="${escapeHtml(inst.name || "Kurum")}"
          >WhatsApp → ${escapeHtml(inst.name || "Kurum")}</button>`;
        }).join("")
      : '<span class="no-match">Bu konum ve kategoride eşleşen kurum yok.</span>';

    card.innerHTML = `
      <div class="quote-request-top">
        <div class="quote-request-identity">
          <div class="quote-request-kicker">
            <span class="quote-request-code">#${escapeHtml(requestCode)}</span>
            ${request.targetInstitutionId ? '<span class="quote-source-chip">Doğrudan talep</span>' : '<span class="quote-source-chip">Toplu teklif</span>'}
          </div>

          <h3>${escapeHtml(request.name || "-")}</h3>

          <div class="quote-badges">
            <span class="quote-service-badge">${escapeHtml(request.service || "-")}</span>
            ${request.targetInstitutionId ? '<span class="direct-request-admin-badge">🎯 Hedef kurum</span>' : ""}
            <span class="quote-status ${liveStateClass}">
              ${liveStateLabel}
            </span>
          </div>
        </div>

        <div class="quote-request-side">
          <div class="quote-date">${formatDate(request.date)}</div>
          <div class="quote-mini-stats">
            <span><b>${liveOfferCount}</b> teklif</span>
            <span><b>${matching.length}</b> uygun kurum</span>
            ${request.liveLock ? '<span class="is-selected"><b>✓</b> seçim var</span>' : ""}
            ${liveIssueCount ? '<span class="is-warning"><b>' + liveIssueCount + '</b> sorun</span>' : ""}
          </div>
        </div>
      </div>

      <div class="quote-info-grid">
        <div class="quote-info-cell">
          <small>Müşteri telefonu</small>
          <strong>${escapeHtml(request.phone || "-")}</strong>
        </div>
        <div class="quote-info-cell">
          <small>${request.targetInstitutionId ? "Hedef kurum" : "Talep konumu"}</small>
          <strong>${escapeHtml(
            request.targetInstitutionId
              ? (request.targetInstitutionName || directTargetInstitution?.name || "-")
              : ([request.city, request.district].filter(Boolean).join(" / ") || "-")
          )}</strong>
        </div>
        <div class="wide quote-info-cell quote-note-cell">
          <small>Müşteri notu</small>
          <strong>${escapeHtml(request.note || "Not eklenmemiş")}</strong>
        </div>
      </div>

      ${request.liveDetailError
        ? '<div class="admin-offer-error">Teklif süreç ayrıntıları okunamadı.</div>'
        : adminOfferListHtml(request)}

      <div class="matching-institutions">
        <strong>Uygun kurumlar (${matching.length})</strong>
        <div class="match-scope">
          ${request.targetInstitutionId
            ? 'Doğrudan kurum profilinden gönderildi · sadece hedef kurum görür'
            : (exactDistrictMatches.length
                ? 'Aynı ilçe + aynı kategori'
                : sameCityMatches.length
                  ? 'Aynı şehir + aynı kategori'
                  : `Eşleşme bulunamadı · Bu şehirde ${cityInstitutionCount} teklif veren kurum var · Bu kategoride toplam ${categoryMatches.length} kurum var`)}
        </div>
        <div class="matching-buttons">${institutionButtons}</div>
        ${diagnosticHtml}
      </div>

      <div class="quote-activity-launch">
        <button type="button" class="quote-activity-btn">🕒 Teklif Hareketlerini Gör</button>
        <span>Mesajlar · revizyonlar · fiyat değişiklikleri · kilit · sorun kayıtları</span>
      </div>

      <div class="quote-actions">
        <button type="button" class="quote-open-btn">↗ Teklifi Aç</button>

        <button
          type="button"
          class="quote-compare-btn"
          ${liveOfferCount ? "" : "disabled"}
        >
          ⇄ Teklifleri Karşılaştır${liveOfferCount ? " (" + liveOfferCount + ")" : ""}
        </button>

        <a class="customer-whatsapp" target="_blank"
          href="https://wa.me/${normalizeWhatsApp(request.phone)}">
          Müşteriye WhatsApp
        </a>

        <button class="quote-status-btn" data-status="sent">İletildi</button>
        <button class="quote-status-btn" data-status="done">Sonuçlandı</button>
        <button class="quote-archive-btn">${request.status==="archived"?"Arşivden Çıkar":"Arşivle"}</button>
      </div>
    `;

    card.querySelectorAll(".diagnostic-edit-btn").forEach(button => {
      button.addEventListener("click", () => {
        const institution = institutionRecords.find(
          item => String(item.id) === String(button.dataset.institutionId)
        );

        if (!institution) return;

        applicationsSection.hidden = true;
        quotesSection.hidden = true;
        institutionsSection.hidden = false;
        applicationsTabBtn.classList.remove("active");
        quotesTabBtn.classList.remove("active");
        institutionsTabBtn.classList.add("active");

        openInstitutionEdit(institution.id, institution);
      });
    });

    card.querySelectorAll(".matched-institution-btn").forEach(button => {
      button.addEventListener("click", () => {
        const institutionName = button.dataset.name;
        const message = [
          "Merhaba, Dijiyer üzerinden yeni bir teklif talebi geldi.",
          "",
          "Hizmet: " + (request.service || "-"),
          request.targetInstitutionId
            ? "Talep Türü: Doğrudan kurum profilinden"
            : "Konum: " + [request.city, request.district].filter(Boolean).join(" / "),
          "Müşteri: " + (request.name || "-"),
          "Telefon: " + (request.phone || "-"),
          request.note ? "Not: " + request.note : "",
          "",
          "Bu talep " + institutionName + " için uygun görünüyor."
        ].filter(Boolean).join("\n");

        window.open(
          `https://wa.me/${button.dataset.phone}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      });
    });

    card.querySelectorAll(".quote-status-btn").forEach(button => {
      button.addEventListener("click", async () => {
        await updateQuoteStatus(request.id, button.dataset.status);
      });
    });

    card.querySelector(".quote-open-btn")?.addEventListener("click", () => {
      openQuoteDetailModal(request.id);
    });

    card.querySelector(".quote-compare-btn")?.addEventListener("click", () => {
      if (!liveOfferCount) return;
      openQuoteCompareModal(request.id);
    });

    card.querySelector(".quote-activity-btn")?.addEventListener("click", async () => {
      await openQuoteActivityModal(request.id);
    });

    card.querySelector(".quote-archive-btn")?.addEventListener("click", async () => {
      const archived = String(request.status || "") === "archived";
      const ok = confirm(archived
        ? "Bu talebi arşivden çıkarıp yeniden aktif listeye almak istiyor musunuz?"
        : "Bu talep silinmeyecek. Mesajlar, teklifler ve sorun kayıtları korunarak arşive taşınacak. Devam edilsin mi?");
      if (!ok) return;

      try {
        const now = new Date().toISOString();
        if (archived) {
          const restoreStatus = request.archivedFromStatus || "new";
          await db.collection("quoteRequests").doc(request.id).update({
            status:restoreStatus,
            archivedAt:null,
            updatedAt:now
          });
        } else {
          await db.collection("quoteRequests").doc(request.id).update({
            archivedFromStatus:request.status || "new",
            status:"archived",
            archivedAt:now,
            updatedAt:now
          });
        }
        adminQuoteActivityCache.delete(request.id);
        await loadQuoteRequests();
      } catch (error) {
        console.error("Teklif talebi arşivlenemedi:", error);
        alert("Arşiv işlemi tamamlanamadı.");
      }
    });

    quoteRequestsList.appendChild(card);
  });
}

function normalizeWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("0") ? "90" + digits.slice(1) : digits;
}

async function updateQuoteStatus(id, status) {
  try {
    await db.collection("quoteRequests").doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    const item = quoteRequestRecords.find(record => record.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      item.currentState = getAdminQuoteLiveState(item);
    }
    adminQuoteActivityCache.delete(id);

    renderQuoteRequests();
  } catch (error) {
    console.error("Teklif durumu güncellenemedi:", error);
    alert("Teklif durumu güncellenemedi.");
  }
}

quoteRequestSearch.addEventListener("input", renderQuoteRequests);
quoteStatusFilter.addEventListener("change", renderQuoteRequests);
quotePeriodFilter?.addEventListener("change", renderQuoteRequests);
quoteSort?.addEventListener("change", renderQuoteRequests);

quoteClearFilters?.addEventListener("click", () => {
  quoteRequestSearch.value = "";
  quoteStatusFilter.value = "";
  if (quotePeriodFilter) quotePeriodFilter.value = "";
  if (quoteSort) quoteSort.value = "newest";
  renderQuoteRequests();
  quoteRequestSearch.focus();
});

quoteRefreshBtn?.addEventListener("click", async () => {
  const oldText = quoteRefreshBtn.innerHTML;
  quoteRefreshBtn.disabled = true;
  quoteRefreshBtn.innerHTML = "<span>↻</span> Yenileniyor...";
  try {
    await loadQuoteRequests();
  } finally {
    quoteRefreshBtn.disabled = false;
    quoteRefreshBtn.innerHTML = oldText;
  }
});

document.querySelectorAll("[data-quote-kpi]").forEach(button => {
  button.addEventListener("click", () => {
    const target = String(button.dataset.quoteKpi || "");
    quoteStatusFilter.value =
      quoteStatusFilter.value === target && target ? "" : target;
    renderQuoteRequests();
  });
});


accountsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
  unmatchedSearchesSection.hidden = true;
  accountsSection.hidden = false;

  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.add("active");

  await loadInstitutionAccounts();
});

async function loadInstitutionAccounts() {
  accountsList.innerHTML = "Kurum hesapları yükleniyor...";

  try {
    const snapshot = await db.collection("institutionUsers").get();

    institutionAccountRecords = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

    const records = institutionAccountRecords;
    refreshAdminOverview();

    accountCount.textContent = `${records.length} kurum hesabı`;

    if (!records.length) {
      accountsList.innerHTML =
        '<div class="empty-state">Henüz kurum hesabı başvurusu yok.</div>';
      return;
    }

    accountsList.innerHTML = "";

    records.forEach(account => {
      const card = document.createElement("div");
      card.className = "account-card";

      const statusLabels = {
        pending: "Onay Bekliyor",
        approved: "Onaylandı",
        rejected: "Reddedildi"
      };

      card.innerHTML = `
        <div class="account-card-main">
          <div>
            <h3>${escapeHtml(account.institutionName || "Kurum")}</h3>
            <div class="account-email">${escapeHtml(account.email || "-")}</div>
          </div>
          <span class="account-status status-${escapeHtml(account.status || "pending")}">
            ${statusLabels[account.status] || "Onay Bekliyor"}
          </span>
        </div>

        <div class="account-meta">
          <span>Kurum ID: ${escapeHtml(account.institutionId || "-")}</span>
          <span>Başvuru: ${formatDate(account.date)}</span>
        </div>

        <div class="account-actions">
          <button class="approve-account-btn">✓ Onayla</button>
          <button class="reject-account-btn">✕ Reddet</button>
        </div>
      `;

      card.querySelector(".approve-account-btn").addEventListener("click", async () => {
        await updateInstitutionAccountStatus(account.id, "approved");
      });

      card.querySelector(".reject-account-btn").addEventListener("click", async () => {
        await updateInstitutionAccountStatus(account.id, "rejected");
      });

      accountsList.appendChild(card);
    });

  } catch (error) {
    console.error("Kurum hesapları yüklenemedi:", error);
    accountsList.innerHTML =
      "<p>Kurum hesapları yüklenemedi. Firestore kurallarını kontrol edin.</p>";
  }
}

async function updateInstitutionAccountStatus(id, status) {
  try {
    await db.collection("institutionUsers").doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    await loadInstitutionAccounts();
  } catch (error) {
    console.error("Kurum hesabı güncellenemedi:", error);
    alert("Kurum hesabı güncellenemedi.");
  }
}


/* =========================================================
   GENEL BAKIŞ / YÖNETİM MERKEZİ
   ========================================================= */

function setOverviewText(element, value) {
  if (element) element.textContent = String(value ?? 0);
}

function getOverviewPendingApplications() {
  return applicationRecords.filter(item =>
    String(item.status || "pending") !== "rejected"
  ).length;
}

function getOverviewAllIssues() {
  return quoteRequestRecords.flatMap(request =>
    (Array.isArray(request.liveIssues) ? request.liveIssues : []).map(issue => ({
      ...issue,
      quoteId: request.id,
      request
    }))
  );
}

function refreshAdminOverview() {
  if (!overviewSection) return;

  const totalOffers = quoteRequestRecords.reduce(
    (sum, request) => sum + (Array.isArray(request.liveOffers) ? request.liveOffers.length : 0),
    0
  );

  const noOfferRequests = quoteRequestRecords.filter(request =>
    (Array.isArray(request.liveOffers) ? request.liveOffers.length : 0) === 0 &&
    !["done", "used"].includes(request.currentState || getAdminQuoteLiveState(request))
  );

  const lockedCount = quoteRequestRecords.filter(request =>
    (request.currentState || getAdminQuoteLiveState(request)) === "locked"
  ).length;

  const usedCount = quoteRequestRecords.filter(request =>
    (request.currentState || getAdminQuoteLiveState(request)) === "used"
  ).length;

  const allIssues = getOverviewAllIssues();
  const openIssues = allIssues.filter(issue =>
    !["resolved","archived"].includes(String(issue.status || "new"))
  );

  setOverviewText(
    overviewInstitutionCount,
    institutionRecords.filter(item => String(item.status || "active") !== "passive").length
  );
  setOverviewText(overviewPendingApplications, getOverviewPendingApplications());
  setOverviewText(overviewQuoteCount, quoteRequestRecords.length);
  setOverviewText(overviewNoOfferCount, noOfferRequests.length);
  setOverviewText(overviewOfferCount, totalOffers);
  setOverviewText(overviewLockedCount, lockedCount);
  setOverviewText(overviewUsedCount, usedCount);
  setOverviewText(overviewIssueCount, openIssues.length);
  setOverviewText(quickQuoteCount, quoteRequestRecords.length);
  setOverviewText(quickApplicationCount, getOverviewPendingApplications());
  setOverviewText(quickIssueCount, openIssues.length);

  renderOverviewAttention(noOfferRequests, openIssues);
  renderOverviewRecentActivity();
  renderOverviewCategorySummary();
  renderOverviewCitySummary();
}

function renderOverviewAttention(noOfferRequests, openIssues) {
  if (!overviewAttentionList) return;

  const items = [];

  if (openIssues.length) {
    items.push({
      title: `${openIssues.length} açık sorun bildirimi`,
      description: "Müşterilerin kilitlenmiş tekliflerle ilgili bildirimleri var.",
      action: "issues",
      button: "İncele"
    });
  }

  if (noOfferRequests.length) {
    items.push({
      title: `${noOfferRequests.length} talep henüz teklif almadı`,
      description: "Uygun kurum eşleşmelerini ve teklif alımı açık kurumları kontrol edin.",
      action: "quotes",
      button: "Taleplere Git"
    });
  }

  const pendingApplications = getOverviewPendingApplications();
  if (pendingApplications) {
    items.push({
      title: `${pendingApplications} kurum başvurusu bekliyor`,
      description: "Yeni kurumları inceleyip onaylayabilir veya reddedebilirsiniz.",
      action: "applications",
      button: "Başvurular"
    });
  }

  const pendingAccounts = institutionAccountRecords.filter(
    item => String(item.status || "pending") === "pending"
  ).length;

  if (pendingAccounts) {
    items.push({
      title: `${pendingAccounts} kurum hesabı onay bekliyor`,
      description: "Kurum paneline giriş yetkisi bekleyen hesaplar var.",
      action: "accounts",
      button: "Hesaplar"
    });
  }

  if (!items.length) {
    overviewAttentionList.innerHTML =
      '<div class="empty-state">Şu anda acil işlem gerektiren bir kayıt görünmüyor.</div>';
    setOverviewText(overviewAttentionCount, 0);
    return;
  }

  setOverviewText(overviewAttentionCount, items.length);

  overviewAttentionList.innerHTML = items.map(item => `
    <div class="overview-attention-item">
      <div class="overview-attention-main">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </div>
      <button type="button" data-overview-action="${item.action}">
        ${escapeHtml(item.button)}
      </button>
    </div>
  `).join("");

  overviewAttentionList.querySelectorAll("[data-overview-action]").forEach(button => {
    button.addEventListener("click", () => {
      openAdminTabFromOverview(button.dataset.overviewAction);
    });
  });
}

function openAdminTabFromOverview(action) {
  const map = {
    overview: overviewTabBtn,
    applications: applicationsTabBtn,
    institutions: institutionsTabBtn,
    quotes: quotesTabBtn,
    offers: offerReportTabBtn,
    issues: issuesTabBtn,
    accounts: accountsTabBtn,
    bannerAds: document.getElementById("bannerAdsTabBtn"),
    promotionOrders: document.getElementById("promotionOrdersTabBtn"),
    adCalendar: document.getElementById("adCalendarTabBtn"),
    adRevenue: document.getElementById("adRevenueTabBtn"),
    support: document.getElementById("supportTabBtn")
  };

  map[action]?.click();
}

function renderOverviewRecentActivity() {
  if (!overviewRecentActivity) return;

  const recent = [...quoteRequestRecords]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 8);

  if (!recent.length) {
    overviewRecentActivity.innerHTML =
      '<div class="empty-state">Henüz teklif talebi bulunmuyor.</div>';
    return;
  }

  overviewRecentActivity.innerHTML = recent.map(request => {
    const state = request.currentState || getAdminQuoteLiveState(request);
    const [stateLabel] = getAdminQuoteStateMeta(state);
    const offers = Array.isArray(request.liveOffers) ? request.liveOffers.length : 0;

    return `
      <div class="overview-recent-item">
        <div class="overview-recent-top">
          <strong>${escapeHtml(request.service || "Teklif Talebi")}</strong>
          <span>${formatDate(request.date)}</span>
        </div>
        <span>${escapeHtml(request.name || "-")} · ${escapeHtml([request.city, request.district].filter(Boolean).join(" / ") || "-")}</span>
        <div class="overview-recent-meta">
          <span class="overview-mini-badge">${escapeHtml(stateLabel)}</span>
          <span class="overview-mini-badge">${offers} teklif</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderOverviewCategorySummary() {
  if (!overviewCategoryTableBody) return;

  const map = new Map();

  quoteRequestRecords.forEach(request => {
    const key = request.subCategory || request.category || request.mainCategory || "diger";

    if (!map.has(key)) {
      map.set(key, { key, requests: 0, offers: 0, covered: 0 });
    }

    const row = map.get(key);
    const offerCount = Array.isArray(request.liveOffers) ? request.liveOffers.length : 0;

    row.requests += 1;
    row.offers += offerCount;
    if (offerCount > 0) row.covered += 1;
  });

  const rows = [...map.values()]
    .sort((a, b) => b.requests - a.requests || b.offers - a.offers)
    .slice(0, 10);

  if (!rows.length) {
    overviewCategoryTableBody.innerHTML =
      '<tr><td colspan="4">Henüz sektör verisi bulunmuyor.</td></tr>';
    return;
  }

  overviewCategoryTableBody.innerHTML = rows.map(row => {
    const coverage = row.requests ? (row.covered / row.requests) * 100 : 0;

    return `
      <tr>
        <td><strong>${escapeHtml(getReportCategoryLabel(row.key))}</strong></td>
        <td>${row.requests}</td>
        <td>${row.offers}</td>
        <td>
          %${coverage.toFixed(0)}
          <div class="overview-progress">
            <span style="width:${Math.min(100, coverage)}%"></span>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderOverviewCitySummary() {
  if (!overviewCityList) return;

  const map = new Map();

  quoteRequestRecords.forEach(request => {
    const city = String(request.city || "").trim() || "Belirsiz";

    if (!map.has(city)) {
      map.set(city, { city, requests: 0, offers: 0 });
    }

    const row = map.get(city);
    row.requests += 1;
    row.offers += Array.isArray(request.liveOffers) ? request.liveOffers.length : 0;
  });

  const rows = [...map.values()]
    .sort((a, b) => b.requests - a.requests || b.offers - a.offers)
    .slice(0, 8);

  if (!rows.length) {
    overviewCityList.innerHTML =
      '<div class="empty-state">Henüz şehir verisi bulunmuyor.</div>';
    return;
  }

  overviewCityList.innerHTML = rows.map(row => `
    <div class="overview-city-item">
      <div class="overview-city-top">
        <strong>${escapeHtml(row.city)}</strong>
        <span>${row.requests} talep</span>
      </div>
      <small>${row.offers} fiyat teklifi gönderildi</small>
    </div>
  `).join("");
}

overviewRefreshBtn?.addEventListener("click", async () => {
  overviewRefreshBtn.disabled = true;
  overviewRefreshBtn.textContent = "Yenileniyor...";

  try {
    await loadApplications();
    await loadInstitutions();
    await loadQuoteRequests();
    await loadInstitutionAccounts();
    refreshAdminOverview();
  } finally {
    overviewRefreshBtn.disabled = false;
    overviewRefreshBtn.textContent = "Verileri Yenile";
  }
});

/* =========================================================
   SORUN ÇÖZÜM MERKEZİ
   ========================================================= */

function getIssueStatusMeta(status) {
  const map = {
    new: ["Yeni","new"],
    reviewing: ["İnceleniyor","reviewing"],
    waiting_business: ["Firma Yanıtı Bekleniyor","waiting"],
    waiting_customer: ["Müşteri Yanıtı Bekleniyor","waiting"],
    resolved: ["Çözüldü","resolved"],
    archived: ["Arşiv","archived"]
  };
  return map[String(status || "new")] || ["Yeni","new"];
}

function getIssueDecisionMeta(decision) {
  const map = {
    mutual_resolution: "Taraflar uzlaştı",
    offer_honored: "Kilitli teklif uygulandı",
    customer_claim_supported: "Müşteri bildirimi kayıtlarla desteklendi",
    business_response_supported: "Firma açıklaması kayıtlarla desteklendi",
    insufficient_evidence: "Yeterli kanıt yok",
    customer_withdrew: "Müşteri bildirimini geri çekti"
  };
  return map[String(decision || "")] || "Karar verilmedi";
}

function getIssueInstitution(request) {
  const institutionId = request?.liveLock?.institutionId;
  return institutionRecords.find(item =>
    String(item.id) === String(institutionId || "")
  ) || null;
}

function adminMoney(value) {
  return new Intl.NumberFormat("tr-TR").format(Number(value || 0)) + " TL";
}

function adminWhatsappDigits(raw) {
  let digits = String(raw || "").replace(/\D/g,"");
  if (digits.startsWith("0")) digits = "90" + digits.slice(1);
  if (digits.length === 10) digits = "90" + digits;
  return digits;
}

function issueHistoryHtml(item) {
  const history = Array.isArray(item.statusHistory) ? [...item.statusHistory] : [];
  if (!history.length) {
    return '<div class="issue-history-empty">Henüz yönetici işlem geçmişi yok.</div>';
  }

  return history
    .sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))
    .slice(0,8)
    .map(entry => {
      const [label] = getIssueStatusMeta(entry.status);
      const decision = entry.decision ? " · " + getIssueDecisionMeta(entry.decision) : "";
      return `
        <div class="issue-history-row">
          <span></span>
          <div>
            <strong>${escapeHtml(label + decision)}</strong>
            <small>${formatDate(entry.date)}</small>
            ${entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : ""}
          </div>
        </div>
      `;
    }).join("");
}

function getFilteredIssues() {
  const query = String(issueSearch?.value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const status = issueStatusFilter?.value || "";
  const decision = issueDecisionFilter?.value || "";

  return getOverviewAllIssues()
    .filter(item => {
      const request = item.request || {};
      const lock = request.liveLock || {};
      const institution = getIssueInstitution(request);
      const itemStatus = String(item.status || "new");
      const itemDecision = String(item.decision || "");

      const haystack = [
        item.offerCode,
        item.reason,
        item.customerFollowup,
        item.businessResponse,
        item.adminNote,
        item.outcomeSummary,
        getIssueDecisionMeta(itemDecision),
        request.name,
        request.phone,
        request.service,
        request.city,
        request.district,
        lock.institutionName,
        institution?.phone
      ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

      return (!query || haystack.includes(query)) &&
        (!status || itemStatus === status) &&
        (!decision || itemDecision === decision);
    })
    .sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));
}

function renderIssueCenter() {
  if (!issuesList) return;

  const all = getOverviewAllIssues();
  const filtered = getFilteredIssues();
  const counts = {
    new:0,
    reviewing:0,
    waiting_business:0,
    waiting_customer:0,
    resolved:0,
    archived:0
  };

  all.forEach(item => {
    const key = String(item.status || "new");
    if (Object.prototype.hasOwnProperty.call(counts,key)) counts[key] += 1;
  });

  const open = counts.new + counts.reviewing + counts.waiting_business + counts.waiting_customer;

  if (issueCount) {
    issueCount.textContent =
      `${all.length} bildirim · ${open} açık · ${counts.resolved} çözüldü · ${counts.archived} arşiv`;
  }

  setOverviewText(issueKpiTotal, all.length);
  setOverviewText(issueKpiNew, counts.new);
  setOverviewText(issueKpiReviewing, counts.reviewing);
  setOverviewText(issueKpiBusiness, counts.waiting_business);
  setOverviewText(issueKpiCustomer, counts.waiting_customer);
  setOverviewText(issueKpiResolved, counts.resolved);
  if (issueTabCount) issueTabCount.textContent = open;

  if (!filtered.length) {
    issuesList.innerHTML =
      '<div class="empty-state">Filtreye uygun sorun bildirimi bulunamadı.</div>';
    return;
  }

  issuesList.innerHTML = filtered.map(item => {
    const request = item.request || {};
    const lock = request.liveLock || {};
    const institution = getIssueInstitution(request);
    const status = String(item.status || "new");
    const [statusLabel,statusClass] = getIssueStatusMeta(status);
    const decisionLabel = getIssueDecisionMeta(item.decision);
    const customerPhone = request.phone || "";
    const institutionPhone = institution?.phone || "";
    const customerWa = adminWhatsappDigits(customerPhone);
    const institutionWa = adminWhatsappDigits(institutionPhone);

    return `
      <article class="issue-case-card state-${escapeHtml(statusClass)}">
        <div class="issue-case-head">
          <div>
            <div class="issue-case-kicker">SORUN DOSYASI · ${escapeHtml(item.id || "-")}</div>
            <h4>${escapeHtml(request.service || "Teklif Sorunu")}</h4>
            <div class="issue-code">Teklif No: <b>${escapeHtml(item.offerCode || lock.offerCode || "-")}</b></div>
          </div>
          <div class="issue-case-statuses">
            <span class="issue-status ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>
            ${item.decision ? `<span class="issue-decision-badge">${escapeHtml(decisionLabel)}</span>` : ""}
          </div>
        </div>

        <div class="issue-claim-block">
          <span>Müşterinin ilk bildirimi</span>
          <strong>${escapeHtml(item.reason || "Açıklama yok")}</strong>
          <small>Bildirim tarihi: ${formatDate(item.date)}</small>
        </div>

        <div class="issue-evidence-title">
          <strong>🔒 Kilitlenen teklif kaydı</strong>
          <span>Bu alan mevcut kilit kaydından okunur; değerlendirmede esas alınır.</span>
        </div>

        <div class="issue-evidence-grid">
          <div><small>Firma</small><strong>${escapeHtml(lock.institutionName || institution?.name || "-")}</strong></div>
          <div><small>Kilitli Fiyat</small><strong>${lock.price !== undefined ? adminMoney(lock.price) : "-"}</strong></div>
          <div><small>KDV</small><strong>${escapeHtml(lock.vatStatus || "-")}</strong></div>
          <div><small>Son Geçerlilik</small><strong>${formatDate(lock.expiresAt)}</strong></div>
          <div class="wide"><small>Teklif Kapsamı</small><strong>${escapeHtml(lock.scope || "Kapsam bilgisi yok")}</strong></div>
          <div class="wide"><small>Özel Şart</small><strong>${escapeHtml(lock.conditions || "Özel şart belirtilmemiş")}</strong></div>
        </div>

        <div class="issue-parties-grid">
          <section>
            <div class="issue-party-head">
              <div>
                <span>MÜŞTERİ</span>
                <strong>${escapeHtml(request.name || "-")}</strong>
                <small>${escapeHtml(customerPhone || "Telefon yok")}</small>
              </div>
              ${customerWa ? `<button type="button" class="issue-contact-btn" data-issue-whatsapp="${customerWa}" data-party-name="${escapeHtml(request.name || "Müşteri")}">WhatsApp</button>` : ""}
            </div>
            <label>Ek müşteri açıklaması <small>(yönetici tarafından kaydedilir)</small>
              <textarea data-issue-customer-followup="${escapeHtml(item.id)}" rows="3" maxlength="1000" placeholder="Müşteriden alınan ek açıklamayı yazın...">${escapeHtml(item.customerFollowup || "")}</textarea>
            </label>
          </section>

          <section>
            <div class="issue-party-head">
              <div>
                <span>FİRMA</span>
                <strong>${escapeHtml(lock.institutionName || institution?.name || "-")}</strong>
                <small>${escapeHtml(institutionPhone || "Telefon yok")}</small>
              </div>
              ${institutionWa ? `<button type="button" class="issue-contact-btn business" data-issue-whatsapp="${institutionWa}" data-party-name="${escapeHtml(lock.institutionName || institution?.name || "Firma")}">WhatsApp</button>` : ""}
            </div>
            <label>Firma açıklaması <small>(yönetici tarafından kaydedilir)</small>
              <textarea data-issue-business-response="${escapeHtml(item.id)}" rows="3" maxlength="1000" placeholder="Firmanın açıklamasını olduğu gibi kaydedin...">${escapeHtml(item.businessResponse || "")}</textarea>
            </label>
          </section>
        </div>

        <div class="issue-admin-review">
          <div class="issue-admin-review-title">
            <strong>Yönetici değerlendirmesi</strong>
            <span>Karar vermeden önce iki tarafın beyanını ve kilitli teklif şartlarını karşılaştırın.</span>
          </div>

          <div class="issue-review-grid">
            <label>Durum
              <select data-issue-status="${escapeHtml(item.id)}">
                <option value="new" ${status==="new"?"selected":""}>Yeni</option>
                <option value="reviewing" ${status==="reviewing"?"selected":""}>İnceleniyor</option>
                <option value="waiting_business" ${status==="waiting_business"?"selected":""}>Firma yanıtı bekleniyor</option>
                <option value="waiting_customer" ${status==="waiting_customer"?"selected":""}>Müşteri yanıtı bekleniyor</option>
                <option value="resolved" ${status==="resolved"?"selected":""}>Çözüldü</option>
                <option value="archived" ${status==="archived"?"selected":""}>Arşiv</option>
              </select>
            </label>

            <label>Karar
              <select data-issue-decision="${escapeHtml(item.id)}">
                <option value="">Karar verilmedi</option>
                <option value="mutual_resolution" ${item.decision==="mutual_resolution"?"selected":""}>Taraflar uzlaştı</option>
                <option value="offer_honored" ${item.decision==="offer_honored"?"selected":""}>Kilitli teklif uygulandı</option>
                <option value="customer_claim_supported" ${item.decision==="customer_claim_supported"?"selected":""}>Müşteri bildirimi kayıtlarla desteklendi</option>
                <option value="business_response_supported" ${item.decision==="business_response_supported"?"selected":""}>Firma açıklaması kayıtlarla desteklendi</option>
                <option value="insufficient_evidence" ${item.decision==="insufficient_evidence"?"selected":""}>Yeterli kanıt yok</option>
                <option value="customer_withdrew" ${item.decision==="customer_withdrew"?"selected":""}>Müşteri bildirimini geri çekti</option>
              </select>
            </label>
          </div>

          <label>Yönetici notu
            <textarea data-issue-admin-note="${escapeHtml(item.id)}" rows="3" maxlength="1500" placeholder="Kayıtlar, görüşmeler ve değerlendirmenin kısa özeti...">${escapeHtml(item.adminNote || "")}</textarea>
          </label>

          <label>Sonuç özeti <small>(dosya kapatılırken net ve tarafsız yazın)</small>
            <textarea data-issue-outcome="${escapeHtml(item.id)}" rows="2" maxlength="1000" placeholder="Örn. Kilitli teklif şartları firma tarafından kabul edildi ve işlem tamamlandı.">${escapeHtml(item.outcomeSummary || "")}</textarea>
          </label>

          <div class="issue-case-actions">
            <button type="button" class="primary" data-issue-action="save" data-quote-id="${request.id}" data-issue-id="${item.id}">Kaydet</button>
            <button type="button" data-issue-action="quotes" data-quote-id="${request.id}">Talep Detayını Gör</button>
            ${status === "archived"
              ? `<button type="button" data-issue-action="reopen" data-quote-id="${request.id}" data-issue-id="${item.id}">Arşivden Çıkar</button>`
              : `<button type="button" class="archive" data-issue-action="archive" data-quote-id="${request.id}" data-issue-id="${item.id}">Arşivle</button>`
            }
          </div>
        </div>

        <details class="issue-history">
          <summary>İşlem geçmişi</summary>
          <div class="issue-history-list">${issueHistoryHtml(item)}</div>
        </details>
      </article>
    `;
  }).join("");

  issuesList.querySelectorAll("[data-issue-whatsapp]").forEach(button => {
    button.addEventListener("click", () => {
      const digits = button.dataset.issueWhatsapp;
      if (!digits) return;
      const name = button.dataset.partyName || "";
      const text = encodeURIComponent(
        "Merhaba " + name + ", Dijiyer üzerinden iletilen bir teklif sorun bildirimi hakkında tarafsız inceleme yapıyoruz. Görüşünüzü almak istiyoruz."
      );
      window.open("https://wa.me/" + digits + "?text=" + text, "_blank", "noopener");
    });
  });

  issuesList.querySelectorAll("[data-issue-action]").forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.dataset.issueAction;
      const quoteId = button.dataset.quoteId;
      const issueId = button.dataset.issueId;

      if (action === "quotes") {
        quotesTabBtn.click();
        requestAnimationFrame(() => {
          const card = document.querySelector(
            '#quoteRequestsList .quote-request-card[data-quote-id="' +
            CSS.escape(String(quoteId || "")) + '"]'
          );
          card?.scrollIntoView({behavior:"smooth",block:"center"});
          card?.classList.add("admin-focus-flash");
          setTimeout(()=>card?.classList.remove("admin-focus-flash"),1800);
        });
        return;
      }

      if (action === "save") {
        await saveOfferIssueCase(quoteId,issueId,button);
        return;
      }

      if (action === "archive") {
        const ok = confirm("Bu dosya silinmeyecek; yalnızca arşive taşınacak. Devam edilsin mi?");
        if (ok) await quickOfferIssueStatus(quoteId,issueId,"archived","Dosya arşive taşındı.");
        return;
      }

      if (action === "reopen") {
        await quickOfferIssueStatus(quoteId,issueId,"reviewing","Dosya yeniden incelemeye alındı.");
      }
    });
  });
}

async function saveOfferIssueCase(quoteId, issueId, button) {
  const status = document.querySelector(
    `[data-issue-status="${CSS.escape(String(issueId))}"]`
  )?.value || "new";
  const decision = document.querySelector(
    `[data-issue-decision="${CSS.escape(String(issueId))}"]`
  )?.value || "";
  const customerFollowup = document.querySelector(
    `[data-issue-customer-followup="${CSS.escape(String(issueId))}"]`
  )?.value.trim() || "";
  const businessResponse = document.querySelector(
    `[data-issue-business-response="${CSS.escape(String(issueId))}"]`
  )?.value.trim() || "";
  const adminNote = document.querySelector(
    `[data-issue-admin-note="${CSS.escape(String(issueId))}"]`
  )?.value.trim() || "";
  const outcomeSummary = document.querySelector(
    `[data-issue-outcome="${CSS.escape(String(issueId))}"]`
  )?.value.trim() || "";

  if (status === "resolved" && !decision) {
    alert("Dosyayı çözüldü olarak kapatmadan önce bir karar seçin.");
    return;
  }

  if (status === "resolved" && !outcomeSummary) {
    alert("Dosyayı çözüldü olarak kapatmadan önce sonuç özetini yazın.");
    return;
  }

  const oldText = button?.textContent || "Kaydet";
  if (button) {
    button.disabled = true;
    button.textContent = "Kaydediliyor...";
  }

  try {
    const now = new Date().toISOString();
    const ref = db.collection("quoteRequests").doc(quoteId)
      .collection("offerIssues").doc(issueId);

    await ref.update({
      status,
      decision,
      customerFollowup,
      businessResponse,
      adminNote,
      outcomeSummary,
      updatedAt:now,
      resolvedAt: status === "resolved" ? now : null,
      archivedAt: status === "archived" ? now : null,
      statusHistory: firebase.firestore.FieldValue.arrayUnion({
        status,
        decision,
        summary: outcomeSummary || adminNote || "",
        date:now
      })
    });

    await loadQuoteRequests();
  } catch (error) {
    console.error("Sorun dosyası kaydedilemedi:", error);
    alert("Sorun dosyası kaydedilemedi.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function quickOfferIssueStatus(quoteId, issueId, status, summary) {
  try {
    const now = new Date().toISOString();
    await db.collection("quoteRequests").doc(quoteId)
      .collection("offerIssues").doc(issueId).update({
        status,
        updatedAt:now,
        resolvedAt: status === "resolved" ? now : null,
        archivedAt: status === "archived" ? now : null,
        statusHistory: firebase.firestore.FieldValue.arrayUnion({
          status,
          decision:"",
          summary:summary || "",
          date:now
        })
      });

    await loadQuoteRequests();
  } catch (error) {
    console.error("Sorun durumu güncellenemedi:", error);
    alert("Sorun durumu güncellenemedi.");
  }
}

issueSearch?.addEventListener("input", renderIssueCenter);
issueStatusFilter?.addEventListener("change", renderIssueCenter);
issueDecisionFilter?.addEventListener("change", renderIssueCenter);


/* =========================================================
   BULUNAMAYAN ARAMALAR
   Kullanıcıların sonuç/kategori bulamadığı sorguları yönetir.
   ========================================================= */
function unmatchedSearchReasonLabel(reason) {
  return String(reason || '') === 'no_institution_result'
    ? 'Kategori var · kurum sonucu yok'
    : 'Kategori / alt kategori bulunamadı';
}

function unmatchedSearchStatusLabel(status) {
  const map = {
    new:'Yeni',
    reviewed:'İncelendi',
    category_added:'Kategoriye Eklendi'
  };
  return map[String(status || 'new')] || 'Yeni';
}

async function loadUnmatchedSearches(silent = false) {
  if (!unmatchedSearchesList) return;

  if (!silent) {
    unmatchedSearchesList.innerHTML =
      '<div class="advanced-empty">Bulunamayan aramalar yükleniyor...</div>';
  }

  try {
    const snapshot = await db.collection('unmatchedSearches')
      .orderBy('createdAt','desc')
      .limit(250)
      .get();

    unmatchedSearchRecords = snapshot.docs.map(doc => ({
      id:doc.id,
      ...doc.data()
    }));

    renderUnmatchedSearches();
  } catch (error) {
    console.warn('Bulunamayan aramalar yüklenemedi:', error);
    unmatchedSearchRecords = [];

    if (unmatchedSearchesList && !silent) {
      unmatchedSearchesList.innerHTML =
        '<div class="advanced-empty">Kayıtlar okunamadı. Firestore kuralında unmatchedSearches koleksiyonuna yönetici okuma izni eklenmelidir.</div>';
    }

    if (unmatchedSearchesTabCount) unmatchedSearchesTabCount.textContent = '0';
  }
}

function renderUnmatchedSearches() {
  if (!unmatchedSearchesList) return;

  const total = unmatchedSearchRecords.length;
  const newCount = unmatchedSearchRecords.filter(item =>
    String(item.status || 'new') === 'new'
  ).length;
  const categoryMissing = unmatchedSearchRecords.filter(item =>
    String(item.reason || '') === 'category_not_found'
  ).length;
  const noInstitution = unmatchedSearchRecords.filter(item =>
    String(item.reason || '') === 'no_institution_result'
  ).length;

  if (unmatchedSearchTotal) unmatchedSearchTotal.textContent = total;
  if (unmatchedSearchNew) unmatchedSearchNew.textContent = newCount;
  if (unmatchedSearchCategoryMissing) unmatchedSearchCategoryMissing.textContent = categoryMissing;
  if (unmatchedSearchNoInstitution) unmatchedSearchNoInstitution.textContent = noInstitution;
  if (unmatchedSearchesTabCount) unmatchedSearchesTabCount.textContent = newCount;
  if (unmatchedSearchesCount) {
    unmatchedSearchesCount.textContent =
      total + ' kayıt · ' + newCount + ' yeni · gerçek kullanıcı aramalarından kategori geliştirme sinyalleri';
  }

  const query = String(unmatchedSearchQuery?.value || '')
    .trim()
    .toLocaleLowerCase('tr-TR');
  const status = String(unmatchedSearchStatusFilter?.value || '');
  const reason = String(unmatchedSearchReasonFilter?.value || '');

  const rows = unmatchedSearchRecords.filter(item => {
    const haystack = [
      item.query,
      item.mainCategoryLabel,
      item.mainCategory,
      item.city,
      item.district,
      ...(Array.isArray(item.suggestionLabels) ? item.suggestionLabels : [])
    ].join(' ').toLocaleLowerCase('tr-TR');

    return (!query || haystack.includes(query)) &&
      (!status || String(item.status || 'new') === status) &&
      (!reason || String(item.reason || '') === reason);
  });

  if (!rows.length) {
    unmatchedSearchesList.innerHTML =
      '<div class="advanced-empty">Bu filtreye uygun bulunamayan arama kaydı yok.</div>';
    return;
  }

  unmatchedSearchesList.innerHTML = rows.map(item => {
    const suggestions = Array.isArray(item.suggestionLabels)
      ? item.suggestionLabels.filter(Boolean)
      : [];
    const location = [item.city,item.district].filter(Boolean).join(' / ') || 'Konum seçilmedi';
    const recordStatus = String(item.status || 'new');

    return '<article class="unmatched-search-card ' +
      escapeHtml(recordStatus) +
      '" data-unmatched-id="' + escapeHtml(item.id) + '">' +
        '<div class="unmatched-search-main">' +
          '<div class="unmatched-search-query-row">' +
            '<div>' +
              '<span>' + escapeHtml(unmatchedSearchReasonLabel(item.reason)) + '</span>' +
              '<h4>' + escapeHtml(item.query || 'Arama') + '</h4>' +
            '</div>' +
            '<em class="unmatched-status ' + escapeHtml(recordStatus) + '">' +
              escapeHtml(unmatchedSearchStatusLabel(recordStatus)) +
            '</em>' +
          '</div>' +
          '<div class="unmatched-search-meta">' +
            '<span>📂 ' + escapeHtml(item.mainCategoryLabel || 'Kategori belirlenemedi') + '</span>' +
            '<span>📍 ' + escapeHtml(location) + '</span>' +
            '<span>🕒 ' + escapeHtml(formatDate(item.createdAt)) + '</span>' +
          '</div>' +
          (suggestions.length
            ? '<div class="unmatched-search-suggestions"><small>Yakın öneriler</small>' +
              suggestions.map(label => '<b>' + escapeHtml(label) + '</b>').join('') +
              '</div>'
            : '') +
        '</div>' +
        '<div class="unmatched-search-actions">' +
          (recordStatus !== 'reviewed'
            ? '<button type="button" data-unmatched-status="reviewed">İncelendi</button>'
            : '') +
          (recordStatus !== 'category_added'
            ? '<button type="button" class="primary" data-unmatched-status="category_added">Kategoriye Eklendi</button>'
            : '') +
          '<button type="button" class="danger" data-unmatched-delete>Sil</button>' +
        '</div>' +
      '</article>';
  }).join('');
}

async function updateUnmatchedSearchStatus(id, status) {
  try {
    await db.collection('unmatchedSearches').doc(id).update({
      status,
      updatedAt:new Date().toISOString()
    });
    const row = unmatchedSearchRecords.find(item => String(item.id) === String(id));
    if (row) {
      row.status = status;
      row.updatedAt = new Date().toISOString();
    }
    renderUnmatchedSearches();
  } catch (error) {
    console.error('Bulunamayan arama durumu kaydedilemedi:', error);
    alert('Durum kaydedilemedi. Firestore yönetici yazma iznini kontrol edin.');
  }
}

async function deleteUnmatchedSearch(id) {
  const ok = confirm('Bu arama kaydını silmek istiyor musunuz?');
  if (!ok) return;

  try {
    await db.collection('unmatchedSearches').doc(id).delete();
    unmatchedSearchRecords = unmatchedSearchRecords.filter(item =>
      String(item.id) !== String(id)
    );
    renderUnmatchedSearches();
  } catch (error) {
    console.error('Bulunamayan arama silinemedi:', error);
    alert('Kayıt silinemedi.');
  }
}

unmatchedSearchesTabBtn?.addEventListener('click', async () => {
  overviewSection.hidden = true;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
  issuesSection.hidden = true;
  accountsSection.hidden = true;
  unmatchedSearchesSection.hidden = false;

  [
    overviewTabBtn, applicationsTabBtn, institutionsTabBtn, quotesTabBtn,
    offerReportTabBtn, issuesTabBtn, accountsTabBtn
  ].forEach(button => button?.classList.remove('active'));

  unmatchedSearchesTabBtn.classList.add('active');
  await loadUnmatchedSearches();
});

unmatchedSearchQuery?.addEventListener('input', renderUnmatchedSearches);
unmatchedSearchStatusFilter?.addEventListener('change', renderUnmatchedSearches);
unmatchedSearchReasonFilter?.addEventListener('change', renderUnmatchedSearches);
unmatchedSearchesRefreshBtn?.addEventListener('click', () => loadUnmatchedSearches());

unmatchedSearchesList?.addEventListener('click', event => {
  const card = event.target.closest('[data-unmatched-id]');
  if (!card) return;

  const id = card.dataset.unmatchedId;
  const statusButton = event.target.closest('[data-unmatched-status]');
  const deleteButton = event.target.closest('[data-unmatched-delete]');

  if (statusButton) {
    updateUnmatchedSearchStatus(id, statusButton.dataset.unmatchedStatus);
    return;
  }

  if (deleteButton) deleteUnmatchedSearch(id);
});
