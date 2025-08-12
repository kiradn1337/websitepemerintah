const CryptoJS = require('crypto-js');

// Encrypt data with AES
const encryptData = (data) => {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data with AES
const decryptData = (encryptedData) => {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

module.exports = {
  encryptData,
  decryptData
};
