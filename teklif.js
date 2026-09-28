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
const offerUpdateVersions=new Map();
let offerListenerInitialized=false;
let offerSortMode=localStorage.getItem("dijiyerOfferSortMode")||"arrival";

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
  if(h===72)return "3 gün";
  if(h===168)return "7 gün";
  if(h>24 && h%24===0)return (h/24)+" gün";
  return h ? h+" saat" : "belirtilen süre";
}
function acceptanceTermsHtml(offer){
  const validity=offerValidityText(offer);
  return `
    <div class="offer-acceptance-box">
      <div class="offer-acceptance-title">Teklifi kabul etme şartları</div>
      <div class="offer-acceptance-grid">
        <div><span>Fiyat</span><strong>${money(offer.price)}</strong></div>
        <div><span>Geçerlilik</span><strong>${safe(validity)}</strong></div>
        <div><span>Son kabul</span><strong>${fmtDate(offer.expiresAt)}</strong></div>
        <div><span>KDV</span><strong>${safe(offer.vatStatus||"-")}</strong></div>
        <div><span>Ek ücret</span><strong>${safe(offer.extraFee||"Yok")}</strong></div>
      </div>
      <div class="offer-acceptance-warning">
        ⏱ Bu fiyat <b>${safe(validity)}</b> için geçerlidir. Bu süre içinde fiyatı kilitlemezseniz teklif geçersiz olur.
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
      const nextOffers=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));

      if(offerListenerInitialized){
        snapshot.docChanges().forEach(change=>{
          if(change.type!=="modified")return;
          const offer={id:change.doc.id,...change.doc.data()};
          const previousVersion=offerUpdateVersions.get(change.doc.id)||"";
          const nextVersion=String(offer.updatedAt||"");

          if(nextVersion && nextVersion!==previousVersion){
            toast(
              (offer.institutionName||"Kurum")+
              " teklifini güncelledi: "+
              money(offer.price)+
              " · "+
              offerValidityText(offer)+
              " geçerli"
            );
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
      <div class="locked-terms-box">
        <strong>Kilitlenen şartlar</strong>
        <div><span>Fiyat</span><b>${money(lock.price)}</b></div>
        <div><span>KDV</span><b>${safe(lock.vatStatus||"-")}</b></div>
        <div><span>Son geçerlilik</span><b>${fmtDate(lock.expiresAt)}</b></div>
        ${lock.conditions?`<div><span>Özel şart</span><b>${safe(lock.conditions)}</b></div>`:""}
        <p>Bu kayıt kilitlendikten sonra firma fiyatı ve şartları değiştiremez.</p>
      </div>
      <div id="lockedQr" class="qr-box" data-url="${safe(verifyUrl)}"></div>
      <div class="countdown" data-countdown="${safe(lock.expiresAt||"")}"></div>
      ${state==="locked"?`<div class="offer-actions" style="justify-content:center"><button class="report-btn" data-report>⚠ Teklifle İlgili Sorun Bildir</button></div>`:""}
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
      <div class="offer-updated-meta">
        ${offer.updatedAt && offer.createdAt && offer.updatedAt!==offer.createdAt
          ? "🔔 Teklif güncellendi · "+fmtDate(offer.updatedAt)
          : "Teklif tarihi · "+fmtDate(offer.createdAt)}
      </div>

      <div class="offer-scope">
        <b>Teklif kapsamı</b><br>${safe(offer.scope||"")}
      </div>

      ${acceptanceTermsHtml(offer)}

      ${state==="offered"
        ? `<div class="offer-actions"><button class="lock-btn accept-lock-btn" data-lock data-institution-id="${safe(offer.institutionId)}">✓ Şartları Kabul Et ve Fiyatı Kilitle</button></div>`
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
function render(bundle){
  const access=bundle.access;
  const offers=sortOffersForCustomer(bundle.offers);
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

    ${bundle.lock?lockedHtml(bundle):`<h2 class="offers-title">Gelen Teklifler (${offers.length})</h2>${offerFairnessToolbarHtml(offers.length)}${offers.length?offers.map(o=>offerHtml(bundle,o)).join(""):'<div class="empty">Henüz teklif gelmedi. Kurumlar fiyat gönderdiğinde burada görünecek.</div>'}`}
  `;

  const sortSelect=document.getElementById("offerSortSelect");
  if(sortSelect){
    sortSelect.onchange=()=>{
      offerSortMode=sortSelect.value;
      localStorage.setItem("dijiyerOfferSortMode",offerSortMode);
      renderLiveTracking();
    };
  }

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
  if(report)report.addEventListener("click",()=>openOfferIssueModal(access.quoteId,bundle.lock.offerCode));
  drawQr();
  updateCountdowns();
}

function confirmOfferLock(offer){
  const validity=offerValidityText(offer);
  const lines=[
    "Bu teklifi kabul edip fiyatı kilitlemek üzeresiniz.",
    "",
    "Firma: "+(offer.institutionName||"Kurum"),
    "Fiyat: "+money(offer.price),
    "Geçerlilik: "+validity,
    "Son kabul: "+fmtDate(offer.expiresAt),
    "KDV: "+(offer.vatStatus||"-")
  ];
  if(offer.conditions)lines.push("Özel şart: "+offer.conditions);
  lines.push("", "Kilitledikten sonra firma bu teklifin fiyatını ve şartlarını değiştiremez.", "Devam etmek istiyor musunuz?");
  return window.confirm(lines.join("\n"));
}
async function lockOffer(quoteId,institutionId,button){
  const quoteRef=db.collection("quoteRequests").doc(quoteId);
  const offerRef=quoteRef.collection("offers").doc(institutionId);
  const lockRef=quoteRef.collection("locks").doc("main");
  try{
    const previewSnap=await offerRef.get();
    if(!previewSnap.exists){ toast("Teklif bulunamadı."); return; }
    const previewOffer=previewSnap.data();
    if(!confirmOfferLock(previewOffer))return;
    button.disabled=true;
    button.textContent="Kilitleniyor...";

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
    button.disabled=false;button.textContent="✓ Şartları Kabul Et ve Fiyatı Kilitle";
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
            <input type="radio" name="issueReason" value="Firma kilitlenen fiyatı kabul etmedi" required>
            <span><strong>Firma kilitlenen fiyatı kabul etmedi</strong><small>Kilitlenen fiyat yerine farklı bir fiyat istendi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Ek ücret istendi">
            <span><strong>Ek ücret istendi</strong><small>Teklifte belirtilmeyen ek bir ödeme talep edildi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Teklif kapsamı değiştirildi">
            <span><strong>Teklif kapsamı değiştirildi</strong><small>Kilitlenen hizmet veya ürün kapsamı sonradan değiştirildi.</small></span>
          </label>

          <label class="offer-issue-option">
            <input type="radio" name="issueReason" value="Hizmet verilmek istenmedi">
            <span><strong>Hizmet verilmek istenmedi</strong><small>Geçerli ve kilitli teklif olmasına rağmen hizmet reddedildi.</small></span>
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
            <span>Bildirim; teklif kodu, kilitlenen fiyat ve şartlarla birlikte değerlendirilir. Tek taraflı beyan otomatik ceza oluşturmaz.</span>
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