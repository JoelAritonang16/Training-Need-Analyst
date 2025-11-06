import React, { useState } from 'react';
import './AuditLogs.css';

const AuditLogs = ({ auditLogs }) => {
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredLogs = auditLogs.filter(log => {
    const actionMatch = filterAction === 'all' || log.action === filterAction;
    const userMatch = filterUser === 'all' || log.user === filterUser;
    
    let dateMatch = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      dateMatch = logDate >= startDate && logDate <= endDate;
    }
    
    return actionMatch && userMatch && dateMatch;
  });

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  const getActionIcon = (action) => {
    switch (action) {
      case 'SUBMIT_PROPOSAL': return 'SUBMIT';
      case 'APPROVE_PROPOSAL': return 'APPROVE';
      case 'REJECT_PROPOSAL': return 'REJECT';
      case 'FINAL_APPROVE': return 'FINAL_OK';
      case 'FINAL_REJECT': return 'FINAL_NO';
      case 'CREATE_USER': return 'CREATE';
      case 'UPDATE_USER': return 'UPDATE';
      case 'DELETE_USER': return 'DELETE';
      case 'LOGIN': return 'LOGIN';
      case 'LOGOUT': return 'LOGOUT';
      case 'SYSTEM_CONFIG': return 'CONFIG';
      case 'BACKUP_SYSTEM': return 'BACKUP';
      case 'RESTORE_SYSTEM': return 'RESTORE';
      default: return 'LOG';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'SUBMIT_PROPOSAL': return '#0271B6';
      case 'APPROVE_PROPOSAL': 
      case 'FINAL_APPROVE': return '#0c8a5d';
      case 'REJECT_PROPOSAL': 
      case 'FINAL_REJECT': return '#e17055';
      case 'CREATE_USER': return '#00cec9';
      case 'UPDATE_USER': return '#fdcb6e';
      case 'DELETE_USER': return '#fd79a8';
      case 'LOGIN': return '#6c5ce7';
      case 'LOGOUT': return '#a29bfe';
      case 'SYSTEM_CONFIG': return '#2d3436';
      case 'BACKUP_SYSTEM': 
      case 'RESTORE_SYSTEM': return '#636e72';
      default: return '#74b9ff';
    }
  };

  return (
    <div className="audit-logs">
      <div className="content-header">
        <div>
          <h2>Log Audit Sistem</h2>
          <p>Pantau semua aktivitas dan perubahan dalam sistem</p>
        </div>
      </div>

      <div className="logs-filter">
        <select 
          className="filter-select"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">Semua Aksi</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>
              {action.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        
        <select 
          className="filter-select"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="all">Semua Pengguna</option>
          {uniqueUsers.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        
        <input
          type="date"
          className="filter-date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          placeholder="Tanggal Mulai"
        />
        
        <input
          type="date"
          className="filter-date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          placeholder="Tanggal Akhir"
        />
      </div>

      <div className="logs-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredLogs.length}</span>
          <span className="stat-label">Total Log</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{uniqueUsers.length}</span>
          <span className="stat-label">Pengguna Aktif</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{uniqueActions.length}</span>
          <span className="stat-label">Jenis Aksi</span>
        </div>
      </div>

      <div className="logs-list">
        {filteredLogs.map(log => (
          <div key={log.id} className="log-item">
            <div className="log-icon" style={{ backgroundColor: getActionColor(log.action) }}>
              {getActionIcon(log.action)}
            </div>
            <div className="log-content">
              <div className="log-header">
                <span className="log-user">{log.user}</span>
                <span className="log-action">{log.action.replace(/_/g, ' ')}</span>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="log-details">
                <span className="log-target">Target: {log.target}</span>
                {log.details && (
                  <span className="log-description">{log.details}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">-</div>
          <h3>Tidak Ada Log Ditemukan</h3>
          <p>Tidak ada aktivitas yang sesuai dengan filter yang dipilih.</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
