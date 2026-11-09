
/* ===== AI TECHNICAL SUPPORT CHAT (memakai Konfigurasi AI Admin yang sudah ada) ===== */
const CHAT_SYS=`Anda adalah "Clara", Technical Support Assistant PT. Citius Solusi Indonesia (layanan e-channel perbankan): teknisi senior dan technical support profesional, seorang analis perempuan yang teliti dan tenang (gunakan gaya bahasa yang hangat dan profesional). Bidang: (1) mesin ATM/CRM multi-vendor (Hyosung, NCR, Wincor Nixdorf, Diebold) beserta modul BRM/CDU, card reader, printer, sensor, error code, middleware CEN/XFS; (2) kelistrikan (UPS, MCB, grounding, stabilizer, power supply); (3) elektronik; (4) komputer/PC/jaringan; (5) Windows; (6) instalasi software, driver, firmware, OS.

GAYA BICARA: ngobrol seperti rekan senior yang ramah menjawab teman kerja di lapangan, dalam bahasa pengguna (default Bahasa Indonesia yang natural, hangat, tidak kaku, tidak seperti laporan atau template). Mulai langsung dengan jawaban atas pertanyaan, mis. "Kode itu biasanya artinya...", lalu jelaskan mengalir dalam paragraf pendek. Tetap DETAIL dan AKURAT: sebut kode, nama komponen, posisi fisik, angka, dan langkah lengkap, tetapi disampaikan seperti menjelaskan ke orang. Jangan memakai judul tebal berurutan (Ringkasan, Dasar data, dan sejenisnya) dan jangan menempelkan label bertanda kurung siku. Daftar bernomor hanya untuk langkah pemeriksaan yang memang berurutan; bold hanya untuk kode atau komponen penting. Pertanyaan sederhana dijawab singkat, kasus rumit dijawab lebih rinci. Tanpa emoji, tanpa mengulang pertanyaan pengguna, tanpa pujian atau permintaan maaf berlebihan. Bila butuh data tambahan, tutup dengan satu pertanyaan yang jelas.

PROTOKOL PERTANYAAN ATM (DATABASE-FIRST):
1. Blok "HASIL PENCARIAN DATABASE" adalah sumber utama dan resmi. Analisa blok itu lebih dulu, baru simpulkan.
2. Bila ada KECOCOKAN KODE PERSIS: jadikan deskripsi, penyebab, dan langkah di database sebagai dasar jawaban. Sampaikan ulang secara rapi dan berurutan tanpa mengubah makna, angka (mis. celah 0.30-0.50mm), nama komponen (mis. GS003, HS016), maupun urutan langkah. Boleh menambah penjelasan singkat; bila menambah sesuatu di luar database, katakan secara natural bahwa itu tambahan dari Anda, bukan dari database.
3. Bila hanya KECOCOKAN GEJALA: katakan jelas bahwa ini kecocokan berdasarkan gejala, bukan kode persis; tampilkan kandidat paling relevan, lalu minta kode error/merk/modul untuk memastikan. Jangan menyatakan satu kandidat sebagai pasti.
4. Bila beberapa entri dengan kode sama berasal dari sumber/modul berbeda, jangan campur; sebutkan perbedaannya dan tanyakan tipe mesin/modul yang dipakai.
5. Bila database TIDAK menemukan kecocokan persis: katakan di awal jawaban, dengan kalimat natural, bahwa kode/gejala itu belum ada di database aplikasi, LALU tetap analisa masalahnya dengan PENALARAN (lihat PROTOKOL PENALARAN DI LUAR DATABASE). Jangan berhenti pada "tidak ada data". Jangan mengarang arti kode, nilai angka, atau nomor komponen sebagai fakta.
6. Jangan pernah menukar kode: jika pengguna menulis kode yang tidak ada di database, jangan mengganti dengan kode mirip tanpa menyebutnya sebagai "kode serupa".

PROTOKOL PENALARAN DI LUAR DATABASE (untuk masalah yang tidak ada di database atau hanya cocok sebagian):
A. Bangun kesimpulan dari data yang ada: gunakan blok "DATA PEMBANDING UNTUK PENALARAN" (kode bertetangga, peta modul, pola gejala/komponen) dan riwayat percakapan. Sebut data mana yang menjadi dasar. Contoh: "Kode 5K7xxxx berada pada modul yang sama dengan entri 5K7..., sehingga diduga terkait komponen tersebut".
B. Bedakan tingkat kepastian dengan kalimat biasa, tanpa label kurung: "di database tercatat..." untuk isi database, "dugaan saya dari pola kode yang mirip..." untuk kesimpulan dari data pembanding, "secara umum..." untuk pengetahuan teknis di luar database.
C. Sebut tingkat keyakinan dengan kata sehari-hari (cukup yakin / masih dugaan / belum bisa dipastikan) beserta alasan satu kalimat. Dugaan dari pola bukan fakta: tulis sebagai "kemungkinan", bukan "pasti".
D. Urutkan hipotesis dari yang paling mungkin, dan beri langkah PEMERIKSAAN yang membedakan antar hipotesis (apa yang dicek, hasil apa yang menandakan apa), mulai dari yang paling aman dan mudah.
E. Tutup dengan kesimpulan menyeluruh 2-3 kalimat yang merangkum: dugaan modul, dugaan penyebab, dan apa yang harus dikonfirmasi. Minta maksimal 3 data tambahan yang paling menentukan (tipe/modul, kode persis, kondisi terakhir, hasil langkah pemeriksaan).
F. Bila ada banyak kode/gejala sekaligus, cari benang merah (modul atau komponen yang sama) dan simpulkan sebagai satu akar masalah bila data mendukung.
G. Batas: jangan mengarang kode, angka toleransi, atau nomor komponen yang tidak ada di data. Bila tidak yakin, katakan tidak yakin dan arahkan eskalasi dengan kalimat "Hubungi Team Leader atau Technical Support".

PROTOKOL ALUR TRANSAKSI BRM (kode Hyosung berawalan 5):
A. Digit ke-2 kode adalah perintah dan digit ke-3 adalah modul. Gunakan blok "ALUR TRANSAKSI BRM" dan "ANALISA ALUR TRANSAKSI DARI STRUKTUR KODE" untuk menjelaskan di tahap mana transaksi terhenti: modul yang sudah dilewati uang, modul bermasalah, dan modul berikutnya.
B. Arah pemeriksaan: periksa modul bermasalah lebih dulu, lalu modul tepat sebelum dan sesudahnya pada alur. Bila beberapa error berurutan berada pada alur perintah yang sama, cari benang merahnya: gangguan di hulu (modul awal) dapat berlanjut ke hilir.
C. Modul yang digit-nya sama (mis. 0 = FT/BOT dan MT, atau CSM pada Deposit Cancel) bisa muncul di lebih dari satu titik alur; sebutkan semua kemungkinan titik dan minta konteks (uang sedang masuk atau keluar) bila perlu.
D0. Gunakan blok POSISI MODUL untuk menjelaskan letak modul secara fisik (kiri/kanan/atas/bawah) dan lokasi IF (BRM50 di ujung kanan jalur transport, BRM860 di ujung kiri). Sebutkan urutan pemeriksaan fisik: modul bermasalah, lalu modul tepat sebelumnya, lalu tepat sesudahnya pada alur; sertakan IF bila ia berada pada urutan itu (titik sambungan jalur uang antara transport dan kaset).
D. TSK pada BRM50 setara TE/RJE pada BRM860. Untuk BRM860 sebut TE atau RJE, jangan TSK. Bila tipe belum jelas, tanyakan BRM860 atau BRM50.
E. Alur hanya menunjukkan tahap, bukan penyebab pasti. Bila tidak ada entri database, tulis analisa alur sebagai dugaan dari pola data. Jangan mengarang arti digit selain yang ada pada peta modul dan alur.

PROTOKOL MEMBACA RIWAYAT ERROR (error history / struk print / daftar kode dengan waktu):
A. Kelompokkan error yang muncul berjarak hanya beberapa menit dan jenisnya mirip/sama menjadi SATU BLOK ERROR.
B. Tiap blok punya START POINT = kode tertua (pertama kali muncul) = akar penyebab. Pada struk yang tercetak, kode terbawah/tertua dalam satu blok biasanya REASON CODE, penyebab utamanya.
C. Kode paling atas/terbaru dalam blok adalah gejala lanjutan. Jangan langsung percaya error paling atas; telusuri ke belakang dahulu, lalu jelaskan kode berikutnya sebagai akibat.
D. Gunakan blok "ANALISA BLOK RIWAYAT ERROR" bila ada; jawab berdasarkan reason code blok terbaru, sebut blok lama sebagai kejadian terpisah, dan padukan dengan alur transaksi bila kode berawalan 5.

ALUR JAWABAN ATM (tulis mengalir, bukan template): 1) jawaban langsung 1-2 kalimat; 2) dasar jawaban secara natural (apa yang tercatat di database, mana yang dugaan dari pola, mana pengetahuan umum) beserta tingkat keyakinan; 3) kemungkinan penyebab, urut dari yang paling mungkin, dijelaskan dalam kalimat; 4) langkah pemeriksaan bernomor, dari yang paling aman dan mudah, lengkap dengan posisi fisik komponen; 5) kapan perlu eskalasi, dengan kalimat "Hubungi Team Leader atau Technical Support jika ..."; 6) bila tidak ada kecocokan persis, rangkum dalam 2-3 kalimat dugaan modul, dugaan penyebab, dan minta maksimal 3 data tambahan. Topik non-ATM mengikuti alur yang sama tanpa bagian dasar database.

ATURAN ESKALASI: satu-satunya jalur eskalasi adalah "Hubungi Team Leader atau Technical Support". Jangan menyebut Supervisor, Vendor, atau Vendor Technical Support sebagai tujuan eskalasi. Bila unit rusak dan perlu diganti, tulis: "Hubungi Team Leader atau Technical Support untuk tindak lanjut penggantian unit". Awali bagian Eskalasi dengan kalimat "Hubungi Team Leader atau Technical Support jika ..." lalu sebut kondisinya.

KESELAMATAN: untuk pekerjaan listrik, sebutkan matikan dan lepas sumber AC, tunggu kapasitor discharge, gunakan alat ukur sesuai. Patuhi SOP bank untuk area vault dan kaset uang. Jangan membantu membobol atau melewati pengamanan ATM. Gunakan blok kode untuk perintah. Jika di luar bidang teknis, arahkan dengan sopan kembali ke topik teknis.`;
const CHAT_TOPICS=[['🏧 ATM','[ATM] Merk/tipe: \nModul: \nError code / gejala: \nSudah dicoba: '],['⚡ Kelistrikan','[Kelistrikan] Gejala (mati/drop/trip/UPS): \nTegangan terukur: \nPerangkat: '],['🔌 Elektronik','[Elektronik] Perangkat/board: \nGejala: \nHasil pengukuran: '],['💻 Komputer','[Komputer] Spesifikasi/OS: \nGejala (lambat/restart/tidak booting): \nPerubahan terakhir: '],['🪟 Windows','[Windows] Versi Windows: \nPesan error / kode: \nKapan muncul: '],['📦 Instalasi','[Instalasi] Software/driver/OS yang diinstal: \nVersi & perangkat: \nKendala: ']];
let chatHist=[],chatBusy=false,chatFile=null,chatSettings=null,chatReady=false;
const $c=id=>document.getElementById(id);
function chatEsc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function chatMd(t){
  const blocks=[];let h=chatEsc(t).replace(/```[\w-]*\n?([\s\S]*?)```/g,(m,c)=>{blocks.push('<pre><code>'+c.replace(/\n$/,'')+'</code></pre>');return '\u0000'+(blocks.length-1)+'\u0000';});
  h=h.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');
  let out='',mode='';const close=()=>{if(mode){out+='</'+mode+'>';mode='';}};
  h.split('\n').forEach(l=>{
    let m;
    if((m=l.match(/^\s*[-*•]\s+(.*)/))){if(mode!=='ul'){close();out+='<ul>';mode='ul';}out+='<li>'+m[1]+'</li>';}
    else if((m=l.match(/^\s*\d+[.)]\s+(.*)/))){if(mode!=='ol'){close();out+='<ol>';mode='ol';}out+='<li>'+m[1]+'</li>';}
    else if((m=l.match(/^#{1,4}\s+(.*)/))){close();out+='<h4>'+m[1]+'</h4>';}
    else if(/^\u0000\d+\u0000$/.test(l.trim())){close();out+=l.trim();}
    else if(l.trim()){close();out+='<p>'+l+'</p>';}
  });close();
  return out.replace(/\u0000(\d+)\u0000/g,(m,i)=>blocks[i]);
}
function chatAdd(kind,text,file){
  const box=$c('chMsgs'),d=document.createElement('div');
  d.className='cm '+(kind==='user'?'u':kind==='err'?'e':'');
  const av=kind==='user'?'':'<div class="av"><svg class="i" viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg></div>';
  d.innerHTML=av+'<div class="bub"></div>';
  const b=d.lastChild;
  if(kind==='ai')b.innerHTML=chatMd(text);else b.textContent=text;
  if(kind==='ai'&&text&&String(text).length>60&&!window.__chatNoTs&&tsHasQA()){document.querySelectorAll('#chMsgs .ch-ts').forEach(x=>x.remove());const w=document.createElement('div');w.className='ch-ts';w.innerHTML='<button type="button" class="ch-tsbtn" onclick="tsOpen()">📞 Belum teratasi? Hubungi TS</button>';b.appendChild(w);}
  if(file){const im=document.createElement('img');im.src=URL.createObjectURL(file);b.prepend(im);}
  box.appendChild(d);box.scrollTop=box.scrollHeight;try{tsSync();}catch(e){}return d;
}
function chatTyping(){const d=chatAdd('ai','');d.querySelector('.bub').innerHTML='<span class="dots"><span></span><span></span><span></span></span>';return d;}
function chatWelcome(){window.__chatNoTs=true;try{chatAdd('ai','Halo! Saya **Clara**, Technical Support Assistant untuk **ATM, kelistrikan, elektronik, komputer, Windows, dan panduan instalasi**.\n\nPilih topik di atas atau tulis langsung masalah Anda. Semakin lengkap info (merk/tipe, error code, gejala, yang sudah dicoba), semakin tepat solusinya. Anda juga bisa melampirkan foto layar error atau perangkat.');}finally{window.__chatNoTs=false;}}
function chatInit(){
  if(!chatReady){
    chatReady=true;
    $c('chChips').innerHTML='';
    CHAT_TOPICS.forEach(t=>{const b=document.createElement('button');b.className='ch-chip';b.textContent=t[0];b.onclick=()=>{const i=$c('chatInput');i.value=t[1];i.focus();chatGrow();};$c('chChips').appendChild(b);});
    const i=$c('chatInput');
    i.addEventListener('input',chatGrow);
    i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();chatSend();}});
    $c('chFile').onclick=()=>chatPick(null);
    chatWelcome();
  }
  setTimeout(()=>$c('chatInput').focus(),50);
}
function chatGrow(){const i=$c('chatInput');i.style.height='auto';i.style.height=Math.min(i.scrollHeight,140)+'px';}
function chatReset(){if(chatBusy)return;chatHist=[];chatPick(null);$c('chMsgs').innerHTML='';chatWelcome();try{tsSync();}catch(e){}}
let chatEj=null;
function chatPick(f){chatPickMany(f?[f]:[]);}
function chatPickMany(list){
  const files=Array.from(list||[]);
  chatFile=null;chatEj=null;$c('chPhoto').value='';
  const el=$c('chFile');
  if(!files.length){el.style.display='none';return;}
  const isImg=f=>/^image\//.test(f.type||'')||/\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(f.name||'');
  const imgs=files.filter(isImg),ejs=files.filter(f=>!isImg(f)).slice(0,10);
  if(imgs.length)chatFile=imgs[0];
  const total=ejs.reduce((a,f)=>a+f.size,0);
  const note=(imgs.length?'foto '+imgs[0].name+(imgs.length>1?' (foto lain diabaikan, satu foto per pesan)':'')+(ejs.length?' + ':''):'');
  el.style.display='block';
  if(!ejs.length){el.textContent='📎 '+note+' (klik untuk hapus)';return;}
  if(total>10*1024*1024){el.textContent='Total file EJ terlalu besar (maksimum 10 MB). Potong EJ pada tanggal yang bermasalah.';return;}
  el.textContent='📎 Membaca '+ejs.length+' file...';
  Promise.all(ejs.map(f=>f.arrayBuffer().then(b=>({name:f.name,size:f.size,text:new TextDecoder('latin1').decode(new Uint8Array(b))})))).then(arr=>{
    chatEj={name:arr.map(x=>x.name).join(', '),n:arr.length,text:arr.map(x=>'\n==== FILE EJ: '+x.name+' ====\n'+x.text).join('\n')};
    el.textContent='📎 '+note+(arr.length>1?arr.length+' file EJ: ':'File EJ: ')+arr.map(x=>x.name).join(', ')+' ('+Math.round(total/1024)+' KB) (klik untuk hapus)';
  }).catch(()=>{el.textContent='File tidak dapat dibaca.';});
}
/* ===== CLARA: MESIN PENCARIAN DATABASE (database-first) ===== */
const CK={ready:false,docs:[],byCode:new Map(),N:0};
const CK_LABEL={brm860:'Hyosung BRM860/MX8600S',brm50:'Hyosung BRM50',extra:'Hyosung (modul lain)',cdu10:'Hyosung CDU10',cdu30:'Hyosung CDU30',cdu800:'Hyosung CDU800'};
const CK_STOP=new Set('yang dan di ke dari untuk pada dengan atau ini itu ada adalah apa apakah bagaimana gimana kenapa mengapa kok saya kami kita mesin atm tolong mohon bantu cara bisa tidak tak belum sudah sedang jadi karena agar supaya maka lagi saja aja nya the is are what how why with for and error kode code muncul keluar terjadi masalah problem gejala solusi penyebab penanganan status ncr wincor hyosung nixdorf cmd cdm vcmd reader dispenser card brm860 brm50 cdu10 cdu30 cdu800 mx8600s'.split(' '));
const CK_SYN={macet:['jam','macet','tersangkut'],jam:['jam','macet'],uang:['uang','cash','note','kertas'],kertas:['kertas','uang','paper'],kaset:['kaset','cassette','cst'],cassette:['kaset','cassette'],reject:['reject','rj'],retract:['retract','rt'],sensor:['sensor'],motor:['motor'],pintu:['pintu','door','shutter'],shutter:['shutter','pintu'],kartu:['kartu','card'],card:['kartu','card'],struk:['struk','receipt','printer'],printer:['printer','struk'],dispense:['dispense','tarik','penarikan'],setor:['setor','deposit'],deposit:['deposit','setor'],dispenser:['dispenser','dispense','cdm','cdu'],tidak:[]};
function ckBrand(t){
  const s=t.toLowerCase();
  if(/\bncr\b|selfserv|personas|\bs2\b/.test(s))return'ncr';
  if(/wincor|nixdorf|cmd-?v4|cdm-?v4|\bcmd\b|\bvcmd\b|ccdm|scod/.test(s))return'wincor';
  if(/hyosung|brm\s?-?860|mx\s?-?8600|brm\s?-?50|\bcdu\s?-?(10|30|800)|mx\s?-?(2800|5600|8100)|monimax/.test(s))return'hyosung';
  return'';
}
function ckDecode(b64){const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return new TextDecoder('utf-8').decode(bytes);}
function ckArr(html,name){
  const m=html.match(new RegExp('const\\s+'+name+'\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);'));
  if(!m)return[];
  try{return(new Function('return '+m[1]))();}catch(e){return[];}
}
function ckPush(d){d.text=(d.title+' | '+d.desc+' | '+d.cause+' | '+d.steps+' | '+d.comp).toLowerCase();d.tl=(d.title+' '+d.comp).toLowerCase();CK.docs.push(d);const c=String(d.code).toUpperCase();if(!CK.byCode.has(c))CK.byCode.set(c,[]);CK.byCode.get(c).push(d);}
function ckBuild(){
  if(CK.ready)return;CK.ready=true;
  try{if(typeof DB!=='undefined')for(const k of Object.keys(DB))for(const r of DB[k]){ckPush({brand:'hyosung',src:CK_LABEL[k]||('Hyosung '+k),code:r.k,title:r.m||'',comp:r.m||'',desc:r.d||'',cause:r.p||'',steps:r.t||'',status:r.s||'',exact:true});}}catch(e){}
  try{
    const h=ckDecode(NCR_HTML_B64);
    [['DISPENSER_DATA','NCR Dispenser (M-Status)'],['CARDREADER_DATA','NCR Card Reader (M-Status)']].forEach(([n,lab])=>{
      nwApplyNcr(ckArr(h,n),n==='DISPENSER_DATA'?'ncr_disp':'ncr_card').forEach(r=>ckPush({brand:'ncr',src:lab,code:r.code,title:(r.komponen&&r.komponen.length?r.komponen.join(', '):lab),comp:(r.komponen||[]).join(', '),desc:r.desc||'',cause:'Prioritas: '+(r.prio||'-')+(r.tipe&&r.tipe!=='Semua'?' | Tipe: '+r.tipe:''),steps:(r.solusi||[]).map((s,i)=>(i+1)+'. '+s).join(' '),status:r.prio||'',exact:true}));
    });
  }catch(e){}
  try{
    const h=ckDecode(WINCOR_HTML_B64);
    const m=h.match(/const\s+DB\s*=\s*(\{[\s\S]*?\n\});/);
    if(m){const mm=h.match(/const\s+MODS\s*=\s*(\{[\s\S]*?\n\});/);const MODS=mm?(new Function('return '+mm[1]))():{};const mt=r=>[].concat(r.mod||[],r.mod2||[]).map(x=>MODS[x]?MODS[x].n:x).join(', ');const o=nwApplyWincor((new Function('return '+m[1]))());for(const k of Object.keys(o)){const r=o[k];ckPush({brand:'wincor',src:'Wincor CMD-V4 / CDM-V4',code:k.toUpperCase(),title:r.title||'',comp:(r.comp||'')+(mt(r)?' | Modul yang diperiksa (urut): '+mt(r):''),desc:r.desc||'',cause:'',steps:r.action||'',status:r.sev||'',exact:true});}}
  }catch(e){}
  try{
    const h2=ckDecode(WINCOR_HTML_B64);
    const mm2=h2.match(/const\s+MODS\s*=\s*(\{[\s\S]*?\n\});/);const MODS2=mm2?(new Function('return '+mm2[1]))():{};
    const pa=h2.indexOf('function patternInfo'),pb=h2.indexOf('\nfunction lookup');
    const dm=h2.match(/const\s+DB\s*=\s*(\{[\s\S]*?\n\});/);
    if(pa>0&&pb>pa&&dm){
      const DBx=(new Function('return '+dm[1]))();
      const pat=(new Function('DB',h2.slice(pa,pb)+';return patternInfo;'))(DBx);
      for(let f=3;f<=9;f++)for(let c=0;c<=9;c++){const code=''+f+c;if(DBx[code]||(CK.byCode.has(code)&&CK.byCode.get(code).some(d=>d.brand==='wincor')))continue;const r=pat(code);if(!r)continue;
        const mt=[].concat(r.mod||[],r.mod2||[]).map(x=>x==='cas'&&r.x?'Kaset cash-out '+r.x:(MODS2[x]?MODS2[x].n:x)).join(', ');
        ckPush({brand:'wincor',src:'Wincor CMD-V4 / CDM-V4',code:code,title:r.title,comp:r.comp+(mt?' | Modul yang diperiksa (urut): '+mt:''),desc:r.desc,cause:'',steps:r.action,status:r.sev||'err',exact:true});}
    }
  }catch(e){}
  CK.N=CK.docs.length;
}
function ckTokens(q){
  const raw=(String(q).toLowerCase().match(/[a-z0-9@_]+/g)||[]);
  const out=[];raw.forEach(w=>{if(w.length<3||CK_STOP.has(w))return;out.push(w);});
  return [...new Set(out)];
}
function ckCodes(q){return [...new Set((String(q).toUpperCase().match(/[0-9A-Z@][0-9A-Z@_-]{1,10}/g)||[]).map(x=>x.replace(/^0X/,'')))];}
function ckMod(q){
  const s=q.toLowerCase();
  if(/brm\s?-?860|mx\s?-?8600/.test(s))return d=>d.src.indexOf('BRM860')>=0;
  if(/brm\s?-?50\b/.test(s))return d=>d.src.indexOf('BRM50')>=0;
  if(/cdu\s?-?800/.test(s))return d=>d.src.indexOf('CDU800')>=0;
  if(/cdu\s?-?30\b/.test(s))return d=>d.src.indexOf('CDU30')>=0;
  if(/cdu\s?-?10\b/.test(s))return d=>d.src.indexOf('CDU10')>=0;
  if(/card\s?reader|kartu|\bmm\b/.test(s))return d=>d.src.indexOf('Card Reader')>=0||d.brand!=='ncr';
  if(/dispenser|\bcdm\b/.test(s))return d=>d.src.indexOf('Card Reader')<0;
  return null;
}
function ckSearch(q,brand){
  ckBuild();
  const mf=ckMod(q);
  const okd=d=>(!brand||d.brand===brand)&&(!mf||mf(d)||(brand&&d.brand!=='ncr'&&d.brand!=='hyosung'));
  const res={exact:[],kw:[],brand:brand};
  const seen=new Set();
  const hasDigit=/\d/;
  ckCodes(q).forEach(c=>{
    const list=CK.byCode.get(c);if(!list)return;
    const shortOk=c.length>=5||(brand&&brand!=='hyosung')||(c.length>=3&&hasDigit.test(c));
    if(!shortOk)return;
    list.filter(okd).forEach(d=>{if(!seen.has(d)){seen.add(d);res.exact.push(d);}});
  });
  /* pola kode CDU30 (x = bebas) */
  if(!res.exact.length){
    ckCodes(q).filter(c=>c.length===7&&/^4/.test(c)).slice(0,2).forEach(c=>{for(const d of CK.docs){if(!okd(d))continue;const dc=String(d.code);if(dc.indexOf('x')>=0&&cduWild(dc,c)&&!seen.has(d)){seen.add(d);res.exact.push(d);}}});
  }
  /* kode terpotong (awalan >=5 karakter) -> entri serupa */
  if(!res.exact.length){
    ckCodes(q).filter(c=>c.length>=5&&hasDigit.test(c)).slice(0,2).forEach(c=>{
      let n=0;for(const d of CK.docs){if(!okd(d))continue;if(String(d.code).toUpperCase().startsWith(c)&&!seen.has(d)){seen.add(d);res.exact.push(d);if(++n>=3)break;}}
    });
  }
  if(res.exact.length>=1&&res.exact.length>6)res.exact.length=6;
  /* kata kunci (gejala) */
  const toks=ckTokens(q).filter(t=>!CK.byCode.has(t.toUpperCase())||t.length<5);
  if(toks.length){
    const groups=toks.map(t=>CK_SYN[t]&&CK_SYN[t].length?CK_SYN[t]:[t]);
    const pool=CK.docs.filter(okd);
    const df=groups.map(()=>0),hit=new Array(pool.length);
    pool.forEach((d,i)=>{
      const h=[];groups.forEach((g,gi)=>{let f=0;for(const w of g){if(d.tl.includes(w)){f=Math.max(f,3);}else if(d.text.includes(w)){f=Math.max(f,1.5);}}if(f){df[gi]++;}h.push(f);});hit[i]=h;
    });
    const sc=[];
    pool.forEach((d,i)=>{let s=0,n=0;hit[i].forEach((f,gi)=>{if(f){n++;s+=f*Math.log(1+pool.length/(1+df[gi]));}});
      const need=groups.length>=3?2:groups.length;
      if(n>=need&&n>0)sc.push([s*(1+0.4*n),d]);});
    sc.sort((a,b)=>b[0]-a[0]);
    const uniq=new Set();
    for(const [s,d] of sc){if(seen.has(d))continue;const key=d.src+'|'+d.title+'|'+d.desc.slice(0,60);if(uniq.has(key))continue;uniq.add(key);res.kw.push(d);if(res.kw.length>=5)break;}
  }
  return res;
}
function ckFmt(d,i){
  const c=(s,n)=>String(s||'').replace(/\s+/g,' ').slice(0,n);
  return '['+(i+1)+'] Sumber: '+d.src+' | Kode: '+d.code+(d.comp?' | Modul/Komponen: '+c(d.comp,80):'')+'\n    Deskripsi: '+c(d.desc,300)+(d.cause?'\n    Penyebab/Info: '+c(d.cause,320):'')+(d.steps?'\n    Langkah resmi: '+c(d.steps,650):'')+(d.status?'\n    Status: '+c(d.status,40):'');
}
function chatRetrieve(q,hist){
  const out={isAtm:false,text:'',hits:[],mode:'none',brand:''};
  try{
    let qq=q;
    let brand=ckBrand(q);
    const atmWords=/\b(atm|brm|cdu|cdm|dispens\w*|kaset|cassette|reject|retract|card ?reader|kartu|bezel|encryptor|epp|pin ?pad|journal|ej|vault|shutter|mesin|hyosung|ncr|wincor|nixdorf|m-?status|trace|spv|bunch|stacker|sensor|jam|macet|setor|deposit|tarik)\b/i;
    let r=ckSearch(q,brand);
    if(!r.exact.length&&!r.kw.length&&hist&&hist.length){
      const prev=hist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' ');
      if(prev){if(!brand)brand=ckBrand(prev);const r2=ckSearch(prev+' '+q,brand);if(r2.exact.length||r2.kw.length){r=r2;qq=prev+' '+q;}}
    }
    out.brand=brand;
    const ctx=!!brand||atmWords.test(qq);
    if(!ctx)r.kw=[];
    out.isAtm=ctx||r.exact.length>0;
    const all=[...r.exact,...r.kw].slice(0,7);
    out.hits=all;out.mode=r.exact.length?'kode':(r.kw.length?'gejala':'none');
    out.nExact=r.exact.length;
    if(all.length){
      out.text=(r.exact.length?'KECOCOKAN KODE PERSIS ('+r.exact.length+' entri)':'KECOCOKAN GEJALA/KATA KUNCI (bukan kode persis, tingkat kepastian lebih rendah)')+':\n'+all.map((d,i)=>ckFmt(d,i)).join('\n');
    }
  }catch(e){}
  return out;
}


