let institutionOfferMap = new Map();
let institutionLockMap = new Map();

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

function sellerOfferState(quote){
  const offer=institutionOfferMap.get(quote.id);
  const lock=institutionLockMap.get(quote.id);
  const legacy=responseMap.get(quote.id);

  if(lock){
    if(lock.institutionId === currentAccount.institutionId){
      if(lock.status === "used") return "used";
      if(lock.expiresAt && new Date(lock.expiresAt).getTime() <= Date.now()) return "expired";
      return "locked";
    }
    return "closed";
  }
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
    locked:["Kayıt Bekliyor","status-interested"],
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

    await loadQuoteResponses();

    institutionOfferMap = new Map();
    institutionLockMap = new Map();

    await Promise.all(quoteRecords.map(async quote=>{
      const quoteRef=db.collection("quoteRequests").doc(quote.id);
      const [offerSnap,lockSnap]=await Promise.all([
        quoteRef.collection("offers").doc(currentAccount.institutionId).get(),
        quoteRef.collection("locks").doc("main").get()
      ]);
      if(offerSnap.exists) institutionOfferMap.set(quote.id,{id:offerSnap.id,...offerSnap.data()});
      if(lockSnap.exists) institutionLockMap.set(quote.id,lockSnap.data());
    }));

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

  const rows = quoteRecords
    .filter(quote => sellerOfferState(quote) === "new")
    .slice(0, 4);

  if (countEl) {
    countEl.textContent = String(
      quoteRecords.filter(quote => sellerOfferState(quote) === "new").length
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
  const states = quoteRecords.map(q => sellerOfferState(q));
  const newCount = states.filter(state => state === "new").length;
  const offeredCount = states.filter(state => state === "offered").length;
  const lockedCount = states.filter(state => state === "locked").length;
  const usedCount = states.filter(state => state === "used").length;
  const completedRegistrationCount = document.getElementById("completedRegistrationCount");
  if (completedRegistrationCount) completedRegistrationCount.textContent = String(usedCount);

  if (typeof updatePersistentNewRequestCard === "function") updatePersistentNewRequestCard(newCount);

  document.getElementById("newQuoteCount").textContent = newCount;
  document.getElementById("totalQuoteCount").textContent = quoteRecords.length;
  document.getElementById("quoteTabCount").textContent = newCount;

  document.getElementById("workNewCount").textContent = newCount;
  document.getElementById("workLockedCount").textContent = lockedCount;
  document.getElementById("pendingQuoteCount").textContent = newCount;
  document.getElementById("offeredQuoteCount").textContent = offeredCount;
  document.getElementById("lockedQuoteCount").textContent = lockedCount;
  document.getElementById("latestQuoteTime").textContent =
    quoteRecords.length ? formatRelativeTime(quoteRecords[0].date) : "-";

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
    all: quoteRecords.length,
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

  const latest=quoteRecords.slice(0,3);
  recentQuotes.innerHTML=latest.length
    ? latest.map(q=>quoteCardHtml(q,true)).join("")
    : '<div class="empty-state">Henüz uygun teklif talebi yok.</div>';

  recentQuotes.querySelectorAll("[data-open-quotes]").forEach(btn=>{
    btn.addEventListener("click",()=>setPanelTab("quotes"));
  });
};

function sellerOfferFormHtml(quote,offer){
  const price=offer?.price ?? "";
  const scope=offer?.scope || quote.note || quote.service || "";
  const vat=offer?.vatStatus || "Dahil";
  const conditions=offer?.conditions || "";
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
        <select name="extraFee">
          <option value="Yok" ${offer?.extraFee!=="Var"?"selected":""}>Yok</option>
          <option value="Var" ${offer?.extraFee==="Var"?"selected":""}>Var</option>
        </select>
      </label>
      <label class="full">Kabul / Özel Şartlar <span style="font-weight:400">(opsiyonel)</span>
        <input name="conditions" value="${offerSafe(conditions)}" placeholder="Örn. Bu fiyat yalnızca belirtilen ürün/hizmet için geçerlidir.">
      </label>
      <div class="offer-validity-preview full">
        <strong>⏱ Geçerlilik ve gerçek kayıt:</strong>
        Seçtiğiniz süre fiyat ve özelliklerin son geçerlilik süresidir. Müşteri teklifi kabul ettikten sonra bu süre içinde kurumunuza gelerek veya sizinle doğrudan görüşerek gerçek kaydını tamamlamazsa teklif süresi dolar ve güncel koşullar yeniden görüşülür.
        <br><strong>🛡️ Ödeme politikası:</strong> Dijiyer üzerinden ödeme alınmaz. Ücret, kapora veya kayıt bedeli yalnızca kurum ile müşteri arasında doğrudan yapılır.
        ${offer?`<br><strong>🔔 Güncelleme:</strong> Teklifi değiştirdiğinizde müşteriye otomatik bildirim gider ve yeni geçerlilik süresi başlar.`:""}
      </div>
      <button class="send-real-offer-btn full" type="submit">${offer ? "Teklifi Güncelle" : "Teklif Gönder"}</button>
    </form>
  `;
}

quoteCardHtml = function(quote,compact=false){
  const state=sellerOfferState(quote);
  const [statusText,statusClass]=sellerStateMeta(state);
  const offer=institutionOfferMap.get(quote.id);
  const lock=institutionLockMap.get(quote.id);
  const sameDistrict=String(quote.district||"").toLocaleLowerCase("tr-TR") === String(currentInstitution.district||"").toLocaleLowerCase("tr-TR");

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
        <details style="margin-top:10px">
          <summary style="cursor:pointer;font-weight:800;color:#1677ff">Teklifi düzenle</summary>
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
          <span class="quote-status status-interested">⏳ Kayıt Bekliyor</span>
        </div>
        <div class="quote-note">${offerSafe(lock.scope || "")}</div>
        <div class="offer-lock-notice"><strong>Müşteri teklifi kabul etti.</strong> Kabul edilen fiyat ve şartlar artık değiştirilemez. Gerçek kayıt için müşterinin en geç <b>${formatDate(lock.registrationDeadlineAt || lock.expiresAt)}</b> tarihine kadar kurumunuzla doğrudan işlemi tamamlaması gerekir. Dijiyer üzerinden ödeme alınmaz.</div>
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

  return `
    <article class="quote-card">
      <div class="quote-card-head">
        <div>
          <div class="quote-service">${offerSafe(quote.service || "Teklif Talebi")}</div>
          <div class="quote-location">
            📍 ${offerSafe([quote.city,quote.district].filter(Boolean).join(" / "))}
            ${sameDistrict ? '<span class="district-badge">Aynı ilçe</span>' : '<span class="city-badge">Aynı şehir</span>'}
          </div>
        </div>
        <span class="quote-status ${statusClass}">${statusText}</span>
      </div>

      <div class="quote-customer">
        <div><small>Müşteri</small><strong>${offerSafe(quote.name || "-")}</strong></div>
        <div><small>Telefon</small><strong>${offerSafe(quote.phone || "-")}</strong></div>
        <div><small>Tarih</small><strong>${formatDate(quote.date)}</strong></div>
      </div>

      ${quote.note ? `<div class="quote-note">${offerSafe(quote.note)}</div>` : ""}
      ${actionArea}
    </article>
  `;
};

renderQuotes = function(){
  const filter=quotePanelFilter.value;
  const rows=quoteRecords.filter(q=>!filter || sellerOfferState(q)===filter);

  institutionQuotesList.innerHTML=rows.length
    ? rows.map(q=>quoteCardHtml(q)).join("")
    : '<div class="empty-state">Bu filtreye uygun teklif bulunamadı.</div>';

  institutionQuotesList.querySelectorAll("[data-real-offer-form]").forEach(form=>{
    form.addEventListener("submit",async e=>{
      e.preventDefault();
      await saveRealOffer(form);
    });
  });

  institutionQuotesList.querySelectorAll('[data-response="not_interested"]').forEach(btn=>{
    btn.addEventListener("click",async()=>{
      await saveQuoteResponse(btn.dataset.quoteId,"not_interested");
      renderQuotes();
      renderSummary();
    });
  });
};

async function saveRealOffer(form){
  const quoteId=form.dataset.quoteId;
  const quote=quoteRecords.find(q=>q.id===quoteId);
  const lock=institutionLockMap.get(quoteId);
  const existing=institutionOfferMap.get(quoteId);

  if(lock){
    alert(lock.institutionId===currentAccount.institutionId
      ? "Müşteri bu teklifi kabul etti. Fiyat ve şartlar artık değiştirilemez."
      : "Müşteri başka bir teklifi seçti.");
    return;
  }

  if(existing){
    const ok=window.confirm(
      "Teklifi güncellemek üzeresiniz. Yeni fiyat/şartlar müşteriye bildirilecek ve yeni geçerlilik süresi şimdi başlayacak. Devam edilsin mi?"
    );
    if(!ok)return;
  }

  const price=Number(form.elements.price.value);
  if(!price || price<=0){ alert("Geçerli bir teklif fiyatı girin."); return; }

  const hours=Number(form.elements.durationHours.value || 48);
  const expiry=new Date(Date.now()+hours*3600000);
  const code=existing?.offerCode || makeOfferCode();
  const submit=form.querySelector('button[type="submit"]');
  const oldText=submit.textContent;
  submit.disabled=true; submit.textContent="Kaydediliyor...";

  const data={
    institutionId:currentAccount.institutionId,
    institutionName:currentInstitution.name || currentAccount.institutionName || "Kurum",
    offerCode:code,
    price,
    vatStatus:form.elements.vatStatus.value,
    scope:form.elements.scope.value.trim(),
    extraFee:form.elements.extraFee.value,
    conditions:form.elements.conditions.value.trim(),
    expiresAt:expiry.toISOString(),
    expiresAtTs:firebase.firestore.Timestamp.fromDate(expiry),
    status:"offered",
    validityHours:hours,
    registrationRequired:true,
    platformPayment:false,
    paymentPolicy:"offline_direct_between_customer_and_institution",
    createdAt:existing?.createdAt || new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };

  try{
    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    const offerRef=quoteRef.collection("offers").doc(currentAccount.institutionId);
    const lookupRef=db.collection("offerLookup").doc(code);

    const batch=db.batch();
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
    if(responseMap.get(quoteId)?.status==="not_interested"){
      await saveQuoteResponse(quoteId,"interested");
    }
    renderQuotes(); renderSummary();
  }catch(error){
    console.error("Gerçek teklif kaydedilemedi:",error);
    alert("Teklif kaydedilemedi. Firestore kurallarını kontrol edin.");
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