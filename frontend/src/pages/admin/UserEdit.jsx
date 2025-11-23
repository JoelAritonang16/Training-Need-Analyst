import React, { useEffect, useState } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import './UserCreate.css';

const UserEdit = ({ currentUserRole = 'superadmin', user, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [anakPerusahaanList, setAnakPerusahaanList] = useState([]);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [formData, setFormData] = useState({
    username: '',
    role: 'user',
    email: '',
    divisiId: '',
    branchId: '',
    anakPerusahaanId: ''
  });

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const promises = [branchAPI.getAll()];
        if (currentUserRole === 'superadmin') {
          promises.push(divisiAPI.getAll(), anakPerusahaanAPI.getAll());
        }
        const results = await Promise.all(promises);
        if (results[0]?.success) setBranchList(results[0].branch || []);
        if (results[1]?.success) setDivisiList(results[1].divisi || []);
        if (results[2]?.success) setAnakPerusahaanList(results[2].anakPerusahaan || []);
      } catch (e) {
        console.error('Fetch refs error', e);
      }
    };
    fetchRefs();
  }, [currentUserRole]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        role: user.role || 'user',
        email: user.email || '',
        divisiId: user.divisiId || '',
        branchId: user.branchId || '',
        anakPerusahaanId: user.anakPerusahaanId || ''
      });
    }
  }, [user]);

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      divisiId: role === 'user' ? prev.divisiId : '',
      anakPerusahaanId: role === 'admin' ? prev.anakPerusahaanId : '',
      branchId: role === 'user' ? prev.branchId : ''
    }));
  };

  // Jika user tidak ada, tampilkan pesan error
  if (!user || !user.id) {
    return (
      <div className="user-create">
        <div className="content-header banner">
          <div>
            <h2>Edit Pengguna</h2>
            <p>User tidak ditemukan atau belum dipilih untuk diedit.</p>
          </div>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            Tidak ada user yang dipilih untuk diedit. Silakan pilih user dari halaman User Management.
          </p>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('user-management')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0070C0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              Kembali ke User Management
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/users/role-based/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          role: formData.role,
          email: formData.email,
          currentUserRole,
          divisiId: formData.divisiId || null,
          branchId: formData.branchId || null,
          anakPerusahaanId: formData.anakPerusahaanId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Data user "${formData.username}" berhasil diperbarui.`,
          type: 'success'
        });
        // Navigate after modal is closed
        setTimeout(() => {
          if (onNavigate) onNavigate('user-management');
        }, 1500);
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Memperbarui',
          message: data.message || 'Gagal mengupdate user. Silakan coba lagi.',
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
          <h2>Edit Pengguna</h2>
          <p>Perbarui data pengguna.</p>
        </div>
      </div>

      <div className="form-surface">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input type="text" value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select value={formData.role} onChange={(e)=>handleRoleChange(e.target.value)}>
              <option value="user">User</option>
              {currentUserRole === 'superadmin' && <option value="admin">Admin</option>}
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} />
          </div>

          {formData.role === 'user' && (
            <>
              <div className="form-group">
                <label>Divisi</label>
                <select value={formData.divisiId} onChange={(e)=>setFormData({...formData, divisiId:e.target.value})}>
                  <option value="">Pilih Divisi</option>
                  {divisiList.map(d=> <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select value={formData.branchId} onChange={(e)=>setFormData({...formData, branchId:e.target.value})}>
                  <option value="">Pilih Branch</option>
                  {branchList.map(b=> <option key={b.id} value={b.id}>{b.nama}</option>)}
                </select>
              </div>
            </>
          )}

          {formData.role === 'admin' && (
            <div className="form-group">
              <label>Anak Perusahaan</label>
              <select value={formData.anakPerusahaanId} onChange={(e)=>setFormData({...formData, anakPerusahaanId:e.target.value})}>
                <option value="">Pilih Anak Perusahaan</option>
                {anakPerusahaanList.map(a=> <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-light" onClick={()=>onNavigate && onNavigate('user-management')} disabled={loading}>Batal</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
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

export default UserEdit;
