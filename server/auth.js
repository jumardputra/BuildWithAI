import { Router } from 'express';
import { one, run, all } from './db.js';
import { hashPassword, verifyPassword, passwordProblems } from './password.js';
import {
  COOKIE_NAME,
  createSession,
  readSession,
  destroySession,
  cookieOptions,
  newId
} from './session.js';
import { config } from './config.js';

export const authRouter = Router();

/* ---------- Pembatas percobaan (dalam memori) ---------- */
const attempts = new Map();

function attemptKey(req, email) {
  return `${req.ip}|${String(email || '').toLowerCase()}`;
}

function tooMany(req, email) {
  const k = attemptKey(req, email);
  const rec = attempts.get(k);
  if (!rec) return false;
  if (Date.now() - rec.first > config.loginWindowMs) {
    attempts.delete(k);
    return false;
  }
  return rec.count >= config.loginMaxAttempts;
}

function noteFailure(req, email) {
  const k = attemptKey(req, email);
  const rec = attempts.get(k);
  if (!rec || Date.now() - rec.first > config.loginWindowMs) {
    attempts.set(k, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

function clearFailures(req, email) {
  attempts.delete(attemptKey(req, email));
}

export function resetAttempts() {
  attempts.clear();
}

/* ---------- Validasi ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function normalEmail(e) {
  return String(e || '').trim().toLowerCase();
}

function publicUser(u) {
  return { id: u.id, email: u.email, nama: u.nama, createdAt: u.created_at };
}

function bad(res, fields) {
  return res.status(400).json({ error: { code: 'validation_failed', message: 'Beberapa isian belum sesuai.', fields } });
}

/* ---------- Daftar ---------- */
authRouter.post('/register', async (req, res, next) => {
  try {
    const nama = String(req.body?.nama || '').trim();
    const email = normalEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const setuju = req.body?.setuju;

    const fields = {};
    if (nama.length < 2) fields.nama = 'Nama minimal 2 karakter.';
    if (nama.length > 80) fields.nama = 'Nama maksimal 80 karakter.';
    if (!EMAIL_RE.test(email)) fields.email = 'Format email belum benar.';
    if (email.length > 200) fields.email = 'Email terlalu panjang.';
    const pwProblems = passwordProblems(password);
    if (pwProblems.length) fields.password = pwProblems[0];
    if (setuju !== true) fields.setuju = 'Centang persetujuan dulu.';

    if (Object.keys(fields).length) return bad(res, fields);

    const existing = one('select id from users where email_norm = ?', email);
    if (existing) {
      return res.status(409).json({
        error: { code: 'email_taken', message: 'Email ini sudah terdaftar. Coba masuk.', fields: { email: 'Email sudah dipakai.' } }
      });
    }

    const id = newId();
    const now = new Date().toISOString();
    const hash = await hashPassword(password);

    try {
      run(
        `insert into users (id, email, email_norm, nama, password_hash, created_at, updated_at, last_login_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        id, email, email, nama, hash, now, now, now
      );
    } catch (err) {
      // Balapan dua pendaftaran dengan email sama.
      if (String(err.message || '').includes('UNIQUE')) {
        return res.status(409).json({
          error: { code: 'email_taken', message: 'Email ini sudah terdaftar. Coba masuk.', fields: { email: 'Email sudah dipakai.' } }
        });
      }
      throw err;
    }

    const { cookieValue, expires } = createSession(id, { userAgent: req.get('user-agent'), ip: req.ip });
    res.cookie(COOKIE_NAME, cookieValue, { ...cookieOptions(), expires });
    const u = one('select * from users where id = ?', id);
    res.status(201).json({ user: publicUser(u) });
  } catch (err) {
    next(err);
  }
});

/* ---------- Masuk ---------- */
authRouter.post('/login', async (req, res, next) => {
  try {
    const email = normalEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!EMAIL_RE.test(email) || !password) {
      return bad(res, {
        ...(EMAIL_RE.test(email) ? {} : { email: 'Format email belum benar.' }),
        ...(password ? {} : { password: 'Kata sandi wajib diisi.' })
      });
    }

    if (tooMany(req, email)) {
      return res.status(429).json({
        error: { code: 'rate_limited', message: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.' }
      });
    }

    const u = one('select * from users where email_norm = ?', email);
    const ok = u ? await verifyPassword(password, u.password_hash) : await verifyPassword(password, 'scrypt$32768$8$1$AAAA$AAAA');

    if (!u || !ok) {
      noteFailure(req, email);
      return res.status(401).json({
        error: { code: 'invalid_credentials', message: 'Email atau kata sandi tidak cocok.' }
      });
    }

    clearFailures(req, email);
    run('update users set last_login_at = ? where id = ?', new Date().toISOString(), u.id);

    const { cookieValue, expires } = createSession(u.id, { userAgent: req.get('user-agent'), ip: req.ip });
    res.cookie(COOKIE_NAME, cookieValue, { ...cookieOptions(), expires });
    res.json({ user: publicUser(u) });
  } catch (err) {
    next(err);
  }
});

/* ---------- Keluar ---------- */
authRouter.post('/logout', (req, res) => {
  destroySession(req.cookies?.[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
});

/* ---------- Siapa saya ---------- */
authRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: { code: 'unauthenticated', message: 'Belum masuk.' } });
  res.json({
    user: { id: req.user.userId, email: req.user.email, nama: req.user.nama, createdAt: req.user.userCreatedAt }
  });
});
