// ===== ADMIN PANEL - localStorage based =====
var d;
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

function reload(){d=loadData();}

// === NAVIGATION ===
document.querySelectorAll('.nav-item[data-page]').forEach(function(el){
  el.onclick=function(e){
    e.preventDefault();var pg=el.dataset.page;
    document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
    gE('page-'+pg).classList.add('active');
    if(pg==='dashboard')loadDash();if(pg==='couple')loadCouple();if(pg==='events')loadEvents();
    if(pg==='gallery')loadGallery();if(pg==='stories')loadStories();if(pg==='music')loadMusic();
    if(pg==='theme')loadTheme();if(pg==='rsvps')loadRSVPs();if(pg==='wishes')loadWishes();
    gE('sidebar').classList.remove('open');
  };
});
gE('hamburger').onclick=function(){gE('sidebar').classList.toggle('open')};

// === DASHBOARD ===
function loadDash(){
  reload();
  var hadir=d.rsvps.filter(function(r){return r.attendance==='hadir'}).length;
  var tidak=d.rsvps.filter(function(r){return r.attendance==='tidak_hadir'}).length;
  var ragu=d.rsvps.filter(function(r){return r.attendance==='ragu'}).length;
  gE('stat-hadir').textContent=hadir;
  gE('stat-tidak').textContent=tidak;
  gE('stat-ragu').textContent=ragu;
  gE('stat-wishes').textContent=d.wishes.length;
}

// === COUPLE ===
function loadCouple(){
  reload();var c=d.couple;
  gE('groom-name').value=c.groom.name||'';
  gE('groom-full').value=c.groom.fullName||'';
  gE('groom-father').value=c.groom.father||'';
  gE('groom-mother').value=c.groom.mother||'';
  gE('groom-photo-current').textContent='Saat ini: '+(c.groom.photo?'Ada foto':'Tidak ada');
  gE('bride-name').value=c.bride.name||'';
  gE('bride-full').value=c.bride.fullName||'';
  gE('bride-father').value=c.bride.father||'';
  gE('bride-mother').value=c.bride.mother||'';
  gE('bride-photo-current').textContent='Saat ini: '+(c.bride.photo?'Ada foto':'Tidak ada');
  gE('couple-quote').value=c.quote||'';
  gE('couple-quote-source').value=c.quoteSource||'';
}
gE('btn-save-couple').onclick=function(){
  reload();
  d.couple.groom.name=gE('groom-name').value;
  d.couple.groom.fullName=gE('groom-full').value;
  d.couple.groom.father=gE('groom-father').value;
  d.couple.groom.mother=gE('groom-mother').value;
  d.couple.bride.name=gE('bride-name').value;
  d.couple.bride.fullName=gE('bride-full').value;
  d.couple.bride.father=gE('bride-father').value;
  d.couple.bride.mother=gE('bride-mother').value;
  d.couple.quote=gE('couple-quote').value;
  d.couple.quoteSource=gE('couple-quote-source').value;
  // Photo upload
  var gf=gE('groom-photo-file').files[0];
  var bf=gE('bride-photo-file').files[0];
  var done=0;var total=(gf?1:0)+(bf?1:0);
  if(total===0){saveData(d);toast('Disimpan!');loadCouple();return;}
  function check(){done++;if(done>=total){saveData(d);toast('Disimpan!');loadCouple();}}
  if(gf){var fr=new FileReader();fr.onload=function(e){d.couple.groom.photo=e.target.result;check()};fr.readAsDataURL(gf);}
  if(bf){var fr2=new FileReader();fr2.onload=function(e){d.couple.bride.photo=e.target.result;check()};fr2.readAsDataURL(bf);}
};

