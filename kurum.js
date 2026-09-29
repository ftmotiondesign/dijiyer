const firebaseConfig={apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",authDomain:"dijiyer.firebaseapp.com",projectId:"dijiyer",storageBucket:"dijiyer.firebasestorage.app",messagingSenderId:"847787778815",appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"};
const publicApp=firebase.apps.find(a=>a.name==="publicInstitution")||firebase.initializeApp(firebaseConfig,"publicInstitution");
const db=publicApp.firestore();
const params=new URLSearchParams(location.search);
const institutionId=String(params.get("id")||params.get("kurum")||"").trim();
const preview=params.get("onizleme")==="1";
let institution=null,reviews=[],publicMap=null,currentRating=0;

const categoryLabels={kres:"Kreş & Anaokulu",dershane:"Dershane / Kurs Merkezi",surucu:"Sürücü Kursu",ozel_ders:"Özel Ders",dil_kursu:"Dil Kursu",etut:"Etüt Merkezi",ozel_okul:"Özel Okul",yurt:"Öğrenci Yurdu",oto_servis:"Oto Servis / Tamir",kaporta_boya:"Kaporta / Boya",oto_elektrik:"Oto Elektrik",lastik_jant:"Lastik / Jant",oto_yikama:"Oto Yıkama / Kuaför",ekspertiz:"Oto Ekspertiz",galeri:"Oto Galeri",rentacar:"Rent a Car",yedek_parca:"Yedek Parça",motosiklet:"Motosiklet Servisi",restoran:"Restoran",kafe:"Kafe",fastfood:"Fast Food",pastane:"Pastane",pizza:"Pizza",doner:"Döner",pide_lahmacun:"Pide / Lahmacun",catering:"Catering",ev_yemekleri:"Ev Yemekleri",dis_klinigi:"Diş Kliniği",klinik:"Sağlık Kliniği",psikolog:"Psikolog",diyetisyen:"Diyetisyen",fizyoterapi:"Fizyoterapi",guzellik:"Güzellik Merkezi",kuafor:"Kuaför",berber:"Berber",spor:"Pilates / Fitness",mobilya:"Mobilya",dekorasyon:"Dekorasyon",insaat:"İnşaat / Tadilat",elektrikci:"Elektrikçi",tesisatci:"Tesisatçı",teknik_servis:"Beyaz Eşya / Teknik Servis",klima:"Klima Servisi",cam_balkon:"Cam Balkon / PVC",temizlik:"Temizlik Hizmetleri",emlak_ofisi:"Emlak Ofisi",konut:"Konut",arsa:"Arsa / Tarla",ticari:"Ticari Gayrimenkul",gunluk_kiralik:"Günlük Kiralık",otel:"Otel",pansiyon:"Pansiyon",apart:"Apart",bungalov:"Bungalov",seyahat:"Seyahat Acentesi / Tur",kamp:"Kamp / Karavan",dugun_salonu:"Düğün Salonu",organizasyon:"Organizasyon Firması",fotograf:"Fotoğrafçı",video:"Video Çekimi",drone:"Drone Çekimi",gelinlik:"Gelinlik",cicekci:"Çiçekçi",reklam:"Reklam / Tasarım / Matbaa",nakliyat:"Evden Eve Nakliyat",kurye:"Kurye",sehirici:"Şehir İçi Taşımacılık",depolama:"Depolama",hukuk:"Avukat / Hukuk",muhasebe:"Muhasebe / Mali Müşavir",web:"Web Tasarım",sosyal_medya:"Sosyal Medya / Ajans",bilgisayar:"Bilgisayar / Teknoloji",danismanlik:"Danışmanlık",veteriner:"Veteriner / Pet Hizmetleri",tarim:"Tarım / Hayvancılık",giyim:"Giyim",ayakkabi:"Ayakkabı",market:"Market",elektronik:"Elektronik / Telefon",kirtasiye:"Kırtasiye",petshop:"Pet Shop",zuccaciye:"Züccaciye",esnaf:"Diğer Yerel Esnaf",diger:"Diğer Hizmet"};

