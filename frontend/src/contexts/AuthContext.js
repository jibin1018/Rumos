// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    
    if (token) {
      checkUserSession(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserSession = async (token) => {
    try {
      // Configure axios to send token with request
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, config);
      
      setCurrentUser(response.data.user);
      setLoading(false);
    } catch (err) {
      console.error('Error checking user session:', err);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
        username,
        password
      });
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set current user
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, userData);
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set current user
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAsAgent = async (formData) => {
    try {
      setError(null);
      setLoading(true);
      
      // FormData must be used for file uploads
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agents/register`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      const { token, agent } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set current user
      setCurrentUser({
        ...agent,
        role: 'agent'
      });
      
      return agent;
    } catch (err) {
      console.error('Agent registration error:', err);
      setError(err.response?.data?.message || 'Agent registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear current user
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/profile`, 
        userData,
        config
      );
      
      // Update current user with new data
      setCurrentUser({
        ...currentUser,
        ...response.data.user
      });
      
      return response.data.user;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;
  
  // Check if user is an agent
  const isAgent = currentUser?.role === 'agent';
  
  // Check if user is an admin
  const isAdmin = currentUser?.role === 'admin';

  // Create auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    registerAsAgent,
    logout,
    updateProfile,
    isAuthenticated,
    isAgent,
    isAdmin,
    getAuthHeader
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
