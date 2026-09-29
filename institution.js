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
const storage = institutionSessionApp.storage();

let currentUser = null;
let currentAccount = null;
let currentInstitution = null;
let quoteRecords = [];
let responseMap = new Map();
let supportTicketRecords = [];

let liveQuoteUnsubscribe = null;
let liveSupportUnsubscribe = null;
let liveQuoteWatcherReady = false;
let liveSupportWatcherReady = false;
let activeSupportReplyTicketId = "";
let panelAudioUnlocked = false;

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

function formatRelativeTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return minutes + " dk önce";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " sa önce";

  const days = Math.floor(hours / 24);
  if (days < 7) return days + " gün önce";

  return date.toLocaleDateString("tr-TR", {
    day:"2-digit",
    month:"2-digit"
  });
}

function showPanelError(message) {
  panelError.hidden = false;
  panelError.textContent = message;
}

function safeProfileUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (_) {
    return "";
  }
}

function parseProfileGalleryUrls(value) {
  const rows = Array.isArray(value)
    ? value
    : String(value || "").split(/\n|,/);

  return rows
    .map(item => safeProfileUrl(item))
    .filter(Boolean)
    .slice(0, 6);
}

function setProfileUploadStatus(id, text, state = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("is-uploading", "is-success", "is-error");
  if (state) el.classList.add(state);
}

function validateProfileImage(file) {
  if (!file) throw new Error("Görsel seçilmedi.");

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Yalnızca JPG, PNG veya WebP görsel yükleyebilirsiniz.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Görsel boyutu 8 MB'dan büyük olamaz.");
  }
}

function profileImageExtension(file) {
  const byType = {
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/webp":"webp"
  };
  return byType[file.type] || "jpg";
}

function profileStoragePath(kind, file) {
  const userId = String(currentUser?.uid || "");
  const institutionId = String(currentAccount?.institutionId || "");
  const random = Math.random().toString(36).slice(2, 9);
  return [
    "institution-media",
    userId,
    institutionId,
    kind,
    Date.now() + "_" + random + "." + profileImageExtension(file)
  ].join("/");
}

