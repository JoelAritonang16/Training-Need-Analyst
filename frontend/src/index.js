import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
}

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonString = String(reason || '');
  const reasonMessage = reason?.message || reasonString || '';
  const lowerMessage = reasonMessage.toLowerCase();
  
  if (reason?.isTimeout || 
      reason?.name === 'TimeoutError' || 
      reasonString === 'Timeout' ||
      reasonString.toLowerCase() === 'timeout' ||
      lowerMessage.includes('timeout') || 
      lowerMessage.includes('server tidak merespons') ||
      lowerMessage.includes('request timeout') ||
      lowerMessage.includes('tidak merespons')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Timeout error handled:', reasonMessage);
    return;
  }
  
  if (reason?.isNetworkError || 
      reason?.name === 'NetworkError' ||
      lowerMessage.includes('failed to fetch') || 
      lowerMessage.includes('networkerror') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('tidak dapat terhubung ke server') ||
      lowerMessage.includes('network request failed')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Network error handled:', reasonMessage);
    return;
  }
  
  console.error('Unhandled promise rejection:', reason);
});

window.addEventListener('error', (event) => {
  const error = event.error;
  const errorString = String(error || event.message || '');
  const errorMessage = error?.message || errorString || '';
  const lowerMessage = errorMessage.toLowerCase();
  
  if (error?.isTimeout || 
      error?.name === 'TimeoutError' || 
      errorString === 'Timeout' ||
      errorString.toLowerCase() === 'timeout' ||
      lowerMessage.includes('timeout') || 
      lowerMessage.includes('server tidak merespons') ||
      lowerMessage.includes('request timeout') ||
      lowerMessage.includes('tidak merespons')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Timeout error handled:', errorMessage);
    return;
  }
  
  if (error?.isNetworkError || 
      error?.name === 'NetworkError' ||
      lowerMessage.includes('failed to fetch') || 
      lowerMessage.includes('networkerror') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('tidak dapat terhubung ke server') ||
      lowerMessage.includes('network request failed')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Network error handled:', errorMessage);
    return;
  }
  
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
