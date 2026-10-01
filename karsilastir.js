const firebaseConfig={apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",authDomain:"dijiyer.firebaseapp.com",projectId:"dijiyer",storageBucket:"dijiyer.firebasestorage.app",messagingSenderId:"847787778815",appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"};
const compareApp=firebase.apps.find(app=>app.name==="comparePage")||firebase.initializeApp(firebaseConfig,"comparePage");
const db=compareApp.firestore();

const STORAGE_KEY="dijiyerCompareInstitutionIdsV1";
let selectedIds=loadIds();
let institutions=[];

function loadIds(){
  try{
    const ids=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    return Array.isArray(ids)?ids.map(String).filter(Boolean).slice(0,3):[];
  }catch(_){
    return [];
  }
}

function saveIds(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(selectedIds.slice(0,3)))}catch(_){}
}

function esc(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}

function safeUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return"";
  try{
    const url=new URL(raw,location.href);
    return ["http:","https:"].includes(url.protocol)?url.href:"";
  }catch(_){
    return"";
  }
}

function listValue(value){
  if(Array.isArray(value))return value.map(v=>String(v||"").trim()).filter(Boolean);
  return String(value||"").split(/[,;\n]/).map(v=>v.trim()).filter(Boolean);
}

function value(value,fallback="Belirtilmedi"){
  if(Array.isArray(value)){
    const arr=value.filter(Boolean);
    return arr.length?arr.join(" · "):fallback;
  }
  const text=String(value||"").trim();
  return text||fallback;
}

function categoryLabel(inst){
  const map={
    kres:"Kreş & Anaokulu",dershane:"Dershane / Kurs Merkezi",surucu:"Sürücü Kursu",
    ozel_ders:"Özel Ders",dil_kursu:"Dil Kursu",etut:"Etüt Merkezi",ozel_okul:"Özel Okul",
    yurt:"Öğrenci Yurdu",oto_servis:"Oto Servis",restoran:"Restoran",kafe:"Kafe",
    emlak_ofisi:"Emlak Ofisi",otel:"Otel",reklam:"Reklam / Tasarım",diger:"Diğer Hizmet"
  };
  return map[inst.subCategory||inst.category]||inst.subCategoryLabel||inst.mainCategoryLabel||"Kurum";
}

function showToast(message){
  const root=document.getElementById("compareToast");
  if(!root)return;
  root.textContent=message;
  root.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>root.classList.remove("show"),1800);
}

async function loadInstitutions(){
  if(!selectedIds.length){
    institutions=[];
    render();
    return;
  }

  const rows=await Promise.all(selectedIds.map(async id=>{
    try{
      const snap=await db.collection("institutions").doc(id).get();
      if(!snap.exists)return null;
      const data=snap.data()||{};
      if(String(data.status||"active")==="passive")return null;
      return {
        id:snap.id,
        ...data,
        programs:Array.isArray(data.programs)?data.programs:listValue(data.programs),
        highlights:Array.isArray(data.highlights)?data.highlights:listValue(data.highlights),
        classSize:data.classSize||data.classCapacity||"",
        trialExam:data.trialExam||data.examFrequency||"",
        guidance:data.guidance||data.counseling||"",
        studySupport:data.studySupport||data.etut||"",
        installment:data.installment||data.installmentInfo||"",
        priceLevel:data.priceLevel||data.priceRange||"",
        campaign:data.campaign||data.campaignTitle||""
      };
    }catch(error){
      console.warn("Kurum karşılaştırma verisi alınamadı:",id,error);
      return null;
    }
  }));

  institutions=rows.filter(Boolean);
  selectedIds=institutions.map(inst=>String(inst.id)).slice(0,3);
  saveIds();
  render();
}

function removeInstitution(id){
  selectedIds=selectedIds.filter(item=>String(item)!==String(id));
  saveIds();
  institutions=institutions.filter(item=>String(item.id)!==String(id));
  render();
}

function clearAll(){
  selectedIds=[];
  institutions=[];
  saveIds();
  render();
}

function renderSummary(){
  const count=document.getElementById("compareSelectedCount");
  const chips=document.getElementById("compareSelectedChips");
  if(count)count.textContent=institutions.length+" kurum seçildi";
  if(chips){
    chips.innerHTML=institutions.map(inst=>
      '<div class="compare-chip"><span>'+esc(inst.name||"Kurum")+'</span><button type="button" data-remove="'+esc(inst.id)+'" aria-label="Kaldır">×</button></div>'
    ).join("");
    chips.querySelectorAll("[data-remove]").forEach(button=>{
      button.addEventListener("click",()=>removeInstitution(button.dataset.remove));
    });
  }
}

