// Domain pack: keuangan & pencatatan
export const finance = {
  id: 'finance',
  label: 'Keuangan & pencatatan',
  keywords: ['keuangan', 'catat', 'pengeluaran', 'pemasukan', 'budget', 'anggaran', 'invoice', 'pembukuan', 'akuntansi', 'kas', 'laporan keuangan', 'tabungan', 'utang'],
  summary: 'Pencatatan transaksi, kategori, anggaran, dan laporan periodik yang bisa dipercaya.',
  actors: [
    ['Pemilik usaha', 'Mencatat transaksi, meninjau laporan, mengatur anggaran.'],
    ['Staf keuangan', 'Meninjau dan mengoreksi entri, menutup buku bulanan.'],
    ['Akuntan eksternal', 'Akses baca laporan dan ekspor periode tertentu.']
  ],
  features: [
    ['Buku kas', 'Entri pemasukan dan pengeluaran dengan kategori dan lampiran bukti.', 'P0'],
    ['Kategori & anggaran', 'Batas bulanan per kategori dengan indikator terpakai.', 'P0'],
    ['Laporan periodik', 'Ringkasan bulanan, arus kas, perbandingan periode.', 'P0'],
    ['Impor mutasi bank', 'Unggah CSV, cocokkan, tandai hasil rekonsiliasi.', 'P1'],
    ['Utang & piutang', 'Daftar tagihan jatuh tempo dan pengingat.', 'P1'],
    ['Tutup buku', 'Kunci periode, larang perubahan tanpa jurnal koreksi.', 'P2'],
    ['Multi-mata uang', 'Kurs tersimpan per transaksi.', 'P2']
  ],
  entities: [
    ['accounts', 'id, owner_id, nama, tipe (kas|bank|dompet), saldo_awal'],
    ['categories', 'id, owner_id, nama, tipe, parent_id'],
    ['transactions', 'id, account_id, category_id, tipe, jumlah, terjadi_pada, catatan, bukti_url'],
    ['budgets', 'id, owner_id, category_id, periode, batas_jumlah'],
    ['recurring_rules', 'id, account_id, category_id, jumlah, jadwal_cron, berikutnya_pada'],
    ['imports', 'id, account_id, nama_berkas, baris_total, baris_cocok, created_at'],
    ['period_locks', 'id, owner_id, periode, locked_at, locked_by']
  ],
  endpoints: [
    ['POST', '/transactions', 'Catat transaksi; jumlah disimpan sebagai integer terkecil, bukan float.'],
    ['PATCH', '/transactions/{id}', 'Koreksi entri; tolak bila periode terkunci.'],
    ['GET', '/reports/monthly', 'Ringkasan per kategori untuk satu bulan.'],
    ['POST', '/imports', 'Unggah CSV mutasi; deteksi baris duplikat.'],
    ['POST', '/budgets', 'Tetapkan anggaran per kategori per periode.'],
    ['POST', '/periods/{periode}/lock', 'Tutup buku; hanya pemilik.']
  ],
  metrics: [
    ['Konsistensi pembukuan', 'Transaksi tanpa kategori', '< 2%'],
    ['Laporan tepat waktu', 'Bulan tertutup sebelum tanggal 10', '≥ 90%'],
    ['Akurasi impor', 'Baris terimpor tanpa koreksi manual', '≥ 92%'],
    ['Waktu catat entri', 'Median dari buka aplikasi sampai simpan', '< 45 detik']
  ],
  risks: [
    ['Selisih pembulatan', 'Simpan semua nominal sebagai integer satuan terkecil; hindari tipe pecahan biner.'],
    ['Duplikat saat impor ulang', 'Hash baris (tanggal+nominall+ref) sebagai kunci unik per akun.'],
    ['Periode terkunci diubah', 'Tolak mutasi pada periode terkunci; wajib jurnal koreksi bertanda.'],
    ['Akses laporan tanpa izin', 'Peran akuntan hanya baca dan hanya periode yang dibagikan.']
  ],
  uxNotes: [
    'Formulir entri cepat: jumlah dulu, kategori kemudian, sisanya opsional.',
    'Ringkasan angka memakai pemisah ribuan dan tanda minus merah yang jelas.',
    'Setiap laporan menyebut rentang tanggal eksplisit di judulnya.'
  ],
  nonGoals: ['Integrasi e-Faktur pajak otomatis', 'Sinkronisasi bank langsung', 'Perhitungan pajak lintas negara'],
  actorFlows: {
    'Pemilik usaha': [
      'Membuat akun dan akun kas pertama dengan saldo awal.',
      'Mencatat transaksi harian: jumlah, kategori, tanggal, bukti.',
      'Menetapkan anggaran bulanan per kategori.',
      'Membuka laporan bulanan dan membandingkan dengan bulan lalu.',
      'Mengunduh laporan untuk diserahkan ke akuntan.'
    ],
    'Staf keuangan': [
      'Meninjau daftar transaksi yang belum berkategori.',
      'Mengoreksi entri yang salah kategori atau nominal.',
      'Mengimpor mutasi bank dan mencocokkan baris.',
      'Menandai periode selesai lalu mengajukan tutup buku.'
    ],
    'Akuntan eksternal': [
      'Diberi akses baca untuk periode tertentu.',
      'Membuka laporan arus kas dan neraca ringkas.',
      'Mengunduh ekspor CSV untuk diproses di alat lain.',
      'Mengirim catatan koreksi tanpa mengubah data asli.'
    ]
  }
};

