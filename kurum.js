const firebaseConfig={apiKey:"AIzaSyD4SHYRiuSuHB-wSl8oWUFMCsfVu6j164E",authDomain:"dijiyer.firebaseapp.com",projectId:"dijiyer",storageBucket:"dijiyer.firebasestorage.app",messagingSenderId:"847787778815",appId:"1:847787778815:web:57058aa8dcc4143ec5a2ca"};
const publicApp=firebase.apps.find(a=>a.name==="publicInstitution")||firebase.initializeApp(firebaseConfig,"publicInstitution");
const db=publicApp.firestore();
const params=new URLSearchParams(location.search);
const institutionId=String(params.get("id")||params.get("kurum")||"").trim();
const preview=params.get("onizleme")==="1";
let institution=null,reviews=[],publicMap=null,currentRating=0,currentRecommendation=null;

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
function directWhatsappTarget(value){
  const digits=String(value||"").replace(/\D/g,"");
  if(!digits)return "";
  if(digits.startsWith("90")&&digits.length>=12)return digits;
  if(digits.startsWith("0")&&digits.length===11)return "90"+digits.slice(1);
  if(digits.length===10)return "90"+digits;
  return digits;
}
function directWhatsappMessage(tracking,request,quoteId){
  const shortId=quoteId?"DJY-"+String(quoteId).slice(-8).toUpperCase():tracking?.trackingCode||"";
  const panelUrl=new URL("institution.html?tab=quotes",location.href).toString();
  return [
    "Merhaba, Dijiyer üzerinden sizden fiyat teklifi istedim.",
    "",
    "Hizmet: "+String(request.service||"Teklif Talebi"),
    "Bölge: "+[request.district,request.city].filter(Boolean).join(" / "),
    "Talep No: "+shortId,
    "Takip Kodu: "+String(tracking?.trackingCode||""),
    "",
    "Kurum panelinden teklif verebilirsiniz:",
    panelUrl,
    "",
    "Teklifi Dijiyer üzerinden gönderdiğinizde fiyat ve şartları karşılaştırıp kabul edebilirim."
  ].join("\n");
}
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
    targetInstitutionName:String(request.targetInstitutionName||institution?.name||"Kurum"),
    requestType:"direct",
    email:String(request.email||""),
    responseWaitMinutes:Number(request.responseWaitMinutes||30),
    responseDeadlineAt:String(request.responseDeadlineAt||""),
    allowAlternativeInstitutions:Boolean(request.allowAlternativeInstitutions)
  });
  return {trackingCode,trackingUrl:url,normalizedPhone};
}
function directQuoteServiceOptions(x){
  const key=String(x?.subCategory||x?.category||"").trim();

  const presets={
    // Eğitim
    kres:["Kayıt / Eğitim Ücreti","Yaz Okulu","Servis","Yemek","Erken Kayıt / İndirim","Diğer / Özel Talep"],
    dershane:["Kayıt / Eğitim Ücreti","LGS Programı","YKS / TYT-AYT Programı","Deneme Kulübü","Etüt / Özel Ders","Diğer / Özel Talep"],
    surucu:["B Sınıfı Ehliyet","A / A1 / A2 Motosiklet Ehliyeti","C / CE / D Ağır Vasıta","Direksiyon Eğitimi","Kurs Ücreti","Diğer / Özel Talep"],
    ozel_ders:["Özel Ders Ücreti","Ders / Branş Bilgisi","Paket Ders","Online Ders","Program / Uygunluk","Diğer / Özel Talep"],
    dil_kursu:["Kurs Ücreti","İngilizce","Almanca","Diğer Dil Programı","Seviye / Program Bilgisi","Diğer / Özel Talep"],
    etut:["Kayıt / Aylık Ücret","Etüt Programı","Ödev Takibi","Sınav Hazırlık","Birebir Ders","Diğer / Özel Talep"],
    ozel_okul:["Kayıt / Eğitim Ücreti","Bursluluk / İndirim","Servis","Yemek","Erken Kayıt","Diğer / Özel Talep"],
    yurt:["Aylık / Yıllık Ücret","Oda Seçenekleri","Yemek / Servis","Kayıt Şartları","Depozito / Ek Hizmetler","Diğer / Özel Talep"],

    // Otomotiv
    oto_servis:["Bakım / Periyodik Servis","Arıza / Tamir","Parça + İşçilik","Yağ / Filtre Değişimi","Kontrol / Fiyat Bilgisi","Diğer / Özel Talep"],
    kaporta_boya:["Kaporta Onarımı","Boya","Göçük Düzeltme","Hasar Tespiti","Parça + İşçilik","Diğer / Özel Talep"],
    oto_elektrik:["Elektrik Arızası","Akü / Şarj Sistemi","Aydınlatma","Elektronik Arıza","Kontrol / Fiyat Bilgisi","Diğer / Özel Talep"],
    lastik_jant:["Lastik Fiyatı","Jant Fiyatı","Değişim / Montaj","Balans / Rotasyon","Mevsimlik Lastik","Diğer / Özel Talep"],
    oto_yikama:["İç-Dış Yıkama","Detaylı Temizlik","Pasta / Cila","Seramik Kaplama","Koltuk Temizliği","Diğer / Özel Talep"],
    ekspertiz:["Standart Ekspertiz","Detaylı Ekspertiz","Motor / Mekanik Kontrol","Kaporta / Boya Kontrolü","Paket Fiyatı","Diğer / Özel Talep"],
    galeri:["Araç Fiyatı","Araç Takas","Araç Uygunluğu","Finansman Bilgisi","Belirli Model Talebi","Diğer / Özel Talep"],
    rentacar:["Günlük Kiralama","Haftalık Kiralama","Aylık Kiralama","Araç Uygunluğu","Uzun Dönem Kiralama","Diğer / Özel Talep"],
    yedek_parca:["Parça Fiyatı","Orijinal Parça","Muadil Parça","Parça Uygunluğu","Toplu Parça Talebi","Diğer / Özel Talep"],
    motosiklet:["Bakım / Servis","Arıza / Tamir","Lastik","Yedek Parça","Kontrol / Fiyat Bilgisi","Diğer / Özel Talep"],

    // Yeme - İçme
    restoran:["Menü / Fiyat Bilgisi","Toplu Yemek","Rezervasyon","Organizasyon / Grup","Paket Servis","Diğer / Özel Talep"],
    kafe:["Menü / Fiyat Bilgisi","Rezervasyon","Toplu Organizasyon","Doğum Günü / Etkinlik","Paket Sipariş","Diğer / Özel Talep"],
    fastfood:["Menü / Fiyat Bilgisi","Toplu Sipariş","Öğrenci / Grup Menüsü","Paket Servis","Organizasyon","Diğer / Özel Talep"],
    pastane:["Pasta Siparişi","Özel Tasarım Pasta","Toplu Sipariş","Nişan / Düğün Ürünleri","Fiyat Bilgisi","Diğer / Özel Talep"],
    pizza:["Menü / Fiyat Bilgisi","Toplu Sipariş","Paket Servis","Grup Menüsü","Kampanya","Diğer / Özel Talep"],
    doner:["Menü / Fiyat Bilgisi","Toplu Sipariş","Paket Servis","Catering / Organizasyon","Kampanya","Diğer / Özel Talep"],
    pide_lahmacun:["Menü / Fiyat Bilgisi","Toplu Sipariş","Paket Servis","Organizasyon","Kampanya","Diğer / Özel Talep"],
    catering:["Kişi Başı Menü","Toplu Yemek","Düğün / Organizasyon","Kurumsal Yemek","Taşımalı Yemek","Diğer / Özel Talep"],
    ev_yemekleri:["Günlük Menü","Toplu Yemek","Paket Servis","Kurumsal Yemek","Özel Gün Siparişi","Diğer / Özel Talep"],

    // Sağlık - Güzellik - Spor
    dis_klinigi:["Muayene / Kontrol","Dolgu / Kanal Tedavisi","İmplant","Ortodonti","Diş Temizliği","Diğer / Özel Talep"],
    klinik:["Muayene / Randevu","Tedavi Bilgisi","Kontrol","Paket / Uygulama Bilgisi","Fiyat Bilgisi","Diğer / Özel Talep"],
    psikolog:["Seans Ücreti","Bireysel Görüşme","Çift / Aile Görüşmesi","Çocuk / Ergen","Online Görüşme","Diğer / Özel Talep"],
    diyetisyen:["İlk Görüşme","Aylık Takip","Online Danışmanlık","Beslenme Programı","Paket Ücreti","Diğer / Özel Talep"],
    fizyoterapi:["Değerlendirme","Seans Ücreti","Rehabilitasyon","Manuel Terapi","Paket Seans","Diğer / Özel Talep"],
    guzellik:["Cilt Bakımı","Lazer Epilasyon","Bölgesel İncelme","Kalıcı Makyaj","Paket / Kampanya","Diğer / Özel Talep"],
    kuafor:["Saç Kesimi","Boya / Röfle","Bakım","Gelin Saçı","Paket / Fiyat Bilgisi","Diğer / Özel Talep"],
    berber:["Saç Kesimi","Sakal","Bakım","Damat Paketi","Fiyat Bilgisi","Diğer / Özel Talep"],
    spor:["Aylık Üyelik","Pilates","Fitness","Personal Training","Grup Dersi","Diğer / Özel Talep"],

    // Ev - Yapı - Teknik
    mobilya:["Mutfak Dolabı","Gardırop","Özel Ölçü Mobilya","Salon / Yatak Odası","Montaj","Diğer / Özel Talep"],
    dekorasyon:["İç Mekan Dekorasyon","Tasarım / Projelendirme","Uygulama","Tadilat","Keşif / Fiyat Teklifi","Diğer / Özel Talep"],
    insaat:["Tadilat","Anahtar Teslim","Boya / Alçı","Banyo / Mutfak Yenileme","Keşif / Fiyat Teklifi","Diğer / Özel Talep"],
    elektrikci:["Elektrik Arızası","Tesisat Yenileme","Priz / Aydınlatma","Pano / Sigorta","Keşif / Fiyat","Diğer / Özel Talep"],
    tesisatci:["Su Tesisatı","Tıkanıklık Açma","Kaçak Tespiti","Kombi / Petek Tesisatı","Keşif / Fiyat","Diğer / Özel Talep"],
    teknik_servis:["Arıza / Tamir","Bakım","Montaj","Yedek Parça","Servis Ücreti","Diğer / Özel Talep"],
    klima:["Klima Bakımı","Klima Tamiri","Montaj","Gaz Dolumu","Yeni Klima / Fiyat","Diğer / Özel Talep"],
    cam_balkon:["Cam Balkon","PVC Doğrama","Sineklik","Balkon Kapatma","Keşif / Fiyat Teklifi","Diğer / Özel Talep"],
    temizlik:["Ev Temizliği","Ofis Temizliği","İnşaat Sonrası Temizlik","Koltuk / Halı Temizliği","Düzenli Temizlik","Diğer / Özel Talep"],

    // Emlak - Konaklama - Seyahat
    emlak_ofisi:["Kiralık Konut","Satılık Konut","Arsa / Tarla","Ticari Gayrimenkul","Değerleme / Danışmanlık","Diğer / Özel Talep"],
    konut:["Satılık Konut","Kiralık Konut","Belirli Bölge / Özellik","Fiyat Bilgisi","Randevu / Görüşme","Diğer / Özel Talep"],
    arsa:["Satılık Arsa / Tarla","Bölge / Metrekare","İmar Bilgisi","Fiyat Bilgisi","Randevu / Görüşme","Diğer / Özel Talep"],
    ticari:["Satılık İş Yeri","Kiralık İş Yeri","Depo / Dükkan","Fiyat Bilgisi","Randevu / Görüşme","Diğer / Özel Talep"],
    gunluk_kiralik:["Gecelik Fiyat","Tarih Uygunluğu","Kişi Sayısı","Uzun Konaklama","Konum / Özellikler","Diğer / Özel Talep"],
    otel:["Konaklama Fiyatı","Oda Uygunluğu","Grup Rezervasyonu","Paket / Kampanya","Etkinlik / Toplantı","Diğer / Özel Talep"],
    pansiyon:["Konaklama Fiyatı","Oda Uygunluğu","Uzun Konaklama","Grup Rezervasyonu","Kahvaltı / Ek Hizmet","Diğer / Özel Talep"],
    apart:["Konaklama Fiyatı","Daire Uygunluğu","Aylık Konaklama","Kişi Sayısı","Ek Hizmetler","Diğer / Özel Talep"],
    bungalov:["Gecelik Fiyat","Tarih Uygunluğu","Kişi Sayısı","Paket / Kampanya","Özel Gün","Diğer / Özel Talep"],
    seyahat:["Tur Paketi","Otobüs / Ulaşım","Konaklamalı Tur","Günübirlik Tur","Grup Organizasyonu","Diğer / Özel Talep"],
    kamp:["Konaklama / Kamp Alanı","Karavan Alanı","Tarih Uygunluğu","Kişi Sayısı","Paket / Aktivite","Diğer / Özel Talep"],

    // Organizasyon - Medya
    dugun_salonu:["Salon Fiyatı","Paket İçeriği","Tarih Uygunluğu","Yemekli Organizasyon","Kişi Sayısı","Diğer / Özel Talep"],
    organizasyon:["Organizasyon Paketi","Tarih Uygunluğu","Süsleme / Konsept","Ses / Işık","Fiyat Bilgisi","Diğer / Özel Talep"],
    fotograf:["Fotoğraf Çekimi","Video Çekimi","Düğün / Organizasyon","Dış Çekim","Paket Fiyatı","Diğer / Özel Talep"],
    video:["Tanıtım Videosu","Reels / Sosyal Medya","Etkinlik Çekimi","Kurumsal Video","Paket Fiyatı","Diğer / Özel Talep"],
    drone:["Drone Çekimi","Mekan / Konum Çekimi","Etkinlik Çekimi","Kurumsal Çekim","Paket Fiyatı","Diğer / Özel Talep"],
    gelinlik:["Gelinlik Fiyatı","Kiralama","Dikim / Özel Tasarım","Prova / Randevu","Aksesuar","Diğer / Özel Talep"],
    cicekci:["Gelin Buketi","Düğün / Nişan Çiçeği","Aranjman","Toplu Sipariş","Özel Gün","Diğer / Özel Talep"],
    reklam:["Sosyal Medya Tasarımı","Video / Reels","Matbaa / Baskı","Tabela / Dijital Baskı","Reklam Paketi","Diğer / Özel Talep"],

    // Taşıma - Profesyonel Hizmetler
    nakliyat:["Evden Eve Nakliyat","Şehirler Arası Nakliyat","Parça Eşya Taşıma","Depolama","Paketleme","Diğer / Özel Talep"],
    kurye:["Kurye Teslimatı","Aynı Gün Teslimat","Düzenli Kurye","Toplu Gönderi","Fiyat Bilgisi","Diğer / Özel Talep"],
    sehirici:["Şehir İçi Taşıma","Personel / Servis","Yük Taşıma","Düzenli Taşıma","Fiyat Bilgisi","Diğer / Özel Talep"],
    depolama:["Aylık Depolama","Eşya Depolama","Ticari Depolama","Nakliye + Depolama","Alan / Fiyat Bilgisi","Diğer / Özel Talep"],
    hukuk:["Hukuki Danışmanlık","Dava / Dosya Görüşmesi","Sözleşme","İcra / Alacak","Randevu","Diğer / Özel Talep"],
    muhasebe:["Aylık Muhasebe","Şirket Kuruluşu","Vergi Danışmanlığı","Beyanname / Defter","Fiyat Bilgisi","Diğer / Özel Talep"],
    web:["Kurumsal Web Sitesi","E-Ticaret Sitesi","Site Yenileme","Bakım / Destek","Fiyat Teklifi","Diğer / Özel Talep"],
    sosyal_medya:["Sosyal Medya Yönetimi","Reels / Video","Görsel Tasarım","Reklam Yönetimi","Aylık Paket","Diğer / Özel Talep"],
    bilgisayar:["Bilgisayar Tamiri","Format / Yazılım","Donanım Yükseltme","Veri / Yedekleme","Teknik Destek","Diğer / Özel Talep"],
    danismanlik:["Danışmanlık Görüşmesi","Proje Danışmanlığı","Kurumsal Danışmanlık","Online Görüşme","Fiyat / Paket","Diğer / Özel Talep"],

    // Pet - Tarım - Perakende
    veteriner:["Muayene","Aşı","Tedavi","Pet Bakım","Acil / Randevu","Diğer / Özel Talep"],
    tarim:["Ürün / Ekipman Fiyatı","Tohum / Gübre","Hayvancılık","Tarım Danışmanlığı","Toplu Alım","Diğer / Özel Talep"],
    giyim:["Ürün Fiyatı","Beden / Stok","Toplu Alım","Özel Sipariş","Kampanya","Diğer / Özel Talep"],
    ayakkabi:["Ürün Fiyatı","Numara / Stok","Toplu Alım","Özel Sipariş","Kampanya","Diğer / Özel Talep"],
    market:["Ürün Fiyatı","Toplu Alışveriş","Sipariş / Teslimat","Stok Bilgisi","Kampanya","Diğer / Özel Talep"],
    elektronik:["Ürün Fiyatı","Stok / Model","Telefon / Aksesuar","Teknik Servis","Toplu Alım","Diğer / Özel Talep"],
    kirtasiye:["Ürün Fiyatı","Okul / Ofis Listesi","Toplu Sipariş","Baskı / Fotokopi","Teslimat","Diğer / Özel Talep"],
    petshop:["Mama / Ürün Fiyatı","Stok / Marka","Toplu Alım","Pet Aksesuarı","Teslimat","Diğer / Özel Talep"],
    zuccaciye:["Ürün Fiyatı","Çeyiz Paketi","Toplu Alım","Stok Bilgisi","Kampanya","Diğer / Özel Talep"],
    esnaf:["Fiyat Bilgisi","Hizmet / Ürün Detayı","Randevu / Uygunluk","Toplu Talep","Kampanya / İndirim","Diğer / Özel Talep"]
  };

  const fallback=[
    categoryLabel(x)+" için fiyat bilgisi",
    "Hizmet / paket detayları",
    "Randevu / uygunluk",
    "Kampanya / indirim",
    "Diğer / Özel Talep"
  ];
  return presets[key]||fallback;
}
function fillDirectQuoteServiceOptions(x){
  const select=document.getElementById("directQuoteService");
  if(!select)return;
  select.innerHTML='<option value="">Talep konusu seçin</option>'+
    directQuoteServiceOptions(x)
      .map(item=>'<option value="'+escapeHtml(item)+'">'+escapeHtml(item)+'</option>')
      .join("");
  select.value="";
}
function openDirectQuote(){
  if(!institution||institution.isDemo){showToast("Demo kurum için doğrudan teklif gönderilemez.");return}
  if(institution.offer===false){showToast("Bu kurum şu anda teklif kabul etmiyor.");return}
  document.getElementById("directQuoteFormView").classList.remove("hidden");
  document.getElementById("directQuoteSuccess").classList.add("hidden");
  document.getElementById("directQuoteMessage").textContent="";
  document.getElementById("directQuoteInstitutionName").textContent=institution.name||"Kurum";
  document.getElementById("directQuoteInstitutionLocation").textContent=locationLabel(institution);

  const icon=document.getElementById("directQuoteInstitutionIcon");
  const logo=safeUrl(institution.logoUrl);
  if(icon){
    icon.innerHTML=logo
      ? '<img src="'+escapeHtml(logo)+'" alt="">'
      : escapeHtml(institution.emoji||"🏢");
  }

  fillDirectQuoteServiceOptions(institution);

  const email=document.getElementById("directQuoteEmail");
  if(email&&!email.value){
    email.value=localStorage.getItem("dijiyerCustomerEmail")||"";
  }

  document.getElementById("directQuoteModal").classList.remove("hidden");
}
function closeDirectQuote(){
  document.getElementById("directQuoteModal").classList.add("hidden");
  if(params.get("teklif")==="1"){
    params.delete("teklif");
    const cleanUrl=new URL(location.href);
    cleanUrl.searchParams.delete("teklif");
    history.replaceState(null,"",cleanUrl.toString());
  }
}
function routeUrl(x){if(Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)))return"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(x.lat+","+x.lng);return"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([x.address,x.district,x.city].filter(Boolean).join(", "))}
function services(x){const rows=[categoryLabel(x)];String(x.classes||"").split(/[,;\n]/).map(s=>s.trim()).filter(s=>s&&s.toLocaleLowerCase("tr-TR")!=="bilgi eklenecek").forEach(s=>rows.push(s));String(x.services||"").split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).forEach(s=>rows.push(s));return[...new Set(rows)].slice(0,12)}
function showToast(text){const e=document.getElementById("toast");e.textContent=text;e.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.classList.remove("show"),2000)}


