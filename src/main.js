import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/forms.css';
import './styles/utilities.css';

import { analyze } from './lib/analyze.js';
import { buildBundle, DOC_FILES } from './lib/docs/index.js';
import { renderMarkdown } from './lib/render.js';
import { makeZip, download, copyText, toast } from './lib/export.js';
import { api } from './lib/api.js';
import { initAuth } from './lib/auth.js';
import { el, replace, clear } from './lib/dom.js';

const STORAGE_KEY = 'rakit.workspace.v1';

const state = {
  idea: '',
  spec: null,
  bundle: [],
  active: 0,
  view: 'rapi'
};

/* ---------- Header ---------- */
function initHeader() {
  const head = document.querySelector('.site-head');
  const btn = document.querySelector('.nav-toggle');
  if (btn && head) {
    btn.addEventListener('click', () => {
      const open = head.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }
  // Penanda halaman aktif berdasarkan jalur tanpa ekstensi
  const here = (location.pathname.replace(/\/+$/, '') || '/');
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = (a.getAttribute('href') || '').replace(/\/+$/, '') || '/';
    if (href === here) a.setAttribute('aria-current', 'page');
  });
}

/* ---------- Contoh ide ---------- */
const SAMPLES = [
  'Aplikasi kasir untuk warung kopi agar saya bisa mencatat penjualan harian dan stok bahan',
  'Website kursus bahasa Inggris dengan kelas berurutan, tugas, dan sertifikat',
  'Platform untuk komunitas fotografi yang bisa menerbitkan artikel dan berdiskusi',
  'Sistem booking teknisi AC untuk melacak jadwal kunjungan dan bukti servis',
  'Aplikasi pencatat keuangan bulanan untuk usaha kecil dengan laporan arus kas',
  'Alat manajemen proyek untuk tim kecil dengan tugas, tenggat, dan riwayat perubahan'
];

function sampleForIndex(i) {
  return SAMPLES[i % SAMPLES.length];
}

