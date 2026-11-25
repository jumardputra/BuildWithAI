# BuildWithAI

Dari **satu kalimat ide** menjadi paket dokumen produk yang lengkap: `prd.md`, `design-system.md`,
`architecture.md`, `database.md`, `api-spec.md`, `user-flows.md`, `roadmap.md`, `tasks.md`,
`metrics.md`, `decisions.md`, dan `README.md`.

Versi ini sudah dilengkapi **akun pengguna (login & register)**, **riwayat dokumen per akun**, dan
berkas deploy untuk VPS. Frontend tetap berupa halaman statis; server Node hanya melayani API akun
dan menyajikan hasil build.

---

## Isi repositori

```
.
├── index.html              halaman utama (penyusun ide)
├── ruang-kerja/index.html  pembaca 11 berkas + unduh ZIP
├── template/index.html     contoh isi tiap berkas
├── panduan/index.html      panduan pemakaian
├── masuk/index.html        login
├── daftar/index.html       register
├── akun/index.html         profil + riwayat dokumen
├── 404.html
├── src/
│   ├── main.js             titik masuk frontend
│   ├── lib/
│   │   ├── analyze.js      membaca kalimat ide -> kategori, nama, platform
│   │   ├── api.js          klien API akun
│   │   ├── auth.js         logika formulir masuk/daftar/akun
│   │   ├── dom.js          pembantu DOM (createElement, tanpa string HTML)
│   │   ├── export.js       ZIP (tanpa dependensi), salin, unduh
│   │   ├── render.js       perender markdown -> simpul DOM
│   │   └── docs/           11 penyusun berkas markdown
│   ├── data/domains/       8 paket pengetahuan domain + umum
│   └── styles/             base, components, layout, forms, utilities
├── server/
│   ├── index.js            Express: API + berkas statis + header keamanan
│   ├── config.js           konfigurasi dari variabel lingkungan
│   ├── db.js               SQLite (node:sqlite bawaan)
│   ├── password.js         scrypt hash & verifikasi
│   ├── session.js          sesi token + cookie bertanda tangan
│   ├── auth.js             POST /api/auth/{register,login,logout}, GET /me
│   ├── documents.js        riwayat dokumen (CRUD, per pengguna)
│   └── lib/cookies.js      pembaca cookie + HMAC
├── deploy/                 nginx, systemd, Docker
├── .env.example
└── vite.config.js
```

---

## Alamat halaman (tanpa ekstensi)

Setiap halaman punya foldernya sendiri, jadi URL-nya bersih dan tidak
memperlihatkan bahasa atau ekstensi berkas:

| Halaman | Alamat |
|---|---|
| Beranda | `/` |
| Ruang kerja | `/ruang-kerja/` |
| Contoh berkas | `/template/` |
| Panduan | `/panduan/` |
| Masuk | `/masuk/` |
| Daftar | `/daftar/` |
| Akun | `/akun/` |

`npm run build` menaruh `index.html` di akar `dist/` dan sisanya sebagai
`dist/<nama>/index.html`, sehingga alamat bersih itu bekerja tanpa aturan
rewrite tambahan — termasuk saat dibuka lewat nginx, Caddy, atau penyedia
static hosting.

---

## Menjalankan di komputer sendiri

Butuh **Node.js 22.5 atau lebih baru** (memakai modul `node:sqlite` bawaan).

```bash
npm install
npm run build          # hasil ke dist/
cp .env.example .env   # lalu isi SESSION_SECRET
npm start              # http://localhost:3000
```

Untuk pengembangan dengan muat-ulang otomatis:

```bash
npm run dev:server     # server API di :3000
npx vite               # frontend di :5173, /api diteruskan ke :3000
```

Variabel lingkungan untuk pengembangan (`.env` dibaca otomatis? **Tidak** — ekspor dulu,
atau jalankan lewat systemd/Docker seperti di contoh deploy):

```bash
export SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
npm start
```

---

## API

