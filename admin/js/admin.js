var ad=null;
function gE(id){return document.getElementById(id)}
function toast(m,e){var t=gE('toast');t.textContent=m;t.className=e?'toast error':'toast';setTimeout(function(){t.className='toast hidden'},3000)}

var THEME_PRESETS={
  pink:{primaryColor:'#d4648a',primaryColorLight:'#f0a5c0',primaryColorDark:'#b84670',darkBg:'#2d1520',bodyBg:'#fff5f7',bodyText:'#333333'},
  gold:{primaryColor:'#d4af37',primaryColorLight:'#f0d78c',primaryColorDark:'#b8960c',darkBg:'#1a1a2e',bodyBg:'#faf7f2',bodyText:'#333333'},
  royal:{primaryColor:'#4a6fa5',primaryColorLight:'#8aabcf',primaryColorDark:'#2d4a7a',darkBg:'#122240',bodyBg:'#f5f7fa',bodyText:'#333333'},
  sage:{primaryColor:'#7d9b76',primaryColorLight:'#b3ccad',primaryColorDark:'#5a7d52',darkBg:'#1a2a18',bodyBg:'#f7f9f6',bodyText:'#333333'},
  lavender:{primaryColor:'#9b7fb8',primaryColorLight:'#c5b0d8',primaryColorDark:'#7a5c99',darkBg:'#1e1530',bodyBg:'#f8f5fc',bodyText:'#333333'},
  sunset:{primaryColor:'#e07c4f',primaryColorLight:'#f0b896',primaryColorDark:'#c45a2c',darkBg:'#2a1810',bodyBg:'#fdf7f3',bodyText:'#333333'}
};

gE('login-form').onsubmit=async function(e){
  e.preventDefault();
  var u=gE('login-username').value,p=gE('login-password').value;
  var r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  if(r.ok){gE('login-page').classList.add('hidden');gE('admin-app').classList.remove('hidden');loadDash()}
  else{var er=await r.json();gE('login-error').textContent=er.error||'Gagal';gE('login-error').classList.remove('hidden')}
};
gE('logout-btn').onclick=async function(e){
  e.preventDefault();await fetch('/api/admin/logout',{method:'POST'});
  gE('admin-app').classList.add('hidden');gE('login-page').classList.remove('hidden');
};
(async function(){
  var r=await fetch('/api/admin/check');var d=await r.json();
  if(d.isAdmin){gE('login-page').classList.add('hidden');gE('admin-app').classList.remove('hidden');loadDash()}
})();

document.querySelectorAll('.nav-item[data-page]').forEach(function(el){
  el.onclick=function(e){
    e.preventDefault();var pg=el.dataset.page;
    document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
    gE('page-'+pg).classList.add('active');
    if(pg==='dashboard')loadDash();if(pg==='couple')loadCouple();if(pg==='events')loadEvents();
    if(pg==='gallery')loadGallery();if(pg==='stories')loadStories();if(pg==='music')loadMusicInfo();
    if(pg==='theme')loadTheme();if(pg==='rsvps')loadRSVPs();if(pg==='wishes')loadWishesAdmin();
    gE('sidebar').classList.remove('open');
  };
});
gE('hamburger').onclick=function(){gE('sidebar').classList.toggle('open')};

async function loadDash(){
  var r=await fetch('/api/admin/stats');var s=await r.json();
  gE('stat-hadir').textContent=s.hadir;gE('stat-tidak').textContent=s.tidakHadir;
  gE('stat-ragu').textContent=s.ragu;gE('stat-wishes').textContent=s.totalWishes;
}

