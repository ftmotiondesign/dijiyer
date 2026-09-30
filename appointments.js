(() => {
  const DAY_KEYS=["sun","mon","tue","wed","thu","fri","sat"];
  let settings=null;
  let selectedTime="";
  let modal=null;

  const esc=(v)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const pad=(n)=>String(n).padStart(2,"0");
  const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
  const code=()=>{const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",b=new Uint8Array(8);crypto.getRandomValues(b);return Array.from(b,x=>a[x%a.length]).join("")};

  function waitForInstitution(){
    let tries=0;
    const timer=setInterval(async()=>{
      tries++;
      if(typeof institution!=="undefined" && institution && typeof db!=="undefined"){
        clearInterval(timer);
        await loadSettings();
      }else if(tries>50){
        clearInterval(timer);
      }
    },200);
  }

  async function loadSettings(){
    if(!institution?.id || institution?.isDemo) return;
    try{
      const snap=await db.collection("appointmentSettings").doc(String(institution.id)).get();
      if(!snap.exists) return;
      settings=snap.data()||{};
      if(settings.enabled!==true) return;
      injectButton();
      buildModal();
      if(new URLSearchParams(location.search).get("randevu")==="1"){
        setTimeout(openModal,120);
      }
    }catch(error){
      console.warn("Randevu ayarları yüklenemedi:",error);
    }
  }

  function injectButton(){
    if(document.querySelector("[data-appointment-open]")) return;
    const actions=document.querySelector(".kp-actions");
    if(!actions) return;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="kp-btn kp-appointment-btn";
    btn.dataset.appointmentOpen="1";
    btn.textContent="📅 Randevu Al";
    actions.prepend(btn);
    btn.addEventListener("click",openModal);

    const side=document.querySelector(".kp-side");
    if(side && !side.querySelector(".kp-appointment-side")){
      const card=document.createElement("section");
      card.className="kp-card kp-appointment-side";
      card.innerHTML='<div class="kp-head kp-compact-head"><div><span class="eyebrow">RANDEVU</span><h2>Uygun Saat Seçin</h2></div></div><p style="margin:0 0 12px;color:#64748b;font-size:13px">Kurumun açık randevu saatlerinden size uygun olanı seçin.</p><button type="button" class="kp-btn kp-appointment-btn kp-full-btn" data-appointment-open>📅 Randevu Al</button>';
      side.prepend(card);
      card.querySelector("[data-appointment-open]")?.addEventListener("click",openModal);
    }
  }

  function buildModal(){
    if(document.getElementById("kpAppointmentModal")) return;
    modal=document.createElement("div");
    modal.id="kpAppointmentModal";
    modal.className="kp-appointment-modal hidden";
    modal.innerHTML=`
      <div class="kp-appointment-card" role="dialog" aria-modal="true" aria-labelledby="kpAppointmentTitle">
        <div class="kp-appointment-head">
          <div>
            <small>RANDEVU AL</small>
            <h2 id="kpAppointmentTitle">${esc(institution?.name||"Kurum")}</h2>
            <p>Tarih ve uygun saat seçerek randevu talebinizi gönderin.</p>
          </div>
          <button class="kp-appointment-close" type="button" aria-label="Kapat">×</button>
        </div>
        <form id="kpAppointmentForm">
          <div class="kp-appointment-grid">
            <div class="kp-appointment-field">
              <label>Hizmet</label>
              <select id="kpAppointmentService" required></select>
            </div>
            <div class="kp-appointment-field">
              <label>Tarih</label>
              <input id="kpAppointmentDate" type="date" required>
            </div>
            <div class="kp-appointment-field full">
              <label>Uygun Saatler</label>
              <div id="kpAppointmentSlots" class="kp-appointment-slots"><div class="kp-appointment-empty">Önce tarih seçin.</div></div>
            </div>
            <div class="kp-appointment-field">
              <label>Ad Soyad</label>
              <input id="kpAppointmentName" type="text" maxlength="80" autocomplete="name" required placeholder="Adınız soyadınız">
            </div>
            <div class="kp-appointment-field">
              <label>Telefon</label>
              <input id="kpAppointmentPhone" type="tel" maxlength="20" autocomplete="tel" required placeholder="05xx xxx xx xx">
            </div>
            <div class="kp-appointment-field full">
              <label>Not <span style="font-weight:500;color:#94a3b8">(isteğe bağlı)</span></label>
              <textarea id="kpAppointmentNote" rows="3" maxlength="500" placeholder="Kuruma iletmek istediğiniz kısa not..."></textarea>
            </div>
          </div>
          <button id="kpAppointmentSubmit" class="kp-appointment-submit" type="submit">Randevu Talebi Gönder</button>
          <p class="kp-appointment-note">Randevu, kurum onayladığında kesinleşir. Dijiyer üzerinden ödeme alınmaz.</p>
          <p id="kpAppointmentMessage" class="kp-appointment-message"></p>
          <div id="kpAppointmentSuccess" class="kp-appointment-success" hidden></div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const service=document.getElementById("kpAppointmentService");
    const services=Array.isArray(settings.services)&&settings.services.length?settings.services:["Genel Görüşme"];
    service.innerHTML=services.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");

    const date=document.getElementById("kpAppointmentDate");
    date.min=todayKey();
    date.addEventListener("change",renderSlots);
    modal.querySelector(".kp-appointment-close")?.addEventListener("click",closeModal);
    modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
    document.getElementById("kpAppointmentForm")?.addEventListener("submit",submitAppointment);
  }

  function openModal(){
    if(!modal) buildModal();
    selectedTime="";
    const msg=document.getElementById("kpAppointmentMessage");
    const success=document.getElementById("kpAppointmentSuccess");
    if(msg){msg.textContent="";msg.className="kp-appointment-message"}
    if(success){success.hidden=true;success.innerHTML=""}
    modal?.classList.remove("hidden");
    document.body.style.overflow="hidden";
  }

  function closeModal(){
    modal?.classList.add("hidden");
    document.body.style.overflow="";
  }

  function minutes(value){
    const [h,m]=String(value||"00:00").split(":").map(Number);
    return (h||0)*60+(m||0);
  }
  function timeText(total){return pad(Math.floor(total/60))+":"+pad(total%60)}

  async function renderSlots(){
    selectedTime="";
    const root=document.getElementById("kpAppointmentSlots");
    const dateValue=document.getElementById("kpAppointmentDate")?.value||"";
    if(!root||!dateValue)return;
    root.innerHTML='<div class="kp-appointment-empty">Uygun saatler kontrol ediliyor...</div>';

    const d=new Date(dateValue+"T12:00:00");
    const key=DAY_KEYS[d.getDay()];
    const day=settings?.workingHours?.[key];
    if(!day?.enabled){
      root.innerHTML='<div class="kp-appointment-empty">Bu gün randevu alınmıyor. Başka bir tarih seçin.</div>';
      return;
    }

    const duration=Math.max(15,Number(settings.durationMinutes||30));
    const start=minutes(day.start||"09:00");
    const end=minutes(day.end||"18:00");
    const times=[];
    for(let t=start;t+duration<=end;t+=duration)times.push(timeText(t));

    let blocked=new Set();
    try{
      const snap=await db.collection("appointmentSlots").doc(String(institution.id)).collection("slots").where("date","==",dateValue).get();
      blocked=new Set(snap.docs.map(x=>String(x.data()?.time||"")));
    }catch(error){
      console.warn("Dolu randevu saatleri okunamadı:",error);
    }

    const now=new Date();
    const isToday=dateValue===todayKey();
    const future=times.filter(t=>{
      if(blocked.has(t))return false;
      if(!isToday)return true;
      const [h,m]=t.split(":").map(Number);
      const slot=new Date();slot.setHours(h,m,0,0);
      return slot.getTime()>now.getTime()+10*60*1000;
    });

    if(!future.length){
      root.innerHTML='<div class="kp-appointment-empty">Bu tarihte uygun saat kalmamış.</div>';
      return;
    }
    root.innerHTML="";
    future.forEach(t=>{
      const b=document.createElement("button");
      b.type="button";b.className="kp-appointment-slot";b.textContent=t;
      b.addEventListener("click",()=>{
        selectedTime=t;
        root.querySelectorAll(".kp-appointment-slot").forEach(x=>x.classList.toggle("active",x===b));
      });
      root.appendChild(b);
    });
  }

  async function submitAppointment(event){
    event.preventDefault();
    const submit=document.getElementById("kpAppointmentSubmit");
    const msg=document.getElementById("kpAppointmentMessage");
    const success=document.getElementById("kpAppointmentSuccess");
    const service=String(document.getElementById("kpAppointmentService")?.value||"").trim();
    const date=String(document.getElementById("kpAppointmentDate")?.value||"").trim();
    const customerName=String(document.getElementById("kpAppointmentName")?.value||"").trim();
    const customerPhone=String(document.getElementById("kpAppointmentPhone")?.value||"").trim();
    const note=String(document.getElementById("kpAppointmentNote")?.value||"").trim();
    const phoneDigits=customerPhone.replace(/\D/g,"");

    if(!selectedTime){msg.textContent="Lütfen uygun bir saat seçin.";msg.className="kp-appointment-message error";return}
    if(customerName.length<2){msg.textContent="Ad soyad alanını doldurun.";msg.className="kp-appointment-message error";return}
    if(phoneDigits.length<10){msg.textContent="Geçerli bir telefon numarası girin.";msg.className="kp-appointment-message error";return}

    submit.disabled=true;submit.textContent="Gönderiliyor...";
    msg.textContent="";success.hidden=true;

    try{
      const appointmentRef=db.collection("appointments").doc();
      const slotId=date+"_"+selectedTime.replace(":","");
      const slotRef=db.collection("appointmentSlots").doc(String(institution.id)).collection("slots").doc(slotId);
      const bookingCode=code();
      const now=new Date().toISOString();

      await db.runTransaction(async transaction=>{
        const existing=await transaction.get(slotRef);
        if(existing.exists)throw new Error("SLOT_TAKEN");
        transaction.set(appointmentRef,{
          institutionId:String(institution.id),
          institutionName:String(institution.name||"Kurum").slice(0,160),
          customerName:customerName.slice(0,80),
          customerPhone:customerPhone.slice(0,20),
          service:service.slice(0,120),
          date,
          time:selectedTime,
          durationMinutes:Math.max(15,Number(settings.durationMinutes||30)),
          note:note.slice(0,500),
          slotId,
          bookingCode,
          status:"pending",
          createdAt:now,
          updatedAt:now
        });
        transaction.set(slotRef,{
          appointmentId:appointmentRef.id,
          institutionId:String(institution.id),
          date,
          time:selectedTime,
          status:"active",
          createdAt:now
        });
      });

      if(typeof trackInstitutionAction==="function")trackInstitutionAction("appointment_request",false);
      msg.textContent="";
      success.hidden=false;
      success.innerHTML='<strong>✓ Randevu talebiniz gönderildi.</strong><span>'+esc(date)+' · '+esc(selectedTime)+' için kurumun onayı bekleniyor.</span><br><small>Randevu kodu: <b>'+esc(bookingCode)+'</b></small>';
      document.getElementById("kpAppointmentForm")?.reset();
      selectedTime="";
      document.getElementById("kpAppointmentDate").min=todayKey();
      document.getElementById("kpAppointmentSlots").innerHTML='<div class="kp-appointment-empty">Yeni randevu için tarih seçin.</div>';
    }catch(error){
      console.error(error);
      msg.textContent=String(error?.message||"").includes("SLOT_TAKEN")
        ?"Bu saat az önce doldu. Lütfen başka bir saat seçin."
        :"Randevu gönderilemedi. Lütfen tekrar deneyin.";
      msg.className="kp-appointment-message error";
      if(String(error?.message||"").includes("SLOT_TAKEN"))await renderSlots();
    }finally{
      submit.disabled=false;submit.textContent="Randevu Talebi Gönder";
    }
  }

  waitForInstitution();
})();