async function uploadInstitutionProfileImage(file, kind, statusId, label) {
  validateProfileImage(file);

  if (!currentUser?.uid || !currentAccount?.institutionId) {
    throw new Error("Kurum oturumu bulunamadı. Tekrar giriş yapın.");
  }

  const ref = storage.ref().child(profileStoragePath(kind, file));
  const task = ref.put(file, {
    contentType:file.type,
    customMetadata:{
      institutionId:String(currentAccount.institutionId)
    }
  });

  return await new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      snapshot => {
        const percent = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        setProfileUploadStatus(
          statusId,
          label + " yükleniyor · %" + percent,
          "is-uploading"
        );
      },
      error => reject(error),
      async () => {
        try {
          resolve(await task.snapshot.ref.getDownloadURL());
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

async function deleteOwnProfileStorageUrl(url) {
  const safe = safeProfileUrl(url);
  if (!safe || !safe.includes("firebasestorage.googleapis.com")) return;
  try {
    await storage.refFromURL(safe).delete();
  } catch (_) {}
}

function profileUploadErrorText(error) {
  if (error?.code === "storage/unauthorized") {
    return "Yükleme yetkisi kapalı. Firebase Storage kurallarını yayınlayın.";
  }
  if (error?.code === "storage/canceled") {
    return "Yükleme iptal edildi.";
  }
  return error?.message || "Görsel yüklenemedi.";
}

async function saveUploadedSingleImage(file, kind, fieldName, inputId, statusId, label) {
  if (!file) return;

  const previousUrl = safeProfileUrl(currentInstitution?.[fieldName] || "");

  try {
    const url = await uploadInstitutionProfileImage(
      file, kind, statusId, label
    );

    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({ [fieldName]:url, updatedAt:new Date().toISOString() });

    currentInstitution[fieldName] = url;

    const input = document.getElementById(inputId);
    if (input) input.value = url;

    renderProfileMediaPreview();
    updateProfileCompletion();

    setProfileUploadStatus(
      statusId,
      label + " yüklendi ve profile kaydedildi.",
      "is-success"
    );

    if (previousUrl && previousUrl !== url) {
      deleteOwnProfileStorageUrl(previousUrl);
    }
  } catch (error) {
    console.error(label + " yüklenemedi:", error);
    setProfileUploadStatus(
      statusId,
      profileUploadErrorText(error),
      "is-error"
    );
  }
}

async function uploadProfileGalleryFiles(files) {
  const statusId = "profileGalleryUploadStatus";
  const selected = [...(files || [])];
  if (!selected.length) return;

  const current = parseProfileGalleryUrls(
    currentInstitution?.galleryUrls ||
    document.getElementById("profileGalleryUrls")?.value
  );

  const remaining = Math.max(0, 6 - current.length);
  if (!remaining) {
    setProfileUploadStatus(
      statusId,
      "Galeride en fazla 6 görsel olabilir. Önce bir görseli kaldırın.",
      "is-error"
    );
    return;
  }

  const rows = selected.slice(0, remaining);
  const uploaded = [];

  try {
    for (let i = 0; i < rows.length; i++) {
      const file = rows[i];
      validateProfileImage(file);

      setProfileUploadStatus(
        statusId,
        "Galeri yükleniyor · " + (i + 1) + "/" + rows.length,
        "is-uploading"
      );

      const url = await uploadInstitutionProfileImage(
        file,
        "gallery",
        statusId,
        "Galeri " + (i + 1) + "/" + rows.length
      );
      uploaded.push(url);
    }

    const next = [...current, ...uploaded].slice(0, 6);

    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({ galleryUrls:next, updatedAt:new Date().toISOString() });

    currentInstitution.galleryUrls = next;

    const input = document.getElementById("profileGalleryUrls");
    if (input) input.value = next.join("\n");

    renderProfileMediaPreview();

    setProfileUploadStatus(
      statusId,
      uploaded.length + " görsel yüklendi ve profile kaydedildi.",
      "is-success"
    );
  } catch (error) {
    console.error("Galeri yüklenemedi:", error);
    setProfileUploadStatus(
      statusId,
      profileUploadErrorText(error),
      "is-error"
    );
  }
}

async function removeProfileGalleryImage(index) {
  const current = parseProfileGalleryUrls(
    currentInstitution?.galleryUrls ||
    document.getElementById("profileGalleryUrls")?.value
  );

  const url = current[index];
  if (!url) return;

  const next = current.filter((_, itemIndex) => itemIndex !== index);

  try {
    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({ galleryUrls:next });

    currentInstitution.galleryUrls = next;

    const input = document.getElementById("profileGalleryUrls");
    if (input) input.value = next.join("\n");

    renderProfileMediaPreview();
    updateProfileCompletion();

    setProfileUploadStatus(
      "profileGalleryUploadStatus",
      "Görsel galeriden kaldırıldı.",
      "is-success"
    );

    deleteOwnProfileStorageUrl(url);
  } catch (error) {
    console.error("Galeri görseli kaldırılamadı:", error);
    setProfileUploadStatus(
      "profileGalleryUploadStatus",
      "Görsel kaldırılamadı.",
      "is-error"
    );
  }
}

function renderProfileMediaPreview() {
  const logoUrl = safeProfileUrl(document.getElementById("profileLogoUrl")?.value);
  const coverUrl = safeProfileUrl(document.getElementById("profileCoverUrl")?.value);
  const galleryUrls = parseProfileGalleryUrls(
    document.getElementById("profileGalleryUrls")?.value
  );

  const logoPreview = document.getElementById("profileLogoPreview");
  const coverPreview = document.getElementById("profileCoverPreview");
  const galleryPreview = document.getElementById("profileGalleryPreview");

  if (logoPreview) {
    logoPreview.innerHTML = logoUrl
      ? '<img src="' + escapeHtml(logoUrl) + '" alt="Kurum logosu">'
      : "<span>🏢</span>";
  }

  if (coverPreview) {
    coverPreview.style.backgroundImage = coverUrl
      ? 'url("' + coverUrl.replace(/"/g, "%22") + '")'
      : "";
    coverPreview.classList.toggle("has-image", Boolean(coverUrl));
  }

  if (galleryPreview) {
    galleryPreview.innerHTML = galleryUrls.map((url, index) => `
      <div class="firm-gallery-preview-item">
        <img src="${escapeHtml(url)}" alt="Galeri görseli ${index + 1}">
        <button
          type="button"
          class="firm-gallery-remove-btn"
          data-remove-profile-gallery="${index}"
          aria-label="Görseli kaldır"
        >×</button>
      </div>
    `).join("");
  }
}

function calculateProfileCompletion(institution) {
  const checks = [
    { ok: Boolean(String(institution.name || "").trim()), label: "kurum adı" },
    { ok: Boolean(String(institution.description || "").trim()), label: "açıklama" },
    { ok: Boolean(String(institution.phone || institution.whatsapp || "").trim()), label: "telefon / WhatsApp" },
    { ok: Boolean(String(institution.website || institution.instagram || "").trim()), label: "web / Instagram" },
    { ok: Boolean(String(institution.address || "").trim()), label: "adres" },
    { ok: Boolean(String(institution.city || "").trim()) && Boolean(String(institution.district || "").trim()), label: "şehir / ilçe" },
    { ok: Boolean(String(institution.category || institution.subCategory || "").trim()), label: "kategori" },
    { ok: Boolean(String(institution.logoUrl || "").trim()), label: "logo" },
    { ok: Boolean(String(institution.serviceAreas || "").trim()), label: "hizmet bölgeleri" },
    { ok: Boolean(String(institution.weekdayHours || "").trim()), label: "çalışma saatleri" }
  ];

  const completed = checks.filter(item => item.ok).length;
  const percent = Math.round((completed / checks.length) * 100);
  const missing = checks.filter(item => !item.ok).map(item => item.label);

  return { percent, missing };
}

function updateProfileCompletion() {
  if (!currentInstitution) return;

  const result = calculateProfileCompletion(currentInstitution);
  const percentEl = document.getElementById("profileCompletionPercent");
  const barEl = document.getElementById("profileCompletionBar");
  const textEl = document.getElementById("profileCompletionText");

  if (percentEl) percentEl.textContent = "%" + result.percent;
  if (barEl) barEl.style.width = result.percent + "%";

  const firmHomeProfilePercent = document.getElementById("firmHomeProfilePercent");
  if (firmHomeProfilePercent) firmHomeProfilePercent.textContent = "%" + result.percent;

  if (textEl) {
    textEl.textContent = result.missing.length
      ? "Eksik: " + result.missing.join(", ")
      : "Profiliniz tamamlandı. Müşterilere daha güçlü bir görünüm sunuyorsunuz.";
  }
}

function updateQuoteShortcutCounts(counts = {}) {
  const map = {
    shortcutCountAll: counts.all ?? quoteRecords.length,
    shortcutCountNew: counts.new ?? 0,
    shortcutCountOffered: counts.offered ?? 0,
    shortcutCountLocked: counts.locked ?? 0,
    shortcutCountUsed: counts.used ?? 0,
    shortcutCountExpired: counts.expired ?? 0
  };

  Object.entries(map).forEach(([id,value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  });
}

function syncQuoteShortcutActive() {
  document.querySelectorAll("[data-quote-shortcut]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.quoteShortcut === quotePanelFilter.value);
  });
}

function showLiveQuoteAlert(quote) {
  const alert = document.getElementById("liveQuoteAlert");
  const text = document.getElementById("liveQuoteAlertText");
  if (!alert) return;

  if (text) {
    const service = quote?.service || "Yeni teklif";
    const place = [quote?.city, quote?.district].filter(Boolean).join(" / ");
    text.textContent = service + (place ? " · " + place : "");
  }

  alert.classList.remove("hidden");
  playNewQuoteSound();
}

function hideLiveQuoteAlert() {
  document.getElementById("liveQuoteAlert")?.classList.add("hidden");
}

function playNewQuoteSound() {
  if (!panelAudioUnlocked) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    [0, 0.18].forEach((offset,index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = index === 0 ? 880 : 1175;

      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.16);
    });

    setTimeout(() => ctx.close().catch(() => {}), 700);
  } catch (_) {}
}

function getInstitutionQuoteQueries() {
  if (!currentInstitution) return [];

  const collection = db.collection("quoteRequests");
  const queries = [];

  if (currentInstitution.category && currentInstitution.city) {
    const district = String(currentInstitution.district || "").trim();
    const districts = district ? ["", district] : [""];

    districts.forEach(value => {
      queries.push(
        collection
          .where("category", "==", currentInstitution.category)
          .where("city", "==", currentInstitution.city)
          .where("district", "==", value)
      );
    });
  }

  if (currentAccount?.institutionId) {
    queries.push(
      collection.where(
        "targetInstitutionId",
        "==",
        String(currentAccount.institutionId)
      )
    );
  }

  return queries;
}

async function fetchInstitutionMatchedQuotes() {
  const queries = getInstitutionQuoteQueries();
  if (!queries.length) return [];

  const snapshots = await Promise.all(
    queries.map(async query => {
      try {
        return await query.get();
      } catch (error) {
        // Doğrudan teklif Firestore kuralı henüz yayınlanmadıysa
        // mevcut toplu teklif sorgularının çalışmasını engelleme.
        console.warn("Teklif sorgularından biri okunamadı:", error);
        return null;
      }
    })
  );

  const unique = new Map();

  snapshots.filter(Boolean).forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      unique.set(doc.id, { id: doc.id, ...doc.data() });
    });
  });

  return [...unique.values()]
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function quoteMatchesInstitutionArea(quote) {
  if (!currentInstitution) return false;

  const quoteDistrict =
    String(quote?.district || '').trim().toLocaleLowerCase('tr-TR');

  // İlçe seçilmediyse şehir genelindeki tüm eşleşen kurumlar görebilir.
  if (!quoteDistrict) return true;

  const institutionDistrict =
    String(currentInstitution.district || '').trim().toLocaleLowerCase('tr-TR');

  return quoteDistrict === institutionDistrict;
}

function startLiveQuoteWatcher() {
  if (!currentInstitution || !currentInstitution.category || !currentInstitution.city) return;

  if (liveQuoteUnsubscribe) {
    liveQuoteUnsubscribe();
    liveQuoteUnsubscribe = null;
  }

  const queries = getInstitutionQuoteQueries();
  if (!queries.length) return;

  const unsubscribers = queries.map(query => {
    let initialSnapshot = true;

    return query.onSnapshot(async snapshot => {
      if (initialSnapshot) {
        initialSnapshot = false;
        return;
      }

      const added = snapshot.docChanges()
        .filter(change => change.type === "added")
        .map(change => ({ id: change.doc.id, ...change.doc.data() }));

      if (!added.length) return;

      const newest = added
        .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))[0];

      showLiveQuoteAlert(newest);
      await loadMatchedQuotes();
    }, error => {
      console.error("Canlı teklif takibi başlatılamadı:", error);
    });
  });

  liveQuoteUnsubscribe = () => {
    unsubscribers.forEach(unsubscribe => {
      try { unsubscribe(); } catch (_) {}
    });
  };
}

