import React, { useState, useEffect, useRef } from 'react';
import { userProfileAPI } from '../utils/api';
import '../pages/user/UserProfile.css';
import { FiX, FiUpload, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Profile = ({ user: userProp, proposals = [], onUpdateProfile }) => {
  // Initialize state first, before any conditional returns
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Auto-hide notifications
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);
  
  // Create safe user object with defaults
  const getSafeUser = (user) => {
    if (!user) return null;
    return {
      username: user.username || '',
      email: user.email || '',
      unit: user.unit || '',
      phone: user.phone || '',
      fullName: user.fullName || user.username || 'Pengguna',
      profilePhoto: user.profilePhoto || null,
      role: user.role || 'user'
    };
  };
  
  const [profileData, setProfileData] = useState(() => getSafeUser(userProp) || {});
  const [originalData, setOriginalData] = useState(null);

  // Update profile data when user prop changes
  useEffect(() => {
    const user = getSafeUser(userProp);
    if (user) {
      setProfileData(user);
      if (!isEditing) {
        setOriginalData(user);
      }
    }
  }, [userProp, isEditing]);
  
  // Handle loading state
  const safeUser = getSafeUser(userProp);
  if (!userProp || !safeUser) {
    return <div className="profile-container">Memuat data pengguna...</div>;
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleUploadFile(file);
  };

  const handleUploadFile = async (file) => {
    if (!file) return;

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Format file tidak didukung. Gunakan format JPG, JPEG, PNG, atau WebP');
      setShowError(true);
      return;
    }

    // Validasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 5MB');
      setShowError(true);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengupload foto');
      }

      if (data.success) {
        // Pastikan URL foto lengkap dengan domain
        let photoUrl = data.profilePhoto || data.photoUrl;
        if (!photoUrl) {
          throw new Error('URL foto tidak valid dari server');
        }

        // Jika URL relatif, tambahkan base URL
        if (!photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          photoUrl = `${baseUrl.replace(/\/+$/, '')}/${photoUrl.replace(/^\/+/, '')}`;
        }
        
        // Tambahkan timestamp untuk menghindari cache
        const timestamp = new Date().getTime();
        const photoUrlWithTimestamp = `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
        
        // Update state dengan foto baru
        const updatedProfile = {
          ...profileData,
          profilePhoto: photoUrlWithTimestamp
        };
        
        // Update state lokal
        setProfileData(updatedProfile);
        
        // Update originalData untuk memastikan perubahan tersimpan
        setOriginalData(prev => ({
          ...prev,
          profilePhoto: photoUrlWithTimestamp
        }));
        
        // Update parent component dengan data lengkap
        if (onUpdateProfile) {
          onUpdateProfile({
            ...userProp,
            profilePhoto: photoUrlWithTimestamp,
            // Pastikan field penting lainnya ikut terupdate
            fullName: profileData.fullName,
            username: profileData.username,
            email: profileData.email,
            phone: profileData.phone,
            unit: profileData.unit,
            role: profileData.role
          });
        }
        
        // Update localStorage dengan data terbaru
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (Object.keys(userData).length > 0) {
          const updatedUserData = {
            ...userData,
            profilePhoto: photoUrlWithTimestamp,
            fullName: profileData.fullName || userData.fullName,
            username: profileData.username || userData.username,
            email: profileData.email || userData.email,
            phone: profileData.phone || userData.phone,
            unit: profileData.unit || userData.unit,
            role: profileData.role || userData.role
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
        
        setSuccessMessage('Foto profil berhasil diupdate!');
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Gagal mengupload foto: ' + (error.message || 'Terjadi kesalahan'));
      setShowError(true);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      // Data dasar yang dibutuhkan semua role
      const baseData = {
        fullName: profileData.fullName?.trim() || null,
        username: profileData.username?.trim() || '',
        email: profileData.email?.trim() || null,
        phone: profileData.phone?.trim() || null,
        role: profileData.role || 'user',
        // Tambahkan field khusus role jika diperlukan
        ...(profileData.unit && { unit: profileData.unit.trim() })
      };

      // Validasi data berdasarkan role
      let validationError = '';
      
      // Validasi untuk semua role
      if (!baseData.username) {
        validationError = 'Username tidak boleh kosong';
      } else if (baseData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(baseData.email)) {
        validationError = 'Format email tidak valid';
      } else if (baseData.phone && !/^[0-9+\-\s]*$/.test(baseData.phone)) {
        validationError = 'Nomor telepon hanya boleh berisi angka, +, atau -';
      }

      if (validationError) {
        setErrorMessage(validationError);
        setShowError(true);
        return;
      }
      
      setUploading(true);
      
      try {
        const response = await userProfileAPI.updateProfile(baseData);
        
        if (response) {
          // Pastikan data yang diterima dari server lengkap
          const updatedUser = {
            ...userProp,
            ...(response.user || {}),
            profilePhoto: response.user?.profilePhoto || userProp?.profilePhoto || ''
          };
          
          // Update state
          setProfileData(updatedUser);
          setOriginalData(updatedUser);
          
          // Show success message
          setSuccessMessage(response.message || 'Profil berhasil diperbarui!');
          setShowSuccess(true);
          
          // Update parent component
          if (onUpdateProfile) {
            onUpdateProfile(updatedUser);
          }
          
          // Exit edit mode after a short delay
          setTimeout(() => {
            setIsEditing(false);
            setUploading(false);
          }, 1000);
        } else {
          throw new Error('Tidak ada response dari server');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setErrorMessage('Terjadi kesalahan: ' + (error.message || 'Tidak dapat menyimpan perubahan'));
        setShowError(true);
        setUploading(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrorMessage('Terjadi kesalahan tak terduga');
      setShowError(true);
      setUploading(false);
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      // Ketika masuk mode edit, simpan data asli
      setOriginalData(profileData);
    } else {
      // Ketika batal edit, kembalikan ke data asli
      setProfileData(originalData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    if (originalData) {
      setProfileData(originalData);
    }
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      {/* Success Notification */}
      {showSuccess && (
        <div className="notification-center">
          <div className="notification-content success">
            <div className="notification-header">
              <div className="notification-icon success">
                <FiCheckCircle size={18} />
              </div>
              <h4 className="notification-title">Berhasil</h4>
              <button className="notification-close" onClick={() => setShowSuccess(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="notification-message">
              {successMessage}
            </div>
            <div className="notification-status">
              <div className="notification-status-bar"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Notification */}
      {showError && (
        <div className="notification-center">
          <div className="notification-content error">
            <div className="notification-header">
              <div className="notification-icon error">
                <FiAlertCircle size={18} />
              </div>
              <h4 className="notification-title">Terjadi Kesalahan</h4>
              <button className="notification-close" onClick={() => setShowError(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="notification-message">
              {errorMessage}
            </div>
            <div className="notification-status">
              <div className="notification-status-bar"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {uploading && (
        <div className="uploading-overlay">
          <div className="uploading-spinner">
            <FiLoader className="spin" size={32} />
            <p>Mengunggah foto...</p>
          </div>
        </div>
      )}
      <div className="profile-header-container">
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
              <button 
                className="upload-photo-btn" 
                title="Upload foto profil"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className="upload-icon" />
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </button>
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
                value={profileData.fullName || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Masukkan nama lengkap"
                className={isEditing ? '' : 'readonly-input'}
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
                className={isEditing ? '' : 'readonly-input'}
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
                className={isEditing ? '' : 'readonly-input'}
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
                className={isEditing ? '' : 'readonly-input'}
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
                className={isEditing ? '' : 'readonly-input'}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <div className="button-group">
                  <button 
                    type="button" 
                    className="btn-save"
                    onClick={handleSave}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <FiLoader className="spin" /> Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancel}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </form>
          {!isEditing && (
            <button 
              type="button"
              className="edit-profile-btn"
              onClick={toggleEdit}
            >
              Edit Profil
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default Profile;
