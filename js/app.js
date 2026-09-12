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
  var heroBgEl = document.querySelector('#hero .hero-bg');
  if (heroBgEl) {
    if (theme.heroBg) {
      heroBgEl.style.backgroundImage = "url('" + theme.heroBg + "')";
      var heroOp = (theme.heroBgOpacity !== undefined && theme.heroBgOpacity !== null && theme.heroBgOpacity !== '') ? parseFloat(theme.heroBgOpacity) / 100 : 0.3;
      heroBgEl.style.opacity = heroOp;
    } else {
      heroBgEl.style.backgroundImage = '';
    }
  }
  // Section backgrounds
  applySectionBg('couple', theme.coupleBg, theme.coupleBgOpacity);
  applySectionBg('story', theme.storyBg, theme.storyBgOpacity);
  applySectionBg('events', theme.eventsBg, theme.eventsBgOpacity);
  applySectionBg('gallery', theme.galleryBg, theme.galleryBgOpacity);
  applySectionBg('rsvp', theme.rsvpBg, theme.rsvpBgOpacity);
  applySectionBg('qris', theme.qrisBg, theme.qrisBgOpacity);
}

function applySectionBg(sectionId, url, opacity) {
  var el = $(sectionId);
  if (!el) return;
  var existingBg = el.querySelector(':scope > .section-bg');
  if (!url) {
    if (existingBg) existingBg.remove();
    return;
  }
  if (!existingBg) {
    existingBg = document.createElement('div');
    existingBg.className = 'section-bg';
    el.insertBefore(existingBg, el.firstChild);
  }
  existingBg.style.backgroundImage = "url('" + url + "')";
  var op = (opacity !== undefined && opacity !== null && opacity !== '') ? parseFloat(opacity) / 100 : 0.15;
  existingBg.style.opacity = op;
}

// ── Overlay ──────────────────────────────────────────────────
function renderOverlay(data) {
  var t = data.theme || {};
  var ol = $('open-overlay');
  if (ol) {
    var olBg = ol.querySelector('.open-bg-overlay');
    if (!olBg) {
      olBg = document.createElement('div');
      olBg.className = 'open-bg-overlay';
      olBg.style.position = 'absolute';
      olBg.style.inset = '0';
      olBg.style.backgroundSize = 'cover';
      olBg.style.backgroundPosition = 'center';
      olBg.style.pointerEvents = 'none';
      olBg.style.zIndex = '0';
      ol.insertBefore(olBg, ol.firstChild);
    }
    if (t.openBg) {
      olBg.style.backgroundImage = "url('" + t.openBg + "')";
      var openOp = (t.openBgOpacity !== undefined && t.openBgOpacity !== null && t.openBgOpacity !== '') ? parseFloat(t.openBgOpacity) / 100 : 0.4;
      olBg.style.opacity = openOp;
    } else {
      olBg.style.backgroundImage = '';
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
    var activeEvent = events.find(function(e) { return e.enabled !== false; }) || events[0];
    if (activeEvent && activeEvent.date) olDate.textContent = formatDateShort(activeEvent.date);
  }
  createPetals();
}

// ── Open invitation ──────────────────────────────────────────
function openInvitation() {
  var overlay = $('open-overlay');
  var content = $('main-content');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 800);
  }
  if (content) {
    content.classList.remove('hidden');
    content.classList.add('visible');
    startCountdown();
    window.scrollTo(0, 0);
  }
  // Try autoplay music on user interaction
  var audio = $('bg-music');
  if (audio && audio.src && audio.paused) {
    audio.play().catch(function() {});
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
  var activeEvent = events.find(function(e) { return e.enabled !== false; }) || events[0];
  var heroDate = $('hero-date-text');
  if (heroDate && activeEvent && activeEvent.date) {
    var d = new Date(activeEvent.date);
    heroDate.textContent = d.getDate() + ' \u2022 ' + (d.getMonth() + 1) + ' \u2022 ' + d.getFullYear();
  }
}

