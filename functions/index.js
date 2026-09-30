const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const PUBLIC_BASE_URL = defineString("PUBLIC_BASE_URL", {
  default: "https://ftmotiondesign.github.io/dijiyer"
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildTrackingUrl(trackingCode) {
  const base = String(PUBLIC_BASE_URL.value() || "").replace(/\/$/, "");
  return base + "/teklif.html?v=5&kod=" +
    encodeURIComponent(String(trackingCode || ""));
}

function buildTrackingPageUrl() {
  const base = String(PUBLIC_BASE_URL.value() || "").replace(/\/$/, "");
  return base + "/teklif.html";
}

function validEmail(value) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function mailTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() }
  });
}

async function trackingUrlForQuote(quoteId) {
  try {
    const snapshot = await admin.firestore()
      .collectionGroup("codes")
      .where("quoteId", "==", String(quoteId || ""))
      .limit(1)
      .get();
    if (!snapshot.empty) {
      const access = snapshot.docs[0].data() || {};
      const trackingCode = String(access.trackingCode || snapshot.docs[0].id || "");
      if (trackingCode) return buildTrackingUrl(trackingCode);
    }
  } catch (error) {
    console.warn("Takip linki bulunamadı; genel takip sayfası kullanılacak.", quoteId, error);
  }
  return buildTrackingPageUrl();
}

async function sendDijiyerMail({to,subject,title,intro,lines=[],buttonText="Tekliflerimi İncele",buttonUrl=""}) {
  const email=validEmail(to);
  if(!email)return false;
  const safeLines=lines.filter(Boolean)
    .map(line=>`<div style="margin-top:7px">${escapeHtml(line)}</div>`).join("");
  await mailTransporter().sendMail({
    from:`Dijiyer <${SMTP_USER.value()}>`,
    to:email,
    subject,
    text:`${title}\n\n${intro}\n`+lines.filter(Boolean).join("\n")+
      (buttonUrl?`\n\n${buttonText}: ${buttonUrl}`:"")+"\n\nDijiyer",
    html:`
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033">
        <div style="padding:22px;border:1px solid #dce6f2;border-radius:16px;background:#fff">
          <div style="font-size:13px;font-weight:800;color:#1677ff">DİJİYER · TEKLİF BİLDİRİMİ</div>
          <h2 style="margin:8px 0 8px">${escapeHtml(title)}</h2>
          <p style="color:#64748b;line-height:1.6">${escapeHtml(intro)}</p>
          ${safeLines?`<div style="margin:18px 0;padding:14px;border-radius:12px;background:#f6f9fd">${safeLines}</div>`:""}
          ${buttonUrl?`<a href="${escapeHtml(buttonUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1677ff;color:#fff;text-decoration:none;font-weight:800">${escapeHtml(buttonText)}</a>`:""}
        </div>
      </div>`
  });
  return true;
}


