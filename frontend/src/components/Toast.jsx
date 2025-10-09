import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="toast-overlay" onClick={onClose}>
      <div className={`toast toast-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="toast-content">
          <span className="toast-icon">
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{message}</span>
        </div>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
