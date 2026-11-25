import { commerce, saas } from './commerce.js';
import { education, health } from './education.js';
import { finance, community } from './finance.js';
import { logistics, productivity } from './operations.js';

export const DOMAINS = [commerce, saas, education, health, finance, community, logistics, productivity];

export const GENERIC = {
  id: 'generic',
  label: 'Umum (perlu disesuaikan)',
  keywords: [],
  summary: 'Aplikasi web dengan pengguna, entitas inti, alur kerja utama, dan dasbor ringkas.',
  actors: [
    ['Pengguna', 'Mendaftar, membuat data, menjalankan alur utama.'],
    ['Admin', 'Meninjau data, menangani laporan, mengatur konten.']
  ],
  features: [
    ['Autentikasi', 'Daftar, masuk, kelola sesi, pemulihan kata sandi.', 'P0'],
    ['Entitas inti', 'Buat, baca, ubah, hapus dengan validasi.', 'P0'],
    ['Alur utama', 'Satu jalur utama dari input pengguna sampai hasil.', 'P0'],
    ['Dasbor ringkas', 'Angka kunci dan aktivitas terbaru.', 'P1'],
    ['Notifikasi', 'Email untuk kejadian penting.', 'P1'],
    ['Ekspor data', 'Unduh data pengguna dalam format terbuka.', 'P2']
  ],
  entities: [
    ['users', 'id, email, nama, peran, created_at'],
    ['<entitas_inti>', 'id, owner_id, judul, status, created_at, updated_at'],
    ['sessions', 'id, user_id, token_hash, kedaluwarsa'],
    ['notifications', 'id, user_id, jenis, dibaca_at, created_at']
  ],
  endpoints: [
    ['POST', '/auth/signup', 'Buat akun baru.'],
    ['GET', '/<entitas>', 'Daftar dengan paginasi.'],
    ['POST', '/<entitas>', 'Buat data baru.'],
    ['PATCH', '/<entitas>/{id}', 'Ubah data milik pengguna.'],
    ['GET', '/summary', 'Angka ringkas untuk dasbor.']
  ],
  metrics: [
    ['Aktivasi', 'Pengguna yang menyelesaikan alur utama sekali', '≥ 50%'],
    ['Retensi mingguan', 'Pengguna kembali dalam 7 hari', '≥ 30%'],
    ['P95 waktu respons API', 'Server-side di bawah beban normal', '< 300 ms'],
    ['Galat 5xx', 'Porsi permintaan gagal', '< 0,5%']
  ],
  risks: [
    ['Akses data pengguna lain', 'Filter kepemilikan di setiap query, bukan hanya di tampilan.'],
    ['Validasi hanya di klien', 'Ulangi semua validasi di server.'],
    ['Rahasia di kode', 'Semua kunci lewat variabel lingkungan.']
  ],
  uxNotes: [
    'Satu aksi utama per layar.',
    'Keadaan kosong selalu menawarkan langkah lanjut.',
    'Pesan galat menyebut apa yang bisa dilakukan pengguna.'
  ],
  nonGoals: ['Aplikasi native', 'Integrasi pihak ketiga selain email', 'Analitik lanjutan']
};

/** Skor kecocokan sederhana: hitung kata kunci domain yang muncul di teks. */
export function detectDomain(text) {
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ') + ' ';
  const scores = DOMAINS.map((d) => {
    let score = 0;
    const hits = [];
    for (const kw of d.keywords) {
      const needle = ' ' + kw + ' ';
      if (t.includes(needle) || t.includes(' ' + kw)) {
        score += kw.includes(' ') ? 3 : 2;
        hits.push(kw);
      }
    }
    return { domain: d, score, hits };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best || best.score === 0) {
    return { domain: GENERIC, score: 0, hits: [], runnersUp: [] };
  }
  return {
    domain: best.domain,
    score: best.score,
    hits: [...new Set(best.hits)].slice(0, 4),
    runnersUp: scores.filter((s) => s.score > 0 && s.domain.id !== best.domain.id).slice(0, 2).map((s) => s.domain.label)
  };
}
