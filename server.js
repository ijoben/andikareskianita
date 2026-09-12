const express = require("express");
const session = require("express-session");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { loadDB, saveDB } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "wedding-2026", resave: false, saveUninitialized: false, cookie: { maxAge: 86400000 } }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => { const d = path.join(__dirname, "uploads"); if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); cb(null, d); },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random()*1e6) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 } });

function requireAuth(req, res, next) { if (req.session && req.session.isAdmin) return next(); res.status(401).json({ error: "Unauthorized" }); }

const db0 = loadDB();
if (!db0.admin.passwordHash) { db0.admin.passwordHash = bcrypt.hashSync("admin123", 10); saveDB(db0); console.log("Default admin: admin / admin123"); }

// === PUBLIC APIs ===
app.get("/api/wedding", (req, res) => { const db = loadDB(); res.json({ couple: db.couple, events: db.events, music: db.music, theme: db.theme || {} }); });
app.get("/api/gallery", (req, res) => { const db = loadDB(); res.json(db.gallery); });
app.get("/api/stories", (req, res) => { const db = loadDB(); res.json(db.stories); });
app.get("/api/wishes", (req, res) => { const db = loadDB(); res.json(db.wishes.slice().reverse().slice(0, 50)); });

app.post("/api/rsvp", (req, res) => {
  const { name, attendance, guests, message } = req.body;
  if (!name || !attendance) return res.status(400).json({ error: "Nama dan kehadiran wajib diisi" });
  const db = loadDB();
  const rsvp = { id: db.nextIds.rsvp++, name, attendance, guests: parseInt(guests)||1, message: message||"", createdAt: new Date().toISOString() };
  db.rsvps.push(rsvp); saveDB(db); res.json({ success: true, rsvp });
});

app.post("/api/wishes", (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: "Nama dan ucapan wajib diisi" });
  const db = loadDB();
  const wish = { id: db.nextIds.wish++, name, message, createdAt: new Date().toISOString() };
  db.wishes.push(wish); saveDB(db); res.json({ success: true, wish });
});

// === ADMIN APIs ===
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body; const db = loadDB();
  if (username === db.admin.username && bcrypt.compareSync(password, db.admin.passwordHash)) {
    req.session.isAdmin = true; res.json({ success: true });
  } else { res.status(401).json({ error: "Username atau password salah" }); }
});
app.post("/api/admin/logout", (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get("/api/admin/check", (req, res) => { res.json({ isAdmin: !!(req.session && req.session.isAdmin) }); });
app.get("/api/admin/data", requireAuth, (req, res) => { const db = loadDB(); res.json({ couple: db.couple, events: db.events, stories: db.stories, gallery: db.gallery, music: db.music, theme: db.theme || {} }); });
app.get("/api/admin/stats", requireAuth, (req, res) => {
  const db = loadDB();
  res.json({ totalRsvps: db.rsvps.length, hadir: db.rsvps.filter(r=>r.attendance==="hadir").length, tidakHadir: db.rsvps.filter(r=>r.attendance==="tidak_hadir").length, ragu: db.rsvps.filter(r=>r.attendance==="ragu").length, totalWishes: db.wishes.length, totalGallery: db.gallery.length, totalStories: db.stories.length });
});
app.get("/api/admin/rsvps", requireAuth, (req, res) => { const db = loadDB(); res.json(db.rsvps); });

app.put("/api/admin/couple", requireAuth, (req, res) => {
  const db = loadDB();
  if (req.body.groom) Object.assign(db.couple.groom, req.body.groom);
  if (req.body.bride) Object.assign(db.couple.bride, req.body.bride);
  if (req.body.quote !== undefined) db.couple.quote = req.body.quote;
  if (req.body.quoteSource !== undefined) db.couple.quoteSource = req.body.quoteSource;
  saveDB(db); res.json({ success: true, couple: db.couple });
});

app.put("/api/admin/events", requireAuth, (req, res) => {
  const db = loadDB(); if (Array.isArray(req.body.events)) db.events = req.body.events; saveDB(db);
  res.json({ success: true, events: db.events });
});

app.post("/api/admin/upload", requireAuth, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ success: true, url: "/uploads/" + req.file.filename, filename: req.file.filename });
});

