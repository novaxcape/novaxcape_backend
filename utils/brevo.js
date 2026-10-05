require('dotenv').config();
const { BrevoClient } = require('@getbrevo/brevo');


exports.sendSingleEmail = async (payloads) => {
  try {
    const apikey = process.env.BREVO_API_KEY;
    if (!apikey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const brevo = new BrevoClient({ apiKey: apikey });
    await brevo.transactionalEmails.sendTransacEmail({
      subject: payloads.subject,
      to: [{ email: payloads.email, name: payloads.name }],
      sender: { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL },
      htmlContent: payloads.html
    });
    console.log("Email sent to:", payloads.email);
  } catch (error) {
    const status = error?.response?.status;
    const brevoMessage = error?.response?.data?.message || error.message;
    const emailError = new Error(`Email not sent to ${payloads.email}: ${brevoMessage}`);

    emailError.code = 'BREVO_EMAIL_FAILED';
    emailError.status = status;
    emailError.brevoMessage = brevoMessage;

    console.error('Brevo email failed:', {
      recipient: payloads.email,
      status,
      message: brevoMessage
    });

    throw emailError;
  }
};
