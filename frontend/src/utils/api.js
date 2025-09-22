// API utility functions
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
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

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); // Reload to show login page
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
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
    return apiCall('/api/training-proposals');
  },
  
  getById: async (id) => {
    return apiCall(`/api/training-proposals/${id}`);
  },
  
  create: async (data) => {
    return apiCall('/api/training-proposals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
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
  }
};
