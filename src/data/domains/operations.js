// Domain pack: logistik & operasional
export const logistics = {
  id: 'logistics',
  label: 'Logistik & operasional',
  keywords: ['kirim', 'pengiriman', 'logistik', 'gudang', 'stok', 'inventaris', 'kurir', 'armada', 'rute', 'jadwal', 'booking', 'layanan', 'servis', 'lapangan', 'teknisi'],
  summary: 'Alur kerja lapangan: permintaan, penugasan, pergerakan barang atau teknisi, dan bukti penyelesaian.',
  actors: [
    ['Pelanggan', 'Mengajukan permintaan, memilih jadwal, melacak status.'],
    ['Petugas lapangan', 'Menerima tugas, memperbarui status, mengunggah bukti.'],
    ['Dispatcher', 'Menugaskan, mengatur ulang rute, menangani keterlambatan.']
  ],
  features: [
    ['Permintaan layanan', 'Formulir permintaan dengan alamat, waktu, dan tingkat urgensi.', 'P0'],
    ['Penugasan', 'Dispatcher menugaskan ke petugas; kapasitas harian dihormati.', 'P0'],
    ['Status real-time', 'Perubahan status sampai selesai, terlihat oleh pelanggan.', 'P0'],
    ['Bukti penyelesaian', 'Foto, tanda tangan, catatan; wajib sebelum status selesai.', 'P0'],
    ['Peta & rute', 'Urutan kunjungan dan estimasi jarak.', 'P1'],
    ['Persediaan', 'Stok per gudang dan pergerakan masuk/keluar.', 'P1'],
    ['Laporan SLA', 'Ketepatan waktu dan penyebab keterlambatan.', 'P2']
  ],
  entities: [
    ['customers', 'id, nama, telepon, alamat_default, catatan_akses'],
    ['service_requests', 'id, customer_id, jenis, deskripsi, urgensi, jadwal_diminta, status'],
    ['assignments', 'id, request_id, petugas_id, mulai, selesai, status'],
    ['field_agents', 'id, user_id, area, kapasitas_harian, kendaraan'],
    ['status_events', 'id, request_id, dari, ke, oleh_id, catatan, created_at'],
    ['proofs', 'id, assignment_id, tipe, berkas_url, diambil_pada'],
    ['warehouses', 'id, nama, alamat, koordinat'],
    ['stock_movements', 'id, warehouse_id, item_id, qty, arah, referensi, created_at']
  ],
  endpoints: [
    ['POST', '/service-requests', 'Buat permintaan; hitung estimasi kedatangan awal.'],
    ['POST', '/assignments', 'Tugaskan petugas; tolak bila kapasitas harian penuh.'],
    ['PATCH', '/assignments/{id}/status', 'Perbarui status; transisi tidak sah ditolak.'],
    ['POST', '/assignments/{id}/proofs', 'Unggah bukti; wajib satu bukti sebelum selesai.'],
    ['GET', '/service-requests/{id}/timeline', 'Riwayat status untuk pelanggan.'],
    ['POST', '/stock-movements', 'Catat keluar/masuk; stok tidak boleh negatif.']
  ],
  metrics: [
    ['Ketepatan jadwal', 'Kunjungan dalam jendela waktu', '≥ 90%'],
    ['Waktu penugasan', 'Median dari permintaan ke penugasan', '< 20 menit'],
    ['Kelengkapan bukti', 'Tugas selesai dengan bukti lengkap', '100%'],
    ['Selisih stok', 'Stok sistem vs hitung fisik', '< 1,5%']
  ],
  risks: [
    ['Status melompati langkah', 'Mesin status eksplisit; hanya transisi terdaftar yang diterima.'],
    ['Tugas ganda untuk satu petugas', 'Kunci per petugas per rentang waktu saat penugasan.'],
    ['Bukti hilang', 'Simpan bukti di penyimpanan objek dengan URL tak tertebak, backup harian.'],
    ['Stok negatif', 'Tolak mutasi keluar bila qty melebihi stok tersedia.']
  ],
  uxNotes: [
    'Aplikasi lapangan dioptimalkan untuk satu tangan dan sinyal lemah: tombol besar, simpan lokal saat luring.',
    'Timeline status memakai bahasa pelanggan, bukan kode internal.',
    'Bukti diunggah dengan kompresi di perangkat sebelum dikirim.'
  ],
  nonGoals: ['Optimasi rute berbasis pembelajaran mesin', 'Pelacakan kendaraan GPS langsung', 'Integrasi bea cukai'],
  actorFlows: {
    'Pelanggan': [
      'Mengisi formulir permintaan: jenis layanan, alamat, waktu yang diinginkan.',
      'Menerima estimasi kedatangan dan nama petugas.',
      'Menerima pembaruan status saat petugas berangkat.',
      'Menyambut petugas, menyetujui pekerjaan, menerima bukti foto.',
      'Memberi penilaian setelah pekerjaan selesai.'
    ],
    'Petugas lapangan': [
      'Membuka daftar tugas hari ini dari perangkat.',
      'Menekan "berangkat"; status pelanggan ikut berubah.',
      'Mengisi catatan pekerjaan dan menggunakan suku cadang bila perlu.',
      'Mengunggah foto bukti dan meminta tanda tangan pelanggan.',
      'Menandai selesai; bukti wajib sudah lengkap.'
    ],
    'Dispatcher': [
      'Membuka papan penugasan berisi permintaan baru.',
      'Menugaskan ke petugas dengan kapasitas tersisa di area tersebut.',
      'Menangani keterlambatan dengan menugaskan ulang atau memberi tahu pelanggan.',
      'Meninjau laporan ketepatan waktu akhir hari.'
    ]
  }
};

