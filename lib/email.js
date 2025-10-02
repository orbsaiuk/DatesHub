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

  // Log configuration status (without exposing sensitive data)
  console.log("📧 Email Configuration Status:", {
    hasEmailFrom: !!from,
    hasSmtpUser: !!gmailUser,
    hasSmtpPass: !!gmailPass,
    smtpHost,
    smtpPort,
    smtpSecure,
  });

  if (!from || !gmailUser || !gmailPass) {
    const missing = [];
    if (!from) missing.push("EMAIL_FROM");
    if (!gmailUser) missing.push("GMAIL_USER or SMTP_USER");
    if (!gmailPass) missing.push("GMAIL_PASS or SMTP_PASS");

    console.error(
      "❌ Email configuration incomplete! Missing environment variables:",
      missing.join(", ")
    );
    console.error(
      "⚠️ Emails will NOT be sent until these variables are configured in your production environment."
    );
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

    console.log("✅ Email transporter created successfully");
    return cachedTransporter;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error);
    return null;
  }
}

export async function sendEmail({ to, subject, html, text, cc }) {
  try {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM;

    if (!transporter || !from) {
      const errorMsg = "Missing SMTP credentials or EMAIL_FROM";
      console.error("❌ Email send failed:", errorMsg);
      console.error(
        "💡 To fix: Set EMAIL_FROM, GMAIL_USER/SMTP_USER, and GMAIL_PASS/SMTP_PASS in your environment variables"
      );
      return {
        ok: false,
        skipped: true,
        reason: errorMsg,
      };
    }

    if (!to) {
      console.warn("⚠️ Email send skipped: Missing recipient address");
      return { ok: false, skipped: true, reason: "Missing recipient" };
    }

    console.log(`📤 Sending email to: ${to} | Subject: ${subject}`);

    const info = await transporter.sendMail({
      from,
      to,
      cc,
      subject: subject || "",
      html,
      text,
    });

    console.log(`✅ Email sent successfully | MessageID: ${info?.messageId}`);
    return { ok: true, data: { messageId: info?.messageId } };
  } catch (error) {
    console.error("❌ Email send error:", {
      to,
      subject,
      error: error.message,
      code: error.code,
      command: error.command,
    });

    // Provide helpful error messages for common issues
    if (error.code === "EAUTH") {
      console.error(
        "🔐 Authentication failed. Check your SMTP credentials or use App Password for Gmail."
      );
    } else if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
      console.error(
        "🌐 Network error. Check firewall settings and SMTP host/port configuration."
      );
    } else if (error.code === "EENVELOPE") {
      console.error(
        "📧 Invalid email address format. Check sender and recipient addresses."
      );
    }

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
    console.error("❌ Email verification failed: No transporter available");
    return { ok: false, reason: "Transporter not configured" };
  }

  try {
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ Email service is ready and verified!");
    return { ok: true };
  } catch (error) {
    console.error("❌ Email verification failed:", error.message);
    console.error("⚠️ Email service will not work until this is resolved");
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
                          📧 support@orbsai.com | 📱 اتصل بنا للدعم
                        </p>
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                          © ${new Date().getFullYear()} OrbsAI. جميع الحقوق محفوظة.
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
                    هذا البريد الإلكتروني تم إرساله من OrbsAI. إذا كان لديك أي استفسار، يرجى الرد على هذا البريد أو الاتصال بفريق الدعم لدينا.
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
