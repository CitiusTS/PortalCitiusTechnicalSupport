
/* ===== PANDUAN TEKNISI ALARM CS3 (referensi Clara) =====
   Sumber: "Panduan Teknisi Alarm CS3", Rev. 1 - September 2026 (SOP Alarm CS3 & Troubleshoot). Untuk FSE / Teknisi Staging / Monitoring. */
const ALARM_TRIG=/\b(alarm|cs3|sirene|siren|spiffs|eyro|blankspot|blank spot|modul alarm)\b|192\.168\.4\.1|vibration threshold|threshold getar|config mode|mode konfigurasi|tombol kuning/i;
const ALARM_GUIDE=`PANDUAN TEKNISI ALARM CS3 (referensi resmi internal Rev. 1 September 2026; modul alarm yang dipasang pada mesin CRM Hyosung; gunakan sebagai sumber utama untuk pertanyaan instalasi, setting, pengujian, troubleshooting, SIM, firmware, logistik, dan laporan alarm CS3):
ALUR KERJA: 1 Cek aman, 2 Pasang, 3 Setting, 4 Uji, 5 Konfirmasi. Verifikasi akhir wajib oleh Tim Monitoring.
KESELAMATAN: Tegangan kerja 210-230 Vac. Grounding maksimal 1 Vac; bila di luar batas jangan lanjutkan pemasangan, laporkan ke PIC lokasi. Matikan sumber listrik sebelum membuka modul atau memindahkan kabel. Tangan kering, area bebas cairan. Jangan menyambung/melepas antena, speaker, SIM, dan sensor saat modul menyala. Jangan biarkan kabel terjepit cover, pintu brankas, atau mekanisme mesin. Foto kondisi sebelum dan sesudah. Teknisi baru wajib didampingi personel yang paham mesin CRM Hyosung.
PEKERJAAN SELESAI bila: modul menyala, sensor teruji, sirene berbunyi, pintu/cover tertutup, mesin kembali online, status alarm online, dan timestamp dashboard berjalan.
PERSIAPAN: Alat: multimeter AC, obeng set, tang potong, cable tie, isolasi listrik, smartphone dengan Wi-Fi, kamera. Sparepart: modul alarm CS3 sesuai versi, power adaptor + kabel power, speaker + kabel speaker, antena + kabel/connector, SIM aktif sesuai arahan koordinator. Checklist: nomor mesin/lokasi sesuai work order; versi board teridentifikasi; SIM terpasang benar dan terdata; antena, speaker, sensor, adaptor, kabel tidak rusak; stop kontak tersedia dan tidak longgar; tegangan 210-230 Vac dan grounding <= 1 Vac; PIC lokasi hadir. Versi board menentukan posisi konektor, perilaku lampu indikator, dan file firmware; jangan memilih firmware berdasarkan bentuk casing.
VERSI MODUL: Versi I: tidak punya sensor suhu/kelembapan terpisah; periksa konektor antena, speaker, tombol darurat, SIM, power, switch. Versi II: punya sensor suhu/kelembapan dan sensor getar; posisi terminal speaker/antena berbeda dari Versi I. Versi V: terminal berlabel di sisi kanan board; cocokkan kabel dengan label sebelum mengencangkan. Urutan cek koneksi semua versi: SIM, antena, speaker, sensor, switch/tombol, adaptor. Tarik kabel perlahan, jangan menarik langsung pada konektor.
INSTALASI (staging): 1 Konfirmasi mesin CRM, modul, antena, speaker, adaptor, SIM tersedia. 2 Cocokkan nomor mesin, lokasi, SIM, modul dengan work order. 3 Buka cover belakang (matikan listrik bila perlu, ikuti prosedur mesin CRM). 4 Pasang speaker di posisi aman, tidak menghalangi mekanisme, suara tidak tertutup. 5 Tarik kabel ke area dispenser/brankas sisi kanan mengikuti jalur kabel power mesin, gunakan cable tie. 6 Hubungkan antena, speaker, sensor, SIM, adaptor sesuai versi board. 7 Masukkan adaptor ke stop kontak lalu ubah switch OFF ke ON. 8 Atur parameter sensor, uji semua trigger, konfirmasi status online.
KONFIGURASI (Config Mode, pakai smartphone dekat modul; jangan konfigurasi saat sinyal Wi-Fi modul tidak stabil): 1 Switch OFF. 2 Tekan dan tahan tombol kuning sambil menyalakan switch; lepas tombol setelah lampu biru terlihat. 3 Hubungkan ponsel ke Wi-Fi modul (kredensial dari koordinator / kartu setup). 4 Buka browser ke 192.168.4.1, login akun konfigurasi resmi. 5 Device Setting: Vibration Threshold = 35, Temperature Threshold = 100, Humidity Threshold = 100; pilih modem sesuai SIM. 6 Tekan Save; di Device Information scroll ke bawah lalu tekan Reboot. Bila 192.168.4.1 tidak terbuka: matikan data seluler sementara, pastikan ponsel tetap terhubung ke Wi-Fi modul, nonaktifkan VPN, muat ulang halaman.
PENGUJIAN setelah reboot dan sebelum cover ditutup penuh: Power (switch ON, lampu power menyala); Getar (getaran terkontrol, trigger terdeteksi dan sirene berbunyi); Suhu dan Kelembapan (nilai terbaca di sistem/config); Emergency (tekan sesuai izin PIC, trigger tercatat/sirene sesuai sistem); Komunikasi (konfirmasi Monitoring: online dan timestamp bergerak). Checklist penutupan: konektor kencang dan tidak tertukar; kabel tertata, tidak terjepit; pintu brankas dan cover fascia bawah tertutup; mesin CRM kembali online; Monitoring menyatakan alarm online dan timestamp berjalan; foto akhir dan hasil tes terkirim ke kanal laporan. DILARANG meninggalkan lokasi bila status alarm belum online atau timestamp belum berjalan.
ALARM OFFLINE (langkah): 1 Terima tiket, catat lokasi, nomor mesin, waktu offline, kontak PIC. 2 Koordinasi akses dan pendampingan dengan PIC. 3 Periksa fisik: lampu indikator, konektor, antena, SIM, adaptor, kabel power, speaker. 4 Uji berurutan: adaptor, kabel power, SIM, antena, speaker, modul; ganti satu komponen pada satu waktu. 5 Tutup pintu/cover, online-kan mesin, minta Monitoring cek status dan timestamp. 6 Tutup tiket hanya setelah online dan timestamp berjalan; cantumkan tindakan dan komponen yang diganti. Prinsip: jangan langsung menyimpulkan modul rusak; pastikan listrik, adaptor, kabel, SIM, sinyal, antena, konfigurasi sudah diperiksa.
MATRIKS GEJALA - PENYEBAB - TINDAKAN AWAL: Modul mati = adaptor/kabel/modul: ukur sumber listrik, uji adaptor, uji kabel, ganti modul bila tetap mati. Sirene tidak bunyi = speaker/kabel speaker: cek terminal dan kabel, uji atau ganti speaker. Tidak online = SIM/APN/antena/blankspot: cek SIM dan APN, cek antena, uji operator lain, konfirmasi blankspot. Online-offline berulang = sinyal lemah/lingkungan: cek posisi antena, konektor, kekuatan sinyal, kondisi lokasi (mis. ATM di sudut/area tertutup). Lampu merah redup = dugaan IC processor bermasalah: hentikan perbaikan board, pakai modul backup, kirim ke pusat. Biru cepat kembali merah saat config = dugaan IC power bermasalah: modul backup dan eskalasi ke pusat. Tidak masuk config = tombol/kabel kuning putus: cek kabel tombol, perbaiki jika diizinkan, bila gagal kirim ke pusat.
BATAS TINDAKAN TEKNISI LAPANGAN: boleh memeriksa koneksi dan mengganti sparepart sesuai otorisasi. Kerusakan IC/board diserahkan ke pusat/EYRO. Jangan soldering board di lokasi tanpa izin; jangan bongkar IC di lokasi.
MODUL MATI / SIRENE TIDAK BUNYI: A. Modul tidak menyala: 1 cek stop kontak (210-230 Vac, grounding <= 1 Vac); 2 ganti adaptor yang pasti baik dan sesuai spesifikasi; 3 periksa kabel power putus/longgar/konektor rusak; 4 bila tetap mati pakai modul backup dan kirim unit bermasalah ke pusat. B. Test getar tidak bersuara: 1 pastikan Vibration Threshold = 35 dan konfigurasi sudah disimpan serta reboot; 2 pastikan kabel speaker di terminal yang benar dan kencang; 3 periksa kabel speaker putus/terjepit; 4 uji dengan speaker cadangan yang pasti baik.
TIDAK ADA SINYAL / TIDAK ONLINE: identifikasi versi board dulu karena perilaku lampu berbeda. Versi I: bila XL tidak mendapat sinyal, uji SIM/operator pengganti sesuai persetujuan; cek konektor dan kabel antena (kabel putus harus diganti, sambungan darurat menurunkan performa). Versi II/V: bila ganti XL ke Telkomsel, sesuaikan modem/APN sesuai profil resmi; cek konektor/terminal dan posisi antena. Bila SIM, APN, antena, dan modul baik tetapi tidak ada GPRS, laporkan kemungkinan blankspot. CATATAN LED: keterangan kedip LED di SOP lama tidak seragam antarversi (sumber menyebut kedip cepat = mendapat sinyal, kedip lambat = mencari sinyal pada Versi I); jangan menutup tiket hanya berdasarkan lampu; status online dan timestamp dashboard adalah acuan akhir. Urutan memastikan blankspot: SIM aktif dan terbaca; APN sesuai operator; antena dan kabel baik; modul pembanding juga tidak dapat jaringan; posisi antena sudah dicoba di titik lebih terbuka; Monitoring sudah cek dashboard.
GANGGUAN LANJUTAN (gunakan modul backup bila mengarah ke IC/board): Intermittent (online-offline): cek kekuatan sinyal, posisi ATM di sudut/area tertutup, posisi antena, konektor, kabel, kestabilan power. IC Processor bad: lampu status merah redup; catat gejala, pasang modul backup, kirim modul ke pusat/EYRO. IC Power bad: saat config mode lampu biru cepat kembali merah; jangan bongkar IC di lokasi, modul backup dan eskalasi. Kabel power putus: modul tidak menyala walau adaptor dan listrik baik; sambung/ganti hanya bila sesuai otorisasi dan sambungan aman. Kabel speaker putus: sirene gagal; cek kontinuitas, terminal, jalur; ganti bila rusak. Kabel antena putus: sulit online; ganti kabel/antena (sambungan sementara bisa jalan tetapi performa tidak maksimal). Eskalasi wajib menyertakan foto lampu indikator, label versi board, nomor modul, kondisi kabel, hasil tindakan, waktu pengujian, nama PIC lokasi.
PENGGANTIAN SIM: harus disetujui dan tercatat; jangan ganti SIM tanpa nomor tiket / konfirmasi PIC. 1 Pastikan sumber masalah (uji modul, power, antena, konfigurasi; ganti SIM hanya bila analisis mengarah ke jaringan/SIM). 2 Lapor Monitoring dan PIC proyek, tunggu persetujuan operator/SIM pengganti. 3 Switch OFF dan lepas adaptor sebelum membuka modul atau melepas SIM. 4 Pasang SIM baru arah benar, jangan terlalu menyentuh chip. 5 Masuk config mode, pilih profil modem/APN sesuai operator (nilai resmi dari koordinator). 6 Reboot, tunggu registrasi jaringan, konfirmasi status dan timestamp ke Monitoring. 7 Kirim nomor SIM lama/baru, operator, modul, lokasi, waktu pergantian ke admin/dashboard. SIM lama jangan dibuang: label BAD / REPLACED, catat nomor, kembalikan sesuai alur logistik.
UPDATE FIRMWARE (hanya bila ada instruksi dan file resmi yang cocok dengan versi board): RISIKO MODUL RUSAK; File System dan Firmware masing-masing hanya boleh dijalankan SATU kali; jangan matikan power, tutup browser, atau klik berulang saat update. 1 Pastikan ada file Spiffs xx.bin dan Firmware xx.bin yang tepat dengan versi board R.xx. 2 Masuk config mode (tombol kuning sambil menyalakan modul, Wi-Fi modul, 192.168.4.1). 3 Update Firmware: pilih Spiffs xx.bin, klik update file system satu kali, tunggu pesan sukses. 4 Pilih Firmware xx.bin, klik update firmware satu kali, tunggu sukses. 5 Cek Device Setting: vibration 35, temperature 100, humidity 100, modem/APN, authentication sesuai standar. 6 Reboot dari Device Information, uji trigger, sirene, online, timestamp.
LOGISTIK SPAREPART / MODUL BAD: Temuan (FSE periksa modul, SIM, kabel, adaptor, speaker, antena; bukti foto, gejala, nomor tiket) > Permintaan (FSE minta sparepart ke Monitoring; jenis dan jumlah) > Persetujuan (Monitoring eskalasi ke PIC proyek dan Admin Logistik) > Pengiriman (Admin Logistik mendata dan mengirim; nomor resi, tujuan, penerima) > Pengembalian (FSE kembalikan unit/SIM bad dengan label BAD, serial, alasan, tanggal) > Repair (PIC pusat/EYRO cek dan serah terima). Label pengembalian minimal: nomor tiket, lokasi/mesin, serial modul/SIM, gejala, tindakan, teknisi/tanggal.
TEMPLATE LAPORAN: TIKET, LOKASI / MESIN (nama lokasi - nomor mesin), WAKTU DATANG, VERSI MODUL (I / II / V - board R.xx), GEJALA (offline / mati / sirene / intermittent / lainnya), HASIL CEK (power, adaptor, kabel, SIM, APN, antena, speaker, sensor), TINDAKAN (detail perbaikan / komponen diganti), HASIL UJI (sensor, sirene, online, timestamp), SPAREPART LAMA (dikembalikan / tidak ada), PIC LOKASI, STATUS AKHIR (SELESAI / PENDING / ESKALASI), LAMPIRAN (foto sebelum, saat perbaikan, sesudah). Foto wajib: kondisi awal (lampu indikator dan posisi modul), label modul (versi board dan serial), hasil akhir (kabel rapi, cover tertutup). Status SELESAI hanya bila semua fungsi lulus, alarm online, timestamp bergerak, mesin normal, PIC mengetahui hasil, dokumentasi lengkap.
RINGKASAN CEPAT: tegangan 210-230 Vac; grounding maksimal 1 Vac; Vibration 35; Temperature 100; Humidity 100; alamat config 192.168.4.1. Urutan cek modul mati: stop kontak, adaptor, kabel power, modul. Urutan cek offline: SIM/APN, antena/kabel, sinyal lokasi, modul. Sirene tidak bunyi: setting, terminal, kabel, ganti speaker. Acuan selesai: status online dan timestamp dashboard berjalan.`;
function alarmBlockText(text){
  if(!ALARM_TRIG.test(String(text||'')))return '';
  return ALARM_GUIDE+'\nATURAN MENJAWAB ALARM CS3: (1) Jawab dari panduan di atas dengan bahasa baku yang natural seperti tanya jawab dengan rekan teknisi, tetapi lengkap dan berurutan. (2) Tanyakan versi board (I, II, atau V) bila jawabannya bergantung pada versi dan pengguna belum menyebutkannya. (3) Jangan mengarang nilai di luar panduan (misalnya kata sandi login config, profil APN, atau file firmware); arahkan ke koordinator atau Tim Monitoring. (4) Tekankan keselamatan listrik dan batas tindakan teknisi (tidak soldering/bongkar IC di lokasi). (5) Ingatkan acuan selesai: status online dan timestamp dashboard berjalan, bukan hanya lampu LED. (6) Bila hal yang ditanyakan tidak ada di panduan, katakan jujur bahwa panduan tidak membahasnya dan sarankan eskalasi ke Tim Monitoring atau pusat/EYRO.';
}


