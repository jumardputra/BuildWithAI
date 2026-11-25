/**
 * Sesi berbasis token acak yang disimpan sebagai hash di basis data.
 * Cookie berisi "id.token"; token mentah tidak pernah disimpan.
 */
import { randomBytes, createHash } from 'node:crypto';
import { one, run } from './db.js';
import { config } from './config.js';

export const COOKIE_NAME = 'bwai_session';

function sha256(s) {
  return createHash('sha256').update(s).digest('hex');
}

export function newId() {
  return randomBytes(12).toString('hex');
}

export function createSession(userId, { userAgent, ip } = {}) {
  const id = newId();
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + config.sessionDays * 24 * 60 * 60 * 1000);

  run(
    `insert into sessions (id, user_id, token_hash, user_agent, ip, created_at, expires_at)
     values (?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    sha256(token),
    String(userAgent || '').slice(0, 300),
    String(ip || '').slice(0, 60),
    now.toISOString(),
    expires.toISOString()
  );

  return { cookieValue: `${id}.${token}`, expires };
}

export function readSession(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  const dot = cookieValue.indexOf('.');
  if (dot < 1) return null;
  const id = cookieValue.slice(0, dot);
  const token = cookieValue.slice(dot + 1);
  if (!id || !token) return null;

  const row = one(
    `select s.id, s.user_id, s.expires_at, u.email, u.nama, u.created_at as user_created
       from sessions s join users u on u.id = s.user_id
      where s.id = ? and s.token_hash = ?`,
    id,
    sha256(token)
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    run('delete from sessions where id = ?', id);
    return null;
  }
  return {
    sessionId: row.id,
    userId: row.user_id,
    email: row.email,
    nama: row.nama,
    userCreatedAt: row.user_created
  };
}

export function destroySession(cookieValue) {
  if (!cookieValue) return;
  const id = String(cookieValue).split('.')[0];
  if (id) run('delete from sessions where id = ?', id);
}

export function destroyAllSessionsFor(userId) {
  run('delete from sessions where user_id = ?', userId);
}

/** Bersihkan sesi kedaluwarsa; dipanggil berkala. */
export function pruneSessions() {
  run('delete from sessions where expires_at < ?', new Date().toISOString());
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    path: '/',
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000
  };
}
