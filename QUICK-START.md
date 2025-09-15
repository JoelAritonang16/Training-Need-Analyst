# 🚀 Quick Start Guide - Sistem Login

## Prerequisites
- Node.js (v14 atau lebih baru)
- MySQL Server
- Git

## ⚡ Langkah Cepat

### 1. Clone dan Install Dependencies
```bash
git clone <repository-url>
cd pelindo_tna
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Setup Database
```bash
cd backend
npm run setup-db
npm run create-test-user
cd ..
```

### 3. Jalankan Sistem
```bash
# Windows
start-system.bat

# Atau PowerShell
.\start-system.ps1

# Atau manual
npm start
```

## 🔑 Login Credentials
- **Admin**: `admin` / `admin123`
- **User**: `user1` / `user123`
- **Manager**: `manager` / `manager123`

## 🌐 URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📁 Struktur File Penting
```
pelindo_tna/
├── backend/
│   ├── scripts/
│   │   ├── setupDatabase.js      # Setup database
│   │   └── createTestUser.js     # Buat user test
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Login.js          # Form login
│       │   └── Dashboard.js      # Dashboard setelah login
│       └── App.js                # App utama
├── start-system.bat              # Script Windows
├── start-system.ps1              # Script PowerShell
└── README.md                     # Dokumentasi lengkap
```

## 🛠️ Troubleshooting

### Database Connection Error
```bash
cd backend
npm run setup-db
```

### Port Already in Use
- Backend: Ganti port di `backend/config/database.js`
- Frontend: Ganti port di `frontend/package.json`

### CORS Error
- Pastikan backend berjalan di port 5000
- Frontend berjalan di port 3000

## 📱 Fitur
- ✅ Form login responsive
- ✅ Dashboard dengan user info
- ✅ Session management
- ✅ Password hashing
- ✅ Logout functionality
- ✅ Real-time clock
- ✅ Status sistem

## 🔧 Development
```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm start
```

## 📞 Support
Jika ada masalah, cek:
1. Console browser (F12)
2. Terminal backend
3. Database connection
4. Port availability
