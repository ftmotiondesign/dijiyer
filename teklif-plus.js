(function(){
  const compareIds=new Set();
  const engagementMap=new Map();
  const markedViewed=new Set();
  let activeConversation=null;
  let conversationUnsub=null;
  let enhancing=false;

  const originalOfferHtml=offerHtml;
  offerHtml=function(bundle,offer){
    let html=originalOfferHtml(bundle,offer);
    const institutionId=String(offer.institutionId||offer.id||"");
    const selected=compareIds.has(institutionId);
    const engagement=engagementMap.get(institutionId)||{};
    const viewed=engagement.viewedAt
      ? `<span class="djy-viewed-badge">✓ Görüntülendi</span>`
      : "";
    const revision=engagement.revisionRequestedAt && !engagement.revisionRespondedAt
      ? `<span class="djy-revision-badge">↻ Revizyon bekleniyor</span>`
      : engagement.revisionRespondedAt
        ? `<span class="djy-viewed-badge">✓ Revize edildi</span>`
        : "";

    const tools=`
      <div class="djy-offer-tools" data-tools-for="${safe(institutionId)}">
        <button type="button" class="djy-tool-btn ${selected?"active":""}" data-djy-compare="${safe(institutionId)}">
          ${selected?"✓ Karşılaştırmada":"+ Karşılaştır"}
        </button>
        <button type="button" class="djy-tool-btn" data-djy-message="${safe(institutionId)}">💬 Mesajlaş</button>
        <button type="button" class="djy-tool-btn" data-djy-revision="${safe(institutionId)}">↻ Revizyon İste</button>
        <button type="button" class="djy-tool-btn" data-djy-timeline="${safe(institutionId)}">◷ Süreç</button>
        <div class="djy-offer-meta-flags">${viewed}${revision}</div>
      </div>
      <div class="djy-timeline hidden" data-djy-timeline-box="${safe(institutionId)}">
        ${timelineHtml(bundle,offer,engagement)}
      </div>`;

    html=html.replace('<article class="offer-card">',`<article class="offer-card" data-offer-institution="${safe(institutionId)}">`);
    return html.replace('</article>',tools+'</article>');
  };

  const originalRender=render;
  render=function(bundle){
    originalRender(bundle);
    enhance(bundle);
  };

  function timelineHtml(bundle,offer,engagement){
    const items=[
      ["Talep oluşturuldu",bundle.access.date,true],
      ["Firma teklif verdi",offer.createdAt,true],
      ["Müşteri teklifi görüntüledi",engagement.viewedAt,!!engagement.viewedAt],
      ["Revizyon istendi",engagement.revisionRequestedAt,!!engagement.revisionRequestedAt],
      ["Teklif güncellendi",offer.updatedAt && offer.updatedAt!==offer.createdAt ? offer.updatedAt : null,!!(offer.updatedAt&&offer.updatedAt!==offer.createdAt)],
      ["Revizyon yanıtlandı",engagement.revisionRespondedAt,!!engagement.revisionRespondedAt],
      ["Fiyat kilitlendi",bundle.lock?.institutionId===offer.institutionId ? bundle.lock.lockedAt : null,bundle.lock?.institutionId===offer.institutionId],
      ["Teklif kullanıldı",bundle.lock?.institutionId===offer.institutionId ? bundle.lock.usedAt : null,bundle.lock?.institutionId===offer.institutionId && bundle.lock.status==="used"]
    ];
    return `<div class="djy-timeline-title">Teklif Süreci</div>`+items.map(([label,date,done])=>`
      <div class="djy-timeline-row ${done?"done":""}">
        <span class="djy-timeline-dot"></span>
        <div><strong>${safe(label)}</strong><small>${date?fmtDate(date):"Henüz gerçekleşmedi"}</small></div>
      </div>`).join("");
  }

  function comparePanelHtml(bundle){
    const chosen=bundle.offers.filter(o=>compareIds.has(String(o.institutionId||o.id||"")));
    if(chosen.length<2)return "";
    const minPrice=Math.min(...chosen.map(o=>Number(o.price||0)));
    return `
      <section class="djy-compare-panel" id="djyComparePanel">
        <div class="djy-compare-head">
          <div><span class="eyebrow">TEKLİF KARŞILAŞTIRMA</span><h2>${chosen.length} teklif yan yana</h2></div>
          <button type="button" class="djy-clear-compare" data-djy-clear-compare>Temizle</button>
        </div>
        <div class="djy-compare-grid">
          ${chosen.map(o=>`
            <article class="djy-compare-card">
              <strong>${safe(o.institutionName||"Kurum")}</strong>
              <div class="djy-compare-price">${money(o.price)}</div>
              ${Number(o.price||0)===minPrice?'<span class="djy-lowest">En düşük fiyat</span>':`<span class="djy-price-diff">+${money(Number(o.price||0)-minPrice)}</span>`}
              <dl>
                <div><dt>KDV</dt><dd>${safe(o.vatStatus||"-")}</dd></div>
                <div><dt>Geçerlilik</dt><dd>${fmtDate(o.expiresAt)}</dd></div>
                <div><dt>Ek ücret</dt><dd>${safe(o.extraFee||"Yok")}</dd></div>
              </dl>
              <div class="djy-compare-scope">${safe(o.scope||"")}</div>
              <button type="button" class="lock-btn" data-djy-compare-lock="${safe(o.institutionId)}">🔒 Bu Fiyatı Kilitle</button>
            </article>`).join("")}
        </div>
      </section>`;
  }

  async function enhance(bundle){
    if(enhancing)return;
    enhancing=true;
    try{
      const summary=results.querySelector(".request-summary");
      if(summary){
        summary.insertAdjacentHTML("afterend",comparePanelHtml(bundle));
      }

      bindTools(bundle);
      ensureConversationModal();

      const missing=bundle.offers.filter(o=>{
        const id=String(o.institutionId||o.id||"");
        return id && !engagementMap.has(id);
      });

      if(missing.length){
        const rows=await Promise.all(missing.map(async offer=>{
          const id=String(offer.institutionId||offer.id||"");
          try{
            const snap=await db.collection("quoteRequests").doc(bundle.access.quoteId)
              .collection("engagement").doc(id).get();
            return [id,snap.exists?snap.data():{}];
          }catch(error){
            console.warn("Etkileşim bilgisi okunamadı",error);
            return [id,{}];
          }
        }));
        rows.forEach(([id,data])=>engagementMap.set(id,data));
        bindTools(bundle);
      }

      markVisibleOffers(bundle);
    }finally{
      enhancing=false;
    }
  }

  function bindTools(bundle){
    results.querySelectorAll("[data-djy-compare]").forEach(btn=>{
      btn.onclick=()=>{
        const id=btn.dataset.djyCompare;
        compareIds.has(id)?compareIds.delete(id):compareIds.add(id);
        renderLiveTracking();
      };
    });

    results.querySelectorAll("[data-djy-message]").forEach(btn=>{
      btn.onclick=()=>openConversation(bundle,btn.dataset.djyMessage,"message");
    });

    results.querySelectorAll("[data-djy-revision]").forEach(btn=>{
      btn.onclick=()=>openConversation(bundle,btn.dataset.djyRevision,"revision");
    });

    results.querySelectorAll("[data-djy-timeline]").forEach(btn=>{
      btn.onclick=()=>{
        const box=results.querySelector(`[data-djy-timeline-box="${CSS.escape(btn.dataset.djyTimeline)}"]`);
        if(box)box.classList.toggle("hidden");
      };
    });

    results.querySelectorAll("[data-djy-compare-lock]").forEach(btn=>{
      btn.onclick=()=>{
        const target=results.querySelector(`[data-lock][data-institution-id="${CSS.escape(btn.dataset.djyCompareLock)}"]`);
        if(target)target.click();
      };
    });

    results.querySelector("[data-djy-clear-compare]")?.addEventListener("click",()=>{
      compareIds.clear();
      renderLiveTracking();
    });

    if(bundle.lock?.institutionId){
      const lockedCard=results.querySelector(".locked-card");
      if(lockedCard && !lockedCard.querySelector("[data-djy-locked-message]")){
        lockedCard.insertAdjacentHTML("beforeend",`
          <div class="djy-locked-actions">
            <button type="button" class="djy-tool-btn" data-djy-locked-message>💬 Seçilen firmayla mesajlaş</button>
          </div>`);
        lockedCard.querySelector("[data-djy-locked-message]").onclick=()=>
          openConversation(bundle,String(bundle.lock.institutionId),"message");
      }
    }
  }

  async function markVisibleOffers(bundle){
    const tasks=bundle.offers.map(async offer=>{
      const institutionId=String(offer.institutionId||offer.id||"");
      if(!institutionId||markedViewed.has(institutionId))return;
      markedViewed.add(institutionId);

      const now=new Date().toISOString();
      try{
        await db.collection("quoteRequests").doc(bundle.access.quoteId)
          .collection("engagement").doc(institutionId).set({
            institutionId,
            viewedAt:now,
            viewedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
            lastCustomerActionAt:now
          },{merge:true});
        engagementMap.set(institutionId,{...(engagementMap.get(institutionId)||{}),institutionId,viewedAt:now,lastCustomerActionAt:now});
      }catch(error){
        markedViewed.delete(institutionId);
        console.warn("Teklif görüntülendi bilgisi kaydedilemedi:",error);
      }
    });
    await Promise.all(tasks);
  }

  function ensureConversationModal(){
    if(document.getElementById("djyConversationModal"))return;
    document.body.insertAdjacentHTML("beforeend",`
      <div class="djy-modal hidden" id="djyConversationModal">
        <div class="djy-modal-card">
          <div class="djy-modal-head">
            <div><span class="eyebrow">TEKLİF İLETİŞİMİ</span><h2 id="djyConversationTitle">Firma ile mesajlaş</h2></div>
            <button type="button" class="djy-modal-close" data-djy-close-conversation>×</button>
          </div>
          <div class="djy-conversation-context" id="djyConversationContext"></div>
          <div class="djy-messages" id="djyMessages"><div class="empty">Mesajlar yükleniyor...</div></div>
          <form class="djy-message-form" id="djyMessageForm">
            <textarea id="djyMessageText" rows="3" maxlength="1000" placeholder="Firmaya sorunuzu yazın..."></textarea>
            <div class="djy-message-actions">
              <button type="button" class="djy-revision-btn" id="djyRevisionBtn">↻ Revizyon İste</button>
              <button type="submit" class="lock-btn">Mesaj Gönder</button>
            </div>
          </form>
        </div>
      </div>`);

    document.querySelector("[data-djy-close-conversation]").onclick=closeConversation;
    document.getElementById("djyConversationModal").addEventListener("click",e=>{
      if(e.target.id==="djyConversationModal")closeConversation();
    });
    document.getElementById("djyMessageForm").addEventListener("submit",async e=>{
      e.preventDefault();
      await sendCustomerMessage("message");
    });
    document.getElementById("djyRevisionBtn").onclick=()=>sendCustomerMessage("revision_request");
  }

  function openConversation(bundle,institutionId,mode){
    const offer=bundle.offers.find(o=>String(o.institutionId||o.id||"")===String(institutionId));
    if(!offer)return;
    activeConversation={quoteId:bundle.access.quoteId,institutionId:String(institutionId),offer};
    document.getElementById("djyConversationTitle").textContent=offer.institutionName||"Firma ile mesajlaş";
    document.getElementById("djyConversationContext").innerHTML=
      `<strong>${money(offer.price)}</strong><span>${safe(offer.scope||"")}</span>`;
    document.getElementById("djyMessageText").value=
      mode==="revision"?"Teklifinizi revize etmenizi rica ediyorum. ":"";
    document.getElementById("djyConversationModal").classList.remove("hidden");
    listenConversation();
  }

  function closeConversation(){
    document.getElementById("djyConversationModal")?.classList.add("hidden");
    if(conversationUnsub)conversationUnsub();
    conversationUnsub=null;
    activeConversation=null;
  }

  function listenConversation(){
    if(conversationUnsub)conversationUnsub();
    const box=document.getElementById("djyMessages");
    box.innerHTML='<div class="empty">Mesajlar yükleniyor...</div>';
    conversationUnsub=db.collection("quoteRequests").doc(activeConversation.quoteId)
      .collection("conversations").doc(activeConversation.institutionId)
      .collection("messages").orderBy("date","asc")
      .onSnapshot(snapshot=>{
        const rows=snapshot.docs.map(d=>({id:d.id,...d.data()}));
        box.innerHTML=rows.length?rows.map(messageHtml).join(""):'<div class="empty">Henüz mesaj yok. İlk mesajı siz gönderin.</div>';
        box.scrollTop=box.scrollHeight;
      },error=>{
        console.error(error);
        box.innerHTML='<div class="empty">Mesajlar yüklenemedi. Firestore kurallarını güncelleyin.</div>';
      });
  }

  function messageHtml(msg){
    const mine=msg.sender==="customer";
    const label=msg.kind==="revision_request"?"Revizyon Talebi":msg.kind==="revision_response"?"Revizyon Yanıtı":mine?"Siz":"Firma";
    return `<div class="djy-message ${mine?"mine":"theirs"} ${msg.kind||""}">
      <div class="djy-message-label">${safe(label)}</div>
      <div>${safe(msg.text||"")}</div>
      <small>${fmtDate(msg.date)}</small>
    </div>`;
  }

  async function sendCustomerMessage(kind){
    if(!activeConversation)return;
    const input=document.getElementById("djyMessageText");
    let text=String(input.value||"").trim();
    if(kind==="revision_request"&&!text)text="Teklifinizi revize etmenizi rica ediyorum.";
    if(!text){toast("Mesajınızı yazın.");return;}

    const now=new Date().toISOString();
    try{
      const quoteRef=db.collection("quoteRequests").doc(activeConversation.quoteId);
      await quoteRef.collection("conversations").doc(activeConversation.institutionId)
        .collection("messages").add({
          institutionId:activeConversation.institutionId,
          sender:"customer",
          kind,
          text:text.slice(0,1000),
          date:now,
          createdAtTs:firebase.firestore.FieldValue.serverTimestamp()
        });

      if(kind==="revision_request"){
        await quoteRef.collection("engagement").doc(activeConversation.institutionId).set({
          institutionId:activeConversation.institutionId,
          revisionRequestedAt:now,
          revisionRequestedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
          lastCustomerActionAt:now
        },{merge:true});
        engagementMap.set(activeConversation.institutionId,{
          ...(engagementMap.get(activeConversation.institutionId)||{}),
          revisionRequestedAt:now,
          lastCustomerActionAt:now
        });
        toast("Revizyon talebi firmaya gönderildi.");
      }else{
        toast("Mesaj gönderildi.");
      }
      input.value="";
    }catch(error){
      console.error(error);
      toast("Mesaj gönderilemedi. Firestore kurallarını güncelleyin.");
    }
  }
})();