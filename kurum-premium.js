(() => {
  let enhanced = false;
  let lastSignature = "";
  let panoramaViewer = null;

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

  function fallbackVisual(data) {
    const cover = safePublicUrl(data.coverUrl);

    if (cover) {
      return '<img class="kp-hero-fallback-image" src="' + html(cover) + '" alt="' +
        html((data.name || "Kurum") + " kapak") + '">';
    }

    return '<div class="kp-cover-empty">' + html(data.emoji || "🏢") + '</div>';
  }

  function syncIdentityBadges(data, has360, hasVideo) {
    const root = document.querySelector(".kp-status-badges");
    if (!root) return;

    root.innerHTML = `
      <span class="kp-status-badge verified">✓ Onaylı Kurum</span>
      ${data.offer !== false ? '<span class="kp-status-badge offer">₺ Teklif Veriyor</span>' : ''}
      ${has360 ? '<span class="kp-status-badge tour">360° Mekan</span>' : ''}
      ${!has360 && hasVideo ? '<span class="kp-status-badge video">▶ Videolu Kurum</span>' : ''}
      ${data.vip ? '<span class="kp-status-badge vip">★ Öne Çıkan</span>' : ''}
    `;
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

  function destroyPanoramaViewer() {
    if (!panoramaViewer) return;
    try {
      panoramaViewer.destroy();
    } catch (_) {}
    panoramaViewer = null;
  }

  function initPanoramaViewer(panoramaUrl) {
    destroyPanoramaViewer();

    const root = document.getElementById("kpPanoramaViewer");
    if (!root || !panoramaUrl) return false;

    if (!window.pannellum?.viewer) {
      root.innerHTML =
        '<img src="' + html(panoramaUrl) + '" alt="360 derece mekan görüntüsü">';
      root.classList.add("fallback");
      return false;
    }

    try {
      panoramaViewer = window.pannellum.viewer(root, {
        type:"equirectangular",
        panorama:panoramaUrl,
        autoLoad:true,
        autoRotate:-2,
        autoRotateInactivityDelay:2500,
        showControls:true,
        showZoomCtrl:true,
        showFullscreenCtrl:true,
        compass:false,
        hfov:100,
        pitch:0,
        yaw:0
      });

      return true;
    } catch (error) {
      console.warn("360° görüntüleyici başlatılamadı:",error);
      root.innerHTML =
        '<img src="' + html(panoramaUrl) + '" alt="360 derece mekan görüntüsü">';
      root.classList.add("fallback");
      return false;
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

    const panorama360 = safePublicUrl(data.panorama360Url);

    const virtualTour = safePublicUrl(
      data.virtualTourUrl || data.tour360Url || data.tourUrl
    );

    const cover = safePublicUrl(data.coverUrl);
    const has360 = Boolean(panorama360 || virtualTour);
    const hasVideo = Boolean(locationVideo);
    const hasPhoto = Boolean(cover);

    const signature = [
      data.id || "",
      locationVideo,
      panorama360,
      virtualTour,
      cover
    ].join("|");

    if (enhanced && signature === lastSignature) return;
    lastSignature = signature;

    destroyPanoramaViewer();
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

    let currentMode = has360
      ? "tour"
      : hasVideo
        ? "video"
        : "photo";

    const renderHero = mode => {
      destroyPanoramaViewer();
      currentMode = mode;

      let mediaMarkup = "";
      let guideMarkup = "";
      let externalLink = "";
      let panoramaToInit = "";

      if (mode === "tour" && has360) {
        const embeddedTour = virtualTour ? tourEmbed(virtualTour) : "";

        if (embeddedTour) {
          mediaMarkup = `
            <iframe
              class="kp-hero-iframe kp-hero-tour-frame"
              src="${html(embeddedTour)}"
              title="${html(data.name || "Kurum")} 360 derece sanal tur"
              loading="eager"
              allow="fullscreen; autoplay; gyroscope; accelerometer; xr-spatial-tracking"
              allowfullscreen
            ></iframe>
          `;

          externalLink = virtualTour;

          guideMarkup =
            '<div class="kp-hero-guide"><span>↔</span><div><strong>360° Mekanı Gezin</strong><small>Görüntüyü parmağınızla veya fareyle sürükleyin</small></div></div>';
        } else if (panorama360) {
          mediaMarkup =
            '<div id="kpPanoramaViewer" class="kp-panorama-viewer"></div>';

          panoramaToInit = panorama360;

          guideMarkup =
            '<div class="kp-hero-guide"><span>↔</span><div><strong>360° Mekanı Gezin</strong><small>Parmağınızla sürükleyin · görüntü yavaşça kendi döner</small></div></div>';
        } else if (virtualTour) {
          mediaMarkup = fallbackVisual(data);
          externalLink = virtualTour;

          guideMarkup =
            '<div class="kp-hero-guide"><span>360°</span><div><strong>360° Sanal Tur</strong><small>Turu tam ekran açarak mekanı gezin</small></div></div>';
        }
      } else if (mode === "video" && hasVideo) {
        mediaMarkup =
          locationVideoMarkup(locationVideo, cover, data.name || "Kurum") ||
          fallbackVisual(data);

        externalLink = locationVideo;

        guideMarkup =
          '<div class="kp-hero-guide"><span>▶</span><div><strong>Tanıtım / Konum Videosu</strong><small>Video sessiz başlar · sesi kontrollerden açabilirsiniz</small></div></div>';
      } else {
        mediaMarkup = fallbackVisual(data);

        guideMarkup = hasPhoto
          ? '<div class="kp-hero-guide compact"><span>▣</span><div><strong>Kapak Görseli</strong><small>Kurumun genel görünümü</small></div></div>'
          : "";
      }

      const tabs = [
        has360 ? {key:"tour",label:"360° Mekan"} : null,
        hasVideo ? {key:"video",label:"▶ Video"} : null,
        hasPhoto ? {key:"photo",label:"▣ Fotoğraf"} : null
      ].filter(Boolean);

      const tabsMarkup = tabs.length > 1
        ? `
          <div class="kp-hero-media-tabs">
            ${tabs.map(tab => `
              <button
                type="button"
                data-kp-media="${tab.key}"
                class="${currentMode === tab.key ? "active" : ""}"
              >${tab.label}</button>
            `).join("")}
          </div>
        `
        : "";

      let fullscreenMarkup = "";

      if (panoramaToInit) {
        fullscreenMarkup =
          '<button type="button" class="kp-hero-fullscreen" id="kpPanoramaFullscreen">⛶ Tam ekran</button>';
      } else if (externalLink) {
        fullscreenMarkup =
          '<a class="kp-hero-fullscreen" href="' + html(externalLink) +
          '" target="_blank" rel="noopener">⛶ Tam ekran</a>';
      }

      coverRoot.innerHTML = `
        <div class="kp-hero-media-stage">
          ${mediaMarkup}
        </div>
        ${tabsMarkup}
        ${guideMarkup}
        ${fullscreenMarkup}
      `;

      if (panoramaToInit) {
        const viewerReady = initPanoramaViewer(panoramaToInit);

        document.getElementById("kpPanoramaFullscreen")
          ?.addEventListener("click", () => {
            if (viewerReady && panoramaViewer?.toggleFullscreen) {
              panoramaViewer.toggleFullscreen();
            } else {
              window.open(panoramaToInit,"_blank","noopener");
            }
          });
      }

      coverRoot.querySelectorAll("[data-kp-media]").forEach(button => {
        button.addEventListener("click", () => {
          const next = button.dataset.kpMedia;
          if (next && next !== currentMode) renderHero(next);
        });
      });
    };

    syncIdentityBadges(data, has360, hasVideo);
    renderHero(currentMode);

    const actions = document.querySelector(".kp-actions");

    if (actions && has360) {
      const tourButton = document.createElement("button");
      tourButton.type = "button";
      tourButton.className = "kp-btn kp-premium-discover kp-premium-added";
      tourButton.textContent = "360° Mekanı Gör";
      tourButton.addEventListener("click", () => {
        renderHero("tour");
        coverRoot.scrollIntoView({behavior:"smooth",block:"center"});
      });
      actions.prepend(tourButton);
    }

    enhanced = true;
  }

  const originalRender =
    typeof renderProfile === "function" ? renderProfile : null;

  if (originalRender) {
    renderProfile = function(...args) {
      const result = originalRender.apply(this,args);
      enhanced = false;
      setTimeout(enhance,0);
      return result;
    };
  }

  let attempts = 0;

  const timer = setInterval(() => {
    attempts += 1;
    enhance();
    if (enhanced || attempts >= 30) clearInterval(timer);
  },250);

  window.addEventListener("load",() => setTimeout(enhance,80));
})();