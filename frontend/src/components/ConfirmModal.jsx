import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  open,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal card-like">
        <div className="confirm-header centered">
          <img src="/LogoPelindo.png" alt="PT Pelindo" className="confirm-logo" />
          <h2 className="confirm-title">{title}</h2>
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-actions two-buttons">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


