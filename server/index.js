/**
 * Titik masuk server produksi:
 * - menyajikan hasil build statis dari dist/
 * - API akun & riwayat dokumen
 * - penanganan galat seragam, header keamanan, tanpa dependensi tambahan
 */
import express from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import cookieParser from './lib/cookies.js';
import { config, assertConfig } from './config.js';
import { getDb, closeDb } from './db.js';
import { authRouter, resetAttempts } from './auth.js';
import { docsRouter } from './documents.js';
import { COOKIE_NAME, readSession, pruneSessions } from './session.js';

assertConfig();

const app = express();

if (config.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

/* ---------- Header keamanan ---------- */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data:",
      // Tidak ada gaya inline di halaman; atribut style dihapus demi aturan ini.
      "style-src 'self'",
      "script-src 'self'",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      // Wajibkan Trusted Types: semua penulisan ke DOM harus lewat teks/simpul.
      "require-trusted-types-for 'script'",
      "trusted-types 'none'"
    ].join('; ')
  );
  if (config.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

/* ---------- Sesi: baca cookie sekali per permintaan ---------- */
app.use((req, res, next) => {
  req.user = readSession(req.cookies?.[COOKIE_NAME]);
  next();
});

/* ---------- API ---------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()), version: '1.1.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/documents', docsRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Endpoint tidak ada.' } });
});

/* ---------- Berkas statis + halaman 404 ---------- */
const dist = resolve(config.distDir);
if (!existsSync(join(dist, 'index.html'))) {
  console.warn(`[peringatan] ${dist}/index.html tidak ada. Jalankan "npm run build" dulu.`);
}

app.use(
  express.static(dist, {
    index: 'index.html',
    redirect: true,
    setHeaders(res, path) {
      if (path.includes('/assets/')) {
        // Berkas ber-hash: aman di-cache lama.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  })
);

/* ---------- Halaman 404 untuk alamat yang tidak ada ---------- */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api')) return next();
  res.status(404).sendFile(join(dist, '404.html'), (err) => {
    if (err) res.status(404).type('text/plain; charset=utf-8').send('Halaman tidak ditemukan.');
  });
});

/* ---------- Galat seragam ---------- */
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[galat]', err && err.stack ? err.stack : err);
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({
      error: {
        code: status >= 500 ? 'internal_error' : 'request_failed',
        message: status >= 500 ? 'Terjadi kesalahan di server.' : 'Permintaan tidak dapat diproses.'
      }
    });
  }
  res.status(status).type('text/plain; charset=utf-8').send('Terjadi kesalahan.');
});

/* ---------- Mulai ---------- */
getDb();
pruneSessions();
const prune = setInterval(pruneSessions, 6 * 60 * 60 * 1000);
prune.unref?.();

const server = app.listen(config.port, config.host, () => {
  console.log(`BuildWithAI berjalan di http://${config.host}:${config.port}`);
  console.log(`  mode      : ${config.isProd ? 'produksi' : 'pengembangan'}`);
  console.log(`  basis data: ${config.dbPath}`);
  console.log(`  statis    : ${dist}`);
});

function shutdown(signal) {
  console.log(`\n${signal} diterima, menutup dengan rapi…`);
  clearInterval(prune);
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, server, resetAttempts };
