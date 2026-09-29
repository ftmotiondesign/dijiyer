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
const offerReportSection = document.getElementById("offerReportSection");
const issuesSection = document.getElementById("issuesSection");
const accountsSection = document.getElementById("accountsSection");
const overviewTabBtn = document.getElementById("overviewTabBtn");
const applicationsTabBtn = document.getElementById("applicationsTabBtn");
const institutionsTabBtn = document.getElementById("institutionsTabBtn");
const quotesTabBtn = document.getElementById("quotesTabBtn");
const offerReportTabBtn = document.getElementById("offerReportTabBtn");
const issuesTabBtn = document.getElementById("issuesTabBtn");
const accountsTabBtn = document.getElementById("accountsTabBtn");
const institutionEditModal = document.getElementById("institutionEditModal");
const institutionSearch = document.getElementById("institutionSearch");
const institutionCategoryFilter = document.getElementById("institutionCategoryFilter");
const institutionCityFilter = document.getElementById("institutionCityFilter");
const institutionFeatureFilter = document.getElementById("institutionFeatureFilter");
const institutionSort = document.getElementById("institutionSort");
const clearInstitutionFilters = document.getElementById("clearInstitutionFilters");
const institutionFilterResult = document.getElementById("institutionFilterResult");
const institutionStatTotal = document.getElementById("institutionStatTotal");
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

const accountsList = document.getElementById("accountsList");
const accountCount = document.getElementById("accountCount");

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
const quickQuoteCount = document.getElementById("quickQuoteCount");
const quickApplicationCount = document.getElementById("quickApplicationCount");
const quickIssueCount = document.getElementById("quickIssueCount");
const quickSupportCount = document.getElementById("quickSupportCount");