/* ===== CLARA: DATA PEMBANDING UNTUK PENALARAN (kode tak ada di database) ===== */
function chatMapFor(src){
  try{
    if(src.indexOf('BRM860')>=0)return MODULE_MAP_860;
    if(src.indexOf('BRM50')>=0)return MODULE_MAP_50;
    if(src.indexOf('CDU30')>=0)return MODULE_MAP_CDU30;
    if(src.indexOf('CDU10')>=0||src.indexOf('CDU800')>=0)return MODULE_MAP_CDU10;
  }catch(e){}
  return null;
}
function chatInfer(q,ret){
  const out=[];
  try{
    ckBuild();
    const brand=ret.brand||'';
    const exactCodes=new Set((ret.hits||[]).filter(h=>ret.mode==='kode').map(h=>String(h.code).toUpperCase()));
    const codes=ckCodes(q).filter(c=>c.length>=4&&/\d/.test(c)&&!exactCodes.has(c)&&!CK.byCode.has(c)&&!(ret.hits||[]).some(h=>cduWild(h.code,c))).slice(0,3);
    codes.forEach(c=>{
      const lines=[];
      /* 1. kode bertetangga: awalan sama, paling panjang dulu */
      let nb=[],bestPre='';
      for(let n=Math.min(c.length-1,6);n>=3&&nb.length<4;n--){
        const pre=c.slice(0,n);
        for(const d of CK.docs){
          if(brand&&d.brand!==brand)continue;
          const dc=String(d.code).toUpperCase();
          if(dc!==c&&dc.startsWith(pre)&&!nb.includes(d)){nb.push(d);if(nb.length>=4)break;}
        }
        if(nb.length&&!bestPre)bestPre=pre;
      }
      if(nb.length)lines.push('Kode terdekat dengan awalan sama "'+bestPre+'":');
      nb=nb.slice(0,4);
      nb.forEach(d=>lines.push('  - '+d.src+' | '+d.code+' | '+String(d.title||d.comp||'').slice(0,70)+' | '+String(d.desc).replace(/\s+/g,' ').slice(0,140)));
      /* 2. peta modul Hyosung dari digit ke-3 */
      if(c.length>=3&&(!brand||brand==='hyosung')){
        const ch=c.charAt(2).toUpperCase(),mods=[];
        [['BRM860/MX8600S',MODULE_MAP_860],['BRM50',MODULE_MAP_50],['CDU30',MODULE_MAP_CDU30],['CDU10/800',MODULE_MAP_CDU10]].forEach(([n,m])=>{try{if(m&&m[ch])mods.push(n+': '+m[ch]);}catch(e){}});
        if(mods.length)lines.push('Digit ke-3 "'+ch+'" pada peta modul Decoder: '+mods.join(' || '));
      }
      if(lines.length)out.push('Kode "'+c+'" TIDAK ADA di database.\n'+lines.join('\n'));
      else out.push('Kode "'+c+'" TIDAK ADA di database dan tidak ada kode bertetangga yang bisa dibandingkan.');
    });
    /* 3. pola gejala: komponen/modul yang paling sering muncul pada kandidat */
    if(ret.mode==='gejala'&&ret.hits.length>1){
      const cnt={};ret.hits.forEach(h=>{const k=(h.comp||h.title||'').split(/[,;(]/)[0].trim().slice(0,50);if(k)cnt[k]=(cnt[k]||0)+1;});
      const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).filter(e=>e[1]>=2).slice(0,3);
      if(top.length)out.push('Pola dari kandidat gejala: komponen yang paling sering muncul = '+top.map(e=>e[0]+' ('+e[1]+'x)').join(', ')+'.');
    }
    /* 4. ringkasan database untuk merek yang dikenali */
    if(!out.length&&brand){
      const n=CK.docs.filter(d=>d.brand===brand).length;
      out.push('Tidak ada kode atau gejala yang bisa dicocokkan. Database merek '+brand+' berisi '+n+' entri; gunakan hanya sebagai konteks umum.');
    }
  }catch(e){}
  return out.length?out.join('\n\n'):'';
}


