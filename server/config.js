/**
 * Konfigurasi terpusat. Semua rahasia dari variabel lingkungan;
 * nilai bawaan hanya untuk pengembangan lokal.
 */
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

const isProd = process.env.NODE_ENV === 'production';

function required(name, fallback) {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (isProd && !fallback) {
    console.error(`\n[FATAL] Variabel lingkungan ${name} wajib diisi di produksi.`);
    console.error('        Lihat .env.example atau README.md bagian Deploy.\n');
    process.exit(1);
  }
  if (!isProd) console.warn(`[peringatan] ${name} belum diisi, memakai nilai pengembangan.`);
  return fallback;
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',

  // Kunci untuk menandatangani cookie sesi. Wajib di produksi.
  sessionSecret: required('SESSION_SECRET', isProd ? null : randomBytes(32).toString('hex')),

  // Lokasi basis data. Di produksi taruh di luar folder rilis.
  dbPath: resolve(process.env.DB_PATH || './data/buildwithai.db'),

  // Folder hasil build frontend.
  distDir: resolve(process.env.DIST_DIR || './dist'),

  // Umur sesi (hari).
  sessionDays: Number(process.env.SESSION_DAYS || 30),

  // Batas percobaan login per IP + email.
  loginMaxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS || 8),
  loginWindowMs: Number(process.env.LOGIN_WINDOW_MS || 15 * 60 * 1000),

  // Bila di belakang reverse proxy (nginx/Caddy), percayai header X-Forwarded-*.
  trustProxy: process.env.TRUST_PROXY === '1' || isProd,

  // Wajib HTTPS pada cookie. Matikan hanya untuk uji lokal.
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === '1' : isProd
};

export function assertConfig() {
  if (config.sessionSecret.length < 32) {
    console.error('[FATAL] SESSION_SECRET minimal 32 karakter.');
    process.exit(1);
  }
  if (!Number.isFinite(config.port) || config.port <= 0) {
    console.error('[FATAL] PORT tidak valid.');
    process.exit(1);
  }
}
