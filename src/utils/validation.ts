import DOMPurify from 'dompurify';

// Input validation utilities
export const sanitizeInput = (input: string): string => {
  // Remove HTML tags and dangerous characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateGuideId = (guideId: string): boolean => {
  // Guide ID should be alphanumeric, 3-20 characters
  const guideIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return guideIdRegex.test(guideId);
};

export const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// XSS protection for user-generated content
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// File upload validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
  }

  return { valid: true };
};

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  // Remove dangerous SQL characters and keywords
  return query
    .replace(/['"\\;]/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b/gi, '')
    .trim()
    .substring(0, 100); // Limit length
};