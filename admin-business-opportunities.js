(() => {
  const $=id=>document.getElementById(id);
  const TYPE_LABELS={
    tender:"İhale",
    quote_call:"Teklif Çağrısı",
    supply:"Tedarikçi Aranıyor",
    bulk_purchase:"Toplu Alım",
    subcontractor:"Taşeron / Usta",
    project:"Proje Fırsatı",
    procurement:"Satın Alma",
    dealership:"Bayilik / Distribütörlük",
    partnership:"İş Ortaklığı",
    rental:"Kiralama",
    service_contract:"Hizmet Sözleşmesi",
    announcement:"Kurumsal Duyuru"
  };

  let records=[];
  let initialized=false;

  function esc(value){
    if(typeof escapeHtml==="function")return escapeHtml(value??"");
    return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  function normalize(value){return String(value||"").trim().toLocaleLowerCase("tr-TR")}

  function localDateTimeValue(value){
    if(!value)return "";
    const date=typeof value?.toDate==="function"?value.toDate():new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    const pad=n=>String(n).padStart(2,"0");
    return date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate())+"T"+pad(date.getHours())+":"+pad(date.getMinutes());
  }

  function prettyDate(value){
    if(!value)return "Son tarih yok";
    const date=typeof value?.toDate==="function"?value.toDate():new Date(value);
    if(Number.isNaN(date.getTime()))return "Son tarih yok";
    return date.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  }

  async function load(){
    const snap=await db.collection("businessOpportunities").get();
    records=snap.docs.map(doc=>({id:doc.id,...doc.data()}))
      .sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
    return records;
  }

  function filtered(){
    const q=normalize($("businessOpportunityAdminSearch")?.value||"");
    const status=$("businessOpportunityAdminStatus")?.value||"";
    const type=$("businessOpportunityAdminType")?.value||"";

    return records.filter(item=>{
      if(status && item.status!==status)return false;
      if(type && item.type!==type)return false;
      if(q){
        const haystack=normalize([item.title,item.organizer,item.city,item.district,item.category,item.description,item.sourceLabel].join(" "));
        if(!haystack.includes(q))return false;
      }
      return true;
    });
  }

  function statusLabel(status){
    return {published:"Yayında",draft:"Taslak",closed:"Kapandı"}[status]||"Taslak";
  }

  function renderList(){
    const root=$("businessOpportunityAdminList");
    if(!root)return;
    const rows=filtered();

    if($("businessOpportunitiesAdminCount")){
      $("businessOpportunitiesAdminCount").textContent=
        records.length+" kayıt · "+records.filter(x=>x.status==="published").length+" yayında · "+
        records.filter(x=>x.status==="draft").length+" taslak";
    }

    if($("businessOpportunitiesTabCount")){
      $("businessOpportunitiesTabCount").textContent=String(records.filter(x=>x.status==="published").length);
    }

    root.innerHTML=rows.length?rows.map(item=>{
      const state=String(item.status||"draft");
      return '<article class="business-opportunity-card is-'+esc(state)+'">'+
        '<div class="business-opportunity-card-head"><div>'+
          '<span>'+esc(TYPE_LABELS[item.type]||"Fırsat")+(item.featured?" · ★ Öne Çıkan":"")+'</span>'+
          '<strong>'+esc(item.title||"Başlıksız fırsat")+'</strong>'+
        '</div><b class="business-opportunity-state '+esc(state)+'">'+esc(statusLabel(state))+'</b></div>'+
        '<div class="business-opportunity-card-meta">'+
          (item.organizer?'<span>🏢 '+esc(item.organizer)+'</span>':'')+
          '<span>📍 '+esc([item.city,item.district].filter(Boolean).join(" / ")||"Konum yok")+'</span>'+
          (item.category?'<span>🏷 '+esc(item.category)+'</span>':'')+
          '<span>⏱ '+esc(prettyDate(item.deadline))+'</span>'+
          '<span>Kaynak: '+esc(item.sourceLabel||"Dijiyer Manuel")+'</span>'+
        '</div>'+
        (item.description?'<p>'+esc(item.description)+'</p>':'')+
        '<div class="business-opportunity-card-actions">'+
          '<button type="button" class="primary" data-bo-edit="'+esc(item.id)+'">Düzenle</button>'+
          '<button type="button" data-bo-toggle="'+esc(item.id)+'">'+(state==="published"?"Taslağa Al":"Yayınla")+'</button>'+
          '<button type="button" class="danger" data-bo-delete="'+esc(item.id)+'">Sil</button>'+
        '</div>'+
      '</article>';
    }).join(""):'<div class="advanced-empty">Bu filtrelerde fırsat bulunamadı.</div>';

    root.querySelectorAll("[data-bo-edit]").forEach(btn=>btn.addEventListener("click",()=>edit(btn.dataset.boEdit)));
    root.querySelectorAll("[data-bo-toggle]").forEach(btn=>btn.addEventListener("click",()=>toggle(btn.dataset.boToggle)));
    root.querySelectorAll("[data-bo-delete]").forEach(btn=>btn.addEventListener("click",()=>remove(btn.dataset.boDelete)));
  }

  function reset(){
    $("businessOpportunityForm")?.reset();
    $("businessOpportunityEditId").value="";
    $("businessOpportunityFormTitle").textContent="Yeni Fırsat Ekle";
    $("businessOpportunityStatus").value="published";
    $("businessOpportunitySourceLabel").value="Dijiyer Manuel";
    $("businessOpportunityCancelEdit").classList.add("hidden");
    const msg=$("businessOpportunityFormMessage");
    if(msg){msg.textContent="";msg.className="business-opportunity-message";}
  }

  function edit(id){
    const item=records.find(x=>String(x.id)===String(id));
    if(!item)return;
    $("businessOpportunityEditId").value=item.id;
    $("businessOpportunityType").value=item.type||"tender";
    $("businessOpportunityStatus").value=item.status||"draft";
    $("businessOpportunityTitle").value=item.title||"";
    $("businessOpportunityOrganizer").value=item.organizer||"";
    $("businessOpportunityCategory").value=item.category||"";
    $("businessOpportunityCity").value=item.city||"";
    $("businessOpportunityDistrict").value=item.district||"";
    $("businessOpportunityBudget").value=item.budget||"";
    $("businessOpportunityDeadline").value=localDateTimeValue(item.deadline);
    $("businessOpportunitySourceLabel").value=item.sourceLabel||"Dijiyer Manuel";
    $("businessOpportunitySourceUrl").value=item.sourceUrl||"";
    $("businessOpportunityDescription").value=item.description||"";
    $("businessOpportunityFeatured").checked=Boolean(item.featured);
    $("businessOpportunityFormTitle").textContent="Fırsatı Düzenle";
    $("businessOpportunityCancelEdit").classList.remove("hidden");
    $("businessOpportunityForm")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function toggle(id){
    const item=records.find(x=>String(x.id)===String(id));
    if(!item)return;
    const next=item.status==="published"?"draft":"published";
    try{
      const now=new Date().toISOString();
      await db.collection("businessOpportunities").doc(id).update({status:next,updatedAt:now});
      item.status=next;
      item.updatedAt=now;
      renderList();
    }catch(error){
      console.error(error);
      alert("Fırsat durumu değiştirilemedi.");
    }
  }

  async function remove(id){
    const item=records.find(x=>String(x.id)===String(id));
    if(!confirm((item?.title||"Bu fırsat")+" kalıcı olarak silinsin mi?"))return;
    try{
      await db.collection("businessOpportunities").doc(id).delete();
      records=records.filter(x=>String(x.id)!==String(id));
      renderList();
      if($("businessOpportunityEditId").value===id)reset();
    }catch(error){
      console.error(error);
      alert("Fırsat silinemedi.");
    }
  }

  async function submit(event){
    event.preventDefault();
    const button=$("businessOpportunitySaveBtn");
    const msg=$("businessOpportunityFormMessage");
    const editId=String($("businessOpportunityEditId").value||"").trim();
    const title=String($("businessOpportunityTitle").value||"").trim();

    if(!title){
      msg.textContent="Başlık zorunludur.";
      msg.className="business-opportunity-message error";
      return;
    }

    const now=new Date().toISOString();
    const payload={
      type:$("businessOpportunityType").value||"tender",
      status:$("businessOpportunityStatus").value||"draft",
      title,
      organizer:String($("businessOpportunityOrganizer").value||"").trim(),
      category:String($("businessOpportunityCategory").value||"").trim(),
      city:String($("businessOpportunityCity").value||"").trim(),
      district:String($("businessOpportunityDistrict").value||"").trim(),
      budget:String($("businessOpportunityBudget").value||"").trim(),
      deadline:$("businessOpportunityDeadline").value?new Date($("businessOpportunityDeadline").value).toISOString():"",
      sourceLabel:String($("businessOpportunitySourceLabel").value||"").trim()||"Dijiyer Manuel",
      sourceUrl:String($("businessOpportunitySourceUrl").value||"").trim(),
      description:String($("businessOpportunityDescription").value||"").trim(),
      featured:Boolean($("businessOpportunityFeatured").checked),
      entryMode:"manual",
      updatedAt:now
    };

    button.disabled=true;
    const old=button.textContent;
    button.textContent="Kaydediliyor...";
    msg.textContent="";

    try{
      if(editId){
        await db.collection("businessOpportunities").doc(editId).update(payload);
      }else{
        payload.createdAt=now;
        await db.collection("businessOpportunities").add(payload);
      }
      msg.textContent=editId?"✓ Fırsat güncellendi.":"✓ Fırsat kaydedildi.";
      msg.className="business-opportunity-message success";
      await load();
      renderList();
      setTimeout(reset,700);
    }catch(error){
      console.error("İş & Ticaret fırsatı kaydedilemedi:",error);
      msg.textContent=String(error?.code||"").includes("permission-denied")
        ?"Kaydetme izni reddedildi. Firestore Rules'u yayınlayın."
        :"Fırsat kaydedilemedi.";
      msg.className="business-opportunity-message error";
    }finally{
      button.disabled=false;
      button.textContent=old;
    }
  }

  async function render(reload=false){
    const root=$("businessOpportunityAdminList");
    if(!root)return;
    if(reload || !records.length){
      root.innerHTML='<div class="advanced-empty">Fırsatlar yükleniyor...</div>';
      try{
        await load();
      }catch(error){
        console.error(error);
        root.innerHTML='<div class="advanced-empty">Fırsatlar yüklenemedi. Firestore kuralını kontrol edin.</div>';
        return;
      }
    }
    renderList();
  }

  function init(){
    if(initialized)return;
    initialized=true;
    $("businessOpportunityForm")?.addEventListener("submit",submit);
    $("businessOpportunityCancelEdit")?.addEventListener("click",reset);
    $("businessOpportunityRefreshBtn")?.addEventListener("click",()=>render(true));
    $("businessOpportunityAdminSearch")?.addEventListener("input",renderList);
    $("businessOpportunityAdminStatus")?.addEventListener("change",renderList);
    $("businessOpportunityAdminType")?.addEventListener("change",renderList);
    reset();
  }

  window.renderBusinessOpportunitiesAdmin=async reload=>{
    init();
    await render(Boolean(reload));
  };

  init();
})();