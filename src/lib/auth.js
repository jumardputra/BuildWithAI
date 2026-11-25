import { api } from './api.js';
import { el, replace } from './dom.js';

/* ---------- Pembantu formulir ---------- */
function setFieldError(form, name, msg) {
  const el = form.querySelector(`[data-error-for="${name}"]`);
  const input = form.querySelector(`[name="${name}"]`);
  if (el) el.textContent = msg || '';
  if (input) {
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function clearErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('[name]').forEach((el) => el.removeAttribute('aria-invalid'));
}

function showFormError(form, msg) {
  const box = form.querySelector('[data-form-error]');
  if (!box) return;
  box.textContent = msg || '';
  box.hidden = !msg;
}

function setBusy(form, busy) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (busy) {
    btn.dataset.label = btn.textContent;
    btn.textContent = 'Memproses…';
    btn.disabled = true;
  } else {
    if (btn.dataset.label) btn.textContent = btn.dataset.label;
    btn.disabled = false;
  }
}

function safeNext() {
  const p = new URLSearchParams(location.search).get('next') || '';
  // hanya jalur internal berbentuk /nama/, mencegah open redirect
  if (/^\/(?!\/)[\w\-./]*\/$/.test(p)) return p;
  return '/akun/';
}

/* ---------- Masuk ---------- */
function initLogin() {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    showFormError(form, '');
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    if (!email) return setFieldError(form, 'email', 'Email wajib diisi.');
    if (!password) return setFieldError(form, 'password', 'Kata sandi wajib diisi.');

    setBusy(form, true);
    try {
      await api.login(email, password);
      location.href = safeNext();
    } catch (err) {
      setBusy(form, false);
      if (err.fields && Object.keys(err.fields).length) {
        for (const [k, v] of Object.entries(err.fields)) setFieldError(form, k, v);
      } else {
        showFormError(form, err.message);
      }
      if (err.code === 'rate_limited') showFormError(form, err.message);
    }
  });
}

/* ---------- Daftar ---------- */
function initRegister() {
  const form = document.querySelector('[data-register-form]');
  if (!form) return;

  const pw = form.querySelector('[name="password"]');
  const meter = form.querySelector('[data-strength]');
  const meterLabel = form.querySelector('[data-strength-label]');

  const score = (v) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^a-zA-Z0-9]/.test(v)) s++;
    return s;
  };

  if (pw && meter) {
    pw.addEventListener('input', () => {
      const s = score(pw.value);
      meter.dataset.score = String(pw.value ? s : 0);
      if (meterLabel) {
        meterLabel.textContent = !pw.value
          ? ''
          : s <= 2
            ? 'Lemah — tambah panjang atau angka'
            : s === 3
              ? 'Cukup'
              : s === 4
                ? 'Kuat'
                : 'Sangat kuat';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    showFormError(form, '');

    const payload = {
      nama: form.querySelector('[name="nama"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      password: form.querySelector('[name="password"]').value,
      setuju: form.querySelector('[name="setuju"]').checked
    };

    let local = false;
    if (payload.nama.length < 2) { setFieldError(form, 'nama', 'Nama minimal 2 karakter.'); local = true; }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(payload.email)) { setFieldError(form, 'email', 'Format email belum benar.'); local = true; }
    if (payload.password.length < 8) { setFieldError(form, 'password', 'Kata sandi minimal 8 karakter.'); local = true; }
    if (!payload.setuju) { setFieldError(form, 'setuju', 'Centang persetujuan dulu.'); local = true; }
    if (local) return;

    setBusy(form, true);
    try {
      await api.register(payload);
      location.href = '/akun/';
    } catch (err) {
      setBusy(form, false);
      if (err.fields && Object.keys(err.fields).length) {
        for (const [k, v] of Object.entries(err.fields)) setFieldError(form, k, v);
      }
      if (err.code === 'email_taken') showFormError(form, err.message);
      else if (!err.fields || !Object.keys(err.fields).length) showFormError(form, err.message);
    }
  });
}

/* ---------- Akun & riwayat ---------- */
async function initAccount() {
  const root = document.querySelector('[data-account]');
  if (!root) return;

  const nameEl = root.querySelector('[data-user-name]');
  const emailEl = root.querySelector('[data-user-email]');
  const sinceEl = root.querySelector('[data-user-since]');
  const listEl = root.querySelector('[data-doc-list]');
  const countEl = root.querySelector('[data-doc-count]');
  const logoutBtn = root.querySelector('[data-logout]');
  const gate = root.querySelector('[data-gate]');
  const body = root.querySelector('[data-account-body]');

  let user;
  try {
    const { data } = await api.me();
    user = data.user;
  } catch {
    gate.hidden = false;
    body.hidden = true;
    return;
  }

  gate.hidden = true;
  body.hidden = false;

  nameEl.textContent = user.nama;
  emailEl.textContent = user.email;
  if (sinceEl) {
    const d = new Date(user.createdAt);
    sinceEl.textContent = Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async function refresh() {
    try {
      const { data } = await api.listDocs();
      const docs = data.documents;
      if (countEl) countEl.textContent = String(docs.length);

      if (!docs.length) {
        replace(listEl, [
          el('p', { class: 'empty-line', text: 'Belum ada dokumen tersimpan. Susun satu di ruang kerja, lalu tekan “Simpan ke akun”.' })
        ]);
        return;
      }

      const rows = docs.map((d) => {
        const openBtn = el('button', { class: 'btn btn-quiet', type: 'button' }, ['Buka']);
        openBtn.addEventListener('click', () => {
          location.href = `/ruang-kerja/?ide=${encodeURIComponent(d.idea.slice(0, 400))}`;
        });

        const delBtn = el('button', { class: 'btn btn-quiet', type: 'button' }, ['Hapus']);
        delBtn.addEventListener('click', async () => {
          if (!confirm('Hapus dokumen ini dari riwayat?')) return;
          delBtn.disabled = true;
          try {
            await api.deleteDoc(d.id);
            await refresh();
          } catch {
            delBtn.disabled = false;
          }
        });

        return el('div', { class: 'doc-line' }, [
          el('div', { class: 'dl-main' }, [
            el('span', { class: 'dl-title', text: d.title }),
            el('span', { class: 'dl-idea', text: d.idea })
          ]),
          el('div', { class: 'dl-meta' }, [
            el('span', { class: 'tag', text: d.domainId }),
            el('span', { class: 'dl-files num', text: `${d.fileCount} berkas` }),
            el('span', { class: 'dl-date num', text: fmtDate(d.createdAt) }),
            openBtn,
            delBtn
          ])
        ]);
      });

      replace(listEl, rows);
    } catch {
      replace(listEl, [
        el('p', { class: 'empty-line', text: 'Riwayat tidak bisa dimuat sekarang. Coba muat ulang halaman.' })
      ]);
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      try {
        await api.logout();
      } finally {
        location.href = '/';
      }
    });
  }

  await refresh();
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initAuth() {
  initLogin();
  initRegister();
  initAccount();
}

export { setFieldError, clearErrors, showFormError, setBusy };
