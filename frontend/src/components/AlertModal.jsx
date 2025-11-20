import React from 'react';
import { LuCheckCircle2, LuXCircle, LuAlertTriangle, LuInfo } from 'react-icons/lu';
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
    const iconSize = 48;
    switch (type) {
      case 'success':
        return <LuCheckCircle2 size={iconSize} />;
      case 'error':
        return <LuXCircle size={iconSize} />;
      case 'warning':
        return <LuAlertTriangle size={iconSize} />;
      default:
        return <LuInfo size={iconSize} />;
    }
  };

  const getTitleText = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Berhasil';
      case 'error':
        return 'Terjadi Kesalahan';
      case 'warning':
        return 'Peringatan';
      default:
        return 'Informasi';
    }
  };

  return (
    <div className="alert-overlay" role="dialog" aria-modal="true" onClick={onConfirm}>
      <div className="alert-modal card-like" onClick={(e) => e.stopPropagation()}>
        <div className={`alert-icon ${type}`}>
          {getIcon()}
        </div>
        <div className="alert-header centered">
          <h2 className="alert-title">{getTitleText()}</h2>
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
