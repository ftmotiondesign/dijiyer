(() => {
  const DAYS=[
    ["mon","Pazartesi"],["tue","Salı"],["wed","Çarşamba"],["thu","Perşembe"],
    ["fri","Cuma"],["sat","Cumartesi"],["sun","Pazar"]
  ];
  const DEFAULT_HOURS={
    mon:{enabled:true,start:"09:00",end:"18:00"},tue:{enabled:true,start:"09:00",end:"18:00"},
    wed:{enabled:true,start:"09:00",end:"18:00"},thu:{enabled:true,start:"09:00",end:"18:00"},
    fri:{enabled:true,start:"09:00",end:"18:00"},sat:{enabled:true,start:"09:00",end:"14:00"},
    sun:{enabled:false,start:"09:00",end:"14:00"}
  };
  const STATUS_LABELS={pending:"Onay Bekliyor",approved:"Onaylandı",completed:"Tamamlandı",rejected:"Reddedildi",cancelled:"İptal"};
  let account=null;
  let institutionId="";
  let appointments=[];
  let filter="pending";
  let unsubscribe=null;

  const esc=(v)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const pad=n=>String(n).padStart(2,"0");
  const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
  const fmtDate=(v)=>{if(!v)return"-";const [y,m,d]=String(v).split("-");return d+"."+m+"."+y};

  function injectNavigation(){
    if(document.querySelector('[data-panel-tab="appointments"]')) return;
    const sideQuotes=document.querySelector('.institution-side-nav [data-panel-tab="quotes"]');
    if(sideQuotes){
      const btn=document.createElement("button");
      btn.type="button";btn.className="side-nav-item";btn.dataset.panelTab="appointments";
      btn.innerHTML='<span class="side-nav-icon">📅</span><span class="side-nav-copy"><strong>Randevular</strong><small>Takvim ve randevu talepleri</small></span><span class="side-nav-badge" id="appointmentSideCount">0</span>';
      sideQuotes.insertAdjacentElement("afterend",btn);
    }
    const legacyQuotes=document.querySelector('.legacy-panel-tabs [data-panel-tab="quotes"]');
    if(legacyQuotes){
      const btn=document.createElement("button");
      btn.type="button";btn.className="panel-tab";btn.dataset.panelTab="appointments";
      btn.innerHTML='📅 Randevular <span class="tab-count" id="appointmentTabCount">0</span>';
      legacyQuotes.insertAdjacentElement("afterend",btn);
    }
    const mobileGrid=document.querySelector(".mobile-menu-grid");
    if(mobileGrid){
      const btn=document.createElement("button");
      btn.type="button";btn.dataset.panelTab="appointments";
      btn.innerHTML='📅 <span>Randevular</span>';
      mobileGrid.prepend(btn);
    }
    document.querySelectorAll('[data-panel-tab="appointments"]').forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(typeof setPanelTab==="function")setPanelTab("appointments");
        document.getElementById("institutionMobileMenu")?.classList.add("hidden");
      });
    });
  }

  function injectView(){
    if(document.querySelector('[data-panel-view="appointments"]')) return;
    const summary=document.querySelector('[data-panel-view="summary"]');
    if(!summary?.parentNode)return;
    const view=document.createElement("section");
    view.className="panel-view";
    view.dataset.panelView="appointments";
    view.innerHTML=`
      <div class="appointment-panel-shell">
        <div class="appointment-summary-grid">
          <div class="appointment-stat"><span>Onay Bekleyen</span><strong id="appointmentPendingCount">0</strong></div>
          <div class="appointment-stat"><span>Bugünkü</span><strong id="appointmentTodayCount">0</strong></div>
          <div class="appointment-stat"><span>Onaylanan</span><strong id="appointmentApprovedCount">0</strong></div>
          <div class="appointment-stat"><span>Toplam</span><strong id="appointmentTotalCount">0</strong></div>
        </div>
        <div class="appointment-grid">
          <section class="appointment-card">
            <div class="appointment-card-head">
              <div><span class="appointment-eyebrow">RANDEVU AYARLARI</span><h2>Çalışma Takvimi</h2><p>Müşterilerin hangi gün ve saatlerde randevu alabileceğini belirleyin.</p></div>
              <label class="appointment-toggle"><input id="appointmentEnabled" type="checkbox"> Açık</label>
            </div>
            <div class="appointment-form-grid">
              <div class="appointment-field"><label>Randevu Süresi</label><select id="appointmentDuration"><option value="15">15 dakika</option><option value="30">30 dakika</option><option value="45">45 dakika</option><option value="60">60 dakika</option></select></div>
              <div class="appointment-field"><label>Durum</label><input id="appointmentPublicStatus" type="text" value="Kapalı" readonly></div>
              <div class="appointment-field full"><label>Randevu Hizmetleri</label><textarea id="appointmentServices" rows="4" placeholder="Her satıra bir hizmet yazın.&#10;Örn: Genel Görüşme&#10;Kayıt Görüşmesi"></textarea></div>
            </div>
            <div id="appointmentDays" class="appointment-days"></div>
            <button id="appointmentSaveSettings" class="appointment-save" type="button">Ayarları Kaydet</button>
            <p id="appointmentSettingsMessage" class="appointment-settings-msg"></p>
          </section>
          <section class="appointment-card">
            <div class="appointment-card-head">
              <div><span class="appointment-eyebrow">GELEN RANDEVULAR</span><h2>Randevu Talepleri</h2><p>Yeni talepleri onaylayın, reddedin veya tamamlandı olarak işaretleyin.</p></div>
            </div>
            <div class="appointment-filter-row">
              <button class="appointment-filter active" type="button" data-appointment-filter="pending">Bekleyen</button>
              <button class="appointment-filter" type="button" data-appointment-filter="today">Bugün</button>
              <button class="appointment-filter" type="button" data-appointment-filter="approved">Onaylanan</button>
              <button class="appointment-filter" type="button" data-appointment-filter="all">Tümü</button>
            </div>
            <div id="appointmentList" class="appointment-list"><div class="appointment-empty">Randevular yükleniyor...</div></div>
          </section>
        </div>
      </div>`;
    summary.parentNode.appendChild(view);

    const days=document.getElementById("appointmentDays");
    days.innerHTML=DAYS.map(([key,label])=>`
      <div class="appointment-day" data-day="${key}">
        <strong>${label}</strong>
        <input type="time" data-day-start value="${DEFAULT_HOURS[key].start}">
        <input type="time" data-day-end value="${DEFAULT_HOURS[key].end}">
        <input type="checkbox" data-day-enabled ${DEFAULT_HOURS[key].enabled?"checked":""} aria-label="${label} açık">
      </div>`).join("");

    document.getElementById("appointmentEnabled")?.addEventListener("change",syncPublicStatus);
    document.getElementById("appointmentSaveSettings")?.addEventListener("click",saveSettings);
    document.querySelectorAll("[data-appointment-filter]").forEach(btn=>btn.addEventListener("click",()=>{
      filter=btn.dataset.appointmentFilter||"pending";
      document.querySelectorAll("[data-appointment-filter]").forEach(x=>x.classList.toggle("active",x===btn));
      renderAppointments();
    }));
  }

  function syncPublicStatus(){
    const enabled=document.getElementById("appointmentEnabled")?.checked===true;
    const el=document.getElementById("appointmentPublicStatus");
    if(el)el.value=enabled?"Randevu Al açık":"Randevu Al kapalı";
  }

  function collectHours(){
    const hours={};
    DAYS.forEach(([key])=>{
      const row=document.querySelector('.appointment-day[data-day="'+key+'"]');
      hours[key]={
        enabled:row?.querySelector("[data-day-enabled]")?.checked===true,
        start:String(row?.querySelector("[data-day-start]")?.value||"09:00"),
        end:String(row?.querySelector("[data-day-end]")?.value||"18:00")
      };
    });
    return hours;
  }

  async function loadSettings(){
    if(!institutionId)return;
    try{
      const snap=await db.collection("appointmentSettings").doc(institutionId).get();
      const data=snap.exists?snap.data():{};
      document.getElementById("appointmentEnabled").checked=data.enabled===true;
      document.getElementById("appointmentDuration").value=String(data.durationMinutes||30);
      document.getElementById("appointmentServices").value=(Array.isArray(data.services)&&data.services.length?data.services:["Genel Görüşme"]).join("\n");
      const hours=data.workingHours||DEFAULT_HOURS;
      DAYS.forEach(([key])=>{
        const row=document.querySelector('.appointment-day[data-day="'+key+'"]');
        const day=hours[key]||DEFAULT_HOURS[key];
        row.querySelector("[data-day-enabled]").checked=day.enabled===true;
        row.querySelector("[data-day-start]").value=day.start||"09:00";
        row.querySelector("[data-day-end]").value=day.end||"18:00";
      });
      syncPublicStatus();
    }catch(error){
      console.error(error);
      document.getElementById("appointmentSettingsMessage").textContent="Randevu ayarları yüklenemedi.";
    }
  }

  async function saveSettings(){
    const btn=document.getElementById("appointmentSaveSettings");
    const msg=document.getElementById("appointmentSettingsMessage");
    if(!institutionId)return;
    const services=String(document.getElementById("appointmentServices")?.value||"")
      .split("\n").map(x=>x.trim()).filter(Boolean).slice(0,20);
    const hours=collectHours();
    for(const [key,label] of DAYS){
      const d=hours[key];
      if(d.enabled && (!d.start||!d.end||d.start>=d.end)){
        msg.textContent=label+" çalışma saatlerini kontrol edin.";return;
      }
    }
    btn.disabled=true;btn.textContent="Kaydediliyor...";msg.textContent="";
    try{
      await db.collection("appointmentSettings").doc(institutionId).set({
        institutionId,
        enabled:document.getElementById("appointmentEnabled")?.checked===true,
        durationMinutes:Number(document.getElementById("appointmentDuration")?.value||30),
        services:services.length?services:["Genel Görüşme"],
        workingHours:hours,
        updatedAt:new Date().toISOString()
      },{merge:true});
      msg.textContent="✓ Randevu ayarları kaydedildi.";
      syncPublicStatus();
    }catch(error){
      console.error(error);
      msg.textContent="Ayarlar kaydedilemedi. Yetki veya bağlantıyı kontrol edin.";
    }finally{
      btn.disabled=false;btn.textContent="Ayarları Kaydet";
    }
  }

  function startAppointments(){
    if(unsubscribe)unsubscribe();
    unsubscribe=db.collection("appointments").where("institutionId","==",institutionId).onSnapshot(snap=>{
      appointments=snap.docs.map(doc=>({id:doc.id,...doc.data()}));
      appointments.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.time||"").localeCompare(String(a.time||"")));
      renderCounts();renderAppointments();
    },error=>{
      console.error(error);
      const root=document.getElementById("appointmentList");
      if(root)root.innerHTML='<div class="appointment-empty">Randevular yüklenemedi.</div>';
    });
  }

  function renderCounts(){
    const today=todayKey();
    const pending=appointments.filter(x=>x.status==="pending").length;
    const todays=appointments.filter(x=>x.date===today && !["rejected","cancelled"].includes(x.status)).length;
    const approved=appointments.filter(x=>x.status==="approved").length;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v)};
    set("appointmentPendingCount",pending);set("appointmentTodayCount",todays);set("appointmentApprovedCount",approved);set("appointmentTotalCount",appointments.length);
    set("appointmentSideCount",pending);set("appointmentTabCount",pending);
  }

  function visibleRows(){
    const today=todayKey();
    if(filter==="pending")return appointments.filter(x=>x.status==="pending");
    if(filter==="today")return appointments.filter(x=>x.date===today && !["rejected","cancelled"].includes(x.status));
    if(filter==="approved")return appointments.filter(x=>x.status==="approved");
    return appointments;
  }

  function renderAppointments(){
    const root=document.getElementById("appointmentList");if(!root)return;
    const rows=visibleRows();
    if(!rows.length){root.innerHTML='<div class="appointment-empty">Bu bölümde randevu bulunmuyor.</div>';return}
    root.innerHTML=rows.map(x=>{
      const status=String(x.status||"pending");
      const actions=status==="pending"
        ? '<button class="approve" data-appt-action="approved" data-appt-id="'+esc(x.id)+'">Onayla</button><button class="reject" data-appt-action="rejected" data-appt-id="'+esc(x.id)+'">Reddet</button>'
        : status==="approved"
          ? '<button class="complete" data-appt-action="completed" data-appt-id="'+esc(x.id)+'">Tamamlandı</button><button class="reject" data-appt-action="cancelled" data-appt-id="'+esc(x.id)+'">İptal Et</button>'
          :"";
      return `
        <article class="appointment-item">
          <div class="appointment-item-top">
            <div><h3>${esc(x.customerName||"Müşteri")}</h3><div class="appointment-item-meta"><span>📅 ${esc(fmtDate(x.date))} · ${esc(x.time||"-")}</span><span>☎ ${esc(x.customerPhone||"-")}</span><span>🧾 ${esc(x.service||"Genel Görüşme")}</span><span>Kod: ${esc(x.bookingCode||"-")}</span></div></div>
            <span class="appointment-status ${esc(status)}">${esc(STATUS_LABELS[status]||status)}</span>
          </div>
          ${x.note?'<div class="appointment-item-note">'+esc(x.note)+'</div>':""}
          ${actions?'<div class="appointment-actions">'+actions+'</div>':""}
        </article>`;
    }).join("");
    root.querySelectorAll("[data-appt-action]").forEach(btn=>btn.addEventListener("click",()=>changeStatus(btn.dataset.apptId,btn.dataset.apptAction)));
  }

  async function changeStatus(id,nextStatus){
    const item=appointments.find(x=>x.id===id);if(!item)return;
    const ref=db.collection("appointments").doc(id);
    const slotId=String(item.date||"")+"_"+String(item.time||"").replace(":","");
    const slotRef=db.collection("appointmentSlots").doc(institutionId).collection("slots").doc(slotId);
    try{
      await db.runTransaction(async transaction=>{
        transaction.update(ref,{status:nextStatus,updatedAt:new Date().toISOString()});
        if(["rejected","cancelled"].includes(nextStatus))transaction.delete(slotRef);
      });
    }catch(error){
      console.error(error);
      alert("Randevu durumu güncellenemedi.");
    }
  }

  async function initializeForUser(user){
    if(!user)return;
    try{
      const snap=await db.collection("institutionUsers").doc(user.uid).get();
      if(!snap.exists)return;
      account=snap.data();
      if(account.status!=="approved"||!account.institutionId)return;
      institutionId=String(account.institutionId);
      injectNavigation();injectView();
      await loadSettings();
      startAppointments();
    }catch(error){console.error("Randevu paneli başlatılamadı:",error)}
  }

  injectNavigation();
  injectView();
  if(typeof auth!=="undefined"){
    auth.onAuthStateChanged(user=>initializeForUser(user));
  }
})();
