# PortalCitiusTechnicalSupport
Portal Citius Web App
CARA MENCOBA
- Klik dua kali index.html (jalan dari komputer), atau jalankan server lokal:
  python -m http.server 8000  lalu buka http://localhost:8000/
- Login memakai Firebase. Bila dibuka dari domain baru, tambahkan domain itu di
  Firebase Console > Authentication > Settings > Authorized domains.
- Ikon aplikasi (manifest) baru bisa dipasang ke layar HP bila dibuka lewat HTTPS.

STRUKTUR
index.html            tampilan (HTML) saja, memanggil file lain
manifest.webmanifest  nama dan ikon aplikasi
css/style.css         gaya utama;  css/overrides.css = penyesuaian tambahan
js/                   logika: core, app-main, admin, clara-chat, dashboard-live,
                      hw-brm860, hw-brm50, ej-reader, alarm-cs3, ui-shell
data/db-core.js       wadah DB (harus dimuat pertama)
data/db-<modul>.js    database error code per modul:
                      brm860 (24.111), brm50 (19.524), extra (1.481),
                      cdu10 (910), cdu30 (160), cdu800 (667)
data/app-*.js         aplikasi pembaca NCR dan Wincor yang tertanam
data/*-images.js      daftar gambar referensi dan posisi komponen
assets/img            logo (login, header) dan avatar Clara
assets/icons          favicon, apple-touch-icon, ikon 192/512 dan maskable
assets/ref, assets/hw gambar referensi dan posisi komponen BRM860/BRM50

MEMPERBARUI DATABASE
Ganti hanya file data/db-<modul>.js (format: DB.<modul>=[...];). Urutan pemuatan
di index.html tidak perlu diubah.

CATATAN KEAMANAN
js/admin.js masih memuat konstanta ADMIN_PASS lama (fallback, tidak dipakai lagi
karena login lewat Firebase Auth). Sebaiknya dihapus sebelum dipublikasikan.
