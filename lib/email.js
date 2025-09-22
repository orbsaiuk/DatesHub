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

export function buildBasicHtmlEmail(title, bodyLines) {
  const safeLines = Array.isArray(bodyLines)
    ? bodyLines
    : [String(bodyLines || "")];
  const p = safeLines
    .map(
      (line) =>
        `<p style="margin: 0 0 12px; line-height: 1.5;">${escapeHtml(String(line))}</p>`
    )
    .join("");
  return (
    `<!doctype html><html><body style="font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; padding: 16px;">` +
    `<h2 style="margin:0 0 12px;">${escapeHtml(title || "")}</h2>` +
    p +
    `<p style="color:#6b7280; font-size:12px; margin-top:24px;">This is an automated message. Please do not reply.</p>` +
    `</body></html>`
  );
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
