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

  function directVideo(value) {
    const safe = safePublicUrl(value);
    if (!safe) return "";
    try {
      const path = new URL(safe).pathname.toLowerCase();
      return /\.(mp4|webm|ogg|mov|m4v)$/.test(path) ? safe : "";
    } catch (_) {
      return "";
    }
  }

  function youtubeEmbed(value, autoplay = false) {
    const raw = safePublicUrl(value);
    if (!raw) return "";
    try {
      const url = new URL(raw);
      let id = "";
      if (url.hostname.includes("youtu.be")) {
        id = url.pathname.replace(/^\//, "").split("/")[0];
      } else if (url.hostname.includes("youtube.com")) {
        id =
          url.searchParams.get("v") ||
          (url.pathname.includes("/shorts/")
            ? url.pathname.split("/shorts/")[1]?.split("/")[0]
            : "");
      }
      if (!id) return "";
      return "https://www.youtube.com/embed/" + encodeURIComponent(id) +
        (autoplay ? "?autoplay=1&mute=1&playsinline=1&rel=0" : "?rel=0");
    } catch (_) {
      return "";
    }
  }

  function vimeoEmbed(value, autoplay = false) {
    const raw = safePublicUrl(value);
    if (!raw) return "";
    try {
      const url = new URL(raw);
      if (!url.hostname.includes("vimeo.com")) return "";
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (!/^\d+$/.test(id || "")) return "";
      return "https://player.vimeo.com/video/" + id +
        (autoplay ? "?autoplay=1&muted=1&background=0" : "");
    } catch (_) {
      return "";
    }
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

  function badgeMarkup(data, hasTour, hasVideo) {
    return `
      <div class="kp-badges kp-premium-badges">
        <span class="kp-badge ok">✓ Onaylı Kurum</span>
        ${data.offer !== false ? '<span class="kp-badge offer">₺ Teklif Veriyor</span>' : ''}
        ${hasTour ? '<span class="kp-badge tour">360° Mekan</span>' : ''}
        ${!hasTour && hasVideo ? '<span class="kp-badge video">▶ Video</span>' : ''}
        ${data.vip ? '<span class="kp-badge">★ Öne Çıkan</span>' : ''}
      </div>
    `;
  }

  function fallbackVisual(data) {
    const cover = safePublicUrl(data.coverUrl);
    if (cover) {
      return '<img class="kp-hero-fallback-image" src="' + html(cover) + '" alt="' +
        html((data.name || "Kurum") + " kapak") + '">';
    }
    return '<div class="kp-cover-empty">' + html(data.emoji || "🏢") + '</div>';
  }

  function locationVideoMarkup(url, cover, name) {
    const safe = safePublicUrl(url);
    if (!safe) return "";

    const direct = directVideo(safe);
    if (direct) {
      return `
        <video class="kp-hero-video" autoplay muted loop playsinline controls preload="metadata"
          ${cover ? 'poster="' + html(cover) + '"' : ''}>
          <source src="${html(direct)}">
        </video>
      `;
    }

    const embed = youtubeEmbed(safe, true) || vimeoEmbed(safe, true);
    if (embed) {
      return `
        <iframe
          class="kp-hero-iframe"
          src="${html(embed)}"
          title="${html(name)} tanıtım videosu"
          loading="eager"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      `;
    }

    return "";
  }

  function tourMarkup(url, cover, name) {
    const safe = safePublicUrl(url);
    if (!safe) return { markup:"", interactive:false, external:"" };

    const embed = tourEmbed(safe);
    if (embed) {
      return {
        markup:`
          <iframe
            class="kp-hero-iframe kp-hero-tour-frame"
            src="${html(embed)}"
            title="${html(name)} 360 derece sanal tur"
            loading="eager"
            allow="fullscreen; autoplay; gyroscope; accelerometer; xr-spatial-tracking"
            allowfullscreen
          ></iframe>
        `,
        interactive:true,
        external:safe
      };
    }

    const direct = directVideo(safe);
    if (direct) {
      return {
        markup:`
          <video class="kp-hero-video kp-hero-360-video" autoplay muted loop playsinline controls preload="metadata"
            ${cover ? 'poster="' + html(cover) + '"' : ''}>
            <source src="${html(direct)}">
          </video>
        `,
        interactive:false,
        external:safe
      };
    }

    return {
      markup:fallbackVisual({ ...institution, coverUrl:cover }),
      interactive:false,
      external:safe
    };
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
    const cover = safePublicUrl(data.coverUrl);
    const signature = [
      data.id || "",
      locationVideo,
      virtualTour,
      cover
    ].join("|");

    if (enhanced && signature === lastSignature) return;
    lastSignature = signature;

    document.querySelectorAll(".kp-premium-added").forEach(node => node.remove());
    document.getElementById("kpPremiumExperience")?.remove();
    document.querySelector(".kp-special")?.remove();

    const hero = document.querySelector(".kp-hero");
    const coverRoot = document.querySelector(".kp-cover");
    if (!hero || !coverRoot) {
      enhanced = true;
      return;
    }

    hero.classList.add("kp-clean-hero");
    coverRoot.classList.add("kp-cover-experience");

    const hasTour = Boolean(virtualTour);
    const hasVideo = Boolean(locationVideo);
    let currentMode = hasTour ? "tour" : (hasVideo ? "video" : "cover");

    const renderHero = mode => {
      currentMode = mode;

      let mediaMarkup = "";
      let guideMarkup = "";
      let externalLink = "";

      if (mode === "tour" && hasTour) {
        const tour = tourMarkup(virtualTour, cover, data.name || "Kurum");
        mediaMarkup = tour.markup || fallbackVisual(data);
        externalLink = tour.external;

        guideMarkup = tour.interactive
          ? '<div class="kp-hero-guide"><span>↔</span><div><strong>360° Mekanı Gezin</strong><small>Görüntüyü parmağınızla veya fareyle sürükleyin</small></div></div>'
          : directVideo(virtualTour)
            ? '<div class="kp-hero-guide"><span>360°</span><div><strong>Mekan Videosu</strong><small>Video otomatik oynatılıyor</small></div></div>'
            : '<div class="kp-hero-guide"><span>360°</span><div><strong>360° Sanal Tur</strong><small>Turu tam ekran açarak mekanı gezin</small></div></div>';
      } else if (mode === "video" && hasVideo) {
        mediaMarkup = locationVideoMarkup(locationVideo, cover, data.name || "Kurum") || fallbackVisual(data);
        externalLink = locationVideo;
        guideMarkup = '<div class="kp-hero-guide"><span>▶</span><div><strong>Konum / Tanıtım Videosu</strong><small>Video sessiz başlar, isterseniz sesi açabilirsiniz</small></div></div>';
      } else {
        mediaMarkup = fallbackVisual(data);
      }

      const tabs = hasTour && hasVideo
        ? `
          <div class="kp-hero-media-tabs">
            <button type="button" data-kp-media="tour" class="${currentMode === "tour" ? "active" : ""}">360° Mekan</button>
            <button type="button" data-kp-media="video" class="${currentMode === "video" ? "active" : ""}">▶ Video</button>
          </div>
        `
        : "";

      const fullscreen = externalLink
        ? '<a class="kp-hero-fullscreen" href="' + html(externalLink) + '" target="_blank" rel="noopener">⛶ Tam ekran</a>'
        : "";

      coverRoot.innerHTML = `
        <div class="kp-hero-media-stage">
          ${mediaMarkup}
        </div>
        ${badgeMarkup(data, hasTour, hasVideo)}
        ${tabs}
        ${guideMarkup}
        ${fullscreen}
      `;

      coverRoot.querySelectorAll("[data-kp-media]").forEach(button => {
        button.addEventListener("click", () => {
          const next = button.dataset.kpMedia;
          if (next && next !== currentMode) renderHero(next);
        });
      });
    };

    renderHero(currentMode);

    const actions = document.querySelector(".kp-actions");
    if (actions && hasTour) {
      const tourButton = document.createElement("a");
      tourButton.className = "kp-btn kp-premium-discover kp-premium-added";
      tourButton.href = virtualTour;
      tourButton.target = "_blank";
      tourButton.rel = "noopener";
      tourButton.textContent = "360° Turu Aç";
      actions.prepend(tourButton);
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
    if (enhanced || attempts >= 30) clearInterval(timer);
  }, 250);

  window.addEventListener("load", () => setTimeout(enhance, 80));
})();