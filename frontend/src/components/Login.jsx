import React, { useState, useRef, useEffect } from 'react';
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
  const recaptchaRef = useRef(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState(null);

  // Load and render reCAPTCHA script
  useEffect(() => {
    let isMounted = true;
    let checkInterval = null;
    let script = null;

    const loadAndRenderRecaptcha = () => {
      // Check if already loaded
      if (window.grecaptcha && window.grecaptcha.render) {
        if (isMounted) {
          setRecaptchaLoaded(true);
        }
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      
      if (existingScript) {
        // Script exists, wait for it to load
        checkInterval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            if (isMounted) {
              setRecaptchaLoaded(true);
            }
            if (checkInterval) clearInterval(checkInterval);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval);
          if (!window.grecaptcha && isMounted) {
            console.error('reCAPTCHA script failed to load');
            setError('Gagal memuat reCAPTCHA. Silakan refresh halaman.');
          }
        }, 10000);
      } else {
        // Script doesn't exist, create it
        script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.grecaptcha && window.grecaptcha.render && isMounted) {
            setRecaptchaLoaded(true);
          }
        };
        script.onerror = () => {
          console.error('Failed to load reCAPTCHA script');
          if (isMounted) {
            setError('Gagal memuat reCAPTCHA. Silakan refresh halaman.');
          }
        };
        document.body.appendChild(script);
      }
    };

    loadAndRenderRecaptcha();

    // Cleanup function
    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      // Don't remove script as it might be used by other components
    };
  }, []);

  // Render reCAPTCHA widget when script is loaded
  useEffect(() => {
    // Prevent double rendering
    if (!recaptchaLoaded || !recaptchaRef.current || recaptchaWidgetId !== null) {
      return;
    }

    // Check if element already has a widget rendered (prevent double render)
    const hasIframe = recaptchaRef.current.querySelector('iframe[src*="recaptcha"]');
    const hasWidget = recaptchaRef.current.querySelector('[data-sitekey]');
    
    if (hasIframe || hasWidget) {
      console.log('reCAPTCHA widget already exists in element, skipping render');
      // Try to find existing widget ID
      try {
        // Get all widgets and find the one in this element
        const allWidgets = window.grecaptcha?.getResponse ? Object.keys(window.grecaptcha) : [];
        // This is a workaround - we'll just skip rendering if widget exists
        return;
      } catch (e) {
        // Ignore
      }
      return;
    }

    // Get site key from environment variable
    // Site Key yang benar dari Google reCAPTCHA Admin Console
    const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeeXxMsAAAAALPTcM9IhOkshVoHrbSyY6a95aKn';
    
    console.log('reCAPTCHA Site Key:', siteKey);
    console.log('Environment variable:', process.env.REACT_APP_RECAPTCHA_SITE_KEY);
    
    if (!siteKey || siteKey === 'YOUR_SITE_KEY') {
      console.error('reCAPTCHA site key is not configured');
      setError('Konfigurasi reCAPTCHA tidak lengkap. Silakan hubungi administrator.');
      return;
    }

    // Clear any existing content in the ref element
    if (recaptchaRef.current) {
      recaptchaRef.current.innerHTML = '';
    }

    try {
      const widgetId = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          // Optional: handle successful verification
          console.log('reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          // Optional: handle expired token
          console.log('reCAPTCHA token expired');
        },
        'error-callback': (error) => {
          // Handle error
          console.error('reCAPTCHA error callback:', error);
          console.error('Error details:', JSON.stringify(error));
          
          // Check for invalid site key error
          const errorMessage = error?.message || error?.toString() || '';
          if (errorMessage.includes('Invalid site key') || errorMessage.includes('invalid-site-key')) {
            setError('Site key reCAPTCHA tidak valid. Pastikan domain localhost sudah terdaftar dan Site Key benar.');
          } else if (error) {
            console.error('reCAPTCHA error:', error);
            // Don't show error to user for other errors, just log
          }
        }
      });
      
      if (widgetId !== null && widgetId !== undefined) {
        setRecaptchaWidgetId(widgetId);
        console.log('reCAPTCHA widget rendered successfully with ID:', widgetId);
      }
    } catch (err) {
      console.error('Error rendering reCAPTCHA:', err);
      if (err.message && err.message.includes('already been rendered')) {
        console.log('Widget already rendered, this is expected on re-render');
        // Try to find existing widget
        // For now, just log and don't show error to user
      } else {
        setError('Gagal memuat reCAPTCHA. Silakan refresh halaman.');
      }
    }

    // Cleanup function - don't reset widget on unmount
    return () => {
      // Widget will persist, which is fine
    };
  }, [recaptchaLoaded, recaptchaWidgetId]);

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
      // Get reCAPTCHA token
      let recaptchaToken = null;
      
      if (window.grecaptcha && recaptchaWidgetId !== null) {
        try {
          recaptchaToken = window.grecaptcha.getResponse(recaptchaWidgetId);
        } catch (err) {
          console.error('Error getting reCAPTCHA token:', err);
        }
      }
      
      if (!recaptchaToken) {
        setError('Harap verifikasi bahwa Anda bukan robot');
        setLoading(false);
        return;
      }

      // Send login request with reCAPTCHA token
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: recaptchaToken
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reset reCAPTCHA
        if (window.grecaptcha && recaptchaWidgetId !== null) {
          try {
            window.grecaptcha.reset(recaptchaWidgetId);
          } catch (err) {
            console.error('Error resetting reCAPTCHA:', err);
          }
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
        
        setFormData({ username: '', password: '' });
      } else {
        setError(data.message);
        // Reset reCAPTCHA on error
        if (window.grecaptcha && recaptchaWidgetId !== null) {
          try {
            window.grecaptcha.reset(recaptchaWidgetId);
          } catch (err) {
            console.error('Error resetting reCAPTCHA:', err);
          }
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      console.error('Login error:', err);
      // Reset reCAPTCHA on error
      if (window.grecaptcha && recaptchaWidgetId !== null) {
        try {
          window.grecaptcha.reset(recaptchaWidgetId);
        } catch (err) {
          console.error('Error resetting reCAPTCHA:', err);
        }
      }
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

            {/* Google reCAPTCHA v2 */}
            <div className="form-group recaptcha-container">
              <div ref={recaptchaRef} id="recaptcha-widget"></div>
              {!recaptchaLoaded && (
                <div style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  color: '#64748b', 
                  fontSize: '0.875rem' 
                }}>
                  Memuat reCAPTCHA...
                </div>
              )}
              {recaptchaLoaded && recaptchaWidgetId === null && (
                <div style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  color: '#ef4444', 
                  fontSize: '0.875rem' 
                }}>
                  Gagal memuat reCAPTCHA. Silakan refresh halaman.
                </div>
              )}
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