/* ===== PROSEDUR PERSIAPAN DONGLE / KEYDISK NCR (ATM Jalin) ATAU SOFTWARE ECP (referensi Clara) =====
   Sumber: prosedur dari Manager Technical Support & IT. Untuk FSE / Teknisi. */
const DONGLE_TRIG=/\b(dongle|dongel|donggle|key\s?disk|ecp|efts|sysapp|gpedit|kaseya)\b|gpedit\.msc|services\.msc|(?:ncr|atm).{0,40}\bjalin\b|\bjalin\b.{0,40}(?:ncr|atm|dongle|dongel|keydisk)/i;
const DONGLE_GUIDE=`PROSEDUR SEBELUM MENJALANKAN DONGLE / KEYDISK NCR (KHUSUS ATM JALIN) ATAU SOFTWARE ECP (prosedur internal dari Manager Technical Support & IT; gunakan sebagai sumber utama untuk pertanyaan langkah persiapan dongle/keydisk NCR dan ECP):
LANGKAH BERURUTAN:
1. Saat mesin masih berada di Windows, buka Task Manager lalu End Task pada proses "Administrator EFTS".
2. Dari Task Manager pilih New Task, ketik gpedit.msc untuk membuka Group Policy Editor.
3. Di Group Policy, pilih bagian paling bawah: Administrative Templates, lalu System.
4. Set DISABLE untuk dua kebijakan: "Prevent access to the command prompt" (prevent command prompt) dan "Prevent access to registry editing tools" (prevent registry). Tujuannya agar CMD dan registry bisa dipakai selama proses dongle.
5. Restart mesin (di catatan asli tertulis "riset mesin").
6. Setelah mesin kembali ke Windows, End Task lagi pada "Administrator EFTS" (aplikasi ini berjalan lagi setelah restart).
7. Buka New Task, ketik services.msc.
8. Di daftar Services, stop Kaseya Agent yang paling atas saja (satu saja).
9. Tutup semua tab/jendela yang terbuka.
10. Buka Sysapp lewat Windows seperti biasa dan tunggu sampai benar-benar masuk (sabar, jangan diinterupsi).
11. Setelah Sysapp sudah masuk, keluar (exit) dari Sysapp.
12. Buka dan jalankan dongle/keydisk seperti biasa.
PENTING SETELAH DONGLE SELESAI: kembalikan "Prevent access to the command prompt" dan "Prevent access to registry editing tools" ke ENABLE agar CMD dan registry terblokir kembali.
RINGKAS: End Task EFTS, gpedit (disable prevent CMD dan registry), restart, End Task EFTS lagi, services.msc dan stop satu Kaseya Agent paling atas, tutup semua tab, buka Sysapp sampai masuk lalu exit, jalankan dongle, selesai: ENABLE kembali dua kebijakan.`;
function dongleBlockText(text){
  if(!DONGLE_TRIG.test(String(text||'')))return '';
  return DONGLE_GUIDE+'\nATURAN MENJAWAB PROSEDUR DONGLE: (1) Jawab dari prosedur di atas sebagai langkah bernomor yang lengkap dan berurutan, dengan bahasa natural seperti rekan senior. (2) Tegaskan dua hal yang paling sering terlewat: End Task EFTS dilakukan dua kali (sebelum dan sesudah restart), dan setelah dongle selesai dua kebijakan Prevent harus di-Enable kembali. (3) Jangan menambah langkah, nama file, atau nilai yang tidak ada di prosedur. Bila pengguna bertanya hal di luar prosedur (misalnya apakah Kaseya Agent perlu dijalankan kembali, atau error saat dongle), katakan jujur bahwa prosedur tidak membahasnya dan arahkan: "Hubungi Team Leader atau Technical Support". (4) Ingatkan bahwa prosedur ini melonggarkan pembatasan keamanan mesin sementara, jadi hanya dikerjakan sesuai penugasan dan SOP bank, dan dikembalikan seperti semula setelah selesai.';
}


/* ===== PANDUAN SETTING EJ ATM NCR (referensi Clara) =====
   Sumber: prosedur dari Manager Technical Support & IT. Untuk FSE / Teknisi. */
