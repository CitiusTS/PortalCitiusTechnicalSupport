
const ADMIN_PASS = 'Citius2024!'; // fallback lama — tidak dipakai lagi, login sekarang lewat Firebase Auth (lihat checkAdminPass)
let adminMod = 'brm860';
let adminMode = 'add';
let editIdx = -1;
let currentUser = null;
let currentIsAdmin = false;
let deviceSessionUnsubscribe = null;
let authGateMessage = '';
const TECH_DEVICE_ID_KEY = 'citius_tech_device_id';

function techGetDeviceId(){
  let deviceId=localStorage.getItem(TECH_DEVICE_ID_KEY);
  if(!deviceId){
    deviceId=window.crypto?.randomUUID?window.crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(TECH_DEVICE_ID_KEY,deviceId);
  }
  return deviceId;
}

window.addEventListener('fb-ready', function(){
  syncFirestoreOverlay();
  window.__fb.onAuthChange(async function(user){
    if(deviceSessionUnsubscribe){
      deviceSessionUnsubscribe();
      deviceSessionUnsubscribe=null;
    }
    currentUser = user;
    const hb=document.getElementById('headerAdminBtn'); if(hb) hb.style.display='none'; // sembunyikan sampai status admin terverifikasi
    const gate = document.getElementById('techLoginOvl');
    if(user){
      gate.style.display = 'flex';
      currentIsAdmin = await window.__fb.isAdmin(user.uid);
      if(currentUser?.uid!==user.uid)return;
      if(currentIsAdmin) setTimeout(()=>{try{window.__fb.purgeOldUsage(30).then(n=>{if(n)console.info('Laporan lama dihapus:',n)}).catch(e=>console.warn('Pembersihan laporan gagal',e));try{window.__fb.purgeOldEscalations(14).catch(e=>console.warn('Pembersihan eskalasi gagal',e));}catch(e){}}catch(e){}},5000);
      if(!currentIsAdmin){
        try{
          const deviceId=techGetDeviceId();
          await window.__fb.claimUserDeviceSession(user.uid,deviceId);
          if(currentUser?.uid!==user.uid)return;
          deviceSessionUnsubscribe=window.__fb.watchUserDeviceSession(user.uid,session=>{
            if(session?.sessionId!==deviceId&&currentUser?.uid===user.uid){
              authGateMessage='❌ Akun ini telah digunakan di perangkat lain. Perangkat ini otomatis dikeluarkan.';
              window.__fb.signOut().catch(error=>console.warn('Gagal mengeluarkan sesi perangkat lama:',error));
            }
          },error=>{
            if(currentUser?.uid!==user.uid)return;
            console.warn('Gagal memantau sesi perangkat:',error);
            authGateMessage='❌ Sesi perangkat tidak dapat diverifikasi. Periksa koneksi atau hubungi admin.';
            window.__fb.signOut().catch(signOutError=>console.warn('Gagal menutup sesi yang tidak dapat diverifikasi:',signOutError));
          });
        }catch(error){
          console.warn('Gagal mendaftarkan sesi perangkat:',error);
          authGateMessage='❌ Login perangkat tunggal gagal diverifikasi. Hubungi admin untuk memeriksa aturan akses Firebase.';
          await window.__fb.signOut().catch(signOutError=>console.warn('Gagal menutup login tanpa sesi terverifikasi:',signOutError));
          return;
        }
        if(currentUser?.uid!==user.uid)return;
      }
      authGateMessage='';
      gate.style.display = 'none';
      window.__authReady&&window.__authReady();
      updateAdminButton();
      const logoutBtn = document.getElementById('techLogoutBtn');
      if(logoutBtn){
        logoutBtn.style.display = 'inline-flex';
        logoutBtn.title = 'Login sebagai: ' + user.email + (currentIsAdmin ? ' (Admin)' : ' (Teknisi)');
      }
    } else {
      currentIsAdmin = false;
      updateAdminButton();
      gate.style.display = 'flex';
      window.__authReady&&window.__authReady();
      const logoutBtn = document.getElementById('techLogoutBtn');
      if(logoutBtn) logoutBtn.style.display = 'none';
      document.getElementById('techEmailInput').value = '';
      document.getElementById('techPassInput').value = '';
      const errEl=document.getElementById('techLoginErr');
      if(authGateMessage){
        errEl.textContent=authGateMessage;
        errEl.style.display='block';
      }else{
        errEl.style.display = 'none';
      }
      setTimeout(function(){document.getElementById('techEmailInput').focus();},100);
    }
  });
});

async function techLogin(){
  const email = document.getElementById('techEmailInput').value.trim();
  const pass = document.getElementById('techPassInput').value;
  const errEl = document.getElementById('techLoginErr');
  const btn = document.getElementById('techLoginBtn');
  if(!window.__fb){
    errEl.textContent = '⚠️ Koneksi Firebase belum siap, coba lagi sebentar.';
    errEl.style.display = 'block';
    return;
  }
  btn.textContent = 'Memeriksa...'; btn.disabled = true;
  authGateMessage='';
  try{
    await window.__fb.signIn(email, pass);
    errEl.style.display = 'none';
    // onAuthChange akan otomatis menyembunyikan gate ini
  }catch(e){
    errEl.textContent = '❌ Email atau password salah.';
    errEl.style.display = 'block';
  }
  btn.textContent = 'Masuk'; btn.disabled = false;
}

function techLogout(){
  if(!window.__fb) return;
  if(!confirm('Keluar dari aplikasi?')) return;
  window.__fb.signOut();
}


