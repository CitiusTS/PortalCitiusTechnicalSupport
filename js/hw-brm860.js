
/* ===== POSISI KOMPONEN BRM860 (sensor, motor, solenoid, board, dip switch) — dari slide layout ===== */
const HW=[];
function hwAdd(t,ids,fn,mod,pos,x,y){HW.push({t:t,ids:Array.isArray(ids)?ids:[ids],fn:fn,mod:mod,pos:pos,x:x==null?null:x,y:y==null?null:y});}
(function(){
  /* ---- SENSOR: BMU / BM (unit atas + transport) ---- */
  hwAdd('s','GS008','Memantau penggerak CEN-I/F (interface)','BM','Di ATAS interface, bagian transport tepat di bawah UTC (antara unit atas BMU dan unit bawah BMD, sisi kiri)',350,470);
  hwAdd('s','GS001','Memantau gap (jarak) uang di jalur atas','BM','Jalur transport atas, ujung kanan, tepat di kiri CSM (dekat gate GG001)',915,442);
  hwAdd('s','GS002','Memantau jalur transport atas','BM','Jalur transport atas, di bawah TE (antara GS005 dan GS001)',820,442);
  hwAdd('s','GS004','Mendeteksi uang lewat dari UTC','BM','Sisi kanan UTC, jalur transport atas',465,352);
  hwAdd('s','GS006','Memantau jalur atas dan transport belakang','BM','Sisi kiri-bawah UTC, jalur transport belakang (vertikal) menuju interface',378,437);
  hwAdd('s','GS021','Memantau jalur transport bawah','BM','Ujung kiri jalur transport bawah (di atas RC4), dekat transport belakang',300,507);
  hwAdd('s',['GSB01','GSB02'],'Indeks blank UTC atas (kiri/kanan)','UTC','Di dalam UTC, bagian atas',335,300);
  hwAdd('s',['GSD11','GSD12'],'Double-detect atas R/L','BM','Jalur transport atas sisi kanan, sebelum masuk CSM (dekat GS001)',935,415);
  hwAdd('s',['GSD21','GSD22'],'Double-detect bawah R/L','BM','Ujung kiri jalur transport bawah (tampak abu-abu di tabel slide = opsional)',318,545);
  hwAdd('s','GS005','Deteksi switching 3-way atas (GG002)','BM','Jalur atas, di bawah celah RJE–TE, dekat gate GG002',655,437);
  hwAdd('s','GS013','Deteksi unit atas terpasang/dilepas','BM','Sisi kanan luar CSM (label slide: Unit exact position)',1300,383);
  hwAdd('s','GS015','Deteksi CSM terbuka','CSM','Di CSM, sisi kanan-bawah',1190,396);
  hwAdd('s','GS026','Deteksi unit bawah (BMD) terpasang/dilepas','BM','Sisi kanan unit bawah, di kanan RJC (label slide: BMD exact position)',1073,890);
  hwAdd('s','GS051','Encoder motor GM001','BM','Sisi kanan interface, di ujung kanan band putus-putus antara unit atas dan bawah',1085,466);
  hwAdd('s','GSD10','Upper DD array (13 ch)','BM','Tidak digambar di layout slide (jalur transport atas)');
  hwAdd('s','GS010','Deteksi UTC terpasang/dilepas/pintu terbuka','UTC','Di UTC (tidak digambar di layout slide)');
  hwAdd('s','GS016','Deteksi jalur transport belakang terbuka','BM','Transport belakang (tidak digambar di layout slide)');
  /* ---- SENSOR: CSM ---- */
  hwAdd('s',['GS601','GS616','GS603'],'Deteksi uang abnormal masuk (kiri/tengah/kanan)','CSM','CSM, sisi kanan-atas',1270,313);
  hwAdd('s',['GS606','GS617','GS607'],'Deteksi blank bill (kiri/tengah/kanan)','CSM','CSM, sisi kanan, di bawah GS601/616/603',1270,340);
  hwAdd('s',['GS608','GS615','GS609'],'Kontrol pemisahan (kiri/tengah/kanan)','CSM','Pintu masuk CSM, di sisi kiri CSM (dekat gate GG001)',940,358);
  hwAdd('s','GS650','Posisi push plate deposit','CSM','CSM, bagian bawah-tengah',1190,382);
  hwAdd('s','GS652','Posisi front plate deposit','CSM','CSM, bagian atas-kiri',1047,282);
  hwAdd('s','GS655','Deteksi tekanan pemisahan','CSM','Kolom sensor CSM sisi kiri, paling atas',978,302);
  hwAdd('s','GS656','Posisi benar F-roller (pemisah)','CSM','Kolom sensor CSM sisi kiri, di bawah GS655',980,318);
  hwAdd('s','GS662','Posisi stack sheet','CSM','Kolom sensor CSM sisi kiri, di bawah GS656',980,332);
  hwAdd('s','GS657','Encoder E-roller (deteksi 2 lembar)','CSM','Kolom sensor CSM sisi kiri, paling bawah',980,346);
  hwAdd('s','GS674','Posisi benar pemisahan front plate','CSM','CSM bagian atas, di kanan kolom GS655–GS657',1047,303);
  hwAdd('s','GS659','Shutter tertutup','CSM','CSM, sisi kanan-atas (tepat di atas GS658)',1175,282);
  hwAdd('s','GS658','Shutter terbuka','CSM','CSM, sisi kanan-atas (tepat di bawah GS659)',1175,296);
  hwAdd('s',['GS678','GS681'],'Posisi carriage (hospitality / exact)','CSM','CSM, bagian bawah-kiri (dekat motor carriage GM610)',1105,395);
  /* ---- SENSOR: TE / RJE ---- */
  hwAdd('s',['GS701','GS702'],'Sensor masuk TE (kiri/kanan)','TE','Pintu masuk TE, sisi kiri-bawah drum TE',730,345);
  hwAdd('s','GS751','Tape start/end TE','TE','Bawah drum TE, sisi kanan',857,364);
  hwAdd('s','GS753','Encoder tape TE','TE','Bawah drum TE, bagian tengah',795,390);
  hwAdd('s','GW701','Tombol hapus sisa media TE','TE','Bagian atas, di sisi kiri TE (antara RJE dan TE)',722,305);
  hwAdd('s',['GSR01','GSR02'],'Sensor masuk RJE (kiri/kanan)','RJE','Pintu masuk RJE, di bawah drum RJE',595,388);
  hwAdd('s','GSR51','Tape start/end RJE','RJE','Bawah drum RJE, sisi kiri',500,368);
  hwAdd('s','GSR53','Encoder tape RJE','RJE','Atas drum RJE, sisi kiri',548,303);
  hwAdd('s','GWR01','Tombol hapus sisa media RJE','RJE','Bagian atas RJE, sisi kanan',600,300);
  /* ---- SENSOR: RJC ---- */
  hwAdd('s','GSA01','Deteksi lembar di RJC','RJC','Ujung kanan jalur transport bawah, di atas RJC',1070,573);
  hwAdd('s','GSA51','Posisi front plate RJC','RJC','Bagian atas RJC, sisi kanan',985,607);
  hwAdd('s','GSA52','Deteksi blank RJC','RJC','Bagian atas RJC, sisi kiri',965,590);
  hwAdd('s','GSA55','RJC hampir penuh (opsi)','RJC','RJC bagian bawah-tengah, sisi kanan',1000,930);
  hwAdd('s','GSA53','RJC penuh (deteksi dasar)','RJC','Dasar RJC, sisi kiri',940,972);
  hwAdd('s','GSA06','Encoder push plate RJC','RJC','Dasar RJC, sisi kanan',1030,972);
  /* ---- SENSOR: RC1–RC4 (kolom: RC4 x=340, RC3=500, RC2=660, RC1=820) ---- */
  const COL={4:340,3:500,2:660,1:820};
  const RS=[['01,02','Kontrol pemisahan (kiri/kanan)','Bagian atas kaset, dekat roller pemisah',10,596],['04','Deteksi blank','Bagian atas kaset, di bawah roller',15,672],['05','Memisahkan uang (separate bills)','Atas kaset, dekat jalur transport bawah',50,579],['07','Kontrol fase F-roller','Bagian atas kaset, di bawah roller pemisah',30,693],['08','Deteksi tekanan pemisahan P-roller','Bagian atas kaset, di kiri roller',15,645],['10','Hampir penuh (opsi)','Dasar kaset, paling atas dari 3 sensor dasar',25,930],['11','Kaset penuh','Dasar kaset, di tengah',25,951],['12','Deteksi dasar kaset (full)','Dasar kaset, paling bawah',25,972],['13','Fase pengosongan stack','Bagian atas kaset, sisi kanan roller',55,660],['14','Kontrol full board','Bagian atas kaset, sisi kiri roller',-20,617],['15','Hampir habis (opsi)','Tengah-bawah kaset, di bawah GS#107',25,736]];
  [1,2,3,4].forEach(n=>{
    RS.forEach(r=>{
      const ids=r[0].split(',').map(s=>'GS'+n+'1'+s);
      hwAdd('s',ids,r[1],'RC'+n,('Kaset RC'+n+': '+r[2]).replace('GS#','GS'+n),COL[n]+r[3],r[4]);
    });
    hwAdd('m','GM'+n+'01','Penggerak separator kaset','RC'+n,'Kaset RC'+n+', bagian tengah-atas (motor separator)',COL[n]+40,690);
    hwAdd('m','GM'+n+'02','Pergerakan push plate kaset','RC'+n,'Dasar kaset RC'+n+' (motor push plate)',COL[n]+27,1025);
    hwAdd('g','GG'+n+'01','Solenoid pengaman kaset RC (RC security)','RC'+n,'Kaset RC'+n+', bagian tengah (solenoid linear di bawah label RC'+n+')',COL[n]+27,760);
  });
  /* ---- MOTOR ---- */
  hwAdd('m','GM001','Penggerak jalur transport atas','BM','Tengah jalur transport atas, antara TE dan CSM',752,420);
  hwAdd('m','GM002','Penggerak jalur masuk TE','BM','Bagian atas, di sisi kiri TE (antara RJE dan TE)',688,328);
  hwAdd('m','GM003','Penggerak jalur transport bawah','BM','Ujung kiri jalur transport bawah (di atas RC4)',497,527);
  hwAdd('m','GMA02','Pergerakan push plate RJC','RJC','Dasar RJC',928,1025);
  hwAdd('m','GM601','Motor pemisah (separate) CSM','CSM','CSM, kiri-atas',1010,307);
  hwAdd('m','GM605','Motor stack sheet CSM','CSM','CSM, kiri, di bawah GM601',1010,350);
  hwAdd('m','GM610','Motor carriage CSM','CSM','CSM, bagian bawah',1126,430);
  hwAdd('m','GM602','Motor push plate CSM','CSM','CSM, sisi kanan',1150,365);
  hwAdd('m','GM612','Motor front plate CSM','CSM','CSM, bagian atas-kiri (lingkaran kuning)',1100,335);
  hwAdd('m','GM604','Motor shutter CSM','CSM','CSM, bagian atas-kanan (dekat sensor shutter GS658/GS659; tidak diberi label di layout)',1130,298);
  hwAdd('m','GM701','Motor drum/reel TE','TE','Bagian atas drum TE, sisi kanan',873,298);
  hwAdd('m','GMR01','Motor drum/reel RJE','RJE','Bagian atas drum RJE',630,298);
  hwAdd('m',['GM004','GM005'],'Penggerak transit depan/belakang (opsi)','BM','Opsi, tidak digambar di layout slide');
  /* ---- SOLENOID ---- */
  hwAdd('g','GG001','Gate switching Transit/CSM','BM','Jalur transport atas, tepat di kiri CSM',992,412);
  hwAdd('g',['GG002','GG003'],'Gate 3-way atas (kanan-tengah / kiri)','BM','Jalur transport atas, di bawah TE (dekat GS005)',695,412);
  hwAdd('g','GG004','Gate switching RJE','BM','Jalur transport atas, di bawah RJE',615,412);
  hwAdd('g','GG005','Gate switching UTC','BM','Jalur transport atas, di bawah sisi kanan UTC',512,420);
  hwAdd('g','GG006','Gate switching RC4 (bawah)','BM','Jalur transport bawah, di atas RC4',459,557);
  hwAdd('g','GG007','Gate switching RC3 (bawah)','BM','Jalur transport bawah, di atas RC3',600,557);
  hwAdd('g','GG008','Gate switching RC2 (bawah)','BM','Jalur transport bawah, di atas RC2',743,557);
  hwAdd('g','GG009','Gate switching RC1 (bawah)','BM','Jalur transport bawah, di atas RC1',884,557);
  hwAdd('g',['GG011','GG012'],'Gate 3-way belakang (opsi)','BM','Opsi, tidak digambar di layout slide');
})();
const HW_BOARD=[
  {k:'RBU',n:'RBU B/D',pos:'Tengah unit bawah, di atas kaset RC2–RC3 (mengontrol BMD, RC, RJC)',x:778,y:460},
  {k:'MAIN',n:'MAIN B/D',pos:'Di area interface antara unit atas dan bawah, bagian tengah (mengontrol BRM860 secara keseluruhan)',x:780,y:330},
  {k:'CSM',n:'CSM B/D',pos:'Sisi kanan-bawah CSM',x:1087,y:278},
  {k:'TE/RJE',n:'TE/RJE B/D',pos:'Bagian atas, di antara RJE dan TE',x:795,y:222},
  {k:'RC4',n:'RC B/D (RC4)',pos:'Di dalam kaset RC4, bagian bawah-tengah',x:592,y:645},
  {k:'RC3',n:'RC B/D (RC3)',pos:'Di dalam kaset RC3, bagian bawah-tengah',x:686,y:645},
  {k:'RC2',n:'RC B/D (RC2)',pos:'Di dalam kaset RC2, bagian bawah-tengah',x:778,y:645},
  {k:'RC1',n:'RC B/D (RC1)',pos:'Di dalam kaset RC1, bagian bawah-tengah',x:874,y:645},
  {k:'RJC',n:'RJC B/D',pos:'Di dalam RJC, bagian bawah-tengah',x:968,y:645},
  {k:'HALL',n:'Hall 2ch B/D (2 buah)',pos:'Satu di dekat CSM (kiri-atas CSM), satu di ujung kiri jalur transport bawah; menyimpan nilai kalibrasi double note',x:1020,y:228},
  {k:'HALL',n:'Hall 2ch B/D (2 buah)',pos:'(kedua) ujung kiri jalur transport bawah',x:550,y:378,dup:1}
];
const HW_DIP=[
  {k:'main',img:'dmain',n:'Dip switch Main B/D',pos:'Pada board MAIN (area interface, tengah)',txt:'Standar: SW1 ON, SW2–SW8 OFF. SW1 ON = log lewat serial port tidak dikirim (OFF hanya untuk designer). SW2 OFF = interrupt Rx debug nonaktif. SW3 (dicoret di slide) = deteksi tombol TE/RJE, tidak dipakai. SW4, SW5, SW7 cadangan. SW6 OFF = uang asli (ON = uang test). SW8 OFF = download EP lewat USB (ON = boot download serial, hanya designer).'},
  {k:'rbu',img:'drbu',n:'Dip switch RBU B/D',pos:'Pada board RBU (tengah unit bawah)',txt:'Standar: SW1 ON, SW2–SW8 OFF. SW1 ON = log serial tidak dikirim. SW2 OFF = interrupt Rx debug nonaktif. SW5 (ditandai kuning) ON = fitur TM/VDM untuk customer aktif, OFF = nonaktif. SW7 (ditandai kuning) ON = NV-RAM dihapus (data enkripsi: MAC & S/N), OFF = tidak dihapus. SW8 OFF = download EP lewat USB.'},
  {k:'rbut',img:'drbut',n:'Dip switch RBU B/D — tipe BRM',pos:'Pada board RBU',txt:'SW1–SW4 = tipe BRM (BRM860 = SW4 ON, SW1–SW3 OFF). SW5 = tipe BMD: ON = BMD kecil (tinggi 430 mm), OFF = BMD besar (530 mm). SW6 cadangan. SW7–SW8 = tebal safety: 0/0 Type0 40 mm, 1/0 Type1 25 mm, 0/1 Type2 12,7 mm, 1/1 Type3 0 mm. Contoh slide: BMD kecil + Type2. Slide menandai SW8 "perlu cek fisik (untuk India OFF)".'},
  {k:'rc',img:'drc',n:'Dip switch RC61 B/D (di kaset)',pos:'Pada board di dalam kaset RC, dekat tutup kaset (lingkaran merah di slide)',txt:'SW1: ON = kaset recycle, OFF = kaset deposit. SW2–SW5 = jenis nominal: 0001 = 20K, 1100 = 50K, 0110 = 100K, 0011 = MIX, 1110 = 1000, 0111 = 2000, 1001 = 5000, 1010 = 10K.'}
];
const HW_IDX=(function(){const m={};HW.forEach(c=>c.ids.forEach(i=>{if(!m[i])m[i]=c;}));return m;})();
const HW_TYPE={s:'Sensor',m:'Motor',g:'Solenoid'};
function hwEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function hwImgs(){return window.HW_IMG_DATA||{};}
/* modul dari digit ke-3 kode BRM860 -> daftar label mod */
const HW_MODDIG={'0':['BM'],'1':['RC1'],'2':['RC2'],'3':['RC3'],'4':['RC4'],'6':['CSM'],'7':['TE'],'R':['RJE'],'C':['RJC']};
const HW_MODNAME={UTC:'UTC',RJE:'RJE',TE:'TE',CSM:'CSM',RJC:'RJC',RC1:'RC1',RC2:'RC2',RC3:'RC3',RC4:'RC4'};
function hwDetect(text,hits){
  const T=String(text||''),up=T.toUpperCase(),low=T.toLowerCase();
  const res={items:[],dips:[],boards:[],why:[]};
  const seen=new Set();
  const addComp=c=>{if(c&&!seen.has(c)){seen.add(c);res.items.push(c);}};
  const is860=/brm\s?-?860|mx\s?-?8600/.test(low)||(hits||[]).some(h=>String(h.src||'').indexOf('BRM860')>=0);
  /* 1. ID komponen yang disebut pengguna (salah ketik HS008 -> GS008 ikut dikenali) */
  (up.match(/\b[GH][SMGWL][A-Z0-9]{2,5}\b/g)||[]).forEach(x=>{const id='G'+x.slice(1);if(HW_IDX[id]){addComp(HW_IDX[id]);res.why.push('user');}});
  /* 2. ID komponen yang tertulis di entri database BRM860 yang cocok */
  if(is860){(hits||[]).filter(h=>String(h.src||'').indexOf('BRM860')>=0).slice(0,3).forEach(h=>{
    const s=JSON.stringify(h).toUpperCase();
    (s.match(/\bG[SMGWL][A-Z0-9]{2,5}\b/g)||[]).forEach(id=>{if(HW_IDX[id])addComp(HW_IDX[id]);});
  });}
  /* 3. modul dari kode error 7 karakter (hanya bila tidak ada ID eksplisit) */
  const codes=[...new Set(up.match(/\b5[0-9A-Z@]{6}\b/g)||[])].slice(0,2);
  const wantsPos=/(posisi|letak|lokasi|dimana|di mana|ada di|sensor|motor|solenoid|gate|cek|periksa|cari)/i.test(T);
  let modSet=new Set();
  if(!res.items.length&&wantsPos&&codes.length){
    codes.forEach(c=>{const m=HW_MODDIG[c.charAt(2)];if(m)m.forEach(x=>modSet.add(x));});
  }
  /* 4. nama modul disebut pengguna */
  if(!res.items.length){
    Object.keys(HW_MODNAME).forEach(k=>{if(new RegExp('\\b'+k+'\\b','i').test(T)&&/(sensor|motor|solenoid|gate|posisi|letak|lokasi)/i.test(T))modSet.add(k);});
  }
  if(modSet.size){HW.filter(c=>modSet.has(c.mod)).forEach(addComp);}
  /* dip switch & board */
  if(/dip\s?-?\s?switch|dipsw|\bsw[1-8]\b|switch/i.test(T)){
    HW_DIP.forEach(d=>{
      const k=d.k;
      if(k==='main'&&/main|utama|mainboard/i.test(T))res.dips.push(d);
      else if((k==='rbu'||k==='rbut')&&/rbu|bmd|tipe|type|safety|tm|vdm|nv-?ram|enkripsi|encrypt/i.test(T))res.dips.push(d);
      else if(k==='rc'&&/rc\s?-?61|kaset|cassette|nominal|denom|recycle|deposit cassette/i.test(T))res.dips.push(d);
    });
    if(!res.dips.length)res.dips=HW_DIP.slice();
  }
  if(/\b(board|b\/d|pcb|papan)\b/i.test(T)||res.dips.length){
    HW_BOARD.forEach(b=>{
      if(b.dup)return;
      const hit=(b.k==='MAIN'&&/main/i.test(T))||(b.k==='RBU'&&/rbu/i.test(T))||(b.k==='CSM'&&/csm/i.test(T))||(b.k==='TE/RJE'&&/\b(te|rje)\b/i.test(T))||(/^RC\d$/.test(b.k)&&/\brc\s?-?\d|kaset|cassette/i.test(T))||(b.k==='RJC'&&/rjc/i.test(T))||(b.k==='HALL'&&/hall/i.test(T));
      if(hit)res.boards.push(b);
    });
    res.dips.forEach(d=>{const bk=d.k==='main'?'MAIN':d.k==='rc'?'RC1':'RBU';const b=HW_BOARD.find(x=>x.k===bk);if(b&&res.boards.indexOf(b)<0)res.boards.push(b);});
    if(!res.boards.length&&/\b(board|b\/d|pcb|papan)\b/i.test(T))res.boards=HW_BOARD.filter(b=>!b.dup);
  }
  return res;
}
function hwBlockText(res){
  if(!res||(!res.items.length&&!res.dips.length&&!res.boards.length))return '';
  let o='POSISI KOMPONEN BRM860 (dari slide layout resmi; ini DATA POSISI, gunakan apa adanya):\n';
  res.items.slice(0,14).forEach(c=>{o+='- '+c.ids.join('/')+' ('+HW_TYPE[c.t]+', '+c.fn+', modul '+c.mod+'): '+c.pos+'\n';});
  if(res.items.length>14)o+='(+'+(res.items.length-14)+' komponen lain di modul yang sama tampil di gambar)\n';
  res.boards.forEach(b=>{o+='- '+b.n+': '+b.pos+'\n';});
  res.dips.forEach(d=>{o+='- '+d.n+' ('+d.pos+'): '+d.txt+'\n';});
  o+='ATURAN: (1) Saat menyebut sensor/motor/solenoid/dip switch/board pada BRM860, sebutkan POSISI FISIKNYA memakai daftar di atas, contoh "GS008 ada di atas interface bagian transport di bawah UTC". (2) Jangan mengarang posisi untuk komponen yang tidak ada di daftar; katakan posisinya belum ada di data layout. (3) Urutkan pengecekan dari komponen yang paling mungkin, sebut modul dan arah (kiri/kanan/atas/bawah). (4) Akhiri dengan satu kalimat bahwa gambar posisi bisa dibuka lewat tombol "Lihat posisi di gambar" di bawah jawaban.';
  return o;
}
/* kartu di chat + pop-up gambar */
window.__hwSets=window.__hwSets||[];
function hwCard(res){
  if(!res||(!res.items.length&&!res.dips.length&&!res.boards.length))return;
  const box=document.getElementById('chMsgs');if(!box)return;
  const id=window.__hwSets.push(res)-1;
  const d=document.createElement('div');d.className='cm db';
  let h='<div class="bub hwc"><b>📍 Posisi komponen BRM860</b><ul>';
  res.items.slice(0,8).forEach(c=>{h+='<li><b>'+hwEsc(c.ids.join('/'))+'</b> <span class="hwt">'+HW_TYPE[c.t]+' · '+hwEsc(c.mod)+'</span><em>'+hwEsc(c.pos)+'</em></li>';});
  if(res.items.length>8)h+='<li><em>+'+(res.items.length-8)+' komponen lain ada di gambar</em></li>';
  res.boards.slice(0,4).forEach(b=>{h+='<li><b>'+hwEsc(b.n)+'</b> <span class="hwt">Board</span><em>'+hwEsc(b.pos)+'</em></li>';});
  res.dips.forEach(x=>{h+='<li><b>'+hwEsc(x.n)+'</b> <span class="hwt">Dip switch</span><em>'+hwEsc(x.pos)+'</em></li>';});
  h+='</ul><button type="button" class="hwbtn" onclick="hwOpen('+id+')">🖼️ Lihat posisi di gambar</button></div>';
  d.innerHTML=h;box.appendChild(d);box.scrollTop=box.scrollHeight;
}
let hwCur=null,hwTab='s';
function hwOpen(setId,tab){
  const res=window.__hwSets[setId]||{items:[],dips:[],boards:[]};hwCur=res;
  const types=res.items.map(c=>c.t);
  hwTab=tab||(res.dips.length&&!types.length?'d':res.boards.length&&!types.length?'b':types.indexOf('s')>=0?'s':types.length?'a':'s');
  document.getElementById('hwOvl').classList.add('open');hwDraw();
}
function hwSetTab(t){hwTab=t;hwDraw();}
function hwClose(){document.getElementById('hwOvl').classList.remove('open');}
const HW_CROP={"sens": [240, 270, 1200, 725], "act": [320, 270, 920, 785], "brd": [500, 185, 650, 560], "dmain": [50, 130, 1530, 920], "drbu": [50, 130, 1530, 940], "drbut": [50, 130, 1530, 955], "drc": [50, 130, 1530, 870]};
function hwMarkers(list,c){
  const k=c[2]/1625,x0=c[0],y0=c[1],x1=c[0]+c[2],y1=c[1]+c[3];let s='';
  list.forEach(m=>{
    const lw=Math.max(60,m.label.length*17+16)*k,lh=32*k,r=24*k;
    const lx=Math.min(x1-lw-4,Math.max(x0+4,m.x-lw/2)),ly=(m.y+26*k+lh>y1?m.y-r-lh-6*k:m.y+26*k);
    s+='<g><circle cx="'+m.x+'" cy="'+m.y+'" r="'+r+'" fill="rgba(220,38,38,.14)" stroke="#fff" stroke-width="'+9*k+'"/><circle cx="'+m.x+'" cy="'+m.y+'" r="'+r+'" fill="none" stroke="#DC2626" stroke-width="'+5*k+'"><animate attributeName="r" values="'+r+';'+r*1.33+';'+r+'" dur="1.6s" repeatCount="indefinite"/></circle>'
      +'<rect x="'+lx+'" y="'+ly+'" width="'+lw+'" height="'+lh+'" rx="'+8*k+'" fill="#DC2626" stroke="#fff" stroke-width="'+3*k+'"/><text x="'+(lx+lw/2)+'" y="'+(ly+23*k)+'" text-anchor="middle" font-size="'+22*k+'" font-weight="700" fill="#fff" font-family="Arial,sans-serif">'+hwEsc(m.label)+'</text></g>';
  });
  return s;
}
function hwDraw(){
  const IM=hwImgs(),res=hwCur||{items:[],dips:[],boards:[]},body=document.getElementById('hwBody'),tabs=document.getElementById('hwTabs');
  const T=[['s','Sensor'],['a','Motor & Solenoid'],['b','Board'],['d','Dip Switch']];
  tabs.innerHTML=T.map(t=>'<button type="button" class="'+(hwTab===t[0]?'on':'')+'" onclick="hwSetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('');
  let h='';
  const frame=(img,marks,cap)=>{const c=HW_CROP[img];return '<div class="hwfrm"><img src="'+(IM[img]||'')+'" alt=""><svg viewBox="'+c.join(' ')+'" preserveAspectRatio="none">'+hwMarkers(marks,c)+'</svg></div>'+(cap?'<div class="hwcap">'+cap+'</div>':'');}
  if(hwTab==='s'){
    const sel=res.items.filter(c=>c.t==='s');
    h+=frame('sens',sel.filter(c=>c.x!=null).map(c=>({x:c.x,y:c.y,label:c.ids.length>2?c.ids[0]+'…':c.ids.join('/')})),sel.length?'Tanda merah = sensor yang dibahas. '+sel.map(c=>'<b>'+hwEsc(c.ids.join('/'))+'</b>: '+hwEsc(c.pos)).join('<br>'):'Layout sensor BRM860. Tanyakan sensor tertentu ke Clara (mis. GS008) agar posisinya ditandai.');
  }else if(hwTab==='a'){
    const sel=res.items.filter(c=>c.t!=='s');
    h+=frame('act',sel.filter(c=>c.x!=null).map(c=>({x:c.x,y:c.y,label:c.ids.length>1?c.ids[0]+'/'+c.ids[1].slice(2):c.ids[0]})),sel.length?'Tanda merah = motor/solenoid yang dibahas. '+sel.map(c=>'<b>'+hwEsc(c.ids.join('/'))+'</b>: '+hwEsc(c.pos)).join('<br>'):'Layout aktuator BRM860 (motor dan solenoid).');
  }else if(hwTab==='b'){
    h+=frame('brd',res.boards.map(b=>({x:b.x,y:b.y,label:b.n.replace(' B/D','')})),res.boards.length?res.boards.filter(b=>!b.dup).map(b=>'<b>'+hwEsc(b.n)+'</b>: '+hwEsc(b.pos)).join('<br>'):'Layout board BRM860 (Main, RBU, CSM, TE/RJE, RC, RJC, Hall).');
  }else{
    const ds=res.dips.length?res.dips:HW_DIP;
    ds.forEach(d=>{h+='<div class="hwdip"><div class="hwdt">'+hwEsc(d.n)+' <span>'+hwEsc(d.pos)+'</span></div><img src="'+(IM[d.img]||'')+'" alt=""><div class="hwcap">'+hwEsc(d.txt)+'</div></div>';});
  }
  body.innerHTML=h;body.scrollTop=0;
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=document.getElementById('hwOvl');if(o&&o.classList.contains('open'))hwClose();}});