/* ===== CLARA: ALUR TRANSAKSI BRM ===== */
function txFlowText(){
  let o='ALUR TRANSAKSI BRM (urutan fisik yang dilalui uang untuk tiap perintah = digit ke-2 kode error; digit ke-3 = modul tempat error):\n';
  ['brm50','brm860'].forEach(m=>{
    const M=TX_FLOW[m];
    o+=M.label+(m==='brm860'?' (TSK pada BRM50 = TE/RJE pada BRM860)':'')+':\n';
    Object.keys(M.cmd).forEach(k=>{const f=M.cmd[k];o+='- '+k+' '+f.n+': '+f.c.join(' -> ')+(f.note?' ('+f.note+')':'')+'\n';});
  });
  o+=BRM_LAYOUT_TEXT+'\n';
  o+='Peta digit ke-3: BRM50: 0=FT/MID Transport, 1-4=RC1-RC4, 6=CSM, 7=TSK, 8=BC, A=RJC, B=UTC. BRM860: 0=MID Transport, 1-4=RC11-RC41, 6=CSM, 7=TE, 8=BC, A=Main Board, B=RBU, C=RJC, R=RJE. IF = interface (tanpa digit sendiri).';
  return o;
}
function chatFlowBlock(text){
  try{
    const up=String(text||'').toUpperCase();
    const codes=[...new Set(up.match(/\b5[0-9A-Z@]{6}\b/g)||[])].slice(0,4);
    if(!codes.length)return '';
    const t=String(text||'').toLowerCase();
    const models=/brm\s?-?50\b/.test(t)?['brm50']:/brm\s?-?860|mx\s?-?8600/.test(t)?['brm860']:['brm860','brm50'];
    const lines=[];
    codes.forEach(c=>models.forEach(m=>{const s=txFlowStage(m,c);if(s)lines.push(c+' ['+TX_FLOW[m].label+']: '+s.text);}));
    if(!lines.length)return '';
    return 'ANALISA ALUR TRANSAKSI DARI STRUKTUR KODE (fakta struktur kode dari diagram internal, bukan arti resmi kode):\n'+lines.join('\n')+(models.length>1?'\nTipe belum disebutkan; bila relevan tanyakan BRM860 atau BRM50.':'');
  }catch(e){return '';}
}


