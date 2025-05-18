// frontend/src/pages/PropertyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useFavorite } from '../hooks/useFavorite';
import ContactModal from '../components/properties/ContactModal';

const PropertyDetail = () => {
  const { t } = useTranslation(['properties', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAgent, currentUser, getAuthHeader } = useAuth();
  const { isFavorite, toggleFavorite, loading: favoriteLoading } = useFavorite(id);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/properties/${id}`);
        setProperty(response.data.property);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(err.response?.data?.message || t('errorFetchingPropertyDetails'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id, t]);
  
  // Format currency with Korean won (₩)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // Handle contact button click
  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.info(t('loginToContact'));
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    setIsContactModalOpen(true);
  };
  
  // Handle favorite button click
  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.info(t('loginToFavorite'));
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    try {
      await toggleFavorite();
      toast.success(
        isFavorite
          ? t('removedFromFavorites')
          : t('addedToFavorites')
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error(t('errorTogglingFavorite'));
    }
  };
  
  // Handle contact form submission
  const handleContactSubmit = async (message) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/contacts/${id}`,
        { message },
        { headers: getAuthHeader() }
      );
      
      toast.success(t('contactRequest.sent'));
      setIsContactModalOpen(false);
    } catch (err) {
      console.error('Error sending contact request:', err);
      toast.error(t('contactRequest.error'));
    }
  };
  
  // Handle property deletion (for owners)
  const handleDeleteProperty = async () => {
    if (!window.confirm(t('confirmDelete'))) {
      return;
    }
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/properties/${id}`, {
        headers: getAuthHeader(),
      });
      
      toast.success(t('propertyDeleted'));
      navigate('/agent/properties');
    } catch (err) {
      console.error('Error deleting property:', err);
      toast.error(t('errorDeletingProperty'));
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-4">
                <Link
                  to="/properties"
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  {t('common.back', { ns: 'common' })} {t('common.properties', { ns: 'common' })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {t('common.notFound', { ns: 'common' })}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{t('propertyNotFound')}</p>
          <div className="mt-6">
            <Link
              to="/properties"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {t('common.back', { ns: 'common' })} {t('common.properties', { ns: 'common' })}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const isOwner =
    isAgent &&
    currentUser &&
    property.agent_id === currentUser.agent_id;
  
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <svg
                    className="flex-shrink-0 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">{t('common.home', { ns: 'common' })}</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <Link
                  to="/properties"
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {t('common.properties', { ns: 'common' })}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500 truncate max-w-xs">
                  {property.address}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${property.images[activeImageIndex].image_path}`}
                    alt={property.address}
                    className="w-full h-full object-center object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Favorite button */}
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Image thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={image.image_id}
                    type="button"
                    className={`relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                      activeImageIndex === index
                        ? 'ring-2 ring-offset-2 ring-indigo-500'
                        : 'focus:outline-none'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={`${process.env.REACT_APP_API_URL}${image.image_path}`}
                      alt={`${property.address} ${index + 1}`}
                      className="w-full h-full object-center object-cover"
                    />
                    <span
                      className={`absolute inset-0 bg-black bg-opacity-10 ${
                        activeImageIndex === index ? '' : 'hover:bg-opacity-20'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Property info */}
          <div className="mt-10 lg:mt-0 lg:ml-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {property.address}
            </h1>
            
            <div className="mt-3">
              <h2 className="sr-only">{t('propertyDetails')}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-indigo-600">
                  {formatCurrency(property.deposit)}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-medium text-indigo-600">
                  {formatCurrency(property.monthly_rent)} {t('monthlyRent')}
                </span>
              </div>
              
              {property.maintenance_fee > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('maintenanceFee')}: {formatCurrency(property.maintenance_fee)}
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{property.city}</span>
                  {property.district && <span>, {property.district}</span>}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {t('propertyDetails')}
                  </h3>
                  <dl className="mt-2 text-sm text-gray-600 space-y-3">
                    <div className="flex justify-between">
                      <dt>{t('propertyType')}:</dt>
                      <dd className="font-medium">
                        {property.property_type
                          ? t(`propertyTypes.${property.property_type}`)
                          : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('roomSize')}:</dt>
                      <dd className="font-medium">
                        {property.room_size ? `${property.room_size} m²` : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('rooms')}:</dt>
                      <dd className="font-medium">{property.room_count || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('bathrooms')}:</dt>
                      <dd className="font-medium">{property.bathroom_count || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('floor')}:</dt>
                      <dd className="font-medium">
                        {property.floor ? `${property.floor} / ${property.total_floors || '-'}` : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('heatingType')}:</dt>
                      <dd className="font-medium">
                        {property.heating_type
                          ? t(`heatingTypes.${property.heating_type}`)
                          : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t('minStay')}:</dt>
                      <dd className="font-medium">
                        {property.min_stay_months
                          ? `${property.min_stay_months} ${t('months')}`
                          : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{t('amenities')}</h3>
                  <ul className="mt-2 text-sm text-gray-600 space-y-2">
                    <li className={property.has_bed ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.bed')}
                    </li>
                    <li className={property.has_washing_machine ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.washingMachine')}
                    </li>
                    <li className={property.has_refrigerator ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.refrigerator')}
                    </li>
                    <li className={property.has_microwave ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.microwave')}
                    </li>
                    <li className={property.has_desk ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.desk')}
                    </li>
                    <li className={property.has_closet ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.closet')}
                    </li>
                    <li className={property.has_air_conditioner ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t('amenitiesList.airConditioner')}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">{t('available')}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {property.available_from
                    ? `${t('from')} ${formatDate(property.available_from)}`
                    : t('availableNow')}
                </p>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">{t('agentInfo')}</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                      <span className="text-lg font-medium leading-none text-white">
                        {property.agent_name ? property.agent_name.charAt(0).toUpperCase() : 'A'}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.agent_name}</p>
                    {property.company_name && (
                      <p className="text-sm text-gray-500">{property.company_name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-4">
                {isOwner ? (
                  <>
                    <Link
                      to={`/agent/properties/edit/${property.property_id}`}
                      className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('editProperty')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeleteProperty}
                      className="flex-1 bg-red-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {t('deleteProperty')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleContactClick}
                      className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('contactAgent')}
                    </button>
                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      disabled={favoriteLoading}
                      className={`flex-1 border rounded-md py-3 px-8 flex items-center justify-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isFavorite
                          ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 focus:ring-red-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <HeartSolidIcon className="h-5 w-5 text-red-500 mr-2" />
                          {t('removeFromFavorites')}
                        </>
                      ) : (
                        <>
                          <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {t('addToFavorites')}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleContactSubmit}
        property={property}
      />
    </div>
  );
};

export default PropertyDetail;
