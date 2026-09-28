(function(){
  const STORAGE_KEY = "dijiyerCustomerQuoteIds";\n  const DATA_KEY = "dijiyerCustomerQuoteData";
  const myOffersBtn = document.getElementById("myOffersBtn");
  const myOffersCount = document.getElementById("myOffersCount");
  const myOffersList = document.getElementById("myOffersList");

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
  };
  window.refreshMyOffersBadge = function(){
    if(myOffersCount) myOffersCount.textContent = getQuoteIds().length || "";
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
    return {offered:"Fiyat Garantili",locked:"Fiyat Kilitli",used:"Kullanıldı",expired:"Süresi Doldu",closed:"Başka teklif seçildi"}[state] || state;
  }

  async function getRequestBundle(quoteId){
    const quoteRef = db.collection("quoteRequests").doc(quoteId);
    const [offersSnap, lockSnap] = await Promise.all([
      quoteRef.collection("offers").get(),
      quoteRef.collection("locks").doc("main").get()
    ]);
    let localData={};
    try{localData=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");}catch(e){}
    return {
      id: quoteId,
      quote: localData[quoteId] || {service:"Teklif Talebi",date:""},
      offers: offersSnap.docs.map(d => ({id:d.id,...d.data()})),
      lock: lockSnap.exists ? lockSnap.data() : null
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
            <button class="offer-lock-btn" data-lock-offer data-quote-id="${safe(bundle.id)}" data-institution-id="${safe(offer.institutionId)}">🔒 Fiyatı Kilitle</button>
          </div>` : ""}
      </div>
    `;
  }

  function requestHtml(bundle){
    const q=bundle.quote;
    const offers=[...bundle.offers].sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    const body = bundle.lock
      ? lockedTicketHtml(bundle)
      : offers.length
        ? `<div class="customer-offers-grid">${offers.map(o=>offerHtml(bundle,o)).join("")}</div>`
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
        ${q.note ? `<div class="offer-scope"><b>Talebiniz:</b><br>${safe(q.note)}</div>` : ""}
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
      const bundles=(await Promise.all(ids.map(getRequestBundle))).filter(Boolean);
      myOffersList.innerHTML=bundles.length ? bundles.map(requestHtml).join("") : '<div class="offer-center-note">Teklif kaydı bulunamadı.</div>';
      bindMyOfferActions();
      drawQrCodes();
      updateCountdowns();
    }catch(error){
      console.error("Müşteri teklifleri yüklenemedi:",error);
      myOffersList.innerHTML='<div class="offer-center-note">Teklifler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</div>';
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
          lockedAt:new Date().toISOString(),\n          lockedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
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
    myOffersList.querySelectorAll("[data-lock-offer]").forEach(btn=>{
      btn.addEventListener("click",()=>lockOffer(btn.dataset.quoteId,btn.dataset.institutionId,btn));
    });
    myOffersList.querySelectorAll("[data-report-offer]").forEach(btn=>{
      btn.addEventListener("click",()=>reportIssue(btn.dataset.quoteId,btn.dataset.offerCode));
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

  if(myOffersBtn){
    myOffersBtn.addEventListener("click",async()=>{
      openModal("myOffersModal");
      await loadMyOffers();
    });
  }
  setInterval(updateCountdowns,60000);
  refreshMyOffersBadge();
})();