const firebaseConfig={
  apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain:"dijiyer.firebaseapp.com",
  projectId:"dijiyer",
  storageBucket:"dijiyer.firebasestorage.app",
  messagingSenderId:"847787778815",
  appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

const app=firebase.apps.find(item=>item.name==="tradePublic")||firebase.initializeApp(firebaseConfig,"tradePublic");
const db=app.firestore();

const TYPE_META={
  all:{label:"Tümü",icon:"✦"},
  tender:{label:"İhaleler",icon:"🏛️"},
  quote_call:{label:"Teklif Çağrıları",icon:"📨"},
  supply:{label:"Tedarikçi Aranıyor",icon:"📦"},
  bulk_purchase:{label:"Toplu Alım",icon:"🛒"},
  subcontractor:{label:"Taşeron / Usta",icon:"🛠️"},
  project:{label:"Proje Fırsatları",icon:"🏗️"},
  procurement:{label:"Satın Alma",icon:"🧾"},
  dealership:{label:"Bayilik",icon:"🏷️"},
  partnership:{label:"İş Ortaklığı",icon:"🤝"},
  rental:{label:"Kiralama",icon:"🔑"},
  service_contract:{label:"Hizmet Sözleşmesi",icon:"📄"},
  announcement:{label:"Kurumsal Duyuru",icon:"📣"}
};

let records=[];
let activeType="all";

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);
}

function safeUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{
    const url=new URL(raw,location.href);
    return ["http:","https:"].includes(url.protocol)?url.href:"";
  }catch(_){return ""}
}

function normalize(value){
  return String(value||"").trim().toLocaleLowerCase("tr-TR");
}

function dateValue(value){
  if(!value)return null;
  if(typeof value?.toDate==="function")return value.toDate();
  const date=new Date(value);
  return Number.isNaN(date.getTime())?null:date;
}

