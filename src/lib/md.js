export function table(head, rows) {
  const h = `| ${head.join(' | ')} |`;
  const sep = `| ${head.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map((c) => String(c ?? '')).join(' | ')} |`).join('\n');
  return [h, sep, body].filter(Boolean).join('\n');
}

export function bullets(items) {
  return items.map((i) => `- ${i}`).join('\n');
}

export function numbered(items) {
  return items.map((i, k) => `${k + 1}. ${i}`).join('\n');
}

export function checkboxes(items) {
  return items.map((i) => `- [ ] ${i}`).join('\n');
}

export function h(level, text) {
  return `${'#'.repeat(level)} ${text}`;
}

export function code(lang, body) {
  return '```' + (lang || '') + '\n' + body + '\n```';
}

export function frontmatter(meta) {
  const rows = Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${v}`);
  return ['---', ...rows, '---'].join('\n');
}
