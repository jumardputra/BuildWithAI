/**
 * Pembantu DOM. Seluruh antarmuka dibangun lewat API DOM
 * (createElement + textContent), tidak pernah lewat string HTML,
 * sehingga tidak ada jalur injeksi markup.
 */

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = String(v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const c of list) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function replace(node, children) {
  clear(node);
  append(node, children);
  return node;
}

/** Hanya izinkan tautan yang aman: relatif, http(s), atau mailto. */
export function safeHref(raw) {
  const href = String(raw || '').trim();
  if (!href) return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (/^(javascript|data|vbscript|file):/i.test(href)) return null;
  if (href.startsWith('//')) return null;
  return href;
}