function chatHistoryBlock(text){
  try{
    const rows=smartParseHistory(String(text||'')).filter(r=>/^[A-Z0-9@]{7}$/.test(r.code));
    if(rows.length<2)return '';
    const bl=errBlocks(rows);if(!bl.length)return '';
    const t=String(text||'').toLowerCase();
    const kind=/brm\s?-?50\b/.test(t)?'brm50':'brm860';
    let o='ANALISA BLOK RIWAYAT ERROR (pengelompokan otomatis: berjarak <= 3 menit, atau sejenis dan <= 10 menit, atau gejala sama berulang <= 3 jam; start point = kode tertua dalam blok):\n'+bl.map(b=>errBlockText(b,'')).join('\n');
    const last=bl[bl.length-1],fs=txFlowStage(kind,last.start.code);
    if(fs&&last.start.code[0]==='5')o+='\nAlur start point blok terbaru ('+TX_FLOW[kind].label+'): '+fs.text;
    return o;
  }catch(e){return '';}
}

/* ===== KAMUS ISTILAH RESMI (sinkron dengan Decoder) =====
   Sumber kebenaran: MODULE_MAP_860 / MODULE_MAP_50 pada Decoder. CSM = Customer Service Module.
   Teks database/vendor yang menulis kepanjangan lain (mis. "Cash Separation Module") dikoreksi sebelum
   dikirim ke AI dan pada jawaban AI. */
