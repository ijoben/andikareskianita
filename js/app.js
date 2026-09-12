/* ============================================================
   Wedding Invitation Landing Page — Supabase Edition
   ============================================================ */

var weddingData = null;

// ── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('id-ID', opts);
}
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr + ' WIB';
}
function $(id) { return document.getElementById(id); }

function showToast(msg) {
  // Create toast if not exists
  var t = $('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}

function showLoading(show) {
  var el = $('loading-screen');
  if (!el) return;
  el.style.display = show ? 'flex' : 'none';
}

// ── Theme ────────────────────────────────────────────────────
function applyTheme(theme) {
  if (!theme) return;
  var r = document.documentElement;
  if (theme.primaryColor) r.style.setProperty('--primary', theme.primaryColor);
  if (theme.primaryColorLight) r.style.setProperty('--primary-light', theme.primaryColorLight);
  if (theme.primaryColorDark) r.style.setProperty('--primary-dark', theme.primaryColorDark);
  if (theme.darkBg) r.style.setProperty('--dark-bg', theme.darkBg);
  if (theme.bodyBg) r.style.setProperty('--light-bg', theme.bodyBg);
  if (theme.bodyText) r.style.setProperty('--text', theme.bodyText);
  // Hero background
  if (theme.heroBg) {
    var heroEl = $('hero');
    if (heroEl) {
      heroEl.style.backgroundImage = "url('" + theme.heroBg + "')";
      heroEl.style.backgroundSize = 'cover';
      heroEl.style.backgroundPosition = 'center';
    }
  }
  // Section backgrounds
  if (theme.coupleBg) applySectionBg('couple', theme.coupleBg);
  if (theme.storyBg) applySectionBg('story', theme.storyBg);
  if (theme.eventsBg) applySectionBg('events', theme.eventsBg);
  if (theme.galleryBg) applySectionBg('gallery', theme.galleryBg);
  if (theme.rsvpBg) applySectionBg('rsvp', theme.rsvpBg);
}

function applySectionBg(sectionId, url) {
  if (!url) return;
  var el = $(sectionId);
  if (!el) return;
  el.style.backgroundImage = "url('" + url + "')";
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundAttachment = 'fixed';
}

// ── Overlay ──────────────────────────────────────────────────
function renderOverlay(data) {
  var t = data.theme || {};
  if (t.openBg) {
    var ol = $('open-overlay');
    if (ol) {
      ol.style.backgroundImage = "url('" + t.openBg + "')";
      ol.style.backgroundSize = 'cover';
      ol.style.backgroundPosition = 'center';
    }
  }
  var couple = data.couple || {};
  var olNames = $('open-names');
  if (olNames) {
    olNames.innerHTML = '<span class="name-groom">' + (couple.groom ? couple.groom.name : 'Mempelai Pria') + '</span>' +
      '<span class="ampersand">&</span>' +
      '<span class="name-bride">' + (couple.bride ? couple.bride.name : 'Mempelai Wanita') + '</span>';
  }
  var olDate = $('open-date');
  if (olDate) {
    var events = data.events || [];
    var akad = events.find(function(e) { return e.id === 'akad'; });
    if (akad) olDate.textContent = formatDateShort(akad.date);
  }
  createPetals();
}

// ── Open invitation ──────────────────────────────────────────
function openInvitation() {
  var overlay = $('open-overlay');
  var content = $('main-content');
  if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
  if (content) {
    content.classList.remove('hidden');
    content.classList.add('visible');
    startCountdown();
    window.scrollTo(0, 0);
  }
}

// ── Hero ─────────────────────────────────────────────────────
function renderHero(data) {
  var couple = data.couple || {};
  var groomName = couple.groom ? couple.groom.name : 'Mempelai Pria';
  var brideName = couple.bride ? couple.bride.name : 'Mempelai Wanita';
  var heroGroom = $('hero-groom');
  var heroBride = $('hero-bride');
  if (heroGroom) heroGroom.textContent = groomName;
  if (heroBride) heroBride.textContent = brideName;
  var events = data.events || [];
  var akad = events.find(function(e) { return e.id === 'akad'; });
  var heroDate = $('hero-date-text');
  if (heroDate && akad) {
    var d = new Date(akad.date);
    heroDate.textContent = d.getDate() + ' \u2022 ' + (d.getMonth() + 1) + ' \u2022 ' + d.getFullYear();
  }
}

// ── Countdown ────────────────────────────────────────────────
function startCountdown() {
  var events = weddingData.events || [];
  var akad = events.find(function(e) { return e.id === 'akad'; });
  if (!akad) return;
  var target = new Date(akad.date + 'T' + (akad.time || '08:00') + ':00').getTime();
  function update() {
    var now = Date.now();
    var diff = target - now;
    if (diff <= 0) {
      var els = ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'];
      els.forEach(function(id) { var el = $(id); if (el) el.textContent = '0'; });
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var de = $('cd-days'), he = $('cd-hours'), me = $('cd-minutes'), se = $('cd-seconds');
    if (de) de.textContent = d;
    if (he) he.textContent = h;
    if (me) me.textContent = m;
    if (se) se.textContent = s;
  }
  update();
  setInterval(update, 1000);
}

// ── Couple ───────────────────────────────────────────────────
function renderCouple(data) {
  var couple = data.couple || {};
  var groom = couple.groom || {};
  var bride = couple.bride || {};
  var gp = $('groom-photo'), bp = $('bride-photo');
  if (gp) gp.src = groom.photo || 'assets/images/groom.jpg';
  if (bp) bp.src = bride.photo || 'assets/images/bride.jpg';
  var gn = $('groom-name'), bn = $('bride-name');
  if (gn) gn.innerHTML = groom.fullName || groom.name || '';
  if (bn) bn.innerHTML = bride.fullName || bride.name || '';
  var gpar = $('groom-parents'), bpar = $('bride-parents');
  if (gpar) gpar.innerHTML = 'Putra dari<br>' + (groom.father || '') + '<br>&<br>' + (groom.mother || '');
  if (bpar) bpar.innerHTML = 'Putri dari<br>' + (bride.father || '') + '<br>&<br>' + (bride.mother || '');
  var qt = $('couple-quote-text');
  if (qt) qt.textContent = '\u201C' + (couple.quote || '') + '\u201D';
  var footerG = $('footer-groom'), footerB = $('footer-bride');
  if (footerG) footerG.textContent = groom.name || '';
  if (footerB) footerB.textContent = bride.name || '';
}

// ── Story ────────────────────────────────────────────────────
function renderStory(data) {
  var container = $('story-timeline');
  if (!container) return;
  var stories = data.stories || [];
  if (!stories.length) { container.innerHTML = '<p class="empty-text">Belum ada cerita cinta</p>'; return; }
  container.innerHTML = stories.map(function(s, i) {
    return '<div class="timeline-item ' + (i % 2 === 0 ? 'left' : 'right') + '">' +
      '<div class="timeline-date">' + formatDateShort(s.date) + '</div>' +
      '<div class="timeline-content">' +
      '<div class="timeline-icon">\u{1F495}</div>' +
      '<h3>' + (s.title || '') + '</h3>' +
      '<p>' + (s.description || '') + '</p>' +
      '</div></div>';
  }).join('');
}

// ── Events ───────────────────────────────────────────────────
function renderEvents(data) {
  var container = $('events-grid');
  if (!container) return;
  var events = data.events || [];
  if (!events.length) { container.innerHTML = '<p class="empty-text">Belum ada info acara</p>'; return; }
  container.innerHTML = events.map(function(ev) {
    var icon = ev.id === 'akad' ? '\u{1F48D}' : '\u{1F38A}';
    var html = '<div class="event-card">' +
      '<div class="event-icon">' + icon + '</div>' +
      '<h3>' + (ev.title || '') + '</h3>' +
      '<div class="event-details">' +
      '<div class="event-detail"><span>\u{1F4C5}</span><span>' + formatDate(ev.date) + '</span></div>' +
      '<div class="event-detail"><span>\u{23F0}</span><span>' + formatTime(ev.time) + '</span></div>' +
      '<div class="event-detail"><span>\u{1F4CD}</span><span>' + (ev.venue || '') + '</span></div>' +
      '<div class="event-detail"><span>\u{1F4CC}</span><span>' + (ev.address || '') + '</span></div>' +
      '</div>';
    if (ev.mapUrl) html += '<a href="' + ev.mapUrl + '" target="_blank" class="btn-map">\u{1F4CD} Lihat Peta</a>';
    html += '</div>';
    return html;
  }).join('');
}

// ── Gallery ──────────────────────────────────────────────────
function renderGallery(data) {
  var container = $('gallery-grid');
  if (!container) return;
  var gallery = data.gallery || [];
  if (!gallery.length) { container.innerHTML = '<p class="empty-text">Belum ada foto</p>'; return; }
  container.innerHTML = gallery.map(function(p, i) {
    var src = typeof p === 'string' ? p : (p.url || p.dataUrl || '');
    return '<div class="gallery-item" onclick="openLightbox(' + i + ')">' +
      '<img src="' + src + '" alt="Gallery ' + (i + 1) + '" loading="lazy">' +
      '<div class="gallery-overlay"><span>\u{1F50D}</span></div></div>';
  }).join('');
}

function openLightbox(index) {
  var gallery = weddingData.gallery || [];
  if (!gallery.length) return;
  var lb = $('lightbox'), img = $('lightbox-img');
  if (!lb || !img) return;
  var src = typeof gallery[index] === 'string' ? gallery[index] : (gallery[index].url || gallery[index].dataUrl || '');
  img.src = src;
  lb.classList.remove('hidden');
  lb.classList.add('active');
  lb.dataset.current = index;
}
function closeLightbox() {
  var lb = $('lightbox');
  if (lb) { lb.classList.remove('active'); lb.classList.add('hidden'); }
}
function navLightbox(dir) {
  var gallery = weddingData.gallery || [];
  var lb = $('lightbox');
  if (!lb) return;
  var idx = parseInt(lb.dataset.current || 0) + dir;
  if (idx < 0) idx = gallery.length - 1;
  if (idx >= gallery.length) idx = 0;
  openLightbox(idx);
}

// ── RSVP ─────────────────────────────────────────────────────
function renderRsvpList(rsvps) {
  var container = $('rsvp-list');
  var counter = $('rsvp-count');
  if (!container) return;
  if (counter) counter.textContent = rsvps.length;
  if (!rsvps.length) { container.innerHTML = '<p class="empty-text">Belum ada konfirmasi</p>'; return; }
  container.innerHTML = rsvps.slice(0, 10).map(function(r) {
    var statusClass = r.attendance === 'hadir' ? 'attending' : (r.attendance === 'ragu' ? 'maybe' : 'absent');
    var statusText = r.attendance === 'hadir' ? '\u2705 Hadir' : (r.attendance === 'ragu' ? '\u{1F914} Mungkin' : '\u274C Tidak Hadir');
    return '<div class="rsvp-card ' + statusClass + '">' +
      '<div class="rsvp-avatar">' + (r.name || 'A').charAt(0) + '</div>' +
      '<div class="rsvp-info"><div class="rsvp-name">' + (r.name || '') + '</div>' +
      '<div class="rsvp-status">' + statusText + '</div></div></div>';
  }).join('');
}

async function submitRsvp(e) {
  e.preventDefault();
  var name = $('rsvp-name').value.trim();
  var attendance = document.querySelector('input[name="attendance"]:checked');
  var guests = parseInt($('rsvp-guests').value) || 1;
  var message = $('rsvp-message').value.trim();
  if (!name) { showToast('\u26A0\uFE0F Nama harus diisi!'); return; }
  if (!attendance) { showToast('\u26A0\uFE0F Pilih kehadiran!'); return; }
  try {
    await addRsvp({ name: name, attendance: attendance.value, guests: guests, message: message });
    showToast('\u2705 Terima kasih atas konfirmasi Anda!');
    $('rsvp-form').reset();
    // Reload RSVP list
    var rsvps = await getRsvps();
    renderRsvpList(rsvps);
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Wishes ───────────────────────────────────────────────────
function renderWishes(wishes) {
  var container = $('wishes-grid');
  var counter = $('wishes-count');
  if (!container) return;
  if (counter) counter.textContent = wishes.length;
  if (!wishes.length) { container.innerHTML = '<p class="empty-text">Belum ada ucapan</p>'; return; }
  container.innerHTML = wishes.slice(0, 20).map(function(w) {
    return '<div class="wish-card">' +
      '<div class="wish-avatar">' + (w.name || 'A').charAt(0) + '</div>' +
      '<div class="wish-content"><div class="wish-name">' + (w.name || '') + '</div>' +
      '<div class="wish-text">' + (w.message || '') + '</div>' +
      '<div class="wish-time">' + (w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : '') + '</div>' +
      '</div></div>';
  }).join('');
}

async function submitWish(e) {
  e.preventDefault();
  var name = $('wish-name').value.trim();
  var message = $('wish-message').value.trim();
  if (!name || !message) { showToast('\u26A0\uFE0F Nama dan ucapan harus diisi!'); return; }
  try {
    await addWish({ name: name, message: message });
    showToast('\u2705 Ucapan berhasil dikirim!');
    $('wish-form').reset();
    var wishes = await getWishes();
    renderWishes(wishes);
  } catch (err) {
    showToast('\u274C Error: ' + err.message);
  }
}

// ── Music ────────────────────────────────────────────────────
function initMusic() {
  var audio = $('bg-music');
  var btn = $('music-toggle');
  if (!audio || !btn) return;
  var music = weddingData.music || {};
  if (music.dataUrl) audio.src = music.dataUrl;
  btn.addEventListener('click', function() {
    if (audio.paused) { audio.play(); btn.innerHTML = '<i class="fas fa-music"></i>'; }
    else { audio.pause(); btn.innerHTML = '<i class="fas fa-music"></i>'; btn.style.opacity = '0.5'; }
  });
}

// ── Scroll to bottom button ──────────────────────────────────
function initScrollBtn() {
  var btn = $('scroll-down-btn');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) { btn.classList.remove('hidden'); }
    else { btn.classList.add('hidden'); }
    btn.innerHTML = (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100)
      ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
    btn.onclick = function() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.offsetHeight, behavior: 'smooth' });
      }
    };
  });
}

