import React, { useState, useEffect } from 'react';
import { userProfileAPI } from '../utils/api';
import '../pages/user/UserProfile.css';

const Profile = ({ user: userProp, proposals = [], onUpdateProfile }) => {
  // Initialize state first, before any conditional returns
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Create safe user object with defaults
  const safeUser = userProp ? {
    username: userProp.username || '',
    email: userProp.email || '',
    unit: userProp.unit || '',
    phone: userProp.phone || '',
    fullName: userProp.fullName || userProp.username || 'Pengguna',
    profilePhoto: userProp.profilePhoto || null,
    role: userProp.role || 'user'
  } : null;
  
  const [profileData, setProfileData] = useState(safeUser || {});

  // Update profile data when user prop changes
  useEffect(() => {
    if (safeUser) {
      setProfileData(safeUser);
    }
  }, [safeUser]);
  
  // Handle loading state
  if (!userProp || !safeUser) {
    return <div className="profile-container">Memuat data pengguna...</div>;
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: data.profilePhoto
        }));
        
        if (onUpdateProfile) {
          onUpdateProfile({ 
            ...userProp, 
            profilePhoto: data.profilePhoto 
          });
        }
        
        alert('Foto profil berhasil diupload!');
      } else {
        alert('Gagal upload foto: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Menyimpan perubahan profil:', profileData);
      const response = await userProfileAPI.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = {
          ...userProp,
          ...response.user,
          profilePhoto: response.user.profilePhoto || userProp?.profilePhoto
        };
        
        setProfileData(updatedUser);
        
        // Show success message
        alert('Profil berhasil diperbarui!');
        
        // Update parent component
        if (onUpdateProfile) {
          onUpdateProfile(updatedUser);
        }
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        alert('Gagal memperbarui profil: ' + (response.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan: ' + (error.message || 'Tidak dapat menyimpan perubahan'));
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: userProp?.username || '',
      email: userProp?.email || '',
      unit: userProp?.unit || '',
      phone: userProp?.phone || '',
      fullName: userProp?.fullName || ''
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
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profileData.profilePhoto ? (
                  <img 
                    src={`http://localhost:5000/${profileData.profilePhoto}`} 
                    alt="Profile" 
                    className="profile-photo"
                  />
                ) : (
                  (profileData.fullName || profileData.username)?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="upload-photo-btn" title="Upload foto profil">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                📷
              </label>
            </div>
            <div className="profile-details">
              <h3>{profileData.fullName || profileData.username}</h3>
              <p className="role-badge">{userProp?.role || 'user'}</p>
              <p className="unit-info">{profileData.unit || 'Unit/Divisi'}</p>
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
            <div className="activity-icon">SUBMIT</div>
            <div className="activity-content">
              <h4>Usulan Terakhir</h4>
              <p>{proposals.length > 0 ? proposals[0].uraian : 'Belum ada usulan'}</p>
              <small>{proposals.length > 0 ? new Date(proposals[0].tanggalPengajuan).toLocaleDateString('id-ID') : ''}</small>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">OK</div>
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

export default Profile;
