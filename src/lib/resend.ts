import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM || "BetterMe <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendApiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

const BRAND_BLUE = "#0B6EF3";

function emailShell({
  title,
  subtitle,
  badge,
  badgeIconSvg,
  bodyHtml,
  footerNote,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeIconSvg: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F4F7FB;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F7FB;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E7ECF3;box-shadow:0 12px 40px rgba(11,110,243,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0B6EF3 0%,#0958C7 55%,#04388A 100%);padding:36px 28px 30px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.32);border-radius:999px;padding:6px 14px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:8px;">${badgeIconSvg}</td>
                        <td style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#ffffff;vertical-align:middle;">${badge}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.4px;color:#ffffff;line-height:1.25;">${title}</h1>
              <p style="margin:8px 0 0;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.9);">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#111827;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;text-align:center;border-top:1px solid #F0F2F5;background:#FAFBFD;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:11px;color:#9CA3AF;">
              ${footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const lockIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><rect x="5" y="11" width="14" height="10" rx="2" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="16" r="1.5" fill="#ffffff"/></svg>`;

const shieldIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const megaphoneIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11v2a2 2 0 0 0 2 2h1l6 4V5L6 9H5a2 2 0 0 0-2 2z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M16 9.5a3.5 3.5 0 0 1 0 5" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M9 15v3a2 2 0 0 0 3.2 1.6" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`;

function otpBlock(code: string, label: string): string {
  const safeCode = String(code || "").replace(/\D/g, "").slice(0, 6);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="background:#F4F8FF;border:2px dashed ${BRAND_BLUE};border-radius:16px;padding:22px 16px;text-align:center;">
          <p style="margin:0 0 8px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${BRAND_BLUE};">${label}</p>
          <p style="margin:0;font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:40px;font-weight:800;letter-spacing:10px;color:${BRAND_BLUE};line-height:1.2;">${safeCode}</p>
        </td>
      </tr>
    </table>`;
}

async function sendHtmlEmail({
  toEmail,
  subject,
  html,
}: {
  toEmail: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY missing — email not sent");
      return { success: false, error: "RESEND_API_KEY is not configured" };
    }

    const client = getResendClient();
    if (client) {
      const { data, error } = await client.emails.send({
        from: resendFrom,
        to: [toEmail],
        subject,
        html,
      });

      if (!error) {
        return { success: true, data };
      }
      console.warn("Resend client error, attempting direct API:", error);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(errJson.message || `Resend failed: ${res.status}`);
    }

    return { success: true, data: await res.json() };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Premium HTML email for Password Reset OTP (Resend-compatible, table layout + SVG icons)
 */
export async function sendPasswordResetEmail({
  toEmail,
  userName,
  resetCode,
  resetUrl,
}: {
  toEmail: string;
  userName?: string;
  resetCode: string;
  resetUrl: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const code = String(resetCode || "").replace(/\D/g, "").slice(0, 6);
  const name = userName || "Qiimo-badane";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Kusoo dhowaw <strong style="color:#111827;">${name}</strong>,<br>
      Waxaan helnay codsi lagu doonayo in dib loo dejiyo furahaaga sirta ah ee akoonkaaga <strong>BetterMe</strong>.
    </p>
    ${otpBlock(code, "Koodhkaaga Xaqiijinta • Your 6-Digit Code")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;padding:14px 28px;border-radius:12px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(11,110,243,0.25);">
            Dib u Daji Furaha Sirta →
          </a>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#FAFBFD;border:1px solid #E7ECF3;border-radius:12px;padding:14px 16px;">
          <p style="margin:0;font-size:12px;line-height:1.65;color:#667085;">
            <strong style="color:#111827;">Muhiim:</strong> Koodhkan waxa uu dhacayaa <strong>15 daqiiqo</strong> gudahood.<br>
            Haddii aadan adigu codsan dib u dejintan, fadlan iska indho-tir email-kan — akoonkaagu waa mid ammaan ah.<br>
            <em>If you didn't request a password reset, you can safely ignore this email.</em>
          </p>
        </td>
      </tr>
    </table>`;

  return sendHtmlEmail({
    toEmail,
    subject: `BetterMe — Koodhka Dib u Dejinta: ${code}`,
    html: emailShell({
      title: "Dib u Dejinta Furaha Sirta",
      subtitle: "Password Reset Verification Code",
      badge: "BetterMe Security",
      badgeIconSvg: lockIcon,
      bodyHtml,
      footerNote: "BetterMe Habit System • Secured with Resend • All Rights Reserved",
    }),
  });
}

/**
 * Premium HTML email for Admin 2FA OTP
 */
export async function sendTwoFactorCode({
  toEmail,
  userName,
  code,
}: {
  toEmail: string;
  userName?: string;
  code: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const otp = String(code || "").replace(/\D/g, "").slice(0, 6);
  const name = userName || "Admin";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Kusoo dhowaw <strong style="color:#111827;">${name}</strong>,<br>
      Waxaa jira isku day lagu galayo akoonkaaga admin-ka <strong>BetterMe</strong>. Fadlan geli koodhkan 6-da god ah si aad u xaqiijiso:
    </p>
    ${otpBlock(otp, "Koodhkaaga 2FA • Your 2FA Code")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:14px 16px;">
          <p style="margin:0;font-size:12px;line-height:1.65;color:#92400E;">
            <strong>Amniga:</strong> Koodhkani waxa uu dhacayaa <strong>10 daqiiqo</strong> gudahood.<br>
            Haddii aadan adigu ahayn qofka isku dayaya inuu galo akoonka, fadlan si degdeg ah u bedel furahaaga sirta ah.<br>
            <em>Never share this verification code with anyone.</em>
          </p>
        </td>
      </tr>
    </table>`;

  return sendHtmlEmail({
    toEmail,
    subject: `BetterMe Admin — Koodhka 2FA: ${otp}`,
    html: emailShell({
      title: "Koodhka Gelitaanka Admin-ka",
      subtitle: "Two-Factor Authentication Sign-In Code",
      badge: "Admin Security (2FA)",
      badgeIconSvg: shieldIcon,
      bodyHtml,
      footerNote: "BetterMe Admin Shield • Powered by Resend • Encrypted & Verified",
    }),
  });
}

/**
 * Broadcast announcement email to users
 */
export async function sendBroadcastEmail({
  toEmail,
  userName,
  title,
  message,
}: {
  toEmail: string;
  userName?: string;
  title: string;
  message: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const name = userName || "BetterMe User";
  const safeTitle = String(title || "Announcement");
  const safeMessage = String(message || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      Hello <strong style="color:#111827;">${name}</strong>,
    </p>
    <h2 style="margin:0 0 10px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:18px;font-weight:800;color:#111827;">${safeTitle}</h2>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">${safeMessage}</p>`;

  return sendHtmlEmail({
    toEmail,
    subject: `BetterMe — ${safeTitle}`,
    html: emailShell({
      title: safeTitle,
      subtitle: "Message from BetterMe Admin",
      badge: "BetterMe Broadcast",
      badgeIconSvg: megaphoneIcon,
      bodyHtml,
      footerNote: "BetterMe Habit System • You received this because you have an account",
    }),
  });
}
