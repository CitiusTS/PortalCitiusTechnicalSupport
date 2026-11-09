
/* ===== PEMBACA EJ UNTUK CLARA (NCR) =====
   Format baris status: tttt*m*d*aa.a,M-bb,R-c   (panduan resmi NCR ATM Error Status Reference Guide)
   Diurai di sisi aplikasi (bukan oleh AI) supaya angka, perangkat, dan modulnya pasti benar. */
const EJ_DEV={A:'Jam (Time-of-Day Clock)',B:'Power Failure',C:'Card Reader/Writer',D:'Card Reader/Writer',E:'Dispenser (Cash Dispenser)',F:'Depository',G:'Printer Struk (Receipt)',H:'Printer Jurnal',J:'Vandal Guard',K:'Night Safe',L:'Encryptor (EPP)',M:'Kamera',P:'Sensor',R:'Supervisor',V:'Printer Statement',Y:'Coin Dispenser'};
const EJ_TRX={'0':'Berhasil, tetapi ada kondisi pengecualian','1':'Uang yang keluar kurang dari yang diminta','2':'Tidak ada uang yang keluar','3':'Dispense gagal, jumlah uang yang keluar tidak diketahui','4':'Tidak ada uang keluar, atau kartu belum keluar sebelum uang dikeluarkan','5':'Sebagian/seluruh uang tidak diambil nasabah dan ditarik ke reject bin'};
const EJ_SUP={'0':'tidak ada status baru','1':'cukup','2':'hampir habis','3':'habis'};
/* M-Status dispenser (Device E). m = modul yang diperiksa, f = true bila termasuk error utama (huruf tebal di panduan NCR), c = akibat dari error sebelumnya */
const EJ_E={
'00':{d:'Tidak ada error',m:'-'},
'01':{d:'Pick diminta dari kaset yang tidak terpasang',m:'Kaset / Pick Module'},
'02':{d:'Terlalu banyak lembaran uang yang ditolak (reject)',m:'Sensor LVDT/NTS, Kaset, Pick Module',f:1},
'03':{d:'Kegagalan pengambilan uang (pick failure)',m:'Pick Module, Kaset',f:1},
'04':{d:'Pick failure dari kaset yang uangnya sedikit atau habis',m:'Kaset (isi ulang), Pick Module',f:1},
'05':{d:'Sensor gagal atau uang macet',m:'Sensor dan jalur transport uang',f:1},
'06':{d:'Divert gate gagal',m:'Divert Gate (solenoid)'},
'07':{d:'Reject bin tidak terpasang',m:'Reject Bin'},
'08':{d:'Reject bin penuh atau sensornya terhalang',m:'Reject Bin, sensor overfill',f:1},
'09':{d:'Komunikasi dengan dispenser gagal',m:'Kabel komunikasi dan board dispenser',f:1},
'10':{d:'Operasi tidak dicoba karena operasi sebelumnya gagal (status FATAL, perlu reset SOH)',m:'Akibat; cari error pemicu sebelumnya',c:1},
'11':{d:'Uang masih berada di transport, operasi tidak dicoba',m:'Jalur transport (ada sisa uang)',c:1},
'12':{d:'Mekanisme presenter gagal atau macet',m:'Presenter',f:1},
'13':{d:'Exit shutter macet dalam posisi terbuka',m:'Exit Shutter',f:1},
'14':{d:'Exit shutter macet dalam posisi tertutup',m:'Exit Shutter',f:1},
'15':{d:'Uang terdeteksi melewati sensor overfill',m:'Sensor overfill, Reject Bin'},
'16':{d:'Timing disk transport utama atau motor AC utama gagal',m:'Transport utama (timing disk, motor AC)',f:1},
'17':{d:'Sensor exit gagal bersih atau terhalang',m:'Sensor Exit'},
'18':{d:'Uang macet di transport presenter atau sensor gagal',m:'Presenter Transport, sensor presenter',f:1},
'19':{d:'Sensor exit terhalang (uang mungkin tertahan di slot keluar)',m:'Slot keluar, Sensor Exit'},
'20':{d:'Dispenser belum dikonfigurasi',m:'Konfigurasi / software dispenser'},
'21':{d:'Pelanggaran keamanan (security violation)',m:'Keamanan dispenser'},
'22':{d:'Inhibisi keamanan (security inhibition)',m:'Keamanan dispenser'},
'25':{d:'Otorisasi flex disk tidak diperlukan',m:'Flex disk / konfigurasi'},
'28':{d:'Area NVRAM tidak dapat diakses (SOH tidak dapat diperbarui)',m:'NVRAM, board dispenser'},
'29':{d:'Timing disk atau motor transport presenter gagal',m:'Presenter Transport (timing disk, motor)',f:1},
'30':{d:'Sensor transport presenter terhalang atau gagal',m:'Sensor Presenter Transport'},
'32':{d:'Heartbeat prosesor eksekusi gagal (80652)',m:'Board prosesor dispenser'},
'33':{d:'Komunikasi pada I2C bus gagal (80652)',m:'Board dan kabel I2C dispenser'},
'34':{d:'Operasi present dicoba tanpa uang yang ditumpuk, atau retract dicoba tanpa ada uang yang disajikan',m:'Urutan perintah (software/host)'},
'35':{d:'Operasi tidak selesai karena daya terputus oleh interlock pintu akses ATM',m:'Interlock pintu, catu daya'},
'36':{d:'Tes pick valve tidak dicoba karena kaset terpasang',m:'Kaset (pick valve)'},
'37':{d:'Tamper indicating service menyala (ON)',m:'Tamper / keamanan'},
'38':{d:'Tamper indicating service mati (OFF)',m:'Tamper / keamanan'},
'39':{d:'LVDT atau rangkaian terkait bermasalah',m:'Sensor LVDT'},
'40':{d:'Parameter uang belum dikonfigurasi karena NVRAM rusak atau operasi pertama sejak ATM dinyalakan',m:'NVRAM, konfigurasi'},
'41':{d:'Pick dicoba dari kaset yang dinonaktifkan untuk pengisian saat layanan berjalan',m:'Kaset (dinonaktifkan)'},
'146':{d:'Link SDC gagal',m:'Link SDC, kabel SDC, board SDC',f:1}
};
function ejKey(bb){const s=String(parseInt(bb,10));return s.length<2?'0'+s:s;}
function ejLookupApp(dev,bb){
  try{
    if(typeof ckBuild==='function')ckBuild();
    const wantSrc=dev==='E'?'NCR Dispenser':(dev==='C'||dev==='D')?'NCR Card Reader':'';
    if(!wantSrc||typeof CK==='undefined')return null;
    const arr=CK.byCode.get(ejKey(bb))||CK.byCode.get(String(parseInt(bb,10)))||[];
    return arr.find(d=>d.brand==='ncr'&&String(d.src).indexOf(wantSrc)===0)||null;
  }catch(e){return null;}
}
/* bersihkan teks EJ mentah: kode kontrol printer (ESC), CR, spasi ganda */
function ejClean(s){return String(s||'').replace(/\x1b\[[0-9;]*[A-Za-z]|\x1b[()][A-Za-z0-9]|\x1b[A-Za-z]/g,'').replace(/\r\n?/g,'\n');}
function ejDetect(text){
  const t=ejClean(text);
  if(!/M\s*-?\s*[0-9A-Fa-f]/.test(t)||!/\*\s*[12]\s*\*\s*[A-Za-z]\s*\*/.test(t))return null;
  const hdrs=[];{const hr=/\*(\d{1,4})\*(\d\d\/\d\d\/\d{4})\*(\d\d:\d\d)\*/g;let q;while((q=hr.exec(t)))hdrs.push([q.index,q[2]+' '+q[3]]);}
  const whenAt=pos=>{let w='';for(let i=0;i<hdrs.length&&hdrs[i][0]<pos;i++)w=hdrs[i][1];return w;};
  const re=/(?:^|[^0-9])(\d{4})\s*\*\s*([12])\s*\*\s*([A-Za-z])\s*\*\s*([0-9A-Za-z.]*)\s*,\s*M\s*-?\s*([0-9A-Fa-f]{1,16})(?:\s*,\s*R\s*-?\s*(\d*))?/g;
  const rows=[];let m;
  while((m=re.exec(t))){const mf=m[5];const lng=mf.length>3;rows.push({trx:m[1],type:m[2],dev:m[3].toUpperCase(),aa:m[4],bb:lng?mf.slice(0,2):mf,data:lng?mf.slice(2):'',r:m[6]||'',when:whenAt(m.index)});if(rows.length>=6000)break;}
  if(!rows.length)return null;
  const map=new Map();
  rows.forEach((x,i)=>{
    const k=x.dev+'|'+ejKey(x.bb);
    let g=map.get(k);
    if(!g){g={dev:x.dev,bb:ejKey(x.bb),n:0,trx:[],first:i,aa:x.aa,r:x.r,type:x.type,prev:'',datas:[],t1:x.when,t2:x.when};map.set(k,g);}
    if(x.when){if(!g.t1)g.t1=x.when;g.t2=x.when;}
    if(x.data&&g.datas.indexOf(x.data.toUpperCase())<0&&g.datas.length<3)g.datas.push(x.data.toUpperCase());
    g.n++;g.tset=g.tset||new Set();g.tset.add(x.trx);if(g.trx.indexOf(x.trx)<0&&g.trx.length<6)g.trx.push(x.trx);g.last=i;
    if(!g.prev){for(let j=i-1;j>=0;j--){if(rows[j].dev===x.dev&&rows[j].bb!==x.bb){g.prev=ejKey(rows[j].bb);break;}}}
  });
  map.forEach(g=>{g.nTrx=g.tset?g.tset.size:g.n;});
  const groups=Array.from(map.values()).sort((a,b)=>b.n-a.n||a.first-b.first);
  groups.forEach(g=>{
    g.devName=EJ_DEV[g.dev]||('Perangkat kode '+g.dev);
    g.off=g.dev==='E'?EJ_E[g.bb]:null;
    g.app=ejLookupApp(g.dev,g.bb);
    g.mod=g.off?g.off.m:(g.app&&g.app.comp)||g.devName;
    g.desc=g.off?g.off.d:(g.app&&g.app.desc)||'Arti kode M-'+g.bb+' untuk perangkat ini belum ada di panduan resmi dan database aplikasi.';
    g.sev=g.bb==='00'?'normal':g.off?(g.off.c?'akibat':g.off.f?'utama':'sedang'):(g.app&&g.app.status)||'';
    if(g.dev==='E')ejDisp(g);
  });
  return {rows,groups,total:rows.length,sig:ejSignals(t)};
}
/* sinyal lain di EJ (selain baris status): ringkasan transaksi, kartu, uang */
function ejSignals(t){
  const L=t.split('\n').map(x=>x.trim());
  const cnt=re=>L.filter(x=>re.test(x)).length;
  const s={tx:cnt(/\*TRANSACTION START\*/),cardless:cnt(/CARDLESS TRANSACTION START/)};
  const dts=[];{const hr=/\*\d{1,4}\*(\d\d)\/(\d\d)\/(\d{4})\*(\d\d:\d\d)\*/g;let q;while((q=hr.exec(t)))dts.push(q[3]+'-'+q[1]+'-'+q[2]);}
  if(dts.length){dts.sort();s.d1=dts[0];s.d2=dts[dts.length-1];}
  s.initAtt=cnt(/CARD INITIALISE ATTEMPT/);
  s.initFail=cnt(/CARD INITIALISE ATTEMPT\s*=\s*3\b/);
  s.initMax=Math.max(0,...L.map(x=>{const q=x.match(/CARD INITIALISE ATTEMPT\s*=\s*(\d+)/);return q?+q[1]:0;}));
  s.cancel=cnt(/CUSTOMER CANCELLED/);s.noArpc=cnt(/NO ARPC/);s.aac=cnt(/GENAC \d\s*:\s*AAC/);
  s.decl=cnt(/TRANSAKSI ANDA DITOLAK/);s.nofund=cnt(/DANA TIDAK CUKUP/);s.noproc=cnt(/TIDAK DAPAT DIPROSES/);s.hostTo=cnt(/HOST TX TIMEOUT/);
  s.stacked=cnt(/NOTES STACKED/);s.pres=cnt(/NOTES PRESENTED/);s.taken=cnt(/NOTES TAKEN/);
  const ser=lbl=>{const a=[];L.forEach(x=>{const q=x.match(new RegExp('^'+lbl+'\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)'));if(q)a.push([+q[1],+q[2],+q[3],+q[4]]);});return a;};
  {const d=ser('DISPENSED'),r=ser('REJECTED'),m=ser('REMAINING'),dn=ser('DENOMINATION');
   if(d.length){s.cnt=d.length;s.dFirst=d[0];s.dLast=d[d.length-1];s.dNew=s.dLast.map((v,i)=>v-s.dFirst[i]);}
   if(r.length){s.rFirst=r[0];s.rLast=r[r.length-1];}
   if(m.length)s.remLast=m[m.length-1];
   if(dn.length)s.denom=dn[dn.length-1];}
  s.cardIns=cnt(/\$CARD_INSERT\$/);s.cardEj=cnt(/\$CARD_EJECT\$/);s.cardTk=cnt(/\$CARD_TAKEN\$/);
  s.retract=cnt(/RETRACT/i);s.sup=cnt(/SUPERVISOR|MODE SUPERVISOR/i);
  return s;
}
let __ejEng=null;
function ejEngine(){
  if(__ejEng)return __ejEng;
  __ejEng=new Promise(res=>{
    try{
      const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;border:0;visibility:hidden';
      f.onload=()=>{try{res(f.contentWindow.NCRDEC||null);}catch(e){res(null);}};
      f.srcdoc=ckDecode(NCR_HTML_B64);document.body.appendChild(f);setTimeout(()=>res(null),9000);
    }catch(e){res(null);}
  });
  return __ejEng;
}
/* terjemahkan M-Data (heksadesimal) memakai mesin dekoder yang sama dengan aplikasi NCR */
async function ejEnrich(res){
  if(!res)return res;
  const need=res.groups.filter(g=>g.datas&&g.datas.length&&(g.dev==='E'||g.dev==='C'||g.dev==='D'));
  if(!need.length)return res;
  const E=await ejEngine();if(!E)return res;
  need.forEach(g=>{
    const di=g.dev==='E'?0:5;g.dec=[];
    g.datas.forEach(h=>{
      try{
        const hx=h.length%2?h.slice(0,-1):h;
        const r=E.translate(di,parseInt(g.bb,10),hx);
        const ls=String(r.text||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/^M-Status \d+:\s*/,''));
        const tr=ls.map(x=>{try{return E.ID.tr(x)||x;}catch(e){return x;}});
        if(tr.length)g.dec.push({hex:hx,lines:tr});
      }catch(e){}
    });
  });
  return res;
}
function ejDisp(g){
  const a=String(g.aa||''),r=String(g.r||'');
  if(/^\d{9}$/.test(a)){
    g.trxTxt=EJ_TRX[a[0]]||('kode transaksi '+a[0]);
    g.bills=[1,2,3,4].map(i=>parseInt(a.slice(i*2-1,i*2+1),10));
  }
  if(/^\d{5}$/.test(r)){
    g.reject=r[0]==='4'?'penuh (overfilled)':r[0]==='1'?'belum penuh':'kode '+r[0];
    g.sup=[1,2,3,4].map(i=>({k:i,v:r[i],t:EJ_SUP[r[i]]||'-'}));
    g.cek=g.sup.filter(s=>s.v==='2'||s.v==='3').map(s=>'Kaset '+s.k+' '+s.t);
  }
}
function ejBlockText(res){
  if(!res||!res.groups.length)return '';
  let o='HASIL BACA EJ NCR (baris status diurai otomatis oleh aplikasi berdasarkan panduan resmi NCR ATM Error Status Reference Guide; ini DATA PASTI, gunakan apa adanya):\n';
  o+='Format baris: tttt*m*d*aa.a,M-bb,R-c. tttt = nomor transaksi; m = jenis pesan (1 tanpa diminta/unsolicited, 2 dijawab karena diminta host/solicited); d = kode perangkat (E dispenser, D/C card reader, F depository, G printer struk, H printer jurnal, L encryptor dst); aa.a = status transaksi/perangkat; M-bb = status modul (penentu modul yang bermasalah); R-c = status persediaan (reject bin dan kaset).\n';
  o+='Ditemukan '+res.total+' baris status, '+res.groups.length+' kombinasi perangkat dan M-Status:\n';
  res.groups.slice(0,12).forEach((g,i)=>{
    o+=(i+1)+') '+g.devName+' ('+g.dev+'), M-'+g.bb+', muncul '+g.n+'x pada '+g.nTrx+' nomor transaksi berbeda'+(g.trx.length?' (nomor '+g.trx.slice(0,5).join(', ')+(g.nTrx>5?', dst':'')+')':'')+(g.t1?', dari '+g.t1+(g.t2&&g.t2!==g.t1?' sampai '+g.t2:''):'')+'\n';
    if(g.datas&&g.datas.length)o+='   M-Data (heksadesimal): '+g.datas.join(', ')+'\n';
    if(g.dec&&g.dec.length)g.dec.forEach(d=>{o+='   Hasil dekode M-Data '+d.hex+': '+d.lines.join('; ')+'\n';});
    o+='   Arti: '+g.desc+'\n';
    o+='   Modul yang diperiksa: '+g.mod+(g.sev?'. Tingkat: '+g.sev:'')+'\n';
    if(g.off&&g.off.c)o+='   Catatan: ini AKIBAT dari kegagalan sebelumnya'+(g.prev?' (error sebelumnya pada perangkat ini: M-'+g.prev+(EJ_E[g.prev]?' = '+EJ_E[g.prev].d:'')+')':'; cari baris error pemicu sebelum baris ini')+'. Modul penyebab ada pada error pemicu, bukan pada kode ini.\n';
    else if(g.prev&&g.dev==='E'&&g.n>0&&g.first>0)o+='   Error tepat sebelumnya pada perangkat ini: M-'+g.prev+(EJ_E[g.prev]?' ('+EJ_E[g.prev].d+')':'')+'\n';
    if(g.trxTxt)o+='   Hasil transaksi: '+g.trxTxt+(g.bills?'; uang keluar per kaset: K1='+g.bills[0]+', K2='+g.bills[1]+', K3='+g.bills[2]+', K4='+g.bills[3]+' lembar':'')+'\n';
    if(g.sup)o+='   Persediaan: reject bin '+g.reject+'; '+g.sup.map(s=>'kaset '+s.k+' '+s.t).join(', ')+(g.cek&&g.cek.length?'. PERLU DIISI/DIPERIKSA: '+g.cek.join(', '):'')+'\n';
    if(g.app){o+='   Dari database aplikasi: komponen = '+(g.app.comp||'-')+(g.app.steps?'; langkah = '+String(g.app.steps).slice(0,420):'')+'\n';}
  });
  if(res.sig){const q=res.sig;const a=[];
    a.push('transaksi di log: '+q.tx+(q.d1?' ('+q.d1+(q.d2!==q.d1?' s/d '+q.d2:'')+')':''));
    if(q.initAtt)a.push('percobaan inisialisasi kartu (CARD INITIALISE ATTEMPT): '+q.initAtt+'x, maksimum percobaan ke-'+q.initMax+(q.initFail?'; sesi kartu yang gagal sampai percobaan ke-3: '+q.initFail:''));
    if(q.cardIns||q.cardEj||q.cardTk)a.push('kartu masuk '+q.cardIns+', keluar '+q.cardEj+', diambil '+q.cardTk+(q.cardEj>q.cardTk?' (ada kartu yang keluar tetapi tidak tercatat diambil)':''));
    if(q.pres||q.taken)a.push('uang disajikan '+q.pres+'x, diambil nasabah '+q.taken+'x, ditumpuk '+q.stacked+'x'+(q.pres>q.taken?' (selisih '+(q.pres-q.taken)+' kali uang tidak diambil/ditarik kembali)':''));
    if(q.dLast){const dx=q.dNew.map((v,i)=>v>0?'K'+(i+1)+' +'+v:'').filter(Boolean);
      a.push('penghitung kaset di struk CASH TOTAL (angka kumulatif, bukan per transaksi) pada '+q.cnt+' struk: dispensed awal '+q.dFirst.join('/')+' menjadi '+q.dLast.join('/')+(dx.length?' (bertambah: '+dx.join(', ')+' lembar)':'')+'; rejected terakhir '+q.rLast.join('/')+(q.rFirst&&q.rFirst.join()!==q.rLast.join()?' (naik dari '+q.rFirst.join('/')+')':' (tidak bertambah selama log)')+'; sisa terakhir '+q.remLast.join('/')+(q.denom?'; pecahan '+q.denom.join('/'):'')+'. Kaset yang tidak pernah bertambah dispensed padahal ada sisa berarti tidak dipakai/tidak terpilih pada periode ini');}
    if(q.cancel)a.push('dibatalkan nasabah: '+q.cancel+'x (bukan kerusakan)');
    if(q.decl||q.nofund||q.noproc||q.hostTo||q.aac||q.noArpc)a.push('penolakan/host/kartu chip: ditolak '+q.decl+'x, dana tidak cukup '+q.nofund+'x, tidak dapat diproses '+q.noproc+'x, host timeout '+q.hostTo+'x, chip AAC '+q.aac+'x, NO ARPC '+q.noArpc+'x (umumnya masalah host/kartu, bukan perangkat keras)');
    o+='SINYAL LAIN DI EJ (dihitung otomatis dari seluruh log): '+a.join('; ')+'.\n';}
  o+='ATURAN MEMBACA EJ: (1) Mulai dari baris yang paling sering muncul dan yang bertingkat utama, lalu sebut modul yang bermasalah beserta alasannya dengan bahasa baku yang natural. (2) M-10 dan M-11 pada dispenser adalah AKIBAT; arahkan teknisi ke error pemicu sebelumnya. (3) Bila R-c menunjukkan kaset habis/hampir habis atau reject bin penuh, sebutkan itu sebagai penyebab/pemicu yang paling mudah dicek lebih dulu. (4) Arti M-bb berbeda untuk setiap perangkat; jangan menyamakan M-10 dispenser dengan M-10 card reader. (5) Untuk perangkat selain dispenser dan card reader, jangan mengarang arti M-bb; sebutkan perangkatnya saja dan jujur bahwa arti persisnya belum ada di data. (6) Akhiri dengan langkah pemeriksaan berurutan dan satu pertanyaan konfirmasi bila perlu.';
  return o;
}
function ejCard(res){
  if(!res||!res.groups.length)return;
  const box=document.getElementById('chMsgs');if(!box)return;
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const d=document.createElement('div');d.className='cm db';
  let h='<div class="bub ejc"><b>🧾 Hasil baca EJ NCR</b><div class="ejs">'+res.total+' baris status, '+res.groups.length+' kombinasi</div><table><tr><th>Perangkat</th><th>M-Status</th><th>Jml</th><th>Modul yang diperiksa</th></tr>';
  res.groups.slice(0,10).forEach(g=>{h+='<tr><td>'+esc(g.devName.replace(/ \(.*$/,''))+' <i>('+g.dev+')</i></td><td><b>M-'+g.bb+'</b></td><td>'+g.n+'x</td><td>'+esc(g.mod)+(g.off&&g.off.c?' <em>(akibat)</em>':'')+'</td></tr>';});
  h+='</table></div>';
  d.innerHTML=h;box.appendChild(d);box.scrollTop=box.scrollHeight;
}

