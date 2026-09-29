const firebaseConfig={
  apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",
  authDomain:"dijiyer.firebaseapp.com",
  projectId:"dijiyer",
  storageBucket:"dijiyer.firebasestorage.app",
  messagingSenderId:"847787778815",
  appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

const params=new URLSearchParams(window.location.search);
const institutionId=String(params.get("id")||"").trim();
const preview=params.get("onizleme")==="1";

function el(id){return document.getElementById(id)}
function safe(value){return String(value??"")}
function safeUrl(value){
  const raw=safe(value).trim();
  if(!raw)return "";
  try{
    const url=new URL(raw,window.location.href);
    return ["http:","https:"].includes(url.protocol)?url.href:"";
  }catch(_){return ""}
}
function instagramUrl(value){
  const raw=safe(value).trim();
  if(!raw)return "";
  if(raw.startsWith("@"))return "https://instagram.com/"+encodeURIComponent(raw.slice(1));
  if(/^[a-zA-Z0-9._]+$/.test(raw))return "https://instagram.com/"+encodeURIComponent(raw);
  return safeUrl(raw);
}
function whatsappNumber(value){
  let digits=safe(value).replace(/\D/g,"");
  if(digits.startsWith("00"))digits=digits.slice(2);
  if(digits.startsWith("0")&&digits.length===11)digits="90"+digits.slice(1);
  else if(digits.length===10&&digits.startsWith("5"))digits="90"+digits;
  return digits;
}
function localDayKey(date=new Date()){
  return [
    date.getFullYear(),
    String(date.getMonth()+1).padStart(2,"0"),
    String(date.getDate()).padStart(2,"0")
  ].join("-");
}
function toast(text){
  const box=el("toast");
  box.textContent=text;
  box.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>box.classList.remove("show"),1800);
}
async function track(type){
  if(preview||!institutionId)return;
  try{
    await db.collection("institutionAnalytics").add({
      institutionId,
      type,
      day:localDayKey(),
      date:new Date().toISOString()
    });
  }catch(error){console.warn("Analytics kaydedilemedi",error)}
}
async function loadReviews(){
  try{
    const snap=await db.collection("institutionReviews")
      .where("institutionId","==",institutionId)
      .get();

    const rows=snap.docs
      .map(doc=>({id:doc.id,...doc.data()}))
      .filter(item=>item.status==="published")
      .sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));

    const avg=rows.length
      ? rows.reduce((sum,item)=>sum+Number(item.rating||0),0)/rows.length
      : 0;

    el("profileRating").textContent="⭐ "+(rows.length?avg.toFixed(1):"0.0")+" · "+rows.length+" değerlendirme";
    el("reviewCount").textContent=rows.length+" değerlendirme";

    el("reviews").innerHTML=rows.length
      ? rows.slice(0,10).map(item=>`
        <article class="review-card">
          <div class="review-card-top">
            <strong>Dijiyer Kullanıcısı</strong>
            <span>${"★".repeat(Number(item.rating||0))}${"☆".repeat(Math.max(0,5-Number(item.rating||0)))}</span>
          </div>
          <p>${safe(item.text)}</p>
        </article>
      `).join("")
      : '<div class="empty-content">Henüz değerlendirme yok.</div>';
  }catch(error){
    console.error(error);
    el("reviews").innerHTML='<div class="empty-content">Yorumlar şu anda yüklenemedi.</div>';
  }
}
function renderInstitution(data){
  document.title=(data.name||"Kurum")+" - Dijiyer";

  const name=data.name||"Kurum";
  el("profileName").textContent=name;
  el("profileLocation").textContent="📍 "+([data.city,data.district].filter(Boolean).join(" / ")||data.location||"Konum belirtilmedi");
  el("profileDescription").textContent=data.description||"";
  el("profileDescription").classList.toggle("hidden",!data.description);
  el("vipBadge").classList.toggle("hidden",!data.vip);

  const cover=safeUrl(data.coverUrl);
  el("profileCover").innerHTML=cover
    ? '<img src="'+cover+'" alt="'+name+' kapak görseli">'
    : '<div class="cover-placeholder">Dijiyer Kurum Profili</div>';

  const logo=safeUrl(data.logoUrl);
  el("profileLogo").innerHTML=logo
    ? '<img src="'+logo+'" alt="'+name+' logosu">'
    : "🏢";

  el("serviceAreas").textContent=data.serviceAreas||data.location||[data.city,data.district].filter(Boolean).join(" / ")||"-";
  el("phoneValue").textContent=data.phone||"-";
  el("addressValue").textContent=data.address||"-";
  el("weekdayHours").textContent=data.weekdayHours||"-";
  el("saturdayHours").textContent=data.saturdayHours||"-";
  el("sundayHours").textContent=data.sundayHours||"-";

  const gallery=Array.isArray(data.galleryUrls)
    ? data.galleryUrls.map(safeUrl).filter(Boolean).slice(0,12)
    : [];
  el("galleryCount").textContent=gallery.length+" görsel";
  el("gallery").innerHTML=gallery.length
    ? gallery.map((url,index)=>'<img src="'+url+'" alt="Galeri görseli '+(index+1)+'">').join("")
    : '<div class="empty-content">Kurum henüz galeri görseli eklemedi.</div>';

  const website=safeUrl(data.website);
  const instagram=instagramUrl(data.instagram);
  const whatsapp=whatsappNumber(data.whatsapp||data.phone);

  el("websiteBtn").classList.toggle("hidden",!website);
  el("instagramBtn").classList.toggle("hidden",!instagram);

  el("websiteBtn").onclick=()=>website&&window.open(website,"_blank","noopener");
  el("instagramBtn").onclick=()=>instagram&&window.open(instagram,"_blank","noopener");

  el("whatsappBtn").onclick=()=>{
    if(!whatsapp){
      toast("WhatsApp numarası bulunmuyor.");
      return;
    }
    track("whatsapp_click");
    const message=encodeURIComponent("Merhaba, Dijiyer üzerinden "+name+" profilinizi gördüm. Bilgi almak istiyorum.");
    window.open("https://wa.me/"+whatsapp+"?text="+message,"_blank","noopener");
  };

  el("routeBtn").onclick=()=>{
    if(Number.isFinite(Number(data.lat))&&Number.isFinite(Number(data.lng))){
      track("route_click");
      window.open("https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(data.lat+","+data.lng),"_blank","noopener");
      return;
    }
    toast("Kurumun harita konumu henüz eklenmemiş.");
  };

  el("quoteBtn").onclick=()=>{
    const url=new URL("index.html",window.location.href);
    url.searchParams.set("kurum",institutionId);
    url.hash="exploreSection";
    window.location.href=url.toString();
  };

  el("loadingState").classList.add("hidden");
  el("institutionProfile").classList.remove("hidden");
  if(preview)el("previewBanner").classList.remove("hidden");

  loadReviews();
  track("profile_view");
}
async function init(){
  if(!institutionId){
    el("loadingState").classList.add("hidden");
    el("errorState").classList.remove("hidden");
    return;
  }
  try{
    const snap=await db.collection("institutions").doc(institutionId).get();
    if(!snap.exists)throw new Error("not-found");
    renderInstitution({id:snap.id,...snap.data()});
  }catch(error){
    console.error(error);
    el("loadingState").classList.add("hidden");
    el("errorState").classList.remove("hidden");
  }
}
init();