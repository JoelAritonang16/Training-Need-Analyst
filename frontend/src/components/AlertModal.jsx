import React from 'react';
import './AlertModal.css';

const AlertModal = ({
  open,
  title = 'Notifikasi',
  message = '',
  type = 'info', // 'success', 'error', 'warning', 'info'
  confirmText = 'OK',
  onConfirm
}) => {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="alert-overlay" role="dialog" aria-modal="true" onClick={onConfirm}>
      <div className="alert-modal card-like" onClick={(e) => e.stopPropagation()}>
        <div className={`alert-icon ${type}`}>
          {getIcon()}
        </div>
        <div className="alert-header centered">
          <h2 className="alert-title">{title}</h2>
          <p className="alert-message">{message}</p>
        </div>
        <div className="alert-actions">
          <button className={`btn btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
