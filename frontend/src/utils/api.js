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

  console.log('Making API call to:', url);
  console.log('Request config:', {
    method: config.method || 'GET',
    headers: config.headers,
    hasBody: !!config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.log('401 Unauthorized - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.log('Error response data:', errorData);
      } catch (parseError) {
        console.log('Could not parse error response as JSON');
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('API call error:', error);
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
  getAll: async () => {
    console.log('Fetching all proposals...');
    return apiCall('/api/training-proposals');
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
    return apiCall('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};