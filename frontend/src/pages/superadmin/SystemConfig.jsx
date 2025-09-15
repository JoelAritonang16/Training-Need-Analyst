import React, { useState } from 'react';
import './SystemConfig.css';

const SystemConfig = ({ onSaveConfig, onBackupSystem, onRestoreSystem }) => {
  const [config, setConfig] = useState({
    maxProposalPerUser: 10,
    approvalTimeout: 30,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx',
    sessionTimeout: 60,
    passwordMinLength: 8,
    requireSpecialChars: true
  });

  const [roles, setRoles] = useState([
    { id: 1, name: 'User', permissions: ['submit_proposal', 'view_own_proposals', 'edit_profile'] },
    { id: 2, name: 'Admin', permissions: ['approve_proposals', 'manage_users', 'view_reports', 'submit_proposal', 'view_own_proposals', 'edit_profile'] },
    { id: 3, name: 'Super Admin', permissions: ['final_approval', 'system_config', 'audit_logs', 'backup_restore', 'approve_proposals', 'manage_users', 'view_reports', 'submit_proposal', 'view_own_proposals', 'edit_profile'] }
  ]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = () => {
    onSaveConfig(config);
    console.log('Configuration saved:', config);
  };

  return (
    <div className="system-config">
      <div className="content-header">
        <div>
          <h2>Konfigurasi Sistem</h2>
          <p>Kelola pengaturan global dan konfigurasi sistem</p>
        </div>
      </div>

      <div className="config-sections">
        <div className="config-section">
          <h3>Pengaturan Umum</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Maksimal Usulan per Pengguna</label>
              <input
                type="number"
                value={config.maxProposalPerUser}
                onChange={(e) => handleConfigChange('maxProposalPerUser', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div className="config-item">
              <label>Timeout Persetujuan (hari)</label>
              <input
                type="number"
                value={config.approvalTimeout}
                onChange={(e) => handleConfigChange('approvalTimeout', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <div className="config-item">
              <label>Timeout Sesi (menit)</label>
              <input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>
            <div className="config-item">
              <label>Maksimal Ukuran File (MB)</label>
              <input
                type="number"
                value={config.maxFileSize}
                onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Keamanan</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Panjang Minimum Password</label>
              <input
                type="number"
                value={config.passwordMinLength}
                onChange={(e) => handleConfigChange('passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="20"
              />
            </div>
            <div className="config-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.requireSpecialChars}
                  onChange={(e) => handleConfigChange('requireSpecialChars', e.target.checked)}
                />
                Wajib Karakter Khusus dalam Password
              </label>
            </div>
            <div className="config-item">
              <label>Tipe File yang Diizinkan</label>
              <input
                type="text"
                value={config.allowedFileTypes}
                onChange={(e) => handleConfigChange('allowedFileTypes', e.target.value)}
                placeholder="pdf,doc,docx,xls,xlsx"
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Notifikasi & Backup</h3>
          <div className="config-grid">
            <div className="config-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.emailNotifications}
                  onChange={(e) => handleConfigChange('emailNotifications', e.target.checked)}
                />
                Aktifkan Notifikasi Email
              </label>
            </div>
            <div className="config-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
                />
                Backup Otomatis
              </label>
            </div>
            <div className="config-item">
              <label>Frekuensi Backup</label>
              <select
                value={config.backupFrequency}
                onChange={(e) => handleConfigChange('backupFrequency', e.target.value)}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Peran & Hak Akses</h3>
          <div className="roles-list">
            {roles.map(role => (
              <div key={role.id} className="role-item">
                <h4>{role.name}</h4>
                <div className="permissions">
                  {role.permissions.map(permission => (
                    <span key={permission} className="permission-badge">
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3>Backup & Restore</h3>
          <div className="backup-actions">
            <button 
              className="btn-backup"
              onClick={onBackupSystem}
            >
              <span className="btn-icon">💾</span>
              Backup Sistem Sekarang
            </button>
            <button 
              className="btn-restore"
              onClick={onRestoreSystem}
            >
              <span className="btn-icon">🔄</span>
              Restore dari Backup
            </button>
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button 
          className="btn-save"
          onClick={handleSaveConfig}
        >
          Simpan Konfigurasi
        </button>
        <button className="btn-cancel">
          Batalkan Perubahan
        </button>
      </div>
    </div>
  );
};

export default SystemConfig;
