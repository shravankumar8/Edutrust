require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendInstitutionApprovalEmail(
  toEmail,
  institutionName,
  walletAddress
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Institution Approval Notification",
    text: `Dear ${
      institutionName || "Institution Representative"
    },\n\nYour wallet address ${walletAddress} has been approved as an institution in the EduTrust system. You can now log in with admin privileges to manage your institution.\n\nBest regards,\nEduTrust Team`,
    html: `
      <h2>Institution Approval Notification</h2>
      <p>Dear ${institutionName || "Institution Representative"},</p>
      <p>Your wallet address <strong>${walletAddress}</strong> has been approved as an institution in the EduTrust system.</p>
      <p>You can now log in with admin privileges to manage your institution.</p>
      <p>Best regards,<br>EduTrust Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

module.exports = { sendInstitutionApprovalEmail };
