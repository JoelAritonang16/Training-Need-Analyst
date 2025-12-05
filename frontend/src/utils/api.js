// API utility functions
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function with timeout
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  // Increase timeout for endpoints that might take longer
  const defaultTimeout = endpoint.includes('/reports') || endpoint.includes('/rekap') ? 60000 : 45000; // 60s for reports, 45s default
  const timeout = options.timeout || defaultTimeout;
  // Remove timeout from options before passing to fetch
  const { timeout: _, ...fetchOptions } = options;
  const config = {
    headers: getAuthHeaders(),
    credentials: 'include',
    ...fetchOptions
  };

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      throw new Error(`Endpoint tidak ditemukan: ${endpoint}`);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    
    // Handle timeout specifically - return user-friendly error
    if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('Timeout')) {
      const timeoutError = new Error(`Request timeout: Server tidak merespons dalam ${timeout/1000} detik. Silakan coba lagi atau periksa koneksi server.`);
      timeoutError.name = 'TimeoutError';
      timeoutError.isTimeout = true;
      return Promise.reject(timeoutError);
    }
    
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error(`Tidak dapat terhubung ke server. Pastikan server backend berjalan di ${API_BASE_URL}`);
      networkError.name = 'NetworkError';
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    // Re-throw other errors
    return Promise.reject(error);
  }
};

// Specific API functions
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  check: async () => {
    return apiCall('/api/auth/check');
  },
  
  logout: async () => {
    return apiCall('/api/auth/logout', {
      method: 'POST'
    });
  }
};

export const trainingProposalAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    if (filters.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/training-proposals?${queryString}` : '/api/training-proposals';
    return apiCall(endpoint);
  },
  
  getById: async (id) => {
    return apiCall(`/api/training-proposals/${id}`);
  },
  
  create: async (data) => {
    const result = await apiCall('/api/training-proposals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result;
  },
  
  update: async (id, data) => {
    return apiCall(`/api/training-proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/training-proposals/${id}`, {
      method: 'DELETE'
    });
  },
  
  getReportsData: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/training-proposals/reports/data?${queryString}` : '/api/training-proposals/reports/data';
    return apiCall(endpoint);
  },
  
  exportReports: async (filters = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/training-proposals/reports/export?${queryString}` : '/api/training-proposals/reports/export';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengexport laporan');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with filter info
    let filename = `Laporan_Pelatihan_Terlaksana_${new Date().toISOString().split('T')[0]}`;
    filename += '.xlsx';
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// Divisi API
export const divisiAPI = {
  getAll: async () => {
    return apiCall('/api/divisi');
  },
  
  getById: async (id) => {
    return apiCall(`/api/divisi/${id}`);
  },
  
  create: async (data) => {
    return apiCall('/api/divisi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    return apiCall(`/api/divisi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/divisi/${id}`, {
      method: 'DELETE'
    });
  }
};

// Branch API
export const branchAPI = {
  getAll: async () => {
    return apiCall('/api/branch');
  },
  
  getById: async (id) => {
    return apiCall(`/api/branch/${id}`);
  },
  
  create: async (data) => {
    return apiCall('/api/branch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    return apiCall(`/api/branch/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/branch/${id}`, {
      method: 'DELETE'
    });
  }
};

// Anak Perusahaan API
export const anakPerusahaanAPI = {
  getAll: async () => {
    return apiCall('/api/anak-perusahaan');
  },
  
  getById: async (id) => {
    return apiCall(`/api/anak-perusahaan/${id}`);
  },
  
  create: async (data) => {
    return apiCall('/api/anak-perusahaan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    return apiCall(`/api/anak-perusahaan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/anak-perusahaan/${id}`, {
      method: 'DELETE'
    });
  },
  
  getBranches: async (id) => {
    return apiCall(`/api/anak-perusahaan/${id}/branches`);
  },
  
  addBranch: async (id, branchId) => {
    return apiCall(`/api/anak-perusahaan/${id}/branches`, {
      body: JSON.stringify({ branchId })
    });
  },
  
  removeBranch: async (id, branchId) => {
    return apiCall(`/api/anak-perusahaan/${id}/branches/${branchId}`, {
      method: 'DELETE'
    });
  }
};

// User Profile API
export const userProfileAPI = {
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};

// Draft TNA 2026 API
export const draftTNA2026API = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/draft-tna-2026?${queryString}` : '/api/draft-tna-2026';
    return apiCall(endpoint);
  },
  
  getById: async (id) => {
    return apiCall(`/api/draft-tna-2026/${id}`);
  },
  
  create: async (data) => {
    return apiCall('/api/draft-tna-2026', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    return apiCall(`/api/draft-tna-2026/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/draft-tna-2026/${id}`, {
      method: 'DELETE'
    });
  },
  
  submit: async (id) => {
    return apiCall(`/api/draft-tna-2026/${id}/submit`, {
      method: 'PATCH'
    });
  },
  
  getRekapGabungan: async () => {
    return apiCall('/api/draft-tna-2026/rekap/gabungan', {
      timeout: 90000 // 90 seconds for rekap gabungan as it processes 20 branches + 18 divisions
    });
  }
};

// Tempat Diklat Realisasi API
export const tempatDiklatRealisasiAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.bulan) queryParams.append('bulan', filters.bulan);
    if (filters.tahun) queryParams.append('tahun', filters.tahun);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/tempat-diklat-realisasi?${queryString}` : '/api/tempat-diklat-realisasi';
    return apiCall(endpoint);
  },
  
  getRekapPerBulan: async (tahun) => {
    const queryParams = new URLSearchParams();
    if (tahun) queryParams.append('tahun', tahun);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/tempat-diklat-realisasi/rekap/bulan?${queryString}` : '/api/tempat-diklat-realisasi/rekap/bulan';
    return apiCall(endpoint);
  },
  
  create: async (data) => {
    return apiCall('/api/tempat-diklat-realisasi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    return apiCall(`/api/tempat-diklat-realisasi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/tempat-diklat-realisasi/${id}`, {
      method: 'DELETE'
    });
  }
};

// Notification API
export const notificationAPI = {
  getAll: async () => {
    return apiCall('/api/notifications');
  },
  
  getUnreadCount: async () => {
    return apiCall('/api/notifications/unread/count');
  },
  
  getDraftTNANotificationCount: async () => {
    return apiCall('/api/notifications/draft-tna/count');
  },
  
  markAsRead: async (id) => {
    return apiCall(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },
  
  markAllAsRead: async () => {
    return apiCall('/api/notifications/read/all', {
      method: 'PATCH'
    });
  },
  
  delete: async (id) => {
    return apiCall(`/api/notifications/${id}`, {
      method: 'DELETE'
    });
  }
};

// Training Proposal Status Update API
export const updateImplementationStatusAPI = async (proposalId, implementasiStatus, evaluasiRealisasi = null) => {
  const body = { implementasiStatus };
  if (evaluasiRealisasi) {
    body.evaluasiRealisasi = evaluasiRealisasi;
  }
  return apiCall(`/api/training-proposals/${proposalId}/implementation-status`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
};

export const updateProposalStatusAPI = async (proposalId, status, alasan = '') => {
  return apiCall(`/api/training-proposals/${proposalId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, alasan })
  });
};

// Demografi API
export const demografiAPI = {
  getData: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/demografi?${queryString}` : '/api/demografi';
    return apiCall(endpoint);
  }
};