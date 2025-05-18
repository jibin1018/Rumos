// frontend/src/pages/PropertyList.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilter from '../components/properties/PropertyFilter';
import { useAuth } from '../contexts/AuthContext';

const PropertyList = ({ userProperties = false }) => {
  const { t } = useTranslation(['properties', 'common']);
  const { isAuthenticated, isAgent, getAuthHeader } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for properties and pagination
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    city: '',
    district: '',
    min_deposit: '',
    max_deposit: '',
    min_monthly_rent: '',
    max_monthly_rent: '',
    property_type: '',
    room_count: '',
  });
  
  // Parse query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    
    // Update filters from URL params
    Object.keys(filters).forEach((key) => {
      const paramValue = searchParams.get(key);
      if (paramValue) {
        newFilters[key] = paramValue;
      }
    });
    
    // Get page from URL
    const page = searchParams.get('page');
    if (page) {
      setPagination((prev) => ({ ...prev, page: parseInt(page) }));
    }
    
    setFilters(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint = `${process.env.REACT_APP_API_URL}/properties`;
        
        // If on agent page, get only agent's properties
        if (userProperties && isAgent) {
          endpoint = `${process.env.REACT_APP_API_URL}/properties/agent/me`;
        }
        
        // Build query string
        const params = new URLSearchParams();
        
        // Add page and limit
        params.append('page', pagination.page);
        params.append('limit', pagination.limit);
        
        // Add filters
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            params.append(key, filters[key]);
          }
        });
        
        // Set headers if user is authenticated
        const config = isAuthenticated ? { headers: getAuthHeader() } : {};
        
        const response = await axios.get(`${endpoint}?${params.toString()}`, config);
        
        setProperties(response.data.properties);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err.response?.data?.message || t('common.errorFetchingProperties', { ns: 'common' }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [
    pagination.page, 
    pagination.limit, 
    filters, 
    userProperties, 
    isAgent, 
    isAuthenticated, 
    getAuthHeader, 
    t
  ]);
  
  // Handle filter change
  const handleFilterChange = (newFilters) => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    
    // Add page
    params.append('page', 1);
    
    // Update URL
    navigate({ search: params.toString() });
    
    // Update state
    setFilters(newFilters);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    // Don't go below page 1 or above total pages
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }
    
    // Update URL with new page
    const params = new URLSearchParams(location.search);
    params.set('page', newPage);
    navigate({ search: params.toString() });
    
    // Update state
    setPagination((prev) => ({ ...prev, page: newPage }));
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {userProperties ? t('myProperties') : t('searchProperties')}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {userProperties
                ? t('myPropertiesDescription')
                : t('findYourPerfectHome')}
            </p>
          </div>
          
          {userProperties && isAgent && (
            <Link
              to="/agent/properties/upload"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('uploadProperty')}
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>
          
          {/* Property grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
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
                  </div>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('noProperties')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {userProperties
                    ? t('noPropertiesAgent')
                    : t('common.noResults', { ns: 'common' })}
                </p>
                {userProperties && isAgent && (
                  <div className="mt-6">
                    <Link
                      to="/agent/properties/upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('uploadProperty')}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.property_id}
                      property={property}
                      isOwner={userProperties}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.previous', { ns: 'common' })}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === index + 1
                              ? 'text-indigo-600 bg-indigo-50'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.next', { ns: 'common' })}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyList;
