import React, { useState, useEffect } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';
import './UserManagement.css';

const UserManagement = ({ 
  users = [], 
  onAddUser, 
  onEditUser, 
  onDeleteUser, 
  onToggleStatus, 
  currentUserRole = 'admin', 
  onNavigate 
}) => {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState(users);
  const [divisiList, setDivisiList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [anakPerusahaanList, setAnakPerusahaanList] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    email: '',
    unit: '',
    divisiId: '',
    branchId: '',
    anakPerusahaanId: ''
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [compactMode, setCompactMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('username');
  const [sortDir, setSortDir] = useState('asc');

  // Modal states
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    userId: null,
    isBulk: false
  });

  useEffect(() => {
    fetchUsers();
    fetchDivisiAndBranch();
  }, [currentUserRole]);

  const fetchDivisiAndBranch = async () => {
    try {
      const promises = [branchAPI.getAll()];
      
      // Only fetch divisi and anak perusahaan if current user is superadmin
      if (currentUserRole === 'superadmin') {
        promises.push(divisiAPI.getAll(), anakPerusahaanAPI.getAll());
      }
      
      const results = await Promise.all(promises);
      
      if (results[0].success) {
        setBranchList(results[0].branch || []);
      }
      
      if (currentUserRole === 'superadmin') {
        if (results[1]?.success) {
          setDivisiList(results[1].divisi || []);
        }
        if (results[2]?.success) {
          setAnakPerusahaanList(results[2].anakPerusahaan || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5000/api/users?currentUserRole=${currentUserRole}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        console.log('=== FRONTEND FETCH USERS ===');
        console.log('Users fetched:', data.users);
        data.users.forEach(user => {
          console.log(`User ${user.username}:`, {
            divisiId: user.divisiId,
            branchId: user.branchId,
            divisi: user.divisi?.nama,
            branch: user.branch?.nama
          });
        });
        setUserList(data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    if (onAddUser) {
      onAddUser();
    } else if (onNavigate) {
      onNavigate('user-create');
    } else {
      setShowAddModal(true);
    }
  };

  const handleEditUser = (user) => {
    if (typeof user === 'string') {
      // Handle case where userId is passed instead of user object
      user = userList.find(u => u.id === user);
    }
    
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
        email: user.email || '',
        unit: user.unit || '',
        divisiId: user.divisiId || '',
        branchId: user.branchId || '',
        anakPerusahaanId: user.anakPerusahaanId || ''
      });
      setShowEditModal(true);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/role-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          currentUserRole,
          divisiId: formData.divisiId || null,
          branchId: formData.branchId || null,
          anakPerusahaanId: formData.anakPerusahaanId || null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchUsers();
        const roleText = formData.role === 'admin' ? 'Admin' : 'User';
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Akun ${roleText} "${formData.username}" berhasil ditambahkan ke sistem.`,
          type: 'success'
        });
        // Reset form
        setFormData({
          username: '',
          password: '',
          role: 'user',
          email: '',
          unit: '',
          divisiId: '',
          branchId: '',
          anakPerusahaanId: ''
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menambahkan',
          message: data.message || 'Gagal menambahkan user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menambahkan user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const requestData = {
        username: formData.username,
        role: formData.role,
        email: formData.email,
        unit: formData.unit,
        currentUserRole,
        divisiId: formData.divisiId || null,
        branchId: formData.branchId || null,
        anakPerusahaanId: formData.anakPerusahaanId || null
      };
      
      console.log('=== FRONTEND EDIT USER REQUEST ===');
      console.log('User ID:', selectedUser.id);
      console.log('Request Data:', requestData);
      console.log('Form Data:', formData);
      
      const response = await fetch(`http://localhost:5000/api/users/role-based/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      console.log('=== FRONTEND EDIT USER RESPONSE ===');
      console.log('Response:', data);
      
      if (data.success) {
        setShowEditModal(false);
        fetchUsers();
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Data user "${formData.username}" berhasil diperbarui.`,
          type: 'success'
        });
      } else {
        console.log('Edit failed:', data.message);
        setAlertModal({
          open: true,
          title: 'Gagal Memperbarui',
          message: data.message || 'Gagal mengupdate user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat mengupdate user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setConfirmDelete({
      open: true,
      userId: userId,
      isBulk: false
    });
  };

  const confirmDeleteAction = async () => {
    const userId = confirmDelete.userId;
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/role-based/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentUserRole })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        const deletedUser = userList.find(u => u.id === userId);
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `User "${deletedUser?.username || 'yang dipilih'}" berhasil dihapus dari sistem.`,
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menghapus',
          message: data.message || 'Gagal menghapus user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, userId: null, isBulk: false });
    }
  };

  // Get unique roles for filter options
  const roleOptions = currentUserRole === 'superadmin' 
    ? ['superadmin', 'admin', 'user'] 
    : ['admin', 'user'];

  // Filter users based on search and filters
  const filteredUsers = userList.filter(user => {
    const matchesSearch = [user.username, user.email, user.unit, 
                         user?.divisi?.nama, user?.branch?.nama, 
                         user?.anakPerusahaan?.nama]
      .filter(Boolean)
      .some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const userStatus = (user.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const getVal = (u) => {
      if (sortBy === 'username') return (u.username || '').toLowerCase();
      if (sortBy === 'role') return (u.role || '').toLowerCase();
      if (sortBy === 'status') return ((u.status || '') + '').toLowerCase();
      return (u.username || '').toLowerCase();
    };
    const va = getVal(a), vb = getVal(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const pagedUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pagedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDelete({
      open: true,
      userId: null,
      isBulk: true
    });
  };

  const confirmBulkDeleteAction = async () => {
    try {
      setLoading(true);
      const idsToDelete = Array.from(selectedIds);
      let successCount = 0;
      let failCount = 0;

      for (const id of idsToDelete) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/role-based/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ currentUserRole })
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      fetchUsers();
      setSelectedIds(new Set());
      
      if (failCount === 0) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `${successCount} user berhasil dihapus dari sistem.`,
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Sebagian Gagal',
          message: `${successCount} user berhasil dihapus, ${failCount} user gagal dihapus.`,
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, userId: null, isBulk: false });
    }
  };

  const handleBulkToggleStatus = (target) => {
    // Local optimistic: flip/set status, also call onToggleStatus if provided.
    setUserList(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: target } : u));
    if (onToggleStatus) {
      selectedIds.forEach(id => onToggleStatus(id));
    }
    setSelectedIds(new Set());
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear role-specific fields when role changes
      divisiId: newRole === 'user' ? prev.divisiId : '',
      anakPerusahaanId: newRole === 'admin' ? prev.anakPerusahaanId : '',
      branchId: newRole === 'user' ? prev.branchId : '' // Clear branch for admin role
    }));
  };

  const getRoleOptions = () => {
    if (currentUserRole === 'superadmin') {
      return [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ];
    } else {
      return [{ value: 'user', label: 'User' }];
    }
  };
  // Helper functions


  return (
    <div className="users-container">
      <PageHeader 
        title="Manajemen Pengguna"
        subtitle="Kelola data pengguna dalam sistem"
        actionButton={
          <button 
            className="btn btn-primary" 
            onClick={handleAddUser}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500
            }}
          >
            <i className="fas fa-plus"></i>
            <span>Tambah Pengguna</span>
          </button>
        }
      />
      
      <div className="filters-section" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="filters" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div className="filter-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              fontWeight: 500
            }}>Role</label>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: '0.875rem',
                width: '100%'
              }}
            >
              <option value="all">Semua Role</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              fontWeight: 500
            }}>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: '0.875rem',
                width: '100%'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              fontWeight: 500
            }}>Cari</label>
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="filter-select"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className={`user-list ${compactMode ? 'compact' : ''}`}>
          {pagedUsers.length > 0 ? (
            pagedUsers.map(user => (
              <div key={user.id} className="user-item-card">
                <div className={`avatar role-${user.role}`}>
                  {user.username?.charAt(0)?.toUpperCase()}
                </div>
                <div className="user-meta">
                  <div className="top-line">
                    <strong className="username">{user.username}</strong>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                    <span className="status-dot" data-status={user.status}></span>
                  </div>
                  <div className="sub-line">
                    <span className="email">{user.email || 'Tidak ada email'}</span>
                  </div>
                  <div className="sub-line">
                    <span>
                      {user.role === 'user' ? 'Divisi' : 'Anak Perusahaan'}:{' '}
                      {user.role === 'user'
                        ? user.divisi?.nama || 'Belum dipilih'
                        : user.anakPerusahaan?.nama || 'Belum dipilih'}
                    </span>
                    <span> | Branch: {user.branch?.nama || 'Belum dipilih'}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    className="btn-ghost"
                    onClick={() => onEditUser ? onEditUser(user) : handleEditUser(user)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={loading}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div>
                {currentUserRole === 'admin'
                  ? 'Belum ada pengguna yang dibuat untuk branch Anda. Mulai dengan menambahkan pengguna pertama.'
                  : 'Tidak ada pengguna ditemukan'}
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: '12px' }}
                onClick={handleAddUser}
                disabled={loading}
              >
                + Tambah Pengguna
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Sebelumnya
            </button>
            <span>Halaman {currentPage} dari {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        open={confirmDelete?.open || false}
        title="Konfirmasi Hapus"
        message={
          confirmDelete?.isBulk
            ? `Apakah Anda yakin ingin menghapus ${selectedIds.size} user terpilih?`
            : `Apakah Anda yakin ingin menghapus user "${userList.find(u => u.id === confirmDelete?.userId)?.username || 'ini'}"?`
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, userId: null, isBulk: false })}
        disabled={loading}
      />

      {/* Alert/Notification Modal */}
      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, open: false })}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />
    </div>
  );
};

export default UserManagement;
