import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM || "BetterMe <onboarding@resend.dev>";

export const resend = new Resend(resendApiKey);

/**
 * Sends a world-class, premium HTML email for Password Reset OTP
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
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BetterMe Password Reset</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #FAFBFD;
              margin: 0;
              padding: 32px 16px;
              color: #111827;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              max-width: 520px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              border: 1px solid #E7ECF3;
              box-shadow: 0 12px 36px -6px rgba(11, 110, 243, 0.08), 0 4px 16px -2px rgba(0, 0, 0, 0.03);
            }
            .header-banner {
              background: linear-gradient(135deg, #0B6EF3 0%, #0958C7 50%, #04388A 100%);
              padding: 36px 32px 28px;
              text-align: center;
              color: #ffffff;
            }
            .brand-pill {
              display: inline-flex;
              align-items: center;
              background: rgba(255, 255, 255, 0.18);
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 4px 14px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .header-title {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .header-sub {
              margin: 6px 0 0;
              font-size: 13px;
              opacity: 0.9;
            }
            .content-body {
              padding: 36px 32px 28px;
            }
            .greeting {
              font-size: 15px;
              line-height: 1.6;
              color: #374151;
              margin: 0 0 20px;
            }
            .otp-container {
              background: #F4F8FF;
              border: 2px dashed #0B6EF3;
              border-radius: 18px;
              padding: 24px 20px;
              text-align: center;
              margin: 28px 0;
            }
            .otp-label {
              display: block;
              font-size: 11px;
              font-weight: 800;
              color: #0B6EF3;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .otp-code {
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              font-size: 42px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #0B6EF3;
              display: block;
              margin: 4px 0;
            }
            .cta-button {
              display: block;
              background: #0B6EF3;
              color: #ffffff !important;
              padding: 14px 28px;
              border-radius: 14px;
              font-weight: 700;
              font-size: 14px;
              text-decoration: none;
              text-align: center;
              margin: 20px 0;
              box-shadow: 0 4px 14px rgba(11, 110, 243, 0.25);
            }
            .security-box {
              background: #FAFBFD;
              border-radius: 14px;
              padding: 16px;
              border: 1px solid #E7ECF3;
              margin-top: 24px;
            }
            .security-text {
              font-size: 12px;
              line-height: 1.6;
              color: #667085;
              margin: 0;
            }
            .footer-info {
              padding: 24px 32px;
              text-align: center;
              font-size: 11px;
              color: #9CA3AF;
              border-top: 1px solid #F0F2F5;
              background: #FAFBFD;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header Banner -->
            <div class="header-banner">
              <div class="brand-pill">🌱 BetterMe Security</div>
              <h1 class="header-title">Dib u Dejinta Furaha Sirta</h1>
              <p class="header-sub">Password Reset Verification Code</p>
            </div>

            <!-- Content Body -->
            <div class="content-body">
              <p class="greeting">
                Kusoo dhowaw <strong>${userName || "Qiimo-badane"}</strong>,<br>
                Waxaan helnay codsi lagu doonayo in dib loo dejiyo furahaaga sirta ah ee akoonkaaga <strong>BetterMe</strong>.
              </p>

              <!-- OTP Code Display -->
              <div class="otp-container">
                <span class="otp-label">Koodhkaaga Xaqiijinta • Your 6-Digit Code</span>
                <span class="otp-code">${resetCode}</span>
              </div>

              <!-- Direct Action Link -->
              <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">Dib u Daji Furaha Sirta (Reset Password) →</a>
              </div>

              <!-- Security Notice -->
              <div class="security-box">
                <p class="security-text">
                  ⏱️ <strong>Muhiim:</strong> Koodhkan waxa uu dhacayaa <strong>15 daqiiqo</strong> gudahood.<br>
                  Haddii aadan adigu codsan dib u dejintan, fadlan iska indho-tir email-kan — akoonkaagu waa mid ammaan ah.<br>
                  <em>If you didn't request a password reset, you can safely ignore this email.</em>
                </p>
              </div>
            </div>

            <!-- Footer Info -->
            <div class="footer-info">
              BetterMe Habit System &bull; Secured with Resend &bull; All Rights Reserved
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [toEmail],
      subject: `BetterMe - Koodhka Dib u Dejinta / Password Reset Code: ${resetCode}`,
      html: htmlContent,
    });

    if (error) {
      console.warn("Resend client error, attempting direct API:", error);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [toEmail],
          subject: `BetterMe - Koodhka Dib u Dejinta / Password Reset Code: ${resetCode}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend failed: ${res.status}`);
      }

      const resData = await res.json();
      return { success: true, data: resData };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to send password reset email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a world-class, premium HTML email for Two-Factor Authentication (2FA) OTP
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
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BetterMe Admin 2FA Code</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #FAFBFD;
              margin: 0;
              padding: 32px 16px;
              color: #111827;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              max-width: 520px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              border: 1px solid #E7ECF3;
              box-shadow: 0 12px 36px -6px rgba(11, 110, 243, 0.08), 0 4px 16px -2px rgba(0, 0, 0, 0.03);
            }
            .header-banner {
              background: linear-gradient(135deg, #0B6EF3 0%, #0958C7 50%, #04388A 100%);
              padding: 36px 32px 28px;
              text-align: center;
              color: #ffffff;
            }
            .brand-pill {
              display: inline-flex;
              align-items: center;
              background: rgba(255, 255, 255, 0.18);
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 4px 14px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .header-title {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .header-sub {
              margin: 6px 0 0;
              font-size: 13px;
              opacity: 0.9;
            }
            .content-body {
              padding: 36px 32px 28px;
            }
            .greeting {
              font-size: 15px;
              line-height: 1.6;
              color: #374151;
              margin: 0 0 20px;
            }
            .otp-container {
              background: #F4F8FF;
              border: 2px dashed #0B6EF3;
              border-radius: 18px;
              padding: 24px 20px;
              text-align: center;
              margin: 28px 0;
            }
            .otp-label {
              display: block;
              font-size: 11px;
              font-weight: 800;
              color: #0B6EF3;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .otp-code {
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              font-size: 42px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #0B6EF3;
              display: block;
              margin: 4px 0;
            }
            .security-box {
              background: #FFFBEB;
              border-radius: 14px;
              padding: 16px;
              border: 1px solid #FDE68A;
              margin-top: 24px;
            }
            .security-text {
              font-size: 12px;
              line-height: 1.6;
              color: #92400E;
              margin: 0;
            }
            .footer-info {
              padding: 24px 32px;
              text-align: center;
              font-size: 11px;
              color: #9CA3AF;
              border-top: 1px solid #F0F2F5;
              background: #FAFBFD;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header Banner -->
            <div class="header-banner">
              <div class="brand-pill">🔐 Admin Security (2FA)</div>
              <h1 class="header-title">Koodhka Gelitaanka Admin-ka</h1>
              <p class="header-sub">Two-Factor Authentication Sign-In Code</p>
            </div>

            <!-- Content Body -->
            <div class="content-body">
              <p class="greeting">
                Kusoo dhowaw <strong>${userName || "Admin"}</strong>,<br>
                Waxaa jira isku day lagu galayo akoonkaaga admin-ka <strong>BetterMe</strong>. Fadlan geli koodhkan 6-da god ah si aad u xaqiijiso:
              </p>

              <!-- OTP Code Display -->
              <div class="otp-container">
                <span class="otp-label">Koodhkaaga 2FA • Your 2FA Code</span>
                <span class="otp-code">${code}</span>
              </div>

              <!-- Security Notice -->
              <div class="security-box">
                <p class="security-text">
                  ⚠️ <strong>Amniga:</strong> Koodhkani waxa uu dhacayaa <strong>10 daqiiqo</strong> gudahood.<br>
                  Haddii aadan adigu ahayn qofka isku dayaya inuu galo akoonka, fadlan si degdeg ah u bedel furahaaga sirta ah.<br>
                  <em>Never share this verification code with anyone.</em>
                </p>
              </div>
            </div>

            <!-- Footer Info -->
            <div class="footer-info">
              BetterMe Admin Shield &bull; Powered by Resend &bull; Encrypted & Verified
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [toEmail],
      subject: `BetterMe Admin - Koodhka 2FA / Verification Code: ${code}`,
      html: htmlContent,
    });

    if (error) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [toEmail],
          subject: `BetterMe Admin - Koodhka 2FA / Verification Code: ${code}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend failed: ${res.status}`);
      }

      const resData = await res.json();
      return { success: true, data: resData };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to send 2FA code:", error);
    return { success: false, error: error.message };
  }
}