// Theme upload - background images
app.post("/api/admin/theme/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const field = req.body.field || "heroBg";
  const db = loadDB();
  // Remove old file if it was an uploaded file
  const oldVal = db.theme[field];
  if (oldVal && oldVal.startsWith("/uploads/")) {
    const oldPath = path.join(__dirname, oldVal);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  db.theme[field] = "/uploads/" + req.file.filename;
  saveDB(db);
  res.json({ success: true, url: db.theme[field] });
});

app.put("/api/admin/theme", requireAuth, (req, res) => {
  const db = loadDB();
  if (!db.theme) db.theme = {};
  Object.assign(db.theme, req.body);
  saveDB(db);
  res.json({ success: true, theme: db.theme });
});

app.post("/api/admin/music", requireAuth, upload.single("music"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const db = loadDB();
  if (db.music.filename) { const op = path.join(__dirname, "uploads", db.music.filename); if (fs.existsSync(op)) fs.unlinkSync(op); }
  db.music.filename = req.file.filename; db.music.originalName = req.file.originalname; saveDB(db);
  res.json({ success: true, music: db.music });
});

app.post("/api/admin/gallery", requireAuth, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const db = loadDB(); const item = { id: db.nextIds.gallery++, photo: "/uploads/" + req.file.filename, caption: req.body.caption || "" };
  db.gallery.push(item); saveDB(db); res.json({ success: true, item });
});
app.delete("/api/admin/gallery/:id", requireAuth, (req, res) => {
  const db = loadDB(); const id = parseInt(req.params.id); const idx = db.gallery.findIndex(g=>g.id===id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const fp = path.join(__dirname, db.gallery[idx].photo); if (fs.existsSync(fp)) fs.unlinkSync(fp);
  db.gallery.splice(idx, 1); saveDB(db); res.json({ success: true });
});

app.post("/api/admin/stories", requireAuth, upload.single("photo"), (req, res) => {
  const db = loadDB();
  const story = { id: db.nextIds.story++, title: req.body.title||"", date: req.body.date||"", description: req.body.description||"", photo: req.file ? "/uploads/"+req.file.filename : "" };
  db.stories.push(story); saveDB(db); res.json({ success: true, story });
});
app.put("/api/admin/stories/:id", requireAuth, upload.single("photo"), (req, res) => {
  const db = loadDB(); const id = parseInt(req.params.id); const story = db.stories.find(s=>s.id===id);
  if (!story) return res.status(404).json({ error: "Not found" });
  if (req.body.title !== undefined) story.title = req.body.title;
  if (req.body.date !== undefined) story.date = req.body.date;
  if (req.body.description !== undefined) story.description = req.body.description;
  if (req.file) story.photo = "/uploads/" + req.file.filename;
  saveDB(db); res.json({ success: true, story });
});
app.delete("/api/admin/stories/:id", requireAuth, (req, res) => {
  const db = loadDB(); const id = parseInt(req.params.id); const idx = db.stories.findIndex(s=>s.id===id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (db.stories[idx].photo && db.stories[idx].photo.startsWith("/uploads/")) { const fp = path.join(__dirname, db.stories[idx].photo); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
  db.stories.splice(idx, 1); saveDB(db); res.json({ success: true });
});

app.delete("/api/admin/wishes/:id", requireAuth, (req, res) => {
  const db = loadDB(); const id = parseInt(req.params.id); const idx = db.wishes.findIndex(w=>w.id===id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.wishes.splice(idx, 1); saveDB(db); res.json({ success: true });
});

app.put("/api/admin/password", requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body; const db = loadDB();
  if (!bcrypt.compareSync(oldPassword, db.admin.passwordHash)) return res.status(400).json({ error: "Password lama salah" });
  db.admin.passwordHash = bcrypt.hashSync(newPassword, 10); saveDB(db); res.json({ success: true });
});

app.get("/admin/{*path}", (req, res) => res.sendFile(path.join(__dirname, "admin", "index.html")));
app.get("/{*path}", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => { console.log("Server: http://localhost:" + PORT); console.log("Admin: http://localhost:" + PORT + "/admin/"); });