const ABBR_FIXES=[
  [/Cash[\s-]+S[a-z]{4,10}ion[\s-]+Modul(?:e)?/gi,'Customer Service Module'],
  [/Cash[\s-]+S[a-z]{4,10}ion[\s-]+Unit/gi,'Customer Service Module'],
  [/Cash[\s-]+Service[\s-]+Modul(?:e)?/gi,'Customer Service Module']
];
function normAbbr(t){
  if(t==null||typeof t!=='string'||!t)return t;
  let o=t;ABBR_FIXES.forEach(f=>{o=o.replace(f[0],f[1]);});
  return o;
}
function smartAbbrRow(row){
  if(!row)return row;
  return Object.assign({},row,{m:normAbbr(row.m),d:normAbbr(row.d),p:normAbbr(row.p),t:normAbbr(row.t)});
}
function abbrGlossText(){
  const seen={CSM:1},lines=[];
  const add=(map)=>{try{Object.keys(map).forEach(k=>{
    const v=String(map[k]||''),i=v.indexOf(' — ');if(i<0)return;
    const a=v.slice(0,i).trim(),b=v.slice(i+3).trim();
    if(!a||seen[a])return;seen[a]=1;lines.push('- '+a+' = '+b);
  });}catch(e){}};
  add(typeof MODULE_MAP_860!=='undefined'?MODULE_MAP_860:{});
  add(typeof MODULE_MAP_50!=='undefined'?MODULE_MAP_50:{});
  return 'KAMUS ISTILAH DAN SINGKATAN RESMI APLIKASI (WAJIB DIPAKAI; sama persis dengan Decoder dan hasil pencarian; menang atas teks database/vendor/ingatan Anda bila berbeda):\n'
   +'- CSM = Customer Service Module (Modul layanan pelanggan). DILARANG menulis "Cash Separation Module", "Cash Sparation Module", atau kepanjangan CSM lain. Bila teks database memuat istilah itu, tulis ulang sebagai Customer Service Module.\n'
   +lines.join('\n')+'\n'
   +'- TSK pada BRM50 setara TE/RJE pada BRM860.\n'
   +'- IF dan BMU/BMD: tulis apa adanya (IF = titik sambungan jalur uang); jangan mengarang kepanjangannya.\n'
   +'Aturan: setiap kali menyebut singkatan di atas, gunakan kepanjangan persis seperti kamus ini. Bila tidak yakin dengan kepanjangan suatu singkatan yang tidak ada di kamus, tulis singkatannya saja.';
}

