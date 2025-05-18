import { api } from './api';

// Get all properties (with optional filters)
export const getAllProperties = async (filters = {}) => {
  try {
    let url = '/properties';
    
    // Add query parameters for filters
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.minDeposit) params.append('minDeposit', filters.minDeposit);
    if (filters.maxDeposit) params.append('maxDeposit', filters.maxDeposit);
    if (filters.minMonthlyRent) params.append('minMonthlyRent', filters.minMonthlyRent);
    if (filters.maxMonthlyRent) params.append('maxMonthlyRent', filters.maxMonthlyRent);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    
    // Add amenity filters
    if (filters.hasAirConditioner) params.append('hasAirConditioner', 'true');
    if (filters.hasWashingMachine) params.append('hasWashingMachine', 'true');
    if (filters.hasRefrigerator) params.append('hasRefrigerator', 'true');
    if (filters.hasMicrowave) params.append('hasMicrowave', 'true');
    if (filters.hasBed) params.append('hasBed', 'true');
    
    // Append query string if there are filters
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get properties');
  }
};

// Get a single property by ID
export const getPropertyById = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get property details');
  }
};

// Create a new property
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create property');
  }
};

// Update an existing property
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const response = await api.put(`/properties/${propertyId}`, propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update property');
  }
};

// Delete a property
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete property');
  }
};

// Get recommended properties
export const getRecommendedProperties = async (limit = 3) => {
  try {
    const response = await api.get(`/properties/recommended?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get recommended properties');
  }
};

// Search properties by keywords
export const searchProperties = async (query) => {
  try {
    const response = await api.get(`/properties/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search properties');
  }
};