document.addEventListener("pointerdown", () => {
  panelAudioUnlocked = true;
}, { once:true });

document.addEventListener("keydown", () => {
  panelAudioUnlocked = true;
}, { once:true });

function setPanelTab(name) {
  document.body.dataset.panelCurrent = name;

  document.querySelectorAll("[data-panel-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.panelTab === name);
  });

  document.querySelectorAll("[data-panel-view]").forEach(view => {
    view.classList.toggle("active", view.dataset.panelView === name);
  });

  if (typeof window.updateInstitutionNavigation === "function") {
    window.updateInstitutionNavigation(name);
  }
}

document.querySelectorAll("[data-panel-tab]").forEach(btn => {
  btn.addEventListener("click", async () => {
    setPanelTab(btn.dataset.panelTab);

    if (btn.dataset.panelTab === "stats" && currentInstitution) {
      await loadInstitutionStats();
    }

    if (btn.dataset.panelTab === "support" && currentAccount) {
      populateSupportQuoteReferences();
      await loadSupportTickets();
      markAllSupportRepliesRead();
    }
  });
});

document.getElementById("goQuotesBtn").addEventListener("click", () => setPanelTab("quotes"));
document.getElementById("goProfileBtn").addEventListener("click", () => setPanelTab("profile"));
document.getElementById("goVerifyBtn")?.addEventListener("click", () => setPanelTab("verify"));
document.getElementById("goSupportBtn")?.addEventListener("click", async () => {
  setPanelTab("support");
  populateSupportQuoteReferences();
  if (currentAccount) {
    await loadSupportTickets();
    markAllSupportRepliesRead();
  }
});
document.getElementById("openNewQuotesBtn")?.addEventListener("click", () => {
  quotePanelFilter.value = "new";
  setPanelTab("quotes");
  renderQuotes();
});

document.getElementById("persistentNewRequestBtn")?.addEventListener("click", () => {
  quotePanelFilter.value = "new";
  setPanelTab("quotes");
  if (typeof syncQuoteShortcutActive === "function") syncQuoteShortcutActive();
  renderQuotes();
});
document.getElementById("openVerifyBtn")?.addEventListener("click", () => setPanelTab("verify"));
document.getElementById("completeProfileBtn")?.addEventListener("click", () => setPanelTab("profile"));

function openFirmDashboardQuotes(filter = "") {
  if (quotePanelFilter) quotePanelFilter.value = filter;
  setPanelTab("quotes");
  if (typeof syncQuoteShortcutActive === "function") syncQuoteShortcutActive();
  if (typeof renderQuotes === "function") renderQuotes();
}

document.getElementById("firmHomeNewBtn")?.addEventListener("click", () => {
  openFirmDashboardQuotes("new");
});

document.getElementById("firmHomeOfferedBtn")?.addEventListener("click", () => {
  openFirmDashboardQuotes("offered");
});

document.getElementById("firmHomeProfileBtn")?.addEventListener("click", () => {
  setPanelTab("profile");
});

document.getElementById("firmHomeMessagesBtn")?.addEventListener("click", () => {
  openFirmDashboardQuotes("");

  setTimeout(() => {
    const unreadButton =
      document.querySelector(".firm-open-chat-btn.has-unread") ||
      document.querySelector(".firm-open-chat-btn");

    unreadButton?.click();
  }, 80);
});

document.getElementById("firmAllOpportunitiesBtn")?.addEventListener("click", () => {
  openFirmDashboardQuotes("new");
});

document.getElementById("firmOpportunityList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-firm-opportunity]");
  if (!button) return;

  const quoteId = button.dataset.firmOpportunity;
  openFirmDashboardQuotes("new");

  setTimeout(() => {
    const form = document.querySelector(
      '[data-real-offer-form][data-quote-id="' + CSS.escape(String(quoteId)) + '"]'
    );
    const card = form?.closest(".quote-card") || form;
    card?.scrollIntoView({ behavior:"smooth", block:"center" });
    form?.querySelector('input[name="price"]')?.focus();
  }, 100);
});

document.getElementById("liveQuoteAlertBtn")?.addEventListener("click", () => {
  hideLiveQuoteAlert();
  quotePanelFilter.value = "new";
  setPanelTab("quotes");
  syncQuoteShortcutActive();
  renderQuotes();
});

document.getElementById("liveQuoteAlertClose")?.addEventListener("click", hideLiveQuoteAlert);

document.querySelectorAll("[data-quote-shortcut]").forEach(btn => {
  btn.addEventListener("click", () => {
    quotePanelFilter.value = btn.dataset.quoteShortcut;
    syncQuoteShortcutActive();
    renderQuotes();
  });
});

function getShowcaseServiceState() {
  const institution=currentInstitution || {};
  const locationVideo=String(institution.locationVideoUrl || institution.profileVideoUrl || institution.videoUrl || "").trim();
  const virtualTour=String(institution.virtualTourUrl || institution.tour360Url || institution.tourUrl || "").trim();
  return { locationVideo, virtualTour, hasLocationVideo:Boolean(locationVideo), hasVirtualTour:Boolean(virtualTour) };
}

function updateShowcaseServiceStatus() {
  const state=getShowcaseServiceState();
  const setStatus=(id,active,activeText,emptyText)=>{
    const node=document.getElementById(id);
    if(!node)return;
    node.textContent=active ? activeText : emptyText;
    node.classList.toggle("active",active);
    node.classList.toggle("missing",!active);
  };
  setStatus("showcaseLocationStatus",state.hasLocationVideo,"✓ Aktif · Kurum sayfanızda yayınlanıyor","Henüz eklenmedi");
  setStatus("showcaseTourStatus",state.hasVirtualTour,"✓ Aktif · Kurum sayfanızda yayınlanıyor","Henüz eklenmedi");
  setStatus("summaryLocationStatus",state.hasLocationVideo,"▶ Konum Videosu · Aktif","▶ Konum Videosu · Henüz yok");
  setStatus("summaryTourStatus",state.hasVirtualTour,"◉ 360° Tur · Aktif","◉ 360° Tur · Henüz yok");
}

function openShowcaseRequest(type) {
  const config={
    location:{subject:"Konum Videosu hakkında bilgi almak istiyorum",message:"Kurumum için Konum Videosu hizmeti hakkında bilgi almak istiyorum. Çekim / hazırlama süreci, kullanım alanları ve fiyat bilgisi paylaşabilir misiniz?"},
    tour:{subject:"360° Sanal Tur hakkında bilgi almak istiyorum",message:"Kurumum için 360° Sanal Tur hizmeti hakkında bilgi almak istiyorum. Çekim süreci, kurum sayfasında yayınlama ve fiyat bilgisi paylaşabilir misiniz?"},
    combo:{subject:"Dijiyer Mekan Tanıtım Paketi hakkında bilgi almak istiyorum",message:"Kurumum için Konum Videosu + 360° Sanal Tur paketini değerlendirmek istiyorum. Paket kapsamı, süreç ve fiyat bilgisi paylaşabilir misiniz?"}
  };
  const selected=config[type] || config.combo;
  setPanelTab("support");
  setTimeout(()=>{
    const category=document.getElementById("supportCategory");
    const subject=document.getElementById("supportSubject");
    const message=document.getElementById("supportMessage");
    if(category)category.value="Tanıtım Hizmeti";
    if(subject)subject.value=selected.subject;
    if(message)message.value=selected.message;
    if(typeof populateSupportQuoteReferences==="function")populateSupportQuoteReferences();
    document.getElementById("supportTicketForm")?.scrollIntoView({behavior:"smooth",block:"start"});
    subject?.focus();
  },100);
}

