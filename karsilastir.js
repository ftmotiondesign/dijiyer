const firebaseConfig={apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",authDomain:"dijiyer.firebaseapp.com",projectId:"dijiyer",storageBucket:"dijiyer.firebasestorage.app",messagingSenderId:"847787778815",appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"};
const compareApp=firebase.apps.find(app=>app.name==="comparePage")||firebase.initializeApp(firebaseConfig,"comparePage");
const db=compareApp.firestore();

const STORAGE_KEY="dijiyerCompareInstitutionIdsV1";
let selectedIds=loadIds();
let institutions=[];
let allInstitutions=[];
let filteredInstitutions=[];

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

function normalize(value){
  return String(value||"")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i")
    .replace(/ş/g,"s")
    .replace(/ğ/g,"g")
    .replace(/ü/g,"u")
    .replace(/ö/g,"o")
    .replace(/ç/g,"c")
    .trim();
}

function categoryLabel(inst){
  const map={
    kres:"Kreş & Anaokulu",dershane:"Dershane / Kurs Merkezi",surucu:"Sürücü Kursu",
    ozel_ders:"Özel Ders",dil_kursu:"Dil Kursu",etut:"Etüt Merkezi",ozel_okul:"Özel Okul",
    yurt:"Öğrenci Yurdu",oto_servis:"Oto Servis",kaporta_boya:"Kaporta / Boya",
    oto_elektrik:"Oto Elektrik",lastik_jant:"Lastik / Jant",oto_yikama:"Oto Yıkama",
    ekspertiz:"Oto Ekspertiz",galeri:"Oto Galeri",rentacar:"Rent a Car",
    yedek_parca:"Yedek Parça",motosiklet:"Motosiklet Servisi",restoran:"Restoran",
    kafe:"Kafe",fastfood:"Fast Food",pastane:"Pastane",pizza:"Pizza",doner:"Döner",
    pide_lahmacun:"Pide / Lahmacun",catering:"Catering",ev_yemekleri:"Ev Yemekleri",
    dis_klinigi:"Diş Kliniği",klinik:"Sağlık Kliniği",psikolog:"Psikolog",
    diyetisyen:"Diyetisyen",fizyoterapi:"Fizyoterapi",guzellik:"Güzellik Merkezi",
    kuafor:"Kuaför",berber:"Berber",spor:"Pilates / Fitness",mobilya:"Mobilya",
    dekorasyon:"Dekorasyon",insaat:"İnşaat / Tadilat",elektrikci:"Elektrikçi",
    tesisatci:"Tesisatçı",teknik_servis:"Teknik Servis",klima:"Klima Servisi",
    cam_balkon:"Cam Balkon / PVC",temizlik:"Temizlik",emlak_ofisi:"Emlak Ofisi",
    konut:"Konut",arsa:"Arsa / Tarla",ticari:"Ticari Gayrimenkul",gunluk_kiralik:"Günlük Kiralık",
    otel:"Otel",pansiyon:"Pansiyon",apart:"Apart",bungalov:"Bungalov",seyahat:"Seyahat / Tur",
    kamp:"Kamp / Karavan",dugun_salonu:"Düğün Salonu",organizasyon:"Organizasyon",
    fotograf:"Fotoğrafçı",video:"Video Çekimi",drone:"Drone Çekimi",gelinlik:"Gelinlik",
    cicekci:"Çiçekçi",reklam:"Reklam / Tasarım",nakliyat:"Nakliyat",kurye:"Kurye",
    sehirici:"Şehir İçi Taşımacılık",depolama:"Depolama",hukuk:"Avukat / Hukuk",
    muhasebe:"Muhasebe",web:"Web Tasarım",sosyal_medya:"Sosyal Medya / Ajans",
    bilgisayar:"Bilgisayar / Teknoloji",danismanlik:"Danışmanlık",veteriner:"Veteriner",
    tarim:"Tarım / Hayvancılık",giyim:"Giyim",ayakkabi:"Ayakkabı",market:"Market",
    elektronik:"Elektronik / Telefon",kirtasiye:"Kırtasiye",petshop:"Pet Shop",
    zuccaciye:"Züccaciye",esnaf:"Yerel Esnaf",diger:"Diğer Hizmet"
  };
  return map[inst.subCategory||inst.category]||inst.subCategoryLabel||inst.mainCategoryLabel||"Kurum";
}

