import { useState, useEffect } from "react";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Login from "./components/Login";
import AdminDashboard from "./components/dashboards/AdminDashboard.jsx";
import SuperadminDashboard from "./components/dashboards/SuperadminDashboard.jsx";
import UserDashboard from "./components/dashboards/UserDashboard.jsx";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => { 
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData); 
  };
  
  const actuallyLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setShowLogoutConfirm(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const renderDashboard = () => {
    const role = (user?.role || '').toLowerCase();
    if (role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
    if (role === 'superadmin') return <SuperadminDashboard user={user} onLogout={handleLogout} />;
    return <UserDashboard user={user} onLogout={handleLogout} />;
  };

  if (loading) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {user ? renderDashboard() : (
        <Login onLoginSuccess={handleLogin} />
      )}
      <ConfirmModal
        open={showLogoutConfirm}
        
        message="Anda yakin ingin keluar dari sistem?"
        confirmText="Logout"
        cancelText="Batal"
        onConfirm={actuallyLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default App;
