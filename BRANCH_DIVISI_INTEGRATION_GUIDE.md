# Branch & Divisi Integration Guide

## 📋 Overview

Sistem Training Need Analyst telah diintegrasikan dengan data Branch dan Divisi PT Pelindo. Sekarang admin dapat dengan mudah membuat akun user dan mengassign mereka ke branch dan divisi yang sesuai.

## 🗄️ Data yang Telah Ditambahkan

### 📍 Branch (22 lokasi):
- Tanjung Pinang
- Tanjung Balai Karimun
- Tanjung Intan
- Jamiriah
- Trisakti_mekar Putih
- Bumiharjo Bagendang
- Benoa
- Balikpapan
- Dumai
- Belawan
- Lembar
- Teluk Lamong
- Gresik
- Tanjung Emas
- Makassar
- Pareoare_Garongkong
- Sibolga
- Malahayati
- Lhokseumawe
- Badas_Bima

### 🏢 Divisi (17 departemen):
- Satuan Pengawasan Intern
- Sekretariat Perusahaan
- Transformation Management Office
- Perencanaan dan Pengelolaan SDM
- Layanan SDM dan HSSE
- Anggaran, Akuntansi, dan Pelaporan
- Pengelolaan Keuangan, dan Perpajakan
- Manajemen Risiko
- Perencanaan Strategis
- Kerjasama Usaha dan Pembinaan Anak Perusahaan
- Komersial dan Hubungan Pelanggan
- Pengelolaan Operasi
- Perencanaan dan Pengembangan Operasi
- Sistem Manajemen
- Peralatan Pelabuhan
- Fasilitas Pelabuhan
- Teknologi Informasi

## 🔑 Admin Accounts

Telah dibuat 22 akun admin, satu untuk setiap branch:

| Username | Branch | Password | Email |
|----------|--------|----------|-------|
| admin_tanjung_pinang | Tanjung Pinang | admin123 | admin_tanjung_pinang@pelindo.com |
| admin_tanjung_balai_karimun | Tanjung Balai Karimun | admin123 | admin_tanjung_balai_karimun@pelindo.com |
| admin_tanjung_intan | Tanjung Intan | admin123 | admin_tanjung_intan@pelindo.com |
| admin_jamiriah | Jamiriah | admin123 | admin_jamiriah@pelindo.com |
| admin_trisakti_mekar_putih | Trisakti_mekar Putih | admin123 | admin_trisakti_mekar_putih@pelindo.com |
| admin_bumiharjo_bagendang | Bumiharjo Bagendang | admin123 | admin_bumiharjo_bagendang@pelindo.com |
| admin_benoa | Benoa | admin123 | admin_benoa@pelindo.com |
| admin_balikpapan | Balikpapan | admin123 | admin_balikpapan@pelindo.com |
| admin_dumai | Dumai | admin123 | admin_dumai@pelindo.com |
| admin_belawan | Belawan | admin123 | admin_belawan@pelindo.com |
| admin_lembar | Lembar | admin123 | admin_lembar@pelindo.com |
| admin_teluk_lamong | Teluk Lamong | admin123 | admin_teluk_lamong@pelindo.com |
| admin_gresik | Gresik | admin123 | admin_gresik@pelindo.com |
| admin_tanjung_emas | Tanjung Emas | admin123 | admin_tanjung_emas@pelindo.com |
| admin_makassar | Makassar | admin123 | admin_makassar@pelindo.com |
| admin_pareoare_garongkong | Pareoare_Garongkong | admin123 | admin_pareoare_garongkong@pelindo.com |
| admin_sibolga | Sibolga | admin123 | admin_sibolga@pelindo.com |
| admin_malahayati | Malahayati | admin123 | admin_malahayati@pelindo.com |
| admin_lhokseumawe | Lhokseumawe | admin123 | admin_lhokseumawe@pelindo.com |
| admin_badas_bima | Badas_Bima | admin123 | admin_badas_bima@pelindo.com |

