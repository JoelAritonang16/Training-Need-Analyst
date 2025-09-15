import { useState, useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/dashboards/AdminDashboard.jsx";
import SuperadminDashboard from "./components/dashboards/SuperadminDashboard.jsx";
import UserDashboard from "./components/dashboards/UserDashboard.jsx";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => { 
    setUser(userData); 
  };
  
  const handleLogout = async () => { 
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
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
    </div>
  );
}

export default App;
