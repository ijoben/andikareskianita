(function(){
var w=null,g=[],ci=0,mp=false,au=null;
function gE(id){return document.getElementById(id)}

function init(){
  gE('open-btn').onclick=openInv;
  gE('rsvp-form').onsubmit=submitRsvp;
  gE('music-toggle').onclick=toggleMusic;
  gE('lightbox-close').onclick=closeLB;
  gE('lightbox-prev').onclick=function(){ci=(ci-1+g.length)%g.length;showLB(ci)};
  gE('lightbox-next').onclick=function(){ci=(ci+1)%g.length;showLB(ci)};
  gE('lightbox').onclick=function(e){if(e.target===e.currentTarget)closeLB()};
  gE('scroll-down-btn').onclick=function(){window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})};
  load();
}

// ===== FLOWER PETALS =====
function createFlowerPetals(count){
  var container=gE('flower-petals');
  if(!container)return;
  container.innerHTML='';
  var colors=['#f8a4c8','#f472b6','#ec4899','#f9a8d4','#fbcfe8','#fda4af','#fb7185'];
  for(var i=0;i<count;i++){
    var p=document.createElement('div');
    p.className='petal';
    var size=Math.random()*16+10;
    var color=colors[Math.floor(Math.random()*colors.length)];
    var opacity=(Math.random()*.3+.15).toFixed(2);
    var duration=(Math.random()*8+8).toFixed(1);
    var delay=(Math.random()*12).toFixed(1);
    var drift=(Math.random()*160-80).toFixed(0);
    var spin=(Math.random()*720-360).toFixed(0);
    p.style.cssText='--size:'+size+'px;--opacity:'+opacity+';--duration:'+duration+'s;--delay:'+delay+'s;--drift:'+drift+'px;--spin:'+spin+'deg;left:'+Math.random()*100+'%';
    p.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 10 12 14 12 14S16.5 10 16.5 6.5C16.5 4 14.5 2 12 2Z" fill="'+color+'"/><ellipse cx="8" cy="8" rx="4" ry="5" fill="'+color+'" opacity=".7" transform="rotate(-30 8 8)"/><ellipse cx="16" cy="8" rx="4" ry="5" fill="'+color+'" opacity=".7" transform="rotate(30 16 8)"/></svg>';
    container.appendChild(p);
  }
}

// ===== THEME =====
function applyTheme(theme){
  if(!theme)return;
  var r=document.documentElement.style;
  if(theme.primaryColor)r.setProperty('--theme-primary',theme.primaryColor);
  if(theme.primaryColorLight)r.setProperty('--theme-primary-light',theme.primaryColorLight);
  if(theme.primaryColorDark)r.setProperty('--theme-primary-dark',theme.primaryColorDark);
  if(theme.darkBg)r.setProperty('--theme-dark-bg',theme.darkBg);
  if(theme.bodyBg)r.setProperty('--theme-body-bg',theme.bodyBg);
  if(theme.bodyText)r.setProperty('--theme-body-text',theme.bodyText);
  if(theme.heroBg){var hb=document.querySelector('.hero-bg');if(hb)hb.style.backgroundImage='url("'+theme.heroBg+')';}
  if(theme.openBg){var ob=gE('open-overlay');if(ob)ob.style.background='url("'+theme.openBg+'") center/cover';}
  var sectionBgs={couple:'couple-section',story:'story-section',events:'events-section',gallery:'gallery-section',rsvp:'rsvp-section'};
  Object.keys(sectionBgs).forEach(function(key){
    var url=theme[key+'Bg'];var el=document.querySelector('.'+sectionBgs[key]);
    if(!el)return;
    if(url){el.classList.add('section-bg');el.style.backgroundImage='url("'+url+')';}
    else{el.classList.remove('section-bg');el.style.backgroundImage='';}
  });
}

// ===== LOAD DATA =====
function load(){
  w=loadData();
  g=w.gallery||[];
  if(w.theme)applyTheme(w.theme);
  updCouple();renderEvents();renderGallery();renderStories(w.stories||[]);renderWishes(w.wishes||[]);
  initMusic();
  createFlowerPetals(20);
  createParticles('open-particles',8);
  initScrollObserver();
}

