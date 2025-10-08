import React, { useEffect, useState } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import './UserCreate.css';

const UserCreate = ({ currentUserRole = 'superadmin', onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [anakPerusahaanList, setAnakPerusahaanList] = useState([]);
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
        // clear user-related fields
        divisiId: '',
        branchId: '',
        // keep admin-related field
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
        alert('Pilih Branch untuk role User');
        setLoading(false);
        return;
      }
      if (formData.role === 'admin' && !formData.anakPerusahaanId) {
        alert('Pilih Anak Perusahaan untuk role Admin');
        setLoading(false);
        return;
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
        alert('User berhasil ditambahkan');
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
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreate;
