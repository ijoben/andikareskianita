/* ============================================================
   Wedding Invitation Landing Page — Supabase Edition
   ============================================================ */

// Clean .html from address bar
if (window.history && window.history.replaceState && window.location.pathname.endsWith('.html')) {
  var cleanAppPath = window.location.pathname.replace(/\.html$/, '');
  if (cleanAppPath === '/index') cleanAppPath = '/';
  window.history.replaceState(null, '', cleanAppPath + window.location.search + window.location.hash);
}

var weddingData = null;
var invitationOpened = false;

// ── Helpers ──────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
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
  if (theme.iconColor) {
    r.style.setProperty('--gold', theme.iconColor);
    r.style.setProperty('--icon-color', theme.iconColor);
  }
  // Hero background
  var heroBgEl = document.querySelector('#hero .hero-bg');
  if (heroBgEl) {
    if (theme.heroBg) {
      heroBgEl.style.backgroundImage = "url('" + theme.heroBg + "')";
      var heroOp = (theme.heroBgOpacity !== undefined && theme.heroBgOpacity !== null && theme.heroBgOpacity !== '') ? parseFloat(theme.heroBgOpacity) / 100 : 0.45;
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

  // Opening text from config and query parameter (?to=GuestName)
  var op = data.opening || (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.opening) || {};
  var urlParams = new URLSearchParams(window.location.search);
  var guestName = urlParams.get('to') || urlParams.get('u') || urlParams.get('guest');

  var openToEl = document.querySelector('.open-to');
  if (openToEl) {
    var baseTitle = op.title || 'Kepada Yth. Bapak/Ibu/Saudara/i';
    if (guestName) {
      openToEl.innerHTML = escapeHtml(baseTitle) + '<br><span style="display:inline-block;margin-top:8px;font-size:1.15em;font-weight:700;color:var(--gold);text-shadow:0 2px 4px rgba(0,0,0,0.4);">' + escapeHtml(guestName) + '</span>';
    } else {
      openToEl.textContent = baseTitle;
    }
  }

  var openSubEl = document.querySelector('.open-subtitle');
  if (openSubEl) {
    openSubEl.textContent = op.subtitle || 'Mohon maaf apabila ada kesalahan penulisan nama dan gelar';
  }

  var openBtnEl = $('open-btn');
  if (openBtnEl) {
    openBtnEl.innerHTML = '<i class="fas fa-envelope-open"></i> ' + escapeHtml(op.buttonText || 'Buka Undangan');
  }

  createPetals();
}

// ── Open invitation ──────────────────────────────────────────
function openInvitation(instant) {
  if (invitationOpened && !instant) return;
  invitationOpened = true;
  try { sessionStorage.setItem('invitation_opened', '1'); } catch (e) {}

  var overlay = $('open-overlay');
  var content = $('main-content');
  if (overlay) {
    if (instant) {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
    } else {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 800);
    }
  }
  if (content) {
    content.classList.remove('hidden');
    content.classList.add('visible');
    startCountdown();
    initScrollReveal();
    if (!instant) window.scrollTo(0, 0);
  }

  // Auto-play music softly on open invitation
  playMusicSoftly();
}

// ── Close invitation ─────────────────────────────────────────
function closeInvitation() {
  invitationOpened = false;
  try { sessionStorage.removeItem('invitation_opened'); } catch (e) {}

  // Pause music if playing
  var audio = $('bg-music');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    musicPlaying = false;
  }
  var mBtn = $('music-toggle');
  if (mBtn) mBtn.classList.remove('playing');

  // Hide scroll down button
  var scrollBtn = $('scroll-down-btn');
  if (scrollBtn) scrollBtn.classList.add('hidden');

  // Scroll to top instantly
  window.scrollTo({ top: 0, behavior: 'instant' });

  var overlay = $('open-overlay');
  var content = $('main-content');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.pointerEvents = 'auto';
    requestAnimationFrame(function() {
      overlay.style.opacity = '1';
    });
  }
  if (content) {
    content.classList.add('hidden');
    content.classList.remove('visible');
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
  startCountdown();
}

// ── Countdown ────────────────────────────────────────────────
var countdownInterval = null;