// ── Countdown ────────────────────────────────────────────────
function startCountdown() {
  if (!weddingData) return;
  var events = weddingData.events || [];
  var activeEvent = events.find(function(e) { return e.enabled !== false; }) || events[0];
  if (!activeEvent || !activeEvent.date) return;
  var target = new Date(activeEvent.date + 'T' + (activeEvent.time || '08:00') + ':00').getTime();
  function update() {
    var now = Date.now();
    var diff = target - now;
    if (diff <= 0) {
      var els = ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'];
      els.forEach(function(id) { var el = $(id); if (el) el.textContent = '00'; });
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var de = $('cd-days'), he = $('cd-hours'), me = $('cd-minutes'), se = $('cd-seconds');
    if (de) de.textContent = d < 10 ? '0' + d : d;
    if (he) he.textContent = h < 10 ? '0' + h : h;
    if (me) me.textContent = m < 10 ? '0' + m : m;
    if (se) se.textContent = s < 10 ? '0' + s : s;
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
      '<div class="timeline-icon"><i class="fas fa-heart"></i></div>' +
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
  var activeEvents = events.filter(function(e) { return e.enabled !== false; });
  if (!activeEvents.length) { container.innerHTML = '<p class="empty-text">Belum ada info acara yang aktif</p>'; return; }
  container.innerHTML = activeEvents.map(function(ev) {
    var icon = ev.id === 'akad' ? '<i class="fas fa-ring"></i>' : '<i class="fas fa-glass-cheers"></i>';
    var html = '<div class="event-card">' +
      '<div class="event-icon">' + icon + '</div>' +
      '<h3>' + (ev.title || '') + '</h3>' +
      '<div class="event-details">' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="far fa-calendar-alt"></i></span><span>' + formatDate(ev.date) + '</span></div>' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="far fa-clock"></i></span><span>' + formatTime(ev.time) + '</span></div>' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="fas fa-map-marker-alt"></i></span><span>' + (ev.venue || '') + '</span></div>' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="fas fa-map-pin"></i></span><span>' + (ev.address || '') + '</span></div>' +
      '</div>';
    if (ev.mapUrl) html += '<a href="' + ev.mapUrl + '" target="_blank" class="btn-map"><i class="fas fa-map-marked-alt"></i> Lihat Peta</a>';
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
      '<div class="gallery-overlay"><span><i class="fas fa-search-plus"></i></span></div></div>';
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
    var statusIcon = r.attendance === 'hadir' ? '<i class="fas fa-check-circle"></i> Hadir' : (r.attendance === 'ragu' ? '<i class="fas fa-question-circle"></i> Mungkin' : '<i class="fas fa-times-circle"></i> Tidak Hadir');
    return '<div class="rsvp-card ' + statusClass + '">' +
      '<div class="rsvp-avatar">' + (r.name || 'A').charAt(0) + '</div>' +
      '<div class="rsvp-info"><div class="rsvp-name">' + (r.name || '') + '</div>' +
      '<div class="rsvp-status">' + statusIcon + '</div></div></div>';
  }).join('');
}

async function submitRsvp(e) {
  e.preventDefault();
  var name = $('rsvp-name').value.trim();
  var attendance = document.querySelector('input[name="attendance"]:checked');
  var guests = parseInt($('rsvp-guests').value) || 1;
  var message = $('rsvp-message').value.trim();
  if (!name) { showToast('Nama harus diisi!'); return; }
  if (!attendance) { showToast('Pilih kehadiran!'); return; }
  try {
    await addRsvp({ name: name, attendance: attendance.value, guests: guests, message: message });
    showToast('Terima kasih atas konfirmasi Anda!');
    $('rsvp-form').reset();
    // Reload RSVP list
    var rsvps = await getRsvps();
    renderRsvpList(rsvps);
  } catch (err) {
    showToast('Error: ' + err.message);
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
  if (!name || !message) { showToast('Nama dan ucapan harus diisi!'); return; }
  try {
    await addWish({ name: name, message: message });
    showToast('Ucapan berhasil dikirim!');
    $('wish-form').reset();
    var wishes = await getWishes();
    renderWishes(wishes);
  } catch (err) {
    showToast('Error: ' + err.message);
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
    if (audio.paused) {
      audio.play();
      btn.innerHTML = '<i class="fas fa-music"></i>';
      btn.style.opacity = '1';
    } else {
      audio.pause();
      btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      btn.style.opacity = '0.6';
    }
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

// ── Flower petals (Gentle & Slow Sakura) ─────────────────────
function createPetals() {
  var container = $('flower-petals');
  if (!container) return;
  container.innerHTML = '';
  // Subtle count: 8 on mobile, 15 on desktop for calm, luxurious ambiance
  var count = window.innerWidth < 768 ? 8 : 15;
  for (var i = 0; i < count; i++) {
    var petal = document.createElement('div');
    petal.className = 'petal';
    var sizeW = Math.random() * 8 + 12; // 12px to 20px
    var sizeH = sizeW * (Math.random() * 0.4 + 1.2); // natural petal elongation
    var left = Math.random() * 96 + 2;
    var delay = Math.random() * 12;
    var duration = Math.random() * 8 + 12; // slow 12-20 seconds falling
    var drift = (Math.random() - 0.5) * 80;
    petal.style.cssText = 'left:' + left + 'vw;width:' + sizeW + 'px;height:' + sizeH + 'px;' +
      'animation-delay:' + delay + 's;animation-duration:' + duration + 's;--drift:' + drift + 'px;';
    container.appendChild(petal);
  }
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

// ── QRIS & Gift ──────────────────────────────────────────────
function renderQRIS(data) {
  var qris = data.qris || {};
  var imgEl = $('qris-image');
  var nameEl = $('qris-name');
  var noteEl = $('qris-note');
  var copyWrap = $('qris-copy-wrapper');
  if (imgEl) {
    if (qris.image) {
      imgEl.innerHTML = '<img src="' + qris.image + '" alt="QRIS Code">';
    } else {
      imgEl.innerHTML = '<span class="qris-placeholder"><i class="fas fa-qrcode" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.4;"></i>QRIS belum diupload</span>';
    }
  }
  if (nameEl) nameEl.textContent = qris.name || 'a.n. Mempelai';
  if (noteEl) noteEl.textContent = qris.note || 'Terima kasih atas doa restu & kado Anda';
  if (copyWrap) {
    if (qris.note && qris.note.trim().length > 0) {
      copyWrap.style.display = 'block';
    } else {
      copyWrap.style.display = 'none';
    }
  }
}

function copyQrisNote() {
  var noteEl = $('qris-note');
  if (!noteEl || !noteEl.textContent) return;
  var text = noteEl.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Info rekening / catatan berhasil disalin!');
    }).catch(function() {
      showToast('Gagal menyalin info');
    });
  } else {
    // Fallback
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Info rekening / catatan berhasil disalin!');
  }
}

// ── Immediate Button Setup ───────────────────────────────────
// Allow instant opening without blocking on network/database
function setupOpenButton() {
  var openBtn = $('open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
    openBtn.addEventListener('touchstart', function(e) {
      // Fast touch reaction
      openInvitation();
    }, { passive: true });
  }
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  setupOpenButton();
  createPetals();
  initScrollReveal();
  initScrollBtn();
  initBottomNav();

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
    renderQRIS(weddingData);
    // Load RSVP and Wishes from separate tables
    var rsvps = await getRsvps();
    renderRsvpList(rsvps);
    var wishes = await getWishes();
    renderWishes(wishes);
    initMusic();

    // Event listeners
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
    showToast('Gagal memuat data. Pastikan Supabase sudah dikonfigurasi.');
  }
  showLoading(false);
}

document.addEventListener('DOMContentLoaded', init);