const demoInstitutions={"1":{id:"1",name:"Özel Ayyıldız Sürücü Kursu",category:"surucu",city:"Çanakkale",district:"Merkez",address:"Atatürk Cd. No:42",classes:"B, A1, A2, D, BE",rating:4.8,reviewCount:128,offer:true,video:true,vip:true,lat:40.1511,lng:26.4052,emoji:"🚘",description:"Sürücü adaylarına teorik ve uygulamalı eğitim sunan yerel sürücü kursu.",isDemo:true},"2":{id:"2",name:"Troya Sürücü Kursu",category:"surucu",city:"Çanakkale",district:"Merkez",address:"İskele Cd. No:18",classes:"B, A1, A2, D",rating:4.6,reviewCount:96,offer:true,video:true,lat:40.1476,lng:26.4022,emoji:"🚗",description:"Ehliyet eğitiminde teorik dersler ve direksiyon eğitimleri.",isDemo:true},"3":{id:"3",name:"18 Mart Sürücü Kursu",category:"surucu",city:"Çanakkale",district:"Merkez",address:"Barbaros Mah. Troya Cd. No:7",classes:"B, A1, A2",rating:4.5,reviewCount:64,offer:true,video:true,lat:40.145,lng:26.414,emoji:"🚙",description:"Sürücü adaylarına ehliyet eğitimi ve direksiyon desteği.",isDemo:true}};

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function safeUrl(v){const raw=String(v||"").trim();if(!raw)return"";try{const u=new URL(raw,location.href);return["http:","https:"].includes(u.protocol)?u.href:""}catch(_){return""}}
function instagramUrl(v){const raw=String(v||"").trim();if(!raw)return"";if(raw.startsWith("@"))return"https://www.instagram.com/"+encodeURIComponent(raw.slice(1));if(/^[a-zA-Z0-9._]+$/.test(raw))return"https://www.instagram.com/"+encodeURIComponent(raw);return safeUrl(raw)}
function whatsappNumber(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("00"))d=d.slice(2);if(d.startsWith("0")&&d.length===11)d="90"+d.slice(1);else if(d.length===10&&d.startsWith("5"))d="90"+d;return d}
function categoryLabel(x){return categoryLabels[x.subCategory||x.category]||x.subCategory||x.category||"Kurum"}
function locationLabel(x){return[x.city,x.district].filter(Boolean).join(" / ")||x.location||"Konum belirtilmemiş"}
function ratingText(v){const n=Number(v||0);return Number.isFinite(n)&&n?n.toFixed(1):"-"}
function normalizeTrackingPhone(raw){let digits=String(raw||"").replace(/\D/g,"");if(digits.startsWith("90")&&digits.length===12)digits=digits.slice(2);if(digits.startsWith("0")&&digits.length===11)digits=digits.slice(1);return digits}
async function hashTrackingPhone(phone){const buffer=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(phone));return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,"0")).join("")}
function makeTrackingCode(){const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",bytes=new Uint8Array(12);crypto.getRandomValues(bytes);const body=Array.from(bytes).map(b=>alphabet[b%alphabet.length]).join("");return "DJY-T-"+body.slice(0,4)+"-"+body.slice(4,8)+"-"+body.slice(8,12)}
function trackingUrl(code){const u=new URL("teklif.html",location.href);u.searchParams.set("v","5");u.searchParams.set("kod",code);return u.toString()}
async function createDirectTrackingAccess(quoteId,request,displayCity,displayDistrict){
  const normalizedPhone=normalizeTrackingPhone(request.phone);
  const phoneHash=await hashTrackingPhone(normalizedPhone);
  const trackingCode=makeTrackingCode();
  const url=trackingUrl(trackingCode);
  await db.collection("quoteAccess").doc(phoneHash).collection("codes").doc(trackingCode).set({
    quoteId,
    trackingCode,
    phoneHash,
    service:request.service,
    mainCategory:request.mainCategory||"",
    subCategory:request.subCategory||request.category||"",
    mainCategoryLabel:request.mainCategory||"",
    subCategoryLabel:categoryLabel(institution),
    city:displayCity||"",
    district:displayDistrict||"",
    note:request.note||"",
    date:request.date,
    status:"active",
    createdAt:new Date().toISOString(),
    targetInstitutionId:String(request.targetInstitutionId||institution?.id||""),
    targetInstitutionName:String(request.targetInstitutionName||institution?.name||"Kurum")
  });
  return {trackingCode,trackingUrl:url,normalizedPhone};
}
function openDirectQuote(){
  if(!institution||institution.isDemo){showToast("Demo kurum için doğrudan teklif gönderilemez.");return}
  if(institution.offer===false){showToast("Bu kurum şu anda teklif kabul etmiyor.");return}
  document.getElementById("directQuoteFormView").classList.remove("hidden");
  document.getElementById("directQuoteSuccess").classList.add("hidden");
  document.getElementById("directQuoteMessage").textContent="";
  document.getElementById("directQuoteInstitutionName").textContent=institution.name||"Kurum";
  const service=document.getElementById("directQuoteService");
  if(service&&!service.value)service.value=categoryLabel(institution);
  document.getElementById("directQuoteModal").classList.remove("hidden");
}
function closeDirectQuote(){document.getElementById("directQuoteModal").classList.add("hidden")}
function routeUrl(x){if(Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)))return"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(x.lat+","+x.lng);return"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([x.address,x.district,x.city].filter(Boolean).join(", "))}
function services(x){const rows=[categoryLabel(x)];String(x.classes||"").split(/[,;\n]/).map(s=>s.trim()).filter(s=>s&&s.toLocaleLowerCase("tr-TR")!=="bilgi eklenecek").forEach(s=>rows.push(s));String(x.services||"").split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).forEach(s=>rows.push(s));return[...new Set(rows)].slice(0,12)}
function showToast(text){const e=document.getElementById("toast");e.textContent=text;e.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.classList.remove("show"),2000)}