// ── Bottom nav ───────────────────────────────────────────────
function initBottomNav() {
  var navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-target') || btn.getAttribute('onclick').match(/'([^']+)'/)?.[1];
      if (target) {
        var el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  // Active state on scroll
  var sections = ['hero', 'couple', 'story', 'events', 'gallery', 'rsvp'];
  window.addEventListener('scroll', function() {
    var current = 'hero';
    sections.forEach(function(id) {
      var el = $(id);
      if (el && el.getBoundingClientRect().top <= 200) current = id;
    });
    navItems.forEach(function(btn) {
      var target = btn.getAttribute('data-target') || '';
      btn.classList.toggle('active', target === current);
    });
  });
}

// ── Flower petals ────────────────────────────────────────────
function createPetals() {
  var container = $('flower-petals');
  if (!container) return;
  container.innerHTML = '';
  var count = window.innerWidth < 768 ? 12 : 20;
  for (var i = 0; i < count; i++) {
    var petal = document.createElement('div');
    petal.className = 'petal';
    var size = Math.random() * 15 + 8;
    var left = Math.random() * 100;
    var delay = Math.random() * 10;
    var duration = Math.random() * 6 + 6;
    var drift = (Math.random() - 0.5) * 120;
    petal.style.cssText = 'left:' + left + 'vw;width:' + size + 'px;height:' + size + 'px;' +
      'animation-delay:' + delay + 's;animation-duration:' + duration + 's;--drift:' + drift + 'px;';
    container.appendChild(petal);
  }
}

// ── Particles ────────────────────────────────────────────────
function createParticles() {
  ['open-particles', 'hero-particles'].forEach(function(id) {
    var container = $(id);
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < 30; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = Math.random() * 4 + 1;
      p.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + size + 'px;height:' + size + 'px;' +
        'animation-delay:' + (Math.random() * 8) + 's;animation-duration:' + (Math.random() * 4 + 4) + 's;';
      container.appendChild(p);
    }
  });
}

// ── Scroll reveal ────────────────────────────────────────────
function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(function(el) { observer.observe(el); });
}