function locationText(inst){
  return [inst.district,inst.city].filter(Boolean).join(" / ")||inst.location||"Konum belirtilmedi";
}

function sectorKey(inst){
  return String(inst?.subCategory||inst?.category||inst?.mainCategory||"").trim();
}

function selectedSectorKey(){
  return institutions.length ? sectorKey(institutions[0]) : "";
}

function isSameSector(inst){
  const key=selectedSectorKey();
  return !key || sectorKey(inst)===key;
}

const educationSectorKeys=new Set(["kres","dershane","surucu","ozel_ders","dil_kursu","etut","ozel_okul","yurt"]);

function isEducationSector(inst){
  return educationSectorKeys.has(sectorKey(inst)) || String(inst?.mainCategory||"")==="egitim";
}

function campaignSponsorIsActive(inst){
  if(!inst?.campaignSponsored || !String(inst?.campaign||"").trim())return false;
  const now=new Date();
  const start=inst.campaignSponsorStart ? new Date(inst.campaignSponsorStart+"T00:00:00") : null;
  const end=inst.campaignSponsorEnd ? new Date(inst.campaignSponsorEnd+"T23:59:59") : null;
  if(start && Number.isFinite(start.getTime()) && now<start)return false;
  if(end && Number.isFinite(end.getTime()) && now>end)return false;
  return true;
}

function sponsoredCampaignHtml(inst){
  const text=value(inst.campaign,"Kampanya belirtilmedi");
  if(!campaignSponsorIsActive(inst)){
    return '<span class="campaign">'+esc(text)+'</span>';
  }

  const endText=inst.campaignSponsorEnd
    ? '<small>'+esc(inst.campaignSponsorEnd.split("-").reverse().join("."))+' tarihine kadar</small>'
    : '';

  const url=safeUrl(inst.campaignSponsorUrl);
  const cta=url
    ? '<a class="sponsored-campaign-cta" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(inst.campaignSponsorCta||"Kampanyayı İncele")+'</a>'
    : '';

  return '<div class="sponsored-campaign-card">'+
    '<span class="sponsored-campaign-badge">Sponsorlu Kampanya</span>'+
    '<strong>'+esc(text)+'</strong>'+
    endText+
    cta+
    '<em>Reklam</em>'+
  '</div>';
}

function showToast(message){
  const root=document.getElementById("compareToast");
  if(!root)return;
  root.textContent=message;
  root.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>root.classList.remove("show"),1800);
}

function normalizeInstitutionData(id,data={}){
  return {
    id:String(id),
    ...data,
    city:String(data.city||"").trim(),
    district:String(data.district||"").trim(),
    name:String(data.name||"Kurum").trim(),
    programs:Array.isArray(data.programs)?data.programs:listValue(data.programs),
    highlights:Array.isArray(data.highlights)?data.highlights:listValue(data.highlights),
    classSize:data.classSize||data.classCapacity||"",
    trialExam:data.trialExam||data.examFrequency||"",
    guidance:data.guidance||data.counseling||"",
    studySupport:data.studySupport||data.etut||"",
    installment:data.installment||data.installmentInfo||"",
    priceLevel:data.priceLevel||data.priceRange||"",
    campaign:data.campaign||data.campaignTitle||"",
    campaignSponsored:Boolean(data.campaignSponsored),
    campaignSponsorStart:String(data.campaignSponsorStart||""),
    campaignSponsorEnd:String(data.campaignSponsorEnd||""),
    campaignSponsorRevenue:Number(data.campaignSponsorRevenue||0),
    campaignSponsorCta:String(data.campaignSponsorCta||"Kampanyayı İncele"),
    campaignSponsorUrl:String(data.campaignSponsorUrl||"")
  };
}

async function loadAllInstitutions(){
  try{
    const snap=await db.collection("institutions").get();
    allInstitutions=snap.docs
      .map(doc=>normalizeInstitutionData(doc.id,doc.data()||{}))
      .filter(inst=>String(inst.status||"active")!=="passive");

    allInstitutions.sort((a,b)=>
      Number(Boolean(b.vip))-Number(Boolean(a.vip)) ||
      Number(b.rating||0)-Number(a.rating||0) ||
      String(a.name||"").localeCompare(String(b.name||""),"tr")
    );

    setupPickerOptions();
    hydrateSelectedInstitutions();
    applyFilters();
  }catch(error){
    console.error("Kurumlar yüklenemedi:",error);
    allInstitutions=[];
    institutions=[];
    render();
    renderSearchResults();
  }
}

