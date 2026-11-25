// Domain pack: e-commerce / marketplace
export const commerce = {
  id: 'commerce',
  label: 'E-commerce & marketplace',
  keywords: ['toko', 'jual', 'beli', 'produk', 'keranjang', 'checkout', 'marketplace', 'umkm', 'katalog', 'pesanan', 'penjual', 'ecommerce', 'shop'],
  summary: 'Katalog produk, keranjang, pembayaran, dan pemenuhan pesanan untuk penjual dan pembeli.',
  actors: [
    ['Pembeli', 'Menjelajah katalog, menaruh produk di keranjang, membayar, melacak pesanan.'],
    ['Penjual', 'Mengunggah produk, mengatur stok dan harga, memproses pesanan.'],
    ['Admin Operasional', 'Meninjau sengketa, mengatur kategori, memantau refund.']
  ],
  features: [
    ['Katalog & pencarian', 'Daftar produk dengan filter kategori, harga, dan ketersediaan.', 'P0'],
    ['Halaman produk', 'Galeri, varian (ukuran/warna), stok real-time, ulasan.', 'P0'],
    ['Keranjang', 'Menyimpan pilihan lintas sesi, menghitung subtotal dan ongkir.', 'P0'],
    ['Checkout & pembayaran', 'Alamat, kurir, metode bayar, ringkasan biaya.', 'P0'],
    ['Manajemen pesanan', 'Status: menunggu bayar, diproses, dikirim, selesai, refund.', 'P0'],
    ['Dasbor penjual', 'Stok, pesanan masuk, laporan penjualan harian.', 'P1'],
    ['Ulasan & rating', 'Ulasan terverifikasi hanya dari pembelian selesai.', 'P1'],
    ['Kupon & diskon', 'Kode promo dengan batas pemakaian dan masa berlaku.', 'P2']
  ],
  entities: [
    ['users', 'id, email, nama, peran (buyer|seller|admin), created_at'],
    ['sellers', 'id, user_id, nama_toko, status_verifikasi, rating_rata'],
    ['products', 'id, seller_id, slug, judul, deskripsi, harga, status'],
    ['product_variants', 'id, product_id, sku, nama_varian, harga, stok'],
    ['carts', 'id, user_id, updated_at'],
    ['cart_items', 'id, cart_id, variant_id, qty, harga_saat_itu'],
    ['orders', 'id, buyer_id, kode, status, subtotal, ongkir, total, paid_at'],
    ['order_items', 'id, order_id, variant_id, qty, harga, nama_snapshot'],
    ['payments', 'id, order_id, metode, status, referensi_gateway, paid_at'],
    ['reviews', 'id, product_id, user_id, rating (1..5), isi, created_at']
  ],
  endpoints: [
    ['GET', '/products', 'Daftar produk dengan filter kategori, harga, cursor.'],
    ['GET', '/products/{slug}', 'Detail produk + varian + ulasan terbaru.'],
    ['POST', '/cart/items', 'Tambah varian ke keranjang; gagal bila stok kurang.'],
    ['POST', '/orders', 'Buat pesanan dari keranjang, kunci stok, buat pembayaran.'],
    ['POST', '/payments/{id}/callback', 'Webhook gateway; idempoten lewat referensi.'],
    ['PATCH', '/orders/{id}/status', 'Transisi status oleh penjual atau admin.'],
    ['POST', '/products', 'Buat produk (peran penjual).']
  ],
  metrics: [
    ['Konversi checkout', 'Pesanan selesai / sesi yang membuka keranjang', '≥ 35%'],
    ['Waktu muat halaman produk', 'p95 LCP di 4G', '< 2,5 s'],
    ['Pesanan gagal bayar', 'Order berstatus menunggu bayar > 24 jam', '< 8%'],
    ['Akurasi stok', 'Selisih stok sistem vs fisik', '< 1%']
  ],
  risks: [
    ['Stok ganda saat checkout bersamaan', 'Kurangi stok di transaksi DB dengan penguncian baris, bukan di klien.'],
    ['Webhook pembayaran ganda', 'Simpan referensi gateway unik, proses idempoten.'],
    ['Harga berubah setelah masuk keranjang', 'Simpan harga_saat_itu dan tampilkan selisih saat checkout.']
  ],
  uxNotes: [
    'Checkout satu halaman dengan ringkasan biaya selalu terlihat.',
    'Status pesanan memakai label kata kerja, bukan kode internal.',
    'Tombol tambah ke keranjang tetap aktif saat stok habis tetapi berubah jadi "Beri tahu saya".'
  ],
  nonGoals: ['Rekomendasi berbasis ML pada rilis pertama', 'Multi-mata uang', 'Program loyalitas'],
  actorFlows: {
    'Pembeli': [
      'Membuka katalog dari beranda; filter kategori dan harga.',
      'Membuka halaman produk, memilih varian, menambah ke keranjang.',
      'Masuk atau mendaftar saat checkout, mengisi alamat dan kurir.',
      'Memilih metode bayar, meninjau ringkasan biaya, menyelesaikan pembayaran.',
      'Menerima halaman pesanan dengan status dan perkiraan tiba.'
    ],
    'Penjual': [
      'Masuk, menyelesaikan verifikasi toko bila belum.',
      'Menambah produk baru: foto, judul, harga, stok per varian.',
      'Membuka daftar pesanan masuk dan memproses yang berstatus dibayar.',
      'Memasukkan nomor resi, status berubah menjadi dikirim.',
      'Melihat laporan penjualan dan stok menipis di dasbor.'
    ],
    'Admin Operasional': [
      'Masuk ke panel admin dengan peran khusus.',
      'Membuka antrean pesanan bermasalah dan sengketa.',
      'Memeriksa bukti, memutuskan refund atau penggantian.',
      'Menyesuaikan kategori dan menonaktifkan produk melanggar.',
      'Mencatat tindakan beserta alasan di riwayat.'
    ]
  }
};