/* ===== NCR M-STATUS & WINCOR: DATA TAMBAHAN ADMIN (overlay Firestore) ===== */
const NW_MODS={ncr_disp:{label:'NCR Dispenser (M-Status)',brand:'ncr'},ncr_card:{label:'NCR Card Reader (M-Status)',brand:'ncr'},wincor:{label:'Wincor CMD-V4 / CDM-V4',brand:'wincor'}};
const NW_OV={ncr_disp:{},ncr_card:{},wincor:{}};
let nwBaseCache=null,nwMod='ncr_disp',nwMode='add',nwEditCode=null,nwBrand='hyosung';
function nwBase(){
  if(nwBaseCache)return nwBaseCache;
  const b={ncr_disp:[],ncr_card:[],wincor:{}};
  try{const h=ckDecode(NCR_HTML_B64);b.ncr_disp=ckArr(h,'DISPENSER_DATA');b.ncr_card=ckArr(h,'CARDREADER_DATA');}catch(e){}
  try{const h=ckDecode(WINCOR_HTML_B64);const m=h.match(/const\s+DB\s*=\s*(\{[\s\S]*?\n\});/);if(m)b.wincor=(new Function('return '+m[1]))();}catch(e){}
  return nwBaseCache=b;
}
/* daftar gabungan (data bawaan + tambahan admin) */
function nwList(mod){
  const base=nwBase(),ov=NW_OV[mod],out=[];
  if(mod==='wincor'){
    const seen=new Set();
    Object.keys(base.wincor).forEach(k=>{seen.add(k);const o=ov[k];if(o&&o._deleted)return;out.push(Object.assign({code:k,_custom:!!o},o||base.wincor[k]));});
    Object.keys(ov).forEach(k=>{if(!seen.has(k)&&!ov[k]._deleted)out.push(Object.assign({code:k,_custom:true},ov[k]));});
  }else{
    const seen=new Set();
    base[mod].forEach(r=>{seen.add(r.code);const o=ov[r.code];if(o&&o._deleted)return;out.push(Object.assign({_custom:!!o},o||r));});
    Object.keys(ov).forEach(k=>{if(!seen.has(k)&&!ov[k]._deleted)out.push(Object.assign({_custom:true},ov[k]));});
  }
  return out;
}
/* terapkan overlay ke array/objek data (dipakai Clara/CK) */
function nwApplyNcr(arr,mod){
  const ov=NW_OV[mod],out=arr.filter(r=>!(ov[r.code]&&ov[r.code]._deleted));
  Object.keys(ov).forEach(k=>{const o=ov[k];if(o._deleted)return;const i=out.findIndex(r=>r.code===k);const rec={code:k,prio:o.prio,tipe:o.tipe,desc:o.desc,komponen:o.komponen||[],solusi:o.solusi||[]};if(i>=0)out[i]=rec;else out.push(rec);});
  return out;
}
function nwApplyWincor(obj){
  const ov=NW_OV.wincor,out=Object.assign({},obj);
  Object.keys(ov).forEach(k=>{const o=ov[k];if(o._deleted)delete out[k];else out[k]={title:o.title,sev:o.sev,cat:o.cat,comp:o.comp,desc:o.desc,action:o.action};});
  return out;
}
/* sisipkan overlay ke HTML iframe NCR/Wincor */
function nwInject(html,brand){
  const hasOv=m=>Object.keys(NW_OV[m]).length>0;
  if(brand==='ncr'){
    [['DISPENSER_DATA','ncr_disp'],['CARDREADER_DATA','ncr_card']].forEach(([n,m])=>{
      if(!hasOv(m))return;
      const i=html.indexOf('const '+n);if(i<0)return;const j=html.indexOf('\n];',i);if(j<0)return;
      const payload=JSON.stringify(NW_OV[m]).replace(/</g,'\\u003c');
      const code=';(function(a,o){Object.keys(o).forEach(function(k){var r=o[k],x=a.findIndex(function(y){return y.code===k});if(r._deleted){if(x>=0)a.splice(x,1);return}var n={code:k,prio:r.prio,tipe:r.tipe,desc:r.desc,komponen:r.komponen||[],solusi:r.solusi||[]};if(x>=0)a[x]=n;else a.push(n)});a.sort(function(p,q){return String(p.code).localeCompare(String(q.code),undefined,{numeric:true})})})('+n+','+payload+');';
      html=html.slice(0,j+3)+code+html.slice(j+3);
    });
  }else if(brand==='wincor'&&hasOv('wincor')){
    const i=html.indexOf('const DB');const j=i<0?-1:html.indexOf('\n};',i);
    if(j>=0){const payload=JSON.stringify(NW_OV.wincor).replace(/</g,'\\u003c');
      const code=';(function(o){Object.keys(o).forEach(function(k){var r=o[k];if(r._deleted){delete DB[k];return}DB[k]={title:r.title,sev:r.sev,cat:r.cat,comp:r.comp,desc:r.desc,action:r.action}})})('+payload+');';
      html=html.slice(0,j+3)+code+html.slice(j+3);}
  }
  return html;
}
async function nwSyncOverlay(){
  if(!window.__fb)return;
  for(const m of Object.keys(NW_OV)){
    try{
      const docs=await window.__fb.getAllDocs(m);
      NW_OV[m]={};
      docs.forEach(r=>{if(r&&r.k)NW_OV[m][r.k]=r;});
    }catch(e){console.warn('Sync NCR/Wincor gagal',m,e);}
  }
  nwRefreshViews();
}
function nwRefreshViews(){
  try{CK.ready=false;CK.docs=[];CK.byCode=new Map();}catch(e){}
  try{
    if(ncrLoaded){document.getElementById('ncrFrame').srcdoc=nwInject(ckDecode(NCR_HTML_B64),'ncr');}
    if(wincorLoaded){document.getElementById('wincorFrame').srcdoc=nwInject(ckDecode(WINCOR_HTML_B64),'wincor');}
  }catch(e){}
}
function adminBrand(b){
  nwBrand=b;
  document.querySelectorAll('#adminBrandBar .adm-brand-btn').forEach(x=>x.classList.toggle('on',x.dataset.ab===b));
  const hy=b==='hyosung';
  {const e=document.getElementById('hyoModeTabs');if(e)e.style.display=hy?'':'none';}
  if(hy){setAdminMode(adminMode,null);}
  else{document.getElementById('adminFormAdd').style.display='none';document.getElementById('adminFormEdit').style.display='none';}
  const nw=document.getElementById('adminNW');nw.style.display=hy?'none':'block';
  if(!hy){nwMod=b==='wincor'?'wincor':(nwMod==='wincor'?'ncr_disp':nwMod);nwMode='add';nwEditCode=null;nwRender();}
  admSyncSel();
  if(typeof admTabNow!=='undefined'&&admTabNow!=='errors')admApplyTabVisibility(admTabNow);
}
function admSyncSel(){
  const bs=document.getElementById('admBrandSel'),ms=document.getElementById('admModSel'),w=document.getElementById('admModWrap');
  if(!bs||!ms)return;
  bs.value=nwBrand;
  let opts=null,cur='';
  if(nwBrand==='hyosung'){opts=[['brm860','BRM 860'],['brm50','BRM 50'],['cdu10','CDU 10'],['cdu30','CDU 30'],['cdu800','CDU 800'],['extra','Modul Lainnya']];cur=adminMod;}
  else if(nwBrand==='ncr'){opts=[['ncr_disp','Dispenser'],['ncr_card','Card Reader']];cur=nwMod;}
  w.style.display=opts?'':'none';
  if(opts){ms.innerHTML=opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('');ms.value=cur;}
}
function admModChange(v){
  if(nwBrand==='hyosung'){
    const b=Array.from(document.querySelectorAll('#hyoModSel .admin-mod-btn')).find(x=>(x.getAttribute('onclick')||'').indexOf("'"+v+"'")>=0);
    if(b)setAdminMod(v,b);
  }else nwSetMod(v);
}
function nwEsc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function nwRender(){
  const w=document.getElementById('adminNW');
  const isNcr=nwBrand==='ncr';
  let h='';
  h+='<div style="display:flex;gap:0;margin-bottom:20px;border:1.5px solid #C5D0F0;border-radius:9px;overflow:hidden">'
    +'<button type="button" onclick="nwSetMode(\'add\')" style="flex:1;padding:9px;border:none;font:700 12px var(--ui-font);cursor:pointer;background:'+(nwMode==='add'?'#1565C0;color:#fff':'#F0F4FF;color:#4A5680')+'">➕ Tambah Baru</button>'
    +'<button type="button" onclick="nwSetMode(\'edit\')" style="flex:1;padding:9px;border:none;border-left:1.5px solid #C5D0F0;font:700 12px var(--ui-font);cursor:pointer;background:'+(nwMode==='edit'?'#1565C0;color:#fff':'#F0F4FF;color:#4A5680')+'">✏️ Edit / Hapus</button></div>';
  if(nwMode==='add'||nwEditCode!==null)h+=nwFormHtml();
  else h+='<div style="display:flex;gap:10px;margin-bottom:14px"><input id="nw_search" class="nw-in" placeholder="Cari kode atau deskripsi..." oninput="nwSearch()" style="flex:1"></div><div id="nw_results" style="max-height:360px;overflow-y:auto;border:1.5px solid #E8EEFF;border-radius:10px"></div>';
  w.innerHTML=h;
  if(nwMode==='edit'&&nwEditCode===null)nwSearch();
}
function nwSetMod(m){nwMod=m;nwEditCode=null;nwRender();try{admSyncSel();}catch(e){}}
function nwSetMode(m){nwMode=m;nwEditCode=null;nwRender();}
function nwFormHtml(){
  const edit=nwEditCode!==null;
  const cur=edit?nwList(nwMod).find(r=>String(r.code)===String(nwEditCode)):null;
  const v=(k,d)=>nwEsc(cur&&cur[k]!=null?cur[k]:(d||''));
  let h='';
  if(nwBrand==='ncr'){
    const tipes=['Semua','Smart','Stacking','MCRW','UIMCRW','CIM','CIM/MM','USB S1','Diagnostik','Spray','CIM/Smart','Smart/SAM'];
    const prios=['Kritis','Tinggi','Menengah','Info','Normal'];
    h+='<div class="nw-row"><div><label class="nw-lbl">Kode M-Status *</label><input id="nw_code" class="nw-in" placeholder="Contoh: 44" value="'+v('code')+'"'+(edit?' readonly style="background:#F0F4FF;color:#4A5680"':'')+'></div>'
      +'<div><label class="nw-lbl">Prioritas</label><select id="nw_prio" class="nw-in">'+prios.map(p=>'<option'+((cur?cur.prio:'Tinggi')===p?' selected':'')+'>'+p+'</option>').join('')+'</select></div></div>'
      +'<div class="nw-row"><div><label class="nw-lbl">Tipe Unit</label><input id="nw_tipe" class="nw-in" list="nw_tipes" value="'+v('tipe','Semua')+'"><datalist id="nw_tipes">'+tipes.map(t=>'<option value="'+t+'">').join('')+'</datalist></div>'
      +'<div><label class="nw-lbl">Komponen (pisahkan dengan koma)</label><input id="nw_komp" class="nw-in" placeholder="Contoh: Kaset, Sensor LVDT" value="'+nwEsc(cur&&cur.komponen?cur.komponen.join(', '):'')+'"></div></div>'
      +'<div class="nw-fld"><label class="nw-lbl">Deskripsi *</label><textarea id="nw_desc" class="nw-in" rows="3" style="resize:vertical">'+v('desc')+'</textarea></div>'
      +'<div class="nw-fld"><label class="nw-lbl">Langkah solusi (satu langkah per baris) *</label><textarea id="nw_sol" class="nw-in" rows="4" style="resize:vertical">'+nwEsc(cur&&cur.solusi?cur.solusi.join('\n'):'')+'</textarea></div>';
  }else{
    const sevs=[['err','Error'],['warn','Peringatan'],['ok','Normal / OK']],cats=[['umum','Umum & Controller'],['cassette','Cassette & Uang'],['mekanis','Mekanis & Transport']];
    h+='<div class="nw-row"><div><label class="nw-lbl">Kode / Status *</label><input id="nw_code" class="nw-in" placeholder="Contoh: f9" value="'+v('code')+'"'+(edit?' readonly style="background:#F0F4FF;color:#4A5680"':'')+'></div>'
      +'<div><label class="nw-lbl">Judul *</label><input id="nw_title" class="nw-in" value="'+v('title')+'"></div></div>'
      +'<div class="nw-row"><div><label class="nw-lbl">Tingkat</label><select id="nw_sev" class="nw-in">'+sevs.map(x=>'<option value="'+x[0]+'"'+((cur?cur.sev:'err')===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></div>'
      +'<div><label class="nw-lbl">Kategori</label><select id="nw_cat" class="nw-in">'+cats.map(x=>'<option value="'+x[0]+'"'+((cur?cur.cat:'umum')===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></div></div>'
      +'<div class="nw-fld"><label class="nw-lbl">Komponen</label><input id="nw_comp" class="nw-in" placeholder="Contoh: Cassette 2" value="'+v('comp')+'"></div>'
      +'<div class="nw-fld"><label class="nw-lbl">Deskripsi *</label><textarea id="nw_desc" class="nw-in" rows="3" style="resize:vertical">'+v('desc')+'</textarea></div>'
      +'<div class="nw-fld"><label class="nw-lbl">Tindakan / Solusi *</label><textarea id="nw_act" class="nw-in" rows="3" style="resize:vertical">'+v('action')+'</textarea></div>';
  }
  h+='<div id="nw_msg" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600"></div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" onclick="nwSave()" style="padding:11px 24px;background:#1B7F3A;color:#fff;border:none;border-radius:9px;font:700 13px var(--ui-font);cursor:pointer">'+(edit?'💾 Simpan Perubahan':'✅ Simpan Record Baru')+'</button>'
    +(edit?'<button type="button" onclick="nwDelete()" style="padding:11px 24px;background:#D32F2F;color:#fff;border:none;border-radius:9px;font:700 13px var(--ui-font);cursor:pointer">🗑️ Hapus</button>':'')
    +(edit?'<button type="button" onclick="nwSetMode(\'edit\')" style="padding:11px 24px;background:#F0F4FF;color:#4A5680;border:1.5px solid #C5D0F0;border-radius:9px;font:600 13px var(--ui-font);cursor:pointer">Batal</button>':'')+'</div>';
  return h;
}
function nwMsg(t,kind){const e=document.getElementById('nw_msg');if(!e)return;e.style.display='block';e.textContent=t;const c={ok:['#E6F7ED','#1B7F3A'],warn:['#FFF8E1','#E65100'],err:['#FFEBEE','#D32F2F']}[kind||'ok'];e.style.background=c[0];e.style.color=c[1];}
function nwSearch(){
  const q=(document.getElementById('nw_search').value||'').trim().toLowerCase();
  let list=nwList(nwMod);
  if(q)list=list.filter(r=>String(r.code).toLowerCase().includes(q)||(r.desc||'').toLowerCase().includes(q)||(r.title||'').toLowerCase().includes(q)||(r.komponen||[]).join(' ').toLowerCase().includes(q)||(r.comp||'').toLowerCase().includes(q));
  const tot=list.length;list=list.slice(0,60);
  const box=document.getElementById('nw_results');
  if(!list.length){box.innerHTML='<div style="padding:20px;text-align:center;color:#8A96B8;font-size:13px">Tidak ditemukan.</div>';return;}
  box.innerHTML=list.map(r=>'<div class="nw-item"><div style="flex:1;min-width:0"><span class="nw-code">'+nwEsc(r.code)+'</span>'+(r._custom?'<span class="nw-tag new">Diubah/Tambahan</span>':'')+(r.prio?'<span class="nw-tag">'+nwEsc(r.prio)+'</span>':'')
    +(r.title?'<div style="font-size:12.5px;font-weight:600;color:#1A1F36;margin-top:4px">'+nwEsc(r.title)+'</div>':'')
    +'<div style="font-size:12px;color:#4A5680;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+nwEsc(r.desc)+'</div></div>'
    +'<button type="button" data-c="'+nwEsc(r.code)+'" onclick="nwEdit(this.dataset.c)" style="flex-shrink:0;padding:7px 14px;background:#1565C0;color:#fff;border:none;border-radius:7px;font:600 11px var(--ui-font);cursor:pointer">Edit</button></div>').join('')
    +(tot>60?'<div style="padding:10px;text-align:center;color:#8A96B8;font-size:11px">Menampilkan 60 dari '+tot+' hasil. Persempit pencarian.</div>':'');
}
function nwEdit(code){nwEditCode=code;nwRender();}
function nwCollect(){
  const g=id=>(document.getElementById(id)||{value:''}).value.trim();
  const code=g('nw_code');
  if(nwBrand==='ncr'){
    const rec={k:code,code,prio:g('nw_prio'),tipe:g('nw_tipe')||'Semua',desc:g('nw_desc'),komponen:g('nw_komp').split(',').map(x=>x.trim()).filter(Boolean),solusi:g('nw_sol').split('\n').map(x=>x.trim()).filter(Boolean)};
    return {code,rec,ok:!!(code&&rec.desc&&rec.solusi.length)};
  }
  const key=code.toLowerCase();
  const rec={k:key,title:g('nw_title'),sev:g('nw_sev'),cat:g('nw_cat'),comp:g('nw_comp'),desc:g('nw_desc'),action:g('nw_act')};
  return {code:key,rec,ok:!!(code&&rec.title&&rec.desc&&rec.action)};
}
function nwSave(){
  const c=nwCollect();
  if(!c.ok){nwMsg(nwBrand==='ncr'?'Kode, Deskripsi, dan minimal satu langkah solusi wajib diisi.':'Kode, Judul, Deskripsi, dan Tindakan wajib diisi.','err');return;}
  const edit=nwEditCode!==null;
  if(!edit&&nwList(nwMod).some(r=>String(r.code).toLowerCase()===String(c.code).toLowerCase())){nwMsg('Kode sudah ada. Gunakan menu Edit / Hapus untuk mengubahnya.','warn');return;}
  NW_OV[nwMod][c.code]=c.rec;
  nwRefreshViews();
  if(window.__fb)window.__fb.setDoc(window.__fb.docRef(nwMod,c.code),c.rec).catch(e=>{console.warn('Gagal sync ke Firestore:',e);nwMsg('Tersimpan lokal, tetapi gagal sync ke Firestore (cek koneksi atau aturan akses).','warn');});
  if(edit){nwEditCode=null;nwMode='edit';nwRender();}
  else{nwRender();nwMsg('Record berhasil ditambahkan. Kode: '+c.code,'ok');}
}
function nwDelete(){
  if(nwEditCode===null)return;
  const code=nwEditCode;
  if(!confirm('Hapus kode '+code+' dari '+NW_MODS[nwMod].label+'?\nTindakan ini tidak bisa dibatalkan.'))return;
  const rec={k:code,_deleted:true};
  NW_OV[nwMod][code]=rec;
  nwRefreshViews();
  if(window.__fb)window.__fb.setDoc(window.__fb.docRef(nwMod,code),rec).catch(e=>console.warn('Gagal sync hapus ke Firestore:',e));
  nwEditCode=null;nwMode='edit';nwRender();
}

async function syncFirestoreOverlay(){
  if(!window.__fb) return;
  const mods = ['brm860','brm50','cdu10','cdu30','extra'];
  for(const m of mods){
    try{
      const docs = await window.__fb.getAllDocs(m);
      docs.forEach(function(rec){
        if(!rec || !rec.k) return;
        const idx = DB[m].findIndex(function(r){return r.k===rec.k;});
        if(rec._deleted){
          if(idx>=0) DB[m].splice(idx,1);
        } else {
          const clean = {k:rec.k, m:rec.m, d:rec.d, p:rec.p, t:rec.t, s:rec.s};
          if(idx>=0) DB[m][idx]=clean; else DB[m].unshift(clean);
        }
      });
    }catch(e){ console.warn('Sync Firestore gagal untuk modul', m, e); }
  }
  updateStats();
  doFilter();
  try{await nwSyncOverlay();}catch(e){}
}

function updateAdminButton(){
  const b=document.getElementById('headerAdminBtn');
  if(b) b.style.display=(currentUser&&currentIsAdmin===true)?'flex':'none';
}
function openAdminLogin(){
  if(!currentUser){
    alert('Silakan login terlebih dahulu.');
    return;
  }
  if(!currentIsAdmin){
    alert('Akun Anda (' + currentUser.email + ') tidak memiliki akses Admin Panel.\nHubungi admin/IT untuk pertanyaan lebih lanjut.');
    return;
  }
  openAdminPanel();
}
function closeAdminLogin(){document.getElementById('adminLoginOvl').style.display='none';}

async function checkAdminPass(){
  const email = document.getElementById('adminEmailInput').value.trim();
  const pass = document.getElementById('adminPassInput').value;
  const errEl = document.getElementById('adminPassErr');
  if(!window.__fb){
    errEl.textContent='⚠️ Koneksi Firebase belum siap, coba lagi sebentar.';
    errEl.style.display='block';
    return;
  }
  try{
    await window.__fb.signIn(email, pass);
    errEl.style.display='none';
    closeAdminLogin();
    openAdminPanel();
  }catch(e){
    errEl.textContent='❌ Email atau password salah.';
    errEl.style.display='block';
    document.getElementById('adminPassInput').style.borderColor='#D32F2F';
    setTimeout(function(){document.getElementById('adminPassInput').style.borderColor='#C5D0F0';},2000);
  }
}


// ===== LAPORAN PENGGUNAAN (Admin) =====
let usageEvents = [];
let usageEscalations = [];
const USAGE_BRAND = {hyosung:'Hyosung',wincor:'Wincor',ncr:'NCR',smart:'Smart Analyzer',portal:'Portal TS',clara:'Tanya Clara'};
const USAGE_CAT = {software:'Software','modul-atm':'Modul ATM',tools:'Tools','laporan-smart-analyzer':'Laporan Smart Analyzer'};
function usageDay(offset){return new Date(Date.now()+7*3600e3-offset*86400e3).toISOString().slice(0,10);}
function usageSetRange(days,silent){
  document.getElementById('usageFrom').value=usageDay(days-1);
  document.getElementById('usageTo').value=usageDay(0);
  if(!silent) usageLoadReport();
}
async function usageLoadReport(){
  const from=document.getElementById('usageFrom').value, to=document.getElementById('usageTo').value;
  const status=document.getElementById('usageStatus'), btn=document.getElementById('usageLoadBtn');
  if(!currentIsAdmin){status.textContent='Hanya admin yang dapat melihat laporan.';return;}
  if(!from||!to||from>to){status.textContent='Rentang tanggal tidak valid.';return;}
  btn.disabled=true; status.textContent='Memuat data penggunaan...';
  try{
    usageEvents=await window.__fb.getUsage(from,to);
    try{usageEscalations=await window.__fb.getEscalations(from,to);}catch(e){usageEscalations=[];}
    status.textContent=`${usageEvents.length.toLocaleString('id')} aktivitas dari ${from} sampai ${to}`+(usageEvents.length>=100000?' (dibatasi 100.000 data pertama; persempit rentang tanggal)':'');
    document.getElementById('usageCsvBtn').style.display=usageEvents.length?'':'none';
    document.getElementById('usageXlsBtn').style.display=usageEvents.length?'':'none';
    usageRender();
  }catch(error){
    status.textContent='Gagal memuat laporan: '+(error.message||'periksa Firestore Rules (usage_events) dan koneksi.');
    console.warn('Gagal memuat usage_events',error);
  }finally{btn.disabled=false;}
}
const USAGE_EXCL_KEY='usageExcludeEmails';
const USAGE_EXCL_DEFAULT='laska.dinata@citius.co.id';
function usageExcludeList(){
  let raw=null;
  try{raw=localStorage.getItem(USAGE_EXCL_KEY);}catch(e){}
  if(raw===null) raw=USAGE_EXCL_DEFAULT;
  return raw.split(/[,;\s]+/).map(x=>x.trim().toLowerCase()).filter(Boolean);
}
function usageSaveExclude(){
  try{localStorage.setItem(USAGE_EXCL_KEY,document.getElementById('usageExcludeEmails').value);}catch(e){}
  usageRender();
}
function usageFiltered(){
  const excl=new Set(usageExcludeList());
  const me=(typeof currentUser!=='undefined'&&currentUser)?currentUser:null;
  const f=(document.getElementById('usageEmailFilter').value||'').trim().toLowerCase();
  return usageEvents.filter(e=>{
    const mail=(e.email||'').toLowerCase();
    if(excl.has(mail)) return false;            // akun admin yang disembunyikan
    if(me&&e.uid===me.uid) return false;        // admin yang sedang melihat laporan
    return !f||mail.includes(f);
  });
}
/* cek apakah kode yang dicari FSE (tanpa hasil) sudah ditambahkan admin / sudah ada di database */
const USAGE_MOD_LABEL={brm860:'BRM860 / MX8600S',brm50:'BRM50',cdu10:'CDU10',cdu30:'CDU30',cdu800:'CDU800',extra:'Modul Lainnya'};
function usageModLabel(m){return USAGE_MOD_LABEL[m]||m;}
/* modul yang bermasalah untuk satu kode error: BRM dibaca dari digit ke-3 kode (CSM, TE, TSK, BC, RC1 dst),
   mesin lain dari nama modul di database, unit selain BRM/CDU dari digit ke-1 */
function usageProbMod(e){
  const none={s:'',f:''};
  try{
    const q=String(e.query||'').toUpperCase().replace(/\s+/g,''), m=e.module||'';
    const sp=t=>{const a=String(t||'').trim().split(/\s+[\u2014\u2013]\s+/);return {s:a[0],f:a.slice(1).join(' \u2014 ')};};
    if(!q)return none;
    let map=null;
    if(m==='brm860'&&q[0]==='5')map=typeof MODULE_MAP_860!=='undefined'?MODULE_MAP_860:null;
    else if(m==='brm50'&&q[0]==='5')map=typeof MODULE_MAP_50!=='undefined'?MODULE_MAP_50:null;
    if(map&&q.length>=3&&map[q[2]])return sp(map[q[2]]);
    const rows=(typeof DB!=='undefined'&&DB[m])||[];
    const r=rows.find(x=>String(x.k).toUpperCase()===q);
    if(r&&r.m&&m!=='brm860'&&m!=='brm50'){const t=String(r.m).trim();return {s:t.replace(/\s*\(.*$/,'')||t,f:t};}
    if(m==='cdu10'&&typeof MODULE_MAP_CDU10!=='undefined'&&MODULE_MAP_CDU10[q[2]])return sp(MODULE_MAP_CDU10[q[2]]);
    if(m==='cdu30'&&typeof MODULE_MAP_CDU30!=='undefined'&&MODULE_MAP_CDU30[q[2]])return sp(MODULE_MAP_CDU30[q[2]]);
    if(r&&r.m){const t=String(r.m).trim();return {s:t.replace(/\s*\(.*$/,'')||t,f:t};}
    if(typeof UNIT_MAP!=='undefined'&&UNIT_MAP[q[0]]&&q[0]!=='5')return sp(UNIT_MAP[q[0]]);
  }catch(x){}
  return none;
}
/* status pencarian tanpa hasil:
   ada   = kode sudah ada di tipe yang dipilih FSE (sudah ditambahkan admin)
   tipe  = kode ada, tetapi di tipe lain (FSE salah memilih tipe)
   potong= kode kurang angka/karakter (awalan dari kode lengkap di database)
   ketik = beda satu karakter dari kode di database (salah ketik)
   belum = benar-benar belum ada, perlu ditambah */
function usageCodeStatus(mod,q){
  const none={s:'belum',codes:[],mods:[],hint:''};
  try{
    if(typeof DB==='undefined')return none;
    const k=String(q||'').trim().toUpperCase().replace(/\s+/g,'');
    if(!k||k.length<3||!/\d/.test(k)||!/^[A-Z0-9@]+$/.test(k))return none;
    const keys=Object.keys(DB);
    const own=DB[mod]||[];
    if(own.some(r=>String(r.k).toUpperCase()===k))return {s:'ada',codes:[k],mods:[mod],hint:'Sudah ada di '+usageModLabel(mod)+'.'};
    const lbl=(key,r)=>usageModLabel(key)+(r&&r.m?' ('+String(r.m).replace(/\s*[\(—-].*$/,'').slice(0,28)+')':'');
    /* kode lengkap ada di tipe lain */
    const other=[];
    keys.forEach(key=>{if(key===mod)return;const r=(DB[key]||[]).find(x=>String(x.k).toUpperCase()===k);if(r)other.push([key,r]);});
    if(other.length)return {s:'tipe',codes:[k],mods:other.map(o=>o[0]),hint:'Kode ada di '+other.map(o=>lbl(o[0],o[1])).join(' / ')+'. FSE memilih '+usageModLabel(mod)+'.'};
    /* kurang angka: awalan dari kode di database */
    if(k.length<7){
      const hits=[];
      keys.forEach(key=>(DB[key]||[]).forEach(r=>{const c=String(r.k).toUpperCase();if(c.indexOf(k)===0)hits.push([key,c]);}));
      if(hits.length){
        hits.sort((x,y)=>(x[0]===mod?0:1)-(y[0]===mod?0:1)||x[1].localeCompare(y[1]));
        const mods=[...new Set(hits.map(h=>h[0]))];
        const uq=[...new Set(hits.map(h=>h[1]))];
        return {s:'potong',codes:uq.slice(0,3),mods,hint:'Kurang angka ('+k.length+' dari 7 karakter). Kemungkinan: '+uq.slice(0,3).join(', ')+(uq.length>3?' dan '+(uq.length-3)+' kode lain':'')+' di '+mods.map(usageModLabel).join(' / ')+'.'};
      }
    }
    /* salah ketik: beda satu karakter, panjang sama */
    if(k.length===7){
      const sim=[];
      keys.forEach(key=>(DB[key]||[]).forEach(r=>{const c=String(r.k).toUpperCase();if(c.length!==7)return;let d=0;for(let i=0;i<7&&d<2;i++)if(c[i]!==k[i])d++;if(d===1)sim.push([key,c]);}));
      if(sim.length){
        const uq=[...new Set(sim.map(h=>h[1]))];
        const mods=[...new Set(sim.map(h=>h[0]))];
        /* banyak kode yang hanya beda 1 karakter = satu keluarga kode, kemungkinan kode baru, bukan salah ketik */
        if(uq.length>=3)return {s:'belum',codes:uq.slice(0,3),mods,hint:'Satu keluarga dengan '+uq.slice(0,3).join(', ')+' di '+mods.map(usageModLabel).join(' / ')+'. Kemungkinan kode baru, cek lalu tambahkan.'};
        return {s:'ketik',codes:uq,mods,hint:'Mirip '+uq.join(', ')+' di '+mods.map(usageModLabel).join(' / ')+'. Kemungkinan salah ketik.'};
      }
    }
    /* kode lebih panjang dari kode di database */
    if(k.length>7){
      const c7=k.slice(0,7);
      for(const key of keys){const r=(DB[key]||[]).find(x=>String(x.k).toUpperCase()===c7);if(r)return {s:'ketik',codes:[c7],mods:[key],hint:'Kelebihan karakter. Kode yang benar kemungkinan '+c7+' di '+usageModLabel(key)+'.'};}
    }
    return none;
  }catch(e){return none;}
}
const USAGE_ST_SHORT={ada:'Sudah ditambahkan',tipe:'Salah tipe',potong:'Kurang angka',ketik:'Salah ketik',belum:'Perlu ditambah'};
function usageStatusLabel(st){
  if(st.s==='tipe')return 'Salah tipe → '+(st.mods||[]).map(usageModLabel).join(' / ');
  return USAGE_ST_SHORT[st.s]||'Perlu ditambah';
}
function usageStatusText(st){return (st.s==='belum'?'Belum ada, perlu ditambah':usageStatusLabel(st))+(st.hint&&st.s!=='ada'?'. '+(st.sug&&st.sug!==st.s?'Saran sistem: ':'')+st.hint:'');}
/* penandaan admin: Salah tipe / Kurang angka / Salah ketik. "Sudah ada" dan "Perlu ditambah" ditentukan otomatis. */
let usageMissMarks={};
try{usageMissMarks=JSON.parse(localStorage.getItem('citius_miss_marks')||'{}')||{};}catch(e){}
let usageMarksShared=true,usageMarksAt=0,usageMarksPromise=null;
const usageSugCache=new Map();
function usageMissKey(mod,q){const c=String(q||'').toUpperCase().replace(/[^A-Z0-9@]/g,'');return c&&mod?String(mod).replace(/[^a-z0-9]/gi,'')+'__'+c:'';}
function usageMarksSave(){try{localStorage.setItem('citius_miss_marks',JSON.stringify(usageMissMarks));}catch(e){}}
function usageMarksLoad(){
  if(usageMarksPromise&&Date.now()-usageMarksAt<60000)return usageMarksPromise;
  usageMarksAt=Date.now();
  usageMarksPromise=(async()=>{
    try{
      if(window.__fb&&window.__fb.getMissMarks){
        const rem=await window.__fb.getMissMarks();
        Object.keys(rem).forEach(k=>{const a=usageMissMarks[k],b=rem[k];if(!a||String(b.at||'')>=String(a.at||''))usageMissMarks[k]=b;});
        usageMarksSave();usageMarksShared=true;
      }
    }catch(e){usageMarksShared=false;}
  })();
  return usageMarksPromise;
}
function usageSug(mod,q){const k=mod+'|'+q;if(!usageSugCache.has(k))usageSugCache.set(k,usageCodeStatus(mod,q));return usageSugCache.get(k);}
function usageMissRows(list){
  const m=new Map();
  list.forEach(e=>{const k=(e.module||'')+'|'+(e.query||'');m.set(k,(m.get(k)||0)+1);});
  return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).map(([k,n])=>{
    const i=k.indexOf('|');const mod=k.slice(0,i),q=k.slice(i+1);
    const sug=usageSug(mod,q);
    const mk=usageMissMarks[usageMissKey(mod,q)];const mc=mk&&mk.c||'';
    const eff=sug.s==='ada'?'ada':(['tipe','potong','ketik'].indexOf(mc)>=0?mc:'belum');
    return {mod,q,n,sug,mark:eff==='ada'?'':mc,markBy:mk&&mk.by||'',st:Object.assign({},sug,{s:eff,sug:sug.s,marked:eff!=='ada'&&eff!=='belum'})};
  });
}
async function alMissMark(mod,q,cls){
  const key=usageMissKey(mod,q);if(!key)return;
  const val={c:cls==='belum'?'':cls,by:(typeof currentUser!=='undefined'&&currentUser&&currentUser.email)||'',at:new Date().toISOString()};
  usageMissMarks[key]=val;usageMarksSave();alMissDraw();
  try{await window.__fb.setMissMark(key,val);usageMarksShared=true;}catch(e){usageMarksShared=false;}
  alMissDraw();
}
function alMissMarkIdx(i,cls){const r=(window.__alMissShown||[])[i];if(r)alMissMark(r.mod,r.q,cls);}
/* kartu "Pencarian tanpa hasil": filter per jenis masalah */
const AL_MISS_CLS={ada:'ok',tipe:'tp',potong:'pt',ketik:'kt',belum:'no'};
let alMissFilter='all';
function alMissSet(f){alMissFilter=f;alMissDraw();}
let alMissPage=0;
const AL_MISS_PS=5;
function alMissNav(d){alMissPage+=d;alMissDraw();}
function alMissDraw(){
  const el=document.getElementById('alMiss');if(!el)return;
  const all=usageMissRows(window.__alMissSrc||[]);
  const cnt={belum:0,tipe:0,potong:0,ketik:0,ada:0};all.forEach(r=>{cnt[r.st.s]=(cnt[r.st.s]||0)+1;});
  const pages=Math.max(1,Math.ceil(all.length/AL_MISS_PS));
  alMissPage=Math.min(Math.max(0,alMissPage),pages-1);
  const rows=all.slice(alMissPage*AL_MISS_PS,alMissPage*AL_MISS_PS+AL_MISS_PS);window.__alMissShown=rows;
  const mx=rows.length?rows[0].n:1;
  const OPT=[['belum','Perlu ditambah'],['tipe','Salah tipe'],['potong','Kurang angka'],['ketik','Salah ketik']];
  const chev=d=>'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'"/></svg>';
  let h='<h4><span class="al-hi">'+alSvg('miss',16)+'</span>Pencarian tanpa hasil';
  if(all.length>AL_MISS_PS)h+='<span class="al-pager"><button type="button" class="al-pg" aria-label="Sebelumnya" onclick="alMissNav(-1)"'+(alMissPage<=0?' disabled':'')+'>'+chev(-1)+'</button><span class="al-pgn">'+(alMissPage+1)+' / '+pages+'</span><button type="button" class="al-pg" aria-label="Berikutnya" onclick="alMissNav(1)"'+(alMissPage>=pages-1?' disabled':'')+'>'+chev(1)+'</button></span>';
  h+='</h4>';
  if(!rows.length)h+='<div class="al-none">Tidak ada, semua pencarian ditemukan.</div>';
  else h+=rows.map((r,i)=>{
    const st=r.st,sg=r.sug;
    const tip=st.s!=='ada'&&sg.hint?(sg.s==='belum'?'Catatan sistem: ':'Saran sistem: ')+sg.hint:'';
    const ctl=st.s==='ada'?'<u class="al-tag ok">Sudah ditambahkan</u>':'<select class="al-mark m-'+st.s+'" title="'+usageEsc(r.markBy?'Ditandai oleh '+r.markBy:'Pilah oleh admin')+'" onchange="alMissMarkIdx('+i+',this.value)">'+OPT.map(o=>'<option value="'+o[0]+'"'+(st.s===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
    return '<div class="al-row"><em class="r'+(alMissPage*AL_MISS_PS+i+1)+'">'+(alMissPage*AL_MISS_PS+i+1)+'</em><span'+(tip?' title="'+usageEsc(tip)+'"':'')+'>'+usageEsc(usageModLabel(r.mod)+' · '+r.q)+'</span>'+ctl+'<b>'+r.n+'</b><i style="width:'+Math.max(6,Math.round(r.n/mx*100))+'%"></i></div>';
  }).join('');
  if(all.length)h+='<div class="al-foot">Dari '+all.length+' pencarian: '+cnt.belum+' perlu ditambah, '+cnt.tipe+' salah tipe, '+cnt.potong+' kurang angka, '+cnt.ketik+' salah ketik, '+cnt.ada+' sudah ada. Hanya "Perlu ditambah" yang perlu diinput.</div>';
  if(!usageMarksShared)h+='<div class="al-foot al-warn">Penandaan belum tersimpan ke Firebase (aturan Firestore app_config/usage_miss_marks belum ditambahkan), jadi hanya tersimpan di perangkat ini.</div>';
  el.innerHTML=h;
}
function usageCount(list,keyFn){
  const m=new Map();
  list.forEach(e=>{const k=keyFn(e); if(k===null||k===undefined||k==='')return; m.set(k,(m.get(k)||0)+1);});
  return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
}
const USAGE_PAGE_SIZE=5;
const __usageTables={};
function usageEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function usageTableHtml(id){
  const t=__usageTables[id], rows=t.rows, pages=Math.max(1,Math.ceil(rows.length/USAGE_PAGE_SIZE));
  t.page=Math.min(Math.max(1,t.page),pages);
  const from=(t.page-1)*USAGE_PAGE_SIZE, shown=rows.slice(from,from+USAGE_PAGE_SIZE);
  const body=shown.length?shown.map(r=>'<tr>'+r.map((c,i)=>`<td style="padding:6px 8px;border-top:1px solid #E3E9F7;font-size:12px;${i===r.length-1?'text-align:right;font-weight:700;':''}overflow-wrap:anywhere">${usageEsc(c)}</td>`).join('')+'</tr>').join(''):`<tr><td colspan="${t.headers.length}" style="padding:10px 8px;font-size:12px;color:#8A96B8">Belum ada data.</td></tr>`;
  const pager=rows.length>USAGE_PAGE_SIZE?`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-top:1px solid #E3E9F7;background:#F8FAFF;font-size:11px;color:#4A5680"><span>${from+1}–${from+shown.length} dari ${rows.length}</span><span style="display:flex;gap:6px;align-items:center"><button type="button" class="usage-btn" style="padding:4px 10px" onclick="usagePage('${id}',-1)" ${t.page<=1?'disabled':''}>‹ Sebelumnya</button><span>Hal ${t.page}/${pages}</span><button type="button" class="usage-btn" style="padding:4px 10px" onclick="usagePage('${id}',1)" ${t.page>=pages?'disabled':''}>Berikutnya ›</button></span></div>`:'';
  return `<div style="font-size:13px;font-weight:700;color:#1A1F36;margin-bottom:6px">${usageEsc(t.title)}</div><div style="border:1px solid #D5DCEA;border-radius:8px;overflow:hidden"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#F0F4FF">${t.headers.map((h,i)=>`<th style="padding:7px 8px;font-size:11px;color:#4A5680;text-align:${i===t.headers.length-1?'right':'left'}">${usageEsc(h)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>${pager}</div>`;
}
function usagePage(id,delta){
  const t=__usageTables[id]; if(!t) return;
  t.page+=delta;
  const el=document.getElementById('usageTbl_'+id); if(el) el.innerHTML=usageTableHtml(id);
}
function usageTable(title,rows,headers){
  const id='t'+Object.keys(__usageTables).length;
  __usageTables[id]={title,rows,headers,page:1};
  return `<div id="usageTbl_${id}" style="margin-bottom:18px">${usageTableHtml(id)}</div>`;
}
function usageRender(){
  const body=document.getElementById('usageReportBody');
  for(const k of Object.keys(__usageTables)) delete __usageTables[k];
  const exEl=document.getElementById('usageExcludeEmails');
  if(exEl&&document.activeElement!==exEl){let raw=null;try{raw=localStorage.getItem(USAGE_EXCL_KEY);}catch(e){} exEl.value=raw===null?USAGE_EXCL_DEFAULT:raw;}
  const ev=usageFiltered();
  if(!usageEvents.length){body.innerHTML='';return;}
  const searches=ev.filter(e=>e.type==='search'), views=ev.filter(e=>e.type==='view_error');
  const smart=ev.filter(e=>e.type==='smart_analyze'), dl=ev.filter(e=>e.type==='download'), clara=ev.filter(e=>e.type==='clara');
  const users=new Set(ev.map(e=>e.email)).size;
  const card=(label,val)=>`<div style="flex:1;min-width:110px;padding:12px;border:1px solid #C5D0F0;border-radius:9px;background:#F8FAFF"><div style="font-size:20px;font-weight:800;color:#1565C0">${val.toLocaleString('id')}</div><div style="font-size:11px;color:#4A5680;margin-top:2px">${label}</div></div>`;
  const brandRows=['hyosung','wincor','ncr'].map(b=>[USAGE_BRAND[b],searches.filter(e=>e.brand===b).length,views.filter(e=>e.brand===b).length].concat([searches.filter(e=>e.brand===b).length+views.filter(e=>e.brand===b).length]));
  body.innerHTML=
    `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">${card('FSE aktif',users)}${card('Pencarian',searches.length)}${card('Analisa Smart',smart.length)}${card('Tanya Clara',clara.length)}${card('Download',dl.length)}</div>`+
    usageTable('Pencarian error code per merek',brandRows.map(r=>[r[0],r[1],r[2],r[3]]),['Merek','Pencarian','Detail dibuka','Total'])+
    usageTable('Penggunaan per FSE (semua aktivitas)',usageCount(ev,e=>e.email||'(tanpa email)'),['Email FSE','Aktivitas'])+
    usageTable('Kode error paling sering dibuka',(()=>{const mm={};return usageCount(views,e=>{const k=`${USAGE_BRAND[e.brand]||e.brand} ${e.module||''} · ${e.query}`;mm[k]=usageProbMod(e).s;return k;}).map(r=>[r[0],mm[r[0]]||'-',r[1]]);})(),['Merek / tipe · kode','Modul bermasalah','Dibuka'])+
    usageTable('Kata kunci paling sering dicari',usageCount(searches,e=>`${USAGE_BRAND[e.brand]||e.brand} · ${e.query}`),['Merek · kata kunci','Dicari'])+
    usageTable('Pencarian Hyosung tanpa hasil (cek status sebelum menambah kode)',usageMissRows(searches.filter(e=>e.results===0)).map(x=>[x.mod+' · '+x.q,usageStatusText(x.st),x.n]),['Modul · kata kunci','Status di database','Kali dicari'])+
    usageTable('Tanya Clara: pertanyaan terbanyak',usageCount(clara,e=>e.query),['Pertanyaan','Kali ditanya'])+
    usageTable('Tanya Clara per FSE',usageCount(clara,e=>e.email||'(tanpa email)'),['Email FSE','Pertanyaan'])+
    usageTable('Pemakaian Smart Analyzer per FSE',usageCount(smart,e=>e.email||'(tanpa email)'),['Email FSE','Analisa'])+
    usageTable('Smart Analyzer per jenis mesin',usageCount(smart,e=>e.module),['Modul','Analisa'])+
    usageTable('Download per kategori',usageCount(dl,e=>(USAGE_CAT[e.category]||e.category||'-')+(e.bank?' · '+e.bank:'')),['Kategori','Download'])+
    usageTable('File paling sering di-download',usageCount(dl,e=>e.fileTitle||'-'),['File','Download'])+
    usageTable('Aktivitas per hari',usageCount(ev,e=>e.day).sort((a,b)=>a[0]<b[0]?1:-1),['Tanggal','Aktivitas']);
}

// ===== EKSPOR EXCEL LAPORAN RESMI =====
const USAGE_ORG='PT. Citius Solusi Indonesia - TECHNICAL SUPPORT ';
const USAGE_DOC_TITLE='LAPORAN PENGGUNAAN APLIKASI ERROR CODE & SMART ANALYZER';
function usageExportExcel(){
  const ev=usageFiltered();
  if(!ev.length){alert('Tidak ada data untuk diekspor.');return;}
  const from=document.getElementById('usageFrom').value, to=document.getElementById('usageTo').value;
  const esc=v=>String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const C=(v,st,span)=>{const num=typeof v==='number'&&isFinite(v);return `<Cell${st?` ss:StyleID="${st}"`:''}${span?` ss:MergeAcross="${span}"`:''}><Data ss:Type="${num?'Number':'String'}">${esc(v)}</Data></Cell>`;};
  const R=(cells,h)=>`<Row${h?` ss:Height="${h}"`:''}>${cells.join('')}</Row>`;
  const gap=h=>`<Row ss:Height="${h||8}"/>`;
  const wib=d=>d?new Date(d.getTime()+7*3600e3):null;
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const nw=wib(now);
  const stamp=`${nw.getUTCFullYear()}${pad(nw.getUTCMonth()+1)}${pad(nw.getUTCDate())}`;
  const docNo=`TS/LPU/${stamp}/${pad(nw.getUTCHours())}${pad(nw.getUTCMinutes())}`;
  const printed=`${nw.getUTCDate()} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][nw.getUTCMonth()]} ${nw.getUTCFullYear()}, ${pad(nw.getUTCHours())}:${pad(nw.getUTCMinutes())} WIB`;
  const me=(typeof currentUser!=='undefined'&&currentUser&&currentUser.email)?currentUser.email:'-';
  const tsOf=e=>{try{return e.ts&&e.ts.toDate?e.ts.toDate():null;}catch(_){return null;}};
  const fmt=d=>{const w=wib(d);return w?`${w.getUTCFullYear()}-${pad(w.getUTCMonth()+1)}-${pad(w.getUTCDate())} ${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}:${pad(w.getUTCSeconds())}`:'';};
  const periode=`${from} s/d ${to}`;
  const T=t=>ev.filter(e=>e.type===t);
  const searches=T('search'),views=T('view_error'),smart=T('smart_analyze'),dl=T('download'),clara=T('clara');
  const fseSet=new Set(ev.map(e=>e.email||'(tanpa email)'));
  const daySet=new Set(ev.map(e=>e.day));
  const uniq=list=>new Set(list.map(e=>e.email||'(tanpa email)')).size;

  // ---- blok judul untuk setiap sheet ----
  const top=(title,span)=>[
    R([C(USAGE_ORG,'Org',span)],20),
    R([C(title,'Title',span)],26),
    R([C('Periode: '+periode+'   |   No. Dokumen: '+docNo,'Sub',span)],18),
    gap(6)
  ];
  const hdr=cols=>R(cols.map(h=>C(h,'Hdr')),24);
  const rows=(data)=>data.map((r,i)=>R([C(i+1,'Ctr')].concat(r.map(v=>C(v,typeof v==='number'?'Num':'Cell')))));
  const empty=n=>R([C('Tidak ada data pada periode ini.','Note',n)]);
  const mkSheet=(name,widths,rowsXml,freeze)=>`<Worksheet ss:Name="${esc(name)}"><Table ss:DefaultRowHeight="16">${widths.map(w=>`<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`).join('')}${rowsXml.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><PageSetup><Layout x:Orientation="${widths.reduce((a,b)=>a+b,0)>640?'Landscape':'Portrait'}"/><Header x:Margin="0.3" x:Data="&amp;L&amp;8${esc(USAGE_ORG)}&amp;R&amp;8No. ${esc(docNo)}"/><Footer x:Margin="0.3" x:Data="&amp;L&amp;8Dokumen internal - bersifat rahasia&amp;R&amp;8Halaman &amp;P dari &amp;N"/><PageMargins x:Bottom="0.7" x:Left="0.5" x:Right="0.5" x:Top="0.7"/></PageSetup><FitToPage/><Print><ValidPrinterInfo/><PaperSizeIndex>9</PaperSizeIndex><Scale>${Math.max(30,Math.min(100,Math.floor((widths.reduce((x,y)=>x+y,0)>640?760:515)/widths.reduce((x,y)=>x+y,0)*100)))}</Scale><FitWidth>1</FitWidth><FitHeight>0</FitHeight></Print>${freeze?`<FreezePanes/><FrozenNoSplit/><SplitHorizontal>${freeze}</SplitHorizontal><TopRowBottomPane>${freeze}</TopRowBottomPane><ActivePane>2</ActivePane><Panes><Pane><Number>3</Number></Pane><Pane><Number>2</Number><ActiveRow>${freeze}</ActiveRow></Pane></Panes>`:''}</WorksheetOptions></Worksheet>`;
  // sheet tabel sederhana: judul + header + baris (No otomatis)
  const tableSheet=(name,title,heads,widths,data,note)=>{
    const span=heads.length; // No + kolom data -> MergeAcross = jumlah kolom total - 1
    const r=top(title,span);
    r.push(hdr(['No'].concat(heads)));
    const freeze=r.length;
    if(data.length) r.push(...rows(data)); else r.push(empty(span));
    if(note){r.push(gap(6));r.push(R([C(note,'Note',span)],30));}
    return mkSheet(name,[36].concat(widths),r,freeze);
  };
  const count=(list,fn)=>{const m=new Map();list.forEach(e=>{const k=fn(e);if(k===null||k===undefined||k==='')return;m.set(k,(m.get(k)||0)+1);});return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])));};
  const BR=b=>USAGE_BRAND[b]||b||'-';

  // ================= SHEET 1: RINGKASAN =================
  const S=[];
  S.push(R([C(USAGE_ORG,'Org',5)],22));
  S.push(R([C(USAGE_DOC_TITLE,'Title',5)],30));
  S.push(R([C('Laporan Resmi Penggunaan oleh Teknisi / Field Service Engineer (FSE)','Sub',5)],18));
  S.push(gap(8));
  const meta=(k,v)=>R([C(k,'Lbl',1),C(v,'Val',3)],20);
  S.push(meta('Nomor Dokumen',docNo));
  S.push(meta('Periode Laporan',periode));
  S.push(meta('Tanggal & Waktu Cetak',printed));
  S.push(meta('Dicetak oleh (Admin)',me));
  S.push(meta('Sumber Data','Firebase Firestore - koleksi usage_events'));
  const fEm=(document.getElementById('usageEmailFilter').value||'').trim();
  S.push(meta('Cakupan Data','Aktivitas teknisi/FSE (akun admin tidak dipantau)'+(fEm?'; filter email: '+fEm:'')));
  S.push(gap(10));
  S.push(R([C('A. RINGKASAN UMUM','Sec',5)],22));
  S.push(R([C('No','Hdr'),C('Indikator','Hdr'),C('Nilai','Hdr'),C('Satuan','Hdr',2)],22));
  const kpi=[
    ['Jumlah FSE/teknisi aktif',fseSet.size,'orang'],
    ['Total aktivitas tercatat',ev.length,'aktivitas'],
    ['Pencarian error code (Hyosung, Wincor, NCR)',searches.length,'kali'],
    ['Detail kode error dibuka (Hyosung)',views.length,'kali'],
    ['Analisa Smart Analyzer',smart.length,'kali'],
    ['Pertanyaan ke Clara (Technical Support Assistant)',clara.length,'pertanyaan'],
    ['Download file / laporan',dl.length,'file'],
    ['Rata-rata aktivitas per FSE',Math.round(ev.length/Math.max(1,fseSet.size)*10)/10,'aktivitas'],
    ['Jumlah hari dengan aktivitas',daySet.size,'hari']
  ];
  kpi.forEach((k,i)=>S.push(R([C(i+1,'Ctr'),C(k[0],'Cell'),C(k[1],'Num'),C(k[2],'Cell',2)])));
  S.push(gap(10));
  S.push(R([C('B. PENGGUNAAN PER MEREK / MENU','Sec',5)],22));
  S.push(R([C('No','Hdr'),C('Merek / Menu','Hdr'),C('Pencarian','Hdr'),C('Detail Dibuka','Hdr'),C('Total Aktivitas','Hdr'),C('FSE Unik','Hdr')],22));
  const brandRow=b=>{const l=ev.filter(e=>e.brand===b&&e.type!=='download');return [BR(b),searches.filter(e=>e.brand===b).length,views.filter(e=>e.brand===b).length,ev.filter(e=>e.brand===b).length,uniq(ev.filter(e=>e.brand===b))];};
  ['hyosung','wincor','ncr','smart','portal','clara'].forEach((b,i)=>{const r=brandRow(b);S.push(R([C(i+1,'Ctr')].concat(r.map(v=>C(v,typeof v==='number'?'Num':'Cell')))));});
  S.push(gap(10));
  S.push(R([C('C. CATATAN & METODOLOGI','Sec',5)],22));
  [
    'Data bersumber dari pencatatan otomatis setiap penggunaan aplikasi oleh teknisi/FSE yang login dengan akun masing-masing.',
    'Aktivitas akun admin tidak dipantau dan tidak dihitung dalam laporan ini.',
    'Tanya Clara dicatat setiap FSE mengirim pertanyaan (teks atau foto) di chat Clara; isi jawaban tidak disimpan.',
    'Pencarian dicatat setelah pengguna berhenti mengetik (minimal 3 karakter); aktivitas identik dalam 30 detik dihitung satu kali.',
    'Pencarian Wincor dan NCR tidak mencatat jumlah hasil pencarian; kolom "tanpa hasil" hanya berlaku untuk Hyosung.',
    'Waktu pada laporan ini menggunakan zona waktu WIB (UTC+7). Rincian lengkap tersedia pada sheet "Log Detail".',
    'Sheet "Tanpa Hasil" memuat kolom Status: kode yang sudah ditambahkan admin tidak perlu diinput ulang.'
  ].forEach((t,i)=>S.push(R([C((i+1)+'. '+t,'Wrap',5)],32)));
  const sheetSummary=mkSheet('Ringkasan',[36,250,100,100,100,100],S,0);

  // ================= SHEET 2: PER FSE =================
  const byU={};
  ev.forEach(e=>{const k=e.email||'(tanpa email)';const u=byU[k]=byU[k]||{t:0,s:0,v:0,a:0,c:0,d:0,days:new Set(),last:null};u.t++;if(e.type==='search')u.s++;else if(e.type==='view_error')u.v++;else if(e.type==='smart_analyze')u.a++;else if(e.type==='clara')u.c++;else if(e.type==='download')u.d++;u.days.add(e.day);const t=tsOf(e);if(t&&(!u.last||t>u.last))u.last=t;});
  const fseRows=Object.entries(byU).sort((a,b)=>b[1].t-a[1].t).map(([k,u])=>[k,u.s,u.v,u.a,u.c,u.d,u.t,u.days.size,u.last?fmt(u.last):'-']);
  const sheetFse=tableSheet('Per FSE','PENGGUNAAN PER FSE / TEKNISI',['Email FSE','Pencarian','Detail Dibuka','Smart Analyzer','Tanya Clara','Download','Total Aktivitas','Hari Aktif','Terakhir Aktif (WIB)'],[230,80,85,90,80,75,90,70,130],fseRows);

  // ================= SHEET 3: ERROR CODE =================
  const viewRows=count(views,e=>`${BR(e.brand)}|${e.module||'-'}|${e.query}`).map(([k,n])=>{const p=k.split('|');const ev1=views.find(e=>`${BR(e.brand)}|${e.module||'-'}|${e.query}`===k);const pm=usageProbMod(ev1||{});return [p[0],p[1],p[2],pm.s||'-',pm.f||'-',n,uniq(views.filter(e=>`${BR(e.brand)}|${e.module||'-'}|${e.query}`===k))];});
  const sheetCodes=tableSheet('Kode Error Dibuka','KODE ERROR PALING SERING DIBUKA',['Merek','Tipe Mesin','Kode Error','Modul Bermasalah','Nama Modul','Jumlah Dibuka','FSE Unik'],[90,90,110,120,230,90,70],viewRows,'Modul bermasalah dibaca dari digit ke-3 kode error (BRM) atau dari nama modul pada database (mesin lain), misalnya CSM, TE, TSK, BC, RC. Gunakan sheet "Modul Bermasalah" untuk rekap per modul.');
  const modMap=new Map();
  views.forEach(e=>{const p=usageProbMod(e);const k=`${BR(e.brand)}|${e.module||'-'}|${p.s||'-'}`;let o=modMap.get(k);if(!o){o={f:p.f||'-',n:0,codes:new Set(),u:new Set()};modMap.set(k,o);}o.n++;o.codes.add(e.query);o.u.add(e.email||'(tanpa email)');});
  const modRows=Array.from(modMap.entries()).sort((a,b)=>b[1].n-a[1].n||a[0].localeCompare(b[0])).map(([k,o])=>{const p=k.split('|');return [p[0],p[1],p[2],o.f,o.n,o.codes.size,o.u.size];});
  const sheetMod=tableSheet('Modul Bermasalah','REKAP MODUL YANG PALING SERING BERMASALAH',['Merek','Tipe Mesin','Modul Bermasalah','Nama Modul','Jumlah Dibuka','Kode Unik','FSE Unik'],[90,90,120,230,90,80,70],modRows,'Jumlah Dibuka = berapa kali FSE membuka detail kode error yang mengarah ke modul tersebut. Makin tinggi angkanya, makin sering modul itu menjadi sumber masalah di lapangan.');
  const kwRows=count(searches,e=>`${BR(e.brand)}|${e.module||'-'}|${e.query}`).map(([k,n])=>{const p=k.split('|');return [p[0],p[1],p[2],n];});
  const sheetKw=tableSheet('Kata Kunci','KATA KUNCI PENCARIAN TERBANYAK',['Merek','Modul','Kata Kunci','Jumlah Dicari'],[90,100,200,100],kwRows);
  const nfRows=usageMissRows(searches.filter(e=>e.results===0)).map(x=>[x.mod,x.q,x.n,usageStatusLabel(x.st),x.st.s==='belum'?'':(x.st.codes.join(', ')+(x.st.mods&&x.st.mods.length?' ('+x.st.mods.map(usageModLabel).join(' / ')+')':''))]);
  const sheetNf=tableSheet('Tanpa Hasil','PENCARIAN HYOSUNG TANPA HASIL',['Modul','Kata Kunci / Kode','Jumlah Dicari','Status di Database','Kode Terkait di Database'],[110,200,100,150,200],nfRows,'Status dicek terhadap database saat laporan dibuat (termasuk kode yang sudah ditambahkan admin). "Sudah ditambahkan" berarti tidak perlu diinput ulang; "Salah tipe" berarti FSE memilih tipe yang keliru; "Kurang angka" berarti kode kurang karakter; "Salah ketik" berarti beda satu karakter; "Perlu ditambah" perlu dilengkapi oleh Technical Support.');

  // ================= SHEET: TANYA CLARA =================
  const clFse=count(clara,e=>e.email||'(tanpa email)').map(([k,n])=>{const l=clara.filter(e=>(e.email||'(tanpa email)')===k);let last=null;l.forEach(e=>{const t=tsOf(e);if(t&&(!last||t>last))last=t;});return [k,n,l.filter(e=>e.module==='foto').length,new Set(l.map(e=>e.day)).size,last?fmt(last):'-'];});
  const sheetClaraFse=tableSheet('Tanya Clara per FSE','PENGGUNAAN TANYA CLARA PER FSE',['Email FSE','Jumlah Pertanyaan','Dengan Foto','Hari Aktif','Terakhir Bertanya (WIB)'],[230,110,90,80,140],clFse);
  const clQ=count(clara,e=>e.query).map(([k,n])=>[k,n,uniq(clara.filter(e=>e.query===k))]);
  const sheetClaraQ=tableSheet('Pertanyaan Clara','PERTANYAAN KE CLARA (AI TECHNICAL SUPPORT)',['Pertanyaan','Jumlah Ditanyakan','FSE Unik'],[420,110,80],clQ,'Pertanyaan dipotong maksimal 120 karakter. Isi jawaban Clara tidak disimpan.');
  const clDay=Object.entries(clara.reduce((m,e)=>{m[e.day]=(m[e.day]||0)+1;return m;},{})).sort((a,b)=>a[0]<b[0]?-1:1);
  const sheetClaraDay=tableSheet('Clara Harian','TANYA CLARA PER HARI',['Tanggal','Jumlah Pertanyaan'],[110,120],clDay);

  // ================= SHEET 6: SMART ANALYZER =================
  const smRows=count(smart,e=>`${e.email||'(tanpa email)'}|${e.module||'-'}|${e.mode||'-'}`).map(([k,n])=>{const p=k.split('|');return [p[0],p[1],p[2],n];});
  const sheetSmart=tableSheet('Smart Analyzer','PENGGUNAAN SMART ANALYZER',['Email FSE','Jenis Mesin / Modul','Mode Analisa','Jumlah Analisa'],[230,130,110,100],smRows);

  // ================= SHEET 7: DOWNLOAD =================
  const dlCat=count(dl,e=>`${USAGE_CAT[e.category]||e.category||'-'}|${e.bank||'-'}`).map(([k,n])=>{const p=k.split('|');return [p[0],p[1],n];});
  const dlFile=count(dl,e=>`${USAGE_CAT[e.category]||e.category||'-'}|${e.bank||'-'}|${e.fileTitle||'-'}`).map(([k,n])=>{const p=k.split('|');return [p[0],p[1],p[2],n];});
  const sheetDlCat=tableSheet('Download Kategori','DOWNLOAD PER KATEGORI',['Kategori','Bank / Sub-kategori','Jumlah Download'],[170,150,110],dlCat);
  const sheetDlFile=tableSheet('Download File','FILE PALING SERING DI-DOWNLOAD',['Kategori','Bank','Nama File','Jumlah Download'],[130,100,290,110],dlFile);

  // ================= SHEET 9: HARIAN =================
  const dayMap={};ev.forEach(e=>{const d=dayMap[e.day]=dayMap[e.day]||{s:0,v:0,a:0,c:0,d:0,t:0,u:new Set()};d.t++;d.u.add(e.email);if(e.type==='search')d.s++;else if(e.type==='view_error')d.v++;else if(e.type==='smart_analyze')d.a++;else if(e.type==='clara')d.c++;else if(e.type==='download')d.d++;});
  const dayRows=Object.keys(dayMap).sort().map(k=>{const d=dayMap[k];return [k,d.u.size,d.s,d.v,d.a,d.c,d.d,d.t];});
  const sheetDay=tableSheet('Harian','AKTIVITAS HARIAN',['Tanggal','FSE Aktif','Pencarian','Detail Dibuka','Smart Analyzer','Tanya Clara','Download','Total'],[100,80,80,90,95,85,80,80],dayRows);

  // ================= SHEET 10: LOG DETAIL =================
  const TYPE={search:'Pencarian',view_error:'Buka Detail Error',smart_analyze:'Smart Analyzer',clara:'Tanya Clara',download:'Download'};
  const logs=ev.slice().sort((a,b)=>{const x=tsOf(a),y=tsOf(b);return (x?x.getTime():0)-(y?y.getTime():0);});
  const logRows=logs.map(e=>[fmt(tsOf(e))||e.day,e.email||'-',TYPE[e.type]||e.type,BR(e.brand),e.module||'',e.query||'',e.type==='view_error'?(usageProbMod(e).s||''):'',typeof e.results==='number'?e.results:'',(USAGE_CAT[e.category]||e.category||''),e.bank||'',e.fileTitle||'',e.mode||'']);
  const sheetLog=tableSheet('Log Detail','LOG DETAIL AKTIVITAS',['Waktu (WIB)','Email FSE','Jenis Aktivitas','Merek / Menu','Modul','Kata Kunci / Kode','Modul Bermasalah','Jml Hasil','Kategori','Bank','Nama File','Mode'],[125,200,110,95,90,140,110,60,110,70,200,80],logRows);
  const escRows=(typeof usageEscalations!=='undefined'?usageEscalations:[]).slice().sort((a,b)=>{const x=tsOf(a),y=tsOf(b);return (x?x.getTime():0)-(y?y.getTime():0);}).map(e=>[fmt(tsOf(e))||e.day||'',e.email||'-',e.ticket||'',e.name||'',e.area||'',e.machineId||'',e.bank||'',e.location||'',e.brand||e.machine||'',e.type||'',e.errorCode||'',e.tsName||'']);
  const sheetEsc=tableSheet('Eskalasi TS','ESKALASI KE TECHNICAL SUPPORT',['Waktu (WIB)','Email FSE','Nomor Tiket','Nama','Area Kerja','ID Mesin','Customer Bank','Lokasi','Brand Mesin','Tipe Mesin','Kode Error','TS Dipilih'],[125,180,130,120,100,90,110,200,90,90,100,130],escRows,'Data eskalasi hanya berisi data wajib (Nomor Tiket sampai Kode Error) dan TS yang dipilih, tersimpan 14 hari.');


  const styles=`<Styles>
<Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10"/></Style>
<Style ss:ID="Org"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0D47A1"/></Style>
<Style ss:ID="Title"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0D47A1" ss:Pattern="Solid"/></Style>
<Style ss:ID="Sub"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#4A5680"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0D47A1"/></Borders></Style>
<Style ss:ID="Sec"><Alignment ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0D47A1"/><Interior ss:Color="#E8EEFF" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1565C0"/></Borders></Style>
<Style ss:ID="Hdr"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1565C0" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
<Style ss:ID="Cell"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9AA7C7"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9AA7C7"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9AA7C7"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9AA7C7"/></Borders></Style>
<Style ss:ID="Num" ss:Parent="Cell"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.##"/></Style>
<Style ss:ID="Ctr" ss:Parent="Cell"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
<Style ss:ID="Lbl" ss:Parent="Cell"><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#F0F4FF" ss:Pattern="Solid"/></Style>
<Style ss:ID="Val" ss:Parent="Cell"/>
<Style ss:ID="Wrap"><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
<Style ss:ID="Note"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="9" ss:Italic="1" ss:Color="#4A5680"/></Style>
<Style ss:ID="SigH"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
<Style ss:ID="SigB"><Borders><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
<Style ss:ID="SigN"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Borders><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
<Style ss:ID="SigT"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="9" ss:Color="#4A5680"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
</Styles>`;
  const workbook=`<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>${esc(USAGE_DOC_TITLE)}</Title><Author>${esc(me)}</Author><Company>${esc(USAGE_ORG)}</Company><Subject>${esc(docNo)}</Subject></DocumentProperties>${styles}${[sheetSummary,sheetFse,sheetCodes,sheetMod,sheetKw,sheetNf,sheetClaraFse,sheetClaraQ,sheetClaraDay,sheetSmart,sheetDlCat,sheetDlFile,sheetDay,sheetEsc,sheetLog].join('')}</Workbook>`;
  const blob=new Blob(['﻿',workbook],{type:'application/vnd.ms-excel;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`Laporan-Penggunaan-TS_${from}_sd_${to}.xls`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function usageExportCsv(){
  const ev=usageFiltered();
  const cols=['day','email','type','brand','module','query','results','category','bank','fileTitle','mode'];
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const lines=[cols.join(',')].concat(ev.map(e=>cols.map(c=>q(e[c])).join(',')));
  const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`Laporan-Penggunaan-${document.getElementById('usageFrom').value}_${document.getElementById('usageTo').value}.csv`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
var admTabNow='portal';
function admApplyTabVisibility(tab){
  const content=document.getElementById('adminPanelContent');
  if(!content)return;
  Array.from(content.children).forEach(section=>{
    if(section.id==='adminPanelTabs')return;
    const isPortal=section.id==='portalAdminSection', isUsage=section.id==='usageReportSection', isAi=section.id==='adminAiSection';
    const show = tab==='portal'?isPortal : tab==='usage'?isUsage : tab==='ai'?isAi : (!isPortal&&!isUsage&&!isAi);
    if(!show)section.style.display='none';
    else if(tab!=='errors')section.style.display='';
  });
}
function setAdminPanelTab(tab){
  admTabNow=tab;
  const content=document.getElementById('adminPanelContent');
  Array.from(content.children).forEach(section=>{
    if(section.id==='adminPanelTabs')return;
    const isPortal=section.id==='portalAdminSection', isUsage=section.id==='usageReportSection', isAi=section.id==='adminAiSection';
    const show = tab==='portal'?isPortal : tab==='usage'?isUsage : tab==='ai'?isAi : (!isPortal&&!isUsage&&!isAi);
    section.style.display=show?'':'none';
  });
  document.querySelectorAll('#adminPanelTabs .admin-section-tab').forEach((button,index)=>button.classList.toggle('active',(tab==='portal'&&index===0)||(tab==='errors'&&index===1)||(tab==='usage'&&index===2)||(tab==='ai'&&index===3)));
  if(tab==='ai'){try{loadAdminAiSettings();}catch(e){}}
  if(tab==='errors'){try{adminBrand(nwBrand);}catch(e){}}
  if(tab==='usage'&&!document.getElementById('usageFrom').value) usageSetRange(7,true);
}
function openAdminPanel(){document.getElementById('adminPanelOvl').style.display='flex';setAdminPanelTab('portal');try{adminBrand('hyosung');}catch(e){}if(currentIsAdmin)renderPortalAdminFiles();}
function closeAdminPanel(){document.getElementById('adminPanelOvl').style.display='none';}

function setAdminMod(m,btn){
  adminMod=m;
  document.querySelectorAll('.admin-mod-btn').forEach(b=>b.classList.remove('admin-mod-active'));
  btn.classList.add('admin-mod-active');
  if(adminMode==='edit') adminSearchEdit();
}

function setAdminMode(m,btn){
  adminMode=m;
  document.getElementById('adminFormAdd').style.display=m==='add'?'block':'none';
  document.getElementById('adminFormEdit').style.display=m==='edit'?'block':'none';
  document.getElementById('adminModeAdd').style.background=m==='add'?'#1565C0':'#F0F4FF';
  document.getElementById('adminModeAdd').style.color=m==='add'?'#fff':'#4A5680';
  document.getElementById('adminModeEdit').style.background=m==='edit'?'#1565C0':'#F0F4FF';
  document.getElementById('adminModeEdit').style.color=m==='edit'?'#fff':'#4A5680';
  if(m==='edit') adminSearchEdit();
}

function adminAddRecord(){
  const k=document.getElementById('af_k').value.trim();
  const m=document.getElementById('af_m').value.trim();
  const d=document.getElementById('af_d').value.trim();
  const p=document.getElementById('af_p').value.trim();
  const t=document.getElementById('af_t').value.trim();
  const s=document.querySelector('input[name="af_s"]:checked').value;
  const msgEl=document.getElementById('adminAddMsg');
  if(!k||!m||!d){
    msgEl.style.display='block';msgEl.style.background='#FFEBEE';msgEl.style.color='#D32F2F';
    msgEl.textContent='Kode Error, Sub-Modul, dan Deskripsi wajib diisi.';return;
  }
  if(DB[adminMod].find(r=>r.k===k)){
    msgEl.style.display='block';msgEl.style.background='#FFF8E1';msgEl.style.color='#E65100';
    msgEl.textContent='Kode Error sudah ada di database!';return;
  }
  DB[adminMod].unshift({k,m,d,p,t,s});
  msgEl.style.display='block';msgEl.style.background='#E6F7ED';msgEl.style.color='#1B7F3A';
  msgEl.textContent='Record berhasil ditambahkan! Kode: '+k;
  ['af_k','af_m','af_d','af_p','af_t'].forEach(id=>document.getElementById(id).value='');
  document.querySelector('input[name="af_s"][value="\u26a0\ufe0f WARNING"]').checked=true;
  if(mod===adminMod) doFilter();
  updateStats();
  if(window.__fb){
    window.__fb.setDoc(window.__fb.docRef(adminMod,k), {k,m,d,p,t,s}).catch(e=>{
      console.warn('Gagal sync ke Firestore:',e);
      msgEl.textContent='Record ditambahkan lokal, tapi gagal sync ke Firestore (cek koneksi).';
      msgEl.style.background='#FFF8E1';msgEl.style.color='#E65100';
    });
  }
}

function adminSearchEdit(){
  var q=(document.getElementById('ae_search').value||'').trim().toLowerCase();
  var data=DB[adminMod];
  var container=document.getElementById('ae_results');
  if(!data||data.length===0){
    container.innerHTML='<div style="padding:20px;text-align:center;color:#8A96B8;font-size:13px">Tidak ada data di modul ini.</div>';
    return;
  }
  var filtered=[];
  if(q===''){
    filtered=data.slice(0,50);
  } else {
    for(var i=0;i<data.length;i++){
      var r=data[i];
      if(r.k.toLowerCase().indexOf(q)>=0||r.d.toLowerCase().indexOf(q)>=0||r.m.toLowerCase().indexOf(q)>=0||(r.p&&r.p.toLowerCase().indexOf(q)>=0)){
        filtered.push(r);
        if(filtered.length>=50) break;
      }
    }
  }
  if(filtered.length===0){
    container.innerHTML='<div style="padding:20px;text-align:center;color:#8A96B8;font-size:13px">Tidak ditemukan. Coba kata kunci lain.</div>';
    return;
  }
  var html='';
  for(var j=0;j<filtered.length;j++){
    var r=filtered[j];
    var realIdx=data.indexOf(r);
    var sc=r.s.indexOf('WARNING')>=0?'#FFF0F0':r.s.indexOf('PERIKSA')>=0?'#FFF8F0':'#F0F8FF';
    var bc=r.s.indexOf('WARNING')>=0?'#D32F2F':r.s.indexOf('PERIKSA')>=0?'#E07B00':'#1565C0';
    html+='<div style="padding:12px 14px;border-bottom:1px solid #E8EEFF;display:flex;align-items:center;gap:12px">'
      +'<div style="flex:1;min-width:0">'
      +'<span style="font-family:monospace;font-weight:700;color:#1565C0;font-size:13px">'+r.k+'</span>'
      +'<span style="font-size:10px;padding:2px 8px;border-radius:10px;margin-left:8px;background:'+sc+';color:'+bc+';font-weight:700">'+r.s+'</span>'
      +'<div style="font-size:12px;color:#1A1F36;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+r.d+'</div>'
      +'<div style="font-size:10.5px;color:#8A96B8;margin-top:2px">'+r.m+'</div>'
      +'</div>'
      +'<button onclick="openEditRecord('+realIdx+')" style="flex-shrink:0;padding:7px 14px;background:#1565C0;color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer">Edit</button>'
      +'</div>';
  }
  if(filtered.length===50) html+='<div style="padding:10px;text-align:center;color:#8A96B8;font-size:11px">Menampilkan 50 hasil pertama.</div>';
  container.innerHTML=html;
}

function openEditRecord(idx){
  editIdx=idx;
  var r=DB[adminMod][idx];
  document.getElementById('er_k').value=r.k;
  document.getElementById('er_m').value=r.m;
  document.getElementById('er_d').value=r.d;
  document.getElementById('er_p').value=r.p||'';
  document.getElementById('er_t').value=r.t||'';
  var radios=document.querySelectorAll('input[name="er_s"]');
  radios.forEach(function(radio){if(radio.value===r.s)radio.checked=true;});
  document.getElementById('adminEditRecordOvl').style.display='flex';
}
function closeEditRecord(){document.getElementById('adminEditRecordOvl').style.display='none';}

function adminSaveEdit(){
  if(editIdx<0) return;
  const rec = DB[adminMod][editIdx];
  rec.m=document.getElementById('er_m').value.trim();
  rec.d=document.getElementById('er_d').value.trim();
  rec.p=document.getElementById('er_p').value.trim();
  rec.t=document.getElementById('er_t').value.trim();
  rec.s=document.querySelector('input[name="er_s"]:checked').value;
  closeEditRecord();adminSearchEdit();
  if(mod===adminMod) doFilter();
  updateStats();
  alert('Record berhasil diupdate!');
  if(window.__fb){
    window.__fb.setDoc(window.__fb.docRef(adminMod, rec.k), {k:rec.k,m:rec.m,d:rec.d,p:rec.p,t:rec.t,s:rec.s}).catch(e=>{
      console.warn('Gagal sync ke Firestore:',e);
    });
  }
}

function adminDeleteRecord(){
  if(editIdx<0) return;
  var r=DB[adminMod][editIdx];
  if(!confirm('Hapus record kode '+r.k+'?\nTindakan ini tidak bisa dibatalkan.')) return;
  var deletedKey = r.k;
  var deletedMod = adminMod;
  DB[adminMod].splice(editIdx,1);
  closeEditRecord();adminSearchEdit();
  if(mod===adminMod) doFilter();
  updateStats();
  if(window.__fb){
    window.__fb.setDoc(window.__fb.docRef(deletedMod, deletedKey), {k:deletedKey, _deleted:true}).catch(e=>{
      console.warn('Gagal sync hapus ke Firestore:',e);
    });
  }
}
