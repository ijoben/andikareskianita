-- ============================================
-- Wedding Invitation - Supabase Schema
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================

-- Tabel config (key-value untuk semua data)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel RSVP (tamu yang konfirmasi)
CREATE TABLE IF NOT EXISTS rsvps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attendance TEXT NOT NULL DEFAULT 'hadir',
  guests INTEGER DEFAULT 1,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel wishes (ucapan)
CREATE TABLE IF NOT EXISTS wishes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Public policies (baca tulis tanpa auth)
CREATE POLICY "Public read config" ON config FOR SELECT USING (true);
CREATE POLICY "Public insert config" ON config FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update config" ON config FOR UPDATE USING (true);
CREATE POLICY "Public delete config" ON config FOR DELETE USING (true);

CREATE POLICY "Public read rsvps" ON rsvps FOR SELECT USING (true);
CREATE POLICY "Public insert rsvps" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete rsvps" ON rsvps FOR DELETE USING (true);

CREATE POLICY "Public read wishes" ON wishes FOR SELECT USING (true);
CREATE POLICY "Public insert wishes" ON wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete wishes" ON wishes FOR DELETE USING (true);

-- Insert default data
INSERT INTO config (key, value) VALUES
('couple', '{
  "groom": {"name":"Ahmad","fullName":"Ahmad Rizki Pratama, S.Kom","father":"Bapak H. Muhammad Pratama","mother":"Ibu Hj. Siti Aminah","photo":""},
  "bride": {"name":"Fatimah","fullName":"Fatimah Azzahra, S.Pd","father":"Bapak H. Abdullah Azzahra","mother":"Ibu Hj. Nur Halimah","photo":""},
  "quote":"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.",
  "quoteSource":"QS. Ar-Rum: 21"
}'::jsonb),
('events', '[
  {"id":"akad","title":"Akad Nikah","date":"2026-10-15","time":"08:00","endTime":"10:00","venue":"Masjid Agung Al-Azhar","address":"Jl. Sisingamangaraja No. 1, Jakarta Selatan","mapUrl":"https://maps.google.com/?q=-6.2447,106.7951"},
  {"id":"resepsi","title":"Resepsi","date":"2026-10-15","time":"11:00","endTime":"14:00","venue":"Gedung Serbaguna Trimatra","address":"Jl. Gatot Subroto No. 12, Jakarta Selatan","mapUrl":"https://maps.google.com/?q=-6.2420,106.8100"}
]'::jsonb),
('stories', '[
  {"id":1,"title":"Pertama Bertemu","date":"2020-01-15","description":"Kami pertama kali bertemu di kampus.","photo":""},
  {"id":2,"title":"Makin Dekat","date":"2020-06-20","description":"Kami mulai sering menghabiskan waktu bersama.","photo":""},
  {"id":3,"title":"Lamaran","date":"2025-12-25","description":"Ahmad melamar Fatimah.","photo":""}
]'::jsonb),
('gallery', '[]'::jsonb),
('music', '{"dataUrl":"","name":""}'::jsonb),
('theme', '{
  "preset":"pink",
  "primaryColor":"#d4648a","primaryColorLight":"#f0a5c0","primaryColorDark":"#b84670",
  "darkBg":"#2d1520","bodyBg":"#fff5f7","bodyText":"#333333",
  "heroBg":"","openBg":"","coupleBg":"","storyBg":"","eventsBg":"","galleryBg":"","rsvpBg":""
}'::jsonb),
('qris', '{
  "enabled": true,
  "qrisEnabled": true,
  "rekeningEnabled": true,
  "image": "",
  "name": "a.n. Muhammad Andik / Rezkianita",
  "note": "Terima kasih atas doa restu dan tanda kasih Anda"
}'::jsonb),
('opening', '{
  "title": "Kepada Yth. Bapak/Ibu/Saudara/i",
  "subtitle": "Mohon maaf apabila ada kesalahan penulisan nama dan gelar",
  "buttonText": "Buka Undangan"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
