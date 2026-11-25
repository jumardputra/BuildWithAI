import { table, bullets, numbered, h, code, frontmatter } from '../md.js';

export function architecture(spec) {
  const d = spec.domain;
  const stack = ['PostgreSQL', 'satu layanan API', 'satu aplikasi web', 'penyimpanan objek untuk berkas', 'antrean tugas untuk pekerjaan lambat'];

  return [
    frontmatter({
      dokumen: 'architecture',
      produk: spec.name,
      versi: spec.version,
      diperbarui: spec.generatedAtISO
    }),
    '',
    h(1, `Arsitektur — ${spec.name}`),
    '',
    h(2, '1. Ringkasan keputusan'),
    '',
    bullets([
      '**Monolit modular**, bukan mikroservis: satu basis kode, batas modul ditegakkan lewat folder dan aturan impor.',
      '**Satu basis data relasional** sebagai sumber kebenaran; tidak ada penyimpanan status ganda.',
      '**Rendering sisi server untuk halaman data**, dengan peningkatan progresif; JavaScript hanya untuk interaksi.',
      '**Tugas latar** lewat antrean untuk pekerjaan yang tidak harus selesai dalam satu permintaan.',
      '**Berkas di penyimpanan objek**, basis data hanya menyimpan kunci dan metadata.'
    ]),
    '',
    h(2, '2. Diagram komponen'),
    '',
    code('text', [
      'Pengguna',
      '   │ HTTPS',
      '   ▼',
      '┌─────────────────────┐      ┌──────────────────┐',
      '│ Aplikasi web (SSR)  │─────▶│ Layanan API      │',
      '│ + aset statis       │      │ (logika domain)  │',
      '└─────────────────────┘      └────────┬─────────┘',
      '                                      │',
      '            ┌─────────────────────────┼──────────────────────┐',
      '            ▼                         ▼                      ▼',
      '   ┌────────────────┐        ┌────────────────┐      ┌───────────────┐',
      '   │ PostgreSQL     │        │ Penyimpanan    │      │ Antrean tugas │',
      '   │ (sumber benar) │        │ objek (berkas) │      │ + pekerja     │',
      '   └────────────────┘        └────────────────┘      └───────────────┘'
    ].join('\n')),
    '',
    h(2, '3. Tumpukan teknologi'),
    '',
    table(
      ['Lapisan', 'Pilihan', 'Alasan'],
      [
        ['Bahasa', 'TypeScript di seluruh lapisan', 'Tipe bersama antara API dan UI; galat tertangkap saat kompilasi.'],
        ['Kerangka web', 'Satu kerangka SSR dengan rute berbasis berkas', 'Halaman data cepat dan dapat dirayapi mesin pencari.'],
        ['Basis data', stack[0], 'Transaksi ACID untuk stok, pesanan, dan pembayaran.'],
        ['Migrasi', 'Migrasi berversi di repositori', 'Perubahan skema dapat ditinjau dan dibalik.'],
        ['Antrean', 'Antrean di atas basis data, pekerja terpisah', 'Cukup untuk volume awal; tanpa layanan tambahan.'],
        ['Berkas', stack[3], 'URL bertanda tangan berumur pendek.'],
        ['Observabilitas', 'Log terstruktur, metrik permintaan, jejak galat', 'Satu tempat untuk melihat kesehatan sistem.']
      ]
    ),
    '',
    h(2, '4. Batas modul'),
    '',
    table(
      ['Modul', 'Tanggung jawab', 'Tidak boleh'],
      d.entities.slice(0, 6).map(([t]) => [
        t,
        `Mengelola siklus hidup data \`${t}\` dan aturannya`,
        'Memanggil UI atau mengirim email langsung'
      ])
    ),
    '',
    h(2, '5. Alur permintaan'),
    '',
    numbered([
      'Permintaan masuk melewati lapisan transport: validasi bentuk, batas laju, sesi.',
      'Lapisan aplikasi memuat konteks (pengguna, izin, ruang kerja).',
      'Modul domain menjalankan aturan bisnis di dalam satu transaksi basis data.',
      'Perubahan status menuliskan entri audit dan menaruh pesan di antrean.',
      'Respons mengembalikan representasi yang sudah diformat, lalu tampilan di-cache sebentar.',
      'Pekerja di latar mengambil pesan: email, ekspor, pengingat.'
    ]),
    '',
    h(2, '6. Strategi data'),
    '',
    bullets([
      'Setiap tabel memiliki `id` (UUID), `created_at`, dan bila dapat berubah `updated_at`.',
      'Penghapusan lunak untuk entitas yang dirujuk orang lain; permanen untuk data pribadi atas permintaan.',
      'Indeks dibuat setelah melihat pola kueri nyata, bukan di awal secara spekulatif.',
      'Batas transaksi: satu unit kerja = satu transaksi, tanpa panggilan jaringan di dalamnya.',
      'Kuncian baris dipakai untuk sumber daya dengan persaingan tinggi.'
    ]),
    '',
    h(2, '7. Kinerja & skala'),
    '',
    table(
      ['Sasaran', 'Angka', 'Cara mencapainya'],
      [
        ['P95 respons API', '< 300 ms', 'Indeks yang tepat, tanpa kueri N+1, cache pendek untuk daftar.'],
        ['LCP halaman', '< 2,5 s di 4G', 'SSR, aset terkompresi, font terbatas dua keluarga.'],
        ['Beban awal', '1.000 pengguna aktif harian', 'Satu instans aplikasi + 1 pekerja cukup.'],
        ['Ukuran basis data', '< 20 GB tahun pertama', 'Arsip berkas besar ke penyimpanan objek.']
      ]
    ),
    '',
    h(2, '8. Keamanan'),
    '',
    bullets([
      'Sesi memakai cookie `HttpOnly`, `Secure`, `SameSite=Lax`; token acak disimpan sebagai hash.',
      'Otorisasi diperiksa di server pada setiap mutasi, bukan hanya menyembunyikan tombol.',
      'Rahasia dari variabel lingkungan; tidak ada kunci di repositori.',
      'Batas laju per akun dan per IP pada endpoint autentikasi dan tulis.',
      'Semua masukan divalidasi pada batas sistem dengan skema yang sama di klien dan server.',
      'Log tidak mencatat data sensitif; ID pelanggan dipakai sebagai ganti isi.'
    ]),
    '',
    h(2, '9. Ketahanan & pemulihan'),
    '',
    table(
      ['Skenario', 'Perilaku', 'Pemulihan'],
      [
        ['Basis data tidak tersedia', 'Halaman baca dari cache singkat; mutasi gagal dengan pesan jelas', 'Kembalikan cadangan terakhir, target RPO 15 menit'],
        ['Pekerja berhenti', 'Pesan tetap di antrean', 'Mulai ulang pekerja; pesan diproses idempoten'],
        ['Kesalahan rilis', 'Rilis sebelumnya tetap dapat dijalankan', 'Balik ke versi sebelumnya dalam < 5 menit'],
        ['Penyimpanan objek lambat', 'Unggahan antre, status tertunda', 'Coba ulang dengan backoff eksponensial']
      ]
    ),
    '',
    h(2, '10. Struktur repositori'),
    '',
    code('text', [
      `${spec.slug}/`,
      '├─ apps/',
      '│  ├─ web/          # rute, tampilan, komponen',
      '│  └─ worker/       # pekerja antrean',
      '├─ packages/',
      '│  ├─ domain/       # entitas, aturan, tipe',
      '│  ├─ db/           # skema, migrasi, seed',
      '│  └─ ui/           # komponen desain',
      '├─ docs/            # dokumen ini dan sejenisnya',
      '└─ infra/           # konfigurasi penyebaran'
    ].join('\n')),
    '',
    h(2, '11. Keputusan yang ditunda'),
    '',
    bullets([
      'Pemisahan layanan bila satu modul perlu skala berbeda (ukur dulu, jangan menebak).',
      'Cache terdistribusi di depan API; saat ini cache dalam memori cukup.',
      'Pencarian penuh di luar basis data bila kueri teks menjadi mahal.',
      'Multi-region; belum perlu sebelum ada pengguna di luar satu wilayah.'
    ]),
    ''
  ].join('\n');
}
