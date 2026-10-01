(function(){
  const STORAGE_KEY = "dijiyerCustomerQuoteIds";
  const DATA_KEY = "dijiyerCustomerQuoteData";
  const LATEST_KEY = "dijiyerQuoteLatestSnapshots";
  const SEEN_KEY = "dijiyerQuoteSeenSnapshots";
  const UNREAD_KEY = "dijiyerQuoteUnreadMap";
  const NOTIFY_KEY = "dijiyerQuoteBrowserNotify";
  const myOffersBtn = document.getElementById("myOffersBtn");
  const myOffersCount = document.getElementById("myOffersCount");
  const myOffersList = document.getElementById("myOffersList");
  const liveOfferWatchers = new Map();

  function safe(v){
    return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }
  function money(v){ return new Intl.NumberFormat("tr-TR").format(Number(v || 0)) + " TL"; }
  function fmtDate(v){
    if(!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  }
  function getQuoteIds(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").filter(Boolean); }
    catch(e){ return []; }
  }

  function readLocalJson(key,fallback={}){
    try{
      const value=JSON.parse(localStorage.getItem(key)||"");
      return value && typeof value==="object" ? value : fallback;
    }catch(_){
      return fallback;
    }
  }

  function writeLocalJson(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}
  }

  function getUnreadMap(){
    return readLocalJson(UNREAD_KEY,{});
  }

  function getUnreadCount(){
    return Object.values(getUnreadMap()).filter(Boolean).length;
  }
  window.rememberCustomerQuote = function(id,data){
    if(!id) return;
    const ids = getQuoteIds();
    if(!ids.includes(id)) ids.unshift(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0,30)));
    if(data){
      let map={};
      try{map=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");}catch(e){}
      map[id]=data;
      localStorage.setItem(DATA_KEY,JSON.stringify(map));
    }
    refreshMyOffersBadge();
    syncLiveOfferWatchers();
  };
  window.refreshMyOffersBadge = function(){
    const total=getQuoteIds().length;
    const unread=getUnreadCount();

    if(myOffersCount){
      myOffersCount.textContent=unread ? String(unread) : (total ? String(total) : "");
      myOffersCount.classList.toggle("unread",unread>0);
      myOffersCount.title=unread
        ? unread+" yeni teklif hareketi"
        : total
          ? total+" kayıtlı talep"
          : "";
    }

    myOffersBtn?.classList.toggle("has-unread",unread>0);
  };

  function offerState(offer, lock){
    const expired = offer?.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now();
    if(lock){
      if(lock.institutionId === offer.institutionId){
        if(lock.status === "used") return "used";
        if(lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now()) return "expired";
        return "locked";
      }
      return "closed";
    }
    return expired ? "expired" : "offered";
  }
  function stateLabel(state){
    return {offered:"Teklif Aktif",locked:"Kabul Edildi",used:"Gerçek Kayıt Tamamlandı",expired:"Süresi Doldu",closed:"Başka teklif seçildi"}[state] || state;
  }

  async function getRequestBundle(quoteId){
    const quoteRef = db.collection("quoteRequests").doc(quoteId);

    let localData={};
    try{localData=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");}catch(e){}

    let offersList=[];
    let engagementList=[];
    let lockData=null;
    let loadError=null;

    try{
      const offersSnap=await quoteRef.collection("offers").get();
      offersList=offersSnap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(error){
      console.error("Kurum teklifleri okunamadı:",quoteId,error);
      loadError=error;
    }

    try{
      const lockSnap=await quoteRef.collection("locks").doc("main").get();
      lockData=lockSnap.exists ? lockSnap.data() : null;
    }catch(error){
      console.error("Fiyat kilidi okunamadı:",quoteId,error);
      loadError=loadError || error;
    }

    try{
      const engagementSnap=await quoteRef.collection("engagement").get();
      engagementList=engagementSnap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(error){
      console.warn("Kurum yanıt durumları okunamadı:",quoteId,error);
    }

    return {
      id: quoteId,
      quote: localData[quoteId] || {service:"Teklif Talebi",date:""},
      offers: offersList,
      engagement: engagementList,
      lock: lockData,
      loadError
    };
  }

  function lockedTicketHtml(bundle){
    const lock = bundle.lock;
    if(!lock) return "";
    const state = lock.status === "used" ? "used" :
      (lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now() ? "expired" : "locked");
    const verifyUrl = location.origin + location.pathname.replace(/[^/]*$/,"") + "institution.html?offer=" + encodeURIComponent(lock.offerCode || "");
    return `
      <div class="customer-offer-card locked">
        <div class="customer-offer-head">
          <div>
            <div class="customer-offer-name">${safe(lock.institutionName || "Kurum")}</div>
            <div class="offer-mini">Teklif No: <b>${safe(lock.offerCode || "-")}</b></div>
          </div>
          <span class="offer-status-pill ${state}">${stateLabel(state)}</span>
        </div>
        <div class="lock-ticket">
          <div class="ticket-code">GARANTİLİ TEKLİF · ${safe(lock.offerCode || "")}</div>
          <div class="ticket-price">${money(lock.price)}</div>
          <div class="offer-mini">${safe(lock.scope || "")}</div>
          <div class="offer-mini">Geçerlilik: <b>${fmtDate(lock.expiresAt)}</b></div>
          <canvas data-offer-qr data-qr-url="${safe(verifyUrl)}" width="180" height="180"></canvas>
          <div class="countdown-line" data-lock-countdown="${safe(lock.expiresAt || "")}"></div>
        </div>
        ${state === "locked" ? `
          <div class="customer-offer-actions">
            <button class="offer-report-btn" data-report-offer data-quote-id="${safe(bundle.id)}" data-offer-code="${safe(lock.offerCode || "")}">Sorun Bildir</button>
          </div>` : ""}
      </div>
    `;
  }

  function offerHtml(bundle, offer){
    const state = offerState(offer,bundle.lock);
    return `
      <div class="customer-offer-card ${state === "locked" ? "locked" : state === "closed" ? "closed" : ""}">
        <div class="customer-offer-head">
          <div>
            <div class="customer-offer-name">${safe(offer.institutionName || "Kurum")}</div>
            <div class="offer-mini">Teklif No: <b>${safe(offer.offerCode || "-")}</b></div>
          </div>
          <span class="offer-status-pill ${state}">${stateLabel(state)}</span>
        </div>
        <div class="customer-offer-price">${money(offer.price)}</div>
        <div class="offer-mini">KDV: ${safe(offer.vatStatus || "-")} · Geçerlilik: ${fmtDate(offer.expiresAt)}</div>
        <div class="offer-scope">
          <b>Teklif kapsamı</b><br>${safe(offer.scope || "")}
          ${offer.conditions ? `<div class="offer-mini" style="margin-top:6px"><b>Özel şart:</b> ${safe(offer.conditions)}</div>` : ""}
        </div>
        ${state === "offered" ? `
          <div class="customer-offer-actions">
            ${bundle.quote?.trackingUrl
              ? `<button class="offer-lock-btn" data-accept-via-tracking="${safe(bundle.quote.trackingUrl)}">✓ Teklifi İncele ve Kabul Et</button>`
              : `<button class="offer-lock-btn" data-open-tracking-fallback>Takip Ekranından Kabul Et</button>`}
          </div>` : ""}
      </div>
    `;
  }

  function requestHtml(bundle){
    const q=bundle.quote;
    const offers=[...bundle.offers].sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    const engagement=Array.isArray(bundle.engagement)?bundle.engagement:[];
    const interestedCount=engagement.filter(row=>row.institutionResponse==="interested").length;
    const declinedCount=engagement.filter(row=>row.institutionResponse==="not_interested").length;
    const body = bundle.lock
      ? lockedTicketHtml(bundle)
      : offers.length
        ? `<div class="customer-offers-grid">${offers.map(o=>offerHtml(bundle,o)).join("")}</div>`
        : bundle.loadError
          ? '<div class="offer-center-note">Talebiniz kayıtlı. Kurum teklifleri şu anda okunamıyor. Firestore teklif izinlerini kontrol edin.</div>'
          : '<div class="offer-center-note">Henüz kurum teklifi gelmedi. Teklif geldiğinde burada görünecek.</div>';

    return `
      <article class="customer-request-card">
        <div class="customer-request-head">
          <div>
            <h3>${safe(q.service || "Teklif Talebi")}</h3>
            <small>📍 ${safe([q.city,q.district].filter(Boolean).join(" / "))} · ${fmtDate(q.date)}</small>
          </div>
          <span class="offer-status-pill ${bundle.lock ? "locked" : "offered"}">${bundle.lock ? "Fiyat seçildi" : offers.length + " teklif"}</span>
        </div>

        <div class="my-offer-activity-strip">
          ${interestedCount ? `<span class="positive">✓ ${interestedCount} kurum ilgileniyor</span>` : ""}
          ${offers.length ? `<span>🏷 ${offers.length} fiyat teklifi</span>` : '<span>⏳ Teklif bekleniyor</span>'}
          ${declinedCount ? `<span class="muted">✕ ${declinedCount} kurum ilgilenmiyor</span>` : ""}
        </div>

        ${q.note ? `<div class="offer-scope"><b>Talebiniz:</b><br>${safe(q.note)}</div>` : ""}

        ${q.trackingUrl ? `
          <div class="my-offer-tracking-actions">
            <button type="button" data-open-tracking="${safe(q.trackingUrl)}">🔍 Takip Ekranını Aç</button>
            <button type="button" data-copy-tracking="${safe(q.trackingUrl)}">🔗 Takip Linkini Kopyala</button>
          </div>
        ` : ""}

        ${body}
      </article>
    `;
  }

  async function loadMyOffers(){
    if(!myOffersList) return;
    const ids=getQuoteIds();
    if(!ids.length){
      myOffersList.innerHTML='<div class="offer-center-note">Bu cihazdan henüz toplu teklif talebi göndermediniz.</div>';
      return;
    }
    myOffersList.innerHTML='<div class="offer-center-note">Teklifleriniz yükleniyor...</div>';
    try{
      const results=await Promise.allSettled(ids.map(getRequestBundle));
      const bundles=results
        .filter(result=>result.status==="fulfilled" && result.value)
        .map(result=>result.value);

      myOffersList.innerHTML=bundles.length
        ? bundles.map(requestHtml).join("")
        : '<div class="offer-center-note">Teklif kaydı bulunamadı.</div>';

      bindMyOfferActions();
      drawQrCodes();
      updateCountdowns();
    }catch(error){
      console.error("Müşteri teklifleri yüklenemedi:",error);

      let localData={};
      try{localData=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");}catch(e){}

      const fallbackBundles=ids.map(id=>({
        id,
        quote:localData[id] || {service:"Teklif Talebi",date:""},
        offers:[],
        lock:null,
        loadError:error
      }));

      myOffersList.innerHTML=fallbackBundles.map(requestHtml).join("");
    }
  }

  async function lockOffer(quoteId,institutionId,button){
    button.disabled=true; button.textContent="Kilitleniyor...";
    try{
      const quoteRef=db.collection("quoteRequests").doc(quoteId);
      const offerRef=quoteRef.collection("offers").doc(institutionId);
      const lockRef=quoteRef.collection("locks").doc("main");

      await db.runTransaction(async tx=>{
        const [lockSnap,offerSnap]=await Promise.all([tx.get(lockRef),tx.get(offerRef)]);
        if(lockSnap.exists) throw new Error("Bu talep için zaten bir fiyat kilitlendi.");
        if(!offerSnap.exists) throw new Error("Teklif bulunamadı.");
        const offer=offerSnap.data();
        if(!offer.expiresAt || new Date(offer.expiresAt).getTime()<=Date.now()) throw new Error("Teklifin süresi dolmuş.");

        tx.set(lockRef,{
          quoteId,
          institutionId:offer.institutionId,
          institutionName:offer.institutionName || "Kurum",
          offerCode:offer.offerCode,
          price:Number(offer.price),
          vatStatus:offer.vatStatus || "",
          scope:offer.scope || "",
          conditions:offer.conditions || "",
          expiresAt:offer.expiresAt,
          expiresAtTs:offer.expiresAtTs || null,
          status:"locked",
          lockedAt:new Date().toISOString(),
          lockedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
          lockedPrice:Number(offer.price),
          lockedScope:offer.scope || ""
        });
      });

      showToast("Fiyat kilitlendi. Satıcı bu teklifi artık değiştiremez.");
      await loadMyOffers();
    }catch(error){
      console.error(error);
      showToast(error.message || "Teklif kilitlenemedi.");
    }finally{
      button.disabled=false; button.textContent="🔒 Fiyatı Kilitle";
    }
  }

  async function reportIssue(quoteId,offerCode){
    const reason=prompt("Sorunu kısaca yazın. Örn: İşletme geçerli teklifi kabul etmedi.");
    if(!reason || !reason.trim()) return;
    try{
      await db.collection("quoteRequests").doc(quoteId).collection("offerIssues").add({
        offerCode,
        reason:reason.trim().slice(0,500),
        status:"new",
        date:new Date().toISOString()
      });
      showToast("Bildiriminiz alındı.");
    }catch(error){
      console.error(error);
      showToast("Bildirim gönderilemedi.");
    }
  }

  function bindMyOfferActions(){
    myOffersList.querySelectorAll("[data-accept-via-tracking]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const url=String(btn.dataset.acceptViaTracking||"");
        if(url)window.location.href=url;
      });
    });
    myOffersList.querySelectorAll("[data-open-tracking-fallback]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        showToast("Teklifi güvenli şekilde kabul etmek için talebinizin takip ekranını açın.");
      });
    });
    myOffersList.querySelectorAll("[data-lock-offer]").forEach(btn=>{
      btn.addEventListener("click",()=>lockOffer(btn.dataset.quoteId,btn.dataset.institutionId,btn));
    });
    myOffersList.querySelectorAll("[data-report-offer]").forEach(btn=>{
      btn.addEventListener("click",()=>reportIssue(btn.dataset.quoteId,btn.dataset.offerCode));
    });
    myOffersList.querySelectorAll("[data-open-tracking]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const url=String(btn.dataset.openTracking||"");
        if(url)window.location.href=url;
      });
    });
    myOffersList.querySelectorAll("[data-copy-tracking]").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        const url=String(btn.dataset.copyTracking||"");
        if(!url)return;
        try{
          await navigator.clipboard.writeText(url);
          const old=btn.textContent;
          btn.textContent="✓ Kopyalandı";
          showToast("Takip linki kopyalandı.");
          setTimeout(()=>{btn.textContent=old;},1500);
        }catch(error){
          console.error(error);
          showToast("Takip linki kopyalanamadı.");
        }
      });
    });
  }

  function drawQrCodes(){
    if(typeof QRCode==="undefined") return;
    myOffersList.querySelectorAll("[data-offer-qr]").forEach(box=>{
      box.innerHTML="";
      new QRCode(box,{
        text:box.dataset.qrUrl,
        width:180,
        height:180,
        correctLevel:QRCode.CorrectLevel.M
      });
    });
  }

  function updateCountdowns(){
    myOffersList.querySelectorAll("[data-lock-countdown]").forEach(el=>{
      const target=new Date(el.dataset.lockCountdown).getTime();
      const diff=Math.max(0,target-Date.now());
      if(!diff){el.textContent="Teklifin süresi doldu.";return;}
      const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000), m=Math.floor(diff%3600000/60000);
      el.textContent=`Kalan süre: ${d} gün ${h} saat ${m} dakika`;
    });
  }


  function bundleSnapshot(bundle){
    const offers=(bundle.offers||[])
      .map(offer=>({
        id:String(offer.id||offer.institutionId||""),
        price:Number(offer.price||0),
        status:String(offer.status||""),
        updatedAt:String(offer.updatedAt||offer.createdAt||""),
        expiresAt:String(offer.expiresAt||"")
      }))
      .sort((a,b)=>a.id.localeCompare(b.id));

    const engagement=(bundle.engagement||[])
      .map(row=>({
        id:String(row.id||row.institutionId||""),
        response:String(row.institutionResponse||""),
        responseAt:String(row.institutionResponseAt||""),
        revisionAt:String(row.revisionRespondedAt||row.revisionRequestedAt||"")
      }))
      .sort((a,b)=>a.id.localeCompare(b.id));

    const interestedCount=engagement.filter(row=>row.response==="interested").length;
    const lockStatus=bundle.lock
      ? String(bundle.lock.status||"locked")+"|"+String(bundle.lock.institutionId||"")+"|"+String(bundle.lock.price||"")
      : "";

    const signature=JSON.stringify({offers,engagement,lockStatus});

    return {
      signature,
      offerCount:offers.length,
      interestedCount,
      lockStatus
    };
  }

  function notificationCopy(bundle,previous,current){
    const service=bundle.quote?.service||"Teklif Talebi";

    if(previous && current.offerCount>Number(previous.offerCount||0)){
      return {
        title:"Yeni teklif geldi",
        body:service+" için "+current.offerCount+" teklifiniz var."
      };
    }

    if(previous && current.interestedCount>Number(previous.interestedCount||0)){
      return {
        title:"Bir kurum talebinizle ilgileniyor",
        body:service+" talebinizde yeni kurum yanıtı var."
      };
    }

    if(previous && current.lockStatus!==String(previous.lockStatus||"") && current.lockStatus){
      return {
        title:"Teklif durumu güncellendi",
        body:service+" için fiyat kilidi durumu değişti."
      };
    }

    return {
      title:"Teklifiniz güncellendi",
      body:service+" talebinizde yeni bir hareket var."
    };
  }

  function showBrowserNotification(bundle,previous,current){
    if(localStorage.getItem(NOTIFY_KEY)!=="1")return;
    if(!("Notification" in window) || Notification.permission!=="granted")return;

    const copy=notificationCopy(bundle,previous,current);

    try{
      const notice=new Notification("Dijiyer • "+copy.title,{
        body:copy.body,
        tag:"dijiyer-quote-"+bundle.id
      });
      notice.onclick=()=>{
        window.focus();
        if(bundle.quote?.trackingUrl)window.location.href=bundle.quote.trackingUrl;
      };
    }catch(error){
      console.warn("Tarayıcı bildirimi gösterilemedi:",error);
    }
  }

  function markBundlesSeen(bundles){
    const latest=readLocalJson(LATEST_KEY,{});
    const seen=readLocalJson(SEEN_KEY,{});
    const unread=readLocalJson(UNREAD_KEY,{});

    bundles.forEach(bundle=>{
      const snap=bundleSnapshot(bundle);
      latest[bundle.id]=snap;
      seen[bundle.id]=snap;
      unread[bundle.id]=false;
    });

    writeLocalJson(LATEST_KEY,latest);
    writeLocalJson(SEEN_KEY,seen);
    writeLocalJson(UNREAD_KEY,unread);
    window.refreshMyOffersBadge();
  }

  async function checkQuoteUpdates({notify=true}={}){
    const ids=getQuoteIds().slice(0,10);
    if(!ids.length)return;

    const latest=readLocalJson(LATEST_KEY,{});
    const seen=readLocalJson(SEEN_KEY,{});
    const unread=readLocalJson(UNREAD_KEY,{});

    const results=await Promise.allSettled(ids.map(getRequestBundle));

    results.forEach(result=>{
      if(result.status!=="fulfilled" || !result.value)return;

      const bundle=result.value;
      const current=bundleSnapshot(bundle);
      const previousLatest=latest[bundle.id];
      const previousSeen=seen[bundle.id];

      if(!previousLatest){
        latest[bundle.id]=current;
        if(!previousSeen)seen[bundle.id]=current;
        unread[bundle.id]=false;
        return;
      }

      if(previousLatest.signature!==current.signature){
        latest[bundle.id]=current;

        if(!previousSeen || previousSeen.signature!==current.signature){
          unread[bundle.id]=true;
        }

        if(notify)showBrowserNotification(bundle,previousLatest,current);
      }
    });

    writeLocalJson(LATEST_KEY,latest);
    writeLocalJson(SEEN_KEY,seen);
    writeLocalJson(UNREAD_KEY,unread);
    window.refreshMyOffersBadge();
  }

  function stopLiveOfferWatchers(){
    liveOfferWatchers.forEach(stop=>{
      try{ stop(); }catch(_){}
    });
    liveOfferWatchers.clear();
  }

  function syncLiveOfferWatchers(){
    // Firestore maliyetini düşürmek için her kayıtlı talep başına ayrı
    // onSnapshot açmıyoruz. Teklif hareketleri mevcut 90 sn arka plan
    // kontrolü, sekmeye dönüş ve Tekliflerim açılışı sırasında yenilenir.
    stopLiveOfferWatchers();
  }

  function ensureNotificationControls(){
    if(!myOffersList || document.getElementById("myOffersNotifyBar"))return;

    const bar=document.createElement("div");
    bar.id="myOffersNotifyBar";
    bar.className="my-offers-notify-bar";

    const supported="Notification" in window;
    const enabled=supported && Notification.permission==="granted" && localStorage.getItem(NOTIFY_KEY)==="1";

    bar.innerHTML=`
      <div>
        <strong>Teklif bildirimleri</strong>
        <small>${supported
          ? (enabled
              ? "Yeni teklif ve kurum yanıtlarında tarayıcı bildirimi açık."
              : "Yeni teklif geldiğinde bu cihazda bildirim alın.")
          : "Bu tarayıcı bildirim özelliğini desteklemiyor."}</small>
      </div>
      <button type="button" id="myOffersNotifyBtn" ${supported?"":"disabled"}>
        ${enabled ? "✓ Bildirimler Açık" : "Bildirimleri Aç"}
      </button>
    `;

    myOffersList.parentNode?.insertBefore(bar,myOffersList);

    document.getElementById("myOffersNotifyBtn")?.addEventListener("click",async()=>{
      if(!("Notification" in window))return;

      try{
        const permission=await Notification.requestPermission();
        if(permission==="granted"){
          localStorage.setItem(NOTIFY_KEY,"1");
          bar.querySelector("small").textContent="Yeni teklif ve kurum yanıtlarında tarayıcı bildirimi açık.";
          const btn=document.getElementById("myOffersNotifyBtn");
          if(btn)btn.textContent="✓ Bildirimler Açık";
          showToast("Teklif bildirimleri açıldı.");
        }else{
          localStorage.removeItem(NOTIFY_KEY);
          showToast("Bildirim izni verilmedi.");
        }
      }catch(error){
        console.error(error);
        showToast("Bildirim izni açılamadı.");
      }
    });
  }

  ensureNotificationControls();

  if(myOffersBtn){
    myOffersBtn.addEventListener("click",async()=>{
      openModal("myOffersModal");
      await loadMyOffers();

      const ids=getQuoteIds();
      if(ids.length){
        const results=await Promise.allSettled(ids.slice(0,10).map(getRequestBundle));
        const bundles=results
          .filter(result=>result.status==="fulfilled" && result.value)
          .map(result=>result.value);
        markBundlesSeen(bundles);
      }
    });
  }

  async function runBackgroundQuoteCheck(){
    if(document.hidden)return;
    try{await checkQuoteUpdates({notify:true});}catch(error){
      console.warn("Teklif arka plan kontrolü yapılamadı:",error);
    }
  }

  setInterval(updateCountdowns,60000);
  setTimeout(runBackgroundQuoteCheck,5000);
  setInterval(runBackgroundQuoteCheck,90000);
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)runBackgroundQuoteCheck();
  });

  refreshMyOffersBadge();
  syncLiveOfferWatchers();
  window.addEventListener("beforeunload",stopLiveOfferWatchers);
})();