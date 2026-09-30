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

  function build(){
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

    const header=document.querySelector("body > header");
    const main=document.querySelector("body > main");

    if(header)header.insertAdjacentElement("afterend",nav);
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

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",build,{once:true});
  }else{
    build();
  }
})();
