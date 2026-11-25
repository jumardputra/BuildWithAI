import { Router } from 'express';
import { one, all, run } from './db.js';
import { newId } from './session.js';

export const docsRouter = Router();

/** Hanya pengguna yang sudah masuk boleh menyimpan riwayat. */
function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: { code: 'unauthenticated', message: 'Masuk dulu untuk menyimpan dokumen.' } });
  }
  next();
}

docsRouter.use(requireUser);

docsRouter.get('/', (req, res) => {
  const rows = all(
    `select id, idea, title, domain_id, folder, file_count, created_at, updated_at
       from documents where user_id = ? order by created_at desc limit 100`,
    req.user.userId
  );
  res.json({
    documents: rows.map((r) => ({
      id: r.id,
      idea: r.idea,
      title: r.title,
      domainId: r.domain_id,
      folder: r.folder,
      fileCount: r.file_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))
  });
});

docsRouter.post('/', (req, res) => {
  const idea = String(req.body?.idea || '').trim();
  const title = String(req.body?.title || '').trim();
  const domainId = String(req.body?.domainId || 'generic').trim();
  const folder = String(req.body?.folder || 'dokumen').trim();
  const fileCount = Number(req.body?.fileCount || 0);

  if (idea.length < 8) {
    return res.status(400).json({
      error: { code: 'validation_failed', message: 'Ide terlalu pendek.', fields: { idea: 'Minimal satu kalimat.' } }
    });
  }
  if (idea.length > 2000) {
    return res.status(400).json({
      error: { code: 'validation_failed', message: 'Ide terlalu panjang.', fields: { idea: 'Maksimal 2000 karakter.' } }
    });
  }

  const id = newId();
  const now = new Date().toISOString();
  run(
    `insert into documents (id, user_id, idea, title, domain_id, folder, file_count, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    req.user.userId,
    idea,
    title.slice(0, 160) || 'Dokumen tanpa judul',
    domainId.slice(0, 40),
    folder.slice(0, 60),
    Number.isFinite(fileCount) ? Math.max(0, Math.min(50, Math.trunc(fileCount))) : 0,
    now,
    now
  );

  res.status(201).json({ document: { id, idea, title, domainId, folder, fileCount, createdAt: now, updatedAt: now } });
});

docsRouter.get('/:id', (req, res) => {
  const r = one('select * from documents where id = ? and user_id = ?', req.params.id, req.user.userId);
  if (!r) return res.status(404).json({ error: { code: 'not_found', message: 'Dokumen tidak ditemukan.' } });
  res.json({
    document: {
      id: r.id,
      idea: r.idea,
      title: r.title,
      domainId: r.domain_id,
      folder: r.folder,
      fileCount: r.file_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  });
});

docsRouter.delete('/:id', (req, res) => {
  const r = one('select id from documents where id = ? and user_id = ?', req.params.id, req.user.userId);
  if (!r) return res.status(404).json({ error: { code: 'not_found', message: 'Dokumen tidak ditemukan.' } });
  run('delete from documents where id = ?', r.id);
  res.status(204).end();
});