// Domain pack: produktivitas pribadi
export const productivity = {
  id: 'productivity',
  label: 'Produktivitas pribadi',
  keywords: ['catatan', 'notes', 'todo', 'tugas', 'jurnal', 'habit', 'kebiasaan', 'fokus', 'pomodoro', 'kalender', 'pengingat', 'produktivitas', 'resep', 'koleksi', 'buku'],
  summary: 'Alat pribadi untuk menangkap, mengatur, dan meninjau satu jenis catatan atau kebiasaan.',
  actors: [
    ['Pengguna tunggal', 'Menangkap isi cepat, mengatur, meninjau ulang secara berkala.'],
    ['Pengguna tamu', 'Mencoba tanpa akun; data tersimpan lokal sampai mendaftar.']
  ],
  features: [
    ['Tangkap cepat', 'Satu kolom isian, simpan dengan Enter, tanpa dialog.', 'P0'],
    ['Organisasi', 'Label, urutan manual, pencarian instan.', 'P0'],
    ['Tampilan hari ini', 'Daftar berfokus untuk hari berjalan.', 'P0'],
    ['Riwayat & tinjauan', 'Ringkasan mingguan dari yang sudah dikerjakan.', 'P1'],
    ['Pengingat lokal', 'Notifikasi di perangkat, tanpa server.', 'P1'],
    ['Ekspor', 'Markdown/JSON sekali klik.', 'P1'],
    ['Sinkronisasi opsional', 'Akun untuk memindahkan data antar perangkat.', 'P2']
  ],
  entities: [
    ['items', 'id, user_id, judul, isi, label, urutan, status, selesai_at'],
    ['labels', 'id, user_id, nama, warna'],
    ['reviews', 'id, user_id, periode, catatan, created_at'],
    ['settings', 'id, user_id, tema, zona_waktu, pengingat_aktif']
  ],
  endpoints: [
    ['GET', '/items?tanggal=', 'Daftar item untuk satu hari atau label.'],
    ['POST', '/items', 'Tambah item; waktu dibuat di server.'],
    ['PATCH', '/items/{id}', 'Ubah judul atau status selesai.'],
    ['POST', '/reviews', 'Simpan tinjauan mingguan.'],
    ['GET', '/export', 'Ekspor seluruh data pengguna sebagai JSON.']
  ],
  metrics: [
    ['Penggunaan harian', 'Hari aktif per pengguna per bulan', '≥ 18'],
    ['Waktu tangkap', 'Median dari buka aplikasi sampai item tersimpan', '< 5 detik'],
    ['Item selesai', 'Item selesai / item dibuat per minggu', '≥ 60%'],
    ['Retensi D30', 'Pengguna aktif di hari ke-30', '≥ 20%']
  ],
  risks: [
    ['Data hilang saat luring', 'Antrean perubahan lokal dan rekonsiliasi saat daring kembali.'],
    ['Terlalu banyak konfigurasi', 'Batasi pengaturan ke tema, zona waktu, pengingat.'],
    ['Latensi terasa', 'Optimistic UI: tampilkan item segera, sinkronkan di latar.']
  ],
  uxNotes: [
    'Halaman utama adalah daftar hari ini, bukan dasbor penuh metrik.',
    'Animasi kecil saat item ditandai selesai, tanpa menghilangkan konteks.',
    'Mode gelap sebagai bawaan, kontras teks tetap lolos AA.'
  ],
  nonGoals: ['Kolaborasi tim', 'Integrasi kalender dua arah', 'Asisten AI di rilis pertama'],
  actorFlows: {
    'Pengguna tunggal': [
      'Membuka aplikasi; daftar hari ini sudah tampil.',
      'Mengetik satu item, menekan Enter, item langsung tersimpan.',
      'Memberi label pada beberapa item sekaligus.',
      'Menandai selesai; item memudar tetapi tetap terlihat hari itu.',
      'Membuka tinjauan mingguan untuk melihat apa yang selesai.'
    ],
    'Pengguna tamu': [
      'Mencoba tanpa akun; data disimpan di perangkat.',
      'Membuat beberapa item dan menutup tab.',
      'Kembali; item masih ada dari penyimpanan lokal.',
      'Mendaftar untuk mencadangkan data ke akun.'
    ]
  }
};
