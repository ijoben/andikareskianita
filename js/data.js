// ===== SHARED DATA MODULE =====
// All wedding data stored in localStorage
var STORAGE_KEY = 'wedding_data';

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
    { id: 1, title: 'Pertama Bertemu', date: '2020-01-15', description: 'Kami pertama kali bertemu di kampus saat mengikuti organisasi yang sama.', photo: '' },
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
  rsvps: [],
  wishes: [],
  nextIds: { story: 4, gallery: 1, rsvp: 1, wish: 1 }
};

function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      // Ensure theme exists
      if (!data.theme) data.theme = JSON.parse(JSON.stringify(DEFAULT_DATA.theme));
      if (!data.gallery) data.gallery = [];
      if (!data.rsvps) data.rsvps = [];
      if (!data.wishes) data.wishes = [];
      if (!data.music) data.music = { dataUrl: '', name: '' };
      if (!data.nextIds) data.nextIds = { story: 4, gallery: 1, rsvp: 1, wish: 1 };
      return data;
    }
  } catch (e) { console.error('Load error:', e); }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save error:', e);
    alert('Gagal menyimpan! Data mungkin terlalu besar.');
    return false;
  }
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}
