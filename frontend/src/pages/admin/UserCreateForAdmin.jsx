import React, { useEffect, useState } from 'react';
import { divisiAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import './UserCreate.css';

const UserCreateForAdmin = ({ currentUser, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user', // Admin hanya bisa buat user
    email: '',
    divisiId: ''
  });

  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const result = await divisiAPI.getAll();
        if (result?.success) {
          setDivisiList(result.divisi || []);
        }
      } catch (e) {
        console.error('Fetch divisi error', e);
      }
    };
    fetchDivisi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validation
      if (!formData.username || !formData.password) {
        setAlertModal({
          open: true,
          title: 'Validasi Gagal',
          message: 'Username dan password harus diisi',
          type: 'warning'
        });
        setLoading(false);
        return;
      }
      
      if (!formData.divisiId) {
        setAlertModal({
          open: true,
          title: 'Validasi Gagal',
          message: 'Pilih Divisi untuk user',
          type: 'warning'
        });
        setLoading(false);
        return;
      }

      const toNumberOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
      
      // Admin membuat user dengan branch otomatis dari admin yang login
      // Fallback: jika branchId tidak tersedia dari currentUser, sistem akan auto-assign di backend
      const payload = {
        ...formData,
        currentUserRole: 'admin',
        // Backend akan auto-assign branchId dari session admin
        divisiId: toNumberOrNull(formData.divisiId),
        anakPerusahaanId: null // User tidak perlu anak perusahaan
      };

      console.log('Creating user with payload:', payload);

      const res = await fetch('http://localhost:5000/api/users/role-based', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        const divisiName = divisiList.find(d => d.id === Number(formData.divisiId))?.nama || 'Divisi yang dipilih';
        const branchName = currentUser?.branch?.nama || 'Branch Anda';
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Akun User "${formData.username}" berhasil ditambahkan ke ${divisiName} dan ${branchName}.`,
          type: 'success'
        });
        // Reset form
        setFormData({
          username: '',
          password: '',
          role: 'user',
          email: '',
          divisiId: ''
        });
        // Navigate after modal is closed
        setTimeout(() => {
          if (onNavigate) onNavigate('user-management');
        }, 1500);
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menambahkan',
          message: data.message || 'Gagal menambahkan user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menyimpan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-create">
      <div className="content-header banner">
        <div>
          <h2>Tambah User Baru</h2>
          <p>Tambahkan user baru untuk branch: <strong>{currentUser?.branch?.nama || 'Branch Anda'}</strong></p>
        </div>
      </div>

      <div className="form-surface">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={(e)=>setFormData({...formData, username:e.target.value})} 
              required 
              placeholder="Masukkan username unik"
            />
          </div>
          
          <div className="form-group">
            <label>Password *</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e)=>setFormData({...formData, password:e.target.value})} 
              required 
              minLength={6}
              placeholder="Minimum 6 karakter"
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <input 
              type="text" 
              value="User" 
              disabled 
              style={{backgroundColor: '#f8f9fa', color: '#6c757d'}}
            />
            <small className="form-help">Admin hanya dapat membuat akun dengan role User</small>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e)=>setFormData({...formData, email:e.target.value})} 
              placeholder="email@pelindo.com (opsional)"
            />
          </div>

          <div className="form-group">
            <label>Divisi *</label>
            <select 
              value={formData.divisiId} 
              onChange={(e)=>setFormData({...formData, divisiId:e.target.value})} 
              required
            >
              <option value="">Pilih Divisi</option>
              {divisiList.map(d=> (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
            <small className="form-help">User akan ditempatkan di divisi yang dipilih</small>
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input 
              type="text" 
              value={currentUser?.branch?.nama || 'Loading...'} 
              disabled 
              style={{backgroundColor: '#f8f9fa', color: '#6c757d'}}
            />
            <small className="form-help">User otomatis ditempatkan di branch Anda</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-light" 
              onClick={()=>onNavigate && onNavigate('user-management')} 
              disabled={loading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />
    </div>
  );
};

export default UserCreateForAdmin;
