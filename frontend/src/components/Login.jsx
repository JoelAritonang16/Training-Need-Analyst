import React, { useState } from 'react';
import './Login.css';
import batikImage from '../assets/BatikPelindo.png';
import danantaraLogo from '../assets/Danantara2.png';
import pelindoLogo from '../assets/LogoFixx.png';

const Login = ({ onLoginSuccess }) => {
  // Semua state dan fungsi Anda tetap sama (tidak ada perubahan di sini)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
        
        setFormData({ username: '', password: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const backgroundImageUrl = `${process.env.PUBLIC_URL}/GEDUNGG.png`;
  const loginBackgroundStyle = {
    background: `linear-gradient(135deg, rgba(30,60,114,0.6) 0%, rgba(42,82,152,0.6) 100%), url(${backgroundImageUrl})`,
    backgroundSize: 'cover, cover',
    backgroundPosition: 'center, center',
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundBlendMode: 'multiply'
  };

  // Style untuk card dengan background batik yang elegan
  const loginCardStyle = {
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div className="login-container" style={loginBackgroundStyle}>
      {/* Logos di luar card - bagian atas */}
      <div className="logos-container-top">
        <div className="logo-item">
          <img src={danantaraLogo} alt="Danantara Indonesia" className="company-logo danantara-logo" />
        </div>
        <div className="logo-divider"></div>
        <div className="logo-item">
          <img src={pelindoLogo} alt="Pelindo Multi Terminal" className="company-logo pelindo-logo" />
        </div>
      </div>

      <div className="login-card" style={loginCardStyle}>
        {/* Batik background layer - 2 corners */}
        <div className="batik-corner batik-top-right"></div>
        <div className="batik-corner batik-bottom-left"></div>
        
        {/* Content layer */}
        <div className="login-content">
          <div className="login-header">
            <h1>Selamat Datang</h1>
            <p className="subtitle">Sistem Pelatihan PT Pelindo</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="login-footer">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;