import { useState, useEffect } from "react";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Login from "./components/Login.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard.jsx";
import UserDashboardWrapper from "./components/UserDashboardWrapper.jsx";
import { DatabaseDataProvider } from "./components/DatabaseDataProvider.jsx";
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
      console.log('=== CHECKING AUTH ===');
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found, user not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Checking auth with token:', token);
      const response = await fetch('http://localhost:5000/api/auth/check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Auth check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth check response data:', data);
        
        if (data.success) {
          console.log('✅ User authenticated:', data.user.username);
          setUser(data.user);
        } else {
          console.log('❌ Auth check failed, clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('❌ Auth check failed with status:', response.status);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
      console.log('=== AUTH CHECK END ===');
    }
  };

  const handleLoginSuccess = (userData, token) => { 
    console.log('=== LOGIN SUCCESS HANDLER ===');
    console.log('User data:', userData);
    console.log('Token:', token);
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
    }
    
    setUser(userData);
    console.log('User state updated');
    console.log('=== LOGIN SUCCESS HANDLER END ===');
  };
  
  const actuallyLogout = async () => {
    try {
      console.log('=== LOGOUT ===');
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
      localStorage.removeItem('user');
      setShowLogoutConfirm(false);
      console.log('=== LOGOUT END ===');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleUserUpdate = (updatedUserData) => {
    // Update user state with new data
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
    
    // Also update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      localStorage.setItem('user', JSON.stringify({
        ...parsedUser,
        ...updatedUserData
      }));
    }
  };

  const renderDashboard = () => {
    const role = (user?.role || '').toLowerCase();
    console.log('Rendering dashboard for role:', role);
    
    if (role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
    if (role === 'superadmin') return <SuperadminDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
    return <UserDashboardWrapper user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
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
      <DatabaseDataProvider>
        {user ? renderDashboard() : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        <ConfirmModal
          open={showLogoutConfirm}
          message="Anda yakin ingin keluar dari sistem?"
          confirmText="Ya"
          cancelText="Batal"
          onConfirm={actuallyLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </DatabaseDataProvider>
    </div>
  );
}

export default App;