// === EVENTS ===
function loadEvents(){
  reload();var h='';
  d.events.forEach(function(ev,i){
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
gE('btn-save-events').onclick=function(){
  reload();
  d.events.forEach(function(ev,i){
    ev.date=gE('ev-date-'+i).value;ev.time=gE('ev-time-'+i).value;
    ev.endTime=gE('ev-end-'+i).value;ev.venue=gE('ev-venue-'+i).value;
    ev.address=gE('ev-address-'+i).value;ev.mapUrl=gE('ev-map-'+i).value;
  });
  saveData(d);toast('Acara disimpan!');
};

// === GALLERY ===
function loadGallery(){
  reload();var items=d.gallery||[];
  gE('gallery-list').innerHTML=items.length===0?'<p style="text-align:center;color:#999;padding:20px">Belum ada foto</p>':
  items.map(function(it,i){
    return '<div class="gallery-admin-item"><img src="'+it.photo+'" alt="'+it.caption+'"><div class="info"><div class="caption">'+(it.caption||'Tanpa caption')+'</div><button class="btn-delete" data-del-gallery="'+i+'"><i class="fas fa-trash"></i> Hapus</button></div></div>';
  }).join('');
  document.querySelectorAll('[data-del-gallery]').forEach(function(btn){
    btn.onclick=function(){var i=parseInt(this.dataset.delGallery);reload();d.gallery.splice(i,1);saveData(d);toast('Dihapus');loadGallery()};
  });
}
gE('btn-upload-gallery').onclick=function(){
  var f=gE('gallery-file').files[0];if(!f)return toast('Pilih file',true);
  var fr=new FileReader();
  fr.onload=function(e){
    reload();
    d.gallery=d.gallery||[];
    d.gallery.push({id:(d.nextIds.gallery++),photo:e.target.result,caption:gE('gallery-caption').value});
    saveData(d);toast('Foto diupload!');gE('gallery-file').value='';gE('gallery-caption').value='';loadGallery();
  };
  fr.readAsDataURL(f);
};

// === STORIES ===
function loadStories(){
  reload();var items=d.stories||[];
  gE('stories-list').innerHTML=items.length===0?'<p style="text-align:center;color:#999;padding:20px">Belum ada cerita</p>':
  items.map(function(s,i){
    return '<div class="story-admin-item">'+(s.photo?'<img src="'+s.photo+'" alt="'+s.title+'">':'<div style="width:80px;height:80px;background:#f0a5c0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px">&#x1F4D6;</div>')+'<div class="story-info"><h4>'+s.title+'</h4><p>'+s.date+'</p><p class="desc">'+s.description+'</p></div><button class="btn-delete" data-del-story="'+i+'"><i class="fas fa-trash"></i> Hapus</button></div>';
  }).join('');
  document.querySelectorAll('[data-del-story]').forEach(function(btn){
    btn.onclick=function(){var i=parseInt(this.dataset.delStory);reload();d.stories.splice(i,1);saveData(d);toast('Dihapus');loadStories()};
  });
}
gE('btn-add-story').onclick=function(){
  var t=gE('story-title').value.trim(),dt=gE('story-date').value,ds=gE('story-desc').value.trim();
  if(!t||!dt||!ds)return toast('Isi semua field',true);
  var add=function(photo){
    reload();d.stories=d.stories||[];
    d.stories.push({id:(d.nextIds.story++),title:t,date:dt,description:ds,photo:photo||''});
    saveData(d);toast('Cerita ditambahkan!');
    gE('story-title').value='';gE('story-date').value='';gE('story-desc').value='';gE('story-file').value='';
    loadStories();
  };
  var f=gE('story-file').files[0];
  if(f){var fr=new FileReader();fr.onload=function(e){add(e.target.result)};fr.readAsDataURL(f);}
  else{add();}
};

// === MUSIC ===
function loadMusic(){
  reload();
  gE('music-current').textContent=d.music&&d.music.name?'Musik: '+d.music.name:'Belum ada musik';
}
gE('btn-upload-music').onclick=function(){
  var f=gE('music-file').files[0];if(!f)return toast('Pilih file',true);
  var fr=new FileReader();
  fr.onload=function(e){
    reload();d.music={dataUrl:e.target.result,name:f.name};
    saveData(d);toast('Musik diupload!');gE('music-file').value='';loadMusic();
  };
  fr.readAsDataURL(f);
};
gE('btn-remove-music').onclick=function(){
  reload();d.music={dataUrl:'',name:''};saveData(d);toast('Musik dihapus');loadMusic();
};

// === THEME ===
function loadTheme(){
  reload();var t=d.theme||{};
  document.querySelectorAll('.theme-preset').forEach(function(el){
    el.classList.toggle('active',el.dataset.preset===(t.preset||'pink'));
  });
  gE('theme-primary').value=t.primaryColor||'#d4648a';
  gE('theme-primary-light').value=t.primaryColorLight||'#f0a5c0';
  gE('theme-primary-dark').value=t.primaryColorDark||'#b84670';
  gE('theme-dark-bg').value=t.darkBg||'#2d1520';
  gE('theme-body-bg').value=t.bodyBg||'#fff5f7';
  gE('theme-body-text').value=t.bodyText||'#333333';
  setPreview('hero-bg-preview',t.heroBg);setPreview('open-bg-preview',t.openBg);
  setPreview('couple-bg-preview',t.coupleBg);setPreview('story-bg-preview',t.storyBg);
  setPreview('events-bg-preview',t.eventsBg);setPreview('gallery-bg-preview',t.galleryBg);
  setPreview('rsvp-bg-preview',t.rsvpBg);
}
function setPreview(id,url){var el=gE(id);if(!el)return;if(url){el.style.backgroundImage='url("'+url+')";el.textContent='';}else{el.style.backgroundImage='none';el.textContent='Default';}}

// Theme presets
document.querySelectorAll('.theme-preset').forEach(function(btn){
  btn.onclick=function(){
    var p=THEME_PRESETS[btn.dataset.preset];if(!p)return;
    gE('theme-primary').value=p.primaryColor;gE('theme-primary-light').value=p.primaryColorLight;
    gE('theme-primary-dark').value=p.primaryColorDark;gE('theme-dark-bg').value=p.darkBg;
    gE('theme-body-bg').value=p.bodyBg;gE('theme-body-text').value=p.bodyText;
    document.querySelectorAll('.theme-preset').forEach(function(el){el.classList.toggle('active',el===btn)});
    reload();d.theme=Object.assign(d.theme||{},p,{preset:btn.dataset.preset});saveData(d);toast('Tema disimpan!');
  };
});

// Color save
gE('btn-save-colors').onclick=function(){
  reload();d.theme=Object.assign(d.theme||{},{
    primaryColor:gE('theme-primary').value,primaryColorLight:gE('theme-primary-light').value,
    primaryColorDark:gE('theme-primary-dark').value,darkBg:gE('theme-dark-bg').value,
    bodyBg:gE('theme-body-bg').value,bodyText:gE('theme-body-text').value
  });saveData(d);toast('Warna disimpan!');
};

// Background upload helper
function uploadBg(field,inputId,previewId){
  var f=gE(inputId).files[0];if(!f)return toast('Pilih gambar',true);
  var fr=new FileReader();
  fr.onload=function(e){
    reload();d.theme=d.theme||{};d.theme[field]=e.target.result;
    saveData(d);toast('Background diupload!');gE(inputId).value='';setPreview(previewId,d.theme[field]);
  };
  fr.readAsDataURL(f);
}
function removeBg(field,previewId){
  reload();d.theme=d.theme||{};d.theme[field]='';saveData(d);setPreview(previewId,'');toast('Dihapus');
}

// Bind bg buttons
gE('btn-hero-bg').onclick=function(){uploadBg('heroBg','theme-hero-bg','hero-bg-preview')};
gE('btn-hero-bg-rm').onclick=function(){removeBg('heroBg','hero-bg-preview')};
gE('btn-open-bg').onclick=function(){uploadBg('openBg','theme-open-bg','open-bg-preview')};
gE('btn-open-bg-rm').onclick=function(){removeBg('openBg','open-bg-preview')};
gE('btn-couple-bg').onclick=function(){uploadBg('coupleBg','theme-couple-bg','couple-bg-preview')};
gE('btn-couple-bg-rm').onclick=function(){removeBg('coupleBg','couple-bg-preview')};
gE('btn-story-bg').onclick=function(){uploadBg('storyBg','theme-story-bg','story-bg-preview')};
gE('btn-story-bg-rm').onclick=function(){removeBg('storyBg','story-bg-preview')};
gE('btn-events-bg').onclick=function(){uploadBg('eventsBg','theme-events-bg','events-bg-preview')};
gE('btn-events-bg-rm').onclick=function(){removeBg('eventsBg','events-bg-preview')};
gE('btn-gallery-bg').onclick=function(){uploadBg('galleryBg','theme-gallery-bg','gallery-bg-preview')};
gE('btn-gallery-bg-rm').onclick=function(){removeBg('galleryBg','gallery-bg-preview')};
gE('btn-rsvp-bg').onclick=function(){uploadBg('rsvpBg','theme-rsvp-bg','rsvp-bg-preview')};
gE('btn-rsvp-bg-rm').onclick=function(){removeBg('rsvpBg','rsvp-bg-preview')};

// === RSVP ===
function loadRSVPs(){
  reload();var items=d.rsvps||[];
  var lb={hadir:'Hadir',tidak_hadir:'Tidak Hadir',ragu:'Ragu'};
  gE('rsvp-tbody').innerHTML=items.length===0?'<tr><td colspan="6" style="text-align:center;color:#999">Belum ada RSVP</td></tr>':
  items.map(function(rv,i){
    var dt=new Date(rv.createdAt);
    return '<tr><td>'+(i+1)+'</td><td><strong>'+rv.name+'</strong></td><td><span class="badge '+rv.attendance+'">'+(lb[rv.attendance]||rv.attendance)+'</span></td><td>'+rv.guests+'</td><td>'+(rv.message||'-')+'</td><td>'+dt.toLocaleDateString('id-ID')+'</td></tr>';
  }).join('');
}

// === WISHES ===
function loadWishes(){
  reload();var items=d.wishes||[];
  gE('wishes-admin-list').innerHTML=items.length===0?'<p style="text-align:center;color:#999;padding:20px">Belum ada ucapan</p>':
  items.map(function(w,i){
    return '<div class="wish-admin-item"><div class="wish-info"><div class="name">'+w.name+'</div><div class="msg">\u201c'+w.message+'\u201d</div></div><button class="btn-delete" data-del-wish="'+i+'"><i class="fas fa-trash"></i> Hapus</button></div>';
  }).join('');
  document.querySelectorAll('[data-del-wish]').forEach(function(btn){
    btn.onclick=function(){var i=parseInt(this.dataset.delWish);reload();d.wishes.splice(i,1);saveData(d);toast('Dihapus');loadWishes()};
  });
}

// === SETTINGS ===
gE('btn-export').onclick=function(){
  reload();
  var blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='wedding-data-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();toast('Data di-export!');
};
gE('btn-import-label').onclick=function(){gE('btn-import').click()};
gE('btn-import').onchange=function(e){
  var f=e.target.files[0];if(!f)return;
  var fr=new FileReader();
  fr.onload=function(ev){
    try{
      var imported=JSON.parse(ev.target.result);
      saveData(imported);toast('Data di-import!');loadDash();loadCouple();
    }catch(err){toast('File tidak valid',true);}
  };
  fr.readAsText(f);
};
gE('btn-reset').onclick=function(){
  if(!confirm('Yakin mau reset semua data?'))return;
  resetData();toast('Data di-reset!');loadDash();loadCouple();
};

// === INIT ===
reload();loadDash();
