let institutionOfferMap = new Map();
let institutionLockMap = new Map();
let institutionSecondOfferInviteMap = new Map();
let institutionArchivedQuoteIds = new Set();
let institutionLeadCreditBalance = 0;
let institutionOfferStateWatchers = new Map();

function offerStateFingerprint(value){
  if(!value)return "";
  return JSON.stringify({
    institutionId:String(value.institutionId||""),
    status:String(value.status||""),
    price:Number(value.price||0),
    offerCode:String(value.offerCode||""),
    offerVersion:Number(value.offerVersion||1),
    acceptedAt:String(value.acceptedAt||value.lockedAt||""),
    usedAt:String(value.usedAt||""),
    expiresAt:String(value.expiresAt||""),
    decision:String(value.decision||"")
  });
}

function stopInstitutionOfferStateWatchers(){
  institutionOfferStateWatchers.forEach(stop=>{
    try{ stop(); }catch(_){}
  });
  institutionOfferStateWatchers.clear();
}

// Yalnız kabul kilidi ve 2. teklif daveti canlı izlenir.
// Kurumun kendi teklifini ayrıca onSnapshot ile dinlemiyoruz; kaydetme sonrası local map güncelleniyor.
function syncInstitutionOfferStateWatchers(){
  const currentInstitutionId=String(currentAccount?.institutionId||"");
  if(!currentInstitutionId)return;

  const activeQuoteIds=new Set(quoteRecords.map(quote=>String(quote.id)));

  institutionOfferStateWatchers.forEach((stop,quoteId)=>{
    if(activeQuoteIds.has(String(quoteId)))return;
    try{ stop(); }catch(_){}
    institutionOfferStateWatchers.delete(quoteId);
  });

  quoteRecords.forEach(quote=>{
    const quoteId=String(quote.id);
    if(!quoteId || institutionOfferStateWatchers.has(quoteId))return;

    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    const unsubscribers=[];

    unsubscribers.push(
      quoteRef.collection("locks").doc("main").onSnapshot(snapshot=>{
        const before=institutionLockMap.get(quoteId)||null;
        const after=snapshot.exists ? snapshot.data() : null;
        if(after)institutionLockMap.set(quoteId,after);
        else institutionLockMap.delete(quoteId);

        if(offerStateFingerprint(before)!==offerStateFingerprint(after)){
          const ownOffer=institutionOfferMap.get(quoteId)||null;
          const belongsHere=after && institutionLockBelongsToCurrentInstitution(after,ownOffer);

          if(belongsHere){
            const quote=quoteRecords.find(item=>String(item.id)===quoteId);
            if(quote){
              quote.status="accepted";
              quote.acceptedInstitutionId=String(after.institutionId||currentInstitutionId);
              quote.acceptedInstitutionName=String(after.institutionName||currentInstitution?.name||"Kurum");
              quote.acceptedOfferCode=String(after.offerCode||ownOffer?.offerCode||"");
              quote.acceptedPrice=Number(after.price||ownOffer?.price||0);
              quote.acceptedAt=String(after.acceptedAt||after.lockedAt||new Date().toISOString());
            }
          }

          if(!before && belongsHere){
            try{ showToast("✓ Müşteri teklifinizi kabul etti. Teklif kapatıldı ve artık düzenlenemez."); }catch(_){}
          }
          renderQuotes();
          renderSummary();
        }
      },error=>{
        console.warn("Kabul/kilit durumu canlı izlenemedi:",quoteId,error);
      })
    );



    unsubscribers.push(
      quoteRef.collection("secondOfferInvites").doc(currentInstitutionId).onSnapshot(snapshot=>{
        const before=institutionSecondOfferInviteMap.get(quoteId)||null;
        const after=snapshot.exists ? {id:snapshot.id,...snapshot.data()} : null;
        if(after)institutionSecondOfferInviteMap.set(quoteId,after);
        else institutionSecondOfferInviteMap.delete(quoteId);

        if(offerStateFingerprint(before)!==offerStateFingerprint(after)){
          renderQuotes();
        }
      },error=>{
        console.warn("2. teklif daveti canlı izlenemedi:",quoteId,error);
      })
    );

    institutionOfferStateWatchers.set(quoteId,()=>{
      unsubscribers.forEach(unsubscribe=>{
        try{ unsubscribe(); }catch(_){}
      });
    });
  });
}

window.stopInstitutionOfferStateWatchers=stopInstitutionOfferStateWatchers;
window.addEventListener("beforeunload",stopInstitutionOfferStateWatchers);

// Canlı lock ve ikinci teklif dinleyicileri zaten açıkken sekmeye dönüldüğünde
// tekrar toplu .get() çalıştırmıyoruz. Bu, Firestore okuma sayısını ciddi azaltır.

function institutionArchiveDocId(quoteId){
  return String(currentAccount?.institutionId||"")+"__"+String(quoteId||"");
}

function institutionArchiveStorageKey(){
  return "dijiyerInstitutionQuoteArchive:"+String(currentAccount?.institutionId||"");
}

function readInstitutionArchiveLocal(){
  try{
    const raw=localStorage.getItem(institutionArchiveStorageKey());
    const rows=raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(rows)?rows.map(String):[]);
  }catch(_){
    return new Set();
  }
}

function writeInstitutionArchiveLocal(){
  try{
    localStorage.setItem(
      institutionArchiveStorageKey(),
      JSON.stringify([...institutionArchivedQuoteIds])
    );
  }catch(_){}
}

function institutionQuoteIsArchived(quoteId){
  return institutionArchivedQuoteIds.has(String(quoteId||""));
}

async function loadInstitutionQuoteArchive(){
  institutionArchivedQuoteIds=readInstitutionArchiveLocal();
  const institutionId=String(currentAccount?.institutionId||"");
  if(!institutionId)return;

  try{
    const snap=await db.collection("institutionQuoteArchive")
      .where("institutionId","==",institutionId)
      .get();

    snap.forEach(doc=>{
      const data=doc.data()||{};
      const quoteId=String(data.quoteId||"");
      if(!quoteId)return;
      if(data.archived===true)institutionArchivedQuoteIds.add(quoteId);
      if(data.archived===false)institutionArchivedQuoteIds.delete(quoteId);
    });
    writeInstitutionArchiveLocal();
  }catch(error){
    console.warn("Firestore arşiv senkronizasyonu kullanılamıyor; yerel arşiv kullanılacak:",error);
  }
}

async function setInstitutionQuoteArchived(quoteId,archived){
  const id=String(quoteId||"");
  const institutionId=String(currentAccount?.institutionId||"");
  if(!id||!institutionId)return;

  const quote=quoteRecords.find(item=>String(item.id)===id);
  const state=quote ? sellerOfferState(quote) : "";
  if(archived && (state==="locked" || state==="used")){
    alert("Kabul edilmiş teklifler arşivlenemez. Bu kayıt kurum panelinde kalmalıdır.");
    return;
  }

  if(archived){
    const ok=window.confirm("Bu talebi teklif listenizden kaldırmak istiyor musunuz? Sistem kaydı silinmez; Arşiv bölümünden geri getirebilirsiniz.");
    if(!ok)return;
    institutionArchivedQuoteIds.add(id);
  }else{
    institutionArchivedQuoteIds.delete(id);
  }

  writeInstitutionArchiveLocal();
  renderQuotes();
  renderSummary();

  try{
    const ref=db.collection("institutionQuoteArchive").doc(institutionArchiveDocId(id));
    await ref.set({
      institutionId,
      quoteId:id,
      archived:Boolean(archived),
      archivedAt:archived ? new Date().toISOString() : "",
      restoredAt:archived ? "" : new Date().toISOString(),
      updatedAt:new Date().toISOString()
    },{merge:true});
  }catch(error){
    console.warn("Arşiv Firestore'a kaydedilemedi; bu tarayıcıda yerel olarak saklandı:",error);
  }

  try{
    showToast(archived ? "Talep arşive alındı." : "Talep tekrar listeye alındı.");
  }catch(_){}
}

function visibleInstitutionQuoteRecords(){
  return quoteRecords.filter(quote=>!institutionQuoteIsArchived(quote.id));
}

function isRoutedLeadForCurrentInstitution(quote){
  const institutionId=String(currentAccount?.institutionId||"");
  if(!institutionId)return false;

  const forwarded=Array.isArray(quote?.forwardInstitutionIds)
    ? quote.forwardInstitutionIds.map(String)
    : [];

  return forwarded.includes(institutionId)
    && String(quote?.targetInstitutionId||"")!==institutionId;
}

async function refreshInstitutionLeadCreditBalance(){
  const institutionId=String(currentAccount?.institutionId||"");
  if(!institutionId){
    institutionLeadCreditBalance=0;
    return 0;
  }

  try{
    const snap=await db.collection("leadCreditAccounts").doc(institutionId).get();
    institutionLeadCreditBalance=snap.exists
      ? Number(snap.data()?.balance||0)
      : 0;
  }catch(error){
    console.warn("Teklif kredisi okunamadı:",error);
    institutionLeadCreditBalance=0;
  }

  return institutionLeadCreditBalance;
}

