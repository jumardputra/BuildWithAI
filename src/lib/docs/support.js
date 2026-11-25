import { table, bullets, numbered, h, code, frontmatter } from '../md.js';

export function userFlow(spec) {
  const d = spec.domain;
  return [
    frontmatter({ dokumen: 'user-flows', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Alur Pengguna — ${spec.name}`),
    '',
    h(2, '1. Peta layar'),
    '',
    code('text', [
      `[Masuk] ──▶ [Ringkasan] ──┬──▶ [${d.features[0][0]}]`,
      `                         ├──▶ [${d.features[1] ? d.features[1][0] : 'Data'}]`,
      `                         └──▶ [Pengaturan]`,
      '',
      'Setiap layar punya satu aksi utama di kanan atas dan jalan kembali yang jelas.'
    ].join('\n')),
    '',
    ...d.actors.map(([peran, tugas], i) => [
      h(2, `${i + 2}. Alur ${peran}`),
      '',
      `${tugas}`,
      '',
      numbered([
        spec.hasAuth ? 'Buka situs, klik Masuk, isi email dan kata sandi.' : 'Buka situs; sesi anonim dibuat otomatis.',
        `Mendarat di ringkasan: angka kunci, aktivitas terbaru, dan tombol aksi utama.`,
        `Menjalankan ${d.features[0][0].toLowerCase()} lewat formulir singkat.`,
        'Menerima konfirmasi sebaris (bukan dialog) bahwa data tersimpan.',
        'Kembali ke daftar; item baru muncul di urutan atas.',
        `Melakukan ${d.features[1] ? d.features[1][0].toLowerCase() : 'langkah berikutnya'} untuk melengkapi data awal.`
      ]),
      ''
    ]).flat(),
    h(2, `${d.actors.length + 2}. Keadaan khusus`),
    '',
    table(
      ['Kejadian', 'Perilaku antarmuka'],
      [
        ['Kesalahan validasi', 'Pesan di bawah field yang salah, fokus pindah ke field pertama yang gagal.'],
        ['Jaringan putus', 'Panel kecil di atas: "Koneksi terputus, mencoba lagi…" dengan tombol coba ulang.'],
        ['Sesi kedaluwarsa', 'Arahkan ke masuk dengan pengembalian ke halaman yang sama setelah berhasil.'],
        ['Data kosong', 'Ilustrasi sederhana + satu kalimat + tombol aksi utama.'],
        ['Operasi lambat (> 1 detik)', 'Tombol berubah jadi keadaan memuat, tidak dapat ditekan dua kali.'],
        ['Tidak punya izin', 'Halaman 403 dengan tautan ke halaman yang boleh diakses.']
      ]
    ),
    '',
    h(2, `${d.actors.length + 3}. Catatan pengalaman`),
    '',
    bullets(d.uxNotes),
    ''
  ].join('\n');
}

export function decisions(spec) {
  return [
    frontmatter({ dokumen: 'decisions', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Catatan Keputusan — ${spec.name}`),
    '',
    '> Setiap keputusan ditulis saat diambil. Format: konteks, keputusan, konsekuensi.',
    '',
    h(2, 'ADR-001 — Monolit modular sebelum mikroservis'),
    '',
    '**Konteks.** Tim kecil, domain belum stabil, kebutuhan skala belum jelas.',
    '',
    '**Keputusan.** Satu aplikasi dengan batas modul di tingkat folder dan aturan impor.',
    '',
    '**Konsekuensi.** Penyebaran sederhana; satu titik gagal. Pemisahan layanan menunggu bukti kebutuhan dari metrik.',
    '',
    h(2, 'ADR-002 — Basis data relasional sebagai sumber kebenaran'),
    '',
    '**Konteks.** Data memiliki hubungan tegas dan butuh transaksi (stok, pesanan, pembayaran).',
    '',
    '**Keputusan.** PostgreSQL; tidak ada penyimpanan status ganda di sisi klien kecuali cache yang dapat dibuang.',
    '',
    '**Konsekuensi.** Perubahan skema butuh migrasi; kueri kompleks bisa lambat tanpa indeks yang tepat.',
    '',
    h(2, 'ADR-003 — Rendering sisi server dengan peningkatan progresif'),
    '',
    '**Konteks.** Halaman data harus cepat pada perangkat menengah dan tetap dapat diakses.',
    '',
    '**Keputusan.** SSR untuk semua halaman utama; JavaScript menangani interaksi, bukan merender seluruh halaman.',
    '',
    '**Konsekuensi.** Formulir bekerja tanpa JavaScript; beberapa interaksi harus ditulis dua kali (server dan klien).',
    '',
    h(2, 'ADR-004 — Uang sebagai integer'),
    '',
    '**Konteks.** Kesalahan pembulatan pada pecahan biner merusak pembukuan.',
    '',
    '**Keputusan.** Simpan semua nominal sebagai integer satuan terkecil beserta kode mata uang.',
    '',
    '**Konsekuensi.** Format tampilan ada di satu tempat; semua perhitungan memakai bilangan bulat.',
    '',
    h(2, 'ADR-005 — Idempotensi untuk semua mutasi'),
    '',
    '**Konteks.** Percobaan ulang jaringan dan webhook menyebabkan data ganda.',
    '',
    '**Keputusan.** Setiap mutasi menerima `Idempotency-Key`, simpan hasil selama 24 jam.',
    '',
    '**Konsekuensi.** Tabel tambahan untuk kunci; klien wajib mengirim kunci.',
    '',
    h(2, 'ADR-006 — Dokumen sebagai kode'),
    '',
    '**Konteks.** Dokumen produk mudah basi bila tinggal di luar repositori.',
    '',
    '**Keputusan.** PRD, sistem desain, arsitektur, dan roadmap disimpan di `docs/` dan ditinjau di setiap perubahan besar.',
    '',
    '**Konsekuensi.** Perubahan lingkup wajib disertai perubahan dokumen; menambah beban disiplin, mengurangi salah paham.',
    ''
  ].join('\n');
}

export function readme(spec) {
  return [
    h(1, `Paket Dokumen — ${spec.name}`),
    '',
    `> Dibuat dari ide: "${spec.idea}"`,
    '',
    `Tanggal: ${spec.generatedAtISO} · Kategori: ${spec.domainLabel} · Platform: ${spec.platform}`,
    '',
    h(2, 'Berkas dalam paket ini'),
    '',
    table(
      ['Berkas', 'Isi', 'Dipakai oleh'],
      [
        ['`prd.md`', 'Masalah, tujuan, fitur berprioritas, alur, risiko, pertanyaan terbuka', 'Product manager, seluruh tim'],
        ['`design-system.md`', 'Token warna, tipografi, jarak, komponen, pola tata letak, aksesibilitas', 'Desainer, pengembang frontend'],
        ['`architecture.md`', 'Tumpukan teknologi, diagram, batas modul, kinerja, keamanan', 'Teknisi, peninjau'],
        ['`database.md`', 'DDL SQL, hubungan tabel, indeks, aturan migrasi', 'Pengembang backend'],
        ['`api-spec.md`', 'Endpoint, contoh permintaan/balasan, galat, batas laju', 'Pengembang, integrator'],
        ['`roadmap.md`', 'Fase pengerjaan dan kriteria siap rilis', 'Pemangku kepentingan'],
        ['`tasks.md`', 'Daftar tugas per area, siap dipakai agen pengodean', 'Pengembang, asisten AI'],
        ['`user-flows.md`', 'Alur per peran dan keadaan khusus', 'Desainer, penulis uji'],
        ['`decisions.md`', 'Catatan keputusan arsitektur (ADR)', 'Teknisi baru, peninjau'],
        ['`metrics.md`', 'Metrik produk dan teknis beserta cara mengukurnya', 'Product manager, analis']
      ]
    ),
    '',
    h(2, 'Cara memakai'),
    '',
    numbered([
      'Baca `prd.md` lebih dulu, perbaiki bagian yang tidak sesuai kenyataan.',
      'Sesuaikan `design-system.md` dengan merek Anda sebelum menulis kode tampilan.',
      'Pakai `architecture.md` dan `database.md` untuk menyiapkan repositori dan migrasi pertama.',
      'Ubah `tasks.md` menjadi tiket; satu kotak satu commit kecil.',
      'Jalankan `roadmap.md` sebagai kerangka waktu, bukan janji.',
      'Setiap keputusan yang membelok dari dokumen ini dicatat di `decisions.md`.'
    ]),
    '',
    h(2, 'Hal yang wajib diperiksa manusia'),
    '',
    bullets([
      'Bagian "Pertanyaan terbuka" pada PRD — masih perlu jawaban nyata.',
      'Nama tabel dan kolom — sesuaikan dengan istilah yang dipakai tim Anda.',
      'Metrik dan targetnya — angka awal adalah usulan, bukan hasil pengukuran.',
      'Kepatuhan dan kebijakan privasi bila data yang disimpan bersifat pribadi.'
    ]),
    '',
    h(2, 'Bagaimana dokumen ini dibuat'),
    '',
    `Kalimat ide dianalisis untuk mengenali kategori domain${spec.matchedKeywords.length ? ` (kata yang terdeteksi: ${spec.matchedKeywords.join(', ')})` : ''}, lalu paket isi untuk domain tersebut digabungkan dengan templat dokumen. Semuanya berjalan di peramban; tidak ada data yang dikirim ke server.`,
    ''
  ].join('\n');
}

export function metrics(spec) {
  return [
    frontmatter({ dokumen: 'metrics', produk: spec.name, versi: spec.version, diperbarui: spec.generatedAtISO }),
    '',
    h(1, `Metrik — ${spec.name}`),
    '',
    h(2, '1. Metrik utama'),
    '',
    table(['Metrik', 'Definisi', 'Target'], spec.domain.metrics),
    '',
    h(2, '2. Metrik teknis'),
    '',
    table(
      ['Metrik', 'Definisi', 'Target'],
      [
        ['Ketersediaan', 'Permintaan berhasil / total per bulan', '≥ 99,5%'],
        ['P95 waktu respons', 'API, diukur di server', '< 300 ms'],
        ['Galat 5xx', 'Porsi permintaan gagal', '< 0,5%'],
        ['Waktu penyebaran', 'Dari gabung ke produksi', '< 15 menit'],
        ['Pemulihan', 'Waktu memulihkan layanan', '< 30 menit']
      ]
    ),
    '',
    h(2, '3. Kejadian yang dicatat'),
    '',
    table(
      ['Kejadian', 'Properti', 'Pertanyaan yang dijawab'],
      [
        ['signup_completed', 'sumber, waktu', 'Dari mana pengguna datang?'],
        ['core_action_completed', 'durasi, hasil', 'Apakah alur utama berhasil?'],
        ['error_shown', 'kode, layar', 'Di mana pengguna tertahan?'],
        ['export_requested', 'format, jumlah', 'Apakah data dipakai di luar sistem?']
      ]
    ),
    '',
    h(2, '4. Cara mengukur'),
    '',
    bullets([
      'Definisi metrik tidak diubah di tengah periode tanpa catatan.',
      'Angka produk dihitung dari kejadian yang dicatat aplikasi, angka teknis dari metrik server.',
      'Tinjauan mingguan: satu angka utama, satu penghambat, satu percobaan berikutnya.',
      'Hindari metrik yang bisa dinaikkan tanpa nilai nyata bagi pengguna.'
    ]),
    ''
  ].join('\n');
}
