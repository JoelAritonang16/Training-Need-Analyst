# Alur Approval Proposal - Training Need Analyst

## Alur Lengkap Sistem Approval

### 1. User Membuat Proposal
- **Status**: `MENUNGGU`
- **Notifikasi**: Dikirim ke **Admin** dari branch yang sama
- **Aksi**: User submit proposal baru

### 2. Admin Review Proposal
- **Lokasi**: Halaman "Persetujuan Usulan" (Admin Dashboard)
- **Status yang dilihat**: `MENUNGGU`
- **Aksi Admin**:
  - ✅ **Approve** → Status menjadi `APPROVE_ADMIN` → Notifikasi ke **Superadmin**
  - ❌ **Reject** → Admin tidak bisa reject (hanya superadmin yang bisa)

### 3. Superadmin Review Proposal
- **Lokasi**: Halaman "Persetujuan Usulan" (Superadmin Dashboard)
- **Status yang dilihat**: `APPROVE_ADMIN` (proposal yang sudah di-approve admin)
- **Aksi Superadmin**:
  - ✅ **Approve** → Status menjadi `APPROVE_SUPERADMIN` → Notifikasi ke **Admin** → Admin konfirmasi ke **User**
  - ❌ **Reject** → Status menjadi `DITOLAK` dengan alasan → Notifikasi langsung ke **User**

### 4. Admin Konfirmasi ke User
- **Lokasi**: Halaman "Usulan Disetujui" (Admin Dashboard)
- **Status yang dilihat**: `APPROVE_SUPERADMIN` (proposal yang sudah di-approve superadmin)
- **Aksi Admin**: 
  - ✅ **Konfirmasi ke User** → Status menjadi `APPROVE_ADMIN` → Notifikasi ke **User** bahwa request diterima

### 5. User Menerima Notifikasi
- **Jika Approved**: 
  - User menerima notifikasi bahwa request diterima dan proposal siap dilaksanakan
  - Status final: `APPROVE_ADMIN`
  
- **Jika Rejected**:
  - User menerima notifikasi dengan alasan penolakan dari superadmin
  - Status: `DITOLAK`
  - User bisa **revisi** proposal

### 6. User Revisi Proposal (Jika Ditolak)
- **Aksi**: User edit proposal yang statusnya `DITOLAK`
- **Hasil**: 
  - Status kembali ke `MENUNGGU`
  - Alasan penolakan dihapus
  - Notifikasi dikirim ke **Admin** untuk review ulang
  - Alur kembali ke langkah 2

## Status Proposal

| Status | Deskripsi | Dapat Diubah Oleh |
|--------|-----------|-------------------|
| `MENUNGGU` | Proposal baru dari user, menunggu review admin | Admin (approve) |
| `APPROVE_ADMIN` | Proposal sudah di-approve admin, menunggu superadmin | Superadmin (approve/reject) |
| `APPROVE_SUPERADMIN` | Proposal sudah di-approve superadmin, menunggu konfirmasi admin ke user | Admin (konfirmasi ke user) |
| `DITOLAK` | Proposal ditolak oleh superadmin dengan alasan | User (revisi) |

## Notifikasi System

### Tipe Notifikasi:
1. **PROPOSAL_SUBMITTED**: Proposal baru dibuat atau direvisi
2. **APPROVE_ADMIN**: Admin approve proposal
3. **APPROVE_SUPERADMIN**: Superadmin approve proposal
4. **REJECT_SUPERADMIN**: Superadmin reject proposal

### Alur Notifikasi:
1. User create → Admin (PROPOSAL_SUBMITTED)
2. Admin approve → Superadmin (APPROVE_ADMIN)
3. Superadmin approve → Admin (APPROVE_SUPERADMIN) → Admin konfirmasi → User (APPROVE_SUPERADMIN)
4. Superadmin reject → User langsung (REJECT_SUPERADMIN dengan alasan)
5. User revisi → Admin (PROPOSAL_SUBMITTED)

## Fitur Tambahan

- ✅ User bisa revisi proposal yang ditolak
- ✅ Notifikasi otomatis di setiap tahap
- ✅ Alasan penolakan wajib diisi oleh superadmin
- ✅ Filter berdasarkan branch untuk admin
- ✅ UI menggunakan AlertModal (tanpa popup browser)
- ✅ Semua fungsi lain tetap berjalan normal