function headCell(inst){
  const logo=safeUrl(inst.logoUrl||inst.coverUrl);
  const locationText=[inst.district,inst.city].filter(Boolean).join(" / ")||inst.location||"Konum belirtilmedi";
  return '<div class="compare-cell compare-head">'+
    '<div class="compare-head-logo">'+(logo?'<img src="'+esc(logo)+'" alt="">':'🏢')+'</div>'+
    '<h3>'+esc(inst.name||"Kurum")+'</h3>'+
    '<small>'+esc(categoryLabel(inst))+'</small>'+
    '<small>📍 '+esc(locationText)+'</small>'+
    '<small class="compare-head-rating">⭐ '+Number(inst.rating||0).toFixed(1)+' · '+Number(inst.reviewCount||0)+' değerlendirme</small>'+
    '<div class="compare-head-actions">'+
      '<a href="kurum.html?id='+encodeURIComponent(inst.id)+'">Profili İncele</a>'+
      '<button type="button" data-remove="'+esc(inst.id)+'" title="Karşılaştırmadan çıkar">×</button>'+
    '</div>'+
  '</div>';
}

function row(label,renderer){
  return '<div class="compare-cell compare-label">'+esc(label)+'</div>'+
    institutions.map(inst=>'<div class="compare-cell compare-value">'+renderer(inst)+'</div>').join("");
}

function renderTable(){
  const root=document.getElementById("compareTable");
  if(!root)return;
  root.style.setProperty("--compare-count",String(Math.max(institutions.length,1)));

  const program=(inst)=>{
    const programs=listValue(inst.programs);
    return '<strong>'+esc(value(programs.length?programs:(inst.classes||categoryLabel(inst))))+'</strong>';
  };

  root.innerHTML=
    '<div class="compare-cell compare-head compare-label"><strong>Kriter</strong><small>Kurum bilgileri</small></div>'+
    institutions.map(headCell).join("")+
    row("Programlar / Hizmetler",program)+
    row("Sınıf Mevcudu",inst=>'<strong>'+esc(value(inst.classSize))+'</strong>')+
    row("Deneme Sınavı",inst=>'<strong>'+esc(value(inst.trialExam))+'</strong>')+
    row("Rehberlik / Koçluk",inst=>'<strong>'+esc(value(inst.guidance))+'</strong>')+
    row("Etüt Desteği",inst=>'<strong>'+esc(value(inst.studySupport))+'</strong>')+
    row("Taksit",inst=>'<strong>'+esc(value(inst.installment))+'</strong>')+
    row("Fiyat Seviyesi / Aralığı",inst=>'<strong>'+esc(value(inst.priceLevel,"Fiyat için görüşün"))+'</strong>')+
    row("Güncel Kampanya",inst=>'<span class="campaign">'+esc(value(inst.campaign,"Kampanya belirtilmedi"))+'</span>')+
    row("Öne Çıkan Özellikler",inst=>'<span>'+esc(value(listValue(inst.highlights)))+'</span>')+
    row("Puan",inst=>'<strong>⭐ '+Number(inst.rating||0).toFixed(1)+'</strong><small>'+Number(inst.reviewCount||0)+' değerlendirme</small>')+
    row("Tavsiye",inst=>{
      const count=Number(inst.recommendationCount||0);
      const rate=Number(inst.recommendationRate);
      return count>0&&Number.isFinite(rate)
        ? '<span class="yes">👍 %'+Math.round(rate)+'</span><small>'+Number(inst.recommendationYes||0)+' kişi tavsiye etti</small>'
        : '<span>Henüz veri yok</span>';
    })+
    row("Konum",inst=>'<strong>📍 '+esc(value([inst.district,inst.city].filter(Boolean).join(" / ")||inst.location))+'</strong><small>'+esc(value(inst.address,""))+'</small>')+
    row("Çalışma Saatleri",inst=>'<strong>'+esc(value(inst.weekdayHours))+'</strong>')+
    row("Tanıtım İçeriği",inst=>{
      const items=[];
      if(inst.video||inst.videoUrl||inst.profileVideoUrl||inst.locationVideoUrl)items.push("▶ Videolu profil");
      if(inst.virtualTourUrl||inst.tour360Url||inst.tourUrl)items.push("360° tur");
      return '<span>'+esc(value(items,"Standart profil"))+'</span>';
    })+
    row("Bilgi / Fiyat",inst=>inst.offer!==false?'<span class="yes">✓ Talep gönderilebilir</span>':'<span>Kapalı</span>');

  root.querySelectorAll("[data-remove]").forEach(button=>{
    button.addEventListener("click",()=>removeInstitution(button.dataset.remove));
  });
}

function render(){
  renderSummary();
  const empty=document.getElementById("compareEmptyState");
  const content=document.getElementById("comparePageContent");
  const clear=document.getElementById("compareClearAllBtn");

  const has=institutions.length>0;
  empty?.classList.toggle("hidden",has);
  content?.classList.toggle("hidden",!has);
  if(clear)clear.disabled=!has;

  if(has)renderTable();

  if(institutions.length===1){
    showToast("Karşılaştırma için bir kurum daha ekleyin.");
  }
}

document.getElementById("compareClearAllBtn")?.addEventListener("click",clearAll);
loadInstitutions();