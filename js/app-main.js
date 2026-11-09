
// ============== EMBEDDED DATA ==============

// ==========================================

const PG = 50;
let mod = 'brm860';
let filtered = [];
let pg = 1;
let filt = 'all';
let q = '';
let timer = null;
let selectedCodes = new Set(); // tracks selected error codes (row.k) across pages/filters

function sev(s){
  if(!s) return 'gray';
  const l=s.toLowerCase();
  if(l.includes('ganti')||l.includes('warning')) return 'red';
  if(l.includes('periksa')) return 'amber';
  return 'gray';
}


/* ===== Hyosung: satu ruang kerja, 3 tab (Cari Kode / Decoder / Analisa Foto AI) ===== */
let hyoTab='search';
function hyoSetTab(t){hyoTab=t;hyoApply();try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}}
function hyoMesinLabel(){const ms=document.getElementById('modSelect');return ms&&ms.selectedOptions[0]?ms.selectedOptions[0].textContent:'';}
function hyoSyncAll(){
  try{
    const c=document.getElementById('hyoCtxMesin');if(c)c.textContent=hyoMesinLabel();
    const sm=document.getElementById('smartModule');
    if(sm)sm.value=(mod==='brm860'||mod==='brm50')?mod:'other';
    const map={brm860:'decBrm860Btn',brm50:'decBrm50Btn',cdu30:'decCdu30Btn'};
    const sw=document.querySelector('#hyosungAppRoot .dec-modsw');
    if(map[mod]){const b=document.getElementById(map[mod]);if(b&&typeof setDecMod==='function')setDecMod(mod,b);if(sw)sw.classList.add('hyo-lock');}
    else if(sw)sw.classList.remove('hyo-lock');
  }catch(e){}
}
function hyoApply(){
  const root=document.getElementById('hyosungAppRoot'),sm=document.getElementById('smartAnalyzerContainer'),bar=document.getElementById('moduleTabBar');
  if(!root||!sm||!bar)return;
  const hy=bar.style.display!=='none';
  root.classList.toggle('hyo-t-search',hyoTab==='search');
  root.classList.toggle('hyo-t-decoder',hyoTab==='decoder');
  root.style.display=(hy&&hyoTab!=='smart')?'':'none';
  sm.style.display=(hy&&hyoTab==='smart')?'block':'none';
  document.querySelectorAll('.hyo-tab').forEach(b=>{const on=b.dataset.ht===hyoTab;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');});
  hyoSyncAll();
}
function showSmartAnalyzer(){hyoSetTab('smart');}
(function(){
  const srow=document.querySelector('#hyosungAppRoot .srow');
  if(srow)srow.insertAdjacentHTML('afterend','<div class="hyo-xl"><span>Tidak paham format kodenya?</span><button type="button" onclick="hyoSetTab(\'decoder\')">Bedah di Decoder</button><span>Punya foto print history?</span><button type="button" onclick="hyoSetTab(\'smart\')">Analisa dengan foto</button></div>');
  const sc=document.querySelector('#smartAnalyzerContainer .hyo-ctx');
  if(sc)sc.insertAdjacentHTML('afterend','<div class="hyo-xl" style="margin-top:0"><span>Sudah tahu kodenya?</span><button type="button" onclick="hyoSetTab(\'search\')">Cari artinya di database</button><button type="button" onclick="hyoSetTab(\'decoder\')">Bedah di Decoder</button></div>');
  const dw=document.querySelector('#decBody');
  if(dw)dw.insertAdjacentHTML('beforeend','<div class="hyo-xl"><span>Sudah tahu kodenya?</span><button type="button" onclick="hyoSetTab(\'search\')">Cari di database</button><span>Punya foto?</span><button type="button" onclick="hyoSetTab(\'smart\')">Analisa dengan foto</button></div>');
  hyoApply();
})();
function modSelChange(v){
  const map={brm860:'tab860',brm50:'tab50',cdu10:'tabCdu10',cdu30:'tabCdu30',cdu800:'tabCdu800',extra:'tabExtra'};
  const b=document.getElementById(map[v]);
  if(b) switchMod(v,b);
}
function switchMod(m, btn){
  mod = m; pg = 1; filt = 'all'; q = ''; subModFilter='all';
  { const ms=document.getElementById('modSelect'); if(ms&&ms.value!==m) ms.value=m; }
  try{hyoSyncAll();}catch(e){}
  selectedCodes.clear(); updateSelBar();
  document.querySelectorAll('[id^="fsub-"]').forEach(b=>b.className='fbtn');
  const allBtn=document.getElementById('fsub-all'); if(allBtn)allBtn.className='fbtn fsub-active';
  document.getElementById('srch').value = '';
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  resetFbtns();
  document.getElementById('fa').classList.add('fa');
  updateStats();
  doFilter();
}

let subModFilter = 'all';

function updateStats(){
  document.getElementById('submodFgrp').style.display = (mod==='extra')?'flex':'none';
}

function getActiveData(){
  if(mod==='extra'){
    if(subModFilter==='all') return DB.extra||[];
    return (DB.extra||[]).filter(r=>r.m===subModFilter);
  }
  return DB[mod]||[];
}

function setSubMod(sm){
  subModFilter = sm;
  document.querySelectorAll('[id^="fsub-"]').forEach(b=>{
    b.classList.remove('fsub-active');
    b.className=b.className.replace(' fa','').replace(' fsub-active','').trim();
  });
  const idMap={'all':'fsub-all','Anti-Skimming':'fsub-anti','Camera':'fsub-cam',
    'Card Reader':'fsub-card','EPP':'fsub-epp','Finger Scanner':'fsub-fp',
    'NFC / RF Reader':'fsub-nfc','PNC':'fsub-pnc','Receipt Printer':'fsub-spr','Shutter':'fsub-sht'};
  const el = document.getElementById(idMap[sm]);
  if(el) el.className='fbtn fsub-active';
  pg=1; doFilter();
}

function onSrch(){
  clearTimeout(timer);
  timer = setTimeout(()=>{ q=document.getElementById('srch').value.toLowerCase().trim(); pg=1; doFilter(); }, 200);
}

function setF(f){
  filt=f; pg=1; resetFbtns();
  const idMap={'all':'fa','red':'fr','amber':'fam','gray':'fg'};
  const btnId = idMap[f];
  document.getElementById(btnId).classList.add(btnId);
  doFilter();
}

function resetFbtns(){
  ['fa','fr','fam','fg'].forEach(id=>{
    const el=document.getElementById(id);
    el.className='fbtn';
  });
}

function hl(txt, q){
  if(!txt) return '';
  const s = txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if(!q) return s;
  return s.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');
}

function cduWild(k,q){try{k=String(k||'');q=String(q||'');if(k.indexOf('x')<0||q.length!==k.length)return false;const u=q.toUpperCase();for(let i=0;i<k.length;i++){if(k[i]==='x')continue;if(k[i].toUpperCase()!==u[i])return false;}return true;}catch(e){return false;}}
function doFilter(){
  const data = getActiveData();
  const hasQuery = q.length > 0;
  ['searchStatusFilters','submodFgrp','searchMeta','selBar','searchTable','pgn'].forEach(id=>{
    document.getElementById(id)?.classList.toggle('search-results-hidden',!hasQuery);
  });
  filtered = data.filter(row=>{
    const sv = sev(row.s);
    if(filt!=='all' && sv!==filt) return false;
    if(q){
      return (row.k||'').toLowerCase().includes(q)||cduWild(row.k,q)||
             (row.m||'').toLowerCase().includes(q)||subLabel(row).toLowerCase().includes(q)||
             (row.d||'').toLowerCase().includes(q)||
             (row.p||'').toLowerCase().includes(q)||
             (row.t||'').toLowerCase().includes(q);
    }
    return true;
  });
  renderTbl();
  renderPgn();
  document.getElementById('rcnt').innerHTML =
    `Menampilkan <b>${filtered.length.toLocaleString('id')}</b> dari <b>${data.length.toLocaleString('id')}</b> kode error`;
}

function subLabel(row){
  try{
    const mp = mod==='brm860'?MODULE_MAP_860:mod==='brm50'?MODULE_MAP_50:mod==='cdu30'?MODULE_MAP_CDU30:(mod==='cdu10'||mod==='cdu800')?MODULE_MAP_CDU10:null;
    if(mp){ const v=mp[String(row.k||'').charAt(2).toUpperCase()]; if(v) return v.replace(/\s*\(.*$/,''); }
  }catch(e){}
  return row.m||'';
}
function renderTbl(){
  const tbody = document.getElementById('tbody');
  const start=(pg-1)*PG;
  const page=filtered.slice(start,start+PG);
  if(!page.length){
    tbody.innerHTML='<tr><td colspan="7"><div class="ebox"><span class="eico">🔍</span><div class="etxt">Tidak ada kode error yang cocok</div><div class="esub">Coba kata kunci atau filter lain</div></div></td></tr>';
    syncHeadChk();
    return;
  }
  tbody.innerHTML=page.map((row,i)=>{
    const sv=sev(row.s);
    const bc=sv==='red'?'br':sv==='amber'?'ba':'bg';
    const bl=sv==='red'?'WARNING':sv==='amber'?'Periksa':'Software';
    let act=(row.t||'').replace(/\\n/g,'\n').split('\n')[0];
    act = act.replace(/^\s*\d+[\.\)]\s*/, ''); // remove leading "1." numbering for cleaner preview
    if(act.length>110) act = act.substring(0,110).trimEnd() + '…';
    const checked = selectedCodes.has(row.k) ? 'checked' : '';
    const rowCls = selectedCodes.has(row.k) ? 'row-selected' : '';
    return `<tr class="${rowCls}" onclick="openMdl(${start+i})">
      <td class="chk-cell" onclick="event.stopPropagation()"><input type="checkbox" class="row-chk" ${checked} onchange="toggleRowSelect('${row.k.replace(/'/g,"\\'")}', this)"></td>
      <td class="kode">${hl(row.k,q)}${refBadge(row)}</td>
      <td class="sub">${hl(subLabel(row),q)}</td>
      <td class="dsc">${hl(row.d,q)}</td>
      <td class="cse">${hl((row.p||'').substring(0,130),q)}</td>
      <td class="act">${hl(act,q)}</td>
      <td><span class="badge ${bc}">${bl}</span></td>
    </tr>`;
  }).join('');
  syncHeadChk();
}

// ============================================================
// SELECTION (for multi-select PDF export)
// ============================================================
function toggleRowSelect(code, checkboxEl){
  if(checkboxEl.checked){ selectedCodes.add(code); }
  else { selectedCodes.delete(code); }
  const tr = checkboxEl.closest('tr');
  if(tr) tr.classList.toggle('row-selected', checkboxEl.checked);
  syncHeadChk();
  updateSelBar();
}

function toggleSelectAllVisible(headEl){
  const start=(pg-1)*PG;
  const page=filtered.slice(start,start+PG);
  page.forEach(row=>{
    if(headEl.checked) selectedCodes.add(row.k);
    else selectedCodes.delete(row.k);
  });
  renderTbl();
  updateSelBar();
}

function syncHeadChk(){
  const headEl = document.getElementById('headChk');
  if(!headEl) return;
  const start=(pg-1)*PG;
  const page=filtered.slice(start,start+PG);
  if(!page.length){ headEl.checked=false; headEl.indeterminate=false; return; }
  const selCount = page.filter(row=>selectedCodes.has(row.k)).length;
  headEl.checked = selCount===page.length;
  headEl.indeterminate = selCount>0 && selCount<page.length;
}

function updateSelBar(){
  const bar = document.getElementById('selBar');
  const cnt = selectedCodes.size;
  document.getElementById('selCount').textContent = cnt.toLocaleString('id');
  bar.classList.toggle('show', cnt>0);
  const exportSelBtn = document.getElementById('exportSelectedBtn');
  const exportSelCount = document.getElementById('exportSelectedCount');
  if(exportSelBtn){
    exportSelBtn.disabled = cnt===0;
    exportSelCount.textContent = cnt>0 ? `${cnt.toLocaleString('id')} kode dipilih` : 'Belum ada kode dipilih';
  }
}

function clearSelection(){
  selectedCodes.clear();
  renderTbl();
  updateSelBar();
}

function toggleExportMenu(){
  const menu = document.getElementById('exportMenu');
  const isOpen = menu.classList.toggle('open');
  if(isOpen){
    const allLbl = document.getElementById('exportAllLabel');
    if(allLbl) allLbl.textContent = `Seluruh data modul ini (${getActiveData().length.toLocaleString('id')} kode)`;
    document.addEventListener('click', closeExportMenuOnClickOutside);
  }
}

function closeExportMenuOnClickOutside(e){
  const wrap = document.querySelector('.export-wrap');
  if(wrap && !wrap.contains(e.target)){
    document.getElementById('exportMenu').classList.remove('open');
    document.removeEventListener('click', closeExportMenuOnClickOutside);
  }
}

function renderPgn(){
  const total=Math.ceil(filtered.length/PG);
  const el=document.getElementById('pgn');
  if(total<=1){el.innerHTML='';return;}
  let h=`<button class="pbtn" onclick="goPg(${pg-1})" ${pg===1?'disabled':''}>‹ Prev</button>`;
  let s=Math.max(1,pg-3),e=Math.min(total,s+6);
  if(e-s<6)s=Math.max(1,e-6);
  if(s>1)h+=`<button class="pbtn" onclick="goPg(1)">1</button><span class="pinf">…</span>`;
  for(let i=s;i<=e;i++)h+=`<button class="pbtn ${i===pg?'cur':''}" onclick="goPg(${i})">${i}</button>`;
  if(e<total)h+=`<span class="pinf">…</span><button class="pbtn" onclick="goPg(${total})">${total}</button>`;
  h+=`<button class="pbtn" onclick="goPg(${pg+1})" ${pg===total?'disabled':''}>Next ›</button>`;
  h+=`<span class="pinf">Hal ${pg}/${total} | ${filtered.length.toLocaleString('id')} hasil</span>`;
  el.innerHTML=h;
}

function goPg(p){
  const total=Math.ceil(filtered.length/PG);
  if(p<1||p>total)return;
  pg=p;renderTbl();renderPgn();
  document.querySelector('.twrap').scrollIntoView({behavior:'smooth',block:'start'});
}

function openMdl(idx){
  const row=filtered[idx];
  if(!row)return;
  usageLog({type:'view_error',brand:'hyosung',module:mod,query:String(row.k||'').toUpperCase()});
  const sv=sev(row.s);
  const bc=sv==='red'?'br':sv==='amber'?'ba':'bg';
  const bl=sv==='red'?'🔴 WARNING':sv==='amber'?'🟡 PERIKSA / PERBAIKI':'⚪ SOFTWARE / RESTART';
  document.getElementById('mCode').textContent=row.k||'—';
  document.getElementById('mMod').textContent=(mod==='brm860'?'BRM 860':mod==='brm50'?'BRM 50':mod==='cdu10'?'CDU 10':mod==='cdu30'?'CDU 30':mod==='cdu800'?'CDU 800':row.m||'Modul Lainnya')+' — '+(row.m||'');
  document.getElementById('mBdg').innerHTML=`<span class="badge ${bc}" style="font-size:12px;padding:5px 14px">${bl}</span>`;
  document.getElementById('mDsc').textContent=row.d||'—';
  document.getElementById('mCse').textContent=row.p||'—';

  const raw=(row.t||'').replace(/\\n/g,'\n');
  const lines=raw.split(/\n|(?<![A-Za-z0-9])(?=\d{1,2}\.\s)/).map(s=>s.trim()).filter(Boolean);
  const ul=document.getElementById('mSteps');
  ul.innerHTML=lines.map((line,i)=>{
    const isArr=line.startsWith('→')||line.startsWith('->');
    const txt=isArr?line.replace(/^→\s*|^->\s*/,''):line.replace(/^\d+\.\s*/,'');
    return `<li class="${isArr?'arr':''}" data-n="${isArr?'':i+1}">${txt}</li>`;
  }).join('');

  try{refRender(row,mod);}catch(e){}
  document.getElementById('ovl').classList.add('open');
  document.body.style.overflow='hidden';
}


/* ===== REFERENSI GAMBAR (khusus BRM860) =====
   Gambar tertanam di #refImgData (dimuat sekali saat dibutuhkan). Pola kode: 5 karakter pertama, '?' = karakter apa saja.
   Halaman "Membongkar modul CSM" sengaja tidak dimasukkan. */
const REF_GROUPS=[
  {pats:['5?6T7'],imgs:[
    {i:0,t:'5X6T7 – Penyebab dan titik pengecekan P-Rolr',d:'Gerakan Front Plate (FP) CSM gagal. Cek rakitan inti (core) dan karet P-Rolr: bandingkan kondisi OK dan NG.'},
    {i:1,t:'5X6T7 – P-Rolr menyentuh sensor dan FP macet',d:'Buka shutter, periksa celah antara P-Rolr-Assy dan sensor, serta apakah FP macet di posisi separasi.'},
    {i:2,t:'5X6T7 – Cara mengatasi',d:'Perbaiki karet P-Rolr yang menonjol dan interferensi P-Rolr-Assy dengan sensor; ada langkah bongkar cover dan FP-motor.'}]},
  {pats:['5?7?1','537GF','5DRL1'],imgs:[
    {i:3,t:'5X7X1 / 537GF / 5DRL1 – Penyebab dan cara mengeluarkan uang',d:'Uang tertinggal di sensor pintu masuk TE (GS701) atau RJE (GSR01); 537GF = error encoder TE. Keluarkan uang dengan knob.'},
    {i:9,t:'Membongkar scraper TE (1)',d:'Bongkar braket dan pegas pada scraper assy (urutan sekrup, kabel, washer, braket). Hati-hati jangan sampai hilang.'},
    {i:10,t:'Membongkar scraper TE (2)',d:'Pindahkan pin ke tengah guide, tekan scraper keluar dari guide, lalu bongkar scraper lain pada langkah 2 sampai 4.'},
    {i:11,t:'Meluruskan tape TE (1)',d:'Periksa posisi tape pada drum, buat loop tape, lalu luruskan terhadap tonjolan.'},
    {i:12,t:'Meluruskan tape TE (2) dan ringkasan',d:'Putar knob sesuai arah, hilangkan loop tape; ringkasan 4 tahap penyelarasan tape.'}]},
  {pats:['5?7?1','5?0?E','5A002'],imgs:[
    {i:8,t:'5X7X1 / 5X0XE / 5A002 – Lock modul TERJE abnormal',d:'Status lock modul TERJE tidak normal. Atur posisi normal dengan penyetelan PL Lock (putar searah panah merah).'}]},
  {pats:['5301M','5A01M'],imgs:[
    {i:7,t:'5301M / 5A01M – MID tidak tertutup sempurna',d:'Sensor GSA01 dark jam. Tutup MID dengan PL-Lock dan pastikan tidak ada celah (0,0 mm).'}]},
  {pats:['5301A','5300A'],imgs:[
    {i:14,t:'5301A / 5300A – Dark jam sensor GS021 (BMD bergoyang)',d:'Dark jam saat penyimpanan setoran. Periksa apakah BMD bergoyang dan celah tuas kunci BMD dengan Lock Pin BRKT harus 0 mm; bila tidak, atur BRKT F/R lalu kencangkan baut.'}]},
  {pats:['5?6B4'],imgs:[
    {i:15,t:'5X6B4 – Kegagalan pemisahan uang CSM (uang miring)',d:'Tidak ada celah antara sensor dan karet roller akibat rakitan karet, atau pin konektor modul CSM terlipat/terlepas. Dorong front plate dan karet sesuai gambar; bila pin konektor rusak atau masalah berlanjut, ganti modul CSM.'}]},
  {pats:['5?R13'],imgs:[
    {i:16,t:'5XR13 – Dark jam pintu masuk RJE (GSR01/R02)',d:'Buka modul TE/RJE dengan tuas kunci, keluarkan uang dengan memutar knob, lalu tutup dan tekan tombol 3 kali. Bila belum pulih, lepas cover dan periksa pita kusut (ganti modul TE/RJE bila kusut).'}]},
  {pats:['5?RG2'],imgs:[
    {i:17,t:'5XRG2 – Error penggerak pemisahan GMR01 RJE',d:'Lepas cover dengan mengendurkan baut, periksa konektor terpasang benar (CN6, CN20, CN21), putar knob untuk memastikan motor lancar, lalu tekan tombol 3 kali bila uang tergulung baik di drum.'}]},
  {pats:['53064'],imgs:[
    {i:13,t:'53064 – Celah Bottom_Guide dan 2waygate pada UTC',d:'Error jalur UTC saat hitung deposit. Tambah polywasher 0,5T; bila belum sesuai, potong 0,5 mm Bottom_Guide di 4 titik.'}]}
];
let _refData=null;
function refData(){if(_refData)return _refData;_refData=window.REF_IMG_DATA||{};return _refData;}
function refMatch(pat,code){if(code.length<pat.length)return false;for(let k=0;k<pat.length;k++){if(pat[k]!=='?'&&pat[k]!==code[k])return false;}return true;}
function refImagesFor(code,module){
  if(module!=='brm860')return [];
  const c=String(code||'').toUpperCase().replace(/[^A-Z0-9@]/g,'');if(c.length<5)return [];
  const seen={},out=[];
  REF_GROUPS.forEach(g=>{if(g.pats.some(p=>refMatch(p.toUpperCase(),c)))g.imgs.forEach(im=>{if(!seen[im.i]){seen[im.i]=1;out.push(im);}});});
  return out;
}
function refBadge(row){
  try{const n=refImagesFor(row&&row.k,mod).length;return n?'<span class="refb" title="Punya '+n+' foto referensi (klik baris untuk melihat)">📷 '+n+'</span>':'';}catch(e){return '';}
}
function refRender(row,module){
  /* penanda di header detail */
  try{
    const m=document.getElementById('mMod');let h=document.getElementById('mRefHint');
    if(m&&!h){h=document.createElement('div');h.id='mRefHint';m.parentNode.appendChild(h);}
    const n=refImagesFor(row&&row.k,module).length;
    if(h){h.style.display=n?'inline-flex':'none';h.textContent=n?'📷 '+n+' foto referensi di bawah':'';}
  }catch(e){}
  const sec=document.getElementById('mRefSec'),grid=document.getElementById('mRefGrid');if(!sec||!grid)return;
  const list=refImagesFor(row&&row.k,module);
  if(!list.length){sec.style.display='none';grid.innerHTML='';return;}
  const data=refData();
  window.__refList=list;
  document.getElementById('mRefLbl').textContent='Referensi Gambar ('+list.length+')';
  grid.innerHTML=list.map((im,n)=>data[im.i]?'<div class="refc" onclick="refOpenLb('+n+')"><img loading="lazy" alt="'+im.t.replace(/"/g,'&quot;')+'" src="'+data[im.i]+'"><div class="rt">'+im.t+'</div><div class="rd">'+im.d+'</div></div>':'').join('');
  sec.style.display='';
}
function refOpenLb(n){
  const im=(window.__refList||[])[n],data=refData();if(!im||!data[im.i])return;
  const lb=document.getElementById('refLb'),img=document.getElementById('refLbImg');
  img.classList.remove('z');img.src=data[im.i];img.alt=im.t;
  document.getElementById('refLbT').textContent=im.t;
  lb.classList.add('open');lb.scrollTop=0;
}
function refZoom(){const i=document.getElementById('refLbImg');if(i)i.classList.toggle('z');}
function refCloseLb(){const lb=document.getElementById('refLb');if(lb)lb.classList.remove('open');}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){const lb=document.getElementById('refLb');if(lb&&lb.classList.contains('open')){refCloseLb();e.stopPropagation();}}},true);

function closeMdl(){
  document.getElementById('ovl').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMdl();});