function offerSafe(v){
  return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function offerMoney(v){ return new Intl.NumberFormat("tr-TR").format(Number(v || 0)) + " TL"; }
function makeOfferCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes=new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out="DJY-";
  for(let i=0;i<bytes.length;i++) out+=chars[bytes[i]%chars.length];
  return out;
}
function offerValidityHours(offer){
  if(!offer?.expiresAt)return 48;
  const start=offer.updatedAt || offer.createdAt;
  if(!start)return 48;
  const diff=new Date(offer.expiresAt).getTime()-new Date(start).getTime();
  if(!Number.isFinite(diff)||diff<=0)return 48;
  return Math.max(1,Math.round(diff/3600000));
}
function offerValidityLabel(hours){
  const h=Number(hours||0);
  if(h===1)return "1 saat";
  if(h===3)return "3 saat";
  if(h===12)return "12 saat";
  if(h===24)return "24 saat";
  if(h===48)return "2 gün";
  if(h===72)return "3 gün";
  if(h===168)return "7 gün";
  if(h>24 && h%24===0)return (h/24)+" gün";
  return h+" saat";
}

function offerRemainingLabel(expiresAt){
  if(!expiresAt) return "-";
  const diff=new Date(expiresAt).getTime()-Date.now();
  if(!Number.isFinite(diff)) return "-";
  if(diff<=0) return "Süre doldu";
  const totalMinutes=Math.ceil(diff/60000);
  const days=Math.floor(totalMinutes/1440);
  const hours=Math.floor((totalMinutes%1440)/60);
  const minutes=totalMinutes%60;
  if(days>0) return days+" gün "+hours+" saat";
  if(hours>0) return hours+" saat "+minutes+" dk";
  return minutes+" dk";
}

function institutionQuoteIsTerminal(quote){
  const status=String(quote?.status||"").trim().toLowerCase();
  return ["done","archived","closed","accepted","cancelled","canceled","completed","used"].includes(status);
}

function institutionOfferBelongsToCurrentInstitution(offer,docId=""){
  const institutionId=String(currentAccount?.institutionId||"");
  if(!institutionId)return false;
  return String(docId||"")===institutionId
    || String(offer?.institutionId||"")===institutionId;
}

function institutionLockBelongsToCurrentInstitution(lock,offer=null){
  const institutionId=String(currentAccount?.institutionId||"");
  if(!lock||!institutionId)return false;
  if(String(lock.institutionId||"")===institutionId)return true;

  // Eski kayıt uyumluluğu: kabul kaydındaki kurum id eski formatta olsa bile
  // aynı teklif kodu bu kurumun teklifine aitse kilidi bu kuruma bağla.
  const lockCode=String(lock.offerCode||"");
  const offerCode=String(offer?.offerCode||"");
  return Boolean(lockCode && offerCode && lockCode===offerCode);
}

function institutionAcceptedByCurrentInstitution(quote){
  const institutionId=String(currentAccount?.institutionId||"");
  if(!quote||!institutionId)return false;
  return String(quote.acceptedInstitutionId||"")===institutionId
    && String(quote.status||"").toLowerCase()==="accepted";
}

function institutionEffectiveLock(quote){
  const quoteId=String(quote?.id||"");
  const realLock=institutionLockMap.get(quoteId)||null;
  if(realLock)return realLock;

  // Talep ve locks/main aynı transaction içinde yazılıyor. Çok kısa süreli
  // dinleyici gecikmesinde accepted alanları gelmiş ama lock henüz local map'e
  // düşmemiş olabilir. Bu durumda kabul bilgisini panelde kaybetme.
  if(!institutionAcceptedByCurrentInstitution(quote))return null;

  const offer=institutionOfferMap.get(quoteId)||null;
  return {
    quoteId,
    institutionId:String(quote.acceptedInstitutionId||currentAccount?.institutionId||""),
    institutionName:String(quote.acceptedInstitutionName||offer?.institutionName||currentInstitution?.name||"Kurum"),
    offerCode:String(quote.acceptedOfferCode||offer?.offerCode||""),
    price:Number(quote.acceptedPrice ?? offer?.price ?? 0),
    lockedPrice:Number(quote.acceptedPrice ?? offer?.price ?? 0),
    vatStatus:String(offer?.vatStatus||""),
    scope:String(offer?.scope||quote.note||quote.service||""),
    lockedScope:String(offer?.scope||quote.note||quote.service||""),
    conditions:String(offer?.conditions||""),
    extraFee:String(offer?.extraFee||"Yok"),
    extraFeeAmount:Number(offer?.extraFeeAmount||0),
    extraFeeRequired:String(offer?.extraFeeRequired||""),
    extraFeeNote:String(offer?.extraFeeNote||""),
    acceptedAt:String(quote.acceptedAt||""),
    lockedAt:String(quote.acceptedAt||""),
    expiresAt:String(offer?.expiresAt||""),
    registrationDeadlineAt:String(offer?.expiresAt||""),
    status:"locked",
    registrationStatus:"pending",
    syntheticFromAcceptedRequest:true
  };
}

function institutionOfferVersion(offer){
  return Math.max(1,Number(offer?.offerVersion||1));
}

function institutionOfferSourceMeta(quote){
  if(isRoutedLeadForCurrentInstitution(quote)){
    return {type:"alternative",label:"Alternatif kurum teklifi"};
  }
  if(String(quote?.targetInstitutionId||"")===String(currentAccount?.institutionId||"")){
    return {type:"direct",label:"Seçilen kurum teklifi"};
  }
  return {type:"bulk",label:"Toplu teklif talebi"};
}

function secondOfferPromptHtml(quote,offer){
  if(!offer || institutionOfferVersion(offer)!==1)return "";
  if(institutionQuoteIsTerminal(quote))return "";

  const lock=institutionLockMap.get(quote.id);
  if(lock)return "";
  if(offer.expiresAt && new Date(offer.expiresAt).getTime()<=Date.now())return "";

  const invite=institutionSecondOfferInviteMap.get(String(quote.id));
  if(!invite || String(invite.status||"")!=="open" || String(invite.decision||""))return "";
  if(invite.expiresAt && new Date(invite.expiresAt).getTime()<=Date.now())return "";

  return `
    <div class="second-offer-prompt">
      <div class="second-offer-prompt-icon">↻</div>
      <div class="second-offer-prompt-copy">
        <span>2. TEKLİF FIRSATI</span>
        <strong>Teklifiniz henüz kabul edilmedi.</strong>
        <p>Müşteri henüz bir teklif seçmedi. Fiyatı veya şartları güncelleyerek 2. teklif vermek ister misiniz? Bu işlem için yeni teklif kredisi kullanılmaz.</p>
      </div>
      <div class="second-offer-prompt-actions">
        <button type="button" data-second-offer="${offerSafe(quote.id)}">2. Teklif Ver</button>
        <button type="button" class="secondary" data-second-offer-dismiss="${offerSafe(quote.id)}">Şimdilik Hayır</button>
      </div>
    </div>
  `;
}

function sellerOfferState(quote){
  const offer=institutionOfferMap.get(quote.id);
  const lock=institutionEffectiveLock(quote);
  const legacy=responseMap.get(quote.id);

  if(lock){
    if(institutionLockBelongsToCurrentInstitution(lock,offer)){
      if(lock.status === "used") return "used";
      if(lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now()) return "expired";
      return "locked";
    }
    return "closed";
  }
  if(institutionQuoteIsTerminal(quote)) return "closed";
  if(offer){
    return offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()
      ? "expired"
      : "offered";
  }
  if(legacy?.status === "not_interested") return "not_interested";
  return "new";
}
function sellerStateMeta(state){
  const map={
    new:["Yeni","status-new"],
    offered:["Teklif Verildi","status-interested"],
    locked:["Kabul Edildi","status-interested"],
    used:["Gerçek Kayıt","status-interested"],
    expired:["Süresi Doldu","status-not_interested"],
    closed:["Başka Teklif Seçildi","status-not_interested"],
    not_interested:["İlgilenmiyorum","status-not_interested"]
  };
  return map[state] || [state,"status-new"];
}

