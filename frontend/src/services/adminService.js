import { api } from './api';

// Get all pending agents (not yet verified)
export const getPendingAgents = async () => {
  try {
    const response = await api.get('/admin/agents/pending');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get pending agents');
  }
};

// Get all agents (verified or not)
export const getAllAgents = async () => {
  try {
    const response = await api.get('/admin/agents');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get all agents');
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get all users');
  }
};

// Get all properties
export const getAllProperties = async () => {
  try {
    const response = await api.get('/admin/properties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get all properties');
  }
};

// Verify an agent
export const verifyAgent = async (agentId) => {
  try {
    const response = await api.put(`/admin/agents/${agentId}/verify`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to verify agent');
  }
};

// Reject an agent
export const rejectAgent = async (agentId) => {
  try {
    const response = await api.put(`/admin/agents/${agentId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject agent');
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

// Delete a property
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/admin/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete property');
  }
};

// Get all contact requests
export const getAllContactRequests = async () => {
  try {
    const response = await api.get('/admin/contacts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get contact requests');
  }
};

// Get all board posts
export const getAllBoardPosts = async () => {
  try {
    const response = await api.get('/admin/board/posts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get board posts');
  }
};

// Delete a board post
export const deleteBoardPost = async (postId) => {
  try {
    const response = await api.delete(`/admin/board/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete board post');
  }
};
