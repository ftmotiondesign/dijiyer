(function(){
  const compareIds=new Set();
  const engagementMap=new Map();
  const markedViewed=new Set();
  const engagementFetchedAt=new Map();
  const customerMessageRows=new Map();
  const customerUnreadMap=new Map();
  const customerMessageWatchers=new Map();
  let activeConversation=null;
  let conversationUnsub=null;
  let enhancing=false;
  let watchedQuoteId=null;
  let customerAudioUnlocked=false;
  let customerResumeBusy=false;
  let lastCustomerResumeSync=0;
  let customerOfferUnreadCount=0;
  const customerMessageTitleBase=document.title;

  const originalOfferHtml=offerHtml;
  offerHtml=function(bundle,offer){
    let html=originalOfferHtml(bundle,offer);
    const institutionId=String(offer.institutionId||offer.id||"");
    const selected=compareIds.has(institutionId);
    const engagement=engagementMap.get(institutionId)||{};
    const viewed=engagement.viewedAt
      ? `<span class="djy-viewed-badge">✓ Görüntülendi</span>`
      : "";
    const unreadMessages=customerUnreadMap.get(institutionId)||0;
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
        <button type="button" class="djy-tool-btn ${unreadMessages?"has-unread":""}" data-djy-message="${safe(institutionId)}">
          💬 Mesajlaş
          ${unreadMessages?'<span class="djy-message-badge">'+unreadMessages+'</span>':""}
        </button>
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
      ["Teklif kabul edildi / kayıt bekliyor",bundle.lock?.institutionId===offer.institutionId ? (bundle.lock.acceptedAt||bundle.lock.lockedAt) : null,bundle.lock?.institutionId===offer.institutionId],
      ["Gerçek kayıt tamamlandı",bundle.lock?.institutionId===offer.institutionId ? (bundle.lock.registrationCompletedAt||bundle.lock.usedAt) : null,bundle.lock?.institutionId===offer.institutionId && bundle.lock.status==="used"]
    ];
    return `<div class="djy-timeline-title">Teklif Süreci</div>`+items.map(([label,date,done])=>`
      <div class="djy-timeline-row ${done?"done":""}">
        <span class="djy-timeline-dot"></span>
        <div><strong>${safe(label)}</strong><small>${date?fmtDate(date):"Henüz gerçekleşmedi"}</small></div>
      </div>`).join("");
  }

  function comparePanelHtml(bundle){
    if(bundle.lock)return "";
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
                <div><dt>Ek ücret</dt><dd>${o.extraFee==="Var" ? money(o.extraFeeAmount||0)+" · "+safe(o.extraFeeRequired||"Zorunlu") : "Yok"}</dd></div>
              </dl>
              ${o.extraFee==="Var" && o.extraFeeNote ? `<div class="djy-compare-scope"><b>Ek ücret:</b> ${safe(o.extraFeeNote)}</div>` : ""}
              <div class="djy-compare-scope">${safe(o.scope||"")}</div>
              <button type="button" class="lock-btn" data-djy-compare-lock="${safe(o.institutionId)}">✓ Bu Teklifi Kabul Et</button>
            </article>`).join("")}
        </div>
      </section>`;
  }

  async function enhance(bundle){
    if(enhancing)return;
    enhancing=true;
    try{
      if(bundle.lock){
        compareIds.clear();
        results.querySelectorAll("[data-lock], [data-lock-consent], [data-djy-compare-lock]").forEach(control=>control.remove());
      }
      const summary=results.querySelector(".request-summary");
      if(summary){
        summary.insertAdjacentHTML("afterend",comparePanelHtml(bundle));
      }

      bindTools(bundle);
      ensureConversationModal();
      ensureCustomerMessageAlert();
      ensureCustomerMessageWatchers(bundle);

      const nowMs=Date.now();
      const missing=bundle.offers.filter(o=>{
        const id=String(o.institutionId||o.id||"");
        const fetchedAt=engagementFetchedAt.get(id)||0;
        return id && (!engagementMap.has(id) || nowMs-fetchedAt>10000);
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
        rows.forEach(([id,data])=>{
          engagementMap.set(id,data);
          engagementFetchedAt.set(id,Date.now());
        });
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
        const id=btn.dataset.djyCompareLock;
        const target=results.querySelector(`[data-lock][data-institution-id="${CSS.escape(id)}"]`);
        const consent=results.querySelector(`[data-lock-consent][data-institution-id="${CSS.escape(id)}"]`);
        if(consent && !consent.checked){
          const card=results.querySelector(`[data-offer-institution="${CSS.escape(id)}"]`);
          card?.scrollIntoView({behavior:"smooth",block:"center"});
          toast("Teklifi kabul etmek için teklif kartındaki onay kutusunu işaretleyin.");
          return;
        }
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

  function customerSeenKey(quoteId,institutionId){
    return "dijiyerCustomerMessageSeen_"+String(quoteId)+"_"+String(institutionId);
  }

  function getCustomerSeenAt(quoteId,institutionId){
    return localStorage.getItem(customerSeenKey(quoteId,institutionId))||"";
  }

  function setCustomerSeenAt(quoteId,institutionId,date){
    if(date) localStorage.setItem(customerSeenKey(quoteId,institutionId),date);
  }

  function latestInstitutionMessage(rows){
    return [...rows]
      .filter(msg=>msg.sender==="institution")
      .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0]||null;
  }

  function customerUnreadMessages(quoteId,institutionId,rows){
    const seenAt=getCustomerSeenAt(quoteId,institutionId);
    return rows.filter(msg =>
      msg.sender==="institution" &&
      (!seenAt || String(msg.date||"")>seenAt)
    );
  }

  function updateCustomerMessageTitle(){
    const messageTotal=[...customerUnreadMap.values()]
      .reduce((sum,value)=>sum+Number(value||0),0);
    const total=messageTotal+Number(customerOfferUnreadCount||0);

    let label="Yeni Bildirim";
    if(messageTotal>0 && customerOfferUnreadCount<=0)label="Yeni Mesaj";
    if(customerOfferUnreadCount>0 && messageTotal<=0)label="Yeni Teklif";

    document.title=total>0
      ? "("+total+") "+label+" · "+customerMessageTitleBase
      : customerMessageTitleBase;
  }

  window.DijiyerCustomerNotifyOffer=function(){
    if(document.hidden){
      customerOfferUnreadCount=Math.max(1,Number(customerOfferUnreadCount||0)+1);
      updateCustomerMessageTitle();
    }
  };

  function clearCustomerOfferUnread(){
    if(customerOfferUnreadCount<=0)return;
    customerOfferUnreadCount=0;
    updateCustomerMessageTitle();
  }

  function markCustomerConversationRead(quoteId,institutionId){
    const rows=customerMessageRows.get(String(institutionId))||[];
    const latest=latestInstitutionMessage(rows);
    if(latest?.date) setCustomerSeenAt(quoteId,institutionId,latest.date);
    customerUnreadMap.set(String(institutionId),0);
    updateCustomerMessageTitle();
  }

  function playCustomerMessageSound(){
    if(!customerAudioUnlocked)return;
    try{
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)return;
      const ctx=new AudioContextClass();
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      const now=ctx.currentTime;
      osc.frequency.value=980;
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.12,now+.02);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.18);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(now);osc.stop(now+.2);
      setTimeout(()=>ctx.close().catch(()=>{}),350);
    }catch(_){}
  }

  function ensureCustomerMessageAlert(){
    if(document.getElementById("customerMessageAlert"))return;

    document.body.insertAdjacentHTML("beforeend",`
      <div class="customer-message-alert hidden" id="customerMessageAlert">
        <div class="customer-message-alert-icon">💬</div>
        <div class="customer-message-alert-copy">
          <strong>Yeni mesaj geldi</strong>
          <span id="customerMessageAlertText">Bir kurum size mesaj gönderdi.</span>
        </div>
        <button type="button" id="customerMessageAlertOpen">Mesajı Gör</button>
        <button type="button" class="customer-message-alert-close" id="customerMessageAlertClose">×</button>
      </div>
    `);

    document.getElementById("customerMessageAlertClose").onclick=()=>{
      document.getElementById("customerMessageAlert")?.classList.add("hidden");
    };
  }

  function showCustomerMessageAlert(institutionId,msg){
    ensureCustomerMessageAlert();
    const alert=document.getElementById("customerMessageAlert");
    const text=document.getElementById("customerMessageAlertText");
    const offer=liveOffers.find(o =>
      String(o.institutionId||o.id||"")===String(institutionId)
    );

    if(text){
      const name=offer?.institutionName||currentAccess?.targetInstitutionName||"Kurum";
      const preview=String(msg?.text||"").trim();
      text.textContent=name+(preview?" · "+preview.slice(0,90):" size mesaj gönderdi.");
    }

    alert.classList.remove("hidden");
    document.getElementById("customerMessageAlertOpen").onclick=()=>{
      alert.classList.add("hidden");
      openConversation(
        {access:currentAccess,offers:liveOffers,lock:liveLock},
        String(institutionId),
        "message"
      );
    };
    playCustomerMessageSound();
  }

  function clearCustomerMessageWatchers(){
    customerMessageWatchers.forEach(unsubscribe=>{
      try{unsubscribe();}catch(_){}
    });
    customerMessageWatchers.clear();
    customerMessageRows.clear();
    customerUnreadMap.clear();
    updateCustomerMessageTitle();
  }

  function ensureCustomerMessageWatchers(bundle){
    const quoteId=String(bundle.access.quoteId||"");
    if(!quoteId)return;

    if(watchedQuoteId!==quoteId){
      clearCustomerMessageWatchers();
      watchedQuoteId=quoteId;
    }

    const conversationInstitutionIds=[
      ...bundle.offers.map(o=>String(o.institutionId||o.id||"")),
      String(bundle.access?.targetInstitutionId||""),
      String(bundle.lock?.institutionId||"")
    ].filter(Boolean);
    const activeIds=new Set(conversationInstitutionIds);

    customerMessageWatchers.forEach((unsubscribe,institutionId)=>{
      if(activeIds.has(institutionId))return;
      try{unsubscribe();}catch(_){}
      customerMessageWatchers.delete(institutionId);
      customerMessageRows.delete(institutionId);
      customerUnreadMap.delete(institutionId);
    });

    conversationInstitutionIds.forEach(institutionId=>{
      institutionId=String(institutionId||"");
      if(!institutionId||customerMessageWatchers.has(institutionId))return;

      let initial=true;
      const ref=db.collection("quoteRequests").doc(quoteId)
        .collection("conversations").doc(institutionId)
        .collection("messages").orderBy("date","asc");

      const unsubscribe=ref.onSnapshot(snapshot=>{
        const rows=sortCustomerConversationMessages(
          snapshot.docs.map(d=>({id:d.id,...d.data()}))
        );
        customerMessageRows.set(institutionId,rows);

        const modalOpen=
          activeConversation &&
          activeConversation.quoteId===quoteId &&
          activeConversation.institutionId===institutionId &&
          !document.getElementById("djyConversationModal")?.classList.contains("hidden");

        if(modalOpen){
          const latest=latestInstitutionMessage(rows);
          if(latest?.date)setCustomerSeenAt(quoteId,institutionId,latest.date);
          customerUnreadMap.set(institutionId,0);
        }else{
          customerUnreadMap.set(
            institutionId,
            customerUnreadMessages(quoteId,institutionId,rows).length
          );
        }

        updateCustomerMessageTitle();

        if(!initial){
          const added=snapshot.docChanges()
            .filter(change=>change.type==="added")
            .map(change=>({id:change.doc.id,...change.doc.data()}))
            .filter(msg=>msg.sender==="institution");

          if(added.length&&!modalOpen){
            const newest=added.sort(
              (a,b)=>String(b.date||"").localeCompare(String(a.date||""))
            )[0];
            showCustomerMessageAlert(institutionId,newest);
          }
        }

        initial=false;
        renderLiveTracking();
      },error=>{
        console.warn("Müşteri mesaj bildirimi dinlenemedi:",institutionId,error);
      });

      customerMessageWatchers.set(institutionId,unsubscribe);
    });
  }

  function disconnectCustomerMessageWatchersOnly(){
    customerMessageWatchers.forEach(unsubscribe=>{
      try{unsubscribe();}catch(_){}
    });
    customerMessageWatchers.clear();
  }

  async function syncCustomerMessagesNow(bundle,{notify=true}={}){
    if(!bundle?.access?.quoteId)return;

    const quoteId=String(bundle.access.quoteId);
    const offers=bundle.offers||[];
    const conversationInstitutionIds=[...new Set([
      ...offers.map(offer=>String(offer.institutionId||offer.id||"")),
      String(bundle.access?.targetInstitutionId||""),
      String(bundle.lock?.institutionId||"")
    ].filter(Boolean))];

    await Promise.all(conversationInstitutionIds.map(async institutionId=>{
      institutionId=String(institutionId||"");
      if(!institutionId)return;

      const previousRows=customerMessageRows.get(institutionId)||[];
      const previousLatest=latestInstitutionMessage(previousRows);

      try{
        const snapshot=await db.collection("quoteRequests").doc(quoteId)
          .collection("conversations").doc(institutionId)
          .collection("messages").orderBy("date","asc").get();

        const rows=sortCustomerConversationMessages(
          snapshot.docs.map(d=>({id:d.id,...d.data()}))
        );
        customerMessageRows.set(institutionId,rows);

        const modalOpen=
          activeConversation &&
          activeConversation.quoteId===quoteId &&
          activeConversation.institutionId===institutionId &&
          !document.getElementById("djyConversationModal")?.classList.contains("hidden");

        if(modalOpen){
          const latest=latestInstitutionMessage(rows);
          if(latest?.date)setCustomerSeenAt(quoteId,institutionId,latest.date);
          customerUnreadMap.set(institutionId,0);
          return;
        }

        const unread=customerUnreadMessages(quoteId,institutionId,rows);
        customerUnreadMap.set(institutionId,unread.length);

        if(notify && unread.length){
          const latest=latestInstitutionMessage(rows);
          const previousDate=String(previousLatest?.date||"");
          const latestDate=String(latest?.date||"");

          if(latest && (!previousDate || latestDate>previousDate)){
            showCustomerMessageAlert(institutionId,latest);
          }
        }
      }catch(error){
        console.warn("Mobil mesaj senkronizasyonu yapılamadı:",institutionId,error);
      }
    }));

    updateCustomerMessageTitle();
    renderLiveTracking();
  }

  async function resumeCustomerMessaging(){
    if(customerResumeBusy||!currentAccess||!liveOffers.length)return;

    const now=Date.now();
    if(now-lastCustomerResumeSync<1500)return;

    customerResumeBusy=true;
    lastCustomerResumeSync=now;

    try{
      const bundle={
        access:currentAccess,
        offers:liveOffers,
        lock:liveLock
      };

      // Mobil tarayıcı arka planda Firestore bağlantısını askıya alabilir.
      // Sayfaya dönüldüğünde mesajları bir kez eşitleyip canlı dinleyicileri yeniden kuruyoruz.
      await syncCustomerMessagesNow(bundle,{notify:true});
      disconnectCustomerMessageWatchersOnly();
      ensureCustomerMessageWatchers(bundle);
    }finally{
      customerResumeBusy=false;
    }
  }

  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
      clearCustomerOfferUnread();
      resumeCustomerMessaging();
    }
  });

  window.addEventListener("pageshow",()=>{
    setTimeout(resumeCustomerMessaging,150);
  });

  window.addEventListener("focus",()=>{
    clearCustomerOfferUnread();
    setTimeout(resumeCustomerMessaging,250);
  });

  document.addEventListener("pointerdown",()=>{customerAudioUnlocked=true;},{once:true});
  document.addEventListener("keydown",()=>{customerAudioUnlocked=true;},{once:true});

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
              <button type="submit" class="djy-chat-send" aria-label="Gönder">➤</button>
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

    document.getElementById("djyMessageText").addEventListener("keydown",event=>{
      if(event.key==="Enter" && !event.shiftKey && !event.isComposing){
        event.preventDefault();
        document.getElementById("djyMessageForm").requestSubmit();
      }
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
    markCustomerConversationRead(bundle.access.quoteId,String(institutionId));
    document.getElementById("customerMessageAlert")?.classList.add("hidden");
    listenConversation();
    scrollCustomerChatToBottom("auto");
    setTimeout(()=>scrollCustomerChatToBottom("auto"),100);
    renderLiveTracking();
  }

  function closeConversation(){
    document.getElementById("djyConversationModal")?.classList.add("hidden");
    if(conversationUnsub)conversationUnsub();
    conversationUnsub=null;
    activeConversation=null;
  }

  function scrollCustomerChatToBottom(behavior="auto"){
    const box=document.getElementById("djyMessages");
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

  function listenConversation(){
    if(conversationUnsub)conversationUnsub();
    const box=document.getElementById("djyMessages");
    box.innerHTML='<div class="empty">Mesajlar yükleniyor...</div>';
    conversationUnsub=db.collection("quoteRequests").doc(activeConversation.quoteId)
      .collection("conversations").doc(activeConversation.institutionId)
      .collection("messages").orderBy("date","asc")
      .onSnapshot(snapshot=>{
        const rows=sortCustomerConversationMessages(
          snapshot.docs.map(d=>({id:d.id,...d.data()}))
        );
        box.innerHTML=rows.length?renderCustomerConversation(rows,activeConversation.offer):'<div class="empty">Henüz mesaj yok. İlk mesajı siz gönderin.</div>';
        customerMessageRows.set(activeConversation.institutionId,rows);
        markCustomerConversationRead(activeConversation.quoteId,activeConversation.institutionId);
        scrollCustomerChatToBottom("smooth");
      },error=>{
        console.error(error);
        box.innerHTML='<div class="empty">Mesajlar yüklenemedi. Firestore kurallarını güncelleyin.</div>';
      });
  }

  function sortCustomerConversationMessages(rows){
    return [...rows].sort((a,b)=>{
      const aDate=String(a.date||"");
      const bDate=String(b.date||"");
      if(aDate===bDate)return String(a.id||"").localeCompare(String(b.id||""));
      return aDate.localeCompare(bDate);
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

  function customerChatDayKey(value){
    if(!value)return "";
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return "";
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }

  function customerChatDayLabel(value){
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

  function renderCustomerConversation(rows,offer){
    let previousDay="";
    let previousSender="";
    return rows.map(msg=>{
      const day=customerChatDayKey(msg.date);
      const divider=day!==previousDay
        ? '<div class="chat-day-divider"><span>'+safe(customerChatDayLabel(msg.date))+'</span></div>'
        : '';
      const sameSender=previousDay===day && previousSender===msg.sender;
      previousDay=day;
      previousSender=msg.sender;
      return divider + messageHtml(msg,sameSender,offer);
    }).join("");
  }

  function messageHtml(msg,sameSender=false,offer=null){
    const mine=msg.sender==="customer";
    const text=safe(msg.text||"").replace(/\n/g,"<br>");
    const time=safe(formatChatTime(msg.date));
    const isOfferUpdate=/^(Teklif güncellendi|Revizyon talebinize göre teklif güncellendi)/i.test(String(msg.text||""));
    const author=mine ? "Siz · Müşteri" : "Firma · "+safe(offer?.institutionName||"Kurum")+(isOfferUpdate?" · Teklif Güncellemesi":"");
    return `
      <div class="djy-message-row ${mine?"mine":"theirs"} ${sameSender?"same-sender":""}">
        <div class="djy-message ${mine?"mine":"theirs"} ${isOfferUpdate?"offer-update-message":""} ${msg.kind||""}">
          <div class="djy-message-author">${author}</div>
          <div class="djy-message-text">${text}</div>
          <div class="djy-message-meta">
            <span class="djy-message-time">${time}</span>
            ${mine?'<span class="djy-message-check">✓✓</span>':""}
          </div>
        </div>
      </div>
    `;
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
        engagementFetchedAt.set(activeConversation.institutionId,Date.now());
        toast("Revizyon talebi firmaya gönderildi.");
      }else{
        toast("Mesaj gönderildi.");
      }
      input.value="";
      scrollCustomerChatToBottom("smooth");
    }catch(error){
      console.error(error);
      toast("Mesaj gönderilemedi. Firestore kurallarını güncelleyin.");
    }
  }
})();