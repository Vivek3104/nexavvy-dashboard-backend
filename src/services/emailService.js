const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost || 'smtp.gmail.com',
  port: config.smtpPort || 587,
  secure: false,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

/**
 * Send OTP via email
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    // For development, just log the OTP
    if (config.nodeEnv === 'development' || !config.smtpUser) {
      console.log('\n📧 ========== EMAIL OTP ==========');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`OTP: ${otp}`);
      console.log('==================================\n');
      return { success: true, message: 'OTP logged to console (dev mode)' };
    }

    const mailOptions = {
      from: `"Nexavvy NBP" <${config.smtpUser}>`,
      to: email,
      subject: 'Your Nexavvy OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #00BCD4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #00BCD4; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FT Nexavvy</h1>
              <p>NBP Dashboard</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your One-Time Password (OTP) for verification is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              <p>If you didn't request this OTP, please ignore this email.</p>
              <div class="footer">
                <p>© 2024 FT Nexavvy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent to email' };
  } catch (error) {
    console.error('Email send error:', error);
    console.log('\n📧 EMAIL OTP (fallback):', { email, otp, name });
    return {
      success: false,
      message: 'Email service unavailable, OTP logged to console',
    };
  }
};

module.exports = {
  sendOTPEmail,
};
