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
const issueCount = document.getElementById("issueCount");
const issuesList = document.getElementById("issuesList");

const ADMIN_UID = "Et5cFLiQNtgMdQcWIAcaQIOpQBe2";

let applicationRecords = [];
let institutionRecords = [];
let quoteRequestRecords = [];
let institutionAccountRecords = [];
let institutionOfferReportRecords = [];
let institutionOfferReportEvents = [];

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
  }

  return data;
}

function renderManagedInstitutions() {
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

    card.innerHTML = `
      <div class="manage-main">
        <div class="manage-title">
          <h3>${escapeHtml(data.name || "-")}</h3>
          <div class="manage-badges">
            <span>${escapeHtml(categoryLabels[data.category] || data.category || "Diğer")}</span>
            ${data.vip ? '<span class="badge-vip">VIP</span>' : ''}
            ${data.video ? '<span class="badge-video">Videolu</span>' : ''}
            ${data.offer !== false ? '<span class="badge-offer">Teklif</span>' : ''}
          </div>
        </div>

        <div class="manage-actions">
          <button class="edit-institution-btn">✏ Düzenle</button>
          ${hasCoordinates ? '<button class="map-institution-btn">📍 Harita</button>' : ''}
          <button class="delete-institution-btn">🗑 Sil</button>
        </div>
      </div>

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
      </div>

      <div class="quick-actions">
        <button class="quick-toggle ${data.vip ? "on" : ""}" data-field="vip">
          ★ VIP: ${data.vip ? "Açık" : "Kapalı"}
        </button>
        <button class="quick-toggle ${data.video ? "on" : ""}" data-field="video">
          ▶ Video: ${data.video ? "Var" : "Yok"}
        </button>
        <button class="quick-toggle ${data.offer !== false ? "on" : ""}" data-field="offer">
          ₺ Teklif: ${data.offer !== false ? "Açık" : "Kapalı"}
        </button>
        ${whatsappDigits ? '<button class="whatsapp-manage-btn">WhatsApp</button>' : ''}
        ${data.website ? '<button class="website-manage-btn">Web / Instagram</button>' : ''}
      </div>
    `;

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

clearInstitutionFilters.addEventListener("click", () => {
  institutionSearch.value = "";
  institutionCategoryFilter.value = "";
  institutionCityFilter.value = "";
  institutionFeatureFilter.value = "";
  institutionSort.value = "name";
  renderManagedInstitutions();
});

function openInstitutionEdit(id, data) {
  document.getElementById("editInstitutionId").value = id;
  document.getElementById("editName").value = data.name || "";
  document.getElementById("editCategory").value = data.category || "diger";
  document.getElementById("editCity").value = data.city || "";
  document.getElementById("editDistrict").value = data.district || "";
  document.getElementById("editAddress").value = data.address || "";
  document.getElementById("editPhone").value = data.phone || "";
  document.getElementById("editWebsite").value = data.website || "";
  document.getElementById("editLat").value = Number.isFinite(data.lat) ? data.lat : "";
  document.getElementById("editLng").value = Number.isFinite(data.lng) ? data.lng : "";
  document.getElementById("editVip").checked = Boolean(data.vip);
  document.getElementById("editVideo").checked = Boolean(data.video);
  document.getElementById("editOffer").checked = data.offer !== false;

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

  const id = document.getElementById("editInstitutionId").value;
  const city = document.getElementById("editCity").value.trim();
  const district = document.getElementById("editDistrict").value.trim();
  const latValue = document.getElementById("editLat").value;
  const lngValue = document.getElementById("editLng").value;

  const updates = {
    name: document.getElementById("editName").value.trim(),
    category: document.getElementById("editCategory").value,
    city,
    district,
    location: [city, district].filter(Boolean).join(", "),
    address: document.getElementById("editAddress").value.trim(),
    phone: document.getElementById("editPhone").value.trim(),
    website: document.getElementById("editWebsite").value.trim(),
    lat: latValue === "" ? null : Number(latValue),
    lng: lngValue === "" ? null : Number(lngValue),
    vip: document.getElementById("editVip").checked,
    video: document.getElementById("editVideo").checked,
    offer: document.getElementById("editOffer").checked,
    updatedAt: new Date().toISOString()
  };

  try {
    await db.collection("institutions").doc(id).update(updates);
    institutionEditModal.classList.add("hidden");
    alert("Kurum bilgileri güncellendi.");
    await loadInstitutions();
  } catch (error) {
    console.error("Kurum güncellenemedi:", error);
    alert("Kurum güncellenemedi.");
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
    done: ["Sonuçlandı", "status-done"]
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
      usageRate: row.offerCount ? (row.usedCount / row.offerCount) * 100 : 0
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
        <td colspan="11" class="offer-report-empty">
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
          <strong>%${row.selectionRate.toFixed(1).replace(".", ",")}</strong>
          <span><i style="width:${Math.min(100,row.selectionRate)}%"></i></span>
        </div>
      </td>
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
    <article><span>Seçilme Oranı</span><strong>%${row.selectionRate.toFixed(1).replace(".", ",")}</strong></article>
    <article><span>Kullanım Oranı</span><strong>%${row.usageRate.toFixed(1).replace(".", ",")}</strong></article>
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
    "Seçilme Oranı","Kullanım Oranı","Son Teklif"
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
    row.selectionRate.toFixed(1),
    row.usageRate.toFixed(1),
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
      item.note
    ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

    return (!query || haystack.includes(query)) &&
      (!status || (item.currentState || getAdminQuoteLiveState(item)) === status);
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

    // Önce aynı ilçe; yoksa aynı şehirdeki aynı kategorideki kurumları göster.
    const matching = exactDistrictMatches.length
      ? exactDistrictMatches
      : sameCityMatches;

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

    const diagnosticHtml = !matching.length && diagnosticInstitutions.length
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
            <span class="quote-status ${liveStateClass}">
              ${liveStateLabel}
            </span>
          </div>
        </div>

        <div class="quote-date">${formatDate(request.date)}</div>
      </div>

      <div class="quote-info-grid">
        <div><small>Telefon</small><strong>${escapeHtml(request.phone || "-")}</strong></div>
        <div><small>Konum</small><strong>${escapeHtml([request.city, request.district].filter(Boolean).join(" / ") || "-")}</strong></div>
        <div class="wide"><small>Not</small><strong>${escapeHtml(request.note || "Not yok")}</strong></div>
      </div>

      ${request.liveDetailError
        ? '<div class="admin-offer-error">Teklif süreç ayrıntıları okunamadı.</div>'
        : adminOfferListHtml(request)}

      <div class="matching-institutions">
        <strong>Uygun kurumlar (${matching.length})</strong>
        <div class="match-scope">
          ${exactDistrictMatches.length
            ? 'Aynı ilçe + aynı kategori'
            : sameCityMatches.length
              ? 'Aynı şehir + aynı kategori'
              : `Eşleşme bulunamadı · Bu şehirde ${cityInstitutionCount} teklif veren kurum var · Bu kategoride toplam ${categoryMatches.length} kurum var`}
        </div>
        <div class="matching-buttons">${institutionButtons}</div>
        ${diagnosticHtml}
      </div>

      <div class="quote-actions">
        <a class="customer-whatsapp" target="_blank"
          href="https://wa.me/${normalizeWhatsApp(request.phone)}">
          Müşteriye WhatsApp
        </a>

        <button class="quote-status-btn" data-status="sent">İletildi</button>
        <button class="quote-status-btn" data-status="done">Sonuçlandı</button>
        <button class="quote-delete-btn">Sil</button>
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
          "Konum: " + [request.city, request.district].filter(Boolean).join(" / "),
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

    card.querySelector(".quote-delete-btn").addEventListener("click", async () => {
      const ok = confirm("Bu teklif talebini silmek istiyor musunuz?");
      if (!ok) return;

      try {
        await db.collection("quoteRequests").doc(request.id).delete();
        await loadQuoteRequests();
      } catch (error) {
        console.error("Teklif talebi silinemedi:", error);
        alert("Teklif talebi silinemedi.");
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
    if (item) item.status = status;

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
    String(issue.status || "new") !== "resolved"
  );

  setOverviewText(overviewInstitutionCount, institutionRecords.length);
  setOverviewText(overviewPendingApplications, getOverviewPendingApplications());
  setOverviewText(overviewQuoteCount, quoteRequestRecords.length);
  setOverviewText(overviewNoOfferCount, noOfferRequests.length);
  setOverviewText(overviewOfferCount, totalOffers);
  setOverviewText(overviewLockedCount, lockedCount);
  setOverviewText(overviewUsedCount, usedCount);
  setOverviewText(overviewIssueCount, openIssues.length);

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
   SORUN / İHLAL MERKEZİ
   ========================================================= */

function getFilteredIssues() {
  const query = String(issueSearch?.value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const status = issueStatusFilter?.value || "";

  return getOverviewAllIssues()
    .filter(item => {
      const request = item.request || {};
      const lock = request.liveLock || {};
      const itemStatus = String(item.status || "new");

      const haystack = [
        item.offerCode,
        item.reason,
        request.name,
        request.phone,
        request.service,
        request.city,
        request.district,
        lock.institutionName
      ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");

      return (!query || haystack.includes(query)) &&
        (!status || itemStatus === status);
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderIssueCenter() {
  if (!issuesList) return;

  const all = getOverviewAllIssues();
  const filtered = getFilteredIssues();
  const open = all.filter(item => String(item.status || "new") !== "resolved").length;

  if (issueCount) {
    issueCount.textContent =
      `${all.length} bildirim · ${open} açık · ${all.length - open} çözüldü`;
  }

  if (!filtered.length) {
    issuesList.innerHTML =
      '<div class="empty-state">Filtreye uygun sorun bildirimi bulunamadı.</div>';
    return;
  }

  issuesList.innerHTML = filtered.map(item => {
    const request = item.request || {};
    const lock = request.liveLock || {};
    const resolved = String(item.status || "new") === "resolved";

    return `
      <article class="issue-card ${resolved ? "is-resolved" : "is-open"}">
        <div class="issue-card-top">
          <div>
            <h4>${escapeHtml(request.service || "Teklif Sorunu")}</h4>
            <div class="issue-code">Teklif No: ${escapeHtml(item.offerCode || lock.offerCode || "-")}</div>
          </div>
          <span class="issue-status ${resolved ? "resolved" : "open"}">
            ${resolved ? "Çözüldü" : "Açık"}
          </span>
        </div>

        <div class="issue-reason">${escapeHtml(item.reason || "Açıklama yok")}</div>

        <div class="issue-meta-grid">
          <div>
            <small>Müşteri</small>
            <strong>${escapeHtml(request.name || "-")}</strong>
          </div>
          <div>
            <small>Kurum</small>
            <strong>${escapeHtml(lock.institutionName || "-")}</strong>
          </div>
          <div>
            <small>Konum</small>
            <strong>${escapeHtml([request.city, request.district].filter(Boolean).join(" / ") || "-")}</strong>
          </div>
          <div>
            <small>Bildirim Tarihi</small>
            <strong>${formatDate(item.date)}</strong>
          </div>
        </div>

        <div class="issue-actions">
          <button
            type="button"
            class="resolve"
            data-issue-action="toggle"
            data-quote-id="${request.id}"
            data-issue-id="${item.id}"
            data-next-status="${resolved ? "new" : "resolved"}"
          >
            ${resolved ? "Tekrar Aç" : "✓ Çözüldü Olarak İşaretle"}
          </button>
          <button type="button" data-issue-action="quotes">Teklif Talebini Gör</button>
          <button
            type="button"
            class="delete"
            data-issue-action="delete"
            data-quote-id="${request.id}"
            data-issue-id="${item.id}"
          >
            Sil
          </button>
        </div>
      </article>
    `;
  }).join("");

  issuesList.querySelectorAll("[data-issue-action]").forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.dataset.issueAction;

      if (action === "quotes") {
        quotesTabBtn.click();
        return;
      }

      if (action === "toggle") {
        await updateOfferIssueStatus(
          button.dataset.quoteId,
          button.dataset.issueId,
          button.dataset.nextStatus
        );
        return;
      }

      if (action === "delete") {
        await deleteOfferIssue(
          button.dataset.quoteId,
          button.dataset.issueId
        );
      }
    });
  });
}

async function updateOfferIssueStatus(quoteId, issueId, status) {
  try {
    await db
      .collection("quoteRequests")
      .doc(quoteId)
      .collection("offerIssues")
      .doc(issueId)
      .update({
        status,
        updatedAt: new Date().toISOString(),
        resolvedAt: status === "resolved" ? new Date().toISOString() : null
      });

    await loadQuoteRequests();
  } catch (error) {
    console.error("Sorun bildirimi güncellenemedi:", error);
    alert("Sorun bildirimi güncellenemedi.");
  }
}

async function deleteOfferIssue(quoteId, issueId) {
  const ok = confirm("Bu sorun bildirimini kalıcı olarak silmek istiyor musunuz?");
  if (!ok) return;

  try {
    await db
      .collection("quoteRequests")
      .doc(quoteId)
      .collection("offerIssues")
      .doc(issueId)
      .delete();

    await loadQuoteRequests();
  } catch (error) {
    console.error("Sorun bildirimi silinemedi:", error);
    alert("Sorun bildirimi silinemedi.");
  }
}

issueSearch?.addEventListener("input", renderIssueCenter);
issueStatusFilter?.addEventListener("change", renderIssueCenter);