loadMatchedQuotes = async function(){
  institutionQuotesList.innerHTML = '<div class="empty-state">Teklifler yükleniyor...</div>';
  recentQuotes.innerHTML = '<div class="empty-state">Teklifler yükleniyor...</div>';

  try{
    quoteRecords = await fetchInstitutionMatchedQuotes();

    await Promise.all([
      loadQuoteResponses(),
      refreshInstitutionLeadCreditBalance(),
      loadInstitutionQuoteArchive()
    ]);

    institutionOfferMap = new Map();
    institutionLockMap = new Map();
    institutionSecondOfferInviteMap = new Map();

    await Promise.all(quoteRecords.map(async quote=>{
      const quoteRef=db.collection("quoteRequests").doc(quote.id);
      const [ownOfferSnap,lockSnap,inviteSnap]=await Promise.all([
        quoteRef.collection("offers").doc(String(currentAccount.institutionId)).get(),
        quoteRef.collection("locks").doc("main").get(),
        quoteRef.collection("secondOfferInvites").doc(String(currentAccount.institutionId)).get()
          .catch(error=>{
            console.warn("2. teklif daveti okunamadı:",quote.id,error);
            return null;
          })
      ]);

      if(ownOfferSnap?.exists){
        institutionOfferMap.set(quote.id,{id:ownOfferSnap.id,...ownOfferSnap.data()});
      }
      if(lockSnap.exists) institutionLockMap.set(quote.id,lockSnap.data());
      if(inviteSnap?.exists){
        institutionSecondOfferInviteMap.set(String(quote.id),{id:inviteSnap.id,...inviteSnap.data()});
      }
    }));

    institutionSecondOfferInviteMap.forEach((invite,quoteId)=>{
      if(String(invite.status||"")!=="open" || String(invite.decision||""))return;
      const quote=quoteRecords.find(item=>String(item.id)===String(quoteId));
      if(quote)showSecondOfferInviteNotice(quote,invite);
    });

    syncInstitutionOfferStateWatchers();
    renderQuotes();
    renderSummary();

    const code=new URLSearchParams(location.search).get("offer");
    if(code){
      setPanelTab("verify");
      const input=document.getElementById("verifyOfferCode");
      if(input) input.value=code.toUpperCase();
      await verifyOfferByCode(code);
    }
  }catch(error){
    console.error("Teklifler yüklenemedi:",error);
    institutionQuotesList.innerHTML='<div class="empty-state">Teklifler yüklenemedi. Firestore yetkisini kontrol edin.</div>';
    recentQuotes.innerHTML='<div class="empty-state">Teklifler yüklenemedi.</div>';
  }
};

getQuoteViewStatus = function(quote){
  return sellerOfferState(quote);
};

function renderFirmHomeOpportunities(){
  const countEl = document.getElementById("firmOpportunityCount");
  const listEl = document.getElementById("firmOpportunityList");
  if (!listEl) return;

  const visibleQuotes=visibleInstitutionQuoteRecords();
  const rows = visibleQuotes
    .filter(quote => sellerOfferState(quote) === "new")
    .slice(0, 4);

  if (countEl) {
    countEl.textContent = String(
      visibleQuotes.filter(quote => sellerOfferState(quote) === "new").length
    );
  }

  if (!rows.length) {
    listEl.innerHTML =
      '<div class="empty-state">Şu anda cevap bekleyen yeni bir talep yok. Yeni eşleşmeler geldiğinde burada görünecek.</div>';
    return;
  }

  listEl.innerHTML = rows.map(quote => {
    const place = [quote.city, quote.district].filter(Boolean).join(" / ") || "-";
    const note = String(quote.note || "").trim();
    return `
      <article class="firm-opportunity-item">
        <div class="firm-opportunity-main">
          <strong>${offerSafe(quote.service || "Teklif Talebi")}</strong>
          <div class="firm-opportunity-meta">
            <span>📍 ${offerSafe(place)}</span>
            <span>🕒 ${offerSafe(formatRelativeTime(quote.date))}</span>
          </div>
          ${note ? `<div class="firm-opportunity-note">${offerSafe(note)}</div>` : ""}
        </div>
        <button type="button" data-firm-opportunity="${offerSafe(quote.id)}">Teklif Ver</button>
      </article>
    `;
  }).join("");
}

renderSummary = function(){
  const visibleQuotes=visibleInstitutionQuoteRecords();
  const states = visibleQuotes.map(q => sellerOfferState(q));
  const newCount = states.filter(state => state === "new").length;
  const offeredCount = states.filter(state => state === "offered").length;
  const lockedCount = states.filter(state => state === "locked").length;
  const usedCount = states.filter(state => state === "used").length;
  const completedRegistrationCount = document.getElementById("completedRegistrationCount");
  if (completedRegistrationCount) completedRegistrationCount.textContent = String(usedCount);

  if (typeof updatePersistentNewRequestCard === "function") updatePersistentNewRequestCard(newCount);

  document.getElementById("newQuoteCount").textContent = newCount;
  document.getElementById("totalQuoteCount").textContent = visibleQuotes.length;
  document.getElementById("quoteTabCount").textContent = newCount;

  document.getElementById("workNewCount").textContent = newCount;
  document.getElementById("workLockedCount").textContent = lockedCount;
  document.getElementById("pendingQuoteCount").textContent = newCount;
  document.getElementById("offeredQuoteCount").textContent = offeredCount;
  document.getElementById("lockedQuoteCount").textContent = lockedCount;
  document.getElementById("latestQuoteTime").textContent =
    visibleQuotes.length ? formatRelativeTime(visibleQuotes[0].date) : "-";

  const firmHomeNewCount = document.getElementById("firmHomeNewCount");
  const firmHomeOfferedCount = document.getElementById("firmHomeOfferedCount");
  const firmHomeOfferStatus = document.getElementById("firmHomeOfferStatus");

  if (firmHomeNewCount) firmHomeNewCount.textContent = String(newCount);
  if (firmHomeOfferedCount) firmHomeOfferedCount.textContent = String(institutionOfferMap.size);

  if (firmHomeOfferStatus) {
    const enabled = currentInstitution?.offer !== false;
    firmHomeOfferStatus.textContent = enabled ? "● Teklif alımı açık" : "● Teklif alımı kapalı";
    firmHomeOfferStatus.classList.toggle("off", !enabled);
  }

  renderFirmHomeOpportunities();

  updateQuoteShortcutCounts({
    all: visibleQuotes.length,
    new: newCount,
    offered: offeredCount,
    locked: lockedCount,
    used: usedCount,
    expired: states.filter(state => state === "expired").length
  });
  syncQuoteShortcutActive();

  const priorityText = document.getElementById("workPriorityText");
  const focusCard = document.getElementById("workFocusCard");

  if (currentInstitution?.offer === false) {
    priorityText.textContent =
      "Teklif alımınız kapalı. Yeni müşteri talepleriyle eşleşmek için tekrar açabilirsiniz.";
    focusCard.dataset.state = "paused";
  } else if (lockedCount > 0) {
    priorityText.textContent =
      lockedCount + " müşteri teklifinizi kabul etti. Gerçek kaydı süre dolmadan tamamlamak için teklif kodunu doğrulayın.";
    focusCard.dataset.state = "locked";
  } else if (newCount > 0) {
    priorityText.textContent =
      newCount + " yeni müşteri talebi sizi bekliyor. Teklif vererek hızlı dönüş yapabilirsiniz.";
    focusCard.dataset.state = "urgent";
  } else if (offeredCount > 0) {
    priorityText.textContent =
      offeredCount + " aktif teklifiniz müşterilerin kararını bekliyor.";
    focusCard.dataset.state = "waiting";
  } else if (usedCount > 0) {
    priorityText.textContent =
      "Şu anda yeni işlem yok. Son gerçek kayıtlarınız tamamlanmış görünüyor.";
    focusCard.dataset.state = "clear";
  } else {
    priorityText.textContent =
      "Şu anda cevap bekleyen yeni müşteri talebi yok.";
    focusCard.dataset.state = "clear";
  }

  const latest=visibleQuotes.slice(0,3);
  recentQuotes.innerHTML=latest.length
    ? latest.map(q=>quoteCardHtml(q,true)).join("")
    : '<div class="empty-state">Henüz uygun teklif talebi yok.</div>';

  recentQuotes.querySelectorAll("[data-open-quotes]").forEach(btn=>{
    btn.addEventListener("click",()=>setPanelTab("quotes"));
  });
};

