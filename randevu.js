const firebaseConfig={apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",authDomain:"dijiyer.firebaseapp.com",projectId:"dijiyer",storageBucket:"dijiyer.firebasestorage.app",messagingSenderId:"847787778815",appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"};
const rvApp=firebase.apps.find(a=>a.name==="randevuPublic")||firebase.initializeApp(firebaseConfig,"randevuPublic");
const db=rvApp.firestore();

const CATEGORY_LABELS={
  kres:"Kreş & Anaokulu",dershane:"Dershane / Kurs",surucu:"Sürücü Kursu",ozel_ders:"Özel Ders",dil_kursu:"Dil Kursu",etut:"Etüt Merkezi",ozel_okul:"Özel Okul",
  oto_servis:"Oto Servis",kaporta_boya:"Kaporta / Boya",oto_elektrik:"Oto Elektrik",lastik_jant:"Lastik / Jant",oto_yikama:"Oto Yıkama",ekspertiz:"Oto Ekspertiz",motosiklet:"Motosiklet Servisi",
  dis_klinigi:"Diş Kliniği",klinik:"Sağlık Kliniği",psikolog:"Psikolog",diyetisyen:"Diyetisyen",fizyoterapi:"Fizyoterapi",guzellik:"Güzellik Merkezi",kuafor:"Kuaför",berber:"Berber",spor:"Pilates / Fitness",
  mobilya:"Mobilya",dekorasyon:"Dekorasyon",elektrikci:"Elektrikçi",tesisatci:"Tesisatçı",teknik_servis:"Teknik Servis",klima:"Klima Servisi",cam_balkon:"Cam Balkon / PVC",
  emlak_ofisi:"Emlak Ofisi",dugun_salonu:"Düğün Salonu",organizasyon:"Organizasyon",fotograf:"Fotoğrafçı",video:"Video Çekimi",gelinlik:"Gelinlik",hukuk:"Hukuk",muhasebe:"Mali Müşavir",danismanlik:"Danışmanlık",veteriner:"Veteriner",diger:"Diğer Hizmet"
};
let records=[];

const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const norm=v=>String(v??"").trim().toLocaleLowerCase("tr-TR");
const categoryKey=x=>String(x.subCategory||x.category||"diger");
const categoryLabel=x=>CATEGORY_LABELS[categoryKey(x)]||String(x.subCategory||x.category||"Kurum");
const locationLabel=x=>[x.city,x.district].filter(Boolean).join(" / ")||"Konum belirtilmemiş";
const servicesFor=(setting)=>Array.isArray(setting.services)?setting.services.filter(Boolean).slice(0,3):[];

async function load(){
  const loading=document.getElementById("rvLoading");
  try{
    const settingsSnap=await db.collection("appointmentSettings").where("enabled","==",true).get();
    const settings=settingsSnap.docs.map(d=>({id:d.id,...d.data()}));
    const chunks=[];
    for(let i=0;i<settings.length;i+=10){
      const batch=settings.slice(i,i+10);
      const docs=await Promise.all(batch.map(x=>db.collection("institutions").doc(String(x.institutionId||x.id)).get()));
      docs.forEach((doc,index)=>{
        if(!doc.exists)return;
        const data=doc.data()||{};
        if(String(data.status||"active")==="passive")return;
        chunks.push({id:doc.id,...data,appointmentSetting:batch[index]});
      });
    }
    records=chunks.sort((a,b)=>Number(Boolean(b.vip))-Number(Boolean(a.vip))||String(a.name||"").localeCompare(String(b.name||""),"tr"));
    fillFilters();
    render();
  }catch(error){
    console.error(error);
    loading.innerHTML="<span>⚠️</span><strong>Randevu veren kurumlar yüklenemedi.</strong><p>Lütfen sayfayı yenileyin.</p>";
  }
}

function fillFilters(){
  const city=document.getElementById("rvCity"),cat=document.getElementById("rvCategory");
  [...new Set(records.map(x=>String(x.city||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr")).forEach(v=>{
    const o=document.createElement("option");o.value=v;o.textContent=v;city.appendChild(o);
  });
  const cats=[...new Set(records.map(categoryKey))].sort((a,b)=>String(CATEGORY_LABELS[a]||a).localeCompare(String(CATEGORY_LABELS[b]||b),"tr"));
  cats.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=CATEGORY_LABELS[v]||v;cat.appendChild(o)});
}

function filtered(){
  const q=norm(document.getElementById("rvSearch").value);
  const city=document.getElementById("rvCity").value;
  const cat=document.getElementById("rvCategory").value;
  return records.filter(x=>{
    if(city&&x.city!==city)return false;
    if(cat&&categoryKey(x)!==cat)return false;
    if(!q)return true;
    const services=servicesFor(x.appointmentSetting).join(" ");
    return norm([x.name,categoryLabel(x),x.city,x.district,services].join(" ")).includes(q);
  });
}

function render(){
  document.getElementById("rvLoading").classList.add("hidden");
  const rows=filtered(),grid=document.getElementById("rvGrid"),empty=document.getElementById("rvEmpty");
  document.getElementById("rvResultCount").textContent=rows.length+" kurum";
  if(!rows.length){grid.innerHTML="";empty.classList.remove("hidden");return}
  empty.classList.add("hidden");
  grid.innerHTML=rows.map(x=>{
    const cover=String(x.coverUrl||"").trim(),logo=String(x.logoUrl||"").trim(),services=servicesFor(x.appointmentSetting);
    return `
      <article class="rv-card">
        <div class="rv-card-cover">
          ${cover?'<img src="'+esc(cover)+'" alt="'+esc(x.name||"Kurum")+'">':esc(x.emoji||"📅")}
          <div class="rv-card-logo">${logo?'<img src="'+esc(logo)+'" alt="">':esc(x.emoji||"🏢")}</div>
        </div>
        <div class="rv-card-body">
          <div class="rv-card-top"><h3>${esc(x.name||"Kurum")}</h3><span class="rv-badge">Randevu Açık</span></div>
          <div class="rv-meta"><span>📍 ${esc(locationLabel(x))}</span><span>🏷 ${esc(categoryLabel(x))}</span>${x.rating?'<span>★ '+esc(Number(x.rating).toFixed(1))+'</span>':""}</div>
          ${services.length?'<div class="rv-service-list">'+services.map(s=>'<span>'+esc(s)+'</span>').join("")+'</div>':""}
          <div class="rv-card-actions">
            <a class="rv-book" href="kurum.html?id=${encodeURIComponent(x.id)}&randevu=1">📅 Randevu Al</a>
            <a class="rv-profile" href="kurum.html?id=${encodeURIComponent(x.id)}">Profili Gör</a>
          </div>
        </div>
      </article>`;
  }).join("");
}

["rvSearch","rvCity","rvCategory"].forEach(id=>document.getElementById(id).addEventListener(id==="rvSearch"?"input":"change",render));
document.getElementById("rvClear").addEventListener("click",()=>{
  document.getElementById("rvSearch").value="";
  document.getElementById("rvCity").value="";
  document.getElementById("rvCategory").value="";
  render();
});
load();
