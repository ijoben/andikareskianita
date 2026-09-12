// ===== SUPABASE DATA MODULE =====
// All wedding data stored in Supabase

var DEFAULT_DATA = {
  couple: {
    groom: { name: 'Ahmad', fullName: 'Ahmad Rizki Pratama, S.Kom', father: 'Bapak H. Muhammad Pratama', mother: 'Ibu Hj. Siti Aminah', photo: '' },
    bride: { name: 'Fatimah', fullName: 'Fatimah Azzahra, S.Pd', father: 'Bapak H. Abdullah Azzahra', mother: 'Ibu Hj. Nur Halimah', photo: '' },
    quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
    quoteSource: 'QS. Ar-Rum: 21'
  },
  events: [
    { id: 'akad', title: 'Akad Nikah', date: '2026-10-15', time: '08:00', endTime: '10:00', venue: 'Masjid Agung Al-Azhar', address: 'Jl. Sisingamangaraja No. 1, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2447,106.7951' },
    { id: 'resepsi', title: 'Resepsi', date: '2026-10-15', time: '11:00', endTime: '14:00', venue: 'Gedung Serbaguna Trimatra', address: 'Jl. Gatot Subroto No. 12, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2420,106.8100' }
  ],
  stories: [
    { id: 1, title: 'Pertama Bertemu', date: '2020-01-15', description: 'Kami pertama kali bertemu di kampus.', photo: '' },
    { id: 2, title: 'Makin Dekat', date: '2020-06-20', description: 'Kami mulai sering menghabiskan waktu bersama.', photo: '' },
    { id: 3, title: 'Lamaran', date: '2025-12-25', description: 'Ahmad melamar Fatimah.', photo: '' }
  ],
  gallery: [],
  music: { dataUrl: '', name: '' },
  theme: {
    preset: 'pink',
    primaryColor: '#d4648a', primaryColorLight: '#f0a5c0', primaryColorDark: '#b84670',
    darkBg: '#2d1520', bodyBg: '#fff5f7', bodyText: '#333333',
    heroBg: '', openBg: '', coupleBg: '', storyBg: '', eventsBg: '', galleryBg: '', rsvpBg: ''
  },
  qris: {
    image: '',
    name: 'a.n. Ahmad Rizki Pratama',
    note: 'Terima kasih atas kado & ucapan Anda'
  }
};

// Get config value from Supabase
async function getConfig(key) {
  try {
    var data = await sbGet('config', 'key=eq.' + encodeURIComponent(key) + '&select=value');
    return data.length > 0 ? data[0].value : null;
  } catch (e) { console.error('getConfig error:', key, e); return null; }
}

// Set config value in Supabase
async function setConfig(key, value) {
  try {
    await sbUpsert('config', { key: key, value: value, updated_at: new Date().toISOString() });
  } catch (e) { console.error('setConfig error:', key, e); throw e; }
}

// Load all config data
async function loadAllConfig() {
  var result = {};
  var keys = ['couple', 'events', 'stories', 'gallery', 'music', 'theme', 'qris'];
  for (var i = 0; i < keys.length; i++) {
    var val = await getConfig(keys[i]);
    result[keys[i]] = val || JSON.parse(JSON.stringify(DEFAULT_DATA[keys[i]]));
  }
  return result;
}

// Save all config data
async function saveAllConfig(data) {
  var keys = ['couple', 'events', 'stories', 'gallery', 'music', 'theme', 'qris'];
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] !== undefined) {
      await setConfig(keys[i], data[keys[i]]);
    }
  }
}

// ===== RSVP =====
async function getRsvps() {
  return await sbGet('rsvps', 'order=created_at.desc');
}

async function addRsvp(rsvp) {
  return await sbPost('rsvps', rsvp);
}

// ===== WISHES =====
async function getWishes() {
  return await sbGet('wishes', 'order=created_at.desc&limit=50');
}

async function addWish(wish) {
  return await sbPost('wishes', wish);
}

async function deleteWish(id) {
  return await sbDelete('wishes', 'id=eq.' + id);
}

async function deleteRsvp(id) {
  return await sbDelete('rsvps', 'id=eq.' + id);
}

// ===== EXPORT/IMPORT =====
async function exportData() {
  var config = await loadAllConfig();
  var rsvps = await getRsvps();
  var wishes = await getWishes();
  return { config: config, rsvps: rsvps, wishes: wishes };
}
