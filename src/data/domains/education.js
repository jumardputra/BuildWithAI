// Domain pack: pendidikan & kursus
export const education = {
  id: 'education',
  label: 'Pendidikan & kursus',
  keywords: ['kursus', 'belajar', 'siswa', 'murid', 'guru', 'sekolah', 'kampus', 'ujian', 'kelas', 'materi', 'edukasi', 'pelatihan', 'bootcamp', 'les', 'tryout'],
  summary: 'Kelas terstruktur dengan materi, tugas, dan penilaian untuk pengajar dan peserta.',
  actors: [
    ['Peserta didik', 'Mengikuti materi berurutan, mengumpulkan tugas, melihat nilai.'],
    ['Pengajar', 'Menyusun silabus, mengunggah materi, menilai tugas.'],
    ['Penyelenggara', 'Mengatur pendaftaran, jadwal, dan sertifikat.']
  ],
  features: [
    ['Katalog kelas', 'Daftar kelas dengan silabus singkat, durasi, dan prasyarat.', 'P0'],
    ['Pendaftaran', 'Alur daftar, konfirmasi email, akses materi setelah pembayaran dikonfirmasi.', 'P0'],
    ['Materi berurutan', 'Modul dan pelajaran dengan progres tersimpan per pengguna.', 'P0'],
    ['Tugas & penilaian', 'Pengumpulan berkas/teks, tenggat, rubrik, dan umpan balik.', 'P0'],
    ['Diskusi kelas', 'Tanya jawab per pelajaran, moderasi pengajar.', 'P1'],
    ['Sertifikat', 'Terbit otomatis saat semua syarat nilai terpenuhi.', 'P1'],
    ['Laporan progres', 'Untuk pengajar dan peserta didik.', 'P2']
  ],
  entities: [
    ['users', 'id, email, nama, peran (student|teacher|admin)'],
    ['courses', 'id, teacher_id, slug, judul, ringkasan, level, durasi_jam, status'],
    ['modules', 'id, course_id, judul, urutan'],
    ['lessons', 'id, module_id, judul, tipe (video|teks|kuis), konten_url, durasi_menit, urutan'],
    ['enrollments', 'id, course_id, user_id, status, enrolled_at, selesai_at'],
    ['progress', 'id, enrollment_id, lesson_id, selesai_at'],
    ['assignments', 'id, lesson_id, instruksi, tenggat, nilai_maks'],
    ['submissions', 'id, assignment_id, user_id, isi, berkas_url, nilai, umpan_balik, dinilai_at'],
    ['certificates', 'id, enrollment_id, nomor, terbit_at']
  ],
  endpoints: [
    ['GET', '/courses', 'Katalog dengan filter level dan durasi.'],
    ['POST', '/enrollments', 'Daftar kelas; tolak bila kuota atau prasyarat belum terpenuhi.'],
    ['GET', '/courses/{id}/syllabus', 'Modul + pelajaran + status progres pengguna.'],
    ['POST', '/lessons/{id}/complete', 'Tandai selesai; idempoten.'],
    ['POST', '/assignments/{id}/submissions', 'Kumpulkan tugas; simpan versi sebelumnya.'],
    ['PATCH', '/submissions/{id}/grade', 'Penilaian oleh pengajar disertai umpan balik.']
  ],
  metrics: [
    ['Penyelesaian kelas', 'Pendaftar yang menyelesaikan semua modul', '≥ 45%'],
    ['Waktu tanggapan pengajar', 'Median waktu menilai tugas', '< 48 jam'],
    ['Keterlibatan mingguan', 'Peserta didik dengan ≥ 1 pelajaran selesai per minggu', '≥ 60%'],
    ['Tingkat pengumpulan tugas', 'Tugas terkumpul / tugas diberikan', '≥ 80%']
  ],
  risks: [
    ['Progres hilang saat ganti perangkat', 'Simpan progres di server per pelajaran, bukan di penyimpanan lokal.'],
    ['Akses materi tanpa membayar', 'Periksa status pendaftaran pada setiap permintaan materi terproteksi.'],
    ['Nilai diubah setelah terbit', 'Kunci nilai setelah sertifikat terbit, buka lewat alur revisi.']
  ],
  uxNotes: [
    'Kurikulum tampil sebagai daftar pendek, bukan pohon dalam yang berlipat.',
    'Setiap pelajaran berakhir dengan satu aksi lanjut: "Tandai selesai" atau "Kerjakan tugas".',
    'Umpan balik pengajar muncul di samping tugas, bukan di halaman terpisah.'
  ],
  nonGoals: ['Kelas langsung lewat video bawaan', 'Ujian berbasis pengawasan kamera', 'Toko kursus pihak ketiga'],
  actorFlows: {
    'Peserta didik': [
      'Membuka katalog, membandingkan silabus dan durasi antar kelas.',
      'Mendaftar, menyelesaikan pembayaran, menerima akses materi.',
      'Mengikuti pelajaran berurutan; progres tersimpan otomatis.',
      'Mengerjakan tugas, mengunggah berkas, menunggu penilaian.',
      'Melihat nilai dan umpan balik, lalu mengunduh sertifikat saat syarat terpenuhi.'
    ],
    'Pengajar': [
      'Masuk, membuat kelas baru dengan judul dan ringkasan.',
      'Menyusun modul dan pelajaran, mengunggah materi.',
      'Membuat tugas dengan tenggat dan rubrik penilaian.',
      'Meninjau kiriman, memberi nilai dan umpan balik.',
      'Melihat progres kelas dan menghubungi peserta yang tertinggal.'
    ],
    'Penyelenggara': [
      'Mengatur jadwal kelas dan kuota per angkatan.',
      'Memantau pendaftaran dan konfirmasi pembayaran.',
      'Menetapkan pengajar pada tiap kelas.',
      'Menerbitkan sertifikat dan mengekspor daftar lulusan.'
    ]
  }
};

