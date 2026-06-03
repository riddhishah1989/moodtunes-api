// config/emailService.js
import nodemailer from "nodemailer";

// ── Create transporter ────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
    },
  });
};

// ── Send OTP Email ────────────────────────────────────────────────────────
export const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from:    `"MoodTunes 🎵" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "MoodTunes — Your Password Reset OTP",
    html:    `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#F8F3FD;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;padding:40px;
                         border:1px solid #E0D0EE;">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <div style="width:64px;height:64px;background:#F5EEFF;
                                  border-radius:50%;border:2px solid #6F259C;
                                  display:inline-flex;align-items:center;
                                  justify-content:center;font-size:28px;
                                  line-height:64px;text-align:center;">
                        🎵
                      </div>
                      <h1 style="margin:12px 0 4px;color:#6F259C;
                                 font-size:22px;font-weight:700;">MoodTunes</h1>
                      <p style="margin:0;color:#999999;font-size:13px;">
                        Music that knows how you feel
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="border-top:1px solid #EEE5F5;padding-bottom:24px;"></td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;color:#1A1A1A;font-size:16px;font-weight:600;">
                        Hi ${name || "there"} 👋
                      </p>
                      <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.6;">
                        We received a request to reset your MoodTunes password.
                        Use the OTP below to proceed. This code is valid for
                        <strong>15 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="text-align:center;margin:24px 0;">
                        <div style="display:inline-block;background:#F5EEFF;
                                    border:2px solid #6F259C;border-radius:16px;
                                    padding:20px 48px;">
                          <p style="margin:0;color:#999999;font-size:12px;
                                    letter-spacing:2px;text-transform:uppercase;
                                    margin-bottom:8px;">Your OTP Code</p>
                          <p style="margin:0;color:#6F259C;font-size:42px;
                                    font-weight:700;letter-spacing:12px;">
                            ${otp}
                          </p>
                        </div>
                      </div>

                      <p style="margin:24px 0 0;color:#555555;font-size:14px;line-height:1.6;">
                        If you didn't request a password reset, you can safely
                        ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="border-top:1px solid #EEE5F5;
                               padding-top:24px;padding-bottom:0;margin-top:24px;">
                      <p style="margin:0;color:#999999;font-size:12px;text-align:center;">
                        © 2026 MoodTunes. All rights reserved.<br>
                        This is an automated email — please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── Verify transporter connection ─────────────────────────────────────────
export const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email service connected successfully");
  } catch (err) {
    console.error("❌ Email service connection failed:", err.message);
  }
};
