import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Redirect, Link } from 'react-router-dom';
import { updateAgentProfile, getAgentProperties } from '../services/authService';
import useForm from '../hooks/useForm';
import { validateProfile } from '../utils/validators';
import PropertyCard from '../components/properties/PropertyCard';

const AgentProfile = () => {
  const { t } = useTranslation('profile');
  const { currentUser, updateUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Form setup
  const initialValues = {
    companyName: currentUser?.agentProfile?.company_name || '',
    officeAddress: currentUser?.agentProfile?.office_address || '',
  };

  const handleSubmit = async (values) => {
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      const updatedProfile = await updateAgentProfile({
        companyName: values.companyName,
        officeAddress: values.officeAddress,
      });
      
      // Update the user context with the new profile information
      updateUser({
        ...currentUser,
        agentProfile: {
          ...currentUser.agentProfile,
          company_name: values.companyName,
          office_address: values.officeAddress,
        }
      });
      
      setUpdateSuccess(true);
    } catch (error) {
      setUpdateError(error.message || t('profile.updateError'));
    }
  };

  const { 
    values, 
    errors, 
    handleChange, 
    handleBlur, 
    handleSubmit: submitForm 
  } = useForm(initialValues, validateProfile, handleSubmit);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        if (currentUser && currentUser.role === 'agent') {
          const agentProperties = await getAgentProperties();
          setProperties(agentProperties);
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser]);

  // Redirect if not agent
  if (!currentUser || currentUser.role !== 'agent') {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('agent.info')}</h2>
        
        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t('profile.updateSuccess')}
          </div>
        )}
        
        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {updateError}
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">{t('agent.verificationStatus')}:</span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                currentUser.agentProfile.verification_status === 'verified'
                  ? 'bg-green-100 text-green-800'
                  : currentUser.agentProfile.verification_status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {t(`agent.${currentUser.agentProfile.verification_status}`)}
            </span>
          </div>
          
          {currentUser.agentProfile.verification_status === 'pending' && (
            <p className="text-sm text-gray-600 mb-4">
              {t('register.agentPending')}
            </p>
          )}
        </div>
        
        <form onSubmit={submitForm}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('agent.companyName')}
            </label>
            <input
              type="text"
              name="companyName"
              value={values.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded-md ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('agent.officeAddress')}
            </label>
            <textarea
              name="officeAddress"
              value={values.officeAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full p-2 border rounded-md ${
                errors.officeAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            ></textarea>
            {errors.officeAddress && (
              <p className="text-red-500 text-xs mt-1">{errors.officeAddress}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('agent.updateInfo')}
          </button>
        </form>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('agent.myProperties')}</h2>
          <Link
            to="/properties/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('agent.addProperty')}
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gray-100 rounded-md p-8 text-center">
            <p className="text-gray-600">{t('agent.noProperties')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.property_id}
                property={property}
                isAgent={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
