/**
 * Perender markdown menjadi simpul DOM, bukan string HTML.
 * Semua teks masuk lewat textContent, jadi tidak ada markup yang bisa disuntikkan.
 * Mendukung: heading, paragraf, daftar (-, 1.), kotak centang, blockquote,
 * blok kode berpagar, tabel pipa, garis mendatar, tebal/miring/kode sebaris,
 * tautan aman, dan frontmatter YAML (ditampilkan sebagai meta).
 */
import { el, safeHref } from './dom.js';

/* ---------- Inline ---------- */
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|(^|[\s(])\*([^*\n]+)\*/g;

function inlineNodes(src) {
  const out = [];
  const text = String(src);
  let last = 0;
  let m;

  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(document.createTextNode(text.slice(last, m.index)));
    const [full, code, bold, linkText, linkHref, prefix, italic] = m;

    if (code !== undefined) {
      out.push(el('code', { text: code }));
    } else if (bold !== undefined) {
      out.push(el('strong', { text: bold }));
    } else if (linkText !== undefined) {
      const href = safeHref(linkHref);
      if (href) {
        out.push(el('a', { href, rel: 'noreferrer noopener', text: linkText }));
      } else {
        out.push(document.createTextNode(linkText));
      }
    } else if (italic !== undefined) {
      if (prefix) out.push(document.createTextNode(prefix));
      out.push(el('em', { text: italic }));
    } else {
      out.push(document.createTextNode(full));
    }
    last = m.index + full.length;
  }
  if (last < text.length) out.push(document.createTextNode(text.slice(last)));
  return out;
}

/* ---------- Blok ---------- */
export function renderMarkdown(src) {
  const fragment = document.createDocumentFragment();
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  // frontmatter
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      const meta = el('span', { class: 'meta-code' });
      lines.slice(1, end).forEach((line, n) => {
        if (n > 0) meta.appendChild(el('br'));
        meta.appendChild(document.createTextNode(line));
      });
      fragment.appendChild(meta);
      i = end + 1;
    }
  }

  const isTableSeparator = (l) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(l) && l.includes('-');

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    // blok kode
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] || '';
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      const codeEl = el('code', { text: buf.join('\n') });
      if (lang) codeEl.setAttribute('data-lang', lang);
      fragment.appendChild(el('pre', {}, [codeEl]));
      continue;
    }

    // heading
    const hd = line.match(/^(#{1,6})\s+(.*)$/);
    if (hd) {
      const lvl = Math.min(6, hd[1].length);
      fragment.appendChild(el(`h${lvl}`, {}, inlineNodes(hd[2])));
      i++;
      continue;
    }

    // garis mendatar
    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      fragment.appendChild(el('hr'));
      i++;
      continue;
    }

    // tabel
    if (line.includes('|') && lines[i + 1] && isTableSeparator(lines[i + 1])) {
      const parseRow = (r) =>
        r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const head = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      const thead = el('thead', {}, [
        el('tr', {}, head.map((c) => el('th', {}, inlineNodes(c))))
      ]);
      const tbody = el(
        'tbody',
        {},
        rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, inlineNodes(c)))))
      );
      fragment.appendChild(el('table', {}, [thead, tbody]));
      continue;
    }

    // kutipan
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      fragment.appendChild(el('blockquote', {}, inlineNodes(buf.join(' '))));
      continue;
    }

    // daftar
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const raw = lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, '');
        const check = raw.match(/^\[([ xX])\]\s+(.*)$/);
        if (check) {
          items.push(
            el('li', { class: 'task' }, [
              el('span', { class: 'box', 'aria-hidden': 'true', text: check[1].toLowerCase() === 'x' ? '✓' : '' }),
              ...inlineNodes(check[2])
            ])
          );
        } else {
          items.push(el('li', {}, inlineNodes(raw)));
        }
        i++;
      }
      fragment.appendChild(el(ordered ? 'ol' : 'ul', {}, items));
      continue;
    }

    // paragraf
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(---|\*\*\*|___)\s*$/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) fragment.appendChild(el('p', {}, inlineNodes(buf.join(' '))));
  }

  return fragment;
}