// Domain pack: komunitas & konten
export const community = {
  id: 'community',
  label: 'Komunitas & konten',
  keywords: ['komunitas', 'forum', 'posting', 'artikel', 'blog', 'berita', 'feed', 'komentar', 'follow', 'sosial', 'event', 'member', 'newsletter', 'media', 'podcast'],
  summary: 'Publikasi konten, interaksi anggota, dan moderasi ruang diskusi.',
  actors: [
    ['Anggota baru', 'Membaca, membuat akun, mengikuti topik.'],
    ['Penulis', 'Menyusun dan menerbitkan tulisan, melihat statistik.'],
    ['Moderator', 'Meninjau laporan, menyembunyikan konten, menangguhkan akun.']
  ],
  features: [
    ['Profil & onboarding', 'Pilih minat saat mendaftar untuk mengisi feed awal.', 'P0'],
    ['Penerbitan tulisan', 'Editor markdown, pratinjau, status draf dan terbit.', 'P0'],
    ['Feed', 'Urutan terbaru dan terpopuler, filter berdasarkan topik yang diikuti.', 'P0'],
    ['Komentar', 'Bertingkat satu level, dengan urutan waktu.', 'P0'],
    ['Suka & simpan', 'Suka sekali per pengguna, simpan untuk dibaca nanti.', 'P1'],
    ['Pelaporan & moderasi', 'Antrean laporan, tindakan tercatat, alasan wajib.', 'P1'],
    ['Statistik penulis', 'Dibaca, suka, rasio penyelesaian baca.', 'P2']
  ],
  entities: [
    ['users', 'id, username, nama, bio, avatar_url, status'],
    ['posts', 'id, author_id, slug, judul, isi_md, status, topik_id, terbit_at'],
    ['topics', 'id, nama, slug, deskripsi'],
    ['comments', 'id, post_id, author_id, parent_id, isi, status'],
    ['reactions', 'id, post_id, user_id, jenis, created_at'],
    ['follows', 'id, follower_id, following_id, created_at'],
    ['reports', 'id, reporter_id, objek_tipe, objek_id, alasan, status'],
    ['moderation_actions', 'id, moderator_id, objek_id, aksi, alasan, created_at']
  ],
  endpoints: [
    ['GET', '/feed', 'Feed dengan cursor; urutan terbaru atau populer.'],
    ['POST', '/posts', 'Buat draf; slug unik dihasilkan dari judul.'],
    ['PATCH', '/posts/{id}', 'Ubah draf; tolak ubah setelah terbit kecuali ada catatan revisi.'],
    ['POST', '/posts/{id}/comments', 'Komentar; pakai penguncian ringan untuk mencegah spam.'],
    ['POST', '/reports', 'Laporkan konten dengan alasan terstruktur.'],
    ['PATCH', '/reports/{id}', 'Moderator menyelesaikan laporan; tulis moderation_actions.']
  ],
  metrics: [
    ['Penyelesaian baca', 'Pembaca yang mencapai 90% artikel', '≥ 40%'],
    ['Kontribusi aktif', 'Anggota yang menulis atau mengomentari per bulan', '≥ 12%'],
    ['Komentar bermasalah', 'Komentar dilaporkan / total komentar', '< 3%'],
    ['Retensi D7', 'Anggota yang kembali di hari ke-7', '≥ 25%']
  ],
  risks: [
    ['Spam dan tautan berbahaya', 'Batas laju per akun, penyaringan tautan untuk akun baru, moderasi awal.'],
    ['Konten dikutip di luar konteks', 'Simpan revisi dan waktu perubahan yang dapat ditautkan.'],
    ['Moderasi tidak konsisten', 'Alasan tindakan diambil dari daftar tetap dan dicatat.'],
    ['Feed bias', 'Gabungkan sinyal waktu dan relevansi topik; jangan hanya rasio klik.']
  ],
  uxNotes: [
    'Editor dengan pratinjau berdampingan dan simpan otomatis setiap beberapa detik.',
    'Komentar tampil tanpa memuat ulang halaman.',
    'Label status konten (draf, terbit, disembunyikan) memakai warna konsisten.'
  ],
  nonGoals: ['Pesan langsung antar anggota', 'Konten video bawaan', 'Rekomendasi berbasis model besar'],
  actorFlows: {
    'Anggota baru': [
      'Membaca satu artikel dari tautan luar tanpa mendaftar.',
      'Mendaftar dan memilih tiga topik minat saat onboarding.',
      'Menerima feed yang sudah terisi dari topik tersebut.',
      'Mengikuti seorang penulis dan menyimpan satu artikel.',
      'Kembali keesokan hari lewat pengingat email opsional.'
    ],
    'Penulis': [
      'Membuat draf baru, menulis memakai markdown dengan pratinjau.',
      'Menambahkan topik, ringkasan, dan gambar sampul.',
      'Menyimpan draf; suntingan otomatis tersimpan.',
      'Menerbitkan dan membagikan tautan.',
      'Melihat statistik dibaca, suka, dan rasio penyelesaian baca.'
    ],
    'Moderator': [
      'Membuka antrean laporan yang belum ditangani.',
      'Membaca konteks laporan beserta riwayat akun pelapor dan terlapor.',
      'Memilih tindakan: biarkan, sembunyikan, atau tangguhkan.',
      'Menulis alasan dari daftar tetap; tindakan tercatat.'
    ]
  }
};
