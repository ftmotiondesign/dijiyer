(() => {
  let enhanced = false;
  let lastSignature = "";

  function safePublicUrl(value) {
    try {
      const raw = String(value || "").trim();
      if (!raw) return "";
      const url = new URL(raw, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function html(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[char]);
  }

  function youtubeEmbed(value) {
    const raw = safePublicUrl(value);
    if (!raw) return "";
    try {
      const url = new URL(raw);
      if (url.hostname.includes("youtu.be")) {
        const id = url.pathname.replace(/^\//, "").split("/")[0];
        return id ? "https://www.youtube.com/embed/" + encodeURIComponent(id) : "";
      }
      if (url.hostname.includes("youtube.com")) {
        const id =
          url.searchParams.get("v") ||
          (url.pathname.includes("/shorts/")
            ? url.pathname.split("/shorts/")[1]?.split("/")[0]
            : "");
        return id ? "https://www.youtube.com/embed/" + encodeURIComponent(id) : "";
      }
    } catch (_) {}
    return "";
  }

  function vimeoEmbed(value) {
    const raw = safePublicUrl(value);
    if (!raw) return "";
    try {
      const url = new URL(raw);
      if (!url.hostname.includes("vimeo.com")) return "";
      const id = url.pathname.split("/").filter(Boolean).pop();
      return /^\d+$/.test(id || "") ? "https://player.vimeo.com/video/" + id : "";
    } catch (_) {
      return "";
    }
  }

  function videoMarkup(url, cover, name) {
    const safe = safePublicUrl(url);
    if (!safe) return "";

    const embed = youtubeEmbed(safe) || vimeoEmbed(safe);
    if (embed) {
      return `
        <div class="kp-premium-frame">
          <iframe
            src="${html(embed)}"
            title="${html(name)} konum videosu"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }

    let pathname = "";
    try { pathname = new URL(safe).pathname.toLowerCase(); } catch (_) {}

    if (/\.(mp4|webm|ogg)$/.test(pathname)) {
      return `
        <div class="kp-premium-frame">
          <video controls playsinline preload="metadata" ${cover ? 'poster="' + html(cover) + '"' : ""}>
            <source src="${html(safe)}">
          </video>
        </div>
      `;
    }

    return `
      <div class="kp-premium-link-card">
        <span class="kp-premium-play">▶</span>
        <div>
          <strong>Konum Videosu</strong>
          <small>Video yeni sekmede açılacaktır.</small>
        </div>
        <a href="${html(safe)}" target="_blank" rel="noopener">Videoyu İzle</a>
      </div>
    `;
  }

  function tourEmbed(value) {
    const safe = safePublicUrl(value);
    if (!safe) return "";
    try {
      const host = new URL(safe).hostname.toLowerCase();
      const allowed = [
        "kuula.co",
        "3dvista.com",
        "matterport.com",
        "my.matterport.com",
        "momento360.com"
      ];
      return allowed.some(domain => host === domain || host.endsWith("." + domain))
        ? safe
        : "";
    } catch (_) {
      return "";
    }
  }

  function restoreCover(data, videoUrl) {
    if (!videoUrl) return;
    const coverRoot = document.querySelector(".kp-cover");
    const currentVideo = coverRoot?.querySelector("video");
    if (!coverRoot || !currentVideo) return;

    const cover = safePublicUrl(data.coverUrl);
    if (cover) {
      currentVideo.outerHTML =
        '<img src="' + html(cover) + '" alt="' + html(data.name || "Kurum") + ' kapak">';
    } else {
      currentVideo.outerHTML =
        '<div class="kp-cover-empty">' + html(data.emoji || "🏢") + "</div>";
    }
  }

  function enhance() {
    const root = document.getElementById("institutionProfile");
    if (!root || root.classList.contains("hidden") || !root.children.length) return;

    let data = null;
    try {
      if (typeof institution !== "undefined") data = institution;
    } catch (_) {}
    if (!data) return;

    const locationVideo = safePublicUrl(
      data.locationVideoUrl || data.profileVideoUrl || data.videoUrl
    );
    const virtualTour = safePublicUrl(
      data.virtualTourUrl || data.tour360Url || data.tourUrl
    );

    const signature = [data.id || "", locationVideo, virtualTour, data.coverUrl || ""].join("|");
    if (enhanced && signature === lastSignature) return;
    lastSignature = signature;

    document.getElementById("kpPremiumExperience")?.remove();
    document.querySelectorAll(".kp-premium-added").forEach(node => node.remove());

    if (!locationVideo && !virtualTour) {
      enhanced = true;
      return;
    }

    restoreCover(data, locationVideo);

    const badges = document.querySelector(".kp-badges");
    if (badges) {
      if (locationVideo) {
        const badge = document.createElement("span");
        badge.className = "kp-badge video kp-premium-added";
        badge.textContent = "▶ Konum Videosu";
        badges.appendChild(badge);
      }
      if (virtualTour) {
        const badge = document.createElement("span");
        badge.className = "kp-badge tour kp-premium-added";
        badge.textContent = "360° Sanal Tur";
        badges.appendChild(badge);
      }
    }

    const actions = document.querySelector(".kp-actions");
    if (actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kp-btn kp-premium-discover kp-premium-added";
      button.textContent = "◎ Mekanı Keşfet";
      button.addEventListener("click", () => {
        document.getElementById("kpPremiumExperience")
          ?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
      actions.prepend(button);
    }

    document.querySelector(".kp-special")?.remove();

    const main = document.querySelector(".kp-main");
    if (!main) return;

    const cards = [...main.querySelectorAll(":scope > .kp-card")];
    const galleryCard = cards.find(card =>
      /Kurumdan Görseller/i.test(card.textContent || "")
    );
    const servicesCard = cards.find(card =>
      /Sunulan Hizmetler/i.test(card.textContent || "")
    );

    const section = document.createElement("section");
    section.className = "kp-card kp-premium-experience";
    section.id = "kpPremiumExperience";

    const cover = safePublicUrl(data.coverUrl);
    const tourFrame = tourEmbed(virtualTour);

    section.innerHTML = `
      <div class="kp-head kp-premium-head">
        <div>
          <span class="eyebrow">MEKANI KEŞFET</span>
          <h2>Gelmeden Önce Kurumu Görün</h2>
          <p>Konumu ve mekanı daha yakından inceleyin.</p>
        </div>
        <span class="kp-premium-label">Dijiyer Tanıtım</span>
      </div>

      <div class="kp-premium-grid">
        ${locationVideo ? `
          <article class="kp-premium-card">
            <div class="kp-premium-title">
              <span class="kp-premium-icon video">▶</span>
              <div>
                <strong>Konum Videosu</strong>
                <small>Kuruma nasıl ulaşacağınızı kısa videoda görün.</small>
              </div>
            </div>
            ${videoMarkup(locationVideo, cover, data.name || "Kurum")}
          </article>
        ` : ""}

        ${virtualTour ? `
          <article class="kp-premium-card">
            <div class="kp-premium-title">
              <span class="kp-premium-icon tour">360°</span>
              <div>
                <strong>360° Sanal Tur</strong>
                <small>Mekana gelmeden önce içeride gezinin.</small>
              </div>
            </div>
            ${tourFrame ? `
              <div class="kp-premium-frame tour">
                <iframe src="${html(tourFrame)}" title="360 derece sanal tur" loading="lazy" allowfullscreen></iframe>
              </div>
            ` : ""}
            <a class="kp-premium-tour-open" href="${html(virtualTour)}" target="_blank" rel="noopener">
              ◉ 360° Turu Tam Ekran Aç
            </a>
          </article>
        ` : ""}
      </div>
    `;

    if (galleryCard) {
      main.insertBefore(section, galleryCard);
    } else if (servicesCard?.nextSibling) {
      main.insertBefore(section, servicesCard.nextSibling);
    } else {
      main.appendChild(section);
    }

    enhanced = true;
  }

  const originalRender =
    typeof renderProfile === "function" ? renderProfile : null;

  if (originalRender) {
    renderProfile = function(...args) {
      const result = originalRender.apply(this, args);
      enhanced = false;
      setTimeout(enhance, 0);
      return result;
    };
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    enhance();
    if (enhanced || attempts >= 30) {
      clearInterval(timer);
    }
  }, 300);

  window.addEventListener("load", () => setTimeout(enhance, 100));
})();