// Domain pack: SaaS / alat kerja
export const saas = {
  id: 'saas',
  label: 'SaaS & alat kerja',
  keywords: ['saas', 'dashboard', 'langganan', 'subscription', 'tim', 'kolaborasi', 'workspace', 'b2b', 'crm', 'manajemen proyek', 'invoice', 'absensi', 'internal'],
  summary: 'Ruang kerja berbasis langganan tempat tim mengelola data bersama dengan peran dan batas paket.',
  actors: [
    ['Pemilik workspace', 'Mengatur paket, mengundang anggota, melihat tagihan.'],
    ['Anggota tim', 'Membuat dan mengubah data sesuai perannya.'],
    ['Admin penagihan', 'Mengelola faktur, metode bayar, dan penagihan ulang.']
  ],
  features: [
    ['Autentikasi & workspace', 'Daftar, verifikasi email, buat workspace, undang anggota.', 'P0'],
    ['Peran & izin', 'Owner, admin, member, viewer dengan matriks izin eksplisit.', 'P0'],
    ['Entitas inti + tampilan daftar', 'Tabel dengan pencarian, filter, urutan, dan paginasi.', 'P0'],
    ['Detail & riwayat perubahan', 'Jejak audit siapa mengubah apa dan kapan.', 'P1'],
    ['Paket & kuota', 'Batas jumlah anggota dan entitas per paket.', 'P1'],
    ['Notifikasi', 'Email dan in-app untuk undangan, penugasan, dan batas kuota.', 'P1'],
    ['Ekspor data', 'Unduh CSV per tampilan; permintaan ekspor penuh untuk owner.', 'P2']
  ],
  entities: [
    ['workspaces', 'id, nama, slug, paket, created_at'],
    ['users', 'id, email, nama, avatar_url, last_seen_at'],
    ['memberships', 'id, workspace_id, user_id, peran, invited_at, accepted_at'],
    ['<entitas_inti>', 'id, workspace_id, judul, status, pemilik_id, due_date, created_at'],
    ['activity_log', 'id, workspace_id, actor_id, aksi, objek_tipe, objek_id, created_at'],
    ['subscriptions', 'id, workspace_id, paket, status, periode_berakhir, gateway_ref'],
    ['invitations', 'id, workspace_id, email, peran, token, kedaluwarsa']
  ],
  endpoints: [
    ['POST', '/auth/signup', 'Buat akun + workspace pertama dalam satu transaksi.'],
    ['POST', '/workspaces/{id}/invitations', 'Undang anggota; kirim email token sekali pakai.'],
    ['GET', '/workspaces/{id}/<entitas>', 'Daftar dengan filter, urutan, cursor pagination.'],
    ['PATCH', '/<entitas>/{id}', 'Ubah field tertentu; tolak bila peran tidak mengizinkan.'],
    ['GET', '/workspaces/{id}/activity', 'Riwayat audit terbaru.'],
    ['POST', '/billing/checkout', 'Buat sesi pembayaran paket.']
  ],
  metrics: [
    ['Aktivasi', 'Workspace yang mengisi ≥ 5 entitas dalam 7 hari', '≥ 40%'],
    ['Retensi mingguan', 'Anggota aktif / anggota terdaftar', '≥ 55%'],
    ['Konversi trial ke bayar', 'Trial berakhir lalu bayar', '≥ 20%'],
    ['Waktu undang anggota pertama', 'Median sejak daftar', '< 10 menit']
  ],
  risks: [
    ['Kebocoran data antar workspace', 'Setiap query wajib memfilter workspace_id dari sesi, bukan dari body.'],
    ['Kuota paket dilewati lewat API', 'Validasi kuota di server pada satu titik sebelum mutasi.'],
    ['Undangan kedaluwarsa dipakai ulang', 'Token sekali pakai dengan masa berlaku dan pencabutan manual.']
  ],
  uxNotes: [
    'Navigasi kiri tetap, satu tingkat. Tidak ada menu bersarang lebih dari dua level.',
    'Setiap tabel punya keadaan kosong dengan aksi utama yang jelas.',
    'Status paket dan kuota selalu terlihat di sudut kanan atas.'
  ],
  nonGoals: ['Aplikasi mobile native', 'Integrasi SSO perusahaan', 'Mesin aturan otomatisasi kompleks'],
  actorFlows: {
    'Pemilik workspace': [
      'Mendaftar, membuat workspace pertama, mengundang dua anggota.',
      'Menetapkan peran anggota pada halaman pengaturan tim.',
      'Mencoba paket berbayar lewat uji coba 14 hari.',
      'Meninjau aktivitas terbaru dan ekspor data bulanan.'
    ],
    'Anggota tim': [
      'Masuk lewat tautan undangan, melengkapi profil.',
      'Menerima tampilan daftar yang sudah difilter ke ruang kerjanya.',
      'Membuat entitas baru lewat tombol aksi utama.',
      'Memperbarui status dan menambahkan catatan pada data yang ditugaskan.',
      'Menerima notifikasi saat ditugaskan atau disebut.'
    ],
    'Admin penagihan': [
      'Membuka halaman paket dan tagihan.',
      'Memeriksa faktur berjalan dan riwayat pembayaran.',
      'Mengganti metode bayar atau mengunduh faktur pajak.',
      'Menangani pembayaran gagal sebelum periode berakhir.'
    ]
  }
};