// ============================================================
// DECODER — Cara Membaca Kode Error (berdasarkan diagram UGarta)
// ============================================================
let decMod = 'brm860';

function toggleDecoder(){
  const body = document.getElementById('decBody');
  const hdr  = document.getElementById('decHdr');
  const btn  = document.getElementById('decToggleBtn');
  const open = body.classList.toggle('open');
  hdr.classList.toggle('open', open);
  btn.textContent = open ? '▲ Tutup' : '▼ Buka';
}

function setDecMod(m, btn){
  decMod = m;
  document.querySelectorAll('.dec-modsw button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const d5Label = document.getElementById('d5Label');
  if(d5Label){
    d5Label.textContent = m==='cdu30' ? 'No. Detail Error' : 'No Sensor/Motor';
  }
  clearDecoder();
}

function onDigit(el, nextId){
  el.value = el.value.toUpperCase().slice(-1);
  el.classList.toggle('filled', el.value !== '');
  if(el.value && nextId){
    document.getElementById(nextId).focus();
  }
}

function clearDecoder(){
  ['d1','d2','d3','d4','d5','d6','d7'].forEach(id=>{
    const el = document.getElementById(id);
    el.value=''; el.classList.remove('filled');
  });
  document.getElementById('decResult').className = 'dec-result';
  document.getElementById('decResult').innerHTML = '';
  document.getElementById('decSearchRow').style.display='none';
  document.getElementById('d1').focus();
}

// ============================================================
// LOOKUP TABLES (dari diagram PDF UGarta & manual Hyosung)
// ============================================================
const UNIT_MAP = {
  '1':'JPR — Journal Printer',
  '2':'SPR — Receipt Printer (Pencetak Struk)',
  '3':'MCU — Card Reader (Pembaca Kartu)',
  '4':'CDU — Dispenser ATM (CDU10 MX7800I)',
  '5':'BRM — Bill Recycling Module (CRM)',
  'I':'CCIM — Cash Collection & Deposit Module (CDM)',
};

const COMMAND_MAP = {
  '1':'Deposit Ready — Siap menerima deposit',
  '2':'Deposit Count — Menghitung uang deposit',
  '3':'Deposit Stack — Menumpuk uang deposit ke kaset (proses deposit berlangsung)',
  '4':'Deposit Cancel — Pembatalan deposit',
  '5':'Unknown',
  '6':'Withdraw Ready — Siap melakukan withdraw',
  '7':'Withdrawal — Proses penarikan uang',
  '8':'Cash Present — Uang sudah tersedia di slot',
  '9':'Preparing Next Transaction — Menyiapkan transaksi berikutnya',
  'A':'CSM Retract — Penarikan kembali dari CSM',
  'B':'TSK Retract — Penarikan kembali dari TSK',
  'C':'Unknown',
  'D':'Initialize — Inisialisasi modul',
  'E':'Shutter Open — Shutter terbuka',
  'F':'Shutter Close — Shutter tertutup',
  'K':'Withdraw Reject — Penarikan ditolak',
  'Q':'Retract Total — Total penarikan kembali',
  'R':'Ready — Mode siap',
};

// BRM860 Module map (Third digit) — MX8600s 6L/YT
const MODULE_MAP_860 = {
  '0':'MID Transport — Jalur transport tengah (menghubungkan BMU-BMD)',
  '1':'RC11 — Recycle Cassette 1 (Kaset daur ulang 1)',
  '2':'RC21 — Recycle Cassette 2 (Kaset daur ulang 2)',
  '3':'RC31 — Recycle Cassette 3 (Kaset daur ulang 3)',
  '4':'RC41 — Recycle Cassette 4 (Kaset daur ulang 4)',
  '6':'CSM — Customer Service Module (Modul layanan pelanggan)',
  '7':'TE — Temporary Escrow (Penampung sementara jalur escrow)',
  '8':'BC — Bill Counter/Checker (Pemeriksa & penghitung uang)',
  'A':'Main Board — Papan kontrol utama BRM860',
  'B':'RBU — Recycle Bill Unit',
  'C':'RJC — Reject Cassette (Kaset reject/tolak)',
  'R':'RJE — Reject Escrow (Penampung sementara penolakan)',
};

// BRM50 Module map (Third digit) — MX8600s 710/YQ
const MODULE_MAP_50 = {
  '0':'FT/MID Transport — Jalur transport tengah (Front Transport / MID)',
  '1':'RC1 — Recycle Cassette 1 (Kaset daur ulang 1 / RCI)',
  '2':'RC2 — Recycle Cassette 2 (Kaset daur ulang 2)',
  '3':'RC3 — Recycle Cassette 3 (Kaset daur ulang 3)',
  '4':'RC4 — Recycle Cassette 4 (Kaset daur ulang 4)',
  '6':'CSM — Customer Service Module (Modul layanan pelanggan)',
  '7':'TSK — Temporary Stacker (Stacker sementara)',
  '8':'BC — Bill Checker (Pemeriksa uang / Bill Counter)',
  'A':'RJC — Reject/Journal Cassette',
  'B':'UTC — Upper Transport Cassette (Jalur transport atas)',
};

const ERROR_DESC_MAP = {
  '0':'Light Jam — Uang gagal mencapai posisi sensor berikutnya dalam waktu yang ditentukan (macet ringan)',
  '1':'Dark Jam — Uang gagal bergerak dari posisi sensor berikutnya dalam waktu (macet berat/total)',
  '2':'Remaining Note — Terdeteksi sisa uang di sensor (dari transaksi sebelumnya)',
  '3':'Auto Calibration Error — Sensor gagal kalibrasi otomatis',
  '4':'External Light Check Error — LED/lampu eksternal sensor bermasalah',
  '5':'Path Error on Transport Path — Uang tersangkut atau salah jalur akibat gate/solenoid abnormal',
  '6':'Path Error on Sensor (non-transport) — Error jalur pada sensor selain transport path',
  '7':'Note Disorder — Uang masuk tidak teratur / bertumpuk',
  'F':'Motor Step Out — Motor kehilangan langkah saat proses separasi/stacking uang',
  'L':'Light Check Error — Error pengecekan cahaya sensor',
  'S':'Undefined Command — Perintah tidak dikenal saat mode Ready',
  'B':'Miss-Pickup / Alignment Error — Gagal ambil uang atau posisi uang tidak tepat',
  'A':'CSM Separation Error — Error spesifik pada proses separasi CSM',
};

// Module diagrams
const DIAGRAM_860 = [
  {id:'R', label:'RJE', color:'#3A8EF5', desc:'Reject Escrow'},
  {id:'7', label:'TE', color:'#E67E22', desc:'Temporary Escrow'},
  {id:'8', label:'BC', color:'#1ABC9C', desc:'Bill Counter/Checker'},
  {id:'6', label:'CSM', color:'#9B59B6', desc:'Customer Service Module'},
  {id:'0', label:'MID', color:'#F5A623', desc:'MID Transport'},
  {id:'C', label:'RJC', color:'#D94040', desc:'Reject Cassette'},
  {id:'1', label:'RC11', color:'#2ECC71', desc:'Kaset RC1'},
  {id:'2', label:'RC21', color:'#2ECC71', desc:'Kaset RC2'},
  {id:'3', label:'RC31', color:'#2ECC71', desc:'Kaset RC3'},
  {id:'4', label:'RC41', color:'#2ECC71', desc:'Kaset RC4'},
  {id:'A', label:'MAIN', color:'#95A5A6', desc:'Main Board'},
  {id:'B', label:'RBU', color:'#95A5A6', desc:'Recycle Bill Unit'},
];

const DIAGRAM_50 = [
  {id:'B', label:'UTC', color:'#3A8EF5', desc:'Upper Transport Cassette'},
  {id:'7', label:'TSK', color:'#E67E22', desc:'Temporary Stacker'},
  {id:'6', label:'CSM', color:'#9B59B6', desc:'Customer Service Module'},
  {id:'0', label:'FT/MID', color:'#F5A623', desc:'Front Transport / MID Transport'},
  {id:'8', label:'BC', color:'#1ABC9C', desc:'Bill Checker (Bill Counter)'},
  {id:'A', label:'RJC', color:'#D94040', desc:'Reject/Journal Cassette'},
  {id:'1', label:'RC1', color:'#2ECC71', desc:'Kaset RC1'},
  {id:'2', label:'RC2', color:'#2ECC71', desc:'Kaset RC2'},
  {id:'3', label:'RC3', color:'#2ECC71', desc:'Kaset RC3'},
  {id:'4', label:'RC4', color:'#2ECC71', desc:'Kaset RC4'},
];

// CDU10 Module Decode Map
const MODULE_MAP_CDU10 = {
  '0':'Carriage / MB — Main Body (Rotor, BF Stopper, unit utama)',
  '1':'Convery — Jalur Transport Utama (THR / Throat)',
  '2':'Cassette 1 (CST1 — Kaset Uang 1)',
  '3':'Cassette 2 (CST2 — Kaset Uang 2)',
  '4':'Cassette 3 (CST3 — Kaset Uang 3)',
  '5':'Cassette 4 (CST4 — Kaset Uang 4)',
  '6':'Cassette 5 (CST5 — Kaset Uang 5)',
  '7':'Cassette 6 (CST6 — Kaset Uang 6)',
  '8':'USB — Komunikasi USB CDU10',
  '9':'Others — Error Umum CDU10',
};

const CDU10_ERROR_DESC_MAP = {
  '0':'Light Jam — Uang gagal mencapai posisi sensor berikutnya dalam waktu yang ditentukan (macet ringan)',
  '1':'Dark Jam — Uang macet total, sensor terblokir penuh (macet berat)',
  '2':'Double Feed / Double Detect — Lebih dari satu lembar uang terdeteksi atau diumpankan bersamaan',
  '3':'Skew — Uang masuk dalam posisi miring, tidak sejajar jalur transport',
  '4':'Short Note — Uang terdeteksi terlalu pendek dari standar',
  '5':'Long Note — Uang terdeteksi terlalu panjang dari standar',
  '6':'Thickness Error — Tebal uang di luar batas standar',
  '7':'Feed Failure — Roller gagal mengumpankan uang dari kaset',
  '8':'Motor Error / Timeout — Motor tidak mencapai posisi dalam waktu yang ditentukan',
  '9':'Sensor Error — Sensor tidak mendeteksi atau memberikan sinyal tidak normal',
  'A':'Solenoid / Gate Error — Solenoid atau diverter gate tidak merespons',
  'B':'Communication Error — Timeout atau error komunikasi CDU10',
  'E':'Separator Failure — Unit separator gagal memisahkan uang satu per satu',
  'F':'Motor Step Out — Motor kehilangan langkah saat proses transport uang',
};

const DIAGRAM_CDU10 = [
  {id:'0', label:'Carriage', color:'#F5A623', desc:'Main Body / Rotor'},
  {id:'1', label:'Convery', color:'#3A8EF5', desc:'Jalur Transport / THR'},
  {id:'2', label:'CST1', color:'#2ECC71', desc:'Cassette 1'},
  {id:'3', label:'CST2', color:'#2ECC71', desc:'Cassette 2'},
  {id:'4', label:'CST3', color:'#2ECC71', desc:'Cassette 3'},
  {id:'5', label:'CST4', color:'#2ECC71', desc:'Cassette 4'},
  {id:'6', label:'CST5', color:'#2ECC71', desc:'Cassette 5'},
  {id:'7', label:'CST6', color:'#2ECC71', desc:'Cassette 6'},
  {id:'8', label:'USB', color:'#9B59B6', desc:'Komunikasi USB'},
  {id:'9', label:'Others', color:'#95A5A6', desc:'Error Umum'},
];

// ============================================================
// CDU30 Decode Maps (berdasarkan diagram STRUKTUR KODE ERROR CDU30 — Hyosung TNS Inc.)
// Format kode: 7 digit = [Device][Perintah][Modul][Detil Error x2][Kode Cadangan x2]
// Contoh: 490B200 → Device 4 (CDU), Perintah 9 (Shutter), Modul 0 (Main), Detil B2 (Shutter & Security), Cadangan 00
// ============================================================
const UNIT_MAP_CDU30 = {
  '2':'SPR — Receipt Printer (Pencetak Struk)',
  '3':'MCU — Card Reader (Pembaca Kartu)',
  '4':'CDU — Cash Dispenser Unit (CDU30)',
  '9':'SP Software',
  'I':'CCIM — Cash Collection & Deposit Module',
  'E':'Pin Pad',
};

const COMMAND_MAP_CDU30 = {
  '1':'Inisial — Inisialisasi modul',
  '2':'Penarikan (SP) — Proses penarikan uang berlangsung',
  '3':'Mengakhiri Penarikan — Menyelesaikan proses penarikan',
  '4':'Pengiriman (SP) — Proses pengiriman uang',
  '5':'Cash-In — Proses pemasukan uang',
  '6':'Retract — Penarikan kembali uang',
  '8':'Pengaturan Auto Dim Sensor — Kalibrasi otomatis sensor',
  '9':'Shutter — Operasi shutter',
  'A':'Informasi Unit',
  'B':'Informasi Kaset',
  'D':'Informasi Catatan',
  'G':'Pengiriman (VDM dan TM)',
  'I':'Kontrol Indikator',
  'L':'RAS Log',
  'M':'Operation Log',
  'P':'Penarikan (VDM dan TM)',
  'T':'Tes',
  'U':'Download',
  'V':'Pembacaan Versi',
};

const MODULE_MAP_CDU30 = {
  '0':'Main — Papan kontrol utama / Main Body',
  '1':'CST1 — Kaset Uang 1',
  '2':'CST2 — Kaset Uang 2',
  '3':'CST3 — Kaset Uang 3',
  '4':'CST4 — Kaset Uang 4',
  '5':'CST5 — Kaset Uang 5',
  '6':'Convey — Jalur Transport (Convey)',
  '7':'Throat — Jalur Throat',
  '8':'Jam — Kondisi macet umum',
};

// Detil Error CDU30 (digit ke-4, kategori 'x') — digit ke-5 adalah nomor urut sub-kasus dalam kategori ini
const ERROR_DESC_MAP_CDU30 = {
  '1':'Komponen Motherboard atau Error komunikasi',
  '2':'Komponen Motherboard atau Error komunikasi',
  '3':'Komponen Motherboard atau Error komunikasi',
  '4':'Sensor Status Cek Error (Echo Signal: Clutch, Double Detect Lever, Step Motor)',
  '5':'Convey Path abnormal (Reject Gate, Wrong Path, Double Detect Sensor …)',
  '6':'Kondisi stacker abnormal',
  '7':'Throat Path abnormal',
  '8':'Pergerakan habis waktu (timeout)',
  '9':'RJ/RT Box Error',
  'A':'Kaset Error',
  'B':'Shutter & Security Error (pengamanan — vandalisme & komunikasi)',
  'C':'Reject Error (berlanjut atau banyak)',
  'D':'Error proses penarikan',
  'E':'Convey JAM (Dark JAM)',
};

const DIAGRAM_CDU30 = [
  {id:'0', label:'Main', color:'#F5A623', desc:'Papan kontrol utama / Main Body'},
  {id:'1', label:'CST1', color:'#2ECC71', desc:'Kaset Uang 1'},
  {id:'2', label:'CST2', color:'#2ECC71', desc:'Kaset Uang 2'},
  {id:'3', label:'CST3', color:'#2ECC71', desc:'Kaset Uang 3'},
  {id:'4', label:'CST4', color:'#2ECC71', desc:'Kaset Uang 4'},
  {id:'5', label:'CST5', color:'#2ECC71', desc:'Kaset Uang 5'},
  {id:'6', label:'Convey', color:'#3A8EF5', desc:'Jalur Transport'},
  {id:'7', label:'Throat', color:'#E67E22', desc:'Jalur Throat'},
  {id:'8', label:'Jam', color:'#D94040', desc:'Kondisi macet umum'},
];

/* ============================================================
   ALUR TRANSAKSI BRM — urutan fisik yang dilalui uang (sumber: Laska)
   Digit ke-2 kode = perintah, digit ke-3 = modul tempat error.
   BRM860: TSK pada BRM50 setara TE/RJE.
   ============================================================ */
const TX_FLOW={
  brm50:{
    label:'BRM50',
    nodes:{CSM:['6'],TSK:['7'],BC:['8'],RC:['1','2','3','4'],RJC:['A'],FT:['0'],BOT:['0'],MT:['0']},
    full:{CSM:'Customer Service Module',TSK:'Temporary Stacker',BC:'Bill Checker',RC:'Recycle Cassette',RJC:'Reject Cassette',FT:'Front Transport',MT:'MID Transport'},
    cmd:{
      '2':{n:'Deposit Count',c:['CSM','BC','FT/BOT','TSK']},
      '3':{n:'Deposit Stack',c:['TSK','IF','MT','RC/RJC']},
      '4':{n:'Deposit Cancel',c:['CSM','BC','TSK','CSM'],lab:['menerima uang','','','mengeluarkan uang kembali ke nasabah'],note:'Uang dari CSM dihitung BC, ditahan sementara di TSK, lalu dikeluarkan kembali ke nasabah lewat CSM.'},
      '7':{n:'Withdrawal',c:['RC','MT','IF','FT/BOT','TSK','BC','CSM']},
      'K':{n:'Withdrawal Reject',c:['TSK','BC','IF','MT','RJC']}
    }
  },
  brm860:{
    label:'BRM860',
    nodes:{CSM:['6'],TE:['7'],RJE:['R'],BC:['8'],RC:['1','2','3','4'],RJC:['C'],FT:['0'],BOT:['0'],MT:['0']},
    full:{CSM:'Customer Service Module',TE:'Temporary Escrow',RJE:'Reject Escrow',BC:'Bill Counter/Checker',RC:'Recycle Cassette',RJC:'Reject Cassette',FT:'Front Transport',MT:'MID Transport'},
    cmd:{
      '2':{n:'Deposit Count',c:['CSM','BC','FT/BOT','TE/RJE']},
      '3':{n:'Deposit Stack',c:['TE/RJE','IF','MT','RC/RJC']},
      '4':{n:'Deposit Cancel',c:['CSM','BC','TE/RJE','CSM'],lab:['menerima uang','','','mengeluarkan uang kembali ke nasabah'],note:'Uang dari CSM dihitung BC, ditahan sementara di TE/RJE, lalu dikeluarkan kembali ke nasabah lewat CSM.'},
      '7':{n:'Withdrawal',c:['RC','MT','IF','FT/BOT','TE/RJE','BC','CSM']},
      'K':{n:'Withdrawal Reject',c:['TE/RJE','BC','IF','MT','RJC']}
    }
  }
};
function txNodeDigits(M,node){const out=[];String(node).split('/').forEach(p=>{(M.nodes[p]||[]).forEach(x=>out.push(x));});return out;}
function txFlowInfo(model,cmd,modDigit){
  const M=TX_FLOW[model];if(!M)return null;
  const cm=String(cmd||'').toUpperCase(),f=M.cmd[cm];if(!f)return null;
  const md=String(modDigit||'').toUpperCase();
  const hit=[];f.c.forEach((n,i)=>{if(md&&txNodeDigits(M,n).indexOf(md)>=0)hit.push(i);});
  const spots=hit.map(i=>({i,node:f.c[i],lab:(f.lab&&f.lab[i])||'',before:f.c.slice(0,i),after:f.c.slice(i+1)}));
  return {model,label:M.label,cmd:cm,name:f.n,note:f.note||'',chain:f.c,lab:f.lab||null,branch:null,hit,spots,branchHit:false,pos:hit.length?hit[0]:-1,
    before:hit.length?f.c.slice(0,hit[0]):[],after:hit.length?f.c.slice(hit[hit.length-1]+1):[]};
}
function txModuleName(model,digit){
  try{const mp=model==='brm860'?MODULE_MAP_860:MODULE_MAP_50;const v=mp[String(digit||'').toUpperCase()];return v?v.replace(/\s*[—-].*$/,''):'';}catch(e){return '';}
}
function txSpotText(sp,chain){
  return 'tahap '+sp.node+(sp.lab?' ('+sp.lab+')':'')+', urutan ke-'+(sp.i+1)+' dari '+chain.length+'. Sudah dilewati: '+(sp.before.length?sp.before.join(', '):'tidak ada (tahap pertama)')+'. Belum dilewati: '+(sp.after.length?sp.after.join(', '):'tidak ada (tahap terakhir)')+'.';
}
function txFlowStage(model,code){
  const c=String(code||'').toUpperCase().replace(/[^A-Z0-9@]/g,'');
  if(c.length<3||c[0]!=='5')return null;
  const info=txFlowInfo(model,c[1],c[2]);
  if(!info)return null;
  const mod=txModuleName(model,c[2]);
  let text='Perintah "'+info.name+'" (digit 2 = '+info.cmd+'). Alur '+info.label+': '+info.chain.join(' -> ')+'. '+(info.note?info.note+' ':'');
  let short=info.name;
  if(info.spots.length===1){
    const sp=info.spots[0];
    text+='Digit 3 = '+c[2]+' ('+mod+') berada di '+txSpotText(sp,info.chain);
    short=info.name+' · '+sp.node+' ('+(sp.i+1)+'/'+info.chain.length+')';
  }else if(info.spots.length>1){
    text+='Digit 3 = '+c[2]+' ('+mod+') muncul di '+info.spots.length+' titik alur: '+info.spots.map((sp,k)=>'('+(k+1)+') '+txSpotText(sp,info.chain)).join(' ')+' Kode saja belum menunjukkan titik mana; lihat konteks (mis. uang sedang masuk atau keluar).';
    short=info.name+' · '+info.spots.map(sp=>sp.node+' ('+(sp.i+1)+'/'+info.chain.length+')').join(' atau ');
  }else{
    text+='Digit 3 = '+c[2]+(mod?' ('+mod+')':'')+' tidak termasuk jalur utama perintah ini pada alur, jadi kemungkinan modul pendukung atau papan kontrol.';
    short=info.name+' · di luar jalur utama';
  }
  if(c[2]==='0'){const tg=brmTG(info.cmd);text+=' Transport (0) punya dua jalur: jalur ATAS dipakai pada alur deposit dan jalur BAWAH (di atas kaset) dipakai pada alur penarikan'+(tg?'; perintah ini '+(tg==='top'?'deposit, jadi jalur atas':'penarikan, jadi jalur bawah')+'.':'.');}
  {const ck=txCheckText(model,info);if(ck)text+=' '+ck;}
  return {text,short,info};
}

/* tampilan alur di Decoder */
function txFlowHtml(model,d2,d3){
  const info=txFlowInfo(model,d2,d3);if(!info)return '';
  const M=TX_FLOW[model];
  const tip=n=>n.split('/').map(p=>M.full[p]?p+' = '+M.full[p]:p).join('; ');
  const chip=(n,on,lab)=>'<span title="'+tip(n)+'" style="padding:5px 9px;border-radius:7px;font-family:var(--code-font);font-size:11px;font-weight:700;border:2px solid '+(on?'#E67E22':'var(--border)')+';background:'+(on?'#E67E2233':'var(--surface2)')+';color:'+(on?'#E67E22':'var(--text-muted)')+(on?';box-shadow:0 0 8px #E67E2255':'')+'">'+n+'</span>';
  const arr='<span style="color:var(--text-muted);font-size:12px">→</span>';
  let h='<div style="margin-top:10px;padding:10px 12px;background:var(--surface2);border-radius:8px;border-left:3px solid #E67E22">';
  h+='<div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px">Alur transaksi — '+info.name+' · '+info.label+'</div>';
  h+='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:5px">'+info.chain.map((n,i)=>chip(n,info.hit.indexOf(i)>=0)).join(arr)+'</div>';
  if(info.note)h+='<div style="margin-top:7px;font-size:10.5px;color:var(--text-muted);line-height:1.5">'+info.note+'</div>';
  if(d3){
    const lst=(a,e)=>a.length?a.join(', '):e;
    if(info.spots.length){
      info.spots.forEach((sp,k)=>{
        h+='<div style="margin-top:8px;font-size:11px;color:var(--text);line-height:1.55">📍 '+(info.spots.length>1?'<b>Kemungkinan '+(k+1)+':</b> ':'')+'Tahap bermasalah <b>'+sp.node+'</b>'+(sp.lab?' ('+sp.lab+')':'')+' — urutan ke-'+(sp.i+1)+' dari '+info.chain.length+'.<br>Sudah dilewati uang: '+lst(sp.before,'tidak ada (tahap pertama)')+'.<br>Belum dilewati: '+lst(sp.after,'tidak ada (tahap terakhir)')+'.</div>';
      });
      if(info.spots.length>1)h+='<div style="margin-top:6px;font-size:10.5px;color:var(--text-muted)">Modul ini muncul dua kali pada alur; lihat apakah error terjadi saat uang masuk atau keluar.</div>';
      const sp=info.spots[0],ord=[sp.node];
      if(sp.before.length)ord.push(sp.before[sp.before.length-1]);
      const last=info.spots[info.spots.length-1];
      if(last.after.length)ord.push(last.after[0]);
      h+='<div style="margin-top:6px;font-size:10.5px;color:var(--text-muted)">Arah pemeriksaan: '+ord.filter((x,i,a)=>a.indexOf(x)===i).join(', lalu ')+' (modul bermasalah, lalu tetangganya pada alur). Ini panduan urutan pemeriksaan, bukan penentu penyebab.</div>';
    }else h+='<div style="margin-top:8px;font-size:11px;color:var(--text);line-height:1.5">Modul digit ke-3 tidak termasuk jalur utama perintah ini (kemungkinan modul pendukung atau papan kontrol).</div>';
  }
  if(model==='brm860')h+='<div style="margin-top:6px;font-size:10px;color:var(--text-muted)">Catatan: TSK pada BRM50 setara TE/RJE pada BRM860. IF = interface; FT/BOT dan MID Transport berada pada modul 0.</div>';
  return h+'</div>';
}


/* ===== RENCANA PEMERIKSAAN & DIAGRAM POSISI MODUL BRM ===== */
function txCheckPlan(info){
  if(!info||!info.spots||!info.spots.length)return null;
  const f=info.spots[0],l=info.spots[info.spots.length-1];
  return {prob:[...new Set(info.spots.map(x=>x.node))],up:f.before.length?f.before[f.before.length-1]:null,down:l.after.length?l.after[0]:null};
}
function txCheckText(model,info){
  const p=txCheckPlan(info);if(!p)return '';
  let t='Urutan pemeriksaan fisik: (1) '+p.prob.join(' atau ')+' (modul bermasalah)';
  if(p.up)t+=', (2) '+p.up+' (tepat sebelumnya pada alur)';
  if(p.down)t+=', (3) '+p.down+' (tepat sesudahnya)';
  if([p.up,p.down].concat(p.prob).indexOf('IF')>=0)t+='. IF = titik sambungan jalur uang antara transport dan kaset; posisinya '+(model==='brm50'?'di ujung kanan jalur transport abu-abu (di atas RC1/RJC)':'di ujung kiri jalur transport (di atas RC41)');
  return t+'.';
}
const BRM_LAYOUT_TEXT='POSISI MODUL (sesuai diagram modul): BRM50: baris atas dari kiri: TSK (7) di atas UTC (B); di tengah atas blok transport; kanan atas CSM (6); BC (8) di tengah di bawah CSM; Transport (0) punya DUA JALUR: jalur ATAS (melintang di bawah baris atas, menghubungkan UTC-BC-CSM) dipakai pada alur DEPOSIT (perintah 2, 3, 4), dan jalur BAWAH (pita abu-abu horizontal di atas kaset) dipakai pada alur WITHDRAWAL/penarikan (perintah 7, K); IF di ujung KANAN jalur abu-abu (di atas RC1/RJC); kaset di bagian bawah dari kiri ke kanan: RC4 (4), RC3 (3), RC2 (2), RC1 (1), RJC (A). BRM860: baris atas dari kiri: UTC, RJE (R), TE (7), BC (8), CSM (6) di kanan atas; Transport (0) punya DUA JALUR: jalur ATAS (rol di bawah baris UTC-RJE-TE-BC) dipakai pada alur DEPOSIT (perintah 2, 3, 4), dan jalur BAWAH (MID Transport, pita horizontal di atas kaset) dipakai pada alur WITHDRAWAL/penarikan (perintah 7, K); IF di ujung KIRI jalur transport (di atas RC41); kaset dari kiri ke kanan: RC41 (4), RC31 (3), RC21 (2), RC11 (1), RJC (C); Main (A) dan RBU (B) di sisi kanan.';
const BRM_SVG={
  brm50:{w:430,h:320,badge:'#2D3494',ifb:{x:313,y:100,w:50,h:40},
    decor:[{s:'r',x:158,y:3,w:58,h:92},{s:'r',x:3,y:132,w:345,h:20}],
    roll:[{y:122,x1:20,x2:330},{y:142,x1:12,x2:340},{y:90,x1:90,x2:310},{y:60,x1:84,x2:150}],
    els:[
      {id:'TSK',d:'7',s:'r',x:5,y:8,w:150,h:30,lb:'TSK',lx:12,ly:29,fs:16,bx:128,by:15},
      {id:'UTC',d:'B',s:'r',x:5,y:40,w:75,h:45,lb:'UTC',lx:9,ly:72,fs:20,bx:70,by:62},
      {id:'CSM',d:'6',s:'p',pts:'220,5 390,5 420,50 420,98 220,98',x:220,y:5,w:200,h:93,lb:'CSM',lx:300,ly:40,fs:16,bx:230,by:12},
      {id:'BC',d:'8',s:'r',x:226,y:52,w:82,h:46,lb:'BC',lx:250,ly:73,fs:15,bx:258,by:78},
      {id:'T0a',d:'0',g:'top',s:'r',x:84,y:84,w:232,h:12,bx:178,by:84,hid:1,roll:1},
      {id:'T0b',d:'0',g:'bot',s:'r',x:3,y:110,w:340,h:22,hatch:1},
      {id:'RC4',d:'4',s:'r',x:7,y:153,w:66,h:159,lb:'RC4',lx:21,ly:262,fs:13,bx:30,by:190},
      {id:'RC3',d:'3',s:'r',x:75,y:153,w:65,h:159,lb:'RC3',lx:88,ly:262,fs:13,bx:97,by:190},
      {id:'RC2',d:'2',s:'r',x:142,y:153,w:65,h:159,lb:'RC2',lx:155,ly:262,fs:13,bx:164,by:190},
      {id:'RC1',d:'1',s:'r',x:210,y:153,w:65,h:159,lb:'RC1',lx:223,ly:262,fs:13,bx:232,by:190},
      {id:'RJC',d:'A',s:'r',x:277,y:153,w:66,h:159,lb:'RJC',lx:291,ly:262,fs:13,bx:299,by:190}
    ]},
  brm860:{w:410,h:268,badge:'#1B9AC4',ifb:{x:35,y:63,w:40,h:30},
    decor:[{s:'r',x:33,y:10,w:362,h:56},{s:'r',x:33,y:70,w:300,h:56}],
    roll:[{y:56,x1:45,x2:300},{y:108,x1:40,x2:325}],
    els:[
      {id:'UTC',d:'B0',s:'r',x:38,y:14,w:70,h:38,lb:'UTC',lx:48,ly:40,fs:14,nob:1},
      {id:'RJE',d:'R',s:'r',x:112,y:10,w:50,h:50,lb:'RJE',lx:122,ly:56,fs:10,bx:121,by:14,big:1},
      {id:'TE',d:'7',s:'r',x:168,y:12,w:80,h:52,lb:'TE',lx:200,ly:40,fs:14,bx:172,by:36,circ:1},
      {id:'BC',d:'8',s:'r',x:252,y:20,w:62,h:42,lb:'BC',lx:262,ly:56,fs:14,bx:256,by:28},
      {id:'CSM',d:'6',s:'p',pts:'318,12 392,12 396,62 318,62',x:318,y:12,w:78,h:50,lb:'CSM',lx:350,ly:56,fs:12,bx:332,by:22},
      {id:'T0top',d:'0',g:'top',s:'r',x:40,y:58,w:285,h:11,hid:1,roll:1},
      {id:'T0',d:'0',g:'bot',s:'r',x:40,y:98,w:285,h:26,hatch:1,bx:118,by:72},
      {id:'RC4',d:'4',s:'r',x:40,y:126,w:46,h:132,lb:'RC41',lx:46,ly:178,fs:10,bx:51,by:236},
      {id:'RC3',d:'3',s:'r',x:96,y:126,w:46,h:132,lb:'RC31',lx:102,ly:178,fs:10,bx:107,by:236},
      {id:'RC2',d:'2',s:'r',x:152,y:126,w:46,h:132,lb:'RC21',lx:158,ly:178,fs:10,bx:163,by:236},
      {id:'RC1',d:'1',s:'r',x:208,y:126,w:46,h:132,lb:'RC11',lx:214,ly:178,fs:10,bx:219,by:236},
      {id:'RJC',d:'C',s:'r',x:264,y:126,w:50,h:132,lb:'RJC',lx:273,ly:178,fs:11,bx:277,by:236},
      {id:'MAIN',d:'A',s:'r',x:326,y:134,w:78,h:26,lb:':Main',lx:352,ly:153,fs:13,bx:328,by:137,bw:22,bh:20},
      {id:'RBU',d:'B',s:'r',x:326,y:172,w:78,h:26,lb:':RBU',lx:352,ly:191,fs:13,bx:328,by:175,bw:22,bh:20}
    ]}
};
function brmTG(cmd){cmd=String(cmd||'').toUpperCase();return '234'.indexOf(cmd)>=0&&cmd?'top':('7K'.indexOf(cmd)>=0&&cmd?'bot':null);}
function brmElsForNode(model,node,cmd){
  const M=TX_FLOW[model],G=BRM_SVG[model];if(!node)return [];
  const out=[];String(node).split('/').forEach(p=>{
    if(p==='IF'){out.push('__IF');return;}
    const dg=M.nodes[p]||[];
    const tg=brmTG(cmd);
    G.els.forEach(e=>{if(dg.indexOf(e.d)>=0&&out.indexOf(e.id)<0&&!(e.g&&tg&&e.g!==tg))out.push(e.id);});
  });
  return out;
}
function brmDiagramSvg(model,d1,d2,d3,mode){
  const G=BRM_SVG[model];if(!G)return '';
  const card=mode==='card';
  const md=String(d3||'').toUpperCase();
  const info=(d1==='5'&&d2)?txFlowInfo(model,d2,md):null,plan=txCheckPlan(info);
  const role={};let ifRole=0;
  const tg=brmTG(d2);
  G.els.forEach(e=>{if(md&&e.d===md&&!(e.g&&tg&&e.g!==tg))role[e.id]=1;});
  const put=(node,n)=>brmElsForNode(model,node,d2).forEach(id=>{if(id==='__IF'){if(!ifRole)ifRole=n;}else if(!role[id])role[id]=n;});
  if(plan){plan.prob.forEach(n=>{ if(!md)put(n,1); }); if(plan.up)put(plan.up,2); if(plan.down)put(plan.down,3);}
  const COL={1:['#FFE2BE','#E67E22'],2:['#DCEBFF','#1565C0'],3:['#DDF3E2','#2E7D32']};
  let o='<svg viewBox="0 0 '+G.w+' '+G.h+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;height:auto;display:block;margin:0 auto" role="img" aria-label="Diagram posisi modul">';
  o+='<style>@keyframes brmp{0%,100%{opacity:1}50%{opacity:.5}}.brmp{animation:brmp 1.2s infinite}</style>';
  o+='<defs><pattern id="brmh'+model+'" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#E3E6EC"/><line x1="0" y1="0" x2="0" y2="6" stroke="#B6BCC8" stroke-width="2"/></pattern></defs>';
  G.decor.forEach(d=>{o+='<rect x="'+d.x+'" y="'+d.y+'" width="'+d.w+'" height="'+d.h+'" fill="#fff" stroke="#9AA3B5" stroke-width="1.2"/>';});
  G.roll.forEach(r=>{for(let x=r.x1;x<=r.x2;x+=14)o+='<circle cx="'+x+'" cy="'+r.y+'" r="4" fill="none" stroke="#9AA3B5" stroke-width="1"/>';});
  G.els.forEach(e=>{
    const rl=role[e.id],c=rl?COL[rl]:null;
    const fill=c?c[0]:(e.hatch?'url(#brmh'+model+')':(e.hid?'none':'#fff')),stroke=c?c[1]:'#8A93A6',sw=c?(rl===1?3:2.4):1.2;
    const dash=rl>1?' stroke-dasharray="6 3"':'';
    const cls=rl===1?' class="brmp"':'';
    if(e.hid&&!c){}
    else if(e.s==='p')o+='<polygon points="'+e.pts+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"'+dash+cls+'/>';
    else o+='<rect x="'+e.x+'" y="'+e.y+'" width="'+e.w+'" height="'+e.h+'" rx="3"'+(e.roll?' fill-opacity=".6"':'')+' fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"'+dash+cls+'/>';
    if(e.circ)o+='<circle cx="'+(e.x+e.w/2+6)+'" cy="'+(e.y+e.h/2)+'" r="19" fill="#fff" stroke="#9AA3B5" stroke-width="1.2"/>';
    if(e.lb)o+='<text x="'+e.lx+'" y="'+e.ly+'" font-family="Arial,sans-serif" font-size="'+e.fs+'" font-weight="700" fill="'+(c?c[1]:'#2A2F45')+'">'+e.lb+'</text>';
  });
  G.els.forEach(e=>{
    if(e.bx==null||e.nob)return;
    const bw=e.bw||(e.big?28:20),bh=e.bh||(e.big?26:16),rl=role[e.id];
    o+='<rect x="'+e.bx+'" y="'+e.by+'" width="'+bw+'" height="'+bh+'" rx="2" fill="'+(rl===1?'#C25E00':G.badge)+'"/><text x="'+(e.bx+bw/2)+'" y="'+(e.by+bh-4)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+(e.big?16:12)+'" font-weight="700" fill="#fff">'+e.d+'</text>';
  });
  /* IF: penanda saja, bentuk/warna/tulisan sama dengan badge modul lain */
  const b=G.ifb,ic=ifRole?COL[ifRole]:null,ix=b.x+b.w/2-12,iy=b.y+b.h/2-9;
  o+='<rect x="'+ix+'" y="'+iy+'" width="24" height="18" rx="2" fill="'+(ic?ic[1]:G.badge)+'"'+(ifRole===1?' class="brmp"':'')+'/><text x="'+(ix+12)+'" y="'+(iy+14)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#fff">IF</text>';
  /* nomor urutan cek */
  const num=(cx,cy,n)=>'<circle cx="'+cx+'" cy="'+cy+'" r="9" fill="'+COL[n][1]+'" stroke="#fff" stroke-width="1.5"/><text x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#fff">'+n+'</text>';
  G.els.forEach(e=>{const rl=role[e.id];if(!rl||e.hid)return;const bx=e.hatch?e.x+12:(e.s==='p'?e.x+e.w-6:e.x+e.w-4);o+=num(Math.min(bx,G.w-10),e.y+4,rl);});
  if(ifRole)o+=num(ix+24,iy+1,ifRole);
  o+='</svg>';
  /* keterangan */
  let h='<div style="margin-top:10px"><div style="font-size:9px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Diagram Posisi Modul — '+(model==='brm860'?'BRM860 (6L/YT)':'BRM50 (710/YQ)')+'</div>'+(card?'':'<div style="background:#fff;border-radius:10px;padding:10px">'+o+'</div>');
  if(info&&plan){
    const nm=n=>n.replace(/\/IF$/,'');
    h+='<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;font-size:10.5px">'
      +'<span style="padding:3px 8px;border-radius:12px;background:#FFE2BE;color:#9A4F00;border:1px solid #E67E22">① Modul bermasalah: <b>'+plan.prob.join(' / ')+'</b></span>'
      +(plan.up?'<span style="padding:3px 8px;border-radius:12px;background:#DCEBFF;color:#0D47A1;border:1px dashed #1565C0">② Cek sebelumnya: <b>'+plan.up+'</b></span>':'')
      +(plan.down?'<span style="padding:3px 8px;border-radius:12px;background:#DDF3E2;color:#1B5E20;border:1px dashed #2E7D32">③ Cek sesudahnya: <b>'+plan.down+'</b></span>':'')
      +'</div>'+(card?'':'<div style="margin-top:6px;font-size:10px;color:var(--text-muted);line-height:1.5">Periksa berurutan 1 → 2 → 3. Penanda <b>IF</b> = titik sambungan jalur uang ('+(model==='brm50'?'ujung kanan jalur transport':'ujung kiri jalur transport')+'). Panduan urutan pemeriksaan, bukan penentu penyebab.</div>');
  }else if(md){
    h+='<div style="margin-top:8px;font-size:10.5px;color:var(--text-muted)">Modul yang disorot = digit ke-3. '+(info?'Modul ini tidak berada pada jalur utama perintah '+info.name+', jadi periksa modul ini sendiri lebih dulu.':'Isi digit ke-2 (perintah) untuk melihat urutan pemeriksaan sepanjang alur.')+'</div>';
  }
  if(md==='0'){const t0=brmTG(d2);h+='<div style="margin-top:6px;font-size:10.5px;color:var(--text);line-height:1.5">🛤️ Transport (0) punya dua jalur: <b>jalur atas</b> dipakai pada alur <b>deposit</b> dan <b>jalur bawah</b> (di atas kaset) dipakai pada alur <b>penarikan</b>. '+(t0==='top'?'Perintah ini deposit, jadi yang disorot jalur atas.':t0==='bot'?'Perintah ini penarikan, jadi yang disorot jalur bawah.':'Isi digit ke-2 agar jalur yang tepat disorot.')+'</div>';}
  if(card)h+='<button type="button" onclick="brmOpenDiagram()" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid #C5D0F0;background:#EEF2FF;color:#2D3494;font-weight:700;font-size:12px;cursor:pointer">🗺️ Lihat diagram posisi modul</button>';
  return h+'</div>';
}

function brmDiagramCard(model,d1,d2,d3){window.__brm={model:model,d1:d1,d2:d2,d3:d3};return brmDiagramSvg(model,d1,d2,d3,'card');}
function brmCloseDiagram(){const ov=document.getElementById('brmOvl');if(ov)ov.style.display='none';}
function brmOpenDiagram(){
  const a=window.__brm;if(!a)return;
  let ov=document.getElementById('brmOvl');
  if(!ov){
    ov=document.createElement('div');ov.id='brmOvl';
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:3000;display:none;visibility:visible;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)';
    ov.onclick=function(e){if(e.target===ov)brmCloseDiagram();};
    document.body.appendChild(ov);
    document.addEventListener('keydown',function(e){if(e.key==='Escape')brmCloseDiagram();});
  }
  ov.innerHTML='<div role="dialog" aria-modal="true" aria-label="Diagram posisi modul" style="position:relative;background:#fff;color:#1B2340;border-radius:16px;max-width:660px;width:100%;max-height:92vh;overflow:auto;padding:6px 18px 18px;box-shadow:0 20px 60px rgba(0,0,0,.35)"><button type="button" onclick="brmCloseDiagram()" aria-label="Tutup" style="position:absolute;top:10px;right:12px;width:30px;height:30px;border-radius:50%;border:1px solid #D5DBEA;background:#fff;font-size:15px;cursor:pointer;color:#444">✕</button>'+brmDiagramSvg(a.model,a.d1,a.d2,a.d3)+'</div>';
  ov.style.display='flex';
}