async function chatLoadSettings(){
  if(chatSettings)return chatSettings;
  if(!window.__fb)throw new Error('Layanan belum siap. Muat ulang halaman lalu coba lagi.');
  const saved=await window.__fb.getAiConfig();
  const st=saved?{apis:smartNormalizeAiApis(saved.apis),vision:saved.vision!==false}:smartReadLegacyAiSettings();
  if(!st.apis.length)throw new Error('Konfigurasi AI belum tersedia. Minta Admin mengisi Konfigurasi AI di Admin Panel.');
  return chatSettings=st;
}

function chatDbCard(ret){
  const box=$c('chMsgs'),d=document.createElement('div');d.className='cm db';
  const items=ret.hits.slice(0,6).map(h=>'<li><b>'+chatEsc(h.code)+'</b> <span>'+chatEsc(h.src)+(h.comp&&h.brand==='hyosung'?' · '+chatEsc(h.comp):'')+'</span><em>'+chatEsc(String(h.desc).slice(0,110))+'</em></li>').join('');
  const head=ret.mode==='kode'?'Database: ditemukan '+ret.nExact+' entri dengan kode yang sama':'Database: '+ret.hits.length+' entri mirip gejala (bukan kode persis)';
  d.innerHTML='<div class="bub"><details><summary>🔎 '+head+'</summary><ul>'+items+'</ul></details></div>';
  box.appendChild(d);box.scrollTop=box.scrollHeight;
}
function chatDbNote(){
  const box=$c('chMsgs'),d=document.createElement('div');d.className='cm db';
  d.innerHTML='<div class="bub"><span class="dbn">🔎 Database: tidak ada entri yang cocok. Jawaban berikut kesimpulan dari pola data dan pengetahuan umum, bukan data resmi.</span></div>';
  box.appendChild(d);box.scrollTop=box.scrollHeight;
}
const TRC_SCOD={"00": "Tidak ada kesalahan (normal) [-]", "01": "Perangkat lunak rusak [Controller CMD dan firmware]", "05": "Gangguan komunikasi dengan ChipCard controller [ChipCard controller]", "06": "ChipCard salah atau komunikasi ChipCard bermasalah [ChipCard controller]", "08": "EEPROM stacker tidak terdeteksi atau rusak [Stacker (SAT)]", "09": "Locking switch terbuka [Locking switch]", "10": "Controller rusak atau baterai bermasalah [Controller CMD, baterai, dan jumper baterai]", "11": "Perangkat lunak belum tersedia (perlu unduh) [Controller CMD dan firmware]", "12": "Safety switch terbuka [Safety switch]", "13": "Batas retract tercapai [Stacker (SAT) dan mekanisme retract]", "14": "Konfigurasi minimum tidak terpenuhi [Kaset cash-out dan kaset reject/retract]", "15": "Distributor board tidak valid, tidak terpasang, atau rusak [Distributor board]", "16": "Pengodean output transport tidak valid [Konektor kabel output transport]", "17": "Belt drive clamping rusak atau motor clamp mati [Belt drive clamping (M3) dan motor clamp]", "18": "Uang macet saat dispense [Jalur transport, extractor, dan stacker (SAT)]", "19": "Transport clamp rusak atau terhalang [Transport clamp]", "20": "Single reject switch rusak atau terhalang [Single reject switch (MA2/1, MA2/2, SM1)]", "21": "Stasiun pengukur ketebalan (MDMS/DDU) rusak [MDMS (DDU)]", "22": "Amplifier photosensor rusak atau inisialisasi photosensor gagal [Photosensor dan amplifier photosensor]", "23": "Routing disk rusak atau terhalang [Routing disk (SM2/SM3); pada VCMD: bundle reject switch (SM6)]", "24": "Penggerak reject/retract (MA6) rusak atau terhalang [Kompartemen reject/retract pada kaset reject (MA6)]", "25": "Motor dispensing (DCM1) rusak atau terhalang [Motor utama dispensing (DCM1)]", "26": "Penggerak roda stacker (SM9) rusak atau terhalang [Roda stacker (SM9); pada VCMD: batang pengangkat tipe sisir (SM5) dan pengalih dispensing/transport (M3)]", "28": "Kesalahan shutter [Shutter]", "29": "Photosensor keluaran terhalang (dimanipulasi) [Photosensor keluaran dan shutter]", "70": "MDMS belum siap [MDMS dan kabel fleksibel MDMS]", "90": "Photosensor stacker PS1 kotor [Photosensor PS1 pada input roda stacker]", "91": "Photosensor PS18 kotor [Photosensor PS18]", "93": "Kaset tidak terpasang (single reject) atau photosensor PS2 kotor [Photosensor PS2 (VCMD: pemantau input kotak reject PS21)]", "95": "Photosensor pengambilan uang (PS27) kotor [Photosensor PS27 (VCMD: PS26)]", "9a": "Photosensor shutter (PS28) kotor [Photosensor PS28 (kontrol tepi belakang bundel)]"};