async function loadCouple(){
  var r=await fetch('/api/admin/data');ad=await r.json();var c=ad.couple;
  gE('groom-name').value=c.groom.name||'';gE('groom-full').value=c.groom.fullName||'';
  gE('groom-father').value=c.groom.father||'';gE('groom-mother').value=c.groom.mother||'';
  gE('groom-photo-current').textContent='Saat ini: '+(c.groom.photo||'Tidak ada');
  gE('bride-name').value=c.bride.name||'';gE('bride-full').value=c.bride.fullName||'';
  gE('bride-father').value=c.bride.father||'';gE('bride-mother').value=c.bride.mother||'';
  gE('bride-photo-current').textContent='Saat ini: '+(c.bride.photo||'Tidak ada');
  gE('couple-quote').value=c.quote||'';gE('couple-quote-source').value=c.quoteSource||'';
}
async function saveCouple(){
  try{
    var gf=gE('groom-photo-file').files[0],gp=undefined;
    if(gf){var fd=new FormData();fd.append('photo',gf);var r=await fetch('/api/admin/upload',{method:'POST',body:fd});var d=await r.json();if(d.url)gp=d.url}
    var bf=gE('bride-photo-file').files[0],bp=undefined;
    if(bf){var fd2=new FormData();fd2.append('photo',bf);var r2=await fetch('/api/admin/upload',{method:'POST',body:fd2});var d2=await r2.json();if(d2.url)bp=d2.url}
    var body={groom:{name:gE('groom-name').value,fullName:gE('groom-full').value,father:gE('groom-father').value,mother:gE('groom-mother').value},
      bride:{name:gE('bride-name').value,fullName:gE('bride-full').value,father:gE('bride-father').value,mother:gE('bride-mother').value},
      quote:gE('couple-quote').value,quoteSource:gE('couple-quote-source').value};
    if(gp)body.groom.photo=gp;if(bp)body.bride.photo=bp;
    var res=await fetch('/api/admin/couple',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(res.ok){toast('Data mempelai disimpan!');loadCouple()}else toast('Gagal',true);
  }catch(e){toast('Gagal menyimpan',true)}
}

async function loadEvents(){
  if(!ad){var r=await fetch('/api/admin/data');ad=await r.json()}
  var h='';ad.events.forEach(function(ev,i){
    h+='<div class="form-card"><h3><i class="fas '+(ev.id==='akad'?'fa-ring':'fa-champagne-glasses')+'"></i> '+ev.title+'</h3>';
    h+='<div class="form-grid">';
    h+='<div class="form-group"><label>Tanggal</label><input type="date" id="ev-date-'+i+'" value="'+ev.date+'"></div>';
    h+='<div class="form-group"><label>Jam Mulai</label><input type="time" id="ev-time-'+i+'" value="'+ev.time+'"></div>';
    h+='<div class="form-group"><label>Jam Selesai</label><input type="time" id="ev-end-'+i+'" value="'+ev.endTime+'"></div>';
    h+='<div class="form-group"><label>Venue</label><input type="text" id="ev-venue-'+i+'" value="'+ev.venue+'"></div>';
    h+='</div>';
    h+='<div class="form-group"><label>Alamat</label><input type="text" id="ev-address-'+i+'" value="'+ev.address+'"></div>';
    h+='<div class="form-group"><label>Google Maps URL</label><input type="text" id="ev-map-'+i+'" value="'+ev.mapUrl+'"></div></div>';
  });gE('events-forms').innerHTML=h;
}
async function saveEvents(){
  var evs=ad.events.map(function(ev,i){
    return Object.assign({},ev,{date:gE('ev-date-'+i).value,time:gE('ev-time-'+i).value,endTime:gE('ev-end-'+i).value,venue:gE('ev-venue-'+i).value,address:gE('ev-address-'+i).value,mapUrl:gE('ev-map-'+i).value});
  });
  var r=await fetch('/api/admin/events',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:evs})});
  if(r.ok)toast('Acara disimpan!');else toast('Gagal',true);
}

async function loadGallery(){
  var r=await fetch('/api/gallery');var items=await r.json();
  gE('gallery-list').innerHTML=items.map(function(it){
    return '<div class="gallery-admin-item"><img src="'+it.photo+'" alt="'+it.caption+'" onerror="this.style.display=\'none\'"><div class="info"><div class="caption">'+(it.caption||'Tanpa caption')+'</div><button class="btn-delete" onclick="delGal('+it.id+')"><i class="fas fa-trash"></i> Hapus</button></div></div>';
  }).join('');
}
async function uploadGallery(){
  var f=gE('gallery-file').files[0];if(!f)return toast('Pilih file',true);
  var fd=new FormData();fd.append('photo',f);fd.append('caption',gE('gallery-caption').value);
  var r=await fetch('/api/admin/gallery',{method:'POST',body:fd});
  if(r.ok){toast('Foto diupload!');gE('gallery-file').value='';gE('gallery-caption').value='';loadGallery()}else toast('Gagal',true);
}
window.delGal=async function(id){if(!confirm('Hapus?'))return;var r=await fetch('/api/admin/gallery/'+id,{method:'DELETE'});if(r.ok){toast('Dihapus');loadGallery()}};

