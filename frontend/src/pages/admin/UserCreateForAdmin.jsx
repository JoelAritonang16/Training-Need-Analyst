import React, { useEffect, useState } from 'react';
import { divisiAPI } from '../../utils/api';
import './UserCreate.css';

const UserCreateForAdmin = ({ currentUser, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);
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
        alert('Username dan password harus diisi');
        setLoading(false);
        return;
      }
      
      if (!formData.divisiId) {
        alert('Pilih Divisi untuk user');
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
        alert('User berhasil ditambahkan ke divisi dan branch Anda');
        if (onNavigate) onNavigate('user-management');
      } else {
        alert(data.message || 'Gagal menambahkan user');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan');
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
    </div>
  );
};

export default UserCreateForAdmin;