function runDecoder(){
  const d1 = document.getElementById('d1').value.toUpperCase();
  const d2 = document.getElementById('d2').value.toUpperCase();
  const d3 = document.getElementById('d3').value.toUpperCase();
  const d4 = document.getElementById('d4').value.toUpperCase();
  const d5 = document.getElementById('d5').value.toUpperCase();
  const d6 = document.getElementById('d6').value.toUpperCase();
  const d7 = document.getElementById('d7').value.toUpperCase();

  if(!d1 && !d2 && !d3){
    alert('Masukkan minimal 3 digit kode error untuk di-decode.');
    return;
  }

  const unitMap = decMod==='cdu30'?UNIT_MAP_CDU30:UNIT_MAP;
  const commandMap = decMod==='cdu30'?COMMAND_MAP_CDU30:COMMAND_MAP;
  const modMap = decMod==='brm860'?MODULE_MAP_860:decMod==='brm50'?MODULE_MAP_50:decMod==='cdu30'?MODULE_MAP_CDU30:MODULE_MAP_CDU10;
  const errMap = decMod==='cdu10'?CDU10_ERROR_DESC_MAP:decMod==='cdu30'?ERROR_DESC_MAP_CDU30:ERROR_DESC_MAP;
  const diagram = decMod==='brm860'?DIAGRAM_860:decMod==='brm50'?DIAGRAM_50:decMod==='cdu30'?DIAGRAM_CDU30:DIAGRAM_CDU10;

  const cards = [
    { pos:'Digit ke-1', name:'UNIT', digit:d1||'—',
      val: unitMap[d1] || (d1 ? `Unit tidak dikenal (${d1})` : 'Belum diisi'),
      cls:'c1', icon:'🏭' },
    { pos:'Digit ke-2', name:'COMMAND (Kondisi ATM saat error)', digit:d2||'—',
      val: commandMap[d2] || (d2 ? `Command tidak dikenal (${d2})` : 'Belum diisi'),
      cls:'c2', icon:'⚡',
      extra:(d1==='5'&&(decMod==='brm860'||decMod==='brm50'))?txFlowHtml(decMod,d2,d3):'' },
    { pos:'Digit ke-3', name:'MODULE (Bagian yang bermasalah)', digit:d3||'—',
      val: modMap[d3] || (d3 ? `Modul tidak dikenal (${d3})` : 'Belum diisi'),
      cls:'c3', icon:'🔧',
      diagram: diagram, highlight: d3,
      svg:(decMod==='brm860'||decMod==='brm50')?brmDiagramCard(decMod,d1,d2,d3):'' },
    { pos:'Digit ke-4', name:'ERROR DESCRIPTION', digit:d4||'—',
      val: errMap[d4] || (d4 ? `Deskripsi error tidak dikenal (${d4})` : 'Belum diisi'),
      cls:'c4', icon:'⚠️' },
    { pos:'Digit ke-5', name: decMod==='cdu30' ? 'NOMOR URUT ERROR (dalam kategori)' : 'NO. SENSOR/MOTOR/SOLENOID', digit:d5||'—',
      val: decMod==='cdu30'
        ? (d5 ? `Sub-kasus error nomor ${d5} dalam kategori "${d4||'?'}x"` : 'Belum diisi')
        : (d5 ? `Sensor/Motor/Solenoid nomor: ${d5}` : 'Belum diisi'),
      cls:'c5', icon:'📡' },
  ];

  if(d6||d7){
    cards.push({
      pos:'Digit ke-6 & 7', name: decMod==='cdu30' ? 'KODE CADANGAN (Reserve)' : 'ADDITIONAL INFO CODE', digit:(d6||'—')+(d7||'—'),
      val: decMod==='cdu30'
        ? 'Kode cadangan (reserve), umumnya bernilai 00 — dicadangkan untuk analisa lanjutan oleh teknisi senior.'
        : 'Kode informasi tambahan untuk analisa lebih detail oleh teknisi senior.',
      cls:'c6', icon:'ℹ️'
    });
  }

  // Full code string
  const fullCode = (d1+d2+d3+d4+d5+(d6||'')+(d7||'')).replace(/—/g,'');

  const result = document.getElementById('decResult');
  result.innerHTML = cards.map(c => {
    let diagramHtml = '';
    if(c.svg){diagramHtml=c.svg;}
    else if(c.diagram && c.highlight){
      diagramHtml = `<div style="margin-top:10px">
        <div style="font-size:9px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Diagram Modul — ${decMod==='brm860'?'BRM860 (6L/YT)':decMod==='brm50'?'BRM50 (710/YQ)':decMod==='cdu30'?'CDU30':'CDU10'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${c.diagram.map(m=>`
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:default">
              <div style="width:40px;height:40px;border-radius:7px;display:flex;align-items:center;justify-content:center;
                font-family:var(--code-font);font-size:15px;font-weight:700;
                background:${m.id===c.highlight?m.color+'33':'var(--surface2)'};
                border:2px solid ${m.id===c.highlight?m.color:'var(--border)'};
                color:${m.id===c.highlight?m.color:'var(--text-muted)'};
                ${m.id===c.highlight?'box-shadow:0 0 10px '+m.color+'55;transform:scale(1.1)':''}
                transition:all .2s">${m.id}</div>
              <div style="font-size:8px;color:${m.id===c.highlight?'var(--text)':'var(--text-muted)'};text-align:center;font-weight:${m.id===c.highlight?'700':'400'}">${m.label}</div>
            </div>`).join('')}
        </div>
        ${c.highlight && c.diagram.find(m=>m.id===c.highlight) ?
          `<div style="margin-top:8px;padding:6px 10px;background:var(--surface2);border-radius:6px;border-left:3px solid ${c.diagram.find(m=>m.id===c.highlight).color};font-size:11px;color:var(--text)">
            📍 Modul bermasalah: <strong style="color:${c.diagram.find(m=>m.id===c.highlight).color}">${c.diagram.find(m=>m.id===c.highlight).label}</strong>
            — ${c.diagram.find(m=>m.id===c.highlight).desc}
          </div>` : ''}
      </div>`;
    }
    return `<div class="dec-card ${c.cls}">
      <div class="dec-card-pos">${c.icon} ${c.pos} — ${c.name}</div>
      <div class="dec-card-digit">${c.digit}</div>
      <div class="dec-card-name">${c.name}</div>
      <div class="dec-card-desc">${c.val}</div>
      ${diagramHtml}
      ${c.extra||''}
    </div>`;
  }).join('');

  result.className = 'dec-result show';

  // Show search button
  const searchRow = document.getElementById('decSearchRow');
  if(fullCode.length >= 5){
    searchRow.style.display = 'block';
    searchRow._code = fullCode;
  } else {
    searchRow.style.display = 'none';
  }
}