function sellerOfferFormHtml(quote,offer){
  const routedLead=isRoutedLeadForCurrentInstitution(quote);
  const version=institutionOfferVersion(offer);
  const nextVersion=offer ? version+1 : 1;

  if(!offer && routedLead && institutionLeadCreditBalance<=0){
    return `
      <div class="offer-credit-blocked">
        <div class="offer-credit-blocked-icon">🔒</div>
        <div>
          <strong>Teklif vermek için kredi gerekli</strong>
          <p>Bu müşteri fırsatı Dijiyer tarafından kurumunuza yönlendirildi. Mevcut teklif krediniz <b>0</b> olduğu için şu anda fiyat teklifi gönderemezsiniz.</p>
          <small>Kredi yüklendiğinde teklif formu otomatik olarak aktif hale gelir.</small>
        </div>
      </div>
    `;
  }

  const price=offer?.price ?? "";
  const scope=offer?.scope || quote.note || quote.service || "";
  const vat=offer?.vatStatus || "Dahil";
  const conditions=offer?.conditions || "";
  const extraFee=offer?.extraFee || "Yok";
  const extraFeeAmount=Number(offer?.extraFeeAmount||0) || "";
  const extraFeeRequired=offer?.extraFeeRequired || "Zorunlu";
  const extraFeeNote=offer?.extraFeeNote || "";
  const selectedHours=offerValidityHours(offer);

  const durationOption=(value,label)=>
    `<option value="${value}" ${Number(selectedHours)===Number(value)?"selected":""}>${label}</option>`;

  return `
    <form class="offer-form" data-real-offer-form data-quote-id="${quote.id}">
      <label>Teklif Fiyatı
        <input name="price" type="number" min="1" step="1" required value="${offerSafe(price)}" placeholder="Örn. 4500">
      </label>
      <label>KDV Durumu
        <select name="vatStatus">
          <option ${vat==="Dahil"?"selected":""}>Dahil</option>
          <option ${vat==="Hariç"?"selected":""}>Hariç</option>
        </select>
      </label>
      <label class="full">Teklif Kapsamı
        <textarea name="scope" required placeholder="Fiyata dahil olan hizmetleri ve özellikleri açıkça yazın.">${offerSafe(scope)}</textarea>
      </label>
      <label>Fiyat ve Şartların Geçerlilik Süresi
        <select name="durationHours">
          ${durationOption(1,"1 saat")}
          ${durationOption(3,"3 saat")}
          ${durationOption(12,"12 saat")}
          ${durationOption(24,"24 saat")}
          ${durationOption(48,"2 gün")}
          ${durationOption(72,"3 gün")}
          ${durationOption(168,"7 gün")}
        </select>
        <small class="offer-validity-help">Varsayılan 2 gündür. Müşteri teklifi kabul etse bile bu süre içinde kurumla doğrudan görüşüp gerçek kaydını tamamlamalıdır.</small>
      </label>
      <label>Ek Ücret
        <select name="extraFee" data-extra-fee-select>
          <option value="Yok" ${extraFee!=="Var"?"selected":""}>Yok</option>
          <option value="Var" ${extraFee==="Var"?"selected":""}>Var</option>
        </select>
      </label>

      <div class="full" data-extra-fee-details style="${extraFee==="Var"?"":"display:none;"}">
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px;border:1px solid #fed7aa;background:#fff7ed;border-radius:12px;margin-top:2px">
          <label>Ek Ücret Tutarı
            <input name="extraFeeAmount" type="number" min="1" step="1" value="${offerSafe(extraFeeAmount)}" placeholder="Örn. 750">
          </label>
          <label>Zorunluluk
            <select name="extraFeeRequired">
              <option value="Zorunlu" ${extraFeeRequired==="Zorunlu"?"selected":""}>Zorunlu</option>
              <option value="Opsiyonel" ${extraFeeRequired==="Opsiyonel"?"selected":""}>Opsiyonel</option>
            </select>
          </label>
          <label style="grid-column:1/-1">Ek Ücret Açıklaması
            <input name="extraFeeNote" maxlength="180" value="${offerSafe(extraFeeNote)}" placeholder="Örn. Dosya ve kayıt işlemleri için.">
          </label>
          <small style="grid-column:1/-1;color:#9a3412">Müşteri bu bilgileri teklif kartında açıkça görecek.</small>
        </div>
      </div>

      <label class="full">Kabul / Özel Şartlar <span style="font-weight:400">(opsiyonel)</span>
        <input name="conditions" value="${offerSafe(conditions)}" placeholder="Örn. Bu fiyat yalnızca belirtilen ürün/hizmet için geçerlidir.">
      </label>
      <div class="offer-validity-preview full">
        <strong>⏱ Geçerlilik ve gerçek kayıt:</strong>
        Seçtiğiniz süre fiyat ve özelliklerin son geçerlilik süresidir. Müşteri teklifi kabul ettikten sonra bu süre içinde kurumunuza gelerek veya sizinle doğrudan görüşerek gerçek kaydını tamamlamazsa teklif süresi dolar ve güncel koşullar yeniden görüşülür.
        <br><strong>🛡️ Ödeme politikası:</strong> Dijiyer üzerinden ödeme alınmaz. Ücret, kapora veya kayıt bedeli yalnızca kurum ile müşteri arasında doğrudan yapılır.
        ${offer?`<br><strong>🔔 ${nextVersion===2?"2. teklif":"Güncelleme"}:</strong> Kaydettiğinizde müşteriye yeniden bildirim gider ve yeni geçerlilik süresi başlar.`:""}
      </div>
      <button class="send-real-offer-btn full" type="submit">${offer ? (nextVersion===2 ? "2. Teklifi Gönder" : "Teklifi Güncelle") : "Teklif Gönder"}</button>
    </form>
  `;
}

function institutionResponseTiming(quote){
  const institutionId=String(currentAccount?.institutionId||"");
  const targetId=String(quote?.targetInstitutionId||"");

  if(!institutionId || !targetId || institutionId!==targetId)return null;

  const raw=Number(quote?.responseWaitMinutes||30);
  const minutes=[15,30,45,60,1440].includes(raw)?raw:30;

  let deadline=new Date(quote?.responseDeadlineAt||"").getTime();
  if(!Number.isFinite(deadline)){
    const created=new Date(quote?.date||"").getTime();
    if(Number.isFinite(created))deadline=created+(minutes*60000);
  }

  if(!Number.isFinite(deadline))return null;

  const diff=deadline-Date.now();
  const forwarded=Array.isArray(quote?.forwardInstitutionIds)
    && quote.forwardInstitutionIds.length>0;

  return {
    minutes,
    deadline,
    diff,
    expired:diff<=0,
    urgent:diff>0 && diff<=15*60000,
    forwarded
  };
}

function institutionResponseWaitLabel(minutes){
  const value=Number(minutes||0);
  if(value===1440)return "1 gün";
  if(value===60)return "1 saat";
  return value+" dakika";
}

function institutionResponseRemainingLabel(diff){
  if(diff<=0)return "Süre doldu";

  const totalMinutes=Math.max(1,Math.ceil(diff/60000));

  if(totalMinutes>=1440){
    const days=Math.floor(totalMinutes/1440);
    const hours=Math.floor((totalMinutes%1440)/60);
    return days+" gün"+(hours?" "+hours+" saat":"");
  }

  if(totalMinutes>=60){
    const hours=Math.floor(totalMinutes/60);
    const minutes=totalMinutes%60;
    return hours+" saat"+(minutes?" "+minutes+" dk":"");
  }

  return totalMinutes+" dk";
}

function institutionResponseTimingHtml(quote){
  const timing=institutionResponseTiming(quote);
  if(!timing)return "";

  const state=sellerOfferState(quote);
  if(state!=="new" && state!=="not_interested")return "";

  const styleState=timing.forwarded
    ? "forwarded"
    : timing.expired
      ? "expired"
      : timing.urgent
        ? "urgent"
        : "active";

  let message="Müşterinin seçtiği süre içinde fiyat teklifinizi gönderin.";

  if(timing.urgent){
    message="Yanıt süresi azalıyor. Fiyat teklifinizi mümkün olduğunca kısa sürede gönderin.";
  }

  if(timing.expired){
    message=quote.allowAlternativeInstitutions===true
      ? "Yanıt süresi doldu. Müşteri izin verdiği için talep diğer uygun kurumlara yönlendirilebilir."
      : "Yanıt süresi doldu. Müşteri izin vermediği için talep başka kurumlara yönlendirilmez.";
  }

  if(timing.forwarded){
    message="Yanıt süresinde fiyat teklifi verilmediği için talep diğer uygun kurumlara iletildi. Talep hâlâ açıksa siz de teklif gönderebilirsiniz.";
  }

  return `
    <div class="institution-response-deadline ${styleState}">
      <div class="institution-response-deadline-icon">${timing.forwarded?"↗":timing.expired?"!":timing.urgent?"⏱":"◷"}</div>
      <div class="institution-response-deadline-copy">
        <div class="institution-response-deadline-head">
          <span>YANIT SÜRESİ</span>
          <strong data-institution-response-countdown="${timing.deadline}">${offerSafe(institutionResponseRemainingLabel(timing.diff))}</strong>
        </div>
        <div class="institution-response-deadline-meta">
          <span>Seçilen: <b>${offerSafe(institutionResponseWaitLabel(timing.minutes))}</b></span>
          <span>Son yanıt: <b>${offerSafe(formatDate(new Date(timing.deadline).toISOString()))}</b></span>
        </div>
        <p>${offerSafe(message)}</p>
      </div>
    </div>
  `;
}

function institutionTimingNoticeKey(quoteId,type){
  return "dijiyerInstitutionTimingNotice:"+
    String(currentAccount?.institutionId||"")+"|"+
    String(quoteId||"")+"|"+
    String(type||"");
}

