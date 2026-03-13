const nodemailer = require("nodemailer");

const getSmtpConfig = () => {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false") === "true";

  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  const missing = [];
  if (!smtpUser) missing.push("SMTP_USER");
  if (!smtpPass) missing.push("SMTP_PASS");

  if (missing.length) {
    const message = `Missing SMTP credentials: ${missing.join(", ")}`;
    console.error("[Mailer]", message);
    throw new Error(message);
  }

  return { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass };
};

const sendOtpEmail = async ({ to, otp }) => {
  try {
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = getSmtpConfig();

    const appName = process.env.APP_NAME || "Company Umbrella";
    const from = (process.env.SMTP_FROM || smtpUser).trim();

    if (!from) {
      throw new Error("SMTP_FROM or SMTP_USER must be defined");
    }

    console.log("📧 Preparing to send OTP email...");
    console.log("➡️ Sending OTP to:", to);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log("✅ SMTP server connection successful");

    const mailOptions = {
      from,
      to,
      subject: `${appName} Login OTP`,
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
          <h2>${appName} Login Verification</h2>
          <p>Your One Time Password (OTP) is:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:4px;margin:20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in <b>5 minutes</b>.</p>
          <p>If you did not request this login, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP Email sent successfully");
    console.log("📨 Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ OTP email sending failed:", error.message);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};