function ensureSeoMeta(selector,attribute,value){
  let el=document.head.querySelector(selector);
  if(!el){
    el=document.createElement("meta");
    const [attrName,attrValue]=attribute;
    el.setAttribute(attrName,attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content",String(value||""));
  return el;
}
function setInstitutionRobots(value){
  let el=document.head.querySelector('meta[name="robots"]');
  if(!el){
    el=document.createElement("meta");
    el.setAttribute("name","robots");
    document.head.appendChild(el);
  }
  el.setAttribute("content",value);
}
function institutionCanonicalUrl(x){
  const u=new URL("kurum.html",window.location.href);
  u.search="";
  u.searchParams.set("id",String(x.id||institutionId||""));
  return u.href;
}
function applyInstitutionSeo(x){
  if(!x)return;
  const name=String(x.name||"Kurum").trim();
  const category=categoryLabel(x);
  const place=[x.district,x.city].filter(Boolean).join(", ");
  const title=[name,category,place].filter(Boolean).join(" | ")+" | Dijiyer";
  const fallback=[name,place?place+" bölgesinde":"",category].filter(Boolean).join(" · ");
  const description=String(x.description||fallback+" hizmet bilgileri, iletişim, konum ve teklif seçenekleri Dijiyer'de.").trim().slice(0,160);
  const canonical=institutionCanonicalUrl(x);
  const image=safeUrl(x.coverUrl||x.logoUrl||"");

  document.title=title;
  ensureSeoMeta('meta[name="description"]',["name","description"],description);
  ensureSeoMeta('meta[property="og:title"]',["property","og:title"],title);
  ensureSeoMeta('meta[property="og:description"]',["property","og:description"],description);
  ensureSeoMeta('meta[property="og:type"]',["property","og:type"],"website");
  ensureSeoMeta('meta[property="og:url"]',["property","og:url"],canonical);
  ensureSeoMeta('meta[property="og:site_name"]',["property","og:site_name"],"Dijiyer");
  ensureSeoMeta('meta[name="twitter:title"]',["name","twitter:title"],title);
  ensureSeoMeta('meta[name="twitter:description"]',["name","twitter:description"],description);
  ensureSeoMeta('meta[name="twitter:card"]',["name","twitter:card"],image?"summary_large_image":"summary");
  if(image){
    ensureSeoMeta('meta[property="og:image"]',["property","og:image"],image);
    ensureSeoMeta('meta[name="twitter:image"]',["name","twitter:image"],image);
  }

  const canonicalEl=document.getElementById("seoCanonical")||document.head.querySelector('link[rel="canonical"]');
  if(canonicalEl)canonicalEl.setAttribute("href",canonical);

  if(preview)setInstitutionRobots("noindex,nofollow,noarchive");
  else setInstitutionRobots("index,follow,max-image-preview:large");

  const schema={
    "@context":"https://schema.org",
    "@type":"LocalBusiness",
    "@id":canonical+"#business",
    "name":name,
    "url":canonical,
    "description":description,
    "category":category,
    "address":{
      "@type":"PostalAddress",
      "streetAddress":String(x.address||""),
      "addressLocality":String(x.district||""),
      "addressRegion":String(x.city||""),
      "addressCountry":"TR"
    }
  };
  const phone=String(x.phone||"").trim();
  if(phone)schema.telephone=phone;
  if(image)schema.image=image;
  const lat=Number(x.lat),lng=Number(x.lng);
  if(Number.isFinite(lat)&&Number.isFinite(lng))schema.geo={"@type":"GeoCoordinates","latitude":lat,"longitude":lng};
  const rating=Number(x.rating||0),count=Number(x.reviewCount||0);
  if(rating>0&&count>0)schema.aggregateRating={"@type":"AggregateRating","ratingValue":rating,"reviewCount":count};
  const sameAs=[safeUrl(x.website),instagramUrl(x.instagram)].filter(Boolean);
  if(sameAs.length)schema.sameAs=sameAs;

  const ld=document.getElementById("institutionStructuredData");
  if(ld)ld.textContent=JSON.stringify(schema);
}

function renderProfile(){
  const x=institution,logo=safeUrl(x.logoUrl),cover=safeUrl(x.coverUrl),video=safeUrl(x.videoUrl||x.profileVideoUrl||x.locationVideoUrl),gallery=(Array.isArray(x.galleryUrls)?x.galleryUrls:[]).map(safeUrl).filter(Boolean).slice(0,9),phone=String(x.phone||"").trim(),whatsapp=whatsappNumber(x.whatsapp||phone),website=safeUrl(x.website),instagram=instagramUrl(x.instagram),tour=safeUrl(x.virtualTourUrl||x.tour360Url||x.tourUrl),serviceRows=services(x);
  applyInstitutionSeo(x);
  const root=document.getElementById("institutionProfile");
  root.innerHTML=`
    <section class="kp-hero">
      <div class="kp-cover">
        ${video?`<video controls playsinline preload="metadata" ${cover?'poster="'+escapeHtml(cover)+'"':""}><source src="${escapeHtml(video)}"></video>`:cover?`<img src="${escapeHtml(cover)}" alt="${escapeHtml(x.name)} kapak">`:`<div class="kp-cover-empty">${escapeHtml(x.emoji||"🏢")}</div>`}
      </div>
      <div class="kp-identity">
        <div class="kp-logo">${logo?'<img src="'+escapeHtml(logo)+'" alt="'+escapeHtml(x.name)+' logosu">':escapeHtml(x.emoji||"🏢")}</div>
        <div class="kp-title">
          <h1>${escapeHtml(x.name||"Kurum")}</h1>
          <div class="kp-status-badges">
            <span class="kp-status-badge verified">✓ Onaylı Kurum</span>
            ${x.offer!==false?'<span class="kp-status-badge offer">₺ Teklif Veriyor</span>':""}
            ${x.video||video?'<span class="kp-status-badge video">▶ Videolu Kurum</span>':""}
            ${x.vip?'<span class="kp-status-badge vip">★ Öne Çıkan</span>':""}
          </div>
          <div class="kp-meta"><span>🏷️ ${escapeHtml(categoryLabel(x))}</span><span>📍 ${escapeHtml(locationLabel(x))}</span><span class="rating"><b>★</b> ${ratingText(x.rating)} ${Number(x.reviewCount||0)?"("+Number(x.reviewCount||0)+" değerlendirme)":""}</span></div>
        </div>
        <div class="kp-actions">${x.offer!==false?'<button type="button" class="kp-btn primary" data-direct-quote>📄 Bu Kurumdan Teklif Al</button>':""}${whatsapp?'<button id="kpWhatsapp" class="kp-btn wa">💬 WhatsApp</button>':""}${phone?'<a class="kp-btn call" href="tel:'+escapeHtml(phone.replace(/[^+\d]/g,""))+'">☎ Ara</a>':""}<a id="kpRouteTop" class="kp-btn" href="${escapeHtml(routeUrl(x))}" target="_blank" rel="noopener">🧭 Yol Tarifi</a></div>
      </div>
    </section>

    <div class="kp-grid kp-profile-layout">
      <div class="kp-main">

        <section class="kp-card kp-profile-summary-card">
          <div class="kp-summary-top">
            <div>
              <span class="eyebrow">KURUM PROFİLİ</span>
              <h2>${escapeHtml(x.name||"Kurum")}</h2>
              <p>${escapeHtml(locationLabel(x))}</p>
            </div>
            <span class="kp-summary-rating">★ ${ratingText(x.rating)}</span>
          </div>

          <p class="kp-about">${escapeHtml(x.description||"Kurum henüz detaylı açıklama eklemedi.")}</p>

          <div class="kp-summary-divider"></div>

          <div class="kp-head kp-compact-head">
            <div>
              <span class="eyebrow">HİZMETLER</span>
              <h2>Sunulan Hizmetler</h2>
            </div>
          </div>

          <div class="kp-services kp-services-clean">
            ${serviceRows.map(s=>'<span class="kp-service">✓ '+escapeHtml(s)+'</span>').join("")}
          </div>
        </section>

        <section class="kp-card kp-works-card">
          <div class="kp-head">
            <div>
              <span class="eyebrow">PORTFÖY</span>
              <h2>Yapılan İşler</h2>
              <p>Kurumun çalışmalarından örnekler.</p>
            </div>
          </div>
          <div class="kp-media kp-works-grid">
            ${gallery.length?gallery.map((u,i)=>'<div class="kp-photo kp-work-item"><img src="'+escapeHtml(u)+'" alt="Yapılan iş '+(i+1)+'"></div>').join(""):'<div class="kp-empty">Kurum henüz yapılan iş görseli eklemedi.</div>'}
          </div>
          ${tour?'<div class="kp-special"><a href="'+escapeHtml(tour)+'" target="_blank" rel="noopener">◉ 360° Sanal Turu Aç</a></div>':""}
        </section>

        <section class="kp-card kp-reviews-card">
          <div class="kp-head">
            <div>
              <span class="eyebrow">DEĞERLENDİRMELER</span>
              <h2>Müşteri Yorumları</h2>
            </div>
            <div class="kp-review-summary">
              <div class="kp-review-score">
                <strong id="reviewScore">${ratingText(x.rating)}</strong>
                <span id="reviewCount">${Number(x.reviewCount||0)} değerlendirme</span>
              </div>
              <div class="kp-recommend-score" id="recommendScoreBox">
                <strong id="recommendRate">-</strong>
                <span id="recommendCount">Tavsiye oyu yok</span>
              </div>
            </div>
          </div>

          <div id="reviewsList" class="kp-review-list">
            <div class="kp-empty">Yorumlar yükleniyor...</div>
          </div>

          <button id="reviewOpenBtn" class="kp-btn kp-review-action">★ Yorum Yap / Puan Ver</button>
        </section>

        ${!x.vip?'<section class="kp-card kp-similar-card-wrap"><div class="kp-head"><div><span class="eyebrow">BENZER KURUMLAR</span><h2>Yakındaki Benzer Kurumlar</h2></div></div><div id="similarList" class="kp-similar"><div class="kp-empty">Benzer kurumlar yükleniyor...</div></div></section>':""}
      </div>

      <aside class="kp-side">

        ${x.offer!==false?`<section class="kp-card kp-trust kp-trust-compact"><div class="kp-trust-title"><span>🛡️</span><div><h3>Dijiyer Güvencesi</h3><p>Teklif süreci kayıt altında.</p></div></div><div class="kp-trust-points"><span>✓ Fiyat ve süre görünür</span><span>✓ Seçilen fiyat kilitlenebilir</span><span>✓ Teklif koduyla doğrulama</span><span>✓ Destek kaydı oluşturulabilir</span></div><button type="button" class="kp-btn primary kp-full-btn" data-direct-quote>Bu Kurumdan Teklif Al</button></section>`:""}

        <section class="kp-card kp-contact-card">
          <div class="kp-head kp-compact-head">
            <div>
              <span class="eyebrow">İLETİŞİM</span>
              <h2>Kurum Bilgileri</h2>
            </div>
          </div>

          <div class="kp-info kp-info-clean">
            <div class="kp-info-row">
              <i class="kp-info-icon">📍</i>
              <div>
                <span>Adres</span>
                <strong>${escapeHtml(x.address||locationLabel(x))}</strong>
              </div>
            </div>

            ${phone?`<div class="kp-info-row"><i class="kp-info-icon">☎</i><div><span>Telefon</span><strong>${escapeHtml(phone)}</strong></div></div>`:""}
            ${website?`<div class="kp-info-row"><i class="kp-info-icon">🌐</i><div><span>Web Sitesi</span><strong><a href="${escapeHtml(website)}" target="_blank" rel="noopener">Siteyi Aç</a></strong></div></div>`:""}
            ${instagram?`<div class="kp-info-row"><i class="kp-info-icon">◎</i><div><span>Instagram</span><strong><a href="${escapeHtml(instagram)}" target="_blank" rel="noopener">Instagram\'a Git</a></strong></div></div>`:""}

            <div class="kp-info-row">
              <i class="kp-info-icon">🧭</i>
              <div>
                <span>Hizmet Bölgesi</span>
                <strong>${escapeHtml(x.serviceAreas||locationLabel(x))}</strong>
              </div>
            </div>
          </div>

          <div class="kp-side-divider"></div>

          <div class="kp-head kp-compact-head kp-hours-head">
            <div>
              <span class="eyebrow">ÇALIŞMA SAATLERİ</span>
              <h2>Ne zaman açık?</h2>
            </div>
          </div>

          <div class="kp-hours kp-hours-clean">
            <div class="kp-hour"><span>Hafta içi</span><b>${escapeHtml(x.weekdayHours||"Belirtilmedi")}</b></div>
            <div class="kp-hour"><span>Cumartesi</span><b>${escapeHtml(x.saturdayHours||"Belirtilmedi")}</b></div>
            <div class="kp-hour"><span>Pazar</span><b>${escapeHtml(x.sundayHours||"Belirtilmedi")}</b></div>
          </div>
        </section>

        <section class="kp-card kp-location-card">
          <div class="kp-head kp-compact-head">
            <div>
              <span class="eyebrow">KONUM</span>
              <h2>Haritada Gör</h2>
              <p>${escapeHtml(locationLabel(x))}</p>
            </div>
          </div>

          <div id="kpMap"></div>

          <div class="kp-map-actions kp-map-actions-clean">
            <a id="kpRoute" class="primary" href="${escapeHtml(routeUrl(x))}" target="_blank" rel="noopener">🧭 Yol Tarifi</a>
            <a href="index.html">Haritada Keşfet</a>
          </div>
        </section>
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
    const snap=await db.collection("institutionReviews")
      .where("institutionId","==",String(institution.id))
      .where("status","==","published")
      .get();
    reviews=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(r=>!r.status||r.status==="published").sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    if(reviews.length){
      const avg=reviews.reduce((sum,r)=>sum+Number(r.rating||0),0)/reviews.length;
      institution.rating=Number(avg.toFixed(1));
      institution.reviewCount=reviews.length;
    }else{
      institution.reviewCount=0;
    }

    const recommendationVotes=reviews.filter(r=>typeof r.recommend==="boolean");
    const recommendationYes=recommendationVotes.filter(r=>r.recommend===true).length;
    institution.recommendationYes=recommendationYes;
    institution.recommendationCount=recommendationVotes.length;
    institution.recommendationRate=recommendationVotes.length
      ? Math.round((recommendationYes/recommendationVotes.length)*100)
      : null;

    renderReviews();
  }catch(error){console.error(error);document.getElementById("reviewsList").innerHTML='<div class="kp-empty">Yorumlar yüklenemedi.</div>'}
}

function renderReviews(){
  const list=document.getElementById("reviewsList");
  if(!list||!institution)return;

  const score=document.getElementById("reviewScore");
  const count=document.getElementById("reviewCount");
  const recommendRate=document.getElementById("recommendRate");
  const recommendCount=document.getElementById("recommendCount");
  const recommendBox=document.getElementById("recommendScoreBox");

  if(score)score.textContent=ratingText(institution.rating);
  if(count)count.textContent=Number(institution.reviewCount||reviews.length||0)+" değerlendirme";

  const recommendationCount=Number(institution.recommendationCount||0);
  const recommendationYes=Number(institution.recommendationYes||0);
  const recommendationRate=Number(institution.recommendationRate);

  if(recommendRate){
    recommendRate.textContent=recommendationCount>0
      ? "👍 "+recommendationYes+" kişi"
      : "-";
  }
  if(recommendCount){
    recommendCount.textContent=recommendationCount>0 && Number.isFinite(recommendationRate)
      ? "%"+Math.round(recommendationRate)+" tavsiye · "+recommendationCount+" oy"
      : "Tavsiye oyu yok";
  }
  if(recommendBox){
    recommendBox.classList.toggle("has-data",recommendationCount>0);
  }

  list.innerHTML=reviews.length
    ? reviews.slice(0,8).map(r=>{
        const recommendation=typeof r.recommend==="boolean"
          ? '<span class="kp-review-recommend '+(r.recommend?'yes':'no')+'">'+(r.recommend?'👍 Tavsiye ediyor':'Tavsiye etmiyor')+'</span>'
          : '';
        return '<article class="kp-review">'+
          '<div class="kp-review-top"><strong>Dijiyer Kullanıcısı</strong><span>'+"★".repeat(Math.max(1,Math.min(5,Number(r.rating||0))))+'</span></div>'+
          (recommendation?'<div class="kp-review-recommend-row">'+recommendation+'</div>':'')+
          '<p>'+escapeHtml(r.text||"")+'</p>'+
        '</article>';
      }).join("")
    : '<div class="kp-empty">Henüz yorum yapılmamış. İlk değerlendirmeyi siz yapabilirsiniz.</div>';
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
    const rows=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(x=>String(x.status||"active")!=="passive"&&String(x.id)!==String(institution.id)&&String(x.subCategory||x.category||"")===String(institution.subCategory||institution.category||"")&&(!institution.city||String(x.city||"")===String(institution.city))).slice(0,3);
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
  const email=String(document.getElementById("directQuoteEmail")?.value||"").trim().toLowerCase();
  const normalizedPhone=normalizeTrackingPhone(phone);
  const responseWaitMinutes=Number(
    document.getElementById("directQuoteResponseWait")?.value || 30
  );
  const allowedResponseWaitMinutes=[15,30,45,60,1440];
  const safeResponseWaitMinutes=allowedResponseWaitMinutes.includes(responseWaitMinutes)
    ? responseWaitMinutes
    : 30;
  const allowAlternativeInstitutions=Boolean(
    document.getElementById("directQuoteAlternativeConsent")?.checked
  );

  if(!name||!service){message.textContent="Adınızı ve talep konusunu seçin.";return}
  if(normalizedPhone.length<10){message.textContent="Geçerli bir telefon numarası yazın.";return}
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    message.textContent="E-posta adresini kontrol edin.";
    document.getElementById("directQuoteEmail")?.focus();
    return;
  }

  if(email)localStorage.setItem("dijiyerCustomerEmail",email);

  const mainCategory=String(institution.mainCategory||"diger");
  const subCategory=String(institution.subCategory||institution.category||"diger");
  const institutionCategory=String(institution.category||institution.subCategory||"diger");
  const requestDate=new Date();
  const requestDateIso=requestDate.toISOString();
  const responseDeadlineAt=new Date(
    requestDate.getTime() + safeResponseWaitMinutes*60000
  ).toISOString();

  const request={
    mainCategory,
    subCategory,
    category:institutionCategory,
    service,
    city:String(institution.city||""),
    district:String(institution.district||""),
    name,
    phone,
    email,
    note,
    status:"new",
    requestType:"direct",
    responseWaitMinutes:safeResponseWaitMinutes,
    responseDeadlineAt,
    allowAlternativeInstitutions,
    date:requestDateIso,
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
    const waitLabel=safeResponseWaitMinutes===1440
      ? "1 gün"
      : safeResponseWaitMinutes===60
        ? "1 saat"
        : safeResponseWaitMinutes+" dakika";
    document.getElementById("directQuoteSuccessText").textContent=
      "Talebiniz "+(institution.name||"bu kuruma")+" gönderildi. Yanıt süresi: "+waitLabel+"."+
      (allowAlternativeInstitutions
        ? " Bu sürede teklif gelmezse talebiniz uygun diğer kurumlara yönlendirmeye hazır olacak."
        : " Süre dolsa bile izniniz olmadan başka kuruma iletilmez.");

    const codeEl=document.getElementById("directTrackingCode");
    const linkEl=document.getElementById("directTrackingLink");

    if(tracking){
      codeEl.textContent=tracking.trackingCode;
      linkEl.href=tracking.trackingUrl;
      linkEl.classList.remove("hidden");
      sessionStorage.setItem("dijiyerTrackingCode",tracking.trackingCode);
      sessionStorage.setItem("dijiyerTrackingPhone",tracking.normalizedPhone);
      localStorage.setItem("dijiyerLastTrackingCode",tracking.trackingCode);
      try{
        const phoneMap=JSON.parse(localStorage.getItem("dijiyerTrackingPhoneByCode")||"{}");
        phoneMap[tracking.trackingCode]=tracking.normalizedPhone;
        localStorage.setItem("dijiyerTrackingPhoneByCode",JSON.stringify(phoneMap));
      }catch(_){}
    }else{
      codeEl.textContent="Talep kaydedildi";
      linkEl.classList.add("hidden");
    }

    const whatsappBtn=document.getElementById("directQuoteWhatsappBtn");
    const whatsappNote=document.getElementById("directQuoteWhatsappNote");
    const institutionWhatsapp=directWhatsappTarget(institution.whatsapp||institution.phone||"");

    if(whatsappBtn){
      whatsappBtn.classList.remove("hidden");
      if(whatsappNote)whatsappNote.classList.remove("hidden");

      if(institutionWhatsapp && tracking){
        whatsappBtn.disabled=false;
        whatsappBtn.textContent="WhatsApp'tan Kuruma Haber Ver";
        if(whatsappNote)whatsappNote.textContent="Talep Dijiyer'de kayıtlı kalır; WhatsApp yalnızca kuruma bildirim gönderir.";
        whatsappBtn.onclick=()=>{
          const message=encodeURIComponent(directWhatsappMessage(tracking,request,quoteRef.id));
          window.open("https://wa.me/"+institutionWhatsapp+"?text="+message,"_blank","noopener");
        };
      }else if(!institutionWhatsapp){
        whatsappBtn.disabled=true;
        whatsappBtn.textContent="WhatsApp numarası kayıtlı değil";
        if(whatsappNote)whatsappNote.textContent="Bu kurumun telefon/WhatsApp numarası kurum kaydına eklenince burada WhatsApp bildirimi açılacak.";
        whatsappBtn.onclick=null;
      }else{
        whatsappBtn.disabled=true;
        whatsappBtn.textContent="WhatsApp bildirimi hazırlanamadı";
        if(whatsappNote)whatsappNote.textContent="Takip kaydı oluşmadığı için WhatsApp bildirimi hazırlanamadı.";
        whatsappBtn.onclick=null;
      }
    }

    event.target.reset();
  }catch(error){
    console.error("Doğrudan teklif talebi gönderilemedi:",error);
    const errorCode=String(error?.code||"unknown");
    const errorText=errorCode.includes("permission-denied")
      ?"Teklif talebi kaydedilemedi (permission-denied) · Proje: "+(publicApp.options.projectId||"-")+" · "+(error?.message||"")
      :"Teklif gönderilemedi ("+errorCode+"). Lütfen tekrar deneyin.";
    message.textContent=errorText;
    showToast(errorText);
  }finally{
    submit.disabled=false;
    submit.textContent=oldText;
  }
});

