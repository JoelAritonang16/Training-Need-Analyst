// API utility functions
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Getting auth headers, token:', token ? 'exists' : 'not found');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    credentials: 'include',
    ...options
  };

  console.log('[API] Making API call to:', url);
  console.log('[API] Request config:', {
    method: config.method || 'GET',
    headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer ***' : 'none' },
    hasBody: !!config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('[API] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.log('[API] 401 Unauthorized - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      console.error('[API] 404 Not Found for endpoint:', url);
      throw new Error(`Endpoint tidak ditemukan: ${endpoint}`);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('[API] Error response data:', errorData);
      } catch (parseError) {
        console.error('[API] Could not parse error response as JSON');
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('[API] Response data received:', {
      success: responseData.success,
      hasReports: !!responseData.reports,
      reportsCount: responseData.reports?.length || 0
    });
    return responseData;
  } catch (error) {
    console.error('[API] API call error:', error);
    console.error('[API] Error details:', {
      message: error.message,
      name: error.name,
      endpoint: url
    });
    throw error;
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
    console.log('Fetching all proposals with filters:', filters);
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    if (filters.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/training-proposals?${queryString}` : '/api/training-proposals';
    return apiCall(endpoint);
  },
  
  getById: async (id) => {
    console.log('Fetching proposal by ID:', id);
    return apiCall(`/api/training-proposals/${id}`);
  },
  
  create: async (data) => {
    console.log('Creating new proposal with data:', data);
    console.log('Data being sent to API:', JSON.stringify(data, null, 2));
    const result = await apiCall('/api/training-proposals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    console.log('API create result:', result);
    return result;
  },
  
  update: async (id, data) => {
    console.log('Updating proposal:', id, 'with data:', data);
    return apiCall(`/api/training-proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    console.log('Deleting proposal:', id);
    return apiCall(`/api/training-proposals/${id}`, {
      method: 'DELETE'
    });
  },
  
  getReportsData: async (filters = {}) => {
    console.log('Fetching reports data with filters:', filters);
    const queryParams = new URLSearchParams();
    if (filters.branchId) queryParams.append('branchId', filters.branchId);
    if (filters.divisiId) queryParams.append('divisiId', filters.divisiId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/training-proposals/reports/data?${queryString}` : '/api/training-proposals/reports/data';
    return apiCall(endpoint);
  },
  
  exportReports: async (filters = {}) => {
    console.log('Exporting reports with filters:', filters);
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
    console.log('Getting all divisi');
    return apiCall('/api/divisi');
  },
  
  getById: async (id) => {
    console.log('Getting divisi by ID:', id);
    return apiCall(`/api/divisi/${id}`);
  },
  
  create: async (data) => {
    console.log('Creating divisi:', data);
    return apiCall('/api/divisi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    console.log('Updating divisi:', id, data);
    return apiCall(`/api/divisi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    console.log('Deleting divisi:', id);
    return apiCall(`/api/divisi/${id}`, {
      method: 'DELETE'
    });
  }
};

// Branch API
export const branchAPI = {
  getAll: async () => {
    console.log('Getting all branch');
    return apiCall('/api/branch');
  },
  
  getById: async (id) => {
    console.log('Getting branch by ID:', id);
    return apiCall(`/api/branch/${id}`);
  },
  
  create: async (data) => {
    console.log('Creating branch:', data);
    return apiCall('/api/branch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    console.log('Updating branch:', id, data);
    return apiCall(`/api/branch/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    console.log('Deleting branch:', id);
    return apiCall(`/api/branch/${id}`, {
      method: 'DELETE'
    });
  }
};

// Anak Perusahaan API
export const anakPerusahaanAPI = {
  getAll: async () => {
    console.log('Getting all anak perusahaan');
    return apiCall('/api/anak-perusahaan');
  },
  
  getById: async (id) => {
    console.log('Getting anak perusahaan by ID:', id);
    return apiCall(`/api/anak-perusahaan/${id}`);
  },
  
  create: async (data) => {
    console.log('Creating anak perusahaan:', data);
    return apiCall('/api/anak-perusahaan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id, data) => {
    console.log('Updating anak perusahaan:', id, data);
    return apiCall(`/api/anak-perusahaan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id) => {
    console.log('Deleting anak perusahaan:', id);
    return apiCall(`/api/anak-perusahaan/${id}`, {
      method: 'DELETE'
    });
  },
  
  getBranches: async (id) => {
    console.log('Getting branches for anak perusahaan:', id);
    return apiCall(`/api/anak-perusahaan/${id}/branches`);
  },
  
  addBranch: async (id, branchId) => {
    console.log('Adding branch to anak perusahaan:', id, branchId);
    return apiCall(`/api/anak-perusahaan/${id}/branches`, {
      body: JSON.stringify({ branchId })
    });
  },
  
  removeBranch: async (id, branchId) => {
    console.log('Removing branch from anak perusahaan:', id, branchId);
    return apiCall(`/api/anak-perusahaan/${id}/branches/${branchId}`, {
      method: 'DELETE'
    });
  }
};

// User Profile API
export const userProfileAPI = {
  updateProfile: async (profileData) => {
    console.log('Updating user profile:', profileData);
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

      console.log('Profile update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile update error:', errorData);
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }
};

// Draft TNA 2026 API
export const draftTNA2026API = {
  getAll: async (filters = {}) => {
    console.log('Getting all draft TNA 2026 with filters:', filters);
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
    return apiCall('/api/draft-tna-2026/rekap/gabungan');
  }
};

// Tempat Diklat Realisasi API
export const tempatDiklatRealisasiAPI = {
  getAll: async (filters = {}) => {
    console.log('Getting all tempat diklat realisasi with filters:', filters);
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
export const updateImplementationStatusAPI = async (proposalId, implementasiStatus) => {
  console.log('Updating implementation status:', proposalId, implementasiStatus);
  return apiCall(`/api/training-proposals/${proposalId}/implementation-status`, {
    method: 'PATCH',
    body: JSON.stringify({ implementasiStatus })
  });
};

export const updateProposalStatusAPI = async (proposalId, status, alasan = '') => {
  return apiCall(`/api/training-proposals/${proposalId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, alasan })
  });
};