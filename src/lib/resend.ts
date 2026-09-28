import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM || "BetterMe <onboarding@resend.dev>";

export const resend = new Resend(resendApiKey);

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
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f3f2; margin: 0; padding: 24px; color: #101010; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
            .body { padding: 32px 28px; }
            .code-box { background: #EFF6FF; border: 2px dashed #007AFF; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #007AFF; }
            .btn { display: inline-block; background-color: #007AFF; color: #ffffff !important; padding: 14px 28px; border-radius: 30px; font-weight: 700; text-decoration: none; text-align: center; margin: 16px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #667085; border-top: 1px solid #f3f4f6; }
            .warning { font-size: 12px; color: #667085; line-height: 1.5; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BetterMe</h1>
              <p>Habit & Personal Growth Companion</p>
            </div>
            <div class="body">
              <h2 style="font-size: 18px; margin-top: 0;">Dib u dajinta Furaha Sirta / Reset Your Password</h2>
              <p>Ku soo dhowaw <strong>${userName || "User"}</strong>,</p>
              <p>Waxaan helnay codsi lagu doonayo in dib loo dejiyo furahaaga sirta ah ee BetterMe. Isticmaal koodhka hoose si aad u xaqiijiso:</p>
              
              <div class="code-box">
                <span style="display:block; font-size: 12px; font-weight: 600; color: #667085; margin-bottom: 6px; text-transform: uppercase;">Xaqiijinta Koodhka / Verification Code</span>
                <span class="code">${resetCode}</span>
              </div>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">Dib u Daji Furaha Sirta</a>
              </div>

              <p class="warning">
                Haddii aadan adigu codsan dib u dajintan, fadlan iska indho-tir email-kan. Koodhkani waxa uu dhacayaa 15 daqiiqo gudahood.<br/>
                <em>If you didn't request a password reset, you can safely ignore this email. This code expires in 15 minutes.</em>
              </p>
            </div>
            <div class="footer">
              Salama Hub &bull; BetterMe Application &bull; Secured with Resend
            </div>
          </div>
        </body>
      </html>
    `;

    // Attempt through official resend client
    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [toEmail],
      subject: `BetterMe - Furahaaga Sirta / Password Reset Code: ${resetCode}`,
      html: htmlContent,
    });

    if (error) {
      console.warn("Resend client error, falling back to direct API fetch:", error);
      // Fallback direct HTTP fetch
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [toEmail],
          subject: `BetterMe - Furahaaga Sirta / Password Reset Code: ${resetCode}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend API failed with status ${res.status}`);
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
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f3f2; margin: 0; padding: 24px; color: #101010; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0B6EF3 0%, #0958c7 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
            .body { padding: 32px 28px; }
            .code-box { background: #EFF6FF; border: 2px dashed #0B6EF3; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .code { font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #0B6EF3; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #667085; border-top: 1px solid #f3f4f6; }
            .warning { font-size: 12px; color: #667085; line-height: 1.5; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 BetterMe Admin</h1>
              <p>Two-Factor Authentication Code</p>
            </div>
            <div class="body">
              <h2 style="font-size: 18px; margin-top: 0;">Admin Sign-In Verification</h2>
              <p>Hello <strong>${userName || "Admin"}</strong>,</p>
              <p>Someone (hopefully you!) is signing into your <strong>BetterMe Admin</strong> account. Enter this code to complete the sign-in:</p>
              
              <div class="code-box">
                <span style="display:block; font-size: 12px; font-weight: 600; color: #667085; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px;">Your 2FA Code</span>
                <span class="code">${code}</span>
              </div>

              <p class="warning">
                ⚠️ This code expires in <strong>10 minutes</strong>. If you did not attempt to sign in, please immediately change your password and contact support.<br/>
                <em>This is a security-sensitive code — never share it with anyone.</em>
              </p>
            </div>
            <div class="footer">
              BetterMe · Admin Security · Powered by Resend
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [toEmail],
      subject: `BetterMe Admin - 2FA Code: ${code}`,
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
          subject: `BetterMe Admin - 2FA Code: ${code}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend API failed with status ${res.status}`);
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
