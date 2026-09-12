// ===== SUPABASE DATA MODULE =====
// All wedding data stored in Supabase

var DEFAULT_DATA = {
  couple: {
    groom: { name: 'Andika', fullName: 'MUHAMMAD ANDIK', father: '', mother: '', photo: '' },
    bride: { name: 'Rezki', fullName: 'REZKIANITA', father: '', mother: '', photo: '' },
    quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
    quoteSource: 'QS. Ar-Rum: 21',
    whatsapp: ''
  },
  events: [
    { id: 'akad', title: 'Akad Nikah', enabled: true, date: '2026-10-18', time: '08:00', endTime: '10:00', venue: 'Kediaman Mempelai Wanita', address: 'Jl. Sisingamangaraja No. 1, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2447,106.7951' },
    { id: 'resepsi', title: 'Resepsi', enabled: true, date: '2026-10-18', time: '11:00', endTime: '14:00', venue: 'Gedung Serbaguna Trimatra', address: 'Jl. Gatot Subroto No. 12, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2420,106.8100' }
  ],
  stories: [
    { id: 1, title: 'Pertama Bertemu', date: '2020-01-15', description: 'Kami pertama kali bertemu di kampus.', photo: '' },
    { id: 2, title: 'Makin Dekat', date: '2020-06-20', description: 'Kami mulai sering menghabiskan waktu bersama.', photo: '' },
    { id: 3, title: 'Lamaran', date: '2025-12-25', description: 'Andika melamar Rezki.', photo: '' }
  ],
  gallery: [],
  music: { dataUrl: 'assets/audio/music.mp3', name: 'Romantic-Day-chosic.com_.mp3' },
  theme: {
    preset: 'pink',
    primaryColor: '#d4648a', primaryColorLight: '#f0a5c0', primaryColorDark: '#b84670',
    darkBg: '#2d1520', bodyBg: '#fff5f7', bodyText: '#333333',
    iconColor: '#c9a84c',
    heroBg: '', openBg: '', coupleBg: '', storyBg: '', eventsBg: '', galleryBg: '', rsvpBg: '', qrisBg: '',
    heroBgOpacity: 30,
    openBgOpacity: 40,
    coupleBgOpacity: 15,
    storyBgOpacity: 15,
    eventsBgOpacity: 20,
    galleryBgOpacity: 15,
    rsvpBgOpacity: 15,
    qrisBgOpacity: 20
  },
  qris: {
    enabled: true,
    qrisEnabled: true,
    rekeningEnabled: true,
    image: '',
    name: 'a.n. Muhammad Andik / Rezkianita',
    note: 'Terima kasih atas doa restu dan tanda kasih Anda'
  },
  opening: {
    title: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    subtitle: 'Mohon maaf apabila ada kesalahan penulisan nama dan gelar',
    buttonText: 'Buka Undangan'
  },
  og: {
    title: 'The Wedding of Andika & Rezki — Undangan Pernikahan',
    description: 'Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami: Muhammad Andik & Rezkianita.',
    image: '',
    url: 'https://andika-rezkianita.vercel.app/'
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

// Load all config data (fast single bulk query from Supabase)
async function loadAllConfig() {
  var result = {};
  var keys = ['couple', 'events', 'stories', 'gallery', 'music', 'theme', 'qris', 'opening', 'og'];

  // 1. Initialize with default fallback
  keys.forEach(function(k) {
    result[k] = JSON.parse(JSON.stringify(DEFAULT_DATA[k] || {}));
  });

  try {
    // 2. Fetch all config rows in 1 single HTTP GET request!
    var rows = await sbGet('config', 'select=key,value');
    if (Array.isArray(rows)) {
      rows.forEach(function(row) {
        if (row && row.key && row.value !== undefined && row.value !== null) {
          result[row.key] = row.value;
        }
      });
    }
  } catch (e) {
    console.warn('loadAllConfig bulk query error, attempting individual fetch:', e);
    try {
      var values = await Promise.all(keys.map(function(k) { return getConfig(k); }));
      for (var i = 0; i < keys.length; i++) {
        if (values[i] !== null && values[i] !== undefined) {
          result[keys[i]] = values[i];
        }
      }
    } catch (err) {
      console.error('loadAllConfig individual fallback error:', err);
    }
  }
  return result;
}

// Save all config data
async function saveAllConfig(data) {
  var keys = ['couple', 'events', 'stories', 'gallery', 'music', 'theme', 'qris', 'opening', 'og'];
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