function showInstitutionTimingNotice(quote,type){
  const key=institutionTimingNoticeKey(quote?.id,type);
  if(localStorage.getItem(key))return;

  localStorage.setItem(key,new Date().toISOString());

  const service=quote?.service||"Teklif talebi";
  let title="Dijiyer · Teklif süresi";
  let body=service;

  if(type==="urgent"){
    body=service+" · Yanıt süresinin bitmesine 15 dakikadan az kaldı.";
  }else if(type==="expired"){
    body=service+" · Yanıt süresi doldu.";
  }else if(type==="forwarded"){
    title="Dijiyer · Talep başka kurumlara iletildi";
    body=service+" · Sürede fiyat teklifi verilmediği için talep diğer uygun kurumlara iletildi.";
  }

  const alert=document.getElementById("liveQuoteAlert");
  const text=document.getElementById("liveQuoteAlertText");

  if(alert && text){
    text.textContent=body;
    alert.classList.remove("hidden");
    if(typeof playNewQuoteSound==="function")playNewQuoteSound();
  }

  try{
    if("Notification" in window &&
       Notification.permission==="granted" &&
       (document.hidden || !document.hasFocus())){
      const notification=new Notification(title,{
        body,
        tag:"dijiyer-quote-timing-"+String(quote?.id||"")+"-"+type
      });

      notification.onclick=()=>{
        window.focus();
        if(typeof openFirmDashboardQuotes==="function")openFirmDashboardQuotes("new");
        notification.close();
      };
    }
  }catch(_){}
}


function secondOfferInviteNoticeKey(quote,invite){
  return "dijiyerSecondOfferInvite:"+
    String(currentAccount?.institutionId||"")+"|"+
    String(quote?.id||"")+"|"+
    String(invite?.invitedAt||"");
}

function showSecondOfferInviteNotice(quote,invite){
  const key=secondOfferInviteNoticeKey(quote,invite);
  if(localStorage.getItem(key))return;
  localStorage.setItem(key,new Date().toISOString());

  const body=(quote?.service||"Teklif talebi")+
    " · Teklifiniz henüz kabul edilmedi. Yeni bir teklif vermek ister misiniz?";

  const alert=document.getElementById("liveQuoteAlert");
  const text=document.getElementById("liveQuoteAlertText");

  if(alert && text){
    text.textContent=body;
    alert.classList.remove("hidden");
    if(typeof playNewQuoteSound==="function")playNewQuoteSound();
  }

  try{
    if("Notification" in window &&
       Notification.permission==="granted" &&
       (document.hidden || !document.hasFocus())){
      const notification=new Notification("Dijiyer · 2. teklif fırsatı",{
        body,
        tag:"dijiyer-second-offer-"+String(quote?.id||"")
      });

      notification.onclick=()=>{
        window.focus();
        if(typeof openFirmDashboardQuotes==="function")openFirmDashboardQuotes("offered");
        notification.close();
      };
    }
  }catch(_){}
}

async function dismissSecondOfferInvite(quoteId,button){
  const invite=institutionSecondOfferInviteMap.get(String(quoteId));
  if(!invite)return;

  const oldText=button?.textContent||"Şimdilik Hayır";
  if(button){
    button.disabled=true;
    button.textContent="Kaydediliyor...";
  }

  try{
    const respondedAt=new Date().toISOString();
    await db.collection("quoteRequests")
      .doc(String(quoteId))
      .collection("secondOfferInvites")
      .doc(String(currentAccount.institutionId))
      .update({
        decision:"no",
        respondedAt
      });

    institutionSecondOfferInviteMap.set(String(quoteId),{
      ...invite,
      decision:"no",
      respondedAt
    });
    renderQuotes();
  }catch(error){
    console.error("2. teklif daveti yanıtlanamadı:",error);
    alert("Seçiminiz kaydedilemedi.");
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=oldText;
    }
  }
}

function updateInstitutionResponseCountdowns(){
  document.querySelectorAll("[data-institution-response-countdown]").forEach(node=>{
    const deadline=Number(node.dataset.institutionResponseCountdown||0);
    if(!Number.isFinite(deadline)||!deadline)return;

    const diff=deadline-Date.now();
    node.textContent=institutionResponseRemainingLabel(diff);

    const box=node.closest(".institution-response-deadline");
    if(!box || box.classList.contains("forwarded"))return;

    box.classList.toggle("expired",diff<=0);
    box.classList.toggle("urgent",diff>0 && diff<=15*60000);
    box.classList.toggle("active",diff>15*60000);
  });

  quoteRecords.forEach(quote=>{
    const timing=institutionResponseTiming(quote);
    if(!timing)return;

    if(institutionOfferMap.has(quote.id) || institutionLockMap.has(quote.id))return;

    if(timing.forwarded){
      showInstitutionTimingNotice(quote,"forwarded");
    }else if(timing.expired){
      showInstitutionTimingNotice(quote,"expired");
    }else if(timing.urgent){
      showInstitutionTimingNotice(quote,"urgent");
    }
  });
}

quoteCardHtml = function(quote,compact=false){
  const state=sellerOfferState(quote);
  const archived=institutionQuoteIsArchived(quote.id);
  const [statusText,statusClass]=sellerStateMeta(state);
  const offer=institutionOfferMap.get(quote.id);
  const lock=institutionEffectiveLock(quote);
  const sameDistrict=String(quote.district||"").toLocaleLowerCase("tr-TR") === String(currentInstitution.district||"").toLocaleLowerCase("tr-TR");
  const routedToThisInstitution=Array.isArray(quote.forwardInstitutionIds)
    && quote.forwardInstitutionIds.map(String).includes(String(currentAccount.institutionId||""))
    && String(quote.targetInstitutionId||"")!==String(currentAccount.institutionId||"");

  if(compact){
    return `
      <button class="recent-quote" data-open-quotes>
        <span>
          <strong>${offerSafe(quote.service || "Teklif Talebi")}</strong>
          <small>${offerSafe(quote.district || quote.city || "-")} · ${formatDate(quote.date)}</small>
        </span>
        <span class="quote-status ${statusClass}">${statusText}</span>
      </button>
    `;
  }

  let actionArea="";
  if(state==="new"){
    actionArea=sellerOfferFormHtml(quote,null)+`
      <div class="quote-actions">
        <button data-response="not_interested" data-quote-id="${quote.id}" class="danger">✕ İlgilenmiyorum</button>
      </div>`;
  }else if(state==="offered"){
    actionArea=`
      <div class="offer-summary-box">
        <div class="offer-summary-top">
          <div>
            <div class="offer-summary-price">${offerMoney(offer.price)}</div>
            <div class="muted">Teklif No: <b>${offerSafe(offer.offerCode)}</b></div>
            <div class="offer-validity-line">⏱ Fiyat ve şartlar <b>${offerSafe(offerValidityLabel(offerValidityHours(offer)))}</b> geçerlidir · Gerçek kayıt için son tarih: <b>${formatDate(offer.expiresAt)}</b></div>
          </div>
          <span class="quote-status status-interested">Teklif Aktif</span>
        </div>
        <div class="quote-note">${offerSafe(offer.scope || "")}</div>
        ${offer.extraFee==="Var"
          ? `<div class="quote-note" style="border-left-color:#f59e0b"><strong>Ek ücret:</strong> ${offerMoney(offer.extraFeeAmount||0)} · ${offerSafe(offer.extraFeeRequired||"Zorunlu")}<br>${offerSafe(offer.extraFeeNote||"")}</div>`
          : ""}
        ${secondOfferPromptHtml(quote,offer)}
        <details class="offer-edit-details" data-offer-edit-details="${offerSafe(quote.id)}" style="margin-top:10px">
          <summary style="cursor:pointer;font-weight:800;color:#1677ff">${institutionOfferVersion(offer)===1?"2. teklif / düzenle":"Teklifi düzenle"}</summary>
          ${sellerOfferFormHtml(quote,offer)}
        </details>
      </div>`;
  }else if(state==="locked"){
    actionArea=`
      <div class="offer-summary-box">
        <div class="offer-summary-top">
          <div>
            <div class="offer-summary-price">${offerMoney(lock.price)}</div>
            <div class="muted">Teklif No: <b>${offerSafe(lock.offerCode)}</b></div>
          </div>
          <span class="quote-status status-interested">✓ Kabul Edildi</span>
        </div>
        <div class="quote-note">${offerSafe(lock.scope || "")}</div>
        <div class="offer-lock-notice"><strong>✓ Müşteri teklifinizi kabul etti.</strong> Bu teklif kapatıldı. Kabul edilen fiyat ve şartlar artık değiştirilemez. Gerçek kayıt için müşterinin en geç <b>${formatDate(lock.registrationDeadlineAt || lock.expiresAt)}</b> tarihine kadar kurumunuzla doğrudan işlemi tamamlaması gerekir. Dijiyer üzerinden ödeme alınmaz.</div>
      </div>`;
  }else if(state==="used"){
    actionArea=`<div class="offer-lock-notice"><strong>✓ Gerçek Kayıt Tamamlandı</strong><br>${offerSafe(lock.offerCode || "")} numaralı teklif kurum tarafından gerçek kayda dönüştürüldü. Tamamlanma: ${formatDate(lock.registrationCompletedAt || lock.usedAt)}</div>`;
  }else if(state==="expired"){
    const exp=lock?.expiresAt || offer?.expiresAt;
    actionArea=`<div class="quote-note" style="border-left-color:#fb7185"><strong>Teklifin süresi doldu.</strong> ${formatDate(exp)} sonrasında fiyat ve şartlar garanti edilmez. Müşteriyle güncel koşulları yeniden görüşerek yeni teklif oluşturabilirsiniz.</div>`;
  }else if(state==="closed"){
    actionArea='<div class="quote-note">Müşteri bu talep için başka bir kurumun teklifini kabul etti.</div>';
  }else{
    actionArea='<div class="quote-note">Bu talep için “İlgilenmiyorum” seçildi.</div>';
  }

  if(archived){
    actionArea=`
      <div class="quote-note" style="border-left-color:#64748b">
        <strong>Arşivde</strong> Bu talep yalnızca kurum panelinizden gizlendi; sistem kaydı silinmedi.
      </div>
      <div class="quote-actions" style="margin-top:10px">
        <button type="button" data-restore-quote="${offerSafe(quote.id)}" class="secondary">↩ Geri Getir</button>
      </div>`;
  }

  return `
    <article class="quote-card">
      <div class="quote-card-head">
        <div>
          <div class="quote-service">${offerSafe(quote.service || "Teklif Talebi")}</div>
          ${routedToThisInstitution?'<div class="quote-routed-badge">⚡ Dijiyer yönlendirmesi · yeni müşteri fırsatı · Kredi: '+offerSafe(institutionLeadCreditBalance)+'</div>':""}
          <div class="quote-location">
            📍 ${offerSafe([quote.city,quote.district].filter(Boolean).join(" / "))}
            ${sameDistrict ? '<span class="district-badge">Aynı ilçe</span>' : '<span class="city-badge">Aynı şehir</span>'}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
          <span class="quote-status ${statusClass}">${statusText}</span>
          ${!archived && state!=="locked" && state!=="used"
            ? `<button type="button" data-archive-quote="${offerSafe(quote.id)}" style="border:1px solid #fecaca;background:#fff1f2;color:#be123c;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer">Sil</button>`
            : ""}
        </div>
      </div>

      <div class="quote-customer">
        <div><small>Müşteri</small><strong>${offerSafe(quote.name || "-")}</strong></div>
        <div><small>Telefon</small><strong>${offerSafe(quote.phone || "-")}</strong></div>
        <div><small>Tarih</small><strong>${formatDate(quote.date)}</strong></div>
      </div>

      ${institutionResponseTimingHtml(quote)}
      ${quote.note ? `<div class="quote-note">${offerSafe(quote.note)}</div>` : ""}
      ${actionArea}
    </article>
  `;
};

