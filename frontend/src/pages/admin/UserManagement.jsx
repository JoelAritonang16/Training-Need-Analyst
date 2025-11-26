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
  const [roleFilter, setRoleFilter] = useState('all'); // all | user | admin
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

  // Simple view detail modal state
  const [detailUser, setDetailUser] = useState(null);

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
        setLoading(false);
    }
  };

  // Filter users based on search query + role
  const filteredUsers = userList.filter(u => {
    const matchesSearch = [u.username, u.email, u.unit, u?.divisi?.nama, u?.branch?.nama, u?.anakPerusahaan?.nama]
      .filter(Boolean)
      .some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' ? true : (u.role || '').toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
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

  return (
    <div className="users-container">
      <PageHeader 
        title="Manajemen User"
        subtitle="Kelola akun USER dan ADMIN dalam sistem"
        actionButton={
          <button 
            className="um-btn um-btn-primary"
            onClick={handleAddUser}
            disabled={loading}
          >
            <span className="um-btn-icon">+</span>
            <span>Add New User</span>
          </button>
        }
      />

      {/* Top toolbar: filters + search */}
      <div className="um-toolbar">
        <div className="um-toolbar-left">
          <div className="um-filter-group">
            <label className="um-filter-label">Role</label>
            <select
              className="um-select"
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              <option value="all">All Role</option>
              <option value="user">USER</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>
        </div>

        <div className="um-toolbar-right">
          <div className="um-search">
            <span className="um-search-icon">
              <i className="fas fa-search" />
            </span>
            <input
              type="text"
              placeholder="Name or ID"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="um-table-card">
        <div className="um-table-scroll">
          <table className="um-table">
            <thead>
              <tr>
                <th>Full Name &amp; ID</th>
                <th>Role User</th>
                <th>Email</th>
                <th>Unit / Divisi</th>
                <th>Branch</th>
                <th>Status</th>
                <th className="um-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length > 0 ? (
                pagedUsers.map(user => {
                  const roleLabel = (user.role || '').toLowerCase() === 'admin' ? 'ADMIN' : 'USER';
                  const isActive = String(user.status || '').toLowerCase() === 'active' || user.status === true;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar">
                            {user.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="um-user-meta">
                            <div className="um-user-name">{user.username || '-'}</div>
                            <div className="um-user-id">
                              {user.unit || `ID: ${user.id || '-'}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`um-role-pill um-role-${roleLabel.toLowerCase()}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td>{user.email || '-'}</td>
                      <td>{user.role === 'user' ? (user.divisi?.nama || '-') : (user.anakPerusahaan?.nama || '-')}</td>
                      <td>{user.branch?.nama || '-'}</td>
                      <td>
                        <span className={`um-status-pill ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="um-col-actions">
                        <div className="um-actions">
                          <button
                            type="button"
                            className="um-icon-btn"
                            title="View details"
                            onClick={() => setDetailUser(user)}
                          >
                            <i className="fas fa-eye" />
                          </button>
                          <button
                            type="button"
                            className="um-icon-btn"
                            title="Edit user"
                            onClick={() => onEditUser ? onEditUser(user) : handleEditUser(user)}
                            disabled={loading}
                          >
                            <i className="fas fa-pen" />
                          </button>
                          <button
                            type="button"
                            className="um-icon-btn um-icon-delete"
                            title="Delete user"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="um-empty-state">
                      {currentUserRole === 'admin'
                        ? 'Belum ada pengguna yang dibuat untuk branch Anda. Mulai dengan menambahkan pengguna pertama.'
                        : 'Tidak ada pengguna ditemukan. Coba ubah filter atau tambahkan user baru.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="um-pagination">
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

      {/* Simple view detail modal */}
      {detailUser && (
        <div className="um-detail-backdrop" onClick={() => setDetailUser(null)}>
          <div className="um-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="um-detail-header">
              <div className="um-avatar lg">
                {detailUser.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3>{detailUser.username}</h3>
                <p>{detailUser.email || 'Tidak ada email'}</p>
              </div>
            </div>
            <div className="um-detail-body">
              <div className="um-detail-row">
                <span className="label">Role</span>
                <span className="value">{(detailUser.role || '').toUpperCase()}</span>
              </div>
              <div className="um-detail-row">
                <span className="label">Unit/Divisi</span>
                <span className="value">
                  {detailUser.role === 'user'
                    ? detailUser.divisi?.nama || '-'
                    : detailUser.anakPerusahaan?.nama || '-'}
                </span>
              </div>
              <div className="um-detail-row">
                <span className="label">Branch</span>
                <span className="value">{detailUser.branch?.nama || '-'}</span>
              </div>
              <div className="um-detail-row">
                <span className="label">Status</span>
                <span className="value">
                  {String(detailUser.status || '').toLowerCase() === 'active' || detailUser.status === true
                    ? 'Active'
                    : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="um-detail-footer">
              <button type="button" className="um-btn um-btn-secondary" onClick={() => setDetailUser(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