function moderateReviewText(raw){
  const original=String(raw||"").trim();
  if(!original)return {ok:false,message:"Lütfen yorumunuzu yazın."};

  const leetMap={"0":"o","1":"i","3":"e","4":"a","5":"s","7":"t"};
  const lowered=original
    .toLocaleLowerCase("tr-TR")
    .replace(/[013457]/g,ch=>leetMap[ch]||ch)
    .replace(/(.)\1{2,}/gu,"$1$1");

  const normalized=lowered
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ")
    .trim();

  // Nokta, tire, ünlem gibi karakterlerle kelimeyi bölme denemelerini de yakalar.
  const punctuationJoined=lowered
    .replace(/[^\p{L}\p{N}\s]/gu,"")
    .replace(/\s+/g," ")
    .trim();

  const tokens=normalized.split(" ").filter(Boolean);
  const joinedTokens=punctuationJoined.split(" ").filter(Boolean);
  const compact=normalized.replace(/\s+/g,"");

  const profanityTokens=new Set([
    "amk","siktir","sktir","sikeyim","sikerim","sikik","orospu","yarrak","yarak",
    "piç","pic","pezevenk","kahpe","şerefsiz","serefsiz","gerizekalı","gerizekali"
  ]);

  const profanityCompact=[
    "orospuçocuğu","orospucocugu","ananısikeyim","ananisikeyim",
    "annenisikeyim","şerefsiz","serefsiz"
  ];

  const threatTokens=new Set([
    "öldüreceğim","oldurecegim","öldürecem","oldurecem","gebertirim",
    "vuracağım","vuracagim","vurucam","bıçaklayacağım","bicaklayacagim",
    "yakacağım","yakacagim","tecavüz","tecavuz"
  ]);

  const threatCompact=[
    "kendiniöldür","kendinioldur","intiharet",
    "bombakoy","bombayerleştir","bombayerlestir","bombapatlat",
    "patlayıcıkoy","patlayicikoy","tecavüz","tecavuz"
  ];

  const allTokens=[...tokens,...joinedTokens];

  if(
    allTokens.some(token=>profanityTokens.has(token))
    || profanityCompact.some(term=>compact.includes(term))
  ){
    return {ok:false,message:"Yorum gönderilemedi: küfür veya hakaret içeren ifadeler kullanılamaz."};
  }

  if(
    allTokens.some(token=>threatTokens.has(token))
    || threatCompact.some(term=>compact.includes(term))
  ){
    return {ok:false,message:"Yorum gönderilemedi: tehdit, şiddet veya tehlikeli içerik kullanılamaz."};
  }

  const threatSubject=tokens.some(token=>["seni","sizi","onu","onları","onlari"].includes(token));
  const threatVerb=allTokens.some(token=>[
    "öldür","oldur","öldüreceğim","oldurecegim","gebert","gebertirim",
    "vur","vuracağım","vuracagim","bıçakla","bicakla","yak","yakacağım","yakacagim"
  ].includes(token));

  if(threatSubject && threatVerb){
    return {ok:false,message:"Yorum gönderilemedi: tehdit, şiddet veya tehlikeli içerik kullanılamaz."};
  }

  return {ok:true};
}