renderQuotes = function(){
  const filter=quotePanelFilter.value;
  const rows=filter==="archived"
    ? quoteRecords.filter(q=>institutionQuoteIsArchived(q.id))
    : quoteRecords.filter(q=>!institutionQuoteIsArchived(q.id) && (!filter || sellerOfferState(q)===filter));

  institutionQuotesList.innerHTML=rows.length
    ? rows.map(q=>quoteCardHtml(q)).join("")
    : '<div class="empty-state">Bu filtreye uygun teklif bulunamadı.</div>';

  updateInstitutionResponseCountdowns();

  institutionQuotesList.querySelectorAll("[data-real-offer-form]").forEach(form=>{
    const extraSelect=form.querySelector("[data-extra-fee-select]");
    const extraDetails=form.querySelector("[data-extra-fee-details]");
    const syncExtraFeeFields=()=>{
      const show=extraSelect?.value==="Var";
      if(extraDetails)extraDetails.style.display=show?"":"none";
      ["extraFeeAmount","extraFeeNote"].forEach(name=>{
        const field=form.elements[name];
        if(field)field.required=Boolean(show);
      });
    };
    extraSelect?.addEventListener("change",syncExtraFeeFields);
    syncExtraFeeFields();

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      await saveRealOffer(form);
    });
  });

  institutionQuotesList.querySelectorAll("[data-second-offer]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const quoteId=String(btn.dataset.secondOffer||"");
      const details=institutionQuotesList.querySelector('[data-offer-edit-details="'+CSS.escape(quoteId)+'"]');
      if(details){
        details.open=true;
        details.scrollIntoView({behavior:"smooth",block:"center"});
        setTimeout(()=>details.querySelector('input[name="price"]')?.focus(),250);
      }
    });
  });

  institutionQuotesList.querySelectorAll("[data-second-offer-dismiss]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      await dismissSecondOfferInvite(String(btn.dataset.secondOfferDismiss||""),btn);
    });
  });

  institutionQuotesList.querySelectorAll('[data-response="not_interested"]').forEach(btn=>{
    btn.addEventListener("click",async()=>{
      await saveQuoteResponse(btn.dataset.quoteId,"not_interested");
      renderQuotes();
      renderSummary();
    });
  });

  institutionQuotesList.querySelectorAll("[data-archive-quote]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      btn.disabled=true;
      try{
        await setInstitutionQuoteArchived(String(btn.dataset.archiveQuote||""),true);
      }catch(error){
        console.error("Talep arşivlenemedi:",error);
        alert("Talep arşivlenemedi.");
      }finally{
        if(document.body.contains(btn))btn.disabled=false;
      }
    });
  });

  institutionQuotesList.querySelectorAll("[data-restore-quote]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      btn.disabled=true;
      try{
        await setInstitutionQuoteArchived(String(btn.dataset.restoreQuote||""),false);
      }catch(error){
        console.error("Talep arşivden çıkarılamadı:",error);
        alert("Talep geri getirilemedi.");
      }finally{
        if(document.body.contains(btn))btn.disabled=false;
      }
    });
  });
};

