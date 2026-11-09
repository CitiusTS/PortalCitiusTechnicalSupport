


let ncrLoaded = false;
let smartImageUrl = '';
let smartImageFile = null;
let smartOcrPromise = null;
let smartAiReportData = null;
let portalCategory = '';
let portalBank = '';
let portalEditingId = '';
let portalFiles = [];
let portalSoftwareMatches = [];
let portalSoftwarePage = 1;

// ===== PENCATAT PENGGUNAAN =====
const __usageLastSeen = {};
function usageLog(e){
  try{
    if(!window.__fb || !window.__fb.logUsage) return;
    if(typeof currentIsAdmin!=='undefined' && currentIsAdmin) return; // admin tidak dipantau
    const key = [e.type,e.brand,e.module,e.query,e.fileId].join('|');
    const now = Date.now();
    if(__usageLastSeen[key] && now-__usageLastSeen[key] < 30000) return; // cegah duplikat 30 detik
    __usageLastSeen[key] = now;
    const clean = {};
    Object.keys(e).forEach(k=>{ if(e[k]!==undefined && e[k]!==null) clean[k]=e[k]; });
    window.__fb.logUsage(clean);
  }catch(err){ console.warn('usageLog gagal', err); }
}
const __usageSearchTimers = {};
function usageLogSearch(brand, module, text, results){
  const t = String(text||'').trim().toUpperCase();
  clearTimeout(__usageSearchTimers[brand]);
  if(t.length < 3) return;
  __usageSearchTimers[brand] = setTimeout(()=>usageLog({type:'search',brand,module,query:t.slice(0,80),results}), 1500);
}
function usageWatchFrame(frame, brand, module){
  frame.addEventListener('load', ()=>{
    try{
      frame.contentDocument.addEventListener('input', ev=>{
        const el = ev.target;
        if(el && el.matches && el.matches('input[type=search],input[type=text],input:not([type])') && !el.matches('[type=file]')){
          usageLogSearch(brand, module, el.value, null);
        }
      }, true);
    }catch(err){ console.warn('Tidak bisa memantau iframe', brand, err); }
  });
}
function showSmartAnalyzer(){
  document.getElementById('lainnyaBrandList').style.display='none';
  document.getElementById('smartAnalyzerContainer').style.display='block';
  document.getElementById('ncrContainer').style.display='none';
  document.getElementById('wincorContainer').style.display='none';
}
function showBrand(which){
  const moduleTabBar = document.getElementById('moduleTabBar');
  document.getElementById('hyosungAppRoot').style.display = which==='hyosung' ? '' : 'none';
  document.getElementById('lainnyaPanel').style.display = which==='lainnya' ? '' : 'none';
  document.getElementById('portalTsPanel').style.display = 'none';
  if(moduleTabBar){ moduleTabBar.style.display = which==='hyosung' ? '' : 'none'; }
  document.body.classList.toggle('brand-lainnya',which==='lainnya');
  const bHyo = document.getElementById('brandBtnHyosung');
  const bLain = document.getElementById('brandBtnLainnya');
  const bPortal = document.getElementById('brandBtnPortalTs');
  if(which==='hyosung'){
    bHyo.style.background='#1565C0'; bHyo.style.color='#F5FAFF'; bHyo.style.border='none';
    bLain.style.background='#fff'; bLain.style.color='#1B2A4A'; bLain.style.border='1px solid #D5DCEA';
    bPortal.style.background='#fff'; bPortal.style.color='#1B2A4A'; bPortal.style.border='1px solid #D5DCEA';
  } else {
    bLain.style.background='#1565C0'; bLain.style.color='#F5FAFF'; bLain.style.border='none';
    bHyo.style.background='#fff'; bHyo.style.color='#1B2A4A'; bHyo.style.border='1px solid #D5DCEA';
    bPortal.style.background='#fff'; bPortal.style.color='#1B2A4A'; bPortal.style.border='1px solid #D5DCEA';
  }
  try{hyoApply();}catch(e){}
}
function showPortalTs(){
  document.body.classList.remove('brand-lainnya');
  document.getElementById('hyosungAppRoot').style.display='none';
  document.getElementById('lainnyaPanel').style.display='none';
  document.getElementById('moduleTabBar').style.display='none';
  document.getElementById('portalTsPanel').style.display='';
  document.getElementById('portalTsHome').style.display='block';
  document.getElementById('portalTsBanks').style.display='none';
  document.getElementById('portalTsFilesView').style.display='none';
  const buttons=[document.getElementById('brandBtnHyosung'),document.getElementById('brandBtnLainnya'),document.getElementById('brandBtnPortalTs')];
  buttons.forEach(button=>{button.style.background='#fff';button.style.color='#1B2A4A';button.style.border='1px solid #D5DCEA';});
  const active=document.getElementById('brandBtnPortalTs');
  active.style.background='#1565C0';active.style.color='#F5FAFF';active.style.border='none';
  try{hyoApply();}catch(e){}
}
function showPortalCategory(category){
  portalCategory=category;
  document.getElementById('portalTsHome').style.display='none';
  document.getElementById('portalTsFilesView').style.display='none';
  if(category==='software'||category==='modul-atm'){
    document.getElementById('portalTsBanks').style.display='block';
    document.getElementById('portalTsBankHeading').textContent=category==='software'?'Software':'Modul ATM';
    document.getElementById('portalTsSoftwareBanks').style.display=category==='software'?'':'none';
    document.getElementById('portalTsModuleCategories').style.display=category==='modul-atm'?'':'none';
    if(category==='modul-atm')renderPortalModuleCategories();
    return;
  }
  document.getElementById('portalTsBanks').style.display='none';
  showPortalFiles(category,'');
}
function backPortalFiles(){
  if(portalCategory==='software'||portalCategory==='modul-atm')showPortalCategory(portalCategory);
  else showPortalTs();
}
function portalModuleCategoryNames(){
  return [...new Set(portalFiles.filter(file=>file.kind==='category'&&file.category==='modul-atm').map(file=>(file.title||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
}
async function renderPortalModuleCategories(){
  const list=document.getElementById('portalTsModuleCategoryList');
  list.textContent='Memuat kategori...';
  try{
    await loadPortalFiles();
    const categories=portalModuleCategoryNames();
    list.replaceChildren();
    if(!categories.length){list.textContent='Belum ada kategori Modul ATM.';return;}
    categories.forEach(name=>{
      const button=document.createElement('button');
      button.type='button';button.className='portal-bank-btn';button.textContent=name;
      button.onclick=()=>showPortalFiles('modul-atm',name);
      list.append(button);
    });
  }catch(error){
    list.textContent='Gagal memuat kategori. Periksa koneksi dan akses Firestore.';
    console.warn('Gagal memuat kategori Modul ATM:',error);
  }
}
async function showPortalFiles(category, bank){
  portalCategory=category;
  portalBank=bank;
  document.getElementById('portalTsHome').style.display='none';
  document.getElementById('portalTsBanks').style.display='none';
  document.getElementById('portalTsFilesView').style.display='block';
  document.getElementById('portalTsFilesTitle').textContent=category==='software'?'Software - '+bank:category==='modul-atm'?'Modul ATM - '+bank:'Tools';
  const controls=document.getElementById('portalSoftwareListControls');
  const pagination=document.getElementById('portalSoftwarePagination');
  controls.style.display='flex';
  pagination.style.display='none';
  document.getElementById('portalSoftwareSearch').value='';
  portalSoftwarePage=1;
  const list=document.getElementById('portalTsFileList');
  list.textContent='Memuat daftar file...';
  if(!window.__fb){list.textContent='Koneksi database belum siap.';return;}
  try{
    portalFiles=await window.__fb.getPortalFiles();
    portalSoftwareMatches=portalFiles.filter(file=>file.kind!=='category'&&file.category===category&&(!['software','modul-atm'].includes(category)||file.bank===bank));
    portalSoftwareMatches.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
    portalUpdateFileList();
  }catch(error){
    list.textContent='Gagal memuat file. Periksa koneksi dan aturan akses Firestore.';
    console.warn('Gagal memuat file Portal TS:',error);
  }
}
function portalRenderFileRows(files){
  const list=document.getElementById('portalTsFileList');
  list.replaceChildren();
  if(!files.length){
    list.textContent=portalSoftwareMatches.length?'Tidak ada file yang cocok dengan pencarian.':'Belum ada file untuk kategori ini.';
    return;
  }
  files.forEach(file=>{
    const row=document.createElement('article');
    row.className='portal-file-row';
    const details=document.createElement('div');
    details.className='portal-file-main';
    const title=document.createElement('div');
    title.textContent=file.title||'File tanpa judul';
    title.className='portal-file-title';
    const description=document.createElement('div');
    description.textContent=file.description||'Tidak ada deskripsi.';
    description.className='portal-file-desc';
    details.append(title,description);
    const safeUrl=portalSafeDriveUrl(file.url||'');
    if(safeUrl){
      const link=document.createElement('a');
      link.href=portalDownloadUrl(safeUrl);
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.addEventListener('click',()=>usageLog({type:'download',brand:'portal',category:portalCategory,bank:portalBank||'',fileId:file.id||'',fileTitle:String(file.title||'').slice(0,120)}));
      link.textContent='⬇ Download';
      link.className='portal-file-btn';
      row.append(details,link);
    }else row.append(details);
    list.append(row);
  });
}
function portalUpdateFileList(){
  const query=document.getElementById('portalSoftwareSearch').value.trim().toLocaleLowerCase();
  const pageSize=Number(document.getElementById('portalSoftwarePageSize').value)||0;
  const filtered=portalSoftwareMatches.filter(file=>`${file.title||''} ${file.description||''}`.toLocaleLowerCase().includes(query));
  const pageCount=pageSize?Math.max(1,Math.ceil(filtered.length/pageSize)):1;
  portalSoftwarePage=Math.min(portalSoftwarePage,pageCount);
  const start=pageSize?(portalSoftwarePage-1)*pageSize:0;
  const visible=pageSize?filtered.slice(start,start+pageSize):filtered;
  portalRenderFileRows(visible);
  const controls=document.getElementById('portalSoftwareListControls');
  const pagination=document.getElementById('portalSoftwarePagination');
  controls.style.display='flex';
  pagination.style.display=filtered.length>pageSize&&pageSize?'flex':'none';
  const rangeStart=filtered.length?start+1:0;
  const rangeEnd=Math.min(start+visible.length,filtered.length);
  document.getElementById('portalSoftwareListMeta').textContent=`Menampilkan ${rangeStart}-${rangeEnd} dari ${filtered.length} hasil`;
  document.getElementById('portalSoftwarePageMeta').textContent=`Halaman ${portalSoftwarePage} dari ${pageCount}`;
  document.getElementById('portalSoftwarePrev').disabled=portalSoftwarePage<=1;
  document.getElementById('portalSoftwareNext').disabled=portalSoftwarePage>=pageCount;
}
function portalChangeFilePage(offset){
  portalSoftwarePage+=offset;
  portalUpdateFileList();
}
function portalDownloadUrl(value){
  try{
    const url=new URL(value);
    if(!['https:','http:'].includes(url.protocol))return '';
    if(['drive.google.com','docs.google.com'].includes(url.hostname)){
      const fileId=url.pathname.match(/\/file\/d\/([^/]+)/)?.[1]||url.searchParams.get('id');
      return fileId?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(fileId):url.href;
    }
    if(/(^|\.)dropbox\.com$/.test(url.hostname)){url.searchParams.set('dl','1');return url.href;} // Dropbox: paksa unduh langsung
    return url.href; // link lain (OneDrive, MediaFire, server sendiri, dll) dipakai apa adanya
  }catch(error){return '';}
}
function portalSafeDriveUrl(value){
  try{
    const url=new URL(value);
    return ['https:','http:'].includes(url.protocol)?url.href:''; // hanya http/https; javascript:, data:, dll ditolak
  }catch(error){return '';}
}
function togglePortalAdminBank(){
  const category=document.getElementById('portalAdminCategory').value;
  document.getElementById('portalAdminBankWrap').style.display=category==='software'?'':'none';
  document.getElementById('portalAdminModuleCategoryWrap').style.display=category==='modul-atm'?'':'none';
  document.getElementById('portalAdminModuleCategoryManager').style.display=category==='modul-atm'?'':'none';
}
function renderPortalAdminModuleCategories(){
  const select=document.getElementById('portalAdminModuleCategory');
  const previous=select.value;
  select.replaceChildren(new Option('Pilih kategori',''));
  const categories=portalModuleCategoryNames();
  categories.forEach(name=>select.add(new Option(name,name)));
  if(categories.includes(previous))select.value=previous;
  const list=document.getElementById('portalAdminModuleCategoryList');
  list.textContent=categories.length?categories.join(' • '):'Belum ada kategori.';
}
async function addPortalModuleCategory(){
  const status=document.getElementById('portalAdminStatus');
  const input=document.getElementById('portalAdminNewModuleCategory');
  const name=input.value.trim();
  if(!currentIsAdmin){status.textContent='Hanya admin yang dapat mengelola kategori.';return;}
  if(!name){status.textContent='Isi nama kategori terlebih dahulu.';return;}
  try{
    await loadPortalFiles();
    if(portalModuleCategoryNames().some(item=>item.toLocaleLowerCase()===name.toLocaleLowerCase())){
      status.textContent='Kategori tersebut sudah ada.';return;
    }
    const id='category-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));
    await window.__fb.savePortalFile(id,{kind:'category',category:'modul-atm',title:name,updatedAt:new Date().toISOString()});
    input.value='';
    status.textContent='Kategori berhasil ditambahkan.';
    await renderPortalAdminFiles();
  }catch(error){
    status.textContent='Gagal menambah kategori. Periksa akses Firestore untuk admin.';
    console.warn('Gagal menambah kategori Modul ATM:',error);
  }
}
function resetPortalAdminForm(){
  portalEditingId='';
  document.getElementById('portalAdminCategory').value='software';
  document.getElementById('portalAdminBank').value='BNI';
  document.getElementById('portalAdminModuleCategory').value='';
  document.getElementById('portalAdminTitle').value='';
  document.getElementById('portalAdminDescription').value='';
  document.getElementById('portalAdminUrl').value='';
  document.getElementById('portalAdminSaveBtn').textContent='Simpan File';
  togglePortalAdminBank();
}
async function loadPortalFiles(){
  if(!window.__fb) throw new Error('Koneksi Firebase belum siap.');
  portalFiles=await window.__fb.getPortalFiles();
  return portalFiles;
}
async function savePortalFile(){
  const status=document.getElementById('portalAdminStatus');
  if(!currentIsAdmin){status.textContent='Hanya admin yang dapat mengelola file.';return;}
  const category=document.getElementById('portalAdminCategory').value;
  const bank=category==='software'?document.getElementById('portalAdminBank').value:category==='modul-atm'?document.getElementById('portalAdminModuleCategory').value:'';
  const title=document.getElementById('portalAdminTitle').value.trim();
  const description=document.getElementById('portalAdminDescription').value.trim();
  const urlValue=document.getElementById('portalAdminUrl').value.trim();
  if(!title||!urlValue){status.textContent='Judul dan link download wajib diisi.';return;}
  if(category==='modul-atm'&&!bank){status.textContent='Pilih kategori Modul ATM terlebih dahulu.';return;}
  let url;
  try{url=new URL(urlValue);}catch(error){status.textContent='Link tidak valid.';return;}
  if(!['https:','http:'].includes(url.protocol)){
    status.textContent='Link harus diawali http:// atau https://';
    return;
  }
  const id=portalEditingId||(crypto.randomUUID?crypto.randomUUID():'file-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  const record={category,bank,title,description,url:url.href,updatedAt:new Date().toISOString()};
  status.textContent='Menyimpan...';
  try{
    await window.__fb.savePortalFile(id,record);
    status.textContent='File berhasil disimpan.';
    resetPortalAdminForm();
    await renderPortalAdminFiles();
    if(document.getElementById('portalTsFilesView').style.display!=='none') await showPortalFiles(portalCategory,portalBank);
  }catch(error){
    status.textContent='Gagal menyimpan. Periksa akses Firestore untuk admin.';
    console.warn('Gagal menyimpan file Portal TS:',error);
  }
}
async function renderPortalAdminFiles(){
  const list=document.getElementById('portalAdminFileList');
  if(!list)return;
  if(!currentIsAdmin){list.textContent='';return;}
  list.textContent='Memuat daftar file...';
  try{
    const files=await loadPortalFiles();
    renderPortalAdminModuleCategories();
    const bankFilter=document.getElementById('portalAdminFileBankFilter');
    const previousBankFilter=bankFilter.value;
    const filterOptions=new Map();
    files.filter(file=>file.kind!=='category').forEach(file=>{
      const value=file.category==='tools'?'tools':`${file.category}:${file.bank||''}`;
      const label=file.category==='software'?'Software / '+file.bank:file.category==='modul-atm'?'Modul ATM / '+file.bank:'Tools';
      filterOptions.set(value,label);
    });
    bankFilter.replaceChildren(new Option('Semua bank/kategori','all'));
    [...filterOptions.entries()].sort((a,b)=>a[1].localeCompare(b[1])).forEach(([value,label])=>bankFilter.add(new Option(label,value)));
    bankFilter.value=filterOptions.has(previousBankFilter)?previousBankFilter:'all';
    filterPortalAdminFiles();
  }catch(error){
    list.textContent='Gagal memuat daftar admin. Periksa koneksi dan aturan akses Firestore.';
    console.warn('Gagal memuat file admin Portal TS:',error);
  }
}
function filterPortalAdminFiles(resetPage=false){
  const list=document.getElementById('portalAdminFileList');
  if(!list)return;
  const search=(document.getElementById('portalAdminFileSearch').value||'').trim().toLocaleLowerCase();
  const category=document.getElementById('portalAdminFileCategoryFilter').value;
  const bankFilter=document.getElementById('portalAdminFileBankFilter');
  let bankCategory=bankFilter.value;
  if(category!=='all'&&bankCategory!=='all'){
    const selectedMenu=bankCategory==='tools'?'tools':bankCategory.split(':',1)[0];
    if(selectedMenu!==category){bankCategory='all';bankFilter.value='all';}
  }
  const maxRows=Number(document.getElementById('portalAdminFileMaxRows').value)||10;
  const matches=portalFiles.filter(file=>{
    if(file.kind==='category')return false;
    if(category!=='all'&&file.category!==category)return false;
    if(bankCategory!=='all'){
      const value=file.category==='tools'?'tools':`${file.category}:${file.bank||''}`;
      if(value!==bankCategory)return false;
    }
    const searchable=[file.title,file.description,file.bank,file.category].join(' ').toLocaleLowerCase();
    return !search||searchable.includes(search);
  }).sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  const count=document.getElementById('portalAdminFileCount');
  const pageSelect=document.getElementById('portalAdminFilePageSelect');
  const totalPages=Math.max(1,Math.ceil(matches.length/maxRows));
  let page=resetPage?1:Number(pageSelect.value)||1;
  page=Math.min(Math.max(page,1),totalPages);
  pageSelect.replaceChildren();
  for(let number=1;number<=totalPages;number++)pageSelect.add(new Option(`Halaman ${number}`,String(number)));
  pageSelect.value=String(page);
  document.getElementById('portalAdminFilePageWrap').style.display=totalPages>1?'block':'none';
  const startIndex=(page-1)*maxRows;
  const endIndex=Math.min(startIndex+maxRows,matches.length);
  count.textContent=matches.length?`Menampilkan ${startIndex+1}-${endIndex} dari ${matches.length} file / Halaman ${page}/${totalPages}`:'Tidak ada file yang cocok.';
  list.replaceChildren();
  if(!matches.length)return;
  matches.slice(startIndex,endIndex).forEach(file=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid #D5DCEA';
      const label=document.createElement('span');
      label.textContent=(file.category==='software'?'Software / '+file.bank:file.category==='modul-atm'?'Modul ATM / '+file.bank:'Tools')+' - '+file.title;
      label.style.cssText='font-size:11px;color:#1A1F36;overflow-wrap:anywhere';
      const actions=document.createElement('div');
      actions.style.cssText='display:flex;gap:6px;flex-shrink:0';
      const edit=document.createElement('button');
      edit.type='button';edit.textContent='Edit';edit.onclick=()=>editPortalFile(file.id);
      const remove=document.createElement('button');
      remove.type='button';remove.textContent='Hapus';remove.style.color='#D32F2F';remove.onclick=()=>deletePortalFile(file.id);
      [edit,remove].forEach(button=>{button.style.cssText+=';padding:5px 8px;border:1px solid #C5D0F0;border-radius:5px;background:#fff;cursor:pointer;font-size:10px';});
      actions.append(edit,remove);row.append(label,actions);list.append(row);
  });
}
function editPortalFile(id){
  const file=portalFiles.find(item=>item.id===id);
  if(!file)return;
  portalEditingId=id;
  document.getElementById('portalAdminCategory').value=file.category;
  togglePortalAdminBank();
  if(file.category==='software')document.getElementById('portalAdminBank').value=file.bank;
  if(file.category==='modul-atm')document.getElementById('portalAdminModuleCategory').value=file.bank||'';
  document.getElementById('portalAdminTitle').value=file.title||'';
  document.getElementById('portalAdminDescription').value=file.description||'';
  document.getElementById('portalAdminUrl').value=file.url||'';
  document.getElementById('portalAdminSaveBtn').textContent='Simpan Perubahan';
  document.getElementById('portalAdminStatus').textContent='Mode edit aktif.';
  document.getElementById('portalAdminTitle').focus();
}
async function deletePortalFile(id){
  if(!currentIsAdmin||!confirm('Hapus file ini dari Portal TS?'))return;
  const status=document.getElementById('portalAdminStatus');
  status.textContent='Menghapus...';
  try{
    await window.__fb.deletePortalFile(id);
    status.textContent='File berhasil dihapus.';
    await renderPortalAdminFiles();
    if(document.getElementById('portalTsFilesView').style.display!=='none') await showPortalFiles(portalCategory,portalBank);
  }catch(error){
    status.textContent='Gagal menghapus. Periksa akses Firestore untuk admin.';
    console.warn('Gagal menghapus file Portal TS:',error);
  }
}
window.addEventListener('message', function(ev){
  var d = ev.data; if(!d || d.fx !== 'overlay') return;
  ['ncrFrame','wincorFrame'].forEach(function(id){
    var f = document.getElementById(id);
    if(!f || f.contentWindow !== ev.source) return;
    var box = f.parentElement;
    if(d.open){ box.style.height = f.offsetHeight + 'px'; f.classList.add('fx-full'); }
    else { f.classList.remove('fx-full'); box.style.height = ''; }
  });
});
function showNcr(){
  document.getElementById('lainnyaBrandList').style.display='none';
  document.getElementById('smartAnalyzerContainer').style.display='none';
  document.getElementById('ncrContainer').style.display='block';
  document.getElementById('wincorContainer').style.display='none';
  if(!ncrLoaded){
    const bytes = Uint8Array.from(atob(NCR_HTML_B64), c=>c.charCodeAt(0));
    const html = new TextDecoder('utf-8').decode(bytes);
    usageWatchFrame(document.getElementById('ncrFrame'),'ncr','m-status');
    document.getElementById('ncrFrame').srcdoc = nwInject(html,'ncr');
    ncrLoaded = true;
  }
}
let wincorLoaded = false;
function showWincor(){
  document.getElementById('lainnyaBrandList').style.display='none';
  document.getElementById('smartAnalyzerContainer').style.display='none';
  document.getElementById('wincorContainer').style.display='block';
  document.getElementById('ncrContainer').style.display='none';
  if(!wincorLoaded){
    const bytes = Uint8Array.from(atob(WINCOR_HTML_B64), c=>c.charCodeAt(0));
    let html = new TextDecoder('utf-8').decode(bytes);
    
    usageWatchFrame(document.getElementById('wincorFrame'),'wincor','cdm-v4');
    document.getElementById('wincorFrame').srcdoc = nwInject(html,'wincor');
    wincorLoaded = true;
  }
}
const NCR_DEVS=[[0,'S1 Dispenser'],[5,'IMCRW/UIMCRW'],[1,'BNA3 (UD-700)'],[2,'BNA2 (UD-686)'],[3,'BNA (UD-10/40/50)'],[4,'GBRU/GBNA'],[6,'Printer 66xx'],[7,'Printer 56xx'],[8,'EPP2 Encryptor'],[9,'EPP Encryptor'],[10,'SDM']];
let ncrDevCur=0;
function ncrDdBuild(){
  const l=document.getElementById('ncrDdList');if(!l||l.dataset.b)return;l.dataset.b='1';
  l.innerHTML=NCR_DEVS.map((d,k)=>(k===2?'<div class="ncr-dd-grp">Perangkat lain</div>':'')+'<button type="button" role="option" class="ncr-dd-opt" data-i="'+d[0]+'" onclick="ncrPickDev('+d[0]+')">'+d[1]+'</button>').join('');
  ncrDdSync(ncrDevCur);
}
function ncrDdSync(i){
  ncrDevCur=i;
  const d=NCR_DEVS.find(x=>x[0]===i)||NCR_DEVS[0];
  const lb=document.getElementById('ncrDdLbl');if(lb)lb.textContent=d[1];
  document.querySelectorAll('#ncrDdList .ncr-dd-opt').forEach(b=>{const on=+b.dataset.i===i;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');});
}
function ncrDdClose(){const l=document.getElementById('ncrDdList'),b=document.getElementById('ncrDdBtn');if(l)l.classList.remove('open');if(b)b.setAttribute('aria-expanded','false');}
function ncrDdToggle(e){
  if(e)e.stopPropagation();ncrDdBuild();
  const l=document.getElementById('ncrDdList'),b=document.getElementById('ncrDdBtn');
  const o=l.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');
  if(o){const on=l.querySelector('.on');if(on)l.scrollTop=Math.max(0,on.offsetTop-80);}
}
document.addEventListener('click',function(e){if(!e.target.closest||!e.target.closest('#ncrDd'))ncrDdClose();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')ncrDdClose();});
function ncrPickDev(i){
  ncrDdClose();ncrDdSync(i);
  if(i===0){ncrSetTab('dispenser',1);return;}
  if(i===5){ncrSetTab('cardreader',1);return;}
  ncrSetTab('lainnya',1);
  try{const s=document.getElementById('ncrFrame').contentDocument.getElementById('devSel');if(s){s.value=String(i);s.dispatchEvent(new Event('change'));}}catch(e){}
}
function ncrSetTab(t,keep){
  if(!keep){ncrDdBuild();if(t==='dispenser')ncrDdSync(0);else if(t==='cardreader')ncrDdSync(5);else if(ncrDevCur===0||ncrDevCur===5)ncrDdSync(1);}
  document.querySelectorAll('.ncr-tab').forEach(b=>{const on=b.dataset.nt===t;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');});
  try{
    const d=document.getElementById('ncrFrame').contentDocument;
    const b=d&&d.querySelector('.tab-btn[data-tab="'+t+'"]');
    if(b&&!b.classList.contains('active'))b.click();
  }catch(e){}
}
function backToBrandList(){
  document.getElementById('ncrContainer').style.display='none';
  document.getElementById('wincorContainer').style.display='none';
  document.getElementById('smartAnalyzerContainer').style.display='none';
  document.getElementById('lainnyaBrandList').style.display='block';
}
function smartReadImage(file){
  if(!file) return;
  smartImageFile=file;
  if(smartImageUrl) URL.revokeObjectURL(smartImageUrl);
  smartImageUrl=URL.createObjectURL(file);
  const preview=document.getElementById('smartPreview');
  preview.src=smartImageUrl;
  preview.style.display='block';
  document.getElementById('smartStatus').textContent='Foto siap dibaca. OCR foto memerlukan koneksi internet.';
  document.getElementById('smartOutput').innerHTML='';
}
function smartLoadOcr(){
  if(window.Tesseract) return Promise.resolve(window.Tesseract);
  if(smartOcrPromise) return smartOcrPromise;
  smartOcrPromise=(async()=>{
    for(const src of ['https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','https://unpkg.com/tesseract.js@5/dist/tesseract.min.js']){
      try{
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');
          script.src=src;
          script.onload=()=>window.Tesseract?resolve():reject(new Error('Library OCR tidak tersedia.'));
          script.onerror=()=>reject(new Error('Gagal memuat library OCR.'));
          document.head.appendChild(script);
        });
        return window.Tesseract;
      }catch(error){}
    }
    throw new Error('OCR gagal dimuat dari CDN. Gunakan Analisa Foto + Problem AI atau tempel teks secara manual.');
  })().catch(error=>{smartOcrPromise=null;throw error;});
  return smartOcrPromise;
}
async function smartRunOcr(){
  const file=smartImageFile;
  const status=document.getElementById('smartStatus');
  const button=document.getElementById('smartOcrBtn');
  if(!file){status.textContent='Pilih foto print history terlebih dahulu.';return;}
  button.disabled=true;
  try{
    status.textContent='Memuat OCR...';
    const ocr=await smartLoadOcr();
    const worker=await ocr.createWorker('eng');
    try{await worker.setParameters({tessedit_char_whitelist:'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-:/.()@ ',preserve_interword_spaces:'1',tessedit_pageseg_mode:'6'});}catch(e){}
    const strips=await smartMakeStrips(file);
    const lines=[];
    for(let i=0;i<strips.length;i++){
      status.textContent=strips.length>1?'Membaca bagian '+(i+1)+' dari '+strips.length+'...':'Membaca foto...';
      const r=await worker.recognize(strips[i]);
      String(r.data.text||'').split(/\r?\n/).forEach(l=>{l=l.trim();if(l&&lines[lines.length-1]!==l)lines.push(l);});
    }
    await worker.terminate();
    const joined=lines.join('\n');
    if(!joined.trim()) throw new Error('OCR tidak menemukan teks. Coba foto lebih tajam atau gunakan Analisa Foto + Problem AI.');
    document.getElementById('smartHistoryText').value=joined;
    status.textContent='OCR selesai. Periksa teks yang terbaca, lalu pilih Analisa Riwayat.';
  }catch(error){
    status.textContent=error.message||'Foto gagal dibaca. Tempel teks print history secara manual.';
  }finally{button.disabled=false;}
}
function smartParseHistory(text){
  const rows=[];
  const datePattern=/(\d{2,4})[-/.](\d{1,2})[-/.](\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})/;
  text.split(/\r?\n/).forEach((line,index)=>{
    const match=line.match(datePattern);
    if(!match) return;
    const year=Number(match[1])<100?2000+Number(match[1]):Number(match[1]);
    const date=[year,Number(match[2]),Number(match[3])].map((part,i)=>String(part).padStart(i===0?4:2,'0')).join('-');
    const time=[match[4],match[5],match[6]].map(part=>String(Number(part)).padStart(2,'0')).join(':');
    const tail=line.slice((match.index||0)+match[0].length).replace(/\bVDM\b/ig,' ');
    const codes=(tail.match(/[A-Z0-9@]{5,10}/ig)||[]).filter(code=>code.toUpperCase()!=='VDM');
    if(!codes.length) return;
    const code=codes[codes.length-1].toUpperCase();
    rows.push({date,time,code,line:line.trim(),index});
  });
  return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.index-b.index);
}
function smartNormalizeCode(value){return String(value||'').toUpperCase().replace(/[^A-Z0-9@]/g,'');}
function smartIsTransactionCode(code){return '12347K'.includes(smartNormalizeCode(code)[1]||'');}
function smartFindError(code,kind){
  const source=kind==='brm860'?['brm860']:kind==='brm50'?['brm50']:['extra','cdu10','cdu30','cdu800'];
  const normalized=smartNormalizeCode(code);
  for(const key of source){
    const found=(DB[key]||[]).find(row=>smartNormalizeCode(row.k)===normalized);
    if(found) return smartAbbrRow(found);
  }
  for(const key of source){
    const w=(DB[key]||[]).find(row=>cduWild(row.k,normalized));
    if(w) return smartAbbrRow(w);
  }
  return null;
}
function smartEditDistance(left,right){
  const previous=Array.from({length:right.length+1},(_,index)=>index);
  for(let i=1;i<=left.length;i++){
    let diagonal=previous[0];
    previous[0]=i;
    for(let j=1;j<=right.length;j++){
      const above=previous[j];
      previous[j]=Math.min(previous[j]+1,previous[j-1]+1,diagonal+(left[i-1]===right[j-1]?0:1));
      diagonal=above;
    }
  }
  return previous[right.length];
}
function smartFindSimilarErrors(code,kind){
  const normalized=smartNormalizeCode(code);
  if(normalized.length<6)return [];
  const source=kind==='brm860'?['brm860']:kind==='brm50'?['brm50']:['extra','cdu10','cdu30','cdu800'];
  const matches=[];
  source.forEach(key=>(DB[key]||[]).forEach(row=>{
    const candidate=smartNormalizeCode(row.k);
    if(candidate===normalized||Math.abs(candidate.length-normalized.length)>1)return;
    if(smartEditDistance(normalized,candidate)===1)matches.push(row);
  }));
  const unique=new Map(matches.map(row=>[row.k,smartAbbrRow(row)]));
  return [...unique.values()].slice(0,3);
}
function smartEscape(value){return String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function smartAnalyze(){
  const text=document.getElementById('smartHistoryText').value;
  const kind=document.getElementById('smartModule').value;
  const output=document.getElementById('smartOutput');
  const status=document.getElementById('smartStatus');
  const rows=smartParseHistory(text);
  if(!rows.length){status.textContent='Tidak menemukan baris tanggal, waktu, dan kode. Periksa teks hasil OCR atau masukkan teks secara manual.';output.innerHTML='';return;}
  usageLog({type:'smart_analyze',brand:'smart',module:kind,mode:'riwayat',results:rows.length,query:'riwayat '+kind});
  const firstDate=rows[0].date;
  const firstDay=rows.filter(row=>row.date===firstDate);
  const transaction=firstDay.find(row=>smartIsTransactionCode(row.code));
  const selected=transaction||firstDay[0];
  const record=smartFindError(selected.code,kind);
  const label=transaction?'Prioritas transaksi':'Error modul pertama';
  const className=transaction?'transaction':'module';
  const recordHtml=record?`<p><b>Modul:</b> ${smartEscape(record.m||'—')}</p><p><b>Deskripsi:</b> ${smartEscape(record.d||'—')}</p><p><b>Analisa:</b> ${smartEscape(record.p||'—')}</p><p><b>Tindakan:</b> ${smartEscape(record.t||'—')}</p>`:'<p>Kode tidak ditemukan di database lokal untuk pilihan modul ini. Kode dan waktu tetap ditampilkan untuk pemeriksaan manual.</p>';
  output.innerHTML=`<div class="smart-result ${className}"><h3>${label}: ${smartEscape(selected.code)}</h3><p><b>Hari awal:</b> ${smartEscape(selected.date)} ${smartEscape(selected.time)}</p><p><b>Digit/karakter kedua:</b> ${smartEscape(selected.code[1]||'—')} ${transaction?'(termasuk 1, 2, 3, 4, 7, K)':'(bukan kode prioritas transaksi)'}</p>${recordHtml}</div><p style="font-size:12px;font-weight:700;margin:12px 0 6px">Riwayat pada hari awal (${firstDay.length} baris)</p><ol class="smart-log-list">${firstDay.map(row=>`<li>${smartEscape(row.time)} | ${smartEscape(row.code)}${smartIsTransactionCode(row.code)?' — transaksi':''}</li>`).join('')}</ol>`;
  status.textContent=`Terbaca ${rows.length} baris pada ${new Set(rows.map(row=>row.date)).size} hari. Fokus analisa menggunakan hari paling awal: ${firstDate}.`;
}
const SMART_AI_CONFIG_KEY='atm_smart_ai_config';
const SMART_AI_SESSION_KEY='atm_smart_ai_api_key';
const SMART_AI_ACTIVE_API_KEY='atm_smart_ai_active_api';
let smartAiSettings={apis:[],vision:true};
function toggleAdminAiSettings(){
  const panel=document.getElementById('adminAiSettings');
  const open=panel.style.display!=='block';
  panel.style.display=open?'block':'none';
  const tg=document.getElementById('adminAiToggle');if(tg)tg.setAttribute('aria-expanded',String(open));
  if(open) loadAdminAiSettings();
}
const AI_MAX=99;
/* daftar provider. kind: gemini | claude | oa (format OpenAI /chat/completions). extra: kolom tambahan (Account ID / Base URL) */
const AI_PROVIDERS={
  gemini:{n:'Google Gemini',kind:'gemini',models:['gemini-2.0-flash','gemini-1.5-flash']},
  claude:{n:'Anthropic Claude',kind:'claude',models:['claude-3-5-haiku-latest','claude-3-5-sonnet-latest']},
  openrouter:{n:'OpenRouter (model :free)',kind:'oa',base:'https://openrouter.ai/api/v1',models:['meta-llama/llama-3.3-70b-instruct:free','deepseek/deepseek-chat-v3-0324:free','qwen/qwen2.5-vl-72b-instruct:free']},
  groq:{n:'Groq (gratis)',kind:'oa',base:'https://api.groq.com/openai/v1',models:['llama-3.3-70b-versatile','llama-3.1-8b-instant','meta-llama/llama-4-scout-17b-16e-instruct']},
  cloudflare:{n:'Cloudflare Workers AI (gratis)',kind:'oa',extra:'Account ID',models:['@cf/meta/llama-3.3-70b-instruct-fp8-fast','@cf/meta/llama-3.2-11b-vision-instruct']},
  mistral:{n:'Mistral (tier gratis)',kind:'oa',base:'https://api.mistral.ai/v1',models:['mistral-small-latest','open-mistral-nemo']},
  cerebras:{n:'Cerebras (gratis)',kind:'oa',base:'https://api.cerebras.ai/v1',models:['llama-3.3-70b','llama3.1-8b']},
  sambanova:{n:'SambaNova (gratis)',kind:'oa',base:'https://api.sambanova.ai/v1',models:['Meta-Llama-3.3-70B-Instruct']},
  huggingface:{n:'Hugging Face (gratis)',kind:'oa',base:'https://router.huggingface.co/v1',models:['meta-llama/Llama-3.3-70B-Instruct']},
  custom:{n:'OpenAI-compatible (URL sendiri)',kind:'oa',extra:'Base URL (https://.../v1)',models:[]}
};
function smartNormalizeAiApis(apis){
  return (Array.isArray(apis)?apis:[]).slice(0,AI_MAX).map(api=>({
    provider:AI_PROVIDERS[api.provider]?api.provider:'gemini',
    model:String(api.model||''),
    apiKey:String(api.apiKey||''),
    extra:String(api.extra||'')
  }));
}
function smartAiBase(c){
  const p=AI_PROVIDERS[c.provider]||{};
  if(c.provider==='cloudflare')return 'https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(String(c.extra||'').trim())+'/ai/v1';
  if(c.provider==='custom')return String(c.extra||'').trim().replace(/\/+$/,'');
  return p.base||'';
}
function smartReadLegacyAiSettings(){
  let config={};
  try{config=JSON.parse(localStorage.getItem(SMART_AI_CONFIG_KEY)||'{}');}catch(error){}
  const apiKey=sessionStorage.getItem(SMART_AI_SESSION_KEY)||'';
  return {apis:config.model&&apiKey?[{provider:config.provider,model:config.model,apiKey}]:[],vision:config.vision!==false};
}
function smartAiDatalists(){
  let box=document.getElementById('aiModelLists');
  if(box)return;
  box=document.createElement('div');box.id='aiModelLists';box.style.display='none';
  box.innerHTML=Object.keys(AI_PROVIDERS).map(k=>'<datalist id="aiml_'+k+'">'+AI_PROVIDERS[k].models.map(m=>'<option value="'+m.replace(/"/g,'&quot;')+'">').join('')+'</datalist>').join('');
  document.body.appendChild(box);
}
function smartAiExtraUi(provider,extraEl){
  const x=(AI_PROVIDERS[provider]||{}).extra;
  extraEl.disabled=!x;extraEl.placeholder=x||'-';
  if(!x)extraEl.value='';
}
function smartRenderAdminAiApis(apis){
  smartAiDatalists();
  const list=document.getElementById('adminAiApiList');
  list.replaceChildren();
  const cols='1.25fr 1.25fr 1.3fr 1fr auto';
  apis.forEach((api,index)=>{
    const row=document.createElement('div');
    row.className='admin-ai-api-row';
    row.style.cssText='display:grid;grid-template-columns:'+cols+';gap:8px;align-items:end;padding:10px 0;border-bottom:1px solid #C5D0F0';
    const fld='width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #A8B8E8;border-radius:6px;background:#fff;color:#1A1F36;font-family:var(--ui-font)';
    const provider=document.createElement('select');
    provider.setAttribute('aria-label',`Provider API ${index+1}`);
    provider.style.cssText=fld;
    provider.innerHTML=Object.keys(AI_PROVIDERS).map(k=>'<option value="'+k+'">'+AI_PROVIDERS[k].n+'</option>').join('');
    provider.value=AI_PROVIDERS[api.provider]?api.provider:'gemini';
    const model=document.createElement('input');
    model.type='text';model.placeholder='Model ID';model.value=api.model;
    model.setAttribute('aria-label',`Model ID API ${index+1}`);
    model.setAttribute('list','aiml_'+provider.value);
    model.style.cssText=fld;
    const key=document.createElement('input');
    key.type='password';key.autocomplete='new-password';key.placeholder='API key';key.value=api.apiKey;
    key.setAttribute('aria-label',`API key ${index+1}`);
    key.style.cssText=fld;
    const extra=document.createElement('input');
    extra.type='text';extra.value=api.extra||'';
    extra.setAttribute('aria-label',`Data tambahan API ${index+1}`);
    extra.style.cssText=fld;
    smartAiExtraUi(provider.value,extra);
    provider.addEventListener('change',()=>{model.setAttribute('list','aiml_'+provider.value);smartAiExtraUi(provider.value,extra);});
    const remove=document.createElement('button');
    remove.type='button';remove.textContent='Hapus';
    remove.style.cssText='padding:8px 10px;border:1px solid #D32F2F;border-radius:6px;background:#fff;color:#D32F2F;font-size:11px;cursor:pointer';
    remove.addEventListener('click',()=>{
      const current=smartReadAdminAiForm();
      current.apis.splice(index,1);
      smartRenderAdminAiApis(current.apis);
      document.getElementById('adminAiVision').checked=current.vision;
    });
    row.append(provider,model,key,extra,remove);
    list.appendChild(row);
  });
  document.getElementById('adminAiAddApiBtn').disabled=apis.length>=AI_MAX;
  const cn=document.getElementById('adminAiCount');if(cn)cn.textContent=apis.length+' / '+AI_MAX+' API';
}
function smartReadAdminAiForm(){
  return {
    apis:[...document.querySelectorAll('.admin-ai-api-row')].map(row=>{
      const ins=row.querySelectorAll('input');
      return {
        provider:row.querySelector('select').value,
        model:ins[0].value.trim(),
        apiKey:ins[1].value.trim(),
        extra:ins[2].value.trim()
      };
    }),
    vision:document.getElementById('adminAiVision').checked
  };
}
function addAdminAiApi(n){
  const current=smartReadAdminAiForm();
  const add=Math.min(Math.max(1,n||1),AI_MAX-current.apis.length);
  for(let i=0;i<add;i++)current.apis.push({provider:'groq',model:'',apiKey:'',extra:''});
  smartRenderAdminAiApis(current.apis);
  document.getElementById('adminAiVision').checked=current.vision;
}
async function loadAdminAiSettings(){
  const status=document.getElementById('adminAiStatus');
  status.textContent='Memuat konfigurasi API dari Firebase...';
  try{
    const saved=await window.__fb.getAiConfig();
    smartAiSettings=saved?{apis:smartNormalizeAiApis(saved.apis),vision:saved.vision!==false}:smartReadLegacyAiSettings();
    smartRenderAdminAiApis(smartAiSettings.apis);
    document.getElementById('adminAiVision').checked=smartAiSettings.vision;
    status.textContent=saved?'Konfigurasi API dimuat dari Firebase.':'Belum ada konfigurasi di Firebase. Simpan untuk mengaktifkan daftar API.';
  }catch(error){
    status.textContent=`Gagal memuat konfigurasi Firebase: ${error.message||'periksa koneksi dan Firestore Rules.'}`;
  }
}
async function saveAdminAiSettings(){
  if(!currentIsAdmin){alert('Hanya Admin yang dapat mengubah konfigurasi AI.');return;}
  const status=document.getElementById('adminAiStatus');
  const settings=smartReadAdminAiForm();
  if(!settings.apis.length||settings.apis.some(api=>!api.model||!api.apiKey)){
    status.textContent='Tambahkan minimal satu API dan lengkapi Model ID serta API key setiap baris.';return;
  }
  if(settings.apis.length>AI_MAX){status.textContent='Maksimal '+AI_MAX+' API dapat disimpan.';return;}
  {const bad=settings.apis.findIndex(a=>{const x=(AI_PROVIDERS[a.provider]||{}).extra;return x&&(!a.extra||(a.provider==='custom'&&!/^https:\/\//i.test(a.extra)));});
   if(bad>=0){status.textContent='Baris '+(bad+1)+': isi '+AI_PROVIDERS[settings.apis[bad].provider].extra+' dengan benar.';return;}}
  if(!window.__fb){status.textContent='Firebase belum siap. Konfigurasi belum disimpan.';return;}
  status.textContent='Menyimpan konfigurasi ke Firebase...';
  try{
    await window.__fb.saveAiConfig(settings);
    smartAiSettings={apis:smartNormalizeAiApis(settings.apis),vision:settings.vision};
    localStorage.removeItem(SMART_AI_CONFIG_KEY);
    sessionStorage.removeItem(SMART_AI_SESSION_KEY);
    status.textContent=`Berhasil menyimpan ${settings.apis.length} API ke Firebase.`;
  }catch(error){status.textContent=`Gagal menyimpan ke Firebase: ${error.message||'periksa Firestore Rules dan koneksi.'}`;}
}
async function clearAdminAiSettings(){
  if(!currentIsAdmin){alert('Hanya Admin yang dapat mengubah konfigurasi AI.');return;}
  const status=document.getElementById('adminAiStatus');
  try{
    await window.__fb.deleteAiConfig();
    smartAiSettings={apis:[],vision:true};
    smartRenderAdminAiApis([]);
    document.getElementById('adminAiVision').checked=true;
    localStorage.removeItem(SMART_AI_CONFIG_KEY);
    localStorage.removeItem(SMART_AI_ACTIVE_API_KEY);
    sessionStorage.removeItem(SMART_AI_SESSION_KEY);
    status.textContent='Konfigurasi API dihapus dari Firebase.';
  }catch(error){status.textContent=`Gagal menghapus konfigurasi Firebase: ${error.message||'periksa koneksi dan Firestore Rules.'}`;}
}
async function smartFileAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=()=>reject(new Error('Foto gagal dibaca dari perangkat.'));
    reader.readAsDataURL(file);
  });
}
async function smartPrepareVisionImage(file,maxSide){
  if(!file||!file.type.startsWith('image/')) throw new Error('Pilih file gambar yang valid (JPG, PNG, WebP, atau format foto yang didukung browser).');
  let bitmap;
  try{bitmap=await createImageBitmap(file);}catch(error){throw new Error('Browser tidak dapat membuka foto ini. Simpan ulang sebagai JPG atau PNG, lalu coba lagi.');}
  const lim=maxSide||1600;
  const scale=Math.min(1,lim/bitmap.width,lim/bitmap.height);
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.88));
  if(!blob) throw new Error('Gagal mengubah foto ke format JPEG. Coba foto JPG atau PNG.');
  return smartFileAsDataUrl(blob);
}
function smartAiError(response,payload,provider){
  const detail=payload?.error?.message||payload?.message||'';
  if(response.status===401) return 'API key tidak valid atau sudah dicabut. Periksa API key di Admin > Konfigurasi AI Vision.';
  if(response.status===403) return 'Akses ditolak provider. Periksa izin API, billing, dan pembatasan key/domain.';
  if(response.status===404) return `Model "${provider}" tidak ditemukan atau tidak mendukung Vision. Periksa Model ID di Admin.`;
  if(response.status===429) return 'Kuota atau rate limit provider tercapai. Periksa billing/kuota dan coba lagi nanti.';
  if(response.status===400&&detail) return `Request ditolak provider: ${detail}`;
  if(response.status>=500) return `Server provider sedang bermasalah (HTTP ${response.status}). Coba lagi nanti.`;
  return detail||`Provider menolak request (HTTP ${response.status}). Periksa model, key, dan pengaturan API.`;
}
async function smartRequestAi(config,apiKey,prompt,file,opts){
  opts=opts||{};
  let imageData=null;
  if(file){
    try{
      const dataUrl=await smartPrepareVisionImage(file,opts.maxSide);
      const match=dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if(!match) throw new Error('Foto tidak bisa dikonversi ke JPEG untuk Vision.');
      imageData={mimeType:match[1],data:match[2]};
    }catch(e){e.fatal=true;throw e;}
  }
  const P=AI_PROVIDERS[config.provider]||AI_PROVIDERS.gemini;
  let endpoint,headers,body,provider=P.n.replace(/\s*\(.*$/,'');
  if(P.kind==='claude'){
    endpoint='https://api.anthropic.com/v1/messages';
    headers={'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'};
    const content=[];
    if(imageData) content.push({type:'image',source:{type:'base64',media_type:imageData.mimeType,data:imageData.data}});
    content.push({type:'text',text:prompt});
    body={model:config.model,max_tokens:opts.maxTokens||1800,messages:[{role:'user',content}]};
  }else if(P.kind==='oa'){
    const base=smartAiBase(config);
    if(!base)throw Object.assign(new Error('Alamat API '+provider+' belum lengkap (Account ID / Base URL).'),{fatal:false,status:400});
    endpoint=base+'/chat/completions';
    headers={'content-type':'application/json','authorization':'Bearer '+apiKey};
    if(config.provider==='openrouter'){headers['HTTP-Referer']=location.origin&&location.origin!=='null'?location.origin:'https://citius.local';headers['X-Title']='Citius Portal Technical Support';}
    const content=imageData?[{type:'text',text:prompt},{type:'image_url',image_url:{url:'data:'+imageData.mimeType+';base64,'+imageData.data}}]:prompt;
    body={model:config.model,messages:[{role:'user',content}],max_tokens:opts.maxTokens||1800,temperature:opts.temperature!=null?opts.temperature:0.2};
  }else{
    const model=config.model.replace(/^models\//,'');
    endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    headers={'content-type':'application/json','x-goog-api-key':apiKey};
    const parts=[{text:prompt}];
    if(imageData) parts.push({inline_data:{mime_type:imageData.mimeType,data:imageData.data}});
    body={contents:[{parts}],generationConfig:{temperature:opts.temperature!=null?opts.temperature:0.2,maxOutputTokens:opts.maxTokens||1800}};
  }
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),opts.timeoutMs||60000);
  try{
    const response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok){
      const error=new Error(smartAiError(response,payload,provider));
      error.status=response.status;
      throw error;
    }
    let answer;
    if(P.kind==='claude')answer=(payload.content||[]).filter(part=>part.type==='text').map(part=>part.text).join('\n').trim();
    else if(P.kind==='oa'){const c=payload.choices&&payload.choices[0]&&payload.choices[0].message?payload.choices[0].message.content:'';answer=(Array.isArray(c)?c.map(x=>x.text||'').join('\n'):String(c||'')).trim();}
    else answer=(payload.candidates?.[0]?.content?.parts||[]).map(part=>part.text||'').join('\n').trim();
    if(!answer){
      const block=payload.promptFeedback?.blockReason;
      throw new Error(block?`Provider memblokir input (${block}). Periksa foto/teks yang dikirim.`:'Provider tidak mengembalikan jawaban teks. Periksa Model ID dan dukungan output teks.');
    }
    return answer;
  }catch(error){
    if(error.name==='AbortError'){const e=new Error('Permintaan melewati batas waktu. Coba foto yang lebih kecil atau periksa koneksi internet.');e.status=0;throw e;}
    if(error instanceof TypeError){const e=new Error('Tidak dapat menjangkau API '+provider+' dari browser (koneksi atau CORS provider).');e.status=0;throw e;}
    throw error;
  }finally{clearTimeout(timeout);}
}
/* Failover: beralih ke API berikutnya bila gagal. Maksimal AI_TRY API dicoba per permintaan; API yang kena rate limit (429) dilewati 60 detik. */
const AI_TRY=15;
const __aiCool={};
async function smartRequestAiWithFailover(apis,prompt,file,opts){
  const available=smartNormalizeAiApis(apis).filter(api=>api.model&&api.apiKey);
  if(!available.length)throw new Error('Belum ada API AI dengan Model ID dan API key yang lengkap.');
  const savedIndex=Number(localStorage.getItem(SMART_AI_ACTIVE_API_KEY)||0);
  const start=Number.isInteger(savedIndex)&&savedIndex>=0?savedIndex%available.length:0;
  const failures=[];
  const now=Date.now();
  const order=[];
  for(let o=0;o<available.length;o++){const i=(start+o)%available.length;order.push(i);}
  const ck=i=>available[i].provider+'|'+available[i].model+'|'+available[i].apiKey.slice(-6);
  const hot=order.filter(i=>!(__aiCool[ck(i)]>now)),cold=order.filter(i=>__aiCool[ck(i)]>now);
  const queue=hot.concat(cold).slice(0,AI_TRY);
  const o2=Object.assign({},opts||{});
  if(available.length>3&&!o2.timeoutMs)o2.timeoutMs=30000;
  for(const index of queue){
    const config=available[index];
    const label=(AI_PROVIDERS[config.provider]||{n:config.provider}).n.replace(/\s*\(.*$/,'');
    try{
      const answer=await smartRequestAi(config,config.apiKey,prompt,file,o2);
      localStorage.setItem(SMART_AI_ACTIVE_API_KEY,String(index));
      return {answer,provider:label,model:config.model};
    }catch(error){
      failures.push(`${label} ${config.model}: ${error.message}`);
      if(error.status===429)__aiCool[ck(index)]=Date.now()+60000;
      if(error.fatal)throw error;
    }
  }
  throw new Error(`Semua API yang dicoba gagal (${failures.length} dari ${available.length}). ${failures.slice(0,4).join(' | ')}${failures.length>4?' | ...':''}`);
}

/* ===== SMART ANALYZER: PEMBACAAN STRUK (potong bagian + format baris + koreksi kode) ===== */
async function smartMakeStrips(file){
  if(!file||!file.type||!file.type.startsWith('image/'))throw new Error('Pilih file gambar yang valid (JPG, PNG, atau WebP).');
  let bm;
  try{bm=await createImageBitmap(file);}catch(e){throw new Error('Browser tidak dapat membuka foto ini. Simpan ulang sebagai JPG atau PNG, lalu coba lagi.');}
  const W=bm.width,H=bm.height;
  const enh=async(sy,sh)=>{
    const up=Math.min(2.5,Math.max(1,1500/W));
    let tw=Math.round(W*up),th=Math.round(sh*up);
    const k=Math.min(1,2400/Math.max(tw,th));tw=Math.round(tw*k);th=Math.round(th*k);
    const c=document.createElement('canvas');c.width=tw;c.height=th;
    const x=c.getContext('2d');
    try{x.filter='grayscale(1) contrast(1.4) brightness(1.05)';}catch(e){}
    x.imageSmoothingQuality='high';
    x.drawImage(bm,0,sy,W,sh,0,0,tw,th);
    return new Promise(r=>c.toBlob(b=>r(b),'image/jpeg',0.92));
  };
  const out=[];
  try{
    const sh=Math.round(W*1.25);
    if(H>W*1.5&&H>sh){
      const step=Math.round(sh*0.8);
      const n=Math.min(7,Math.ceil((H-sh)/step)+1);
      for(let i=0;i<n;i++){const sy=Math.max(0,Math.min(i*step,H-sh));out.push(await enh(sy,sh));}
    }else out.push(await enh(0,H));
  }finally{try{bm.close();}catch(e){}}
  if(!out.length||out.some(b=>!b))throw new Error('Gagal menyiapkan foto. Coba foto JPG atau PNG.');
  return out;
}
const SMART_CONF_GROUPS=[['0','O','D','Q'],['1','I','L'],['5','S'],['8','B'],['2','Z'],['6','G']];
function smartConfusable(a,b){return a===b||SMART_CONF_GROUPS.some(g=>g.includes(a)&&g.includes(b));}
function smartCorrectCode(code,kind){
  const n=smartNormalizeCode(code);
  if(n.length<5||smartFindError(n,kind))return null;
  const source=kind==='brm860'?['brm860']:kind==='brm50'?['brm50']:['extra','cdu10','cdu30','cdu800'];
  const hits=new Map();
  source.forEach(key=>(DB[key]||[]).forEach(row=>{
    const c=smartNormalizeCode(row.k);
    if(c.length!==n.length)return;
    let diff=0;
    for(let i=0;i<n.length;i++){if(c[i]!==n[i]){if(!smartConfusable(c[i],n[i]))return;if(++diff>2)return;}}
    if(diff)hits.set(c,row);
  }));
  return hits.size===1?[...hits.values()][0]:null;
}
function smartBuildLinePrompt(kind,text,part,total){
  return `Anda membaca foto struk/layar print history error ATM Hyosung (modul ${kind}). Foto ${total>1?`ini adalah bagian ${part} dari ${total} potongan foto yang saling tumpang tindih; baca SEMUA baris pada potongan ini`:'ini'}. Tugas: salin setiap baris error persis seperti tercetak. Jangan menganalisa dan jangan memberi saran.

ATURAN BACA:
- Tanggal pada struk berformat YY-MM-DD (dua digit tahun). Contoh: 20-11-10 = 2020-11-10; 26-10-14 = 2026-10-14. Judul struk seperti "DATE: 11/10/2020" hanya konteks.
- Setelah jam mungkin ada penanda seperti (VDM), S, atau P. Abaikan penanda itu. Kode error ada di kolom paling kanan.
- Kode error selalu 7 karakter, huruf besar dan angka, contoh: 5D0N800, 59CGQ00, 5A6B300, 5D62Z00, 52GB400, 5400200, 53F1500. Bedakan dengan teliti angka 0 dan huruf O/D/Q, angka 5 dan huruf S, angka 8 dan huruf B, angka 2 dan huruf Z, angka 1 dan huruf I/L, angka 6 dan huruf G.
- Baris yang berulang tetap ditulis satu per satu. Jangan menggabung dan jangan melewatkan baris. Jangan membuat baris dari bayangan atau jari.
- Bila ada karakter ragu, tetap tulis tebakan terbaik dengan keyakinan lebih rendah. Jangan mengosongkan kode.

FORMAT KELUARAN: satu baris per kejadian, tanpa JSON, tanpa markdown, tanpa kata pengantar:
YYYY-MM-DD HH:MM:SS | KODE7KARAKTER | KEYAKINAN% | catatan singkat bila ada (mis. ragu 0 atau O)
Bila baris terlihat tetapi tanggal atau kode tidak terbaca, tulis TIDAK TERBACA | teks yang tampak.

Teks OCR petunjuk (boleh salah, jangan dipercaya bila bertentangan dengan foto):
${text||'(tidak ada)'}`;
}
function smartRepairJsonEvents(t){
  const a=t.indexOf('{');if(a<0)return null;
  let body=t.slice(a);
  try{return JSON.parse(body.slice(0,body.lastIndexOf('}')+1));}catch(e){}
  const cut=body.lastIndexOf('},');
  if(cut>0){try{return JSON.parse(body.slice(0,cut+1)+']}');}catch(e){}}
  return null;
}
function smartParseVisionAnswer(answer){
  const txt=String(answer||'').replace(/```[a-z]*/gi,'');
  const ev=[];
  const dt=/(\d{2,4})\s*[-\/.]\s*(\d{1,2})\s*[-\/.]\s*(\d{1,2})[T\s|,]+(\d{1,2})\s*[:.]\s*(\d{2})\s*[:.]\s*(\d{2})/;
  txt.split(/\r?\n/).forEach(line=>{
    const m=line.match(dt);if(!m)return;
    let y=Number(m[1]);if(y<100)y+=2000;
    const mo=Number(m[2]),d=Number(m[3]);
    if(mo<1||mo>12||d<1||d>31||Number(m[4])>23||Number(m[5])>59||Number(m[6])>59)return;
    const p2=n=>String(n).padStart(2,'0');
    const date=y+'-'+p2(mo)+'-'+p2(d),time=p2(m[4])+':'+p2(m[5])+':'+p2(m[6]);
    const rest=line.slice((m.index||0)+m[0].length);
    const toks=(rest.indexOf('|')>=0?rest.split('|'):rest.split(/\s+/)).map(x=>x.trim()).filter(Boolean);
    let code='',conf=null;const note=[];
    toks.forEach(t=>{
      const pm=t.match(/^(\d{1,3})\s*%$/);
      if(pm&&conf===null){conf=Math.min(1,Number(pm[1])/100);return;}
      const c=smartNormalizeCode(t);
      if(!code&&/^[A-Z0-9@]{5,10}$/.test(c)&&/\d/.test(c)&&!/^(VDM|CDM|BNA)$/.test(c)){code=c;return;}
      if(/^TIDAKTERBACA$/.test(c))return;
      note.push(t);
    });
    if(conf===null)conf=code?0.9:0.3;
    if(code&&code.length!==7)conf=Math.min(conf,0.6);
    ev.push({date,time,code,raw:line.trim().slice(0,200),confidence:conf});
  });
  if(!ev.length&&txt.indexOf('{')>=0){
    const p=smartRepairJsonEvents(txt);
    if(p&&Array.isArray(p.events))p.events.forEach(e=>{
      const code=smartNormalizeCode(e.code),cf=Number(e.confidence);
      ev.push({date:String(e.date||'Tidak terbaca'),time:String(e.time||'Tidak terbaca'),code:/^[A-Z0-9@]{5,10}$/.test(code)?code:'',raw:String(e.raw||''),confidence:Number.isFinite(cf)?Math.max(0,Math.min(1,cf)):0});
    });
  }
  return ev;
}
async function smartExtractEvents(apis,kind,text,file,setStatus){
  const strips=await smartMakeStrips(file);
  const merged=new Map();let lastErr=null,ok=0;
  for(let i=0;i<strips.length;i++){
    setStatus(strips.length>1?`Tahap 1/2: membaca bagian ${i+1} dari ${strips.length} foto...`:'Tahap 1/2: membaca tanggal dan kode langsung dari foto...');
    let res;
    try{res=await smartRequestAiWithFailover(apis,smartBuildLinePrompt(kind,text,i+1,strips.length),strips[i],{maxTokens:6144,maxSide:2400,temperature:0});ok++;}
    catch(e){lastErr=e;if(strips.length===1)throw e;continue;}
    smartParseVisionAnswer(res.answer).forEach(e=>{
      const key=e.date+' '+e.time,old=merged.get(key);
      if(!old||e.confidence>old.confidence||(e.code&&!old.code))merged.set(key,e);
    });
  }
  if(!ok&&lastErr)throw lastErr;
  const events=[...merged.values()];
  if(!events.length)throw new Error('AI tidak menemukan baris tanggal dan kode pada foto. Pastikan foto tegak, tajam, tanpa bayangan, dan baris error terlihat jelas. Bisa juga tempel teks print history secara manual.');
  events.forEach((e,i)=>{
    e.index=i;
    if(!e.code)return;
    const fix=smartCorrectCode(e.code,kind);
    if(fix){const orig=e.code;e.code=smartNormalizeCode(fix.k);e.corrected=orig;e.confidence=Math.max(e.confidence,0.8);e.raw=(e.raw||'')+' [dikoreksi otomatis dari '+orig+' berdasarkan database]';}
  });
  return events.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.index-b.index);
}
function smartBuildVisionExtractionPrompt(kind,text){
  return `Baca foto print/error history ATM untuk modul ${kind}. Foto adalah sumber utama; teks OCR tambahan mungkin salah dan hanya boleh dipakai sebagai petunjuk. Jangan menganalisa atau menebak solusi pada tahap ini. Salin setiap baris error yang terbaca secara literal, terutama tanggal, waktu, kode error, dan penanda modul. Jangan mengubah karakter kode yang meragukan. Jika karakter tidak jelas, tulis null untuk code dan jelaskan bagian tidak jelas dalam raw.\n\nKembalikan JSON valid saja dengan bentuk {"events":[{"date":"YYYY-MM-DD atau null","time":"HH:MM:SS atau null","code":"kode persis atau null","raw":"potongan baris","confidence":0.0}]}. confidence adalah 0 sampai 1 berdasarkan keterbacaan. Urutkan dari yang paling awal bila tanggal-waktu terbaca. Maksimal 60 kejadian; jangan membuat baris dari bayangan/refleksi atau teks yang tidak tampak.\n\nTeks OCR petunjuk (jangan dipercaya bila bertentangan dengan foto):\n${text||'(tidak ada teks OCR)'}`;
}
function smartParseVisionEvents(answer){
  const clean=String(answer||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const start=clean.indexOf('{');
  const end=clean.lastIndexOf('}');
  if(start<0||end<start) throw new Error('AI tidak mengembalikan data pembacaan terstruktur. Coba foto lebih tajam dan tegak.');
  let payload;
  try{payload=JSON.parse(clean.slice(start,end+1));}catch(error){throw new Error('Format hasil pembacaan AI tidak valid. Jalankan ulang atau gunakan foto lebih jelas.');}
  if(!Array.isArray(payload.events)) throw new Error('AI tidak menemukan daftar baris error yang bisa diverifikasi.');
  const events=payload.events.slice(0,60).map((event,index)=>{
    const code=smartNormalizeCode(event.code);
    const confidence=Number(event.confidence);
    return {
      date:String(event.date||'Tidak terbaca'),
      time:String(event.time||'Tidak terbaca'),
      code:/^[A-Z0-9@]{5,10}$/.test(code)?code:'',
      raw:String(event.raw||''),
      confidence:Number.isFinite(confidence)?Math.max(0,Math.min(1,confidence)):0,
      index
    };
  }).filter(event=>event.raw||event.code);
  return events.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.index-b.index);
}
function smartPrioritizeEvents(events){
  if(!events.length)return [];
  const firstDate=events[0].date;
  return events.map(event=>({...event,transaction:smartIsTransactionCode(event.code)})).sort((a,b)=>{
    const aFirst=a.date===firstDate?0:1;
    const bFirst=b.date===firstDate?0:1;
    if(aFirst!==bFirst)return aFirst-bFirst;
    if(aFirst===0&&a.transaction!==b.transaction)return a.transaction?-1:1;
    return a.time.localeCompare(b.time)||a.index-b.index;
  });
}
function smartChronologicalEvents(events){
  return events.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||(a.index||0)-(b.index||0));
}
function smartEventSeconds(event){
  const match=String(event.time||'').match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  return match?Number(match[1])*3600+Number(match[2])*60+Number(match[3]):null;
}
function smartGetSensors(record){
  if(!record)return [];
  const text=[record.m,record.d,record.p,record.t].join(' ');
  return [...new Set(text.match(/\bGS(?:R)?\d{2,3}\b/gi)||[])].map(sensor=>sensor.toUpperCase());
}
function smartFlowModel(kind){return kind==='brm860'?'brm860':kind==='brm50'?'brm50':'';}
/* ===== BLOK ERROR (materi: Menentukan Start Point Error dari Riwayat Error) =====
   1) Error yang muncul berdekatan (beberapa menit) dan sejenis = satu blok.
   2) Tiap blok punya start point = kode tertua dalam blok (akar penyebab, pertama kali muncul).
   3) Kode paling akhir/terbawah/tertua pada struk = reason code. Kode paling atas/terbaru = gejala lanjutan.
   4) Jangan langsung percaya error paling atas; telusuri ke belakang. */
const ERR_BLOCK_GAP=10*60,ERR_BLOCK_QUICK=3*60,ERR_BLOCK_REPEAT=180*60;
function errSimilar(a,b){a=smartNormalizeCode(a);b=smartNormalizeCode(b);return !!a[0]&&a[0]===b[0]&&(a[1]===b[1]||a[2]===b[2]);}
function errBlocks(events){
  const tl=smartChronologicalEvents((events||[]).filter(e=>e&&e.code&&String(e.code).length>=5&&(e.confidence==null||e.confidence>=0.75)));
  const blocks=[];
  tl.forEach(e=>{
    const cur=blocks[blocks.length-1],last=cur&&cur.events[cur.events.length-1];
    const sec=smartEventSeconds(e),ls=last?smartEventSeconds(last):null;
    const dd=last?Math.round((Date.parse(e.date+'T00:00:00Z')-Date.parse(last.date+'T00:00:00Z'))/86400000):0;
    const gap=(sec!==null&&ls!==null&&!isNaN(dd))?dd*86400+sec-ls:-1;
    const repeat=cur&&cur.events.some(x=>x.code===e.code);
    /* satu blok bila: sangat berdekatan (<=3 menit), atau sejenis dan berdekatan (<=10 menit), atau gejala yang sama berulang (<=3 jam) */
    if(cur&&gap>=0&&(gap<=ERR_BLOCK_QUICK||(gap<=ERR_BLOCK_GAP&&errSimilar(last.code,e.code))||(repeat&&gap<=ERR_BLOCK_REPEAT)))cur.events.push(e);
    else blocks.push({events:[e]});
  });
  blocks.forEach((b,i)=>{
    b.n=i+1;b.start=b.events[0];b.end=b.events[b.events.length-1];
    const s1=smartEventSeconds(b.start),s2=smartEventSeconds(b.end);
    b.minutes=(s1!==null&&s2!==null)?Math.round(((Date.parse(b.end.date+'T00:00:00Z')-Date.parse(b.start.date+'T00:00:00Z'))/1000+s2-s1)/60):0;
    b.follow=[...new Set(b.events.slice(1).map(e=>e.code).filter(c=>c!==b.start.code))];
  });
  return blocks;
}
function errBlockText(b,kind){
  const rec=kind?smartFindError(b.start.code,kind):null;
  let t='Blok '+b.n+': '+b.start.date+' '+b.start.time+(b.events.length>1?' s.d. '+b.end.time+' ('+b.events.length+' kode, ±'+b.minutes+' menit)':' (1 kode)')+'. START POINT / REASON CODE = '+b.start.code+(rec?' ('+(rec.d||'')+')':'')+' (kode tertua dalam blok).';
  t+=b.follow.length?' Kode lanjutan (gejala berikutnya): '+b.follow.join(', ')+'. Kode paling atas/terbaru pada blok = '+b.end.code+'.':' Tidak ada kode lain yang berbeda dalam blok ini.';
  return t;
}
function smartAnalyzeErrorSequence(events,kind){
  const timeline=smartChronologicalEvents(events);
  if(!timeline.length)return null;
  const target=[...timeline].reverse().find(event=>event.code&&!event.transaction)||timeline[timeline.length-1];
  const targetRecord=target.code&&target.confidence>=0.75?smartFindError(target.code,kind):null;
  const targetCandidates=target.code&&!targetRecord?smartFindSimilarErrors(target.code,kind):[];
  const reference=targetRecord||((targetCandidates.length===1)?targetCandidates[0]:null);
  const targetSensors=smartGetSensors(reference);
  const targetSeconds=smartEventSeconds(target);
  const predecessors=[];
  timeline.filter(event=>event!==target&&event.date===target.date&&event.code&&event.confidence>=0.75).forEach(event=>{
    const seconds=smartEventSeconds(event);
    if(seconds===null||targetSeconds===null||seconds>=targetSeconds||targetSeconds-seconds>3600)return;
    const record=smartFindError(event.code,kind);
    if(!record)return;
    const sensors=smartGetSensors(record);
    const sharedSensors=sensors.filter(sensor=>targetSensors.includes(sensor));
    const isCashPathError=/jam|tersangkut|macet|uang|cash|note|stack|transport|deposit/i.test([record.d,record.p,record.t].join(' '));
    if(sharedSensors.length){
      predecessors.push({event,record,sharedSensors,strength:'strong',reason:`Kode sebelumnya menyebut sensor ${sharedSensors.join(', ')} yang juga disebut record error terakhir.`});
    }else if(targetSeconds-seconds<=1800&&isCashPathError){
      predecessors.push({event,record,sharedSensors,strength:'possible',reason:'Terjadi sebelumnya pada hari yang sama dan sama-sama terkait uang/jalur transport, tetapi record tidak menunjukkan sensor yang sama.'});
    }
  });
  /* hubungan menurut alur transaksi: modul hulu pada perintah yang sama */
  const fm=smartFlowModel(kind);
  if(fm&&target.code&&targetSeconds!==null){
    const tSt=txFlowStage(fm,target.code);
    if(tSt&&tSt.info.pos>=0){
      timeline.filter(event=>event!==target&&event.date===target.date&&event.code&&event.confidence>=0.75&&!predecessors.some(p=>p.event===event)).forEach(event=>{
        const seconds=smartEventSeconds(event);
        if(seconds===null||seconds>=targetSeconds||targetSeconds-seconds>1800)return;
        const eSt=txFlowStage(fm,event.code);
        if(!eSt||eSt.info.cmd!==tSt.info.cmd||eSt.info.pos<0||eSt.info.pos>=tSt.info.pos)return;
        const en=eSt.info.hit.length?eSt.info.chain[eSt.info.hit[0]]:eSt.info.branch[1],tn=tSt.info.hit.length?tSt.info.chain[tSt.info.hit[0]]:tSt.info.branch[1];
        predecessors.push({event,record:smartFindError(event.code,kind)||{d:'(kode belum ada di database)'},sharedSensors:[],strength:'possible',reason:'Pada alur '+tSt.info.name+', modul '+en+' berada sebelum '+tn+', sehingga gangguan di hulu dapat berlanjut ke hilir.'});
      });
    }
  }
  const blocks=errBlocks(events),block=blocks.length?blocks[blocks.length-1]:null,start=block?block.start:null;
  const startRecord=start?smartFindError(start.code,kind):null;
  return {timeline,target,targetRecord,targetCandidates,predecessors,targetSensors,blocks,block,start,startRecord};
}
function smartBuildFieldAnalysisPrompt(kind,events,records,sequence){
  const eventLines=smartChronologicalEvents(events).map((event,index)=>`${index+1}. ${event.date} ${event.time} | ${event.code||'KODE TIDAK TERBACA'} | ${event.transaction?'PRIORITAS TRANSAKSI':'ERROR MODUL'} | yakin ${Math.round(event.confidence*100)}% | ${event.raw}`).join('\n');
  const recordLines=records.map(row=>`${row.ocrCandidateFor?`KANDIDAT OCR BELUM TERVERIFIKASI (foto terbaca ${row.ocrCandidateFor}, kemungkinan ${row.k}): `:''}Kode ${row.k} | Modul: ${row.m} | Deskripsi resmi: ${row.d} | Analisa penyebab: ${row.p} | Tindakan database: ${row.t}`).join('\n');
  const chainLines=sequence?sequence.predecessors.map(item=>`${item.event.date} ${item.event.time} ${item.event.code} -> ${sequence.target.code||sequence.target.raw}; bukti ${item.strength}; ${item.reason}`).join('\n'):'(tidak ada hubungan waktu/sensor yang memenuhi aturan lokal)';
  const candidateLine=sequence?.targetCandidates?.length?`\nKODE TERAKHIR BELUM COCOK. Kandidat OCR satu karakter berbeda: ${sequence.targetCandidates.map(row=>row.k).join(', ')}. Anggap kandidat ini belum terverifikasi; jelaskan dampaknya secara bersyarat dan jangan berikan instruksi perbaikan sampai kode dilihat ulang.`:'';
  const fm=smartFlowModel(kind);
  const flowLines=fm?[...new Set(events.filter(e=>e.code&&e.confidence>=0.75).map(e=>e.code))].map(c=>{const st=txFlowStage(fm,c);return st?c+': '+st.text:'';}).filter(Boolean).join('\n'):'';
  return `${abbrGlossText()}\n\nAnda membantu teknisi ATM di lapangan untuk modul ${kind}. Gunakan hanya fakta di event dan database lokal di bawah. Database lokal adalah sumber utama untuk deskripsi, penyebab, dan perbaikan. Jangan mengganti tindakan database dengan saran generik. Jangan mengarang sensor, kabel, part, menu, hasil ukur, atau prosedur yang tidak tercantum. Event dengan keyakinan di bawah 75% belum terverifikasi: jangan berikan instruksi perbaikan berdasarkan event itu dan minta teknisi mengonfirmasi kode dari foto.\n\nATURAN MEMBACA RIWAYAT ERROR (wajib): (1) Cek waktu pada riwayat; beberapa error yang muncul berjarak hanya beberapa menit dan jenisnya mirip/sama adalah SATU BLOK ERROR. (2) Setiap blok punya START POINT, yaitu kode tertua dalam blok (akar penyebab yang pertama kali muncul). (3) Kode paling akhir pada struk (terbawah/tertua dalam satu blok) biasanya REASON CODE, penyebab utamanya; kode yang lebih atas/lebih baru adalah gejala lanjutan. (4) Jangan langsung percaya error yang muncul paling atas/paling baru; telusuri ke belakang dahulu. Bangun penyebab, langkah, dan ringkasan dari REASON CODE blok terbaru, lalu jelaskan kode lanjutan sebagai akibat. Bila ada beberapa blok, sebut blok yang lebih lama sebagai kejadian terpisah. Aturan blok ini menentukan penyebab utama; urutan prioritas di bawah hanya untuk urutan penyampaian.\n\nUrutan kerja untuk menetapkan prioritas: hari paling awal lebih dahulu; dalam hari tersebut dahulukan kode yang karakter keduanya 1, 2, 3, 4, 7, atau K sebagai problem transaksi, lalu error modul. Untuk analisa sebab, gunakan urutan waktu asli; jangan mengubah kronologi berdasarkan prioritas.\n\nAnalisa hubungan error sebelumnya dengan error terakhir hanya dari bukti lokal. Sensor yang sama adalah bukti hubungan kuat tetapi bukan bukti sebab pasti. Error uang/jam yang berdekatan waktunya tanpa sensor bersama hanya boleh disebut kemungkinan pemicu. Pisahkan fakta database, korelasi, dan dugaan; minta pemeriksaan fisik untuk memastikan. ${candidateLine}\n\nBLOK ERROR HASIL PENGELOMPOKAN LOKAL (satu blok = berjarak ≤ 3 menit, atau sejenis dan ≤ 10 menit, atau gejala sama yang berulang ≤ 3 jam):\n${(sequence&&sequence.blocks&&sequence.blocks.length)?sequence.blocks.map(b=>errBlockText(b,kind)).join('\n'):'(tidak ada)'}\n\nKonteks rantai error lokal:\n${chainLines}\n\nALUR TRANSAKSI PER KODE (struktur kode dari diagram internal; gunakan untuk menjelaskan tahap transaksi dengan bahasa awam, misalnya penarikan uang di modul BC; ini bukan solusi dan bukan penyebab pasti. TSK pada BRM50 setara TE/RJE pada BRM860):\n${flowLines||'(tidak tersedia untuk modul ini)'}\n\nUntuk setiap kode yang cocok dengan database, jelaskan: masalah yang ditunjukkan kode; pemeriksaan lapangan spesifik dari tindakan database; tindakan yang harus dilakukan; hasil yang harus diamati; dan kapan berhenti/eskalasi. Pertahankan nomor/urutan tindakan database. Jika referensi database tidak memberi langkah atau kode tidak cocok, nyatakan "Belum ada solusi lapangan terverifikasi di database" dan beri hanya langkah triase aman: catat kode/foto/waktu, cek status transaksi dan kondisi ATM dari panel/operator, amankan uang/area sesuai prosedur lokal, jangan membuka unit saat bertegangan, lalu eskalasi dengan kode persis. Jangan menyuruh restart atau mengganti komponen tanpa dasar pada database.\n\nFORMAT KELUARAN WAJIB. Jangan pakai simbol markdown (jangan ** dan jangan #). Tulis tepat dua blok berikut.\n[RINGKAS]\nSTATUS: pilih satu: PERLU TINDAKAN / PERLU KONFIRMASI KODE / ESKALASI KE TS\nTERJADI: satu kalimat bahasa awam (maksimal 25 kata) tentang apa yang terjadi pada mesin, tanpa istilah sulit\nPENYEBAB: satu kalimat (maksimal 25 kata); gunakan kata kemungkinan bila hanya dugaan\nLANGKAH:\n1. (maksimal 4 langkah; tiap langkah satu kalimat perintah sederhana, maksimal 18 kata, urut dari yang paling aman; bila memakai istilah teknis beri arti singkat dalam kurung; hanya dari tindakan database atau triase aman)\nESKALASI: satu kalimat berawalan "Hubungi Team Leader atau Technical Support jika ..." (jangan menyebut Supervisor atau Vendor)\n[DETAIL]\nAnalisa lengkap dan formal untuk laporan resmi, huruf biasa tanpa markdown, dengan judul bagian: 1. Ringkasan urutan dan hubungan sebab yang mungkin, 2. Prioritas kejadian, 3. Tindakan lapangan per kode, 4. Verifikasi hasil, 5. Kode/data yang harus dikonfirmasi. Bedakan fakta database dari dugaan.\n\nEVENT HASIL BACA FOTO (KRONOLOGIS):\n${eventLines||'(tidak ada event)'}\n\nREFERENSI DATABASE LOKAL YANG COCOK:\n${recordLines||'(tidak ada kode yang cocok; jangan mengarang solusi khusus kode)'}`;
}
function smartAppendText(parent,text,tag='div'){
  const element=document.createElement(tag);
  element.textContent=text;
  parent.appendChild(element);
  return element;
}
function smartRenderVerifiedEvents(output,events,kind){
  const section=document.createElement('section');
  section.className='smart-result';
  smartAppendText(section,`Pembacaan foto: ${events.length} baris`, 'h3');
  const table=document.createElement('table');
  table.style.cssText='width:100%;border-collapse:collapse;font-size:11px;margin-top:8px';
  table.innerHTML='<thead><tr><th style="text-align:left;padding:5px;border-bottom:1px solid #C5D0F0">Tanggal / waktu</th><th style="text-align:left;padding:5px;border-bottom:1px solid #C5D0F0">Kode</th><th style="text-align:left;padding:5px;border-bottom:1px solid #C5D0F0">Prioritas</th><th style="text-align:left;padding:5px;border-bottom:1px solid #C5D0F0">Keyakinan</th></tr></thead>';
  const tbody=document.createElement('tbody');
  events.forEach(event=>{
    const row=document.createElement('tr');
    [event.date+' '+event.time,event.code||'Perlu konfirmasi',event.transaction?'Transaksi':'Modul',Math.round(event.confidence*100)+'%'].forEach(value=>{
      const cell=document.createElement('td');
      cell.style.cssText='padding:5px;border-bottom:1px solid #E8EEFF;vertical-align:top';
      cell.textContent=value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  section.appendChild(table);
  events.filter(event=>event.confidence<0.75||!event.code).forEach(event=>{
    smartAppendText(section,`Konfirmasi manual: ${event.raw||'Baris tidak terbaca'} (keyakinan ${Math.round(event.confidence*100)}%)`,'p');
  });
  output.appendChild(section);
  const records=[];
  const candidates=[];
  const seen=new Set();
  events.forEach(event=>{
    if(!event.code||event.confidence<0.75)return;
    const record=smartFindError(event.code,kind);
    if(record&&!seen.has(record.k)){records.push(record);seen.add(record.k);return;}
    if(!record){
      const similar=smartFindSimilarErrors(event.code,kind);
      if(similar.length===1&&!seen.has(similar[0].k)){
        candidates.push({event,record:similar[0]});
        seen.add(similar[0].k);
      }
    }
  });
  records.ocrCandidates=candidates;
  const fieldCard=document.createElement('section');
  fieldCard.className='smart-result '+(records.length?'transaction':'module');
  smartAppendText(fieldCard,records.length?'Langkah lapangan terverifikasi dari database lokal':'Belum ada solusi lapangan terverifikasi','h3');
  if(records.length){
    records.forEach(record=>{
      smartAppendText(fieldCard,`${record.k} — ${record.m||'Modul tidak dicantumkan'}`,'p');
      smartAppendText(fieldCard,`Masalah: ${record.d||'Tidak tersedia di database'}`,'p');
      smartAppendText(fieldCard,`Analisa database: ${record.p||'Belum ada analisa penyebab yang tercatat.'}`,'p');
      const steps=document.createElement('pre');
      steps.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 var(--ui-font);margin:6px 0 12px;color:#1A1F36';
      steps.textContent=record.t||'Database belum mencatat langkah perbaikan untuk kode ini.';
      fieldCard.appendChild(steps);
    });
  }else{
    smartAppendText(fieldCard,'Verifikasi kode pada foto asli. Catat kode, tanggal, dan status ATM; jangan mengganti komponen atau menjalankan perbaikan spesifik sebelum kode dipastikan.','p');
  }
  output.appendChild(fieldCard);
  candidates.forEach(candidate=>{
    const candidateCard=document.createElement('section');
    candidateCard.className='smart-result module';
    smartAppendText(candidateCard,`Kandidat OCR bersyarat: ${candidate.event.code} mungkin ${candidate.record.k} — konfirmasi foto wajib`,'h3');
    smartAppendText(candidateCard,`Jika kode pada foto benar ${candidate.record.k}: ${candidate.record.d}`,'p');
    smartAppendText(candidateCard,`Analisa database: ${candidate.record.p||'Belum ada analisa penyebab tercatat.'}`,'p');
    const details=document.createElement('details');
    const summary=smartAppendText(details,'Tampilkan tindakan database hanya jika kode terkonfirmasi','summary');
    summary.style.cssText='cursor:pointer;font-size:12px;font-weight:700;color:#1565C0;margin-top:8px';
    const steps=document.createElement('pre');
    steps.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 var(--ui-font);margin:6px 0;color:#1A1F36';
    steps.textContent=candidate.record.t||'Database belum mencatat langkah perbaikan untuk kode ini.';
    details.appendChild(steps);
    candidateCard.appendChild(details);
    output.appendChild(candidateCard);
  });
  return records;
}
function smartRenderErrorSequence(output,sequence){
  if(!sequence)return;
  const card=document.createElement('section');
  card.className='smart-result module';
  smartAppendText(card,'Rantai error sebelum gangguan terakhir','h3');
  if(sequence.block){
    const b=sequence.block,sr=sequence.startRecord;
    if(b.events.length>1){
      smartAppendText(card,`Blok error terbaru: ${b.events.length} kode dalam ±${b.minutes} menit (${b.start.time} - ${b.end.time}).`,'p');
      smartAppendText(card,`Start point / reason code: ${b.start.code}${sr?' — '+sr.d:''}. Ini kode tertua dalam blok, jadi penyebab utamanya.`,'p');
      smartAppendText(card,`Kode paling atas/terbaru (${b.end.code}) adalah gejala lanjutan; jangan langsung dipercaya sebagai penyebab. Telusuri dari start point.`,'p');
    }else smartAppendText(card,`Error terbaru berdiri sendiri (tidak ada kode serupa beberapa menit sebelumnya), sehingga ${b.start.code}${sr?' — '+sr.d:''} adalah start point-nya.`,'p');
    if(sequence.blocks.length>1)smartAppendText(card,`Ada ${sequence.blocks.length-1} blok error lain sebelumnya yang terpisah waktu atau jenisnya; ditangani sebagai kejadian terpisah.`,'p');
  }
  const targetCode=sequence.target.code||sequence.target.raw||'Kode terakhir tidak terbaca';
  smartAppendText(card,`Error terakhir: ${sequence.target.date} ${sequence.target.time} | ${targetCode}${sequence.targetRecord?'':' (belum cocok persis dengan database)'}`,'p');
  if(sequence.targetCandidates.length===1){
    const candidate=sequence.targetCandidates[0];
    smartAppendText(card,`Kemungkinan OCR: ${targetCode} mungkin ${candidate.k} (${candidate.d}). Ini kandidat saja, bukan kode terkonfirmasi.`,'p');
  }else if(sequence.targetCandidates.length>1){
    smartAppendText(card,`Kode terakhir belum ditemukan. Kandidat satu karakter berbeda: ${sequence.targetCandidates.map(row=>row.k).join(', ')}. Konfirmasi dari foto.`,'p');
  }
  if(!sequence.predecessors.length){
    smartAppendText(card,'Tidak ada error sebelumnya yang memenuhi aturan kedekatan waktu atau sensor untuk disebut sebagai pemicu.','p');
  }else{
    sequence.predecessors.forEach(item=>{
      const label=item.strength==='strong'?'Bukti hubungan kuat: sensor sama':'Kemungkinan pemicu: waktu dekat dan gejala sejenis';
      smartAppendText(card,`${label} | ${item.event.date} ${item.event.time} ${item.event.code} — ${item.record.d}`,'p');
      smartAppendText(card,`Dasar: ${item.reason} Ini korelasi log, belum membuktikan sebab pasti.`,'p');
    });
  }
  smartAppendText(card,'Arah pemeriksaan lokal: cek dan bersihkan jalur/sensor yang disebut tindakan database error sebelumnya, lalu periksa area GSR01/RJE untuk kandidat error terakhir. Jangan menganggap satu kode sebagai penyebab pasti tanpa temuan fisik; ikuti prosedur keselamatan dan validasi kode kandidat dari foto.','p');
  output.appendChild(card);
}
async function smartRunAiAnalysis(){
  const status=document.getElementById('smartStatus');
  const output=document.getElementById('smartAiOutput');
  const button=document.getElementById('smartAiBtn');
  smartAiReportData=null;
  let settings;
  try{
    const saved=await window.__fb.getAiConfig();
    settings=saved?{apis:smartNormalizeAiApis(saved.apis),vision:saved.vision!==false}:smartReadLegacyAiSettings();
  }catch(error){status.textContent=`Gagal memuat konfigurasi AI dari Firebase: ${error.message||'periksa koneksi dan Firestore Rules.'}`;return;}
  const apis=settings?.apis||[];
  if(!apis.length){status.textContent='Konfigurasi AI belum tersedia. Minta Admin mengisi Konfigurasi AI Vision di Admin Panel.';return;}
  const file=smartImageFile;
  if(file&&settings.vision===false){status.textContent='Analisis Vision dinonaktifkan oleh Admin. Aktifkan Vision di Konfigurasi AI atau gunakan teks riwayat.';return;}
  const text=document.getElementById('smartHistoryText').value.trim();
  if(!file&&!text){status.textContent='Unggah foto atau isi teks print history sebelum menjalankan analisis AI.';return;}
  button.disabled=true;
  output.innerHTML='';
  try{
    let events;
    if(file){
      status.textContent='Tahap 1/2: membaca tanggal dan kode langsung dari foto...';
      events=smartPrioritizeEvents(await smartExtractEvents(apis,document.getElementById('smartModule').value,text,file,m=>{status.textContent=m;}));
    }else{
      events=smartPrioritizeEvents(smartParseHistory(text).map((row,index)=>({...row,raw:row.line,confidence:1,index})));
      if(!events.length) throw new Error('Teks tidak berisi baris tanggal dan kode yang dikenali. Unggah foto untuk pembacaan Vision atau perbaiki teks.');
    }
    const kind=document.getElementById('smartModule').value;
    const sequence=smartAnalyzeErrorSequence(events,kind);
    const hold=document.createElement('div');
    const records=smartRenderVerifiedEvents(hold,events,kind);
    const analysisRecords=records.concat((records.ocrCandidates||[]).map(candidate=>({...candidate.record,ocrCandidateFor:candidate.event.code})));
    status.textContent=`Tahap 2/2: ${records.length} kode terverifikasi${(records.ocrCandidates||[]).length?` dan ${(records.ocrCandidates||[]).length} kandidat OCR`:''}. Menyusun analisa kronologis...`;
    const answer=await smartRequestAiWithFailover(apis,smartBuildFieldAnalysisPrompt(kind,events,analysisRecords,sequence),null);
    answer.answer=normAbbr(answer.answer);
    const parsed=smartParseAiAnswer(answer.answer);
    const summary=parsed.summary||smartFallbackSummary(records,sequence);
    const chain=[];
    if(sequence){
      if(sequence.blocks)sequence.blocks.forEach(b=>chain.push(errBlockText(b,kind)));
      const tc=sequence.target.code||sequence.target.raw||'kode tidak terbaca';
      chain.push('Error terakhir: '+sequence.target.date+' '+sequence.target.time+' | '+tc+(sequence.targetRecord?'':' (belum cocok persis dengan database)'));
      if(sequence.targetCandidates.length)chain.push('Kandidat OCR untuk kode terakhir: '+sequence.targetCandidates.map(r=>r.k).join(', ')+'. Konfirmasi dari foto.');
      sequence.predecessors.forEach(p=>chain.push((p.strength==='strong'?'Hubungan kuat (sensor sama): ':'Kemungkinan pemicu (waktu dekat, gejala sejenis): ')+p.event.date+' '+p.event.time+' '+p.event.code+' - '+(p.record.d||'')+'. '+p.reason+' Ini korelasi log, bukan bukti sebab pasti.'));
    }
    smartAiReportData={
      moduleLabel:document.getElementById('smartModule').selectedOptions[0].textContent,
      kind,
      photoName:file?.name||'Tidak menggunakan foto (teks print history)',
      historyText:text||'',
      events,
      records,
      candidates:records.ocrCandidates||[],
      recap:smartCodeRecap(events,kind),
      chain,
      summary,
      analysis:parsed.detail||answer.answer,
      createdAt:new Date()
    };
    smartRenderQuickResult(output,summary,{moduleLabel:smartAiReportData.moduleLabel,events,recap:smartAiReportData.recap,lowCount:events.filter(e=>!e.code||e.confidence<0.75).length});
    usageLog({type:'smart_analyze',brand:'smart',module:kind,mode:file?'ai-foto':'ai-teks',results:records.length,query:'ai '+kind});
    status.textContent='Analisa selesai. Cocokkan kode berkeyakinan rendah dengan foto asli sebelum tindakan perbaikan.';
  }catch(error){status.textContent=error.message||'Analisa foto dan problem gagal dijalankan.';}
  finally{button.disabled=false;}
}
/* ===== SMART ANALYZER: HASIL SINGKAT + LAPORAN DETAIL (PDF / EXCEL) ===== */
function smartClean(t){return String(t==null?'':t).replace(/\*\*/g,'').replace(/`/g,'').replace(/[ \t]+$/gm,'');}
function smartParseAiAnswer(answer){
  const t=String(answer||'');
  const iR=t.search(/\[RINGKAS\]/i),iD=t.search(/\[DETAIL\]/i);
  if(iR<0)return {summary:null,detail:smartClean(t).trim()};
  const ring=t.slice(iR+9,iD>iR?iD:undefined);
  const detail=iD>=0?t.slice(iD+8):t.slice(iR+9);
  const s={status:'',terjadi:'',penyebab:'',langkah:[],eskalasi:''};
  let mode='';
  smartClean(ring).split(/\r?\n/).forEach(raw=>{
    const l=raw.trim();if(!l)return;
    let m;
    if((m=l.match(/^STATUS\s*:\s*(.*)$/i))){s.status=m[1].trim();mode='';}
    else if((m=l.match(/^TERJADI\s*:\s*(.*)$/i))){s.terjadi=m[1].trim();mode='';}
    else if((m=l.match(/^PENYEBAB\s*:\s*(.*)$/i))){s.penyebab=m[1].trim();mode='';}
    else if((m=l.match(/^LANGKAH\s*:\s*(.*)$/i))){mode='l';if(m[1].trim())s.langkah.push(m[1].trim().replace(/^\d+[.)]\s*/,''));}
    else if((m=l.match(/^ESKALASI\s*:\s*(.*)$/i))){s.eskalasi=m[1].trim();mode='';}
    else if(mode==='l'){s.langkah.push(l.replace(/^(\d+[.)]|[-*•])\s*/,''));}
  });
  s.langkah=s.langkah.filter(Boolean).slice(0,4);
  const ok=s.terjadi&&s.langkah.length;
  return {summary:ok?s:null,detail:smartClean(detail).trim()};
}
function smartShortSteps(text,max){
  return String(text||'').split(/\r?\n|(?<=[.;])\s+(?=\d+[.)]\s)/).map(x=>x.replace(/^\s*(\d+[.)]|[-*•])\s*/,'').trim()).filter(x=>x.length>3).slice(0,max).map(x=>x.length>150?x.slice(0,147).replace(/\s+\S*$/,'')+'...':x);
}
function smartFallbackSummary(records,sequence){
  const rec=(sequence&&(sequence.startRecord||sequence.targetRecord))||records[0]||null;
  const cut=(s,n)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-3).replace(/\s+\S*$/,'')+'...':s;};
  const steps=rec?smartShortSteps(rec.t,3):[];
  return {
    status:rec?'PERLU TINDAKAN':'PERLU KONFIRMASI KODE',
    terjadi:rec?cut((rec.m?rec.m+': ':'')+(rec.d||''),170):'Kode pada foto belum ditemukan di database lokal.',
    penyebab:rec&&rec.p?cut(rec.p,170):'Belum bisa dipastikan dari data yang ada.',
    langkah:steps.length?steps:['Catat kode, tanggal, dan jam kejadian.','Cek status ATM dari panel atau operator.','Hubungi Technical Support dengan kode persis.'],
    eskalasi:'Hubungi Team Leader atau Technical Support jika langkah di atas tidak menyelesaikan masalah.'
  };
}
function smartCodeRecap(events,kind){
  const map=new Map();
  events.forEach(e=>{
    const key=e.code||'(tidak terbaca)';
    if(!map.has(key))map.set(key,{code:key,count:0,first:null,last:null,category:e.transaction?'Transaksi':'Modul',low:false,rec:null,desc:''});
    const r=map.get(key);r.count++;
    const stamp=(e.date||'')+' '+(e.time||'');
    if(!r.first||stamp<r.first)r.first=stamp;
    if(!r.last||stamp>r.last)r.last=stamp;
    if(!e.code||e.confidence<0.75)r.low=true;
  });
  map.forEach(r=>{
    if(r.code==='(tidak terbaca)'){r.status='Perlu konfirmasi dari foto';return;}
    const rec=smartFindError(r.code,kind);
    if(rec){r.status='Terverifikasi di database';r.desc=rec.d||'';}
    else{const sim=smartFindSimilarErrors(r.code,kind);r.status=sim.length===1?'Tidak persis; kandidat '+sim[0].k:'Tidak ada di database';r.desc=sim.length===1?(sim[0].d||''):'';}
  });
  const fmr=smartFlowModel(kind);
  map.forEach(r=>{const st=fmr&&r.code!=='(tidak terbaca)'?txFlowStage(fmr,r.code):null;r.stage=st?st.short:'-';});
  return [...map.values()].sort((a,b)=>b.count-a.count);
}
function smartCurrentUser(){
  try{const lo=document.getElementById('techLogoutBtn');const m=lo&&(lo.title||'').match(/Login sebagai:\s*(.+?)\s*\(/);return m?m[1]:'-';}catch(e){return '-';}
}
function smartRenderQuickResult(output,s,rep){
  const st=String(s.status||'').toUpperCase();
  const kind=st.indexOf('ESKALASI')>=0?'esc':st.indexOf('KONFIRMASI')>=0?'conf':'act';
  const card=document.createElement('section');card.className='sa-quick sa-'+kind;
  const head=document.createElement('div');head.className='sa-q-head';
  const pill=document.createElement('span');pill.className='sa-q-pill';
  pill.textContent=kind==='esc'?'Hubungi TS':kind==='conf'?'Cek ulang kode':'Perlu tindakan';
  const ttl=document.createElement('h3');ttl.textContent='Hasil Analisa Singkat';
  head.appendChild(pill);head.appendChild(ttl);card.appendChild(head);
  const uniq=rep.recap.filter(r=>r.code!=='(tidak terbaca)');
  const meta=document.createElement('p');meta.className='sa-q-meta';
  meta.textContent=rep.moduleLabel+' · '+rep.events.length+' baris terbaca · '+(uniq.length?uniq.slice(0,4).map(r=>r.code+(r.count>1?' ×'+r.count:'')).join(', ')+(uniq.length>4?' dan '+(uniq.length-4)+' kode lain':''):'kode belum terbaca');
  card.appendChild(meta);
  const row=(label,text)=>{if(!text)return;const d=document.createElement('div');d.className='sa-q-row';const b=document.createElement('b');b.textContent=label;const p=document.createElement('p');p.textContent=text;d.appendChild(b);d.appendChild(p);card.appendChild(d);};
  row('Yang terjadi',s.terjadi);
  row('Kemungkinan penyebab',s.penyebab);
  const dl=document.createElement('div');dl.className='sa-q-row';
  const lb=document.createElement('b');lb.textContent='Yang perlu dilakukan';dl.appendChild(lb);
  const ol=document.createElement('ol');s.langkah.forEach(x=>{const li=document.createElement('li');li.textContent=x;ol.appendChild(li);});
  dl.appendChild(ol);card.appendChild(dl);
  row('Hubungi Team Leader atau TS bila',s.eskalasi);
  if(rep.lowCount){const w=document.createElement('p');w.className='sa-q-warn';w.textContent=rep.lowCount+' baris kodenya kurang jelas. Cocokkan dengan foto asli sebelum bertindak.';card.appendChild(w);}
  const act=document.createElement('div');act.className='sa-dl';
  const btn=document.createElement('button');btn.type='button';btn.className='smart-action';btn.textContent='Unduh Laporan Detail ▾';
  const menu=document.createElement('div');menu.className='sa-dl-menu';
  [['Dokumen PDF','Laporan resmi, siap cetak','smartExportPdf'],['File Excel (.xls)','Tabel lengkap per lembar','smartExportAiReport']].forEach(([t,sub,fn])=>{
    const it=document.createElement('button');it.type='button';it.className='sa-dl-item';
    const a=document.createElement('b');a.textContent=t;const c=document.createElement('span');c.textContent=sub;it.appendChild(a);it.appendChild(c);
    it.onclick=()=>{menu.classList.remove('open');window[fn]();};menu.appendChild(it);
  });
  btn.onclick=e=>{e.stopPropagation();menu.classList.toggle('open');};
  act.appendChild(btn);act.appendChild(menu);card.appendChild(act);
  if(!window.__saDlBound){window.__saDlBound=true;document.addEventListener('click',()=>{document.querySelectorAll('.sa-dl-menu.open').forEach(m=>m.classList.remove('open'));});}
  output.appendChild(card);
}
function smartDetailBlocks(text){
  const out=[];
  String(text||'').split(/\r?\n/).forEach(raw=>{
    let l=smartClean(raw).trim();if(!l)return;
    if(/^#{1,4}\s*/.test(l)){out.push({t:'h',x:l.replace(/^#{1,4}\s*/,'')});return;}
    if(/^\(?\d\)?[.)]?\s*(Ringkasan|Prioritas|Tindakan lapangan|Verifikasi|Kode\/data)/i.test(l)||(/:$/.test(l)&&l.length<70)){out.push({t:'h',x:l.replace(/:$/,'')});return;}
    if(/^[-*•]\s+/.test(l)){out.push({t:'li',x:'- '+l.replace(/^[-*•]\s+/,'')});return;}
    if(/^\d+[.)]\s+/.test(l)){out.push({t:'li',x:l});return;}
    out.push({t:'p',x:l});
  });
  return out;
}
function smartReportModel(){
  if(!smartAiReportData)throw new Error('Jalankan Analisa Foto + Problem AI hingga selesai sebelum mengunduh laporan.');
  const r=smartAiReportData,d=r.createdAt||new Date();
  const p=n=>String(n).padStart(2,'0');
  const stamp=d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
  return Object.assign({},r,{
    stamp,number:'SA-'+stamp,printed:d.toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'}),
    user:smartCurrentUser(),
    lowCount:r.events.filter(e=>!e.code||e.confidence<0.75).length,
    blocks:smartDetailBlocks(r.analysis)
  });
}
const SMART_NOTES=[
  'Laporan ini dibuat otomatis oleh Smart Analyzer dari foto atau teks print history yang diberikan teknisi.',
  'Kode dengan keyakinan di bawah 75% dan kandidat OCR belum terverifikasi. Cocokkan dengan foto asli sebelum mengambil tindakan perbaikan.',
  'Bagian "Fakta database" bersumber dari database lokal portal. Bagian "dugaan" atau "kemungkinan" adalah analisa AI dan perlu dibuktikan dengan pemeriksaan fisik.',
  'Patuhi SOP keselamatan: jangan membuka unit saat bertegangan dan amankan uang atau area vault sesuai prosedur bank.',
  'Bila masalah berlanjut, eskalasi ke Technical Support dengan menyertakan laporan ini beserta foto asli.'
];
/* ---------- EXCEL ---------- */
function smartExportAiReport(){
  let m;try{m=smartReportModel();}catch(e){alert(e.message);return;}
  const xe=v=>String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const cell=(v,s='',span=0)=>`<Cell${s?` ss:StyleID="${s}"`:''}${span?` ss:MergeAcross="${span}"`:''}><Data ss:Type="String" xml:space="preserve">${xe(v)}</Data></Cell>`;
  const row=(...c)=>`<Row ss:AutoFitHeight="1">${c.join('')}</Row>`;
  const full=(t,n,s='Title')=>row(cell(t,s,n-1));
  const head=l=>row(...l.map(x=>cell(x,'TableHeader')));
  const sheet=(name,w,rows)=>`<Worksheet ss:Name="${name}"><Table ss:ExpandedColumnCount="${w.length}" ss:ExpandedRowCount="${rows.length}">${w.map(x=>`<Column ss:AutoFitWidth="0" ss:Width="${x}"/>`).join('')}${rows.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><PageSetup><Layout x:Orientation="Landscape" xmlns:x="urn:schemas-microsoft-com:office:excel"/><PageMargins x:Bottom="0.5" x:Left="0.35" x:Right="0.35" x:Top="0.5" xmlns:x="urn:schemas-microsoft-com:office:excel"/></PageSetup><FitToPage/></WorksheetOptions></Worksheet>`;
  const styles=`<Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top"/><Font ss:FontName="Arial" ss:Size="10" ss:Color="#24324B"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Title"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1565C0" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Subtitle"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Color="#4A5680"/><Interior ss:Color="#E8EEFF" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Section"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#315A9B" ss:Pattern="Solid"/></Style>
    <Style ss:ID="TableHeader"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#3974B8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#244A7C"/></Borders></Style>
    <Style ss:ID="Label"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#24324B"/><Interior ss:Color="#E8EEFF" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C5D0F0"/></Borders></Style>
    <Style ss:ID="Body"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8E0F2"/></Borders></Style>
    <Style ss:ID="BodyAlt"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Interior ss:Color="#F3F6FC" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8E0F2"/></Borders></Style>
    <Style ss:ID="Head2"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#1565C0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C5D0F0"/></Borders></Style>
    <Style ss:ID="Note"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="9" ss:Italic="1" ss:Color="#5F6B7A"/><Interior ss:Color="#FFF4D6" ss:Pattern="Solid"/></Style>
  </Styles>`;
  const sub=`No. ${m.number} | Dicetak ${m.printed} | Modul ${m.moduleLabel}`;
  const alt=i=>i%2?'BodyAlt':'Body';
  const s=m.summary;
  /* 1 Ringkasan */
  const r1=[full('LAPORAN HASIL ANALISA PRINT HISTORY',2),full('Smart Analyzer | Portal Technical Support | PT. Citius Solusi Indonesia',2,'Subtitle'),
    row(cell('A. INFORMASI LAPORAN','Section',1)),
    row(cell('Nomor laporan','Label'),cell(m.number,'Body')),
    row(cell('Tanggal dan waktu cetak','Label'),cell(m.printed,'Body')),
    row(cell('Dibuat oleh','Label'),cell(m.user,'Body')),
    row(cell('Jenis modul','Label'),cell(m.moduleLabel,'Body')),
    row(cell('Sumber data','Label'),cell(m.photoName,'Body')),
    row(cell('Jumlah baris terbaca','Label'),cell(m.events.length,'Body')),
    row(cell('Jumlah kode unik','Label'),cell(m.recap.filter(x=>x.code!=='(tidak terbaca)').length,'Body')),
    row(cell('Referensi database cocok','Label'),cell(m.records.length,'Body')),
    row(cell('Baris perlu konfirmasi','Label'),cell(m.lowCount,'Body')),
    row(cell('','')),
    row(cell('B. RINGKASAN HASIL','Section',1)),
    row(cell('Status','Label'),cell(s.status,'Body')),
    row(cell('Yang terjadi','Label'),cell(s.terjadi,'Body')),
    row(cell('Kemungkinan penyebab','Label'),cell(s.penyebab,'Body')),
    ...s.langkah.map((x,i)=>row(cell(i?'':'Yang perlu dilakukan','Label'),cell((i+1)+'. '+x,'Body'))),
    row(cell('Hubungi Team Leader atau TS bila','Label'),cell(s.eskalasi,'Body'))];
  if(m.lowCount)r1.push(row(cell(`Perhatian: ${m.lowCount} baris berkode kosong atau berkeyakinan di bawah 75%. Cocokkan dengan foto asli.`,'Note',1)));
  /* 2 Riwayat */
  const r2=[full('C. DATA RIWAYAT TERBACA',6),full(sub,6,'Subtitle'),head(['No','Tanggal','Waktu','Kode','Kategori','Keyakinan','Teks sumber'])];
  m.events.forEach((e,i)=>r2.push(row(cell(i+1,alt(i)),cell(e.date||'',alt(i)),cell(e.time||'',alt(i)),cell(e.code||'Perlu konfirmasi',alt(i)),cell(e.transaction?'Transaksi':'Modul',alt(i)),cell(typeof e.confidence==='number'?Math.round(e.confidence*100)+'%':'-',alt(i)),cell(e.raw||e.line||'',alt(i)))));
  /* 3 Rekap */
  const r3=[full('D. REKAP KODE',8),full(sub,8,'Subtitle'),head(['Kode','Jumlah muncul','Kejadian pertama','Kejadian terakhir','Kategori','Status database','Tahap alur','Masalah (database)'])];
  m.recap.forEach((x,i)=>r3.push(row(cell(x.code,alt(i)),cell(x.count,alt(i)),cell(x.first||'',alt(i)),cell(x.last||'',alt(i)),cell(x.category,alt(i)),cell(x.status,alt(i)),cell(x.stage||'-',alt(i)),cell(x.desc,alt(i)))));
  /* 4 Rantai */
  const r4=[full('E. RANTAI KEJADIAN',1),full(sub,1,'Subtitle'),...(m.chain.length?m.chain:['Tidak ada rantai kejadian yang memenuhi aturan kedekatan waktu atau sensor.']).map((t,i)=>row(cell(t,alt(i))))];
  /* 5 Database */
  const r5=[full('F. REFERENSI DATABASE',6),full(sub,6,'Subtitle'),head(['Kode','Modul','Deskripsi / masalah','Analisa penyebab','Tindakan pemeriksaan','Status'])];
  const recs=[...m.records.map(x=>({r:x,s:'Terverifikasi'})),...m.candidates.map(c=>({r:c.record,s:'Kandidat OCR untuk '+c.event.code+'; konfirmasi manual'}))];
  recs.forEach(({r,s:st},i)=>r5.push(row(cell(r.k||'',alt(i)),cell(r.m||'',alt(i)),cell(r.d||'',alt(i)),cell(r.p||'',alt(i)),cell(r.t||'',alt(i)),cell(st,alt(i)))));
  if(!recs.length)r5.push(row(cell('Tidak ada referensi database yang cocok untuk hasil ini.','Body',5)));
  /* 6 Analisa */
  const r6=[full('G. ANALISA DETAIL',1),full(sub,1,'Subtitle'),...m.blocks.map(b=>row(cell(b.x,b.t==='h'?'Head2':'Body')))];
  if(!m.blocks.length)r6.push(row(cell('Tidak ada teks analisa.','Body')));
  /* 7 Catatan */
  const r7=[full('H. CATATAN DAN BATASAN',1),full(sub,1,'Subtitle'),...SMART_NOTES.map((t,i)=>row(cell((i+1)+'. '+t,alt(i))))];
  const wb=`<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${styles}${sheet('Ringkasan',[190,560],r1)}${sheet('Riwayat',[40,90,70,95,85,75,330],r2)}${sheet('Rekap Kode',[95,80,125,125,80,170,170,330],r3)}${sheet('Rantai Kejadian',[900],r4)}${sheet('Referensi Database',[90,140,220,220,330,180],r5)}${sheet('Analisa Detail',[900],r6)}${sheet('Catatan',[900],r7)}</Workbook>`;
  const blob=new Blob(['﻿',wb],{type:'application/vnd.ms-excel;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Laporan-Smart-Analyzer-'+m.stamp+'.xls';
  usageLog({type:'download',brand:'smart',category:'laporan-smart-analyzer',fileTitle:a.download});
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
/* ---------- PDF ---------- */
function smartPdfText(s){
  return String(s==null?'':s).replace(/[–—]/g,'-').replace(/→/g,'->').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/•/g,'-').replace(/ /g,' ').replace(/[^\x09\x0A\x0D\x20-\x7E¡-ÿ]/g,'');
}
function smartLogoData(){
  try{const im=document.getElementById('hdrLogoImg');if(!im||!im.naturalWidth)return null;const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,160,160);x.drawImage(im,10,10,140,140);return c.toDataURL('image/png');}catch(e){return null;}
}
function smartLoadScript(urls){
  return new Promise((res,rej)=>{
    let i=0;const next=()=>{if(i>=urls.length)return rej(new Error('lib'));const s=document.createElement('script');s.src=urls[i++];s.onload=()=>res();s.onerror=()=>{s.remove();next();};document.head.appendChild(s);};next();
  });
}
async function smartLoadPdfLib(){
  if(!(window.jspdf&&window.jspdf.jsPDF))await smartLoadScript(['https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js','https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js']);
  if(!(window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API&&window.jspdf.jsPDF.API.autoTable))await smartLoadScript(['https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js','https://unpkg.com/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js']);
}
function smartBuildPdf(jsPDFCtor,m,logo){
  const doc=new jsPDFCtor({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),ML=42,CW=W-ML*2;
  const T=smartPdfText,INK=[36,50,75];
  let y=0;
  doc.setFillColor(21,101,192);doc.rect(0,0,W,80,'F');
  let tx=ML;
  if(logo){try{doc.addImage(logo,'PNG',ML,14,52,52);tx=ML+64;}catch(e){}}
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text('LAPORAN HASIL ANALISA PRINT HISTORY',tx,38);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.text('Smart Analyzer  |  Portal Technical Support  |  PT. Citius Solusi Indonesia',tx,57);
  doc.setTextColor(INK[0],INK[1],INK[2]);y=98;
  const gap=()=>{y=doc.lastAutoTable.finalY+16;};
  const room=n=>{if(y>H-60-(n||0)){doc.addPage();y=50;}};
  const sec=t=>{room(60);doc.setFillColor(49,90,155);doc.rect(ML,y,CW,20,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.text(T(t),ML+8,y+14);y+=38;doc.setTextColor(INK[0],INK[1],INK[2]);};
  const para=(t,o)=>{o=o||{};const sz=o.size||10,ind=o.indent||0;doc.setFont('helvetica',o.bold?'bold':'normal');doc.setFontSize(sz);if(o.color)doc.setTextColor(o.color[0],o.color[1],o.color[2]);
    doc.splitTextToSize(T(t),CW-ind).forEach(ln=>{room();doc.text(ln,ML+ind,y);y+=sz*1.5;});
    doc.setTextColor(INK[0],INK[1],INK[2]);y+=(o.gap==null?4:o.gap);};
  const baseTbl={theme:'grid',styles:{fontSize:8.5,cellPadding:4,textColor:INK,lineColor:[200,210,230],lineWidth:0.5,overflow:'linebreak'},headStyles:{fillColor:[57,116,184],textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[243,246,252]},margin:{left:ML,right:ML,top:50,bottom:50}};
  const tbl=o=>{doc.autoTable(Object.assign({},baseTbl,o,{styles:Object.assign({},baseTbl.styles,o.styles||{})}));gap();};
  /* A informasi */
  sec('A. INFORMASI LAPORAN');
  tbl({startY:y,body:[['Nomor laporan',m.number],['Tanggal dan waktu cetak',m.printed],['Dibuat oleh',m.user],['Jenis modul',m.moduleLabel],['Sumber data',m.photoName],['Jumlah baris terbaca',String(m.events.length)],['Jumlah kode unik',String(m.recap.filter(x=>x.code!=='(tidak terbaca)').length)],['Baris perlu konfirmasi',String(m.lowCount)]].map(r=>r.map(T)),alternateRowStyles:{},columnStyles:{0:{fontStyle:'bold',fillColor:[232,238,255],cellWidth:150}}});
  /* B ringkasan */
  const s=m.summary;
  sec('B. RINGKASAN HASIL');
  para('Status: '+s.status,{bold:true,size:11,gap:6});
  para('Yang terjadi',{bold:true,gap:1});para(s.terjadi,{indent:8,gap:6});
  para('Kemungkinan penyebab',{bold:true,gap:1});para(s.penyebab,{indent:8,gap:6});
  para('Yang perlu dilakukan',{bold:true,gap:1});s.langkah.forEach((x,i)=>para((i+1)+'. '+x,{indent:8,gap:2}));y+=4;
  para('Hubungi Team Leader atau TS bila',{bold:true,gap:1});para(s.eskalasi,{indent:8,gap:8});
  if(m.lowCount)para('Perhatian: '+m.lowCount+' baris berkode kosong atau berkeyakinan di bawah 75%. Cocokkan dengan foto asli sebelum bertindak.',{color:[160,90,0],size:9,gap:10});
  /* C riwayat */
  sec('C. DATA RIWAYAT TERBACA');
  tbl({startY:y,head:[['No','Tanggal','Waktu','Kode','Kategori','Keyakinan']],body:m.events.map((e,i)=>[String(i+1),e.date||'',e.time||'',e.code||'Perlu konfirmasi',e.transaction?'Transaksi':'Modul',typeof e.confidence==='number'?Math.round(e.confidence*100)+'%':'-'].map(T)),columnStyles:{0:{cellWidth:30}}});
  /* D rekap */
  sec('D. REKAP KODE');
  tbl({startY:y,head:[['Kode','Jml','Pertama','Terakhir','Status database','Tahap alur','Masalah (database)']],body:m.recap.map(x=>[x.code,String(x.count),x.first||'',x.last||'',x.status,x.stage||'-',String(x.desc||'').slice(0,160)].map(T)),columnStyles:{1:{cellWidth:28},2:{cellWidth:70},3:{cellWidth:70}}});
  /* E rantai */
  sec('E. RANTAI KEJADIAN');
  (m.chain.length?m.chain:['Tidak ada rantai kejadian yang memenuhi aturan kedekatan waktu atau sensor.']).forEach(t=>para(t,{gap:3}));y+=6;
  /* F database */
  sec('F. REFERENSI DATABASE');
  const recs=[...m.records.map(x=>({r:x,s:'Terverifikasi'})),...m.candidates.map(c=>({r:c.record,s:'Kandidat OCR untuk '+c.event.code+' (konfirmasi manual)'}))];
  if(!recs.length)para('Tidak ada referensi database yang cocok untuk hasil ini.');
  recs.forEach(({r,s:st})=>{
    room(110);
    tbl({startY:y,theme:'grid',body:[['Kode',(r.k||'')+'  ('+st+')'],['Modul',r.m||'-'],['Masalah',r.d||'-'],['Analisa penyebab',r.p||'-'],['Tindakan',r.t||'Database belum mencatat langkah perbaikan.']].map(a=>a.map(T)),alternateRowStyles:{},columnStyles:{0:{fontStyle:'bold',fillColor:[232,238,255],cellWidth:100}}});
  });
  /* G analisa */
  sec('G. ANALISA DETAIL');
  if(!m.blocks.length)para('Tidak ada teks analisa.');
  m.blocks.forEach(b=>{
    if(b.t==='h'){y+=4;room(30);para(b.x,{bold:true,size:10.5,gap:3,color:[21,101,192]});}
    else if(b.t==='li')para(b.x,{indent:10,gap:2});
    else para(b.x,{gap:4});
  });
  y+=8;
  /* H catatan */
  sec('H. CATATAN DAN BATASAN');
  SMART_NOTES.forEach((t,i)=>para((i+1)+'. '+t,{size:9,gap:3}));
  /* footer */
  const n=doc.internal.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);doc.setDrawColor(200,210,230);doc.line(ML,H-38,W-ML,H-38);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(110,120,145);
    doc.text(T('No. '+m.number+'  |  Dibuat otomatis oleh Smart Analyzer  |  PT. Citius Solusi Indonesia'),ML,H-24);
    doc.text('Halaman '+i+' dari '+n,W-ML,H-24,{align:'right'});
  }
  return doc;
}
async function smartExportPdf(){
  const status=document.getElementById('smartStatus');
  let m;try{m=smartReportModel();}catch(e){alert(e.message);return;}
  const prev=status.textContent;status.textContent='Menyiapkan laporan PDF...';
  try{
    await smartLoadPdfLib();
    const doc=smartBuildPdf(window.jspdf.jsPDF,m,smartLogoData());
    const name='Laporan-Smart-Analyzer-'+m.stamp+'.pdf';
    doc.save(name);
    usageLog({type:'download',brand:'smart',category:'laporan-smart-analyzer',fileTitle:name});
    status.textContent='Laporan PDF diunduh: '+name;
  }catch(e){
    status.textContent=prev;
    smartPrintFallback(m);
  }
}
function smartPrintFallback(m){
  const h=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const w=window.open('','_blank');
  if(!w){alert('Pustaka PDF tidak dapat dimuat dan jendela cetak diblokir browser. Izinkan pop-up atau gunakan unduhan Excel.');return;}
  const s=m.summary;
  const tr=(a,t)=>'<tr>'+a.map(x=>'<'+t+'>'+h(x)+'</'+t+'>').join('')+'</tr>';
  const recs=[...m.records.map(x=>({r:x,s:'Terverifikasi'})),...m.candidates.map(c=>({r:c.record,s:'Kandidat OCR untuk '+c.event.code}))];
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Laporan '+h(m.number)+'</title><style>body{font:12px/1.5 Arial,sans-serif;color:#24324B;margin:24px}h1{font-size:18px;margin:0}h2{font-size:13px;background:#315A9B;color:#fff;padding:5px 8px;margin:18px 0 8px}table{width:100%;border-collapse:collapse;margin-bottom:6px}th{background:#3974B8;color:#fff;text-align:left}th,td{border:1px solid #C8D2E6;padding:4px 6px;vertical-align:top;font-size:11px}.k{font-weight:700;background:#E8EEFF;width:150px}.hd{border-bottom:3px solid #1565C0;padding-bottom:8px;margin-bottom:10px}@media print{h2{-webkit-print-color-adjust:exact;print-color-adjust:exact}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'
  +'<div class="hd"><h1>LAPORAN HASIL ANALISA PRINT HISTORY</h1>Smart Analyzer | Portal Technical Support | PT. Citius Solusi Indonesia</div>'
  +'<h2>A. Informasi Laporan</h2><table>'+[['Nomor laporan',m.number],['Tanggal dan waktu cetak',m.printed],['Dibuat oleh',m.user],['Jenis modul',m.moduleLabel],['Sumber data',m.photoName],['Baris terbaca',m.events.length],['Baris perlu konfirmasi',m.lowCount]].map(r=>'<tr><td class="k">'+h(r[0])+'</td><td>'+h(r[1])+'</td></tr>').join('')+'</table>'
  +'<h2>B. Ringkasan Hasil</h2><p><b>Status:</b> '+h(s.status)+'<br><b>Yang terjadi:</b> '+h(s.terjadi)+'<br><b>Kemungkinan penyebab:</b> '+h(s.penyebab)+'<br><b>Yang perlu dilakukan:</b></p><ol>'+s.langkah.map(x=>'<li>'+h(x)+'</li>').join('')+'</ol><p><b>Hubungi Team Leader atau TS bila:</b> '+h(s.eskalasi)+'</p>'
  +'<h2>C. Data Riwayat Terbaca</h2><table>'+tr(['No','Tanggal','Waktu','Kode','Kategori','Keyakinan'],'th')+m.events.map((e,i)=>tr([i+1,e.date||'',e.time||'',e.code||'Perlu konfirmasi',e.transaction?'Transaksi':'Modul',typeof e.confidence==='number'?Math.round(e.confidence*100)+'%':'-'],'td')).join('')+'</table>'
  +'<h2>D. Rekap Kode</h2><table>'+tr(['Kode','Jml','Pertama','Terakhir','Status database','Tahap alur','Masalah'],'th')+m.recap.map(x=>tr([x.code,x.count,x.first||'',x.last||'',x.status,x.stage||'-',x.desc],'td')).join('')+'</table>'
  +'<h2>E. Rantai Kejadian</h2>'+(m.chain.length?m.chain:['Tidak ada rantai kejadian yang memenuhi aturan.']).map(t=>'<p>'+h(t)+'</p>').join('')
  +'<h2>F. Referensi Database</h2>'+(recs.length?recs.map(({r,s:st})=>'<table><tr><td class="k">Kode</td><td>'+h(r.k)+' ('+h(st)+')</td></tr><tr><td class="k">Modul</td><td>'+h(r.m)+'</td></tr><tr><td class="k">Masalah</td><td>'+h(r.d)+'</td></tr><tr><td class="k">Analisa penyebab</td><td>'+h(r.p)+'</td></tr><tr><td class="k">Tindakan</td><td style="white-space:pre-wrap">'+h(r.t)+'</td></tr></table>').join(''):'<p>Tidak ada referensi database yang cocok.</p>')
  +'<h2>G. Analisa Detail</h2>'+m.blocks.map(b=>b.t==='h'?'<p><b>'+h(b.x)+'</b></p>':'<p style="margin:2px 0 2px '+(b.t==='li'?'14':'0')+'px">'+h(b.x)+'</p>').join('')
  +'<h2>H. Catatan dan Batasan</h2><ol>'+SMART_NOTES.map(t=>'<li>'+h(t)+'</li>').join('')+'</ol>'
  +'<script>window.onload=function(){window.print();}<\/script></body></html>');
  w.document.close();
}
async function smartTestAiConnection(){
  const status=document.getElementById('adminAiStatus');
  const button=document.getElementById('adminAiTestBtn');
  if(!currentIsAdmin){status.textContent='Hanya Admin yang dapat menguji konfigurasi AI.';return;}
  const apis=smartReadAdminAiForm().apis;
  if(!apis.length||apis.some(api=>!api.model||!api.apiKey)){status.textContent='Isi Model ID dan API key pada setiap baris sebelum menguji.';return;}
  button.disabled=true;
  status.textContent=`Menguji ${apis.length} API dengan failover...`;
  try{
    const result=await smartRequestAiWithFailover(apis,'Balas persis dengan: Koneksi API berhasil.',null);
    status.textContent=`Koneksi berhasil menggunakan ${result.provider} / ${result.model}.`;
  }catch(error){status.textContent=error.message||'Tes API gagal.';}
  finally{button.disabled=false;}
}
