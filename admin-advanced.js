(() => {
  const $ = (id) => document.getElementById(id);
  const advancedSectionIds = ["bannerAdsSection","externalAdsSection","promotionPackagesSection","promotionOrdersSection","adCalendarSection","adRevenueSection","supportSection","announcementsSection","systemSection"];
  const baseSectionIds = [
    "overviewSection","applicationsSection","institutionsSection","quotesSection",
    "offerReportSection","issuesSection","accountsSection"
  ];
  const advancedTabIds = ["bannerAdsTabBtn","externalAdsTabBtn","promotionPackagesTabBtn","promotionOrdersTabBtn","adCalendarTabBtn","adRevenueTabBtn","supportTabBtn","announcementsTabBtn","systemTabBtn"];
  const baseTabIds = [
    "overviewTabBtn","applicationsTabBtn","institutionsTabBtn","quotesTabBtn",
    "offerReportTabBtn","issuesTabBtn","accountsTabBtn"
  ];

  const selectedInstitutionIds = new Set();
  let announcementSelectedIds = [];
  let supportAdminRecords = [];
  let promotionAdminRecords = [];
  let promotionPackageRecords = [];
  let bannerAdRecords = [];
  let externalAdRecords = [];
  let adAnalyticsRecords = [];
  let adCalendarCursor = new Date();
  let adCalendarSelectedDate = new Date();
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

  $("bannerAdsTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("bannerAdsSection","bannerAdsTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("bannerAdsTabBtn");
    await renderBannerAdsAdmin(true);
  });

  $("externalAdsTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("externalAdsSection","externalAdsTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("externalAdsTabBtn");
    await renderExternalAdsAdmin(true);
  });

  $("promotionPackagesTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("promotionPackagesSection","promotionPackagesTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("promotionPackagesTabBtn");
    await renderPromotionPackageAdmin(true);
  });

  $("promotionOrdersTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("promotionOrdersSection","promotionOrdersTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("promotionOrdersTabBtn");
    await renderPromotionOrdersAdmin(true);
  });

  $("adCalendarTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("adCalendarSection","adCalendarTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("adCalendarTabBtn");
    await renderAdCalendar(true);
  });

  $("adRevenueTabBtn")?.addEventListener("click", async () => {
    showAdvancedSection("adRevenueSection","adRevenueTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("adRevenueTabBtn");
    await renderAdRevenueCenter(true);
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
      ["Logo", Boolean(safeText(inst.logoUrl).trim())],
      ["Kapak görseli", Boolean(safeText(inst.coverUrl).trim())],
      ["Galeri / Video",
        Boolean(inst.video) ||
        Boolean(safeText(inst.locationVideoUrl || inst.profileVideoUrl || inst.videoUrl).trim()) ||
        (Array.isArray(inst.galleryUrls) && inst.galleryUrls.length > 0)
      ],
      ["Web / Instagram", Boolean(safeText(inst.website || inst.instagram).trim())]
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
    healthBox.className = "institution-health-box institution-health-actionable health-" + health.state;
    healthBox.innerHTML = `
      <div class="institution-health-summary">
        <div>
          <span>Kurum Sağlığı</span>
          <strong>%${health.score} · ${escapeHtml(health.label)}</strong>
        </div>
        <div class="institution-health-progress" aria-label="Profil tamamlama yüzdesi">
          <i style="width:${Math.max(0,Math.min(100,health.profileScore))}%"></i>
        </div>
        <small>Profil tamamlama: %${health.profileScore}</small>
      </div>

      <div class="institution-health-missing">
        <span>EKSİK ALANLAR</span>
        <div>
          ${health.missing.length
            ? health.missing.map(item=>'<b>✕ '+escapeHtml(item)+'</b>').join("")
            : '<b class="complete">✓ Profil bilgileri tamam</b>'}
        </div>
      </div>

      <div class="institution-health-activity">
        <span>Son Teklif</span>
        <strong>${health.latestEvent ? formatDateLocal(health.latestEvent) : "Henüz yok"}</strong>
        <small>${health.offerOpen ? "Teklif alımı açık" : "Teklif alımı kapalı"}</small>
      </div>

      <div class="institution-health-actions">
        <button type="button" data-health-edit>Eksikleri Tamamla</button>
        <button type="button" class="sales" data-health-suggest>Tanıtım Hizmeti Öner</button>
      </div>
    `;
    const healthSlot = card.querySelector(".institution-health-slot");
    (healthSlot || card).appendChild(healthBox);

    healthBox.querySelector("[data-health-edit]")?.addEventListener("click",()=>{
      if (typeof openInstitutionEdit === "function") {
        openInstitutionEdit(data.id,data);
      }
    });

    healthBox.querySelector("[data-health-suggest]")?.addEventListener("click",()=>{
      const recommendation = card.querySelector(".ad-recommendation");
      if (recommendation) {
        recommendation.scrollIntoView({behavior:"smooth",block:"center"});
        recommendation.classList.add("attention");
        setTimeout(()=>recommendation.classList.remove("attention"),1800);
        return;
      }
      card.querySelector(".ad-whatsapp-recommend")?.click();
    });

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

    if (action === "status_delete") {
      const ids = [...selectedInstitutionIds];
      if (!ids.length) {
        alert("Önce silinecek kurumları seçin.");
        return;
      }

      const selectedNames = institutionRecords
        .filter(item => selectedInstitutionIds.has(String(item.id)))
        .map(item => item.name || "Kurum");

      const preview = selectedNames.slice(0, 5).join(", ");
      const extra = selectedNames.length > 5
        ? " ve " + (selectedNames.length - 5) + " kurum daha"
        : "";

      const ok = confirm(
        ids.length + " kurum kalıcı olarak silinecek.\n\n" +
        preview + extra +
        "\n\nBu işlem geri alınamaz. Devam edilsin mi?"
      );
      if (!ok) return;

      const applyBtn = $("bulkInstitutionApply");
      const oldText = applyBtn?.textContent || "Uygula";
      if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.textContent = "Siliniyor...";
      }

      try {
        await Promise.all(
          ids.map(id => db.collection("institutions").doc(id).delete())
        );

        addAudit("Toplu kurum silme", ids.length + " kurum silindi");
        selectedInstitutionIds.clear();
        $("bulkInstitutionAction").value = "";
        if ($("bulkSelectVisible")) $("bulkSelectVisible").checked = false;
        await loadInstitutions();
        updateBulkSelectionUi();
      } catch (error) {
        console.error("Toplu kurum silme hatası:", error);
        alert("Seçilen kurumlardan bazıları silinemedi. Liste yeniden yüklenecek.");
        await loadInstitutions();
      } finally {
        if (applyBtn) {
          applyBtn.disabled = false;
          applyBtn.textContent = oldText;
        }
      }
      return;
    }

    const actions = {
      offer_on:["offer",true,"Teklif alımı açıldı"],
      offer_off:["offer",false,"Teklif alımı kapatıldı"],
      vip_on:["vip",true,"VIP yapıldı"],
      vip_off:["vip",false,"VIP kaldırıldı"],
      video_on:["video",true,"Videolu işaretlendi"],
      video_off:["video",false,"Video işareti kaldırıldı"],
      status_active:["status","active","Kurum aktif yapıldı"],
      status_passive:["status","passive","Kurum pasif yapıldı"],
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

  function bannerCategoryLabel(value){
    if(!value)return "Tüm Sektörler";
    if(typeof getReportCategoryLabel==="function"){
      try{return getReportCategoryLabel(value)||value}catch(_){}
    }
    return value;
  }

  function fillBannerAdTargetOptions(selectedInstitution=null){
    const institutionSelect=$("bannerAdInstitution");
    const citySelect=$("bannerAdCity");
    const districtSelect=$("bannerAdDistrict");
    const categorySelect=$("bannerAdCategory");
    if(!institutionSelect||!citySelect||!districtSelect||!categorySelect)return;

    const oldInstitution=institutionSelect.value;
    institutionSelect.innerHTML='<option value="">Kurum seçin</option>'+
      [...institutionRecords].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"tr")).map(item=>
        '<option value="'+escapeHtml(item.id)+'">'+escapeHtml(item.name||"Kurum")+' · '+escapeHtml([item.city,item.district].filter(Boolean).join(" / "))+'</option>'
      ).join("");
    institutionSelect.value=selectedInstitution?.id || oldInstitution || "";

    const cities=[...new Set(institutionRecords.map(x=>String(x.city||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
    const wantedCity=selectedInstitution?.city || citySelect.dataset.current || citySelect.value || "";
    citySelect.innerHTML='<option value="">Tüm Bölgeler</option>'+cities.map(city=>'<option value="'+escapeHtml(city)+'">'+escapeHtml(city)+'</option>').join("");
    citySelect.value=wantedCity;

    const districts=[...new Set(institutionRecords.filter(x=>!citySelect.value||String(x.city||"")===String(citySelect.value)).map(x=>String(x.district||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
    const wantedDistrict=selectedInstitution?.district || districtSelect.dataset.current || "";
    districtSelect.innerHTML='<option value="">Tüm İlçeler</option>'+districts.map(d=>'<option value="'+escapeHtml(d)+'">'+escapeHtml(d)+'</option>').join("");
    districtSelect.value=wantedDistrict;

    const categories=[...new Set(institutionRecords.map(x=>String(x.subCategory||x.category||"").trim()).filter(Boolean))].sort((a,b)=>bannerCategoryLabel(a).localeCompare(bannerCategoryLabel(b),"tr"));
    const wantedCategory=selectedInstitution?.subCategory || selectedInstitution?.category || categorySelect.dataset.current || "";
    categorySelect.innerHTML='<option value="">Tüm Sektörler</option>'+categories.map(value=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(bannerCategoryLabel(value))+'</option>').join("");
    categorySelect.value=wantedCategory;
  }

  function selectedBannerInstitution(){
    const id=String($("bannerAdInstitution")?.value||"");
    return institutionRecords.find(item=>String(item.id)===id)||null;
  }

  function setBannerUploadProgress(percent,text){
    const wrap=$("bannerAdUploadProgress");
    const bar=$("bannerAdUploadProgressBar");
    const label=$("bannerAdUploadProgressText");
    if(!wrap||!bar||!label)return;
    if(percent===null){
      wrap.classList.add("hidden");
      bar.style.width="0%";
      label.textContent="";
      return;
    }
    wrap.classList.remove("hidden");
    bar.style.width=Math.max(0,Math.min(100,percent))+"%";
    label.textContent=text||("Yükleniyor... %"+Math.round(percent));
  }

  function bannerSafeFileName(name){
    return String(name||"dosya")
      .toLocaleLowerCase("tr-TR")
      .replace(/[çÇ]/g,"c").replace(/[ğĞ]/g,"g").replace(/[ıİ]/g,"i")
      .replace(/[öÖ]/g,"o").replace(/[şŞ]/g,"s").replace(/[üÜ]/g,"u")
      .replace(/[^a-z0-9._-]+/g,"-")
      .replace(/-+/g,"-")
      .slice(-90);
  }

  const CLOUDINARY_BANNER_SETTINGS_KEY="dijiyer_cloudinary_banner";
  const CLOUDINARY_BANNER_DEFAULTS={
    cloudName:"okefpzsy",
    uploadPreset:"dijiyer_upload"
  };

  function loadCloudinaryBannerSettings(){
    try{
      const parsed=JSON.parse(localStorage.getItem(CLOUDINARY_BANNER_SETTINGS_KEY)||"{}");
      const cloudName=String(parsed.cloudName||CLOUDINARY_BANNER_DEFAULTS.cloudName||"").trim();
      const uploadPreset=String(parsed.uploadPreset||CLOUDINARY_BANNER_DEFAULTS.uploadPreset||"").trim();

      if(
        cloudName &&
        uploadPreset &&
        (!parsed.cloudName || !parsed.uploadPreset)
      ){
        localStorage.setItem(
          CLOUDINARY_BANNER_SETTINGS_KEY,
          JSON.stringify({cloudName,uploadPreset})
        );
      }

      return {cloudName,uploadPreset};
    }catch(_){
      return {...CLOUDINARY_BANNER_DEFAULTS};
    }
  }

  function cloudinaryBannerReady(){
    const settings=loadCloudinaryBannerSettings();
    return Boolean(settings.cloudName&&settings.uploadPreset);
  }

  function fillCloudinaryBannerSettings(){
    const settings=loadCloudinaryBannerSettings();
    if($("cloudinaryCloudName"))$("cloudinaryCloudName").value=settings.cloudName;
    if($("cloudinaryUploadPreset"))$("cloudinaryUploadPreset").value=settings.uploadPreset;

    const summary=$("cloudinaryConfigSummary");
    if(summary){
      summary.textContent=settings.cloudName&&settings.uploadPreset
        ? "Bağlı · "+settings.cloudName+" · "+settings.uploadPreset
        : "Kurulum gerekli";
      summary.classList.toggle("ready",Boolean(settings.cloudName&&settings.uploadPreset));
    }
  }

  function saveCloudinaryBannerSettings(){
    const cloudName=String($("cloudinaryCloudName")?.value||"").trim();
    const uploadPreset=String($("cloudinaryUploadPreset")?.value||"").trim();
    const message=$("cloudinaryConfigMessage");

    if(!cloudName||!uploadPreset){
      if(message)message.textContent="Cloud Name ve Unsigned Upload Preset alanlarını doldurun.";
      return;
    }

    localStorage.setItem(
      CLOUDINARY_BANNER_SETTINGS_KEY,
      JSON.stringify({cloudName,uploadPreset})
    );

    if(message)message.textContent="Cloudinary bağlantısı hazır. Görsel ve video doğrudan yüklenebilir.";
    fillCloudinaryBannerSettings();
  }

  function openCloudinarySetup(messageText){
    const details=$("cloudinaryConfigDetails");
    if(details)details.open=true;
    const message=$("cloudinaryConfigMessage");
    if(message)message.textContent=messageText||"Önce ücretsiz Cloudinary ayarını tamamlayın.";
    $("cloudinaryCloudName")?.focus();
  }

  function syncBannerMediaBadge(){
    const badge=$("bannerAdMediaTypeBadge");
    if(!badge)return;
    const type=$("bannerAdMediaType")?.value==="video"?"video":"image";
    badge.textContent=type==="video"?"🎬 Video":"🖼 Görsel";
    badge.classList.toggle("video",type==="video");
  }

  async function uploadBannerMedia(file,type){
    const inst=selectedBannerInstitution();
    const message=$("bannerAdUploadMessage");

    if(!inst){
      if(message)message.textContent="Önce reklam veren kurumu seçin.";
      return;
    }
    if(!file)return;

    const settings=loadCloudinaryBannerSettings();
    if(!settings.cloudName||!settings.uploadPreset){
      if(message)message.textContent="Önce ücretsiz medya yükleme ayarını yapın.";
      openCloudinarySetup("Cloudinary Cloud Name ve Unsigned Upload Preset bilgilerini girip Ayarı Kaydet'e basın.");
      return;
    }

    const isVideo=type==="video";
    const valid=isVideo
      ? ["video/mp4","video/webm"].includes(file.type)
      : ["image/jpeg","image/png","image/webp"].includes(file.type);
    const maxBytes=isVideo ? 30*1024*1024 : 8*1024*1024;

    if(!valid){
      if(message)message.textContent=isVideo
        ? "Video için MP4 veya WebM seçin."
        : "Görsel için JPG, PNG veya WebP seçin.";
      return;
    }
    if(file.size>maxBytes){
      if(message)message.textContent=isVideo
        ? "Video en fazla 30 MB olabilir."
        : "Görsel en fazla 8 MB olabilir.";
      return;
    }

    if(message)message.textContent="Cloudinary'ye yükleniyor...";
    setBannerUploadProgress(0,"Yükleniyor... %0");

    const formData=new FormData();
    formData.append("file",file);
    formData.append("upload_preset",settings.uploadPreset);
    formData.append("folder","dijiyer/bannerAds/"+String(inst.id));

    try{
      const result=await new Promise((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.open(
          "POST",
          "https://api.cloudinary.com/v1_1/"+encodeURIComponent(settings.cloudName)+"/auto/upload",
          true
        );

        xhr.upload.onprogress=event=>{
          if(!event.lengthComputable)return;
          const percent=(event.loaded/event.total)*100;
          setBannerUploadProgress(percent,"Yükleniyor... %"+Math.round(percent));
        };

        xhr.onerror=()=>reject(new Error("Ağ bağlantısı sırasında yükleme başarısız oldu."));
        xhr.onload=()=>{
          let data={};
          try{data=JSON.parse(xhr.responseText||"{}")}catch(_){}
          if(xhr.status>=200&&xhr.status<300&&data.secure_url){
            resolve(data);
          }else{
            reject(new Error(data?.error?.message||"Cloudinary yükleme hatası."));
          }
        };

        xhr.send(formData);
      });

      const url=String(result.secure_url||"");
      if(!url)throw new Error("Cloudinary dosya adresi dönmedi.");

      if(isVideo){
        $("bannerAdVideoUrl").value=url;
        $("bannerAdVideoUrlManual").value=url;
        $("bannerAdMediaType").value="video";
        if(message)message.textContent="Video ücretsiz Cloudinary hesabına yüklendi.";
      }else{
        $("bannerAdImageUrl").value=url;
        $("bannerAdVideoUrl").value="";
        $("bannerAdVideoUrlManual").value="";
        $("bannerAdMediaType").value="image";
        if(message)message.textContent="Görsel ücretsiz Cloudinary hesabına yüklendi.";
      }

      setBannerUploadProgress(100,"Yükleme tamamlandı");
      syncBannerMediaBadge();
      renderBannerAdminPreview();
      setTimeout(()=>setBannerUploadProgress(null,""),900);
    }catch(error){
      console.error("Cloudinary banner medya yüklemesi başarısız:",error);
      setBannerUploadProgress(null,"");
      if(message){
        const text=String(error?.message||"");
        message.textContent=text.toLowerCase().includes("preset")
          ? "Upload Preset bulunamadı veya unsigned değil. Cloudinary ayarını kontrol edin."
          : "Dosya yüklenemedi: "+(text||"Lütfen tekrar deneyin.");
      }
      openCloudinarySetup("");
    }
  }

  function clearBannerMedia(){
    if($("bannerAdImageUrl"))$("bannerAdImageUrl").value="";
    if($("bannerAdVideoUrl"))$("bannerAdVideoUrl").value="";
    if($("bannerAdVideoUrlManual"))$("bannerAdVideoUrlManual").value="";
    if($("bannerAdMediaType"))$("bannerAdMediaType").value="image";
    if($("bannerAdImageFile"))$("bannerAdImageFile").value="";
    if($("bannerAdVideoFile"))$("bannerAdVideoFile").value="";
    if($("bannerAdUploadMessage"))$("bannerAdUploadMessage").textContent="Medya temizlendi. Kaydedince kurum kapak görseli kullanılabilir.";
    syncBannerMediaBadge();
    renderBannerAdminPreview();
  }

  function renderBannerAdminPreview(){
    const root=$("bannerAdPreview");
    if(!root)return;
    const inst=selectedBannerInstitution();
    const headline=String($("bannerAdHeadline")?.value||"").trim()||inst?.name||"Banner önizlemesi";
    const text=String($("bannerAdText")?.value||"").trim()||[inst?.city,inst?.district].filter(Boolean).join(" / ")||"Reklam metni";
    const manualVideo=String($("bannerAdVideoUrlManual")?.value||"").trim();
    if(manualVideo){
      $("bannerAdVideoUrl").value=manualVideo;
      $("bannerAdMediaType").value="video";
    }
    const type=$("bannerAdMediaType")?.value==="video"?"video":"image";
    const video=String($("bannerAdVideoUrl")?.value||"").trim();
    const image=String($("bannerAdImageUrl")?.value||"").trim()||inst?.coverUrl||inst?.logoUrl||"";

    root.style.backgroundImage="";
    if(type==="video" && video){
      root.innerHTML=
        '<video src="'+escapeHtml(video)+'" autoplay muted loop playsinline></video>'+
        '<div class="banner-preview-shade"></div>'+
        '<span>SPONSORLU</span><strong>'+escapeHtml(headline)+'</strong><small>'+escapeHtml(text)+'</small>';
    }else{
      root.style.backgroundImage=image
        ? 'linear-gradient(90deg,rgba(10,22,40,.82),rgba(10,22,40,.2)),url("'+String(image).replace(/"/g,"%22")+'")'
        : "";
      root.innerHTML='<span>SPONSORLU</span><strong>'+escapeHtml(headline)+'</strong><small>'+escapeHtml(text)+'</small>';
    }
    syncBannerMediaBadge();
  }

  function normalizeBannerPlacement(value){
    const raw=String(value||"search");
    if(raw==="sponsor")return "home_sponsor";
    const allowed=new Set([
      "search",
      "home_sponsor",
      "premium_home",
      "mobile_sponsor",
      "sidebar_sponsor",
      "detail_banner",
      "page_top_mini"
    ]);
    return allowed.has(raw)?raw:"search";
  }

  function bannerPlacementLabel(value){
    const labels={
      search:"Arama Sonuçları",
      home_sponsor:"Bölgenizde Öne Çıkanlar",
      premium_home:"Ana Sayfa Premium Vitrini",
      mobile_sponsor:"Mobil 2’li Sponsor Alanı",
      sidebar_sponsor:"Masaüstü Yan Sponsor",
      detail_banner:"Kurum Hızlı Önizleme Altı",
      page_top_mini:"Sayfa Üstü Mini Banner"
    };
    return labels[normalizeBannerPlacement(value)]||labels.search;
  }

  function resetBannerAdForm(){
    $("bannerAdForm")?.reset();
    if($("bannerAdEditId"))$("bannerAdEditId").value="";
    if($("bannerAdFormTitle"))$("bannerAdFormTitle").textContent="Yeni Banner Reklamı";
    if($("bannerAdActive"))$("bannerAdActive").checked=true;
    if($("bannerAdDuration"))$("bannerAdDuration").value="7";
    if($("bannerAdPrice"))$("bannerAdPrice").value="0";
    if($("bannerAdPaymentStatus"))$("bannerAdPaymentStatus").value="unpaid";
    if($("bannerAdPlacement"))$("bannerAdPlacement").value="search";
    if($("bannerAdMediaType"))$("bannerAdMediaType").value="image";
    if($("bannerAdVideoUrl"))$("bannerAdVideoUrl").value="";
    if($("bannerAdVideoUrlManual"))$("bannerAdVideoUrlManual").value="";
    if($("bannerAdUploadMessage"))$("bannerAdUploadMessage").textContent="";
    setBannerUploadProgress(null,"");
    fillCloudinaryBannerSettings();
    ["bannerAdCity","bannerAdDistrict","bannerAdCategory"].forEach(id=>{if($(id))delete $(id).dataset.current;});
    fillBannerAdTargetOptions();
    if($("bannerAdMessage"))$("bannerAdMessage").textContent="";
    syncBannerMediaBadge();
    renderBannerAdminPreview();
  }

  async function loadBannerAdsAdmin(){
    try{
      const snapshot=await db.collection("bannerAds").get();
      bannerAdRecords=snapshot.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
    }catch(error){
      console.error("Banner reklamları yüklenemedi:",error);
      bannerAdRecords=[];
    }
    return bannerAdRecords;
  }

  function editBannerAd(id){
    const item=bannerAdRecords.find(x=>x.id===id);
    if(!item)return;
    const inst=institutionRecords.find(x=>String(x.id)===String(item.institutionId))||null;
    $("bannerAdEditId").value=item.id;
    $("bannerAdFormTitle").textContent="Banner Reklamını Düzenle";
    fillBannerAdTargetOptions(inst);
    $("bannerAdInstitution").value=item.institutionId||"";
    $("bannerAdHeadline").value=item.headline||"";
    $("bannerAdText").value=item.text||"";
    $("bannerAdImageUrl").value=item.imageUrl||"";
    $("bannerAdVideoUrl").value=item.videoUrl||"";
    $("bannerAdVideoUrlManual").value=item.videoUrl||"";
    $("bannerAdMediaType").value=item.mediaType==="video"&&item.videoUrl?"video":"image";
    $("bannerAdCity").dataset.current=item.city||"";
    $("bannerAdDistrict").dataset.current=item.district||"";
    $("bannerAdCategory").dataset.current=item.category||"";
    fillBannerAdTargetOptions();
    $("bannerAdCity").value=item.city||"";
    $("bannerAdDistrict").value=item.district||"";
    $("bannerAdCategory").value=item.category||"";
    $("bannerAdDuration").value=String([3,5,7].includes(Number(item.durationSeconds))?Number(item.durationSeconds):7);
    if($("bannerAdPrice"))$("bannerAdPrice").value=String(Math.max(0,Number(item.salePrice||0)));
    if($("bannerAdPaymentStatus"))$("bannerAdPaymentStatus").value=String(item.paymentStatus||"unpaid");
    if($("bannerAdPlacement"))$("bannerAdPlacement").value=normalizeBannerPlacement(item.placement);
    $("bannerAdStartAt").value=item.startAt||"";
    $("bannerAdEndAt").value=item.endAt||"";
    $("bannerAdActive").checked=item.active!==false;
    renderBannerAdminPreview();
    $("bannerAdForm")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function syncSourcePromotionFromBanner(item,nextData,nextActive) {
    const sourceOrderId=String(item?.sourceOrderId || "");
    if(!sourceOrderId)return;

    let order=promotionAdminRecords.find(x=>String(x.id)===sourceOrderId) || null;

    if(!order){
      try{
        const orderDoc=await db.collection("promotionOrders").doc(sourceOrderId).get();
        if(orderDoc.exists)order={id:orderDoc.id,...orderDoc.data()};
      }catch(error){
        console.warn("Kaynak sipariş yüklenemedi:",error);
      }
    }

    const institutionId=String(nextData?.institutionId || item?.institutionId || order?.institutionId || "");
    const now=new Date().toISOString();

    const orderUpdate={
      status:nextActive ? "completed" : "preparing",
      adPlacement:String(nextData?.placement || item?.placement || order?.adPlacement || ""),
      adStartAt:String(nextData?.startAt || item?.startAt || order?.adStartAt || ""),
      adEndAt:String(nextData?.endAt || item?.endAt || order?.adEndAt || ""),
      updatedAt:now
    };

    if(nextActive && !order?.adPublishedAt){
      orderUpdate.adPublishedAt=now;
    }

    const updates=[
      db.collection("promotionOrders").doc(sourceOrderId).update(orderUpdate)
    ];

    if(institutionId){
      const packageId=adPackageForPromotionOrder(order || {});
      const total=Number(order?.priceBreakdown?.total ?? order?.price ?? 0);
      updates.push(
        db.collection("institutions").doc(institutionId).update({
          adStatus:nextActive ? "active" : "paused",
          adPackage:packageId,
          adStartAt:String(nextData?.startAt || item?.startAt || ""),
          adEndAt:String(nextData?.endAt || item?.endAt || ""),
          adPrice:total,
          adPaymentStatus:"paid",
          adUpdatedAt:now,
          updatedAt:now
        })
      );
    }

    await Promise.all(updates);
  }

  async function saveBannerAd(event){
    event.preventDefault();

    const editId=String($("bannerAdEditId")?.value||"");
    const inst=selectedBannerInstitution();

    if(!inst){
      $("bannerAdMessage").textContent="Önce reklam veren kurumu seçin.";
      return;
    }

    const ref=editId
      ? db.collection("bannerAds").doc(editId)
      : db.collection("bannerAds").doc();

    const existing=bannerAdRecords.find(x=>x.id===editId);
    const now=new Date().toISOString();
    const headline=String($("bannerAdHeadline")?.value||"").trim()||inst.name||"Sponsorlu Kurum";

    const data={
      adCode:existing?.adCode||uid("BNR"),
      institutionId:String(inst.id),
      institutionName:String(inst.name||"Kurum"),
      logoUrl:String(inst.logoUrl||""),
      headline,
      text:String($("bannerAdText")?.value||"").trim(),
      mediaType:$("bannerAdMediaType")?.value==="video"&&String($("bannerAdVideoUrl")?.value||"").trim()
        ? "video"
        : "image",
      imageUrl:String($("bannerAdImageUrl")?.value||"").trim()||String(inst.coverUrl||inst.logoUrl||""),
      videoUrl:String($("bannerAdVideoUrl")?.value||"").trim(),
      city:String($("bannerAdCity")?.value||""),
      district:String($("bannerAdDistrict")?.value||""),
      category:String($("bannerAdCategory")?.value||""),
      categoryLabel:bannerCategoryLabel($("bannerAdCategory")?.value||""),
      durationSeconds:[3,5,7].includes(Number($("bannerAdDuration")?.value))
        ? Number($("bannerAdDuration")?.value)
        : 7,
      salePrice:Math.max(0,Number($("bannerAdPrice")?.value||0)),
      paymentStatus:String($("bannerAdPaymentStatus")?.value||"unpaid"),
      paidAt:String($("bannerAdPaymentStatus")?.value||"unpaid")==="paid"
        ? (existing?.paidAt || now)
        : "",
      placement:normalizeBannerPlacement($("bannerAdPlacement")?.value),
      startAt:String($("bannerAdStartAt")?.value||""),
      endAt:String($("bannerAdEndAt")?.value||""),
      active:Boolean($("bannerAdActive")?.checked),
      updatedAt:now
    };

    if(existing?.sourceOrderId){
      data.sourceOrderId=String(existing.sourceOrderId);
      data.sourceOrderCode=String(existing.sourceOrderCode||"");
    }

    if(!existing)data.createdAt=now;

    try{
      await ref.set(data,{merge:true});

      if(existing?.sourceOrderId){
        await syncSourcePromotionFromBanner(existing,data,data.active);
        await loadPromotionAdminRecords();
      }

      addAudit(
        editId ? "Banner reklamı güncellendi" : "Banner reklama kurum eklendi",
        (inst.name||headline) + " · " + (data.active ? "Yayında" : "Taslak / Pasif")
      );

      $("bannerAdMessage").textContent=data.active
        ? "Banner reklamı kaydedildi ve yayına alındı."
        : "Banner reklamı taslak / pasif olarak kaydedildi.";

      await renderBannerAdsAdmin(true);
      renderManagedInstitutions();
      renderTodayTasks();

      setTimeout(resetBannerAdForm,350);
    }catch(error){
      console.error("Banner reklamı kaydedilemedi:",error);
      const code=String(error?.code || "");
      const detail=String(error?.message || "");
      if(code.includes("permission-denied")){
        $("bannerAdMessage").textContent="Banner kaydedilemedi: Firestore yazma izni reddedildi (permission-denied). Rules içinde bannerAds ve yeni 'page_top_mini' gösterim iznini kontrol edin.";
      }else{
        $("bannerAdMessage").textContent="Banner kaydedilemedi"+(code ? " · "+code : "")+(detail ? " · "+detail : "");
      }
    }
  }

  async function toggleBannerAd(id){
    const item=bannerAdRecords.find(x=>x.id===id);
    if(!item)return;

    const nextActive=item.active===false;
    const now=new Date().toISOString();

    try{
      await db.collection("bannerAds").doc(id).update({
        active:nextActive,
        updatedAt:now
      });

      if(item.sourceOrderId){
        await syncSourcePromotionFromBanner(
          item,
          {
            ...item,
            active:nextActive,
            updatedAt:now
          },
          nextActive
        );
        await loadPromotionAdminRecords();
      }

      addAudit(
        nextActive ? "Banner yayına alındı" : "Banner duraklatıldı",
        item.institutionName || item.headline || id
      );

      await renderBannerAdsAdmin(true);
      renderManagedInstitutions();
      renderTodayTasks();
    }catch(error){
      console.error(error);
      alert("Banner durumu değiştirilemedi.");
    }
  }

  async function deleteBannerAd(id){
    const item=bannerAdRecords.find(x=>x.id===id);
    if(!item)return;

    if(!confirm('"'+(item.institutionName||"Banner")+'" reklamdan kaldırılsın mı?'))return;

    try{
      await db.collection("bannerAds").doc(id).delete();

      if(item.sourceOrderId){
        const now=new Date().toISOString();
        await db.collection("promotionOrders").doc(String(item.sourceOrderId)).update({
          convertedToAd:false,
          bannerAdId:"",
          status:"preparing",
          updatedAt:now
        });

        if(item.institutionId){
          await db.collection("institutions").doc(String(item.institutionId)).update({
            adStatus:"paused",
            adUpdatedAt:now,
            updatedAt:now
          });
        }

        await loadPromotionAdminRecords();
      }

      addAudit("Banner reklamı kaldırıldı",item.institutionName||id);
      await renderBannerAdsAdmin(true);
      renderManagedInstitutions();
      renderTodayTasks();
    }catch(error){
      console.error(error);
      alert("Banner reklamı silinemedi.");
    }
  }

  async function renderBannerAdsAdmin(reload=false){
    const root=$("bannerAdAdminList");if(!root)return;
    fillBannerAdTargetOptions();
    if(reload||!bannerAdRecords.length)await loadBannerAdsAdmin();
    const q=normalize($("bannerAdSearch")?.value||"");
    const rows=bannerAdRecords.filter(item=>!q||normalize([item.institutionName,item.headline,item.text,item.city,item.district,item.categoryLabel,item.category,bannerPlacementLabel(item.placement)].join(" ")).includes(q));
    const activeCount=bannerAdRecords.filter(x=>x.active!==false).length;
    if($("bannerAdAdminCount"))$("bannerAdAdminCount").textContent=bannerAdRecords.length+" reklam · "+activeCount+" yayında · "+(bannerAdRecords.length-activeCount)+" pasif";
    if($("bannerAdsTabCount"))$("bannerAdsTabCount").textContent=activeCount;

    root.innerHTML=rows.length?rows.map(item=>{
      const hasVideo=item.mediaType==="video"&&item.videoUrl;
      const bg=!hasVideo&&item.imageUrl?' style="background-image:linear-gradient(90deg,rgba(10,22,40,.76),rgba(10,22,40,.2)),url(\''+escapeHtml(item.imageUrl)+'\')" ':"";
      const media=hasVideo
        ? '<video src="'+escapeHtml(item.videoUrl)+'" autoplay muted loop playsinline></video><div class="banner-admin-video-shade"></div>'
        : "";
      return '<article class="banner-admin-card '+(item.active===false?"is-passive":"")+'">'+
        '<div class="banner-admin-card-visual"'+bg+'>'+
          media+
          '<span>SPONSORLU</span><strong>'+escapeHtml(item.headline||item.institutionName||"Banner Reklamı")+'</strong><small>'+escapeHtml(item.text||item.institutionName||"")+'</small>'+
        '</div>'+
        '<div class="banner-admin-card-meta">'+
          '<div><span>Kurum</span><strong>'+escapeHtml(item.institutionName||"-")+'</strong></div>'+
          '<div><span>Bölge</span><strong>'+escapeHtml([item.city,item.district].filter(Boolean).join(" / ")||"Tüm Bölgeler")+'</strong></div>'+
          '<div><span>Sektör</span><strong>'+escapeHtml(item.categoryLabel||bannerCategoryLabel(item.category)||"Tüm Sektörler")+'</strong></div>'+
          '<div><span>Gösterim</span><strong>'+bannerPlacementLabel(item.placement)+'</strong></div>'+
          '<div><span>Dönüş</span><strong>'+([3,5,7].includes(Number(item.durationSeconds))?Number(item.durationSeconds):7)+' sn</strong></div>'+
          '<div><span>Satış</span><strong>'+money(Number(item.salePrice||0))+'</strong></div>'+
          '<div><span>Ödeme</span><strong>'+(
            item.paymentStatus==="paid"
              ? "Ödendi"
              : item.paymentStatus==="partial"
                ? "Kısmi"
                : "Bekliyor"
          )+'</strong></div>'+
        '</div>'+
        '<div class="banner-admin-card-actions">'+
          '<span class="banner-state '+(item.active===false?"passive":"active")+'">'+(item.active===false?"Pasif":"Yayında")+'</span>'+
          '<button type="button" data-banner-edit="'+escapeHtml(item.id)+'">Düzenle</button>'+
          '<button type="button" data-banner-toggle="'+escapeHtml(item.id)+'">'+(item.active===false?"Yayına Al":"Duraklat")+'</button>'+
          '<button type="button" class="danger" data-banner-delete="'+escapeHtml(item.id)+'">Reklamdan Çıkar</button>'+
        '</div></article>';
    }).join(""):'<div class="advanced-empty">Banner reklamı bulunamadı.</div>';

    root.querySelectorAll("[data-banner-edit]").forEach(btn=>btn.addEventListener("click",()=>editBannerAd(btn.dataset.bannerEdit)));
    root.querySelectorAll("[data-banner-toggle]").forEach(btn=>btn.addEventListener("click",()=>toggleBannerAd(btn.dataset.bannerToggle)));
    root.querySelectorAll("[data-banner-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteBannerAd(btn.dataset.bannerDelete)));
  }

  window.openBannerAdForInstitution = async institutionId => {
    showAdvancedSection("bannerAdsSection","bannerAdsTabBtn");
    if (typeof syncSimpleAdminNavigation === "function") syncSimpleAdminNavigation("bannerAdsTabBtn");
    await loadBannerAdsAdmin();
    const inst=institutionRecords.find(item=>String(item.id)===String(institutionId));
    resetBannerAdForm();
    if(inst){
      fillBannerAdTargetOptions(inst);
      $("bannerAdInstitution").value=String(inst.id);
      $("bannerAdHeadline").value=inst.name||"";
      $("bannerAdText").value=[inst.city,inst.district].filter(Boolean).join(" / ");
      $("bannerAdImageUrl").value=inst.coverUrl||inst.logoUrl||"";
      renderBannerAdminPreview();
    }
    await renderBannerAdsAdmin(false);
  };

  $("cloudinarySaveBtn")?.addEventListener("click",saveCloudinaryBannerSettings);
  fillCloudinaryBannerSettings();

  $("bannerAdImageUploadBtn")?.addEventListener("click",()=>{
    if(!cloudinaryBannerReady()){
      openCloudinarySetup("Önce ücretsiz Cloudinary bağlantısını kurun.");
      return;
    }
    $("bannerAdImageFile")?.click();
  });
  $("bannerAdVideoUploadBtn")?.addEventListener("click",()=>{
    if(!cloudinaryBannerReady()){
      openCloudinarySetup("Önce ücretsiz Cloudinary bağlantısını kurun.");
      return;
    }
    $("bannerAdVideoFile")?.click();
  });
  $("bannerAdMediaClearBtn")?.addEventListener("click",clearBannerMedia);
  $("bannerAdImageFile")?.addEventListener("change",event=>uploadBannerMedia(event.target.files?.[0],"image"));
  $("bannerAdVideoFile")?.addEventListener("change",event=>uploadBannerMedia(event.target.files?.[0],"video"));
  $("bannerAdVideoUrlManual")?.addEventListener("input",()=>{
    const value=String($("bannerAdVideoUrlManual")?.value||"").trim();
    $("bannerAdVideoUrl").value=value;
    if(value)$("bannerAdMediaType").value="video";
    renderBannerAdminPreview();
  });

  $("bannerAdForm")?.addEventListener("submit",saveBannerAd);
  $("bannerAdNewBtn")?.addEventListener("click",resetBannerAdForm);
  $("bannerAdCancelBtn")?.addEventListener("click",resetBannerAdForm);
  $("bannerAdSearch")?.addEventListener("input",()=>renderBannerAdsAdmin(false));
  $("bannerAdInstitution")?.addEventListener("change",()=>{
    const inst=selectedBannerInstitution();
    if(inst){
      $("bannerAdHeadline").value=inst.name||"";
      $("bannerAdText").value=[inst.city,inst.district].filter(Boolean).join(" / ");
      $("bannerAdImageUrl").value=inst.coverUrl||inst.logoUrl||"";
      if(!$("bannerAdVideoUrl")?.value){
        $("bannerAdMediaType").value="image";
      }
      fillBannerAdTargetOptions(inst);
    }
    renderBannerAdminPreview();
  });
  $("bannerAdCity")?.addEventListener("change",()=>{
    const city=$("bannerAdCity").value;
    const districts=[...new Set(institutionRecords.filter(x=>!city||String(x.city||"")===String(city)).map(x=>String(x.district||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
    $("bannerAdDistrict").innerHTML='<option value="">Tüm İlçeler</option>'+districts.map(d=>'<option value="'+escapeHtml(d)+'">'+escapeHtml(d)+'</option>').join("");
    renderBannerAdminPreview();
  });
  ["bannerAdHeadline","bannerAdText","bannerAdImageUrl"].forEach(id=>$(id)?.addEventListener("input",()=>{
    if(id==="bannerAdImageUrl" && String($(id)?.value||"").trim())$("bannerAdMediaType").value="image";
    renderBannerAdminPreview();
  }));


  function externalAdDateTimeLocal(value){
    if(!value)return "";
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    const local=new Date(date.getTime()-date.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,16);
  }

  function externalAdIsoFromInput(value){
    if(!value)return "";
    const date=new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function externalAdStatus(item){
    if(item.active===false)return {key:"passive",label:"Pasif"};
    const now=Date.now();
    const start=item.startAt ? new Date(item.startAt).getTime() : 0;
    const end=item.endAt ? new Date(item.endAt).getTime() : 0;
    if(start && start>now)return {key:"planned",label:"Planlandı"};
    if(end && end<now)return {key:"expired",label:"Süresi Doldu"};
    return {key:"active",label:"Yayında"};
  }

  function safeExternalAdminUrl(value){
    const raw=String(value||"").trim();
    if(!raw)return "";
    try{
      const url=new URL(raw);
      return ["http:","https:"].includes(url.protocol) ? url.href : "";
    }catch(_){
      return "";
    }
  }

  function renderExternalAdPreview(){
    const root=$("externalAdPreview");
    if(!root)return;
    const brand=String($("externalAdBrand")?.value||"").trim()||"Marka";
    const headline=String($("externalAdHeadline")?.value||"").trim()||"Reklam başlığı";
    const type=String($("externalAdMediaType")?.value||"image");
    const image=safeExternalAdminUrl($("externalAdImageUrl")?.value);
    const video=safeExternalAdminUrl($("externalAdVideoUrl")?.value);
    const media=type==="video" && video
      ? '<video src="'+escapeHtml(video)+'" autoplay muted loop playsinline></video>'
      : image
        ? '<img src="'+escapeHtml(image)+'" alt="">'
        : '<div class="external-ad-preview-empty">Banner medyası ekleyin</div>';
    root.innerHTML=
      '<div class="external-ad-preview-media">'+media+'</div>'+
      '<div class="external-ad-preview-copy"><span>REKLAM</span><strong>'+escapeHtml(brand)+'</strong><small>'+escapeHtml(headline)+'</small></div>';
  }

  async function uploadExternalAdMedia(file,type){
    if(!file)return;
    const message=$("externalAdUploadMessage");
    const settings=loadCloudinaryBannerSettings();
    if(!settings.cloudName||!settings.uploadPreset){
      if(message)message.textContent="Cloudinary bağlantısı hazır değil. Reklam Merkezi içindeki Cloudinary ayarını kontrol edin.";
      return;
    }

    const isVideo=type==="video";
    const valid=isVideo
      ? ["video/mp4","video/webm"].includes(file.type)
      : ["image/jpeg","image/png","image/webp"].includes(file.type);
    const maxBytes=isVideo ? 30*1024*1024 : 8*1024*1024;

    if(!valid){
      if(message)message.textContent=isVideo ? "MP4 veya WebM seçin." : "JPG, PNG veya WebP seçin.";
      return;
    }
    if(file.size>maxBytes){
      if(message)message.textContent=isVideo ? "Video en fazla 30 MB olabilir." : "Görsel en fazla 8 MB olabilir.";
      return;
    }

    if(message)message.textContent="Cloudinary'ye yükleniyor...";
    const formData=new FormData();
    formData.append("file",file);
    formData.append("upload_preset",settings.uploadPreset);
    formData.append("folder","dijiyer/externalAds");

    try{
      const data=await new Promise((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.open("POST","https://api.cloudinary.com/v1_1/"+encodeURIComponent(settings.cloudName)+"/auto/upload",true);
        xhr.onerror=()=>reject(new Error("Ağ bağlantısı kurulamadı."));
        xhr.onload=()=>{
          let parsed={};
          try{parsed=JSON.parse(xhr.responseText||"{}")}catch(_){}
          if(xhr.status>=200&&xhr.status<300&&parsed.secure_url)resolve(parsed);
          else reject(new Error(parsed?.error?.message||"Cloudinary yükleme hatası."));
        };
        xhr.send(formData);
      });

      const url=String(data.secure_url||"");
      if(isVideo){
        $("externalAdMediaType").value="video";
        $("externalAdVideoUrl").value=url;
      }else{
        $("externalAdMediaType").value="image";
        $("externalAdImageUrl").value=url;
      }
      if(message)message.textContent="Dosya yüklendi.";
      renderExternalAdPreview();
    }catch(error){
      console.error("Harici reklam medyası yüklenemedi:",error);
      if(message)message.textContent="Yükleme başarısız: "+String(error?.message||"Bilinmeyen hata");
    }
  }

  function resetExternalAdForm(){
    $("externalAdForm")?.reset();
    if($("externalAdEditId"))$("externalAdEditId").value="";
    if($("externalAdActive"))$("externalAdActive").checked=true;
    if($("externalAdRotationSeconds"))$("externalAdRotationSeconds").value="5";
    if($("externalAdMediaType"))$("externalAdMediaType").value="image";
    if($("externalAdFormTitle"))$("externalAdFormTitle").textContent="Yeni Harici Reklam";
    if($("externalAdUploadMessage"))$("externalAdUploadMessage").textContent="";
    renderExternalAdPreview();
  }

  async function loadExternalAdsAdmin(){
    const snap=await db.collection("externalAds").get();
    externalAdRecords=snap.docs
      .map(doc=>({id:doc.id,...doc.data()}))
      .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    return externalAdRecords;
  }

  function renderExternalAdList(){
    const root=$("externalAdAdminList");
    if(!root)return;
    const q=normalize($("externalAdSearch")?.value||"");
    const rows=externalAdRecords.filter(item=>
      !q || normalize([item.brandName,item.headline,item.targetUrl].join(" ")).includes(q)
    );

    if($("externalAdAdminCount"))$("externalAdAdminCount").textContent=externalAdRecords.length+" harici reklam";
    if($("externalAdsTabCount"))$("externalAdsTabCount").textContent=String(externalAdRecords.filter(x=>externalAdStatus(x).key==="active").length);

    root.innerHTML=rows.length ? rows.map(item=>{
      const status=externalAdStatus(item);
      const type=String(item.mediaType||"image");
      const image=safeExternalAdminUrl(item.imageUrl);
      const video=safeExternalAdminUrl(item.videoUrl);
      const media=type==="video" && video
        ? '<video src="'+escapeHtml(video)+'" muted playsinline></video>'
        : image
          ? '<img src="'+escapeHtml(image)+'" alt="">'
          : '<div class="external-ad-list-fallback">🌐</div>';

      return '<article class="external-ad-admin-row">'+
        '<div class="external-ad-admin-media">'+media+'</div>'+
        '<div class="external-ad-admin-main">'+
          '<div class="external-ad-admin-row-head"><strong>'+escapeHtml(item.brandName||"Marka")+'</strong><span class="external-ad-status '+status.key+'">'+escapeHtml(status.label)+'</span></div>'+
          '<small>'+escapeHtml(item.headline||"")+'</small>'+
          '<p>'+escapeHtml(item.targetUrl||"")+'</p>'+
          '<div class="external-ad-admin-meta"><span>'+Number(item.rotationSeconds||5)+' sn</span><span>'+escapeHtml(type==="video"?"Video":"Görsel")+'</span></div>'+
        '</div>'+
        '<div class="external-ad-admin-actions">'+
          '<button type="button" data-external-edit="'+escapeHtml(item.id)+'">Düzenle</button>'+
          '<button type="button" data-external-toggle="'+escapeHtml(item.id)+'">'+(item.active===false?"Aktif Et":"Pasif Et")+'</button>'+
          '<button type="button" class="danger" data-external-delete="'+escapeHtml(item.id)+'">Sil</button>'+
        '</div>'+
      '</article>';
    }).join("") : '<div class="advanced-empty">Harici reklam bulunamadı.</div>';

    root.querySelectorAll("[data-external-edit]").forEach(btn=>btn.addEventListener("click",()=>editExternalAd(btn.dataset.externalEdit)));
    root.querySelectorAll("[data-external-toggle]").forEach(btn=>btn.addEventListener("click",()=>toggleExternalAd(btn.dataset.externalToggle)));
    root.querySelectorAll("[data-external-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteExternalAd(btn.dataset.externalDelete)));
  }

  async function renderExternalAdsAdmin(force=false){
    try{
      if(force || !externalAdRecords.length)await loadExternalAdsAdmin();
      renderExternalAdList();
      renderExternalAdPreview();
    }catch(error){
      console.error("Harici reklamlar yüklenemedi:",error);
      if($("externalAdAdminList"))$("externalAdAdminList").innerHTML='<div class="advanced-empty">Harici reklamlar yüklenemedi. Firestore yetkisini kontrol edin.</div>';
    }
  }

  function editExternalAd(id){
    const item=externalAdRecords.find(x=>String(x.id)===String(id));
    if(!item)return;
    $("externalAdEditId").value=item.id;
    $("externalAdBrand").value=item.brandName||"";
    $("externalAdHeadline").value=item.headline||"";
    $("externalAdTargetUrl").value=item.targetUrl||"";
    $("externalAdMediaType").value=item.mediaType==="video"?"video":"image";
    $("externalAdImageUrl").value=item.imageUrl||"";
    $("externalAdVideoUrl").value=item.videoUrl||"";
    $("externalAdStartAt").value=externalAdDateTimeLocal(item.startAt);
    $("externalAdEndAt").value=externalAdDateTimeLocal(item.endAt);
    $("externalAdRotationSeconds").value=String(item.rotationSeconds||5);
    $("externalAdActive").checked=item.active!==false;
    $("externalAdRightsConfirmed").checked=Boolean(item.rightsConfirmed);
    $("externalAdFormTitle").textContent="Reklamı Düzenle";
    renderExternalAdPreview();
    $("externalAdForm")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function saveExternalAd(event){
    event.preventDefault();
    const brandName=String($("externalAdBrand")?.value||"").trim();
    const headline=String($("externalAdHeadline")?.value||"").trim();
    const targetUrl=safeExternalAdminUrl($("externalAdTargetUrl")?.value);
    const mediaType=$("externalAdMediaType")?.value==="video"?"video":"image";
    const imageUrl=safeExternalAdminUrl($("externalAdImageUrl")?.value);
    const videoUrl=safeExternalAdminUrl($("externalAdVideoUrl")?.value);
    const rightsConfirmed=Boolean($("externalAdRightsConfirmed")?.checked);

    if(!brandName){alert("Marka adını yazın.");return;}
    if(!targetUrl){alert("Geçerli bir tıklama / affiliate linki girin.");return;}
    if(mediaType==="image" && !imageUrl){alert("Görsel URL ekleyin veya görsel yükleyin.");return;}
    if(mediaType==="video" && !videoUrl){alert("Video URL ekleyin veya video yükleyin.");return;}
    if(!rightsConfirmed){alert("Bannerı yayınlama / affiliate kullanım iznini onaylayın.");return;}

    const startAt=externalAdIsoFromInput($("externalAdStartAt")?.value);
    const endAt=externalAdIsoFromInput($("externalAdEndAt")?.value);
    if(startAt && endAt && new Date(endAt)<=new Date(startAt)){
      alert("Bitiş tarihi başlangıçtan sonra olmalıdır.");
      return;
    }

    const id=String($("externalAdEditId")?.value||"").trim();
    const existing=id ? externalAdRecords.find(x=>String(x.id)===id) : null;
    const ref=id ? db.collection("externalAds").doc(id) : db.collection("externalAds").doc();
    const data={
      brandName,headline,targetUrl,mediaType,imageUrl,videoUrl,
      rotationSeconds:Math.max(5,Math.min(60,Number($("externalAdRotationSeconds")?.value||5))),
      startAt,endAt,
      active:Boolean($("externalAdActive")?.checked),
      rightsConfirmed:true,
      updatedAt:new Date().toISOString(),
      createdAt:existing?.createdAt || new Date().toISOString()
    };

    try{
      await ref.set(data,{merge:true});
      addAudit(id?"Harici reklam güncellendi":"Harici reklam eklendi",brandName);
      await loadExternalAdsAdmin();
      resetExternalAdForm();
      renderExternalAdList();
    }catch(error){
      console.error("Harici reklam kaydedilemedi:",error);
      alert("Harici reklam kaydedilemedi. Firestore Rules ayarını kontrol edin.");
    }
  }

  async function toggleExternalAd(id){
    const item=externalAdRecords.find(x=>String(x.id)===String(id));
    if(!item)return;
    try{
      await db.collection("externalAds").doc(id).set({active:item.active===false,updatedAt:new Date().toISOString()},{merge:true});
      await loadExternalAdsAdmin();
      renderExternalAdList();
    }catch(error){
      console.error(error);
      alert("Reklam durumu değiştirilemedi.");
    }
  }

  async function deleteExternalAd(id){
    const item=externalAdRecords.find(x=>String(x.id)===String(id));
    if(!item)return;
    if(!confirm((item.brandName||"Bu reklam")+" silinsin mi?"))return;
    try{
      await db.collection("externalAds").doc(id).delete();
      addAudit("Harici reklam silindi",item.brandName||id);
      await loadExternalAdsAdmin();
      renderExternalAdList();
    }catch(error){
      console.error(error);
      alert("Reklam silinemedi.");
    }
  }

  $("externalAdForm")?.addEventListener("submit",saveExternalAd);
  $("externalAdNewBtn")?.addEventListener("click",()=>{
    resetExternalAdForm();

    const form=$("externalAdForm");
    if(form){
      form.classList.remove("external-ad-editor-collapsed");
      form.classList.remove("external-ad-editor-attention");
      void form.offsetWidth;
      form.classList.add("external-ad-editor-attention");
      form.scrollIntoView({behavior:"smooth",block:"start"});
    }

    window.setTimeout(()=>{
      $("externalAdBrand")?.focus();
      form?.classList.remove("external-ad-editor-attention");
    },420);
  });
  $("externalAdCancelBtn")?.addEventListener("click",()=>{
    resetExternalAdForm();
    $("externalAdBrand")?.focus();
  });
  $("externalAdSearch")?.addEventListener("input",renderExternalAdList);
  $("externalAdImageUploadBtn")?.addEventListener("click",()=>$("externalAdImageFile")?.click());
  $("externalAdVideoUploadBtn")?.addEventListener("click",()=>$("externalAdVideoFile")?.click());
  $("externalAdImageFile")?.addEventListener("change",event=>uploadExternalAdMedia(event.target.files?.[0],"image"));
  $("externalAdVideoFile")?.addEventListener("change",event=>uploadExternalAdMedia(event.target.files?.[0],"video"));
  ["externalAdBrand","externalAdHeadline","externalAdImageUrl","externalAdVideoUrl","externalAdMediaType"].forEach(id=>{
    $(id)?.addEventListener("input",renderExternalAdPreview);
    $(id)?.addEventListener("change",renderExternalAdPreview);
  });
  resetExternalAdForm();

  const DEFAULT_PROMOTION_PACKAGES = [
    {
      serviceKey:"packageStarter",name:"Başlangıç Görünürlüğü",badge:"BAŞLANGIÇ",
      description:"İlk kez Dijiyer reklamı deneyecek kurumlar için.",
      benefit:"Banner tasarımı ile kategori görünürlüğünü tek pakette kullanarak reklam çalışmalarına hızlı başlangıç sağlar.",
      includes:["Reklam banner tasarımı","Kategori vitrini"],
      basePrice:0,priceLabel:"Paket fiyatı planlamada netleşir",duration:"",
      delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",
      extras:[{name:"Ek yayın süresi",price:0}],featured:false,active:true,sortOrder:10
    },
    {
      serviceKey:"packageRegional",name:"Bölgesel Görünürlük",badge:"BÖLGESEL",
      description:"Şehir ve ilçe bazında müşteri arayan kurumlar için.",
      benefit:"Şehir/ilçe hedeflemesiyle reklamı yerel ve daha ilgili kullanıcılara ulaştırır.",
      includes:["Banner tasarımı","Şehir / ilçe vitrini","Kampanya duyurusu"],
      basePrice:0,priceLabel:"Bölge ve süreye göre paket fiyatı",duration:"",
      delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",
      extras:[{name:"Kategori vitrini",price:0}],featured:false,active:true,sortOrder:20
    },
    {
      serviceKey:"combo",name:"Dijiyer Mekan Tanıtım",badge:"MEKAN TANITIM",
      description:"Kurumunuzu hem konum hem mekan deneyimiyle anlatın.",
      benefit:"Müşteriye hem size nasıl ulaşacağını hem de mekanda ne göreceğini tek kurum profilinde gösterir.",
      includes:["Konum Tanıtım Videosu","360° Sanal Tur","Kurum profilinde özel gösterim"],
      basePrice:0,priceLabel:"Mekan ve çekim kapsamına göre fiyatlandırılır",duration:"",
      delivery:"5–10 iş günü",revision:"1 düzenleme turu",
      extras:[{name:"Reels tanıtım videosu",price:0},{name:"QR/NFC yönlendirme",price:0}],
      featured:true,active:true,sortOrder:30
    },
    {
      serviceKey:"packagePlus",name:"Görünürlük Plus",badge:"GÖRÜNÜRLÜK PLUS",
      description:"İçerik üretimiyle ana sayfa görünürlüğünü birleştirin.",
      benefit:"Hazırlanan tanıtım içeriğini ana sayfa sponsorlu görünürlüğüyle destekler.",
      includes:["Konum Videosu","Banner tasarımı","Ana Sayfa Vitrini"],
      basePrice:0,priceLabel:"Paket kapsamına göre fiyatlandırılır",duration:"",
      delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon",
      extras:[{name:"Kategori vitrini",price:0}],featured:false,active:true,sortOrder:40
    },
    {
      serviceKey:"packagePremium",name:"Premium Tanıtım",badge:"PREMIUM",
      description:"İçerik ve Dijiyer görünürlüğünü tek pakette toplayın.",
      benefit:"Güçlü tanıtım içeriği ile ana sayfa, kategori ve bölgesel sponsorlu görünürlüğü tek planda birleştirir.",
      includes:["Konum Videosu + 360° Tur","Ana Sayfa Vitrini","Kategori Vitrini","Şehir / İlçe Vitrini"],
      basePrice:0,priceLabel:"Kapsama özel paket fiyatı",duration:"",
      delivery:"Kapsama göre planlanır",revision:"İçeriklerde 1 revizyon",
      extras:[{name:"Reels video",price:0},{name:"Kampanya duyurusu",price:0}],
      featured:false,active:true,sortOrder:50
    }
  ];

  function packageLines(value){
    return String(value||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  }

  function addPromotionPackageExtraRow(item = {}) {
    const root = $("promotionPackageExtras");
    if (!root) return;
    const row = document.createElement("div");
    row.className = "promotion-package-extra-row";
    row.innerHTML = `
      <input type="text" data-package-extra-name maxlength="100" placeholder="Ek hizmet adı" value="${escapeHtml(item.name||"")}">
      <input type="number" data-package-extra-price min="0" step="1" placeholder="Fiyat" value="${Number(item.price||0)}">
      <button type="button" title="Kaldır">×</button>
    `;
    row.querySelector("button")?.addEventListener("click",()=>row.remove());
    root.appendChild(row);
  }

  function promotionPackageExtrasFromForm(){
    return [...document.querySelectorAll("#promotionPackageExtras .promotion-package-extra-row")]
      .map(row=>({
        name:String(row.querySelector("[data-package-extra-name]")?.value||"").trim(),
        price:Math.max(0,Number(row.querySelector("[data-package-extra-price]")?.value||0))
      }))
      .filter(item=>item.name);
  }

  function resetPromotionPackageForm(){
    $("promotionPackageForm")?.reset();
    if ($("promotionPackageEditId")) $("promotionPackageEditId").value="";
    if ($("promotionPackageFormTitle")) $("promotionPackageFormTitle").textContent="Yeni Reklam Paketi";
    if ($("promotionPackageActive")) $("promotionPackageActive").checked=true;
    if ($("promotionPackageSort")) $("promotionPackageSort").value="50";
    if ($("promotionPackagePrice")) $("promotionPackagePrice").value="0";
    if ($("promotionPackageExtras")) $("promotionPackageExtras").innerHTML="";
    if ($("promotionPackageMessage")) $("promotionPackageMessage").textContent="";
  }

  async function loadPromotionPackagesAdmin(){
    try{
      const snapshot=await db.collection("promotionPackages").get();
      promotionPackageRecords=snapshot.docs
        .map(doc=>({id:doc.id,...doc.data()}))
        .sort((a,b)=>(Number(a.sortOrder||50)-Number(b.sortOrder||50)) || String(a.name||"").localeCompare(String(b.name||""),"tr"));
    }catch(error){
      console.error("Reklam paketleri yüklenemedi:",error);
      promotionPackageRecords=[];
    }
    return promotionPackageRecords;
  }

  function editPromotionPackage(id){
    const item=promotionPackageRecords.find(x=>x.id===id);
    if(!item)return;

    $("promotionPackageEditId").value=item.id;
    $("promotionPackageFormTitle").textContent="Paketi Düzenle";
    $("promotionPackageName").value=item.name||"";
    $("promotionPackageBadge").value=item.badge||"";
    $("promotionPackagePrice").value=Number(item.basePrice||0);
    $("promotionPackagePriceLabel").value=item.priceLabel||"";
    $("promotionPackageDuration").value=item.duration||"";
    $("promotionPackageSort").value=Number(item.sortOrder||50);
    $("promotionPackageDescription").value=item.description||"";
    $("promotionPackageBenefit").value=item.benefit||"";
    $("promotionPackageDelivery").value=item.delivery||"";
    $("promotionPackageRevision").value=item.revision||"";
    $("promotionPackageIncludes").value=(Array.isArray(item.includes)?item.includes:[]).join("\n");
    $("promotionPackageProcess").value=item.process||"";
    $("promotionPackageRequired").value=item.required||"";
    $("promotionPackageExample").value=item.example||"";
    $("promotionPackageFeatured").checked=Boolean(item.featured);
    $("promotionPackageActive").checked=item.active!==false;
    $("promotionPackageExtras").innerHTML="";
    (Array.isArray(item.extras)?item.extras:[]).forEach(addPromotionPackageExtraRow);
    $("promotionPackageForm")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function savePromotionPackage(event){
    event.preventDefault();
    const editId=String($("promotionPackageEditId")?.value||"").trim();
    const collection=db.collection("promotionPackages");
    const ref=editId ? collection.doc(editId) : collection.doc();
    const existing=promotionPackageRecords.find(x=>x.id===editId);
    const now=new Date().toISOString();
    const name=String($("promotionPackageName")?.value||"").trim();

    if(!name){
      $("promotionPackageMessage").textContent="Paket adını yazın.";
      return;
    }

    const basePrice=Math.max(0,Number($("promotionPackagePrice")?.value||0));
    const data={
      serviceKey: existing?.serviceKey || ("pkg_"+ref.id),
      name,
      badge:String($("promotionPackageBadge")?.value||"").trim(),
      description:String($("promotionPackageDescription")?.value||"").trim(),
      benefit:String($("promotionPackageBenefit")?.value||"").trim(),
      includes:packageLines($("promotionPackageIncludes")?.value),
      basePrice,
      priceLabel:String($("promotionPackagePriceLabel")?.value||"").trim() ||
        (basePrice>0 ? money(basePrice) : "Fiyat planlamada netleşir"),
      duration:String($("promotionPackageDuration")?.value||"").trim(),
      delivery:String($("promotionPackageDelivery")?.value||"").trim(),
      revision:String($("promotionPackageRevision")?.value||"").trim(),
      process:String($("promotionPackageProcess")?.value||"").trim(),
      required:String($("promotionPackageRequired")?.value||"").trim(),
      example:String($("promotionPackageExample")?.value||"").trim(),
      extras:promotionPackageExtrasFromForm(),
      featured:Boolean($("promotionPackageFeatured")?.checked),
      active:Boolean($("promotionPackageActive")?.checked),
      sortOrder:Math.max(0,Number($("promotionPackageSort")?.value||50)),
      updatedAt:now
    };
    if(!existing)data.createdAt=now;

    try{
      await ref.set(data,{merge:true});
      addAudit(editId?"Reklam paketi güncellendi":"Reklam paketi oluşturuldu",name);
      $("promotionPackageMessage").textContent="Paket kaydedildi.";
      resetPromotionPackageForm();
      await renderPromotionPackageAdmin(true);
    }catch(error){
      console.error("Reklam paketi kaydedilemedi:",error);
      $("promotionPackageMessage").textContent="Paket kaydedilemedi. Firestore kuralını kontrol edin.";
    }
  }

  async function togglePromotionPackage(id){
    const item=promotionPackageRecords.find(x=>x.id===id);
    if(!item)return;
    try{
      await db.collection("promotionPackages").doc(id).update({
        active:item.active===false,
        updatedAt:new Date().toISOString()
      });
      await renderPromotionPackageAdmin(true);
    }catch(error){
      console.error(error);
      alert("Paket durumu değiştirilemedi.");
    }
  }

  async function deletePromotionPackage(id){
    const item=promotionPackageRecords.find(x=>x.id===id);
    if(!item)return;
    if(!confirm('"'+(item.name||"Paket")+'" silinsin mi?'))return;
    try{
      await db.collection("promotionPackages").doc(id).delete();
      addAudit("Reklam paketi silindi",item.name||id);
      await renderPromotionPackageAdmin(true);
    }catch(error){
      console.error(error);
      alert("Paket silinemedi.");
    }
  }

  async function seedPromotionPackages(){
    try{
      await loadPromotionPackagesAdmin();
      const byKey=new Map(promotionPackageRecords.map(x=>[x.serviceKey,x]));
      const batch=db.batch();
      const now=new Date().toISOString();
      let added=0;

      DEFAULT_PROMOTION_PACKAGES.forEach(item=>{
        if(byKey.has(item.serviceKey))return;
        const ref=db.collection("promotionPackages").doc();
        batch.set(ref,{...item,createdAt:now,updatedAt:now});
        added++;
      });

      if(!added){
        alert("Mevcut 5 paket zaten Paket Yönetimi'nde bulunuyor.");
        return;
      }

      await batch.commit();
      addAudit("Varsayılan reklam paketleri aktarıldı",added+" paket");
      await renderPromotionPackageAdmin(true);
    }catch(error){
      console.error(error);
      alert("Paketler aktarılamadı. Firestore kuralını kontrol edin.");
    }
  }

  async function renderPromotionPackageAdmin(reload=false){
    const root=$("promotionPackageAdminList");
    if(!root)return;
    if(reload || !promotionPackageRecords.length)await loadPromotionPackagesAdmin();

    const query=normalize($("promotionPackageSearch")?.value||"");
    const rows=promotionPackageRecords.filter(item=>
      !query || normalize([item.name,item.badge,item.description,...(item.includes||[])].join(" ")).includes(query)
    );

    const activeCount=promotionPackageRecords.filter(x=>x.active!==false).length;
    if($("promotionPackageAdminCount")){
      $("promotionPackageAdminCount").textContent=
        promotionPackageRecords.length+" paket · "+activeCount+" yayında · "+
        (promotionPackageRecords.length-activeCount)+" pasif";
    }

    root.innerHTML=rows.length ? rows.map(item=>`
      <article class="promotion-package-admin-card ${item.active===false?"is-passive":""}">
        <div class="promotion-package-admin-card-head">
          <div>
            <span>${escapeHtml(item.badge||"PAKET")}</span>
            <strong>${escapeHtml(item.name||"Reklam Paketi")}</strong>
            <small>${escapeHtml(item.description||"")}</small>
          </div>
          <div class="promotion-package-card-state">
            ${item.featured?'<b>★ Önerilen</b>':""}
            <i class="${item.active===false?"passive":"active"}">${item.active===false?"Pasif":"Yayında"}</i>
          </div>
        </div>
        <div class="promotion-package-admin-price">
          <strong>${Number(item.basePrice||0)>0?money(item.basePrice):escapeHtml(item.priceLabel||"Fiyat netleştirilecek")}</strong>
          ${item.duration?'<span>'+escapeHtml(item.duration)+'</span>':""}
        </div>
        <div class="promotion-package-admin-includes">
          ${(item.includes||[]).slice(0,5).map(x=>'<span>✓ '+escapeHtml(x)+'</span>').join("") || '<span>İçerik eklenmemiş.</span>'}
        </div>
        <div class="promotion-package-admin-card-actions">
          <button type="button" data-package-edit="${escapeHtml(item.id)}">Düzenle</button>
          <button type="button" data-package-toggle="${escapeHtml(item.id)}">${item.active===false?"Yayına Al":"Pasife Al"}</button>
          <button type="button" class="danger" data-package-delete="${escapeHtml(item.id)}">Sil</button>
        </div>
      </article>
    `).join("") : '<div class="advanced-empty">Paket bulunamadı.</div>';

    root.querySelectorAll("[data-package-edit]").forEach(btn=>btn.addEventListener("click",()=>editPromotionPackage(btn.dataset.packageEdit)));
    root.querySelectorAll("[data-package-toggle]").forEach(btn=>btn.addEventListener("click",()=>togglePromotionPackage(btn.dataset.packageToggle)));
    root.querySelectorAll("[data-package-delete]").forEach(btn=>btn.addEventListener("click",()=>deletePromotionPackage(btn.dataset.packageDelete)));
  }

  $("promotionPackageForm")?.addEventListener("submit",savePromotionPackage);
  $("promotionPackageNewBtn")?.addEventListener("click",resetPromotionPackageForm);
  $("promotionPackageCancelBtn")?.addEventListener("click",resetPromotionPackageForm);
  $("promotionPackageAddExtra")?.addEventListener("click",()=>addPromotionPackageExtraRow());
  $("promotionPackageSeedBtn")?.addEventListener("click",seedPromotionPackages);
  $("promotionPackageSearch")?.addEventListener("input",()=>renderPromotionPackageAdmin(false));

  function promotionOrderStatusLabel(status) {
    return {
      new:"Yeni Sipariş",
      contacting:"Görüşülüyor",
      preparing:"Hazırlanıyor",
      approval:"Onay Bekliyor",
      completed:"Tamamlandı"
    }[status] || "Yeni Sipariş";
  }

  async function loadPromotionAdminRecords() {
    try {
      const snapshot = await db.collection("promotionOrders").get();
      promotionAdminRecords = snapshot.docs
        .map(doc => ({ id:doc.id, ...doc.data() }))
        .sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    } catch (error) {
      console.error("Tanıtım siparişleri yüklenemedi:", error);
      promotionAdminRecords = [];
      const root = $("promotionAdminList");
      if (root) root.innerHTML = '<div class="advanced-empty">Siparişler yüklenemedi. Firestore promotionOrders kuralını kontrol edin.</div>';
    }
    return promotionAdminRecords;
  }

  const PROMOTION_ADMIN_CATALOG = {
    location:{
      title:"Konum Tanıtım Videosu",
      lead:"İşletmenin konumunu harita, rota ve kurum bilgileriyle anlatan profesyonel tanıtım videosu.",
      benefit:"Müşterinin işletmeye nasıl ulaşacağını hızlıca anlamasını sağlar ve kurum profilini daha açıklayıcı hale getirir.",
      includes:["Harita ve rota anlatımı","Kurum adı, adres ve ulaşım bilgileri","Dikey Reels uyumlu video","Dijiyer kurum sayfasında kullanım"],
      delivery:"2–4 iş günü",revision:"1 revizyon"
    },
    tour:{
      title:"360° Sanal Tur",
      lead:"Müşterinin işletmeye gelmeden önce mekanı çevrimiçi gezmesini sağlayan interaktif tur.",
      benefit:"Sınıf, oda, salon veya işletme alanlarını önceden göstererek güven ve tanıtım gücü oluşturur.",
      includes:["Gezilebilir 360° tur","QR / NFC ile açılabilir bağlantı","Kurum sayfasına ekleme desteği","Web sitesinde kullanılabilir bağlantı"],
      delivery:"3–7 iş günü",revision:"1 düzenleme turu"
    },
    reels:{
      title:"Reels Tanıtım Videosu",
      lead:"Kurum hizmetini kısa ve dikkat çekici dikey video formatında anlatır.",
      benefit:"Sosyal medya ve kurum profilinde hizmeti daha hızlı ve anlaşılır sunar.",
      includes:["1080×1920 video","Kurgu ve hareketli yazılar","Müzik veya seslendirme seçeneği","Kuruma özel çağrı mesajı"],
      delivery:"2–4 iş günü",revision:"1 revizyon"
    },
    bannerDesign:{
      title:"Reklam Banner Tasarımı",
      lead:"Dijiyer ve sosyal medya reklam alanları için markaya uygun banner tasarımı.",
      benefit:"Kampanya ve hizmetlerin daha düzenli, profesyonel ve dikkat çekici görünmesini sağlar.",
      includes:["Markaya uygun tasarım","Dijiyer reklam ölçüsüne uygun çalışma","Kampanya başlığı ve çağrı mesajı"],
      delivery:"1–3 iş günü",revision:"1 revizyon"
    },
    homepage:{title:"Ana Sayfa Vitrini",lead:"Kurumun Dijiyer ana sayfasındaki sponsorlu alanlarda gösterilmesi.",benefit:"Profil ziyaretini ve marka görünürlüğünü artırmayı hedefler.",includes:["Sponsorlu ana sayfa alanı","Kurum sayfasına yönlendirme","Yayın süresi takibi"],delivery:"Planlanan yayın tarihinde",revision:"Yayın öncesi içerik kontrolü"},
    regionalAd:{title:"Şehir / İlçe Vitrini",lead:"Kurumun belirli şehir veya ilçede sponsorlu olarak öne çıkarılması.",benefit:"Reklamı hizmet verilen bölgedeki daha ilgili kullanıcılara yönlendirir.",includes:["Şehir/ilçe sponsorlu alanı","Kurum sayfasına yönlendirme","Yayın süresi takibi"],delivery:"Planlanan yayın tarihinde",revision:"Yayın öncesi içerik kontrolü"},
    categoryAd:{title:"Kategori Vitrini",lead:"Kurumun kendi hizmet kategorisini inceleyen kullanıcılara sponsorlu gösterilmesi.",benefit:"Genel trafik yerine hizmetle doğrudan ilgilenen kullanıcıya görünürlük sağlar.",includes:["Kategori sponsorlu alanı","Kurum sayfasına yönlendirme","Sponsorlu etiketi"],delivery:"Planlanan yayın tarihinde",revision:"Yayın öncesi içerik kontrolü"},
    bannerAd:{title:"Dijiyer Banner Reklamı",lead:"Kampanya görselinin Dijiyer banner alanlarında yayınlanması.",benefit:"Dönemsel kampanya, kayıt ve indirimlere ek görünürlük sağlar.",includes:["Dijiyer banner alanı","Kurum profiline yönlendirme","Yayın süresi takibi"],delivery:"Planlanan yayın tarihinde",revision:"Yayın öncesi 1 kontrol"},
    campaign:{title:"Kampanya Duyurusu",lead:"Kayıt, indirim veya yeni hizmet duyurusunun Dijiyer'de yayınlanması.",benefit:"Kurum profilini ziyaret eden müşteriye güncel kampanyayı görünür biçimde aktarır.",includes:["Kampanya duyuru kartı","Kurum sayfasına bağlantı","Yayın dönemi planlama"],delivery:"İçerik onayı sonrası",revision:"1 içerik düzenlemesi"},
    videoAd:{title:"Video Vitrin Reklamı",lead:"Kısa tanıtım videosunun Dijiyer sponsorlu video alanında yayınlanması.",benefit:"Hareketli içerikle daha fazla dikkat çekerek kurumu hızlı anlatır.",includes:["Sponsorlu video alanı","Kurum profiline yönlendirme","Yayın süresi takibi"],delivery:"Planlanan yayın tarihinde",revision:"Hazır video için teknik kontrol"},
    packageStarter:{title:"Başlangıç Görünürlüğü",lead:"Dijiyer reklamını ilk kez deneyecek kurumlar için başlangıç paketi.",benefit:"Banner tasarımı ile kategori görünürlüğünü tek pakette birleştirir.",includes:["Reklam banner tasarımı","Kategori vitrini"],delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon"},
    packageRegional:{title:"Bölgesel Görünürlük",lead:"Yerel müşteri arayan kurumlar için içerik ve bölgesel reklam paketi.",benefit:"Şehir/ilçe hedeflemesiyle reklamı yerel kullanıcıya daha görünür hale getirir.",includes:["Banner tasarımı","Şehir / ilçe vitrini","Kampanya duyurusu"],delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon"},
    combo:{title:"Dijiyer Mekan Tanıtım",lead:"Konum videosu ve 360° sanal turu tek kurum profilinde birleştiren mekan tanıtım paketi.",benefit:"Müşteriye hem kuruma nasıl ulaşacağını hem de içeride ne göreceğini gösterir.",includes:["Konum Tanıtım Videosu","360° Sanal Tur","Kurum profilinde özel gösterim"],delivery:"5–10 iş günü",revision:"1 düzenleme turu"},
    packagePlus:{title:"Görünürlük Plus",lead:"İçerik üretimi ile ana sayfa sponsorlu görünürlüğünü birleştiren paket.",benefit:"Hazırlanan tanıtım içeriğini sponsorlu yayınla destekler.",includes:["Konum Videosu","Banner tasarımı","Ana Sayfa Vitrini"],delivery:"Planlamaya göre",revision:"İçerikte 1 revizyon"},
    packagePremium:{title:"Premium Tanıtım",lead:"İçerik üretimi ve birden fazla sponsorlu görünürlük alanını bir araya getirir.",benefit:"Kurum profilini güçlü içerikle destekler ve farklı Dijiyer alanlarında görünürlük sağlar.",includes:["Konum Videosu + 360° Tur","Ana Sayfa Vitrini","Kategori Vitrini","Şehir / İlçe Vitrini"],delivery:"Kapsama göre planlanır",revision:"İçeriklerde 1 revizyon"},
    consultation:{title:"Tanıtım Planlama Görüşmesi",lead:"Kurumun ihtiyacına uygun tanıtım hizmetlerini belirlemek için ön değerlendirme.",benefit:"Gereksiz hizmet almadan eksik görünürlük alanlarına göre plan oluşturur.",includes:["Profil değerlendirmesi","Hizmet önerisi","Kısa tanıtım planı"],delivery:"Planlanan görüşme zamanı",revision:"-"}
  };

  function promotionCatalogFor(order){
    const dynamicPackage=promotionPackageRecords.find(item=>item.serviceKey===order.serviceKey);
    if(dynamicPackage){
      return {
        title:dynamicPackage.name||order.serviceName||"Tanıtım Paketi",
        lead:dynamicPackage.description||"",
        benefit:dynamicPackage.benefit||"",
        includes:Array.isArray(dynamicPackage.includes)?dynamicPackage.includes:[],
        delivery:dynamicPackage.delivery||dynamicPackage.duration||"Planlamada netleşir",
        revision:dynamicPackage.revision||"Planlamada netleşir",
        extras:Array.isArray(dynamicPackage.extras)?dynamicPackage.extras:[]
      };
    }
    return PROMOTION_ADMIN_CATALOG[order.serviceKey] || {
      title:order.serviceName || "Tanıtım Hizmeti",
      lead:"Bu sipariş için hizmet kapsamı yönetim tarafından netleştirilebilir.",
      benefit:"Kurumun tanıtım ve görünürlük ihtiyacına göre hazırlanır.",
      includes:[],
      delivery:"Planlamada netleşir",
      revision:"Planlamada netleşir"
    };
  }

  function promotionBreakdownFor(order){
    const saved=order.priceBreakdown || {};
    const existingItems=Array.isArray(saved.extraItems) ? saved.extraItems : [];
    const selected=Array.isArray(order.extras) ? order.extras : [];
    const merged=[...existingItems];

    const catalog=promotionCatalogFor(order);
    const catalogExtras=Array.isArray(catalog.extras)?catalog.extras:[];

    selected.forEach(name=>{
      if(!merged.some(item=>normalize(item.name)===normalize(name))){
        const match=catalogExtras.find(item=>normalize(item.name||item)===normalize(name));
        merged.push({
          name,
          price:Number(match?.price||0),
          source:"selected"
        });
      }
    });

    const basePrice=Number(saved.basePrice ?? order.basePrice ?? order.price ?? 0) || 0;
    const discount=Number(saved.discount ?? order.discount ?? 0) || 0;
    const extrasTotal=merged.reduce((sum,item)=>sum+(Number(item.price)||0),0);
    const subtotal=basePrice+extrasTotal;
    const total=Math.max(0,subtotal-discount);

    return {basePrice,discount,extraItems:merged,extrasTotal,subtotal,total};
  }

  function promotionExtraRowsHtml(orderId,items){
    return items.map((item,index)=>`
      <div class="promotion-price-extra-row" data-promotion-extra-row="${escapeHtml(orderId)}">
        <label>
          <span>Ek Hizmet</span>
          <input type="text" data-extra-name value="${escapeHtml(item.name||"")}" placeholder="Ek hizmet adı">
        </label>
        <label class="extra-price-input">
          <span>Fiyat</span>
          <input type="number" min="0" step="1" data-extra-price value="${Number(item.price||0)}">
        </label>
        <button type="button" data-remove-extra title="Satırı kaldır">×</button>
      </div>
    `).join("");
  }

  function recalcPromotionPricing(orderId){
    const card=document.querySelector('[data-promotion-id="' + CSS.escape(orderId) + '"]');
    if(!card)return;

    const base=Math.max(0,Number(card.querySelector("[data-promotion-base-price]")?.value||0));
    const discount=Math.max(0,Number(card.querySelector("[data-promotion-discount]")?.value||0));
    const extraTotal=[...card.querySelectorAll("[data-extra-price]")]
      .reduce((sum,input)=>sum+Math.max(0,Number(input.value||0)),0);
    const subtotal=base+extraTotal;
    const total=Math.max(0,subtotal-discount);

    const set=(key,value)=>{
      const node=card.querySelector('[data-price-preview="'+key+'"]');
      if(node)node.textContent=money(value);
    };

    set("base",base);
    set("extras",extraTotal);
    set("subtotal",subtotal);
    set("discount",discount);
    set("total",total);
  }

  function bindPromotionPricingEditor(root){
    root.querySelectorAll("[data-promotion-id]").forEach(card=>{
      const orderId=card.dataset.promotionId;

      card.querySelectorAll("[data-promotion-base-price],[data-promotion-discount],[data-extra-price]")
        .forEach(input=>input.addEventListener("input",()=>recalcPromotionPricing(orderId)));

      card.querySelectorAll("[data-remove-extra]").forEach(button=>{
        button.addEventListener("click",()=>{
          button.closest(".promotion-price-extra-row")?.remove();
          recalcPromotionPricing(orderId);
        });
      });

      card.querySelector("[data-add-extra]")?.addEventListener("click",()=>{
        const list=card.querySelector("[data-promotion-extra-list]");
        if(!list)return;

        const row=document.createElement("div");
        row.className="promotion-price-extra-row";
        row.dataset.promotionExtraRow=orderId;
        row.innerHTML=`
          <label><span>Ek Hizmet</span><input type="text" data-extra-name placeholder="Yeni ek hizmet"></label>
          <label class="extra-price-input"><span>Fiyat</span><input type="number" min="0" step="1" data-extra-price value="0"></label>
          <button type="button" data-remove-extra title="Satırı kaldır">×</button>
        `;
        list.appendChild(row);
        row.querySelector("[data-extra-price]")?.addEventListener("input",()=>recalcPromotionPricing(orderId));
        row.querySelector("[data-remove-extra]")?.addEventListener("click",()=>{
          row.remove();
          recalcPromotionPricing(orderId);
        });
        row.querySelector("[data-extra-name]")?.focus();
        recalcPromotionPricing(orderId);
      });

      recalcPromotionPricing(orderId);
    });
  }

  async function savePromotionOrderAdmin(orderId) {
    const order = promotionAdminRecords.find(item => item.id === orderId);
    if (!order) return;

    const card=document.querySelector('[data-promotion-id="' + CSS.escape(orderId) + '"]');
    if(!card)return;

    const status = card.querySelector("[data-promotion-status]")?.value || order.status || "new";
    const paymentStatus = card.querySelector("[data-promotion-payment]")?.value || order.paymentStatus || "pending";
    const scopeDescription = card.querySelector("[data-promotion-scope]")?.value.trim() || "";
    const publicNote = card.querySelector("[data-promotion-public-note]")?.value.trim() || "";
    const adminInternalNote = card.querySelector("[data-promotion-internal-note]")?.value.trim() || "";

    const basePrice=Math.max(0,Number(card.querySelector("[data-promotion-base-price]")?.value||0));
    const discount=Math.max(0,Number(card.querySelector("[data-promotion-discount]")?.value||0));

    const extraItems=[...card.querySelectorAll(".promotion-price-extra-row")].map(row=>({
      name:String(row.querySelector("[data-extra-name]")?.value||"").trim(),
      price:Math.max(0,Number(row.querySelector("[data-extra-price]")?.value||0))
    })).filter(item=>item.name);

    const extrasTotal=extraItems.reduce((sum,item)=>sum+item.price,0);
    const subtotal=basePrice+extrasTotal;
    const total=Math.max(0,subtotal-discount);
    const now = new Date().toISOString();

    const history=Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    if((order.status||"new")!==status){
      history.push({status,date:now});
    }

    try {
      await db.collection("promotionOrders").doc(orderId).update({
        status,
        paymentStatus,
        paidAt: paymentStatus === "paid" ? (order.paidAt || now) : "",
        scopeDescription,
        publicNote,
        adminNote:publicNote,
        adminInternalNote,
        basePrice,
        discount,
        price:total,
        priceLabel: total > 0 ? money(total) : (order.priceLabel || "Netleştirilecek"),
        priceBreakdown:{
          basePrice,
          extraItems,
          extrasTotal,
          subtotal,
          discount,
          total
        },
        statusHistory:history,
        updatedAt:now
      });

      addAudit(
        "Tanıtım siparişi güncellendi",
        (order.orderCode || orderId) + " · " + (order.institutionName || "Kurum") +
        " · " + promotionOrderStatusLabel(status) + " · " + money(total)
      );
      await renderPromotionOrdersAdmin(true);
    } catch (error) {
      console.error("Tanıtım siparişi güncellenemedi:", error);
      alert("Sipariş güncellenemedi.");
    }
  }

  async function renderPromotionOrdersAdmin(reload = false) {
    const root = $("promotionAdminList");
    if (!root) return;

    if (!promotionPackageRecords.length) {
      await loadPromotionPackagesAdmin();
    }

    if (reload || !promotionAdminRecords.length) {
      root.innerHTML = '<div class="advanced-empty">Tanıtım siparişleri yükleniyor...</div>';
      await loadPromotionAdminRecords();
    }

    const counts = {
      new: promotionAdminRecords.filter(x => (x.status || "new") === "new").length,
      contacting: promotionAdminRecords.filter(x => x.status === "contacting").length,
      preparing: promotionAdminRecords.filter(x => x.status === "preparing").length,
      approval: promotionAdminRecords.filter(x => x.status === "approval").length,
      completed: promotionAdminRecords.filter(x => x.status === "completed").length
    };

    Object.entries(counts).forEach(([key,value]) => {
      const id = {
        new:"promotionKpiNew",
        contacting:"promotionKpiContacting",
        preparing:"promotionKpiPreparing",
        approval:"promotionKpiApproval",
        completed:"promotionKpiCompleted"
      }[key];
      if ($(id)) $(id).textContent = value;
    });

    const openCount = promotionAdminRecords.filter(x => (x.status || "new") !== "completed").length;
    const pendingRevenue=promotionAdminRecords
      .filter(x=>x.paymentStatus!=="paid")
      .reduce((sum,x)=>sum+Number(x.priceBreakdown?.total ?? x.price ?? 0),0);
    const paidRevenue=promotionAdminRecords
      .filter(x=>x.paymentStatus==="paid")
      .reduce((sum,x)=>sum+Number(x.priceBreakdown?.total ?? x.price ?? 0),0);

    if ($("promotionOrdersTabCount")) $("promotionOrdersTabCount").textContent = openCount;
    if ($("quickPromotionOrderCount")) $("quickPromotionOrderCount").textContent = openCount;
    if ($("promotionAdminCount")) $("promotionAdminCount").textContent =
      promotionAdminRecords.length + " sipariş · " + openCount + " açık · " +
      money(pendingRevenue) + " ödeme bekliyor · " + money(paidRevenue) + " tahsil edildi";

    const q = normalize($("promotionAdminSearch")?.value || "");
    const statusFilter = $("promotionAdminStatus")?.value || "";
    const paymentFilter = $("promotionAdminPayment")?.value || "";
    const sort = $("promotionAdminSort")?.value || "newest";

    let rows = promotionAdminRecords.filter(item => {
      const haystack = normalize([
        item.orderCode,item.institutionName,item.serviceName,item.contactName,
        item.phone,item.note,item.adminNote,item.publicNote,item.adminInternalNote,
        item.scopeDescription,item.serviceId,
        ...(Array.isArray(item.extras)?item.extras:[]),
        ...(Array.isArray(item.priceBreakdown?.extraItems)?item.priceBreakdown.extraItems.map(x=>x.name):[])
      ].join(" "));
      return (!q || haystack.includes(q))
        && (!statusFilter || (item.status || "new") === statusFilter)
        && (!paymentFilter || (item.paymentStatus || "pending") === paymentFilter);
    });

    rows = [...rows].sort((a,b) => {
      if (sort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sort === "active") {
        const ac = a.status === "completed" ? 1 : 0;
        const bc = b.status === "completed" ? 1 : 0;
        if (ac !== bc) return ac - bc;
      }
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

    if ($("promotionFilterSummary")) {
      $("promotionFilterSummary").textContent =
        rows.length + " sipariş gösteriliyor" +
        (statusFilter ? " · " + promotionOrderStatusLabel(statusFilter) : "") +
        (paymentFilter ? " · " + (paymentFilter === "paid" ? "Ödendi" : "Ödeme bekliyor") : "");
    }

    root.innerHTML = rows.length ? rows.map(order => {
      const orderNo = escapeHtml(order.orderCode || order.id.slice(0,10).toUpperCase());
      const catalog=promotionCatalogFor(order);
      const breakdown=promotionBreakdownFor(order);
      const priceText = breakdown.total > 0 ? money(breakdown.total) : (order.priceLabel || "Netleştirilecek");
      const selectedExtras = Array.isArray(order.extras) ? order.extras : [];
      const scope=order.scopeDescription || catalog.lead;
      const publicNote=order.publicNote || order.adminNote || "";
      const internalNote=order.adminInternalNote || "";
      const adCreated=Boolean(order.convertedToAd || order.bannerAdId);
      const adLive=Boolean(order.adPublishedAt && order.status==="completed");

      return `
        <details class="promotion-admin-row promotion-admin-order-v2" data-promotion-id="${escapeHtml(order.id)}">
          <summary>
            <div class="promotion-admin-summary-main">
              <span class="promotion-admin-service-icon">🛍️</span>
              <div>
                <strong>${escapeHtml(order.serviceName || catalog.title || "Tanıtım Hizmeti")}</strong>
                <small>${escapeHtml(order.institutionName || "Kurum")} · ${orderNo} · ${formatDateLocal(order.createdAt)}</small>
              </div>
            </div>
            <div class="promotion-admin-summary-side">
              <span class="promotion-admin-price">${escapeHtml(priceText)}</span>
              <span class="promotion-admin-state state-${escapeHtml(order.status || "new")}">${escapeHtml(promotionOrderStatusLabel(order.status))}</span>
            </div>
          </summary>

          <div class="promotion-admin-detail">
            <div class="promotion-order-admin-top">
              <div class="promotion-admin-info-grid">
                <div><span>Kurum</span><strong>${escapeHtml(order.institutionName || "-")}</strong></div>
                <div><span>Sipariş No</span><strong>${orderNo}</strong></div>
                <div><span>Yetkili</span><strong>${escapeHtml(order.contactName || "-")}</strong></div>
                <div><span>Telefon</span><strong>${escapeHtml(order.phone || "-")}</strong></div>
                <div><span>Hizmet</span><strong>${escapeHtml(order.serviceName || catalog.title || "-")}</strong></div>
                <div><span>Ödeme</span><strong>${order.paymentStatus === "paid" ? "Ödendi" : "Bekliyor"}</strong></div>
              </div>

              <section class="promotion-package-overview">
                <div class="promotion-package-title">
                  <div>
                    <span>PAKET / HİZMET İÇERİĞİ</span>
                    <strong>${escapeHtml(catalog.title || order.serviceName || "Tanıtım Hizmeti")}</strong>
                  </div>
                  <div class="promotion-package-meta">
                    <span>⏱ ${escapeHtml(catalog.delivery)}</span>
                    <span>↻ ${escapeHtml(catalog.revision)}</span>
                  </div>
                </div>
                <p>${escapeHtml(catalog.lead)}</p>
                <div class="promotion-benefit-box"><b>Bu hizmet ne kazandırır?</b><span>${escapeHtml(catalog.benefit)}</span></div>
                ${catalog.includes.length ? `
                  <div class="promotion-package-includes">
                    ${catalog.includes.map(item=>'<span>✓ '+escapeHtml(item)+'</span>').join("")}
                  </div>
                ` : ""}
              </section>

              <div class="promotion-order-customer-input">
                <div>
                  <span>KURUMUN SİPARİŞ NOTU</span>
                  <p>${order.note ? escapeHtml(order.note) : "Kurum özel bir sipariş notu eklememiş."}</p>
                </div>
                <div>
                  <span>KURUMUN SEÇTİĞİ EK HİZMETLER</span>
                  <p>${selectedExtras.length ? selectedExtras.map(escapeHtml).join(" · ") : "Sipariş sırasında ek hizmet seçilmemiş."}</p>
                </div>
              </div>
            </div>

            <section class="promotion-scope-editor">
              <div class="promotion-editor-heading">
                <div><span>SİPARİŞ KAPSAMI</span><strong>Kurumun göreceği paket açıklaması</strong></div>
                <small>Siparişe özel kapsamı burada netleştirin.</small>
              </div>
              <textarea rows="3" data-promotion-scope placeholder="Sipariş kapsamını yazın...">${escapeHtml(scope)}</textarea>
            </section>

            <section class="promotion-pricing-editor">
              <div class="promotion-editor-heading">
                <div><span>FİYATLANDIRMA</span><strong>Ana hizmet + ek hizmetler</strong></div>
                <small>Toplam otomatik hesaplanır.</small>
              </div>

              <div class="promotion-base-price-row">
                <label>
                  <span>Ana hizmet bedeli</span>
                  <input type="number" min="0" step="1" data-promotion-base-price value="${breakdown.basePrice}">
                </label>
                <label>
                  <span>İndirim</span>
                  <input type="number" min="0" step="1" data-promotion-discount value="${breakdown.discount}">
                </label>
              </div>

              <div class="promotion-extra-price-list" data-promotion-extra-list>
                ${promotionExtraRowsHtml(order.id,breakdown.extraItems)}
              </div>

              <button type="button" class="promotion-add-extra-btn" data-add-extra>+ Ek Hizmet Ekle</button>

              <div class="promotion-price-summary">
                <div><span>Ana Hizmet</span><b data-price-preview="base">0 TL</b></div>
                <div><span>Ek Hizmetler</span><b data-price-preview="extras">0 TL</b></div>
                <div><span>Ara Toplam</span><b data-price-preview="subtotal">0 TL</b></div>
                <div class="discount"><span>İndirim</span><b data-price-preview="discount">0 TL</b></div>
                <div class="total"><span>TOPLAM</span><strong data-price-preview="total">0 TL</strong></div>
              </div>
            </section>

            <div class="promotion-admin-message-grid">
              <label>
                <span>Kurumla Paylaşılacak Açıklama</span>
                <textarea rows="3" data-promotion-public-note placeholder="Örn: Çekim için sizinle 2 iş günü içinde iletişime geçeceğiz.">${escapeHtml(publicNote)}</textarea>
                <small>Kurum panelinde görünür.</small>
              </label>
              <label class="internal-note">
                <span>Yönetim İç Notu</span>
                <textarea rows="3" data-promotion-internal-note placeholder="Sadece yönetim ekibinin göreceği not...">${escapeHtml(internalNote)}</textarea>
                <small>Kurum bu notu görmez.</small>
              </label>
            </div>

            ${promotionOrderWorkflowHtml(order,breakdown)}

            ${adOrderServiceIsAdvertising(order) ? `
              <section class="promotion-ad-publish-box ${adLive ? "published" : adCreated ? "draft" : ""}">
                <div>
                  <span>REKLAM YAYIN AKIŞI</span>
                  <strong>${
                    adLive
                      ? "Reklam yayında"
                      : adCreated
                        ? "Reklam taslağı hazır"
                        : "Siparişten reklam taslağı oluştur"
                  }</strong>
                  <small>${
                    adLive
                      ? "Reklam yayın alanında aktif. Takvim ve gelir merkezi üzerinden süresini takip edebilirsiniz."
                      : adCreated
                        ? "Taslağı açın, görsel/video ve yayın alanını kontrol edin; ardından 'Yayında' seçip kaydedin."
                        : "Fiyat ve ödeme tamamlandıktan sonra kurum, hedefleme ve tarih bilgileri otomatik aktarılır."
                  }</small>
                </div>
                <button
                  type="button"
                  data-promotion-publish="${escapeHtml(order.id)}"
                  ${adLive ? "disabled" : ""}
                >${adLive ? "✓ Yayında" : adCreated ? "Taslağı Aç →" : "Reklamı Oluştur →"}</button>
              </section>
            ` : ""}

            <div class="promotion-admin-controls promotion-admin-controls-v2">
              <label>Durum
                <select data-promotion-status>
                  <option value="new" ${(order.status||"new")==="new"?"selected":""}>Yeni Sipariş</option>
                  <option value="contacting" ${order.status==="contacting"?"selected":""}>Görüşülüyor</option>
                  <option value="preparing" ${order.status==="preparing"?"selected":""}>Hazırlanıyor</option>
                  <option value="approval" ${order.status==="approval"?"selected":""}>Onay Bekliyor</option>
                  <option value="completed" ${order.status==="completed"?"selected":""}>Tamamlandı</option>
                </select>
              </label>

              <label>Ödeme
                <select data-promotion-payment>
                  <option value="pending" ${(order.paymentStatus||"pending")==="pending"?"selected":""}>Ödeme Bekliyor</option>
                  <option value="paid" ${order.paymentStatus==="paid"?"selected":""}>Ödendi</option>
                </select>
              </label>

              <button type="button" data-promotion-save="${escapeHtml(order.id)}">Siparişi Güncelle</button>
            </div>
          </div>
        </details>
      `;
    }).join("") : '<div class="advanced-empty">Filtreye uygun tanıtım siparişi yok.</div>';

    root.querySelectorAll("[data-promotion-save]").forEach(button => {
      button.addEventListener("click", () => savePromotionOrderAdmin(button.dataset.promotionSave));
    });

    root.querySelectorAll("[data-promotion-publish]").forEach(button => {
      button.addEventListener("click", () => publishPromotionOrderAsAd(button.dataset.promotionPublish));
    });

    root.querySelectorAll("details.promotion-admin-row").forEach(row => {
      row.addEventListener("toggle", () => {
        if (!row.open) return;
        root.querySelectorAll("details.promotion-admin-row[open]").forEach(other => {
          if (other !== row) other.open = false;
        });
      });
    });

    bindPromotionPricingEditor(root);
  }

  ["promotionAdminSearch","promotionAdminStatus","promotionAdminPayment","promotionAdminSort"].forEach(id => {
    $(id)?.addEventListener(id === "promotionAdminSearch" ? "input" : "change", () => renderPromotionOrdersAdmin(false));
  });

  $("promotionAdminRefresh")?.addEventListener("click", () => renderPromotionOrdersAdmin(true));

  document.querySelectorAll("[data-promotion-kpi]").forEach(button => {
    button.addEventListener("click", () => {
      const select = $("promotionAdminStatus");
      if (!select) return;
      const next = button.dataset.promotionKpi || "";
      select.value = select.value === next ? "" : next;
      renderPromotionOrdersAdmin(false);
    });
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
    const replyChanged =
      reply !== String(ticket.adminReply || "");
    const effectiveStatus =
      replyChanged && reply && status !== "resolved"
        ? "answered"
        : status;

    await db.collection("supportTickets").doc(ticketId).update({
      status:effectiveStatus,
      adminReply:reply,
      adminReplyAt: replyChanged && reply
        ? now
        : (ticket.adminReplyAt || ""),
      updatedAt:now
    });

    addAudit(
      replyChanged && reply ? "Destek yanıtı gönderildi" : "Destek talebi güncellendi",
      (ticket.institutionName || "Kurum") + " · " + ticketId + " · " + effectiveStatus
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


  /* =========================================================
     İŞ YÖNETİMİ + REKLAM GELİR MERKEZİ
     ========================================================= */

  function adminDayKey(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    return y + "-" + m + "-" + d;
  }

  function adminParseDate(value, endOfDay = false) {
    if (!value) return null;
    const raw = String(value);
    const date = new Date(
      raw.length <= 10
        ? raw + (endOfDay ? "T23:59:59" : "T00:00:00")
        : raw
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function adminDaysUntil(value) {
    const date = adminParseDate(value, true);
    if (!date) return null;
    return Math.ceil((date.getTime() - Date.now()) / 86400000);
  }

  function adminAddDateDays(value, days) {
    const date = adminParseDate(value) || new Date();
    date.setDate(date.getDate() + Number(days || 0));
    return adminDayKey(date);
  }

  function adPlacementLabel(value) {
    const key = normalizeBannerPlacement(value);
    return {
      search:"Arama Sonuçları",
      home_sponsor:"Bölgenizde Öne Çıkanlar",
      premium_home:"Premium Ana Sayfa Vitrini",
      mobile_sponsor:"Mobil Sponsor Alanı",
      sidebar_sponsor:"Masaüstü Yan Sponsor",
      detail_banner:"Hızlı Önizleme Bannerı"
    }[key] || "Reklam Alanı";
  }

  function adOrderServiceIsAdvertising(order) {
    return new Set([
      "homepage","regionalAd","categoryAd","bannerAd","campaign","videoAd"
    ]).has(String(order?.serviceKey || ""));
  }

  function orderExtraValue(order, label) {
    const prefix = String(label || "").toLocaleLowerCase("tr-TR") + ":";
    const row = (Array.isArray(order?.extras) ? order.extras : [])
      .map(item => String(item || "").trim())
      .find(item => item.toLocaleLowerCase("tr-TR").startsWith(prefix));
    return row ? row.slice(row.indexOf(":") + 1).trim() : "";
  }

  function orderAdSchedule(order) {
    const preferredStart = orderExtraValue(order,"Tercih edilen başlangıç");
    const durationText = orderExtraValue(order,"Yayın süresi");
    const durationMatch = durationText.match(/(\d+)/);
    const days = durationMatch ? Math.max(1,Number(durationMatch[1])) : 30;
    const startAt = preferredStart && /^\d{4}-\d{2}-\d{2}$/.test(preferredStart)
      ? preferredStart
      : adminDayKey(new Date());
    const endAt = adminAddDateDays(startAt, days - 1);
    return {startAt,endAt,days};
  }

  function adPlacementForPromotionOrder(order) {
    return {
      homepage:"premium_home",
      regionalAd:"home_sponsor",
      categoryAd:"search",
      bannerAd:"search",
      campaign:"detail_banner",
      videoAd:"detail_banner"
    }[String(order?.serviceKey || "")] || "search";
  }

  function adPackageForPromotionOrder(order) {
    return {
      homepage:"premium",
      regionalAd:"regional",
      categoryAd:"starter",
      bannerAd:"starter",
      campaign:"starter",
      videoAd:"video"
    }[String(order?.serviceKey || "")] || "starter";
  }

  function promotionOrderWorkflowHtml(order, breakdown) {
    if (!adOrderServiceIsAdvertising(order)) return "";

    const priced = Number(breakdown?.total || order?.price || 0) > 0;
    const paid = String(order?.paymentStatus || "pending") === "paid";
    const published = Boolean(order?.convertedToAd || order?.bannerAdId || order?.adPublishedAt);

    const step = (ok,label) =>
      '<span class="' + (ok ? 'done' : '') + '">' +
        '<i>' + (ok ? '✓' : '•') + '</i>' +
        '<b>' + escapeHtml(label) + '</b>' +
      '</span>';

    return '<div class="promotion-ad-workflow">' +
      step(true,"Sipariş") +
      step(priced,"Fiyat") +
      step(paid,"Ödeme") +
      step(published,"Reklam Oluşturuldu") +
      step(published && order.status === "completed","Yayında") +
    '</div>';
  }

  async function publishPromotionOrderAsAd(orderId) {
    const order = promotionAdminRecords.find(item => String(item.id) === String(orderId));
    if (!order || !adOrderServiceIsAdvertising(order)) return;

    if (order.bannerAdId) {
      $("bannerAdsTabBtn")?.click();
      await loadBannerAdsAdmin();
      setTimeout(() => editBannerAd(String(order.bannerAdId)),120);
      return;
    }

    const breakdown = promotionBreakdownFor(order);
    const total = Number(breakdown.total || order.price || 0);

    if (total <= 0) {
      alert("Önce sipariş fiyatını netleştirip kaydedin.");
      return;
    }

    if (String(order.paymentStatus || "pending") !== "paid") {
      alert("Reklam taslağını oluşturmadan önce ödeme durumunu 'Ödendi' yapın ve siparişi kaydedin.");
      return;
    }

    const inst = institutionRecords.find(
      item => String(item.id) === String(order.institutionId)
    );
    if (!inst) {
      alert("Siparişe bağlı kurum bulunamadı.");
      return;
    }

    const schedule = orderAdSchedule(order);
    const placement = adPlacementForPromotionOrder(order);
    const packageId = adPackageForPromotionOrder(order);
    const campaignTitle =
      orderExtraValue(order,"Kampanya başlığı") ||
      order.serviceName ||
      inst.name ||
      "Sponsorlu Kurum";

    const now = new Date().toISOString();
    const bannerRef = db.collection("bannerAds").doc();

    const bannerData = {
      adCode:uid("BNR"),
      institutionId:String(inst.id),
      institutionName:String(inst.name || order.institutionName || "Kurum"),
      logoUrl:String(inst.logoUrl || ""),
      headline:String(campaignTitle),
      text:String(order.publicNote || order.scopeDescription || order.note || ""),
      mediaType:"image",
      imageUrl:String(inst.coverUrl || inst.logoUrl || ""),
      videoUrl:"",
      city:order.serviceKey === "homepage" ? "" : String(inst.city || ""),
      district:order.serviceKey === "regionalAd" ? String(inst.district || "") : "",
      category:order.serviceKey === "categoryAd"
        ? String(inst.subCategory || inst.category || "")
        : "",
      categoryLabel:order.serviceKey === "categoryAd"
        ? bannerCategoryLabel(inst.subCategory || inst.category || "")
        : "",
      durationSeconds:7,
      salePrice:total,
      paymentStatus:"paid",
      paidAt:order.paidAt || now,
      placement,
      startAt:schedule.startAt,
      endAt:schedule.endAt,
      active:false,
      sourceOrderId:String(order.id),
      sourceOrderCode:String(order.orderCode || ""),
      createdAt:now,
      updatedAt:now
    };

    const oldHistory = Array.isArray(inst.adHistory) ? inst.adHistory : [];
    const historyEntry = {
      status:"paused",
      packageId,
      price:total,
      paymentStatus:"paid",
      startAt:schedule.startAt,
      endAt:schedule.endAt,
      note:"Siparişten reklam taslağı oluşturuldu · " + (order.orderCode || order.id),
      date:now
    };

    try {
      const batch = db.batch();

      batch.set(bannerRef,bannerData);

      batch.update(db.collection("institutions").doc(String(inst.id)),{
        adStatus:"paused",
        adPackage:packageId,
        adStartAt:schedule.startAt,
        adEndAt:schedule.endAt,
        adPrice:total,
        adPaymentStatus:"paid",
        adNote:"Siparişten reklam taslağı oluşturuldu · " + (order.orderCode || order.id),
        adUpdatedAt:now,
        adHistory:[...oldHistory,historyEntry].slice(-20),
        updatedAt:now
      });

      batch.update(db.collection("promotionOrders").doc(String(order.id)),{
        convertedToAd:true,
        bannerAdId:bannerRef.id,
        adPlacement:placement,
        adStartAt:schedule.startAt,
        adEndAt:schedule.endAt,
        adDraftCreatedAt:now,
        status:"preparing",
        updatedAt:now
      });

      await batch.commit();

      const localInst = institutionRecords.find(x => String(x.id) === String(inst.id));
      if (localInst) {
        Object.assign(localInst,{
          adStatus:"paused",
          adPackage:packageId,
          adStartAt:schedule.startAt,
          adEndAt:schedule.endAt,
          adPrice:total,
          adPaymentStatus:"paid",
          adUpdatedAt:now
        });
      }

      addAudit(
        "Siparişten reklam taslağı oluşturuldu",
        (order.orderCode || order.id) + " · " + (inst.name || "Kurum") + " · " + adPlacementLabel(placement)
      );

      await Promise.all([
        loadPromotionAdminRecords(),
        loadBannerAdsAdmin()
      ]);

      renderManagedInstitutions();
      renderTodayTasks();

      $("bannerAdsTabBtn")?.click();
      setTimeout(() => editBannerAd(bannerRef.id),120);
    } catch (error) {
      console.error("Siparişten reklam taslağı oluşturulamadı:",error);
      alert("Reklam taslağı oluşturulamadı. Firestore yazma izinlerini kontrol edin.");
    }
  }

  async function loadAdAnalyticsRecords() {
    try {
      const snapshot = await db.collection("institutionAnalytics").get();
      adAnalyticsRecords = snapshot.docs
        .map(doc => ({id:doc.id,...doc.data()}))
        .filter(item => /ad_(impression|click)$/.test(String(item.type || "")));
    } catch (error) {
      console.warn("Reklam analitiği yüklenemedi:",error);
      adAnalyticsRecords = [];
    }
    return adAnalyticsRecords;
  }

  async function ensureAdBusinessData(reload = false) {
    const jobs = [];
    if (reload || !bannerAdRecords.length) jobs.push(loadBannerAdsAdmin());
    if (reload || !promotionAdminRecords.length) jobs.push(loadPromotionAdminRecords());
    if (reload || !supportAdminRecords.length) jobs.push(loadSupportAdminRecords());
    if (reload || !adAnalyticsRecords.length) jobs.push(loadAdAnalyticsRecords());
    await Promise.all(jobs);
  }

  function adminBannerIsActive(ad) {
    if (!ad || ad.active === false) return false;
    const start = adminParseDate(ad.startAt);
    const end = adminParseDate(ad.endAt,true);
    const now = Date.now();
    if (start && start.getTime() > now) return false;
    if (end && end.getTime() < now) return false;
    return true;
  }

  function adminInstitutionAdIsActive(inst) {
    if (!inst || String(inst.adStatus || "none") !== "active") return false;
    const start = adminParseDate(inst.adStartAt);
    const end = adminParseDate(inst.adEndAt,true);
    const now = Date.now();
    if (start && start.getTime() > now) return false;
    if (end && end.getTime() < now) return false;
    return true;
  }

  function getAdminAdCalendarEvents() {
    const events = [];
    const convertedInstitutionIds=new Set(
      bannerAdRecords
        .filter(ad=>ad.sourceOrderId && ad.institutionId)
        .map(ad=>String(ad.institutionId))
    );

    institutionRecords.forEach(inst => {
      if(convertedInstitutionIds.has(String(inst.id)))return;
      if (!["active","paused"].includes(String(inst.adStatus || ""))) return;
      if (!inst.adStartAt && !inst.adEndAt) return;
      const pkg = typeof ADMIN_AD_PACKAGES !== "undefined"
        ? ADMIN_AD_PACKAGES[inst.adPackage]
        : null;

      events.push({
        id:"institution-" + inst.id,
        source:"institution",
        sourceId:String(inst.id),
        institutionId:String(inst.id),
        title:String(inst.name || "Kurum"),
        subtitle:pkg?.name || "Kurum Reklam Paketi",
        placement:inst.adPackage === "premium" ? "premium_home" : "home_sponsor",
        startAt:String(inst.adStartAt || inst.adEndAt || ""),
        endAt:String(inst.adEndAt || inst.adStartAt || ""),
        active:String(inst.adStatus || "") === "active",
        paymentStatus:String(inst.adPaymentStatus || "unpaid"),
        amount:Number(inst.adPrice || 0)
      });
    });

    bannerAdRecords.forEach(ad => {
      if (!ad.startAt && !ad.endAt) return;
      events.push({
        id:"banner-" + ad.id,
        source:"banner",
        sourceId:String(ad.id),
        institutionId:String(ad.institutionId || ""),
        title:String(ad.headline || ad.institutionName || "Banner Reklamı"),
        subtitle:adPlacementLabel(ad.placement),
        placement:normalizeBannerPlacement(ad.placement),
        startAt:String(ad.startAt || ad.endAt || ""),
        endAt:String(ad.endAt || ad.startAt || ""),
        active:ad.active !== false,
        paymentStatus:"-",
        amount:0
      });
    });

    return events;
  }

  function adEventOnDay(event,date) {
    const dayStart = new Date(date.getFullYear(),date.getMonth(),date.getDate());
    const dayEnd = new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59,59,999);
    const start = adminParseDate(event.startAt) || dayStart;
    const end = adminParseDate(event.endAt,true) || start;
    return start.getTime() <= dayEnd.getTime() && end.getTime() >= dayStart.getTime();
  }

  function renderAdCalendarSelectedDay(date,events) {
    const title = $("adCalendarSelectedTitle");
    const root = $("adCalendarSelectedList");
    if (!root) return;

    const label = date.toLocaleDateString("tr-TR",{
      day:"numeric",month:"long",year:"numeric"
    });
    if (title) title.textContent = label + " · " + events.length + " reklam";

    root.innerHTML = events.length ? events.map(event => `
      <div class="ad-calendar-selected-row">
        <span class="ad-calendar-event-dot placement-${escapeHtml(event.placement)}"></span>
        <div>
          <strong>${escapeHtml(event.title)}</strong>
          <small>${escapeHtml(event.subtitle)} · ${escapeHtml(event.startAt || "-")} → ${escapeHtml(event.endAt || "-")}</small>
        </div>
        <button type="button"
          data-calendar-source="${escapeHtml(event.source)}"
          data-calendar-source-id="${escapeHtml(event.sourceId)}"
          data-calendar-institution-id="${escapeHtml(event.institutionId || "")}"
        >Yönet</button>
      </div>
    `).join("") : '<div class="advanced-empty">Bu gün için kayıtlı reklam bulunmuyor.</div>';

    root.querySelectorAll("[data-calendar-source]").forEach(button => {
      button.addEventListener("click",() => {
        if (button.dataset.calendarSource === "banner") {
          $("bannerAdsTabBtn")?.click();
          setTimeout(() => {
            const input = $("bannerAdSearch");
            if (input) {
              const ad = bannerAdRecords.find(x => String(x.id) === String(button.dataset.calendarSourceId));
              input.value = ad?.institutionName || ad?.headline || "";
              input.dispatchEvent(new Event("input",{bubbles:true}));
            }
          },150);
          return;
        }

        $("institutionsTabBtn")?.click();
        setTimeout(() => {
          const inst = institutionRecords.find(x => String(x.id) === String(button.dataset.calendarInstitutionId));
          if ($("institutionSearch") && inst) {
            $("institutionSearch").value = inst.name || "";
            $("institutionSearch").dispatchEvent(new Event("input",{bubbles:true}));
          }
        },150);
      });
    });
  }

  async function renderAdCalendar(reload = false) {
    const grid = $("adCalendarGrid");
    if (!grid) return;
    await ensureAdBusinessData(reload);

    const events = getAdminAdCalendarEvents();
    const cursor = new Date(adCalendarCursor.getFullYear(),adCalendarCursor.getMonth(),1);
    const monthTitle = cursor.toLocaleDateString("tr-TR",{month:"long",year:"numeric"});
    if ($("adCalendarMonthTitle")) $("adCalendarMonthTitle").textContent =
      monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

    const monthStart = new Date(cursor.getFullYear(),cursor.getMonth(),1);
    const monthEnd = new Date(cursor.getFullYear(),cursor.getMonth()+1,0,23,59,59);
    const monthEvents = events.filter(event => {
      const start = adminParseDate(event.startAt) || monthStart;
      const end = adminParseDate(event.endAt,true) || start;
      return start <= monthEnd && end >= monthStart;
    });

    const expiring7 = events.filter(event => {
      const d = adminDaysUntil(event.endAt);
      return event.active && d !== null && d >= 0 && d <= 7;
    }).length;

    if ($("adCalendarTabCount")) $("adCalendarTabCount").textContent = expiring7;
    if ($("adCalendarMonthHint")) $("adCalendarMonthHint").textContent =
      monthEvents.length + " reklam dönemi · " + expiring7 + " reklam 7 gün içinde bitiyor";

    const activeToday = events.filter(event => event.active && adEventOnDay(event,new Date()));
    const premiumToday = activeToday.filter(event => event.placement === "premium_home").length;
    const bannerToday = activeToday.filter(event => event.source === "banner").length;
    const monthStarts = events.filter(event => {
      const date = adminParseDate(event.startAt);
      return date && date >= monthStart && date <= monthEnd;
    }).length;
    const monthEnds = events.filter(event => {
      const date = adminParseDate(event.endAt,true);
      return date && date >= monthStart && date <= monthEnd;
    }).length;

    if ($("adCalendarSummary")) {
      $("adCalendarSummary").innerHTML = `
        <article><span>Bugün Yayında</span><strong>${activeToday.length}</strong><small>Tüm reklam alanları</small></article>
        <article><span>Premium Vitrin</span><strong>${premiumToday}</strong><small>Bugünkü premium doluluk</small></article>
        <article><span>Banner</span><strong>${bannerToday}</strong><small>Bugün aktif banner</small></article>
        <article><span>Bu Ay Başlayan</span><strong>${monthStarts}</strong><small>Yeni reklam dönemi</small></article>
        <article><span>Bu Ay Bitecek</span><strong>${monthEnds}</strong><small>Yenileme planı</small></article>
        <article class="${expiring7 ? "warning" : ""}"><span>7 Günde Biten</span><strong>${expiring7}</strong><small>Yenileme fırsatı</small></article>
      `;
    }

    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstWeekday);
    const todayKey = adminDayKey(new Date());
    const selectedKey = adminDayKey(adCalendarSelectedDate);

    const cells = [];
    for (let index=0; index<42; index++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate()+index);
      const dayEvents = events.filter(event => adEventOnDay(event,date));
      const dayKey = adminDayKey(date);
      const outside = date.getMonth() !== cursor.getMonth();

      cells.push(`
        <button type="button"
          class="ad-calendar-day ${outside?"outside":""} ${dayKey===todayKey?"today":""} ${dayKey===selectedKey?"selected":""}"
          data-calendar-day="${dayKey}">
          <b>${date.getDate()}</b>
          <div class="ad-calendar-day-events">
            ${dayEvents.slice(0,3).map(event =>
              '<span class="placement-'+escapeHtml(event.placement)+'" title="'+escapeHtml(event.title)+'">'+
                escapeHtml(event.title)+
              '</span>'
            ).join("")}
            ${dayEvents.length>3?'<em>+'+(dayEvents.length-3)+' daha</em>':""}
          </div>
        </button>
      `);
    }
    grid.innerHTML = cells.join("");

    grid.querySelectorAll("[data-calendar-day]").forEach(button => {
      button.addEventListener("click",() => {
        const parts = button.dataset.calendarDay.split("-").map(Number);
        adCalendarSelectedDate = new Date(parts[0],parts[1]-1,parts[2]);
        renderAdCalendarSelectedDay(
          adCalendarSelectedDate,
          events.filter(event => adEventOnDay(event,adCalendarSelectedDate))
        );
        grid.querySelectorAll(".ad-calendar-day").forEach(cell => {
          cell.classList.toggle("selected",cell.dataset.calendarDay === button.dataset.calendarDay);
        });
      });
    });

    renderAdCalendarSelectedDay(
      adCalendarSelectedDate,
      events.filter(event => adEventOnDay(event,adCalendarSelectedDate))
    );
  }

  $("adCalendarPrev")?.addEventListener("click",() => {
    adCalendarCursor = new Date(adCalendarCursor.getFullYear(),adCalendarCursor.getMonth()-1,1);
    adCalendarSelectedDate = new Date(adCalendarCursor);
    renderAdCalendar(false);
  });
  $("adCalendarNext")?.addEventListener("click",() => {
    adCalendarCursor = new Date(adCalendarCursor.getFullYear(),adCalendarCursor.getMonth()+1,1);
    adCalendarSelectedDate = new Date(adCalendarCursor);
    renderAdCalendar(false);
  });
  $("adCalendarToday")?.addEventListener("click",() => {
    adCalendarCursor = new Date();
    adCalendarSelectedDate = new Date();
    renderAdCalendar(false);
  });

  function revenueForPromotionOrder(order) {
    if (order.convertedToAd) return 0;
    return Number(order.priceBreakdown?.total ?? order.price ?? 0);
  }

  function revenueBusinessRows() {
    const rows = [];

    institutionRecords.forEach(inst => {
      if (!["active","paused"].includes(String(inst.adStatus || ""))) return;
      rows.push({
        source:"Kurum reklam paketi",
        name:String(inst.name || "Kurum"),
        amount:Number(inst.adPrice || 0),
        paid:String(inst.adPaymentStatus || "unpaid") === "paid",
        pending:String(inst.adPaymentStatus || "unpaid") !== "paid",
        date:String(inst.adStartAt || inst.adUpdatedAt || inst.updatedAt || ""),
        packageLabel:typeof ADMIN_AD_PACKAGES !== "undefined"
          ? (ADMIN_AD_PACKAGES[inst.adPackage]?.name || inst.adPackage || "Reklam")
          : (inst.adPackage || "Reklam")
      });
    });

    promotionAdminRecords.forEach(order => {
      const amount = revenueForPromotionOrder(order);
      if (amount <= 0) return;
      rows.push({
        source:"Tanıtım / reklam siparişi",
        name:String(order.institutionName || "Kurum"),
        amount,
        paid:String(order.paymentStatus || "pending") === "paid",
        pending:String(order.paymentStatus || "pending") !== "paid",
        date:String(order.paidAt || order.updatedAt || order.createdAt || ""),
        packageLabel:String(order.serviceName || "Sipariş")
      });
    });

    bannerAdRecords.forEach(ad => {
      if (ad.sourceOrderId) return;
      const amount=Math.max(0,Number(ad.salePrice||0));
      if(amount<=0)return;
      rows.push({
        source:"Banner reklam satışı",
        name:String(ad.institutionName || ad.headline || "Banner"),
        amount,
        paid:String(ad.paymentStatus||"unpaid")==="paid",
        pending:String(ad.paymentStatus||"unpaid")!=="paid",
        date:String(ad.paidAt || ad.updatedAt || ad.createdAt || ""),
        packageLabel:adPlacementLabel(ad.placement)
      });
    });

    return rows;
  }

  function adAnalyticsSummary() {
    const impressions = adAnalyticsRecords.filter(x =>
      String(x.type || "").endsWith("ad_impression")
    ).length;
    const clicks = adAnalyticsRecords.filter(x =>
      String(x.type || "").endsWith("ad_click")
    ).length;
    return {
      impressions,
      clicks,
      ctr:impressions ? clicks / impressions * 100 : 0
    };
  }

  function expiringAdvertisingRows(days = 7) {
    const rows = [];
    const convertedInstitutionIds=new Set(
      bannerAdRecords
        .filter(ad=>ad.sourceOrderId && ad.institutionId)
        .map(ad=>String(ad.institutionId))
    );

    institutionRecords.forEach(inst => {
      if(convertedInstitutionIds.has(String(inst.id)))return;
      if (!adminInstitutionAdIsActive(inst)) return;
      const left = adminDaysUntil(inst.adEndAt);
      if (left === null || left < 0 || left > days) return;
      rows.push({
        kind:"institution",
        id:String(inst.id),
        institutionId:String(inst.id),
        name:String(inst.name || "Kurum"),
        endAt:String(inst.adEndAt || ""),
        daysLeft:left,
        phone:String(inst.phone || ""),
        label:typeof ADMIN_AD_PACKAGES !== "undefined"
          ? (ADMIN_AD_PACKAGES[inst.adPackage]?.name || "Reklam Paketi")
          : "Reklam Paketi"
      });
    });

    bannerAdRecords.forEach(ad => {
      if (!adminBannerIsActive(ad)) return;
      const left = adminDaysUntil(ad.endAt);
      if (left === null || left < 0 || left > days) return;
      const inst = institutionRecords.find(x => String(x.id) === String(ad.institutionId));
      rows.push({
        kind:"banner",
        id:String(ad.id),
        institutionId:String(ad.institutionId || ""),
        name:String(ad.institutionName || ad.headline || "Banner"),
        endAt:String(ad.endAt || ""),
        daysLeft:left,
        phone:String(inst?.phone || ""),
        label:adPlacementLabel(ad.placement)
      });
    });

    return rows.sort((a,b)=>a.daysLeft-b.daysLeft);
  }

  function bindRenewalActions(root) {
    root?.querySelectorAll("[data-renew-whatsapp]").forEach(button => {
      button.addEventListener("click",() => {
        const row = expiringAdvertisingRows(30).find(
          item => item.kind + ":" + item.id === button.dataset.renewWhatsapp
        );
        if (!row) return;
        const digits = String(row.phone || "").replace(/\D/g,"");
        if (!digits) {
          alert("Kurumun telefon bilgisi bulunmuyor.");
          return;
        }
        const normalized = digits.startsWith("0") ? "90"+digits.slice(1) : digits;
        const message = [
          "Merhaba " + row.name + ",",
          "",
          "Dijiyer reklamınız " + (row.daysLeft===0 ? "bugün" : row.daysLeft+" gün içinde") + " sona eriyor.",
          "Görünürlüğünüz kesilmeden reklamınızı yenilemek ister misiniz?",
          "",
          "Mevcut alan: " + row.label
        ].join("\n");
        window.open("https://wa.me/"+normalized+"?text="+encodeURIComponent(message),"_blank");
      });
    });

    root?.querySelectorAll("[data-renew-manage]").forEach(button => {
      button.addEventListener("click",() => {
        const [kind,id] = String(button.dataset.renewManage || "").split(":");
        if (kind === "banner") {
          $("bannerAdsTabBtn")?.click();
          setTimeout(()=>{
            const ad=bannerAdRecords.find(x=>String(x.id)===String(id));
            if($("bannerAdSearch")&&ad){
              $("bannerAdSearch").value=ad.institutionName || ad.headline || "";
              $("bannerAdSearch").dispatchEvent(new Event("input",{bubbles:true}));
            }
          },120);
        } else {
          $("institutionsTabBtn")?.click();
          setTimeout(()=>{
            const inst=institutionRecords.find(x=>String(x.id)===String(id));
            if($("institutionSearch")&&inst){
              $("institutionSearch").value=inst.name || "";
              $("institutionSearch").dispatchEvent(new Event("input",{bubbles:true}));
            }
          },120);
        }
      });
    });
  }

  async function renderAdRevenueCenter(reload = false) {
    if (!$("adRevenueSection")) return;
    await ensureAdBusinessData(reload);

    const revenueRows = revenueBusinessRows();
    const paid = revenueRows.filter(x=>x.paid).reduce((sum,x)=>sum+x.amount,0);
    const pending = revenueRows.filter(x=>x.pending).reduce((sum,x)=>sum+x.amount,0);
    const convertedInstitutionIds=new Set(
      bannerAdRecords
        .filter(ad=>ad.sourceOrderId && ad.institutionId)
        .map(ad=>String(ad.institutionId))
    );
    const activeInstitutionAds = institutionRecords
      .filter(adminInstitutionAdIsActive)
      .filter(inst=>!convertedInstitutionIds.has(String(inst.id)));
    const activeBanners = bannerAdRecords.filter(adminBannerIsActive);
    const activeAds = activeInstitutionAds.length + activeBanners.length;
    const expiring = expiringAdvertisingRows(7);
    const analytics = adAnalyticsSummary();

    const premiumInstitutions = new Set();
    activeInstitutionAds
      .filter(inst => String(inst.adPackage || "") === "premium")
      .forEach(inst => premiumInstitutions.add(String(inst.id)));
    activeBanners
      .filter(ad => normalizeBannerPlacement(ad.placement) === "premium_home")
      .forEach(ad => premiumInstitutions.add(String(ad.institutionId || ad.id)));

    const sponsorInstitutions = new Set();
    activeInstitutionAds
      .filter(inst => String(inst.adPackage || "") !== "premium")
      .forEach(inst => sponsorInstitutions.add(String(inst.id)));
    activeBanners
      .filter(ad => ["home_sponsor","mobile_sponsor","sidebar_sponsor"].includes(normalizeBannerPlacement(ad.placement)))
      .forEach(ad => sponsorInstitutions.add(String(ad.institutionId || ad.id)));

    $("adRevenueActiveCount").textContent = activeAds;
    $("adRevenuePremiumCount").textContent = premiumInstitutions.size;
    $("adRevenueSponsorCount").textContent = sponsorInstitutions.size;
    $("adRevenueBannerCount").textContent = activeBanners.length;
    $("adRevenueTotal").textContent = money(paid + pending);
    $("adRevenuePaid").textContent = money(paid);
    $("adRevenuePending").textContent = money(pending);
    $("adRevenueExpiring").textContent = expiring.length;
    $("adRevenueImpressions").textContent = analytics.impressions;
    $("adRevenueClicks").textContent = analytics.clicks;
    $("adRevenueCtr").textContent = "%" + analytics.ctr.toFixed(1) + " CTR";

    const sourceTotals = new Map();
    revenueRows.forEach(row => {
      const key = row.source;
      if (!sourceTotals.has(key)) sourceTotals.set(key,{paid:0,pending:0,count:0});
      const target=sourceTotals.get(key);
      target.count++;
      if(row.paid)target.paid+=row.amount;
      else target.pending+=row.amount;
    });

    $("adRevenueBreakdown").innerHTML = sourceTotals.size
      ? [...sourceTotals.entries()].map(([label,row])=>`
          <div class="ad-revenue-breakdown-row">
            <div><strong>${escapeHtml(label)}</strong><small>${row.count} kayıt</small></div>
            <span><b>${money(row.paid)}</b> tahsil</span>
            <span class="pending">${money(row.pending)} bekliyor</span>
          </div>
        `).join("")
      : '<div class="advanced-empty">Henüz fiyatlandırılmış reklam kaydı yok.</div>';

    const renewalRoot=$("adRenewalList");
    renewalRoot.innerHTML=expiring.length ? expiring.map(row=>`
      <div class="ad-renewal-row urgency-${row.daysLeft===0?"today":row.daysLeft<=3?"high":"normal"}">
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <span>${escapeHtml(row.label)} · ${row.daysLeft===0?"Bugün bitiyor":row.daysLeft+" gün kaldı"}</span>
          <small>Bitiş: ${escapeHtml(row.endAt)}</small>
        </div>
        <div>
          <button type="button" data-renew-whatsapp="${escapeHtml(row.kind+":"+row.id)}">Yenilemeyi Görüş</button>
          <button type="button" data-renew-manage="${escapeHtml(row.kind+":"+row.id)}">Yönet</button>
        </div>
      </div>
    `).join("") : '<div class="advanced-empty success">Önümüzdeki 7 gün içinde bitecek reklam yok.</div>';
    bindRenewalActions(renewalRoot);

    const byInstitution=new Map();
    adAnalyticsRecords.forEach(item=>{
      const id=String(item.institutionId||"");
      if(!id)return;
      if(!byInstitution.has(id))byInstitution.set(id,{impressions:0,clicks:0});
      const row=byInstitution.get(id);
      if(String(item.type||"").endsWith("ad_impression"))row.impressions++;
      if(String(item.type||"").endsWith("ad_click"))row.clicks++;
    });

    const performance=[...byInstitution.entries()]
      .map(([id,row])=>{
        const inst=institutionRecords.find(x=>String(x.id)===id);
        return {
          id,
          name:inst?.name || "Kurum",
          impressions:row.impressions,
          clicks:row.clicks,
          ctr:row.impressions ? row.clicks/row.impressions*100 : 0
        };
      })
      .sort((a,b)=>b.impressions-a.impressions)
      .slice(0,20);

    $("adPerformanceList").innerHTML=performance.length ? `
      <div class="ad-performance-table">
        <div class="ad-performance-head"><span>Kurum</span><span>Gösterim</span><span>Tıklama</span><span>CTR</span></div>
        ${performance.map(row=>`
          <div class="ad-performance-row">
            <strong>${escapeHtml(row.name)}</strong>
            <span>${row.impressions}</span>
            <span>${row.clicks}</span>
            <span>%${row.ctr.toFixed(1)}</span>
          </div>
        `).join("")}
      </div>
    ` : '<div class="advanced-empty">Henüz reklam gösterim / tıklama verisi oluşmadı.</div>';

  }

  $("adRevenueRefreshBtn")?.addEventListener("click",()=>renderAdRevenueCenter(true));

  async function renderTodayTasks() {
    const root = $("adminTodayTasks");
    if (!root) return;

    await ensureAdBusinessData(false);

    const tasks = [];
    const pendingApps = applicationRecords.filter(
      item => String(item.status || "pending") === "pending"
    ).length;
    const noOffer = quoteRequestRecords.filter(item =>
      (!Array.isArray(item.liveOffers) || item.liveOffers.length === 0) &&
      !["done","used"].includes(String(item.currentState || ""))
    ).length;
    const newOrders = promotionAdminRecords.filter(
      item => String(item.status || "new") === "new"
    ).length;
    const overdueSupport = supportAdminRecords.filter(supportTicketIsOverdue).length;
    const expiring3 = expiringAdvertisingRows(3);
    const unpaidInstitutionAds = institutionRecords.filter(item =>
      ["active","paused"].includes(String(item.adStatus || "")) &&
      String(item.adPaymentStatus || "unpaid") !== "paid"
    ).length;
    const unpaidBannerAds = bannerAdRecords.filter(item =>
      !item.sourceOrderId &&
      Math.max(0,Number(item.salePrice||0))>0 &&
      String(item.paymentStatus||"unpaid")!=="paid"
    ).length;
    const unpaidAds=unpaidInstitutionAds+unpaidBannerAds;

    if (pendingApps) tasks.push({
      level:"normal",count:pendingApps,title:"Yeni kurum başvurusu",
      text:"İnceleyip onay veya ret kararı verin.",tab:"applicationsTabBtn",button:"Başvurular"
    });
    if (noOffer) tasks.push({
      level:"warning",count:noOffer,title:"Henüz teklif almayan talep",
      text:"Uygun kurum eşleşmelerini kontrol edin.",tab:"quotesTabBtn",button:"Talepler"
    });
    if (newOrders) tasks.push({
      level:"money",count:newOrders,title:"Yeni tanıtım / reklam siparişi",
      text:"Fiyatlandırma ve ödeme sürecini başlatın.",tab:"promotionOrdersTabBtn",button:"Siparişler"
    });
    if (unpaidAds) tasks.push({
      level:"money",count:unpaidAds,title:"Ödeme bekleyen aktif reklam",
      text:"Tahsilat durumunu kontrol edin.",tab:"adRevenueTabBtn",button:"Gelir"
    });
    if (expiring3.length) tasks.push({
      level:"urgent",count:expiring3.length,title:"3 gün içinde bitecek reklam",
      text:"Yenileme görüşmesini kaçırmayın.",tab:"adRevenueTabBtn",button:"Yenilemeler"
    });
    if (overdueSupport) tasks.push({
      level:"urgent",count:overdueSupport,title:"Geciken destek talebi",
      text:"SLA süresini aşan taleplere yanıt verin.",tab:"supportTabBtn",button:"Destek"
    });

    $("adminTodayTaskCount").textContent = tasks.reduce((sum,item)=>sum+item.count,0);

    root.innerHTML = tasks.length ? tasks.map(task=>`
      <article class="admin-today-task level-${escapeHtml(task.level)}">
        <span class="admin-today-task-count">${task.count}</span>
        <div>
          <strong>${escapeHtml(task.title)}</strong>
          <small>${escapeHtml(task.text)}</small>
        </div>
        <button type="button" data-today-tab="${escapeHtml(task.tab)}">${escapeHtml(task.button)}</button>
      </article>
    `).join("") : '<div class="advanced-empty success">Bugün için acil işlem görünmüyor.</div>';

    root.querySelectorAll("[data-today-tab]").forEach(button=>{
      button.addEventListener("click",()=>$(button.dataset.todayTab)?.click());
    });
  }

  $("overviewTabBtn")?.addEventListener("click",()=>setTimeout(renderTodayTasks,80));

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
    setTimeout(()=>{
      refreshAdminNotifications();
      renderTodayTasks();
    }, 800);
  });

  setTimeout(() => {
    decorateExistingInstitutionCards();
    populateAnnouncementTargets();
    renderAnnouncementHistory();
    renderSupportCenter();
    refreshAdminNotifications();
    renderTodayTasks();
    renderAudit();
  }, 1200);
})();
