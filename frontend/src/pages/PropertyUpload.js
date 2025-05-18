import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createProperty, updateProperty, getPropertyById } from '../services/propertyService';
import useForm from '../hooks/useForm';
import { validatePropertyForm } from '../utils/validators';

const PropertyUpload = () => {
  const { id } = useParams(); // If editing, id will be defined
  const history = useHistory();
  const { t } = useTranslation('common');
  const { currentUser, isAuthenticated } = useAuth();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!!id);

  const initialValues = {
    address: '',
    city: '',
    district: '',
    deposit: '',
    monthlyRent: '',
    maintenanceFee: '',
    constructionDate: '',
    availableFrom: '',
    roomSize: '',
    roomCount: '1',
    bathroomCount: '1',
    floor: '',
    totalFloors: '',
    heatingType: 'individual',
    propertyType: 'apartment',
    minStayMonths: '6',
    hasBed: false,
    hasWashingMachine: false,
    hasRefrigerator: false,
    hasMicrowave: false,
    hasDesk: false,
    hasCloset: false,
    hasAirConditioner: false
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (images.length === 0 && !isEditMode) {
      setServerError('Please upload at least one image');
      return false;
    }

    setLoading(true);
    setServerError(null);

    try {
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // Append images if any
      images.forEach(image => {
        formData.append('images', image);
      });

      if (isEditMode) {
        await updateProperty(id, formData);
      } else {
        await createProperty(formData);
      }
      
      history.push('/profile/agent');
      return true;
    } catch (error) {
      setServerError(error.message || 'Failed to save property');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const { 
    values, 
    errors, 
    handleChange, 
    handleBlur, 
    handleSubmit: submitForm,
    setValues
  } = useForm(initialValues, validatePropertyForm, handleSubmit);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const property = await getPropertyById(id);
        
        // Check if current user is the agent who owns this property
        if (currentUser?.role !== 'admin' && 
            (!currentUser?.agentProfile || 
             property.agent_id !== currentUser.agentProfile.agent_id)) {
          history.push('/');
          return;
        }
        
        // Map property data to form values
        setValues({
          address: property.address || '',
          city: property.city || '',
          district: property.district || '',
          deposit: property.deposit?.toString() || '',
          monthlyRent: property.monthly_rent?.toString() || '',
          maintenanceFee: property.maintenance_fee?.toString() || '',
          constructionDate: property.construction_date ? new Date(property.construction_date).toISOString().split('T')[0] : '',
          availableFrom: property.available_from ? new Date(property.available_from).toISOString().split('T')[0] : '',
          roomSize: property.room_size?.toString() || '',
          roomCount: property.room_count?.toString() || '1',
          bathroomCount: property.bathroom_count?.toString() || '1',
          floor: property.floor?.toString() || '',
          totalFloors: property.total_floors?.toString() || '',
          heatingType: property.heating_type || 'individual',
          propertyType: property.property_type || 'apartment',
          minStayMonths: property.min_stay_months?.toString() || '6',
          hasBed: !!property.has_bed,
          hasWashingMachine: !!property.has_washing_machine,
          hasRefrigerator: !!property.has_refrigerator,
          hasMicrowave: !!property.has_microwave,
          hasDesk: !!property.has_desk,
          hasCloset: !!property.has_closet,
          hasAirConditioner: !!property.has_air_conditioner
        });
        
        // Set existing image previews
        if (property.images && property.images.length > 0) {
          setPreviews(property.images.map(img => img.image_path));
        }
      } catch (error) {
        setServerError(error.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProperty();
    }
  }, [id, isEditMode, isAuthenticated, currentUser, history, setValues]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    
    // Store files for submission
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    // Only remove from images array if it's a new image
    if (index < images.length) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  // Redirect if not logged in or not an agent
  if (!isAuthenticated || (currentUser && currentUser.role !== 'agent' && currentUser.role !== 'admin')) {
    return <Redirect to="/" />;
  }

  // Check if agent is verified
  if (currentUser.role === 'agent' && 
      currentUser.agentProfile && 
      currentUser.agentProfile.verification_status !== 'verified') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {t('register.agentPending')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? t('property.editProperty') : t('property.addProperty')}
      </h1>
      
      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}
      
      <form onSubmit={submitForm} className="bg-white rounded-lg shadow-md p-6">
        {/* Image Upload Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('property.images')}</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Property preview ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 text-sm text-gray-500">{t('property.addImage')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
            </label>
          </div>
          
          {!isEditMode && previews.length === 0 && (
            <p className="text-red-500 text-sm">* {t('property.imageRequired')}</p>
          )}
        </div>
        
        {/* Basic Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('property.basicInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.address')} *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.city')} *
              </label>
              <select
                id="city"
                name="city"
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">{t('property.selectCity')}</option>
                <option value="Seoul">Seoul</option>
                <option value="Busan">Busan</option>
                <option value="Incheon">Incheon</option>
                <option value="Daegu">Daegu</option>
                <option value="Daejeon">Daejeon</option>
                <option value="Gwangju">Gwangju</option>
                <option value="Ulsan">Ulsan</option>
                <option value="Sejong">Sejong</option>
              </select>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.district')}
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={values.district}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.type')} *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={values.propertyType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.propertyType ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="apartment">{t('property.types.apartment')}</option>
                <option value="officetel">{t('property.types.officetel')}</option>
                <option value="house">{t('property.types.house')}</option>
                <option value="studio">{t('property.types.studio')}</option>
              </select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Pricing Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('property.pricing')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.deposit')} (만원) *
              </label>
              <input
                type="number"
                id="deposit"
                name="deposit"
                value={values.deposit}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.deposit ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.deposit && (
                <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.monthlyRent')} (만원) *
              </label>
              <input
                type="number"
                id="monthlyRent"
                name="monthlyRent"
                value={values.monthlyRent}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.monthlyRent && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="maintenanceFee" className="block text-sm font-medium text-gray-700 mb-1">
                {t('property.maintenanceFee')} (만원)
              </label>
              <input
                type="number"
                id="maintenanceFee"
                name="maintenanceFee"
                value={values.maintenanceFee}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        {/* Additional sections for room details, availability, amenities, etc. would go here */}
        {/* Similar structure to the sections above */}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => history.goBack()}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyUpload;
