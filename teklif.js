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

function ensureTrackingInputsInteractive(){
  [codeInput,phoneInput].forEach(input=>{
    if(!input)return;
    input.disabled=false;
    input.readOnly=false;
    input.removeAttribute("disabled");
    input.removeAttribute("readonly");
    input.style.pointerEvents="auto";
    input.style.userSelect="text";
  });
}

ensureTrackingInputsInteractive();
document.addEventListener("DOMContentLoaded",ensureTrackingInputsInteractive,{once:true});
let currentAccess=null;
let stopOffersListener=null;
let stopOfferHistoryListener=null;
let stopLockListener=null;
let stopEngagementListener=null;
let stopPublicStatusListener=null;
let liveOffers=[];
let liveOfferHistory=[];
let liveLock=null;
let liveEngagement=[];
let livePublicStatus=null;
const offerUpdateVersions=new Map();
const engagementResponseVersions=new Map();
let offerListenerInitialized=false;
let engagementListenerInitialized=false;
const newlyArrivedOfferIds=new Set();
let latestNewOfferNotice=null;
let offerSortMode=localStorage.getItem("dijiyerOfferSortMode")||"arrival";
let acceptInProgress=false;

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

function acceptedQuoteStorageKey(quoteId){
  return "dijiyerAcceptedQuote_"+String(quoteId||"");
}
function markQuoteAcceptedLocally(quoteId,lockData={}){
  if(!quoteId)return;
  try{
    localStorage.setItem(acceptedQuoteStorageKey(quoteId),JSON.stringify({
      accepted:true,
      institutionId:String(lockData.institutionId||""),
      institutionName:String(lockData.institutionName||""),
      offerCode:String(lockData.offerCode||""),
      price:Number(lockData.price||0),
      acceptedAt:String(lockData.acceptedAt||lockData.lockedAt||new Date().toISOString())
    }));
  }catch(_){}
}
function localAcceptedQuote(quoteId){
  if(!quoteId)return null;
  try{
    const row=JSON.parse(localStorage.getItem(acceptedQuoteStorageKey(quoteId))||"null");
    return row?.accepted===true ? row : null;
  }catch(_){
    return null;
  }
}
function localAcceptedClosedHtml(access){
  const row=localAcceptedQuote(access?.quoteId)||{};
  return `
    <article class="locked-card local-accepted-card">
      <div class="locked-check">✓</div>
      <h2>Teklif Kabul Edildi · Talep Kapatıldı</h2>
      ${row.offerCode?`<div class="locked-code">KABUL EDİLEN TEKLİF · ${safe(row.offerCode)}</div>`:""}
      ${row.price?`<div class="locked-price">${money(row.price)}</div>`:""}
      <div class="offer-lock-notice">
        <strong>Bu talep için bir teklif zaten kabul edildi.</strong>
        Kabul işlemi tekrar yapılamaz. Satıcı kabul edilen teklifi artık düzenleyemez.
      </div>
    </article>
  `;
}

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
  return {
    offered:"Teklif Aktif",
    locked:"Kayıt Bekliyor",
    used:"Gerçek Kayıt Tamamlandı",
    expired:"Süresi Doldu",
    closed:"Başka teklif seçildi"
  }[s]||s;
}

function customerOfferVersions(currentOffers,historyRows){
  const rows=[];
  (Array.isArray(historyRows)?historyRows:[]).forEach(row=>{
    rows.push({
      ...row,
      id:"history_"+String(row.id||row.institutionId||"")+"_"+String(row.version||1),
      offerVersion:Math.max(1,Number(row.version||row.offerVersion||1)),
      isHistorical:true,
      historyVersion:Math.max(1,Number(row.version||row.offerVersion||1))
    });
  });
  (Array.isArray(currentOffers)?currentOffers:[]).forEach(row=>{
    rows.push({...row,isHistorical:false});
  });
  return rows;
}

