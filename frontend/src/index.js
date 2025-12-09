import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Unregister any existing service workers to prevent cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
}

// Global error handler untuk menangkap unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonString = String(reason || '');
  const reasonMessage = reason?.message || reasonString;
  
  // Prevent default error display for timeout errors (check all possible variations)
  if (reason?.isTimeout || 
      reason?.name === 'TimeoutError' || 
      reasonString === 'Timeout' ||
      reasonMessage?.includes('timeout') || 
      reasonMessage?.includes('Timeout') ||
      reasonMessage?.includes('Request timeout') ||
      reasonMessage?.includes('Server tidak merespons')) {
    // Silently handle timeout - component should handle it with user-friendly message
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  
  // Prevent default error display for network errors
  if (reason?.isNetworkError || 
      reason?.name === 'NetworkError' ||
      reasonMessage?.includes('Failed to fetch') || 
      reasonMessage?.includes('NetworkError') ||
      reasonMessage?.includes('Tidak dapat terhubung ke server')) {
    // Silently handle network errors - component should handle it with user-friendly message
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  
  // Log other unhandled rejections (but don't prevent default for debugging)
  console.error('Unhandled promise rejection:', reason);
});

// Global error handler untuk menangkap JavaScript errors
window.addEventListener('error', (event) => {
  const error = event.error;
  const errorString = String(error || event.message || '');
  const errorMessage = error?.message || errorString;
  
  // Prevent default error display for timeout errors (check all possible variations)
  if (error?.isTimeout || 
      error?.name === 'TimeoutError' || 
      errorString === 'Timeout' ||
      errorMessage?.includes('timeout') || 
      errorMessage?.includes('Timeout') ||
      errorMessage?.includes('Request timeout') ||
      errorMessage?.includes('Server tidak merespons')) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  
  // Prevent default error display for network errors
  if (error?.isNetworkError || 
      error?.name === 'NetworkError' ||
      errorMessage?.includes('Failed to fetch') || 
      errorMessage?.includes('NetworkError') ||
      errorMessage?.includes('Tidak dapat terhubung ke server')) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  
  // Log other errors
  console.error('Global error:', error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
