const config = require('../config/config');

/**
 * Send OTP via WhatsApp
 */
const sendOTPWhatsApp = async (mobile, otp, name = 'User') => {
    try {
        // For development or if Twilio not configured, just log
        console.log('\n📱 ========== WHATSAPP OTP ==========');
        console.log(`To: ${mobile}`);
        console.log(`Name: ${name}`);
        console.log(`OTP: ${otp}`);
        console.log('=====================================\n');

        if (config.nodeEnv === 'development' || !config.twilioAccountSid) {
            return { success: true, message: 'OTP logged to console (dev mode)' };
        }

        // TODO: Implement Twilio WhatsApp API
        // const twilio = require('twilio');
        // const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

        // const message = await client.messages.create({
        //   from: config.twilioWhatsAppNumber,
        //   to: `whatsapp:${mobile}`,
        //   body: `Hello ${name}! Your Nexavvy OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`
        // });

        return { success: true, message: 'WhatsApp service not configured, OTP logged to console' };
    } catch (error) {
        console.error('WhatsApp send error:', error);
        console.log('\n📱 WHATSAPP OTP (fallback):', { mobile, otp, name });
        return { success: false, message: 'WhatsApp service unavailable, OTP logged to console' };
    }
};

module.exports = {
    sendOTPWhatsApp,
};
