(function(){
  const engagementMap=new Map();
  const messagesMap=new Map();
  const unreadMessageMap=new Map();
  const messageWatchers=new Map();
  const openConversationQuoteIds=new Set();
  let communicationRefreshBusy=false;
  let activeMessageQuoteId=null;
  let activeInstitutionChatQuoteId=null;
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
        <button type="button" class="firm-open-chat-btn ${unreadMessages?"has-unread":""}" data-open-firm-chat="${offerSafe(quote.id)}">
          <span>💬 Müşteri ile mesajlaş</span>
          <span class="firm-open-chat-meta">${unreadMessages ? unreadMessages+" yeni mesaj" : (messages.length ? messages.length+" mesaj" : "Sohbeti aç")}</span>
        </button>
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

  function formatChatTime(value){
    if(!value)return "";
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    return date.toLocaleTimeString("tr-TR",{
      hour:"2-digit",
      minute:"2-digit"
    });
  }

  function chatDayKey(value){
    if(!value)return "";
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return "";
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }

  function chatDayLabel(value){
    if(!value)return "";
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return "";

    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
    const day=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
    const diff=Math.round((today-day)/86400000);

    if(diff===0)return "Bugün";
    if(diff===1)return "Dün";
    return d.toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"});
  }

  function renderFirmConversation(rows,quote){
    let previousDay="";
    let previousSender="";
    return rows.map(msg=>{
      const day=chatDayKey(msg.date);
      const dayDivider=day!==previousDay
        ? '<div class="chat-day-divider"><span>'+offerSafe(chatDayLabel(msg.date))+'</span></div>'
        : '';
      const sameSender=previousDay===day && previousSender===msg.sender;
      previousDay=day;
      previousSender=msg.sender;
      return dayDivider + firmMessageHtml(msg,sameSender,quote);
    }).join("");
  }

  function firmMessageHtml(msg,sameSender=false,quote=null){
    const mine=msg.sender==="institution";
    const text=offerSafe(msg.text||"").replace(/\n/g,"<br>");
    const time=offerSafe(formatChatTime(msg.date));
    const institutionName=offerSafe(currentInstitution?.name||currentAccount?.institutionName||"Firma");
    const customerName=offerSafe(quote?.name||"Müşteri");
    const isOfferUpdate=/^(Teklif güncellendi|Revizyon talebinize göre teklif güncellendi)/i.test(String(msg.text||""));
    const author=mine ? "Firma · "+institutionName+(isOfferUpdate?" · Teklif Güncellemesi":"") : "Müşteri · "+customerName;
    return `
      <div class="firm-message-row ${mine?"mine":"theirs"} ${sameSender?"same-sender":""}">
        <div class="firm-message ${mine?"mine":"customer"} ${isOfferUpdate?"offer-update-message":""} ${msg.kind||""}">
          <div class="firm-message-author">${author}</div>
          <div class="firm-message-text">${text}</div>
          <div class="firm-message-meta">
            <span class="firm-message-time">${time}</span>
            ${mine?'<span class="firm-message-check">✓✓</span>':""}
          </div>
        </div>
      </div>
    `;
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

    const firmHomeMessageCount=document.getElementById("firmHomeMessageCount");
    if(firmHomeMessageCount){
      firmHomeMessageCount.textContent=String(total);
      firmHomeMessageCount.classList.toggle("has-unread",total>0);
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
      if(String(activeInstitutionChatQuoteId||"")===String(quoteId)){
        renderInstitutionChat();
        scrollInstitutionChatToBottom("smooth");
      }
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

  function ensureInstitutionChatModal(){
    if(document.getElementById("institutionChatModal"))return;

    document.body.insertAdjacentHTML("beforeend",`
      <div class="institution-chat-modal hidden" id="institutionChatModal">
        <div class="institution-chat-shell">
          <div class="institution-chat-header">
            <button type="button" class="institution-chat-back" id="institutionChatClose">←</button>
            <div class="institution-chat-avatar">👤</div>
            <div class="institution-chat-title">
              <strong id="institutionChatCustomer">Müşteri</strong>
              <span id="institutionChatService">Teklif görüşmesi</span>
            </div>
          </div>

          <div class="institution-chat-messages" id="institutionChatMessages">
            <div class="firm-empty-message">Mesajlar yükleniyor...</div>
          </div>

          <form class="institution-chat-compose" id="institutionChatForm">
            <textarea id="institutionChatText" maxlength="1000" rows="1" placeholder="Mesaj yazın"></textarea>
            <button type="submit" class="institution-chat-send" aria-label="Gönder">➤</button>
          </form>
        </div>
      </div>
    `);

    document.getElementById("institutionChatClose").onclick=closeInstitutionChat;

    document.getElementById("institutionChatModal").addEventListener("click",event=>{
      if(event.target.id==="institutionChatModal")closeInstitutionChat();
    });

    const textarea=document.getElementById("institutionChatText");
    textarea.addEventListener("keydown",event=>{
      if(event.key==="Enter" && !event.shiftKey && !event.isComposing){
        event.preventDefault();
        document.getElementById("institutionChatForm").requestSubmit();
      }
    });

    document.getElementById("institutionChatForm").addEventListener("submit",async event=>{
      event.preventDefault();
      const quoteId=activeInstitutionChatQuoteId;
      const input=document.getElementById("institutionChatText");
      const text=String(input.value||"").trim();
      if(!quoteId||!text)return;

      const send=document.querySelector(".institution-chat-send");
      send.disabled=true;

      try{
        await sendFirmMessage(quoteId,text,"message");
        input.value="";
        await loadCommunicationForQuote(quoteId);
        renderInstitutionChat();
        scrollInstitutionChatToBottom("smooth");
      }finally{
        send.disabled=false;
        input.focus();
      }
    });
  }

  function scrollInstitutionChatToBottom(behavior="auto"){
    const box=document.getElementById("institutionChatMessages");
    if(!box)return;

    const run=()=>{
      box.scrollTo({
        top:box.scrollHeight,
        behavior
      });
    };

    requestAnimationFrame(()=>{
      requestAnimationFrame(run);
    });

    setTimeout(run,80);
  }

  function renderInstitutionChat(){
    if(!activeInstitutionChatQuoteId)return;

    const quote=quoteRecords.find(item=>String(item.id)===String(activeInstitutionChatQuoteId));
    const rows=sortConversationMessages(messagesMap.get(activeInstitutionChatQuoteId)||[]);
    const box=document.getElementById("institutionChatMessages");
    if(!box)return;

    document.getElementById("institutionChatCustomer").textContent=quote?.name||"Müşteri";
    document.getElementById("institutionChatService").textContent=
      [quote?.service,quote?.city,quote?.district].filter(Boolean).join(" · ")||"Teklif görüşmesi";

    box.innerHTML=rows.length
      ? renderFirmConversation(rows,quote)
      : '<div class="firm-empty-message">Henüz mesaj yok. İlk mesajı siz gönderin.</div>';

    scrollInstitutionChatToBottom("auto");
  }

  function openInstitutionChat(quoteId){
    ensureInstitutionChatModal();
    activeInstitutionChatQuoteId=String(quoteId);
    markInstitutionConversationRead(activeInstitutionChatQuoteId);
    hideInstitutionMessageAlert();

    const modal=document.getElementById("institutionChatModal");
    modal.classList.remove("hidden");
    renderInstitutionChat();
    scrollInstitutionChatToBottom("auto");

    setTimeout(()=>{
      scrollInstitutionChatToBottom("auto");
      document.getElementById("institutionChatText")?.focus();
    },100);
  }

  function closeInstitutionChat(){
    document.getElementById("institutionChatModal")?.classList.add("hidden");
    activeInstitutionChatQuoteId=null;
  }

  function bindCommunicationUi(){
    ensureInstitutionChatModal();

    institutionQuotesList.querySelectorAll("[data-open-firm-chat]").forEach(button=>{
      button.onclick=()=>openInstitutionChat(button.dataset.openFirmChat);
    });

    if(activeInstitutionChatQuoteId){
      renderInstitutionChat();
    }
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

  function updatedOfferValidityText(offer){
    if(!offer?.expiresAt)return "";
    const start=offer.updatedAt || offer.createdAt;
    const startMs=new Date(start||0).getTime();
    const endMs=new Date(offer.expiresAt).getTime();
    if(!Number.isFinite(startMs)||!Number.isFinite(endMs)||endMs<=startMs)return "";
    const hours=Math.max(1,Math.round((endMs-startMs)/3600000));
    if(hours===1)return "1 saat";
    if(hours===3)return "3 saat";
    if(hours===12)return "12 saat";
    if(hours===24)return "24 saat";
    if(hours===72)return "3 gün";
    if(hours===168)return "7 gün";
    if(hours>24 && hours%24===0)return (hours/24)+" gün";
    return hours+" saat";
  }

  function offerUpdateNotificationText(offer,revisionPending,beforeOffer=null){
    const validity=updatedOfferValidityText(offer);
    const price=new Intl.NumberFormat("tr-TR").format(Number(offer?.price||0))+" TL";
    const oldPrice=beforeOffer ? Number(beforeOffer.price||0) : 0;
    const newPrice=Number(offer?.price||0);
    const version=Math.max(1,Number(offer?.offerVersion||1));
    const parts=[
      revisionPending
        ? "Revizyon talebinize göre teklif güncellendi."
        : version===2
          ? "Kurum size 2. teklifini gönderdi."
          : "Teklif güncellendi."
    ];
    if(beforeOffer && oldPrice!==newPrice){
      parts.push("Önceki fiyat: "+new Intl.NumberFormat("tr-TR").format(oldPrice)+" TL.");
      parts.push("Yeni fiyat: "+price+".");
    }else{
      parts.push("Fiyat: "+price+".");
    }

    if(validity)parts.push("Bu fiyat "+validity+" için geçerlidir.");
    if(offer?.expiresAt)parts.push("Son kabul: "+formatDate(offer.expiresAt)+".");
    if(offer?.conditions)parts.push("Kabul şartı: "+offer.conditions);

    return parts.join(" ");
  }

  const baseSaveRealOffer=saveRealOffer;
  saveRealOffer=async function(form){
    const quoteId=form.dataset.quoteId;
    const beforeOffer=institutionOfferMap.get(quoteId) || null;
    const before=beforeOffer?.updatedAt||null;
    const engagement=engagementMap.get(quoteId)||{};
    const revisionPending=!!(engagement.revisionRequestedAt&&!engagement.revisionRespondedAt);

    await baseSaveRealOffer(form);

    const updatedOffer=institutionOfferMap.get(quoteId) || null;
    const after=updatedOffer?.updatedAt||null;
    const wasUpdated=!!beforeOffer && !!after && after!==before;

    if(wasUpdated){
      const now=new Date().toISOString();
      try{
        await sendFirmMessage(
          quoteId,
          offerUpdateNotificationText(updatedOffer,revisionPending,beforeOffer),
          revisionPending ? "revision_response" : "message"
        );

        if(revisionPending){
          await db.collection("quoteRequests").doc(quoteId)
            .collection("engagement").doc(currentAccount.institutionId).set({
              institutionId:currentAccount.institutionId,
              revisionRespondedAt:now,
              revisionRespondedAtTs:firebase.firestore.FieldValue.serverTimestamp(),
              lastInstitutionActionAt:now
            },{merge:true});
        }

        await loadCommunicationForQuote(quoteId);
        if(activeInstitutionChatQuoteId===String(quoteId)){
          renderInstitutionChat();
          scrollInstitutionChatToBottom("smooth");
        }
        renderQuotes();
      }catch(error){
        console.warn("Teklif güncelleme bildirimi kaydedilemedi:",error);
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

      card?.scrollIntoView({behavior:"smooth",block:"center"});
      openInstitutionChat(activeMessageQuoteId);
    });
  });

  document.getElementById("liveMessageAlertClose")?.addEventListener("click",hideInstitutionMessageAlert);

  setInterval(async()=>{
    if(document.hidden||!currentInstitution||!quoteRecords.length)return;
    await loadCommunicationData();
    renderQuotes();
  },30000);
})();