function closeReviewModal(){document.getElementById("reviewModal").classList.add("hidden")}
document.getElementById("reviewModalClose").addEventListener("click",closeReviewModal);
document.getElementById("reviewModal").addEventListener("click",event=>{if(event.target.id==="reviewModal")closeReviewModal()});
document.querySelectorAll("#ratingPicker [data-rating]").forEach(button=>button.addEventListener("click",()=>{currentRating=Number(button.dataset.rating||0);document.querySelectorAll("#ratingPicker [data-rating]").forEach(x=>x.classList.toggle("active",Number(x.dataset.rating)<=currentRating))}));
document.querySelectorAll("#recommendPicker [data-recommend]").forEach(button=>button.addEventListener("click",()=>{
  currentRecommendation=button.dataset.recommend==="true";
  document.querySelectorAll("#recommendPicker [data-recommend]").forEach(x=>{
    x.classList.toggle("active",x===button);
  });
}));

document.getElementById("reviewForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const msg=document.getElementById("reviewMessage");
  const text=document.getElementById("reviewText").value.trim();
  const button=document.getElementById("reviewSubmitBtn")||event.target.querySelector('button[type="submit"]');

  msg.textContent="";

  if(!institution){msg.textContent="Kurum bilgisi henüz hazır değil. Sayfayı yenileyip tekrar deneyin.";return}
  if(institution.isDemo){msg.textContent="Demo kurum için yorum kaydı oluşturulamaz.";return}
  if(!currentRating){msg.textContent="Lütfen 1-5 yıldız seçin.";return}
  if(!text){msg.textContent="Lütfen yorumunuzu yazın.";return}

  const moderation=moderateReviewText(text);
  if(!moderation.ok){
    msg.textContent=moderation.message;
    showToast(moderation.message);
    return;
  }

  const old=button?.textContent||"Yorumu Gönder";
  if(button){button.disabled=true;button.textContent="Gönderiliyor...";}
  msg.textContent="Yorumunuz gönderiliyor...";

  const reviewData={
    institutionId:String(institution.id),
    rating:currentRating,
    text,
    status:"pending",
    date:new Date().toISOString()
  };

  if(typeof currentRecommendation==="boolean"){
    reviewData.recommend=currentRecommendation;
  }

  try{
    await db.collection("institutionReviews").add(reviewData);

    event.target.reset();
    currentRating=0;
    currentRecommendation=null;
    document.querySelectorAll("#ratingPicker button").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll("#recommendPicker button").forEach(x=>x.classList.remove("active"));

    msg.textContent=typeof reviewData.recommend==="boolean"
      ?"✓ Yorumunuz ve tavsiye oyunuz incelemeye alındı."
      :"✓ Yorumunuz incelemeye alındı.";

    await loadReviews();
    setTimeout(closeReviewModal,850);
  }catch(error){
    console.error("Yorum gönderilemedi:",error);
    const code=String(error?.code||"");
    msg.textContent=code.includes("permission-denied")
      ?"Yorum gönderilemedi (permission-denied). Firestore yorum iznini kontrol edin."
      :"Yorum gönderilemedi"+(code?" · "+code:"")+".";
  }finally{
    if(button){button.disabled=false;button.textContent=old;}
  }
});

