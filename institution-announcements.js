(() => {
  let unsubscribeAnnouncements = null;
  const dismissedAlerts = new Set();

  function announcements() {
    return Array.isArray(currentInstitution?.adminAnnouncements)
      ? [...currentInstitution.adminAnnouncements]
      : [];
  }

  function localReadIds() {
    try {
      const key = "dijiyer_announcement_reads_" + String(currentAccount?.institutionId || "");
      return JSON.parse(localStorage.getItem(key) || "[]").map(String);
    } catch (_) {
      return [];
    }
  }

  function saveLocalReadId(id) {
    try {
      const key = "dijiyer_announcement_reads_" + String(currentAccount?.institutionId || "");
      const values = [...new Set([...localReadIds(), String(id)])];
      localStorage.setItem(key, JSON.stringify(values));
    } catch (_) {}
  }

  function readIds() {
    return new Set([
      ...(Array.isArray(currentInstitution?.adminAnnouncementReads)
        ? currentInstitution.adminAnnouncementReads.map(String)
        : []),
      ...localReadIds()
    ]);
  }

  function priorityLabel(value) {
    if (value === "urgent") return "Acil";
    if (value === "important") return "Önemli";
    return "Bilgilendirme";
  }

  function renderInstitutionAnnouncements() {
    const root = document.getElementById("institutionAnnouncementsList");
    const count = document.getElementById("announcementTabCount");
    if (!root || !currentInstitution) return;

    const reads = readIds();
    const rows = announcements()
      .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

    const unread = rows.filter(item => item?.id && !reads.has(String(item.id)));
    if (count) count.textContent = unread.length;

    root.innerHTML = rows.length
      ? rows.map(item => {
          const isUnread = item?.id && !reads.has(String(item.id));
          return `
            <article class="institution-announcement-card priority-${escapeHtml(item.priority || "normal")} ${isUnread ? "unread" : ""}">
              <div class="institution-announcement-head">
                <div>
                  <span class="institution-announcement-priority">
                    ${escapeHtml(priorityLabel(item.priority))}
                  </span>
                  <h3>${escapeHtml(item.title || "Duyuru")}</h3>
                </div>
                <small>${formatDate(item.date)}</small>
              </div>
              <p>${escapeHtml(item.message || "")}</p>
              <div class="institution-announcement-footer">
                <span>Dijiyer Yönetimi</span>
                ${isUnread
                  ? `<button type="button" data-announcement-read="${escapeHtml(item.id)}">Okundu işaretle</button>`
                  : '<span class="announcement-read-state">✓ Okundu</span>'}
              </div>
            </article>
          `;
        }).join("")
      : '<div class="empty-state">Henüz yönetim duyurusu bulunmuyor.</div>';

    root.querySelectorAll("[data-announcement-read]").forEach(button => {
      button.addEventListener("click", async () => {
        await markAnnouncementRead(button.dataset.announcementRead);
      });
    });

    renderAnnouncementAlert(unread);
  }

  function renderAnnouncementAlert(unread) {
    const alert = document.getElementById("institutionAnnouncementAlert");
    if (!alert) return;

    const latest = unread[0];
    if (!latest || dismissedAlerts.has(String(latest.id))) {
      alert.classList.add("hidden");
      return;
    }

    document.getElementById("institutionAnnouncementAlertTitle").textContent =
      latest.title || "Yeni yönetim duyurusu";
    document.getElementById("institutionAnnouncementAlertText").textContent =
      latest.message || "";
    alert.dataset.announcementId = latest.id || "";
    alert.classList.remove("hidden");
  }

  async function markAnnouncementRead(id) {
    if (!id || !currentAccount?.institutionId) return;
    saveLocalReadId(id);

    try {
      await db.collection("institutions")
        .doc(currentAccount.institutionId)
        .update({
          adminAnnouncementReads:
            firebase.firestore.FieldValue.arrayUnion(String(id)),
          updatedAt:new Date().toISOString()
        });

      currentInstitution.adminAnnouncementReads = [
        ...(Array.isArray(currentInstitution.adminAnnouncementReads)
          ? currentInstitution.adminAnnouncementReads
          : []),
        String(id)
      ];
    } catch (error) {
      console.warn("Duyuru okundu bilgisi sunucuya kaydedilemedi; yerel olarak saklandı.", error);
    }

    dismissedAlerts.delete(String(id));
    renderInstitutionAnnouncements();
  }

  async function markAllAnnouncementsRead() {
    const ids = announcements().map(item => String(item.id || "")).filter(Boolean);
    if (!ids.length || !currentAccount?.institutionId) return;

    ids.forEach(saveLocalReadId);

    try {
      await db.collection("institutions")
        .doc(currentAccount.institutionId)
        .update({
          adminAnnouncementReads:
            firebase.firestore.FieldValue.arrayUnion(...ids),
          updatedAt:new Date().toISOString()
        });

      currentInstitution.adminAnnouncementReads = [
        ...new Set([
          ...(Array.isArray(currentInstitution.adminAnnouncementReads)
            ? currentInstitution.adminAnnouncementReads
            : []),
          ...ids
        ])
      ];
    } catch (error) {
      console.warn("Tüm duyuruların okundu bilgisi sunucuya kaydedilemedi; yerel olarak saklandı.", error);
    }

    document.getElementById("institutionAnnouncementAlert")?.classList.add("hidden");
    renderInstitutionAnnouncements();
  }

  function startAnnouncementWatcher() {
    if (!currentAccount?.institutionId || unsubscribeAnnouncements) return;

    unsubscribeAnnouncements = db.collection("institutions")
      .doc(currentAccount.institutionId)
      .onSnapshot(snapshot => {
        if (!snapshot.exists) return;
        const data = snapshot.data() || {};

        currentInstitution.adminAnnouncements =
          Array.isArray(data.adminAnnouncements) ? data.adminAnnouncements : [];
        currentInstitution.adminAnnouncementReads =
          Array.isArray(data.adminAnnouncementReads) ? data.adminAnnouncementReads : [];

        renderInstitutionAnnouncements();
      }, error => {
        console.warn("Yönetim duyuruları canlı takip edilemedi:", error);
      });
  }

  document.getElementById("openInstitutionAnnouncements")?.addEventListener("click", () => {
    document.getElementById("institutionAnnouncementAlert")?.classList.add("hidden");
    setPanelTab("announcements");
  });

  document.getElementById("closeInstitutionAnnouncementAlert")?.addEventListener("click", () => {
    const alert = document.getElementById("institutionAnnouncementAlert");
    if (alert?.dataset.announcementId) {
      dismissedAlerts.add(String(alert.dataset.announcementId));
    }
    alert?.classList.add("hidden");
  });

  document.getElementById("markAllAnnouncementsRead")?.addEventListener(
    "click",
    markAllAnnouncementsRead
  );

  const initTimer = setInterval(() => {
    if (!currentInstitution || !currentAccount) return;
    clearInterval(initTimer);
    renderInstitutionAnnouncements();
    startAnnouncementWatcher();
  }, 250);

  window.addEventListener("beforeunload", () => {
    if (unsubscribeAnnouncements) unsubscribeAnnouncements();
  });
})();
