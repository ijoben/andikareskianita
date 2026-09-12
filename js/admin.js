/* ============================================================
   Wedding Invitation Admin Panel — Supabase Edition
   ============================================================ */

// Clean .html from address bar
if (window.history && window.history.replaceState && window.location.pathname.endsWith('.html')) {
  var cleanAdminPath = window.location.pathname.replace(/\.html$/, '');
  window.history.replaceState(null, '', cleanAdminPath + window.location.search + window.location.hash);
}

var adminData = (typeof DEFAULT_DATA !== 'undefined') ? JSON.parse(JSON.stringify(DEFAULT_DATA)) : {};
adminData.rsvps = [];
adminData.wishes = [];

// ── Helpers ──────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function showLoading(show) {
  // Simple loading indicator
  if (show) document.body.style.cursor = 'wait';
  else document.body.style.cursor = '';
}
function showToast(msg) {
  var t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); t.classList.add('hidden'); }, 3000);
}
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Load all data ────────────────────────────────────────────
async function loadAll() {
  showLoading(true);
  try {
    adminData = await loadAllConfig();
    // Load RSVPs and wishes
    adminData.rsvps = await getRsvps();
    adminData.wishes = await getWishes();
    showLoading(false);
    return true;
  } catch (err) {
    showLoading(false);
    showToast('\u274C Gagal load data: ' + err.message);
    return false;
  }
}

// ── Navigation ───────────────────────────────────────────────
var VALID_ADMIN_PAGES = ['dashboard', 'opening', 'couple', 'events', 'stories', 'gallery', 'music', 'theme', 'qris', 'rsvps', 'wishes', 'settings'];

function showPage(page, updateHash) {
  if (VALID_ADMIN_PAGES.indexOf(page) === -1) page = 'dashboard';
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  var pageEl = $('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  var navEl = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (navEl) navEl.classList.add('active');
  // Auto-close sidebar on mobile
  closeSidebar();

  // Persist current page so page refresh stays on current tab
  try {
    sessionStorage.setItem('admin_active_page', page);
    if (updateHash !== false) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + page);
      } else {
        window.location.hash = page;
      }
    }
  } catch (e) {}

  // Load page data
  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'opening': loadOpening(); break;
    case 'couple': loadCouple(); break;
    case 'events': loadEvents(); break;
    case 'stories': loadStories(); break;
    case 'gallery': loadGallery(); break;
    case 'music': loadMusic(); break;
    case 'theme': loadTheme(); break;
    case 'qris': loadQris(); break;
    case 'rsvps': loadRsvps(); break;
    case 'wishes': loadWishes(); break;
  }
}

// ── Dashboard ────────────────────────────────────────────────
function loadDashboard() {
  var rsvps = adminData.rsvps || [];
  var hadir = rsvps.filter(function(r) { return r.attendance === 'hadir'; }).length;
  var tidak = rsvps.filter(function(r) { return r.attendance === 'tidak_hadir'; }).length;
  var ragu = rsvps.filter(function(r) { return r.attendance === 'ragu'; }).length;
  var eh = $('stat-hadir'), et = $('stat-tidak'), er = $('stat-ragu'), ew = $('stat-wishes');
  if (eh) eh.textContent = hadir;
  if (et) et.textContent = tidak;
  if (er) er.textContent = ragu;
  if (ew) ew.textContent = (adminData.wishes || []).length;
}

// ── Couple ───────────────────────────────────────────────────
function loadCouple() {
  var couple = adminData.couple || {};
  var groom = couple.groom || {};
  var bride = couple.bride || {};
  if ($('groom-name')) $('groom-name').value = groom.name || '';
  if ($('groom-full')) $('groom-full').value = groom.fullName || '';
  if ($('groom-father')) $('groom-father').value = groom.father || '';
  if ($('groom-mother')) $('groom-mother').value = groom.mother || '';
  if ($('bride-name')) $('bride-name').value = bride.name || '';
  if ($('bride-full')) $('bride-full').value = bride.fullName || '';
  if ($('bride-father')) $('bride-father').value = bride.father || '';
  if ($('bride-mother')) $('bride-mother').value = bride.mother || '';
  if ($('couple-quote')) $('couple-quote').value = couple.quote || '';
  if ($('couple-quote-source')) $('couple-quote-source').value = couple.quoteSource || '';
  if ($('couple-whatsapp')) $('couple-whatsapp').value = couple.whatsapp || '';
  // Show photo previews
  if (groom.photo) {
    var gc = $('groom-photo-current');
    if (gc) gc.innerHTML = '<img src="' + groom.photo + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-top:5px">';
  }
  if (bride.photo) {
    var bc = $('bride-photo-current');
    if (bc) bc.innerHTML = '<img src="' + bride.photo + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-top:5px">';
  }
}

