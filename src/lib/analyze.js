import { detectDomain, GENERIC } from '../data/domains/index.js';

const STOP = new Set(['untuk','yang','dan','atau','dengan','dari','agar','bisa','dapat','saya','aku','kami','kita','membantu','membuat','bikin','sebuah','suatu','para','bagi','di','ke','pada','ini','itu','adalah','akan','supaya','secara','juga','buat','bantu','memudahkan','mempermudah','mengelola','mengatur','memantau','mencatat','menjual','menjadi','dalam','a','an','the','for','with','that','this','and','or','to','of','build','make','help','helps','app','aplikasi','website','situs','web','platform','sistem']);

const PLATFORM_HINTS = [
  [/\b(mobile|android|ios|hp|ponsel|aplikasi hp)\b/i, 'Web + mobile (PWA dulu)'],
  [/\b(pos|kasir|tablet)\b/i, 'Web responsif, dioptimalkan untuk tablet kasir'],
  [/\b(api|backend|layanan)\b/i, 'API-first dengan UI tipis di atasnya'],
  [/\b(marketplace|multi vendor|penjual)\b/i, 'Web responsif, dua sisi pengguna (penjual & pembeli)']
];

function titleCase(s) {
  return s
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function slugify(s) {
  const words = s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/-+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out = [];
  let len = 0;
  for (const w of words) {
    if (len + w.length + (out.length ? 1 : 0) > 30) break;
    out.push(w);
    len += w.length + 1;
  }
  return out.join('-') || 'produk-baru';
}

const NAME_STOP = /\b(untuk|dengan|agar|yang|supaya|biar|dari|pada|serta|dan|atau|di|ke|buat|sebagai|milik|saya|aku|kami|kita|bisa|dapat|agar)\b/i;

function cleanName(s) {
  let out = s.split(NAME_STOP)[0].trim().replace(/[.,;:!?"'“”]+$/, '').trim();
  // buang kata sambung di ujung
  out = out.replace(/\s+(dan|atau|untuk|dengan|di|ke|dari|pada|yang)$/i, '').trim();
  return out;
}

/** Ambil frasa nama produk bila pengguna menuliskannya, misal "bernama Kasbon". */
function explicitName(text) {
  const m = text.match(/\b(?:bernama|nama(?:nya)?|disebut|brand|merek)\s+["“']?([A-Za-z0-9][A-Za-z0-9 .-]{1,40})/i);
  if (!m) return null;
  const cleaned = cleanName(m[1]);
  if (!cleaned || cleaned.length < 2) return null;
  return titleCase(cleaned.slice(0, 26));
}

function presentParticiple(text) {
  // "untuk mencatat keuangan" -> "Pencatat Keuangan"
  const m = text.match(/\b(?:untuk|supaya|agar|bantu(?:n)?)\s+(me[a-z]+|meng[a-z]+|mem[a-z]+)\s+([a-z0-9\s]{3,40})/i);
  if (!m) return null;
  const verbRoot = m[1].toLowerCase();
  const objWords = cleanName(m[2])
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .slice(0, 2);
  if (!objWords.length) return null;
  const map = { mencatat: 'Pencatat', mengelola: 'Kelola', mengatur: 'Atur', memantau: 'Pantau', menjual: 'Penjual', membuat: 'Pembuat', mengirim: 'Pengirim', memesan: 'Pemesanan', mengajar: 'Pengajar', membantu: 'Bantu', melacak: 'Pelacak', mengingatkan: 'Pengingat', mencari: 'Pencari', menyimpan: 'Penyimpan', booking: 'Pemesanan', mendata: 'Pendata', menagih: 'Penagih', mengurus: 'Pengurus' };
  const prefix = map[verbRoot] || 'Kelola';
  return { prefix, object: titleCase(objWords.join(' ')) };
}

function pickKeywords(text, limit = 5) {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
  )].slice(0, limit);
}

export function analyze(idea) {
  const raw = (idea || '').trim();
  const domain = detectDomain(raw);
  const pp = presentParticiple(raw);
  const name = explicitName(raw) || (pp && pp.object ? `${pp.prefix} ${pp.object}` : null) || (raw ? titleCase(pickKeywords(raw, 2).join(' ')) || 'Produk Baru' : 'Produk Baru');

  const lowered = raw.toLowerCase();
  const platform =
    (PLATFORM_HINTS.find(([re]) => re.test(lowered)) || [])[1] ||
    'Web responsif (desktop & ponsel)';

  const hasAuth = !/\b(tanpa akun|tanpa login|anonim)\b/i.test(lowered);
  const sensitive = /\b(kesehatan|medis|pasien|keuangan|pembayaran|kartu kredit|anak|data pribadi|gaji)\b/i.test(lowered);

  const d = domain.domain || GENERIC;
  const generatedAt = new Date();

  return {
    idea: raw,
    name,
    slug: slugify(name),
    domainId: d.id,
    domainLabel: d.label,
    domain: d,
    matchedKeywords: domain.hits || [],
    runnersUp: domain.runnersUp || [],
    platform,
    hasAuth,
    sensitive,
    keywords: pickKeywords(raw, 6),
    generatedAtISO: generatedAt.toISOString().slice(0, 10),
    version: '1.0.0'
  };
}

export { titleCase };
