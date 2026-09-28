const firebaseConfig = {
  apiKey: "AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain: "dijiyer.firebaseapp.com",
  projectId: "dijiyer",
  storageBucket: "dijiyer.firebasestorage.app",
  messagingSenderId: "847787778815",
  appId: "1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

const institutionSessionApp =
  firebase.apps.find(app => app.name === "institutionSession") ||
  firebase.initializeApp(firebaseConfig, "institutionSession");

const auth = institutionSessionApp.auth();
const db = institutionSessionApp.firestore();

let currentUser = null;
let currentAccount = null;
let currentInstitution = null;
let quoteRecords = [];
let responseMap = new Map();

const panelError = document.getElementById("panelError");
const institutionQuotesList = document.getElementById("institutionQuotesList");
const recentQuotes = document.getElementById("recentQuotes");
const quotePanelFilter = document.getElementById("quotePanelFilter");

const categoryLabels = {
  kres:"Kreş & Anaokulu",
  dershane:"Dershane / Kurs Merkezi",
  surucu:"Sürücü Kursu",
  ozel_ders:"Özel Ders",
  dil_kursu:"Dil Kursu",
  etut:"Etüt Merkezi",
  ozel_okul:"Özel Okul",
  yurt:"Öğrenci Yurdu",
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
  restoran:"Restoran",
  kafe:"Kafe",
  fastfood:"Fast Food",
  pastane:"Pastane",
  pizza:"Pizza",
  doner:"Döner",
  pide_lahmacun:"Pide / Lahmacun",
  catering:"Catering",
  ev_yemekleri:"Ev Yemekleri",
  dis_klinigi:"Diş Kliniği",
  klinik:"Sağlık Kliniği",
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
  teknik_servis:"Beyaz Eşya / Teknik Servis",
  klima:"Klima Servisi",
  cam_balkon:"Cam Balkon / PVC",
  temizlik:"Temizlik Hizmetleri",
  emlak_ofisi:"Emlak Ofisi",
  konut:"Konut",
  arsa:"Arsa / Tarla",
  ticari:"Ticari Gayrimenkul",
  gunluk_kiralik:"Günlük Kiralık",
  otel:"Otel",
  pansiyon:"Pansiyon",
  apart:"Apart",
  bungalov:"Bungalov",
  seyahat:"Seyahat Acentesi / Tur",
  kamp:"Kamp / Karavan",
  dugun_salonu:"Düğün Salonu",
  organizasyon:"Organizasyon Firması",
  fotograf:"Fotoğrafçı",
  video:"Video Çekimi",
  drone:"Drone Çekimi",
  gelinlik:"Gelinlik",
  cicekci:"Çiçekçi",
  reklam:"Reklam / Tasarım / Matbaa",
  nakliyat:"Evden Eve Nakliyat",
  kurye:"Kurye",
  sehirici:"Şehir İçi Taşımacılık",
  depolama:"Depolama",
  hukuk:"Avukat / Hukuk",
  muhasebe:"Muhasebe / Mali Müşavir",
  web:"Web Tasarım",
  sosyal_medya:"Sosyal Medya / Ajans",
  bilgisayar:"Bilgisayar / Teknoloji",
  danismanlik:"Danışmanlık",
  veteriner:"Veteriner / Pet Hizmetleri",
  tarim:"Tarım / Hayvancılık",
  giyim:"Giyim",
  ayakkabi:"Ayakkabı",
  market:"Market",
  elektronik:"Elektronik / Telefon",
  kirtasiye:"Kırtasiye",
  petshop:"Pet Shop",
  zuccaciye:"Züccaciye",
  esnaf:"Diğer Yerel Esnaf",
  diger:"Diğer Hizmet"
};

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("tr-TR", {
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"
      });
}

function showPanelError(message) {
  panelError.hidden = false;
  panelError.textContent = message;
}

function setPanelTab(name) {
  document.querySelectorAll("[data-panel-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.panelTab === name);
  });

  document.querySelectorAll("[data-panel-view]").forEach(view => {
    view.classList.toggle("active", view.dataset.panelView === name);
  });
}

