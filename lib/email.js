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

  try {
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      // Add timeouts for production
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    return cachedTransporter;
  } catch (error) {
    return null;
  }
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

/**
 * Verify email configuration and connection
 * Call this on application startup to ensure email service is working
 */
export async function verifyEmailConfig() {
  const transporter = getTransporter();

  if (!transporter) {
    return { ok: false, reason: "Transporter not configured" };
  }

  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function buildBasicHtmlEmail(title, lines, options = {}) {
  const { primaryColor = "#6366f1", buttonUrl = "", buttonText = "" } = options;

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; }
          .email-header { padding: 25px 20px !important; }
          .email-body { padding: 25px 20px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI', Tahoma, Arial, sans-serif;direction:rtl;text-align:right;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <!-- Main Container -->
            <table role="presentation" class="email-container" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
              
              <!-- Header with Brand Color -->
              <tr>
                <td class="email-header" style="background:linear-gradient(135deg, ${primaryColor} 0%, #8b5cf6 100%);padding:35px 30px;text-align:center;">
                  <div style="background:rgba(255,255,255,0.15);border-radius:50%;width:60px;height:60px;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:30px;color:#ffffff;">🎯</span>
                  </div>
                  <h1 style="margin:0;font-size:26px;font-weight:600;color:#ffffff;letter-spacing:-0.5px;">${title}</h1>
                </td>
              </tr>
              
              <!-- Email Body -->
              <tr>
                <td class="email-body" style="padding:35px 30px;font-size:16px;line-height:1.8;color:#1f2937;">
                  ${lines
                    .map((line) => {
                      // Handle section headers (bold text between **)
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return `<h2 style="margin:25px 0 12px 0;font-size:18px;font-weight:600;color:#111827;border-right:4px solid ${primaryColor};padding-right:12px;">${line.replace(/\*\*/g, "")}</h2>`;
                      }
                      // Handle bullet points
                      if (line.startsWith("•")) {
                        return `<p style="margin:0 0 10px 0;padding-right:25px;position:relative;"><span style="position:absolute;right:0;color:${primaryColor};font-weight:bold;">•</span>${line.substring(1).trim()}</p>`;
                      }
                      // Handle numbered lists
                      if (line.match(/^\d+\./)) {
                        return `<p style="margin:0 0 10px 0;padding-right:25px;position:relative;"><span style="position:absolute;right:0;color:${primaryColor};font-weight:600;">${line.match(/^\d+\./)[0]}</span>${line.substring(line.indexOf(".") + 1).trim()}</p>`;
                      }
                      // Empty line spacing
                      if (!line.trim()) {
                        return `<div style="height:15px;"></div>`;
                      }
                      // Regular paragraph
                      return `<p style="margin:0 0 16px 0;color:#374151;">${line}</p>`;
                    })
                    .join("")}
                  
                  ${
                    buttonUrl && buttonText
                      ? `
                  <div style="margin:30px 0 20px;text-align:center;">
                    <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(135deg, ${primaryColor} 0%, #8b5cf6 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(99,102,241,0.3);transition:transform 0.2s;">${buttonText}</a>
                  </div>
                  `
                      : ""
                  }
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding:25px 30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="text-align:center;">
                        <p style="margin:0 0 12px 0;font-size:14px;color:#6b7280;font-weight:500;">تواصل معنا</p>
                        <p style="margin:0 0 15px 0;font-size:13px;color:#9ca3af;">
                          📧 support@dateshub.com | 📱 اتصل بنا للدعم
                        </p>
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                          © ${new Date().getFullYear()} DatesHub. جميع الحقوق محفوظة.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
            
            <!-- Privacy Notice -->
            <table role="presentation" width="100%" style="max-width:600px;margin-top:20px;">
              <tr>
                <td style="text-align:center;padding:0 20px;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                    هذا البريد الإلكتروني تم إرساله من DatesHub. إذا كان لديك أي استفسار، يرجى الرد على هذا البريد أو الاتصال بفريق الدعم لدينا.
                  </p>
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