function searchFromDecoder(){
  const code = document.getElementById('decSearchRow')._code;
  if(!code) return;
  subModFilter='all';
  if(decMod !== mod){
    const tabEl = decMod === 'brm860' ? document.getElementById('tab860') : document.getElementById('tab50');
    switchMod(decMod, tabEl);
    setTimeout(()=>{
      document.getElementById('srch').value = code.substring(0,7);
      q = code.substring(0,7).toLowerCase();
      pg=1; doFilter();
      document.querySelector('.twrap').scrollIntoView({behavior:'smooth'});
    }, 100);
  } else {
    document.getElementById('srch').value = code.substring(0,7);
    q = code.substring(0,7).toLowerCase();
    pg=1; doFilter();
    document.querySelector('.twrap').scrollIntoView({behavior:'smooth'});
  }
}

// Allow Enter key to trigger decode
document.addEventListener('keydown', e=>{
  if(e.key==='Enter' && document.getElementById('decBody').classList.contains('open')){
    const active = document.activeElement;
    if(active && active.classList.contains('dec-digit')) runDecoder();
  }
});
// ============================================================


// ============================================================
// HISTORY — Riwayat Pencarian
// ============================================================
let searchHistory = [];
try{ searchHistory = JSON.parse(localStorage.getItem('atm_history')||'[]'); }catch(e){ searchHistory = []; }

