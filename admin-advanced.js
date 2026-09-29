(() => {
  const $ = (id) => document.getElementById(id);
  const advancedSectionIds = ["supportSection","announcementsSection","systemSection"];
  const baseSectionIds = [
    "overviewSection","applicationsSection","institutionsSection","quotesSection",
    "offerReportSection","issuesSection","accountsSection"
  ];
  const advancedTabIds = ["supportTabBtn","announcementsTabBtn","systemTabBtn"];
  const baseTabIds = [
    "overviewTabBtn","applicationsTabBtn","institutionsTabBtn","quotesTabBtn",
    "offerReportTabBtn","issuesTabBtn","accountsTabBtn"
  ];

  const selectedInstitutionIds = new Set();
  let announcementSelectedIds = [];
  let supportAdminRecords = [];
  let adminSettings = loadAdminSettings();

  function safeText(value) {
    return String(value ?? "");
  }

  function normalize(value) {
    return safeText(value).trim().toLocaleLowerCase("tr-TR");
  }

  function money(value) {
    return new Intl.NumberFormat("tr-TR").format(Number(value || 0)) + " TL";
  }

  function uid(prefix = "ID") {
    const rand = Math.random().toString(36).slice(2, 9).toUpperCase();
    return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + rand;
  }

  function formatDateLocal(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("tr-TR", {
      day:"2-digit", month:"2-digit", year:"numeric",
      hour:"2-digit", minute:"2-digit"
    });
  }

  function loadAdminSettings() {
    const defaults = {
      profileHealthMin: 70,
      inactiveDays: 30,
      supportSlaDays: 2,
      defaultReportPeriod: "all"
    };
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem("dijiyer_admin_settings") || "{}")
      };
    } catch (_) {
      return defaults;
    }
  }

  function saveAdminSettingsLocal(next) {
    adminSettings = { ...adminSettings, ...next };
    localStorage.setItem("dijiyer_admin_settings", JSON.stringify(adminSettings));
  }

  function getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem("dijiyer_admin_audit") || "[]");
    } catch (_) {
      return [];
    }
  }

  function addAudit(action, detail = "") {
    const logs = getAuditLogs();
    logs.unshift({
      id: uid("LOG"),
      action,
      detail,
      date: new Date().toISOString()
    });
    localStorage.setItem(
      "dijiyer_admin_audit",
      JSON.stringify(logs.slice(0, 300))
    );
    renderAudit();
  }

  function renderAudit() {
    const root = $("adminAuditList");
    if (!root) return;
    const logs = getAuditLogs();
    root.innerHTML = logs.length
      ? logs.slice(0, 100).map(item => `
          <div class="audit-row">
            <div>
              <strong>${escapeHtml(item.action || "İşlem")}</strong>
              <span>${escapeHtml(item.detail || "")}</span>
            </div>
            <small>${formatDateLocal(item.date)}</small>
          </div>
        `).join("")
      : '<div class="advanced-empty">Henüz işlem kaydı yok.</div>';
  }

  function hideAdvancedSections() {
    advancedSectionIds.forEach(id => {
      const el = $(id);
      if (el) el.hidden = true;
    });
    advancedTabIds.forEach(id => $(id)?.classList.remove("active"));
  }

  function showAdvancedSection(sectionId, tabId) {
    baseSectionIds.forEach(id => {
      const el = $(id);
      if (el) el.hidden = true;
    });
    advancedSectionIds.forEach(id => {
      const el = $(id);
      if (el) el.hidden = id !== sectionId;
    });
    [...baseTabIds, ...advancedTabIds].forEach(id => $(id)?.classList.remove("active"));
    $(tabId)?.classList.add("active");
  }

  baseTabIds.forEach(id => {
    $(id)?.addEventListener("click", hideAdvancedSections);
  });

  $("supportTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("supportSection","supportTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("supportTabBtn");
    await renderSupportCenter();
  });

  $("announcementsTabBtn")?.addEventListener("click", () => {
    showAdvancedSection("announcementsSection","announcementsTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("announcementsTabBtn");
    populateAnnouncementTargets();
    renderAnnouncementHistory();
  });

  $("systemTabBtn")?.addEventListener("click", () => {
    showAdvancedSection("systemSection","systemTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("systemTabBtn");
    renderSystemChecks();
    fillSettingsForm();
    renderAudit();
  });

  function getOfferEventsForInstitution(institutionId) {
    try {
      if (typeof buildInstitutionOfferReport === "function" &&
          (!institutionOfferReportEvents || !institutionOfferReportEvents.length) &&
          quoteRequestRecords.length) {
        buildInstitutionOfferReport();
      }
    } catch (_) {}

    try {
      return (institutionOfferReportEvents || []).filter(
        item => String(item.institutionId) === String(institutionId)
      );
    } catch (_) {
      return [];
    }
  }

  function getInstitutionHealth(inst) {
    const checks = [
      ["Kurum adı", Boolean(safeText(inst.name).trim())],
      ["Kategori", Boolean(safeText(inst.subCategory || inst.category).trim())],
      ["Şehir", Boolean(safeText(inst.city).trim())],
      ["İlçe", Boolean(safeText(inst.district).trim())],
      ["Telefon", Boolean(safeText(inst.phone).trim())],
      ["Adres", Boolean(safeText(inst.address).trim())],
      ["Konum",
        inst.lat !== null && inst.lat !== "" && inst.lat !== undefined &&
        inst.lng !== null && inst.lng !== "" && inst.lng !== undefined &&
        Number.isFinite(Number(inst.lat)) && Number.isFinite(Number(inst.lng))
      ],
      ["Web / Instagram", Boolean(safeText(inst.website).trim())]
    ];

    const profileScore = Math.round(
      checks.filter(([,ok]) => ok).length / checks.length * 100
    );
    const missing = checks.filter(([,ok]) => !ok).map(([label]) => label);
    const events = getOfferEventsForInstitution(inst.id);
    const latestEvent = [...events]
      .map(item => item.offerDate)
      .filter(Boolean)
      .sort((a,b) => new Date(b) - new Date(a))[0] || null;

    let activityState = "unknown";
    if (latestEvent) {
      const diffDays = (Date.now() - new Date(latestEvent).getTime()) / 86400000;
      activityState = diffDays > Number(adminSettings.inactiveDays || 30)
        ? "inactive"
        : "active";
    }

    const offerOpen = inst.offer !== false;
    const healthScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(profileScore * 0.8 + (offerOpen ? 10 : 0) + (activityState === "active" ? 10 : 0))
      )
    );

    let label = "Sağlıklı";
    let state = "good";
    if (healthScore < Number(adminSettings.profileHealthMin || 70)) {
      label = "Eksik";
      state = "danger";
    } else if (!offerOpen || activityState === "inactive") {
      label = "Dikkat";
      state = "warning";
    }

    return {
      score: healthScore,
      profileScore,
      missing,
      label,
      state,
      offerOpen,
      latestEvent,
      activityState
    };
  }

  window.decorateAdminInstitutionCard = (card, data) => {
    if (!card || card.dataset.advancedDecorated === "true") return;
    card.dataset.advancedDecorated = "true";
    card.dataset.institutionId = data.id;

    const health = getInstitutionHealth(data);
    const selectSlot = card.querySelector(".institution-select-slot");
    const manageMain = card.querySelector(".manage-main");
    if (selectSlot || manageMain) {
      const selector = document.createElement("label");
      selector.className = "institution-select-box";
      selector.innerHTML = `
        <input type="checkbox" class="institution-bulk-check" data-id="${escapeHtml(data.id)}">
        <span>Seç</span>
      `;
      (selectSlot || manageMain).prepend(selector);
    }

    const badgeWrap = card.querySelector(".manage-badges");
    if (badgeWrap) {
      const healthBadge = document.createElement("span");
      healthBadge.className = "badge-health health-" + health.state;
      healthBadge.textContent = "Sağlık %" + health.score;
      healthBadge.title = health.missing.length
        ? "Eksik: " + health.missing.join(", ")
        : "Profil bilgileri yeterli";
      badgeWrap.appendChild(healthBadge);
    }

    const healthBox = document.createElement("div");
    healthBox.className = "institution-health-box health-" + health.state;
    healthBox.innerHTML = `
      <div>
        <span>Kurum Sağlığı</span>
        <strong>%${health.score} · ${escapeHtml(health.label)}</strong>
      </div>
      <div>
        <span>Profil</span>
        <strong>%${health.profileScore}</strong>
      </div>
      <div>
        <span>Eksik</span>
        <strong>${health.missing.length ? escapeHtml(health.missing.slice(0,3).join(", ")) : "Yok"}</strong>
      </div>
      <div>
        <span>Son Teklif</span>
        <strong>${health.latestEvent ? formatDateLocal(health.latestEvent) : "Henüz yok"}</strong>
      </div>
    `;
    const healthSlot = card.querySelector(".institution-health-slot");
    (healthSlot || card).appendChild(healthBox);

    const checkbox = card.querySelector(".institution-bulk-check");
    if (selectedInstitutionIds.has(String(data.id))) checkbox.checked = true;
    checkbox?.addEventListener("change", () => {
      const id = String(data.id);
      if (checkbox.checked) selectedInstitutionIds.add(id);
      else selectedInstitutionIds.delete(id);
      updateBulkSelectionUi();
    });
  };

  function decorateExistingInstitutionCards() {
    document.querySelectorAll(".institution-manage-card").forEach(card => {
      const id = card.dataset.institutionId;
      const record = institutionRecords.find(item => String(item.id) === String(id));
      if (record) window.decorateAdminInstitutionCard(card, record);
    });
  }

  const institutionObserver = new MutationObserver(() => decorateExistingInstitutionCards());
  if ($("institutionsList")) {
    institutionObserver.observe($("institutionsList"), { childList:true, subtree:true });
  }
  setTimeout(decorateExistingInstitutionCards, 1000);

  function updateBulkSelectionUi() {
    $("bulkSelectedCount").textContent = selectedInstitutionIds.size + " kurum seçili";
    document.querySelectorAll(".institution-bulk-check").forEach(input => {
      input.checked = selectedInstitutionIds.has(String(input.dataset.id));
    });
  }

  $("bulkSelectVisible")?.addEventListener("change", event => {
    let visible = [];
    try {
      visible = getFilteredManagedInstitutions();
    } catch (_) {
      visible = institutionRecords;
    }
    visible.forEach(item => {
      if (event.target.checked) selectedInstitutionIds.add(String(item.id));
      else selectedInstitutionIds.delete(String(item.id));
    });
    updateBulkSelectionUi();
  });

  async function applyBulkUpdate(field, value, label) {
    const ids = [...selectedInstitutionIds];
    if (!ids.length) {
      alert("Önce en az bir kurum seçin.");
      return;
    }
    if (!confirm(ids.length + " kuruma '" + label + "' işlemi uygulanacak. Devam edilsin mi?")) return;

    await Promise.all(ids.map(id =>
      db.collection("institutions").doc(id).update({
        [field]: value,
        updatedAt:new Date().toISOString()
      })
    ));

    institutionRecords.forEach(item => {
      if (selectedInstitutionIds.has(String(item.id))) item[field] = value;
    });

    addAudit("Toplu kurum işlemi", ids.length + " kurum · " + label);
    renderManagedInstitutions();
  }

  $("bulkInstitutionApply")?.addEventListener("click", async () => {
    const action = $("bulkInstitutionAction").value;
    if (!action) return;

    if (action === "announcement") {
      if (!selectedInstitutionIds.size) {
        alert("Önce duyuru göndereceğiniz kurumları seçin.");
        return;
      }
      announcementSelectedIds = [...selectedInstitutionIds];
      $("announcementTargetType").value = "selected";
      showAdvancedSection("announcementsSection","announcementsTabBtn");
      populateAnnouncementTargets();
      renderAnnouncementTargetInfo();
      return;
    }

    const actions = {
      offer_on:["offer",true,"Teklif alımı açıldı"],
      offer_off:["offer",false,"Teklif alımı kapatıldı"],
      vip_on:["vip",true,"VIP yapıldı"],
      vip_off:["vip",false,"VIP kaldırıldı"],
      video_on:["video",true,"Videolu işaretlendi"],
      video_off:["video",false,"Video işareti kaldırıldı"],
      ad_pause:["adStatus","paused","Reklam duraklatıldı"],
      ad_off:["adStatus","none","Reklam kapatıldı"]
    };
    if (!actions[action]) return;

    const [field,value,label] = actions[action];
    try {
      await applyBulkUpdate(field,value,label);
      $("bulkInstitutionAction").value = "";
    } catch (error) {
      console.error(error);
      alert("Toplu işlem tamamlanamadı.");
    }
  });

  async function loadSupportAdminRecords() {
    try {
      const snapshot = await db.collection("supportTickets").get();
      supportAdminRecords = snapshot.docs
        .map(doc => ({ id:doc.id, ...doc.data() }))
        .sort((a,b) =>
          new Date(b.updatedAt || b.date || 0) -
          new Date(a.updatedAt || a.date || 0)
        );
    } catch (error) {
      console.error("Destek talepleri yüklenemedi:", error);
      supportAdminRecords = [];
    }
    return supportAdminRecords;
  }

  function supportTicketAgeMs(ticket) {
    const date = new Date(ticket.date || ticket.updatedAt || 0);
    return Number.isNaN(date.getTime()) ? 0 : Math.max(0, Date.now() - date.getTime());
  }

  function supportTicketIsOverdue(ticket) {
    if (String(ticket.status || "new") === "resolved") return false;
    const slaMs = Number(adminSettings.supportSlaDays || 2) * 86400000;
    return supportTicketAgeMs(ticket) > slaMs;
  }

  function supportAgeLabel(ticket) {
    const ms = supportTicketAgeMs(ticket);
    if (!ms) return "-";
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return "Yeni";
    if (hours < 24) return hours + " saattir açık";
    const days = Math.floor(hours / 24);
    return days + " gündür açık";
  }

  function populateSupportAdminCategories() {
    const select = $("supportAdminCategory");
    if (!select) return;
    const current = select.value;
    const categories = [...new Set(
      supportAdminRecords.map(item => String(item.category || "").trim()).filter(Boolean)
    )].sort((a,b)=>a.localeCompare(b,"tr"));
    select.innerHTML = '<option value="">Tüm konular</option>' +
      categories.map(value =>
        '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>'
      ).join("");
    if (categories.includes(current)) select.value = current;
  }

  function supportStatusLabel(status) {
    if (status === "resolved") return "Çözüldü";
    if (status === "answered") return "Cevaplandı";
    if (status === "reviewing") return "İnceleniyor";
    return "Yeni";
  }

  async function renderSupportCenter() {
    const root = $("supportAdminList");
    if (!root) return;

    await loadSupportAdminRecords();
    populateSupportAdminCategories();

    const query = normalize($("supportAdminSearch")?.value);
    const status = $("supportAdminStatus")?.value || "";
    const category = $("supportAdminCategory")?.value || "";
    const sort = $("supportAdminSort")?.value || "newest";

    const newCount = supportAdminRecords.filter(x => String(x.status || "new") === "new").length;
    const reviewingCount = supportAdminRecords.filter(x => String(x.status || "") === "reviewing").length;
    const answeredCount = supportAdminRecords.filter(x => String(x.status || "") === "answered").length;
    const resolvedCount = supportAdminRecords.filter(x => String(x.status || "") === "resolved").length;
    const overdueCount = supportAdminRecords.filter(supportTicketIsOverdue).length;
    const open = supportAdminRecords.length - resolvedCount;

    if ($("supportKpiNew")) $("supportKpiNew").textContent = newCount;
    if ($("supportKpiReviewing")) $("supportKpiReviewing").textContent = reviewingCount;
    if ($("supportKpiAnswered")) $("supportKpiAnswered").textContent = answeredCount;
    if ($("supportKpiOverdue")) $("supportKpiOverdue").textContent = overdueCount;

    $("supportAdminCount").textContent =
      supportAdminRecords.length + " talep · " + open + " açık · " +
      resolvedCount + " çözüldü";

    if ($("adminSupportTabCount")) $("adminSupportTabCount").textContent = open;
    if ($("quickSupportCount")) $("quickSupportCount").textContent = open;

    let tickets = supportAdminRecords.filter(item => {
      const haystack = normalize([
        item.id,item.institutionName,item.subject,item.message,item.adminReply,item.email,
        item.category,item.relatedRequestId,item.relatedOfferCode,item.relatedService
      ].filter(Boolean).join(" "));

      const statusMatch = !status ||
        (status === "overdue"
          ? supportTicketIsOverdue(item)
          : String(item.status || "new") === status);

      const categoryMatch = !category || String(item.category || "") === category;

      return (!query || haystack.includes(query)) && statusMatch && categoryMatch;
    });

    tickets = [...tickets].sort((a,b) => {
      if (sort === "oldest") {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sort === "priority") {
        const overdueDiff = Number(supportTicketIsOverdue(b)) - Number(supportTicketIsOverdue(a));
        if (overdueDiff) return overdueDiff;
        const stateRank = {new:0,reviewing:1,answered:2,resolved:3};
        const stateDiff =
          (stateRank[String(a.status || "new")] ?? 9) -
          (stateRank[String(b.status || "new")] ?? 9);
        if (stateDiff) return stateDiff;
      }
      return new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0);
    });

    if ($("supportFilterSummary")) {
      const parts = [];
      if (status) parts.push(status === "overdue" ? "Geciken" : supportStatusLabel(status));
      if (category) parts.push(category);
      if (query) parts.push('Arama: "' + $("supportAdminSearch").value.trim() + '"');
      $("supportFilterSummary").textContent =
        tickets.length + " kayıt gösteriliyor" + (parts.length ? " · " + parts.join(" · ") : "");
    }

    root.innerHTML = tickets.length ? tickets.map(ticket => {
      const isOverdue = supportTicketIsOverdue(ticket);
      const ticketNo = String(ticket.id || "").slice(0,8).toUpperCase();

      const preview = String(ticket.message || "").replace(/\s+/g," ").trim();

      return `
      <details class="support-ticket-row ${isOverdue ? "overdue" : ""}" data-support-ticket-id="${escapeHtml(ticket.id)}">
        <summary class="support-ticket-summary">
          <div class="support-row-left">
            <span class="support-category-chip">${escapeHtml(ticket.category || "Destek")}</span>
            <div class="support-row-copy">
              <div class="support-row-title">
                <strong>${escapeHtml(ticket.subject || "Destek Talebi")}</strong>
                <span class="support-ticket-no">#${escapeHtml(ticketNo)}</span>
                ${isOverdue ? '<span class="support-overdue-chip">Gecikiyor</span>' : ""}
              </div>
              <div class="support-row-meta">
                <b>${escapeHtml(ticket.institutionName || "Kurum")}</b>
                <span>·</span>
                <span>${formatDateLocal(ticket.date)}</span>
                <span class="support-row-preview">${escapeHtml(preview || "Mesaj yok")}</span>
              </div>
            </div>
          </div>

          <div class="support-row-right">
            <span class="support-state state-${escapeHtml(ticket.status || "new")}">
              ${supportStatusLabel(ticket.status)}
            </span>
            <small class="${isOverdue ? "overdue-text" : ""}">${escapeHtml(supportAgeLabel(ticket))}</small>
            <span class="support-row-chevron" aria-hidden="true">⌄</span>
          </div>
        </summary>

        <div class="support-ticket-detail">
          <div class="support-ticket-detail-head">
            <div>
              <span>DESTEK KAYDI</span>
              <strong>#${escapeHtml(ticketNo)} · ${escapeHtml(ticket.institutionName || "Kurum")}</strong>
            </div>
            <div class="support-contact-meta">
              ${ticket.email ? '<span>' + escapeHtml(ticket.email) + '</span>' : ""}
              <span>${formatDateLocal(ticket.date)}</span>
            </div>
          </div>

          ${ticket.relatedRequestId ? `
            <div class="support-admin-reference">
              <div class="support-admin-reference-head">
                <div>
                  <span>İLGİLİ TALEP / TEKLİF</span>
                  <strong>${escapeHtml(ticket.relatedService || "Teklif Talebi")}</strong>
                </div>
                <button
                  type="button"
                  data-support-open-quote="${escapeHtml(ticket.relatedRequestId)}"
                >Talebi Aç</button>
              </div>
              <div class="support-admin-reference-grid">
                <span>Talep No <b>${escapeHtml(String(ticket.relatedRequestId).slice(0,10).toUpperCase())}</b></span>
                <span>Teklif No <b>${escapeHtml(ticket.relatedOfferCode || "-")}</b></span>
                <span>Durum <b>${escapeHtml(ticket.relatedOfferStatusLabel || ticket.relatedOfferStatus || "-")}</b></span>
                ${ticket.relatedOfferPrice
                  ? `<span>Fiyat <b>${money(ticket.relatedOfferPrice)}</b></span>`
                  : ""}
                ${ticket.relatedLocation
                  ? `<span>Konum <b>${escapeHtml(ticket.relatedLocation)}</b></span>`
                  : ""}
              </div>
            </div>
          ` : ""}

          <div class="support-admin-message">
            <strong>Kurumun mesajı</strong>
            <p>${escapeHtml(ticket.message || "")}</p>
          </div>

          ${ticket.adminReply ? `
            <div class="support-admin-existing-reply">
              <strong>Son Dijiyer yanıtı · ${formatDateLocal(ticket.adminReplyAt || ticket.updatedAt)}</strong>
              <p>${escapeHtml(ticket.adminReply)}</p>
            </div>
          ` : ""}

          <div class="support-admin-controls">
            <select data-support-status="${escapeHtml(ticket.id)}" aria-label="Destek durumu">
              <option value="new" ${(ticket.status||"new")==="new"?"selected":""}>Yeni</option>
              <option value="reviewing" ${ticket.status==="reviewing"?"selected":""}>İnceleniyor</option>
              <option value="answered" ${ticket.status==="answered"?"selected":""}>Cevaplandı</option>
              <option value="resolved" ${ticket.status==="resolved"?"selected":""}>Çözüldü</option>
            </select>
            <textarea data-support-reply="${escapeHtml(ticket.id)}" placeholder="Kuruma verilecek yanıtı yazın...">${escapeHtml(ticket.adminReply || "")}</textarea>
            <button type="button" data-support-save="${escapeHtml(ticket.id)}">Yanıtı Kaydet</button>
          </div>

          <div class="support-quick-actions">
            ${String(ticket.status || "new") === "new"
              ? `<button type="button" data-support-quick="reviewing" data-support-id="${escapeHtml(ticket.id)}">İncelemeye Al</button>`
              : ""}
            ${String(ticket.status || "new") !== "resolved"
              ? `<button type="button" class="success" data-support-quick="resolved" data-support-id="${escapeHtml(ticket.id)}">Çözüldü Yap</button>`
              : `<span class="support-done-note">✓ Bu destek talebi kapatıldı.</span>`}
          </div>
        </div>
      </details>
    `;
    }).join("") : '<div class="advanced-empty">Filtreye uygun destek talebi yok.</div>';

    root.querySelectorAll("details.support-ticket-row").forEach(row => {
      row.addEventListener("toggle", () => {
        if (!row.open) return;
        root.querySelectorAll("details.support-ticket-row[open]").forEach(other => {
          if (other !== row) other.open = false;
        });
      });
    });

    root.querySelectorAll("[data-support-save]").forEach(button => {
      button.addEventListener("click", () =>
        saveSupportTicketAdmin(button.dataset.supportSave)
      );
    });

    root.querySelectorAll("[data-support-quick]").forEach(button => {
      button.addEventListener("click", async () => {
        const ticketId = button.dataset.supportId;
        const select = document.querySelector(
          `[data-support-status="${CSS.escape(ticketId)}"]`
        );
        if (select) select.value = button.dataset.supportQuick;
        await saveSupportTicketAdmin(ticketId);
      });
    });

    root.querySelectorAll("[data-support-open-quote]").forEach(button => {
      button.addEventListener("click", async () => {
        const quoteId = button.dataset.supportOpenQuote;
        document.getElementById("quotesTabBtn")?.click();

        if (typeof loadQuoteRequests === "function" && !quoteRequestRecords.length) {
          await loadQuoteRequests();
        }

        requestAnimationFrame(() => {
          const card = document.querySelector(
            '#quoteRequestsList .quote-request-card[data-quote-id="' +
            CSS.escape(String(quoteId || "")) + '"]'
          );

          if (card) {
            card.scrollIntoView({ behavior:"smooth", block:"center" });
            card.classList.add("admin-focus-flash");
            setTimeout(() => card.classList.remove("admin-focus-flash"), 1800);
          } else {
            const search = document.getElementById("quoteRequestSearch");
            if (search) {
              search.value = quoteId;
              search.dispatchEvent(new Event("input",{bubbles:true}));
            }
          }
        });
      });
    });
  }

  async function saveSupportTicketAdmin(ticketId) {
    const ticket = supportAdminRecords.find(
      item => String(item.id) === String(ticketId)
    );
    if (!ticket) return;

    const status = document.querySelector(
      `[data-support-status="${CSS.escape(ticketId)}"]`
    )?.value || "new";

    const reply = document.querySelector(
      `[data-support-reply="${CSS.escape(ticketId)}"]`
    )?.value.trim() || "";

    const now = new Date().toISOString();

    await db.collection("supportTickets").doc(ticketId).update({
      status,
      adminReply:reply,
      adminReplyAt: reply ? now : (ticket.adminReplyAt || ""),
      updatedAt:now
    });

    addAudit(
      "Destek talebi güncellendi",
      (ticket.institutionName || "Kurum") + " · " + ticketId + " · " + status
    );

    await renderSupportCenter();
    await refreshAdminNotifications();
  }

  $("supportAdminSearch")?.addEventListener("input", renderSupportCenter);
  $("supportAdminStatus")?.addEventListener("change", renderSupportCenter);
  $("supportAdminCategory")?.addEventListener("change", renderSupportCenter);
  $("supportAdminSort")?.addEventListener("change", renderSupportCenter);

  $("supportAdminRefresh")?.addEventListener("click", async event => {
    const button = event.currentTarget;
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Yenileniyor...";
    await renderSupportCenter();
    button.disabled = false;
    button.textContent = oldText;
  });

  document.querySelectorAll("[data-support-kpi]").forEach(button => {
    button.addEventListener("click", () => {
      const statusSelect = $("supportAdminStatus");
      if (!statusSelect) return;
      const value = button.dataset.supportKpi || "";
      statusSelect.value = statusSelect.value === value ? "" : value;
      renderSupportCenter();
    });
  });

  function getAnnouncementTargets() {
    const type = $("announcementTargetType")?.value || "all";
    const value = $("announcementTargetValue")?.value || "";

    if (type === "selected") {
      return institutionRecords.filter(item =>
        announcementSelectedIds.includes(String(item.id)) ||
        selectedInstitutionIds.has(String(item.id))
      );
    }
    if (type === "category") {
      return institutionRecords.filter(item =>
        String(item.subCategory || item.category || "") === value
      );
    }
    if (type === "city") {
      return institutionRecords.filter(item => String(item.city || "") === value);
    }
    return institutionRecords;
  }

  function populateAnnouncementTargets() {
    const type = $("announcementTargetType")?.value || "all";
    const wrap = $("announcementTargetValueWrap");
    const select = $("announcementTargetValue");
    if (!wrap || !select) return;

    if (type === "all" || type === "selected") {
      wrap.classList.add("hidden");
      renderAnnouncementTargetInfo();
      return;
    }

    wrap.classList.remove("hidden");

    if (type === "category") {
      const categories = [...new Set(
        institutionRecords.map(x => x.subCategory || x.category).filter(Boolean)
      )].sort();
      select.innerHTML = categories.map(value =>
        `<option value="${escapeHtml(value)}">${escapeHtml(
          typeof getReportCategoryLabel === "function" ? getReportCategoryLabel(value) : value
        )}</option>`
      ).join("");
    } else {
      const cities = [...new Set(
        institutionRecords.map(x => x.city).filter(Boolean)
      )].sort((a,b)=>a.localeCompare(b,"tr"));
      select.innerHTML = cities.map(value =>
        `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
      ).join("");
    }
    renderAnnouncementTargetInfo();
  }

  function renderAnnouncementTargetInfo() {
    const targets = getAnnouncementTargets();
    const info = $("announcementTargetInfo");
    if (!info) return;
    info.textContent = targets.length + " kuruma gönderilecek.";
  }

  $("announcementTargetType")?.addEventListener("change", populateAnnouncementTargets);
  $("announcementTargetValue")?.addEventListener("change", renderAnnouncementTargetInfo);

  $("announcementAdminForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const targets = getAnnouncementTargets();
    const msg = $("announcementAdminMessage");
    if (!targets.length) {
      msg.textContent = "Hedefe uygun kurum bulunamadı.";
      return;
    }

    const announcement = {
      id:uid("DUY"),
      title:$("announcementTitle").value.trim(),
      message:$("announcementMessage").value.trim(),
      priority:$("announcementPriority").value,
      date:new Date().toISOString(),
      targetType:$("announcementTargetType").value,
      targetLabel:$("announcementTargetType").selectedOptions[0]?.textContent || "",
      sentTo:targets.length
    };

    msg.textContent = "Gönderiliyor...";

    try {
      await Promise.all(targets.map(inst =>
        db.collection("institutions").doc(inst.id).update({
          adminAnnouncements:firebase.firestore.FieldValue.arrayUnion(announcement),
          updatedAt:new Date().toISOString()
        })
      ));
      targets.forEach(inst => {
        inst.adminAnnouncements = [
          ...(Array.isArray(inst.adminAnnouncements) ? inst.adminAnnouncements : []),
          announcement
        ];
      });
      addAudit("Duyuru gönderildi", announcement.title + " · " + targets.length + " kurum");
      msg.textContent = targets.length + " kuruma duyuru gönderildi.";
      event.target.reset();
      announcementSelectedIds = [];
      populateAnnouncementTargets();
      renderAnnouncementHistory();
    } catch (error) {
      console.error(error);
      msg.textContent = "Duyuru gönderilemedi.";
    }
  });

  function renderAnnouncementHistory() {
    const root = $("announcementHistory");
    if (!root) return;
    const map = new Map();
    institutionRecords.forEach(inst => {
      (Array.isArray(inst.adminAnnouncements) ? inst.adminAnnouncements : []).forEach(item => {
        if (item?.id && !map.has(item.id)) map.set(item.id,item);
      });
    });
    const rows = [...map.values()].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    root.innerHTML = rows.length ? rows.slice(0,30).map(item => `
      <div class="announcement-history-row priority-${escapeHtml(item.priority || "normal")}">
        <div>
          <strong>${escapeHtml(item.title || "Duyuru")}</strong>
          <span>${escapeHtml(item.message || "")}</span>
        </div>
        <small>${formatDateLocal(item.date)} · ${Number(item.sentTo || 0)} kurum</small>
      </div>
    `).join("") : '<div class="advanced-empty">Henüz gönderilmiş duyuru yok.</div>';
  }

  function buildSystemChecks() {
    const checks = [];
    const accountByInstitution = new Map(
      institutionAccountRecords
        .filter(x => x.institutionId)
        .map(x => [String(x.institutionId),x])
    );
    const institutionIds = new Set(institutionRecords.map(x => String(x.id)));

    institutionRecords.forEach(inst => {
      const health = getInstitutionHealth(inst);
      if (health.profileScore < Number(adminSettings.profileHealthMin || 70)) {
        checks.push({
          level:"warning",
          title:(inst.name || "Kurum") + " profili eksik",
          detail:health.missing.join(", ") || "Profil bilgileri eksik"
        });
      }
      if (!accountByInstitution.has(String(inst.id))) {
        checks.push({
          level:"info",
          title:(inst.name || "Kurum") + " için kurum hesabı yok",
          detail:"Kurum paneli hesabı bulunamadı."
        });
      }
      if (!health.offerOpen) {
        checks.push({
          level:"warning",
          title:(inst.name || "Kurum") + " teklif alımını kapatmış",
          detail:"Yeni toplu teklif talepleriyle eşleşmez."
        });
      }
    });

    institutionAccountRecords.forEach(account => {
      if (account.institutionId && !institutionIds.has(String(account.institutionId))) {
        checks.push({
          level:"critical",
          title:"Bozuk kurum hesabı bağlantısı",
          detail:(account.email || account.id) + " → " + account.institutionId
        });
      }
    });

    const duplicates = new Map();
    institutionRecords.forEach(inst => {
      const key = normalize([inst.name,inst.city,inst.district].join("|"));
      if (!key) return;
      if (!duplicates.has(key)) duplicates.set(key,[]);
      duplicates.get(key).push(inst);
    });
    duplicates.forEach(items => {
      if (items.length > 1) {
        checks.push({
          level:"critical",
          title:"Olası mükerrer kurum",
          detail:items.map(x=>x.name + " (" + (x.city||"-") + "/" + (x.district||"-") + ")").join(" · ")
        });
      }
    });

    // Şüpheli / sıra dışı teklif davranışlarını kontrol et.
    const institutionRisk = new Map();

    quoteRequestRecords.forEach(request => {
      const offers = Array.isArray(request.liveOffers) ? request.liveOffers : [];
      const validPrices = offers
        .map(offer => Number(offer.price || 0))
        .filter(price => Number.isFinite(price) && price > 0)
        .sort((a,b) => a-b);

      offers.forEach(offer => {
        const price = Number(offer.price || 0);
        if (!Number.isFinite(price) || price <= 0) {
          checks.push({
            level:"critical",
            title:"Geçersiz teklif fiyatı",
            detail:(offer.institutionName || "Kurum") + " · " +
              (request.service || "Teklif talebi") + " · fiyat: " + String(offer.price || 0)
          });
        }

        const institutionId = String(offer.institutionId || offer.id || offer.institutionName || "");
        if (!institutionRisk.has(institutionId)) {
          institutionRisk.set(institutionId,{
            name:offer.institutionName || "Kurum",
            total:0,
            problematic:0
          });
        }

        const risk = institutionRisk.get(institutionId);
        risk.total += 1;

        try {
          const state = typeof getAdminOfferEventState === "function"
            ? getAdminOfferEventState(offer,request)
            : "";
          if (state === "lost" || state === "expired") risk.problematic += 1;
        } catch (_) {}
      });

      if (validPrices.length >= 3) {
        const middle = Math.floor(validPrices.length / 2);
        const median = validPrices.length % 2
          ? validPrices[middle]
          : (validPrices[middle-1] + validPrices[middle]) / 2;

        offers.forEach(offer => {
          const price = Number(offer.price || 0);
          if (!price || !median) return;

          if (price < median * 0.5 || price > median * 2) {
            checks.push({
              level:"warning",
              title:"Sıra dışı teklif fiyatı",
              detail:(offer.institutionName || "Kurum") + " · " +
                (request.service || "Teklif talebi") + " · " +
                money(price) + " · medyan " + money(median)
            });
          }
        });
      }
    });

    institutionRisk.forEach(risk => {
      if (risk.total >= 5 && risk.problematic / risk.total >= 0.7) {
        checks.push({
          level:"warning",
          title:risk.name + " için yüksek sonuçsuz teklif oranı",
          detail:risk.problematic + "/" + risk.total +
            " teklif kaybedilmiş veya süresi dolmuş."
        });
      }
    });

    return checks;
  }

  function renderSystemChecks() {
    const root = $("systemCheckList");
    if (!root) return;
    const checks = buildSystemChecks();
    const critical = checks.filter(x=>x.level==="critical").length;
    const warning = checks.filter(x=>x.level==="warning").length;
    const unhealthyIds = new Set();

    institutionRecords.forEach(inst => {
      const h = getInstitutionHealth(inst);
      if (h.state !== "good") unhealthyIds.add(String(inst.id));
    });

    $("systemCriticalCount").textContent = critical;
    $("systemWarningCount").textContent = warning;
    $("systemHealthyCount").textContent =
      Math.max(0, institutionRecords.length - unhealthyIds.size);
    $("systemCheckCount").textContent = checks.length;

    root.innerHTML = checks.length ? checks.map(item => `
      <div class="system-check-row level-${item.level}">
        <span class="system-check-level">${item.level === "critical" ? "Kritik" : item.level === "warning" ? "Uyarı" : "Bilgi"}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </div>
      </div>
    `).join("") : '<div class="advanced-empty success">Sistem kontrolünde sorun bulunmadı.</div>';
  }

  $("runSystemChecks")?.addEventListener("click", async () => {
    try {
      await Promise.all([
        typeof loadInstitutions === "function" ? loadInstitutions() : Promise.resolve(),
        typeof loadInstitutionAccounts === "function" ? loadInstitutionAccounts() : Promise.resolve(),
        typeof loadQuoteRequests === "function" ? loadQuoteRequests() : Promise.resolve()
      ]);
    } catch (_) {}
    renderSystemChecks();
    addAudit("Sistem kontrolü çalıştırıldı","Kayıtlar yeniden tarandı.");
  });

  function fillSettingsForm() {
    $("settingProfileHealthMin").value = adminSettings.profileHealthMin;
    $("settingInactiveDays").value = adminSettings.inactiveDays;
    $("settingSupportSlaDays").value = adminSettings.supportSlaDays;
    $("settingDefaultReportPeriod").value = adminSettings.defaultReportPeriod;
  }

  $("adminSettingsForm")?.addEventListener("submit", event => {
    event.preventDefault();
    saveAdminSettingsLocal({
      profileHealthMin:Number($("settingProfileHealthMin").value || 70),
      inactiveDays:Number($("settingInactiveDays").value || 30),
      supportSlaDays:Number($("settingSupportSlaDays").value || 2),
      defaultReportPeriod:$("settingDefaultReportPeriod").value || "all"
    });
    if ($("offerReportPeriod")) {
      $("offerReportPeriod").value = adminSettings.defaultReportPeriod;
    }
    $("adminSettingsMessage").textContent = "Ayarlar bu yönetim cihazında kaydedildi.";
    addAudit("Yönetim ayarları güncellendi","Sağlık ve takip eşikleri değiştirildi.");
    renderSystemChecks();
    renderManagedInstitutions();
  });

  $("clearAdminAudit")?.addEventListener("click", () => {
    if (!confirm("İşlem geçmişi temizlensin mi?")) return;
    localStorage.removeItem("dijiyer_admin_audit");
    renderAudit();
  });

  function notificationItems() {
    const items = [];
    const pendingApps = applicationRecords.filter(
      x => String(x.status || "pending") === "pending"
    ).length;
    const pendingAccounts = institutionAccountRecords.filter(
      x => String(x.status || "pending") === "pending"
    ).length;
    const noOffer = quoteRequestRecords.filter(
      x => !Array.isArray(x.liveOffers) || x.liveOffers.length === 0
    ).length;
    const issueTotal = quoteRequestRecords.reduce(
      (sum,x)=>sum + Number(x.issueCount || 0),0
    );

    const openSupport = supportAdminRecords.filter(
      x => String(x.status || "new") !== "resolved"
    );
    const overdueMs = Number(adminSettings.supportSlaDays || 2) * 86400000;
    const overdue = openSupport.filter(x =>
      x.date && Date.now() - new Date(x.date).getTime() > overdueMs
    ).length;

    if (pendingApps) items.push({title:pendingApps+" kurum başvurusu bekliyor",tab:"applicationsTabBtn"});
    if (pendingAccounts) items.push({title:pendingAccounts+" kurum hesabı onay bekliyor",tab:"accountsTabBtn"});
    if (noOffer) items.push({title:noOffer+" talep henüz teklif almadı",tab:"quotesTabBtn"});
    if (issueTotal) items.push({title:issueTotal+" sorun/ihlal bildirimi var",tab:"issuesTabBtn"});
    if (openSupport.length) items.push({title:openSupport.length+" açık destek talebi var",tab:"supportTabBtn"});
    if (overdue) items.push({title:overdue+" destek talebi gecikmiş durumda",tab:"supportTabBtn",urgent:true});
    return items;
  }

  async function refreshAdminNotifications() {
    try {
      await loadSupportAdminRecords();
    } catch (_) {}

    const root = $("adminNotificationList");
    const items = notificationItems();
    $("adminNotificationBadge").textContent = items.length;
    $("adminNotificationBadge").classList.toggle("empty", !items.length);
    if (!root) return;

    root.innerHTML = items.length ? items.map((item,index) => `
      <button type="button" class="admin-notification-item ${item.urgent?"urgent":""}" data-notification-index="${index}">
        ${escapeHtml(item.title)}
      </button>
    `).join("") : '<div class="advanced-empty">Şu anda işlem gerektiren bildirim yok.</div>';

    root.querySelectorAll("[data-notification-index]").forEach(button => {
      button.addEventListener("click", () => {
        const item = items[Number(button.dataset.notificationIndex)];
        $("adminNotificationPanel").classList.add("hidden");
        $(item.tab)?.click();
      });
    });
  }

  $("adminNotificationBtn")?.addEventListener("click", event => {
    event.stopPropagation();
    refreshAdminNotifications();
    $("adminNotificationPanel")?.classList.toggle("hidden");
  });

  $("adminNotificationRefresh")?.addEventListener("click", event => {
    event.stopPropagation();
    refreshAdminNotifications();
  });

  document.addEventListener("click", event => {
    const wrap = document.querySelector(".admin-notification-wrap");
    if (wrap && !wrap.contains(event.target)) {
      $("adminNotificationPanel")?.classList.add("hidden");
    }
  });

  try {
    if ($("offerReportPeriod")) {
      $("offerReportPeriod").value = adminSettings.defaultReportPeriod || "all";
    }
  } catch (_) {}

  try {
    const originalQuickUpdateInstitution = quickUpdateInstitution;
    quickUpdateInstitution = async function(id,field,value) {
      const result = await originalQuickUpdateInstitution(id,field,value);
      const inst = institutionRecords.find(x=>String(x.id)===String(id));
      addAudit(
        "Kurum hızlı ayarı değiştirildi",
        (inst?.name || id) + " · " + field + " = " + String(value)
      );
      return result;
    };
  } catch (_) {}

  try {
    const originalDeleteInstitution = deleteInstitution;
    deleteInstitution = async function(id,name) {
      const result = await originalDeleteInstitution(id,name);
      addAudit("Kurum silme işlemi", name || id);
      return result;
    };
  } catch (_) {}

  const overviewRefresh = $("overviewRefreshBtn");
  overviewRefresh?.addEventListener("click", () => {
    setTimeout(refreshAdminNotifications, 800);
  });

  setTimeout(() => {
    decorateExistingInstitutionCards();
    populateAnnouncementTargets();
    renderAnnouncementHistory();
    renderSupportCenter();
    refreshAdminNotifications();
    renderAudit();
  }, 1200);
})();
