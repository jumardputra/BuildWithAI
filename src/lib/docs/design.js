import { table, bullets, h, code, frontmatter } from '../md.js';

const TOKENS = [
  ['--color-bg', '#0a1128', 'Latar halaman utama'],
  ['--color-surface', '#141b31', 'Kartu dan panel'],
  ['--color-surface-2', '#101830', 'Panel sekunder, baris tabel'],
  ['--color-border', '#2c3246', 'Garis pemisah dan tepi kartu'],
  ['--color-text', '#f3f4f6', 'Teks utama'],
  ['--color-text-muted', '#9ca3af', 'Teks sekunder dan label'],
  ['--color-accent', '#ff5c20', 'Aksi utama, tautan, penanda aktif'],
  ['--color-accent-weak', '#ff5c2026', 'Latar penanda aktif'],
  ['--color-success', '#22c55e', 'Status berhasil'],
  ['--color-warning', '#ffb900', 'Status perlu perhatian'],
  ['--color-danger', '#ef4444', 'Status gagal dan galat']
];

const SCALE = [
  ['--space-1', '4px', 'Jarak dalam label dan ikon'],
  ['--space-2', '8px', 'Jarak antar elemen rapat'],
  ['--space-3', '12px', 'Jarak dalam kartu'],
  ['--space-4', '16px', 'Jarak antar kartu'],
  ['--space-6', '24px', 'Padding panel'],
  ['--space-8', '32px', 'Jarak antar bagian kecil'],
  ['--space-12', '48px', 'Padding bagian'],
  ['--space-18', '72px', 'Padding bagian besar']
];