// Domain pack: kesehatan
export const health = {
  id: 'health',
  label: 'Kesehatan & klinik',
  keywords: ['klinik', 'dokter', 'pasien', 'kesehatan', 'jadwal konsultasi', 'apotek', 'obat', 'rekam medis', 'terapi', 'rumah sakit', 'bidan'],
  summary: 'Pendaftaran pasien, jadwal temu, catatan konsultasi, dan resep dengan penanganan data sensitif.',
  actors: [
    ['Pasien', 'Mendaftar, memilih jadwal, mengisi keluhan awal, melihat ringkasan konsultasi.'],
    ['Dokter', 'Membuka jadwal, membaca riwayat, menulis catatan dan resep.'],
    ['Staf pendaftaran', 'Mengelola antrean, memindahkan jadwal, menangani pembatalan.']
  ],
  features: [
    ['Pendaftaran pasien', 'Data dasar, persetujuan pemrosesan data kesehatan, nomor rekam medis.', 'P0'],
    ['Jadwal & antrean', 'Slot dokter, pemesanan, pembatalan, pengingat.', 'P0'],
    ['Catatan konsultasi', 'Keluhan, diagnosis, tindakan, catatan privat per peran.', 'P0'],
    ['Resep', 'Item obat, dosis, aturan pakai, status penebusan.', 'P0'],
    ['Riwayat kunjungan', 'Garis waktu konsultasi sebelumnya untuk dokter yang menangani.', 'P1'],
    ['Pengingat', 'Email/WhatsApp untuk jadwal dan kontrol ulang.', 'P1'],
    ['Laporan operasional', 'Okupansi slot, waktu tunggu, pembatalan.', 'P2']
  ],
  entities: [
    ['patients', 'id, user_id, no_rekam_medis, tanggal_lahir, gol_darah, kontak_darurat'],
    ['doctors', 'id, user_id, spesialisasi, nomor_str, bio'],
    ['schedules', 'id, doctor_id, mulai, selesai, kuota, lokasi'],
    ['appointments', 'id, patient_id, schedule_id, status, keluhan_awal, created_at'],
    ['consultations', 'id, appointment_id, catatan, diagnosis_kode, private_note, finalized_at'],
    ['prescriptions', 'id, consultation_id, status, ditebus_at'],
    ['prescription_items', 'id, prescription_id, nama_obat, dosis, aturan_pakai, jumlah'],
    ['consents', 'id, patient_id, jenis, versi_dokumen, granted_at, revoked_at'],
    ['audit_log', 'id, actor_id, aksi, patient_id, created_at']
  ],
  endpoints: [
    ['POST', '/patients', 'Daftar pasien baru + rekam persetujuan.'],
    ['GET', '/doctors/{id}/schedules', 'Slot tersedia dalam rentang tanggal.'],
    ['POST', '/appointments', 'Pesan slot dengan penguncian singkat untuk mencegah bentrok.'],
    ['POST', '/appointments/{id}/cancel', 'Batal dengan alasan; lepas slot.'],
    ['POST', '/consultations/{id}/finalize', 'Kunci catatan, terbitkan resep, catat audit.'],
    ['GET', '/patients/me/consultations', 'Riwayat ringkas untuk pasien sendiri.']
  ],
  metrics: [
    ['Waktu tunggu', 'Median selisih jadwal vs mulai konsultasi', '< 15 menit'],
    ['Pembatalan', 'Appointment batal / total', '< 12%'],
    ['Kelengkapan catatan', 'Konsultasi selesai dengan diagnosis terisi', '≥ 95%'],
    ['Kepatuhan pengingat', 'Pasien yang hadir setelah diingatkan', '≥ 88%']
  ],
  risks: [
    ['Data kesehatan terekspos', 'Enkripsi saat disimpan, akses berbasis peran, setiap pembacaan tercatat di audit_log.'],
    ['Catatan privat terbaca pasien', 'Pisahkan private_note dan saring di lapisan API, bukan di tampilan.'],
    ['Slot bentrok', 'Kunci baris jadwal selama transaksi pemesanan.'],
    ['Persetujuan tidak terlacak', 'Simpan versi dokumen persetujuan dan waktu pencabutannya.']
  ],
  uxNotes: [
    'Bahasa tenang, tanpa istilah teknis medis di sisi pasien.',
    'Setiap aksi yang mengubah data medis meminta konfirmasi eksplisit.',
    'Riwayat selalu berbentuk garis waktu, bukan tabel padat.'
  ],
  nonGoals: ['Telemedicine video di rilis pertama', 'Integrasi klaim asuransi', 'Perangkat medis IoT'],
  actorFlows: {
    'Pasien': [
      'Mendaftar dengan data dasar, menyetujui pemrosesan data kesehatan.',
      'Memilih dokter dan slot yang tersedia pada kalender.',
      'Mengisi keluhan awal, menerima konfirmasi dan pengingat.',
      'Datang, menjalani konsultasi, melihat ringkasan dan resep.',
      'Menjadwalkan kontrol ulang dari halaman riwayat.'
    ],
    'Dokter': [
      'Membuka jadwal praktik dan menetapkan kuota slot.',
      'Melihat antrean pasien hari ini beserta keluhan awal.',
      'Membuka riwayat kunjungan pasien yang sedang ditangani.',
      'Menulis catatan konsultasi, diagnosis, dan resep.',
      'Mengunci catatan; setelah itu perubahan hanya lewat revisi tercatat.'
    ],
    'Staf pendaftaran': [
      'Memantau antrean dan slot yang terisi.',
      'Memindahkan atau membatalkan jadwal dengan alasan.',
      'Menghubungi pasien yang belum hadir setelah batas waktu.',
      'Mencetak atau mengirim ringkasan jadwal harian.'
    ]
  }
};