const EJSET_TRIG=/\b(sched\s?init|schedinit|auto\s?ej\s?init|ej\s?options?|init\s?jurnal|scheduled\s?init|disp\s?config)\b|\b(setting|seting|setting?an|konfigurasi|configure|atur|jadwal|schedule|init|inisialisasi)\b.{0,30}\b(ej|jurnal|electronic journal)\b|\b(ej|jurnal|electronic journal)\b.{0,30}\b(setting|seting|konfigurasi|configure|jadwal|schedule|init|inisialisasi|penuh)\b/i;
const EJSET_GUIDE=`PANDUAN SETTING EJ ATM NCR (prosedur internal dari Manager Technical Support & IT; menu Configure pada mesin NCR; gunakan sebagai sumber utama untuk pertanyaan setting/penjadwalan EJ dan Init Jurnal):
TUJUAN: memastikan EJ (Electronic Journal) NCR ter-init otomatis terjadwal setiap hari.
LANGKAH A (cek dulu): 5 CONFIGURE > 34 EJ OPTIONS > 0 DISP CONFIG, lalu lihat apakah nilai SCHEDINIT = ENBLD. Jika SUDAH ENBLD, tidak perlu diubah (selesai untuk bagian ini). Jika BELUM ENBLD, lanjut ke langkah B dan C.
LANGKAH B (aktifkan scheduled init): 5 CONFIGURE > 34 EJ OPTIONS > 4 AUTO EJ INIT OPTION > 2 SCHEDULE INIT OPTION > 1 ENABLE/DISABLE SCHEDULED INIT > tekan 1 lalu ENTER.
LANGKAH C (atur jadwal harian): 5 CONFIGURE > 34 EJ OPTIONS > 2 AUTO EJ INIT OPTION > 2 SCHEDULE INIT OPTION > 2 SCHEDULED INIT PATTERN > 1 DAILY > isi waktu 23:59.
CATATAN PENOMORAN: pada prosedur sumber, menu "AUTO EJ INIT OPTION" tertulis bernomor 4 di langkah B dan bernomor 2 di langkah C. Sebutkan sesuai tertulis dan sarankan teknisi mengikuti NAMA menu yang tampil di layar bila nomornya berbeda.
TAMBAHAN WAJIB: lakukan INIT JURNAL setelah selesai setting EJ, dan juga setelah melakukan install ulang.
RINGKAS: cek DISP CONFIG SCHEDINIT (ENBLD = sudah), bila belum: aktifkan SCHEDULED INIT (tekan 1, ENTER), pola DAILY jam 23:59, lalu INIT JURNAL; INIT JURNAL juga setelah install ulang.`;
function ejsetBlockText(text){
  if(!EJSET_TRIG.test(String(text||'')))return '';
  return EJSET_GUIDE+'\nATURAN MENJAWAB SETTING EJ: (1) Jawab dari panduan di atas sebagai langkah bernomor lengkap dengan jalur menu persis seperti tertulis, bahasa natural seperti rekan senior. (2) Tekankan: cek SCHEDINIT dulu; bila sudah ENBLD jangan diubah. (3) Selalu ingatkan INIT JURNAL setelah setting EJ dan setelah install ulang. (4) Jangan mengarang jalur menu untuk INIT JURNAL, nilai default, atau langkah lain yang tidak ada di panduan; bila ditanya, katakan panduan tidak membahasnya dan arahkan: "Hubungi Team Leader atau Technical Support". (5) Bila pengguna menanyakan membaca/menganalisa isi file EJ (bukan setting), gunakan pembaca EJ, bukan panduan ini.';
}


/* ===== PANDUAN INPUT MASTER KEY EPP HYOSUNG (referensi Clara) =====
   Sumber: (1) "Installation Manual - How to Enter Master Key (PCI 2.0/3.0 EPP)", EPP 8000, layar Nautilus Hyosung MoniPlus VDM (contoh MX8600); (2) "Prosedur Inisial EPP-8000R" (dokumen internal). Untuk FSE / Teknisi. */
const EPP_TRIG=/\b(epp|eep|pinpad|pin\s?pad|master\s?-?key|key\s?manager|masterk3|commk3)\b|\b(input|masukkan|masukan|enter|isi)\s+(master\s?)?key\b|check key status|set pinpad state|initialization state|installation state|clear epp|remote key info/i;
const EPP_GUIDE=`PANDUAN INPUT MASTER KEY EPP HYOSUNG (EPP 8000, PCI 2.0/3.0; sumber: Installation Manual internal. Tampilan di manual berasal dari MX8600 dengan layar Nautilus Hyosung MoniPlus VDM; gunakan sebagai acuan untuk Hyosung, dan bila tampilan tipe lain sedikit berbeda, ikuti NAMA menu yang tampil di layar):
RANGKAIAN BESAR: (0) Initialize EPP bila perlu, (1) Masuk Key Manager, (2) Ganti password bila masih default, (3) Ubah state EPP, (4) Input master key (Part 1 dan Part 2), (5) Cek status key.

0. INITIALIZE EPP (hanya bila EPP belum diinisialisasi; kalau sudah, lewati):
 a. Pada DIP switch EPP, geser DIP 1 ke ON, lalu kembalikan ke OFF setelah 5 detik.
 b. Matikan EPP.
 c. Nyalakan EPP lagi setelah sekitar 10 detik.
 Referensi DIP 2: DIP 2 ON = komunikasi USB; DIP 2 OFF = komunikasi Serial.

1. MASUK KEY MANAGER: di VDM (Diagnostics Main Menu) pilih 7 Key Manager lalu tekan Execute. Pilih 1 Enter password lalu Execute. Layar Password: tekan Execute, masukkan password #1; tekan Execute lagi, masukkan password #2. Bila kedua password benar, muncul menu Key Manager Main. Bila password belum pernah diganti, gunakan password default.
 Menu Key Manager Main: 1 Change password, 2 Device test, 3 Enter key, 4 Check key status, 5 Remote key info, 6 Clear EPP, 7 Set pinpad state.

2. GANTI PASSWORD (wajib bila tadi masuk dengan password default; bila sudah pernah diganti, lewati): pilih 1 Change password lalu Execute. Pilih Password #1, Execute, tekan Execute lagi dan masukkan password baru, tekan Execute dan masukkan sekali lagi untuk verifikasi. Ulangi dengan cara yang sama untuk Password #2. Password 1 dan password 2 harus BERBEDA. Setelah selesai, kembali ke VDM Main lalu masuk lagi ke Key Manager memakai password baru.

3. UBAH STATE EPP (agar EPP bisa diisi key): di Key Manager Main pilih 7 Set pinpad state lalu Execute. Layar Enter ID / Password: tekan Execute, masukkan ID dan password #1; tekan Execute, masukkan ID dan password #2. ID dan password berupa ANGKA 0-9, masing-masing 6 digit. Bila ID/password belum pernah ditambah atau diganti, pakai ID dan password default.
 Di menu Set state main (1 Add ID / Password, 2 Change password, 3 Delete ID / password, 4 Set state) tampil ID count dan EPP state.
 a. Bila ID belum ada: pilih 1 Add ID / Password, Execute. Tekan Execute, masukkan ID dan password baru, tekan Execute dan masukkan lagi untuk verifikasi. Tambahkan ID dan password kedua dengan cara yang sama. ID 1 dan ID 2 harus BERBEDA.
 b. Setelah menambah, kembali ke Key Manager Main lalu masuk lagi ke Set pinpad state dengan memasukkan 2 ID dan password baru.
 c. Pilih 4 Set state lalu Execute. Cek "Current state". Bila "Initialization State", tekan Execute untuk mengubah state, lalu kembali ke Key Manager Main. Bila sudah "Installation State", LEWATI langkah ini (jangan diubah).

4. INPUT MASTER KEY: di Key Manager Main pilih 3 Enter key lalu Execute.
 a. Pilih jenis master key lalu Execute: 1 Master key, 2 Master key (Triple), 3 PIN master key, 4 PIN master key (Triple), 5 MAC master key, 6 MAC master key (Triple), 7 Data master key, 8 Data master key (Triple).
 b. Pilih nama key (contoh pada Master key Triple: MASTERK3 dan COMMK3), lalu Execute.
 c. Muncul peringatan bahwa key dengan nama itu (contoh "MASTERK3") akan DIHAPUS/diganti. Bila yakin mengisi master key, tekan Execute; bila ragu atau tidak jadi, tekan Previous.
 d. Layar Entry, kolom Part number (1: Part A, 2: Part B):
   1) Ketik 1 pada EPP lalu Execute.
   2) Masukkan Part 1 master key memakai EPP.
   3) Setelah Part 1 selesai, pilih menu Import lalu Execute.
   4) Ketik 2 pada EPP lalu Execute.
   5) Masukkan Part 2 master key memakai EPP.
   6) Setelah Part 2 selesai, pilih menu Import lalu Execute.
   7) Setelah master key masuk, kembali ke Key Manager Main.
 Kedua part (Part 1 dan Part 2) harus dimasukkan semuanya.

5. CEK MASTER KEY: di Key Manager Main pilih 4 Check key status lalu Execute. Layar menampilkan tabel dengan kolom KEY NAME, USE, LENGTH, dan KEY. Pastikan baris key yang baru diisi muncul (contoh: MASTERK3, USE 0x20, LENGTH 16).

PROSEDUR INISIAL INTERNAL EPP-8000R (dokumen internal; tujuan inisial: agar EPP dapat di-inject master key. Ada dua tahap: inisial HARDWARE lalu inisial SOFTWARE/State EPP):
 Inisial hardware: bila status EPP state sudah "Initialized State", lewati. Bila belum: pindahkan DIP1 ke ON dan kembalikan ke OFF setelah 5 detik, shutdown ATM, nyalakan lagi setelah 10 detik.
 Inisial software = (1) ganti password login menu EPP dari standar, (2) tambah user/ID pada State EPP, (3) ubah status State EPP menjadi "Installation State".
 (1) Ganti password login: di VDM pilih Key Manager > 1 Enter Password. Masukkan Password #1 standar 000000 lalu Execute, Password #2 standar 000000 lalu Execute. Di tampilan KeyManager pilih 1 Change Password > Execute, pilih 1 Password #1 > Execute, masukkan password baru 111111 lalu Execute (ini password standar internal, disebut "standar Datindo" di dokumen), masukkan sekali lagi untuk verifikasi. Bila muncul "Password #1 change success", berhasil. Lakukan hal yang sama untuk 2 Password #2 dengan password 222222. Setelah sukses, keluar dari Key Manager dan coba masuk lagi dengan password baru.
 (2) Tambah user ID agar state bisa diubah: di Key Manager pilih 7 Set Pinpad State. Di kolom ID dan Password masukkan ID 000000 dan Password 000000 (standar), Execute; lakukan sama untuk ID 2. Setelah kedua ID dan password dimasukkan muncul menu: pilih 1 Add ID / Password, masukkan ID 111111 dan Password 111111, Execute, masukkan lagi untuk verifikasi. Pilih 1 Add ID / Password lagi untuk user ID 2 dengan ID 222222 dan Password 222222 (dengan cara sama).
 (3) Ubah state: keluar dari Key Manager lalu login lagi, masuk Set Pinpad State (kini dengan ID/password baru). Kembali ke Set State Main, pilih 4 Set State. Bila Current Status tampil "Authorized Removal State" (pada versi lain tampil "Initialization State"), tekan Execute; saat muncul Confirmation Screen tekan Execute lagi. Current State kemudian berubah menjadi "Installation State". Setelah itu lanjut ke input master key (bagian 4).
 Catatan dokumen internal: Password #1 dan #2 harus berbeda. Bila dilakukan Clear EPP lewat menu Key Manager, password kembali menjadi standar (000000), sehingga prosedur inisial software perlu diulang.
 Perbedaan dua sumber: manual installation menyebut nilai default tidak tertulis dan state awal "Initialization State"; dokumen internal menyebut standar 000000 dan state awal "Authorized Removal State". Keduanya sama tujuannya (hasil akhir "Installation State"); ikuti tulisan yang tampil di layar.

MAINTENANCE KEY MANAGER (menu yang tersedia di manual): Change password (ganti password Key Manager), Set pinpad state > Add ID / Password, Change password, Delete ID / password (kelola ID state), Check key status (cek key yang tersimpan), Enter key (isi ulang key). Clear EPP: setelah dilakukan, password kembali ke standar (000000) menurut dokumen internal; fungsi lainnya tidak dijelaskan. Menu Device test dan Remote key info ada di Key Manager tetapi TIDAK dijelaskan fungsinya di kedua dokumen.
RINGKAS: initialize bila perlu (DIP1 ON 5 detik lalu OFF, matikan EPP, nyalakan lagi setelah ±10 detik), Key Manager > ganti password default (#1 dan #2 beda), Set pinpad state (ID 6 digit angka, dua ID beda) > Set state bila Initialization State (lewati bila Installation State), Enter key > pilih jenis dan nama key > Execute pada peringatan > Part 1 (ketik 1, Execute, isi, Import) dan Part 2 (ketik 2, Execute, isi, Import), Check key status.`;
function eppBlockText(text){
  if(!EPP_TRIG.test(String(text||'')))return '';
  if(typeof NCRKEY_TRIG!=='undefined'&&NCRKEY_TRIG.test(String(text||''))&&!/hyosung|epp|pinpad|vdm/i.test(String(text||'')))return '';
  return EPP_GUIDE+'\nATURAN MENJAWAB EPP: (1) Pandu FSE seperti rekan senior yang mendampingi langsung: satu tahap pada satu waktu, singkat dan jelas, dengan nama menu persis seperti di layar dan tombol yang ditekan (Execute, Previous, Import). Bila FSE belum menyebut posisinya, tanyakan dulu: EPP sudah diinisialisasi atau belum, password sudah default atau sudah diganti, state sekarang Initialization atau Installation; lalu mulai dari tahap yang sesuai. (2) Nilai password/ID standar internal (000000, 111111, 222222) hanya boleh disebut seperti tertulis di prosedur inisial internal di atas, untuk FSE yang sedang mengerjakan inisial EPP; jangan menyebut isi master key sama sekali dan jangan mengarang nilai lain. Bila password tidak cocok atau tidak diketahui, arahkan: "Hubungi Team Leader atau Technical Support". (3) Isi master key bersifat rahasia: ingatkan agar komponen key (Part 1 dan Part 2) tidak ditulis di chat, tidak difoto, dan tidak dikirim; kedua part biasanya dipegang oleh pihak berbeda sesuai SOP bank. (4) Peringatkan bahwa mengisi key dengan nama yang sama akan menghapus key lama. (5) Jangan mengarang fungsi menu Device test atau Remote key info, dan jangan mengarang jenis key selain 8 jenis di atas. (6) Bila gagal atau layar berbeda dari panduan, minta FSE menyebut pesan yang tampil, lalu arahkan: "Hubungi Team Leader atau Technical Support".';
}


