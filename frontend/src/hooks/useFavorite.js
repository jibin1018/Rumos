// frontend/src/hooks/useFavorite.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useFavorite = (propertyId) => {
  const { isAuthenticated, getAuthHeader } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if property is in user's favorites when component mounts
  useEffect(() => {
    if (isAuthenticated && propertyId) {
      checkFavoriteStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, propertyId]);

  const checkFavoriteStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/favorites/${propertyId}`,
        { headers: getAuthHeader() }
      );
      
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError(err.response?.data?.message || 'Error checking favorite status');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/favorites/${propertyId}`,
        {},
        { headers: getAuthHeader() }
      );
      
      setIsFavorite(true);
      return response.data;
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError(err.response?.data?.message || 'Error adding to favorites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/favorites/${propertyId}`,
        { headers: getAuthHeader() }
      );
      
      setIsFavorite(false);
      return response.data;
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.response?.data?.message || 'Error removing from favorites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (isFavorite) {
      return removeFromFavorites();
    } else {
      return addToFavorites();
    }
  };

  return {
    isFavorite,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  };
};
