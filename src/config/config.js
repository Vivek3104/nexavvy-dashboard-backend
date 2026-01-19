const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexavvy-nbp',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    encryptionKey: process.env.ENCRYPTION_KEY || 'nexavvy-encryption-key-32-chars',

    // Email Service (Nodemailer)
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,

    // WhatsApp Service (Twilio)
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
};