async function saveRealOffer(form){
  const quoteId=form.dataset.quoteId;
  const quote=quoteRecords.find(q=>q.id===quoteId);
  let lock=institutionLockMap.get(quoteId);
  let existing=institutionOfferMap.get(quoteId);
  const routedLead=isRoutedLeadForCurrentInstitution(quote);
  let nextVersion=existing ? institutionOfferVersion(existing)+1 : 1;

  if(!quote){
    alert("Teklif talebi bulunamadı.");
    renderQuotes();
    return;
  }

  if(institutionQuoteIsTerminal(quote)){
    const effectiveLock=institutionEffectiveLock(quote);
    if(effectiveLock){
      alert(institutionLockBelongsToCurrentInstitution(effectiveLock,existing)
        ? "Müşteri bu teklifi kabul etti. Fiyat ve şartlar artık değiştirilemez."
        : "Müşteri başka bir teklifi seçti.");
    }else{
      alert("Bu teklif talebi kapalı olduğu için yeni teklif gönderilemez.");
    }
    renderQuotes();
    renderSummary();
    return;
  }

  // Canlı dinleyici gecikse bile kaydetmeden hemen önce sunucudaki kabul kilidini doğrula.
  try{
    const freshLockSnap=await db.collection("quoteRequests").doc(quoteId)
      .collection("locks").doc("main").get();
    if(freshLockSnap.exists){
      lock=freshLockSnap.data();
      institutionLockMap.set(quoteId,lock);
    }
  }catch(error){
    console.error("Teklif kabul durumu doğrulanamadı:",error);
    alert("Teklifin güncel durumu doğrulanamadı. Lütfen tekrar deneyin.");
    return;
  }

  if(lock){
    alert(institutionLockBelongsToCurrentInstitution(lock,existing)
      ? "Müşteri bu teklifi kabul etti. Fiyat ve şartlar artık değiştirilemez."
      : "Müşteri başka bir teklifi seçti.");
    return;
  }

  // Paneldeki local teklif sürümü eski kalmış olabilir. Kaydetmeden hemen önce
  // Firestore'daki güncel teklifi esas al; böylece aynı sürüm tekrar yazılmaz.
  try{
    const freshOfferSnap=await db.collection("quoteRequests").doc(quoteId)
      .collection("offers").doc(String(currentAccount.institutionId)).get();

    if(freshOfferSnap.exists){
      existing={id:freshOfferSnap.id,...freshOfferSnap.data()};
      institutionOfferMap.set(quoteId,existing);
    }else{
      existing=null;
      institutionOfferMap.delete(quoteId);
    }

    nextVersion=existing ? institutionOfferVersion(existing)+1 : 1;
  }catch(error){
    console.error("Teklifin güncel sürümü doğrulanamadı:",error);
    alert("Teklifin güncel sürümü doğrulanamadı. Lütfen tekrar deneyin.");
    return;
  }

  if(!existing && routedLead){
    const freshBalance=await refreshInstitutionLeadCreditBalance();

    if(freshBalance<=0){
      alert("Teklif vermek için kredi yüklemeniz gerekiyor. Mevcut teklif krediniz: 0");
      renderQuotes();
      return;
    }
  }

  if(existing){
    const ok=window.confirm(
      nextVersion===2
        ? "Müşteriye 2. teklifinizi göndermek üzeresiniz. Yeni fiyat/şartlar müşteriye tekrar bildirilecek. Bu işlem için yeni kredi kullanılmaz. Devam edilsin mi?"
        : "Teklifi güncellemek üzeresiniz. Yeni fiyat/şartlar müşteriye bildirilecek ve yeni geçerlilik süresi şimdi başlayacak. Devam edilsin mi?"
    );
    if(!ok)return;
  }

  const price=Number(form.elements.price.value);
  if(!price || price<=0){ alert("Geçerli bir teklif fiyatı girin."); return; }

  const extraFee=String(form.elements.extraFee.value||"Yok");
  const extraFeeAmount=extraFee==="Var" ? Number(form.elements.extraFeeAmount?.value||0) : 0;
  const extraFeeRequired=extraFee==="Var" ? String(form.elements.extraFeeRequired?.value||"Zorunlu") : "";
  const extraFeeNote=extraFee==="Var" ? String(form.elements.extraFeeNote?.value||"").trim() : "";

  if(extraFee==="Var"){
    if(!extraFeeAmount || extraFeeAmount<=0){
      alert("Ek ücret tutarını girin.");
      form.elements.extraFeeAmount?.focus();
      return;
    }
    if(!extraFeeNote){
      alert("Ek ücret açıklamasını yazın.");
      form.elements.extraFeeNote?.focus();
      return;
    }
  }

  const hours=Number(form.elements.durationHours.value || 48);
  const expiry=new Date(Date.now()+hours*3600000);
  const code=existing?.offerCode || makeOfferCode();
  const submit=form.querySelector('button[type="submit"]');
  const oldText=submit.textContent;
  submit.disabled=true; submit.textContent="Kaydediliyor...";

  const now=new Date().toISOString();
  const source=institutionOfferSourceMeta(quote);
  const data={
    institutionId:currentAccount.institutionId,
    institutionName:currentInstitution.name || currentAccount.institutionName || "Kurum",
    offerCode:code,
    price,
    vatStatus:form.elements.vatStatus.value,
    scope:form.elements.scope.value.trim(),
    extraFee,
    extraFeeAmount,
    extraFeeRequired,
    extraFeeNote,
    conditions:form.elements.conditions.value.trim(),
    expiresAt:expiry.toISOString(),
    expiresAtTs:firebase.firestore.Timestamp.fromDate(expiry),
    status:"offered",
    validityHours:hours,
    registrationRequired:true,
    platformPayment:false,
    paymentPolicy:"offline_direct_between_customer_and_institution",
    offerVersion:nextVersion,
    sourceType:source.type,
    sourceLabel:source.label,
    secondOfferSentAt:nextVersion===2 ? now : (existing?.secondOfferSentAt || ""),
    createdAt:existing?.createdAt || now,
    updatedAt:now
  };

  try{
    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    const offerRef=quoteRef.collection("offers").doc(existing?.id || currentAccount.institutionId);
    const lookupRef=db.collection("offerLookup").doc(code);

    const batch=db.batch();

    if(existing && Number(existing.offerVersion||0)>=1){
      const existingVersion=institutionOfferVersion(existing);
      const historyRef=quoteRef.collection("offerHistory")
        .doc(String(currentAccount.institutionId)+"_v"+String(existingVersion));

      // Aynı sürüm daha önce arşivlendiyse create-only Firestore kuralına takılmamak için
      // tekrar yazma. Bu özellikle sayfa eski local state ile açık kaldığında oluşabiliyor.
      const historySnap=await historyRef.get();
      if(!historySnap.exists){
        batch.set(historyRef,{
          quoteId:String(quoteId),
          institutionId:String(currentAccount.institutionId),
          institutionName:String(existing.institutionName||currentInstitution.name||"Kurum"),
          offerCode:String(existing.offerCode||code),
          version:existingVersion,
          price:Number(existing.price||0),
          vatStatus:String(existing.vatStatus||""),
          scope:String(existing.scope||""),
          extraFee:String(existing.extraFee||""),
          extraFeeAmount:Number(existing.extraFeeAmount||0),
          extraFeeRequired:String(existing.extraFeeRequired||""),
          extraFeeNote:String(existing.extraFeeNote||""),
          conditions:String(existing.conditions||""),
          expiresAt:String(existing.expiresAt||""),
          sourceType:String(existing.sourceType||source.type||""),
          sourceLabel:String(existing.sourceLabel||source.label||""),
          createdAt:String(existing.createdAt||now),
          updatedAt:String(existing.updatedAt||existing.createdAt||now),
          archivedAt:now
        });
      }
    }

    batch.set(offerRef,data,{merge:true});
    batch.set(lookupRef,{
      quoteId,
      institutionId:currentAccount.institutionId,
      offerCode:code,
      updatedAt:new Date().toISOString()
    },{merge:true});
    await batch.commit();
    await recordPublicOfferEvent(quoteId,currentAccount.institutionId,data.createdAt);

    institutionOfferMap.set(quoteId,{id:currentAccount.institutionId,...data});

    // 2. teklif daveti üzerinden geldiyse kurumun olumlu kararını kaydet.
    if(nextVersion===2 && institutionSecondOfferInviteMap.has(String(quoteId))){
      const invite=institutionSecondOfferInviteMap.get(String(quoteId));
      if(invite && !String(invite.decision||"")){
        try{
          const respondedAt=new Date().toISOString();
          await quoteRef.collection("secondOfferInvites")
            .doc(String(currentAccount.institutionId))
            .update({
              decision:"yes",
              respondedAt
            });
          institutionSecondOfferInviteMap.set(String(quoteId),{
            ...invite,
            decision:"yes",
            respondedAt
          });
        }catch(error){
          console.warn("2. teklif daveti onay kaydı güncellenemedi:",error);
        }
      }
    }

    if(responseMap.get(quoteId)?.status==="not_interested"){
      await saveQuoteResponse(quoteId,"interested");
    }
    renderQuotes(); renderSummary();
    if(nextVersion===2){
      alert("2. teklif müşteriye iletildi. Müşteriye yeniden bildirim gönderilecek.");
    }
  }catch(error){
    console.error("Gerçek teklif kaydedilemedi:",error);
    const errorCode=String(error?.code||"unknown");
    const errorMessage=String(error?.message||"Bilinmeyen hata");

    if(errorCode.includes("permission-denied")){
      try{
        const freshLockSnap=await db.collection("quoteRequests").doc(quoteId)
          .collection("locks").doc("main").get();

        if(freshLockSnap.exists){
          const freshLock=freshLockSnap.data();
          institutionLockMap.set(quoteId,freshLock);
          renderQuotes();
          renderSummary();
          alert(institutionLockBelongsToCurrentInstitution(freshLock,existing)
            ? "Müşteri bu teklifi kabul etti. Fiyat ve şartlar artık değiştirilemez."
            : "Müşteri başka bir teklifi seçti.");
          return;
        }
      }catch(lockError){
        console.warn("Kilit durumu hata sonrası doğrulanamadı:",lockError);
      }
    }

    alert(
      errorCode.includes("permission-denied")
        ? "Teklif kaydedilemedi. Talep kapanmış veya teklif artık düzenlenemiyor. Sayfayı yenileyip tekrar kontrol edin."
        : "Teklif kaydedilemedi ("+errorCode+").\n\n"+errorMessage
    );
  }finally{
    submit.disabled=false; submit.textContent=oldText;
  }
}

async function recordPublicOfferEvent(quoteId,institutionId,date){
  try{
    const eventId=String(quoteId)+"__"+String(institutionId);
    const ref=db.collection("publicOfferEvents").doc(eventId);
    const existing=await ref.get();
    if(existing.exists)return;
    await ref.set({
      quoteId:String(quoteId),
      institutionId:String(institutionId),
      date:String(date||"")
    });
  }catch(error){
    console.warn("Günlük teklif istatistiği kaydedilemedi:",error);
  }
}

