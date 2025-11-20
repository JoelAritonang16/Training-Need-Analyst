# ✅ Setup reCAPTCHA - Langkah Instalasi

## 🎯 Status: Keys Sudah Dikonfigurasi!

### 📋 Keys yang Sudah Dikonfigurasi:

**Site Key (Frontend):**
```
6LeeXxMsAAAAALPTcM9lhOkshVoHrbSyY6a95aKn
```

**Secret Key (Backend):**
```
6LeeXxMsAAAAAEh2juyPSRhp46CjpukamWpMqAAV
```

---

## 📝 Langkah Setup:

### 1. ✅ Frontend - Sudah Otomatis!
File `frontend/.env` sudah dibuat dengan Site Key yang benar.

**Jika perlu restart frontend:**
```bash
cd frontend
npm start
```

### 2. ⚠️ Backend - Perlu Manual Setup

Karena file `backend/.env` dilindungi, Anda perlu menambahkan Secret Key secara manual:

**Buka file `backend/.env` dan tambahkan baris berikut:**

```env
RECAPTCHA_SECRET_KEY=6LeeXxMsAAAAAEh2juyPSRhp46CjpukamWpMqAAV
```

**ATAU jika file belum ada, buat file baru `backend/.env` dengan isi:**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=training_need_analyst

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your_session_secret_key_here

# Google reCAPTCHA v2 Configuration
RECAPTCHA_SECRET_KEY=6LeeXxMsAAAAAEh2juyPSRhp46CjpukamWpMqAAV
```

### 3. 🔄 Restart Server

Setelah menambahkan Secret Key ke `backend/.env`:

```bash
# Stop server backend (Ctrl+C)
# Kemudian start lagi:
cd backend
npm start
```

---

## ✅ Verifikasi Setup

1. **Frontend**: Buka halaman login, reCAPTCHA checkbox harus muncul
2. **Backend**: Cek console, tidak ada error tentang `RECAPTCHA_SECRET_KEY`
3. **Test Login**: Coba login dengan username/password yang valid, reCAPTCHA harus berfungsi

---

## 🐛 Troubleshooting

### reCAPTCHA tidak muncul di halaman login:
- ✅ Pastikan `frontend/.env` sudah ada dan berisi `REACT_APP_RECAPTCHA_SITE_KEY`
- ✅ Restart frontend development server
- ✅ Cek browser console untuk error

### Error "Konfigurasi keamanan tidak lengkap":
- ✅ Pastikan `backend/.env` sudah berisi `RECAPTCHA_SECRET_KEY`
- ✅ Restart backend server
- ✅ Cek backend console untuk error

### Error "Verifikasi reCAPTCHA gagal":
- ✅ Pastikan checkbox reCAPTCHA sudah dicentang
- ✅ Pastikan domain `localhost` sudah terdaftar di Google reCAPTCHA Admin Console
- ✅ Cek network tab di browser untuk melihat request ke Google API

---

## 📚 File yang Sudah Dibuat:

1. ✅ `frontend/.env` - Sudah berisi Site Key
2. ✅ `frontend/.env.example` - Dokumentasi
3. ✅ `backend/.env.example` - Dokumentasi
4. ✅ `backend/RECAPTCHA_SECRET_KEY.txt` - Instruksi untuk Secret Key
5. ✅ `RECAPTCHA_SETUP.md` - Dokumentasi lengkap

---

## 🎉 Selesai!

Setelah menambahkan Secret Key ke `backend/.env` dan restart server, reCAPTCHA sudah siap digunakan!