exports.sendQuoteTrackingEmail = onDocumentCreated(
  {
    document: "quoteAccess/{phoneHash}/codes/{trackingCode}",
    region: "europe-west1",
    secrets: [SMTP_USER, SMTP_PASS]
  },
  async (event) => {
    const access = event.data?.data() || {};
    const quoteId = String(access.quoteId || "");
    const trackingCode = String(access.trackingCode || event.params.trackingCode || "");

    if (!quoteId || !trackingCode) {
      console.warn("E-posta atlandı: quoteId veya trackingCode eksik.");
      return;
    }

    const quoteSnap = await admin.firestore()
      .collection("quoteRequests")
      .doc(quoteId)
      .get();

    if (!quoteSnap.exists) {
      console.warn("E-posta atlandı: quoteRequests belgesi bulunamadı.", quoteId);
      return;
    }

    const quote = quoteSnap.data() || {};
    const to = String(quote.email || "").trim();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      console.warn("E-posta atlandı: geçerli müşteri e-postası yok.", quoteId);
      return;
    }

    const trackingUrl = buildTrackingUrl(trackingCode);
    const service = String(quote.service || "Teklif Talebi");
    const location = [quote.city, quote.district].filter(Boolean).join(" / ");
    const name = String(quote.name || "").trim();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER.value(),
        pass: SMTP_PASS.value()
      }
    });

    try {
      await transporter.sendMail({
        from: `Dijiyer <${SMTP_USER.value()}>`,
        to,
        subject: `Dijiyer teklif takip bilgileriniz · ${service}`,
        text:
          `Merhaba ${name || ""}\n\n` +
          `Dijiyer teklif talebiniz oluşturuldu.\n` +
          `Hizmet: ${service}\n` +
          `Konum: ${location || "-"}\n` +
          `Takip Kodu: ${trackingCode}\n` +
          `Teklif Linki: ${trackingUrl}\n\n` +
          `Tekliflerinizi bu bağlantıdan takip edebilirsiniz.\n\nDijiyer`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033">
            <div style="padding:22px;border:1px solid #dce6f2;border-radius:16px;background:#fff">
              <div style="font-size:13px;font-weight:800;color:#1677ff">DİJİYER · TEKLİF TAKİBİ</div>
              <h2 style="margin:8px 0 6px">Talebiniz oluşturuldu</h2>
              <p style="color:#64748b;line-height:1.6">
                ${name ? "Merhaba " + escapeHtml(name) + ", " : ""}
                teklif talebiniz uygun kurumlara iletiliyor.
              </p>

              <div style="margin:18px 0;padding:14px;border-radius:12px;background:#f6f9fd">
                <div><b>Hizmet:</b> ${escapeHtml(service)}</div>
                <div style="margin-top:7px"><b>Konum:</b> ${escapeHtml(location || "-")}</div>
                <div style="margin-top:7px"><b>Takip Kodu:</b> ${escapeHtml(trackingCode)}</div>
              </div>

              <a href="${escapeHtml(trackingUrl)}"
                 style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1677ff;color:#fff;text-decoration:none;font-weight:800">
                 Tekliflerimi Takip Et
              </a>

              <p style="margin-top:18px;color:#64748b;font-size:12px;line-height:1.6">
                Linki başka bir cihazda açtığınızda talepte kullandığınız telefon numarası istenir.
              </p>
            </div>
          </div>
        `
      });

      await event.data.ref.set({
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailDeliveryStatus: "sent"
      }, { merge: true });

      console.log("Takip e-postası gönderildi:", quoteId, to);
    } catch (error) {
      console.error("Takip e-postası gönderilemedi:", quoteId, error);

      await event.data.ref.set({
        emailDeliveryStatus: "failed",
        emailDeliveryError: String(error?.message || error).slice(0, 300)
      }, { merge: true });

      throw error;
    }
  }
);


exports.sendOfferChangeEmail = onDocumentWritten(
  {
    document: "quoteRequests/{quoteId}/offers/{institutionId}",
    region: "europe-west1",
    secrets: [SMTP_USER, SMTP_PASS]
  },
  async function offerChangeHandler(event) {
  const afterSnap=event.data?.after;
  if(!afterSnap?.exists)return;
  const beforeSnap=event.data?.before;
  const after=afterSnap.data()||{};
  const before=beforeSnap?.exists?(beforeSnap.data()||{}):null;
  const quoteId=String(event.params.quoteId||"");
  const institutionId=String(event.params.institutionId||"");
  if(!quoteId||!institutionId)return;

  const changedVersion=Number(after.offerVersion||1)!==Number(before?.offerVersion||0);
  const changedUpdatedAt=String(after.updatedAt||"")!==String(before?.updatedAt||"");
  if(before&&!changedVersion&&!changedUpdatedAt)return;

  const quoteSnap=await admin.firestore().collection("quoteRequests").doc(quoteId).get();
  if(!quoteSnap.exists)return;
  const quote=quoteSnap.data()||{};
  const to=validEmail(quote.email);
  if(!to)return;

  const lockSnap=await admin.firestore().collection("quoteRequests").doc(quoteId)
    .collection("locks").doc("main").get();
  if(lockSnap.exists&&before)return;

  const version=Math.max(1,Number(after.offerVersion||(before?2:1)));
  const isNew=!before;
  const isSecond=version===2;
  const isAlternative=String(after.sourceType||"")==="alternative";
  const institutionName=String(after.institutionName||"Kurum");
  const price=Number(after.price||0);
  const service=String(quote.service||"Teklif Talebi");
  const trackingUrl=await trackingUrlForQuote(quoteId);
  const title=isNew?"Yeni teklifiniz geldi":isSecond?"2. teklifiniz geldi":"Teklifiniz güncellendi";
  const subject=`Dijiyer · ${title} · ${service}`;
  const intro=isAlternative
    ? `${institutionName}, talebinizin yönlendirildiği alternatif kurumlardan biri olarak teklif gönderdi.`
    : isSecond
      ? `${institutionName} önceki teklifini yenileyerek size 2. bir teklif gönderdi.`
      : `${institutionName} teklifinizi güncelledi.`;

  await sendDijiyerMail({
    to,subject,title,intro,
    lines:[
      `Kurum: ${institutionName}`,
      price>0?`Fiyat: ${new Intl.NumberFormat("tr-TR").format(price)} TL`:"",
      isAlternative?"Kaynak: Alternatif kurum teklifi":"",
      version>=2?`Teklif sürümü: ${version}. teklif`:""
    ],
    buttonText:"Teklifi İncele",
    buttonUrl:trackingUrl
  });
  console.log("Teklif bildirim e-postası gönderildi:",quoteId,institutionId,version);
}
);

exports.sendQuoteForwardedEmail = onDocumentWritten(
  {
    document: "quoteRequests/{quoteId}/publicStatus/main",
    region: "europe-west1",
    secrets: [SMTP_USER, SMTP_PASS]
  },
  async function forwardedHandler(event) {
  const afterSnap=event.data?.after;
  if(!afterSnap?.exists)return;
  const after=afterSnap.data()||{};
  const before=event.data?.before?.exists?(event.data.before.data()||{}):{};
  if(String(after.status||"")!=="forwarded")return;
  if(String(after.lastForwardedAt||"")===String(before.lastForwardedAt||""))return;

  const quoteId=String(event.params.quoteId||"");
  const quoteSnap=await admin.firestore().collection("quoteRequests").doc(quoteId).get();
  if(!quoteSnap.exists)return;
  const quote=quoteSnap.data()||{};
  const to=validEmail(quote.email);
  if(!to)return;

  const trackingUrl=await trackingUrlForQuote(quoteId);
  const message=String(after.message||"Seçtiğiniz kurumdan süresinde teklif gelmediği için talebiniz uygun diğer kurumlara iletildi.");
  const count=Number(after.forwardedInstitutionCount||0);

  await sendDijiyerMail({
    to,
    subject:`Dijiyer · Talebiniz diğer kurumlara iletildi · ${String(quote.service||"Teklif Talebi")}`,
    title:"Talebiniz diğer kurumlara iletildi",
    intro:message,
    lines:[
      count>0?`${count} uygun kuruma iletildi.`:"",
      "Yeni teklifler geldikçe ayrıca bilgilendirileceksiniz."
    ],
    buttonText:"Teklif Sürecini Gör",
    buttonUrl:trackingUrl
  });
  console.log("Yönlendirme e-postası gönderildi:",quoteId);
}
);


function secondOfferDelayMinutes(offer){
  const validityHours=Math.max(1,Number(offer?.validityHours||48));
  const halfValidity=Math.floor(validityHours*60/2);
  return Math.max(30,Math.min(180,halfValidity||180));
}

function isTerminalQuoteStatus(value){
  return new Set(["done","archived","closed","cancelled","canceled","completed","used"])
    .has(String(value||"").trim().toLowerCase());
}

async function customerRespondedAfterOffer(quoteRef,institutionId,offer){
  const offerAt=new Date(offer.updatedAt||offer.createdAt||0).getTime();
  if(!Number.isFinite(offerAt)||offerAt<=0)return false;

  try{
    const engagementSnap=await quoteRef.collection("engagement").doc(institutionId).get();
    if(engagementSnap.exists){
      const engagement=engagementSnap.data()||{};
      const revisionAt=new Date(engagement.revisionRequestedAt||0).getTime();
      if(Number.isFinite(revisionAt)&&revisionAt>offerAt)return true;
    }
  }catch(error){
    console.warn("2. teklif engagement kontrolü atlandı:",quoteRef.id,institutionId,error);
  }

  try{
    const messagesSnap=await quoteRef.collection("conversations").doc(institutionId)
      .collection("messages").get();
    return messagesSnap.docs.some(doc=>{
      const row=doc.data()||{};
      if(String(row.sender||"")!=="customer")return false;
      const messageAt=new Date(row.date||0).getTime();
      return Number.isFinite(messageAt)&&messageAt>offerAt;
    });
  }catch(error){
    console.warn("2. teklif mesaj kontrolü atlandı:",quoteRef.id,institutionId,error);
    return false;
  }
}

exports.processSecondOfferInvites = onSchedule(
  {
    schedule:"every 15 minutes",
    timeZone:"Europe/Istanbul",
    region:"europe-west1"
  },
  async () => {
    const db=admin.firestore();
    const nowMs=Date.now();
    const quoteSnap=await db.collection("quoteRequests")
      .orderBy("date","desc")
      .limit(400)
      .get();

    let created=0;
    let checked=0;

    for(const quoteDoc of quoteSnap.docs){
      const quote=quoteDoc.data()||{};
      if(isTerminalQuoteStatus(quote.status))continue;

      const quoteRef=quoteDoc.ref;
      const lockSnap=await quoteRef.collection("locks").doc("main").get();
      if(lockSnap.exists)continue;

      const offersSnap=await quoteRef.collection("offers").get();

      for(const offerDoc of offersSnap.docs){
        const offer=offerDoc.data()||{};
        checked++;

        const institutionId=String(offer.institutionId||offerDoc.id||"");
        if(!institutionId)continue;
        if(Math.max(1,Number(offer.offerVersion||1))!==1)continue;

        const expiryMs=new Date(offer.expiresAt||0).getTime();
        if(Number.isFinite(expiryMs)&&expiryMs<=nowMs)continue;

        const baseMs=new Date(offer.updatedAt||offer.createdAt||0).getTime();
        if(!Number.isFinite(baseMs)||baseMs<=0)continue;

        const eligibleAt=baseMs+secondOfferDelayMinutes(offer)*60000;
        if(nowMs<eligibleAt)continue;

        const inviteRef=quoteRef.collection("secondOfferInvites").doc(institutionId);
        const inviteSnap=await inviteRef.get();
        if(inviteSnap.exists)continue;

        if(await customerRespondedAfterOffer(quoteRef,institutionId,offer))continue;

        const invitedAt=new Date().toISOString();
        await inviteRef.set({
          institutionId,
          institutionName:String(offer.institutionName||"Kurum"),
          status:"open",
          reason:"customer_no_response",
          firstOfferPrice:Number(offer.price||0),
          offerVersion:1,
          invitedAt,
          expiresAt:String(offer.expiresAt||""),
          decision:"",
          respondedAt:""
        });
        created++;
      }
    }

    console.log("2. teklif daveti zamanlayıcısı tamamlandı",{checked,created});
  }
);

exports.sendSecondOfferOpportunityEmail = onDocumentCreated(
  {
    document:"quoteRequests/{quoteId}/secondOfferInvites/{institutionId}",
    region:"europe-west1",
    secrets:[SMTP_USER,SMTP_PASS]
  },
  async (event) => {
    const invite=event.data?.data()||{};
    if(String(invite.status||"")!=="open")return;

    const quoteId=String(event.params.quoteId||"");
    const institutionId=String(event.params.institutionId||"");
    if(!quoteId||!institutionId)return;

    const db=admin.firestore();
    const quoteRef=db.collection("quoteRequests").doc(quoteId);
    const [quoteSnap,offerSnap,lockSnap]=await Promise.all([
      quoteRef.get(),
      quoteRef.collection("offers").doc(institutionId).get(),
      quoteRef.collection("locks").doc("main").get()
    ]);

    if(!quoteSnap.exists||!offerSnap.exists||lockSnap.exists)return;

    const quote=quoteSnap.data()||{};
    const offer=offerSnap.data()||{};
    if(isTerminalQuoteStatus(quote.status))return;
    if(Math.max(1,Number(offer.offerVersion||1))!==1)return;
    if(offer.expiresAt&&new Date(offer.expiresAt).getTime()<=Date.now())return;

    const accountSnap=await db.collection("institutionUsers")
      .where("institutionId","==",institutionId)
      .limit(5)
      .get();

    const accountDoc=accountSnap.docs.find(doc=>{
      const data=doc.data()||{};
      return data.status==="approved"&&validEmail(data.email);
    });
    if(!accountDoc)return;

    const account=accountDoc.data()||{};
    const to=validEmail(account.email);
    const institutionName=String(account.institutionName||offer.institutionName||"Kurum");
    const panelUrl=String(PUBLIC_BASE_URL.value()||"").replace(/\/$/,"")+"/institution.html";

    await sendDijiyerMail({
      to,
      subject:`Dijiyer · 2. teklif fırsatı · ${String(quote.service||"Teklif Talebi")}`,
      title:"2. teklif fırsatı",
      intro:"İlk teklifiniz henüz kabul edilmedi ve müşteriden yeni bir dönüş gelmedi.",
      lines:[
        `Kurum: ${institutionName}`,
        "Talep hâlâ açık. İsterseniz fiyatı veya şartları güncelleyerek 2. teklif sunabilirsiniz.",
        "2. teklif için yeni teklif kredisi kullanılmaz."
      ],
      buttonText:"2. Teklif Fırsatını Gör",
      buttonUrl:panelUrl
    });

    console.log("2. teklif fırsatı e-postası kuruma gönderildi:",quoteId,institutionId);
  }
);