function hydrateSelectedInstitutions(){
  institutions=selectedIds
    .map(id=>allInstitutions.find(inst=>String(inst.id)===String(id)))
    .filter(Boolean);
  selectedIds=institutions.map(inst=>String(inst.id)).slice(0,3);
  saveIds();
  render();
}

function setupPickerOptions(){
  const city=document.getElementById("compareCityFilter");
  const district=document.getElementById("compareDistrictFilter");
  const category=document.getElementById("compareCategoryFilter");
  if(!city||!district||!category)return;

  const currentCity=city.value;
  const currentCategory=category.value;

  const cities=[...new Set(allInstitutions.map(inst=>inst.city).filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,"tr"));
  city.innerHTML='<option value="">Tüm İller</option>'+
    cities.map(item=>'<option value="'+esc(item)+'">'+esc(item)+'</option>').join("");
  if(cities.includes(currentCity))city.value=currentCity;

  const categoriesMap=new Map();
  allInstitutions.forEach(inst=>{
    const key=String(inst.subCategory||inst.category||inst.mainCategory||"").trim();
    if(!key)return;
    if(!categoriesMap.has(key))categoriesMap.set(key,categoryLabel(inst));
  });
  const categories=[...categoriesMap.entries()].sort((a,b)=>a[1].localeCompare(b[1],"tr"));
  category.innerHTML='<option value="">Tüm Kategoriler</option>'+
    categories.map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
  if(categoriesMap.has(currentCategory))category.value=currentCategory;

  refreshDistrictOptions();
}

function refreshDistrictOptions(){
  const cityValue=String(document.getElementById("compareCityFilter")?.value||"").trim();
  const district=document.getElementById("compareDistrictFilter");
  if(!district)return;

  const current=district.value;
  if(!cityValue){
    district.innerHTML='<option value="">Tüm İlçeler</option>';
    district.disabled=true;
    return;
  }

  const districts=[...new Set(
    allInstitutions
      .filter(inst=>inst.city===cityValue)
      .map(inst=>inst.district)
      .filter(Boolean)
  )].sort((a,b)=>a.localeCompare(b,"tr"));

  district.innerHTML='<option value="">Tüm İlçeler</option>'+
    districts.map(item=>'<option value="'+esc(item)+'">'+esc(item)+'</option>').join("");
  district.disabled=false;
  if(districts.includes(current))district.value=current;
}

function institutionSearchText(inst){
  return normalize([
    inst.name,
    inst.description,
    inst.city,
    inst.district,
    categoryLabel(inst),
    ...(inst.programs||[]),
    ...(inst.highlights||[]),
    inst.classes,
    inst.classSize,
    inst.trialExam,
    inst.guidance,
    inst.studySupport,
    inst.installment,
    inst.priceLevel,
    inst.campaign
  ].filter(Boolean).join(" "));
}

function applyFilters(){
  const city=String(document.getElementById("compareCityFilter")?.value||"").trim();
  const district=String(document.getElementById("compareDistrictFilter")?.value||"").trim();
  const category=String(document.getElementById("compareCategoryFilter")?.value||"").trim();
  const query=normalize(document.getElementById("compareSearchInput")?.value||"");

  filteredInstitutions=allInstitutions.filter(inst=>{
    const categoryKey=String(inst.subCategory||inst.category||inst.mainCategory||"").trim();
    return (!city||inst.city===city) &&
      (!district||inst.district===district) &&
      (!category||categoryKey===category) &&
      (!query||institutionSearchText(inst).includes(query));
  });

  renderSearchResults();
}

