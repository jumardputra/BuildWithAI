import { prd } from './prd.js';
import { designSystem } from './design.js';
import { architecture } from './architecture.js';
import { database } from './database.js';
import { api } from './api.js';
import { roadmap, tasks } from './roadmap.js';
import { userFlow, decisions, readme, metrics } from './support.js';

/** Urutan tampil; tiap entri mendefinisikan ringkasan pendek + pembuat isi. */
export const DOC_FILES = [
  { name: 'prd.md', label: 'Kebutuhan Produk', desc: 'Masalah, tujuan, fitur berprioritas', icon: 'PRD', build: prd },
  { name: 'design-system.md', label: 'Sistem Desain', desc: 'Warna, huruf, jarak, komponen', icon: 'DS', build: designSystem },
  { name: 'architecture.md', label: 'Arsitektur', desc: 'Tumpukan, diagram, batasan modul', icon: 'ARC', build: architecture },
  { name: 'database.md', label: 'Basis Data', desc: 'Skema, DDL, indeks, migrasi', icon: 'DB', build: database },
  { name: 'api-spec.md', label: 'Spesifikasi API', desc: 'Endpoint, contoh, galat, batas laju', icon: 'API', build: api },
  { name: 'user-flows.md', label: 'Alur Pengguna', desc: 'Peta layar dan keadaan khusus', icon: 'UX', build: userFlow },
  { name: 'roadmap.md', label: 'Roadmap', desc: 'Fase pengerjaan, kriteria rilis', icon: 'RM', build: roadmap },
  { name: 'tasks.md', label: 'Daftar Tugas', desc: 'Pekerjaan per area, siap dieksekusi', icon: 'TASK', build: tasks },
  { name: 'metrics.md', label: 'Metrik', desc: 'Ukuran keberhasilan dan cara mengukurnya', icon: 'MT', build: metrics },
  { name: 'decisions.md', label: 'Catatan Keputusan', desc: 'ADR: konteks, keputusan, konsekuensi', icon: 'ADR', build: decisions },
  { name: 'README.md', label: 'Panduan Paket', desc: 'Cara memakai seluruh berkas', icon: 'RD', build: readme }
];

export function buildBundle(spec) {
  return DOC_FILES.map((f) => {
    let content = '';
    try {
      content = f.build(spec);
    } catch (err) {
      content = `# ${f.name}\n\nGagal menyusun berkas ini: ${err.message}\n`;
    }
    return {
      name: f.name,
      label: f.label,
      desc: f.desc,
      icon: f.icon,
      content,
      bytes: new Blob([content]).size,
      lines: content.split('\n').length
    };
  });
}