async function track(type,dedupe=false){
  if(!institution||institution.isDemo||preview)return;
  if(dedupe&&type==="profile_view"){const key="dijiyer_public_view_"+institution.id,last=Number(localStorage.getItem(key)||0);if(Date.now()-last<1800000)return;localStorage.setItem(key,String(Date.now()))}
  const now=new Date(),day=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  try{await db.collection("institutionAnalytics").add({institutionId:String(institution.id),type,day,date:now.toISOString()})}catch(error){console.warn("Analytics kaydedilemedi",error)}
}

function showError(){setInstitutionRobots("noindex,nofollow,noarchive");document.getElementById("loadingState").classList.add("hidden");document.getElementById("institutionProfile").classList.add("hidden");document.getElementById("errorState").classList.remove("hidden")}

async function init(){
  if(!institutionId){showError();return}
  try{
    const doc=await db.collection("institutions").doc(institutionId).get();
    if(doc.exists){
      const data=doc.data();
      if(String(data.status||"active")==="passive"){showError();return}
      institution={id:doc.id,...data,isDemo:false};
      renderProfile();
      if(params.get("teklif")==="1")setTimeout(openDirectQuote,80);
      await loadReviews();
      return
    }
  }catch(error){console.error(error)}
  if(demoInstitutions[institutionId]){
    institution={...demoInstitutions[institutionId]};
    renderProfile();
    renderReviews();
    if(params.get("teklif")==="1")setTimeout(openDirectQuote,80);
    return
  }
  showError();
}
init();