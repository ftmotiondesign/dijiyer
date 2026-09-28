const firebaseConfig={
  apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain:"dijiyer.firebaseapp.com",
  projectId:"dijiyer",
  storageBucket:"dijiyer.firebasestorage.app",
  messagingSenderId:"847787778815",
  appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

const form=document.getElementById("trackingForm");
const codeInput=document.getElementById("trackingCode");
const phoneInput=document.getElementById("trackingPhone");
const submitBtn=document.getElementById("trackingSubmitBtn");
const message=document.getElementById("trackingMessage");
const results=document.getElementById("trackingResults");
const TRACKING_REFRESH_MS=15000;
let currentAccess=null;
let stopOffersListener=null;
let stopLockListener=null;
let liveOffers=[];
let liveLock=null;

function safe(v){
  return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function money(v){return new Intl.NumberFormat("tr-TR").format(Number(v||0))+" TL";}
function fmtDate(v){
  if(!v)return "-";
  const d=new Date(v);
  return Number.isNaN(d.getTime())?"-":d.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function normalizePhone(raw){
  let d=String(raw||"").replace(/\D/g,"");
  if(d.startsWith("90")&&d.length===12)d=d.slice(2);
  if(d.startsWith("0")&&d.length===11)d=d.slice(1);
  return d;
}
async function sha256(text){
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function toast(text){
  const el=document.getElementById("trackingToast");
  el.textContent=text;el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2400);
}
function normalizeCode(v){return String(v||"").trim().toUpperCase();}

function currentTrackingUrl(access){
  const url=new URL("teklif.html",location.href);
  url.search="";
  url.searchParams.set("v","5");
  url.searchParams.set("kod",access.trackingCode);
  return url.toString();
}
function lockState(lock){
  if(!lock)return null;
  if(lock.status==="used")return "used";
  if(lock.expiresAt&&new Date(lock.expiresAt).getTime()<=Date.now())return "expired";
  return "locked";
}
function offerState(offer,lock){
  if(lock){
    if(lock.institutionId===offer.institutionId)return lockState(lock);
    return "closed";
  }
  return offer.expiresAt&&new Date(offer.expiresAt).getTime()<=Date.now()?"expired":"offered";
}
function stateLabel(s){
  return {offered:"Fiyat Garantili",locked:"Fiyat Kilitli",used:"Kullanıldı",expired:"Süresi Doldu",closed:"Başka teklif seçildi"}[s]||s;
}

function getLocalRequestDetail(access){
  try{
    const map=JSON.parse(localStorage.getItem("dijiyerCustomerQuoteData")||"{}");
    const rows=Object.entries(map);
    for(const [quoteId,data] of rows){
      if(
        quoteId===access.quoteId ||
        (data && access.trackingCode && data.trackingCode===access.trackingCode)
      ){
        return data||{};
      }
    }
  }catch(error){
    console.warn("Yerel talep detayı okunamadı:",error);
  }
  return {};
}

function requestDetailHtml(access){
  const local=getLocalRequestDetail(access);
  const mainLabel=access.mainCategoryLabel||local.mainCategoryLabel||local.mainCategory||"";
  const subLabel=access.subCategoryLabel||local.subCategoryLabel||local.service||access.service||"";
  const note=access.note||local.note||"Not eklenmemiş.";
  const service=access.service||local.service||"Teklif Talebi";
  const city=access.city||local.city||"";
  const district=access.district||local.district||"";
  const date=access.date||local.date||"";

  return `
    <details class="request-detail-box">
      <summary>📋 Talep Detayını Gör</summary>
      <div class="request-detail-grid">
        <div><span>Hizmet</span><strong>${safe(service)}</strong></div>
        <div><span>Kategori</span><strong>${safe([mainLabel,subLabel].filter(Boolean).join(" / ")||service)}</strong></div>
        <div><span>Konum</span><strong>${safe([city,district].filter(Boolean).join(" / ")||"-")}</strong></div>
        <div><span>Talep Tarihi</span><strong>${fmtDate(date)}</strong></div>
        <div class="request-detail-note"><span>Talep Notu</span><strong>${safe(note)}</strong></div>
      </div>
    </details>`;
}

async function verifyAccess(code,phone){
  const phoneNormalized=normalizePhone(phone);
  if(phoneNormalized.length<10)throw new Error("Telefon numarasını kontrol edin.");
  const phoneHash=await sha256(phoneNormalized);
  const ref=db.collection("quoteAccess").doc(phoneHash).collection("codes").doc(code);
  const snap=await ref.get();
  if(!snap.exists)throw new Error("Takip kodu veya telefon numarası eşleşmedi.");
  const data=snap.data();
  if(data.phoneHash!==phoneHash||data.trackingCode!==code)throw new Error("Takip bilgileri doğrulanamadı.");
  return {phoneHash,...data};
}

async function loadBundle(access){
  const quoteRef=db.collection("quoteRequests").doc(access.quoteId);
  const [offersSnap,lockSnap]=await Promise.all([
    quoteRef.collection("offers").get(),
    quoteRef.collection("locks").doc("main").get()
  ]);
  return {
    access,
    offers:offersSnap.docs.map(d=>({id:d.id,...d.data()})),
    lock:lockSnap.exists?lockSnap.data():null
  };
}

function stopLiveTracking(){
  if(typeof stopOffersListener==="function") stopOffersListener();
  if(typeof stopLockListener==="function") stopLockListener();
  stopOffersListener=null;
  stopLockListener=null;
}

function renderLiveTracking(){
  if(!currentAccess)return;
  render({
    access:currentAccess,
    offers:liveOffers,
    lock:liveLock
  });
}

function startLiveTracking(access){
  stopLiveTracking();

  const quoteRef=db.collection("quoteRequests").doc(access.quoteId);

  stopOffersListener=quoteRef.collection("offers").onSnapshot(
    snapshot=>{
      liveOffers=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
      renderLiveTracking();
    },
    error=>{
      console.error("Teklifler canlı izlenemedi:",error);
      toast("Teklifler güncellenemedi.");
    }
  );

  stopLockListener=quoteRef.collection("locks").doc("main").onSnapshot(
    snapshot=>{
      liveLock=snapshot.exists?snapshot.data():null;
      renderLiveTracking();
    },
    error=>{
      console.error("Fiyat kilidi canlı izlenemedi:",error);
    }
  );
}

async function refreshTracking(){
  if(!currentAccess)return;
  try{
    const bundle=await loadBundle(currentAccess);
    liveOffers=bundle.offers;
    liveLock=bundle.lock;
    renderLiveTracking();
    toast("Teklifler güncellendi.");
  }catch(error){
    console.error(error);
    toast("Teklifler yenilenemedi.");
  }
}

function lockedHtml(bundle){
  const lock=bundle.lock;
  const state=lockState(lock);
  const verifyUrl=location.origin+location.pathname.replace(/[^/]*$/,"")+"institution.html?offer="+encodeURIComponent(lock.offerCode||"");
  return `
    <article class="locked-card">
      <div class="locked-check">✓</div>
      <h2>${state==="used"?"Teklif Kullanıldı":state==="expired"?"Teklifin Süresi Doldu":"Fiyatınız Kilitlendi"}</h2>
      <div class="locked-code">GARANTİLİ TEKLİF · ${safe(lock.offerCode||"")}</div>
      <div class="locked-price">${money(lock.price)}</div>
      <div class="offer-scope">${safe(lock.scope||"")}</div>
      <div class="offer-meta" style="margin-top:9px">Geçerlilik: <b>${fmtDate(lock.expiresAt)}</b></div>
      <div id="lockedQr" class="qr-box" data-url="${safe(verifyUrl)}"></div>
      <div class="countdown" data-countdown="${safe(lock.expiresAt||"")}"></div>
      ${state==="locked"?`<div class="offer-actions" style="justify-content:center"><button class="report-btn" data-report>İşletme Teklife Uymadı</button></div>`:""}
    </article>`;
}

function offerHtml(bundle,offer){
  const state=offerState(offer,bundle.lock);
  return `
    <article class="offer-card">
      <div class="offer-head">
        <div>
          <h3>${safe(offer.institutionName||"Kurum")}</h3>
          <div class="offer-meta">Teklif No: <b>${safe(offer.offerCode||"-")}</b></div>
        </div>
        <span class="status ${state==="expired"||state==="closed"?"red":state==="locked"||state==="used"?"green":""}">${stateLabel(state)}</span>
      </div>
      <div class="offer-price">${money(offer.price)}</div>
      <div class="offer-meta">KDV: ${safe(offer.vatStatus||"-")} · Son geçerlilik: ${fmtDate(offer.expiresAt)}</div>
      <div class="offer-scope"><b>Teklif kapsamı</b><br>${safe(offer.scope||"")}${offer.conditions?`<br><br><b>Özel şart:</b> ${safe(offer.conditions)}`:""}</div>
      ${state==="offered"?`<div class="offer-actions"><button class="lock-btn" data-lock data-institution-id="${safe(offer.institutionId)}">🔒 Fiyatı Kilitle</button></div>`:""}
    </article>`;
}

function render(bundle){
  const access=bundle.access;
  const offers=[...bundle.offers].sort((a,b)=>Number(a.price||0)-Number(b.price||0));
  results.classList.remove("hidden");
  results.innerHTML=`
    <article class="request-summary">
      <div class="request-head">
        <div>
          <h2>${safe(access.service||"Teklif Talebi")}</h2>
          <div class="location">📍 ${safe([access.city,access.district].filter(Boolean).join(" / "))} · ${fmtDate(access.date)}</div>
        </div>
        <span class="status">${safe(access.trackingCode)}</span>
      </div>
      <div class="tracking-actions">
        <button class="secondary" id="refreshTrackingBtn">↻ Teklifleri Yenile</button>
        <button class="secondary" id="copyTrackingLinkBtn">🔗 Talep Linkini Kopyala</button>
        <button class="secondary" id="shareTrackingWhatsappBtn">WhatsApp'tan Paylaş</button>
        <button class="secondary" id="copyTrackingCodeBtn">Takip Kodunu Kopyala</button>
        <a class="secondary" href="index.html">Yeni Talep Oluştur</a>
      </div>

      ${requestDetailHtml(access)}
    </article>

    ${bundle.lock?lockedHtml(bundle):`<h2 class="offers-title">Gelen Teklifler (${offers.length})</h2>${offers.length?offers.map(o=>offerHtml(bundle,o)).join(""):'<div class="empty">Henüz teklif gelmedi. Kurumlar fiyat gönderdiğinde burada görünecek.</div>'}`}
  `;

  const refreshBtn=document.getElementById("refreshTrackingBtn");
  if(refreshBtn)refreshBtn.onclick=refreshTracking;

  const copyLinkBtn=document.getElementById("copyTrackingLinkBtn");
  if(copyLinkBtn)copyLinkBtn.onclick=async()=>{
    const url=currentTrackingUrl(access);
    try{
      await navigator.clipboard.writeText(url);
      toast("Bu talebin linki kopyalandı.");
    }catch(error){
      console.error(error);
      toast("Link kopyalanamadı.");
    }
  };

  const shareWhatsappBtn=document.getElementById("shareTrackingWhatsappBtn");
  if(shareWhatsappBtn)shareWhatsappBtn.onclick=()=>{
    const url=currentTrackingUrl(access);
    const message=encodeURIComponent(
      "Dijiyer teklif talebim\n\nTakip Kodu: "+access.trackingCode+"\n"+url
    );
    window.open("https://wa.me/?text="+message,"_blank","noopener");
  };

  const copyBtn=document.getElementById("copyTrackingCodeBtn");
  if(copyBtn)copyBtn.onclick=async()=>{await navigator.clipboard.writeText(access.trackingCode);toast("Takip kodu kopyalandı.");};

  results.querySelectorAll("[data-lock]").forEach(btn=>{
    btn.addEventListener("click",()=>lockOffer(access.quoteId,btn.dataset.institutionId,btn));
  });
  const report=results.querySelector("[data-report]");
  if(report)report.addEventListener("click",()=>reportIssue(access.quoteId,bundle.lock.offerCode));
  drawQr();
  updateCountdowns();
}

async function lockOffer(quoteId,institutionId,button){
  button.disabled=true;button.textContent="Kilitleniyor...";
  try{
    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    const offerRef=quoteRef.collection("offers").doc(institutionId);
    const lockRef=quoteRef.collection("locks").doc("main");

    await db.runTransaction(async tx=>{
      const [offerSnap,lockSnap]=await Promise.all([tx.get(offerRef),tx.get(lockRef)]);
      if(lockSnap.exists)throw new Error("Bu talep için daha önce bir fiyat kilitlendi.");
      if(!offerSnap.exists)throw new Error("Teklif bulunamadı.");
      const offer=offerSnap.data();
      if(!offer.expiresAtTs||offer.expiresAtTs.toMillis()<=Date.now())throw new Error("Teklifin süresi dolmuş.");

      tx.set(lockRef,{
        quoteId,
        institutionId:offer.institutionId,
        institutionName:offer.institutionName||"Kurum",
        offerCode:offer.offerCode,
        price:Number(offer.price),
        vatStatus:offer.vatStatus||"",
        scope:offer.scope||"",
        conditions:offer.conditions||"",
        expiresAt:offer.expiresAt,
        expiresAtTs:offer.expiresAtTs,
        status:"locked",
        lockedAt:new Date().toISOString(),
        lockedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
        lockedPrice:Number(offer.price),
        lockedScope:offer.scope||""
      });
    });

    toast("Fiyat kilitlendi.");
    await refreshTracking();
  }catch(error){
    console.error(error);toast(error.message||"Teklif kilitlenemedi.");
  }finally{
    button.disabled=false;button.textContent="🔒 Fiyatı Kilitle";
  }
}

async function reportIssue(quoteId,offerCode){
  const reason=prompt("Sorunu kısaca yazın. Örn: İşletme geçerli fiyatı kabul etmedi.");
  if(!reason||!reason.trim())return;
  try{
    await db.collection("quoteRequests").doc(quoteId).collection("offerIssues").add({
      offerCode,
      reason:reason.trim().slice(0,500),
      status:"new",
      date:new Date().toISOString()
    });
    toast("Bildiriminiz alındı.");
  }catch(error){
    console.error(error);toast("Bildirim gönderilemedi.");
  }
}

function drawQr(){
  const box=document.getElementById("lockedQr");
  if(!box||typeof QRCode==="undefined")return;
  box.innerHTML="";
  new QRCode(box,{text:box.dataset.url,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});
}
function updateCountdowns(){
  document.querySelectorAll("[data-countdown]").forEach(el=>{
    const target=new Date(el.dataset.countdown).getTime();
    const diff=Math.max(0,target-Date.now());
    if(!diff){el.textContent="Teklifin süresi doldu.";return;}
    const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000);
    el.textContent=`Kalan süre: ${d} gün ${h} saat ${m} dakika`;
  });
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const code=normalizeCode(codeInput.value);
  const phone=phoneInput.value;
  if(!code){message.textContent="Takip kodunu girin.";return;}

  submitBtn.disabled=true;submitBtn.textContent="Kontrol ediliyor...";message.textContent="";
  try{
    currentAccess=await verifyAccess(code,phone);
    sessionStorage.setItem("dijiyerTrackingCode",code);
    sessionStorage.setItem("dijiyerTrackingPhone",normalizePhone(phone));

    const initialBundle=await loadBundle(currentAccess);
    liveOffers=initialBundle.offers;
    liveLock=initialBundle.lock;
    renderLiveTracking();
    startLiveTracking(currentAccess);

    document.getElementById("trackingLoginCard").classList.add("hidden");
  }catch(error){
    console.error(error);
    message.textContent=error.message||"Teklifler açılamadı.";
  }finally{
    submitBtn.disabled=false;submitBtn.textContent="Tekliflerimi Göster";
  }
});

const urlCode=normalizeCode(new URLSearchParams(location.search).get("kod")||"");
const rememberedCode=normalizeCode(sessionStorage.getItem("dijiyerTrackingCode")||localStorage.getItem("dijiyerLastTrackingCode")||"");
if(urlCode||rememberedCode)codeInput.value=urlCode||rememberedCode;
const rememberedPhone=sessionStorage.getItem("dijiyerTrackingPhone");
if(rememberedPhone)phoneInput.value=rememberedPhone;
setInterval(updateCountdowns,60000);

setInterval(()=>{
  if(currentAccess && !document.hidden){
    refreshTracking();
  }
},TRACKING_REFRESH_MS);

document.addEventListener("visibilitychange",()=>{
  if(!document.hidden && currentAccess){
    refreshTracking();
  }
});