⚠️ **PENTING**: Ganti password default setelah login pertama!

## 🚀 Cara Menggunakan Sistem

### 1. Login sebagai Admin Branch
- Gunakan username dan password dari tabel di atas
- Admin akan masuk ke dashboard khusus branch mereka

### 2. Membuat User Baru
- Pilih menu "Manajemen User"
- Klik "Tambah User Baru"
- Isi form dengan data user:
  - **Username**: Unique identifier
  - **Password**: Minimum 6 karakter
  - **Role**: User (untuk staff biasa)
  - **Email**: Email user (opsional)
  - **Branch**: Otomatis terisi sesuai branch admin
  - **Divisi**: Pilih dari dropdown yang tersedia

### 3. Assign User ke Divisi
- Saat membuat user, admin dapat memilih divisi dari dropdown
- Divisi yang tersedia mencakup semua 17 departemen PT Pelindo
- User akan otomatis terassign ke branch admin yang membuatnya

## 🛠️ Scripts yang Tersedia

### Seeding Database
```bash
# Menambahkan data Branch dan Divisi
cd backend
node scripts/seedDatabase.js
```

### Membuat Admin Accounts
```bash
# Membuat akun admin untuk setiap branch
cd backend
node scripts/createBranchAdminsSimple.js
```

### Verifikasi Data
```bash
# Memverifikasi data yang sudah ada di database
cd backend
node scripts/verifyData.js
```

## 📊 Struktur Database

### Tabel `branch`
- `id`: Primary key
- `nama`: Nama branch
- `created_at`, `updated_at`: Timestamps

### Tabel `divisi`
- `id`: Primary key
- `nama`: Nama divisi
- `created_at`, `updated_at`: Timestamps

### Tabel `users` (Updated)
- `id`: Primary key
- `username`: Username unik
- `password`: Password terenkripsi
- `role`: user/admin/superadmin
- `fullName`: Nama lengkap
- `email`: Email user
- `unit`: Unit/divisi user
- `branchId`: Foreign key ke tabel branch
- `divisiId`: Foreign key ke tabel divisi (untuk role user)
- `anakPerusahaanId`: Foreign key ke tabel anak_perusahaan (untuk role admin)

## 🔐 Role & Permissions

### Superadmin
- Dapat melihat semua branch dan divisi
- Dapat membuat admin dan user
- Akses ke semua fitur sistem

### Admin (Branch-specific)
- Hanya dapat membuat user dengan role "user"
- User yang dibuat otomatis terassign ke branch admin tersebut
- Dapat memilih divisi untuk user yang dibuat
- Akses terbatas pada branch mereka

### User
- Dapat membuat training proposal
- Melihat proposal mereka sendiri
- Terassign ke branch dan divisi tertentu

## 🎯 Benefits

1. **Organized User Management**: Setiap branch memiliki admin sendiri
2. **Automatic Assignment**: User otomatis terassign ke branch admin yang membuatnya
3. **Flexible Division Assignment**: Admin dapat assign user ke divisi manapun
4. **Scalable System**: Mudah menambah branch atau divisi baru
5. **Role-based Access**: Kontrol akses berdasarkan role dan branch

## 🔧 Maintenance

### Menambah Branch Baru
1. Tambahkan data ke tabel `branch`
2. Jalankan script untuk membuat admin account
3. Update frontend jika diperlukan

### Menambah Divisi Baru
1. Tambahkan data ke tabel `divisi`
2. Divisi akan otomatis tersedia di dropdown

### Backup Data
```bash
# Backup database secara berkala
mysqldump -u root -p spmt > backup_$(date +%Y%m%d).sql
```

## 📞 Support

Jika ada masalah atau pertanyaan terkait sistem ini, silakan hubungi tim development atau buat issue di repository.

---

**Status**: ✅ Completed & Ready for Production
**Last Updated**: November 2024
**Version**: 1.0.0