async function saveCouple() {
  var couple = {
    groom: {
      name: $('groom-name').value.trim(),
      fullName: $('groom-full').value.trim(),
      father: $('groom-father').value.trim(),
      mother: $('groom-mother').value.trim(),
      photo: (adminData.couple || {}).groom ? (adminData.couple.groom.photo || '') : ''
    },
    bride: {
      name: $('bride-name').value.trim(),
      fullName: $('bride-full').value.trim(),
      father: $('bride-father').value.trim(),
      mother: $('bride-mother').value.trim(),
      photo: (adminData.couple || {}).bride ? (adminData.couple.bride.photo || '') : ''
    },
    quote: $('couple-quote').value.trim(),
    quoteSource: $('couple-quote-source').value.trim(),
    whatsapp: $('couple-whatsapp') ? $('couple-whatsapp').value.trim() : ((adminData.couple || {}).whatsapp || '')
  };
  // Handle photo uploads
  var groomFile = $('groom-photo-file');
  var brideFile = $('bride-photo-file');
  if (groomFile && groomFile.files.length) {
    couple.groom.photo = await fileToBase64(groomFile.files[0]);
  }
  if (brideFile && brideFile.files.length) {
    couple.bride.photo = await fileToBase64(brideFile.files[0]);
  }
  try {
    await setConfig('couple', couple);
    adminData.couple = couple;
    showToast('\u2705 Data mempelai disimpan!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

function fileToBase64(file, maxDim, quality) {
  maxDim = maxDim || 1200;
  quality = quality || 0.82;
  return new Promise(function(resolve, reject) {
    if (!file) return resolve('');
    // For non-image files (e.g. music/audio), read directly
    if (!file.type || !file.type.startsWith('image/')) {
      var reader = new FileReader();
      reader.onload = function(e) { resolve(e.target.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // For image files, compress and downscale via Canvas for lightning-fast performance
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        var outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        if (outputType === 'image/png' && file.size < 500000) {
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.onerror = function() {
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Events ───────────────────────────────────────────────────
function loadEvents() {
  var events = adminData.events || [];
  var container = $('events-forms');
  if (!container) return;
  container.innerHTML = events.map(function(ev, i) {
    var isEnabled = ev.enabled !== false;
    var iconClass = ev.id === 'akad' ? 'fas fa-ring' : 'fas fa-glass-cheers';
    return '<div class="form-card" style="border-top: 3px solid ' + (isEnabled ? '#d4648a' : '#bbb') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #eee;">' +
      '<h3 style="margin:0;"><i class="' + iconClass + '"></i> ' + escapeHtml(ev.title) + '</h3>' +
      '<label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:' + (isEnabled ? '#27ae60' : '#888') + ';">' +
      '<input type="checkbox" id="ev-enabled-' + i + '" ' + (isEnabled ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer;accent-color:#d4648a;" onchange="this.parentElement.style.color = this.checked ? \'#27ae60\' : \'#888\'; this.closest(\'.form-card\').style.borderTopColor = this.checked ? \'#d4648a\' : \'#bbb\';">' +
      '<span>Tampilkan Acara</span>' +
      '</label>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-group"><label>Tanggal</label><input type="date" id="ev-date-' + i + '" value="' + (ev.date || '') + '"></div>' +
      '<div class="form-group"><label>Waktu Mulai</label><input type="time" id="ev-time-' + i + '" value="' + (ev.time || '') + '"></div>' +
      '<div class="form-group"><label>Waktu Selesai</label><input type="time" id="ev-endtime-' + i + '" value="' + (ev.endTime || '') + '"></div>' +
      '</div>' +
      '<div class="form-group"><label>Venue</label><input type="text" id="ev-venue-' + i + '" value="' + escapeHtml(ev.venue || '') + '"></div>' +
      '<div class="form-group"><label>Alamat</label><input type="text" id="ev-address-' + i + '" value="' + escapeHtml(ev.address || '') + '"></div>' +
      '<div class="form-group"><label>Google Maps URL</label><input type="url" id="ev-maps-' + i + '" value="' + escapeHtml(ev.mapUrl || '') + '"></div>' +
      '</div>';
  }).join('');
}

async function saveEvents() {
  var events = adminData.events || [];
  var updated = events.map(function(ev, i) {
    var enCheckbox = $('ev-enabled-' + i);
    return {
      id: ev.id,
      title: ev.title,
      enabled: enCheckbox ? enCheckbox.checked : true,
      date: $('ev-date-' + i).value,
      time: $('ev-time-' + i).value,
      endTime: $('ev-endtime-' + i).value,
      venue: $('ev-venue-' + i).value.trim(),
      address: $('ev-address-' + i).value.trim(),
      mapUrl: $('ev-maps-' + i).value.trim()
    };
  });
  try {
    await setConfig('events', updated);
    adminData.events = updated;
    showToast('\u2705 Data acara disimpan!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Stories ──────────────────────────────────────────────────
function loadStories() {
  var stories = adminData.stories || [];
  var container = $('stories-list');
  if (!container) return;
  if (!stories.length) { container.innerHTML = '<p style="text-align:center;color:#888">Belum ada cerita</p>'; return; }
  container.innerHTML = stories.map(function(s, i) {
    return '<div class="content-card">' +
      '<div class="content-card-header">' +
      '<strong>' + escapeHtml(s.title) + '</strong>' +
      '<div class="content-card-actions">' +
      '<button onclick="editStory(' + i + ')" class="btn btn-outline btn-sm">\u270F\uFE0F Edit</button>' +
      '<button onclick="deleteStory(' + i + ')" class="btn btn-danger btn-sm">\u{1F5D1}\uFE0F</button>' +
      '</div></div>' +
      '<p>' + formatDate(s.date) + '</p>' +
      '<p>' + escapeHtml(s.description) + '</p>' +
      '</div>';
  }).join('');
}

async function addStory() {
  var title = $('story-title').value.trim();
  var date = $('story-date').value;
  var desc = $('story-desc').value.trim();
  if (!title || !desc) { showToast('\u26A0\uFE0F Judul dan deskripsi harus diisi'); return; }
  var stories = adminData.stories || [];
  var newStory = { id: Date.now(), title: title, date: date, description: desc, photo: '' };
  // Handle photo
  var file = $('story-file');
  if (file && file.files.length) {
    newStory.photo = await fileToBase64(file.files[0]);
  }
  stories.push(newStory);
  try {
    await setConfig('stories', stories);
    adminData.stories = stories;
    $('story-title').value = '';
    $('story-date').value = '';
    $('story-desc').value = '';
    if (file) file.value = '';
    loadStories();
    showToast('\u2705 Cerita ditambahkan!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

async function editStory(index) {
  var stories = adminData.stories || [];
  var s = stories[index];
  if (!s) return;
  var newTitle = prompt('Judul cerita:', s.title);
  if (newTitle === null) return;
  var newDesc = prompt('Deskripsi:', s.description);
  if (newDesc === null) return;
  var newDate = prompt('Tanggal (YYYY-MM-DD):', s.date);
  stories[index] = { id: s.id, title: newTitle, date: newDate || s.date, description: newDesc, photo: s.photo || '' };
  try {
    await setConfig('stories', stories);
    adminData.stories = stories;
    loadStories();
    showToast('\u2705 Cerita diupdate!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

async function deleteStory(index) {
  if (!confirm('Hapus cerita ini?')) return;
  var stories = adminData.stories || [];
  stories.splice(index, 1);
  try {
    await setConfig('stories', stories);
    adminData.stories = stories;
    loadStories();
    showToast('\u2705 Cerita dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Gallery ──────────────────────────────────────────────────
function loadGallery() {
  var gallery = adminData.gallery || [];
  var container = $('gallery-list');
  if (!container) return;
  if (!gallery.length) { container.innerHTML = '<p style="text-align:center;color:#888">Belum ada foto</p>'; return; }
  container.innerHTML = gallery.map(function(p, i) {
    var src = typeof p === 'string' ? p : (p.url || p.dataUrl || '');
    return '<div style="display:inline-block;margin:5px;position:relative">' +
      '<img src="' + src + '" style="width:120px;height:120px;object-fit:cover;border-radius:8px">' +
      '<button onclick="deleteGalleryPhoto(' + i + ')" style="position:absolute;top:2px;right:2px;background:#e74c3c;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px">\u{1F5D1}\uFE0F</button>' +
      '</div>';
  }).join('');
}

async function uploadGalleryPhoto() {
  var file = $('gallery-file');
  var caption = $('gallery-caption').value.trim();
  if (!file || !file.files.length) { showToast('\u26A0\uFE0F Pilih foto terlebih dahulu'); return; }
  showLoading(true);
  try {
    var gallery = adminData.gallery || [];
    var dataUrl = await fileToBase64(file.files[0]);
    gallery.push({ url: dataUrl, caption: caption, uploadedAt: new Date().toISOString() });
    await setConfig('gallery', gallery);
    adminData.gallery = gallery;
    $('gallery-file').value = '';
    $('gallery-caption').value = '';
    loadGallery();
    showLoading(false);
    showToast('\u2705 Foto diupload!');
  } catch (err) {
    showLoading(false);
    showToast('\u274C Error: ' + err.message);
  }
}

async function deleteGalleryPhoto(index) {
  if (!confirm('Hapus foto ini?')) return;
  var gallery = adminData.gallery || [];
  gallery.splice(index, 1);
  try {
    await setConfig('gallery', gallery);
    adminData.gallery = gallery;
    loadGallery();
    showToast('\u2705 Foto dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Music ────────────────────────────────────────────────────
function loadMusic() {
  var music = adminData.music || {};
  var mc = $('music-current');
  if (mc) {
    if (music.dataUrl) {
      mc.innerHTML = '<audio controls src="' + music.dataUrl + '" style="width:100%"></audio><p>' + (music.name || 'Musik tersimpan') + '</p>';
    } else {
      mc.innerHTML = '<p style="color:#888">Belum ada musik</p>';
    }
  }
}

async function uploadMusic() {
  var file = $('music-file');
  if (!file || !file.files.length) { showToast('\u26A0\uFE0F Pilih file musik'); return; }
  showLoading(true);
  try {
    var dataUrl = await fileToBase64(file.files[0]);
    var music = { dataUrl: dataUrl, name: file.files[0].name };
    await setConfig('music', music);
    adminData.music = music;
    file.value = '';
    loadMusic();
    showLoading(false);
    showToast('\u2705 Musik diupload!');
  } catch (err) {
    showLoading(false);
    showToast('\u274C Error: ' + err.message);
  }
}

async function removeMusic() {
  if (!confirm('Hapus musik?')) return;
  try {
    await setConfig('music', { dataUrl: '', name: '' });
    adminData.music = { dataUrl: '', name: '' };
    loadMusic();
    showToast('\u2705 Musik dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Theme ────────────────────────────────────────────────────
function loadTheme() {
  var t = adminData.theme || {};
  if ($('theme-primary')) $('theme-primary').value = t.primaryColor || '#d4648a';
  if ($('theme-primary-light')) $('theme-primary-light').value = t.primaryColorLight || '#f0a5c0';
  if ($('theme-primary-dark')) $('theme-primary-dark').value = t.primaryColorDark || '#b84670';
  if ($('theme-dark-bg')) $('theme-dark-bg').value = t.darkBg || '#2d1520';
  if ($('theme-body-bg')) $('theme-body-bg').value = t.bodyBg || '#fff5f7';
  if ($('theme-body-text')) $('theme-body-text').value = t.bodyText || '#333333';
  // Update preset selection
  document.querySelectorAll('.theme-preset').forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-preset') === t.preset);
  });

  // Background previews & Opacity sliders
  var bgConfig = [
    { key: 'hero', field: 'heroBg', opField: 'heroBgOpacity', defOp: 30 },
    { key: 'open', field: 'openBg', opField: 'openBgOpacity', defOp: 40 },
    { key: 'couple', field: 'coupleBg', opField: 'coupleBgOpacity', defOp: 15 },
    { key: 'story', field: 'storyBg', opField: 'storyBgOpacity', defOp: 15 },
    { key: 'events', field: 'eventsBg', opField: 'eventsBgOpacity', defOp: 20 },
    { key: 'gallery', field: 'galleryBg', opField: 'galleryBgOpacity', defOp: 15 },
    { key: 'rsvp', field: 'rsvpBg', opField: 'rsvpBgOpacity', defOp: 15 },
    { key: 'qris', field: 'qrisBg', opField: 'qrisBgOpacity', defOp: 20 }
  ];

  bgConfig.forEach(function(item) {
    var opVal = t[item.opField] !== undefined ? t[item.opField] : item.defOp;
    var slider = $('theme-' + item.key + '-bg-opacity');
    var badge = $(item.key + '-opacity-val');
    var prev = $(item.key + '-bg-preview');
    if (slider) slider.value = opVal;
    if (badge) badge.textContent = opVal + '%';
    if (prev) {
      if (t[item.field]) {
        prev.innerHTML = '<img src="' + t[item.field] + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;opacity:' + (opVal / 100) + ';">';
      } else {
        prev.innerHTML = '<span style="color:#aaa;font-size:11px;display:flex;align-items:center;justify-content:center;height:100%;">Belum diatur</span>';
      }
    }
  });
}

async function saveThemeColors() {
  var theme = adminData.theme || {};
  theme.primaryColor = $('theme-primary').value;
  theme.primaryColorLight = $('theme-primary-light').value;
  theme.primaryColorDark = $('theme-primary-dark').value;
  theme.darkBg = $('theme-dark-bg').value;
  theme.bodyBg = $('theme-body-bg').value;
  theme.bodyText = $('theme-body-text').value;
  try {
    await setConfig('theme', theme);
    adminData.theme = theme;
    showToast('✅ Warna tema disimpan!');
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

async function applyThemePreset(preset) {
  var presets = {
    pink: { primary: '#d4648a', light: '#f0a5c0', dark: '#b84670', darkBg: '#2d1520', bodyBg: '#fff5f7', bodyText: '#333333' },
    gold: { primary: '#d4af37', light: '#f5e6c8', dark: '#b8960c', darkBg: '#1a1a2e', bodyBg: '#fff8f0', bodyText: '#333333' },
    royal: { primary: '#4a6fa5', light: '#a8c5da', dark: '#2d4a7a', darkBg: '#0d1b2a', bodyBg: '#f0f4f8', bodyText: '#333333' },
    sage: { primary: '#7d9b76', light: '#d4e2d0', dark: '#5a7d52', darkBg: '#1a2e1a', bodyBg: '#f5f8f4', bodyText: '#333333' },
    lavender: { primary: '#9b7fb8', light: '#ddd0f0', dark: '#7a5c99', darkBg: '#1e1a2e', bodyBg: '#f8f5ff', bodyText: '#333333' },
    sunset: { primary: '#e07c4f', light: '#f5d4b5', dark: '#c45a2c', darkBg: '#2e1a0d', bodyBg: '#fff8f0', bodyText: '#333333' }
  };
  var colors = presets[preset];
  if (!colors) return;
  document.querySelectorAll('.theme-preset').forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-preset') === preset);
  });
  if ($('theme-primary')) $('theme-primary').value = colors.primary;
  if ($('theme-primary-light')) $('theme-primary-light').value = colors.light;
  if ($('theme-primary-dark')) $('theme-primary-dark').value = colors.dark;
  if ($('theme-dark-bg')) $('theme-dark-bg').value = colors.darkBg;
  if ($('theme-body-bg')) $('theme-body-bg').value = colors.bodyBg;
  if ($('theme-body-text')) $('theme-body-text').value = colors.bodyText;
  var theme = adminData.theme || {};
  theme.preset = preset;
  theme.primaryColor = colors.primary;
  theme.primaryColorLight = colors.light;
  theme.primaryColorDark = colors.dark;
  theme.darkBg = colors.darkBg;
  theme.bodyBg = colors.bodyBg;
  theme.bodyText = colors.bodyText;
  try {
    await setConfig('theme', theme);
    adminData.theme = theme;
    showToast('✅ Tema ' + preset + ' diterapkan!');
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

async function uploadThemeBg(field) {
  var fileInput = $('theme-' + field.replace(/([A-Z])/g, '-$1').toLowerCase());
  if (!fileInput || !fileInput.files.length) {
    showToast('⚠️ Pilih file background terlebih dahulu');
    return;
  }
  showLoading(true);
  try {
    var dataUrl = await fileToBase64(fileInput.files[0], 1400, 0.82);
    var theme = adminData.theme || {};
    theme[field] = dataUrl;
    await setConfig('theme', theme);
    adminData.theme = theme;
    fileInput.value = '';
    loadTheme();
    showLoading(false);
    showToast('✅ Background berhasil diupload!');
  } catch (err) {
    showLoading(false);
    showToast('❌ Error: ' + err.message);
  }
}

async function removeThemeBg(field) {
  if (!confirm('Hapus background ini?')) return;
  try {
    var theme = adminData.theme || {};
    theme[field] = '';
    await setConfig('theme', theme);
    adminData.theme = theme;
    loadTheme();
    showToast('✅ Background dihapus!');
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

async function saveThemeBgSettings() {
  var theme = adminData.theme || {};
  var bgKeys = ['hero', 'open', 'couple', 'story', 'events', 'gallery', 'rsvp', 'qris'];
  bgKeys.forEach(function(k) {
    var slider = $('theme-' + k + '-bg-opacity');
    if (slider) {
      theme[k + 'BgOpacity'] = parseInt(slider.value, 10);
    }
  });
  try {
    await setConfig('theme', theme);
    adminData.theme = theme;
    loadTheme();
    showToast('✅ Pengaturan transparansi background disimpan!');
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

// ── Sidebar Helpers ──────────────────────────────────────────
function openSidebar() {
  var sb = $('sidebar');
  var bd = $('sidebar-backdrop');
  if (sb) sb.classList.add('open');
  if (bd) bd.classList.add('active');
}
function closeSidebar() {
  var sb = $('sidebar');
  var bd = $('sidebar-backdrop');
  if (sb) sb.classList.remove('open');
  if (bd) bd.classList.remove('active');
}

// ── QRIS ─────────────────────────────────────────────────────
function loadQris() {
  var qris = adminData.qris || {};
  var prev = $('qris-preview');
  if (prev) {
    if (qris.image) {
      prev.innerHTML = '<img src="' + qris.image + '" style="width:100%;height:100%;object-fit:contain;">';
    } else {
      prev.innerHTML = '<span style="color:#aaa;font-size:13px;">Belum ada QRIS</span>';
    }
  }
  if ($('qris-name-input')) $('qris-name-input').value = qris.name || '';
  if ($('qris-note-input')) $('qris-note-input').value = qris.note || '';
}

async function uploadQris() {
  var fileInput = $('qris-file');
  if (!fileInput || !fileInput.files.length) {
    showToast('\u26A0\uFE0F Pilih file gambar QRIS terlebih dahulu');
    return;
  }
  showLoading(true);
  try {
    var dataUrl = await fileToBase64(fileInput.files[0]);
    var qris = adminData.qris || {};
    qris.image = dataUrl;
    await setConfig('qris', qris);
    adminData.qris = qris;
    fileInput.value = '';
    loadQris();
    showLoading(false);
    showToast('\u2705 Gambar QRIS berhasil diupload!');
  } catch (err) {
    showLoading(false);
    showToast('\u274C Error: ' + err.message);
  }
}

async function removeQris() {
  if (!confirm('Hapus gambar QRIS?')) return;
  try {
    var qris = adminData.qris || {};
    qris.image = '';
    await setConfig('qris', qris);
    adminData.qris = qris;
    loadQris();
    showToast('\u2705 Gambar QRIS dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

async function saveQris() {
  var name = $('qris-name-input') ? $('qris-name-input').value.trim() : '';
  var note = $('qris-note-input') ? $('qris-note-input').value.trim() : '';
  var qris = adminData.qris || {};
  qris.name = name;
  qris.note = note;
  try {
    await setConfig('qris', qris);
    adminData.qris = qris;
    showToast('\u2705 Data QRIS disimpan!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── RSVP ─────────────────────────────────────────────────────
function loadRsvps() {
  var rsvps = adminData.rsvps || [];
  var tbody = $('rsvp-tbody');
  if (!tbody) return;
  if (!rsvps.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888">Belum ada RSVP</td></tr>'; return; }
  tbody.innerHTML = rsvps.map(function(r, i) {
    var attendance = r.attendance === 'hadir' ? '\u2705 Hadir' : (r.attendance === 'ragu' ? '\u{1F914} Ragu' : '\u274C Tidak Hadir');
    return '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><strong>' + escapeHtml(r.name) + '</strong></td>' +
      '<td>' + attendance + '</td>' +
      '<td>' + (r.guests || 1) + '</td>' +
      '<td>' + escapeHtml(r.message || '-') + '</td>' +
      '<td>' + (r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-') + '</td>' +
      '</tr>';
  }).join('');
}

async function deleteRsvpAdmin(id) {
  if (!confirm('Hapus RSVP ini?')) return;
  try {
    await sbDelete('rsvps', 'id=eq.' + id);
    adminData.rsvps = adminData.rsvps.filter(function(r) { return r.id !== id; });
    loadRsvps();
    showToast('\u2705 RSVP dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Wishes ───────────────────────────────────────────────────
function loadWishes() {
  var wishes = adminData.wishes || [];
  var container = $('wishes-admin-list');
  if (!container) return;
  if (!wishes.length) { container.innerHTML = '<p style="text-align:center;color:#888">Belum ada ucapan</p>'; return; }
  container.innerHTML = wishes.map(function(w) {
    return '<div class="content-card">' +
      '<div class="content-card-header">' +
      '<strong>' + escapeHtml(w.name) + '</strong>' +
      '<button onclick="deleteWishById(' + w.id + ')" class="btn btn-danger btn-sm">\u{1F5D1}\uFE0F Hapus</button>' +
      '</div>' +
      '<p>\u201C' + escapeHtml(w.message) + '\u201D</p>' +
      '<small style="color:#888">' + (w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : '') + '</small>' +
      '</div>';
  }).join('');
}

async function deleteWishById(id) {
  if (!confirm('Hapus ucapan ini?')) return;
  try {
    await deleteWish(id);
    adminData.wishes = adminData.wishes.filter(function(w) { return w.id !== id; });
    loadWishes();
    loadDashboard();
    showToast('\u2705 Ucapan dihapus!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Settings ─────────────────────────────────────────────────
async function exportAllData() {
  try {
    var data = await exportData();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-data-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('\u2705 Data di-export!');
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

async function importAllData(input) {
  var file = input.files[0];
  if (!file) return;
  showLoading(true);
  try {
    var text = await file.text();
    var imported = JSON.parse(text);
    if (imported.config) {
      for (var key of Object.keys(imported.config)) {
        await setConfig(key, imported.config[key]);
      }
    }
    if (imported.rsvps) {
      for (var r of imported.rsvps) {
        var { id, ...rest } = r;
        await addRsvp(rest);
      }
    }
    if (imported.wishes) {
      for (var w of imported.wishes) {
        var { id, ...rest } = w;
        await addWish(rest);
      }
    }
    showLoading(false);
    await loadAll();
    showToast('\u2705 Data di-import! Refresh halaman.');
  } catch (err) {
    showLoading(false);
    showToast('\u274C Error import: ' + err.message);
  }
}

async function resetAllData() {
  if (!confirm('\u26A0\uFE0F Yakin ingin reset semua data ke default?')) return;
  if (!confirm('Konfirmasi: SEMUA DATA AKAN HAPUS!')) return;
  showLoading(true);
  try {
    // Delete all config
    var allConfig = await sbGet('config', 'select=key');
    for (var row of allConfig) {
      await sbDelete('config', 'key=eq.' + encodeURIComponent(row.key));
    }
    // Delete all rsvps and wishes
    var allRsvps = await sbGet('rsvps', 'select=id');
    for (var r of allRsvps) { await sbDelete('rsvps', 'id=eq.' + r.id); }
    var allWishes = await sbGet('wishes', 'select=id');
    for (var w of allWishes) { await sbDelete('wishes', 'id=eq.' + w.id); }
    // Re-insert defaults
    await saveAllConfig(DEFAULT_DATA);
    await loadAll();
    showLoading(false);
    showToast('\u2705 Data di-reset ke default!');
  } catch (err) {
    showLoading(false);
    showToast('❌ Error: ' + err.message);
  }
}

// ── Opening Text ─────────────────────────────────────────────
function loadOpening() {
  var opening = adminData.opening || (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.opening) || {};
  if ($('opening-title')) $('opening-title').value = opening.title || 'Kepada Yth. Bapak/Ibu/Saudara/i';
  if ($('opening-subtitle')) $('opening-subtitle').value = opening.subtitle || 'Mohon maaf apabila ada kesalahan penulisan nama dan gelar';
  if ($('opening-btn-text')) $('opening-btn-text').value = opening.buttonText || 'Buka Undangan';
}

async function saveOpening() {
  var title = $('opening-title') ? $('opening-title').value.trim() : '';
  var subtitle = $('opening-subtitle') ? $('opening-subtitle').value.trim() : '';
  var btnText = $('opening-btn-text') ? $('opening-btn-text').value.trim() : '';
  var opening = {
    title: title || 'Kepada Yth. Bapak/Ibu/Saudara/i',
    subtitle: subtitle || 'Mohon maaf apabila ada kesalahan penulisan nama dan gelar',
    buttonText: btnText || 'Buka Undangan'
  };
  try {
    await setConfig('opening', opening);
    adminData.opening = opening;
    showToast('✅ Teks pembuka berhasil disimpan!');
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // 1. ATTACH ALL NAVIGATION & CLICK HANDLERS IMMEDIATELY (SYNCHRONOUS)
  // Ensures buttons, menus, and hamburger work immediately with zero delay
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      showPage(item.getAttribute('data-page'));
    });
  });

  // Hamburger menu & mobile sidebar drawer
  var hamburger = $('hamburger');
  var sidebarClose = $('sidebar-close');
  var sidebarBackdrop = $('sidebar-backdrop');
  if (hamburger) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      openSidebar();
    });
  }
  if (sidebarClose) {
    sidebarClose.addEventListener('click', function() {
      closeSidebar();
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', function() {
      closeSidebar();
    });
  }

  // Opening save
  var btnSaveOpening = $('btn-save-opening');
  if (btnSaveOpening) btnSaveOpening.addEventListener('click', saveOpening);

  // QRIS events
  var btnQrisUpload = $('btn-qris-upload');
  if (btnQrisUpload) btnQrisUpload.addEventListener('click', uploadQris);
  var btnQrisRemove = $('btn-qris-remove');
  if (btnQrisRemove) btnQrisRemove.addEventListener('click', removeQris);
  var btnSaveQris = $('btn-save-qris');
  if (btnSaveQris) btnSaveQris.addEventListener('click', saveQris);

  // Couple save & instant photo previews
  var btnSaveCouple = $('btn-save-couple');
  if (btnSaveCouple) btnSaveCouple.addEventListener('click', saveCouple);
  var groomFileInput = $('groom-photo-file');
  if (groomFileInput) {
    groomFileInput.addEventListener('change', function() {
      if (groomFileInput.files && groomFileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var gc = $('groom-photo-current');
          if (gc) gc.innerHTML = '<img src="' + e.target.result + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-top:5px"><p style="font-size:11px;color:#27ae60;font-weight:600">Foto dipilih (klik Simpan di bawah untuk simpan ke Supabase)</p>';
        };
        reader.readAsDataURL(groomFileInput.files[0]);
      }
    });
  }
  var brideFileInput = $('bride-photo-file');
  if (brideFileInput) {
    brideFileInput.addEventListener('change', function() {
      if (brideFileInput.files && brideFileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var bc = $('bride-photo-current');
          if (bc) bc.innerHTML = '<img src="' + e.target.result + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-top:5px"><p style="font-size:11px;color:#27ae60;font-weight:600">Foto dipilih (klik Simpan di bawah untuk simpan ke Supabase)</p>';
        };
        reader.readAsDataURL(brideFileInput.files[0]);
      }
    });
  }

  // Events save
  var btnSaveEvents = $('btn-save-events');
  if (btnSaveEvents) btnSaveEvents.addEventListener('click', saveEvents);

  // Story add
  var btnAddStory = $('btn-add-story');
  if (btnAddStory) btnAddStory.addEventListener('click', addStory);

  // Gallery upload
  var btnUploadGallery = $('btn-upload-gallery');
  if (btnUploadGallery) btnUploadGallery.addEventListener('click', uploadGalleryPhoto);

  // Music upload/remove
  var btnUploadMusic = $('btn-upload-music');
  if (btnUploadMusic) btnUploadMusic.addEventListener('click', uploadMusic);
  var btnRemoveMusic = $('btn-remove-music');
  if (btnRemoveMusic) btnRemoveMusic.addEventListener('click', removeMusic);

  // Theme presets
  document.querySelectorAll('.theme-preset').forEach(function(preset) {
    preset.addEventListener('click', function() {
      applyThemePreset(preset.getAttribute('data-preset'));
    });
  });

  // Theme colors save
  var btnSaveColors = $('btn-save-colors');
  if (btnSaveColors) btnSaveColors.addEventListener('click', saveThemeColors);

  // Theme background uploads
  var btnHeroBg = $('btn-hero-bg');
  if (btnHeroBg) btnHeroBg.addEventListener('click', function() { uploadThemeBg('heroBg'); });
  var btnHeroBgRm = $('btn-hero-bg-rm');
  if (btnHeroBgRm) btnHeroBgRm.addEventListener('click', function() { removeThemeBg('heroBg'); });

  var btnOpenBg = $('btn-open-bg');
  if (btnOpenBg) btnOpenBg.addEventListener('click', function() { uploadThemeBg('openBg'); });
  var btnOpenBgRm = $('btn-open-bg-rm');
  if (btnOpenBgRm) btnOpenBgRm.addEventListener('click', function() { removeThemeBg('openBg'); });

  // Section bg uploads
  ['couple', 'story', 'events', 'gallery', 'rsvp', 'qris'].forEach(function(section) {
    var uploadBtn = $('btn-' + section + '-bg');
    var removeBtn = $('btn-' + section + '-bg-rm');
    if (uploadBtn) uploadBtn.addEventListener('click', function() { uploadThemeBg(section + 'Bg'); });
    if (removeBtn) removeBtn.addEventListener('click', function() { removeThemeBg(section + 'Bg'); });
  });

  // Background Opacity Sliders live update
  var bgOpacityKeys = ['hero', 'open', 'couple', 'story', 'events', 'gallery', 'rsvp', 'qris'];
  bgOpacityKeys.forEach(function(key) {
    var slider = $('theme-' + key + '-bg-opacity');
    var badge = $(key + '-opacity-val');
    var prev = $(key + '-bg-preview');
    if (slider) {
      slider.addEventListener('input', function() {
        if (badge) badge.textContent = slider.value + '%';
        if (prev) {
          var img = prev.querySelector('img');
          if (img) img.style.opacity = slider.value / 100;
        }
      });
    }
  });

  // Save Background Settings
  var btnSaveBgSettings = $('btn-save-bg-settings');
  if (btnSaveBgSettings) btnSaveBgSettings.addEventListener('click', saveThemeBgSettings);

  // Settings
  var btnExport = $('btn-export');
  if (btnExport) btnExport.addEventListener('click', exportAllData);
  var btnImportLabel = $('btn-import-label');
  var btnImport = $('btn-import');
  if (btnImportLabel && btnImport) {
    btnImportLabel.addEventListener('click', function() { btnImport.click(); });
    btnImport.addEventListener('change', function() { importAllData(btnImport); });
  }
  var btnReset = $('btn-reset');
  if (btnReset) btnReset.addEventListener('click', resetAllData);

  // 2. Render initial view based on current hash or saved tab so refresh never resets to dashboard
  var initialPage = (window.location.hash ? window.location.hash.replace('#', '') : '') || sessionStorage.getItem('admin_active_page') || 'dashboard';
  if (VALID_ADMIN_PAGES.indexOf(initialPage) === -1) initialPage = 'dashboard';
  showPage(initialPage, false);

  window.addEventListener('hashchange', function() {
    var h = window.location.hash.replace('#', '');
    if (h && VALID_ADMIN_PAGES.indexOf(h) !== -1) {
      showPage(h, false);
    }
  });

  // 3. Fetch latest data from database asynchronously in background
  loadAll().then(function() {
    var activeItem = document.querySelector('.nav-item.active');
    var activePage = activeItem ? activeItem.getAttribute('data-page') : initialPage;
    showPage(activePage, false);
  }).catch(function(err) {
    console.warn('loadAll background error:', err);
  });
});