/* ===== CHECKLIST ANALISA AGENT NOT CONNECTED MONIMANAGER (referensi Clara) =====
   Sumber: dokumen internal "Checklist Analisa Agent Not Connected" (FLM langkah 1-2, SLM langkah 3-9). Untuk FSE / Teknisi. */
const MONI_TRIG=/\bmoni\s?manager\b|moni\s?manager\.ini|\bmoni\b.{0,30}\b(connect|konek|agent|offline|putus|disconnect|log)\b|\b(agent|agen)\b.{0,25}\b(not connected|tidak connect|tdk connect|belum connect|disconnect|offline|putus|tidak konek)\b|checklist analisa agent/i;
const MONI_GUIDE=`CHECKLIST ANALISA AGENT NOT CONNECTED MONIMANAGER (dokumen internal; gunakan sebagai sumber utama untuk mesin ATM yang agent Moni/MoniManager-nya Not Connected). Dokumen membagi dua tingkat: FIRST LINE MAINTENANCE (FLM) langkah 1-2 dan SECOND LINE MAINTENANCE (SLM) langkah 3-9. Setelah SETIAP langkah, cek status agent di MoniManager: bila Agent Connected maka agent berhasil connect kembali dan CASE CLOSE (berhenti); bila masih Not Connected lanjut ke langkah berikutnya.
FLM 1. RESTART MESIN. Restart mesin, lalu cek status agent di MoniManager. Connected: case close. Not Connected: lanjut langkah 2.
FLM 2. RESTART MODEM. Restart modem, lalu cek status agent di MoniManager. Connected: case close. Not Connected: lanjut eskalasi ke SLM.
SLM 3. TES KONEKSI KE SERVER MONIMANAGER (cek jalur komunikasi ke server Moni dan cek telnet Moni). Cek jaringan (jarkom) lewat CMD di Windows mesin, berurutan: (1) ipconfig (IP Config), (2) ping gateway, (3) ping -n 20 192.168.7.187, (4) tracert 192.168.7.187, (5) telnet 192.168.7.187 22005, (6) telnet 192.168.7.187 21001, (7) telnet 192.168.7.187 21031. Bila hasil cek jarkom Unreachable, RTO (request timed out), atau Connection Failed: hubungi provider dan ASM-ACS. Bila semua berhasil tetapi agent belum connect: lanjut langkah 4.
SLM 4. CEK KONFIGURASI AGENT MONIMANAGER. Pastikan isi file MoniManager.ini (lokasi C:\\Hyosung\\MoniManager\\MoniManager.ini) sesuai: (1) TerminalNo terisi dengan benar, (2) SerialNumber terisi dengan benar, (3) MANUFACTUR dan Model Mesin terisi dengan benar. Bila tidak sesuai: sesuaikan konfigurasi poin 1-3, lalu pastikan SAVE setelah perubahan. Bila sudah sesuai tetapi agent belum connect: lanjut langkah 5.
SLM 5. CEK TANGGAL DAN JAM DI SISI MESIN. Pastikan tanggal dan jam mesin sesuai aktual. Bila tidak sesuai: (1) sesuaikan tanggal/jam di sisi mesin dan kirimkan evidence ke BNI; (2) backup dan pindahkan EJ yang salah tanggal ke lokasi D:\\BackUp EJ Salah Tanggal; (3) pastikan EJ yang salah tanggal/jam sudah tidak ada di directory asli EJ; (4) bila setelah restart mesin tanggal/jam kembali tidak sesuai, lakukan penggantian baterai CMOS. Bila langkah di atas sudah dilakukan tetapi agent belum connect: lanjut langkah 6.
SLM 6. INDIKASI AGENT PROBLEM: reinstall agent menggunakan versi terbaru. Bila TIDAK berhasil install agent: koordinasi dengan masing-masing TS (Team Software). Bila berhasil install agent: konfirmasi ke Tim Monitoring SLM apakah agent sudah connect. Bila belum connect: langkah 7.
SLM 7. INDIKASI SOFTWARE MESIN PROBLEM: reinstall image/software mesin. Bila TIDAK berhasil install image/software: (1) koordinasi dengan masing-masing TS (Team Software); (2) bila belum connect lanjut langkah 8. Bila berhasil: (1) konfirmasi ke Tim Monitoring SLM apakah agent sudah connect; (2) bila belum connect lanjut langkah 8.
SLM 8. CEK CPU MESIN (indikasi CPU anomali): (1) lakukan testing memakai CPU mesin ATM yang agent-nya normal, atau lakukan testing motherboard CPU; (2) lakukan pengecekan langkah 3-7. Bila langkah di atas sudah dilakukan tetapi agent belum connect: lanjut langkah 9.
SLM 9. PENGECEKAN FINAL: pastikan grounding normal maksimal 0,5 V dan ambil log Moni. Kirimkan evidence berupa foto/file hasil pengecekan langkah 3-8 ke EDR terkait dan ASM-AIM.
ESKALASI AKHIR (PCO ASM): bila SEMUA langkah 1-9 sudah dilakukan dan agent tetap Not Connected, FSE melanjutkan ke TEAM LEADER, dan Team Leader menghubungi PCO ASM agar kasus dieskalasi langsung oleh pihak bank, berdasarkan kesepakatan kerja DGO tanggal 30 Agustus 2026. FSE tidak menghubungi PCO ASM sendiri; sertakan evidence hasil pengecekan langkah 3-9 saat melapor ke Team Leader.
ALUR RINGKAS: restart mesin > restart modem > cek jarkom ke server Moni (ping, tracert, telnet 22005/21001/21031) > cek MoniManager.ini (TerminalNo, SerialNumber, Manufactur/Model; save) > cek tanggal/jam mesin (dan pindahkan EJ salah tanggal; baterai CMOS bila jam kembali salah) > reinstall agent versi terbaru > reinstall image/software > cek CPU > cek grounding maks 0,5 V + ambil log Moni dan kirim evidence. Berhenti di langkah mana pun saat agent Connected. Bila semua langkah sudah dilakukan dan tetap Not Connected: lapor Team Leader untuk eskalasi ke PCO ASM (kesepakatan kerja DGO 30 Agustus 2026).`;
const MONI_INST_TRIG=/\b(install|instal|instalasi|reinstall|re-install)\w*\b.{0,50}\b(atm|crm|mesin)\b|\b(atm|crm|mesin)\b.{0,50}\b(install|instal|instalasi|reinstall)\w*\b|\b(install|instal|instalasi|reinstall)\w*\b.{0,40}\b(agent|image|moni\s?manager)\b/i;
const MONI_INST_GUIDE=`PANDUAN SETELAH INSTALL ULANG / INSTALL VERSI BARU AGENT MONIMANAGER PADA MESIN ATM/CRM BNI (sumber: dokumen instalasi Hyosung TNS; pengecekan setelah install ulang mesin atau install versi baru agent):
6. EDIT KONFIGURASI MoniManager.ini: (a) buka direktori C:\\Hyosung\\MoniManager. (b) buka file MoniManager.ini memakai Notepad. (c) cari section [MACHINEINFO] dan isi SerialNumber serta TerminalNo sesuai informasi mesin (gunakan HURUF KAPITAL). SerialNumber diisi dengan SN mesin; TerminalNo diisi dengan ID mesin. (d) Save/simpan perubahan file.
 Contoh isi file dari dokumen (CONTOH saja, jangan dipakai sebagai nilai mesin sebenarnya): [JNLAgent] SVR_IP=192.168.7.187, DR_SVR_IP=192.168.172.36; [MACHINEINFO] MANUFACTURER=Hitachi, Model=OMRON3, SerialNumber=205283, TerminalNo=S1ABDGR001.
7. Instalasi selesai.
8. SEBELUM RESTART MESIN, lakukan PENGECEKAN INSTALASI untuk memastikan agent terinstall dengan benar: (a) pastikan ada folder MoniManager pada direktori C:\\Hyosung. (b) pastikan ada registry berikut setelah instalasi selesai: Windows 7: HKLM\\SOFTWARE\\MONIMANAGER\\ ; Windows 10: HKLM\\SOFTWARE\\WOW6432Node\\MONIMANAGER\\ . (c) pastikan akses dari ATM ke server MoniManager sudah terbuka dengan telnet: telnet 192.168.7.187 22005, telnet 192.168.7.187 21001, telnet 192.168.7.187 21031.
9. Restart mesin.
10. Setelah mesin online, konfirmasi ke Monitoring BNI untuk cek status agent MoniManager.
RINGKAS: edit MoniManager.ini ([MACHINEINFO] SerialNumber=SN mesin, TerminalNo=ID mesin, huruf kapital, save) > cek folder C:\\Hyosung\\MoniManager > cek registry (Win7 HKLM\\SOFTWARE\\MONIMANAGER\\, Win10 HKLM\\SOFTWARE\\WOW6432Node\\MONIMANAGER\\) > telnet 22005/21001/21031 ke 192.168.7.187 > restart mesin > konfirmasi ke Monitoring BNI.`;
const MONI_INST_RULES='ATURAN MENJAWAB INSTALL ULANG MONIMANAGER: (1) Setiap kali FSE bertanya soal install ulang mesin ATM/CRM BNI atau install versi baru agent, ingatkan pengecekan MoniManager setelah install: isi MoniManager.ini, folder, registry sesuai Windows 7 atau 10 (tanyakan versi Windows bila belum disebut), telnet ke server, restart, lalu konfirmasi ke Monitoring BNI. (2) Nilai pada contoh isi file (Hitachi, OMRON3, 205283, S1ABDGR001) hanyalah contoh; SerialNumber dan TerminalNo harus diisi sesuai SN dan ID mesin yang sedang dikerjakan, huruf kapital. (3) Panduan ini khusus mesin BNI; bila mesin milik bank lain, katakan panduan ini belum tentu berlaku dan arahkan: "Hubungi Team Leader atau Technical Support". (4) Bila mesin NCR, ingatkan juga INIT JURNAL setelah install ulang sesuai panduan EJ. (5) Bila telnet gagal atau agent tetap Not Connected setelah install, lanjutkan ke checklist Agent Not Connected.';
function moniBlockText(text){
  const T=String(text||'');const a=MONI_TRIG.test(T),b=MONI_INST_TRIG.test(T);
  if(!a&&!b)return '';
  let o='';
  if(a)o+=MONI_GUIDE+'\n\n';
  if(b||(a&&/\b(install|instal|reinstall|versi baru)\w*/i.test(T)))o+=MONI_INST_GUIDE+'\n\n'+MONI_INST_RULES+'\n\n';
  if(a)o+='ATURAN MENJAWAB MONI NOT CONNECTED: (1) Pandu FSE bertahap seperti rekan senior: tanyakan dulu langkah mana yang sudah dilakukan dan hasilnya (restart mesin, restart modem, hasil ping/telnet, isi MoniManager.ini, tanggal/jam), lalu arahkan ke langkah berikutnya yang sesuai; jangan menumpahkan semua langkah sekaligus kecuali diminta. (2) Selalu ingatkan cek status agent di MoniManager setelah tiap langkah dan berhenti (case close) bila sudah Connected. (3) Sebutkan perintah CMD dan nilai persis seperti di panduan (192.168.7.187, port 22005/21001/21031, path MoniManager.ini, folder D:\\BackUp EJ Salah Tanggal); jangan mengarang IP, port, atau path lain. (4) Dokumen membagi FLM (langkah 1-2) dan SLM (langkah 3-9); sebutkan tingkat tiap langkah, dan bila FSE tidak yakin apakah langkah SLM boleh dikerjakan olehnya, arahkan: "Hubungi Team Leader atau Technical Support". (5) Untuk prosedur ini, pihak yang dihubungi mengikuti dokumen: provider dan ASM-ACS (jaringan gagal), TS = Team Software (gagal install agent/software), Tim Monitoring SLM (konfirmasi connect), BNI (evidence tanggal/jam), EDR terkait dan ASM-AIM (evidence akhir); PCO ASM dihubungi oleh Team Leader sebagai eskalasi akhir ke pihak bank bila semua langkah gagal (FSE tidak menghubungi PCO ASM langsung). Perhatikan "TS" di dokumen ini berarti Team Software, bukan Technical Support. (6) Jangan menyatakan penyebab pasti; sebutkan dugaan berdasarkan langkah yang gagal (jaringan, konfigurasi, jam, agent, software, CPU, grounding). (7) Ingatkan keselamatan listrik saat mengukur grounding atau membuka CPU, dan ingatkan backup sebelum memindahkan EJ atau reinstall.';
  return o;
}