function renderSearchResults(){
  const root=document.getElementById("compareSearchResults");
  const count=document.getElementById("compareSearchResultCount");
  if(!root)return;

  if(count){
    count.textContent=filteredInstitutions.length
      ? filteredInstitutions.length+" kurum bulundu"
      : "Sonuç bulunamadı";
  }

  if(!filteredInstitutions.length){
    root.innerHTML='<div class="compare-search-empty">Filtrelere uygun aktif kurum bulunamadı.</div>';
    return;
  }

  root.innerHTML=filteredInstitutions.slice(0,24).map(inst=>{
    const selected=selectedIds.includes(String(inst.id));
    const wrongSector=!selected && !isSameSector(inst);
    const disabled=!selected && (selectedIds.length>=3 || wrongSector);
    const logo=safeUrl(inst.logoUrl||inst.coverUrl);
    const programs=listValue(inst.programs).slice(0,3);
    const tags=[
      ...programs,
      inst.classSize ? "Sınıf "+inst.classSize : "",
      inst.campaign ? "Kampanya var" : ""
    ].filter(Boolean).slice(0,3);

    return '<article class="compare-search-card '+(selected?'is-selected':'')+'">'+
      '<div class="compare-search-logo">'+(logo?'<img src="'+esc(logo)+'" alt="">':'🏢')+'</div>'+
      '<div class="compare-search-copy">'+
        '<strong>'+esc(inst.name)+'</strong>'+
        '<small>'+esc(categoryLabel(inst))+' · 📍 '+esc(locationText(inst))+'</small>'+
        '<div class="compare-search-tags">'+tags.map(tag=>'<span>'+esc(tag)+'</span>').join("")+'</div>'+
      '</div>'+
      '<div class="compare-search-actions">'+
        '<button type="button" class="'+(selected?'is-selected':'')+'" data-picker-toggle="'+esc(inst.id)+'" '+(disabled?'disabled':'')+' title="'+(wrongSector?'Sadece aynı sektördeki kurumlar karşılaştırılabilir':'')+'">'+
          (selected?'✓ Karşılaştırmada':(wrongSector?'Farklı sektör':'+ Karşılaştırmaya Ekle'))+
        '</button>'+
        '<a href="kurum.html?id='+encodeURIComponent(inst.id)+'">İncele</a>'+
      '</div>'+
    '</article>';
  }).join("");

  root.querySelectorAll("[data-picker-toggle]").forEach(button=>{
    button.addEventListener("click",()=>toggleSelectedInstitution(button.dataset.pickerToggle));
  });
}

function toggleSelectedInstitution(id){
  const key=String(id||"");
  if(!key)return;

  if(selectedIds.includes(key)){
    selectedIds=selectedIds.filter(item=>item!==key);
  }else{
    if(selectedIds.length>=3){
      showToast("En fazla 3 kurum karşılaştırabilirsiniz.");
      return;
    }
    const candidate=allInstitutions.find(inst=>String(inst.id)===key);
    if(candidate && !isSameSector(candidate)){
      showToast("Sadece aynı sektördeki kurumları karşılaştırabilirsiniz.");
      return;
    }
    selectedIds.push(key);
  }

  saveIds();
  institutions=selectedIds
    .map(item=>allInstitutions.find(inst=>String(inst.id)===String(item)))
    .filter(Boolean);

  render();
  renderSearchResults();

  if(institutions.length===2){
    showToast("2 kurum seçildi. Karşılaştırma tablosu hazır.");
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        document.getElementById("comparePageContent")?.scrollIntoView({
          behavior:"smooth",
          block:"start"
        });
      });
    });
  }
}

function removeInstitution(id){
  selectedIds=selectedIds.filter(item=>String(item)!==String(id));
  saveIds();
  institutions=institutions.filter(item=>String(item.id)!==String(id));
  render();
  renderSearchResults();
}

function clearAll(){
  selectedIds=[];
  institutions=[];
  saveIds();
  render();
  renderSearchResults();
}

