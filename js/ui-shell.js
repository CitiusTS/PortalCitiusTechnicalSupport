
/* ===== NEW UI SHELL ===== */
const VIEW_META={
  dashboard:['','','',''],
  reader:['','Aplikasi Pembaca Error Code Mesin','Cari deskripsi error, penyebab umum, dan penanganan langkah demi langkah untuk mesin ATM.'],
  swbank:['','Software','Repository firmware resmi, driver, serta software konfigurasi mesin bank.'],
  tools:['','Tools','Kumpulan tools dan utilitas pendukung pekerjaan teknisi lapangan.'],
  modul:['','Modul Pembelajaran & SOP','Knowledge base teknis standar operational procedure PT. Citius Solusi Indonesia.'],
  chat:['','Technical Support Assistant','Konsultasi teknis: ATM, kelistrikan, elektronik, komputer, Windows, dan panduan instalasi.']
};
function toggleSidebarDesktop(){
  if(window.matchMedia('(max-width:900px)').matches){closeSidebar();return;}
  var c=document.body.classList.toggle('sb-collapsed');
  try{localStorage.setItem('sbCollapsed',c?'1':'0');}catch(e){}
}
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('sbBackdrop').classList.add('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function showView(v){
  document.body.classList.toggle('view-dashboard',v==='dashboard');
  document.body.classList.toggle('view-portal',v==='swbank'||v==='modul'||v==='tools');
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  document.body.classList.toggle('view-modul',v==='modul');
  document.body.classList.toggle('view-chat',v==='chat');
  document.body.classList.toggle('view-reader',v==='reader');
  document.body.classList.toggle('view-swbank',v==='swbank');
  document.body.classList.toggle('view-tools',v==='tools');
  const m=VIEW_META[v];
  document.getElementById('vhBadge').textContent=m[0];document.getElementById('vhBadge').style.display=m[0]?'':'none';
  document.getElementById('vhTitle').textContent=m[1];
  document.getElementById('vhSub').textContent=m[2];
  if(v==='reader')showBrand('hyosung');
  if(v==='swbank'){showPortalTs();showPortalCategory('software');}
  if(v==='modul'){showPortalTs();showPortalCategory('modul-atm');}
  if(v==='tools'){showPortalTs();showPortalCategory('tools');}
  if(v==='chat')chatInit();
  if(typeof vmApply==='function'){vmView=v;vmApply(v);}
  if(typeof liveSync==='function')liveSync();
  closeSidebar();window.scrollTo(0,0);
}
(function(){
  const src=document.querySelector('header .logo-icon img');
  if(src){document.getElementById('hdrLogoImg').src=src.src;}
  if(src)document.getElementById('sbLogoImg').src=src.src; // logo sama persis dengan versi sebelumnya
  const hb=document.getElementById('headerAdminBtn'),sa=document.getElementById('sbAdminBtn');
  const sync=()=>{sa.style.display=(hb.style.display&&hb.style.display!=='none')?'flex':'none';};
  new MutationObserver(sync).observe(hb,{attributes:true,attributeFilter:['style']});sync();
  try{if(localStorage.getItem('sbCollapsed')==='1')document.body.classList.add('sb-collapsed');}catch(e){}
  showView('dashboard');
})();