function formatDate(value){
  const date=dateValue(value);
  if(!date)return "Belirtilmedi";
  return date.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

function deadlineInfo(value){
  const date=dateValue(value);
  if(!date)return {label:"Son tarih belirtilmedi",days:null,expired:false,urgent:false};
  const diff=date.getTime()-Date.now();
  const days=Math.ceil(diff/86400000);
  if(diff<0)return {label:"Süresi doldu",days,expired:true,urgent:false};
  if(days===0)return {label:"Bugün son",days,expired:false,urgent:true};
  if(days===1)return {label:"1 gün kaldı",days,expired:false,urgent:true};
  return {label:days+" gün kaldı",days,expired:false,urgent:days<=7};
}

function renderTypeChips(){
  const root=document.getElementById("tradeTypeChips");
  root.innerHTML=Object.entries(TYPE_META).map(([key,item])=>
    '<button type="button" class="trade-type-chip '+(key===activeType?'active':'')+'" data-trade-type="'+key+'">'+
    item.icon+' '+escapeHtml(item.label)+'</button>'
  ).join("");

  root.querySelectorAll("[data-trade-type]").forEach(button=>{
    button.addEventListener("click",()=>{
      activeType=button.dataset.tradeType||"all";
      renderTypeChips();
      render();
    });
  });
}

function populateFilters(){
  const city=document.getElementById("tradeCity");
  const category=document.getElementById("tradeCategory");
  const oldCity=city.value,oldCategory=category.value;
  const cities=[...new Set(records.map(item=>String(item.city||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
  const categories=[...new Set(records.map(item=>String(item.category||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));

  city.innerHTML='<option value="">Tüm iller</option>'+cities.map(x=>'<option value="'+escapeHtml(x)+'">'+escapeHtml(x)+'</option>').join("");
  category.innerHTML='<option value="">Tüm sektörler</option>'+categories.map(x=>'<option value="'+escapeHtml(x)+'">'+escapeHtml(x)+'</option>').join("");
  if(cities.includes(oldCity))city.value=oldCity;
  if(categories.includes(oldCategory))category.value=oldCategory;
}

function filteredRecords(){
  const query=normalize(document.getElementById("tradeSearch").value);
  const city=document.getElementById("tradeCity").value;
  const category=document.getElementById("tradeCategory").value;
  const deadlineFilter=document.getElementById("tradeDeadlineFilter").value;
  const sort=document.getElementById("tradeSort").value;

  let rows=records.filter(item=>{
    if(activeType!=="all" && item.type!==activeType)return false;
    if(city && item.city!==city)return false;
    if(category && item.category!==category)return false;

    if(query){
      const haystack=normalize([item.title,item.organizer,item.category,item.city,item.district,item.description,item.sourceLabel].join(" "));
      if(!haystack.includes(query))return false;
    }

    if(deadlineFilter){
      const info=deadlineInfo(item.deadline);
      if(deadlineFilter==="today" && info.days!==0)return false;
      if(deadlineFilter==="week" && (info.days===null || info.days<0 || info.days>7))return false;
      if(deadlineFilter==="month" && (info.days===null || info.days<0 || info.days>30))return false;
      if(deadlineFilter==="open" && info.expired)return false;
    }
    return true;
  });

  if(sort==="newest"){
    rows.sort((a,b)=>(dateValue(b.createdAt)?.getTime()||0)-(dateValue(a.createdAt)?.getTime()||0));
  }else if(sort==="featured"){
    rows.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)) || (dateValue(a.deadline)?.getTime()||Number.MAX_SAFE_INTEGER)-(dateValue(b.deadline)?.getTime()||Number.MAX_SAFE_INTEGER));
  }else{
    rows.sort((a,b)=>{
      const at=dateValue(a.deadline)?.getTime()||Number.MAX_SAFE_INTEGER;
      const bt=dateValue(b.deadline)?.getTime()||Number.MAX_SAFE_INTEGER;
      return at-bt;
    });
  }
  return rows;
}

function cardHtml(item){
  const meta=TYPE_META[item.type]||{label:"Fırsat",icon:"✦"};
  const deadline=deadlineInfo(item.deadline);
  const sourceUrl=safeUrl(item.sourceUrl);
  const locationText=[item.city,item.district].filter(Boolean).join(" / ")||"Tüm Türkiye / Belirtilmedi";

  return '<article class="trade-card">'+
    '<div class="trade-card-type"><i>'+meta.icon+'</i><strong>'+escapeHtml(meta.label)+'</strong></div>'+
    '<div class="trade-card-main">'+
      '<div class="trade-card-tags">'+
        (item.featured?'<span class="trade-tag featured">★ Öne Çıkan</span>':'')+
        (item.category?'<span class="trade-tag">'+escapeHtml(item.category)+'</span>':'')+
      '</div>'+
      '<h3>'+escapeHtml(item.title||"İş & Ticaret Fırsatı")+'</h3>'+
      '<div class="trade-card-meta">'+
        (item.organizer?'<span>🏢 '+escapeHtml(item.organizer)+'</span>':'')+
        '<span>📍 '+escapeHtml(locationText)+'</span>'+
      '</div>'+
      (item.description?'<p class="trade-card-description">'+escapeHtml(item.description)+'</p>':'')+
      '<div class="trade-source"><span>Kaynak:</span><strong>'+escapeHtml(item.sourceLabel||"Dijiyer Manuel")+'</strong>'+
        (sourceUrl?'<a href="'+escapeHtml(sourceUrl)+'" target="_blank" rel="noopener">Kaynağı aç ↗</a>':'')+
      '</div>'+
    '</div>'+
    '<aside class="trade-card-side">'+
      '<div class="trade-deadline '+(deadline.urgent?'urgent':'')+'"><span>SON BAŞVURU</span><strong>'+escapeHtml(formatDate(item.deadline))+'</strong><em>'+escapeHtml(deadline.label)+'</em></div>'+
      '<div class="trade-budget"><span>BÜTÇE / BEDEL</span><strong>'+escapeHtml(item.budget||"Belirtilmedi")+'</strong></div>'+
      (sourceUrl?'<a class="trade-detail-link" href="'+escapeHtml(sourceUrl)+'" target="_blank" rel="noopener">Detayları Gör ↗</a>':'<span class="trade-detail-link disabled">Detay kurumda</span>')+
    '</aside>'+
  '</article>';
}

function render(){
  const rows=filteredRecords();
  const list=document.getElementById("tradeOpportunityList");
  list.innerHTML=rows.length?rows.map(cardHtml).join(""):'<div class="trade-empty">Seçtiğiniz filtrelere uygun fırsat bulunamadı.</div>';

  document.getElementById("tradeResultsSummary").textContent=rows.length+" fırsat listeleniyor.";
  const typeName=activeType==="all"?"Yayındaki fırsatlar":TYPE_META[activeType]?.label||"Fırsatlar";
  document.getElementById("tradeResultsTitle").textContent=typeName;
}

async function load(){
  try{
    const snapshot=await db.collection("businessOpportunities").where("status","==","published").get();
    records=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
  }catch(error){
    console.error("İş & Ticaret fırsatları yüklenemedi:",error);
    records=[];
    document.getElementById("tradeOpportunityList").innerHTML='<div class="trade-empty">Fırsatlar şu anda yüklenemiyor. Firestore kuralını kontrol edin.</div>';
  }

  document.getElementById("tradeOpportunityCount").textContent=records.length;
  document.getElementById("tradeDeadlineSoonCount").textContent=records.filter(item=>{
    const info=deadlineInfo(item.deadline);
    return info.days!==null && info.days>=0 && info.days<=7;
  }).length;

  populateFilters();
  renderTypeChips();
  render();
}

["tradeSearch","tradeCity","tradeCategory","tradeDeadlineFilter","tradeSort"].forEach(id=>{
  document.getElementById(id)?.addEventListener(id==="tradeSearch"?"input":"change",render);
});

document.getElementById("tradeClearFilters")?.addEventListener("click",()=>{
  activeType="all";
  document.getElementById("tradeSearch").value="";
  document.getElementById("tradeCity").value="";
  document.getElementById("tradeCategory").value="";
  document.getElementById("tradeDeadlineFilter").value="";
  document.getElementById("tradeSort").value="deadline";
  renderTypeChips();
  render();
});

renderTypeChips();
load();