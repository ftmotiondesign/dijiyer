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

const panelError = document.getElementById("panelError");

function showPanelError(message) {
  panelError.hidden = false;
  panelError.textContent = message;
}

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const accountDoc = await db.collection("institutionUsers").doc(user.uid).get();

    if (!accountDoc.exists) {
      await auth.signOut();
      return;
    }

    const account = accountDoc.data();

    if (account.status !== "approved") {
      await auth.signOut();
      return;
    }

    const institutionDoc =
      await db.collection("institutions").doc(account.institutionId).get();

    if (!institutionDoc.exists) {
      showPanelError("Bağlı kurum kaydı bulunamadı.");
      return;
    }

    const institution = institutionDoc.data();

    document.getElementById("panelInstitutionName").textContent =
      institution.name || account.institutionName || "Kurum";

    document.getElementById("panelInstitutionLocation").textContent =
      [institution.city, institution.district].filter(Boolean).join(" / ");

    document.getElementById("panelEmail").textContent =
      account.email || user.email || "-";

    document.getElementById("panelPhone").textContent =
      institution.phone || "-";

    document.getElementById("panelAddress").textContent =
      institution.address || "-";

  } catch (error) {
    console.error(error);
    showPanelError("Kurum paneli yüklenemedi.");
  }
});

document.getElementById("institutionLogoutBtn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});
