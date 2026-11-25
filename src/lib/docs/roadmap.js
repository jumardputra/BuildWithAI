import { table, bullets, checkboxes, h, frontmatter } from '../md.js';

export function roadmap(spec) {
  return [
    frontmatter({ dokumen: 'roadmap', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Roadmap — ${spec.name}`),
    '',
    '> Rentang waktu relatif terhadap awal pengerjaan. Setiap fase harus menghasilkan sesuatu yang bisa dipakai, bukan hanya lapisan teknis.',
    '',
    h(2, 'Fase 0 — Fondasi (minggu 1–2)'),
    '',
    table(
      ['Hasil', 'Kriteria selesai'],
      [
        ['Repositori, lingkungan, dan saluran penyebaran', 'Satu perintah menjalankan seluruh sistem di mesin baru'],
        ['Skema basis data awal + migrasi', 'Migrasi naik dan turun berjalan di salinan basis data'],
        ['Autentikasi dasar', 'Daftar, masuk, keluar, sesi bertahan 7 hari'],
        ['Kerangka tampilan + token desain', 'Halaman contoh memakai token warna, huruf, jarak']
      ]
    ),
    '',
    h(2, 'Fase 1 — Alur inti (minggu 3–5)'),
    '',
    ...spec.domain.features
      .filter((f) => f[2] === 'P0')
      .slice(0, 4)
      .map(([nama, desk]) => `- **${nama}** — ${desk}`),
    '',
    h(2, 'Fase 2 — Pelengkap (minggu 6–8)'),
    '',
    ...(spec.domain.features.filter((f) => f[2] === 'P1').length
      ? spec.domain.features.filter((f) => f[2] === 'P1').map(([nama, desk]) => `- **${nama}** — ${desk}`)
      : ['- Belum ada fitur P1 yang disepakati.']),
    '',
    h(2, 'Fase 3 — Pelepasan (minggu 9–10)'),
    '',
    bullets([
      'Uji coba tertutup dengan 10–20 pengguna nyata, satu minggu.',
      'Perbaikan berdasarkan catatan uji coba, bukan daftar keinginan.',
      'Pemeriksaan aksesibilitas: navigasi papan tunas, kontras, label formulir.',
      'Pemantauan: log galat, metrik permintaan, pemberitahuan ambang.',
      'Pelepasan bertahap 10% lalu 100%.'
    ]),
    '',
    h(2, 'Kriteria siap rilis'),
    '',
    checkboxes([
      'Semua kriteria P0 lolos uji penerimaan',
      'Tidak ada galat 5xx pada alur utama selama 24 jam',
      'P95 waktu respons API < 300 ms pada beban uji',
      'Cadangan basis data dipulihkan minimal sekali secara berhasil',
      'Panduan singkat tersedia untuk pengguna baru',
      'Halaman kebijakan privasi dan ketentuan terbit'
    ]),
    '',
    h(2, 'Yang sengaja belum dikerjakan'),
    '',
    bullets(spec.domain.nonGoals),
    ''
  ].join('\n');
}

export function tasks(spec) {
  const p0 = spec.domain.features.filter((f) => f[2] === 'P0');
  return [
    frontmatter({ dokumen: 'tasks', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Daftar Tugas — ${spec.name}`),
    '',
    '> Format: satu baris per tugas yang dapat diselesaikan dalam satu sesi kerja. Tandai selesai hanya bila kriterianya terpenuhi.',
    '',
    h(2, 'Fondasi'),
    '',
    checkboxes([
      'Menyiapkan repositori, format kode, dan pemeriksaan tipe',
      'Membuat pipeline penyebaran ke lingkungan percobaan',
      'Menulis migrasi tabel `users` dan tabel sesi',
      'Membuat lapisan akses basis data dengan transaksi',
      'Menambahkan log terstruktur dan ID permintaan'
    ]),
    '',
    h(2, 'Autentikasi'),
    '',
    checkboxes([
      'Endpoint daftar dengan hash kata sandi (argon2id)',
      'Endpoint masuk + pembuatan sesi cookie HttpOnly',
      'Pemulihan kata sandi lewat email token sekali pakai',
      'Uji: kata sandi salah, email ganda, token kedaluwarsa'
    ]),
    '',
    ...p0.flatMap(([nama]) => [
      h(2, nama),
      '',
      checkboxes([
        `Membuat skema validasi masukan untuk ${nama.toLowerCase()}`,
        `Membangun endpoint server untuk ${nama.toLowerCase()}`,
        'Membangun tampilan daftar dan keadaan kosong',
        'Menambahkan uji integrasi jalur bahagia dan dua jalur gagal',
        'Memeriksa izin per peran pada setiap mutasi'
      ]),
      ''
    ]),
    h(2, 'Sebelum rilis'),
    '',
    checkboxes([
      'Meninjau ulang semua teks antarmuka (galat, keadaan kosong, tombol)',
      'Menjalankan pemeriksaan aksesibilitas dengan papan tunas saja',
      'Menguji di ponsel 390px dan tablet 768px',
      'Menyiapkan cadangan otomatis dan uji pemulihan',
      'Menulis catatan rilis'
    ]),
    ''
  ].join('\n');
}
