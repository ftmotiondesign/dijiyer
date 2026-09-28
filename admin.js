const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");
const applicationsList = document.getElementById("applicationsList");
const applicationCount = document.getElementById("applicationCount");
const institutionsList = document.getElementById("institutionsList");
const institutionCount = document.getElementById("institutionCount");
const applicationsSection = document.getElementById("applicationsSection");
const institutionsSection = document.getElementById("institutionsSection");
const quotesSection = document.getElementById("quotesSection");
const accountsSection = document.getElementById("accountsSection");
const applicationsTabBtn = document.getElementById("applicationsTabBtn");
const institutionsTabBtn = document.getElementById("institutionsTabBtn");
const quotesTabBtn = document.getElementById("quotesTabBtn");
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
const accountsList = document.getElementById("accountsList");
const accountCount = document.getElementById("accountCount");

const ADMIN_UID = "Et5cFLiQNtgMdQcWIAcaQIOpQBe2";

let institutionRecords = [];
let quoteRequestRecords = [];

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
  } else {
    if (user && user.uid !== ADMIN_UID) {
      await auth.signOut();
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


applicationsTabBtn.addEventListener("click", () => {
  applicationsSection.hidden = false;
  institutionsSection.hidden = true;
  quotesSection.hidden = true;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.add("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
});

institutionsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = false;
  quotesSection.hidden = true;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.add("active");
  quotesTabBtn.classList.remove("active");
  accountsTabBtn.classList.remove("active");
  await loadInstitutions();
});

quotesTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = true;
  quotesSection.hidden = false;
  accountsSection.hidden = true;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.add("active");
  accountsTabBtn.classList.remove("active");
  await loadQuoteRequests();
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


async function loadQuoteRequests() {
  quoteRequestsList.innerHTML = "Teklif talepleri yükleniyor...";

  try {
    const snapshot = await db
      .collection("quoteRequests")
      .orderBy("date", "desc")
      .get();

    quoteRequestRecords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    quoteRequestCount.textContent = `${quoteRequestRecords.length} teklif talebi`;
    renderQuoteRequests();

  } catch (error) {
    console.error("Teklif talepleri yüklenemedi:", error);
    quoteRequestsList.innerHTML =
      "<p>Teklif talepleri yüklenemedi. Firestore kurallarını kontrol edin.</p>";
  }
}

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
      (!status || item.status === status);
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

    const statusLabels = {
      new: "Yeni",
      sent: "İletildi",
      done: "Sonuçlandı"
    };

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
            <span class="quote-status status-${escapeHtml(request.status || "new")}">
              ${statusLabels[request.status] || "Yeni"}
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
  accountsSection.hidden = false;

  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.remove("active");
  quotesTabBtn.classList.remove("active");
  accountsTabBtn.classList.add("active");

  await loadInstitutionAccounts();
});

async function loadInstitutionAccounts() {
  accountsList.innerHTML = "Kurum hesapları yükleniyor...";

  try {
    const snapshot = await db.collection("institutionUsers").get();

    const records = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

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
