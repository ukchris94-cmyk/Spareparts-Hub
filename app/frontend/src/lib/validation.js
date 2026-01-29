// Validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 0 };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters', strength: 1 };
  }

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  strength = Object.values(checks).filter(Boolean).length;

  let message = '';
  if (strength <= 2) {
    message = 'Weak password';
  } else if (strength <= 3) {
    message = 'Fair password';
  } else if (strength <= 4) {
    message = 'Good password';
  } else {
    message = 'Strong password';
  }

  return {
    valid: password.length >= 6,
    message,
    strength,
    checks,
  };
};

export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Check if it starts with + or is a valid Nigerian number
  const phoneRegex = /^(\+?234|0)?[789][01]\d{8}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Nigerian phone number' };
  }
  return { valid: true };
};

export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  return { valid: true };
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +234, keep it
  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  
  // If it starts with 234, add +
  if (cleaned.startsWith('234')) {
    return '+' + cleaned;
  }
  
  // If it starts with 0, replace with +234
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.substring(1);
  }
  
  // Otherwise, assume it's missing country code
  return '+234' + cleaned;
};
