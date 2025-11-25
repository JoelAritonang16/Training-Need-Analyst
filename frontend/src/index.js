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
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent default error display for timeout errors
  if (event.reason?.isTimeout || event.reason?.name === 'TimeoutError' || 
      event.reason?.message?.includes('timeout') || event.reason?.message?.includes('Timeout')) {
    console.warn('Timeout error caught globally, handling gracefully');
    event.preventDefault(); // Prevent default error display
    return;
  }
  
  // Prevent default error display for network errors
  if (event.reason?.isNetworkError || event.reason?.name === 'NetworkError') {
    console.warn('Network error caught globally, handling gracefully');
    event.preventDefault();
    return;
  }
});

// Global error handler untuk menangkap JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Prevent default error display for timeout errors
  if (event.error?.isTimeout || event.error?.name === 'TimeoutError' || 
      event.error?.message?.includes('timeout') || event.error?.message?.includes('Timeout')) {
    console.warn('Timeout error caught globally, handling gracefully');
    event.preventDefault();
    return;
  }
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
