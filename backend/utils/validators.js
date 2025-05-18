// backend/utils/validators.js
// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone number validation (Korean format)
const isValidPhoneNumber = (phoneNumber) => {
    // Korean phone number format: 010-XXXX-XXXX or 010XXXXXXXX
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return phoneRegex.test(phoneNumber);
};

// Password strength validation
const isStrongPassword = (password) => {
    // At least 8 characters, contains at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

// Property data validation
const validatePropertyData = (propertyData) => {
    const errors = [];
    
    // Required fields
    if (!propertyData.address) errors.push('Address is required');
    if (!propertyData.city) errors.push('City is required');
    if (propertyData.deposit === undefined || propertyData.deposit === null) 
        errors.push('Deposit amount is required');
    if (propertyData.monthly_rent === undefined || propertyData.monthly_rent === null) 
        errors.push('Monthly rent amount is required');
    
    // Numeric fields should be positive
    if (propertyData.deposit < 0) errors.push('Deposit cannot be negative');
    if (propertyData.monthly_rent < 0) errors.push('Monthly rent cannot be negative');
    if (propertyData.maintenance_fee && propertyData.maintenance_fee < 0) 
        errors.push('Maintenance fee cannot be negative');
    
    return errors;
};

module.exports = {
    isValidEmail,
    isValidPhoneNumber,
    isStrongPassword,
    validatePropertyData
};
