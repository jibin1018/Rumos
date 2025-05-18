import { api } from './api';

// Create a new contact request
export const createContactRequest = async (contactData) => {
  try {
    const response = await api.post('/contacts', contactData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send contact request');
  }
};

// Get all contact requests for current user
export const getUserContactRequests = async () => {
  try {
    const response = await api.get('/contacts/user');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get contact requests');
  }
};

// Get all contact requests for agent
export const getAgentContactRequests = async () => {
  try {
    const response = await api.get('/contacts/agent');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get contact requests');
  }
};

// Mark contact request as read
export const markContactAsRead = async (requestId) => {
  try {
    const response = await api.put(`/contacts/${requestId}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark contact as read');
  }
};

// Delete a contact request
export const deleteContactRequest = async (requestId) => {
  try {
    const response = await api.delete(`/contacts/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete contact request');
  }
};