// ── Bottom nav scroll function (global) ──────────────────────
function scrollToSection(id) {
  var el = $(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  showLoading(true);
  try {
    weddingData = await loadAllConfig();
    applyTheme(weddingData.theme);
    renderOverlay(weddingData);
    renderHero(weddingData);
    renderCouple(weddingData);
    renderStory(weddingData);
    renderEvents(weddingData);
    renderGallery(weddingData);
    // Load RSVP and Wishes from separate tables
    var rsvps = await getRsvps();
    renderRsvpList(rsvps);
    var wishes = await getWishes();
    renderWishes(wishes);
    initMusic();
    initScrollBtn();
    initBottomNav();
    createParticles();
    initScrollReveal();

    // Event listeners
    var openBtn = $('open-btn');
    if (openBtn) openBtn.addEventListener('click', openInvitation);
    var rsvpForm = $('rsvp-form');
    if (rsvpForm) rsvpForm.addEventListener('submit', submitRsvp);
    var wishForm = $('wish-form');
    if (wishForm) wishForm.addEventListener('submit', submitWish);
    var lbClose = $('lightbox-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    var lbPrev = $('lightbox-prev');
    if (lbPrev) lbPrev.addEventListener('click', function() { navLightbox(-1); });
    var lbNext = $('lightbox-next');
    if (lbNext) lbNext.addEventListener('click', function() { navLightbox(1); });
    var lb = $('lightbox');
    if (lb) lb.addEventListener('click', function(e) { if (e.target.id === 'lightbox') closeLightbox(); });
  } catch (err) {
    console.error('Init error:', err);
    showToast('\u274C Gagal memuat data. Pastikan Supabase sudah dikonfigurasi.');
  }
  showLoading(false);
}

document.addEventListener('DOMContentLoaded', init);
