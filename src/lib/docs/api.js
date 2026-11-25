import { table, bullets, h, code, frontmatter } from '../md.js';

export function api(spec) {
  const d = spec.domain;
  return [
    frontmatter({ dokumen: 'api-spec', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Spesifikasi API — ${spec.name}`),
    '',
    h(2, '1. Konvensi'),
    '',
    bullets([
      'Basis URL: `/api/v1`. Versi dijalur, bukan di header.',
      'Format: JSON (`application/json; charset=utf-8`). Nama field `snake_case`.',
      'Autentikasi: cookie sesi untuk web; header `Authorization: Bearer <token>` untuk integrasi.',
      'Waktu dalam ISO 8601 UTC. Uang dalam integer satuan terkecil disertai kode mata uang.',
      'Paginasi berbasis kursor: `?limit=20&cursor=<opaque>`, balasan memuat `next_cursor`.',
      'Semua mutasi menerima header `Idempotency-Key` dan mengembalikan hasil yang sama untuk kunci yang sama.',
      'Galat memakai format seragam (lihat bagian 4).'
    ]),
    '',
    h(2, '2. Daftar endpoint'),
    '',
    table(['Metode', 'Jalur', 'Keterangan'], d.endpoints),
    '',
    h(2, '3. Contoh permintaan & balasan'),
    '',
    ...d.endpoints.slice(0, 3).flatMap(([m, p, desc]) => [
      h(3, `${m} ${p}`),
      '',
      desc,
      '',
      code('http', `${m} ${p} HTTP/1.1
Host: api.${spec.slug}.example
Content-Type: application/json
${spec.hasAuth ? 'Authorization: Bearer <token>' : 'X-Anon-Id: <uuid>'}`),
      '',
      code('json', exampleResponse(m, p, spec)),
      ''
    ]),
    '',
    h(2, '4. Format galat'),
    '',
    code('json', `{
  "error": {
    "code": "validation_failed",
    "message": "Beberapa field belum sesuai.",
    "fields": { "email": "Format email tidak dikenal." },
    "request_id": "req_01HX..."
  }
}`),
    '',
    table(
      ['Kode HTTP', 'code', 'Kapan'],
      [
        ['400', 'validation_failed', 'Bentuk permintaan tidak sesuai skema'],
        ['401', 'unauthenticated', 'Sesi tidak ada atau kedaluwarsa'],
        ['403', 'forbidden', 'Peran tidak mengizinkan aksi ini'],
        ['404', 'not_found', 'Sumber daya tidak ada atau bukan milik pengguna'],
        ['409', 'conflict', 'Status bertentangan, misal transisi tidak sah'],
        ['422', 'rule_violation', 'Aturan bisnis menolak, misal stok kurang'],
        ['429', 'rate_limited', 'Terlalu banyak permintaan; sertakan `Retry-After`'],
        ['500', 'internal_error', 'Kesalahan tak terduga; sertakan `request_id`']
      ]
    ),
    '',
    h(2, '5. Batas laju'),
    '',
    table(
      ['Kelompok', 'Batas', 'Jendela'],
      [
        ['Autentikasi', '10 permintaan', 'per 15 menit per IP'],
        ['Baca umum', '120 permintaan', 'per menit per pengguna'],
        ['Tulis', '30 permintaan', 'per menit per pengguna'],
        ['Unggah berkas', '10 permintaan', 'per menit per pengguna']
      ]
    ),
    '',
    h(2, '6. Webhook keluar'),
    '',
    bullets([
      'Ditandatangani dengan `X-Signature: sha256=<hmac>` atas badan permintaan mentah.',
      'Penerima wajib membalas 2xx dalam 10 detik; selain itu dicoba ulang dengan backoff (1m, 5m, 30m, 2j, 6j).',
      'Setiap kejadian memiliki `id` unik agar penerima dapat mengabaikan duplikat.',
      'Kejadian yang dikirim: `created`, `updated`, `status_changed`, `deleted`.'
    ]),
    '',
    h(2, '7. Perubahan yang merusak'),
    '',
    bullets([
      'Field baru boleh ditambahkan kapan saja; klien harus mengabaikan field tak dikenal.',
      'Field tidak dihapus tanpa satu versi peralihan dan pemberitahuan 90 hari.',
      'Arti field tidak diubah diam-diam; buat field baru dengan nama berbeda.',
      'Versi baru hanya dibuat untuk perubahan besar, bukan untuk penambahan.'
    ]),
    ''
  ].join('\n');
}

function exampleResponse(method, path, spec) {
  const resource = path.replace(/^\//, '').split('/')[0].replace(/[{}]/g, '') || 'items';
  const single = /\/\{id\}|\/\{slug\}|\/me\b/.test(path);
  if (method === 'GET') {
    if (!single) {
      return `{
  "data": [
    { "id": "01HX3K9...", "judul": "Contoh pertama", "status": "draf", "created_at": "${spec.generatedAtISO}T09:12:00Z" },
    { "id": "01HX3KA...", "judul": "Contoh kedua", "status": "aktif", "created_at": "${spec.generatedAtISO}T10:04:00Z" }
  ],
  "next_cursor": "eyJpZCI6IjAxSFgzS0EuLi4ifQ"
}`;
    }
    return `{
  "data": {
    "id": "01HX3K9...",
    "judul": "Contoh pertama",
    "status": "aktif",
    "pemilik": { "id": "usr_01HX...", "nama": "Rani" },
    "created_at": "${spec.generatedAtISO}T09:12:00Z",
    "updated_at": "${spec.generatedAtISO}T09:20:00Z"
  }
}`;
  }
  if (method === 'POST') {
    return `{
  "data": { "id": "01HX3KB...", "status": "dibuat" },
  "request_id": "req_01HX3KC..."
}`;
  }
  return `{
  "data": { "id": "01HX3K9...", "status": "diperbarui", "updated_at": "${spec.generatedAtISO}T10:30:00Z" }
}`;
}