function openInv(){
  var o=gE('open-overlay');
  o.classList.add('fade-out');
  setTimeout(function(){
    o.classList.add('hidden');
    gE('main-content').classList.remove('hidden');
    gE('scroll-down-btn').classList.remove('hidden');
    initReveal();startCountdown();
    createParticles('hero-particles',15);
    if(au){au.play().catch(function(){});mp=true;updMusic()}
  },800);
}

function createParticles(id,count){
  var c=document.getElementById(id);if(!c)return;
  for(var i=0;i<count;i++){
    var p=document.createElement('div');p.className='particle';
    var size=Math.random()*4+2;
    p.style.width=size+'px';p.style.height=size+'px';
    p.style.left=Math.random()*100+'%';
    p.style.animationDuration=(Math.random()*10+10)+'s';
    p.style.animationDelay=(Math.random()*10)+'s';
    c.appendChild(p);
  }
}

// ===== SCROLL TO SECTION =====
window.scrollToSection=function(id){
  var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
};

function initScrollObserver(){
  var sections=['hero','couple','story','events','gallery','rsvp','wishes'];
  var navItems=document.querySelectorAll('.bottom-nav-item');
  var scrollBtn=gE('scroll-down-btn');
  window.addEventListener('scroll',function(){
    if(window.scrollY>window.innerHeight*.5){
      scrollBtn.classList.remove('hidden');
      scrollBtn.querySelector('i').className='fas fa-chevron-up';
      scrollBtn.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
    }else{scrollBtn.classList.add('hidden');}
  });
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.id;
        navItems.forEach(function(item,i){
          item.classList.toggle('active',['hero','couple','story','events','gallery','rsvp','wishes'][i]===id);
        });
      }
    });
  },{threshold:0.3});
  sections.forEach(function(id){var el=document.getElementById(id);if(el)observer.observe(el);});
}

