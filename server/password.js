/**
 * Kata sandi: scrypt dari node:crypto (memory-hard, tanpa dependensi native).
 * Format simpan: scrypt$N$r$p$salt_b64$hash_b64
 * Parameter dinaikkan saat runtime lama; verifikasi tetap kompatibel.
 */
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const N = 2 ** 15; // 32768
const r = 8;
const p = 1;
const KEYLEN = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize('NFKC'), salt, KEYLEN, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, nStr, rStr, pStr, saltB64, hashB64] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const n = Number(nStr), rr = Number(rStr), pp = Number(pStr);
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const key = await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
      N: n, r: rr, p: pp, maxmem: 128 * n * rr * 2
    });
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Aturan minimal kata sandi. */
export function passwordProblems(password) {
  const problems = [];
  const pw = String(password || '');
  if (pw.length < 8) problems.push('Kata sandi minimal 8 karakter.');
  if (pw.length > 200) problems.push('Kata sandi maksimal 200 karakter.');
  if (!/[a-zA-Z]/.test(pw)) problems.push('Sertakan minimal satu huruf.');
  if (!/[0-9]/.test(pw)) problems.push('Sertakan minimal satu angka.');
  const umum = ['password', '12345678', 'qwerty123', 'password1', 'administrator'];
  if (umum.includes(pw.toLowerCase())) problems.push('Kata sandi ini terlalu umum, pilih yang lain.');
  return problems;
}