function offerValidityHoursFromDates(offer){
  if(!offer?.expiresAt)return 0;
  const start=offer.updatedAt || offer.createdAt;
  if(!start)return 0;
  const diff=new Date(offer.expiresAt).getTime()-new Date(start).getTime();
  if(!Number.isFinite(diff)||diff<=0)return 0;
  return Math.max(1,Math.round(diff/3600000));
}
function offerValidityText(offer){
  const h=offerValidityHoursFromDates(offer);
  if(h===1)return "1 saat";
  if(h===3)return "3 saat";
  if(h===12)return "12 saat";
  if(h===24)return "24 saat";
  if(h===48)return "2 gün";
  if(h===72)return "3 gün";
  if(h===168)return "7 gün";
  if(h>24 && h%24===0)return (h/24)+" gün";
  return h ? h+" saat" : "belirtilen süre";
}
function acceptanceTermsHtml(offer){
  const validity=offerValidityText(offer);
  return `
    <div class="offer-acceptance-box">
      <div class="offer-acceptance-title">Teklif ve gerçek kayıt şartları</div>
      <div class="offer-acceptance-grid">
        <div><span>Fiyat</span><strong>${money(offer.price)}</strong></div>
        <div><span>Geçerlilik</span><strong>${safe(validity)}</strong></div>
        <div><span>Son geçerlilik</span><strong>${fmtDate(offer.expiresAt)}</strong></div>
        <div><span>KDV</span><strong>${safe(offer.vatStatus||"-")}</strong></div>
        <div><span>Ek ücret</span><strong>${safe(offer.extraFee||"Yok")}</strong></div>
      </div>
      <div class="offer-acceptance-warning">
        ⏱ Bu fiyat ve özellikler <b>${safe(validity)}</b> boyunca geçerlidir. Teklifi kabul etseniz bile kesin kayıt oluşmaz. Son geçerlilik tarihine kadar kurumla doğrudan görüşüp gerçek kaydınızı tamamlamanız gerekir. Süre dolarsa fiyat ve şartlar garanti edilmez; kurumla yeniden görüşmeniz gerekir.
      </div>
      <div class="offer-payment-warning">
        <b>🛡️ Dijiyer üzerinden ödeme yapılmaz.</b>
        <span>Ücret, kapora veya kayıt bedeli yalnızca müşteri ile kurum arasında doğrudan yapılır. Dijiyer ödeme aracısı değildir.</span>
      </div>
      ${offer.conditions?`<div class="offer-condition"><span>Özel şart</span><strong>${safe(offer.conditions)}</strong></div>`:""}
    </div>
  `;
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

function requestDetailHtml(access,engagementRows=[],offers=[],lock=null){
  const local=getLocalRequestDetail(access);
  const mainLabel=access.mainCategoryLabel||local.mainCategoryLabel||local.mainCategory||"";
  const subLabel=access.subCategoryLabel||local.subCategoryLabel||local.service||access.service||"";
  const note=access.note||local.note||"Not eklenmemiş.";
  const service=access.service||local.service||"Teklif Talebi";
  const city=access.city||local.city||"";
  const district=access.district||local.district||"";
  const date=access.date||local.date||"";
  const targetInstitutionName=access.targetInstitutionName||local.targetInstitutionName||"";

  const responses=(engagementRows||[]).filter(row=>row?.institutionResponse);
  const interested=responses.filter(row=>row.institutionResponse==="interested").length;
  const declined=responses.filter(row=>row.institutionResponse==="not_interested").length;
  const offerCount=Array.isArray(offers)?offers.length:0;

  const statusText=lock
    ? "Teklif kabul edildi"
    : offerCount
      ? offerCount+" teklif geldi"
      : interested
        ? interested+" kurum teklif hazırlıyor"
        : "Teklif bekleniyor";

  const statusClass=lock
    ? "accepted"
    : offerCount
      ? "offers"
      : interested
        ? "interested"
        : "waiting";

  const deliveryText=targetInstitutionName
    ? (access.allowAlternativeInstitutions===true
        ? "İlk kurum + izin sonrası uygun kurumlar"
        : "Yalnızca seçtiğiniz kurum")
    : "Uygun kurumlara açık talep";

  return `
    <details class="request-detail-box" open>
      <summary>
        <span>📋 Talep Detayı</span>
        <em class="request-detail-live"><i></i> CANLI TAKİP</em>
      </summary>

      <div class="request-detail-live-note">
        <span class="request-live-dot"></span>
        <div>
          <strong>Bu talep canlı takip ediliyor.</strong>
          <small>Sonradan yeni bir teklif gelirse bu sayfada otomatik olarak görünür. Sayfayı yenilemeniz gerekmez.</small>
        </div>
      </div>

      <div class="request-detail-status-grid">
        <div class="${statusClass}">
          <span>Talep Durumu</span>
          <strong>${safe(statusText)}</strong>
        </div>
        <div><span>Gelen Teklif</span><strong>${offerCount}</strong></div>
        <div><span>İlgilenen Kurum</span><strong>${interested}</strong></div>
        <div><span>Şu An Veremiyor</span><strong>${declined}</strong></div>
      </div>

      <div class="request-detail-grid">
        <div><span>Hizmet</span><strong>${safe(service)}</strong></div>
        <div><span>Kategori</span><strong>${safe([mainLabel,subLabel].filter(Boolean).join(" / ")||service)}</strong></div>
        ${targetInstitutionName
          ? `<div><span>Talep Türü</span><strong>🎯 Doğrudan kurum talebi</strong></div>
             <div><span>İlk Hedef Kurum</span><strong>${safe(targetInstitutionName)}</strong></div>`
          : `<div><span>Talep Türü</span><strong>🔎 Çoklu teklif talebi</strong></div>
             <div><span>Konum</span><strong>${safe([city,district].filter(Boolean).join(" / ")||"-")}</strong></div>`}
        <div><span>İletim Kapsamı</span><strong>${safe(deliveryText)}</strong></div>
        <div><span>Talep Tarihi</span><strong>${fmtDate(date)}</strong></div>
        <div class="request-detail-note"><span>Talep Notu</span><strong>${safe(note)}</strong></div>
      </div>
    </details>`;
}

function newOfferAlertHtml(){
  if(!latestNewOfferNotice)return "";
  const age=Date.now()-Number(latestNewOfferNotice.at||0);
  if(age>30000)return "";
  const alternative=latestNewOfferNotice.sourceType==="alternative";
  return `
    <div class="new-offer-live-alert">
      <span class="new-offer-live-icon">🔔</span>
      <div>
        <strong>${alternative?"Alternatif kurumdan yeni teklif geldi":"Yeni teklif geldi"}</strong>
        <small>${safe(latestNewOfferNotice.institutionName||"Kurum")} · ${money(latestNewOfferNotice.price)}</small>
      </div>
      <button type="button" data-jump-new-offer="${safe(latestNewOfferNotice.id||"")}">Teklifi Gör</button>
    </div>`;
}
function institutionResponseLabel(status){
  if(status==="interested")return "İlgileniyor";
  if(status==="not_interested")return "Şu anda teklif veremiyor";
  return "İnceliyor";
}

function getDirectInstitutionResponse(access,engagementRows){
  const targetId=String(access?.targetInstitutionId||"");
  if(!targetId)return null;
  return engagementRows.find(row=>String(row.institutionId||row.id||"")===targetId)||null;
}

function bulkResponseSummaryHtml(engagementRows,offers){
  const responses=engagementRows.filter(row=>row.institutionResponse);
  if(!responses.length)return "";

  const interested=responses.filter(row=>row.institutionResponse==="interested").length;
  const declined=responses.filter(row=>row.institutionResponse==="not_interested").length;

  return `
    <div class="customer-response-summary">
      <strong>Talep hareketleri</strong>
      <div>
        ${interested?`<span class="response-pill interested">✓ ${interested} kurum ilgileniyor</span>`:""}
        ${declined?`<span class="response-pill declined">${declined} kurum şu anda teklif veremiyor</span>`:""}
        <span class="response-pill offers">₺ ${offers.length} fiyat teklifi geldi</span>
      </div>
      <small>Kurumların tek tek olumsuz yanıtları bildirim olarak gönderilmez; burada toplu özetlenir.</small>
    </div>
  `;
}

function responseWaitLabel(access){
  const minutes=Number(access?.responseWaitMinutes||0);
  if(minutes===1440)return "1 gün";
  if(minutes===60)return "1 saat";
  if([15,30,45].includes(minutes))return minutes+" dakika";
  return minutes>0 ? minutes+" dakika" : "";
}

function responseDeadlineState(access){
  const target=new Date(access?.responseDeadlineAt||"").getTime();
  if(!Number.isFinite(target))return null;
  const diff=target-Date.now();
  return {
    target,
    expired:diff<=0,
    diff:Math.max(0,diff)
  };
}

function directResponseHtml(access,engagementRows,offers){
  if(!access?.targetInstitutionId)return "";

  const response=getDirectInstitutionResponse(access,engagementRows);
  const institutionName=
    access.targetInstitutionName||
    response?.institutionName||
    "Seçtiğiniz kurum";

  const targetId=String(access?.targetInstitutionId||"");
  const targetOffer=offers.find(offer=>
    String(offer.institutionId||offer.id||"")===targetId
  );

  if(targetOffer){
    return `
      <div class="direct-customer-status success">
        <span class="direct-status-icon">₺</span>
        <div>
          <strong>${safe(institutionName)} fiyat teklifini gönderdi</strong>
          <p>Teklif aşağıda hazır. Fiyatı ve şartları inceleyebilirsiniz.</p>
        </div>
      </div>
    `;
  }

  if(offers.length){
    return `
      <div class="direct-customer-status success alternative">
        <span class="direct-status-icon">🔔</span>
        <div>
          <strong>Talebinize ${offers.length} yeni teklif geldi</strong>
          <p>İlk seçtiğiniz kurum dışında uygun kurumlardan gelen teklifleri aşağıda inceleyebilirsiniz.</p>
        </div>
      </div>
    `;
  }

  if(response?.institutionResponse==="not_interested"){
    const bulkUrl=new URL("index.html",location.href);
    bulkUrl.searchParams.set("kurum",String(access.targetInstitutionId));
    bulkUrl.searchParams.set("teklif","1");

    return `
      <div class="direct-customer-status declined">
        <span class="direct-status-icon">i</span>
        <div>
          <strong>${safe(institutionName)} şu anda bu talep için teklif veremiyor</strong>
          <p>Talebiniz kapanmadı. Aynı kategorideki diğer uygun kurumlardan toplu teklif isteyebilirsiniz.</p>
          <a href="${safe(bulkUrl.toString())}">Benzer Kurumlardan Teklif Al</a>
        </div>
      </div>
    `;
  }

  if(response?.institutionResponse==="interested"){
    return `
      <div class="direct-customer-status interested">
        <span class="direct-status-icon">✓</span>
        <div>
          <strong>${safe(institutionName)} talebinizle ilgileniyor</strong>
          <p>Kurum talebi kabul etti. Fiyat teklifini hazırladığında bu ekranda görünecek.</p>
        </div>
      </div>
    `;
  }

  const deadline=responseDeadlineState(access);
  const waitLabel=responseWaitLabel(access);

  if(deadline?.expired){
    return `
      <div class="direct-customer-status declined">
        <span class="direct-status-icon">⏱</span>
        <div>
          <strong>${waitLabel?waitLabel+" yanıt süresi doldu":"Yanıt süresi doldu"}</strong>
          <p>${access.allowAlternativeInstitutions===true
            ? "Talebiniz için diğer uygun kurumlara yönlendirme izni verdiniz. Dijiyer yönetiminde yönlendirmeye hazır olarak görünecek."
            : "Talebiniz başka kurumlara otomatik açılmaz. İsterseniz benzer kurumlardan yeni teklif isteyebilirsiniz."}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="direct-customer-status pending">
      <span class="direct-status-icon">…</span>
      <div>
        <strong>Talebiniz ${safe(institutionName)} kurumuna ulaştı</strong>
        <p>Kurum henüz yanıt vermedi. Yanıt geldiğinde bu sayfa otomatik güncellenecek.</p>
        ${deadline
          ? `<div class="direct-response-timer"><span>Yanıt için kalan süre</span><strong data-response-countdown="${safe(access.responseDeadlineAt)}">Hesaplanıyor...</strong><small>${access.allowAlternativeInstitutions===true ? "Süre dolarsa talebiniz diğer uygun kurumlara yönlendirmeye hazır olur." : "Süre dolsa da izniniz olmadan başka kuruma iletilmez."}</small></div>`
          : ""}
      </div>
    </div>
  `;
}

function notifyInstitutionResponseChange(access,row){
  if(!row?.institutionResponse)return;

  const direct=Boolean(access?.targetInstitutionId);
  const name=row.institutionName||access?.targetInstitutionName||"Kurum";

  if(direct){
    const text=row.institutionResponse==="not_interested"
      ? name+" şu anda bu talep için teklif veremiyor."
      : name+" talebinizle ilgileniyor.";

    toast(text);

    try{
      if("Notification" in window && Notification.permission==="granted" && document.hidden){
        new Notification("Dijiyer teklif talebiniz güncellendi",{body:text,tag:"dijiyer-quote-response-"+String(row.institutionId||"")});
      }
    }catch(_){}
  }
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

function rememberVerifiedQuoteOnDevice(access){
  if(!access?.quoteId)return;

  try{
    const idsKey="dijiyerCustomerQuoteIds";
    const dataKey="dijiyerCustomerQuoteData";
    const ids=JSON.parse(localStorage.getItem(idsKey)||"[]");

    if(!ids.includes(access.quoteId))ids.unshift(access.quoteId);
    localStorage.setItem(idsKey,JSON.stringify(ids.slice(0,30)));

    const map=JSON.parse(localStorage.getItem(dataKey)||"{}");
    const existing=map[access.quoteId]||{};

    map[access.quoteId]={
      ...existing,
      service:access.service||existing.service||"Teklif Talebi",
      mainCategory:access.mainCategory||existing.mainCategory||"",
      subCategory:access.subCategory||existing.subCategory||"",
      city:access.city||existing.city||"",
      district:access.district||existing.district||"",
      note:access.note||existing.note||"",
      date:access.date||existing.date||"",
      responseWaitMinutes:Number(access.responseWaitMinutes||existing.responseWaitMinutes||0),
      responseDeadlineAt:access.responseDeadlineAt||existing.responseDeadlineAt||"",
      allowAlternativeInstitutions:access.allowAlternativeInstitutions===true || existing.allowAlternativeInstitutions===true,
      trackingCode:access.trackingCode||existing.trackingCode||"",
      trackingUrl:currentTrackingUrl(access)
    };

    localStorage.setItem(dataKey,JSON.stringify(map));
    localStorage.setItem("dijiyerLastTrackingCode",String(access.trackingCode||""));
  }catch(error){
    console.warn("Teklif bu cihaza kaydedilemedi:",error);
  }
}

async function loadBundle(access){
  const quoteRef=db.collection("quoteRequests").doc(access.quoteId);

  try{
    const [offersSnap,historySnap,lockSnap]=await Promise.all([
      quoteRef.collection("offers").get(),
      quoteRef.collection("offerHistory").get(),
      quoteRef.collection("locks").doc("main").get()
    ]);

    return {
      access,
      offers:offersSnap.docs.map(d=>({id:d.id,...d.data()})),
      offerHistory:historySnap.docs.map(d=>({id:d.id,...d.data()})),
      lock:lockSnap.exists?lockSnap.data():null,
      engagement:[],
      publicStatus:null
    };
  }catch(error){
    console.error("Teklif takip verileri okunamadı:",error);
    throw error;
  }
}

function stopLiveTracking(){
  if(typeof stopOffersListener==="function") stopOffersListener();
  if(typeof stopOfferHistoryListener==="function") stopOfferHistoryListener();
  if(typeof stopLockListener==="function") stopLockListener();
  if(typeof stopEngagementListener==="function") stopEngagementListener();
  if(typeof stopPublicStatusListener==="function") stopPublicStatusListener();
  stopOffersListener=null;
  stopOfferHistoryListener=null;
  stopLockListener=null;
  stopEngagementListener=null;
  stopPublicStatusListener=null;
}

function renderLiveTracking(){
  if(!currentAccess)return;
  render({
    access:currentAccess,
    offers:liveOffers,
    offerHistory:liveOfferHistory,
    lock:liveLock,
    engagement:liveEngagement,
    publicStatus:livePublicStatus
  });
}

function startAcceptedLockTracking(access){
  stopLiveTracking();
  const lockRef=db.collection("quoteRequests").doc(access.quoteId).collection("locks").doc("main");
  stopLockListener=lockRef.onSnapshot(
    snapshot=>{
      liveLock=snapshot.exists?snapshot.data():liveLock;
      if(liveLock)markQuoteAcceptedLocally(access.quoteId,liveLock);
      renderLiveTracking();
    },
    error=>{
      console.error("Kabul edilen teklif durumu canlı izlenemedi:",error);
    }
  );
}

function startLiveTracking(access){
  stopLiveTracking();

  offerListenerInitialized=false;
  offerUpdateVersions.clear();
  newlyArrivedOfferIds.clear();
  latestNewOfferNotice=null;

  const quoteRef=db.collection("quoteRequests").doc(access.quoteId);

  stopOffersListener=quoteRef.collection("offers").onSnapshot(
    snapshot=>{
      const nextOffers=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));

      if(offerListenerInitialized){
        snapshot.docChanges().forEach(change=>{
          const offer={id:change.doc.id,...change.doc.data()};

          if(change.type==="added"){
            const offerId=String(offer.institutionId||change.doc.id);
            newlyArrivedOfferIds.add(offerId);
            const alternative=offer.sourceType==="alternative";
            latestNewOfferNotice={
              id:offerId,
              institutionName:offer.institutionName||"Kurum",
              price:Number(offer.price||0),
              sourceType:String(offer.sourceType||""),
              at:Date.now()
            };

            toast(
              (alternative?"🔔 Alternatif kurumdan teklif geldi · ":"🔔 Yeni teklif geldi · ")+
              (offer.institutionName||"Kurum")+
              " · "+
              money(offer.price)
            );

            try{
              window.DijiyerCustomerNotifyOffer?.();
            }catch(_){};

            try{
              if("Notification" in window && Notification.permission==="granted" && document.hidden){
                new Notification(
                  alternative
                    ? "Dijiyer · Alternatif kurumdan teklif geldi"
                    : "Dijiyer · Yeni teklif geldi",
                  {
                    body:(offer.institutionName||"Kurum")+" · "+money(offer.price),
                    tag:"dijiyer-new-offer-"+offerId
                  }
                );
              }
            }catch(_){}

            setTimeout(()=>{
              newlyArrivedOfferIds.delete(offerId);
              if(latestNewOfferNotice?.id===offerId){
                latestNewOfferNotice=null;
              }
              if(currentAccess?.quoteId===access.quoteId){
                renderLiveTracking();
              }
            },30000);
            return;
          }

          if(change.type!=="modified")return;

          const previousVersion=offerUpdateVersions.get(change.doc.id)||"";
          const nextVersion=String(offer.updatedAt||"");

          if(nextVersion && nextVersion!==previousVersion){
            const version=Number(offer.offerVersion||0);
            const secondOffer=version===2;
            const alternative=offer.sourceType==="alternative";
            const notificationText=
              (alternative?"Alternatif kurum · ":"")+
              (offer.institutionName||"Kurum")+
              (secondOffer?" 2. teklifini gönderdi: ":" teklifini güncelledi: ")+
              money(offer.price)+
              " · "+
              offerValidityText(offer)+
              " geçerli";

            toast((secondOffer?"🔔 2. teklif geldi · ":"🔔 ")+notificationText);
            try{
              window.DijiyerCustomerNotifyOffer?.();
            }catch(_){};

            try{
              if("Notification" in window && Notification.permission==="granted" && document.hidden){
                new Notification(
                  secondOffer
                    ? (alternative
                        ? "Dijiyer · Alternatif kurumdan 2. teklif"
                        : "Dijiyer · 2. teklif geldi")
                    : "Dijiyer · Teklif güncellendi",
                  {
                    body:notificationText,
                    tag:"dijiyer-offer-update-"+String(offer.institutionId||change.doc.id)
                  }
                );
              }
            }catch(_){}
          }
        });
      }

      nextOffers.forEach(offer=>{
        offerUpdateVersions.set(String(offer.id),String(offer.updatedAt||""));
      });
      offerListenerInitialized=true;
      liveOffers=nextOffers;
      renderLiveTracking();
    },
    error=>{
      console.error("Teklifler canlı izlenemedi:",error);
      toast("Teklifler güncellenemedi.");
    }
  );

  stopOfferHistoryListener=quoteRef.collection("offerHistory").onSnapshot(
    snapshot=>{
      liveOfferHistory=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
      renderLiveTracking();
    },
    error=>{
      console.error("Teklif geçmişi canlı izlenemedi:",error);
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
    const quoteRef=db.collection("quoteRequests").doc(currentAccess.quoteId);
    const [offersSnap,historySnap,lockSnap]=await Promise.all([
      quoteRef.collection("offers").get(),
      quoteRef.collection("offerHistory").get(),
      quoteRef.collection("locks").doc("main").get()
    ]);

    liveOffers=offersSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
    liveOfferHistory=historySnap.docs.map(doc=>({id:doc.id,...doc.data()}));
    liveLock=lockSnap.exists?lockSnap.data():null;

    if(liveLock)markQuoteAcceptedLocally(currentAccess.quoteId,liveLock);

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
  const institutionId=String(lock.institutionId||"");
  const institutionUrl="kurum.html?id="+encodeURIComponent(institutionId);
  const renewUrl=institutionUrl+"&teklif=1";
  const acceptedAt=lock.acceptedAt||lock.lockedAt||"";
  const deadline=lock.registrationDeadlineAt||lock.expiresAt||"";
  const title=state==="used"
    ? "Gerçek Kayıt Tamamlandı"
    : state==="expired"
      ? "Teklif Süresi Doldu · Yeniden Görüşün"
      : "Teklif Kabul Edildi · Kayıt Bekleniyor";

  return `
    <article class="locked-card">
      <div class="locked-check">${state==="expired"?"!":"✓"}</div>
      <h2>${title}</h2>
      <div class="locked-code">DOĞRULANMIŞ TEKLİF · ${safe(lock.offerCode||"")}</div>
      <div class="locked-price">${money(lock.price)}</div>
      <div class="offer-scope">${safe(lock.scope||"")}</div>
      <div class="locked-terms-box">
        <strong>Kabul edilen teklif kaydı</strong>
        <div><span>Fiyat</span><b>${money(lock.price)}</b></div>
        <div><span>KDV</span><b>${safe(lock.vatStatus||"-")}</b></div>
        <div><span>Kabul tarihi</span><b>${fmtDate(acceptedAt)}</b></div>
        <div><span>Kabul doğrulaması</span><b>✓ Telefon + takip kodu</b></div>
        <div><span>Gerçek kayıt için son tarih</span><b>${fmtDate(deadline)}</b></div>
        ${lock.conditions?`<div><span>Özel şart</span><b>${safe(lock.conditions)}</b></div>`:""}
        <p>Teklif kabul edildiği andaki fiyat ve şartlar kayıt altına alınmıştır; kurum bu kabul kaydını sonradan sessizce değiştiremez.</p>
      </div>
      ${state==="locked"?`
        <div class="registration-status-note">
          <strong>⏳ Gerçek kayıt henüz tamamlanmadı</strong>
          <span>Bu kabul kesin kayıt değildir. Yukarıdaki son tarihe kadar kurumla doğrudan görüşüp kaydınızı tamamlamanız gerekir.</span>
        </div>
      `:""}
      ${state==="expired"?`
        <div class="registration-expired-note">
          <strong>Teklifin geçerlilik süresi sona erdi.</strong>
          <span>Bu fiyat ve şartlar artık garanti edilmez. Kurumla yeniden görüşebilir veya güncel bir teklif isteyebilirsiniz.</span>
        </div>
      `:""}
      ${state==="used"?`
        <div class="registration-completed-note">
          <strong>✓ Kurum gerçek kaydı tamamlandı olarak işaretledi.</strong>
          <span>Tamamlanma: ${fmtDate(lock.registrationCompletedAt||lock.usedAt||"")}</span>
        </div>
      `:""}
      <div class="offer-payment-warning locked-payment-warning">
        <b>🛡️ Dijiyer üzerinden ödeme yapılmaz.</b>
        <span>Ödeme, kapora veya kayıt bedeli yalnızca sizinle kurum arasında doğrudan gerçekleştirilir. Dijiyer ödeme aracısı değildir.</span>
      </div>
      <div id="lockedQr" class="qr-box" data-url="${safe(verifyUrl)}"></div>
      ${state==="locked"?`<div class="countdown" data-countdown="${safe(deadline)}"></div>`:""}
      <div class="offer-actions locked-main-actions">
        ${institutionId?`<a class="secondary tracking-action-btn" href="${safe(state==="expired"?renewUrl:institutionUrl)}"><span class="tracking-action-icon">${state==="expired"?"↻":"🏢"}</span><span>${state==="expired"?"Kurumdan Yeni Teklif İste":"Kurum Sayfasını Aç"}</span></a>`:""}
        ${state==="locked"?`<button class="report-btn" data-report>⚠ Teklifle İlgili Sorun Bildir</button>`:""}
      </div>
    </article>`;
}

function offerHtml(bundle,offer){
  const historical=offer.isHistorical===true;
  const state=historical ? "history" : offerState(offer,bundle.lock);
  const version=Math.max(1,Number(offer.offerVersion||offer.version||1));
  const targetInstitutionId=String(bundle.publicStatus?.targetInstitutionId||bundle.access?.targetInstitutionId||"");
  const institutionId=String(offer.institutionId||offer.id||"");
  const alternative=offer.sourceType==="alternative" || Boolean(targetInstitutionId && institutionId && targetInstitutionId!==institutionId);
  const sourceNotice=alternative
    ? '<div class="alternative-offer-notice"><b>↗ Alternatif kurum teklifi</b><span>İlk seçtiğiniz kurumun yanıt süresi sonrasında talebiniz bu kuruma yönlendirildi.</span></div>'
    : "";
  const versionNotice=historical
    ? '<div class="offer-version-badge history">🕘 '+version+'. teklif · Önceki teklif</div>'
    : version>=2
      ? '<div class="offer-version-badge">🔔 '+version+'. teklif · Güncellenmiş teklif</div>'
      : '<div class="offer-version-badge first">1. teklif · İlk teklif</div>';
  return `
    <article class="offer-card${historical?" offer-card-history":""}">
      <div class="offer-head">
        <div>
          <h3>${safe(offer.institutionName||"Kurum")}</h3>
          <div class="offer-meta">Teklif No: <b>${safe(offer.offerCode||"-")}</b></div>
        </div>
        <span class="status ${historical?"history":state==="expired"||state==="closed"?"red":state==="locked"||state==="used"?"green":""}">${historical?"Geçmiş Teklif":stateLabel(state)}</span>
      </div>
      ${sourceNotice}
      ${versionNotice}

      <div class="offer-price">${money(offer.price)}</div>
      <div class="offer-updated-meta">
        ${historical
          ? "🕘 Bu teklif daha sonra güncellendi · "+fmtDate(offer.updatedAt||offer.createdAt)
          : offer.updatedAt && offer.createdAt && offer.updatedAt!==offer.createdAt
            ? "🔔 Teklif güncellendi · "+fmtDate(offer.updatedAt)
            : "Teklif tarihi · "+fmtDate(offer.createdAt)}
      </div>

      <div class="offer-scope">
        <b>Teklif kapsamı</b><br>${safe(offer.scope||"")}
      </div>

      ${acceptanceTermsHtml(offer)}

      ${historical
        ? '<div class="offer-history-note">Bu teklif geçmiş kaydıdır. Kabul işlemi yalnızca kurumun en güncel teklifi üzerinden yapılabilir.</div>'
        : state==="offered"
          ? `<label class="offer-consent-row"><input type="checkbox" data-lock-consent data-institution-id="${safe(offer.institutionId)}"><span>Teklif şartlarını, geçerlilik süresini ve Dijiyer üzerinden ödeme yapılmadığı bilgisini okudum.</span></label><div class="offer-actions"><button class="lock-btn accept-lock-btn" data-lock data-institution-id="${safe(offer.institutionId)}" disabled>✓ Teklifi Kabul Et</button></div>`
          : ""}
    </article>`;
}

function sortOffersForCustomer(rows){
  const offers=[...rows];
  if(offerSortMode==="price_asc") return offers.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
  if(offerSortMode==="price_desc") return offers.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
  if(offerSortMode==="latest") return offers.sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
  if(offerSortMode==="validity") return offers.sort((a,b)=>new Date(a.expiresAt||8640000000000000)-new Date(b.expiresAt||8640000000000000));
  return offers.sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
}

function offerFairnessToolbarHtml(count){
  if(count<2)return "";
  return `
    <div class="offer-fairness-toolbar">
      <div>
        <strong>Tarafsız teklif görünümü</strong>
        <span>Varsayılan sıralama geliş sırasıdır. Dijiyer hiçbir kurumu ücretle öne çıkarmaz; sıralamayı siz değiştirebilirsiniz.</span>
      </div>
      <label>Sırala
        <select id="offerSortSelect">
          <option value="arrival" ${offerSortMode==="arrival"?"selected":""}>Geliş sırası</option>
          <option value="price_asc" ${offerSortMode==="price_asc"?"selected":""}>Fiyat: düşükten yükseğe</option>
          <option value="price_desc" ${offerSortMode==="price_desc"?"selected":""}>Fiyat: yüksekten düşüğe</option>
          <option value="latest" ${offerSortMode==="latest"?"selected":""}>En son güncellenen</option>
          <option value="validity" ${offerSortMode==="validity"?"selected":""}>Süresi önce dolacak</option>
        </select>
      </label>
    </div>
  `;
}
function routingStatusHtml(access,publicStatus){
  if(publicStatus?.status!=="forwarded")return "";
  const count=Number(publicStatus.forwardedInstitutionCount||0);
  const message=publicStatus.message || "Talebiniz uygun diğer kurumlara iletildi.";
  return `
    <div class="customer-routing-status">
      <div class="customer-routing-status-icon">↗</div>
      <div>
        <span>TEKLİF SÜRECİ GÜNCELLENDİ</span>
        <strong>${safe(message)}</strong>
        <small>${count>0?safe(count+" uygun kuruma iletildi · Yanıtlar geldikçe burada göreceksiniz."):"Alternatif kurumlardan yanıt bekleniyor."}</small>
      </div>
    </div>
  `;
}

function render(bundle){
  const access=bundle.access;
  if(bundle.lock)markQuoteAcceptedLocally(access?.quoteId,bundle.lock);
  const acceptedLocally=Boolean(bundle.lock)||Boolean(localAcceptedQuote(access?.quoteId));
  const currentOffers=sortOffersForCustomer(bundle.offers);
  const offers=sortOffersForCustomer(customerOfferVersions(bundle.offers,bundle.offerHistory));
  const engagementRows=Array.isArray(bundle.engagement)?bundle.engagement:[];
  const directStatus=directResponseHtml(access,engagementRows,currentOffers);
  const bulkSummary=access.targetInstitutionId?"":bulkResponseSummaryHtml(engagementRows,currentOffers);
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
        <button class="secondary tracking-action-btn refresh-action" id="refreshTrackingBtn"><span class="tracking-action-icon">↻</span><span>Teklifleri Yenile</span></button>
        <button class="secondary tracking-action-btn copy-action" id="copyTrackingLinkBtn"><span class="tracking-action-icon">🔗</span><span>Talep Linkini Kopyala</span></button>
        <button class="secondary tracking-action-btn whatsapp-action" id="shareTrackingWhatsappBtn"><span class="tracking-action-icon">◉</span><span>WhatsApp'tan Paylaş</span></button>
        <button class="secondary tracking-action-btn copy-action" id="copyTrackingCodeBtn"><span class="tracking-action-icon">⧉</span><span>Takip Kodunu Kopyala</span></button>
        <a class="secondary tracking-action-btn new-request-action" href="index.html"><span class="tracking-action-icon">＋</span><span>Yeni Talep Oluştur</span></a>
      </div>

      ${requestDetailHtml(access,engagementRows,currentOffers,bundle.lock)}
    </article>

    ${directStatus}
    ${bulkSummary}
    ${routingStatusHtml(access,bundle.publicStatus)}
    ${newOfferAlertHtml()}

    ${bundle.lock
      ? lockedHtml(bundle)
      : acceptedLocally
        ? localAcceptedClosedHtml(access)
        : `<h2 class="offers-title">Gelen Teklifler (${offers.length})</h2>${offers.some(o=>o.isHistorical)?'<div class="offer-history-summary">İlk teklif dahil kurumların gönderdiği tüm teklif sürümleri gösteriliyor.</div>':""}${offerFairnessToolbarHtml(offers.length)}${offers.length?offers.map(o=>offerHtml(bundle,o)).join(""):'<div class="empty">Henüz teklif gelmedi. Kurumlar fiyat gönderdiğinde burada görünecek.</div>'}`}
  `;

  newlyArrivedOfferIds.forEach(id=>{
    const card=results.querySelector('[data-offer-institution="'+CSS.escape(String(id))+'"]');
    if(!card)return;
    card.classList.add("is-new-offer");
    if(!card.querySelector(".new-offer-card-badge")){
      card.insertAdjacentHTML("afterbegin",'<div class="new-offer-card-badge">🔔 YENİ GELEN TEKLİF</div>');
    }
  });

  const newOfferJump=results.querySelector("[data-jump-new-offer]");
  if(newOfferJump){
    newOfferJump.addEventListener("click",()=>{
      const id=String(newOfferJump.dataset.jumpNewOffer||"");
      const target=results.querySelector('[data-offer-institution="'+CSS.escape(id)+'"]');
      if(target){
        target.scrollIntoView({behavior:"smooth",block:"center"});
        target.classList.add("is-new-offer-focus");
        setTimeout(()=>target.classList.remove("is-new-offer-focus"),1800);
      }
    });
  }

  const sortSelect=document.getElementById("offerSortSelect");
  if(sortSelect){
    sortSelect.onchange=()=>{
      offerSortMode=sortSelect.value;
      localStorage.setItem("dijiyerOfferSortMode",offerSortMode);
      renderLiveTracking();
    };
  }

  function setTrackingButtonFeedback(button,text,success=true){
    if(!button)return;
    const label=button.querySelector("span:last-child");
    const original=button.dataset.originalLabel || label?.textContent || "";
    if(!button.dataset.originalLabel)button.dataset.originalLabel=original;

    button.classList.remove("is-success","is-error");
    button.classList.add(success?"is-success":"is-error");
    if(label)label.textContent=text;

    clearTimeout(button._feedbackTimer);
    button._feedbackTimer=setTimeout(()=>{
      button.classList.remove("is-success","is-error");
      if(label)label.textContent=button.dataset.originalLabel||original;
    },1600);
  }

  const refreshBtn=document.getElementById("refreshTrackingBtn");
  if(refreshBtn)refreshBtn.onclick=async()=>{
    if(refreshBtn.classList.contains("is-loading"))return;
    refreshBtn.classList.add("is-loading");
    refreshBtn.disabled=true;
    try{
      await refreshTracking();
      setTrackingButtonFeedback(refreshBtn,"Yenilendi ✓",true);
    }catch(error){
      console.error(error);
      setTrackingButtonFeedback(refreshBtn,"Tekrar Dene",false);
    }finally{
      refreshBtn.classList.remove("is-loading");
      refreshBtn.disabled=false;
    }
  };

  const copyLinkBtn=document.getElementById("copyTrackingLinkBtn");
  if(copyLinkBtn)copyLinkBtn.onclick=async()=>{
    const url=currentTrackingUrl(access);
    try{
      await navigator.clipboard.writeText(url);
      setTrackingButtonFeedback(copyLinkBtn,"Kopyalandı ✓",true);
      toast("Bu talebin linki kopyalandı.");
    }catch(error){
      console.error(error);
      setTrackingButtonFeedback(copyLinkBtn,"Kopyalanamadı",false);
      toast("Link kopyalanamadı.");
    }
  };

  const shareWhatsappBtn=document.getElementById("shareTrackingWhatsappBtn");
  if(shareWhatsappBtn)shareWhatsappBtn.onclick=()=>{
    const url=currentTrackingUrl(access);
    const message=encodeURIComponent(
      "Dijiyer teklif talebim\n\nTakip Kodu: "+access.trackingCode+"\n"+url
    );
    shareWhatsappBtn.classList.add("is-pressed");
    setTimeout(()=>shareWhatsappBtn.classList.remove("is-pressed"),350);
    window.open("https://wa.me/?text="+message,"_blank","noopener");
  };

  const copyBtn=document.getElementById("copyTrackingCodeBtn");
  if(copyBtn)copyBtn.onclick=async()=>{
    try{
      await navigator.clipboard.writeText(access.trackingCode);
      setTrackingButtonFeedback(copyBtn,"Kopyalandı ✓",true);
      toast("Takip kodu kopyalandı.");
    }catch(error){
      console.error(error);
      setTrackingButtonFeedback(copyBtn,"Kopyalanamadı",false);
      toast("Takip kodu kopyalanamadı.");
    }
  };

  results.querySelectorAll("[data-lock-consent]").forEach(consent=>{
    const institutionId=consent.dataset.institutionId;
    const button=results.querySelector(`[data-lock][data-institution-id="${CSS.escape(institutionId)}"]`);
    const sync=()=>{ if(button)button.disabled=!consent.checked; };
    consent.addEventListener("change",sync);
    sync();
  });

  results.querySelectorAll("[data-lock]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const consent=results.querySelector(`[data-lock-consent][data-institution-id="${CSS.escape(btn.dataset.institutionId)}"]`);
      if(consent && !consent.checked){
        toast("Teklif ve ödeme şartlarını okuyup onaylamanız gerekir.");
        return;
      }
      lockOffer(access.quoteId,btn.dataset.institutionId,btn);
    });
  });
  const report=results.querySelector("[data-report]");
  if(report)report.addEventListener("click",()=>openOfferIssueModal(access.quoteId,bundle.lock.offerCode));
  drawQr();
  updateCountdowns();
}

async function recordPublicAcceptedEvent(quoteId,date){
  try{
    // quoteId belge anahtarı olduğu için bu yazma idempotenttir; ekstra get() gerekmez.
    const ref=db.collection("publicAcceptedEvents").doc(String(quoteId));
    await ref.set({
      quoteId:String(quoteId),
      date:String(date||"")
    },{merge:true});
  }catch(error){
    console.warn("Günlük kabul istatistiği kaydedilemedi:",error);
  }
}

function confirmOfferLock(offer){
  return new Promise(resolve=>{
    document.getElementById("offerAcceptConfirmModal")?.remove();

    const validity=offerValidityText(offer);
    document.body.insertAdjacentHTML("beforeend",`
      <div class="offer-accept-confirm-modal" id="offerAcceptConfirmModal" role="dialog" aria-modal="true" aria-labelledby="offerAcceptConfirmTitle">
        <div class="offer-accept-confirm-card">
          <button type="button" class="offer-accept-confirm-close" data-accept-confirm-cancel aria-label="Kapat">×</button>
          <div class="offer-accept-confirm-icon">✓</div>
          <span class="offer-accept-confirm-kicker">SON ONAY</span>
          <h2 id="offerAcceptConfirmTitle">Teklif detaylarını kontrol edin</h2>
          <p class="offer-accept-confirm-lead">Onay verdiğiniz anda bu teklif kapanır. Kabul edilen fiyat ve şartlar sabitlenir; satıcı artık teklifi düzenleyemez.</p>

          <div class="offer-accept-confirm-grid">
            <div><span>Kurum</span><strong>${safe(offer.institutionName||"Kurum")}</strong></div>
            <div><span>Fiyat</span><strong>${money(offer.price)}</strong></div>
            <div><span>Geçerlilik</span><strong>${safe(validity)}</strong></div>
            <div><span>Son geçerlilik</span><strong>${fmtDate(offer.expiresAt)}</strong></div>
            <div><span>KDV</span><strong>${safe(offer.vatStatus||"-")}</strong></div>
            <div><span>Ek ücret</span><strong>${safe(offer.extraFee||"Yok")}</strong></div>
          </div>

          <div class="offer-accept-confirm-scope">
            <span>Teklif kapsamı</span>
            <strong>${safe(offer.scope||"-")}</strong>
          </div>
          ${offer.conditions?`<div class="offer-accept-confirm-scope"><span>Özel şart</span><strong>${safe(offer.conditions)}</strong></div>`:""}

          <div class="offer-accept-confirm-warning">
            <strong>Önemli</strong>
            <span>Dijiyer üzerinden ödeme yapılmaz. Ödeme veya kapora yalnızca müşteri ile kurum arasında doğrudan yapılır.</span>
          </div>

          <label class="offer-accept-confirm-check">
            <input type="checkbox" id="offerAcceptFinalConsent">
            <span>Yukarıdaki fiyatı, kapsamı, süreyi ve ödeme bilgisini kontrol ettim. Bu teklifi kabul etmek istiyorum.</span>
          </label>

          <div class="offer-accept-confirm-actions">
            <button type="button" class="secondary" data-accept-confirm-cancel>Vazgeç</button>
            <button type="button" class="primary" id="offerAcceptFinalButton" disabled>Teklifi Onayla ve Kapat</button>
          </div>
        </div>
      </div>
    `);

    const modal=document.getElementById("offerAcceptConfirmModal");
    const consent=document.getElementById("offerAcceptFinalConsent");
    const approve=document.getElementById("offerAcceptFinalButton");
    let settled=false;

    const finish=value=>{
      if(settled)return;
      settled=true;
      document.removeEventListener("keydown",onKeydown);
      modal?.remove();
      resolve(value);
    };
    const onKeydown=event=>{
      if(event.key==="Escape")finish(false);
    };

    consent?.addEventListener("change",()=>{
      if(approve)approve.disabled=!consent.checked;
    });
    approve?.addEventListener("click",()=>finish(true));
    modal?.querySelectorAll("[data-accept-confirm-cancel]").forEach(button=>{
      button.addEventListener("click",()=>finish(false));
    });
    modal?.addEventListener("click",event=>{
      if(event.target===modal)finish(false);
    });
    document.addEventListener("keydown",onKeydown);
  });
}
async function lockOffer(quoteId,institutionId,button){
  if(acceptInProgress){
    toast("Teklif kabul işlemi devam ediyor.");
    return;
  }

  const quoteRef=db.collection("quoteRequests").doc(quoteId);
  const offerRef=quoteRef.collection("offers").doc(institutionId);
  const lockRef=quoteRef.collection("locks").doc("main");
  let acceptanceControls=[];

  acceptInProgress=true;
  try{
    if(liveLock || localAcceptedQuote(quoteId)){
      toast("Bu talep için teklif zaten kabul edildi.");
      renderLiveTracking();
      return;
    }

    let previewOffer=liveOffers.find(offer=>String(offer.institutionId||offer.id||"")===String(institutionId))||null;
    if(!previewOffer){
      const previewSnap=await offerRef.get();
      if(!previewSnap.exists){ toast("Teklif bulunamadı."); return; }
      previewOffer={id:previewSnap.id,...previewSnap.data()};
    }

    if(!(await confirmOfferLock(previewOffer)))return;

    acceptanceControls=[...results.querySelectorAll("[data-lock], [data-lock-consent], [data-djy-compare-lock]")];
    acceptanceControls.forEach(control=>{ control.disabled=true; });
    button.disabled=true;
    button.textContent="Kabul ediliyor...";

    const publicLockedAt=new Date().toISOString();
    const lockData={
      quoteId,
      institutionId:String(previewOffer.institutionId||institutionId),
      institutionName:previewOffer.institutionName||"Kurum",
      offerCode:previewOffer.offerCode,
      price:Number(previewOffer.price),
      lockedPrice:Number(previewOffer.price),
      vatStatus:previewOffer.vatStatus||"",
      scope:previewOffer.scope||"",
      lockedScope:previewOffer.scope||"",
      conditions:previewOffer.conditions||"",
      extraFee:previewOffer.extraFee||"Yok",
      offerCreatedAt:previewOffer.createdAt||"",
      offerUpdatedAt:previewOffer.updatedAt||previewOffer.createdAt||"",
      offerVersion:Math.max(1,Number(previewOffer.offerVersion||1)),
      offerSnapshotVersion:1,
      trackingCode:String(currentAccess?.trackingCode||""),
      phoneHash:String(currentAccess?.phoneHash||""),
      acceptanceConsent:true,
      status:"locked",
      registrationStatus:"pending",
      acceptedAt:publicLockedAt,
      acceptedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
      lockedAt:publicLockedAt,
      lockedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt:previewOffer.expiresAt,
      expiresAtTs:previewOffer.expiresAtTs,
      registrationDeadlineAt:previewOffer.expiresAt,
      registrationDeadlineAtTs:previewOffer.expiresAtTs,
      platformPayment:false,
      paymentPolicy:"offline_direct_between_customer_and_institution"
    };

    const batch=db.batch();
    batch.set(lockRef,lockData);
    batch.update(quoteRef,{
      status:"accepted",
      acceptedInstitutionId:String(previewOffer.institutionId||institutionId),
      acceptedInstitutionName:String(previewOffer.institutionName||"Kurum"),
      acceptedOfferCode:String(previewOffer.offerCode||""),
      acceptedPrice:Number(previewOffer.price),
      acceptedAt:publicLockedAt,
      acceptedAtTs:firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();

    liveLock={
      ...lockData,
      acceptedAt:publicLockedAt,
      lockedAt:publicLockedAt
    };

    markQuoteAcceptedLocally(quoteId,liveLock);
    renderLiveTracking();

    if(currentAccess?.quoteId===quoteId){
      startAcceptedLockTracking(currentAccess);
    }

    recordPublicAcceptedEvent(quoteId,publicLockedAt);
    toast("✓ Teklif kabul edildi ve kapatıldı.");
  }catch(error){
    console.error(error);

    acceptanceControls.forEach(control=>{ control.disabled=false; });
    const code=String(error?.code||"");

    if(code.includes("permission-denied")){
      try{
        const freshLockSnap=await lockRef.get();
        if(freshLockSnap.exists){
          liveLock=freshLockSnap.data();
          markQuoteAcceptedLocally(quoteId,liveLock);
          renderLiveTracking();
          if(currentAccess?.quoteId===quoteId)startAcceptedLockTracking(currentAccess);
          toast("Bu talep için teklif zaten kabul edildi.");
          return;
        }
      }catch(_){}
      toast("Teklif kabul edilemedi. Teklif güncellenmiş, süresi dolmuş veya talep kapanmış olabilir.");
    }else if(code.includes("resource-exhausted")){
      toast("Firestore geçici olarak yoğun. Birkaç saniye sonra tekrar deneyin.");
    }else{
      toast(error.message||"Teklif kabul edilemedi.");
    }
  }finally{
    acceptInProgress=false;
    if(document.body.contains(button) && !liveLock){
      button.disabled=false;
      button.textContent="✓ Teklifi Kabul Et";
    }
  }
}

function ensureOfferIssueModal(){
  if(document.getElementById("offerIssueModal"))return;

  document.body.insertAdjacentHTML("beforeend",`
    <div class="offer-issue-modal hidden" id="offerIssueModal">
      <div class="offer-issue-card">
        <button type="button" class="offer-issue-close" id="offerIssueClose" aria-label="Kapat">×</button>

        <div class="offer-issue-icon">⚠</div>
        <h2>Teklifle İlgili Sorun Bildir</h2>
        <p class="offer-issue-intro">
          Sorunu seçin. Bildirim doğrudan firmayı suçlu ilan etmez; durum kayıt altına alınır ve gerektiğinde incelenir.
        </p>

        <form id="offerIssueForm">
          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Firma kabul edilen fiyatı uygulamadı" required>
            <span><strong>Firma kabul edilen fiyatı uygulamadı</strong><small>Kabul kaydındaki fiyat yerine farklı bir fiyat istendi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Ek ücret istendi">
            <span><strong>Ek ücret istendi</strong><small>Teklifte belirtilmeyen ek bir ödeme talep edildi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Teklif kapsamı değiştirildi">
            <span><strong>Teklif kapsamı değiştirildi</strong><small>Kabul edilen hizmet veya ürün kapsamı sonradan değiştirildi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Hizmet verilmek istenmedi">
            <span><strong>Hizmet verilmek istenmedi</strong><small>Geçerli ve kabul edilmiş teklif olmasına rağmen hizmet reddedildi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Diğer">
            <span><strong>Diğer</strong><small>Yukarıdakiler dışında bir sorun yaşadım.</small></span>
          </label>

          <label class="offer-issue-detail">
            Açıklama <span>(opsiyonel)</span>
            <textarea id="offerIssueDetail" maxlength="500" rows="3" placeholder="Sorunu kısaca açıklayın."></textarea>
          </label>

          <div class="offer-issue-fairness">
            <strong>Adil değerlendirme</strong>
            <span>Bildirim; teklif kodu, kabul edilen fiyat ve şartlarla birlikte değerlendirilir. Tek taraflı beyan otomatik ceza oluşturmaz.</span>
          </div>

          <button type="submit" class="offer-issue-submit">Bildirimi Gönder</button>
        </form>
      </div>
    </div>
  `);

  const modal=document.getElementById("offerIssueModal");
  document.getElementById("offerIssueClose").onclick=()=>modal.classList.add("hidden");
  modal.addEventListener("click",event=>{
    if(event.target===modal)modal.classList.add("hidden");
  });
}

let pendingIssueContext=null;

function openOfferIssueModal(quoteId,offerCode){
  ensureOfferIssueModal();
  pendingIssueContext={quoteId,offerCode};

  const form=document.getElementById("offerIssueForm");
  form.reset();
  document.getElementById("offerIssueModal").classList.remove("hidden");

  form.onsubmit=async event=>{
    event.preventDefault();

    const selected=form.querySelector('input[name="issueReason"]:checked');
    if(!selected){
      toast("Lütfen sorun türünü seçin.");
      return;
    }

    const detail=String(document.getElementById("offerIssueDetail").value||"").trim();
    const reason=detail
      ? selected.value+" — "+detail
      : selected.value;

    const submit=form.querySelector('button[type="submit"]');
    submit.disabled=true;
    submit.textContent="Gönderiliyor...";

    try{
      await reportIssue(pendingIssueContext.quoteId,pendingIssueContext.offerCode,reason);
      document.getElementById("offerIssueModal").classList.add("hidden");
    }finally{
      submit.disabled=false;
      submit.textContent="Bildirimi Gönder";
    }
  };
}

async function reportIssue(quoteId,offerCode,reason){
  const cleanReason=String(reason||"").trim().slice(0,500);
  if(!cleanReason)return;

  try{
    await db.collection("quoteRequests").doc(quoteId).collection("offerIssues").add({
      offerCode,
      reason:cleanReason,
      status:"new",
      date:new Date().toISOString()
    });
    toast("Sorun bildiriminiz alındı.");
  }catch(error){
    console.error(error);
    toast("Bildirim gönderilemedi.");
    throw error;
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

  document.querySelectorAll("[data-response-countdown]").forEach(el=>{
    const target=new Date(el.dataset.responseCountdown).getTime();
    const diff=Math.max(0,target-Date.now());
    if(!Number.isFinite(target)){el.textContent="-";return;}
    if(!diff){el.textContent="Yanıt süresi doldu";return;}

    const totalMinutes=Math.max(1,Math.ceil(diff/60000));
    if(totalMinutes>=1440){
      const d=Math.floor(totalMinutes/1440);
      const h=Math.floor((totalMinutes%1440)/60);
      el.textContent=d+" gün"+(h?" "+h+" saat":"");
      return;
    }
    if(totalMinutes>=60){
      const h=Math.floor(totalMinutes/60);
      const m=totalMinutes%60;
      el.textContent=h+" saat"+(m?" "+m+" dk":"");
      return;
    }
    el.textContent=totalMinutes+" dakika";
  });
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const code=normalizeCode(codeInput.value);
  const phone=phoneInput.value;
  if(!code){message.textContent="Takip kodunu girin.";return;}

  submitBtn.disabled=true;submitBtn.textContent="Kontrol ediliyor...";message.textContent="";
  try{
    try{
      currentAccess=await verifyAccess(code,phone);
    }catch(error){
      console.error("Takip erişim belgesi okunamadı:",error);
      const rawMessage=String(error?.message||"");
      if(/missing or insufficient permissions/i.test(rawMessage)){
        throw new Error("Takip kodu doğrulanamadı. Lütfen takip kodunu ve telefon numarasını kontrol edin.");
      }
      throw error;
    }

    const normalizedTrackingPhone=normalizePhone(phone);
    sessionStorage.setItem("dijiyerTrackingCode",code);
    sessionStorage.setItem("dijiyerTrackingPhone",normalizedTrackingPhone);
    try{
      const phoneMap=JSON.parse(localStorage.getItem("dijiyerTrackingPhoneByCode")||"{}");
      phoneMap[code]=normalizedTrackingPhone;
      localStorage.setItem("dijiyerTrackingPhoneByCode",JSON.stringify(phoneMap));
    }catch(_){}
    rememberVerifiedQuoteOnDevice(currentAccess);

    let initialBundle;
    try{
      initialBundle=await loadBundle(currentAccess);
    }catch(error){
      console.error("Teklif takip verileri okunamadı:",error);
      throw error;
    }

    liveOffers=initialBundle.offers;
    liveOfferHistory=initialBundle.offerHistory||[];
    liveLock=initialBundle.lock;
    liveEngagement=initialBundle.engagement||[];
    livePublicStatus=initialBundle.publicStatus||null;
    offerListenerInitialized=false;
      offerUpdateVersions.clear();
      renderLiveTracking();
    if(initialBundle.lock){
      startAcceptedLockTracking(currentAccess);
    }else{
      startLiveTracking(currentAccess);
    }

    document.getElementById("trackingLoginCard").classList.add("hidden");
  }catch(error){
    console.error(error);
    message.textContent=String(error?.message||"Teklifler açılamadı.");
  }finally{
    submitBtn.disabled=false;submitBtn.textContent="Tekliflerimi Göster";
  }
});

const urlCode=normalizeCode(new URLSearchParams(location.search).get("kod")||"");
const rememberedCode=normalizeCode(sessionStorage.getItem("dijiyerTrackingCode")||localStorage.getItem("dijiyerLastTrackingCode")||"");
const activePrefillCode=urlCode||rememberedCode;

if(activePrefillCode)codeInput.value=activePrefillCode;

let rememberedPhone=String(sessionStorage.getItem("dijiyerTrackingPhone")||"").trim();

if(!rememberedPhone && activePrefillCode){
  try{
    const phoneMap=JSON.parse(localStorage.getItem("dijiyerTrackingPhoneByCode")||"{}");
    rememberedPhone=String(phoneMap[activePrefillCode]||"").trim();
  }catch(_){}
}

if(!rememberedPhone && activePrefillCode){
  try{
    const savedQuotes=JSON.parse(localStorage.getItem("dijiyerCustomerQuoteData")||"{}");
    const matching=Object.values(savedQuotes).find(row=>
      normalizeCode(row?.trackingCode||"")===activePrefillCode
    );
    rememberedPhone=normalizePhone(matching?.phone||"");
  }catch(_){}
}

if(rememberedPhone){
  phoneInput.value=rememberedPhone.length===10 ? "0"+rememberedPhone : rememberedPhone;
}

ensureTrackingInputsInteractive();
setInterval(updateCountdowns,60000);

// Canlı onSnapshot dinleyicileri güncellemeleri zaten anında getirir.
// 15 saniyelik ek polling ve sekmeye dönünce otomatik toplu okuma kaldırıldı.
window.addEventListener("beforeunload",stopLiveTracking);
