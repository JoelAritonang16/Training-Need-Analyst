import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        // Hapus data dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Panggil callback untuk update state parent
        if (onLogout) {
          onLogout();
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap logout meskipun ada error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Dashboard</h2>
        </div>
        <div className="nav-user">
          <span>Selamat datang, {user?.username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Selamat Datang di Sistem</h1>
          <p>Role: {user?.role || 'User'}</p>
          <p>Waktu saat ini: {currentTime.toLocaleString('id-ID')}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Informasi User</h3>
            <div className="user-info">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Role:</strong> {user?.role || 'User'}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Menu Utama</h3>
            <div className="menu-list">
              <button className="menu-button">Kelola Data</button>
              <button className="menu-button">Laporan</button>
              <button className="menu-button">Pengaturan</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Status Sistem</h3>
            <div className="status-list">
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>Database: Online</span>
              </div>
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>Backend: Online</span>
              </div>
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>Frontend: Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