/* ---------- Beranda ---------- */
function initHome() {
  const form = document.querySelector('[data-idea-form]');
  if (!form) return;
  const input = form.querySelector('textarea');
  const quick = form.querySelector('[data-generate]');
  const chips = document.querySelectorAll('[data-sample]');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.sample;
      input.focus();
    });
  });

  const go = () => {
    const idea = input.value.trim();
    if (idea.length < 8) {
      input.focus();
      input.setAttribute('aria-invalid', 'true');
      toast('Tulis sedikit lebih lengkap dulu, minimal satu kalimat.');
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY + '.idea', idea);
    } catch { /* mode privat: lanjut saja */ }
    location.href = `/ruang-kerja/?ide=${encodeURIComponent(idea.slice(0, 400))}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    go();
  });
  if (quick) quick.addEventListener('click', go);

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    const counter = form.querySelector('[data-counter]');
    if (counter) counter.textContent = `${input.value.trim().length} karakter`;
  });

  // Pemilihan domain pada kartu kategori
  document.querySelectorAll('[data-domain-pick]').forEach((tile) => {
    tile.addEventListener('click', () => {
      const text = tile.dataset.domainPick;
      input.value = text;
      input.focus();
      location.hash = '';
      if (typeof input.scrollIntoView === 'function') {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      input.focus();
    });
  });
}

/* ---------- Ruang kerja ---------- */
function initWorkspace() {
  const root = document.querySelector('[data-workspace]');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  let idea = params.get('ide') || '';
  if (!idea) {
    try { idea = sessionStorage.getItem(STORAGE_KEY + '.idea') || ''; } catch { idea = ''; }
  }
  if (!idea) {
    replace(root, [
      el('div', { class: 'empty-state' }, [
        el('h3', { text: 'Belum ada ide untuk diolah' }),
        el('p', { text: 'Mulai dari satu kalimat di halaman utama, lalu kami susun seluruh dokumen pendukungnya di sini.' }),
        el('p', { style: { marginTop: '18px' } }, [
          el('a', { class: 'btn btn-primary', href: '/' }, ['Tulis ide saya'])
        ])
      ])
    ]);
    return;
  }

  state.idea = idea;
  state.spec = analyze(idea);
  state.bundle = buildBundle(state.spec);

  renderSpecStrip(root);
  renderFileList(root);
  renderDoc(root);
  wireActions(root);
  initSaveToAccount(root);
  updateCounts(root);
}

function renderSpecStrip(root) {
  const strip = root.querySelector('[data-idea-strip]');
  if (!strip) return;
  const s = state.spec;

  const editBtn = el('button', { class: 'btn btn-quiet', type: 'button' }, ['Ubah ide']);
  editBtn.addEventListener('click', () => {
    location.href = '/#tulis';
  });

  replace(strip, [
    el('span', { class: 'k', text: 'Ide asal' }),
    el('span', { class: 'v', text: s.idea }),
    editBtn
  ]);

  const tags = root.querySelector('[data-tags]');
  if (tags) {
    const nodes = [
      el('span', { class: 'tag tag-accent', text: s.domainLabel }),
      el('span', { class: 'tag', text: s.platform })
    ];
    for (const k of s.matchedKeywords.slice(0, 3)) nodes.push(el('span', { class: 'tag', text: k }));
    replace(tags, nodes);
  }
}

function updateCounts(root) {
  const c = root.querySelector('[data-count]');
  if (c) c.textContent = `${state.bundle.length} berkas`;
  const total = root.querySelector('[data-total-lines]');
  if (total) {
    const lines = state.bundle.reduce((n, f) => n + f.lines, 0);
    total.textContent = `${lines.toLocaleString('id-ID')} baris`;
  }
}

function renderFileList(root) {
  const list = root.querySelector('[data-file-list]');
  if (!list) return;

  const nodes = state.bundle.map((f, i) => {
    const btn = el('button', { class: 'file-item', type: 'button', role: 'tab' }, [
      el('span', { class: 'ti', 'aria-hidden': 'true', text: f.icon }),
      el('span', {}, [
        el('span', { class: 'fname', text: f.name }),
        el('span', { class: 'fdesc', text: f.label })
      ])
    ]);
    btn.setAttribute('aria-selected', String(i === state.active));
    btn.addEventListener('click', () => {
      state.active = i;
      renderFileList(root);
      renderDoc(root);
      const body = root.querySelector('.doc-body');
      if (body && window.innerWidth < 1040 && typeof body.scrollIntoView === 'function') {
        body.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return btn;
  });

  replace(list, nodes);
}

function renderDoc(root) {
  const f = state.bundle[state.active];
  if (!f) return;

  const path = root.querySelector('[data-path]');
  if (path) {
    replace(path, [
      'docs ',
      el('span', { 'aria-hidden': 'true', text: '/' }),
      ' ',
      el('b', { text: f.name })
    ]);
  }
  const meta = root.querySelector('[data-doc-meta]');
  if (meta) meta.textContent = `${f.lines} baris · ${(f.bytes / 1024).toFixed(1)} KB`;

  const body = root.querySelector('[data-doc-body]');
  if (!body) return;

  if (state.view === 'rapi') {
    replace(body, [el('div', { class: 'md' }, [renderMarkdown(f.content)])]);
  } else {
    replace(body, [el('pre', { class: 'raw', text: f.content })]);
  }

  root.querySelectorAll('[data-view]').forEach((t) => {
    t.setAttribute('aria-selected', String(t.dataset.view === state.view));
  });
}

function wireActions(root) {
  root.querySelectorAll('[data-view]').forEach((t) => {
    t.addEventListener('click', () => {
      state.view = t.dataset.view;
      renderDoc(root);
    });
  });

  const copyBtn = root.querySelector('[data-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const f = state.bundle[state.active];
      const ok = await copyText(f.content);
      toast(ok ? `${f.name} disalin` : 'Tidak bisa menyalin di peramban ini');
    });
  }

  const dlBtn = root.querySelector('[data-download]');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const f = state.bundle[state.active];
      download(f.name, f.content);
      toast(`Mengunduh ${f.name}`);
    });
  }

  const zipBtn = root.querySelector('[data-zip]');
  if (zipBtn) {
    zipBtn.addEventListener('click', () => {
      const zip = makeZip(state.bundle, state.spec.slug);
      download(`${state.spec.slug}-dokumen.zip`, zip, 'application/zip');
      toast('Paket dokumen diunduh sebagai ZIP');
    });
  }

  const allBtn = root.querySelector('[data-copy-all]');
  if (allBtn) {
    allBtn.addEventListener('click', async () => {
      const text = state.bundle.map((f) => `<!-- ===== ${f.name} ===== -->\n\n${f.content}`).join('\n\n');
      const ok = await copyText(text);
      toast(ok ? `Semua ${state.bundle.length} berkas disalin` : 'Tidak bisa menyalin di peramban ini');
    });
  }

  // Unduh satu per satu (tanpa zip) sebagai cadangan
  const eachBtn = root.querySelector('[data-download-all]');
  if (eachBtn) {
    eachBtn.addEventListener('click', () => {
      state.bundle.forEach((f, i) => setTimeout(() => download(f.name, f.content), i * 220));
      toast('Mengunduh setiap berkas');
    });
  }

  // Saran ide lain
  const shuffle = root.querySelector('[data-shuffle]');
  if (shuffle) {
    shuffle.addEventListener('click', () => {
      const idx = Math.floor(Math.random() * SAMPLES.length);
      const idea = sampleForIndex(idx);
      try { sessionStorage.setItem(STORAGE_KEY + '.idea', idea); } catch { /* abaikan */ }
      location.href = `/ruang-kerja/?ide=${encodeURIComponent(idea)}`;
    });
  }
}

/* ---------- Halaman template: pratinjau tiap berkas ---------- */
function initTemplatePage() {
  const list = document.querySelector('[data-template-list]');
  if (!list) return;
  const previewHost = document.querySelector('[data-template-preview]');
  let spec;
  try {
    spec = analyze('Alat bantu kerja yang mengelola data bersama untuk tim kecil dengan peran dan riwayat perubahan');
  } catch {
    spec = analyze('Aplikasi web sederhana');
  }
  const bundle = buildBundle(spec);

  const buttons = bundle.map((f, i) => {
    const btn = el('button', { class: 'file-item', type: 'button', role: 'tab' }, [
      el('span', { class: 'ti', 'aria-hidden': 'true', text: f.icon }),
      el('span', {}, [
        el('span', { class: 'fname', text: f.name }),
        el('span', { class: 'fdesc', text: f.desc })
      ])
    ]);
    btn.setAttribute('aria-selected', String(i === 0));
    btn.addEventListener('click', () => show(i));
    return btn;
  });
  replace(list, buttons);

  function show(i) {
    const f = bundle[i];
    if (!f || !previewHost) return;
    replace(previewHost, [el('div', { class: 'md' }, [renderMarkdown(f.content)])]);
    buttons.forEach((b, n) => b.setAttribute('aria-selected', String(n === i)));
    const nm = document.querySelector('[data-tpl-name]');
    if (nm) nm.textContent = f.name;
    const stats = document.querySelector('[data-tpl-stats]');
    if (stats) stats.textContent = `${f.lines} baris · ${(f.bytes / 1024).toFixed(1)} KB`;
  }

  show(0);

  const dl = document.querySelector('[data-tpl-download]');
  if (dl) {
    dl.addEventListener('click', () => {
      const zip = makeZip(bundle, 'contoh-dokumen');
      download('contoh-dokumen.zip', zip, 'application/zip');
      toast('Contoh paket dokumen diunduh');
    });
  }
}

/* ---------- Status akun di kepala halaman ---------- */
async function initAccountBadge() {
  const slot = document.querySelector('[data-account-slot]');
  if (!slot) return;
  try {
    const { data } = await api.me();
    const u = data.user;
    replace(slot, [
      el('a', { class: 'btn btn-ghost btn-sm', href: '/akun/', title: u.email }, [
        el('span', { class: 'avatar', 'aria-hidden': 'true', text: initials(u.nama) }),
        el('span', { class: 'slot-name', text: firstName(u.nama) })
      ])
    ]);
  } catch {
    replace(slot, [
      el('a', { class: 'btn btn-ghost btn-sm', href: '/masuk/' }, ['Masuk']),
      el('a', { class: 'btn btn-primary btn-sm', href: '/daftar/' }, ['Daftar'])
    ]);
  }
}

function initials(nama) {
  return String(nama || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

function firstName(nama) {
  return String(nama || '').trim().split(/\s+/)[0] || 'Akun';
}

/* ---------- Menyimpan dokumen ke akun ---------- */
function initSaveToAccount(root) {
  const btn = root.querySelector('[data-save]');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Menyimpan…';
    try {
      await api.saveDoc({
        idea: state.idea,
        title: state.spec.name,
        domainId: state.spec.domainId,
        folder: state.spec.slug,
        fileCount: state.bundle.length
      });
      toast('Dokumen disimpan ke akun Anda');
      btn.textContent = 'Tersimpan';
      setTimeout(() => {
        btn.textContent = label;
        btn.disabled = false;
      }, 1600);
    } catch (err) {
      btn.textContent = label;
      btn.disabled = false;
      if (err.status === 401) {
        const next = encodeURIComponent('/ruang-kerja/' + location.search);
        location.href = `/masuk/?next=${next}`;
        return;
      }
      toast(err.message || 'Gagal menyimpan');
    }
  });
}

/* ---------- Mulai ---------- */
function boot() {
  initHeader();
  initHome();
  initWorkspace();
  initTemplatePage();
  initAuth();
  initAccountBadge();
}

document.addEventListener('DOMContentLoaded', boot);
