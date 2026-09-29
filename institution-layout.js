(() => {
  const pages = {
    summary: {
      group:"İŞİM",
      title:"Özet",
      description:"Bugünkü teklif ve kurum durumunu tek ekranda görün.",
      action:"Yeni Teklifleri Gör",
      actionTarget:"quotes"
    },
    quotes: {
      group:"İŞİM",
      title:"Teklifler",
      description:"Yeni müşteri taleplerini, verdiğiniz teklifleri ve mesajları yönetin.",
      action:"Yeni Talepleri Göster",
      actionTarget:"quotes-new"
    },
    verify: {
      group:"İŞİM",
      title:"Teklif Doğrula",
      description:"Müşterinin teklif kodunu kontrol ederek fiyatı ve şartları doğrulayın.",
      action:"Tekliflere Dön",
      actionTarget:"quotes"
    },
    profile: {
      group:"KURUMUM",
      title:"Kurum Bilgileri",
      description:"Müşterilerin gördüğü kurum ve iletişim bilgilerinizi güncelleyin.",
      action:"Özete Dön",
      actionTarget:"summary"
    },
    showcase: {
      group:"KURUMUM",
      title:"Tanıtım Hizmetleri",
      description:"Konum Videosu ve 360° Sanal Tur ile kurum sayfanızı daha güçlü bir vitrine dönüştürün.",
      action:"Müşteri Sayfamı Gör",
      actionTarget:"profile-preview"
    },
    stats: {
      group:"KURUMUM",
      title:"İstatistikler",
      description:"Profil ziyaretleri, müşteri etkileşimleri ve sektör performansınızı inceleyin.",
      action:"Özete Dön",
      actionTarget:"summary"
    },
    announcements: {
      group:"YARDIM & HESAP",
      title:"Duyurular",
      description:"Dijiyer yönetiminden gelen kurum duyurularını görüntüleyin.",
      action:"Özete Dön",
      actionTarget:"summary"
    },
    support: {
      group:"YARDIM & HESAP",
      title:"Destek",
      description:"Sorun veya taleplerinizi Dijiyer ekibine iletin ve yanıtları takip edin.",
      action:"Yeni Destek Talebi",
      actionTarget:"support-form"
    },
    account: {
      group:"YARDIM & HESAP",
      title:"Hesap",
      description:"Kurum hesabınızın e-posta ve şifre işlemlerini yönetin.",
      action:"Özete Dön",
      actionTarget:"summary"
    }
  };

  const mobileMenu = document.getElementById("institutionMobileMenu");
  const mobileOpen = document.getElementById("openInstitutionMobileMenu");
  const mobileClose = document.getElementById("closeInstitutionMobileMenu");
  const headingAction = document.getElementById("panelHeadingQuickAction");

  function closeMobileMenu() {
    mobileMenu?.classList.add("hidden");
    document.body.classList.remove("mobile-panel-menu-open");
  }

  function openMobileMenu() {
    mobileMenu?.classList.remove("hidden");
    document.body.classList.add("mobile-panel-menu-open");
  }

  mobileOpen?.addEventListener("click", openMobileMenu);
  mobileClose?.addEventListener("click", closeMobileMenu);

  mobileMenu?.addEventListener("click", event => {
    if (event.target === mobileMenu) closeMobileMenu();
  });

  mobileMenu?.querySelectorAll("[data-panel-tab]").forEach(button => {
    button.addEventListener("click", closeMobileMenu);
  });

  function runHeadingAction(page) {
    const target = page?.actionTarget || "summary";

    if (target === "quotes-new") {
      const filter = document.getElementById("quotePanelFilter");
      if (filter) filter.value = "new";
      setPanelTab("quotes");
      if (typeof renderQuotes === "function") renderQuotes();
      return;
    }

    if (target === "profile-preview") {
      document.getElementById("publicProfilePreviewBtn")?.click();
      return;
    }

    if (target === "support-form") {
      setPanelTab("support");
      setTimeout(() => {
        document.getElementById("supportTicketForm")
          ?.scrollIntoView({ behavior:"smooth", block:"start" });
        document.getElementById("supportCategory")?.focus();
      }, 100);
      return;
    }

    setPanelTab(target);
  }

  headingAction?.addEventListener("click", () => {
    const name = document.body.dataset.panelCurrent || "summary";
    runHeadingAction(pages[name]);
  });

  function syncMirror(sourceId) {
    const source = document.getElementById(sourceId);
    if (!source) return;

    const apply = () => {
      const value = (source.textContent || "0").trim();
      document.querySelectorAll('[data-mirror-count="' + sourceId + '"]')
        .forEach(target => {
          target.textContent = value;
          const numeric = Number(value.replace(/[^0-9]/g,"")) || 0;
          target.classList.toggle("empty", numeric === 0);
        });
    };

    apply();
    new MutationObserver(apply).observe(source, {
      childList:true,
      subtree:true,
      characterData:true
    });
  }

  ["quoteTabCount","supportTabCount","announcementTabCount"].forEach(syncMirror);

  window.updateInstitutionNavigation = function(name) {
    const page = pages[name] || pages.summary;

    document.body.dataset.panelCurrent = name;

    const eyebrow = document.getElementById("panelCurrentEyebrow");
    const title = document.getElementById("panelCurrentTitle");
    const description = document.getElementById("panelCurrentDescription");

    if (eyebrow) eyebrow.textContent = page.group;
    if (title) title.textContent = page.title;
    if (description) description.textContent = page.description;
    if (headingAction) headingAction.textContent = page.action;

    document.querySelectorAll(".institution-mobile-bottom-nav [data-panel-tab]")
      .forEach(button => {
        button.classList.toggle("active", button.dataset.panelTab === name);
      });

    document.querySelectorAll(".mobile-menu-grid [data-panel-tab]")
      .forEach(button => {
        button.classList.toggle("active", button.dataset.panelTab === name);
      });

    closeMobileMenu();

    if (window.innerWidth <= 760) {
      window.scrollTo({ top:0, behavior:"smooth" });
    }
  };

  document.body.dataset.panelCurrent =
    document.querySelector("[data-panel-view].active")?.dataset.panelView || "summary";

  window.updateInstitutionNavigation(document.body.dataset.panelCurrent);

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMobileMenu();
  });
})();
