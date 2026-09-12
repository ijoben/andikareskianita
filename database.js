const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "data", "wedding.json");
const DEFAULT_DATA = {
  couple: {
    groom: { name: "Ahmad", fullName: "Ahmad Rizki Pratama, S.Kom", father: "Bapak H. Muhammad Pratama", mother: "Ibu Hj. Siti Aminah", photo: "/assets/images/groom.jpg" },
    bride: { name: "Fatimah", fullName: "Fatimah Azzahra, S.Pd", father: "Bapak H. Abdullah Azzahra", mother: "Ibu Hj. Nur Halimah", photo: "/assets/images/bride.jpg" },
    quote: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.",
    quoteSource: "QS. Ar-Rum: 21"
  },
  events: [
    { id: "akad", title: "Akad Nikah", date: "2026-10-15", time: "08:00", endTime: "10:00", venue: "Masjid Agung Al-Azhar", address: "Jl. Sisingamangaraja No. 1, Jakarta Selatan", mapUrl: "https://maps.google.com/?q=-6.2447,106.7951", lat: -6.2447, lng: 106.7951 },
    { id: "resepsi", title: "Resepsi", date: "2026-10-15", time: "11:00", endTime: "14:00", venue: "Gedung Serbaguna Trimatra", address: "Jl. Gatot Subroto No. 12, Jakarta Selatan", mapUrl: "https://maps.google.com/?q=-6.2420,106.8100", lat: -6.2420, lng: 106.8100 }
  ],
  stories: [
    { id: 1, title: "Pertama Bertemu", date: "2020-01-15", description: "Kami pertama kali bertemu di kampus.", photo: "" },
    { id: 2, title: "Makin Dekat", date: "2020-06-20", description: "Kami mulai sering menghabiskan waktu bersama.", photo: "" },
    { id: 3, title: "Lamaran", date: "2025-12-25", description: "Ahmad melamar Fatimah.", photo: "" }
  ],
  gallery: [
    { id: 1, photo: "/assets/images/gallery1.jpg", caption: "Bersama keluarga" },
    { id: 2, photo: "/assets/images/gallery2.jpg", caption: "Pre-wedding" }
  ],
  music: { filename: "", originalName: "Background Music" },
  admin: { username: "admin", passwordHash: null },
  rsvps: [], wishes: [],
  nextIds: { story: 4, gallery: 3, rsvp: 1, wish: 1 }
};
function ensureDataDir() { const dir = path.join(__dirname, "data"); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function loadDB() { ensureDataDir(); if (!fs.existsSync(DB_PATH)) { fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2)); return JSON.parse(JSON.stringify(DEFAULT_DATA)); } return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
function saveDB(data) { ensureDataDir(); fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }
module.exports = { loadDB, saveDB, DEFAULT_DATA };