function renderInstitutionHeader() {
  const institution = currentInstitution;

  document.getElementById("panelInstitutionName").textContent =
    institution.name || currentAccount.institutionName || "Kurum";

  document.getElementById("panelInstitutionLocation").textContent =
    [institution.city, institution.district].filter(Boolean).join(" / ");

  const categoryText =
    categoryLabels[institution.category] ||
    categoryLabels[institution.subCategory] ||
    institution.subCategory ||
    institution.category ||
    "Kategori belirtilmemiş";

  const categoryBadge = document.getElementById("panelCategoryBadge");
  const serviceArea = document.getElementById("panelServiceArea");

  if (categoryBadge) categoryBadge.textContent = "🏷️ " + categoryText;
  if (serviceArea) {
    serviceArea.textContent =
      "📍 " + ([institution.city, institution.district].filter(Boolean).join(" / ") || "Hizmet bölgesi belirtilmemiş");
  }

  document.getElementById("panelEmail").textContent =
    currentAccount.email || currentUser.email || "-";

  document.getElementById("profileName").value = institution.name || "";
  document.getElementById("profileDescription").value = institution.description || "";
  document.getElementById("profilePhone").value = institution.phone || "";
  document.getElementById("profileWhatsapp").value = institution.whatsapp || institution.phone || "";
  document.getElementById("profileWebsite").value = institution.website || "";
  document.getElementById("profileInstagram").value = institution.instagram || "";
  document.getElementById("profileLogoUrl").value = institution.logoUrl || "";
  document.getElementById("profileCoverUrl").value = institution.coverUrl || "";
  document.getElementById("profileServiceAreas").value = institution.serviceAreas || "";
  document.getElementById("profileWeekdayHours").value = institution.weekdayHours || "";
  document.getElementById("profileSaturdayHours").value = institution.saturdayHours || "";
  document.getElementById("profileSundayHours").value = institution.sundayHours || "";
  document.getElementById("profileGalleryUrls").value =
    (Array.isArray(institution.galleryUrls) ? institution.galleryUrls : []).join("\n");
  document.getElementById("profileAddress").value = institution.address || "";
  document.getElementById("profileLocation").textContent =
    [institution.city, institution.district].filter(Boolean).join(" / ") || "-";
  document.getElementById("profileCategory").textContent =
    categoryLabels[institution.category] || institution.category || "-";
  document.getElementById("profileOffer").checked = institution.offer !== false;

  renderProfileMediaPreview();
  updateOfferUi();
  updateProfileCompletion();
  updateShowcaseServiceStatus();
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

  const sideOfferStatus = document.getElementById("sideOfferStatus");
  if (sideOfferStatus) {
    sideOfferStatus.textContent = active ? "● Açık" : "● Kapalı";
    sideOfferStatus.classList.toggle("off", !active);
  }

  if (quoteRecords.length || document.getElementById("workPriorityText")) {
    renderSummary();
  }
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
    quoteRecords = await fetchInstitutionMatchedQuotes();

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

function updatePersistentNewRequestCard(newCount) {
  const card = document.getElementById("persistentNewRequestCard");
  const count = document.getElementById("persistentNewRequestCount");
  const text = document.getElementById("persistentNewRequestText");
  if (!card || !count || !text) return;

  count.textContent = String(newCount || 0);

  if (newCount > 0) {
    text.textContent =
      newCount + " yeni müşteri talebi sizi bekliyor. Hızlı dönüş yapmak teklif alma şansınızı artırır.";
    card.classList.remove("hidden");
  } else {
    text.textContent = "Şu anda bekleyen yeni müşteri talebi yok.";
    card.classList.add("hidden");
  }
}

function renderSummary() {
  const newCount = quoteRecords.filter(q => getQuoteViewStatus(q) === "new").length;
  const offeredCount = quoteRecords.filter(q => getQuoteViewStatus(q) === "interested").length;
  const lockedCount = 0;

  updatePersistentNewRequestCard(newCount);

  document.getElementById("newQuoteCount").textContent = newCount;
  document.getElementById("totalQuoteCount").textContent = quoteRecords.length;
  document.getElementById("quoteTabCount").textContent = newCount;

  document.getElementById("workNewCount").textContent = newCount;
  document.getElementById("workLockedCount").textContent = lockedCount;
  document.getElementById("pendingQuoteCount").textContent = newCount;
  document.getElementById("offeredQuoteCount").textContent = offeredCount;
  document.getElementById("lockedQuoteCount").textContent = lockedCount;
  document.getElementById("latestQuoteTime").textContent =
    quoteRecords.length ? formatRelativeTime(quoteRecords[0].date) : "-";

  updateQuoteShortcutCounts({
    all: quoteRecords.length,
    new: newCount,
    offered: offeredCount,
    locked: lockedCount,
    used: 0,
    expired: 0
  });
  syncQuoteShortcutActive();

  const priorityText = document.getElementById("workPriorityText");
  const focusCard = document.getElementById("workFocusCard");

  if (currentInstitution?.offer === false) {
    priorityText.textContent = "Teklif alımınız kapalı. Yeni müşteri talepleriyle eşleşmek için teklif alımını açabilirsiniz.";
    focusCard.dataset.state = "paused";
  } else if (newCount > 0) {
    priorityText.textContent = newCount + " yeni müşteri talebi sizi bekliyor. Hızlı dönüş yapmak için teklifleri inceleyin.";
    focusCard.dataset.state = "urgent";
  } else {
    priorityText.textContent = "Şu anda cevap bekleyen yeni talep yok.";
    focusCard.dataset.state = "clear";
  }

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
  const isDirect =
    Boolean(quote.targetInstitutionId) &&
    String(quote.targetInstitutionId) === String(currentAccount?.institutionId || "");

  const displayCity = isDirect ? currentInstitution.city : quote.city;
  const displayDistrict = isDirect ? currentInstitution.district : quote.district;

  const sameDistrict =
    String(displayDistrict || "").toLocaleLowerCase("tr-TR") ===
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
          <small>${isDirect ? "🎯 Doğrudan Profil Talebi · " : ""}${escapeHtml(displayDistrict || displayCity || "-")} · ${formatDate(quote.date)}</small>
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
          ${isDirect ? '<div class="direct-profile-request-badge">🎯 Doğrudan Profil Talebi</div>' : ""}
          <div class="quote-location">
            📍 ${escapeHtml([displayCity, displayDistrict].filter(Boolean).join(" / "))}
            ${isDirect
              ? '<span class="district-badge">Sadece size gönderildi</span>'
              : (sameDistrict ? '<span class="district-badge">Aynı ilçe</span>' : '<span class="city-badge">Aynı şehir</span>')}
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
  const now = new Date().toISOString();
  const quote = quoteRecords.find(item => String(item.id) === String(quoteId));

  try {
    await db.collection("quoteResponses").doc(docId).set({
      quoteId,
      institutionId: currentAccount.institutionId,
      userId: currentUser.uid,
      status,
      date: now
    });

    // Müşterinin teklif takip ekranında görebileceği kurum yanıtı.
    // Müşteri bilgisi içermez; yalnızca kurumun talebe verdiği durum paylaşılır.
    try {
      await db.collection("quoteRequests")
        .doc(quoteId)
        .collection("engagement")
        .doc(String(currentAccount.institutionId))
        .set({
          institutionId: String(currentAccount.institutionId),
          institutionName: String(currentInstitution?.name || currentAccount?.institutionName || "Kurum"),
          institutionResponse: status,
          institutionResponseAt: now,
          lastInstitutionActionAt: now
        }, { merge:true });
    } catch (engagementError) {
      console.error("Müşteri durum bildirimi kaydedilemedi:", engagementError);
      // Ana kurum cevabını geri alma; panelde cevap kaydı korunur.
      if (quote?.targetInstitutionId) {
        alert("Cevabınız kaydedildi ancak müşteriye canlı durum iletilemedi. Firestore kuralını güncelleyin.");
      }
    }

    responseMap.set(quoteId, {
      id: docId,
      quoteId,
      institutionId: currentAccount.institutionId,
      userId: currentUser.uid,
      status,
      date: now
    });

    renderQuotes();
    renderSummary();
  } catch (error) {
    console.error("Teklif cevabı kaydedilemedi:", error);
    alert("İşlem kaydedilemedi. Firestore yetkisini kontrol edin.");
  }
}

document.getElementById("openShowcaseServicesBtn")?.addEventListener("click",()=>setPanelTab("showcase"));
document.getElementById("showcasePreviewBtn")?.addEventListener("click",()=>document.getElementById("publicProfilePreviewBtn")?.click());
document.getElementById("showcasePreviewBtn2")?.addEventListener("click",()=>document.getElementById("publicProfilePreviewBtn")?.click());
document.querySelectorAll("[data-showcase-request]").forEach(button=>{
  button.addEventListener("click",()=>openShowcaseRequest(button.dataset.showcaseRequest || "combo"));
});

quotePanelFilter.addEventListener("change", () => {
  syncQuoteShortcutActive();
  renderQuotes();
});

document.getElementById("institutionProfileForm").addEventListener("submit", async e => {
  e.preventDefault();

  const profileMessage=document.getElementById("profileMessage");
  const saveBtn=document.getElementById("profileSaveBtn");
  const name=String(document.getElementById("profileName").value||"").trim();

  const showProfileMessage=(text,state="")=>{
    if(!profileMessage)return;
    profileMessage.textContent=text;
    profileMessage.className="form-message profile-save-message"+(state?" "+state:"");
  };

  if(!currentAccount?.institutionId){
    showProfileMessage("Kurum oturumu bulunamadı. Çıkış yapıp tekrar giriş yapın.","error");
    return;
  }

  if(!name){
    showProfileMessage("Kurum adı boş bırakılamaz.","error");
    document.getElementById("profileName").focus();
    return;
  }

  const website=String(document.getElementById("profileWebsite").value||"").trim();
  const logoRaw=String(document.getElementById("profileLogoUrl").value||"").trim();
  const coverRaw=String(document.getElementById("profileCoverUrl").value||"").trim();

  const logoUrl=logoRaw ? safeProfileUrl(logoRaw) : "";
  const coverUrl=coverRaw ? safeProfileUrl(coverRaw) : "";

  if(logoRaw && !logoUrl){
    showProfileMessage("Logo bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("profileLogoUrl").focus();
    return;
  }
  if(coverRaw && !coverUrl){
    showProfileMessage("Kapak görseli bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("profileCoverUrl").focus();
    return;
  }

  const changes={
    name,
    description:String(document.getElementById("profileDescription").value||"").trim(),
    phone:String(document.getElementById("profilePhone").value||"").trim(),
    whatsapp:String(document.getElementById("profileWhatsapp").value||"").trim(),
    website,
    instagram:String(document.getElementById("profileInstagram").value||"").trim(),
    logoUrl,
    coverUrl,
    serviceAreas:String(document.getElementById("profileServiceAreas").value||"").trim(),
    weekdayHours:String(document.getElementById("profileWeekdayHours").value||"").trim(),
    saturdayHours:String(document.getElementById("profileSaturdayHours").value||"").trim(),
    sundayHours:String(document.getElementById("profileSundayHours").value||"").trim(),
    galleryUrls:parseProfileGalleryUrls(
      document.getElementById("profileGalleryUrls").value
    ),
    address:String(document.getElementById("profileAddress").value||"").trim(),
    offer:document.getElementById("profileOffer").checked,
    updatedAt:new Date().toISOString()
  };

  const oldText=saveBtn?.textContent || "Değişiklikleri Kaydet";
  if(saveBtn){
    saveBtn.disabled=true;
    saveBtn.textContent="Kaydediliyor...";
  }
  showProfileMessage("Değişiklikler kaydediliyor...","saving");

  try{
    const ref=db.collection("institutions").doc(currentAccount.institutionId);
    const snap=await ref.get();

    if(!snap.exists){
      showProfileMessage("Kurum kaydı bulunamadı. Destek ile iletişime geçin.","error");
      return;
    }

    await ref.update(changes);

    Object.assign(currentInstitution,changes);
    renderInstitutionHeader();
    updateProfileCompletion();
    showProfileMessage("✓ Değişiklikler kaydedildi. Müşteri profiliniz güncellendi.","success");
  }catch(error){
    console.error("Kurum bilgileri kaydedilemedi:",error);

    let message="Değişiklikler kaydedilemedi.";
    if(String(error?.code||"").includes("permission-denied")){
      message="Kayıt yetkisi reddedildi. Firestore kurum profil güncelleme kuralı yayınlanmalıdır.";
    }else if(String(error?.code||"").includes("unavailable")){
      message="Firebase'e ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.";
    }

    showProfileMessage(message,"error");
  }finally{
    if(saveBtn){
      saveBtn.disabled=false;
      saveBtn.textContent=oldText;
    }
  }
});

["profileLogoUrl","profileCoverUrl","profileGalleryUrls"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", renderProfileMediaPreview);
});

document.getElementById("profileLogoFile")?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  await saveUploadedSingleImage(
    file,
    "logo",
    "logoUrl",
    "profileLogoUrl",
    "profileLogoUploadStatus",
    "Logo"
  );
  event.target.value = "";
});