function startCountdown() {
  var data = weddingData || (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA : null);
  if (!data) return;
  var events = data.events || [];
  var activeEvent = events.find(function(e) { return e.enabled !== false; }) || events[0];
  if (!activeEvent || !activeEvent.date) return;

  var target;
  try {
    var dateParts = String(activeEvent.date).trim().split('-');
    var timeStr = (activeEvent.time || '08:00').trim().split(' ')[0];
    var timeParts = timeStr.split(':');
    var y = parseInt(dateParts[0], 10);
    var mo = parseInt(dateParts[1], 10) - 1;
    var day = parseInt(dateParts[2], 10);
    var h = parseInt(timeParts[0] || '8', 10);
    var mi = parseInt(timeParts[1] || '0', 10);
    target = new Date(y, mo, day, h, mi, 0).getTime();
  } catch (err) {
    target = new Date(activeEvent.date + 'T' + (activeEvent.time || '08:00') + ':00').getTime();
  }

  if (!target || isNaN(target)) return;

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  function update() {
    var now = Date.now();
    var diff = target - now;
    var de = $('cd-days'), he = $('cd-hours'), me = $('cd-minutes'), se = $('cd-seconds');
    if (diff <= 0) {
      if (de) de.textContent = '00';
      if (he) he.textContent = '00';
      if (me) me.textContent = '00';
      if (se) se.textContent = '00';
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      return;
    }
    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var s = Math.floor((diff % (1000 * 60)) / 1000);

    if (de) de.textContent = d < 10 ? '0' + d : String(d);
    if (he) he.textContent = h < 10 ? '0' + h : String(h);
    if (me) me.textContent = m < 10 ? '0' + m : String(m);
    if (se) se.textContent = s < 10 ? '0' + s : String(s);
  }

  update();
  countdownInterval = setInterval(update, 1000);
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
  var events = (data && data.events) || (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA.events : []);
  var activeEvents = events.filter(function(e) { return e.enabled !== false; });
  if (!activeEvents.length) {
    activeEvents = events; // Fallback so Waktu & Tempat is never empty
  }
  if (!activeEvents.length) {
    container.innerHTML = '<p class="empty-text">Belum ada info acara yang aktif</p>';
    return;
  }
  container.innerHTML = activeEvents.map(function(ev) {
    var icon = ev.id === 'akad' ? '<i class="fas fa-ring"></i>' : '<i class="fas fa-glass-cheers"></i>';
    var timeText = formatTime(ev.time);
    if (ev.endTime && ev.endTime.trim()) {
      timeText += ' - ' + formatTime(ev.endTime);
    }
    var html = '<div class="event-card">' +
      '<div class="event-icon">' + icon + '</div>' +
      '<h3>' + escapeHtml(ev.title || (ev.id === 'akad' ? 'Akad Nikah' : 'Resepsi')) + '</h3>' +
      '<div class="event-details">' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="far fa-calendar-alt"></i></span><span>' + formatDate(ev.date) + '</span></div>' +
      '<div class="event-detail"><span class="event-detail-icon"><i class="far fa-clock"></i></span><span>' + timeText + '</span></div>';
    if (ev.venue && ev.venue.trim()) {
      html += '<div class="event-detail"><span class="event-detail-icon"><i class="fas fa-map-marker-alt"></i></span><span>' + escapeHtml(ev.venue) + '</span></div>';
    }
    if (ev.address && ev.address.trim()) {
      html += '<div class="event-detail"><span class="event-detail-icon"><i class="fas fa-map-pin"></i></span><span>' + escapeHtml(ev.address) + '</span></div>';
    }
    html += '</div>';
    if (ev.mapUrl && ev.mapUrl.trim()) {
      html += '<a href="' + ev.mapUrl + '" target="_blank" rel="noopener noreferrer" class="btn-map"><i class="fas fa-map-marked-alt"></i> Lihat Peta</a>';
    }
    html += '</div>';
    return html;
  }).join('');
  startCountdown();
}

// ── Gallery ──────────────────────────────────────────────────
function renderGallery(data) {
  var container = $('gallery-grid');
  if (!container) return;
  var gallery = (data && data.gallery) || [];
  if (!gallery.length) {
    container.innerHTML = '<p class="empty-text">Belum ada foto</p>';
    return;
  }
  container.innerHTML = gallery.map(function(p, i) {
    var src = '';
    if (typeof p === 'string') {
      src = p;
    } else if (p && typeof p === 'object') {
      src = p.url || p.dataUrl || '';
    }
    if (!src) return '';
    return '<div class="gallery-item" onclick="openLightbox(' + i + ')">' +
      '<img src="' + src + '" alt="Gallery ' + (i + 1) + '" loading="lazy">' +
      '<div class="gallery-overlay"><span><i class="fas fa-search-plus"></i></span></div></div>';
  }).join('');
}

