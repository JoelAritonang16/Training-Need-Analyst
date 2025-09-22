// API utility functions
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

// Get auth headers
const getAuthHeaders = () => {
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