document.querySelectorAll("[data-panel-tab]").forEach(btn => {
  btn.addEventListener("click", async () => {
    setPanelTab(btn.dataset.panelTab);

    if (btn.dataset.panelTab === "stats" && currentInstitution) {
      await loadInstitutionStats();
    }
  });
});

document.getElementById("goQuotesBtn").addEventListener("click", () => setPanelTab("quotes"));
document.getElementById("goProfileBtn").addEventListener("click", () => setPanelTab("profile"));

function renderInstitutionHeader() {
  const institution = currentInstitution;

  document.getElementById("panelInstitutionName").textContent =
    institution.name || currentAccount.institutionName || "Kurum";

  document.getElementById("panelInstitutionLocation").textContent =
    [institution.city, institution.district].filter(Boolean).join(" / ");

  document.getElementById("panelEmail").textContent =
    currentAccount.email || currentUser.email || "-";

  document.getElementById("profileName").value = institution.name || "";
  document.getElementById("profilePhone").value = institution.phone || "";
  document.getElementById("profileWebsite").value = institution.website || "";
  document.getElementById("profileAddress").value = institution.address || "";
  document.getElementById("profileLocation").textContent =
    [institution.city, institution.district].filter(Boolean).join(" / ") || "-";
  document.getElementById("profileCategory").textContent =
    categoryLabels[institution.category] || institution.category || "-";
  document.getElementById("profileOffer").checked = institution.offer !== false;

  updateOfferUi();
}

function updateOfferUi() {
  const active = currentInstitution.offer !== false;

  document.getElementById("panelOfferBadge").textContent =
    active ? "🏷️ Teklif Alımı Açık" : "⏸ Teklif Alımı Kapalı";

  document.getElementById("panelOfferBadge").classList.toggle("off", !active);
  document.getElementById("offerStatusText").textContent = active ? "Açık" : "Kapalı";
  document.getElementById("toggleOfferTitle").textContent =
    active ? "⏸ Teklif Alımını Kapat" : "🏷️ Teklif Alımını Aç";
  document.getElementById("toggleOfferHelp").textContent =
    active
      ? "Yeni eşleşmeler almaya devam ediyorsunuz."
      : "Yeni teklif eşleşmeleri şu anda kapalı.";
}

async function loadQuoteResponses() {
  responseMap = new Map();

  const snapshot = await db.collection("quoteResponses")
    .where("institutionId", "==", currentAccount.institutionId)
    .get();

  snapshot.forEach(doc => {
    const data = doc.data();
    responseMap.set(data.quoteId, { id: doc.id, ...data });
  });
}

async function loadMatchedQuotes() {
  institutionQuotesList.innerHTML = '<div class="empty-state">Teklifler yükleniyor...</div>';
  recentQuotes.innerHTML = '<div class="empty-state">Teklifler yükleniyor...</div>';

  try {
    const snapshot = await db.collection("quoteRequests")
      .where("category", "==", currentInstitution.category)
      .where("city", "==", currentInstitution.city)
      .get();

    quoteRecords = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

    await loadQuoteResponses();
    renderQuotes();
    renderSummary();
  } catch (error) {
    console.error("Teklifler yüklenemedi:", error);
    institutionQuotesList.innerHTML =
      '<div class="empty-state">Teklifler yüklenemedi. Firestore yetkisini kontrol edin.</div>';
    recentQuotes.innerHTML =
      '<div class="empty-state">Teklifler yüklenemedi.</div>';
  }
}

function getQuoteViewStatus(quote) {
  return responseMap.get(quote.id)?.status || "new";
}