// ===== DATA UPDATES =====
function updCouple(){
  if(!w)return;var c=w.couple,e=w.events[0];
  gE('hero-groom').textContent=c.groom.name;
  gE('hero-bride').textContent=c.bride.name;
  gE('footer-groom').textContent=c.groom.name;
  gE('footer-bride').textContent=c.bride.name;
  if(e){
    var d=new Date(e.date+'T'+e.time);
    gE('hero-date-text').textContent=d.toLocaleDateString('id-ID',{day:'numeric',month:'numeric',year:'numeric'}).replace(/\//g,'\u2022');
  }
  if(c.groom.photo)gE('groom-photo').src=c.groom.photo;
  gE('groom-name').textContent=c.groom.fullName;
  gE('groom-parents').innerHTML='Putra dari<br>'+c.groom.father+'<br>&amp;<br>'+c.groom.mother;
  if(c.bride.photo)gE('bride-photo').src=c.bride.photo;
  gE('bride-name').textContent=c.bride.fullName;
  gE('bride-parents').innerHTML='Putri dari<br>'+c.bride.father+'<br>&amp;<br>'+c.bride.mother;
  gE('couple-quote-text').textContent='\u201c'+c.quote+'\u201d';
  gE('couple-quote-source').textContent='\u2014 '+c.quoteSource;
}

function startCountdown(){
  if(!w||!w.events[0])return;
  var t=new Date(w.events[0].date+'T'+w.events[0].time);
  function u(){
    var n=new Date(),d=t-n;if(d<=0)return;
    gE('cd-days').textContent=String(Math.floor(d/864e5)).padStart(2,'0');
    gE('cd-hours').textContent=String(Math.floor(d%864e5/36e5)).padStart(2,'0');
    gE('cd-minutes').textContent=String(Math.floor(d%36e5/6e4)).padStart(2,'0');
    gE('cd-seconds').textContent=String(Math.floor(d%6e4/1e3)).padStart(2,'0');
  }
  u();setInterval(u,1000);
}

function renderEvents(){
  if(!w)return;var h='';
  w.events.forEach(function(e){
    var d=new Date(e.date+'T'+e.time);
    var ds=d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    var ic=e.id==='akad'?'fa-ring':'fa-champagne-glasses';
    h+='<div class="event-card reveal"><div class="event-icon"><i class="fas '+ic+'"></i></div>';
    h+='<h3 class="event-title">'+e.title+'</h3>';
    h+='<p class="event-datetime">'+ds+'<br>'+e.time+' - '+e.endTime+' WIB</p>';
    h+='<p class="event-venue">'+e.venue+'</p>';
    h+='<p class="event-address">'+e.address+'</p>';
    h+='<a href="'+e.mapUrl+'" target="_blank" class="event-map-btn"><i class="fas fa-map-marker-alt"></i> Lihat Peta</a></div>';
  });
  gE('events-grid').innerHTML=h;initReveal();
}

function renderGallery(){
  var gr=gE('gallery-grid');
  if(!g||g.length===0){gr.innerHTML='<p style="text-align:center;color:#999;grid-column:1/-1">Belum ada foto</p>';return}
  var h='';g.forEach(function(it,i){
    h+='<div class="gallery-item" onclick="window._lb('+i+')"><img src="'+it.photo+'" alt="'+it.caption+'">';
    h+='<div class="gallery-caption">'+it.caption+'</div></div>';
  });gr.innerHTML=h;
}
window._lb=function(i){showLB(i)};
function showLB(i){ci=i;gE('lightbox-img').src=g[i].photo;gE('lightbox-caption').textContent=g[i].caption;gE('lightbox').classList.remove('hidden');document.body.style.overflow='hidden'}
function closeLB(){gE('lightbox').classList.add('hidden');document.body.style.overflow=''}

function renderStories(st){
  var tl=gE('story-timeline');
  if(!st||st.length===0){tl.innerHTML='<p style="text-align:center;color:#999">Belum ada cerita</p>';return}
  var h='';st.forEach(function(s){
    var d=new Date(s.date);var ds=d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
    h+='<div class="timeline-item reveal"><p class="timeline-date">'+ds+'</p>';
    h+='<h3 class="timeline-title">'+s.title+'</h3>';
    h+='<p class="timeline-desc">'+s.description+'</p>';
    if(s.photo)h+='<img class="timeline-photo" src="'+s.photo+'" alt="'+s.title+'" onerror="this.style.display=\'none\'">';
    h+='</div>';
  });tl.innerHTML=h;initReveal();
}

function renderWishes(wi){
  var gr=gE('wishes-grid');
  if(!wi||wi.length===0){gr.innerHTML='<p style="text-align:center;color:#999;grid-column:1/-1">Belum ada ucapan. Jadilah yang pertama!</p>';return}
  var h='';wi.forEach(function(w){
    var ini=w.name.charAt(0).toUpperCase();
    var d=new Date(w.createdAt);var ds=d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
    h+='<div class="wish-card"><div class="wish-header"><div class="wish-avatar">'+ini+'</div>';
    h+='<div><div class="wish-name">'+w.name+'</div><div class="wish-date">'+ds+'</div></div></div>';
    h+='<p class="wish-message">\u201c'+w.message+'\u201d</p></div>';
  });gr.innerHTML=h;
}

async function submitRsvp(e){
  e.preventDefault();
  var n=gE('rsvp-name').value.trim();
  var at=document.querySelector('input[name="attendance"]:checked');
  var gu=gE('rsvp-guests').value;
  var ms=gE('rsvp-message').value.trim();
  if(!n||!at)return alert('Nama dan kehadiran wajib diisi');
  var data=loadData();
  var rsvp={id:data.nextIds.rsvp++,name:n,attendance:at.value,guests:parseInt(gu)||1,message:ms,createdAt:new Date().toISOString()};
  data.rsvps.push(rsvp);
  if(ms){
    var wish={id:data.nextIds.wish++,name:n,message:ms,createdAt:new Date().toISOString()};
    data.wishes.push(wish);
  }
  saveData(data);
  gE('rsvp-form').classList.add('hidden');
  gE('rsvp-success').classList.remove('hidden');
  w=loadData();
  renderWishes(w.wishes);
}

function initMusic(){
  if(!w||!w.music||!w.music.dataUrl)return;
  au=new Audio(w.music.dataUrl);au.loop=true;au.volume=0.5;
}
function toggleMusic(){if(!au)return;if(mp){au.pause();mp=false}else{au.play().catch(function(){});mp=true}updMusic()}
function updMusic(){gE('music-toggle').classList.toggle('playing',mp);gE('music-toggle').innerHTML=mp?'<i class="fas fa-volume-up"></i>':'<i class="fas fa-volume-mute"></i>';}

function initReveal(){
  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el){
    var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target)}})},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
    ob.observe(el);
  });
}
document.addEventListener('DOMContentLoaded',init);
})();
