import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Attempting login with:', { username: formData.username, password: '***' });
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        console.log('✅ Login successful');
        console.log('User data:', data.user);
        console.log('Token received:', data.token);
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Token stored in localStorage:', localStorage.getItem('token'));
        
        // Pass user data and token to parent component
        onLoginSuccess({
          id: data.user.id,
          username: data.user.username,
          role: data.user.role
        }, data.token);
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Login gagal');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(`Terjadi kesalahan saat login: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('=== LOGIN ATTEMPT END ===');
    }
  };

  const backgroundImageUrl = `${process.env.PUBLIC_URL}/BatikPelindo.png`;
  const loginBackgroundStyle = {
    background: `linear-gradient(135deg, rgba(30,60,114,0.6) 0%, rgba(42,82,152,0.6) 100%), url(${backgroundImageUrl})`,
    backgroundSize: 'cover, 320px 320px',
    backgroundPosition: 'center, top left',
    backgroundRepeat: 'no-repeat, repeat',
    backgroundBlendMode: 'multiply'
  };

  return (
    <div className="login-container" style={loginBackgroundStyle}>
      <div className="login-card">
        <div className="login-header">
          <img src="/logo192.png" alt="PT Pelindo" className="login-logo" />
          <h1>PT Pelindo</h1>
          <h2>Sistem Manajemen Proposal Pelatihan</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Masukkan username"
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
              required
              placeholder="Masukkan password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>SuperAdmin:</strong> superadmin / admin123</p>
            <p><strong>Admin:</strong> admin1 / admin123</p>
            <p><strong>User:</strong> user1 / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;