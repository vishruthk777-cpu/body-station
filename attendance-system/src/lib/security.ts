import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production_32b'; 
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a member UID into a secure token for the QR code
 */
export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substr(0, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return iv + encrypted data as hex
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a secure token back into a member UID
 */
export function decryptToken(text: string): string | null {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substr(0, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Token decryption failed:", error);
    return null;
  }
}
