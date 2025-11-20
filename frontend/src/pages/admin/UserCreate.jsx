import React, { useEffect, useState } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import './UserCreate.css';

const UserCreate = ({ currentUserRole = 'superadmin', onNavigate }) => {
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
    password: '',
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

  const handleRoleChange = (role) => {
    // Keep only relevant fields for the chosen role
    if (role === 'user') {
      setFormData(prev => ({
        ...prev,
        role,
        anakPerusahaanId: '', // clear AP for user role
        // keep user-related fields
        divisiId: prev.divisiId || '',
        branchId: prev.branchId || ''
      }));
    } else if (role === 'admin') {
      setFormData(prev => ({
        ...prev,
        role,
        // clear user-related fields (admin tidak perlu divisi)
        divisiId: '',
        // keep admin-related fields
        branchId: prev.branchId || '', // admin perlu branch
        anakPerusahaanId: prev.anakPerusahaanId || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, role }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Client-side validation synced with backend rules
      if (formData.role === 'user' && !formData.branchId) {
        setAlertModal({
          open: true,
          title: 'Validasi Gagal',
          message: 'Pilih Branch untuk role User',
          type: 'warning'
        });
        setLoading(false);
        return;
      }
      if (formData.role === 'admin') {
        if (!formData.branchId) {
          setAlertModal({
            open: true,
            title: 'Validasi Gagal',
            message: 'Pilih Branch untuk role Admin',
            type: 'warning'
          });
          setLoading(false);
          return;
        }
        if (!formData.anakPerusahaanId) {
          setAlertModal({
            open: true,
            title: 'Validasi Gagal',
            message: 'Pilih Anak Perusahaan untuk role Admin',
            type: 'warning'
          });
          setLoading(false);
          return;
        }
      }

      const toNumberOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
      const res = await fetch('http://localhost:5000/api/users/role-based', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          currentUserRole,
          // coerce IDs to numbers/null
          divisiId: toNumberOrNull(formData.divisiId),
          branchId: toNumberOrNull(formData.branchId),
          anakPerusahaanId: toNumberOrNull(formData.anakPerusahaanId)
        })
      });
      const data = await res.json();
      if (data.success) {
        const roleText = formData.role === 'admin' ? 'Admin' : 'User';
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Akun ${roleText} "${formData.username}" berhasil ditambahkan ke sistem.`,
          type: 'success'
        });
        // Reset form
        setFormData({
          username: '',
          password: '',
          role: 'user',
          email: '',
          divisiId: '',
          branchId: '',
          anakPerusahaanId: ''
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
          <h2>Form Tambah Pengguna</h2>
          <p>Lengkapi data pengguna sesuai peran.</p>
        </div>
      </div>

      <div className="form-surface">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input type="text" value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})} required minLength={6} />
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
            <>
              <div className="form-group">
                <label>Branch *</label>
                <select value={formData.branchId} onChange={(e)=>setFormData({...formData, branchId:e.target.value})} required>
                  <option value="">Pilih Branch</option>
                  {branchList.map(b=> <option key={b.id} value={b.id}>{b.nama}</option>)}
                </select>
                <small className="form-help">Admin akan mengelola branch yang dipilih</small>
              </div>
              <div className="form-group">
                <label>Anak Perusahaan *</label>
                <select value={formData.anakPerusahaanId} onChange={(e)=>setFormData({...formData, anakPerusahaanId:e.target.value})} required>
                  <option value="">Pilih Anak Perusahaan</option>
                  {anakPerusahaanList.map(a=> <option key={a.id} value={a.id}>{a.nama}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn-light" onClick={()=>onNavigate && onNavigate('user-management')} disabled={loading}>Batal</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
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

export default UserCreate;
