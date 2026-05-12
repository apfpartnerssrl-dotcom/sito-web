require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'apfpartners2026';
const JWT_SECRET = process.env.JWT_SECRET || 'apf_secret_key';
const CONTENT_FILE = path.join(__dirname, 'content.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Create uploads dir if missing
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo immagini permesse'));
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── HELPERS ──
const readContent = () => JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
const writeContent = (data) => fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorizzato' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token non valido' }); }
};

// ── PUBLIC API ──
app.get('/api/content', (req, res) => {
  res.json(readContent());
});

// ── AUTH ──
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Password errata' });
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, message: 'Login effettuato' });
});

// ── CONTENT CRUD (protected) ──
app.get('/api/admin/content', authMiddleware, (req, res) => {
  res.json(readContent());
});

app.put('/api/admin/content', authMiddleware, (req, res) => {
  try {
    writeContent(req.body);
    res.json({ ok: true, message: 'Contenuto salvato' });
  } catch (e) {
    res.status(500).json({ error: 'Errore salvataggio: ' + e.message });
  }
});

// Section-specific updates
app.put('/api/admin/content/:section', authMiddleware, (req, res) => {
  try {
    const content = readContent();
    const { section } = req.params;
    if (!(section in content)) return res.status(404).json({ error: 'Sezione non trovata' });
    content[section] = req.body;
    writeContent(content);
    res.json({ ok: true, message: `Sezione "${section}" salvata` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Blog post CRUD
app.post('/api/admin/blog', authMiddleware, (req, res) => {
  const content = readContent();
  const post = { ...req.body, id: Date.now(), date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) };
  content.blog.unshift(post);
  writeContent(content);
  res.json({ ok: true, post });
});

app.put('/api/admin/blog/:id', authMiddleware, (req, res) => {
  const content = readContent();
  const idx = content.blog.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Post non trovato' });
  content.blog[idx] = { ...content.blog[idx], ...req.body };
  writeContent(content);
  res.json({ ok: true });
});

app.delete('/api/admin/blog/:id', authMiddleware, (req, res) => {
  const content = readContent();
  content.blog = content.blog.filter(p => p.id != req.params.id);
  writeContent(content);
  res.json({ ok: true });
});

// Career CRUD
app.post('/api/admin/careers', authMiddleware, (req, res) => {
  const content = readContent();
  const role = { ...req.body, id: Date.now() };
  content.careers.push(role);
  writeContent(content);
  res.json({ ok: true, role });
});

app.delete('/api/admin/careers/:id', authMiddleware, (req, res) => {
  const content = readContent();
  content.careers = content.careers.filter(r => r.id != req.params.id);
  writeContent(content);
  res.json({ ok: true });
});

// Image upload
app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nessun file caricato' });
  const url = '/uploads/' + req.file.filename;
  res.json({ ok: true, url });
});

// SPA fallback for admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 APF Partners running on http://localhost:${PORT}`);
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`📦 Content API: http://localhost:${PORT}/api/content\n`);
});
