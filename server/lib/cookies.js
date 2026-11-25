/**
 * Pembaca cookie minimal dengan tanda tangan HMAC (pengganti cookie-parser).
 * Cookie sesi disimpan sebagai teks biasa karena tokennya sudah acak 256-bit
 * dan tidak dapat dipalsukan; tanda tangan mencegah perubahan isi.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

const SECRET = () => config.sessionSecret;

function sign(value) {
  return createHmac('sha256', SECRET()).update(value).digest('base64url').slice(0, 32);
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export default function cookieParser() {
  return function (req, res, next) {
    const header = req.headers.cookie || '';
    const jar = {};

    for (const part of header.split(';')) {
      const i = part.indexOf('=');
      if (i < 1) continue;
      const k = part.slice(0, i).trim();
      let v = part.slice(i + 1).trim();
      try {
        v = decodeURIComponent(v);
      } catch {
        /* biarkan mentah */
      }
      // Format bertanda tangan: <nilai>.<tanda>
      const dot = v.lastIndexOf('.');
      if (dot > 0) {
        const value = v.slice(0, dot);
        const mac = v.slice(dot + 1);
        if (safeEqual(mac, sign(value))) jar[k] = value;
        else jar[k] = undefined;
      } else {
        jar[k] = v;
      }
    }

    req.cookies = jar;

    const original = res.cookie.bind(res);
    res.cookie = (name, value, opts = {}) => original(name, `${value}.${sign(value)}`, opts);

    next();
  };
}
