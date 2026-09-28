(function(){
  const engagementMap=new Map();
  const messagesMap=new Map();
  const unreadMessageMap=new Map();
  const messageWatchers=new Map();
  const openConversationQuoteIds=new Set();
  let communicationRefreshBusy=false;
  let activeMessageQuoteId=null;
  const institutionMessageTitleBase=document.title;

  const baseQuoteCardHtml=quoteCardHtml;
  quoteCardHtml=function(quote,compact=false){
    const html=baseQuoteCardHtml(quote,compact);
    if(compact)return html;

    const engagement=engagementMap.get(quote.id)||{};
    const messages=sortConversationMessages(messagesMap.get(quote.id)||[]);
    const customerMessages=messages.filter(m=>m.sender==="customer").length;
    const unreadMessages=unreadMessageMap.get(quote.id)||0;
    const pendingRevision=!!(engagement.revisionRequestedAt&&!engagement.revisionRespondedAt);

    const viewedHtml=engagement.viewedAt
      ? `<span class="firm-com-badge viewed">✓ Müşteri görüntüledi · ${formatDate(engagement.viewedAt)}</span>`
      : '<span class="firm-com-badge">Henüz görüntülenmedi</span>';
    const revisionHtml=pendingRevision
      ? '<span class="firm-com-badge revision">↻ Revizyon bekleniyor</span>'
      : engagement.revisionRespondedAt
        ? '<span class="firm-com-badge viewed">✓ Revizyon yanıtlandı</span>'
        : "";
    const messageBadge=unreadMessages
      ? `<span class="firm-com-badge message unread">💬 ${unreadMessages} yeni mesaj</span>`
      : customerMessages
        ? `<span class="firm-com-badge message">💬 ${customerMessages} müşteri mesajı</span>`
        : "";

    const timeline=firmTimelineHtml(quote,engagement);

    const panel=`
      <section class="firm-communication-box" data-firm-communication="${offerSafe(quote.id)}">
        <div class="firm-com-status-row">${viewedHtml}${revisionHtml}${messageBadge}</div>
        ${timeline}
        <details class="firm-conversation" data-firm-conversation="${offerSafe(quote.id)}" ${openConversationQuoteIds.has(String(quote.id))?"open":""}>
          <summary>
            💬 Müşteri ile mesajlaş
            <span>${unreadMessages ? '<b class="firm-unread-count">'+unreadMessages+'</b>' : (messages.length?"("+messages.length+")":"")}</span>
          </summary>
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

    const cardHtml=html.replace(
      '<article class="quote-card">',
      '<article class="quote-card" data-quote-card="'+offerSafe(quote.id)+'">'
    );
    return cardHtml.replace('</article>',panel+'</article>');
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

  function sortConversationMessages(rows){
    return [...rows].sort((a,b)=>{
      const aDate=String(a.date||"");
      const bDate=String(b.date||"");
      if(aDate===bDate)return String(a.id||"").localeCompare(String(b.id||""));
      return aDate.localeCompare(bDate);
    });
  }

  function scrollFirmConversationToLatest(quoteId,behavior="auto"){
    requestAnimationFrame(()=>{
      const thread=document.querySelector(
        '[data-firm-thread="'+CSS.escape(String(quoteId))+'"]'
      );
      if(!thread)return;
      thread.scrollTo({
        top:thread.scrollHeight,
        behavior
      });
    });
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

  function messageSeenKey(quoteId){
    return "dijiyerInstitutionMessageSeen_"+String(currentAccount?.institutionId||"")+"_"+String(quoteId);
  }

  function getSeenAt(quoteId){
    return localStorage.getItem(messageSeenKey(quoteId))||"";
  }

  function setSeenAt(quoteId,date){
    if(date) localStorage.setItem(messageSeenKey(quoteId),date);
  }

  function incomingCustomerMessages(quoteId,rows){
    const seenAt=getSeenAt(quoteId);
    return rows.filter(msg =>
      msg.sender==="customer" &&
      (!seenAt || String(msg.date||"")>seenAt)
    );
  }

  function updateInstitutionMessageCount(){
    const total=[...unreadMessageMap.values()]
      .reduce((sum,value)=>sum+Number(value||0),0);

    const badge=document.getElementById("messageTabCount");
    if(badge){
      badge.textContent="💬 "+total;
      badge.classList.toggle("has-unread",total>0);
    }

    document.title=total>0
      ? "("+total+") Yeni Mesaj · "+institutionMessageTitleBase
      : institutionMessageTitleBase;
  }

  function latestCustomerMessage(rows){
    return [...rows]
      .filter(msg=>msg.sender==="customer")
      .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0]||null;
  }

  function markInstitutionConversationRead(quoteId){
    const rows=messagesMap.get(quoteId)||[];
    const latest=latestCustomerMessage(rows);
    if(latest?.date) setSeenAt(quoteId,latest.date);
    unreadMessageMap.set(quoteId,0);
    updateInstitutionMessageCount();
  }

  function showInstitutionMessageAlert(quoteId,msg){
    activeMessageQuoteId=quoteId;
    const alert=document.getElementById("liveMessageAlert");
    const text=document.getElementById("liveMessageAlertText");
    if(!alert)return;

    const quote=quoteRecords.find(item=>String(item.id)===String(quoteId));
    if(text){
      const customer=quote?.name||"Müşteri";
      const preview=String(msg?.text||"").trim();
      text.textContent=customer+(preview?" · "+preview.slice(0,90):" size mesaj gönderdi.");
    }

    alert.classList.remove("hidden");
    if(typeof playNewQuoteSound==="function") playNewQuoteSound();
  }

  function hideInstitutionMessageAlert(){
    document.getElementById("liveMessageAlert")?.classList.add("hidden");
  }

  function stopUnusedMessageWatchers(){
    const activeIds=new Set(quoteRecords.slice(0,40).map(q=>String(q.id)));
    messageWatchers.forEach((unsubscribe,quoteId)=>{
      if(activeIds.has(String(quoteId)))return;
      try{unsubscribe();}catch(_){}
      messageWatchers.delete(quoteId);
      unreadMessageMap.delete(quoteId);
    });
  }

  function startMessageWatcher(quoteId){
    if(!currentAccount?.institutionId||messageWatchers.has(quoteId))return;

    let initial=true;
    const ref=db.collection("quoteRequests").doc(quoteId)
      .collection("conversations").doc(currentAccount.institutionId)
      .collection("messages").orderBy("date","asc");

    const unsubscribe=ref.onSnapshot(snapshot=>{
      const rows=sortConversationMessages(
        snapshot.docs.map(d=>({id:d.id,...d.data()}))
      );
      messagesMap.set(quoteId,rows);

      const unread=incomingCustomerMessages(quoteId,rows);
      unreadMessageMap.set(quoteId,unread.length);
      updateInstitutionMessageCount();

      if(!initial){
        const added=snapshot.docChanges()
          .filter(change=>change.type==="added")
          .map(change=>({id:change.doc.id,...change.doc.data()}))
          .filter(msg=>msg.sender==="customer");

        if(added.length){
          const newest=added.sort(
            (a,b)=>String(b.date||"").localeCompare(String(a.date||""))
          )[0];

          const details=document.querySelector(
            '[data-firm-conversation="'+CSS.escape(String(quoteId))+'"]'
          );

          if(details?.open){
            markInstitutionConversationRead(quoteId);
          }else{
            showInstitutionMessageAlert(quoteId,newest);
          }
        }
      }

      initial=false;
      renderQuotes();
    },error=>{
      console.warn("Mesaj bildirimi dinlenemedi:",quoteId,error);
    });

    messageWatchers.set(quoteId,unsubscribe);
  }

  function startMessageWatchers(){
    stopUnusedMessageWatchers();
    quoteRecords.slice(0,40).forEach(q=>startMessageWatcher(q.id));
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
      const rows=sortConversationMessages(
        msgSnap.docs.map(d=>({id:d.id,...d.data()}))
      );
      messagesMap.set(quoteId,rows);
      unreadMessageMap.set(quoteId,incomingCustomerMessages(quoteId,rows).length);
      updateInstitutionMessageCount();
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
          scrollFirmConversationToLatest(form.dataset.quoteId,"smooth");
        }finally{
          submit.disabled=false;
        }
      };
    });

    institutionQuotesList.querySelectorAll("[data-firm-conversation]").forEach(details=>{
      details.ontoggle=()=>{
        const quoteId=String(details.dataset.firmConversation||"");

        if(details.open){
          openConversationQuoteIds.add(quoteId);
          markInstitutionConversationRead(quoteId);
          hideInstitutionMessageAlert();
          scrollFirmConversationToLatest(quoteId,"smooth");
        }else{
          openConversationQuoteIds.delete(quoteId);
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
    startMessageWatchers();
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

  document.getElementById("liveMessageAlertBtn")?.addEventListener("click",()=>{
    if(!activeMessageQuoteId)return;
    hideInstitutionMessageAlert();
    quotePanelFilter.value="";
    setPanelTab("quotes");
    syncQuoteShortcutActive();
    renderQuotes();

    requestAnimationFrame(()=>{
      const details=document.querySelector(
        '[data-firm-conversation="'+CSS.escape(String(activeMessageQuoteId))+'"]'
      );
      const card=document.querySelector(
        '[data-quote-card="'+CSS.escape(String(activeMessageQuoteId))+'"]'
      );

      if(details){
        openConversationQuoteIds.add(String(activeMessageQuoteId));
        details.open=true;
        markInstitutionConversationRead(activeMessageQuoteId);
        scrollFirmConversationToLatest(activeMessageQuoteId,"smooth");
      }
      card?.scrollIntoView({behavior:"smooth",block:"center"});
    });
  });

  document.getElementById("liveMessageAlertClose")?.addEventListener("click",hideInstitutionMessageAlert);

  setInterval(async()=>{
    if(document.hidden||!currentInstitution||!quoteRecords.length)return;
    await loadCommunicationData();
    renderQuotes();
  },30000);
})();