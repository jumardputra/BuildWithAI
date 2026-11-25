/**
 * Lapisan basis data memakai node:sqlite bawaan Node (>=22.5).
 * Tanpa dependensi native, tanpa kompilasi, mudah dipindah ke VPS.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

let db;

const SCHEMA = `
create table if not exists users (
  id            text primary key,
  email         text not null unique,
  email_norm    text not null unique,
  nama          text not null,
  password_hash text not null,
  created_at    text not null,
  updated_at    text not null,
  last_login_at text
);

create table if not exists sessions (
  id          text primary key,
  user_id     text not null references users(id) on delete cascade,
  token_hash  text not null unique,
  user_agent  text,
  ip          text,
  created_at  text not null,
  expires_at  text not null
);

create table if not exists documents (
  id         text primary key,
  user_id    text not null references users(id) on delete cascade,
  idea       text not null,
  title      text not null,
  domain_id  text not null,
  folder     text not null,
  file_count integer not null default 0,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_sessions_token on sessions(token_hash);
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_documents_user on documents(user_id, created_at desc);
`;

export function getDb() {
  if (db) return db;
  mkdirSync(dirname(config.dbPath), { recursive: true });
  db = new DatabaseSync(config.dbPath);

  // WAL memberi baca/tulis bersamaan yang jauh lebih baik.
  try {
    db.exec('pragma journal_mode = wal;');
  } catch {
    /* beberapa sistem berkas tidak mendukung WAL */
  }
  db.exec('pragma foreign_keys = on;');
  db.exec('pragma busy_timeout = 5000;');
  db.exec(SCHEMA);
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}

/** Ambil satu baris atau undefined. */
export function one(sql, ...params) {
  return getDb().prepare(sql).get(...params);
}

/** Ambil semua baris. */
export function all(sql, ...params) {
  return getDb().prepare(sql).all(...params);
}

/** Jalankan mutasi. */
export function run(sql, ...params) {
  return getDb().prepare(sql).run(...params);
}
