import React, { useState, useEffect } from 'react';
import './EvaluationModal.css';

const EvaluationModal = ({
  open,
  title = 'Evaluasi Realisasi',
  message = 'Silakan isi evaluasi realisasi sebelum mengkonfirmasi.',
  confirmText = 'Konfirmasi Realisasi',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}) => {
  const [evaluasi, setEvaluasi] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEvaluasi('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!evaluasi || evaluasi.trim() === '') {
      setError('Evaluasi Realisasi wajib diisi');
      return;
    }
    setError('');
    onConfirm(evaluasi.trim());
  };

  const handleCancel = () => {
    setEvaluasi('');
    setError('');
    onCancel();
  };

  if (!open) return null;

  return (
    <div className="evaluation-overlay" role="dialog" aria-modal="true" onClick={handleCancel}>
      <div className="evaluation-modal card-like" onClick={(e) => e.stopPropagation()}>
        <div className="evaluation-header">
          <h2 className="evaluation-title">{title}</h2>
          <p className="evaluation-message">{message}</p>
        </div>
        <div className="evaluation-body">
          <div className="evaluation-form-group">
            <label htmlFor="evaluasi-realisasi" className="evaluation-label">
              Evaluasi Realisasi <span className="required">*</span>
            </label>
            <textarea
              id="evaluasi-realisasi"
              className={`evaluation-textarea ${error ? 'error' : ''}`}
              value={evaluasi}
              onChange={(e) => {
                setEvaluasi(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masukkan evaluasi realisasi proposal pelatihan ini..."
              rows={6}
              required
            />
            {error && <span className="evaluation-error">{error}</span>}
          </div>
        </div>
        <div className="evaluation-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>{cancelText}</button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={!evaluasi || evaluasi.trim() === ''}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;

