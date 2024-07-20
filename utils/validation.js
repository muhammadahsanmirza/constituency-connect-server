// Utility function for validating registration data
const validateRegistrationData = (data, type = 'constituent') => {
    const errors = [];
    const { name, cnic, password, phoneNumber, constituency, representative } = data;
  
    // Common validations
    if (!name || name.length < 2 || name.length > 100 || !/^[A-Za-z\s]+$/.test(name)) {
      errors.push('Name must be between 2 and 100 alphabetic characters.');
    }
    if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      errors.push('CNIC must be in the format XXXXX-XXXXXXX-X.');
    }
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!phoneNumber || !/^\d{11}$/.test(phoneNumber)) {
      errors.push('Phone number must be exactly 11 digits.');
    }
    if (!constituency) {
      errors.push('Constituency is required.');
    }
  
    // Additional validation for constituents
    if (type === 'constituent' && !representative) {
      errors.push('Representative information is required for constituents.');
    }
  
    return errors;
  };
  
  module.exports = { validateRegistrationData };
  