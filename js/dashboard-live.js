
/* DASHBOARD LAPORAN PENGGUNA LIVE: khusus Admin, auto-refresh tiap 5 menit saat di menu Dashboard */
const LIVE_MS=300000;
let liveTicker=null,liveNext=0,liveBusy=false,liveRange=7,liveData=null,liveAt=null,liveCustom=null;
function liveFromTo(){return liveCustom?[liveCustom.from,liveCustom.to]:[usageDay(liveRange-1),usageDay(0)];}
function liveFmtDay(d){const p=String(d).split('-');return p.length===3?(+p[2])+' '+['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+p[1]-1]+' '+p[0]:d;}
function liveLabel(){return liveCustom?(liveCustom.from===liveCustom.to?liveFmtDay(liveCustom.from):liveFmtDay(liveCustom.from)+' – '+liveFmtDay(liveCustom.to)):(liveRange===1?'hari ini':liveRange+' hari terakhir');}
const $l=id=>document.getElementById(id);
function liveIsAdmin(){try{return currentIsAdmin===true&&!!currentUser;}catch(e){return false;}}
function roleSync(){document.body.classList.toggle('is-admin',liveIsAdmin());liveSync();}
function liveSync(){
  const run=liveIsAdmin()&&document.body.classList.contains('view-dashboard')&&!document.hidden;
  if(run&&!liveTicker){liveTicker=setInterval(liveTick,1000);liveTick();}
  else if(!run&&liveTicker){clearInterval(liveTicker);liveTicker=null;}
}
function liveTick(){
  if(!liveBusy&&Date.now()>=liveNext)liveLoad();
  const s=Math.max(0,Math.round((liveNext-Date.now())/1000)),el=$l('alCount');
  if(el&&!liveBusy)el.textContent='Refresh otomatis dalam '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}
async function liveLoad(){
  if(liveBusy)return;
  if(!window.__fb||!window.__fb.getUsage){liveNext=Date.now()+5000;return;}
  liveBusy=true;$l('alCount').textContent='Memuat data...';$l('alRefresh').disabled=true;
  try{
    const ft=liveFromTo();liveData=await window.__fb.getUsage(ft[0],ft[1]);
    liveAt=new Date();liveRender();liveNext=Date.now()+LIVE_MS;
  }catch(e){
    liveNext=Date.now()+60000;
    $l('alSub').textContent='Gagal memuat laporan: '+(e.message||'periksa koneksi & Firestore Rules')+'. Mencoba lagi dalam 1 menit.';
  }
  liveBusy=false;$l('alRefresh').disabled=false;
}

/* ===== grafik & ikon dashboard ===== */
const AL_ICON={
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 file:'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
 spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
 dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
 chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
 trend:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
 pie:'<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
 alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
 miss:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
 brand:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'
};
function alSvg(n,sz){return '<svg viewBox="0 0 24 24" width="'+(sz||24)+'" height="'+(sz||24)+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(AL_ICON[n]||'')+'</svg>';}
function alSmooth(p){
  if(p.length<2)return '';
  let d='M'+p[0][0].toFixed(1)+' '+p[0][1].toFixed(1);
  for(let i=0;i<p.length-1;i++){
    const p0=p[i-1]||p[i],p1=p[i],p2=p[i+1],p3=p[i+2]||p2;
    const lo=Math.min(p1[1],p2[1]),hi=Math.max(p1[1],p2[1]);
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=Math.min(hi,Math.max(lo,p1[1]+(p2[1]-p0[1])/6));
    const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=Math.min(hi,Math.max(lo,p2[1]-(p3[1]-p1[1])/6));
    d+=' C'+[c1x,c1y,c2x,c2y,p2[0],p2[1]].map(n=>n.toFixed(1)).join(' ');
  }
  return d;
}
function alSpark(vals,c,id){
  if(vals.length<2)return '<div style="height:34px"></div>';
  const W=120,H=34,p=3,mx=Math.max(1,...vals);
  const pts=vals.map((v,i)=>[p+i*(W-2*p)/(vals.length-1),H-p-(v/mx)*(H-2*p-2)]);
  const ln=alSmooth(pts),last=pts[pts.length-1],first=pts[0];
  return '<svg class="al-spark" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[1]+'" stop-opacity=".30"/><stop offset="1" stop-color="'+c[1]+'" stop-opacity="0"/></linearGradient></defs>'
    +'<path d="'+ln+' L'+last[0].toFixed(1)+' '+H+' L'+first[0].toFixed(1)+' '+H+'Z" fill="url(#'+id+')"/>'
    +'<path d="'+ln+'" fill="none" stroke="'+c[1]+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
}
function alNice(v){
  const raw=Math.max(1,v)/4,p=Math.pow(10,Math.floor(Math.log10(raw)));
  const step=[1,2,5,10].map(m=>m*p).find(x=>x>=raw);
  return {step:step,max:step*4};
}
let alDayRows=[],alDayW=0;
function alDrawDay(){
  const el=$l('alDay');if(!el)return;
  const head='<h4><span class="al-hi">'+alSvg('trend',16)+'</span>Aktivitas per hari</h4>';
  const days=alDayRows;
  if(!days.length){el.innerHTML=head+'<div class="al-none">Belum ada aktivitas.</div>';return;}
  const W=Math.max(280,Math.round((el.clientWidth||360)-36)),H=220,pl=30,pr=16,pt=30,pb=30;
  alDayW=el.clientWidth;
  const n=days.length,nice=alNice(Math.max(...days.map(d=>d[1]))),mx=nice.max;
  const x=i=>n===1?pl+(W-pl-pr)/2:pl+i*(W-pl-pr)/(n-1);
  const y=v=>pt+(H-pt-pb)*(1-v/mx);
  const base=y(0),pts=days.map((d,i)=>[x(i),y(d[1])]);
  const peak=days.reduce((b,d,i)=>d[1]>days[b][1]?i:b,0),step=n>1?(W-pl-pr)/(n-1):(W-pl-pr);
  let g='';
  for(let k=0;k<=4;k++){const v=nice.step*k,yy=y(v);g+='<line class="al-grid-l" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'"/><text class="al-axis" x="'+(pl-8)+'" y="'+(yy+3.5).toFixed(1)+'" text-anchor="end">'+v+'</text>';}
  const ln=alSmooth(pts);
  const area=n>1?'<path d="'+ln+' L'+pts[n-1][0].toFixed(1)+' '+base.toFixed(1)+' L'+pts[0][0].toFixed(1)+' '+base.toFixed(1)+'Z" fill="url(#alAreaG)"/>':'';
  const line=n>1?'<path d="'+ln+'" fill="none" stroke="url(#alLineG)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>':'';
  let dots='',lbl='',hits='';
  days.forEach((d,i)=>{
    const px=pts[i][0],py=pts[i][1],isPk=i===peak,showV=n<=9||isPk||i===n-1;
    dots+=isPk?'<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="9" fill="#6366F1" opacity=".16"/><circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="5.5" fill="#fff" stroke="#6366F1" stroke-width="3"/>':'<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="3.6" fill="#fff" stroke="#3B82F6" stroke-width="2.2"/>';
    if(showV){
      if(isPk){const w=String(d[1]).length*8+16;lbl+='<rect x="'+(px-w/2).toFixed(1)+'" y="'+(py-31).toFixed(1)+'" width="'+w+'" height="20" rx="10" fill="#4F46E5"/><text x="'+px.toFixed(1)+'" y="'+(py-17).toFixed(1)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff" style="font-family:var(--ui-font)">'+d[1]+'</text>';}
      else lbl+='<text class="al-val" x="'+px.toFixed(1)+'" y="'+(py-11).toFixed(1)+'" text-anchor="middle">'+d[1]+'</text>';
    }
    const every=n>10?2:1;
    if(i%every===0||i===n-1)lbl+='<text class="al-axis" x="'+px.toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+d[0].slice(8)+'/'+d[0].slice(5,7)+'</text>';
    hits+='<g class="al-col"><line class="al-guide" x1="'+px.toFixed(1)+'" x2="'+px.toFixed(1)+'" y1="'+pt+'" y2="'+base.toFixed(1)+'"/><circle class="al-hov" cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="6.5" fill="#fff" stroke="#4F46E5" stroke-width="3"/><rect class="al-hit" data-i="'+i+'" x="'+(px-step/2).toFixed(1)+'" y="'+pt+'" width="'+step.toFixed(1)+'" height="'+(base-pt).toFixed(1)+'"/></g>';
  });
  el.innerHTML=head+'<div class="al-chart"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik aktivitas per hari"><defs><linearGradient id="alAreaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6366F1" stop-opacity=".30"/><stop offset="1" stop-color="#6366F1" stop-opacity="0"/></linearGradient><linearGradient id="alLineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38BDF8"/><stop offset="1" stop-color="#6366F1"/></linearGradient></defs>'+g+area+line+dots+lbl+hits+'</svg><div class="al-tip" id="alTip"></div></div>';
  const tip=el.querySelector('#alTip');
  el.querySelectorAll('.al-hit').forEach(r=>{
    r.addEventListener('mouseenter',()=>{
      const i=+r.dataset.i,d=days[i];
      tip.innerHTML=d[0].slice(8)+'/'+d[0].slice(5,7)+' · <b>'+d[1]+'</b> aktivitas';
      tip.style.left=(pts[i][0]/W*100)+'%';tip.style.top=(pts[i][1]/H*100)+'%';tip.classList.add('on');
    });
    r.addEventListener('mouseleave',()=>tip.classList.remove('on'));
  });
}
function alDrawMix(parts){
  const el=$l('alMix');if(!el)return;
  const head='<h4><span class="al-hi">'+alSvg('pie',16)+'</span>Komposisi aktivitas</h4>';
  const tot=parts.reduce((a,p)=>a+p.v,0);
  if(!tot){el.innerHTML=head+'<div class="al-none">Belum ada aktivitas.</div>';return;}
  const R=54,C=2*Math.PI*R,gap=parts.filter(p=>p.v>0).length>1?4:0;let off=0,segs='';
  parts.forEach(p=>{
    if(!p.v)return;
    const len=Math.max(1,p.v/tot*C-gap);
    segs+='<circle cx="75" cy="75" r="'+R+'" fill="none" stroke="'+p.c+'" stroke-width="18" stroke-linecap="round" stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 75 75)"><title>'+p.l+': '+p.v+'</title></circle>';
    off+=p.v/tot*C;
  });
  const leg=parts.map(p=>'<div><i style="background:'+p.c+'"></i><span>'+p.l+'</span><b>'+p.v.toLocaleString('id')+'</b><small>'+Math.round(p.v/tot*100)+'%</small></div>').join('');
  el.innerHTML=head+'<div class="al-mix"><svg class="al-donut" viewBox="0 0 150 150" role="img" aria-label="Komposisi aktivitas"><circle cx="75" cy="75" r="'+R+'" fill="none" stroke="#EEF1F8" stroke-width="18"/>'+segs+'<text x="75" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="#111827" style="font-family:var(--ui-font)">'+tot.toLocaleString('id')+'</text><text x="75" y="95" text-anchor="middle" font-size="11" fill="#6B7280" style="font-family:var(--ui-font)">aktivitas</text></svg><div class="al-leg">'+leg+'</div></div>';
}
try{
  new ResizeObserver(()=>{clearTimeout(window.__alRt);window.__alRt=setTimeout(()=>{const e=$l('alDay');if(e&&alDayRows.length&&Math.abs(e.clientWidth-alDayW)>8)alDrawDay();},150);}).observe($l('alDay'));
}catch(e){}
function liveRender(){
  const excl=new Set(usageExcludeList());
  const ev=(liveData||[]).filter(e=>!excl.has((e.email||'').toLowerCase())&&!(currentUser&&e.uid===currentUser.uid));
  const T=t=>ev.filter(e=>e.type===t),sr=T('search'),vw=T('view_error'),sm=T('smart_analyze'),cl=T('clara'),dl=T('download');
  const B=(typeof USAGE_BRAND!=='undefined'&&USAGE_BRAND)||{};
  const C=(typeof USAGE_CAT!=='undefined'&&USAGE_CAT)||{};
  $l('alSub').textContent=ev.length.toLocaleString('id')+' aktivitas • '+liveLabel()+' • diperbarui '+liveAt.toLocaleTimeString('id-ID');
  const dayRows=usageCount(ev,e=>e.day).sort((a,b)=>a[0]<b[0]?-1:1).slice(-14),dayKeys=dayRows.map(d=>d[0]);
  const ser=(arr,fn)=>dayKeys.map(k=>{const a=arr.filter(e=>e.day===k);return fn?fn(a):a.length;});
  const st=[
    {k:'users',l:'FSE aktif',v:new Set(ev.map(e=>e.email)).size,c:['#818CF8','#4F46E5'],s:ser(ev,a=>new Set(a.map(e=>e.email)).size)},
    {k:'search',l:'Pencarian',v:sr.length,c:['#38BDF8','#2563EB'],s:ser(sr)},
    {k:'file',l:'Detail dibuka',v:vw.length,c:['#FB7185','#F97316'],s:ser(vw)},
    {k:'spark',l:'Analisa Smart',v:sm.length,c:['#C084FC','#7C3AED'],s:ser(sm)},
    {k:'chat',l:'Tanya Clara',v:cl.length,c:['#2DD4BF','#0D9488'],s:ser(cl)},
    {k:'dl',l:'Download',v:dl.length,c:['#34D399','#059669'],s:ser(dl)}];
  $l('alStats').innerHTML=st.map((x,i)=>'<div class="al-stat" style="--c1:'+x.c[0]+';--c2:'+x.c[1]+'"><div class="al-st-top"><div class="al-ic">'+alSvg(x.k,24)+'</div><div><div class="al-n">'+x.v.toLocaleString('id')+'</div><div class="al-l">'+x.l+'</div></div></div>'+alSpark(x.s,x.c,'alsp'+i)+'</div>').join('');
  const list=(title,rows,none,ico,tag)=>{const mx=rows.length?rows[0][1]:1;return '<h4><span class="al-hi">'+alSvg(ico,16)+'</span>'+title+'</h4>'+(rows.length?rows.slice(0,5).map((r,i)=>'<div class="al-row"><em class="r'+(i+1)+'">'+(i+1)+'</em><span title="'+usageEsc(r[0])+'">'+usageEsc(r[0])+'</span>'+(tag?tag(r):'')+'<b>'+r[1]+'</b><i style="width:'+Math.max(6,Math.round(r[1]/mx*100))+'%"></i></div>').join(''):'<div class="al-none">'+none+'</div>');};
  alDayRows=dayRows;alDrawDay();
  alDrawMix([{l:'Pencarian',v:sr.length,c:'#2563EB'},{l:'Detail dibuka',v:vw.length,c:'#F97316'},{l:'Analisa Smart',v:sm.length,c:'#7C3AED'},{l:'Tanya Clara',v:cl.length,c:'#0D9488'},{l:'Download',v:dl.length,c:'#059669'}]);
  $l('alFse').innerHTML=list('FSE paling aktif',usageCount(ev,e=>e.email||'(tanpa email)'),'Belum ada aktivitas.','users');
  { const mm={},mf={};
    const er=usageCount(vw,e=>{const k=(B[e.brand]||e.brand)+' '+(e.module||'')+' · '+e.query;const p=usageProbMod(e);mm[k]=p.s;mf[k]=p.f;return k;});
    $l('alErr').innerHTML=list('Kode error paling sering dibuka',er,'Belum ada data.','alert',r=>mm[r[0]]?'<span class="al-tag md" title="'+usageEsc('Modul bermasalah: '+mm[r[0]]+(mf[r[0]]?' - '+mf[r[0]]:''))+'">'+usageEsc(mm[r[0]])+'</span>':''); }
  $l('alKw').innerHTML=list('Kata kunci paling dicari',usageCount(sr,e=>(B[e.brand]||e.brand)+' · '+e.query),'Belum ada data.','search');
  { usageSugCache.clear();window.__alMissSrc=sr.filter(e=>e.results===0);alMissDraw();usageMarksLoad().then(alMissDraw); }
  $l('alDl').innerHTML=list('File paling sering di-download',usageCount(dl,e=>e.fileTitle||((C[e.category]||e.category||'-')+(e.bank?' · '+e.bank:''))),'Belum ada download.','dl');
  $l('alClara').innerHTML=list('Pertanyaan ke Clara',usageCount(cl,e=>e.query),'Belum ada pertanyaan ke Clara.','chat');
  $l('alBrand').innerHTML=list('Pencarian per Brand',usageCount(sr,e=>B[e.brand]||e.brand||'-'),'Belum ada pencarian.','brand');
}
$l('alRange').onchange=()=>{
  const v=$l('alRange').value,box=$l('alCustom');
  if(v==='custom'){
    $l('alFrom').min=usageDay(29);$l('alFrom').max=usageDay(0);$l('alTo').min=usageDay(29);$l('alTo').max=usageDay(0);
    if(!$l('alFrom').value)$l('alFrom').value=usageDay(6);
    if(!$l('alTo').value)$l('alTo').value=usageDay(0);
    $l('alCErr').textContent='';box.hidden=false;return;
  }
  box.hidden=true;liveCustom=null;liveRange=+v;liveNext=0;liveTick();
};
$l('alApply').onclick=()=>{
  const f=$l('alFrom').value,t=$l('alTo').value,err=$l('alCErr');
  if(!f||!t){err.textContent='Isi tanggal dari dan sampai.';return;}
  if(f>t){err.textContent='Tanggal "Dari" tidak boleh setelah "Sampai".';return;}
  if(f<usageDay(29)||t>usageDay(0)){err.textContent='Data laporan hanya tersimpan 30 hari terakhir (sampai hari ini).';return;}
  err.textContent='';liveCustom={from:f,to:t};liveNext=0;liveTick();
};
$l('alRefresh').onclick=()=>{liveNext=0;liveTick();};
$l('alFull').onclick=()=>{openAdminLogin();setTimeout(()=>{try{setAdminPanelTab('usage');}catch(e){}},80);};
(function(){
  const lo=document.getElementById('techLogoutBtn');
  if(lo)new MutationObserver(roleSync).observe(lo,{attributes:true,attributeFilter:['style','title']});
  document.addEventListener('visibilitychange',liveSync);
  roleSync();
})();

/* ===== DASHBOARD ADMIN ===== */
const ADB_LBL={brm860:'BRM 860',brm50:'BRM 50',cdu10:'CDU 10',cdu30:'CDU 30',cdu800:'CDU 800',extra:'Modul Lainnya'};
function adminGo(t){
  openAdminPanel();
  if(t==='ai'){setAdminPanelTab('ai');}
  else setAdminPanelTab(t);
}
function adminDashRefresh(){
  try{
    if(typeof DB==='undefined')return;
    let tot=0;const box=document.getElementById('adbDb');if(!box)return;
    box.innerHTML=Object.keys(ADB_LBL).filter(k=>DB[k]).map(k=>{const n=DB[k].length;tot+=n;return '<div><b>'+n.toLocaleString('id-ID')+'</b><span>'+ADB_LBL[k]+'</span></div>';}).join('');
    const t=document.getElementById('adbDbTxt');if(t)t.textContent=tot.toLocaleString('id-ID')+' kode di 6 modul. Tambah, ubah, atau hapus.';
    const w=document.getElementById('adhWho');if(w)w.textContent=(typeof currentUser!=='undefined'&&currentUser&&currentUser.email)?'Masuk sebagai '+currentUser.email:'';
  }catch(e){}
}
(function(){
  const sv=showView;
  showView=function(v){sv.apply(this,arguments);if(v==='dashboard')adminDashRefresh();};
  const rs=roleSync;
  roleSync=function(){rs.apply(this,arguments);adminDashRefresh();};
  const cl=closeAdminPanel;
  closeAdminPanel=function(){cl.apply(this,arguments);adminDashRefresh();};
  adminDashRefresh();
})();