function renderSummary(){
  const count=document.getElementById("compareSelectedCount");
  const chips=document.getElementById("compareSelectedChips");
  const remaining=document.getElementById("compareRemainingSlot");
  if(count){
    const sector=institutions.length ? categoryLabel(institutions[0]) : "";
    count.textContent=institutions.length+" kurum seçildi"+(sector?" · "+sector:"");
  }
  if(remaining){
    const left=Math.max(0,3-institutions.length);
    remaining.textContent=left
      ? left+" kurum daha ekleyebilirsiniz"
      : "Maksimum 3 kurum seçildi";
  }
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
  return '<div class="compare-cell compare-head">'+
    '<div class="compare-head-logo">'+(logo?'<img src="'+esc(logo)+'" alt="">':'🏢')+'</div>'+
    '<h3>'+esc(inst.name||"Kurum")+'</h3>'+
    '<small>'+esc(categoryLabel(inst))+'</small>'+
    '<small>📍 '+esc(locationText(inst))+'</small>'+
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

  const educationMode=institutions.length ? isEducationSector(institutions[0]) : false;

  let rowsHtml=
    row("Hizmetler / Programlar",program);

  if(educationMode){
    rowsHtml+=
      row("Sınıf Mevcudu",inst=>'<strong>'+esc(value(inst.classSize))+'</strong>')+
      row("Deneme Sınavı",inst=>'<strong>'+esc(value(inst.trialExam))+'</strong>')+
      row("Rehberlik / Koçluk",inst=>'<strong>'+esc(value(inst.guidance))+'</strong>')+
      row("Etüt Desteği",inst=>'<strong>'+esc(value(inst.studySupport))+'</strong>');
  }

  rowsHtml+=
    row("Öne Çıkan Özellikler",inst=>'<span>'+esc(value(listValue(inst.highlights)))+'</span>')+
    row("Fiyat Seviyesi / Aralığı",inst=>'<strong>'+esc(value(inst.priceLevel,"Fiyat için görüşün"))+'</strong>')+
    row("Taksit / Ödeme",inst=>'<strong>'+esc(value(inst.installment))+'</strong>')+
    row("Güncel Kampanya",inst=>sponsoredCampaignHtml(inst))+
    row("Puan",inst=>'<strong>⭐ '+Number(inst.rating||0).toFixed(1)+'</strong><small>'+Number(inst.reviewCount||0)+' değerlendirme</small>')+
    row("Tavsiye",inst=>{
      const count=Number(inst.recommendationCount||0);
      const rate=Number(inst.recommendationRate);
      return count>0&&Number.isFinite(rate)
        ? '<span class="yes">👍 %'+Math.round(rate)+'</span><small>'+Number(inst.recommendationYes||0)+' kişi tavsiye etti</small>'
        : '<span>Henüz veri yok</span>';
    })+
    row("Konum",inst=>'<strong>📍 '+esc(value(locationText(inst)))+'</strong><small>'+esc(value(inst.address,""))+'</small>')+
    row("Çalışma Saatleri",inst=>'<strong>'+esc(value(inst.weekdayHours))+'</strong>')+
    row("Tanıtım İçeriği",inst=>{
      const items=[];
      if(inst.video||inst.videoUrl||inst.profileVideoUrl||inst.locationVideoUrl)items.push("▶ Videolu profil");
      if(inst.virtualTourUrl||inst.tour360Url||inst.tourUrl)items.push("360° tur");
      return '<span>'+esc(value(items,"Standart profil"))+'</span>';
    })+
    row("Bilgi / Fiyat",inst=>inst.offer!==false?'<span class="yes">✓ Talep gönderilebilir</span>':'<span>Kapalı</span>');

  root.innerHTML=
    '<div class="compare-cell compare-head compare-label"><strong>Kriter</strong><small>'+esc(institutions.length?categoryLabel(institutions[0]):"Kurum bilgileri")+'</small></div>'+
    institutions.map(headCell).join("")+
    rowsHtml;

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
}

document.getElementById("compareClearAllBtn")?.addEventListener("click",clearAll);
document.getElementById("compareCityFilter")?.addEventListener("change",()=>{
  refreshDistrictOptions();
  applyFilters();
});
document.getElementById("compareDistrictFilter")?.addEventListener("change",applyFilters);
document.getElementById("compareCategoryFilter")?.addEventListener("change",applyFilters);
document.getElementById("compareSearchInput")?.addEventListener("input",applyFilters);
document.getElementById("compareFilterClearBtn")?.addEventListener("click",()=>{
  const city=document.getElementById("compareCityFilter");
  const district=document.getElementById("compareDistrictFilter");
  const category=document.getElementById("compareCategoryFilter");
  const search=document.getElementById("compareSearchInput");
  if(city)city.value="";
  if(district){
    district.value="";
    district.disabled=true;
    district.innerHTML='<option value="">Tüm İlçeler</option>';
  }
  if(category)category.value="";
  if(search)search.value="";
  applyFilters();
});

loadAllInstitutions();