const WC_TRIG=/(?=[\s\S]*\b(?:wincor|nixdorf|protopas|procash|ccopen|lynxpar|remote\s?peer|portnumber)\b)(?=[\s\S]*\b(?:install|instal|reinstall|ghost|ghosting|image|setelah|parameter|setting|denom\w*|remote\s?peer|portnumber|master\s?key)\b)|\b(?:ghost\w*)\b[\s\S]{0,40}\bwincor\b|\bwincor\b[\s\S]{0,40}\bghost\w*/i;
const WC_GUIDE=`PANDUAN WINCOR NIXDORF SETELAH INSTALL / GHOST ATM (sumber: dokumen internal; urutan kerja untuk FSE/teknisi)
Urutan: 1 Setting TCP/IP > 2 Remote Port & Remote Peer > 3 Test PING > 4 Parameter Denominasi > 5 Master Key (mode Supervisor).
Jangan lanjut ke langkah berikutnya sebelum langkah sebelumnya OK, terutama jangan isi denominasi/master key sebelum komunikasi (PING) OK.

LANGKAH 1 - SETTING PARAMETER TCP/IP (Network Connection > Internet Protocol (TCP/IP) > Properties > Use the following IP address)
- IP Address: biasa disebut IP Lokal atau IP ATM (diisi sesuai data IP mesin dari jaringan/provider; Clara tidak boleh mengarang IP).
- Subnet Mask:
  . ATM terkoneksi langsung ke Router: 255.255.255.224
  . ATM terkoneksi dengan VSAT CSM: 255.255.255.248
  . ATM terkoneksi dengan VSAT Tangara / Lintas Arta: 255.240.0.0
- Default Gateway:
  . ATM ke Router: digit terakhir 190
  . ATM ke VSAT CSM / Tangara: digit terakhir = digit terakhir IP Address dikurangi 1
  . ATM ke VSAT Lintas Arta: IP address 161.161.14... (di dokumen angkanya terpotong; minta FSE mengecek lengkapnya ke Team Leader/Technical Support, jangan menebak)
- Contoh di dokumen (hanya CONTOH, bukan nilai mesin): IP 10.172.40.162, Subnet 255.255.255.224, Gateway 10.172.40.190.

LANGKAH 2 - SETTING REMOTE PORT DAN IP HOST / IP REMOTE / IP SERVER (disebut Remote Peer)
Buka Regedit > HKEY_LOCAL_MACHINE > SOFTWARE > WINCOR NIXDORF > PROTOPAS > CURRENT VERSION > CCOPEN > COMMUNICATION > TCPIP. Isi PORTNUMBER dan REMOTEPEER.
Contoh di dokumen (hanya CONTOH): PORTNUMBER 1119, REMOTEPEER 46.20.10.1. Nilai sebenarnya mengikuti data host bank/mesin; jangan dikarang.

LANGKAH 3 - TEST PING (setelah parameter komunikasi diisi)
Buka CMD: ipconfig (cek IP, subnet, gateway), tracert ke gateway/host, dan ping ke gateway/host (di dokumen: ping <IP> -t, contoh 192.168.1.1). Reply harus muncul tanpa Request timed out. Kalau gagal: cek ulang IP/subnet/gateway, kabel/modem/router/VSAT, lalu hubungi provider atau Team Leader.

LANGKAH 4 - SETTING PARAMETER DENOMINASI (hanya jika komunikasi sudah OK)
Regedit > HKEY_LOCAL_MACHINE > SOFTWARE > WINCOR NIXDORF > PROTOPAS > CURRENT VERSION > LYNXPAR > CASH_DISPENSER. Isi VALUE_1 sampai VALUE_4 dengan denominasi tiap kaset. Contoh di dokumen: 100000 (hanya contoh; isi sesuai pecahan yang benar-benar dipasang di kaset).

LANGKAH 5 - INPUT MASTER KEY (jika denominasi sudah OK) lewat mode Supervisor
Masuk menu EPP, lalu pilih Master Key 32 (untuk Single DES) atau Master Key 64 (untuk Triple DES). Pilih sesuai tipe enkripsi mesin/bank; jika tidak tahu, tanya Team Leader. Bagian master key tidak boleh dikirim lewat chat atau foto.
`;
const WC_RULES='ATURAN MENJAWAB WINCOR SETELAH INSTALL/GHOST: (1) Jawab berurutan sesuai langkah, singkat, bahasa FSE. (2) Semua angka contoh di dokumen (IP 10.172.40.x, 1119, 46.20.10.1, 100000, 192.168.1.1) hanyalah contoh, jangan dipakai sebagai nilai mesin. (3) Dokumen ini berisi pengaturan jaringan, remote peer, denominasi, master key; proses ghost/restore image itu sendiri dan langkah lain tidak ada di dokumen, jadi jangan mengarang; katakan belum ada panduannya dan arahkan ke Team Leader atau Technical Support. (4) Jangan sebut isi key part. (5) Jika PING gagal, jangan lanjut ke denominasi; tuntun troubleshooting jaringan. (6) Ingatkan backup/catat setting lama sebelum mengubah registry.';
function wcBlockText(text){
  const T=String(text||'');
  if(!WC_TRIG.test(T)||(typeof MDR_TRIG!=='undefined'&&MDR_TRIG.test(T)))return '';
  return WC_GUIDE+'\n'+WC_RULES;
}

