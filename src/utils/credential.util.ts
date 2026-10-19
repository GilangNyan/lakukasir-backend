import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const ALGORITHM: crypto.CipherGCMTypes = 'aes-256-gcm';

const encryptionPassword =
  process.env.ENCRYPTION_PASSWORD || 'secret-password-user';
const encryptionSalt = process.env.ENCRYPTION_SALT || 'secret-salt-user';

const SECRET_KEY: Buffer = crypto.pbkdf2Sync(
  encryptionPassword,
  encryptionSalt,
  1000,
  32,
  'sha256',
);

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 10);
}

export async function validatePassword(plain: string, hashed: string) {
  return await bcrypt.compare(plain, hashed);
}

/**
 * Mengenkripsi teks biasa menjadi teks tersandi
 * @param text Teks mentah yang akan dienkripsi
 * @returns Combined string (IV:authTag:encryptedData) dalam Hex
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted: string = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag: string = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Mendekripsi string tersandi ke teks biasa
 * @param encryptedData String yang terenkripsi (IV:authTag:encryptedData)
 * @returns Teks asli hasil dekripsi
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted: string = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
