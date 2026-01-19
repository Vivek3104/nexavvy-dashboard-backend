const crypto = require('crypto');
const config = require('../config/config');

// Encryption algorithm
const algorithm = 'aes-256-cbc';
const key = Buffer.from(config.encryptionKey || 'nexavvy-encryption-key-32-chars', 'utf8').slice(0, 32);

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV
 */
const encrypt = (text) => {
    if (!text) return '';

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV
 * @returns {string} - Decrypted text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return '';

    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = {
    encrypt,
    decrypt,
};
