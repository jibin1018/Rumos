// frontend/src/components/properties/PropertyFilter.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PropertyFilter = ({ filters, onFilterChange }) => {
  const { t } = useTranslation(['properties', 'common']);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
    setIsOpen(false);
  };
  
  const handleReset = () => {
    const resetFilters = {
      city: '',
      district: '',
      min_deposit: '',
      max_deposit: '',
      min_monthly_rent: '',
      max_monthly_rent: '',
      property_type: '',
      room_count: '',
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  // Check if any filters are applied
  const hasFilters = Object.values(filters).some((value) => value !== '');
  
  // Korean cities for the dropdown
  const cities = [
    'seoul',
    'busan',
    'incheon',
    'daegu',
    'daejeon',
    'gwangju',
    'ulsan',
    'sejong',
  ];
  
  // Property types
  const propertyTypes = [
    'apartment',
    'officetel',
    'house',
    'studio',
  ];
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">{t('filters.title')}</h2>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-500 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">
            {isOpen ? t('common.close', { ns: 'common' }) : t('common.open', { ns: 'common' })}
          </span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className={`p-4 space-y-4 lg:block ${isOpen ? 'block' : 'hidden'}`}
      >
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t('filters.city')}
          </label>
          <select
            id="city"
            name="city"
            value={localFilters.city}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">{t('filters.selectCity')}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {t(`cities.${city}`, { ns: 'common' })}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700">
            {t('filters.district')}
          </label>
          <input
            type="text"
            name="district"
            id="district"
            value={localFilters.district}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={t('filters.districtPlaceholder')}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min_deposit" className="block text-sm font-medium text-gray-700">
              {t('filters.minDeposit')}
            </label>
            <input
              type="number"
              name="min_deposit"
              id="min_deposit"
              value={localFilters.min_deposit}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="₩"
            />
          </div>
          <div>
            <label htmlFor="max_deposit" className="block text-sm font-medium text-gray-700">
              {t('filters.maxDeposit')}
            </label>
            <input
              type="number"
              name="max_deposit"
              id="max_deposit"
              value={localFilters.max_deposit}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="₩"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min_monthly_rent" className="block text-sm font-medium text-gray-700">
              {t('filters.minMonthlyRent')}
            </label>
            <input
              type="number"
              name="min_monthly_rent"
              id="min_monthly_rent"
              value={localFilters.min_monthly_rent}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="₩"
            />
          </div>
          <div>
            <label htmlFor="max_monthly_rent" className="block text-sm font-medium text-gray-700">
              {t('filters.maxMonthlyRent')}
            </label>
            <input
              type="number"
              name="max_monthly_rent"
              id="max_monthly_rent"
              value={localFilters.max_monthly_rent}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="₩"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
            {t('filters.propertyType')}
          </label>
          <select
            id="property_type"
            name="property_type"
            value={localFilters.property_type}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">{t('filters.selectPropertyType')}</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {t(`propertyTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="room_count" className="block text-sm font-medium text-gray-700">
            {t('filters.roomCount')}
          </label>
          <select
            id="room_count"
            name="room_count"
            value={localFilters.room_count}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">{t('filters.selectRoomCount')}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <button
            type="submit"
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('filters.applyFilters')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('filters.resetFilters')}
          </button>
        </div>
        
        {hasFilters && (
          <div className="pt-2 text-sm text-green-600">
            <span>{t('filters.filtersApplied')}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertyFilter;