function openLightbox(index) {
  var gallery = (weddingData && weddingData.gallery) || [];
  if (!gallery.length) return;
  var lb = $('lightbox'), img = $('lightbox-img');
  if (!lb || !img) return;
  var p = gallery[index];
  var src = typeof p === 'string' ? p : (p.url || p.dataUrl || '');
  img.src = src;
  lb.classList.remove('hidden');
  lb.classList.add('active');
  lb.style.display = 'flex';
  lb.dataset.current = index;
}
function closeLightbox() {
  var lb = $('lightbox');
  if (lb) {
    lb.classList.remove('active');
    lb.classList.add('hidden');
    lb.style.display = 'none';
  }
}
function navLightbox(dir) {
  var gallery = (weddingData && weddingData.gallery) || [];
  var lb = $('lightbox');
  if (!lb || !gallery.length) return;
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
      '<div class="rsvp-avatar">' + escapeHtml((r.name || 'A').charAt(0)) + '</div>' +
      '<div class="rsvp-info"><div class="rsvp-name">' + escapeHtml(r.name || '') + '</div>' +
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
  if (!attendance) { showToast('Pilih status kehadiran!'); return; }

  var submitBtn = e.target.querySelector('button[type="submit"]');
  var originalBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
  }

  // 1. Simpan ke Supabase: Tabel rsvps
  try {
    await addRsvp({ name: name, attendance: attendance.value, guests: guests, message: message });
  } catch (err) {
    console.warn('Gagal addRsvp ke Supabase:', err);
  }

  // 2. Simpan juga ke tabel wishes agar langsung muncul di section Ucapan & Doa
  if (message) {
    try {
      await addWish({ name: name, message: message });
    } catch (err) {
      console.warn('Gagal addWish ke Supabase:', err);
    }
  }

  // 3. Refresh daftar Ucapan & Doa agar seketika tampil di bawah
  try {
    var freshWishes = await getWishes();
    renderWishes(freshWishes);
  } catch (err) {
    console.warn('Refresh wishes error:', err);
  }

  // 4. Siapkan format pesan WhatsApp mempelai
  var couple = (weddingData && weddingData.couple) || {};
  var groomName = (couple.groom && couple.groom.name) ? couple.groom.name : 'Andika';
  var brideName = (couple.bride && couple.bride.name) ? couple.bride.name : 'Rezki';
  var attLabel = attendance.value === 'hadir' ? 'Hadir' : (attendance.value === 'tidak_hadir' ? 'Tidak Hadir' : 'Masih Ragu');
  var guestLabel = attendance.value === 'hadir' ? ' (' + guests + ' Orang)' : '';

  var waMessage = 'Halo ' + groomName + ' & ' + brideName + ',\n\n' +
    'Saya ingin mengonfirmasi kehadiran untuk acara pernikahan Anda:\n' +
    '• *Nama:* ' + name + '\n' +
    '• *Status Kehadiran:* ' + attLabel + guestLabel + '\n' +
    (message ? '• *Ucapan & Doa:* ' + message + '\n' : '') +
    '\nTerima kasih!';

  var rawPhone = couple.whatsapp || (weddingData && weddingData.whatsapp) || '';
  var cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  var waUrl = cleanPhone
    ? 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waMessage)
    : 'https://api.whatsapp.com/send?text=' + encodeURIComponent(waMessage);

  // 5. Tampilkan status sukses di halaman & pasang URL WhatsApp
  var formEl = $('rsvp-form');
  var successEl = $('rsvp-success');
  if (formEl) formEl.style.display = 'none';
  if (successEl) {
    successEl.classList.remove('hidden');
    successEl.style.display = 'block';
    var waBtn = $('btn-open-wa');
    if (waBtn) {
      waBtn.href = waUrl;
      waBtn.style.display = 'inline-flex';
    }
  }

  showToast('Terima kasih! Konfirmasi tersimpan, mengarahkan ke WhatsApp...');

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }

  // 6. Otomatis alihkan ke WhatsApp
  setTimeout(function() {
    var win = window.open(waUrl, '_blank');
    if (!win) {
      window.location.href = waUrl;
    }
  }, 600);
}