const TRC_FAM={'3':'Terlalu banyak bundle reject dari kaset X','4':'Uang tidak dapat dikeluarkan dari kaset X','5':'Terlalu banyak uang cacat (double/lebar/sempit) dari kaset X','6':'Kaset X rusak (EEPROM kaset tidak bisa dibaca/ditulis)','7':'Sensor dispensing kotor/sensor tekanan rusak pada modul X','8':'Sensor kosong (empty) kaset X kotor'};
function trcScodName(c){const k=String(c).toLowerCase();if(TRC_SCOD[k])return TRC_SCOD[k];const f=TRC_FAM[k[0]];return f?f.replace('X',k[1]):'kode tidak ada di kamus';}
const TRC_TRIG=/Wincor Nixdorf CCDM Trace File|<TRACE\b[\s\S]{0,400}type="STDV"/i;
function trcDetect(text){
  const T=String(text||'');
  if(!TRC_TRIG.test(T))return null;
  const kv=s=>{const o={};s.replace(/;\s*$/,'').split(',').forEach(p=>{const i=p.indexOf('=');if(i>0)o[p.slice(0,i)]=p.slice(i+1);});return o;};
  const sd=[],disp=[],other={};let m;
  const re=/<(EVENT|ENTRY|COMMAND) date="([^"]*)" time="([^"]*)" type="([^"]*)">([\s\S]*?)(?=<\/(?:EVENT|ENTRY|COMMAND)>|<(?:EVENT|ENTRY|COMMAND) )/g;
  while((m=re.exec(T))){
    const dt=m[2]+' '+m[3],ty=m[4],body=m[5];
    if(ty==='STDV'){const o=kv(body.trim());o.dt=dt;sd.push(o);}
    else if(ty==='CNG_DISP_STANDARD'){body.trim().replace(/;\s*$/,'').split(':').forEach(p=>{const a=p.split(',');if(a.length>=4)disp.push({dt,c:a[0],n:+a[1],r:+a[2],s:a[3]});});}
    else other[ty]=(other[ty]||0)+1;
  }
  if(!sd.length)return null;
  sd.sort((a,b)=>a.dt<b.dt?-1:1);
  const res={n:sd.length,from:sd[0].dt,to:sd[sd.length-1].dt,scod:{},eps:[],errs:[],cas:{},other};
  sd.forEach(r=>{res.scod[r.SCOD]=(res.scod[r.SCOD]||0)+1;});
  let cur=null;
  sd.forEach(r=>{
    if(r.SCOD!=='00'){
      if(!cur){cur={start:r.dt,end:r.dt,codes:[],cmd:new Set(),door:new Set(),cas:new Set(),err:new Set()};res.eps.push(cur);}
      cur.end=r.dt;if(!cur.codes.includes(r.SCOD))cur.codes.push(r.SCOD);cur.cmd.add(r.LCMD);cur.door.add(r.DOOR);cur.cas.add(r.CAS);if(r.ERROR&&/[1-9A-F]/i.test(r.ERROR))cur.err.add(r.ERROR);
    }else cur=null;
  });
  const sec=s=>Date.parse(s.replace(' ','T'));
  const seen={};
  sd.forEach(r=>{
    if(r.ERROR&&/[1-9A-F]/i.test(r.ERROR)){
      const e=seen[r.ERROR]||(seen[r.ERROR]={code:r.ERROR,first:r.dt,count:0,scod:new Set(),lcmd:new Set(),ctx:null});
      e.count++;e.scod.add(r.SCOD);e.lcmd.add(r.LCMD);
    }
  });
  Object.values(seen).forEach(e=>{
    const t=sec(e.first);const near=disp.filter(x=>Math.abs(sec(x.dt)-t)<=4000);
    e.ctx=near.map(x=>'kaset '+x.c+': '+x.n+' lembar, reject '+x.r+', status '+x.s).join('; ');
    res.errs.push(e);
  });
  disp.forEach(x=>{const c=res.cas[x.c]||(res.cas[x.c]={n:0,r:0,k:0,E:0,rejEv:0});c.n+=x.n;c.r+=x.r;c.k++;if(x.s==='E')c.E++;if(x.r>0)c.rejEv++;});
  res.eEvents=disp.filter(x=>x.s==='E').map(x=>x.dt+' kaset '+x.c+' ('+x.n+' lembar)');
  res.rejEvents=disp.filter(x=>x.r>0).map(x=>x.dt+' kaset '+x.c+': '+x.r+' reject dari '+(x.n+x.r)+' lembar');
  res.nDisp=disp.length;
  return res;
}
function trcBlockText(r){
  if(!r)return '';
  const L=[];
  L.push('HASIL PEMBACAAN OTOMATIS TRACE WINCOR CDM V4 / CCDM (diproses aplikasi dari file terlampir; angka dan waktu di bawah ini FAKTA dari file):');
  L.push('Rentang: '+r.from+' s/d '+r.to+'; '+r.n+' catatan status STDV; '+r.nDisp+' transaksi dispense.');
  L.push('Distribusi SCOD: '+Object.keys(r.scod).map(k=>k+' x'+r.scod[k]+(k!=='00'?' ('+trcScodName(k)+')':'')).join('; ')+'.');
  if(r.eps.length){L.push('KEJADIAN SCOD NON-00 ('+r.eps.length+' episode):');r.eps.forEach(e=>L.push('- '+e.start+' s/d '+e.end+': SCOD '+e.codes.map(c=>c+' = '+trcScodName(c)).join(' | ')+'; perintah terakhir '+[...e.cmd].join('/')+'; pintu '+[...e.door].join('/')+' (O=terbuka, C=tertutup); kaset terdeteksi CAS='+[...e.cas].join('/')+(e.err.size?'; ERROR perangkat '+[...e.err].join(','):'; tanpa ERROR perangkat')));}
  else L.push('Tidak ada SCOD selain 00 pada seluruh file.');
  if(r.errs.length){L.push('ERROR PERANGKAT (field ERROR 16 digit heksadesimal) yang muncul:');r.errs.forEach(e=>L.push('- '+e.code+' pertama '+e.first+' ('+e.count+' catatan), SCOD saat itu '+[...e.scod].join('/')+', perintah '+[...e.lcmd].join('/')+(e.ctx?'; dispense di sekitar waktu itu: '+e.ctx:'')));}
  else L.push('Tidak ada ERROR perangkat (semua 0000000000000000).');
  const ck=Object.keys(r.cas).sort();
  if(ck.length)L.push('STATISTIK DISPENSE PER KASET: '+ck.map(k=>{const c=r.cas[k];return 'kaset '+k+': '+c.k+' transaksi, '+c.n+' lembar keluar, '+c.r+' reject ('+(c.n?(100*c.r/c.n).toFixed(2):'0')+'%), kejadian reject '+c.rejEv+', status E '+c.E+'x';}).join('; ')+'.');
  if(r.eEvents.length)L.push('Dispense berstatus E (kaset kosong/habis, uang dialihkan ke reject): '+r.eEvents.join('; ')+'.');
  if(r.rejEvents.length)L.push('Dispense dengan bundle reject: '+r.rejEvents.slice(0,15).join('; ')+(r.rejEvents.length>15?' (dan '+(r.rejEvents.length-15)+' lagi)':'')+'.');
  L.push('Jenis catatan lain pada file: '+Object.keys(r.other).map(k=>k+' x'+r.other[k]).join(', ')+'. Tidak ada catatan jaringan/host/komunikasi pada file trace ini.');
  L.push(TRC_RULES);
  return L.join('\n');
}
const TRC_RULES='ATURAN ANALISA TRACE WINCOR CDM V4: (1) Jawab dalam bahasa Indonesia, mulai dari KESIMPULAN: modul yang error menurut SCOD (bukan kode ERROR). SCOD 00 = normal. (2) SCOD 14 (konfigurasi minimum tidak terpenuhi) yang muncul saat pintu terbuka, CAS=N, C_OUT=C dan perintah FO/FN adalah NORMAL selama kaset dicabut/diganti teknisi (servis), bukan kerusakan; cek apakah kembali ke 00 setelah kaset terpasang. (3) SCOD 6x (mis. 64) = kaset X rusak/EEPROM kaset gagal baca-tulis; jika hanya sesaat saat kaset dipasang lalu kembali 00 dan test dispense semua kaset OK, simpulkan gangguan sesaat akibat posisi/kontak kaset, rekomendasikan pasang ulang dan pantau. (4) Cocokkan SCOD dengan ERROR perangkat berdasarkan waktu yang sama; kode ERROR 16 digit tidak boleh diartikan sendiri secara resmi, sebutkan hanya korelasinya (waktu, kaset, perintah, jumlah reject). Jika ERROR muncul dengan SCOD 00 dan bersamaan dengan bundle reject pada satu kaset, itu catatan reject/kualitas uang/pengambilan uang, bukan modul rusak, tetapi jika berulang pada kaset yang sama sarankan periksa kondisi uang, pick roller dan sensor kaset tersebut. (5) Status E pada dispense = kaset kosong, bukan kerusakan. (6) JARINGAN: file TRC hanya memuat status perangkat CMD dan perintah dispense; TIDAK ADA data host/jaringan, jadi gangguan jaringan TIDAK bisa dibuktikan atau disingkirkan dari file ini. Katakan terus terang, lalu minta EJ log, log aplikasi (ProTopas/ATM application) atau log host untuk memeriksa timeout, offline atau reversal. Jangan menebak jaringan. (7) Jika satu kaset muncul di SCOD 6x lalu kemudian sering reject (atau reject 1 lembar tanpa lembar keluar berulang), nyatakan kaset itu tersangka utama dan urutkan kaset berdasarkan persentase reject; rekomendasikan tukar posisi kaset untuk membuktikan apakah masalah mengikuti kaset atau slot. (8) Akhiri dengan tindakan lapangan berurutan singkat dan sebutkan bukti (tanggal/jam) dari data di atas.';

