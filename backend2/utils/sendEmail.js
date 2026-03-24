const nodemailer = require("nodemailer");

const SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const transporterOptions = {
  pool: true,
  maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
  maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
};

if (SMTP_HOST) {
  transporterOptions.host = SMTP_HOST;
  transporterOptions.port = SMTP_PORT;
  transporterOptions.secure = SMTP_SECURE;
} else {
  transporterOptions.service = SMTP_SERVICE;
}

const transporter = nodemailer.createTransport(transporterOptions);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP_USER/SMTP_PASS is missing in environment variables");
    }

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html
    });

    console.log("[Email] Sent:", info.messageId || info.response || "ok");
  } catch (error) {
    console.error("[Email] Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