function renderSummary() {
  const newCount = quoteRecords.filter(q => getQuoteViewStatus(q) === "new").length;

  document.getElementById("newQuoteCount").textContent = newCount;
  document.getElementById("totalQuoteCount").textContent = quoteRecords.length;
  document.getElementById("quoteTabCount").textContent = newCount;

  const latest = quoteRecords.slice(0, 3);
  recentQuotes.innerHTML = latest.length
    ? latest.map(q => quoteCardHtml(q, true)).join("")
    : '<div class="empty-state">Henüz uygun teklif talebi yok.</div>';

  recentQuotes.querySelectorAll("[data-open-quotes]").forEach(btn => {
    btn.addEventListener("click", () => setPanelTab("quotes"));
  });
}

function quoteCardHtml(quote, compact = false) {
  const response = responseMap.get(quote.id);
  const state = response?.status || "new";
  const sameDistrict =
    String(quote.district || "").toLocaleLowerCase("tr-TR") ===
    String(currentInstitution.district || "").toLocaleLowerCase("tr-TR");

  const statusText = state === "interested"
    ? "İlgileniyorum"
    : state === "not_interested"
      ? "İlgilenmiyorum"
      : "Yeni";

  if (compact) {
    return `
      <button class="recent-quote" data-open-quotes>
        <span>
          <strong>${escapeHtml(quote.service || "Teklif Talebi")}</strong>
          <small>${escapeHtml(quote.district || quote.city || "-")} · ${formatDate(quote.date)}</small>
        </span>
        <span class="quote-status status-${state}">${statusText}</span>
      </button>
    `;
  }

  const phoneDigits = String(quote.phone || "").replace(/\D/g, "");
  const whatsappPhone = phoneDigits.startsWith("0")
    ? "90" + phoneDigits.slice(1)
    : phoneDigits;

  const whatsappText = encodeURIComponent(
    `Merhaba ${quote.name || ""}, Dijiyer üzerinden bıraktığınız "${quote.service || "teklif"}" talebi için iletişime geçiyorum.`
  );

  return `
    <article class="quote-card">
      <div class="quote-card-head">
        <div>
          <div class="quote-service">${escapeHtml(quote.service || "Teklif Talebi")}</div>
          <div class="quote-location">
            📍 ${escapeHtml([quote.city, quote.district].filter(Boolean).join(" / "))}
            ${sameDistrict ? '<span class="district-badge">Aynı ilçe</span>' : '<span class="city-badge">Aynı şehir</span>'}
          </div>
        </div>

        <span class="quote-status status-${state}">${statusText}</span>
      </div>

      <div class="quote-customer">
        <div>
          <small>Müşteri</small>
          <strong>${escapeHtml(quote.name || "-")}</strong>
        </div>
        <div>
          <small>Telefon</small>
          <strong>${escapeHtml(quote.phone || "-")}</strong>
        </div>
        <div>
          <small>Tarih</small>
          <strong>${formatDate(quote.date)}</strong>
        </div>
      </div>

      ${quote.note ? `<div class="quote-note">${escapeHtml(quote.note)}</div>` : ""}

      <div class="quote-actions">
        ${whatsappPhone ? `<a class="whatsapp-btn" target="_blank" rel="noopener" href="https://wa.me/${whatsappPhone}?text=${whatsappText}">WhatsApp'tan Ulaş</a>` : ""}
        <button data-response="interested" data-quote-id="${quote.id}" class="${state === "interested" ? "selected" : ""}">✓ İlgileniyorum</button>
        <button data-response="not_interested" data-quote-id="${quote.id}" class="${state === "not_interested" ? "selected danger" : "danger"}">✕ İlgilenmiyorum</button>
      </div>
    </article>
  `;
}

function renderQuotes() {
  const filter = quotePanelFilter.value;

  const rows = quoteRecords.filter(quote => {
    const state = getQuoteViewStatus(quote);
    return !filter || state === filter;
  });

  institutionQuotesList.innerHTML = rows.length
    ? rows.map(q => quoteCardHtml(q)).join("")
    : '<div class="empty-state">Bu filtreye uygun teklif bulunamadı.</div>';

  institutionQuotesList.querySelectorAll("[data-response]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await saveQuoteResponse(btn.dataset.quoteId, btn.dataset.response);
    });
  });
}

async function saveQuoteResponse(quoteId, status) {
  const existing = responseMap.get(quoteId);
  const docId = existing?.id || `${quoteId}_${currentUser.uid}`;

  try {
    await db.collection("quoteResponses").doc(docId).set({
      quoteId,
      institutionId: currentAccount.institutionId,
      userId: currentUser.uid,
      status,
      date: new Date().toISOString()
    });

    responseMap.set(quoteId, {
      id: docId,
      quoteId,
      institutionId: currentAccount.institutionId,
      userId: currentUser.uid,
      status,
      date: new Date().toISOString()
    });

    renderQuotes();
    renderSummary();
  } catch (error) {
    console.error("Teklif cevabı kaydedilemedi:", error);
    alert("İşlem kaydedilemedi. Firestore yetkisini kontrol edin.");
  }
}

quotePanelFilter.addEventListener("change", renderQuotes);

document.getElementById("institutionProfileForm").addEventListener("submit", async e => {
  e.preventDefault();

  const profileMessage = document.getElementById("profileMessage");
  profileMessage.textContent = "Kaydediliyor...";

  const changes = {
    name: document.getElementById("profileName").value.trim(),
    phone: document.getElementById("profilePhone").value.trim(),
    website: document.getElementById("profileWebsite").value.trim(),
    address: document.getElementById("profileAddress").value.trim(),
    offer: document.getElementById("profileOffer").checked
  };

  try {
    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update(changes);

    Object.assign(currentInstitution, changes);
    renderInstitutionHeader();
    profileMessage.textContent = "Değişiklikler kaydedildi.";
  } catch (error) {
    console.error("Kurum bilgileri kaydedilemedi:", error);
    profileMessage.textContent =
      "Kaydedilemedi. Firestore yetkisini kontrol edin.";
  }
});

document.getElementById("toggleOfferBtn").addEventListener("click", async () => {
  const nextValue = currentInstitution.offer === false;

  try {
    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({ offer: nextValue });

    currentInstitution.offer = nextValue;
    document.getElementById("profileOffer").checked = nextValue;
    updateOfferUi();
  } catch (error) {
    console.error("Teklif durumu değiştirilemedi:", error);
    alert("Teklif durumu değiştirilemedi.");
  }
});

document.getElementById("sendPasswordResetBtn").addEventListener("click", async () => {
  const message = document.getElementById("accountMessage");
  message.textContent = "Gönderiliyor...";

  try {
    await auth.sendPasswordResetEmail(currentUser.email);
    message.textContent = "Şifre yenileme bağlantısı e-posta adresinize gönderildi.";
  } catch (error) {
    console.error(error);
    message.textContent = "Şifre yenileme bağlantısı gönderilemedi.";
  }
});


function panelLocalDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getLastDays(count) {
  const days = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);

    days.push({
      key: panelLocalDayKey(date),
      label: date.toLocaleDateString("tr-TR", { weekday: "short" })
    });
  }

  return days;
}

async function loadInstitutionStats() {
  try {
    const institutionId = currentAccount.institutionId;

    const [analyticsSnapshot, reviewsSnapshot] = await Promise.all([
      db.collection("institutionAnalytics")
        .where("institutionId", "==", institutionId)
        .get(),

      db.collection("institutionReviews")
        .where("institutionId", "==", institutionId)
        .get()
    ]);

    const events = analyticsSnapshot.docs.map(doc => doc.data());
    const reviews = reviewsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.status === "published")
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

    const today = panelLocalDayKey();
    const days = getLastDays(7);
    const weekKeys = new Set(days.map(item => item.key));

    const todayViews = events.filter(item =>
      item.type === "profile_view" && item.day === today
    ).length;

    const weekViews = events.filter(item =>
      item.type === "profile_view" && weekKeys.has(item.day)
    ).length;

    const whatsappClicks = events.filter(item =>
      item.type === "whatsapp_click"
    ).length;

    const routeClicks = events.filter(item =>
      item.type === "route_click"
    ).length;

    const average = reviews.length
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length
      : 0;

    document.getElementById("todayProfileViews").textContent = todayViews;
    document.getElementById("weekProfileViews").textContent = weekViews;
    document.getElementById("whatsappClickCount").textContent = whatsappClicks;
    document.getElementById("routeClickCount").textContent = routeClicks;
    document.getElementById("reviewCountStat").textContent = reviews.length;
    document.getElementById("averageRatingStat").textContent =
      reviews.length ? average.toFixed(1) : "0.0";

    const dayCounts = days.map(day => ({
      ...day,
      count: events.filter(item =>
        item.type === "profile_view" && item.day === day.key
      ).length
    }));

    const maxCount = Math.max(1, ...dayCounts.map(item => item.count));

    document.getElementById("trafficBars").innerHTML = dayCounts.map(item => {
      const height = Math.max(8, Math.round((item.count / maxCount) * 120));

      return `
        <div class="traffic-day">
          <div class="traffic-value">${item.count}</div>
          <div class="traffic-bar-track">
            <div class="traffic-bar-fill" style="height:${height}px"></div>
          </div>
          <div class="traffic-day-label">${escapeHtml(item.label)}</div>
        </div>
      `;
    }).join("");

    document.getElementById("panelReviewsList").innerHTML = reviews.length
      ? reviews.slice(0, 6).map(item => `
          <div class="panel-review-item">
            <div class="panel-review-stars">
              ${"★".repeat(Number(item.rating || 0))}${"☆".repeat(5 - Number(item.rating || 0))}
            </div>
            <div class="panel-review-text">${escapeHtml(item.text || "")}</div>
            <small>${formatDate(item.date)}</small>
          </div>
        `).join("")
      : '<div class="empty-state">Henüz yorum veya puan bulunmuyor.</div>';

  } catch (error) {
    console.error("İstatistikler yüklenemedi:", error);

    const bars = document.getElementById("trafficBars");
    const reviews = document.getElementById("panelReviewsList");

    if (bars) {
      bars.innerHTML =
        '<div class="empty-state">İstatistikler yüklenemedi. Firestore yetkisini kontrol edin.</div>';
    }

    if (reviews) {
      reviews.innerHTML =
        '<div class="empty-state">Yorumlar yüklenemedi.</div>';
    }
  }
}

let authResolved = false;

const authRestoreTimer = setTimeout(() => {
  if (!authResolved && !auth.currentUser) {
    showPanelError("Oturum bilgisi yüklenemedi. Ana sayfadan tekrar kurum girişi yapın.");
  }
}, 5000);

auth.onAuthStateChanged(async user => {
  authResolved = true;
  clearTimeout(authRestoreTimer);

  if (!user) {
    showPanelError("Kurum oturumu bulunamadı. Lütfen ana sayfadan tekrar giriş yapın.");
    return;
  }

  currentUser = user;

  try {
    const accountDoc = await db.collection("institutionUsers").doc(user.uid).get();

    if (!accountDoc.exists) {
      showPanelError("Bu kullanıcıya bağlı kurum hesabı bulunamadı.");
      return;
    }

    currentAccount = accountDoc.data();

    if (currentAccount.status !== "approved") {
      showPanelError("Kurum hesabınız henüz yönetici tarafından onaylanmamış.");
      return;
    }

    const institutionDoc =
      await db.collection("institutions").doc(currentAccount.institutionId).get();

    if (!institutionDoc.exists) {
      showPanelError("Bağlı kurum kaydı bulunamadı.");
      return;
    }

    currentInstitution = { id: institutionDoc.id, ...institutionDoc.data() };

    renderInstitutionHeader();
    await Promise.all([
      loadMatchedQuotes(),
      loadInstitutionStats()
    ]);

  } catch (error) {
    console.error(error);
    showPanelError("Kurum paneli yüklenemedi.");
  }
});

document.getElementById("institutionLogoutBtn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.replace("index.html");
});
