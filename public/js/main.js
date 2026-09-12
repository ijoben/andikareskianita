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
  load();
}
function openInv(){
  var o=gE('open-overlay');
  o.classList.add('fade-out');
  setTimeout(function(){
    o.classList.add('hidden');
    gE('main-content').classList.remove('hidden');
    initReveal();
    startCountdown();
    if(au){au.play().catch(function(){});mp=true;updMusic()}
  },800);
}
async function load(){
  try{
    var r1=await fetch('/api/wedding');w=await r1.json();
    var r2=await fetch('/api/gallery');g=await r2.json();
    var r3=await fetch('/api/stories');var st=await r3.json();
    var r4=await fetch('/api/wishes');var wi=await r4.json();
    updCouple();renderEvents();renderGallery();renderStories(st);renderWishes(wi);initMusic();
  }catch(e){console.error(e)}
}
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
  gE('groom-photo').src=c.groom.photo;
  gE('groom-name').textContent=c.groom.fullName;
  gE('groom-parents').innerHTML='Putra dari<br>'+c.groom.father+'<br>&amp;<br>'+c.groom.mother;
  gE('bride-photo').src=c.bride.photo;
  gE('bride-name').textContent=c.bride.fullName;
  gE('bride-parents').innerHTML='Putri dari<br>'+c.bride.father+'<br>&amp;<br>'+c.bride.mother;
  gE('couple-quote-text').textContent='\u201c'+c.quote+'\u201d';
  gE('couple-quote-source').textContent='\u2014 '+c.quoteSource;
}
function startCountdown(){
  if(!w||!w.events[0])return;
  var t=new Date(w.events[0].date+'T'+w.events[0].time);
  function u(){
    var n=new Date(),d=t-n;
    if(d<=0)return;
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
  if(g.length===0){gr.innerHTML='<p style="text-align:center;color:#999;grid-column:1/-1">Belum ada foto</p>';return}
  var h='';g.forEach(function(it,i){
    h+='<div class="gallery-item" onclick="window._lb('+i+')"><img src="'+it.photo+'" alt="'+it.caption+'">';
    h+='<div class="gallery-caption">'+it.caption+'</div></div>';
  });gr.innerHTML=h;
}
window._lb=function(i){showLB(i)};
function showLB(i){
  ci=i;gE('lightbox-img').src=g[i].photo;gE('lightbox-caption').textContent=g[i].caption;
  gE('lightbox').classList.remove('hidden');document.body.style.overflow='hidden';
}
function closeLB(){gE('lightbox').classList.add('hidden');document.body.style.overflow=''}
function renderStories(st){
  var tl=gE('story-timeline');
  if(!st||st.length===0){tl.innerHTML='<p style="text-align:center;color:#999">Belum ada cerita</p>';return}
  var h='';st.forEach(function(s){
    var d=new Date(s.date);
    var ds=d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
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
    var d=new Date(w.createdAt);
    var ds=d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
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
  var r=await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:n,attendance:at.value,guests:gu,message:ms})});
  if(r.ok){
    gE('rsvp-form').classList.add('hidden');
    gE('rsvp-success').classList.remove('hidden');
    if(ms){var wr=await fetch('/api/wishes');var wi=await wr.json();renderWishes(wi)}
  }else{var er=await r.json();alert(er.error||'Gagal')}
}
function initMusic(){
  if(!w||!w.music.filename)return;
  au=new Audio('/uploads/'+w.music.filename);au.loop=true;au.volume=0.5;
}
function toggleMusic(){
  if(!au)return;
  if(mp){au.pause();mp=false}else{au.play().catch(function(){});mp=true}
  updMusic();
}
function updMusic(){
  gE('music-toggle').classList.toggle('playing',mp);
  gE('music-toggle').innerHTML=mp?'<i class="fas fa-volume-up"></i>':'<i class="fas fa-volume-mute"></i>';
}
function initReveal(){
  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el){
    var ob=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target)}});
    },{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
    ob.observe(el);
  });
}
document.addEventListener('DOMContentLoaded',init);
})();