const ADMIN_TAB_META = {
  overviewTabBtn:["overview","Genel Bakış","Bugün ilgilenmeniz gereken konuları ve temel rakamları görün."],
  quotesTabBtn:["quotes","Teklif Talepleri","Müşteri taleplerini, gelen teklifleri ve tüm teklif hareketlerini yönetin."],
  issuesTabBtn:["quotes","Sorun Çözüm Merkezi","Müşteri ve firma beyanlarını kilitli teklif kayıtlarıyla birlikte tarafsız inceleyin."],
  offerReportTabBtn:["quotes","Teklif Raporu","Kurumların teklif performansını ve teklif sonuçlarını inceleyin."],
  institutionsTabBtn:["institutions","Kurumlar","Yayındaki kurumları arayın, düzenleyin ve teklif durumlarını yönetin."],
  applicationsTabBtn:["institutions","Kurum Başvuruları","Yeni kurum başvurularını inceleyip onaylayın veya reddedin."],
  accountsTabBtn:["institutions","Kurum Hesapları","Kurum paneline erişim isteyen hesapları yönetin."],
  bannerAdsTabBtn:["ads","Banner Reklamları","Bölge ve sektör hedefli banner reklamlarını yönetin."],
  promotionOrdersTabBtn:["ads","Tanıtım Siparişleri","Kurumların Konum Videosu, 360° Sanal Tur ve reklam siparişlerini yönetin."],
  promotionPackagesTabBtn:["ads","Paket Yönetimi","Kurumlara sunulan reklam ve tanıtım paketlerini oluşturun, fiyatlandırın ve yayına alın."],
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
        institutions:"institutionsTabBtn",
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
let institutionAccountRecords = [];
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

auth.onAuthStateChanged(async (user) => {
  if (user && user.uid === ADMIN_UID) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;

    await loadApplications();
    await loadInstitutions();
    await loadQuoteRequests();
    await loadInstitutionAccounts();
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


[applicationsTabBtn, institutionsTabBtn, quotesTabBtn, offerReportTabBtn, accountsTabBtn]
  .forEach(button => button?.addEventListener("click", () => {
    overviewSection.hidden = true;
    issuesSection.hidden = true;
    overviewTabBtn.classList.remove("active");
    issuesTabBtn.classList.remove("active");
  }, true));

overviewTabBtn?.addEventListener("click", () => {
  overviewSection.hidden = false;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
  issuesSection.hidden = true;
  accountsSection.hidden = true;

  [applicationsTabBtn, institutionsTabBtn, quotesTabBtn, offerReportTabBtn, issuesTabBtn, accountsTabBtn]
    .forEach(button => button?.classList.remove("active"));
  overviewTabBtn.classList.add("active");
  refreshAdminOverview();
});

issuesTabBtn?.addEventListener("click", async () => {
  overviewSection.hidden = true;
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
  issuesSection.hidden = false;
  accountsSection.hidden = true;

  [overviewTabBtn, applicationsTabBtn, institutionsTabBtn, quotesTabBtn, offerReportTabBtn, accountsTabBtn]
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
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.add("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
});

institutionsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = false;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.add("active");
  quotesTabBtn.classList.remove("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  await loadInstitutions();
});

quotesTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = false;
  offerReportSection.hidden = true;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.add("active");
  offerReportTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  await loadQuoteRequests();
});

offerReportTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = false;
  accountsSection.hidden = true;

  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  offerReportTabBtn.classList.add("active");
  accountsTabBtn.classList.remove("active");

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

    institutionCount.textContent = `${institutionRecords.length} yayındaki kurum`;
    populateInstitutionCityFilter();
    renderManagedInstitutions();
    refreshAdminOverview();

    if (quoteRequestRecords.length) {
      buildInstitutionOfferReport();
      renderInstitutionOfferReport();
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

function getFilteredManagedInstitutions() {
  const query = institutionSearch.value.trim().toLocaleLowerCase("tr-TR");
  const category = institutionCategoryFilter.value;
  const city = institutionCityFilter.value;
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

    let matchesFeature = true;
    if (feature === "vip") matchesFeature = Boolean(item.vip);
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

    return matchesQuery && matchesCategory && matchesCity && matchesFeature;
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
  if (institutionStatOffer) institutionStatOffer.textContent =
    institutionRecords.filter(item => item.offer !== false).length;
  if (institutionStatVip) institutionStatVip.textContent =
    institutionRecords.filter(item => Boolean(item.vip)).length;
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

        <div class="manage-actions compact">
          <button class="banner-ad-institution-btn">🖼️ Banner Reklama Ekle</button>
          <button class="edit-institution-btn">✏ Düzenle</button>
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

          <details class="ad-package-catalog">
            <summary>Tüm reklam paketlerini gör</summary>
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

    card.querySelector(".edit-institution-btn").addEventListener("click", () => {
      openInstitutionEdit(data.id, data);
    });

    card.querySelector(".delete-institution-btn").addEventListener("click", () => {
      deleteInstitution(data.id, data.name || "Kurum");
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

[institutionSearch, institutionCategoryFilter, institutionCityFilter, institutionFeatureFilter, institutionSort]
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

clearInstitutionFilters.addEventListener("click", () => {
  institutionSearch.value = "";
  institutionCategoryFilter.value = "";
  institutionCityFilter.value = "";
  institutionFeatureFilter.value = "";
  institutionSort.value = "name";
  renderManagedInstitutions();
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
  document.getElementById("editVirtualTourUrl").value =
    data.virtualTourUrl || data.tour360Url || data.tourUrl || "";
  document.getElementById("editLat").value =
    data.lat === null || data.lat === undefined || data.lat === "" ? "" : data.lat;
  document.getElementById("editLng").value =
    data.lng === null || data.lng === undefined || data.lng === "" ? "" : data.lng;
  document.getElementById("editVip").checked = Boolean(data.vip);
  document.getElementById("editVideo").checked = Boolean(data.video);
  document.getElementById("editOffer").checked = data.offer !== false;

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
  const virtualTourUrl=String(document.getElementById("editVirtualTourUrl").value||"").trim();

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
    virtualTourUrl,
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
    offered: ["Teklif Geldi", "status-offered"],
    locked: ["Fiyat Kilitlendi", "status-locked"],
    used: ["Kullanıldı", "status-used"],
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

    quoteRequestCount.textContent =
      `${quoteRequestRecords.length} teklif talebi · güncel süreç bilgileriyle`;
    renderQuoteRequests();
    buildInstitutionOfferReport();
    renderInstitutionOfferReport();
    refreshAdminOverview();
    renderIssueCenter();

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
function renderQuoteRequests() {
  const query = quoteRequestSearch.value.trim().toLocaleLowerCase("tr-TR");
  const status = quoteStatusFilter.value;

  const data = quoteRequestRecords.filter(item => {
    const haystack = [
      item.name,
      item.phone,
      item.city,
      item.district,
      item.service,
      item.note,
      item.targetInstitutionName
    ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

    const currentState = item.currentState || getAdminQuoteLiveState(item);
    const statusMatches = !status ||
      (status === "issue" ? Number(item.issueCount || 0) > 0 : currentState === status);
    const offerSearch = (Array.isArray(item.liveOffers) ? item.liveOffers : [])
      .map(offer => [offer.institutionName, offer.offerCode, offer.price].filter(Boolean).join(" "))
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return (!query || haystack.includes(query) || offerSearch.includes(query)) &&
      statusMatches;
  });

  if (!data.length) {
    quoteRequestsList.innerHTML =
      '<div class="empty-state">Filtreye uygun teklif talebi bulunamadı.</div>';
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

    const card = document.createElement("div");
    card.className = "quote-request-card";
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
        <div>
          <h3>${escapeHtml(request.name || "-")}</h3>
          <div class="quote-badges">
            <span>${escapeHtml(request.service || "-")}</span>
            ${request.targetInstitutionId ? '<span class="direct-request-admin-badge">🎯 Doğrudan Kurum Talebi</span>' : ""}
            <span class="quote-status ${liveStateClass}">
              ${liveStateLabel}
            </span>
          </div>
        </div>

        <div class="quote-date">${formatDate(request.date)}</div>
      </div>

      <div class="quote-info-grid">
        <div><small>Telefon</small><strong>${escapeHtml(request.phone || "-")}</strong></div>
        <div><small>${request.targetInstitutionId ? "Hedef Kurum" : "Konum"}</small><strong>${escapeHtml(
          request.targetInstitutionId
            ? (request.targetInstitutionName || directTargetInstitution?.name || "-")
            : ([request.city, request.district].filter(Boolean).join(" / ") || "-")
        )}</strong></div>
        <div class="wide"><small>Not</small><strong>${escapeHtml(request.note || "Not yok")}</strong></div>
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


accountsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  offerReportSection.hidden = true;
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

  setOverviewText(overviewInstitutionCount, institutionRecords.length);
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
    accounts: accountsTabBtn
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
