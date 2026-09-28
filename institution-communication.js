(function(){
  const engagementMap=new Map();
  const messagesMap=new Map();
  let communicationRefreshBusy=false;

  const baseQuoteCardHtml=quoteCardHtml;
  quoteCardHtml=function(quote,compact=false){
    const html=baseQuoteCardHtml(quote,compact);
    if(compact)return html;

    const engagement=engagementMap.get(quote.id)||{};
    const messages=messagesMap.get(quote.id)||[];
    const customerMessages=messages.filter(m=>m.sender==="customer").length;
    const pendingRevision=!!(engagement.revisionRequestedAt&&!engagement.revisionRespondedAt);

    const viewedHtml=engagement.viewedAt
      ? `<span class="firm-com-badge viewed">✓ Müşteri görüntüledi · ${formatDate(engagement.viewedAt)}</span>`
      : '<span class="firm-com-badge">Henüz görüntülenmedi</span>';
    const revisionHtml=pendingRevision
      ? '<span class="firm-com-badge revision">↻ Revizyon bekleniyor</span>'
      : engagement.revisionRespondedAt
        ? '<span class="firm-com-badge viewed">✓ Revizyon yanıtlandı</span>'
        : "";
    const messageBadge=customerMessages
      ? `<span class="firm-com-badge message">💬 ${customerMessages} müşteri mesajı</span>`
      : "";

    const timeline=firmTimelineHtml(quote,engagement);

    const panel=`
      <section class="firm-communication-box" data-firm-communication="${offerSafe(quote.id)}">
        <div class="firm-com-status-row">${viewedHtml}${revisionHtml}${messageBadge}</div>
        ${timeline}
        <details class="firm-conversation">
          <summary>💬 Müşteri ile mesajlaş <span>${messages.length?"("+messages.length+")":""}</span></summary>
          <div class="firm-message-thread" data-firm-thread="${offerSafe(quote.id)}">
            ${messages.length?messages.map(firmMessageHtml).join(""):'<div class="firm-empty-message">Henüz mesaj yok.</div>'}
          </div>
          <form class="firm-message-form" data-firm-message-form data-quote-id="${offerSafe(quote.id)}">
            <textarea name="text" maxlength="1000" rows="2" placeholder="Müşteriye mesaj yazın..."></textarea>
            <div class="firm-message-actions">
              <button type="button" class="secondary-action" data-firm-refresh-chat="${offerSafe(quote.id)}">↻ Yenile</button>
              <button type="submit" class="primary-action">Mesaj Gönder</button>
            </div>
          </form>
        </details>
      </section>`;

    return html.replace('</article>',panel+'</article>');
  };

  function firmTimelineHtml(quote,engagement){
    const offer=institutionOfferMap.get(quote.id);
    const lock=institutionLockMap.get(quote.id);
    const items=[
      ["Talep geldi",quote.date,true],
      ["Teklif verildi",offer?.createdAt,!!offer],
      ["Müşteri görüntüledi",engagement.viewedAt,!!engagement.viewedAt],
      ["Revizyon istendi",engagement.revisionRequestedAt,!!engagement.revisionRequestedAt],
      ["Teklif güncellendi",offer?.updatedAt&&offer?.updatedAt!==offer?.createdAt?offer.updatedAt:null,!!(offer?.updatedAt&&offer?.updatedAt!==offer?.createdAt)],
      ["Fiyat kilitlendi",lock?.lockedAt,!!lock],
      ["Kullanıldı",lock?.usedAt,lock?.status==="used"]
    ];
    return `<div class="firm-progress">${items.map(([label,date,done])=>`
      <div class="firm-progress-step ${done?"done":""}">
        <span></span><div><strong>${offerSafe(label)}</strong><small>${date?formatDate(date):"Bekliyor"}</small></div>
      </div>`).join("")}</div>`;
  }

  function firmMessageHtml(msg){
    const mine=msg.sender==="institution";
    const label=msg.kind==="revision_request"?"REVİZYON TALEBİ":msg.kind==="revision_response"?"REVİZYON YANITI":mine?"SİZ":"MÜŞTERİ";
    return `<div class="firm-message ${mine?"mine":"customer"} ${msg.kind||""}">
      <span>${offerSafe(label)}</span>
      <div>${offerSafe(msg.text||"")}</div>
      <small>${formatDate(msg.date)}</small>
    </div>`;
  }

  async function loadCommunicationForQuote(quoteId){
    if(!currentAccount?.institutionId)return;
    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    try{
      const [engSnap,msgSnap]=await Promise.all([
        quoteRef.collection("engagement").doc(currentAccount.institutionId).get(),
        quoteRef.collection("conversations").doc(currentAccount.institutionId)
          .collection("messages").orderBy("date","asc").get()
      ]);
      engagementMap.set(quoteId,engSnap.exists?engSnap.data():{});
      messagesMap.set(quoteId,msgSnap.docs.map(d=>({id:d.id,...d.data()})));
    }catch(error){
      console.warn("Teklif iletişim verileri yüklenemedi:",quoteId,error);
      if(!engagementMap.has(quoteId))engagementMap.set(quoteId,{});
      if(!messagesMap.has(quoteId))messagesMap.set(quoteId,[]);
    }
  }

  async function loadCommunicationData(){
    if(communicationRefreshBusy||!currentAccount?.institutionId)return;
    communicationRefreshBusy=true;
    try{
      await Promise.all(quoteRecords.slice(0,40).map(q=>loadCommunicationForQuote(q.id)));
    }finally{
      communicationRefreshBusy=false;
    }
  }

  const baseRenderQuotes=renderQuotes;
  renderQuotes=function(){
    baseRenderQuotes();
    bindCommunicationUi();
  };

  function bindCommunicationUi(){
    institutionQuotesList.querySelectorAll("[data-firm-message-form]").forEach(form=>{
      form.onsubmit=async e=>{
        e.preventDefault();
        const text=String(form.elements.text.value||"").trim();
        if(!text)return;
        const submit=form.querySelector('button[type="submit"]');
        submit.disabled=true;
        try{
          await sendFirmMessage(form.dataset.quoteId,text,"message");
          form.reset();
          await loadCommunicationForQuote(form.dataset.quoteId);
          renderQuotes();
        }finally{
          submit.disabled=false;
        }
      };
    });

    institutionQuotesList.querySelectorAll("[data-firm-refresh-chat]").forEach(btn=>{
      btn.onclick=async()=>{
        btn.disabled=true;
        await loadCommunicationForQuote(btn.dataset.firmRefreshChat);
        renderQuotes();
      };
    });
  }

  async function sendFirmMessage(quoteId,text,kind){
    const now=new Date().toISOString();
    try{
      await db.collection("quoteRequests").doc(quoteId)
        .collection("conversations").doc(currentAccount.institutionId)
        .collection("messages").add({
          institutionId:currentAccount.institutionId,
          sender:"institution",
          kind:kind||"message",
          text:String(text||"").slice(0,1000),
          date:now,
          createdAtTs:firebase.firestore.FieldValue.serverTimestamp()
        });
    }catch(error){
      console.error("Mesaj gönderilemedi:",error);
      alert("Mesaj gönderilemedi. Firestore kurallarını güncelleyin.");
      throw error;
    }
  }

  const baseLoadMatchedQuotes=loadMatchedQuotes;
  loadMatchedQuotes=async function(){
    await baseLoadMatchedQuotes();
    await loadCommunicationData();
    renderQuotes();
    renderSummary();
  };

  const baseSaveRealOffer=saveRealOffer;
  saveRealOffer=async function(form){
    const quoteId=form.dataset.quoteId;
    const before=institutionOfferMap.get(quoteId)?.updatedAt||null;
    const engagement=engagementMap.get(quoteId)||{};
    const revisionPending=!!(engagement.revisionRequestedAt&&!engagement.revisionRespondedAt);

    await baseSaveRealOffer(form);

    const after=institutionOfferMap.get(quoteId)?.updatedAt||null;
    if(revisionPending&&after&&after!==before){
      const now=new Date().toISOString();
      try{
        await sendFirmMessage(
          quoteId,
          "İstediğiniz revizyona göre teklifimizi güncelledik. Yeni fiyat ve kapsamı teklif ekranından inceleyebilirsiniz.",
          "revision_response"
        );
        await db.collection("quoteRequests").doc(quoteId)
          .collection("engagement").doc(currentAccount.institutionId).set({
            institutionId:currentAccount.institutionId,
            revisionRespondedAt:now,
            revisionRespondedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
            lastInstitutionActionAt:now
          },{merge:true});
        await loadCommunicationForQuote(quoteId);
        renderQuotes();
      }catch(error){
        console.warn("Revizyon yanıtı kaydedilemedi:",error);
      }
    }
  };

  setInterval(async()=>{
    if(document.hidden||!currentInstitution||!quoteRecords.length)return;
    await loadCommunicationData();
    renderQuotes();
  },30000);
})();