async function verifyOfferByCode(rawCode){
  const code=String(rawCode || document.getElementById("verifyOfferCode")?.value || "").trim().toUpperCase();
  const result=document.getElementById("verifyOfferResult");
  if(!result) return;
  if(!code){
    result.innerHTML='<div class="verify-result-card invalid"><div class="verify-result-title">Teklif kodu girin.</div></div>';
    return;
  }

  if(code.startsWith("DJY-T-")){
    result.innerHTML=`
      <div class="verify-result-card invalid">
        <div class="verify-result-title">ℹ️ Bu bir talep takip kodu</div>
        <div class="muted" style="text-align:center;line-height:1.55">
          <b>${offerSafe(code)}</b> müşterinin tekliflerini takip etmek için kullanılır.<br>
          Buraya müşterinin seçtiği teklif üzerinde yazan <b>Teklif No</b> bilgisini girin
          veya teklifin QR kodunu okutun.
        </div>
      </div>
    `;
    return;
  }

  result.innerHTML='<div class="empty-state">Teklif doğrulanıyor...</div>';

  try{
    let lookup=null;

    const lookupSnap=await db.collection("offerLookup").doc(code).get();

    if(lookupSnap.exists){
      lookup=lookupSnap.data();
    }else{
      // Eski tekliflerde offerLookup kaydı bulunmayabilir.
      // Kurumun panelde yüklü kendi teklifleri içinde kodu arayıp doğrulamaya devam et.
      const legacyEntry=[...institutionOfferMap.entries()].find(([,offer]) =>
        String(offer?.offerCode || "").trim().toUpperCase() === code
      );

      if(legacyEntry){
        const [quoteId,offer]=legacyEntry;

        lookup={
          quoteId,
          institutionId:offer.institutionId || currentAccount.institutionId,
          offerCode:offer.offerCode || code
        };

        // Sonraki doğrulamalarda direkt bulunabilmesi için indeksi arka planda tamamla.
        try{
          await db.collection("offerLookup").doc(code).set({
            quoteId,
            institutionId:lookup.institutionId,
            offerCode:lookup.offerCode,
            updatedAt:new Date().toISOString()
          },{merge:true});
        }catch(backfillError){
          console.warn("Eski teklif için offerLookup tamamlanamadı:",backfillError);
        }
      }
    }

    if(!lookup){
      result.innerHTML='<div class="verify-result-card invalid"><div class="verify-result-title">⛔ Teklif bulunamadı</div><div class="muted" style="text-align:center">Kodun doğru yazıldığını ve teklifin bu kuruma ait olduğunu kontrol edin.</div></div>';
      return;
    }

    if(lookup.institutionId!==currentAccount.institutionId){
      result.innerHTML='<div class="verify-result-card invalid"><div class="verify-result-title">⛔ Bu teklif başka bir kuruma ait</div></div>';
      return;
    }

    const quoteRef=db.collection("quoteRequests").doc(lookup.quoteId);
    const [quoteSnap,lockSnap]=await Promise.all([
      quoteRef.get(),
      quoteRef.collection("locks").doc("main").get()
    ]);
    const quote=quoteSnap.exists ? quoteSnap.data() : {};
    if(!lockSnap.exists || lockSnap.data().institutionId!==currentAccount.institutionId){
      result.innerHTML='<div class="verify-result-card invalid"><div class="verify-result-title">⏳ Teklif henüz kabul edilmedi</div><div class="muted" style="text-align:center">Müşteri bu teklifi henüz kabul etmemiş.</div></div>';
      return;
    }

    const lock=lockSnap.data();
    const expired=lock.expiresAt && new Date(lock.expiresAt).getTime()<=Date.now();
    const used=lock.status==="used";
    const valid=!expired && !used;

    result.innerHTML=`
      <div class="verify-result-card ${valid?"valid":"invalid"}">
        <div class="verify-result-title">${valid?"⏳ KAYIT BEKLİYOR":used?"✓ GERÇEK KAYIT TAMAMLANDI":"⛔ TEKLİF SÜRESİ DOLDU"}</div>
        <div class="verify-data">
          <div><span>Teklif No</span><strong>${offerSafe(lock.offerCode || code)}</strong></div>
          <div><span>Kurum</span><strong>${offerSafe(lock.institutionName || currentInstitution?.name || "-")}</strong></div>
          <div><span>Müşteri</span><strong>${offerSafe(quote.name || "-")}</strong></div>
          <div><span>Hizmet</span><strong>${offerSafe(quote.service || "-")}</strong></div>
          <div class="verify-data-wide"><span>Teklif Kapsamı</span><strong>${offerSafe(lock.scope || "-")}</strong></div>
          <div><span>Tutar</span><strong>${offerMoney(lock.price)}</strong></div>
          <div><span>KDV</span><strong>${offerSafe(lock.vatStatus || "-")}</strong></div>
          <div><span>Teklif Kaydı</span><strong class="verify-lock-value">🔒 Kabul Edildi</strong></div>
          <div><span>Müşteri Doğrulaması</span><strong>✓ Telefon + takip kodu</strong></div>
          <div><span>Gerçek Kayıt Son Tarihi</span><strong>${formatDate(lock.registrationDeadlineAt || lock.expiresAt)}</strong></div>
          <div><span>Kalan Süre</span><strong>${offerSafe(offerRemainingLabel(lock.expiresAt))}</strong></div>
          <div><span>Durum</span><strong>${used?"Gerçek Kayıt Tamamlandı":expired?"Süresi Doldu":"Kayıt Bekliyor"}</strong></div>
        </div>
        ${valid ? `<div class="offer-lock-notice">Dijiyer üzerinden ödeme alınmaz. Müşteri ile ödeme ve kayıt işlemleri doğrudan kurumunuzda gerçekleştirilir.</div><button class="mark-used-btn" data-mark-offer-used data-quote-id="${offerSafe(lookup.quoteId)}">Gerçek Kaydı Tamamlandı Olarak İşaretle</button>` : ""}
      </div>
    `;

    result.querySelectorAll("[data-mark-offer-used]").forEach(btn=>{
      btn.addEventListener("click",()=>markOfferUsed(btn.dataset.quoteId,code));
    });
  }catch(error){
    console.error("Teklif doğrulanamadı:",error);
    result.innerHTML='<div class="verify-result-card invalid"><div class="verify-result-title">Doğrulama yapılamadı</div><div class="muted" style="text-align:center">Firestore yetkisini kontrol edin.</div></div>';
  }
}

async function markOfferUsed(quoteId,code){
  try{
    const lockRef=db.collection("quoteRequests").doc(quoteId).collection("locks").doc("main");
    const snap=await lockRef.get();
    if(!snap.exists) throw new Error("Kabul edilmiş teklif kaydı bulunamadı.");
    const lock=snap.data();
    if(lock.institutionId!==currentAccount.institutionId) throw new Error("Bu teklif kurumunuza ait değil.");
    if(lock.expiresAt && new Date(lock.expiresAt).getTime()<=Date.now()) throw new Error("Teklifin geçerlilik süresi dolmuş. Güncel koşullar yeniden görüşülmelidir.");
    if(lock.status==="used") throw new Error("Gerçek kayıt daha önce tamamlanmış.");

    const ok=window.confirm("Müşterinin kurumunuzdaki gerçek kayıt işlemini tamamladığını onaylıyor musunuz?\n\nBu işlem Dijiyer üzerinden ödeme alındığı anlamına gelmez.");
    if(!ok)return;

    const completedAt=new Date().toISOString();
    await lockRef.update({
      status:"used",
      registrationStatus:"completed",
      registrationCompletedAt:completedAt,
      registrationCompletedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
      usedAt:completedAt,
      usedAtTs:firebase.firestore.FieldValue.serverTimestamp()
    });
    institutionLockMap.set(quoteId,{
      ...lock,
      status:"used",
      registrationStatus:"completed",
      registrationCompletedAt:completedAt,
      usedAt:completedAt
    });
    await verifyOfferByCode(code);
    renderQuotes();
    renderSummary();
  }catch(error){
    alert(error.message || "Gerçek kayıt tamamlandı olarak işaretlenemedi.");
  }
}

const verifyBtn=document.getElementById("verifyOfferBtn");
if(verifyBtn){
  verifyBtn.addEventListener("click",()=>verifyOfferByCode());
}
const verifyInput=document.getElementById("verifyOfferCode");
if(verifyInput){
  verifyInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();verifyOfferByCode();}
  });
}
quotePanelFilter.addEventListener("change",()=>{
  syncQuoteShortcutActive();
  renderQuotes();
});

// Kurum paneli açıkken tekli teklif yanıt sürelerini canlı güncelle.
setInterval(updateInstitutionResponseCountdowns,30000);


/* Kurum paneli teklif eklentisi hazır işareti.
   Auth callback institution.js çalışırken bu dosyadan önce tetiklendiyse
   gelişmiş teklif/kabul verisini bir kez yeniden yükle. */
window.__institutionOffersReady=true;
window.setTimeout(()=>{
  try{
    if(currentAccount?.institutionId && currentInstitution && typeof loadMatchedQuotes==="function"){
      loadMatchedQuotes();
    }
  }catch(error){
    console.warn("Teklif eklentisi ilk senkronizasyonu yapılamadı:",error);
  }
},0);
