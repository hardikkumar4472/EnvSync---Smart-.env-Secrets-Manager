const axios = require('axios');

const sendWelcomeEmail = async (email, password) => {
  try {
    const data = {
      sender: { 
        name: "EnvSync Security", 
        email: process.env.EMAIL_FROM || "admin@envsync.com" 
      },
      to: [{ email: email }],
      subject: "Your EnvSync Account Credentials",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6d28d9; text-align: center;">Welcome to EnvSync</h2>
          <p>Hello,</p>
          <p>Your account has been created by the administrator. You can now login to the EnvSync platform using the following credentials:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in and change your password as soon as possible for better security.</p>
          <p>Regards,<br>EnvSync Team</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
          <p style="font-size: 10px; color: #999; text-align: center;">This is an automated email. Please do not reply.</p>
        </div>
      `
    };

    await axios.post('https://api.brevo.com/v3/smtp/email', data, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Welcome email sent via Brevo API to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email via Brevo API:", error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
