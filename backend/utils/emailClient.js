const nodemailer = require("nodemailer");

// Setup the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // App Password (not your normal Gmail password)
  },
});

// Generic reusable email sender
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"EduSafe Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${result.response}`);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    return { success: false, error };
  }
};

// Specialized alert email sender
const sendAlertEmail = async (recipients, message, emergencyLevel = "medium") => {
  const subject = `EduSafe Alert: ${emergencyLevel.toUpperCase()} - ${message.substring(
    0,
    30
  )}...`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${
        emergencyLevel === "high"
          ? "#ff4d4d"
          : emergencyLevel === "medium"
          ? "#ffa64d"
          : "#4d94ff"
      };">EduSafe Emergency Alert</h2>
      <p><strong>Level:</strong> ${emergencyLevel.toUpperCase()}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p style="font-size: 12px; color: #888;">
        This is an automated message from EduSafe Disaster Preparedness System.
      </p>
    </div>
  `;

  const results = [];
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, subject, message, html);
    results.push({ recipient: recipient.email, success: result.success });
  }

  return results;
};

module.exports = { sendEmail, sendAlertEmail };