const MDR_TRIG=/\b(mandiri|multi\s?-?vendor|mv\s?mode|set\s?mvmode|merah\s?putih|nvigil|sam\s?token|tsop|checkrmmconnection|rmm\s?agent|rmm\s?server|advance\s?ndc|aptra)\b/i;
const MDR_GUIDE=`PANDUAN ATM MULTIVENDOR (MV) BANK MANDIRI - mesin Wincor/Diebold dengan image Multivendor (sumber: Mandiri ATM Multivendor Deployment Guideline v1.6, dokumen rahasia Bank Mandiri). Software MV memakai menu Supervisor bergaya NCR APTRA Advance NDC, jadi menu dan nomor fungsinya berbeda dari ProTopas biasa. Untuk Wincor yang dibahas, ikuti bagian Wincor; bagian Diebold hanya jika mesinnya Diebold.
Urutan kerja: A Backup image lama > B Deploy image MV > C Cek koneksi RMM > D (jika perlu) Ganti MV mode.

A. BACKUP SEBELUM MENIMPA IMAGE (wajib, kerjakan semua dulu)
1. Masuk menu TSOP (Wincor): masukkan password 2580.
2. Backup EJ: pilih 60 ENHANCED MENU > 03 EXPORT EJ TO USB. (Diebold: 4 Replenish > 99 MORE > 40 INIT EJRNL.)
3. Backup counter: 04 REPLENISH > 04 PRINT CNTRS (Wincor); 4 REPLENISH > 4 PRNT CNTRS (Diebold). Simpan hasil cetak: sisa lembar kaset dipakai lagi di langkah B6.
4. Diebold saja: catat IP dan port lokal+host: 5 Configure > 99 MORE > 37 TCP/IP CONFIG > 7 PRINT TCP/IP. (Untuk Wincor, catat IP/port host dan lokal dari menu 37 TCPIP CONFIG sebelum ditimpa.)
5. Backup arsip EJ: Wincor: colok keyboard, Ctrl+Esc membuka Start Menu, buka Windows Explorer, copy C:\\JOURNAL ke D:\\. Diebold: colok keyboard, menu 95 MISC FUNCS 2 > 10 RESET MACHINE, login user abcdwxyz, copy folder c:\\Program Files\\Diebold\\Agilis Empower\\Journal\\Archive.
6. Backup image lama memakai Symantec Ghost: pastikan partisi sistem berdrive C:. Menu Local > Partition > To Image, pilih drive sumber, pilih lokasi simpan dan nama file, Save.

B. DEPLOY IMAGE MULTIVENDOR
1. Apply image baru (Symantec Ghost): Local > Partition > From Image, pilih file image MV, pilih partisi tujuan (pastikan drive C:), OK. (Menimpa image lama: pastikan Bagian A sudah selesai.)
2. SAM Token: Supervisor > 70 PREPAID > 1 UPDATE SAM TOKEN > masukkan 16 digit SAM Token.
3. Master key: Supervisor > 6 ACCESS > 25 KEY ENTRY > 0 ENTER KEY A > input 1 untuk komponen 1 > masukkan 32 digit master key part 1; ulangi untuk key A part 2. Key tidak boleh dikirim lewat chat atau foto.
4. Note types / denominasi:
   - Wincor dan Diebold: Supervisor > 5 CONFIGURE > 99 MORE > 47 EXTENDED ADD CASH > 6 UPDATE NOTE TYPES. Masukkan cassette type 1, Enter (tidak perlu isi) untuk currency IDR, isi nilai denominasi (20000, 50000 atau 100000), Enter untuk kolom CUID/lainnya tanpa isian.
   - Jika kolom CUID di note types terisi tidak sengaja: Supervisor > 4 REPLENISH > 7 CLR CUID. Jika 7 CLR CUID tidak berfungsi, hapus manual di registry HKEY_LOCAL_MACHINE\\SOFTWARE\\NCR\\Advance NDC\\Currency Table\\NDCType 1\\UnitID: kosongkan VALUE UnitID saja, JANGAN hapus key UnitID.
   - Diebold saja: login user abcdwxyz. Tombol kaset per denominasi: 20.000 = Cassette ID D (default LB & SB: D0, D1, H2); 50.000 = Cassette ID E (MP, D2, H2); 100.000 = Cassette ID F (D0, D2, H2). Kaset sudah terpasang di dispenser sebelum perubahan. Buka ACU: Start > Programs > Diebold > Agilis Configuration Utility > ACU > XFS 4.0 > Devices > Dispenser Advanced Function > Service Provider. Aktifkan HANYA 1 denominasi; denominasi lain harus tidak aktif (Cash Unit Name kosong, Currency ID tidak diubah, Type = WFS_CDM_TYPENA, Value = 0). Klik Save kiri atas, keluar ACU, restart Windows.
5. Configure cash unit / kaset (HANYA Wincor; Diebold lompat ke langkah 6): Supervisor > 5 CONFIGURE > 99 MORE > 47 EXTENDED ADD CASH > 1 CONFIGURE CASH UNITS. Semua kaset harus punya currency, value, cash unit ID (CUID) dan type yang sama/benar. Konfigurasi per kaset: input 1 untuk TOP, 2 untuk 2ND, 3 untuk 3RD, 4 untuk 4TH. Tiap kaset: Enter jika currency sudah IDR; Enter jika value sudah benar (jika salah, isi denominasi yang benar); lalu pilih tipe: 1 (14000) untuk 20000, 2 (15000) untuk 50000, 3 (16000) untuk 100000. Ulangi sampai keempat kaset selesai, lalu cek tabel akhir: semua kaset currency, value, CUID dan type sudah benar.
6. Cash counter dan test cash: Supervisor > 4 REPLENISH > 5 CLR CASH > 8 ADD CASH > cassette type 1 > masukkan sisa lembar dari counter lama (hasil PRINT CNTRS di A3) > 10 TEST CASH untuk uji.
7. Machine Number: Supervisor > 5 CONFIGURE > 99 MORE > 99 MORE > 91 ALPHANUMERIC MACHINE NUMBER > masukkan 6 digit terakhir Terminal ID > Enter > Cancel untuk kembali ke menu.
8. TCP/IP lokal dan host: Supervisor > 5 CONFIGURE > 99 MORE > 37 TCPIP CONFIG. Isi: 0 RMT ADDRESS (IP host), 1 RMT PORT NO (port host), 2 LCL ADDRESS (IP lokal/terminal), 3 LCL PORT NO (port lokal), 9 GATEWAY, 10 SUBNET MASK, 13 COMP NAME (isi Terminal ID, contoh S1AWA016). Setelah semua, keluar dari Supervisor. Mesin akan restart setelah konfigurasi TCP/IP diubah. Nilai IP/port diambil dari data mesin atau hasil backup di Bagian A, jangan mengarang.
9. Kamera NVigil 1 dan 2: Supervisor > 4 REPLENISH > 99 MORE > 92 SET CAMERA: pilih device untuk camera 1, OK; pilih device untuk camera 2, OK. Lalu 93 SAVE CAMERA, lalu 94 INIT DUAL CAM (NVigil mengaktifkan ulang kedua kamera, tidak muncul lagi jendela pilih device). Uji: 90 CAMERA 1 > tekan 2 CAMERA CONSOLE (jika koneksi bagus tampil preview kamera), Cancel untuk tutup; ulangi 91 CAMERA 2 > 2 CAMERA CONSOLE.
   - Jika path hasil foto atau ID lokasi kamera perlu diubah: login abcdwxyz, Windows Explorer. Ubah path foto: file N2.ini di c:\\Program Files\\NCR APTRA\\Advance NDC\\webcam, item DestPath di bagian [FileName]. Ubah Machine Number/ATM ID pada hasil foto: file MachineNo.txt di folder yang sama. Lakukan hal sama untuk kamera 2 di c:\\Program Files\\NCR APTRA\\Advance NDC\\webcam2 (N2.ini).
Setelah semua selesai terminal siap.

C. CEK KONEKSI KE RMM SERVER
Login Windows (username/password), buka Windows Explorer drive C:, jalankan CheckRMMConnection.exe. File hasil: RMMAgentConnection.txt. Buka file; jika ping mendapat reply dari server dan port terbuka (open), koneksi ke RMM server berhasil. Jika ping tidak reply atau port tidak open, cek jaringan (IP, gateway, subnet, kabel/modem), lalu eskalasi ke Team Leader/Technical Support.

D. GANTI MV MODE (dari menu Supervisor)
Supervisor > 71 SET MVMODE: 1 = GUI, 2 = reguler text, 3 = Merah Putih text. Mesin restart otomatis. Setelah restart selesai mesin berstatus Out of Service; host harus mengirim download (config) sesuai mode: Merah Putih -> config Merah Putih; Text Reguler atau GUI -> config Mandiri reguler. Jadi mesin Out of Service setelah ganti MV mode itu normal sampai download config dari host diterima; jika tidak kunjung download, cek komunikasi host dan minta tim host/bank mengirim download.

PETUNJUK PENANGANAN MASALAH (hanya berdasarkan dokumen):
- Denominasi/kaset salah, tidak sama, atau kolom CUID terisi: ulangi UPDATE NOTE TYPES; bersihkan CUID lewat 7 CLR CUID; jika gagal, kosongkan Value UnitID di registry (jangan hapus key-nya); lalu ulangi CONFIGURE CASH UNITS sampai semua kaset sama.
- Hitungan lembar tidak sesuai: CLR CASH lalu ADD CASH lagi memakai sisa dari PRINT CNTRS, kemudian TEST CASH.
- Mesin tidak terhubung ke host setelah install: cek ulang menu 37 TCPIP CONFIG (remote/lokal IP, port, gateway, subnet, comp name) dan pastikan mesin sudah restart; lalu cek RMM.
- Kamera tidak ada preview: ulangi 92 SET CAMERA > 93 SAVE > 94 INIT DUAL CAM, cek CAMERA CONSOLE; cek path N2.ini dan MachineNo.txt.
- Mesin Out of Service setelah ganti MV mode: tunggu download config dari host sesuai mode.`;
const MDR_RULES='ATURAN MENJAWAB MV MANDIRI: (1) Tanyakan tipe mesin (Wincor atau Diebold) dan tahap (backup, deploy, cek RMM, ganti MV mode) jika belum jelas; jangan tumpahkan seluruh panduan, beri langkah sesuai tahap, berurutan dan singkat. (2) Jangan lompat ke deploy sebelum backup EJ, counter, dan image lama selesai. (3) Contoh nilai (Terminal ID S1AWA016, denominasi 20000/50000/100000) hanyalah contoh; IP, port, SAM Token, dan master key diambil dari data resmi, jangan dikarang atau dikirim lewat chat. (4) Dokumen tidak berisi daftar kode error atau akar masalah selain yang tertulis; untuk masalah di luar itu katakan belum ada panduannya dan arahkan ke Team Leader atau Technical Support. (5) Panduan ini khusus MV Mandiri (menu Supervisor NCR-style); untuk mesin Wincor ProTopas biasa pakai panduan ProTopas. (6) Ingatkan backup sebelum menimpa image dan ingatkan keselamatan listrik saat membuka perangkat.';
function mdrBlockText(text){
  const T=String(text||'');
  if(!MDR_TRIG.test(T))return '';
  if(typeof DN_TRIG!=='undefined'&&DN_TRIG.test(T)&&!/mandiri|multi\s?-?vendor/i.test(T))return '';
  return MDR_GUIDE+'\n'+MDR_RULES;
}

