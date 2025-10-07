# 📝 User Profile Update - Implementation Guide

## 🎯 Fitur yang Diimplementasikan

Pengguna sekarang dapat mengisi dan menyimpan informasi personal mereka di halaman Profile:
- **Nama Lengkap** (fullName)
- **Email** (email)
- **Nomor Telepon** (phone)
- **Unit/Divisi** (unit)

## 🔧 Perubahan Backend

### 1. Model User (`backend/models/User.js`)
Menambahkan field baru:
```javascript
fullName: {
  type: DataTypes.STRING(100),
  allowNull: true,
  comment: 'Nama lengkap user'
},
email: {
  type: DataTypes.STRING(100),
  allowNull: true,
  validate: {
    isEmail: true
  },
  comment: 'Email user'
},
phone: {
  type: DataTypes.STRING(20),
  allowNull: true,
  comment: 'Nomor telepon user'
},
unit: {
  type: DataTypes.STRING(100),
  allowNull: true,
  comment: 'Unit/Divisi user'
}
```

### 2. Controller (`backend/controllers/userController.js`)
Menambahkan method baru:
```javascript
updateOwnProfile: async (req, res) => {
  // User dapat update profile sendiri
  // Mengambil userId dari req.user.id (auth middleware)
  // Update fields: fullName, email, phone, unit
}
```

### 3. Routes (`backend/routes/users.js`)
Menambahkan endpoint baru:
```javascript
router.put('/profile/me', auth.isAuthenticated, userController.updateOwnProfile);
```

## 🎨 Perubahan Frontend

### 1. API Utility (`frontend/src/utils/api.js`)
Menambahkan userProfileAPI:
```javascript
export const userProfileAPI = {
  updateProfile: async (profileData) => {
    return apiCall('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};
```

### 2. UserProfile Component (`frontend/src/pages/user/UserProfile.jsx`)
- Import userProfileAPI
- Update handleSave menjadi async function
- Memanggil API untuk menyimpan perubahan
- Menampilkan alert success/error
- Update user state setelah berhasil

## 📦 Database Migration

### Cara Menjalankan Migration:

**Option 1: Menggunakan Script (Recommended)**
```bash
cd backend
node scripts/run-migration-profile-fields.js
```

**Option 2: Manual SQL**
```sql
ALTER TABLE users ADD COLUMN fullName VARCHAR(100) NULL COMMENT 'Nama lengkap user';
ALTER TABLE users ADD COLUMN email VARCHAR(100) NULL COMMENT 'Email user';
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL COMMENT 'Nomor telepon user';
ALTER TABLE users ADD COLUMN unit VARCHAR(100) NULL COMMENT 'Unit/Divisi user';
```

## 🚀 Cara Testing

### 1. Jalankan Migration
```bash
cd backend
node scripts/run-migration-profile-fields.js
```

### 2. Restart Backend Server
```bash
cd backend
npm run dev
```

### 3. Test di Frontend
1. Login ke aplikasi
2. Klik menu "Profil Saya" di sidebar
3. Klik tombol "Edit Profil"
4. Isi informasi personal:
   - Nama Lengkap
   - Email
   - Nomor Telepon
   - Unit/Divisi
5. Klik "Simpan Perubahan"
6. Verifikasi alert "Profil berhasil diperbarui!"
7. Refresh halaman dan pastikan data tersimpan

### 4. Verifikasi Database
```sql
SELECT id, username, fullName, email, phone, unit FROM users;
```

## 📋 Checklist Testing

- [ ] Migration berhasil dijalankan
- [ ] Backend server restart tanpa error
- [ ] Halaman Profile dapat dibuka
- [ ] Tombol "Edit Profil" berfungsi
- [ ] Form input dapat diisi
- [ ] Tombol "Simpan Perubahan" berfungsi
- [ ] Alert success muncul setelah save
- [ ] Data tersimpan di database
- [ ] Data tetap ada setelah refresh
- [ ] Tombol "Batal" mengembalikan data awal
- [ ] Validasi email berfungsi (format email)

## 🔒 Security & Validation

### Backend Validation:
- ✅ Authentication required (auth.isAuthenticated middleware)
- ✅ User hanya bisa update profile sendiri (req.user.id)
- ✅ Email validation (isEmail validator)
- ✅ Field optional (allowNull: true)

### Frontend Validation:
- ✅ Input disabled saat tidak dalam mode edit
- ✅ Error handling dengan try-catch
- ✅ User feedback dengan alert

## 🎯 API Endpoint

### Update Own Profile
```
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "email": "john.doe@pelindo.com",
  "phone": "081234567890",
  "unit": "IT Division"
}

Response Success:
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "username": "john_doe",
    "fullName": "John Doe",
    "email": "john.doe@pelindo.com",
    "phone": "081234567890",
    "unit": "IT Division",
    "role": "user"
  }
}

Response Error:
{
  "success": false,
  "message": "Gagal memperbarui profil"
}
```

## 📝 Notes

1. **Field Optional**: Semua field profile bersifat optional (nullable)
2. **Username Readonly**: Username tidak bisa diubah melalui profile update
3. **Role Readonly**: Role tidak bisa diubah melalui profile update
4. **Email Validation**: Email harus format valid (xxx@xxx.xxx)
5. **Phone Format**: Tidak ada validasi format khusus, bisa diisi bebas
6. **Unit Field**: Bisa diisi manual atau dari dropdown (future enhancement)

## 🔄 Future Enhancements

1. **Upload Photo Profile**: Tambah fitur upload foto profil
2. **Change Password**: Tambah fitur ganti password
3. **Unit Dropdown**: Ganti input text unit dengan dropdown dari database
4. **Phone Validation**: Tambah validasi format nomor telepon Indonesia
5. **Email Verification**: Tambah fitur verifikasi email
6. **Profile Completion**: Tampilkan progress bar kelengkapan profil

## 🐛 Troubleshooting

### Error: "Column 'fullName' doesn't exist"
**Solution**: Jalankan migration terlebih dahulu
```bash
node scripts/run-migration-profile-fields.js
```

### Error: "Cannot read property 'id' of undefined"
**Solution**: Pastikan user sudah login dan token valid

### Error: "Validation isEmail on email failed"
**Solution**: Pastikan format email valid (xxx@xxx.xxx)

### Data tidak tersimpan setelah refresh
**Solution**: 
1. Check console browser untuk error
2. Check network tab untuk response API
3. Pastikan backend menerima dan menyimpan data
4. Verify database dengan query SQL

---

**Tanggal:** 2025-10-07  
**Developer:** Cascade AI  
**Status:** ✅ Completed & Ready to Test