function resetRsvpForm() {
  var formEl = $('rsvp-form');
  var successEl = $('rsvp-success');
  if (formEl) {
    formEl.reset();
    formEl.style.display = 'block';
  }
  if (successEl) {
    successEl.classList.add('hidden');
    successEl.style.display = 'none';
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
      '<div class="wish-avatar">' + escapeHtml((w.name || 'A').charAt(0)) + '</div>' +
      '<div class="wish-content"><div class="wish-name">' + escapeHtml(w.name || '') + '</div>' +
      '<div class="wish-text">' + escapeHtml(w.message || '') + '</div>' +
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
function playMusicSoftly() {
  var audio = $('bg-music');
  var btn = $('music-toggle');
  if (!audio) return;
  audio.volume = 0.25; // Gentle and soft volume (0.25)
  var p = audio.play();
  if (p !== undefined) {
    p.then(function() {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-music"></i>';
        btn.style.opacity = '1';
        btn.classList.add('playing');
      }
    }).catch(function(err) {
      console.warn('Audio auto-play prevented by browser policy:', err);
      // Fallback: If autoplay was blocked by browser, play as soon as guest interacts with document
      function resumeAudio() {
        if (invitationOpened && audio.paused) {
          audio.volume = 0.25;
          audio.play().then(function() {
            if (btn) {
              btn.innerHTML = '<i class="fas fa-music"></i>';
              btn.style.opacity = '1';
              btn.classList.add('playing');
            }
          }).catch(function() {});
        }
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      }
      document.addEventListener('click', resumeAudio, { once: true });
      document.addEventListener('touchstart', resumeAudio, { once: true });
    });
  }
}

function initMusic() {
  var audio = $('bg-music');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'bg-music';
    audio.loop = true;
    audio.preload = 'auto';
    audio.src = 'assets/audio/music.mp3';
    document.body.appendChild(audio);
  } else if (!audio.src || audio.src === '') {
    audio.src = 'assets/audio/music.mp3';
  }

  var btn = $('music-toggle');
  var music = (weddingData && weddingData.music) || {};
  if (music.dataUrl && music.dataUrl !== '' && !audio.src.endsWith(music.dataUrl)) {
    var isPlaying = !audio.paused;
    audio.src = music.dataUrl;
    if (isPlaying || invitationOpened) {
      audio.volume = 0.25;
      audio.play().catch(function() {});
    }
  }
  audio.volume = 0.25; // Gentle & soft volume

  // If envelope is already opened, ensure music starts playing
  if (invitationOpened && audio.paused) {
    playMusicSoftly();
  }

  if (btn) {
    btn.onclick = function() {
      if (audio.paused) {
        audio.volume = 0.25;
        audio.play().then(function() {
          btn.innerHTML = '<i class="fas fa-music"></i>';
          btn.style.opacity = '1';
          btn.classList.add('playing');
        }).catch(function(e) { console.warn('Music play error:', e); });
      } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.style.opacity = '0.6';
        btn.classList.remove('playing');
      }
    };
  }
}

// ── Scroll to bottom button ──────────────────────────────────
function initScrollBtn() {
  var btn = $('scroll-down-btn');
  if (!btn) return;
  btn.onclick = function() {
    var scrollY = window.scrollY || window.pageYOffset;
    var atBottom = (window.innerHeight + scrollY >= document.body.offsetHeight - 120);
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.offsetHeight, behavior: 'smooth' });
    }
  };
}