const DN_TRIG=/\b(dn\s?-?200\w*|dn\s?-?series|dn\s?-?100\w*|rm4v?|bnr|move\s?-?m|iot_?aps\w*|mts\s?=?\s?not_?calibrated|calibration\s?note|ps\s?dirt\s?level)\b|\b(?:tape\s?sensor|kalibrasi\s?tape)\b|\b(?:rm4|dn\s?-?\d+|bnr)\b[\s\S]{0,60}\b(?:photo|foto)\s?sensor|\b(?:photo|foto)\s?sensor\b[\s\S]{0,60}\b(?:rm4|dn\s?-?\d+|bnr)\b|\bpm\b[\s\S]{0,30}\b(rm4|dn\s?-?\d+)|\b(rm4|dn\s?-?\d+)\b[\s\S]{0,30}\bpm\b|t\/?sop[\s\S]{0,40}\b(calibrat\w*|kalibrasi|recycler)\b/i;
const DN_GUIDE=`PANDUAN DIEBOLD NIXDORF DN200 / RM4V (recycler) - sumber: modul Technical Support DN-JKT-ID (Kalibrasi Tape Sensor via T/SOP, Kalibrasi IOT_APS via HW Tree, Panduan PM RM4V). Gambar contoh diambil pada DN200V FrontLoad. Ini panduan hardware recycler RM4 (kepala/head dan safe); mesin harus dimatikan (power off) saat membersihkan roller/gear dan membuka modul.

1. KALIBRASI TAPE SENSOR (BNR) LEWAT T/SOP
Kapan dilakukan: (1) saat periode PM, (2) BNR malfunction: High Reject, Refuse dan Unfit rate tinggi, (3) HW Error, (4) setelah penggantian part BNR: Tape sensor, HCT, HMT, BNR Controller. Gejala jika tape sensor benar-benar belum terkalibrasi: T/SOP menampilkan BIM errors: MTS=NOT_CALIBRATED. Setelah kalibrasi selesai, lanjutkan dengan Function Check.
Kertas kalibrasi: PN 01750211741, "Calibration note tape sensor MOVE", ukuran 190 x 90 mm. Kertas JANGAN DIPOTONG. Jika kertas tidak masuk sempurna ke Tray atau kurang lebar, kalibrasi bisa gagal; pastikan spacer dan pembatas sudah benar-benar lepas dari IO. Ukuran harus tepat 190x90 mm.
Langkah:
a. Start T/SOP > Device > Recycler.
b. Tarik HEAD UNIT keluar.
c. SEBELUM melepas margin spacer pada IO module, catat posisi spacer terpasang (di contoh: position 3), supaya dikembalikan ke posisi yang sama setelah kalibrasi.
d. Putar Output Tray ke arah atas: gunakan gear wheel hitam sebelah kanan, putar ke bawah dengan tangan.
e. Setelah bagian bawah tray terlihat, locking PIN (panah hijau) tampak; dorong locking spacer dengan obeng kecil atau benda kecil agar lepas dari pengunci. Tarik spacer ke atas/keluar. Ulangi langkah yang sama untuk bagian kiri.
f. Untuk akses IO Collector: Tarik IO (unlock) dari middle transport. Buka flap belakang modul collector unit; cek posisi pembatas dan nanti kembalikan setelah kalibrasi selesai. Lepaskan pembatas kiri kanan IO Collecting unit.
g. Tutup flap, dorong kembali IO unit sampai working position. Dorong bagian head unit dan tunggu sampai RM4 melakukan RESET.
h. Start T/SOP: Devices > Recycler > Test Functions > Banknote Reader Test. Scroll ke bawah, baca instruksi Calibrate Tape Sensor. Pastikan calibration note PN 01750211741 sudah siap. Pilih Calibrate Tape Sensor.
i. Pilih 01 Start. Shutter terbuka; masukkan calibration note. Pastikan note masuk dengan benar dan berada pada posisi tengah IO. Setelah semua sensor dalam Tray tertutup (sekitar 3 detik) shutter akan close.
j. Calibration note akan di-dispense dan input tray, lalu kembali ke collector unit dan siap dikeluarkan kembali ke Tray. Saat shutter terbuka, ambil kembali kertas tersebut.
k. Jika proses berhasil dan hasil bagus (tampil Result calibrated), pasang kembali spacer/part pada input tray dan collector di posisi yang SAMA seperti sebelum dilepas. Jika hasil belum benar, ulangi kalibrasi tape sensor lewat T/SOP (menu hasil: 01 Again untuk mengulang; opsi 02 untuk menyimpan sesuai layar).
l. Lanjutkan dengan Function Check.
CHECKLIST LAPANGAN: (1) siapkan calibration note PN 01750211741 190x90 mm yang rata, tidak kusut dan tidak dipotong; (2) foto/catat posisi spacer sebelum dilepas; (3) spacer kiri-kanan input tray dan pembatas IO collector sudah lepas semua; (4) head unit didorong masuk dan RM4 selesai RESET sebelum masuk T/SOP; (5) note berada di tengah IO, tunggu sekitar 3 detik hingga shutter menutup; (6) ambil kembali note saat shutter terbuka; (7) hasil "tape sensor is calibrated" lalu pasang spacer di posisi semula; (8) Function Check. Jika note tidak masuk sempurna: JANGAN potong kertas, cek ulang spacer/pembatas sudah benar-benar lepas.

2. KALIBRASI IOT_APS SENSOR LEWAT HW TREE
Di T/SOP: Start > Devices > Recycler > Hardware Tree > rm4System > head > ioUnit [IOU] > tray [IOT] > sensors [IOT_APS2] dan sensor IOT_APS1. Klik sensor > 01 Select > 02 Active Methods > 01 calibrate. Hasil harus "Function successful". Lakukan untuk SETIAP sensor IOT_APS: sensor0 [IOT_APS1], sensor1 [IOT_APS2a], sensor2 [IOT_APS2b], sensor3 [IOT_APS2c]. Active Methods lain di layar (developerFunction, getDirtLevelInternal, off, on, setSenderCurrent, setThresholds) hanya dilihat, jangan diubah tanpa arahan Technical Support.

3. PREVENTIVE MAINTENANCE (PM) RM4V
Interval: saat kunjungan service (jika memungkinkan) atau minimal setiap 500.000 move media, tergantung environment, kualitas uang atau kesepakatan; jika lingkungan kritis atau uang kualitas jelek, PM lebih sering.
Alur PM: START > Power off > Print counter > Observe (environment, vandalism, dll) > Preventive maintenance > Testing transaction > Test function > Print counter > END. Cek lingkungan dan tanda vandalisme dulu.
Aturan cairan: dilarang menyemprotkan cairan pembersih langsung ke modul. Basahi kain dengan cairan yang disarankan.
- Roller: bersihkan dengan kain lembap digerakkan diagonal melintasi roller; jika roller di poros, tekan kain lembap pada roller sambil memutar poros (RM4 harus off).
- Sensor dan prisma: bersihkan dengan benda KERING (kain bersih, sikat, kapas/cotton bud, atau blower/air duster).
- Dirty level photo sensor: T/SOP Start > Devices > Recycler > Detailed Information > PS Dirt Level. Level Out Of Service berarti PS kemungkinan sudah not operable. Saat call maintenance (korektif) cukup bersihkan sensor yang kotor saja.
- Cek riwayat masalah: T/SOP Start > Devices > Recycler > Logbook (error terakhir yang sering muncul).
Head module:
 . Cek setting margin setters IOT dan IOC; cek dan kosongkan green foreign object tray di IOT.
 . In-Output Module Customer Tray: lepas IO module dari head module RM4V, bersihkan area di bawah IO module, photo sensor, penutup dan prismanya (dry cloth, cotton bud, brush).
 . In-Output Module Customer Collector: naikkan collector plate dengan memutar gearwheel; bersihkan semua photo sensors (brush, air duster).
 . HUT (Head Upper Transport): buka, bersihkan semua photo sensor yang ditandai, cek permukaan dari bercak kotor, periksa roller HUT bergerak bebas. Roller kotor dibersihkan hati-hati, jangan pakai sembarang cairan.
 . Head Chassis Transport, Head Middle Transport, MOVE-M: cek dan bersihkan money guides pelan-pelan dengan kain kering; HATI-HATI jangan menyentuh lensa kamera dengan kain lembap. Bersihkan transport rollers (1 dan 4), tape sensing rollers (2, pakai kain yang berbeda), magnet sensor (3, kain kering jika kotor), camera glasses (5) dengan screen cleaner (jangan merusak bagian pegas 6). Memutar gear wheels memudahkan pembersihan roller (RM4 harus OFF).
 . BNR Controller: bersihkan lewat ventilation slots dengan vacuum cleaner. Jika temperature high/critical: lepas cover BNR controller, cek konektor terpasang benar, cek fan, heat sink dan PCB, bersihkan debu. Cek temperatur di T/SOP Start > Devices > Recycler > Detailed Information > BVM > Boards; harus "normal". Jika "critical" atau "high", cooling kemungkinan tidak bekerja baik.
 . Head compartment: buka cover, bersihkan/vacuum, bersihkan prisma dengan cotton bud.
 . Escrow: lepas ESCROW, bersihkan sensors dan prisma yang ditandai; lepas cover ESCROW dan bersihkan sensor/prisma ditandai. JANGAN gunakan air duster untuk membersihkan ESCROW.
 . HLT (Head Lower Transport): cek dan bersihkan roller, pastikan bergerak bebas.
 . CTU (Chest Transport Unit) / HST (Head Safe Transport): pastikan small rollers pada Transfer Unit lengkap, tidak rusak, dan berputar halus; pastikan 18 guide fingers semua OK.
 . Shutter: cek dan bersihkan photosensor; kabel tidak terjepit dan konektor terpasang baik.
Safe module:
 . CHT (Chest Horizontal Transport) Loopback Transport: vacuum sebaik mungkin bagian atas dan bawah CHT dan CHL; buka Loopback Transport; bersihkan prisma dan photo sensor CHT_APS_GATEx (posisi aktual sensor ada di CHL).
 . CHL (Chest Horizontal Lower) Transport: bersihkan photosensor CHT_APS_GATEx dan CHLx_APS_ENTRY_EXIT dengan brush, cotton bud atau air duster; prisma CHT_APS_GATEx dengan cotton bud.
Kalibrasi setelah pembersihan: untuk SEMUA photo sensor yang selesai dibersihkan, WAJIB kalibrasi manual: T/SOP Start > Devices > Recycler > Test Functions > Calibrate Sensors > New Calibration. Untuk Banknote Reader, lakukan Function Check.
Checklist Head (Preventive): clean tape sensor dan calibrate tape sensor (MOVEm); clean magnet sensor; clean camera glasses (juga saat on call); MOVE reader function check; clean fan dan PCB BVM controller jika kotor; ESC_APS1, ESC_APS4; SHUTTER_APS1-4.
Checklist Safe: cek sensor dirt level di T/SOP (on call dan preventive: hanya sensor kotor yang dibersihkan); HLT inspect rollers bergerak bebas; CTU/HST inspect rollers; CHT remove dust dengan vacuum dan bersihkan prisma HT_APS_GATEx; CHL clean photosensors CHT_APS_GATEx dan CHLx_APS_ENTRY_EXIT.`;
const DN_RULES='ATURAN MENJAWAB DN200/RM4V: (1) Tanyakan tujuan jika belum jelas (kalibrasi tape sensor, kalibrasi IOT_APS, atau PM) dan beri langkah berurutan singkat sesuai tujuan; jangan tumpahkan seluruh panduan. (2) Selalu ingatkan: power off sebelum membersihkan roller/gear dan membuka modul, cetak counter sebelum dan sesudah PM, catat posisi spacer sebelum dilepas, jangan memotong calibration note 190x90 mm, jangan semprot cairan langsung ke modul, jangan pakai air duster di Escrow, jangan sentuh lensa kamera dengan kain lembap. (3) Setelah membersihkan photo sensor wajib kalibrasi sensor (New Calibration); setelah kalibrasi tape sensor lanjut Function Check. (4) Dokumen ini hanya berisi kalibrasi, PM dan checklist; kode error dan akar masalah lain tidak ada di dokumen, jadi jangan mengarang; arahkan ke database error code atau Team Leader/Technical Support. (5) Jangan mengubah Active Methods selain calibrate tanpa arahan TS. (6) Sebut bahwa gambar contoh dari DN200V FrontLoad; posisi bisa berbeda di tipe lain.';
function dnBlockText(text){
  const T=String(text||'');
  if(!DN_TRIG.test(T))return '';
  return DN_GUIDE+'\n'+DN_RULES;
}

