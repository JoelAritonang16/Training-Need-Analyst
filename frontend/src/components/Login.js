import React, { useState } from 'react';
import './Login.css';
import batikImage from '../assets/BatikPelindo.png';  // Path relative dari components/ ke assets/

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

  // TAMBAHAN BARU: Style untuk background card dengan batik (hindari error CSS)
  
 const loginCardStyle = {
  background: `
    rgba(255, 255, 255, 0.95),
    url(${batikImage}),  // Pakai import langsung
    white
  `,
  backgroundBlendMode: 'soft-light',
  backgroundRepeat: 'repeat',
  backgroundSize: '150px 150px',
  backgroundPosition: 'center',
};

  return (
    <div className="login-container" style={loginBackgroundStyle}>
      <div className="login-card" style={loginCardStyle}>  {/* Apply style baru di sini */}
        <div className="login-header">
          <img src="/LogoPelindo.png" alt="Logo Pelindo" className="login-logo" />
          <h1>Login</h1>
          <h2>Masukkan Username dan Password Anda</h2>
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
  );
};

export default Login;