function saveToHistory(term){
  if(!term || term.length < 2) return;
  searchHistory = searchHistory.filter(h=>h.term!==term||h.mod!==mod);
  searchHistory.unshift({term, mod, count:filtered.length, ts:Date.now()});
  if(searchHistory.length > 20) searchHistory = searchHistory.slice(0,20);
  try{ localStorage.setItem('atm_history', JSON.stringify(searchHistory)); }catch(e){}
  renderHistory();
}

function renderHistory(){
  const el = document.getElementById('historyList');
  if(!searchHistory.length){
    el.innerHTML='<span class="history-empty">Belum ada riwayat pencarian</span>';
    return;
  }
  el.innerHTML = searchHistory.slice(0,15).map((h,i)=>
    `<span class="history-tag" onclick="applyHistory(${i})">
      <span style="font-size:9px;color:var(--text-muted)">${h.mod==='brm860'?'860':h.mod==='brm50'?'50':'+'}</span>
      ${h.term}
      <span style="font-size:9px;color:var(--text-muted)">(${h.count})</span>
      <span class="h-x" onclick="event.stopPropagation();removeHistory(${i})">✕</span>
    </span>`
  ).join('');
}

function applyHistory(idx){
  const h = searchHistory[idx];
  if(!h) return;
  if(h.mod !== mod){
    const tabId = h.mod==='brm860'?'tab860':h.mod==='brm50'?'tab50':h.mod==='cdu10'?'tabCdu10':h.mod==='cdu30'?'tabCdu30':h.mod==='cdu800'?'tabCdu800':'tabExtra';
    const tabEl = document.getElementById(tabId);
    if(tabEl) switchMod(h.mod, tabEl);
  }
  document.getElementById('srch').value = h.term;
  q = h.term.toLowerCase();
  pg=1; doFilter();
  document.querySelector('.twrap').scrollIntoView({behavior:'smooth'});
}