function renderProfile(){
  const x=institution,logo=safeUrl(x.logoUrl),cover=safeUrl(x.coverUrl),video=safeUrl(x.videoUrl||x.profileVideoUrl||x.locationVideoUrl),gallery=(Array.isArray(x.galleryUrls)?x.galleryUrls:[]).map(safeUrl).filter(Boolean).slice(0,9),phone=String(x.phone||"").trim(),whatsapp=whatsappNumber(x.whatsapp||phone),website=safeUrl(x.website),instagram=instagramUrl(x.instagram),tour=safeUrl(x.virtualTourUrl||x.tour360Url||x.tourUrl),serviceRows=services(x);
  document.title=(x.name||"Kurum")+" | Dijiyer";
  const root=document.getElementById("institutionProfile");
  root.innerHTML=`
    <section class="kp-hero">
      <div class="kp-cover">
        ${video?`<video controls playsinline preload="metadata" ${cover?'poster="'+escapeHtml(cover)+'"':""}><source src="${escapeHtml(video)}"></video>`:cover?`<img src="${escapeHtml(cover)}" alt="${escapeHtml(x.name)} kapak">`:`<div class="kp-cover-empty">${escapeHtml(x.emoji||"🏢")}</div>`}
        <div class="kp-badges"><span class="kp-badge ok">✓ Onaylı Kurum</span>${x.offer!==false?'<span class="kp-badge offer">₺ Teklif Veriyor</span>':""}${x.video||video?'<span class="kp-badge video">▶ Videolu Kurum</span>':""}${x.vip?'<span class="kp-badge">★ Öne Çıkan</span>':""}</div>
      </div>
      <div class="kp-identity">
        <div class="kp-logo">${logo?'<img src="'+escapeHtml(logo)+'" alt="'+escapeHtml(x.name)+' logosu">':escapeHtml(x.emoji||"🏢")}</div>
        <div class="kp-title"><h1>${escapeHtml(x.name||"Kurum")}</h1><div class="kp-meta"><span>🏷️ ${escapeHtml(categoryLabel(x))}</span><span>📍 ${escapeHtml(locationLabel(x))}</span><span class="rating"><b>★</b> ${ratingText(x.rating)} ${Number(x.reviewCount||0)?"("+Number(x.reviewCount||0)+" değerlendirme)":""}</span></div></div>
        <div class="kp-actions">${x.offer!==false?'<button type="button" class="kp-btn primary" data-direct-quote>📄 Bu Kurumdan Teklif Al</button>':""}${whatsapp?'<button id="kpWhatsapp" class="kp-btn wa">💬 WhatsApp</button>':""}${phone?'<a class="kp-btn call" href="tel:'+escapeHtml(phone.replace(/[^+\d]/g,""))+'">☎ Ara</a>':""}<a id="kpRouteTop" class="kp-btn" href="${escapeHtml(routeUrl(x))}" target="_blank" rel="noopener">🧭 Yol Tarifi</a></div>
      </div>
    </section>

    <div class="kp-grid">
      <div class="kp-main">
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">KURUM HAKKINDA</span><h2>${escapeHtml(x.name||"Kurum")}</h2><p>${escapeHtml(locationLabel(x))}</p></div></div><p class="kp-about">${escapeHtml(x.description||"Kurum henüz detaylı açıklama eklemedi.")}</p></section>
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">HİZMETLER</span><h2>Sunulan Hizmetler</h2><p>Kurum profilinde belirtilen hizmetler.</p></div></div><div class="kp-services">${serviceRows.map(s=>'<span class="kp-service">✓ '+escapeHtml(s)+'</span>').join("")}</div></section>
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">FOTOĞRAF & VİDEO</span><h2>Kurumdan Görseller</h2><p>Mekan ve hizmet görsellerini inceleyin.</p></div></div><div class="kp-media">${gallery.length?gallery.map(u=>'<div class="kp-photo"><img src="'+escapeHtml(u)+'" alt="Kurum görseli"></div>').join(""):'<div class="kp-empty">Kurum henüz galeri görseli eklemedi.</div>'}</div>${tour?'<div class="kp-special"><a href="'+escapeHtml(tour)+'" target="_blank" rel="noopener">◉ 360° Sanal Turu Aç</a></div>':""}</section>
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">DEĞERLENDİRMELER</span><h2>Müşteri Yorumları</h2><p>Kurum hakkında yapılan değerlendirmeler.</p></div><div class="kp-review-score"><strong id="reviewScore">${ratingText(x.rating)}</strong><span id="reviewCount">${Number(x.reviewCount||0)} değerlendirme</span></div></div><div id="reviewsList" class="kp-review-list"><div class="kp-empty">Yorumlar yükleniyor...</div></div><button id="reviewOpenBtn" class="kp-btn" style="margin-top:9px">★ Yorum Yap / Puan Ver</button></section>
        ${!x.vip?'<section class="kp-card"><div class="kp-head"><div><span class="eyebrow">BENZER KURUMLAR</span><h2>Yakındaki Benzer Kurumlar</h2><p>Aynı kategori ve bölgedeki kurumlar.</p></div></div><div id="similarList" class="kp-similar"><div class="kp-empty">Benzer kurumlar yükleniyor...</div></div></section>':""}
      </div>

      <aside class="kp-side">
        ${x.offer!==false?`<section class="kp-card kp-trust"><div class="kp-trust-title"><span>🛡️</span><div><h3>Dijiyer Güvencesi</h3><p>Teklif süreci kayıt altında.</p></div></div><div class="kp-trust-list"><span>Teklif fiyatı ve süresi görünür</span><span>Seçilen fiyat kilitlenebilir</span><span>Teklif koduyla doğrulama yapılabilir</span><span>Sorunda Dijiyer Destek kullanılabilir</span></div><button type="button" class="kp-btn primary" data-direct-quote style="margin-top:11px">Bu Kurumdan Teklif Al</button></section>`:""}
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">İLETİŞİM</span><h2>Kurum Bilgileri</h2></div></div><div class="kp-info"><div class="kp-info-row"><i class="kp-info-icon">📍</i><div><span>Adres</span><strong>${escapeHtml(x.address||locationLabel(x))}</strong></div></div>${phone?`<div class="kp-info-row"><i class="kp-info-icon">☎</i><div><span>Telefon</span><strong>${escapeHtml(phone)}</strong></div></div>`:""}${website?`<div class="kp-info-row"><i class="kp-info-icon">🌐</i><div><span>Web Sitesi</span><strong><a href="${escapeHtml(website)}" target="_blank" rel="noopener">Siteyi Aç</a></strong></div></div>`:""}${instagram?`<div class="kp-info-row"><i class="kp-info-icon">◎</i><div><span>Instagram</span><strong><a href="${escapeHtml(instagram)}" target="_blank" rel="noopener">Instagram'a Git</a></strong></div></div>`:""}<div class="kp-info-row"><i class="kp-info-icon">🧭</i><div><span>Hizmet Bölgesi</span><strong>${escapeHtml(x.serviceAreas||locationLabel(x))}</strong></div></div></div></section>
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">ÇALIŞMA SAATLERİ</span><h2>Ne zaman açık?</h2></div></div><div class="kp-hours"><div class="kp-hour"><span>Hafta içi</span><b>${escapeHtml(x.weekdayHours||"Belirtilmedi")}</b></div><div class="kp-hour"><span>Cumartesi</span><b>${escapeHtml(x.saturdayHours||"Belirtilmedi")}</b></div><div class="kp-hour"><span>Pazar</span><b>${escapeHtml(x.sundayHours||"Belirtilmedi")}</b></div></div></section>
        <section class="kp-card"><div class="kp-head"><div><span class="eyebrow">KONUM</span><h2>Haritada Gör</h2><p>${escapeHtml(locationLabel(x))}</p></div></div><div id="kpMap"></div><div class="kp-map-actions"><a id="kpRoute" class="primary" href="${escapeHtml(routeUrl(x))}" target="_blank" rel="noopener">Yol Tarifi Al</a><a href="index.html">Dijiyer Haritası</a></div></section>
      </aside>
    </div>

    <nav class="kp-mobile-actions">${x.offer!==false?'<button type="button" class="primary" data-direct-quote>📄<span>Teklif</span></button>':""}${whatsapp?'<button id="kpWhatsappMobile" class="wa">💬<span>WhatsApp</span></button>':""}${phone?'<a href="tel:'+escapeHtml(phone.replace(/[^+\d]/g,""))+'">☎<span>Ara</span></a>':""}<a id="kpRouteMobile" href="${escapeHtml(routeUrl(x))}" target="_blank" rel="noopener">🧭<span>Yol</span></a></nav>
  `;

  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("errorState").classList.add("hidden");
  root.classList.remove("hidden");
  if(preview)document.getElementById("previewBanner").classList.remove("hidden");

  const whatsappAction=()=>{track("whatsapp_click");window.open("https://wa.me/"+whatsapp+"?text="+encodeURIComponent("Merhaba, Dijiyer üzerinden "+(x.name||"kurum")+" profilinizi gördüm. Bilgi almak istiyorum."),"_blank","noopener")};
  document.getElementById("kpWhatsapp")?.addEventListener("click",whatsappAction);
  document.getElementById("kpWhatsappMobile")?.addEventListener("click",whatsappAction);
  ["kpRoute","kpRouteTop","kpRouteMobile"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>track("route_click")));
  document.getElementById("reviewOpenBtn")?.addEventListener("click",()=>document.getElementById("reviewModal").classList.remove("hidden"));
  document.querySelectorAll("[data-direct-quote]").forEach(button=>button.addEventListener("click",openDirectQuote));

  initMap();
  renderReviews();
  loadSimilar();
  track("profile_view",true);
}

function initMap(){
  const root=document.getElementById("kpMap"),lat=Number(institution.lat),lng=Number(institution.lng);
  if(!root)return;
  if(!Number.isFinite(lat)||!Number.isFinite(lng)){root.innerHTML='<div class="kp-empty" style="margin:10px">Harita konumu eklenmedi.</div>';return}
  publicMap=L.map(root,{scrollWheelZoom:false}).setView([lat,lng],16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(publicMap);
  L.marker([lat,lng]).addTo(publicMap).bindPopup(escapeHtml(institution.name||"Kurum")).openPopup();
}

async function loadReviews(){
  if(institution.isDemo){reviews=[];renderReviews();return}
  try{
    const snap=await db.collection("institutionReviews").where("institutionId","==",String(institution.id)).get();
    reviews=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(r=>!r.status||r.status==="published").sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    if(reviews.length){
      const avg=reviews.reduce((sum,r)=>sum+Number(r.rating||0),0)/reviews.length;
      institution.rating=Number(avg.toFixed(1));
      institution.reviewCount=reviews.length;
    }
    renderReviews();
  }catch(error){console.error(error);document.getElementById("reviewsList").innerHTML='<div class="kp-empty">Yorumlar yüklenemedi.</div>'}
}

function renderReviews(){
  const list=document.getElementById("reviewsList");
  if(!list||!institution)return;
  const score=document.getElementById("reviewScore"),count=document.getElementById("reviewCount");
  if(score)score.textContent=ratingText(institution.rating);
  if(count)count.textContent=Number(institution.reviewCount||reviews.length||0)+" değerlendirme";
  list.innerHTML=reviews.length?reviews.slice(0,8).map(r=>`<article class="kp-review"><div class="kp-review-top"><strong>Dijiyer Kullanıcısı</strong><span>${"★".repeat(Math.max(1,Math.min(5,Number(r.rating||0))))}</span></div><p>${escapeHtml(r.text||"")}</p></article>`).join(""):'<div class="kp-empty">Henüz yorum yapılmamış. İlk değerlendirmeyi siz yapabilirsiniz.</div>';
}

async function loadSimilar(){
  // VIP kurumlarda ziyaretçiyi rakip profillere yönlendirmemek için
  // "Yakındaki Benzer Kurumlar" bölümü hiç gösterilmez.
  if(institution?.vip)return;

  const root=document.getElementById("similarList");
  if(!root)return;
  if(institution.isDemo){root.innerHTML='<div class="kp-empty">Benzer kurumlar gerçek kurum verileri geldikçe burada gösterilecek.</div>';return}
  try{
    const snap=await db.collection("institutions").get();
    const rows=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(x=>String(x.id)!==String(institution.id)&&String(x.subCategory||x.category||"")===String(institution.subCategory||institution.category||"")&&(!institution.city||String(x.city||"")===String(institution.city))).slice(0,3);
    root.innerHTML=rows.length?rows.map(x=>{const logo=safeUrl(x.logoUrl);return`<a class="kp-similar-card" href="kurum.html?id=${encodeURIComponent(x.id)}"><span class="kp-similar-logo">${logo?'<img src="'+escapeHtml(logo)+'" alt="">':escapeHtml(x.emoji||"🏢")}</span><span class="kp-similar-copy"><strong>${escapeHtml(x.name||"Kurum")}</strong><span>${escapeHtml([x.city,x.district].filter(Boolean).join(" / "))}</span><b>Profili Gör →</b></span></a>`}).join(""):'<div class="kp-empty">Bu bölgede benzer kurum bulunamadı.</div>';
  }catch(error){console.error(error);root.innerHTML='<div class="kp-empty">Benzer kurumlar yüklenemedi.</div>'}
}

document.getElementById("directQuoteClose").addEventListener("click",closeDirectQuote);
document.getElementById("directQuoteDone").addEventListener("click",closeDirectQuote);
document.getElementById("directQuoteModal").addEventListener("click",event=>{if(event.target.id==="directQuoteModal")closeDirectQuote()});

document.getElementById("directQuoteForm").addEventListener("submit",async event=>{
  event.preventDefault();
  if(!institution||institution.isDemo)return;

  const message=document.getElementById("directQuoteMessage");
  const submit=document.getElementById("directQuoteSubmit");
  const name=document.getElementById("directQuoteName").value.trim();
  const phone=document.getElementById("directQuotePhone").value.trim();
  const service=document.getElementById("directQuoteService").value.trim();
  const note=document.getElementById("directQuoteNote").value.trim();
  const normalizedPhone=normalizeTrackingPhone(phone);

  if(!name||!service){message.textContent="Adınızı ve talep konusunu yazın.";return}
  if(normalizedPhone.length<10){message.textContent="Geçerli bir telefon numarası yazın.";return}

  const mainCategory=String(institution.mainCategory||"diger");
  const subCategory=String(institution.subCategory||institution.category||"diger");
  const request={
    mainCategory,
    subCategory,
    category:subCategory,
    service,
    city:"__direct__",
    district:"",
    name,
    phone,
    note,
    status:"new",
    date:new Date().toISOString(),
    targetInstitutionId:String(institution.id),
    targetInstitutionName:String(institution.name||"Kurum")
  };

  const oldText=submit.textContent;
  submit.disabled=true;
  submit.textContent="Gönderiliyor...";
  message.textContent="";

  try{
    const quoteRef=await db.collection("quoteRequests").add(request);
    let tracking=null;

    try{
      tracking=await createDirectTrackingAccess(
        quoteRef.id,
        request,
        institution.city||"",
        institution.district||""
      );
    }catch(trackingError){
      console.error("Doğrudan teklif takip kodu oluşturulamadı:",trackingError);
    }

    const key="dijiyerCustomerQuoteIds";
    const saved=JSON.parse(localStorage.getItem(key)||"[]");
    if(!saved.includes(quoteRef.id))saved.unshift(quoteRef.id);
    localStorage.setItem(key,JSON.stringify(saved.slice(0,30)));

    const dataKey="dijiyerCustomerQuoteData";
    const dataMap=JSON.parse(localStorage.getItem(dataKey)||"{}");
    dataMap[quoteRef.id]={
      ...request,
      city:institution.city||"",
      district:institution.district||"",
      trackingCode:tracking?.trackingCode||"",
      trackingUrl:tracking?.trackingUrl||""
    };
    localStorage.setItem(dataKey,JSON.stringify(dataMap));

    document.getElementById("directQuoteFormView").classList.add("hidden");
    document.getElementById("directQuoteSuccess").classList.remove("hidden");
    document.getElementById("directQuoteSuccessText").textContent=
      "Talebiniz yalnızca "+(institution.name||"bu kuruma")+" gönderildi. Kurum fiyat verdiğinde teklifinizi takip edebilirsiniz.";

    const codeEl=document.getElementById("directTrackingCode");
    const linkEl=document.getElementById("directTrackingLink");

    if(tracking){
      codeEl.textContent=tracking.trackingCode;
      linkEl.href=tracking.trackingUrl;
      linkEl.classList.remove("hidden");
      sessionStorage.setItem("dijiyerTrackingCode",tracking.trackingCode);
      sessionStorage.setItem("dijiyerTrackingPhone",tracking.normalizedPhone);
      localStorage.setItem("dijiyerLastTrackingCode",tracking.trackingCode);
    }else{
      codeEl.textContent="Talep kaydedildi";
      linkEl.classList.add("hidden");
    }

    event.target.reset();
  }catch(error){
    console.error("Doğrudan teklif talebi gönderilemedi:",error);
    message.textContent=String(error?.code||"").includes("permission-denied")
      ?"Teklif gönderilemedi. Doğrudan teklif için Firestore kuralı yayınlanmalıdır."
      :"Teklif gönderilemedi. Lütfen tekrar deneyin.";
  }finally{
    submit.disabled=false;
    submit.textContent=oldText;
  }
});

function closeReviewModal(){document.getElementById("reviewModal").classList.add("hidden")}
document.getElementById("reviewModalClose").addEventListener("click",closeReviewModal);
document.getElementById("reviewModal").addEventListener("click",event=>{if(event.target.id==="reviewModal")closeReviewModal()});
document.querySelectorAll("#ratingPicker [data-rating]").forEach(button=>button.addEventListener("click",()=>{currentRating=Number(button.dataset.rating||0);document.querySelectorAll("#ratingPicker [data-rating]").forEach(x=>x.classList.toggle("active",Number(x.dataset.rating)<=currentRating))}));

document.getElementById("reviewForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const msg=document.getElementById("reviewMessage"),text=document.getElementById("reviewText").value.trim();
  if(institution.isDemo){msg.textContent="Demo kurum için yorum kaydı oluşturulamaz.";return}
  if(!currentRating){msg.textContent="Lütfen 1-5 yıldız seçin.";return}
  if(!text){msg.textContent="Lütfen yorumunuzu yazın.";return}
  const button=event.target.querySelector('button[type="submit"]'),old=button.textContent;
  button.disabled=true;button.textContent="Gönderiliyor...";
  try{
    await db.collection("institutionReviews").add({institutionId:String(institution.id),rating:currentRating,text,status:"published",date:new Date().toISOString()});
    event.target.reset();currentRating=0;document.querySelectorAll("#ratingPicker button").forEach(x=>x.classList.remove("active"));msg.textContent="Yorumunuz yayınlandı.";await loadReviews();setTimeout(closeReviewModal,650);
  }catch(error){console.error(error);msg.textContent="Yorum gönderilemedi."}
  finally{button.disabled=false;button.textContent=old}
});

async function track(type,dedupe=false){
  if(!institution||institution.isDemo||preview)return;
  if(dedupe&&type==="profile_view"){const key="dijiyer_public_view_"+institution.id,last=Number(localStorage.getItem(key)||0);if(Date.now()-last<1800000)return;localStorage.setItem(key,String(Date.now()))}
  const now=new Date(),day=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  try{await db.collection("institutionAnalytics").add({institutionId:String(institution.id),type,day,date:now.toISOString()})}catch(error){console.warn("Analytics kaydedilemedi",error)}
}

function showError(){document.getElementById("loadingState").classList.add("hidden");document.getElementById("institutionProfile").classList.add("hidden");document.getElementById("errorState").classList.remove("hidden")}

async function init(){
  if(!institutionId){showError();return}
  try{
    const doc=await db.collection("institutions").doc(institutionId).get();
    if(doc.exists){institution={id:doc.id,...doc.data(),isDemo:false};renderProfile();await loadReviews();return}
  }catch(error){console.error(error)}
  if(demoInstitutions[institutionId]){institution={...demoInstitutions[institutionId]};renderProfile();renderReviews();return}
  showError();
}
init();