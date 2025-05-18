// frontend/src/pages/RegisterAgent.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const RegisterAgent = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { registerAsAgent } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    company_name: '',
    office_address: '',
  });
  
  const [licenseImage, setLicenseImage] = useState(null);
  const [licensePreview, setLicensePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setLicenseImage(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if there was one
      if (errors.license_image) {
        setErrors({
          ...errors,
          license_image: '',
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = t('register.usernameRequired', { ns: 'auth' });
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('register.emailRequired', { ns: 'auth' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('register.emailInvalid', { ns: 'auth' });
    }
    
    if (!formData.password) {
      newErrors.password = t('register.passwordRequired', { ns: 'auth' });
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.passwordTooShort', { ns: 'auth' });
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordsMustMatch', { ns: 'auth' });
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t('register.phoneRequired', { ns: 'auth' });
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phone_number)) {
      newErrors.phone_number = t('register.phoneInvalid', { ns: 'auth' });
    }
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = t('registerAgent.companyNameRequired', { ns: 'auth' });
    }
    
    if (!formData.office_address.trim()) {
      newErrors.office_address = t('registerAgent.officeAddressRequired', { ns: 'auth' });
    }
    
    if (!licenseImage) {
      newErrors.license_image = t('registerAgent.licenseRequired', { ns: 'auth' });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (key !== 'confirmPassword') { // Skip confirmPassword
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Add license image
      formDataObj.append('license_image', licenseImage);
      
      await registerAsAgent(formDataObj);
      toast.success(t('registerAgent.success', { ns: 'auth' }));
      navigate('/');
    } catch (error) {
      console.error('Agent registration error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('registerAgent.failed', { ns: 'auth' }));
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('registerAgent.title', { ns: 'auth' })}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('register.alreadyHaveAccount', { ns: 'auth' })}{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t('register.loginHere', { ns: 'auth' })}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t('register.username', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('register.email', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('register.password', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('register.confirmPassword', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                {t('register.phoneNumber', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="010-1234-5678"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.phone_number ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                {t('registerAgent.companyName', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.company_name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.company_name}
                  onChange={handleChange}
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="office_address" className="block text-sm font-medium text-gray-700">
                {t('registerAgent.officeAddress', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="office_address"
                  name="office_address"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.office_address ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.office_address}
                  onChange={handleChange}
                />
                {errors.office_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.office_address}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="license_image" className="block text-sm font-medium text-gray-700">
                {t('registerAgent.licenseImage', { ns: 'auth' })}
              </label>
              <div className="mt-1">
                <input
                  id="license_image"
                  name="license_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.license_image ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.license_image && (
                  <p className="mt-1 text-sm text-red-600">{errors.license_image}</p>
                )}
                {licensePreview && (
                  <div className="mt-2">
                    <img
                      src={licensePreview}
                      alt="License Preview"
                      className="h-32 w-auto object-contain"
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('registerAgent.licenseImageHelp', { ns: 'auth' })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {t('registerAgent.registerAsUser', { ns: 'auth' })}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('common.loading', { ns: 'common' })}
                  </>
                ) : (
                  t('registerAgent.submit', { ns: 'auth' })
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAgent;