document.getElementById("profileCoverFile")?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  await saveUploadedSingleImage(
    file,
    "cover",
    "coverUrl",
    "profileCoverUrl",
    "profileCoverUploadStatus",
    "Kapak"
  );
  event.target.value = "";
});

document.getElementById("profileGalleryFiles")?.addEventListener("change", async event => {
  await uploadProfileGalleryFiles(event.target.files);
  event.target.value = "";
});

document.getElementById("profileGalleryPreview")?.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-profile-gallery]");
  if (!button) return;
  removeProfileGalleryImage(Number(button.dataset.removeProfileGallery));
});

document.getElementById("toggleOfferBtn").addEventListener("click", async () => {
  const nextValue = currentInstitution.offer === false;

  try {
    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({ offer: nextValue, updatedAt:new Date().toISOString() });

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



function supportNeedsQuoteReference(category) {
  return category === "Teklif Sorunu" || category === "Fiyat Kilidi";
}

function getSupportQuoteState(quote) {
  try {
    if (typeof sellerOfferState === "function") {
      return sellerOfferState(quote);
    }
  } catch (_) {}

  try {
    return getQuoteViewStatus(quote);
  } catch (_) {
    return "new";
  }
}

function getSupportQuoteStateLabel(state) {
  const map = {
    new:"Yeni talep",
    offered:"Teklif verildi",
    interested:"Teklif verildi",
    locked:"Fiyat kilitlendi",
    used:"Kullanıldı",
    expired:"Süresi doldu",
    closed:"Başka teklif seçildi",
    not_interested:"İlgilenmiyorum"
  };
  return map[state] || state || "-";
}

function getSupportOfferData(quoteId) {
  let offer = null;
  let lock = null;

  try {
    if (typeof institutionOfferMap !== "undefined") {
      offer = institutionOfferMap.get(quoteId) || null;
    }
  } catch (_) {}

  try {
    if (typeof institutionLockMap !== "undefined") {
      lock = institutionLockMap.get(quoteId) || null;
    }
  } catch (_) {}

  return { offer, lock };
}

function getSupportReferencePayload(quoteId) {
  const quote = quoteRecords.find(item => String(item.id) === String(quoteId));
  if (!quote) return null;

  const state = getSupportQuoteState(quote);
  const { offer, lock } = getSupportOfferData(quote.id);

  const institutionOwnsLock =
    lock &&
    currentAccount &&
    String(lock.institutionId || "") === String(currentAccount.institutionId || "");

  const selectedOffer = institutionOwnsLock ? lock : offer;

  return {
    relatedRequestId: quote.id,
    relatedService: quote.service || "Teklif Talebi",
    relatedLocation: [quote.city, quote.district].filter(Boolean).join(" / "),
    relatedRequestDate: quote.date || "",
    relatedOfferCode: selectedOffer?.offerCode || offer?.offerCode || "",
    relatedOfferPrice: Number(selectedOffer?.price ?? offer?.price ?? 0) || 0,
    relatedOfferStatus: state,
    relatedOfferStatusLabel: getSupportQuoteStateLabel(state)
  };
}

function renderSupportReferencePreview() {
  const select = document.getElementById("supportReferenceSelect");
  const preview = document.getElementById("supportReferencePreview");
  if (!select || !preview) return;

  const payload = getSupportReferencePayload(select.value);

  if (!payload) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = `
    <div>
      <span>Hizmet</span>
      <strong>${escapeHtml(payload.relatedService)}</strong>
    </div>
    <div>
      <span>Konum</span>
      <strong>${escapeHtml(payload.relatedLocation || "-")}</strong>
    </div>
    <div>
      <span>Durum</span>
      <strong>${escapeHtml(payload.relatedOfferStatusLabel)}</strong>
    </div>
    <div>
      <span>Teklif No</span>
      <strong>${escapeHtml(payload.relatedOfferCode || "Henüz teklif no yok")}</strong>
    </div>
    <div>
      <span>Fiyat</span>
      <strong>${payload.relatedOfferPrice
        ? new Intl.NumberFormat("tr-TR").format(payload.relatedOfferPrice) + " TL"
        : "-"}</strong>
    </div>
  `;
  preview.classList.remove("hidden");
}

function populateSupportQuoteReferences() {
  const category = document.getElementById("supportCategory");
  const wrap = document.getElementById("supportReferenceWrap");
  const select = document.getElementById("supportReferenceSelect");
  const preview = document.getElementById("supportReferencePreview");

  if (!category || !wrap || !select) return;

  const needsReference = supportNeedsQuoteReference(category.value);

  wrap.classList.toggle("hidden", !needsReference);
  select.required = needsReference;

  if (!needsReference) {
    select.value = "";
    preview?.classList.add("hidden");
    if (preview) preview.innerHTML = "";
    return;
  }

  const currentValue = select.value;

  const rows = [...quoteRecords]
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

  select.innerHTML =
    '<option value="">Talep veya teklif seçin</option>' +
    rows.map(quote => {
      const state = getSupportQuoteState(quote);
      const { offer, lock } = getSupportOfferData(quote.id);
      const ownLock =
        lock &&
        currentAccount &&
        String(lock.institutionId || "") === String(currentAccount.institutionId || "");
      const code = (ownLock ? lock?.offerCode : offer?.offerCode) || "";
      const location = [quote.city, quote.district].filter(Boolean).join(" / ");
      const date = quote.date ? new Date(quote.date).toLocaleDateString("tr-TR") : "-";

      const parts = [
        quote.service || "Teklif Talebi",
        location,
        date,
        getSupportQuoteStateLabel(state),
        code ? "No: " + code : ""
      ].filter(Boolean);

      return '<option value="' + escapeHtml(quote.id) + '">' +
        escapeHtml(parts.join(" · ")) +
        '</option>';
    }).join("");

  if (rows.some(item => String(item.id) === String(currentValue))) {
    select.value = currentValue;
  }

  if (!rows.length) {
    select.innerHTML =
      '<option value="">Bağlanabilecek talep/teklif bulunamadı</option>';
  }

  renderSupportReferencePreview();
}

document.getElementById("supportCategory")?.addEventListener("change", () => {
  populateSupportQuoteReferences();
});

document.getElementById("supportReferenceSelect")?.addEventListener(
  "change",
  renderSupportReferencePreview
);

function supportReplyReadStorageKey() {
  const identity = currentUser?.uid || currentAccount?.institutionId || "guest";
  return "dijiyer_support_reply_reads_" + identity;
}

function getSupportReplyReads() {
  try {
    return JSON.parse(localStorage.getItem(supportReplyReadStorageKey()) || "{}");
  } catch (_) {
    return {};
  }
}

function saveSupportReplyReads(reads) {
  try {
    localStorage.setItem(supportReplyReadStorageKey(), JSON.stringify(reads || {}));
  } catch (_) {}
}

function isSupportReplyUnread(ticket, reads = getSupportReplyReads()) {
  const replyAt = String(ticket?.adminReplyAt || "");
  if (!ticket?.adminReply || !replyAt) return false;
  return String(reads[ticket.id] || "") !== replyAt;
}

function updateSupportReplyIndicators(records = supportTicketRecords) {
  const unread = records.filter(ticket => isSupportReplyUnread(ticket));
  const tabCount = document.getElementById("supportTabCount");

  if (tabCount) {
    tabCount.textContent = unread.length;
    tabCount.classList.toggle("has-unread", unread.length > 0);
    tabCount.title = unread.length
      ? unread.length + " okunmamış destek yanıtı"
      : "Yeni destek yanıtı yok";
  }

  return unread;
}

function markSupportReplyRead(ticketId) {
  const ticket = supportTicketRecords.find(item => String(item.id) === String(ticketId));
  if (!ticket?.adminReplyAt) return;

  const reads = getSupportReplyReads();
  reads[ticket.id] = ticket.adminReplyAt;
  saveSupportReplyReads(reads);
  updateSupportReplyIndicators();
}

function markAllSupportRepliesRead() {
  const reads = getSupportReplyReads();

  supportTicketRecords.forEach(ticket => {
    if (ticket.adminReply && ticket.adminReplyAt) {
      reads[ticket.id] = ticket.adminReplyAt;
    }
  });

  saveSupportReplyReads(reads);
  updateSupportReplyIndicators();
}

function showSupportReplyAlert(ticket) {
  if (!ticket) return;

  activeSupportReplyTicketId = ticket.id;

  const alert = document.getElementById("supportReplyAlert");
  const text = document.getElementById("supportReplyAlertText");

  if (text) {
    const subject = ticket.subject || "Destek Talebi";
    const preview = String(ticket.adminReply || "").replace(/\s+/g," ").trim();
    text.textContent = subject + (preview ? " · " + preview.slice(0,120) : "");
  }

  alert?.classList.remove("hidden");
  playNewQuoteSound();

  try {
    if ("Notification" in window &&
        Notification.permission === "granted" &&
        (document.hidden || !document.hasFocus())) {
      const notification = new Notification("Dijiyer Destek yanıtladı", {
        body: (ticket.subject || "Destek Talebi") + " · " +
          String(ticket.adminReply || "").slice(0,140),
        tag: "dijiyer-support-" + ticket.id
      });
      notification.onclick = () => {
        window.focus();
        openSupportReplyTicket(ticket.id);
        notification.close();
      };
    }
  } catch (_) {}
}

async function openSupportReplyTicket(ticketId) {
  document.getElementById("supportReplyAlert")?.classList.add("hidden");
  setPanelTab("support");
  populateSupportQuoteReferences();
  await loadSupportTickets();

  const id = ticketId || activeSupportReplyTicketId;
  if (id) {
    markSupportReplyRead(id);
    const card = document.querySelector(
      '.support-ticket-card[data-support-ticket-id="' + CSS.escape(String(id)) + '"]'
    );
    card?.scrollIntoView({ behavior:"smooth", block:"center" });
    card?.classList.add("support-reply-focus");
    setTimeout(() => card?.classList.remove("support-reply-focus"), 1800);
  } else {
    markAllSupportRepliesRead();
  }
}

function updateSupportBrowserNotificationUi() {
  const button = document.getElementById("supportBrowserNotificationBtn");
  const status = document.getElementById("supportNotificationStatus");
  if (!button || !status) return;

  if (!("Notification" in window)) {
    button.disabled = true;
    button.textContent = "Bildirim desteklenmiyor";
    status.textContent = "Panel içi destek bildirimleri aktif.";
    return;
  }

  if (Notification.permission === "granted") {
    button.disabled = true;
    button.textContent = "✓ Masaüstü Bildirimleri Açık";
    status.textContent = "Panel içi ve masaüstü destek bildirimleri aktif.";
  } else if (Notification.permission === "denied") {
    button.disabled = true;
    button.textContent = "Bildirim izni engelli";
    status.textContent = "Panel içi bildirimler aktif. Masaüstü izni tarayıcı ayarlarından açılabilir.";
  } else {
    button.disabled = false;
    button.textContent = "🔔 Masaüstü Bildirimlerini Aç";
    status.textContent = "Panel içi bildirimler aktif. İsterseniz masaüstü bildirimlerini de açabilirsiniz.";
  }
}

async function enableSupportBrowserNotifications() {
  if (!("Notification" in window)) return;

  try {
    await Notification.requestPermission();
  } catch (_) {}

  updateSupportBrowserNotificationUi();
}

function startLiveSupportWatcher() {
  if (!currentAccount || !currentUser) return;

  if (liveSupportUnsubscribe) {
    liveSupportUnsubscribe();
    liveSupportUnsubscribe = null;
  }

  liveSupportWatcherReady = false;
  const knownReplies = new Map();

  liveSupportUnsubscribe = db.collection("supportTickets")
    .where("institutionId", "==", currentAccount.institutionId)
    .where("userId", "==", currentUser.uid)
    .onSnapshot(async snapshot => {
      const records = snapshot.docs
        .map(doc => ({ id:doc.id, ...doc.data() }))
        .sort((a,b) =>
          new Date(b.updatedAt || b.date || 0) -
          new Date(a.updatedAt || a.date || 0)
        );

      if (!liveSupportWatcherReady) {
        records.forEach(ticket => {
          knownReplies.set(ticket.id, String(ticket.adminReplyAt || ""));
        });
        supportTicketRecords = records;
        updateSupportReplyIndicators(records);
        liveSupportWatcherReady = true;
        return;
      }

      const changedReplies = [];

      records.forEach(ticket => {
        const replyAt = String(ticket.adminReplyAt || "");
        const previous = knownReplies.get(ticket.id) || "";

        if (ticket.adminReply && replyAt && replyAt !== previous) {
          changedReplies.push(ticket);
        }

        knownReplies.set(ticket.id, replyAt);
      });

      supportTicketRecords = records;
      updateSupportReplyIndicators(records);

      if (changedReplies.length) {
        const newest = changedReplies.sort((a,b) =>
          new Date(b.adminReplyAt || b.updatedAt || 0) -
          new Date(a.adminReplyAt || a.updatedAt || 0)
        )[0];

        showSupportReplyAlert(newest);
        await loadSupportTickets();
      }
    }, error => {
      console.error("Canlı destek yanıtı takibi başlatılamadı:", error);
    });
}

document.getElementById("supportReplyAlertBtn")?.addEventListener("click", () => {
  openSupportReplyTicket(activeSupportReplyTicketId);
});

document.getElementById("supportReplyAlertClose")?.addEventListener("click", () => {
  document.getElementById("supportReplyAlert")?.classList.add("hidden");
});

document.getElementById("supportBrowserNotificationBtn")?.addEventListener(
  "click",
  enableSupportBrowserNotifications
);

function getSupportStatusMeta(status) {
  const map = {
    new: ["Yeni", "new"],
    reviewing: ["İnceleniyor", "reviewing"],
    answered: ["Cevaplandı", "answered"],
    resolved: ["Çözüldü", "resolved"]
  };
  return map[status] || ["Yeni", "new"];
}

async function loadSupportTickets() {
  const list = document.getElementById("supportTicketsList");
  const tabCount = document.getElementById("supportTabCount");
  const openCount = document.getElementById("supportOpenCount");

  if (!list || !currentAccount) return;

  list.innerHTML = '<div class="empty-state">Destek talepleri yükleniyor...</div>';

  try {
    const snapshot = await db.collection("supportTickets")
      .where("institutionId", "==", currentAccount.institutionId)
      .where("userId", "==", currentUser.uid)
      .get();

    supportTicketRecords = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));

    const open = supportTicketRecords.filter(item =>
      String(item.status || "new") !== "resolved"
    );

    updateSupportReplyIndicators(supportTicketRecords);
    if (openCount) openCount.textContent = open.length + " açık";

    if (!supportTicketRecords.length) {
      list.innerHTML =
        '<div class="empty-state">Henüz destek talebiniz yok. Bir sorun yaşadığınızda buradan bize ulaşabilirsiniz.</div>';
      return;
    }

    list.innerHTML = supportTicketRecords.map(ticket => {
      const [statusText, statusClass] = getSupportStatusMeta(ticket.status);

      return `
        <article class="support-ticket-card ${isSupportReplyUnread(ticket) ? "has-unread-reply" : ""}" data-support-ticket-id="${escapeHtml(ticket.id)}">
          <div class="support-ticket-head">
            <div>
              <span class="support-ticket-category">${escapeHtml(ticket.category || "Destek")}</span>
              <h3>${escapeHtml(ticket.subject || "Destek Talebi")}</h3>
            </div>
            <span class="support-status support-status-${statusClass}">${statusText}</span>
          </div>

          ${ticket.relatedRequestId ? `
            <div class="support-linked-reference">
              <div>
                <span>BAĞLI TALEP / TEKLİF</span>
                <strong>${escapeHtml(ticket.relatedService || "Teklif Talebi")}</strong>
              </div>
              <div class="support-linked-reference-grid">
                <span>Talep No: <b>${escapeHtml(String(ticket.relatedRequestId).slice(0,10).toUpperCase())}</b></span>
                <span>Teklif No: <b>${escapeHtml(ticket.relatedOfferCode || "-")}</b></span>
                <span>Durum: <b>${escapeHtml(ticket.relatedOfferStatusLabel || getSupportQuoteStateLabel(ticket.relatedOfferStatus))}</b></span>
                ${ticket.relatedOfferPrice
                  ? `<span>Fiyat: <b>${new Intl.NumberFormat("tr-TR").format(Number(ticket.relatedOfferPrice))} TL</b></span>`
                  : ""}
              </div>
            </div>
          ` : ""}

          <p class="support-ticket-message">${escapeHtml(ticket.message || "")}</p>

          ${ticket.adminReply ? `
            <div class="support-admin-reply">
              <strong>💬 Dijiyer Destek Yanıtı</strong>
              <p>${escapeHtml(ticket.adminReply)}</p>
              <small>${formatDate(ticket.adminReplyAt || ticket.updatedAt)}</small>
            </div>
          ` : `
            <div class="support-awaiting">
              Destek ekibinin yanıtı bekleniyor.
            </div>
          `}

          <div class="support-ticket-meta">
            <span>Talep: ${formatDate(ticket.date)}</span>
            <span>No: ${escapeHtml(ticket.id.slice(0,8).toUpperCase())}</span>
          </div>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Destek talepleri yüklenemedi:", error);
    list.innerHTML =
      '<div class="empty-state">Destek talepleri yüklenemedi. Firestore yetkisini kontrol edin.</div>';
  }
}

document.getElementById("supportTicketForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser || !currentAccount || !currentInstitution) return;

  const category = document.getElementById("supportCategory").value;
  const subject = document.getElementById("supportSubject").value.trim();
  const message = document.getElementById("supportMessage").value.trim();
  const referenceSelect = document.getElementById("supportReferenceSelect");
  const referenceId = referenceSelect?.value || "";
  const feedback = document.getElementById("supportFormMessage");
  const submit = document.getElementById("supportSubmitBtn");

  if (!category || !subject || !message) {
    feedback.textContent = "Lütfen tüm alanları doldurun.";
    return;
  }

  if (supportNeedsQuoteReference(category) && !referenceId) {
    feedback.textContent = "Lütfen sorun yaşadığınız talep veya teklifi seçin.";
    referenceSelect?.focus();
    return;
  }

  const relatedReference = referenceId
    ? getSupportReferencePayload(referenceId)
    : null;

  submit.disabled = true;
  submit.textContent = "Gönderiliyor...";
  feedback.textContent = "";

  try {
    const now = new Date().toISOString();

    await db.collection("supportTickets").add({
      institutionId: currentAccount.institutionId,
      userId: currentUser.uid,
      institutionName: currentInstitution.name || currentAccount.institutionName || "Kurum",
      email: currentAccount.email || currentUser.email || "",
      category,
      subject,
      message,
      ...(relatedReference || {}),
      status: "new",
      date: now,
      updatedAt: now,
      adminReply: "",
      adminReplyAt: ""
    });

    event.target.reset();
    populateSupportQuoteReferences();
    feedback.textContent = relatedReference
      ? "Destek talebiniz ilgili teklif kaydıyla birlikte oluşturuldu."
      : "Destek talebiniz oluşturuldu.";
    await loadSupportTickets();

  } catch (error) {
    console.error("Destek talebi oluşturulamadı:", error);
    feedback.textContent = "Destek talebi gönderilemedi. Firestore yetkisini kontrol edin.";
  } finally {
    submit.disabled = false;
    submit.textContent = "Destek Talebi Gönder";
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

    await loadSectorStats(weekKeys);

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


async function loadSectorStats(weekKeys) {
  const sectorLabel = document.getElementById("sectorLabel");
  const sectorInstitutionCount = document.getElementById("sectorInstitutionCount");
  const sectorWeekViews = document.getElementById("sectorWeekViews");
  const sectorReviewCount = document.getElementById("sectorReviewCount");
  const sectorAverageRating = document.getElementById("sectorAverageRating");
  const sectorStatsNote = document.getElementById("sectorStatsNote");

  if (!currentInstitution || !currentInstitution.category) {
    sectorStatsNote.textContent = "Kurum kategorisi bulunamadı.";
    return;
  }

  const category = currentInstitution.category;
  sectorLabel.textContent = categoryLabels[category] || category;
  sectorStatsNote.textContent = "Sektör verileri hesaplanıyor...";

  try {
    const institutionSnapshot = await db.collection("institutions")
      .where("category", "==", category)
      .get();

    const sectorInstitutionIds = institutionSnapshot.docs.map(doc => doc.id);
    sectorInstitutionCount.textContent = sectorInstitutionIds.length;

    if (!sectorInstitutionIds.length) {
      sectorWeekViews.textContent = "0";
      sectorReviewCount.textContent = "0";
      sectorAverageRating.textContent = "0.0";
      sectorStatsNote.textContent = "Bu sektörde henüz kurum bulunmuyor.";
      return;
    }

    const reviewSnapshots = await Promise.all(
      sectorInstitutionIds.map(id =>
        db.collection("institutionReviews")
          .where("institutionId", "==", id)
          .get()
      )
    );

    const sectorReviews = reviewSnapshots.flatMap(snapshot =>
      snapshot.docs
        .map(doc => doc.data())
        .filter(item => item.status === "published")
    );

    const sectorAverage = sectorReviews.length
      ? sectorReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / sectorReviews.length
      : 0;

    sectorReviewCount.textContent = sectorReviews.length;
    sectorAverageRating.textContent =
      sectorReviews.length ? sectorAverage.toFixed(1) : "0.0";

    try {
      const analyticsSnapshots = await Promise.all(
        sectorInstitutionIds.map(id =>
          db.collection("institutionAnalytics")
            .where("institutionId", "==", id)
            .get()
        )
      );

      const sectorEvents = analyticsSnapshots.flatMap(snapshot =>
        snapshot.docs.map(doc => doc.data())
      );

      const sectorWeekViewCount = sectorEvents.filter(item =>
        item.type === "profile_view" && weekKeys.has(item.day)
      ).length;

      sectorWeekViews.textContent = sectorWeekViewCount;
      sectorStatsNote.textContent =
        "Sektör karşılaştırması son 7 günlük Dijiyer verilerine göre hesaplanır.";
    } catch (analyticsError) {
      console.warn("Sektör trafik verisi okunamadı:", analyticsError);
      sectorWeekViews.textContent = "—";
      sectorStatsNote.textContent =
        "Kurum ve yorum sektör verileri hazır. Sektör trafik yetkisi Firestore Rules ile açılacak.";
    }

  } catch (error) {
    console.error("Sektör istatistikleri yüklenemedi:", error);
    sectorStatsNote.textContent = "Sektör istatistikleri şu anda yüklenemedi.";
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
      loadInstitutionStats(),
      loadSupportTickets()
    ]);

    populateSupportQuoteReferences();
    updateSupportBrowserNotificationUi();
    startLiveQuoteWatcher();
    startLiveSupportWatcher();

  } catch (error) {
    console.error(error);
    showPanelError("Kurum paneli yüklenemedi.");
  }
});

document.getElementById("publicProfilePreviewBtn")?.addEventListener("click", () => {
  const institutionId=String(currentAccount?.institutionId || "").trim();

  if(!institutionId){
    alert("Kurum bilgileri henüz yüklenmedi. Birkaç saniye sonra tekrar deneyin.");
    return;
  }

  const url=new URL("kurum.html",window.location.href);
  url.searchParams.set("id",institutionId);
  url.searchParams.set("onizleme","1");

  window.open(url.toString(),"_blank","noopener");
});

document.getElementById("institutionLogoutBtn").addEventListener("click", async () => {
  if (liveQuoteUnsubscribe) {
    liveQuoteUnsubscribe();
    liveQuoteUnsubscribe = null;
  }

  if (liveSupportUnsubscribe) {
    liveSupportUnsubscribe();
    liveSupportUnsubscribe = null;
  }
  liveSupportWatcherReady = false;

  await auth.signOut();
  window.location.replace("index.html");
});
