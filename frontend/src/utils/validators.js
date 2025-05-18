// User registration form validation
export const validateRegistration = (field, values) => {
  // Username validation
  if (field === 'username') {
    if (!values.username) {
      return 'validation.required';
    }
    if (values.username.length < 4) {
      return { key: 'validation.minLength', params: { min: 4 } };
    }
    if (values.username.length > 20) {
      return { key: 'validation.maxLength', params: { max: 20 } };
    }
  }
  
  // Password validation
  if (field === 'password') {
    if (!values.password) {
      return 'validation.required';
    }
    if (values.password.length < 6) {
      return { key: 'validation.minLength', params: { min: 6 } };
    }
  }
  
  // Confirm password validation
  if (field === 'confirmPassword') {
    if (!values.confirmPassword) {
      return 'validation.required';
    }
    if (values.password !== values.confirmPassword) {
      return 'validation.passwordMatch';
    }
  }
  
  // Email validation
  if (field === 'email') {
    if (!values.email) {
      return 'validation.required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      return 'validation.email';
    }
  }
  
  // Phone number validation
  if (field === 'phoneNumber') {
    if (!values.phoneNumber) {
      return 'validation.required';
    }
    // Simple format check for Korean phone numbers
    const phoneRegex = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(values.phoneNumber.replace(/\s/g, ''))) {
      return 'validation.phoneFormat';
    }
  }
  
  // Agent-specific validations
  if (values.role === 'agent') {
    if (field === 'companyName' && !values.companyName) {
      return 'validation.required';
    }
    
    if (field === 'officeAddress' && !values.officeAddress) {
      return 'validation.required';
    }
    
    if (field === 'licenseImage' && !values.licenseImage && !values.licenseImageUrl) {
      return 'validation.required';
    }
  }
  
  return null;
};

// Profile form validation
export const validateProfile = (field, values) => {
  // Email validation
  if (field === 'email') {
    if (!values.email) {
      return 'validation.required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      return 'validation.email';
    }
  }
  
  // Phone number validation
  if (field === 'phoneNumber') {
    if (!values.phoneNumber) {
      return 'validation.required';
    }
    // Simple format check for Korean phone numbers
    const phoneRegex = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(values.phoneNumber.replace(/\s/g, ''))) {
      return 'validation.phoneFormat';
    }
  }
  
  // Company name (for agents)
  if (field === 'companyName' && values.role === 'agent' && !values.companyName) {
    return 'validation.required';
  }
  
  return null;
};

// Password change validation
export const validatePasswordChange = (field, values) => {
  // Current password
  if (field === 'currentPassword' && !values.currentPassword) {
    return 'validation.required';
  }
  
  // New password
  if (field === 'newPassword') {
    if (!values.newPassword) {
      return 'validation.required';
    }
    if (values.newPassword.length < 6) {
      return { key: 'validation.minLength', params: { min: 6 } };
    }
  }
  
  // Confirm password
  if (field === 'confirmPassword') {
    if (!values.confirmPassword) {
      return 'validation.required';
    }
    if (values.newPassword !== values.confirmPassword) {
      return 'validation.passwordMatch';
    }
  }
  
  return null;
};

// Property form validation
export const validatePropertyForm = (field, values) => {
  const requiredFields = [
    'address', 'city', 'deposit', 'monthlyRent'
  ];
  
  if (requiredFields.includes(field) && !values[field]) {
    return 'validation.required';
  }
  
  // Numeric validation for prices and measurements
  const numericFields = [
    'deposit', 'monthlyRent', 'maintenanceFee', 
    'roomSize', 'floor', 'totalFloors'
  ];
  
  if (numericFields.includes(field) && values[field] && isNaN(Number(values[field]))) {
    return 'validation.numeric';
  }
  
  return null;
};

// Board post form validation
export const validatePostForm = (field, values) => {
  // Title validation
  if (field === 'title') {
    if (!values.title) {
      return 'validation.titleRequired';
    }
    if (values.title.length > 100) {
      return 'validation.titleLength';
    }
  }
  
  // Content validation
  if (field === 'content' && !values.content) {
    return 'validation.contentRequired';
  }
  
  return null;
};
