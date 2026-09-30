const { onDocumentCreated } = require("firebase-functions/v2/firestore");
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
