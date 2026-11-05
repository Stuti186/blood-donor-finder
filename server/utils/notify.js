import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendEmail(to, subject, text) {
  if (!transporter) return console.log(`[EMAIL -> ${to}] ${subject}\n${text}\n`);
  try { await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text }); }
  catch (e) { console.error("Email failed:", e.message); }
}

export async function sendSMS(phone, message) {
  if (!process.env.FAST2SMS_KEY) return console.log(`[SMS -> ${phone}] ${message}`);
  try {
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: process.env.FAST2SMS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "q", message, numbers: phone }),
    });
  } catch (e) { console.error("SMS failed:", e.message); }
}
