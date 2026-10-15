import * as bcrypt from 'bcrypt';

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 10);
}

export async function validatePassword(plain: string, hashed: string) {
  return await bcrypt.compare(plain, hashed);
}
