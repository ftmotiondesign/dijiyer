(()=>{
  const links=[
    ["index.html#resultsSection","Kurumlar","institutions"],
    ["teklif-al.html","Teklif Al","quotes"],
    ["randevu.html","Randevu Al","appointments"],
    ["is-firsatlari.html","İş Fırsatları","jobs"],
    ["ticaret-firsatlari.html","İş & Ticaret","trade"],
    ["bayi-servis.html","Bayi & Servis","brands"],
    ["firsatlar.html","Keşfet / Fırsat","discover"]
  ];

  const LOCATION_CITY_KEY="dijiyerGlobalCity";
  const LOCATION_DISTRICT_KEY="dijiyerGlobalDistrict";
  let globalDistrictCache=new Map();

  function activeKey(){
    const path=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    if(path==="teklif-al.html"||path==="teklif.html")return "quotes";
    if(path==="randevu.html")return "appointments";
    if(path==="is-firsatlari.html")return "jobs";
    if(path==="ticaret-firsatlari.html")return "trade";
    if(path==="bayi-servis.html")return "brands";
    if(path==="firsatlar.html")return "discover";
    return "institutions";
  }

  function markActive(nav){
    const key=activeKey();
    nav.querySelectorAll("a[data-market-key]").forEach(a=>{
      a.classList.toggle("active",a.dataset.marketKey===key);
      if(a.dataset.marketKey===key)a.setAttribute("aria-current","page");
      else a.removeAttribute("aria-current");
    });
  }

  function safeLocalGet(key,fallback=""){
    try{return localStorage.getItem(key)||fallback}catch(_){return fallback}
  }

  function safeLocalSet(key,value){
    try{localStorage.setItem(key,String(value||""))}catch(_){}
  }

  function globalLocation(){
    const params=new URLSearchParams(location.search);
    const city=String(params.get("city")||safeLocalGet(LOCATION_CITY_KEY,"Çanakkale")).trim();
    const district=String(params.get("district")||safeLocalGet(LOCATION_DISTRICT_KEY,"Merkez")).trim();
    return {city,district};
  }

  function locationLabel(){
    const {city,district}=globalLocation();
    return [city,district].filter(Boolean).join(", ")||"Tüm Türkiye";
  }

  function localOfferCount(){
    try{
      const ids=JSON.parse(localStorage.getItem("dijiyerCustomerQuoteIds")||"[]");
      if(Array.isArray(ids))return ids.length;
      const map=JSON.parse(localStorage.getItem("dijiyerCustomerQuoteData")||"{}");
      return map&&typeof map==="object"?Object.keys(map).length:0;
    }catch(_){
      return 0;
    }
  }

  function topbarHtml(){
    const count=localOfferCount();
    return `
      <div class="dijiyer-global-topbar-inner">
        <a class="dijiyer-global-brand" href="index.html" aria-label="Dijiyer ana sayfası" title="Ana sayfaya dön">
          <span class="dijiyer-global-brand-mark">D</span>
          <span class="dijiyer-global-brand-copy">
            <strong>Dijiyer</strong>
            <small>Bul. Karşılaştır. Teklif Al.</small>
          </span>
        </a>

        <div class="dijiyer-global-search" role="search" aria-label="Dijiyer kurum ve hizmet arama">
          <span class="dijiyer-global-search-icon">⌕</span>
          <input id="globalMarketSearchInput" type="search" autocomplete="off" placeholder="Kurum, hizmet veya sektör ara...">
          <button type="button" class="dijiyer-global-location" id="globalMarketLocationBtn" aria-expanded="false">
            <span>📍</span>
            <strong id="globalMarketLocationText">${locationLabel()}</strong>
          </button>
          <button type="button" class="dijiyer-global-search-submit" id="globalMarketSearchBtn">Ara</button>
        </div>

        <a href="teklif.html" class="dijiyer-global-offers" id="globalMarketOffersBtn">
          <span>🔒</span>
          <strong>Tekliflerim</strong>
          <b id="globalMarketOffersCount" class="${count?"":"hidden"}">${count}</b>
        </a>

        <div class="dijiyer-global-institution">
          <button type="button" class="dijiyer-global-institution-btn" id="globalMarketInstitutionBtn" aria-expanded="false">
            <span>🏢</span>
            <strong>Kurum İşlemleri</strong>
            <i>⌄</i>
          </button>
          <div class="dijiyer-global-institution-menu hidden" id="globalMarketInstitutionMenu">
            <a href="index.html?kurum=ekle" id="globalMarketInstitutionAdd">
              <span>＋</span>
              <div><strong>Kurum Ekle</strong><small>Dijiyer'e yeni işletme ekle</small></div>
            </a>
            <a href="institution.html?session=institution">
              <span>🏢</span>
              <div><strong>Kurum Paneli</strong><small>Teklifleri ve kurum bilgilerini yönet</small></div>
            </a>
          </div>
        </div>

        <div class="dijiyer-global-location-popover hidden" id="globalMarketLocationPopover">
          <div class="dijiyer-global-location-head">
            <div><strong>Konum Seç</strong><small>Arama sonuçlarını bölgeye göre daralt</small></div>
            <button type="button" id="globalMarketLocationClose">×</button>
          </div>
          <label>İl
            <select id="globalMarketCity"><option value="">Tüm İller</option></select>
          </label>
          <label>İlçe
            <select id="globalMarketDistrict"><option value="">Tüm İlçeler</option></select>
          </label>
          <div class="dijiyer-global-location-actions">
            <button type="button" id="globalMarketLocationClear">Tüm Türkiye</button>
            <button type="button" class="primary" id="globalMarketLocationApply">Uygula</button>
          </div>
        </div>
      </div>
    `;
  }

  function buildGlobalTopbar(){
    if(document.querySelector(".dijiyer-global-topbar"))return;

    const header=document.createElement("header");
    header.className="dijiyer-global-topbar";
    header.innerHTML=topbarHtml();

    const first=document.body.firstElementChild;
    if(first)document.body.insertBefore(header,first);
    else document.body.appendChild(header);

    bindGlobalTopbar(header);
    applyIncomingSearch();
    openIncomingInstitutionAction();
  }

  function performGlobalSearch(){
    const input=document.getElementById("globalMarketSearchInput");
    const q=String(input?.value||"").trim();
    const {city,district}=globalLocation();
    const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();

    if(file==="index.html" || file===""){
      const legacy=document.getElementById("searchInput");
      if(legacy){
        legacy.value=q;
        legacy.dispatchEvent(new Event("input",{bubbles:true}));
      }
      const submit=document.getElementById("desktopSearchSubmitBtn");
      if(submit){
        submit.click();
        return;
      }
      document.getElementById("resultsSection")?.scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }

    const params=new URLSearchParams();
    if(q)params.set("q",q);
    if(city)params.set("city",city);
    if(district)params.set("district",district);
    location.href="index.html"+(params.toString()?"?"+params.toString():"")+"#resultsSection";
  }

  function applyIncomingSearch(){
    const params=new URLSearchParams(location.search);
    const q=String(params.get("q")||"").trim();
    const input=document.getElementById("globalMarketSearchInput");
    if(input && q)input.value=q;

    const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    if((file==="index.html"||file==="") && q){
      setTimeout(()=>{
        const legacy=document.getElementById("searchInput");
        if(!legacy)return;
        legacy.value=q;
        legacy.dispatchEvent(new Event("input",{bubbles:true}));
      },120);
    }
  }

  function openIncomingInstitutionAction(){
    const params=new URLSearchParams(location.search);
    if(params.get("kurum")!=="ekle")return;
    setTimeout(()=>{
      const legacy=document.getElementById("institutionAddBtn");
      if(legacy){
        legacy.click();
        return;
      }
    },350);
  }

  async function fetchProvinces(){
    const select=document.getElementById("globalMarketCity");
    if(!select)return;
    select.innerHTML='<option value="">İller yükleniyor...</option>';
    try{
      const response=await fetch("https://api.turkiyeapi.dev/v2/provinces?fields=id,name&limit=81");
      if(!response.ok)throw new Error("İl verisi alınamadı");
      const data=await response.json();
      select.innerHTML='<option value="">Tüm İller</option>'+
        (data.data||[]).map(city=>'<option value="'+String(city.name).replace(/"/g,"&quot;")+'" data-id="'+city.id+'">'+city.name+'</option>').join("");

      const current=globalLocation().city;
      const option=[...select.options].find(o=>o.value===current);
      if(option){
        select.value=current;
        await fetchDistricts(option.dataset.id,globalLocation().district);
      }
    }catch(error){
      console.warn("Üst menü şehirleri yüklenemedi:",error);
      select.innerHTML='<option value="">Tüm İller</option>';
    }
  }

  async function fetchDistricts(provinceId,selected=""){
    const select=document.getElementById("globalMarketDistrict");
    if(!select)return;
    if(!provinceId){
      select.innerHTML='<option value="">Tüm İlçeler</option>';
      select.disabled=true;
      return;
    }

    select.disabled=false;
    select.innerHTML='<option value="">İlçeler yükleniyor...</option>';

    try{
      let rows=globalDistrictCache.get(String(provinceId));
      if(!rows){
        const response=await fetch("https://api.turkiyeapi.dev/v2/provinces/"+encodeURIComponent(provinceId)+"?fields=districts");
        if(!response.ok)throw new Error("İlçe verisi alınamadı");
        const data=await response.json();
        const province=data.data||{};
        rows=(province.districts||[]).map(item=>item.name).filter(Boolean);
        globalDistrictCache.set(String(provinceId),rows);
      }

      select.innerHTML='<option value="">Tüm İlçeler</option>'+
        rows.map(name=>'<option value="'+String(name).replace(/"/g,"&quot;")+'">'+name+'</option>').join("");
      if(selected && rows.includes(selected))select.value=selected;
    }catch(error){
      console.warn("Üst menü ilçeleri yüklenemedi:",error);
      select.innerHTML='<option value="">Tüm İlçeler</option>';
    }
  }

  function setLocationPopover(open){
    const pop=document.getElementById("globalMarketLocationPopover");
    const btn=document.getElementById("globalMarketLocationBtn");
    if(!pop||!btn)return;
    pop.classList.toggle("hidden",!open);
    btn.setAttribute("aria-expanded",String(open));
    if(open)fetchProvinces();
  }

  function bindGlobalTopbar(header){
    const search=document.getElementById("globalMarketSearchInput");
    document.getElementById("globalMarketSearchBtn")?.addEventListener("click",performGlobalSearch);
    search?.addEventListener("keydown",event=>{
      if(event.key!=="Enter")return;
      event.preventDefault();
      performGlobalSearch();
    });

    document.getElementById("globalMarketLocationBtn")?.addEventListener("click",event=>{
      event.stopPropagation();
      const pop=document.getElementById("globalMarketLocationPopover");
      setLocationPopover(pop?.classList.contains("hidden"));
    });
    document.getElementById("globalMarketLocationClose")?.addEventListener("click",()=>setLocationPopover(false));

    document.getElementById("globalMarketCity")?.addEventListener("change",async function(){
      const option=this.options[this.selectedIndex];
      await fetchDistricts(option?.dataset?.id||"","");
    });

    document.getElementById("globalMarketLocationApply")?.addEventListener("click",()=>{
      const city=String(document.getElementById("globalMarketCity")?.value||"");
      const district=city?String(document.getElementById("globalMarketDistrict")?.value||""):"";
      safeLocalSet(LOCATION_CITY_KEY,city);
      safeLocalSet(LOCATION_DISTRICT_KEY,district);
      const text=document.getElementById("globalMarketLocationText");
      if(text)text.textContent=[city,district].filter(Boolean).join(", ")||"Tüm Türkiye";
      setLocationPopover(false);

      const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
      if(file==="index.html"||file===""){
        const params=new URLSearchParams(location.search);
        if(city)params.set("city",city); else params.delete("city");
        if(district)params.set("district",district); else params.delete("district");
        history.replaceState(null,"",location.pathname+(params.toString()?"?"+params.toString():"")+location.hash);
        location.reload();
      }
    });

    document.getElementById("globalMarketLocationClear")?.addEventListener("click",()=>{
      safeLocalSet(LOCATION_CITY_KEY,"");
      safeLocalSet(LOCATION_DISTRICT_KEY,"");
      const text=document.getElementById("globalMarketLocationText");
      if(text)text.textContent="Tüm Türkiye";
      setLocationPopover(false);
      const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
      if(file==="index.html"||file==="")location.href="index.html#resultsSection";
    });

    const institutionBtn=document.getElementById("globalMarketInstitutionBtn");
    const institutionMenu=document.getElementById("globalMarketInstitutionMenu");
    institutionBtn?.addEventListener("click",event=>{
      event.stopPropagation();
      const open=institutionMenu?.classList.contains("hidden");
      institutionMenu?.classList.toggle("hidden",!open);
      institutionBtn.setAttribute("aria-expanded",String(open));
    });

    document.addEventListener("click",event=>{
      if(!header.contains(event.target)){
        institutionMenu?.classList.add("hidden");
        institutionBtn?.setAttribute("aria-expanded","false");
        setLocationPopover(false);
      }
    });

    window.addEventListener("storage",()=>{
      const count=localOfferCount();
      const badge=document.getElementById("globalMarketOffersCount");
      if(badge){
        badge.textContent=String(count);
        badge.classList.toggle("hidden",!count);
      }
    });
  }

  function buildNav(){
    let nav=document.querySelector(".desktop-market-nav");

    if(nav){
      nav.classList.add("dijiyer-global-market-nav");
      const anchors=[...nav.querySelectorAll("a")];
      anchors.forEach(a=>{
        const text=(a.textContent||"").trim();
        const found=links.find(([,label])=>label===text);
        if(found)a.dataset.marketKey=found[2];
      });
      markActive(nav);
      watchMenuVisibility(nav);
      return;
    }

    nav=document.createElement("nav");
    nav.className="desktop-market-nav dijiyer-global-market-nav";
    nav.setAttribute("aria-label","Dijiyer ana menü");
    nav.innerHTML='<div class="desktop-market-nav-inner">'+
      links.map(([href,label,key])=>
        '<a href="'+href+'" data-market-key="'+key+'">'+label+'</a>'
      ).join("")+
      '</div>';

    const globalHeader=document.querySelector(".dijiyer-global-topbar");
    const main=document.querySelector("body > main");

    if(globalHeader)globalHeader.insertAdjacentElement("afterend",nav);
    else if(main)main.insertAdjacentElement("beforebegin",nav);
    else document.body.prepend(nav);

    markActive(nav);
    watchMenuVisibility(nav);
  }

  const menuDefaults={
    institutions:true,
    quotes:true,
    appointments:true,
    jobs:true,
    trade:true,
    brands:true,
    discover:true
  };

  function applyMenuVisibility(nav,data={}){
    const saved=data?.topMenuVisibility && typeof data.topMenuVisibility==="object"
      ? data.topMenuVisibility
      : {};
    const visibility={...menuDefaults,...saved};

    nav.querySelectorAll("[data-market-key]").forEach(item=>{
      const key=String(item.dataset.marketKey||"");
      const visible=visibility[key]!==false;
      item.hidden=!visible;
      if(visible)item.style.removeProperty("display");
      else item.style.setProperty("display","none","important");
    });

    const visibleItems=[...nav.querySelectorAll("[data-market-key]")]
      .filter(item=>!item.hidden && item.style.display!=="none");
    nav.hidden=visibleItems.length===0;
  }

  function watchMenuVisibility(nav){
    let tries=0;

    const connect=()=>{
      tries++;
      try{
        if(window.firebase && firebase.apps && firebase.apps.length){
          const db=firebase.firestore();
          db.collection("siteSettings").doc("home").onSnapshot(snap=>{
            applyMenuVisibility(nav,snap.exists ? (snap.data()||{}) : {});
          },error=>{
            console.warn("Üst menü görünürlük ayarı okunamadı:",error);
            applyMenuVisibility(nav,{});
          });
          return;
        }
      }catch(error){
        console.warn("Üst menü görünürlük bağlantısı başlatılamadı:",error);
      }

      if(tries<20)setTimeout(connect,250);
      else applyMenuVisibility(nav,{});
    };

    connect();
  }

  function build(){
    buildGlobalTopbar();
    buildNav();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",build,{once:true});
  }else{
    build();
  }
})();