(function(){
  "use strict";

  window.DIJIYER_UNIFIED_PAGE_BANNER=true;

  const FIREBASE_CONFIG={
    apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
    authDomain:"dijiyer.firebaseapp.com",
    projectId:"dijiyer",
    storageBucket:"dijiyer.firebasestorage.app",
    messagingSenderId:"847787778815",
    appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"
  };

  const PAGE_KEYS={
    "index.html":"home",
    "":"home",
    "teklif-al.html":"quote",
    "teklif.html":"quote_tracking",
    "is-firsatlari.html":"jobs",
    "bayi-servis.html":"brands",
    "firsatlar.html":"opportunities",
    "randevu.html":"appointments",
    "ticaret-firsatlari.html":"trade",
    "kurum.html":"institution"
  };

  let bannerRows=[];
  let bannerIndex=0;
  let bannerTimer=null;
  let unsubscribe=null;

  function currentFile(){
    return String(location.pathname||"").split("/").pop()||"";
  }

  function currentPageKey(){
    return PAGE_KEYS[currentFile()]||currentFile().replace(/\.html$/,"")||"home";
  }

  function esc(value){
    return String(value??"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function safeUrl(value){
    const raw=String(value||"").trim();
    if(!raw)return "";
    try{
      const url=new URL(raw,location.href);
      if(["http:","https:"].includes(url.protocol))return url.href;
    }catch(_){}
    return "";
  }

  function localDateKey(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,"0");
    const day=String(d.getDate()).padStart(2,"0");
    return y+"-"+m+"-"+day;
  }

  function placeShell(shell){
    if(!shell)return false;

    const nav=document.querySelector(".dijiyer-global-market-nav");
    if(nav?.parentNode){
      if(nav.nextElementSibling!==shell)nav.insertAdjacentElement("afterend",shell);
      return true;
    }

    const topbar=document.querySelector(".dijiyer-global-topbar");
    if(topbar?.parentNode){
      if(topbar.nextElementSibling!==shell)topbar.insertAdjacentElement("afterend",shell);
      return true;
    }

    return false;
  }

  function ensureShell(){
    let root=document.getElementById("pageTopMiniBanner");
    if(root){
      const shell=root.closest(".standalone-page-back,.unified-page-banner-shell");
      shell?.classList.add("unified-page-banner-shell");
      placeShell(shell);
      return root;
    }

    const page=currentPageKey();
    const shell=document.createElement("div");
    shell.className="unified-page-banner-shell"+(page==="home"?" home":"");

    if(page!=="home" && page!=="institution"){
      const back=document.createElement("a");
      back.className="unified-page-banner-back";
      back.href="index.html";
      back.textContent="← Ana Sayfa";
      shell.appendChild(back);
    }

    root=document.createElement("div");
    root.id="pageTopMiniBanner";
    root.className="page-top-mini-banner hidden";
    root.setAttribute("aria-label","Sponsorlu reklam");
    shell.appendChild(root);

    if(!placeShell(shell)){
      const header=document.querySelector("body > header, .topbar, .kp-topbar");
      if(header?.parentNode){
        header.insertAdjacentElement("afterend",shell);
      }else{
        document.body.insertBefore(shell,document.body.firstChild);
      }
    }

    return root;
  }

  function pageTargets(ad){
    const raw=
      (Array.isArray(ad?.pageTargets)&&ad.pageTargets) ||
      (Array.isArray(ad?.targetPages)&&ad.targetPages) ||
      [];
    return [...new Set(raw.map(x=>String(x||"").trim()).filter(Boolean))];
  }

  function currentSectorContext(){
    const params=new URLSearchParams(location.search);
    return String(
      params.get("subCategory") ||
      params.get("category") ||
      params.get("sector") ||
      document.body?.dataset?.bannerSector ||
      ""
    ).trim();
  }

  function currentCityContext(){
    const params=new URLSearchParams(location.search);
    return String(params.get("city")||document.body?.dataset?.bannerCity||"").trim();
  }

  function currentDistrictContext(){
    const params=new URLSearchParams(location.search);
    return String(params.get("district")||document.body?.dataset?.bannerDistrict||"").trim();
  }

  function live(ad){
    if(!ad || ad.active===false)return false;
    const today=localDateKey();
    if(ad.startAt && String(ad.startAt).slice(0,10)>today)return false;
    if(ad.endAt && String(ad.endAt).slice(0,10)<today)return false;

    const placement=String(ad.placement||"");
    if(placement!=="page_top_mini")return false;

    const targets=pageTargets(ad);
    const page=currentPageKey();
    if(targets.length && !targets.includes("all") && !targets.includes(page))return false;

    const sector=currentSectorContext();
    const city=currentCityContext();
    const district=currentDistrictContext();

    const categories=Array.isArray(ad.categories)
      ? ad.categories.map(String)
      : (ad.category ? [String(ad.category)] : []);

    if(sector && categories.length && !categories.includes(sector))return false;
    if(city && ad.city && String(ad.city)!==city)return false;
    if(district && ad.district && String(ad.district)!==district)return false;

    return true;
  }

  function hrefFor(ad){
    const direct=safeUrl(ad?.targetUrl);
    if(direct)return direct;
    if(ad?.institutionId)return "kurum.html?id="+encodeURIComponent(ad.institutionId);
    return "#";
  }

  function mediaUrl(value){
    return safeUrl(value);
  }

  function render(reset){
    const root=ensureShell();
    if(!root)return;

    if(bannerTimer){
      clearTimeout(bannerTimer);
      bannerTimer=null;
    }

    const ads=bannerRows.filter(live);
    if(!ads.length){
      root.innerHTML="";
      root.classList.add("hidden");
      return;
    }

    if(reset || bannerIndex>=ads.length)bannerIndex=0;
    const ad=ads[bannerIndex]||ads[0];
    const duration=[3,5,7].includes(Number(ad.durationSeconds))
      ? Number(ad.durationSeconds)
      : 7;

    const logo=mediaUrl(ad.logoUrl||"");
    const image=mediaUrl(ad.imageUrl||"");
    const video=mediaUrl(ad.videoUrl||"");
    const isVideo=String(ad.mediaType||"")==="video" && Boolean(video);

    root.innerHTML=
      '<a class="page-top-mini-banner-card" data-unified-banner-id="'+esc(ad.id||"")+'" href="'+esc(hrefFor(ad))+'">'+
        '<div class="page-top-mini-logo">'+
          (logo?'<img src="'+esc(logo)+'" alt="'+esc(ad.institutionName||"Kurum")+' logosu">':'<span>🏢</span>')+
        '</div>'+
        '<div class="page-top-mini-campaign">'+
          (isVideo
            ? '<video src="'+esc(video)+'" autoplay muted loop playsinline poster="'+esc(image)+'"></video>'
            : (image
              ? '<img src="'+esc(image)+'" alt="'+esc(ad.headline||ad.institutionName||"Sponsorlu kampanya")+'">'
              : '<div class="page-top-mini-campaign-fallback"><strong>'+esc(ad.headline||ad.institutionName||"Sponsorlu Kurum")+'</strong><span>'+esc(ad.text||"")+'</span></div>'))+
        '</div>'+
        '<div class="page-top-mini-actions">'+
          '<span class="page-top-mini-sponsored">SPONSORLU</span>'+
          '<b class="page-top-mini-cta">İncele →</b>'+
        '</div>'+
        (ads.length>1
          ? '<div class="page-top-mini-dots">'+ads.map((_,i)=>'<i class="'+(i===bannerIndex?"active":"")+'"></i>').join("")+'</div>'
          : '')+
        '<em class="page-top-mini-progress" style="--page-mini-duration:'+duration+'s"></em>'+
      '</a>';

    root.classList.remove("hidden");

    if(ads.length>1){
      bannerTimer=setTimeout(function(){
        bannerIndex=(bannerIndex+1)%ads.length;
        render(false);
      },duration*1000);
    }
  }

  function start(){
    ensureShell();

    if(!window.firebase || !firebase.initializeApp){
      setTimeout(start,120);
      return;
    }

    try{
      const app=firebase.apps.find(a=>a.name==="pageBannerPublic") ||
        firebase.initializeApp(FIREBASE_CONFIG,"pageBannerPublic");
      const db=app.firestore();

      if(unsubscribe)unsubscribe();
      unsubscribe=db.collection("bannerAds").where("active","==",true).onSnapshot(function(snapshot){
        bannerRows=snapshot.docs.map(function(doc){return {id:doc.id,...doc.data()};});
        bannerIndex=0;
        render(true);
      },function(error){
        console.warn("Sayfa üstü banner yüklenemedi:",error);
        bannerRows=[];
        render(true);
      });
    }catch(error){
      console.warn("Sayfa üstü banner başlatılamadı:",error);
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }

  window.DijiyerPageBanner={
    refresh:function(){render(true);},
    pageKey:currentPageKey
  };
})();