async function loadStories(){
  var r=await fetch('/api/stories');var items=await r.json();
  gE('stories-list').innerHTML=items.map(function(s){
    return '<div class="story-admin-item">'+(s.photo?'<img src="'+s.photo+'" alt="'+s.title+'">':'<div style="width:80px;height:80px;background:#f0d78c;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px">&#x1F4D6;</div>')+'<div class="story-info"><h4>'+s.title+'</h4><p>'+s.date+'</p><p class="desc">'+s.description+'</p></div><button class="btn-delete" onclick="delStory('+s.id+')"><i class="fas fa-trash"></i> Hapus</button></div>';
  }).join('');
}
async function addStory(){
  var t=gE('story-title').value.trim(),d=gE('story-date').value,ds=gE('story-desc').value.trim();
  if(!t||!d||!ds)return toast('Isi semua field',true);
  var fd=new FormData();fd.append('title',t);fd.append('date',d);fd.append('description',ds);
  var f=gE('story-file').files[0];if(f)fd.append('photo',f);
  var r=await fetch('/api/admin/stories',{method:'POST',body:fd});
  if(r.ok){toast('Cerita ditambahkan!');gE('story-title').value='';gE('story-date').value='';gE('story-desc').value='';gE('story-file').value='';loadStories()}else toast('Gagal',true);
}
window.delStory=async function(id){if(!confirm('Hapus?'))return;var r=await fetch('/api/admin/stories/'+id,{method:'DELETE'});if(r.ok){toast('Dihapus');loadStories()}};

async function loadMusicInfo(){
  var r=await fetch('/api/admin/data');var d=await r.json();
  gE('music-current').textContent=d.music.filename?'Musik saat ini: '+d.music.originalName:'Belum ada musik latar';
}
async function uploadMusic(){
  var f=gE('music-file').files[0];if(!f)return toast('Pilih file musik',true);
  var fd=new FormData();fd.append('music',f);
  var r=await fetch('/api/admin/music',{method:'POST',body:fd});
  if(r.ok){toast('Musik diupload!');gE('music-file').value='';loadMusicInfo()}else toast('Gagal',true);
}