const NCRKEY_TRIG=/(?=[\s\S]*\b(?:ncr|aptra|advance\s?ndc)\b)(?=[\s\S]*(?:master\s?-?key|masterkey|key\s?entry|enter\s?key|check\s?digit|kunci\s?master|input\s?key|\bkvv\b))|\b(?:change\s?key\s?entry\s?mode|enter\s?key\s?[ab]|confirm\s?new\s?mode|save\s?key\s?entry)\b/i;
const NCRKEY_GUIDE=`PANDUAN INPUT MASTER KEY ATM NCR (menu Supervisor APTRA Advance NDC) - urutan untuk FSE/teknisi. Catatan sumber: langkah ini dari ringkasan prosedur umum (bukan manual resmi NCR); untuk mesin bank tertentu ikuti prosedur bank/provider bila berbeda.
Siapkan dulu: komponen master key dari amplop kunci (Component 1 dan seterusnya, tiap bagian biasanya 32 digit) dan nilai Check Digit referensi dari amplop/berita acara. Key tidak boleh dikirim lewat chat atau foto.
1. Masuk Supervisor, pilih 6) ACCESS.
2. Pilih 25) KEY ENTRY.
3. Jika mode enkripsi perlu disesuaikan: pilih 9) CHANGE KEY ENTRY MODE. Pilih mode yang sesuai ketentuan bank/key; contoh di prosedur: 3) Double Length With XOR (Triple DES). Lalu pilih 6) CONFIRM NEW MODE untuk menyimpan mode baru. (Jika mode sudah benar, lompati langkah ini.)
4. Pilih 0) ENTER KEY A untuk memasukkan Master Key bagian A (biasanya 32 digit).
5. Masukkan Component 1 / Master Key A sesuai data dari amplop kunci.
6. Periksa nilai Check Digit yang muncul di layar dan cocokkan dengan data referensi. Jika tidak cocok, jangan lanjut: ulangi input komponen itu dan periksa kembali digit yang diketik.
7. Lanjutkan memasukkan komponen berikutnya (Component 2 dan seterusnya sesuai amplop) dan Master Key B melalui menu yang sesuai di layar; cocokkan Check Digit tiap bagian.
8. Setelah semua selesai, kembali ke menu ACCESS dan pilih SAVE KEY ENTRY agar konfigurasi kunci tersimpan ke EPP (Encrypting PinPad).
Sebagai pembanding, di mesin multivendor Mandiri urutannya sama: 6 ACCESS > 25 KEY ENTRY > 0 ENTER KEY A > input 1 untuk komponen 1 > 32 digit > ulangi untuk komponen 2.`;
const NCRKEY_RULES='ATURAN MENJAWAB MASTER KEY NCR: (1) Pandu satu tahap per jawaban dengan nama menu persis; tanyakan dulu posisi FSE sekarang dan apakah mode enkripsi sudah benar. (2) Nomor menu yang tertulis saja yang boleh disebut: 6 ACCESS, 25 KEY ENTRY, 9 CHANGE KEY ENTRY MODE, 6 CONFIRM NEW MODE, 0 ENTER KEY A. Nomor menu untuk Enter Key B dan Save Key Entry tidak ada di panduan, jangan dikarang; sebut nama menunya saja, pilih sesuai yang tampil di layar. (3) Mode enkripsi (mis. Double Length With XOR) mengikuti ketentuan bank/key; jika FSE tidak tahu, tanya Team Leader. (4) Check Digit wajib cocok sebelum lanjut. (5) Jangan menyebut isi key; ingatkan key part tidak dikirim lewat chat atau foto. (6) Untuk mesin Hyosung (EPP) pakai panduan EPP Hyosung, untuk Wincor ProTopas pakai panduan ProTopas.';
function ncrkeyBlockText(text){
  const T=String(text||'');
  if(!NCRKEY_TRIG.test(T))return '';
  return NCRKEY_GUIDE+'\n'+NCRKEY_RULES;
}

