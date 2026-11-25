import { table, bullets, h, code, frontmatter } from '../md.js';

const NUMERIC = /^(harga|harga_saat_itu|jumlah|qty|total|subtotal|ongkir|stok|rating|rating_rata|saldo_awal|kuota|durasi_menit|durasi_jam|urutan|nilai|nilai_maks|batas_jumlah|kapasitas_harian|baris_total|baris_cocok|sisa|denda|diskon|poin)$/;
const OPTIONAL_TIME = /^(updated_at|paid_at|selesai_at|accepted_at|revoked_at|dinilai_at|ditebus_at|finalized_at|dibaca_at|terbit_at|locked_at|published_at|cancelled_at|selesai|ditebus_at|kedaluwarsa|periode_berakhir)$/;
const ENUMISH = /^(status|peran|tipe|jenis|arah|level|paket|format|metode|visibilitas|prioritas)$/;

function colType(tbl, col, note) {
  if (col === 'id') return { sql: 'uuid primary key default gen_random_uuid()', check: null };
  if (col === 'created_at') return { sql: 'timestamptz not null default now()', check: null };
  if (col.endsWith('_id') || col === 'parent_id') return { sql: 'uuid' + (OPTIONAL_TIME.test(col) ? '' : ' not null'), check: null };

  if (OPTIONAL_TIME.test(col)) return { sql: 'timestamptz', check: null };
  if (/^(mulai|selesai|terjadi_pada|due_date|periode|tanggal|kontak_darurat)$/.test(col)) {
    if (col === 'periode') return { sql: 'date not null', check: null };
    if (col === 'kontak_darurat' || col === 'tanggal') return { sql: 'text', check: null };
    return { sql: 'timestamptz not null', check: null };
  }
  if (/at$|_pada$/.test(col)) return { sql: 'timestamptz not null', check: null };

  if (NUMERIC.test(col)) return { sql: 'integer not null', check: null };
  if (/^is_|^has_|^(aktif|terverifikasi)$/.test(col)) return { sql: 'boolean not null default false', check: null };
  if (col === 'konten' && tbl === 'lessons') return { sql: 'text', check: null };
  if (col === 'koordinat') return { sql: 'point', check: null };

  // Enum dari catatan seperti (buyer|seller|admin)
  const opts = note && note.match(/\(([a-z_|]+)\)/);
  if (opts && opts[1].includes('|')) {
    const list = opts[1].split('|').filter(Boolean);
    const lit = list.map((v) => `'${v.replace(/[^a-z0-9_]/gi, '')}'`).join(', ');
    return { sql: 'text not null', check: `check (${col} in (${lit}))` };
  }
  if (ENUMISH.test(col)) return { sql: 'text not null', check: null };

  return { sql: 'text not null', check: null };
}

function ddl(spec) {
  const d = spec.domain;
  return d.entities
    .map(([name, cols]) => {
      const parsed = cols
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const body = [];
      const checks = [];
      for (const raw of parsed) {
        const m = raw.match(/^([a-z_]+)\s*(?:\(([^)]*)\))?/i);
        if (!m) continue;
        const col = m[1];
        const note = m[2] || '';
        const t = colType(name, col, note);
        body.push(`  ${col} ${t.sql}`);
        if (t.check) checks.push(`  ${t.check}`);
      }
      return `create table ${name} (\n${[...body, ...checks].join(',\n')}\n);`;
    })
    .join('\n\n');
}

/** Tebak tabel tujuan dari nama kolom kunci asing, misal product_id -> products. */
function targetFor(fk, byName) {
  const base = fk.replace(/_id$/, '');
  const tries = [base, `${base}s`, `${base}es`];
  const irregular = {
    buyer: ['users'], user: ['users'], owner: ['users'], pemilik: ['users'], author: ['users'],
    actor: ['users'], reporter: ['users'], moderator: ['users'], follower: ['users'], following: ['users'],
    parent: ['comments'], topic: ['topics'], topik: ['topics'], variant: ['product_variants'],
    activity: ['activity_log'], warehouse: ['warehouses'], item: ['items'], petugas: ['field_agents'],
    doctor: ['doctors'], patient: ['patients'], schedule: ['schedules'], enrollment: ['enrollments'],
    module: ['modules'], course: ['courses'], lesson: ['lessons'], assignment: ['assignments'],
    appointment: ['appointments'], consultation: ['consultations'], prescription: ['prescriptions'],
    workspace: ['workspaces'], account: ['accounts'], category: ['categories'], request: ['service_requests'],
    cart: ['carts'], order: ['orders'], product: ['products'], seller: ['sellers'], post: ['posts'],
    plan: ['plans']
  };
  const cands = [...(irregular[base] || []), ...tries];
  return cands.find((c) => byName.has(c)) || null;
}

function relations(spec) {
  const byName = new Map(spec.domain.entities.map(([n]) => [n, n]));
  const out = [];
  for (const [t, c] of spec.domain.entities) {
    const cols = c.split(',').map((x) => x.trim().split(/\s+/)[0]);
    for (const col of cols) {
      if (!col.endsWith('_id') || col === 'id') continue;
      const target = targetFor(col, byName);
      if (target && target !== t) out.push(`${t}.${col} ──▶ ${target}.id`);
    }
  }
  return out.length ? [...new Set(out)].join('\n') : 'Belum ada kunci asing pada skema awal.';
}

export function database(spec) {
  const d = spec.domain;
  const rows = d.entities;

  return [
    frontmatter({ dokumen: 'database', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Skema Basis Data — ${spec.name}`),
    '',
    `> ${rows.length} tabel inti. Semua tabel memiliki \`id uuid primary key default gen_random_uuid()\` dan \`created_at timestamptz not null default now()\`; kolom waktu yang baru terisi belakangan dibiarkan boleh kosong.`,
    '',
    h(2, '1. Daftar tabel'),
    '',
    table(['Tabel', 'Kolom utama'], rows),
    '',
    h(2, '2. DDL'),
    '',
    code('sql', ddl(spec)),
    '',
    h(2, '3. Hubungan'),
    '',
    code('text', relations(spec)),
    '',
    h(2, '4. Aturan integritas'),
    '',
    bullets([
      'Semua kunci asing memakai `on delete restrict` kecuali dinyatakan lain; penghapusan berantai harus disengaja.',
      'Kolom status memakai pemeriksaan `check` dengan daftar nilai yang sah, bukan teks bebas.',
      'Nominal uang dan jumlah stok disimpan sebagai integer, bukan pecahan.',
      'Setiap tabel yang menyimpan data per pengguna memiliki indeks pada kolom kepemilikan.',
      'Tabel yang sering disaring berdasar waktu memakai indeks komposit (pemilik, waktu).',
      'Kolom boleh kosong hanya untuk nilai yang memang belum ada saat baris dibuat.'
    ]),
    '',
    h(2, '5. Indeks awal'),
    '',
    table(
      ['Tabel', 'Indeks', 'Kueri yang dilayani'],
      rows.slice(0, 6).map(([t]) => [t, `idx_${t}_owner_created`, 'Daftar milik satu pemilik terurut waktu, dengan paginasi kursor'])
    ),
    '',
    h(2, '6. Migrasi'),
    '',
    bullets([
      'Satu berkas migrasi per perubahan, bernomor dan tidak pernah diubah setelah digabung.',
      'Perubahan yang merusak (hapus kolom) dilakukan dua tahap: berhenti memakai, lalu hapus.',
      'Setiap migrasi punya jalur balik yang diuji di salinan basis data.',
      'Data contoh hanya masuk lewat skrip seed, tidak lewat migrasi.'
    ]),
    ''
  ].join('\n');
}
