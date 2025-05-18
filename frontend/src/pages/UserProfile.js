import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'react-router-dom';
import { updateUserProfile, updatePassword } from '../services/authService';
import useForm from '../hooks/useForm';
import { validateProfile, validatePasswordChange } from '../utils/validators';

const UserProfile = () => {
  const { t } = useTranslation('profile');
  const { currentUser, updateUser, isAuthenticated } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Profile form setup
  const initialProfileValues = {
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phone_number || '',
  };

  const handleProfileSubmit = async (values) => {
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      const updatedUser = await updateUserProfile({
        email: values.email,
        phoneNumber: values.phoneNumber,
      });
      
      // Update the user context
      updateUser({
        ...currentUser,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
      });
      
      setUpdateSuccess(true);
    } catch (error) {
      setUpdateError(error.message || t('profile.updateError'));
    }
  };

  const { 
    values: profileValues, 
    errors: profileErrors, 
    handleChange: handleProfileChange, 
    handleBlur: handleProfileBlur, 
    handleSubmit: submitProfileForm 
  } = useForm(initialProfileValues, validateProfile, handleProfileSubmit);

  // Password form setup
  const initialPasswordValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handlePasswordSubmit = async (values) => {
    setPasswordSuccess(false);
    setPasswordError(null);
    
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      setPasswordSuccess(true);
      
      // Reset form
      passwordResetForm();
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const { 
    values: passwordValues, 
    errors: passwordErrors, 
    handleChange: handlePasswordChange, 
    handleBlur: handlePasswordBlur, 
    handleSubmit: submitPasswordForm,
    resetForm: passwordResetForm
  } = useForm(initialPasswordValues, validatePasswordChange, handlePasswordSubmit);

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Redirect to agent profile if user is an agent
  if (currentUser.role === 'agent') {
    return <Redirect to="/profile/agent" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('profile.info')}</h2>
        
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.username')}
          </label>
          <input
            type="text"
            value={currentUser.username}
            disabled
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('profile.usernameCannotBeChanged')}
          </p>
        </div>
        
        <form onSubmit={submitProfileForm}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileValues.email}
              onChange={handleProfileChange}
              onBlur={handleProfileBlur}
              className={`w-full p-3 border rounded-md ${
                profileErrors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {profileErrors.email && (
              <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.phoneNumber')}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={profileValues.phoneNumber}
              onChange={handleProfileChange}
              onBlur={handleProfileBlur}
              className={`w-full p-3 border rounded-md ${
                profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {profileErrors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{profileErrors.phoneNumber}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('profile.updateInfo')}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('profile.password')}</h2>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showPasswordForm ? t('common.cancel') : t('profile.updatePassword')}
          </button>
        </div>
        
        {showPasswordForm && (
          <>
            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {t('profile.passwordUpdateSuccess')}
              </div>
            )}
            
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={submitPasswordForm}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordValues.currentPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordValues.newPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordValues.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('profile.updatePassword')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
