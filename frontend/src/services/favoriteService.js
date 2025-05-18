import { api } from './api';

// Add a property to favorites
export const addFavorite = async (propertyId) => {
  try {
    const response = await api.post('/favorites', { propertyId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add to favorites');
  }
};

// Remove a property from favorites
export const removeFavorite = async (propertyId) => {
  try {
    const response = await api.delete(`/favorites/${propertyId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
  }
};

// Get all user's favorites
export const getUserFavorites = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get favorites');
  }
};

// Check if a property is in user's favorites
export const checkFavorite = async (propertyId) => {
  try {
    const response = await api.get(`/favorites/check/${propertyId}`);
    return response.data.isFavorite;
  } catch (error) {
    // Return false on error (assuming not in favorites)
    return false;
  }
};
