// frontend/src/components/properties/PropertyCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorite } from '../../hooks/useFavorite';

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite, loading } = useFavorite(property.property_id);
  
  // Format currency with Korean won (₩)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      toggleFavorite();
    } else {
      // Redirect to login or show a message
      alert(t('properties.loginToFavorite'));
    }
  };

  return (
    <Link to={`/properties/${property.property_id}`} className="group">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-xl">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200">
          {property.thumbnail ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${property.thumbnail}`}
              alt={property.address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>
        
        {/* Property Details */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {property.address}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {property.city}, {property.district || ''}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">{t('properties.deposit')}</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(property.deposit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('properties.monthlyRent')}</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(property.monthly_rent)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500 justify-between">
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>{t(`properties.propertyTypes.${property.property_type || 'apartment'}`)}</span>
            </div>
            
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>
                {property.room_count} {t('properties.rooms')} / {property.bathroom_count} {t('properties.bathrooms')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