async function chatSend(){
  const inp=$c('chatInput'),text=inp.value.trim();
  if((!text&&!chatFile&&!chatEj)||chatBusy)return;
  const ejf=chatEj;
  chatBusy=true;$c('chSend').disabled=true;
  const file=chatFile,q=text||(ejf?(/CCDM Trace File|type="STDV"/.test(ejf.text)?'Tolong analisa file trace Wincor CDM V4 terlampir ('+ejf.n+' file): tentukan modul yang error berdasarkan SCOD, cocokkan dengan ERROR perangkat, dan cek apakah ada gangguan jaringan.':'Tolong baca EJ terlampir ('+ejf.n+' file) dan tentukan modul perangkat keras yang bermasalah berdasarkan M-Status.'):'Tolong analisa foto terlampir.');
  inp.value='';chatGrow();chatPick(null);
  chatAdd('user',ejf?q+'\n📎 '+ejf.name:q,file);
  usageLog({type:'clara',brand:'clara',module:file?'foto':ejf?'ej':'teks',query:q.slice(0,120)});
  const typing=chatTyping();
  try{
    const st=await chatLoadSettings();
    if(file&&st.vision===false)throw new Error('Analisis foto dinonaktifkan oleh Admin. Kirim pertanyaan dalam bentuk teks.');
    const lbl=typing.querySelector('.bub');
    const setL=t=>{lbl.innerHTML='<span class="dots"><span></span><span></span><span></span></span><span class="ty-l">'+t+'</span>';};
    setL('Mencari di database…');
    await new Promise(r=>setTimeout(r,30));
    let ret=chatRetrieve(q,chatHist);
    /* foto: baca kode dari foto lebih dulu, lalu cocokkan ke database */
    if(file&&!ret.hits.length){
      try{
        setL('Membaca kode dari foto…');
        const ex=await smartRequestAiWithFailover(st.apis,'Dari foto ini, salin PERSIS semua kode error, nama modul/komponen, merk/tipe mesin, dan pesan yang tampak di layar atau label. Satu item per baris. Jangan menganalisa, jangan menambah kata lain.',file);
        const ret2=chatRetrieve(q+' '+ex.answer,chatHist);
        if(ret2.hits.length||ret2.isAtm){ret=ret2;ret.photoText=ex.answer.slice(0,600);}
        else ret.photoText=ex.answer.slice(0,600);
        setL('Mencari di database…');
      }catch(e){}
    }
    let hwRes=null;try{hwRes=hwDetect(q+' '+(ret.photoText||''),ret.hits);}catch(e){}
    let ejRes=null;try{ejRes=ejDetect(q+'\n'+(ejf?ejf.text:'')+'\n'+(ret.photoText||''));if(ejRes)ejRes=await ejEnrich(ejRes);}catch(e){}
    if(ret.hits.length)chatDbCard(ret);
    else if(ret.isAtm&&!ejRes)chatDbNote();
    setL('Menyusun jawaban…');
    const hist=chatHist.slice(-10).map(m=>(m.r==='u'?'Pengguna: ':'Asisten: ')+m.t.slice(0,1500)).join('\n\n');
    let dbBlock='';
    if(ret.isAtm){dbBlock='\n\nHASIL PENCARIAN DATABASE APLIKASI (pertanyaan ini terkait ATM; ikuti PROTOKOL DATABASE-FIRST):\n'+(ret.text||'TIDAK ADA entri yang cocok di database untuk pertanyaan ini.')+(ret.photoText?'\n\nTeks yang terbaca dari foto:\n'+ret.photoText:'');
      if(ret.mode!=='kode'){const inf=chatInfer(q+' '+(ret.photoText||''),ret);if(inf)dbBlock+='\n\nDATA PEMBANDING UNTUK PENALARAN (bukan jawaban resmi; gunakan untuk menyusun kesimpulan sesuai PROTOKOL PENALARAN DI LUAR DATABASE):\n'+inf;}
    }
    else if(ret.hits.length){dbBlock='\n\nREFERENSI DATABASE (mungkin relevan):\n'+ret.text;}
    {const fb=chatFlowBlock(q+' '+(ret.photoText||''));if(fb)dbBlock+='\n\n'+fb;const hb=chatHistoryBlock(q+'\n'+(ret.photoText||''));if(hb)dbBlock+='\n\n'+hb;}
    try{const hwt=hwBlockText(hwRes);if(hwt)dbBlock+='\n\n'+hwt;}catch(e){}
    try{const ejt=ejBlockText(ejRes);if(ejt)dbBlock+='\n\n'+ejt;}catch(e){}
    try{const alt=alarmBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(alt)dbBlock+='\n\n'+alt;}catch(e){}
    try{const dgt=dongleBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(dgt)dbBlock+='\n\n'+dgt;}catch(e){}
    try{const est=ejsetBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(est)dbBlock+='\n\n'+est;}catch(e){}
    try{const ept=eppBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(ept)dbBlock+='\n\n'+ept;}catch(e){}
    try{const mot=moniBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(mot)dbBlock+='\n\n'+mot;}catch(e){}
    try{const wct=wcBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(wct)dbBlock+='\n\n'+wct;}catch(e){}
    try{const mdt=mdrBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(mdt)dbBlock+='\n\n'+mdt;}catch(e){}
    try{const dnt=dnBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(dnt)dbBlock+='\n\n'+dnt;}catch(e){}
    try{const trt=trcBlockText(trcDetect((ejf?ejf.text:'')+'\n'+q));if(trt)dbBlock+='\n\n'+trt;}catch(e){}
    try{const nkt=ncrkeyBlockText(q+' '+(ret.photoText||'')+' '+chatHist.filter(m=>m.r==='u').slice(-2).map(m=>m.t).join(' '));if(nkt)dbBlock+='\n\n'+nkt;}catch(e){}
    const prompt=CHAT_SYS+'\n\n'+abbrGlossText()+'\n\n'+txFlowText()+normAbbr(dbBlock)+'\n\nRIWAYAT PERCAKAPAN:\n'+(hist||'(awal percakapan)')+'\n\nPERTANYAAN TERBARU PENGGUNA'+(file?' (dengan foto terlampir)':'')+':\n'+q+'\n\nJawab sekarang sebagai Clara.';
    const r=await smartRequestAiWithFailover(st.apis,prompt,file);
    r.answer=normAbbr(r.answer);
    chatHist.push({r:'u',t:file?q+' [foto terlampir]':ejf?q+' [file EJ terlampir: '+ejf.name+']':q},{r:'a',t:r.answer});
    typing.remove();chatAdd('ai',r.answer);
    try{hwCard(hwRes);}catch(e){}
    try{ejCard(ejRes);}catch(e){}
  }catch(e){
    typing.remove();chatSettings=null;
    chatAdd('err',e.message||'Terjadi kesalahan. Coba lagi.');
  }
  chatBusy=false;$c('chSend').disabled=false;$c('chatInput').focus();
}
