# Instruksi Restart Project

## Status Server Saat Ini
✅ Terdeteksi 3 proses Node.js sedang berjalan

## Cara Restart Project

### Opsi 1: Restart Manual (Disarankan)

#### Langkah 1: Stop Server yang Sedang Berjalan
1. Buka terminal/command prompt yang menjalankan server
2. Tekan `Ctrl + C` untuk menghentikan server
3. Atau tutup terminal tersebut

#### Langkah 2: Restart Backend Server
Buka terminal baru dan jalankan:
```powershell
cd backend
npm start
```

#### Langkah 3: Restart Frontend Server
Buka terminal baru lagi dan jalankan:
```powershell
cd frontend
npm start
```

### Opsi 2: Menggunakan Concurrently (Dari Root Directory)

Setelah stop server yang sedang berjalan, jalankan:
```powershell
npm start
```

Ini akan menjalankan backend dan frontend secara bersamaan.

### Opsi 3: Stop Semua Proses Node.js (Jika Perlu)

Jika server tidak berhenti dengan `Ctrl + C`, jalankan:
```powershell
# Stop semua proses Node.js
Get-Process -Name node | Stop-Process -Force
```

Kemudian restart dengan salah satu opsi di atas.

## Perubahan yang Akan Terintegrasi Setelah Restart

### ✅ Format Currency
- Semua beban ditampilkan dengan format Rupiah yang benar
- Menggunakan separator titik (contoh: "Rp 5.000.000")
- Nilai 0 ditampilkan sebagai "Rp 0"

### ✅ Filter Status
- Filter status berfungsi dengan benar di semua halaman
- Mapping status sesuai dengan database

### ✅ Admin Reject Proposal
- Admin dapat menolak proposal dengan alasan
- Alasan penolakan ditampilkan ke user
- Notifikasi otomatis ke user

### ✅ Error Handling
- Validasi user edit yang lebih baik
- Error handling yang lebih robust

## Verifikasi Setelah Restart

Setelah restart, pastikan:
1. ✅ Backend server berjalan di `http://localhost:5000`
2. ✅ Frontend server berjalan di `http://localhost:3000`
3. ✅ Tidak ada error di console
4. ✅ Format currency tampil dengan benar
5. ✅ Filter status berfungsi
6. ✅ Admin dapat reject proposal

## Troubleshooting

Jika ada masalah:
1. Pastikan port 5000 dan 3000 tidak digunakan aplikasi lain
2. Pastikan database MySQL berjalan
3. Cek file `.env` di folder backend
4. Pastikan semua dependencies terinstall (`npm install`)