function removeHistory(idx){
  searchHistory.splice(idx,1);
  try{ localStorage.setItem('atm_history', JSON.stringify(searchHistory)); }catch(e){}
  renderHistory();
}

function clearHistory(){
  searchHistory=[];
  try{ localStorage.removeItem('atm_history'); }catch(e){}
  renderHistory();
}

function toggleHistory(){
  const panel = document.getElementById('historyPanel');
  const isShow = panel.classList.toggle('show');
  document.getElementById('historyBtn').style.borderColor = isShow?'var(--blue)':'';
  document.getElementById('historyBtn').style.color = isShow?'var(--blue)':'';
  if(isShow) renderHistory();
}

// Save search to history after 1s of no typing
let historySaveTimer = null;
const _origOnSrch = onSrch;

// Override search to also save history
function onSrch(){
  clearTimeout(timer);
  clearTimeout(historySaveTimer);
  timer = setTimeout(()=>{
    q=document.getElementById('srch').value.toLowerCase().trim();
    pg=1; doFilter();
    usageLogSearch('hyosung', mod, q, filtered.length);
    if(q.length>=3){
      historySaveTimer = setTimeout(()=>saveToHistory(q),1500);
    }
  }, 200);
}

// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF(mode){
  mode = mode || 'filtered';
  document.getElementById('exportMenu').classList.remove('open');
  const btn = document.getElementById('exportBtn');
  const origLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Menyiapkan...';

  setTimeout(()=>{
    try{
      const modLabel = mod==='brm860'?'BRM 860':mod==='brm50'?'BRM 50':mod==='cdu10'?'CDU 10':mod==='cdu30'?'CDU 30':mod==='cdu800'?'CDU 800':'Modul Lainnya';
      const ts = new Date().toLocaleString('id-ID');

      let sourceRows, scopeLabel, scopeDetail;

      if(mode==='selected'){
        if(selectedCodes.size===0){ alert('Belum ada kode error yang dipilih. Centang kode error pada tabel terlebih dahulu.'); throw new Error('__no_selection__'); }
        const data = getActiveData();
        // Preserve selection order based on current data order, include only codes present in this module
        sourceRows = data.filter(row=>selectedCodes.has(row.k));
        scopeLabel = 'Kode Terpilih';
        scopeDetail = `${sourceRows.length.toLocaleString('id')} kode error dipilih manual`;
      } else if(mode==='all'){
        sourceRows = getActiveData();
        scopeLabel = 'Semua Kode (Modul Aktif)';
        scopeDetail = `Seluruh ${sourceRows.length.toLocaleString('id')} kode error pada modul ${modLabel}`;
      } else {
        sourceRows = filtered;
        const filterLabel = filt==='all'?'Semua':filt==='red'?'WARNING':filt==='amber'?'Periksa/Perbaiki':'Software/Restart';
        const searchLabel = q ? `"${q}"` : 'Semua';
        scopeLabel = 'Hasil Filter/Pencarian';
        scopeDetail = `Filter: ${filterLabel} | Pencarian: ${searchLabel}`;
      }

      const rows = sourceRows.slice(0, 500); // max 500 rows for PDF

      const tableRows = rows.map(row=>{
        const sv = sev(row.s);
        const color = sv==='red'?'#C62828':sv==='amber'?'#E65100':'#3949AB';
        const bg = sv==='red'?'#FFEBEE':sv==='amber'?'#FFF8E1':'#E8EAF6';
        const label = sv==='red'?'WARNING':sv==='amber'?'PERIKSA':'SOFTWARE';
        return `<tr>
          <td style="font-family:monospace;font-weight:700;color:#1565C0;white-space:nowrap">${escHtml(row.k)}</td>
          <td style="color:#4A5680;font-size:11px">${escHtml(row.m)}</td>
          <td>${escHtml(row.d)}</td>
          <td style="font-size:11px;color:#aaa">${escHtml((row.p||'').substring(0,100))}</td>
          <td style="font-size:11px">${escHtml((row.t||'').replace(/\n/g,' → ').substring(0,120))}</td>
          <td><span style="background:${bg};color:${color};border:1px solid ${color};padding:2px 6px;border-radius:3px;font-size:9px;font-weight:700;white-space:nowrap">${label}</span></td>
        </tr>`;
      }).join('');

      const printWin = window.open('','_blank','width=1200,height=800');
      printWin.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>ATM Error Code — ${modLabel} | ${ts}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#F0F4FF;color:#1A1F36;padding:24px;font-size:12px}
.header{background:#FFFFFF;border:1px solid #A8B8E8;border-radius:10px;padding:16px 20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.title{font-size:18px;font-weight:700;color:#1565C0}
.subtitle{font-size:11px;color:#4A5680;margin-top:3px}
.meta{font-size:10px;color:#4A5680;text-align:right}
.meta b{color:#1565C0}
table{width:100%;border-collapse:collapse;background:#F0F4FF}
th{background:#E8EEFF;padding:8px 10px;text-align:left;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#4A5680;border-bottom:1px solid #A8B8E8;white-space:nowrap}
td{padding:7px 10px;border-bottom:1px solid #C5D0F0;vertical-align:top;font-size:11px;line-height:1.4}
tr:hover td{background:#EEF2FF}
th:nth-child(1){width:10%}
th:nth-child(2){width:12%}
th:nth-child(3){width:24%}
th:nth-child(4){width:22%}
th:nth-child(5){width:24%}
th:nth-child(6){width:8%}
.footer{margin-top:12px;font-size:10px;color:#8A96B8;text-align:center;padding:8px}
@media print{
  body{background:#fff;color:#000;padding:10px}
  .header{background:#f5f5f5;border:1px solid #ccc;color:#000}
  .title{color:#333}
  .subtitle,.meta{color:#666}
  table{background:#fff}
  th{background:#e8e8e8;color:#555;border-bottom:1px solid #ccc}
  td{border-bottom:1px solid #eee;color:#333}
  tr:hover td{background:transparent}
}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="title">⚙ ATM Error Code Analyzer — ${escHtml(modLabel)}</div>
    <div class="subtitle">Hyosung MONiMAX Series | ATM & CRM Error Code Database</div>
  </div>
  <div class="meta">
    Dicetak: <b>${ts}</b><br>
    Cakupan: <b>${escHtml(scopeLabel)}</b><br>
    ${escHtml(scopeDetail)}<br>
    Menampilkan: <b>${rows.length}</b> dari <b>${sourceRows.length}</b> kode error
    ${rows.length < sourceRows.length ? '<br><span style="color:#D94040">* Maksimal 500 baris per export</span>':''}
  </div>
</div>
<table>
<thead><tr>
  <th>Kode Error</th><th>Sub-Modul</th><th>Deskripsi Kerusakan</th>
  <th>Analisa Penyebab</th><th>Cara Penanggulangan</th><th>Status</th>
</tr></thead>
<tbody>${tableRows}</tbody>
</table>
<div class="footer">© ATM Error Code Analyzer — Hyosung MONiMAX Series by Laska | Dicetak ${ts}</div>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`);
      printWin.document.close();
    } catch(e){
      if(e.message !== '__no_selection__'){
        alert('Gagal export: ' + e.message);
      }
    }
    btn.disabled = false;
    btn.textContent = origLabel;
  }, 100);
}

function escHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Init history display
renderHistory();

// INIT
updateStats();
doFilter();