export function designSystem(spec) {
  return [
    frontmatter({
      dokumen: 'design-system',
      produk: spec.name,
      versi: spec.version,
      diperbarui: spec.generatedAtISO
    }),
    '',
    h(1, `Design System — ${spec.name}`),
    '',
    `> Arah visual: gelap, tenang, satu aksen hangat. Aksen dipakai untuk satu hal saja per layar: aksi utama.`,
    '',
    h(2, '1. Prinsip'),
    '',
    bullets([
      '**Satu aksen, satu aksi.** Warna aksen hanya untuk tindakan yang paling mungkin diambil pengguna.',
      '**Kepadatan yang bisa dibaca.** Baris tabel 44px, teks 14px, jarak 8px sebagai satuan dasar.',
      '**Bentuk mengikuti fungsi.** Sudut membulat 10–16px, tanpa bayangan berat; kedalaman dari perbedaan latar.',
      '**Kontras lebih dulu, hiasan kemudian.** Semua pasangan teks/latar lolos WCAG AA.',
      '**Gerak kecil.** Transisi 140–200ms, hanya untuk umpan balik, dan dihormati saat pengguna memilih kurangi gerak.'
    ]),
    '',
    h(2, '2. Warna'),
    '',
    table(['Token', 'Nilai', 'Dipakai untuk'], TOKENS),
    '',
    h(3, 'Aturan pemakaian'),
    '',
    bullets([
      'Teks di atas `--color-accent` memakai `#180a04`, bukan putih.',
      'Jangan memakai aksen sebagai latar area lebih dari 15% layar.',
      'Status selalu disertai label teks, tidak hanya warna.'
    ]),
    '',
    h(2, '3. Tipografi'),
    '',
    table(
      ['Peran', 'Ukuran / baris', 'Bobot', 'Dipakai untuk'],
      [
        ['Display', '48 / 52', '700', 'Judul halaman beranda'],
        ['H1', '34 / 40', '700', 'Judul halaman'],
        ['H2', '24 / 32', '700', 'Judul bagian'],
        ['H3', '17 / 24', '600', 'Judul kartu'],
        ['Body', '16 / 26', '400', 'Teks berjalan'],
        ['Body kecil', '14 / 22', '400', 'Teks dalam panel dan tabel'],
        ['Label', '12 / 16', '600', 'Label, penanda, status'],
        ['Mono', '12.5 / 20', '400', 'Nama berkas, kode, angka teknis']
      ]
    ),
    '',
    `Keluarga huruf: sans-serif sistem untuk antarmuka, monospace untuk data teknis. Tinggi baris 1,6 untuk teks berjalan. Panjang baris maksimum 72 karakter.`,
    '',
    h(2, '4. Skala jarak'),
    '',
    table(['Token', 'Nilai', 'Dipakai untuk'], SCALE),
    '',
    h(2, '5. Radius & elevasi'),
    '',
    table(
      ['Token', 'Nilai', 'Dipakai untuk'],
      [
        ['--radius-sm', '10px', 'Tombol, isian, penanda'],
        ['--radius-md', '12px', 'Kartu kecil, panel'],
        ['--radius-lg', '16px', 'Kartu utama, dialog'],
        ['--radius-pill', '9999px', 'Penanda status, lencana'],
        ['--shadow-raise', '0 24px 60px -32px rgba(0,0,0,.8)', 'Kartu mengambang di atas latar'],
        ['--shadow-focus', '0 0 0 3px #ff5c2026', 'Cincin fokus pada isian aktif']
      ]
    ),
    '',
    h(2, '6. Komponen inti'),
    '',
    h(3, 'Tombol'),
    '',
    table(
      ['Varian', 'Latar', 'Tepi', 'Dipakai untuk'],
      [
        ['Primer', 'accent', 'tanpa tepi', 'Aksi utama, satu per layar'],
        ['Sekunder', '#ffffff0a', 'border', 'Aksi pendamping'],
        ['Hening', 'transparan', 'border', 'Aksi dalam baris tabel'],
        ['Bahaya', 'danger', 'tanpa tepi', 'Hapus permanen']
      ]
    ),
    '',
    'Keadaan: normal, hover (naik 4% kecerahan), aktif (turun 1px), fokus (cincin 3px), nonaktif (opasitas 45%), memuat (teks diganti status).',
    '',
    h(3, 'Isian teks'),
    '',
    bullets([
      'Tinggi 42px, radius 10px, latar lebih gelap dari panel.',
      'Label selalu di atas isian, tidak memakai placeholder sebagai label.',
      'Pesan galat muncul di bawah isian dengan warna bahaya dan ikon.',
      'Fokus memakai cincin aksen, bukan perubahan tebal tepi saja.'
    ]),
    '',
    h(3, 'Tabel data'),
    '',
    bullets([
      'Baris 44px, kepala tabel 12px huruf besar semua dengan warna sekunder.',
      'Kolom angka rata kanan, memakai angka tabular.',
      'Keadaan kosong memuat satu kalimat dan satu aksi.',
      'Paginasi berbasis kursor; nomor halaman hanya bila perlu melompat.'
    ]),
    '',
    h(3, 'Penanda status'),
    '',
    table(
      ['Status', 'Warna', 'Teks'],
      [
        ['Selesai', 'success', 'Selesai'],
        ['Berjalan', 'accent', 'Diproses'],
        ['Menunggu', 'warning', 'Menunggu'],
        ['Gagal', 'danger', 'Gagal'],
        ['Netral', 'text-muted', 'Draf']
      ]
    ),
    '',
    h(2, '7. Pola tata letak'),
    '',
    code('text', [
      'Shell aplikasi',
      '┌──────────────────────────────────────────┐',
      '│ Header: merek · navigasi · aksi akun     │ 68px',
      '├──────────┬───────────────────────────────┤',
      '│ Sidebar  │ Area isi                      │',
      '│ 268px    │ max-width 1152px, padding 24  │',
      '└──────────┴───────────────────────────────┘',
      'Lebar patah: 1040px (sidebar jadi atas), 820px (navigasi ringkas), 480px (satu kolom).'
    ].join('\n')),
    '',
    h(2, '8. Gerak'),
    '',
    table(
      ['Kejadian', 'Durasi', 'Kurva'],
      [
        ['Hover tombol', '140ms', 'ease-out'],
        ['Buka panel', '200ms', 'cubic-bezier(.2,.8,.2,1)'],
        ['Notifikasi muncul', '200ms', 'ease-out'],
        ['Perpindahan halaman', 'tanpa animasi', '—']
      ]
    ),
    '',
    h(2, '9. Aksesibilitas'),
    '',
    bullets([
      'Semua kontrol dapat dicapai dengan Tab, urutan sesuai bacaan.',
      'Fokus terlihat jelas pada latar gelap; jangan menghapus outline tanpa pengganti.',
      'Ikon dekoratif diberi `aria-hidden`, ikon aksi punya label teks tersembunyi.',
      'Target sentuh minimum 40×40px.',
      'Hormati `prefers-reduced-motion`.'
    ]),
    '',
    h(2, '10. Suara antarmuka'),
    '',
    table(
      ['Konteks', 'Tulis begini', 'Bukan begini'],
      [
        ['Tombol simpan', 'Simpan perubahan', 'Submit'],
        ['Keadaan kosong', 'Belum ada data. Tambah yang pertama.', 'Error 404'],
        ['Galat validasi', 'Email belum lengkap. Contoh: nama@domain.com', 'Input tidak valid'],
        ['Konfirmasi hapus', 'Hapus 3 item? Tindakan ini tidak bisa dibatalkan.', 'Anda yakin?']
      ]
    ),
    ''
  ].join('\n');
}
