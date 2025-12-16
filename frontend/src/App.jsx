import { useState, useEffect, Suspense, lazy } from "react";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Login from "./components/Login.jsx";
import { DatabaseDataProvider } from "./components/DatabaseDataProvider.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./App.css";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const SuperadminDashboard = lazy(() => import("./pages/superadmin/SuperadminDashboard.jsx"));
const UserDashboardWrapper = lazy(() => import("./components/UserDashboardWrapper.jsx"));


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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://localhost:5000/api/auth/check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Auth check error:', error);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData, token) => { 
    if (token) {
      localStorage.setItem('token', token);
    }
    
    setUser(userData);
  };
  
  const actuallyLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Logout error:', error);
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setShowLogoutConfirm(false);
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
    
    if (role === 'admin') {
      return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
          <AdminDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
        </Suspense>
      );
    }
    if (role === 'superadmin') {
      return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
          <SuperadminDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
        <UserDashboardWrapper user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      </Suspense>
    );
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;