| Metode | Jalur | Fungsi |
|---|---|---|
| `GET` | `/api/health` | cek server hidup |
| `POST` | `/api/auth/register` | `{ nama, email, password, setuju }` |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/logout` | hapus sesi |
| `GET` | `/api/auth/me` | pengguna yang sedang masuk |
| `GET` | `/api/documents` | daftar dokumen milik pengguna |
| `POST` | `/api/documents` | `{ idea, title, domainId, folder, fileCount }` |
| `GET` | `/api/documents/:id` | satu dokumen |
| `DELETE` | `/api/documents/:id` | hapus dokumen |

Galat selalu berbentuk:

```json
{ "error": { "code": "validation_failed", "message": "…", "fields": { "email": "…" } } }
```

Kode yang mungkin: `validation_failed`, `email_taken`, `invalid_credentials`, `rate_limited`,
`unauthenticated`, `not_found`, `internal_error`.

---

## Keamanan yang sudah dipasang

**Tidak ada penyusunan HTML dari teks.** Seluruh antarmuka dibangun lewat API DOM
(`createElement` + `textContent`) di `src/lib/dom.js`. Perender markdown pun
mengembalikan simpul DOM, bukan string HTML (`src/lib/render.js`). Tidak ada satu pun
pemakaian `innerHTML`, `outerHTML`, `insertAdjacentHTML`, atau `document.write` di
`src/`. Artinya kalimat ide, judul dokumen, atau isi berkas yang memuat `<script>`
akan muncul sebagai teks biasa, bukan dijalankan.

- **CSP ketat**: `default-src 'self'`, `script-src 'self'`, `style-src 'self'`
  (tanpa `unsafe-inline`), `object-src 'none'`, `base-uri 'none'`,
  `frame-ancestors 'none'`, plus `require-trusted-types-for 'script'`
  sehingga penulisan ke DOM lewat string ditolak peramban.
- **Tanpa gaya inline**: atribut `style=` dihapus dari semua halaman dan diganti
  kelas utilitas di `src/styles/utilities.css`, supaya `style-src 'self'` bisa tegas.
- **Tautan disaring**: `safeHref()` hanya mengizinkan jalur relatif, `http(s)`,
  `mailto:`, dan `tel:`; `javascript:`, `data:`, dan `vbscript:` dibuang.
- **URL tanpa ekstensi**: tidak ada `.html` atau nama bahasa yang terlihat di alamat,
  dan tidak ada `.php`/`.js` yang perlu disembunyikan lewat rewrite.
- Kata sandi di-hash **scrypt** (`N=32768, r=8, p=1`) dengan salt acak per pengguna; perbandingan
  memakai `timingSafeEqual`. Tidak pernah disimpan atau dicatat dalam teks biasa.
- Sesi: token 256-bit acak, yang disimpan hanya **hash SHA-256**-nya. Cookie `HttpOnly`,
  `SameSite=Lax`, `Secure` di produksi.
- Pembatasan percobaan login per IP + email (bawaan 8 kali per 15 menit) → HTTP 429.
- Semua kueri memakai **prepared statement** (tidak ada penyusunan SQL dari input).
- Setiap dokumen selalu difilter dengan `user_id` pemilik sesi.
- Header lain: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`,
  HSTS di produksi.
- Batas ukuran body JSON 64 kB; pesan galat 5xx tidak membocorkan detail ke klien.
- `next=` pada halaman masuk hanya menerima jalur internal (mencegah open redirect).

---

## Deploy ke VPS (Ubuntu 22.04 / 24.04)

Ringkasnya: buat pengguna sistem, salin berkas, build, jalankan sebagai layanan systemd,
lalu pasang nginx sebagai reverse proxy dan HTTPS.

Langkah lengkap ada di **[deploy/README.md](deploy/README.md)**, berkasnya:

- `deploy/buildwithai.service` — unit systemd (auto-start, sandbox ringan)
- `deploy/nginx.conf` — reverse proxy + header + cache aset
- `deploy/vps-setup.sh` — skrip penyiapan awal (node, pengguna, folder)
- `deploy/Dockerfile`, `deploy/docker-compose.yml` — alternatif bila ingin memakai Docker

Setelah terpasang:

```bash
sudo systemctl status buildwithai
curl -s http://127.0.0.1:3000/api/health
```

---

## Mengunggah ke GitHub

Repositori ini sudah punya `.gitignore` yang mengecualikan `node_modules/`, `dist/`, `data/`,
dan `.env`, jadi rahasia dan basis data tidak akan ikut terunggah.

```bash
git init
git add .
git commit -m "BuildWithAI: generator dokumen produk + akun pengguna"
git branch -M main
git remote add origin https://github.com/<akun-anda>/<nama-repo>.git
git push -u origin main
```

Di server, cukup `git clone` repositori yang sama lalu ikuti `deploy/README.md`.

---

## Catatan operasional

- **Backup**: cukup salin berkas SQLite (`DB_PATH`). Untuk konsistensi pakai
  `sqlite3 buildwithai.db ".backup '/backup/buildwithai-$(date +%F).db'"` atau hentikan layanan
  sesaat lalu salin berkasnya.
- **Reset kata sandi**: belum ada email keluar. Untuk sementara, hapus baris pengguna atau
  jalankan skrip kecil yang meng-hash sandi baru:

  ```bash
  node --input-type=module -e "
  import { DatabaseSync } from 'node:sqlite';
  import { hashPassword } from './server/password.js';
  const db = new DatabaseSync(process.env.DB_PATH);
  const hash = await hashPassword('sandiBaru123');
  db.prepare('update users set password_hash = ?, updated_at = ? where email_norm = ?')
    .run(hash, new Date().toISOString(), 'email@contoh.com');
  console.log('kata sandi diperbarui');
  "
  ```
- **Produksi**: `NODE_ENV=production`, `SESSION_SECRET` minimal 32 karakter, `COOKIE_SECURE=1`,
  dan `TRUST_PROXY=1` bila di belakang nginx.

---

## Batasan

Isi dokumen disusun dari templat dan paket pengetahuan domain di peramban, **bukan** hasil
pemanggilan model bahasa. Strukturnya konsisten; angka dan target metrik adalah usulan yang perlu
Anda sesuaikan. Lihat `panduan.html#batasan`.
