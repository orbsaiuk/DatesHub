import nodemailer from "nodemailer";

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const from = process.env.EMAIL_FROM;
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = String(process.env.SMTP_SECURE || "true") === "true";

  if (!from || !gmailUser || !gmailPass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
  return cachedTransporter;
}

export async function sendEmail({ to, subject, html, text, cc }) {
  try {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM;
    if (!transporter || !from) {
      return {
        ok: false,
        skipped: true,
        reason: "Missing SMTP credentials or EMAIL_FROM",
      };
    }

    if (!to) {
      return { ok: false, skipped: true, reason: "Missing recipient" };
    }

    const info = await transporter.sendMail({
      from,
      to,
      cc,
      subject: subject || "",
      html,
      text,
    });

    return { ok: true, data: { messageId: info?.messageId } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

export function buildBasicHtmlEmail(title, lines) {
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:Tahoma, Arial, sans-serif;direction:rtl;text-align:right;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding:30px 15px;">
            <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
              <tr>
                <td style="padding:30px 25px 15px 25px;text-align:center;">
                  <h1 style="margin:0;font-size:22px;color:#111827;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:0 25px 25px 25px;font-size:15px;line-height:1.7;color:#374151;">
                  ${lines
                    .map((line) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return `<p style="margin:0 0 15px 0;font-weight:bold;color:#111827;">${line.replace(/\*\*/g, "")}</p>`;
                      }
                      if (line.startsWith("•")) {
                        return `<p style="margin:0 0 8px 0;padding-right:10px;">${line}</p>`;
                      }
                      return line
                        ? `<p style="margin:0 0 15px 0;">${line}</p>`
                        : `<div style="height:12px;"></div>`;
                    })
                    .join("")}
                </td>
              </tr>
              <tr>
                <td style="padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:13px;color:#6b7280;">© ${new Date().getFullYear()} OrbsAI. جميع الحقوق محفوظة.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
