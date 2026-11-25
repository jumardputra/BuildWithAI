import { table, bullets, h, frontmatter } from '../md.js';

export function prd(spec) {
  const d = spec.domain;
  const p0 = d.features.filter((f) => f[2] === 'P0');
  const p1 = d.features.filter((f) => f[2] === 'P1');
  const p2 = d.features.filter((f) => f[2] === 'P2');

  return [
    frontmatter({
      dokumen: 'product-requirements',
      produk: spec.name,
      versi: spec.version,
      diperbarui: spec.generatedAtISO,
      status: 'draf untuk ditinjau'
    }),
    '',
    h(1, `PRD — ${spec.name}`),
    '',
    `> ${d.summary}`,
    '',
    h(2, '1. Ringkasan'),
    '',
    `**${spec.name}** dibangun dari satu kalimat ide berikut:`,
    '',
    `> "${spec.idea}"`,
    '',
    `Kategori terdeteksi: **${spec.domainLabel}**. Platform sasaran: ${spec.platform}.`,
    '',
    `Masalah yang diselesaikan: pengguna saat ini menjalankan proses ini secara manual atau tersebar di banyak berkas, sehingga ${spec.sensitive ? 'data sensitif mudah salah tempat dan sulit diaudit' : 'status pekerjaan sulit diketahui dan pekerjaan berulang'}. Produk ini memusatkannya dalam satu alur yang dapat diulang.`,
    '',
    h(2, '2. Tujuan & ukuran keberhasilan'),
    '',
    table(['Metrik', 'Definisi', 'Target 3 bulan'], d.metrics),
    '',
    h(2, '3. Pengguna & peran'),
    '',
    table(['Peran', 'Yang mereka lakukan'], d.actors),
    '',
    h(2, '4. Lingkup fitur'),
    '',
    h(3, '4.1 Wajib (P0)'),
    '',
    table(['Fitur', 'Deskripsi', 'Prioritas'], p0),
    '',
    h(3, '4.2 Penting (P1)'),
    '',
    table(['Fitur', 'Deskripsi', 'Prioritas'], p1.length ? p1 : [['—', 'Tidak ada pada rilis pertama', '—']]),
    '',
    h(3, '4.3 Nanti (P2)'),
    '',
    table(['Fitur', 'Deskripsi', 'Prioritas'], p2.length ? p2 : [['—', 'Belum dijadwalkan', '—']]),
    '',
    h(2, '5. Di luar lingkup'),
    '',
    bullets(d.nonGoals),
    '',
    h(2, '6. Alur pengguna utama'),
    '',
    d.actors.map(([peran, tugas], i) => `**Alur ${i + 1} — ${peran}**\n\n${flowFor(peran, tugas, d, spec)}`).join('\n\n'),
    '',
    h(2, '7. Cerita pengguna'),
    '',
    p0
      .map(([nama, deskripsi], i) => {
        const actor = d.actors[i % d.actors.length][0];
        const value = deskripsi.charAt(0).toLowerCase() + deskripsi.slice(1).replace(/\.$/, '');
        return `- **Sebagai ${actor.toLowerCase()}**, saya ingin ${nama.toLowerCase()}, agar ${value}.`;
      })
      .join('\n'),
    '',
    h(2, '8. Asumsi & ketergantungan'),
    '',
    bullets([
      spec.hasAuth ? 'Pengguna bersedia membuat akun; email transaksional tersedia.' : 'Akses anonim diizinkan; data disimpan per perangkat.',
      'Ada satu penyedia pembayaran atau pengiriman email yang sudah disetujui.',
      'Desain awal memakai komponen internal; tidak ada kebutuhan merek khusus.',
      spec.sensitive ? 'Kepatuhan dasar pemrosesan data pribadi ditinjau sebelum rilis.' : 'Belum ada kebutuhan audit formal.'
    ]),
    '',
    h(2, '9. Risiko produk & mitigasi'),
    '',
    table(['Risiko', 'Mitigasi'], d.risks),
    '',
    h(2, '10. Pertanyaan terbuka'),
    '',
    bullets([
      'Siapa pemilik keputusan untuk perubahan lingkup P0?',
      `Apakah ${d.label.toLowerCase()} punya aturan khusus yang membatasi data yang boleh disimpan?`,
      'Bagaimana perilaku saat data awal diimpor dari sistem lama?',
      'Apa definisi "selesai" yang disepakati untuk uji coba pertama?'
    ]),
    ''
  ].join('\n');
}

function flowFor(peran, tugas, d, spec) {
  const p0 = d.features.filter((f) => f[2] === 'P0').map((f) => f[0]);
  const own = d.actorFlows && d.actorFlows[peran];
  const steps = own || [
    `${spec.hasAuth ? 'Membuka aplikasi dan masuk ke akun.' : 'Membuka aplikasi; sesi anonim dibuat otomatis.'}`,
    `Menjalankan ${p0[0] ? p0[0].toLowerCase() : 'langkah utama'} untuk data yang menjadi tanggung jawabnya.`,
    `Melanjutkan ke ${p0[1] ? p0[1].toLowerCase() : 'pemeriksaan hasil'} bila diperlukan.`,
    'Memeriksa hasil dan kembali ke ringkasan; setiap perubahan tercatat waktu dan pelakunya.'
  ];
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
}
