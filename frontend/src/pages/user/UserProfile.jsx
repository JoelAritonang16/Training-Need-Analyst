import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, proposals, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    unit: user?.unit || '',
    phone: user?.phone || '',
    fullName: user?.fullName || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      unit: user?.unit || '',
      phone: user?.phone || '',
      fullName: user?.fullName || ''
    });
    setIsEditing(false);
  };

  const approvedCount = proposals.filter(p => p.status === 'APPROVED').length;
  const pendingCount = proposals.filter(p => p.status === 'PENDING').length;

  return (
    <div className="profile-container">
      <div className="content-header">
        <h2>Profil Pengguna</h2>
        <p>Informasi akun dan pengaturan profil</p>
      </div>
      
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <h3>{user?.username}</h3>
              <p className="role-badge">{user?.role}</p>
              <p className="unit-info">{user?.unit || 'Unit/Divisi'}</p>
            </div>
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Batal' : 'Edit Profil'}
            </button>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{proposals.length}</span>
              <span className="stat-label">Total Usulan</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{approvedCount}</span>
              <span className="stat-label">Disetujui</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{pendingCount}</span>
              <span className="stat-label">Menunggu</span>
            </div>
          </div>
        </div>

        <div className="profile-form-card">
          <h3>Informasi Personal</h3>
          <form className="profile-form">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Username"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="email@pelindo.com"
              />
            </div>

            <div className="form-group">
              <label>Unit/Divisi</label>
              <input
                type="text"
                name="unit"
                value={profileData.unit}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Unit/Divisi"
              />
            </div>

            <div className="form-group">
              <label>Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-save"
                  onClick={handleSave}
                >
                  Simpan Perubahan
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Batal
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="activity-summary">
        <h3>Ringkasan Aktivitas</h3>
        <div className="activity-grid">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <h4>Usulan Terakhir</h4>
              <p>{proposals.length > 0 ? proposals[0].uraian : 'Belum ada usulan'}</p>
              <small>{proposals.length > 0 ? new Date(proposals[0].tanggalPengajuan).toLocaleDateString('id-ID') : ''}</small>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <h4>Status Terbaru</h4>
              <p>{proposals.length > 0 ? proposals[0].status : 'Tidak ada status'}</p>
              <small>Update terakhir</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