// === THEME ===
async function loadTheme(){
  if(!ad){var r=await fetch('/api/admin/data');ad=await r.json()}
  var t=ad.theme||{};
  document.querySelectorAll('.theme-preset').forEach(function(el){
    el.classList.toggle('active',el.dataset.preset===(t.preset||'pink'));
  });
  gE('theme-primary').value=t.primaryColor||'#d4648a';
  gE('theme-primary-light').value=t.primaryColorLight||'#f0a5c0';
  gE('theme-primary-dark').value=t.primaryColorDark||'#b84670';
  gE('theme-dark-bg').value=t.darkBg||'#2d1520';
  gE('theme-body-bg').value=t.bodyBg||'#fff5f7';
  gE('theme-body-text').value=t.bodyText||'#333333';
  // Main backgrounds
  setBgPreview('hero-bg-preview',t.heroBg);
  setBgPreview('open-bg-preview',t.openBg);
  // Section backgrounds
  setBgPreview('couple-bg-preview',t.coupleBg);
  setBgPreview('story-bg-preview',t.storyBg);
  setBgPreview('events-bg-preview',t.eventsBg);
  setBgPreview('gallery-bg-preview',t.galleryBg);
  setBgPreview('rsvp-bg-preview',t.rsvpBg);
}
function setBgPreview(id,url){
  var el=gE(id);if(!el)return;
  if(url){el.style.backgroundImage='url("'+url+'")';el.textContent='';}
  else{el.style.backgroundImage='none';el.textContent='Default';}
}
window.applyPreset=function(name){
  var p=THEME_PRESETS[name];if(!p)return;
  gE('theme-primary').value=p.primaryColor;
  gE('theme-primary-light').value=p.primaryColorLight;
  gE('theme-primary-dark').value=p.primaryColorDark;
  gE('theme-dark-bg').value=p.darkBg;
  gE('theme-body-bg').value=p.bodyBg;
  gE('theme-body-text').value=p.bodyText;
  document.querySelectorAll('.theme-preset').forEach(function(el){el.classList.toggle('active',el.dataset.preset===name)});
  saveTheme(Object.assign({},p,{preset:name}));
};
window.saveThemeColors=function(){
  saveTheme({
    preset:'',primaryColor:gE('theme-primary').value,primaryColorLight:gE('theme-primary-light').value,
    primaryColorDark:gE('theme-primary-dark').value,darkBg:gE('theme-dark-bg').value,
    bodyBg:gE('theme-body-bg').value,bodyText:gE('theme-body-text').value
  });
};
async function saveTheme(data){
  var r=await fetch('/api/admin/theme',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(r.ok){toast('Tema disimpan!');if(ad)ad.theme=Object.assign(ad.theme||{},data)}else toast('Gagal menyimpan tema',true);
}
window.uploadThemeBg=function(field,inputId,previewId){
  var f=gE(inputId).files[0];if(!f)return toast('Pilih gambar',true);
  var fd=new FormData();fd.append('image',f);fd.append('field',field);
  fetch('/api/admin/theme/upload',{method:'POST',body:fd}).then(function(r){return r.json()}).then(function(d){
    if(d.url){toast('Background diupload!');gE(inputId).value='';setBgPreview(previewId,d.url);if(ad)ad.theme[field]=d.url}
    else toast('Gagal upload',true);
  }).catch(function(){toast('Gagal upload',true)});
};
window.removeThemeBg=function(field,previewId){
  saveTheme(Object.assign(ad?ad.theme:{},{[field]:''}));
  setBgPreview(previewId,'');
};

async function loadRSVPs(){
  var r=await fetch('/api/admin/rsvps');var items=await r.json();
  var lb={hadir:'Hadir',tidak_hadir:'Tidak Hadir',ragu:'Ragu'};
  gE('rsvp-tbody').innerHTML=items.length===0?'<tr><td colspan="6" style="text-align:center;color:#999">Belum ada RSVP</td></tr>':
  items.map(function(rv,i){
    var d=new Date(rv.createdAt);
    return '<tr><td>'+(i+1)+'</td><td><strong>'+rv.name+'</strong></td><td><span class="badge '+rv.attendance+'">'+(lb[rv.attendance]||rv.attendance)+'</span></td><td>'+rv.guests+'</td><td>'+(rv.message||'-')+'</td><td>'+d.toLocaleDateString('id-ID')+'</td></tr>';
  }).join('');
}

async function loadWishesAdmin(){
  var r=await fetch('/api/wishes');var items=await r.json();
  gE('wishes-admin-list').innerHTML=items.length===0?'<p style="text-align:center;color:#999">Belum ada ucapan</p>':
  items.map(function(w){
    return '<div class="wish-admin-item"><div class="wish-info"><div class="name">'+w.name+'</div><div class="msg">\u201c'+w.message+'\u201d</div></div><button class="btn-delete" onclick="delWish('+w.id+')"><i class="fas fa-trash"></i> Hapus</button></div>';
  }).join('');
}
window.delWish=async function(id){if(!confirm('Hapus?'))return;var r=await fetch('/api/admin/wishes/'+id,{method:'DELETE'});if(r.ok){toast('Dihapus');loadWishesAdmin()}};

async function changePassword(){
  var op=gE('old-password').value,np=gE('new-password').value;
  if(!op||!np)return toast('Isi password',true);
  var r=await fetch('/api/admin/password',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({oldPassword:op,newPassword:np})});
  if(r.ok){toast('Password diganti!');gE('old-password').value='';gE('new-password').value=''}else{var er=await r.json();toast(er.error||'Gagal',true)}
}
