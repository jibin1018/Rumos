import { api } from './api';

// Register a new user
export const register = async (userData) => {
  try {
    const formData = new FormData();
    
    // Append user data
    formData.append('username', userData.username);
    formData.append('password', userData.password);
    formData.append('email', userData.email);
    formData.append('phoneNumber', userData.phoneNumber);
    formData.append('role', userData.role);
    
    // If registering as an agent, append agent data
    if (userData.role === 'agent') {
      formData.append('companyName', userData.companyName);
      formData.append('officeAddress', userData.officeAddress);
      
      // Append license image if provided
      if (userData.licenseImage) {
        formData.append('licenseImage', userData.licenseImage);
      }
    }
    
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });
    
    // Store token and user data in local storage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Logout user
export const logout = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user profile');
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Update agent profile
export const updateAgentProfile = async (agentData) => {
  try {
    const response = await api.put('/auth/profile/agent', agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update agent profile');
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

// Get agent properties
export const getAgentProperties = async () => {
  try {
    const response = await api.get('/agents/properties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get agent properties');
  }
};