// ── Bottom nav & High-Performance Throttled Scroll Listener ──
function initBottomNav() {
  var navItems = document.querySelectorAll('.bottom-nav-item');
  var btn = $('scroll-down-btn');
  var sections = ['hero', 'couple', 'story', 'events', 'gallery', 'rsvp'];

  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var onclickAttr = item.getAttribute('onclick') || '';
      var m = onclickAttr.match(/'([^']+)'/);
      var targetId = m ? m[1] : '';
      if (targetId) {
        var el = $(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Single passive throttled scroll listener for 60fps/120fps mobile performance
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var scrollY = window.scrollY || window.pageYOffset;
        // 1. Scroll-down button update
        if (btn) {
          if (scrollY > 300) {
            btn.classList.remove('hidden');
            var atBottom = (window.innerHeight + scrollY >= document.body.offsetHeight - 120);
            btn.innerHTML = atBottom ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
          } else {
            btn.classList.add('hidden');
          }
        }
        // 2. Active state update
        var current = 'hero';
        for (var i = 0; i < sections.length; i++) {
          var el = $(sections[i]);
          if (el && el.getBoundingClientRect().top <= 250) {
            current = sections[i];
          }
        }
        navItems.forEach(function(item) {
          var onclickAttr = item.getAttribute('onclick') || '';
          var matches = onclickAttr.indexOf("'" + current + "'") !== -1 || onclickAttr.indexOf('"' + current + '"') !== -1;
          item.classList.toggle('active', matches);
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Flower petals (Gentle & Ultra-Smooth Sakura) ─────────────
function createPetals() {
  var container = $('flower-petals');
  if (!container) return;
  container.innerHTML = '';
  // Subtle count: 5 on mobile, 10 on desktop for silky smooth 60fps scrolling
  var count = window.innerWidth < 768 ? 5 : 10;
  for (var i = 0; i < count; i++) {
    var petal = document.createElement('div');
    petal.className = 'petal';
    var sizeW = Math.random() * 5 + 11; // 11px to 16px
    var sizeH = sizeW * (Math.random() * 0.3 + 1.2);
    var left = Math.random() * 94 + 3;
    var delay = Math.random() * 8;
    var duration = Math.random() * 6 + 14; // slow 14-20 seconds falling
    var drift = (Math.random() - 0.5) * 60;
    petal.style.cssText = 'left:' + left + 'vw;width:' + sizeW + 'px;height:' + sizeH + 'px;' +
      'animation-delay:' + delay + 's;animation-duration:' + duration + 's;--drift:' + drift + 'px;';
    container.appendChild(petal);
  }
}


// ── Scroll reveal ────────────────────────────────────────────
function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals || !reveals.length) return;
  if (typeof IntersectionObserver === 'undefined') {
    reveals.forEach(function(el) { el.classList.add('revealed'); });
    return;
  }
  try {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function(el) { observer.observe(el); });
  } catch (e) {
    reveals.forEach(function(el) { el.classList.add('revealed'); });
  }
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
    openBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openInvitation();
    });
    openBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      openInvitation();
    });
  }
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  setupOpenButton();
  initMusic(); // Initialize audio & toggle listener IMMEDIATELY so it's ready with zero delay
  startCountdown(); // Start countdown timer immediately with fallback data so digits tick right away
  createPetals();
  initScrollReveal();
  initScrollBtn();
  initBottomNav();

  // If user previously opened invitation in this session, keep it open on refresh
  try {
    if (sessionStorage.getItem('invitation_opened') === '1') {
      openInvitation(true);
    }
  } catch (e) {}

  // 1. Render immediately using DEFAULT_DATA so NO section is ever blank while loading
  if (typeof DEFAULT_DATA !== 'undefined') {
    weddingData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    applyTheme(weddingData.theme || {});
    renderOverlay(weddingData);
    renderHero(weddingData);
    renderCouple(weddingData);
    renderStory(weddingData);
    renderEvents(weddingData);
    renderGallery(weddingData);
    renderQRIS(weddingData);
  }

  showLoading(true);
  try {
    var freshData = await loadAllConfig();
    if (freshData) {
      weddingData = freshData;
      applyTheme(weddingData.theme || {});
      renderOverlay(weddingData);
      renderHero(weddingData);
      renderCouple(weddingData);
      renderStory(weddingData);
      renderEvents(weddingData);
      renderGallery(weddingData);
      renderQRIS(weddingData);
      initMusic(); // Re-sync in case custom music data was loaded from Supabase
      initScrollReveal();
    }
  } catch (err) {
    console.error('Init error:', err);
    showToast('Gagal memuat data terbaru dari database.');
  } finally {
    showLoading(false);
  }

  // Load RSVP and Wishes asynchronously in background without blocking page render
  getRsvps().then(function(rsvps) {
    renderRsvpList(rsvps);
  }).catch(function(e) { console.warn('getRsvps error:', e); });

  getWishes().then(function(wishes) {
    renderWishes(wishes);
  }).catch(function(e) { console.warn('getWishes error:', e); });

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
}

document.addEventListener('DOMContentLoaded', init);
