# Sistem Training Need Analyst (TNA)

[![GitHub](https://img.shields.io/badge/Repository-GitHub-blue.svg)](https://github.com/JoelAritonang16/Training-Need-Analyst)

Sistem manajemen kebutuhan pelatihan berbasis web yang memudahkan pengelolaan dan analisis kebutuhan pelatihan di organisasi. Dibangun dengan Node.js (Express) untuk backend dan React untuk frontend.

🔗 **Repository**: [https://github.com/JoelAritonang16/Training-Need-Analyst](https://github.com/JoelAritonang16/Training-Need-Analyst)

## Fitur Utama

### Autentikasi & Keamanan
- ✅ Multi-role authentication (Admin,Superadmin, User)
- ✅ Manajemen sesi yang aman
- ✅ Proteksi rute berbasis peran
- ✅ Reset password

### Manajemen Pengguna
- ✅ Registrasi dan manajemen akun
- ✅ Pembaruan profil pengguna
- ✅ Manajemen hak akses berbasis peran
- ✅ Aktivasi/Non-aktif akun

### Manajemen Pelatihan
- ✅ Pengajuan usulan pelatihan
- ✅ Persetujuan pelatihan
- ✅ Pelacakan status pelatihan
- ✅ Evaluasi pelatihan

### Laporan & Analisis
- ✅ Dashboard analitik
- ✅ Ekspor data ke Excel/PDF
- ✅ Visualisasi data pelatihan
- ✅ Riwayat pelatihan

## Struktur Proyek

```
Training-Need-Analyst/
├── backend/                 # Backend Node.js + Express
│   ├── config/             # Konfigurasi aplikasi
│   ├── controllers/        # Controller untuk logika bisnis
│   ├── models/             # Model database (Sequelize)
│   ├── routes/             # API endpoints
│   ├── middleware/         # Middleware autentikasi & validasi
│   ├── scripts/            # Script utilitas
│   └── uploads/            # File yang diunggah
├── frontend/               # Frontend React
│   ├── public/             # File statis
│   └── src/
│       ├── components/     # Komponen UI
│       ├── pages/          # Halaman aplikasi
│       ├── services/       # Layanan API
│       └── utils/          # Utilitas
└── docs/                   # Dokumentasi
```

## Persyaratan Sistem

- Node.js (v14+)
- MySQL (v5.7+)
- NPM (v6+) atau Yarn

## Instalasi & Konfigurasi

### 1. Setup Backend

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Salin file .env.example ke .env dan sesuaikan konfigurasi
cp .env.example .env
```

### 2. Setup Database

1. Buat database MySQL baru
2. Update konfigurasi database di `backend/.env`
3. Jalankan migrasi database:
   ```bash
   npx sequelize-cli db:migrate
   ```
4. (Opsional) Jalankan seeder untuk data awal:
   ```bash
   npx sequelize-cli db:seed:all
   ```

### 3. Setup Frontend

```bash
# Kembali ke direktori utama
cd ..

# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Salin file .env.example ke .env dan sesuaikan
cp .env.example .env
```

## Menjalankan Aplikasi

### Mode Pengembangan

1. Jalankan backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Di terminal terpisah, jalankan frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Buka browser dan akses:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:5000/api-docs

### Mode Produksi

1. Build frontend untuk produksi:
   ```bash
   cd frontend
   npm run build
   ```

2. Jalankan server produksi:
   ```bash
   cd ../backend
   npm start
   ```

## Akun Default

Setelah menjalankan seeder, akun berikut tersedia:

- **Superadmin**:
  - Email: superadmin@tna.local
  - Password: Superadmin@123
- **Admin**:
  - Email: admin@tna.local
  - Password: Admin@123
- **User**:
  - Email: user@tna.local
  - Password: User@123

## Dokumentasi API

Dokumentasi API lengkap tersedia di `/api-docs` setelah menjalankan server backend.

## Lisensi

MIT License

## Dukungan

Untuk bantuan lebih lanjut, silakan buat issue baru di repositori ini.