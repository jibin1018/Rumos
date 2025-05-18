import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'react-router-dom';
import { getUserFavorites, removeFavorite } from '../services/favoriteService';
import PropertyCard from '../components/properties/PropertyCard';

const Favorite = () => {
  const { t } = useTranslation('profile');
  const { currentUser, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        const data = await getUserFavorites();
        setFavorites(data);
      } catch (err) {
        setError(err.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      await removeFavorite(propertyId);
      setFavorites(favorites.filter(fav => fav.property_id !== propertyId));
    } catch (err) {
      setError(err.message || 'Failed to remove from favorites');
    }
  };

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('favorites.title')}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-gray-100 rounded-md p-8 text-center">
          <p className="text-gray-600">{t('favorites.noFavorites')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <PropertyCard
              key={property.property_id}
              property={property}
              onRemoveFavorite={() => handleRemoveFavorite(property.property_id)}
              showRemoveButton
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorite;
