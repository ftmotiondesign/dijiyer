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

function profileFileExtension(file) {
  const byType = {
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/webp":"webp",
    "video/mp4":"mp4",
    "video/webm":"webm"
  };
  return byType[file?.type] || "bin";
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
    Date.now() + "_" + random + "." + profileFileExtension(file)
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

function validateProfilePanorama(file) {
  if (!file) throw new Error("360° görsel seçilmedi.");

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("360° görsel JPG, PNG veya WebP olmalıdır.");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error("360° görsel boyutu 20 MB'dan büyük olamaz.");
  }
}

function validateProfileVideo(file) {
  if (!file) throw new Error("Video seçilmedi.");

  const allowed = ["video/mp4", "video/webm"];
  if (!allowed.includes(file.type)) {
    throw new Error("Video MP4 veya WebM formatında olmalıdır.");
  }

  if (file.size > 80 * 1024 * 1024) {
    throw new Error("Video boyutu 80 MB'dan büyük olamaz.");
  }
}

async function uploadInstitutionProfileRichMedia(file, kind, statusId, label, mediaType) {
  if (mediaType === "video") validateProfileVideo(file);
  else if (mediaType === "panorama") validateProfilePanorama(file);
  else throw new Error("Geçersiz medya türü.");

  if (!currentUser?.uid || !currentAccount?.institutionId) {
    throw new Error("Kurum oturumu bulunamadı. Tekrar giriş yapın.");
  }

  const ref = storage.ref().child(profileStoragePath(kind, file));
  const task = ref.put(file, {
    contentType:file.type,
    customMetadata:{
      institutionId:String(currentAccount.institutionId),
      mediaType:String(mediaType)
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

async function saveUploadedProfileMedia({
  file,
  kind,
  fieldName,
  inputId,
  statusId,
  label,
  mediaType
}) {
  if (!file) return;

  const previousUrl=safeProfileUrl(currentInstitution?.[fieldName] || "");

  try {
    const url=await uploadInstitutionProfileRichMedia(
      file,
      kind,
      statusId,
      label,
      mediaType
    );

    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({
        [fieldName]:url,
        updatedAt:new Date().toISOString()
      });

    currentInstitution[fieldName]=url;

    const input=document.getElementById(inputId);
    if(input)input.value=url;

    renderProfileMediaPreview();
    updateShowcaseServiceStatus();

    setProfileUploadStatus(
      statusId,
      label + " yüklendi ve kurum sayfasına kaydedildi.",
      "is-success"
    );

    if(previousUrl && previousUrl !== url){
      deleteOwnProfileStorageUrl(previousUrl);
    }
  } catch (error) {
    console.error(label + " yüklenemedi:",error);
    setProfileUploadStatus(
      statusId,
      profileUploadErrorText(error),
      "is-error"
    );
  }
}

async function clearProfileHeroMedia(fieldName) {
  if(!currentAccount?.institutionId || !fieldName)return;

  const fieldConfig={
    panorama360Url:{
      inputId:"profilePanorama360Url",
      statusId:"profilePanorama360UploadStatus",
      emptyText:"360° görüntü kaldırıldı."
    },
    locationVideoUrl:{
      inputId:"profileVideoUrl",
      statusId:"profileVideoUploadStatus",
      emptyText:"Video kaldırıldı."
    },
    virtualTourUrl:{
      inputId:"profileVirtualTourUrl",
      statusId:"",
      emptyText:"360° sanal tur bağlantısı kaldırıldı."
    }
  };

  const config=fieldConfig[fieldName];
  if(!config)return;

  const previous=safeProfileUrl(currentInstitution?.[fieldName] || "");

  try{
    await db.collection("institutions")
      .doc(currentAccount.institutionId)
      .update({
        [fieldName]:"",
        updatedAt:new Date().toISOString()
      });

    currentInstitution[fieldName]="";

    const input=document.getElementById(config.inputId);
    if(input)input.value="";

    renderProfileMediaPreview();
    updateShowcaseServiceStatus();

    if(config.statusId){
      setProfileUploadStatus(config.statusId,config.emptyText,"");
    }else{
      showToast(config.emptyText);
    }

    if(previous)deleteOwnProfileStorageUrl(previous);
  }catch(error){
    console.error("Profil medyası kaldırılamadı:",error);
    showToast("Medya kaldırılamadı.");
  }
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
  return error?.message || "Medya yüklenemedi.";
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

  const panoramaUrl=safeProfileUrl(
    document.getElementById("profilePanorama360Url")?.value
  );
  const videoUrl=safeProfileUrl(
    document.getElementById("profileVideoUrl")?.value
  );
  const tourUrl=safeProfileUrl(
    document.getElementById("profileVirtualTourUrl")?.value
  );

  const panoramaCurrent=document.getElementById("profilePanorama360Current");
  const videoCurrent=document.getElementById("profileVideoCurrent");
  const tourCurrent=document.getElementById("profileVirtualTourCurrent");

  panoramaCurrent?.classList.toggle("hidden",!panoramaUrl);
  videoCurrent?.classList.toggle("hidden",!videoUrl);
  tourCurrent?.classList.toggle("hidden",!tourUrl);

  if(panoramaUrl){
    const status=document.getElementById("profilePanorama360UploadStatus");
    if(status && !status.classList.contains("is-uploading")){
      status.textContent="✓ 360° görüntü hazır · kurum sayfasının üstünde kullanılacak.";
    }
  }

  if(videoUrl){
    const status=document.getElementById("profileVideoUploadStatus");
    if(status && !status.classList.contains("is-uploading")){
      status.textContent="✓ Video hazır · üst alanda otomatik oynatılacak.";
    }
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

document.getElementById("profileVisualShortcut")?.addEventListener("click", () => {
  setPanelTab("profile");

  requestAnimationFrame(() => {
    const section = document.getElementById("profileVisualSection");
    if (!section) return;

    section.scrollIntoView({ behavior:"smooth", block:"start" });
    section.classList.add("visual-section-focus");

    window.setTimeout(() => {
      section.classList.remove("visual-section-focus");
    }, 1800);
  });
});

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
  const panorama360=String(institution.panorama360Url || "").trim();
  const virtualTour=String(institution.virtualTourUrl || institution.tour360Url || institution.tourUrl || "").trim();
  const adStatus=String(institution.adStatus || "none");
  const adEndAt=String(institution.adEndAt || "");
  const adEnd=adEndAt ? new Date(adEndAt.length<=10 ? adEndAt+"T23:59:59" : adEndAt) : null;
  const adExpired=Boolean(adEnd && !Number.isNaN(adEnd.getTime()) && adEnd.getTime()<Date.now());
  const adActive=adStatus==="active" && !adExpired;

  return {
    locationVideo,
    panorama360,
    virtualTour,
    hasLocationVideo:Boolean(locationVideo),
    hasVirtualTour:Boolean(panorama360 || virtualTour),
    adStatus,
    adActive,
    adExpired,
    adPackage:String(institution.adPackage || ""),
    hasBanner:Boolean(institution.adBannerUrl || institution.bannerUrl || institution.campaignBannerUrl)
  };
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

  const adNode=document.getElementById("showcaseAdStatus");
  if(adNode){
    adNode.classList.remove("active","missing");
    if(state.adActive){
      const packageLabels={
        starter:"Başlangıç Görünürlüğü",
        regional:"Bölgesel Vitrin",
        video:"Video Tanıtım",
        premium:"Premium Tanıtım"
      };
      adNode.textContent="✓ Aktif"+(state.adPackage ? " · "+(packageLabels[state.adPackage]||state.adPackage) : "");
      adNode.classList.add("active");
    }else if(state.adExpired){
      adNode.textContent="Süresi doldu";
      adNode.classList.add("missing");
    }else if(state.adStatus==="paused"){
      adNode.textContent="Duraklatıldı";
      adNode.classList.add("missing");
    }else{
      adNode.textContent="Aktif reklam yok";
      adNode.classList.add("missing");
    }
  }

  renderShowcaseRecommendations(state);
}

function renderShowcaseRecommendations(state=getShowcaseServiceState()) {
  const list=document.getElementById("showcaseRecommendationList");
  const score=document.getElementById("showcaseRecommendationScore");
  if(!list)return;

  const institution=currentInstitution || {};
  const profileReady=[
    institution.name,
    institution.phone,
    institution.address,
    institution.description,
    institution.logoUrl,
    institution.coverUrl
  ].filter(value=>String(value||"").trim()).length;

  const rows=[];

  if(!state.hasLocationVideo){
    rows.push({
      status:"missing",
      icon:"▶",
      title:"Konum Videosu ekleyin",
      text:"Müşteriye işletmenize nasıl ulaşacağını görsel olarak anlatın.",
      action:"location",
      button:"Konum Videosu"
    });
  }else{
    rows.push({status:"done",icon:"✓",title:"Konum Videosu aktif",text:"Kurum sayfanızda müşterilere gösteriliyor."});
  }

  if(!state.hasVirtualTour){
    rows.push({
      status:"missing",
      icon:"360°",
      title:"360° Sanal Tur ekleyin",
      text:"Müşterinin mekana gelmeden önce içeriyi gezmesini sağlayın.",
      action:"tour",
      button:"360° Tur"
    });
  }else{
    rows.push({status:"done",icon:"✓",title:"360° Sanal Tur aktif",text:"Kurum sayfanızda mekan deneyimi sunuluyor."});
  }

  if(!state.adActive){
    rows.push({
      status:"opportunity",
      icon:"⌂",
      title:"Dijiyer içi görünürlüğünüzü artırın",
      text:"Ana sayfa, şehir veya kategori vitrinlerinden birini değerlendirebilirsiniz.",
      action:"homepage",
      button:"Reklam Seçenekleri"
    });
  }else{
    rows.push({status:"done",icon:"✓",title:"Dijiyer reklamınız aktif",text:"Sponsorlu görünürlük alanınız şu anda yayında."});
  }

  if(!state.hasBanner){
    rows.push({
      status:"opportunity",
      icon:"▣",
      title:"Reklam bannerı hazırlatın",
      text:"Kampanyanız veya kurumunuz için Dijiyer reklam alanlarına uygun tasarım hazırlatabilirsiniz.",
      action:"bannerDesign",
      button:"Banner Tasarımı"
    });
  }

  if(profileReady<5){
    rows.push({
      status:"profile",
      icon:"🏢",
      title:"Kurum profilinizi tamamlayın",
      text:"Logo, kapak, açıklama ve iletişim bilgileri reklamdan gelen ziyaretin daha verimli olmasına yardımcı olur.",
      action:"profile",
      button:"Profili Tamamla"
    });
  }

  const completed=[state.hasLocationVideo,state.hasVirtualTour,state.adActive,state.hasBanner,profileReady>=5].filter(Boolean).length;
  if(score) score.textContent=completed+"/5 alan aktif";

  list.innerHTML=rows.map(row=>`
    <article class="showcase-recommendation-item ${row.status}">
      <span class="recommendation-icon">${row.icon}</span>
      <div>
        <strong>${escapeHtml(row.title)}</strong>
        <small>${escapeHtml(row.text)}</small>
      </div>
      ${row.action ? '<button type="button" data-recommendation-action="'+escapeHtml(row.action)+'">'+escapeHtml(row.button)+'</button>' : '<span class="recommendation-done">Aktif</span>'}
    </article>
  `).join("");
}

const PROMOTION_SERVICES = {
  location:{
    id:"location_video",name:"Konum Tanıtım Videosu",icon:"▶",
    lead:"İşletmenizin konumunu profesyonel videoyla müşteriye anlatın.",
    benefit:"Müşteri adres aramakla uğraşmadan kurumunuza nasıl ulaşacağını görür. Kurum profiliniz ve sosyal medya içerikleriniz daha açıklayıcı hale gelir.",
    includes:["Harita ve rota anlatımı","Kurum adı, adres ve ulaşım bilgileri","Dikey Reels uyumlu video","Dijiyer kurum sayfasında kullanım"],
    process:"Kurum konumu ve rota belirlenir; harita görüntüleri, kurum bilgileri ve görsel anlatım tek videoda birleştirilir.",
    required:"Kurum adresi, logo, telefon, başlangıç noktası tercihi ve varsa kullanılacak kurum fotoğraf/video içerikleri.",
    delivery:"Ortalama 2–4 iş günü",revision:"1 revizyon",
    price:750,priceLabel:"750 TL'den başlayan fiyatlarla",
    extras:["Video sonuna özel kampanya ekranı","Hazır kurum videonuzu ekleme","Ek sosyal medya ölçüsü"],
    example:"Harita üzerinde kuruma yaklaşan rota, bina/işletme görünümü ve kısa adres anlatımı."
  },
  tour:{
    id:"virtual_tour",name:"360° Sanal Tur",icon:"360°",
    lead:"Müşteriniz işletmenize gelmeden önce mekanınızı çevrimiçi gezsin.",
    benefit:"Mekanınızı daha şeffaf gösterir; sınıf, oda, salon veya işletme alanları hakkında müşterinin önceden fikir edinmesini sağlar.",
    includes:["Gezilebilir 360° tur","QR / NFC ile açılabilir bağlantı","Kurum sayfasına ekleme desteği","Web sitesinde kullanılabilir bağlantı"],
    process:"Mekan uygun noktalardan 360° çekilir, sahneler birbirine bağlanır ve gezilebilir tur hazırlanır.",
    required:"Çekim için uygun gün/saat, mekan erişimi ve turda gösterilecek alanların belirlenmesi.",
    delivery:"Çekim sonrası ortalama 3–7 iş günü",revision:"1 düzenleme turu",
    price:0,priceLabel:"Mekan büyüklüğüne göre fiyatlandırılır",
    extras:["Ek kat / bölüm","Özel bilgi noktaları","Web sitesi yerleştirme desteği"],
    example:"Girişten sınıflara veya salonlara geçilebilen, telefonda ve bilgisayarda açılan 360° tur."
  },
  reels:{
    id:"reels_video",name:"Reels Tanıtım Videosu",icon:"▸",
    lead:"Kurumunuzu kısa ve dikkat çekici bir videoyla anlatın.",
    benefit:"Hizmetinizi sosyal medyada daha hızlı anlatır ve müşterinin kurumunuzu birkaç saniye içinde anlamasını sağlar.",
    includes:["Dikey 1080×1920 video","Kurgu ve hareketli yazılar","Müzik veya seslendirme seçeneği","Kuruma özel çağrı mesajı"],
    process:"İçerik, kampanya veya hizmet bilgisi alınır; metin ve görseller kısa video akışına dönüştürülür.",
    required:"Logo, kullanılacak görseller/videolar, hizmet veya kampanya bilgileri.",
    delivery:"Ortalama 2–4 iş günü",revision:"1 revizyon",
    price:0,priceLabel:"İçerik kapsamına göre fiyatlandırılır",
    extras:["Profesyonel seslendirme","Ek video süresi","Farklı ölçüde ikinci versiyon"],
    example:"15–30 saniyelik, hizmet başlıkları ve çağrı mesajı içeren dikey tanıtım videosu."
  },
  bannerDesign:{
    id:"banner_design",name:"Reklam Banner Tasarımı",icon:"▣",
    lead:"Kampanyanızı Dijiyer ve sosyal medya için profesyonel görsele dönüştürün.",
    benefit:"Sponsorlu alanlarda daha düzenli ve güven veren bir görünüm oluşturur.",
    includes:["Markaya uygun tasarım","Dijiyer reklam ölçüsüne uygun çalışma","Kampanya başlığı ve çağrı mesajı"],
    process:"Logo, kampanya metni ve görseller alınır; reklam alanına uygun tasarım hazırlanır.",
    required:"Logo, kampanya/hizmet bilgisi, varsa kullanılacak fotoğraf.",
    delivery:"Ortalama 1–3 iş günü",revision:"1 revizyon",
    price:0,priceLabel:"Tasarıma göre fiyatlandırılır",
    extras:["Ek sosyal medya ölçüsü","Hareketli banner versiyonu"],
    example:"Kurum logosu, kampanya mesajı ve çağrı butonuyla hazırlanmış sponsorlu banner."
  },
  homepage:{id:"homepage_showcase",name:"Premium Ana Sayfa Vitrini",icon:"◆",lead:"Markanızı Dijiyer ana sayfasının en görünür ve en büyük sponsorlu alanında yayınlayın.",benefit:"Ana sayfaya gelen ziyaretçilerin ilk gördüğü reklam alanlarından birinde güçlü marka görünürlüğü ve doğrudan kurum profilinize trafik sağlar.",includes:["Büyük Premium Ana Sayfa Vitrini","Sponsorlu marka görünürlüğü","Kurum sayfasına doğrudan yönlendirme","Yayın süresi ve gösterim takibi"],process:"Yayın süresi ve kampanya amacı alınır; görsel/banner kontrol edilir, yayın planı hazırlanır ve onayınız sonrası vitrine alınır.",required:"Logo, kampanya başlığı, kısa tanıtım metni ve varsa reklam görseli/banner.",delivery:"Onay sonrası planlanan tarihte",revision:"Yayın öncesi 1 içerik kontrolü",price:0,priceLabel:"Yayın süresi ve kampanyaya göre fiyatlandırılır",extras:["Banner tasarımı","Video içerik"],example:"Dijiyer ana sayfasında geniş Premium Sponsorlu alan içinde marka görseli, kampanya mesajı ve 'İncele' çağrısı."},
  regionalAd:{id:"regional_showcase",name:"Şehir / İlçe Vitrini",icon:"📍",lead:"Belirli şehir veya ilçede kurum arayan müşterilere sponsorlu olarak görünün.",benefit:"Reklamı hizmet verdiğiniz bölgeyle sınırlandırarak daha ilgili kullanıcıya ulaşmanızı sağlar.",includes:["Şehir/ilçe sponsorlu alanı","Kurum sayfasına yönlendirme","Yayın süresi takibi"],process:"Hedef bölge ve yayın süresi seçilir; uygun reklam alanı planlanır.",required:"Hedef şehir/ilçe, logo ve kısa tanıtım metni.",delivery:"Onay sonrası planlanan tarihte",revision:"Yayın öncesi içerik kontrolü",price:0,priceLabel:"Bölge ve süreye göre fiyatlandırılır",extras:["Banner tasarımı","Kampanya duyurusu"],example:"Çanakkale / Merkez aramalarında sponsorlu kurum görünümü."},
  categoryAd:{id:"category_showcase",name:"Kategori Vitrini",icon:"🏷️",lead:"Hizmetinizi arayan kullanıcıların karşısına sponsorlu kurum olarak çıkın.",benefit:"Reklamınızı genel kitle yerine doğrudan sektörünüzü inceleyen kullanıcılara gösterir.",includes:["Kategori sponsorlu alanı","Kurum sayfasına yönlendirme","Sponsorlu etiketi"],process:"Kurum kategorisi doğrulanır ve uygun yayın dönemi belirlenir.",required:"Logo ve kısa kurum tanıtımı.",delivery:"Onay sonrası planlanan tarihte",revision:"Yayın öncesi içerik kontrolü",price:0,priceLabel:"Kategori ve süreye göre fiyatlandırılır",extras:["Banner tasarımı"],example:"Sürücü kursları kategorisinde sponsorlu kurum kartı."},
  bannerAd:{id:"banner_ad",name:"Dijiyer Banner Reklamı",icon:"▰",lead:"Kampanyanızı Dijiyer içindeki banner alanlarında yayınlayın.",benefit:"Kayıt, indirim ve dönemsel kampanyalarınıza ek görünürlük sağlar.",includes:["Dijiyer banner alanı","Tıklamada kurum profiline yönlendirme","Yayın süresi takibi"],process:"Banner kontrol edilir veya tasarlanır, alan ve tarih planlanır.",required:"Hazır banner veya tasarım için logo ve kampanya bilgisi.",delivery:"Onay sonrası planlanan tarihte",revision:"Yayın öncesi 1 kontrol",price:0,priceLabel:"Alan ve süreye göre fiyatlandırılır",extras:["Banner tasarımı","Hareketli banner"],example:"Dijiyer sayfasında kampanya görselinin sponsorlu banner olarak yayınlanması."},
  campaign:{id:"campaign_announcement",name:"Kampanya Duyurusu",icon:"📣",lead:"Kayıt, indirim veya yeni hizmet duyurunuzu daha görünür hale getirin.",benefit:"Kurum profilinizi ziyaret eden veya ilgili alana bakan müşteriye güncel kampanyanızı anlatır.",includes:["Kampanya duyuru kartı","Kurum sayfasına bağlantı","Yayın dönemi planlama"],process:"Duyuru metni ve tarih bilgisi alınır, yayın alanına göre hazırlanır.",required:"Kampanya metni, başlangıç/bitiş tarihi ve varsa görsel.",delivery:"İçerik onayı sonrası",revision:"1 metin/görsel düzenlemesi",price:0,priceLabel:"Yayın kapsamına göre fiyatlandırılır",extras:["Banner tasarımı","Reels videosu"],example:"'Ekim kayıtları başladı' veya '%20 erken kayıt' duyuru alanı."},
  videoAd:{id:"video_showcase_ad",name:"Video Vitrin Reklamı",icon:"▶",lead:"Kısa tanıtım videonuzu sponsorlu video alanında gösterin.",benefit:"Hareketli içerikle daha fazla dikkat çekerek kurumunuzu hızlı anlatmanızı sağlar.",includes:["Sponsorlu video alanı","Kurum profiline yönlendirme","Yayın süresi takibi"],process:"Video teknik olarak kontrol edilir, yayın alanı ve tarih planlanır.",required:"Hazır video veya video hazırlanacaksa içerik materyalleri.",delivery:"Onay sonrası planlanan tarihte",revision:"Hazır video için teknik kontrol",price:0,priceLabel:"Süre ve alana göre fiyatlandırılır",extras:["Reels video üretimi"],example:"Kısa tanıtım videosunun Dijiyer sponsorlu video alanında gösterilmesi."},
  packageStarter:{id:"package_starter",name:"Başlangıç Görünürlüğü",icon:"★",lead:"Dijiyer reklamını ilk kez deneyecek kurumlar için başlangıç paketi.",benefit:"Tek tasarım ve kategori görünürlüğünü birlikte kullanarak düşük adımla reklam deneyimi başlatır.",includes:["Reklam banner tasarımı","Kategori vitrini"],process:"İçerik hazırlanır ve kategori yayın dönemi planlanır.",required:"Logo, tanıtım metni ve kampanya bilgisi.",delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",price:0,priceLabel:"Paket fiyatı planlamada netleşir",extras:["Ek yayın süresi"],example:"Banner + kategori içinde sponsorlu kurum gösterimi."},
  packageRegional:{id:"package_regional",name:"Bölgesel Görünürlük",icon:"📍",lead:"Bölgesel müşteri arayan kurumlar için içerik + yerel reklam paketi.",benefit:"Şehir/ilçe hedeflemesiyle kampanyanızı yerel kullanıcılara daha görünür kılar.",includes:["Banner tasarımı","Şehir / ilçe vitrini","Kampanya duyurusu"],process:"Bölge ve kampanya planlanır, tasarım hazırlanır ve yayınlanır.",required:"Logo, hedef bölge, kampanya bilgisi.",delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",price:0,priceLabel:"Bölge ve süreye göre paket fiyatı",extras:["Kategori vitrini"],example:"Yerel banner + bölgesel sponsorlu görünürlük + kampanya duyurusu."},
  combo:{id:"location_tour_combo",name:"Dijiyer Mekan Tanıtım Paketi",icon:"360°",lead:"Konum videosu ve 360° sanal turu tek pakette birleştirin.",benefit:"Müşteriye hem size nasıl ulaşacağını hem de mekanda ne göreceğini tek kurum profilinde gösterir.",includes:["Konum Tanıtım Videosu","360° Sanal Tur","Kurum profilinde özel gösterim"],process:"Konum ve mekan çekimi birlikte planlanır, iki içerik hazırlanıp kurum profilinize eklenir.",required:"Kurum adresi, çekim günü, logo ve mekan erişimi.",delivery:"Çekim sonrası ortalama 5–10 iş günü",revision:"1 düzenleme turu",price:0,priceLabel:"Mekan ve çekim kapsamına göre fiyatlandırılır",extras:["Reels tanıtım videosu","QR/NFC yönlendirme"],example:"Profilde 'Konum Videosu' ve '360° Sanal Tur' alanlarının birlikte aktif olması."},
  packagePlus:{id:"package_plus",name:"Görünürlük Plus",icon:"＋",lead:"İçerik üretimiyle ana sayfa görünürlüğünü birleştiren paket.",benefit:"Hazırlanan tanıtım içeriğini aynı zamanda sponsorlu görünürlükle destekler.",includes:["Konum Videosu","Banner tasarımı","Ana Sayfa Vitrini"],process:"İçerikler hazırlanır ve sponsorlu yayın dönemi planlanır.",required:"Logo, adres, kurum bilgileri ve kampanya mesajı.",delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",price:0,priceLabel:"Paket kapsamına göre fiyatlandırılır",extras:["Kategori vitrini"],example:"Konum videosu + banner + ana sayfa sponsorlu vitrin."},
  packagePremium:{id:"package_premium",name:"Premium Tanıtım",icon:"◆",lead:"İçerik ve Dijiyer görünürlüğünü kapsamlı bir pakette birleştirin.",benefit:"Kurum profilinizde güçlü içerik oluştururken farklı sponsorlu alanlarda görünürlüğünüzü artırır.",includes:["Konum Videosu + 360° Tur","Ana Sayfa Vitrini","Kategori Vitrini","Şehir / İlçe Vitrini"],process:"Çekim, tasarım ve reklam yayını tek plan altında hazırlanır.",required:"Kurum bilgileri, çekim erişimi, hedef bölge ve kampanya amacı.",delivery:"Kapsama göre planlanır",revision:"İçeriklerde 1 revizyon",price:0,priceLabel:"Kapsama özel paket fiyatı",extras:["Reels video","Kampanya duyurusu"],example:"İçerik üretimi + çoklu sponsorlu görünürlük planı."},
  consultation:{id:"promotion_consultation",name:"Tanıtım Planlama Görüşmesi",icon:"?",lead:"Kurumunuz için hangi tanıtım hizmetinin daha uygun olduğunu birlikte belirleyin.",benefit:"Gereksiz hizmet almadan kurumunuzun eksik görünürlük alanlarına göre plan oluşturmanızı sağlar.",includes:["Profil değerlendirmesi","Hizmet önerisi","Kısa tanıtım planı"],process:"Kurum profiliniz ve hedefiniz incelenir, uygun hizmetler belirlenir.",required:"Tanıtım hedefiniz ve öncelikli hizmetiniz.",delivery:"Planlanan görüşme zamanı",revision:"-",price:0,priceLabel:"Ücretsiz ön değerlendirme",extras:[],example:"Kurum profilinizde eksik olan tanıtım alanlarına göre hizmet önerisi."}
};

let activePromotionServiceKey="";
let promotionOrdersUnsubscribe=null;
let promotionPackagesUnsubscribe=null;
let promotionOrderRecords=[];
let promotionPackageRecords=[];
const dynamicPromotionServices={};

function promotionStatusLabel(status){
  return {
    new:"Yeni Sipariş",
    contacting:"Görüşülüyor",
    preparing:"Hazırlanıyor",
    approval:"Onay Bekliyor",
    completed:"Tamamlandı"
  }[status] || "Yeni Sipariş";
}

function promotionStatusStep(status){
  return {new:1,contacting:2,preparing:3,approval:4,completed:5}[status] || 1;
}

function makePromotionOrderCode(){
  return "DJY-H-" + String(Date.now()).slice(-6);
}

function normalizePromotionExtras(service){
  return (Array.isArray(service?.extras)?service.extras:[])
    .map(item=>typeof item==="string" ? {name:item,price:0} : {
      name:String(item?.name||"").trim(),
      price:Math.max(0,Number(item?.price||0))
    })
    .filter(item=>item.name);
}

const PROMOTION_AD_SERVICE_KEYS = new Set([
  "homepage","regionalAd","categoryAd","bannerAd","campaign"
]);

function isPromotionAdvertisingService(key){
  return PROMOTION_AD_SERVICE_KEYS.has(String(key||""));
}

function promotionInstitutionLocation(){
  return [currentInstitution?.city,currentInstitution?.district]
    .filter(Boolean)
    .join(" / ");
}

function promotionInstitutionCategory(){
  return String(
    currentInstitution?.categoryLabel ||
    currentInstitution?.subCategory ||
    currentInstitution?.category ||
    currentInstitution?.mainCategory ||
    ""
  ).trim();
}

function setPromotionOrderPlanDefaults(serviceKey){
  const section=document.getElementById("promotionAdPlanSection");
  const targetInput=document.getElementById("promotionOrderAdTarget");
  const targetLabel=document.getElementById("promotionOrderTargetLabel");
  const objective=document.getElementById("promotionOrderObjective");
  const duration=document.getElementById("promotionOrderDuration");
  const startDate=document.getElementById("promotionOrderStartDate");
  const campaignTitle=document.getElementById("promotionOrderCampaignTitle");

  const isAd=isPromotionAdvertisingService(serviceKey);
  section?.classList.toggle("hidden",!isAd);

  if(!isAd)return;

  if(objective)objective.value="Kurum görünürlüğü";
  if(duration)duration.value="30 gün";
  if(startDate)startDate.value="";
  if(campaignTitle)campaignTitle.value="";

  let target="";
  let label="Hedef Bölge / Kitle";

  if(serviceKey==="homepage"){
    target="Tüm Dijiyer ana sayfa ziyaretçileri";
    label="Hedef Kitle";
  }else if(serviceKey==="categoryAd"){
    target=promotionInstitutionCategory();
    label="Hedef Kategori";
  }else{
    target=promotionInstitutionLocation();
    label="Hedef Bölge";
  }

  if(targetInput)targetInput.value=target;
  if(targetLabel){
    const input=targetLabel.querySelector("input");
    targetLabel.childNodes[0].nodeValue=label+" ";
    if(input)targetLabel.appendChild(input);
  }
}

function promotionOrderPlanExtras(){
  if(!isPromotionAdvertisingService(activePromotionServiceKey))return [];

  const values=[
    ["Reklam amacı",document.getElementById("promotionOrderObjective")?.value],
    ["Yayın süresi",document.getElementById("promotionOrderDuration")?.value],
    ["Tercih edilen başlangıç",document.getElementById("promotionOrderStartDate")?.value],
    ["Hedef",document.getElementById("promotionOrderAdTarget")?.value],
    ["Kampanya başlığı",document.getElementById("promotionOrderCampaignTitle")?.value]
  ];

  return values
    .map(([label,value])=>[label,String(value||"").trim()])
    .filter(([,value])=>value)
    .map(([label,value])=>label+": "+value);
}

function updatePromotionOrderPricePreview(service){
  const price=document.getElementById("promotionOrderPrice");
  const label=document.getElementById("promotionOrderPriceLabel");
  const hint=document.getElementById("promotionOrderPriceHint");
  if(!price||!label||!hint)return;

  const base=Math.max(0,Number(service?.price||0));
  const selectedExtraTotal=[...document.querySelectorAll("#promotionOrderExtras input:checked")]
    .reduce((sum,input)=>sum+Math.max(0,Number(input.dataset.extraPrice||0)),0);

  if(base>0){
    const total=base+selectedExtraTotal;
    label.textContent=selectedExtraTotal>0 ? "Tahmini toplam" : "Paket fiyatı";
    price.textContent=new Intl.NumberFormat("tr-TR").format(total)+" TL";
    hint.textContent=selectedExtraTotal>0
      ? "Seçtiğiniz ücretli ek hizmetler dahil."
      : "Ek hizmet seçerseniz toplam güncellenir.";
    return;
  }

  label.textContent="Fiyatlandırma";
  price.textContent=service?.priceLabel||"Planlamada netleşir";
  hint.textContent=isPromotionAdvertisingService(activePromotionServiceKey)
    ? "Yayın süresi, hedef ve reklam içeriğine göre netleştirilir."
    : "Kapsam netleştirildikten sonra kesin fiyat paylaşılır.";
}

function getPromotionConfig(type){
  return dynamicPromotionServices[type] || PROMOTION_SERVICES[type] || PROMOTION_SERVICES.consultation;
}

function dynamicPromotionConfig(record){
  return {
    id:"promotion_package_"+record.id,
    packageId:record.id,
    name:record.name||"Tanıtım Paketi",
    icon:record.featured?"★":"▦",
    lead:record.description||"",
    benefit:record.benefit||record.description||"",
    includes:Array.isArray(record.includes)?record.includes:[],
    process:record.process||"Paket içeriği ve yayın/üretim planı sipariş sonrasında netleştirilir.",
    required:record.required||"Kurum bilgileri ve pakette kullanılacak içerikler.",
    delivery:record.delivery||record.duration||"Planlamaya göre",
    revision:record.revision||"Planlamaya göre",
    price:Number(record.basePrice||0),
    priceLabel:record.priceLabel || (Number(record.basePrice||0)>0
      ? new Intl.NumberFormat("tr-TR").format(Number(record.basePrice))+" TL"
      : "Fiyat planlamada netleşir"),
    extras:normalizePromotionExtras(record),
    example:record.example||"Paket kapsamındaki hizmetler kurumunuz için birlikte planlanır."
  };
}

function renderDynamicPromotionPackages(records,hasCatalog){
  const root=document.getElementById("showcasePackageGrid");
  if(!root)return;

  Object.keys(dynamicPromotionServices).forEach(key=>delete dynamicPromotionServices[key]);

  if(!hasCatalog)return;

  const active=records
    .filter(item=>item.active!==false)
    .sort((a,b)=>(Number(a.sortOrder||50)-Number(b.sortOrder||50)));

  active.forEach(item=>{
    dynamicPromotionServices[item.serviceKey]=dynamicPromotionConfig(item);
  });

  if(!active.length){
    root.innerHTML='<div class="showcase-recommendation-loading">Şu anda yayında reklam paketi bulunmuyor.</div>';
    return;
  }

  root.innerHTML=active.map(item=>{
    const cfg=dynamicPromotionServices[item.serviceKey];
    const classes=["showcase-package-card"];
    if(item.featured)classes.push("recommended");
    if(String(item.badge||"").toLocaleUpperCase("tr-TR").includes("PREMIUM"))classes.push("premium");

    return `
      <article class="${classes.join(" ")}">
        ${item.featured?'<span class="package-recommended">ÖNERİLEN</span>':""}
        <span class="package-type">${escapeHtml(item.badge||"PAKET")}</span>
        <h4>${escapeHtml(item.name||"Tanıtım Paketi")}</h4>
        <p>${escapeHtml(item.description||"")}</p>
        <ul>${(item.includes||[]).map(x=>'<li>'+escapeHtml(x)+'</li>').join("")}</ul>
        <div class="dynamic-package-price">${escapeHtml(cfg.priceLabel)}</div>
        <div class="showcase-sales-actions">
          <button type="button" class="showcase-detail-btn" data-promotion-detail="${escapeHtml(item.serviceKey)}">Detaylı Bilgi</button>
          <button type="button" class="showcase-order-btn" data-promotion-order="${escapeHtml(item.serviceKey)}">Sipariş Ver</button>
        </div>
      </article>
    `;
  }).join("");
}

function startPromotionPackagesWatcher(){
  if(promotionPackagesUnsubscribe)promotionPackagesUnsubscribe();

  promotionPackagesUnsubscribe=db.collection("promotionPackages").onSnapshot(snapshot=>{
    promotionPackageRecords=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
    renderDynamicPromotionPackages(promotionPackageRecords,!snapshot.empty);
  },error=>{
    console.error("Reklam paketleri yüklenemedi:",error);
  });
}

function openPromotionDetail(type){
  closePromotionOrder();
  const service=getPromotionConfig(type);
  activePromotionServiceKey=dynamicPromotionServices[type]
    ? type
    : (type in PROMOTION_SERVICES ? type : "consultation");

  document.getElementById("promotionDetailIcon").textContent=service.icon;
  document.getElementById("promotionDetailName").textContent=service.name;
  document.getElementById("promotionDetailLead").textContent=service.lead;
  document.getElementById("promotionDetailBenefit").textContent=service.benefit;
  document.getElementById("promotionDetailIncludes").innerHTML=
    service.includes.map(item=>"<li>"+escapeHtml(item)+"</li>").join("");
  document.getElementById("promotionDetailProcess").textContent=service.process;
  document.getElementById("promotionDetailRequired").textContent=service.required;
  document.getElementById("promotionDetailDelivery").textContent=service.delivery;
  document.getElementById("promotionDetailRevision").textContent=service.revision;
  document.getElementById("promotionDetailPrice").textContent=service.priceLabel;
  const detailExtras=normalizePromotionExtras(service);
  document.getElementById("promotionDetailExtras").textContent=
    detailExtras.length
      ? detailExtras.map(item=>item.name+(item.price>0?" (+"+new Intl.NumberFormat("tr-TR").format(item.price)+" TL)":"")).join(" · ")
      : "Ek seçenek bulunmuyor.";
  document.getElementById("promotionDetailExample").textContent=service.example;

  document.getElementById("promotionDetailModal").classList.remove("hidden");
}

function closePromotionDetail(){
  document.getElementById("promotionDetailModal")?.classList.add("hidden");
}

function openPromotionOrder(type){
  const service=getPromotionConfig(type);
  activePromotionServiceKey=dynamicPromotionServices[type]
    ? type
    : (type in PROMOTION_SERVICES ? type : "consultation");

  closePromotionDetail();

  const formView=document.getElementById("promotionOrderFormView");
  const successView=document.getElementById("promotionOrderSuccess");
  const modal=document.getElementById("promotionOrderModal");
  const card=modal?.querySelector(".promotion-order-card");
  const isAd=isPromotionAdvertisingService(activePromotionServiceKey);

  formView?.classList.remove("hidden");
  successView?.classList.add("hidden");
  card?.classList.toggle("advertising-order",isAd);

  document.getElementById("promotionOrderMessage").textContent="";
  document.getElementById("promotionOrderBadge").textContent=
    isAd ? "REKLAM SİPARİŞİ" : "DOĞRUDAN SİPARİŞ";
  document.getElementById("promotionOrderTitle").textContent=service.name+" Siparişi";
  document.getElementById("promotionOrderLead").textContent=
    isAd
      ? "Yayın tercihinizi belirleyin. Siparişiniz reklam planlaması için doğrudan Dijiyer yönetimine ulaşsın."
      : "Hizmet bilgilerinizi tamamlayın; siparişiniz yönetim paneline düşsün.";
  document.getElementById("promotionOrderTargetIcon").textContent=
    isAd ? service.icon || "📣" : "🏢";
  document.getElementById("promotionOrderInstitution").textContent=
    currentInstitution?.name || currentAccount?.institutionName || "Kurum";
  document.getElementById("promotionOrderService").textContent=service.name;
  document.getElementById("promotionOrderPhone").value=
    currentInstitution?.phone || currentInstitution?.whatsapp || "";

  document.getElementById("promotionOrderSubmit").textContent=
    isAd ? "Reklam Siparişini Oluştur" : "Siparişi Oluştur";
  document.getElementById("promotionOrderInfoNote").textContent=
    isAd
      ? "Sipariş oluşturmak anında ödeme alındığı anlamına gelmez. Yayın süresi, fiyat ve reklam içeriği netleştirildikten sonra onayınızla yayına alınır."
      : "Sipariş oluşturmak anında ödeme alındığı anlamına gelmez. Fiyat ve kapsam netleştikten sonra süreç başlatılır.";

  setPromotionOrderPlanDefaults(activePromotionServiceKey);

  const wrap=document.getElementById("promotionOrderExtrasWrap");
  const extras=document.getElementById("promotionOrderExtras");
  const serviceExtras=normalizePromotionExtras(service);

  if(serviceExtras.length){
    wrap.classList.remove("hidden");
    extras.innerHTML=serviceExtras.map(item=>`
      <label>
        <input type="checkbox" value="${escapeHtml(item.name)}" data-extra-price="${Number(item.price||0)}">
        <span>
          <b>${escapeHtml(item.name)}</b>
          ${item.price>0?'<small>+'+new Intl.NumberFormat("tr-TR").format(item.price)+' TL</small>':""}
        </span>
      </label>
    `).join("");

    extras.querySelectorAll("input").forEach(input=>{
      input.addEventListener("change",()=>updatePromotionOrderPricePreview(service));
    });
  }else{
    wrap.classList.add("hidden");
    extras.innerHTML="";
  }

  updatePromotionOrderPricePreview(service);
  modal?.classList.remove("hidden");
}

function closePromotionOrder(){
  document.getElementById("promotionOrderModal")?.classList.add("hidden");
}

function openShowcaseRequest(type) {
  if(type==="profile"){
    setPanelTab("profile");
    return;
  }
  openPromotionDetail(type);
}

function setupShowcaseSalesActions(){
  document.querySelectorAll(
    ".showcase-service-card [data-showcase-request], .showcase-ad-card [data-showcase-request], .showcase-package-card [data-showcase-request]"
  ).forEach(button=>{
    const type=button.dataset.showcaseRequest||"consultation";
    if(button.closest(".showcase-sales-actions"))return;

    const actions=document.createElement("div");
    actions.className="showcase-sales-actions";
    actions.innerHTML=`
      <button type="button" class="showcase-detail-btn" data-promotion-detail="${escapeHtml(type)}">Detaylı Bilgi</button>
      <button type="button" class="showcase-order-btn" data-promotion-order="${escapeHtml(type)}">Sipariş Ver</button>
    `;
    button.replaceWith(actions);
  });

  const finalCta=document.querySelector(".showcase-final-cta [data-showcase-request]");
  if(finalCta){
    finalCta.textContent="Detaylı Bilgi";
    finalCta.dataset.promotionDetail=finalCta.dataset.showcaseRequest||"consultation";
    delete finalCta.dataset.showcaseRequest;
  }
}

async function submitPromotionOrder(event){
  event.preventDefault();
  if(!currentUser||!currentAccount?.institutionId||!currentInstitution)return;

  const service=getPromotionConfig(activePromotionServiceKey);
  const contact=String(document.getElementById("promotionOrderContact").value||"").trim();
  const phone=String(document.getElementById("promotionOrderPhone").value||"").trim();
  const note=String(document.getElementById("promotionOrderNote").value||"").trim();
  const selectedExtras=[...document.querySelectorAll("#promotionOrderExtras input:checked")]
    .map(input=>input.value);
  const extras=[
    ...promotionOrderPlanExtras(),
    ...selectedExtras
  ];

  if(!contact){
    document.getElementById("promotionOrderMessage").textContent="Yetkili kişi adını yazın.";
    return;
  }
  if(String(phone).replace(/\D/g,"").length<10){
    document.getElementById("promotionOrderMessage").textContent="Geçerli bir telefon numarası yazın.";
    return;
  }

  const submit=document.getElementById("promotionOrderSubmit");
  const oldText=submit.textContent;
  submit.disabled=true;
  submit.textContent="Sipariş oluşturuluyor...";

  const now=new Date().toISOString();
  const orderCode=makePromotionOrderCode();

  try{
    await db.collection("promotionOrders").add({
      orderCode,
      institutionId:String(currentAccount.institutionId),
      userId:String(currentUser.uid),
      institutionName:String(currentInstitution.name||currentAccount.institutionName||"Kurum"),
      serviceId:String(service.id),
      serviceKey:String(activePromotionServiceKey),
      serviceName:String(service.name),
      price:Number(service.price||0),
      priceLabel:String(service.priceLabel||""),
      contactName:contact,
      phone,
      note,
      extras,
      status:"new",
      paymentStatus:"pending",
      createdAt:now,
      updatedAt:now
    });

    document.getElementById("promotionOrderFormView").classList.add("hidden");
    document.getElementById("promotionOrderSuccess").classList.remove("hidden");
    document.getElementById("promotionOrderSuccessCode").textContent=orderCode;
    event.target.reset();
  }catch(error){
    console.error("Tanıtım siparişi oluşturulamadı:",error);
    document.getElementById("promotionOrderMessage").textContent=
      String(error?.code||"").includes("permission-denied")
        ? "Sipariş kaydedilemedi. promotionOrders Firestore kuralını yayınlayın."
        : "Sipariş kaydedilemedi. Lütfen tekrar deneyin.";
  }finally{
    submit.disabled=false;
    submit.textContent=oldText;
  }
}

function renderPromotionOrders(){
  const root=document.getElementById("promotionOrdersList");
  const count=document.getElementById("promotionOrderCount");
  if(!root)return;

  if(count)count.textContent=promotionOrderRecords.length+" sipariş";

  if(!promotionOrderRecords.length){
    root.innerHTML='<div class="promotion-orders-empty">Henüz tanıtım siparişiniz yok. Yukarıdaki hizmetlerden doğrudan sipariş verebilirsiniz.</div>';
    return;
  }

  root.innerHTML=promotionOrderRecords.map(order=>{
    const step=promotionStatusStep(order.status);
    const config=getPromotionConfig(order.serviceKey||"consultation");
    const breakdown=order.priceBreakdown||{};
    const total=Number(breakdown.total ?? order.price ?? 0);
    const extraItems=Array.isArray(breakdown.extraItems)?breakdown.extraItems:[];
    const scope=order.scopeDescription||config.lead||"";
    const publicNote=order.publicNote||order.adminNote||"";

    return `
      <article class="promotion-order-row promotion-order-row-v2">
        <div class="promotion-order-row-head">
          <div>
            <span class="promotion-order-code">${escapeHtml(order.orderCode||"-")}</span>
            <strong>${escapeHtml(order.serviceName||"Tanıtım Hizmeti")}</strong>
            <small>${formatDate(order.createdAt)}</small>
          </div>
          <span class="promotion-order-state state-${escapeHtml(order.status||"new")}">${escapeHtml(promotionStatusLabel(order.status))}</span>
        </div>

        <div class="promotion-order-progress" aria-label="Sipariş ilerleme durumu">
          ${["Yeni","Görüşülüyor","Hazırlanıyor","Onay","Tamamlandı"].map((label,index)=>`
            <span class="${index+1<=step?"active":""}"><i></i><b>${label}</b></span>
          `).join("")}
        </div>

        <div class="promotion-order-scope">
          <span>SİPARİŞ KAPSAMI</span>
          <p>${escapeHtml(scope)}</p>
          ${Array.isArray(config.includes)&&config.includes.length ? `
            <div>${config.includes.map(item=>'<small>✓ '+escapeHtml(item)+'</small>').join("")}</div>
          `:""}
        </div>

        ${total>0 ? `
          <div class="promotion-customer-pricing">
            <div><span>Ana Hizmet</span><b>${new Intl.NumberFormat("tr-TR").format(Number(breakdown.basePrice||0))} TL</b></div>
            ${extraItems.map(item=>`
              <div><span>${escapeHtml(item.name||"Ek Hizmet")}</span><b>${new Intl.NumberFormat("tr-TR").format(Number(item.price||0))} TL</b></div>
            `).join("")}
            ${Number(breakdown.discount||0)>0 ? `<div class="discount"><span>İndirim</span><b>-${new Intl.NumberFormat("tr-TR").format(Number(breakdown.discount))} TL</b></div>`:""}
            <div class="total"><span>Toplam</span><strong>${new Intl.NumberFormat("tr-TR").format(total)} TL</strong></div>
          </div>
        ` : `
          <div class="promotion-price-pending">Fiyat yönetim tarafından netleştiriliyor.</div>
        `}

        <div class="promotion-order-row-meta">
          <span>Ödeme <b>${order.paymentStatus==="paid"?"Ödendi":"Bekliyor"}</b></span>
          ${order.note?'<span class="promotion-order-note">Sipariş Notu <b>'+escapeHtml(order.note)+'</b></span>':""}
          ${publicNote?'<span class="promotion-order-note admin-update">Dijiyer Açıklaması <b>'+escapeHtml(publicNote)+'</b></span>':""}
        </div>
      </article>
    `;
  }).join("");
}

function startPromotionOrdersWatcher(){
  if(!currentUser||!currentAccount?.institutionId)return;
  if(promotionOrdersUnsubscribe)promotionOrdersUnsubscribe();

  promotionOrdersUnsubscribe=db.collection("promotionOrders")
    .where("institutionId","==",String(currentAccount.institutionId))
    .onSnapshot(snapshot=>{
      promotionOrderRecords=snapshot.docs
        .map(doc=>({id:doc.id,...doc.data()}))
        .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
      renderPromotionOrders();
    },error=>{
      console.error("Tanıtım siparişleri yüklenemedi:",error);
      const root=document.getElementById("promotionOrdersList");
      if(root)root.innerHTML='<div class="promotion-orders-empty">Siparişler yüklenemedi.</div>';
    });
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

  const profileVideoInput=document.getElementById("profileVideoUrl");
  const profilePanoramaInput=document.getElementById("profilePanorama360Url");
  const profileTourInput=document.getElementById("profileVirtualTourUrl");

  if(profileVideoInput){
    profileVideoInput.value=
      institution.locationVideoUrl ||
      institution.profileVideoUrl ||
      institution.videoUrl ||
      "";
  }
  if(profilePanoramaInput){
    profilePanoramaInput.value=institution.panorama360Url || "";
  }
  if(profileTourInput){
    profileTourInput.value=
      institution.virtualTourUrl ||
      institution.tour360Url ||
      institution.tourUrl ||
      "";
  }

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

// Sayfa ilk açıldığında hiçbir tanıtım popup'ı kendiliğinden görünmesin.
document.getElementById("promotionDetailModal")?.classList.add("hidden");
document.getElementById("promotionOrderModal")?.classList.add("hidden");
document.getElementById("promotionOrderSuccess")?.classList.add("hidden");
document.getElementById("promotionOrderFormView")?.classList.remove("hidden");

setupShowcaseSalesActions();

document.addEventListener("click",event=>{
  const detail=event.target.closest("[data-promotion-detail]");
  if(detail){
    openPromotionDetail(detail.dataset.promotionDetail||"consultation");
    return;
  }

  const order=event.target.closest("[data-promotion-order]");
  if(order){
    openPromotionOrder(order.dataset.promotionOrder||"consultation");
  }
});

document.getElementById("promotionDetailClose")?.addEventListener("click",closePromotionDetail);
document.getElementById("promotionOrderClose")?.addEventListener("click",closePromotionOrder);
document.getElementById("promotionDetailModal")?.addEventListener("click",event=>{
  if(event.target.id==="promotionDetailModal")closePromotionDetail();
});
document.getElementById("promotionOrderModal")?.addEventListener("click",event=>{
  if(event.target.id==="promotionOrderModal")closePromotionOrder();
});
document.getElementById("promotionDetailOrderBtn")?.addEventListener("click",()=>openPromotionOrder(activePromotionServiceKey));
document.getElementById("promotionOrderSuccessClose")?.addEventListener("click",()=>{
  closePromotionOrder();
  document.getElementById("promotionOrdersSection")?.scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("promotionOrderForm")?.addEventListener("submit",submitPromotionOrder);

document.querySelectorAll("[data-showcase-section-target]").forEach(button=>{
  button.addEventListener("click",()=>{
    document.getElementById(button.dataset.showcaseSectionTarget)
      ?.scrollIntoView({behavior:"smooth",block:"start"});
  });
});

document.getElementById("showcaseRecommendationList")?.addEventListener("click",event=>{
  const button=event.target.closest("[data-recommendation-action]");
  if(!button)return;
  const action=button.dataset.recommendationAction;
  if(action==="profile") setPanelTab("profile");
  else openPromotionDetail(action||"consultation");
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
  const videoRaw=String(document.getElementById("profileVideoUrl")?.value||"").trim();
  const panoramaRaw=String(document.getElementById("profilePanorama360Url")?.value||"").trim();
  const virtualTourRaw=String(document.getElementById("profileVirtualTourUrl")?.value||"").trim();

  const logoUrl=logoRaw ? safeProfileUrl(logoRaw) : "";
  const coverUrl=coverRaw ? safeProfileUrl(coverRaw) : "";
  const locationVideoUrl=videoRaw ? safeProfileUrl(videoRaw) : "";
  const panorama360Url=panoramaRaw ? safeProfileUrl(panoramaRaw) : "";
  const virtualTourUrl=virtualTourRaw ? safeProfileUrl(virtualTourRaw) : "";

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
  if(videoRaw && !locationVideoUrl){
    showProfileMessage("Video bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("profileVideoUrl")?.focus();
    return;
  }
  if(panoramaRaw && !panorama360Url){
    showProfileMessage("360° görsel bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("profilePanorama360Url")?.focus();
    return;
  }
  if(virtualTourRaw && !virtualTourUrl){
    showProfileMessage("360° sanal tur bağlantısı geçerli bir http/https adresi olmalıdır.","error");
    document.getElementById("profileVirtualTourUrl")?.focus();
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
    locationVideoUrl,
    panorama360Url,
    virtualTourUrl,
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

[
  "profileLogoUrl",
  "profileCoverUrl",
  "profileGalleryUrls",
  "profileVideoUrl",
  "profilePanorama360Url",
  "profileVirtualTourUrl"
].forEach(id => {
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

document.getElementById("profilePanorama360File")?.addEventListener("change", async event => {
  const file=event.target.files?.[0];

  await saveUploadedProfileMedia({
    file,
    kind:"panorama360",
    fieldName:"panorama360Url",
    inputId:"profilePanorama360Url",
    statusId:"profilePanorama360UploadStatus",
    label:"360° görüntü",
    mediaType:"panorama"
  });

  event.target.value="";
});

document.getElementById("profileVideoFile")?.addEventListener("change", async event => {
  const file=event.target.files?.[0];

  await saveUploadedProfileMedia({
    file,
    kind:"video",
    fieldName:"locationVideoUrl",
    inputId:"profileVideoUrl",
    statusId:"profileVideoUploadStatus",
    label:"Video",
    mediaType:"video"
  });

  event.target.value="";
});

document.querySelector(".firm-profile-showcase-media")?.addEventListener("click",event=>{
  const button=event.target.closest("[data-clear-profile-media]");
  if(!button)return;
  clearProfileHeroMedia(button.dataset.clearProfileMedia);
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
    startPromotionPackagesWatcher();
    startPromotionOrdersWatcher();

    const panelParams = new URLSearchParams(window.location.search);
    const requestedPanel = panelParams.get("tab");
    const requestedService = String(panelParams.get("service") || "").trim();
    const requestedOrder = panelParams.get("order") === "1";

    const allowedPanels = new Set([
      "summary","quotes","verify","showcase",
      "profile","stats","support","announcements","account"
    ]);

    if (requestedPanel && allowedPanels.has(requestedPanel)) {
      setPanelTab(requestedPanel);
    }

    if (
      requestedPanel === "showcase" &&
      requestedService &&
      PROMOTION_SERVICES[requestedService]
    ) {
      setTimeout(() => {
        document.getElementById("showcaseAdServices")
          ?.scrollIntoView({ behavior:"smooth", block:"start" });

        if (requestedOrder) openPromotionOrder(requestedService);
        else openPromotionDetail(requestedService);
      }, 140);
    }

    if (requestedPanel === "showcase") {
      sessionStorage.removeItem("dijiyerInstitutionIntent");
      sessionStorage.removeItem("dijiyerInstitutionAdService");
      sessionStorage.removeItem("dijiyerInstitutionAdOrder");

      if (requestedService || requestedOrder) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("service");
        cleanUrl.searchParams.delete("order");
        window.history.replaceState({}, "", cleanUrl.toString());
      }
    }

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

  if (promotionOrdersUnsubscribe) {
    promotionOrdersUnsubscribe();
    promotionOrdersUnsubscribe = null;
  }

  if (promotionPackagesUnsubscribe) {
    promotionPackagesUnsubscribe();
    promotionPackagesUnsubscribe = null;
  }

  await auth.signOut();
  window.location.replace("index.html");
});
