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
const applicationsTabBtn = document.getElementById("applicationsTabBtn");
const institutionsTabBtn = document.getElementById("institutionsTabBtn");
const institutionEditModal = document.getElementById("institutionEditModal");

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
  if (user) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;

    await loadApplications();
    await loadInstitutions();
  } else {
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
  applicationsTabBtn.classList.add("active");
  institutionsTabBtn.classList.remove("active");
});

institutionsTabBtn.addEventListener("click", async () => {
  applicationsSection.hidden = true;
  institutionsSection.hidden = false;
  applicationsTabBtn.classList.remove("active");
  institutionsTabBtn.classList.add("active");
  await loadInstitutions();
});

async function loadInstitutions() {
  institutionsList.innerHTML = "Kurumlar yükleniyor...";

  try {
    const snapshot = await db.collection("institutions").get();
    institutionCount.textContent = `${snapshot.size} yayındaki kurum`;

    if (snapshot.empty) {
      institutionsList.innerHTML = "<p>Henüz onaylanmış kurum bulunmuyor.</p>";
      return;
    }

    institutionsList.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "institution-manage-card";

      card.innerHTML = `
        <div class="manage-main">
          <div>
            <h3>${escapeHtml(data.name || "-")}</h3>
            <div class="manage-badges">
              <span>${escapeHtml(data.category || "diger")}</span>
              ${data.vip ? '<span class="badge-vip">VIP</span>' : ''}
              ${data.video ? '<span class="badge-video">Videolu</span>' : ''}
            </div>
          </div>

          <div class="manage-actions">
            <button class="edit-institution-btn">✏ Düzenle</button>
            <button class="delete-institution-btn">🗑 Sil</button>
          </div>
        </div>

        <div class="manage-info">
          <p><strong>Konum:</strong> ${escapeHtml(data.city || "-")} / ${escapeHtml(data.district || "-")}</p>
          <p><strong>Adres:</strong> ${escapeHtml(data.address || "-")}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(data.phone || "-")}</p>
          <p><strong>Web / Instagram:</strong> ${escapeHtml(data.website || "-")}</p>
        </div>
      `;

      card.querySelector(".edit-institution-btn").addEventListener("click", () => {
        openInstitutionEdit(doc.id, data);
      });

      card.querySelector(".delete-institution-btn").addEventListener("click", () => {
        deleteInstitution(doc.id, data.name || "Kurum");
      });

      institutionsList.appendChild(card);
    });

  } catch (error) {
    console.error("Kurumlar yüklenemedi:", error);
    institutionsList.innerHTML = "<p>Kurumlar yüklenemedi.</p>";
  }
}

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
