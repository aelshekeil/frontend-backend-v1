// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://back.tarimtour.com',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Utility functions
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const generateTrackingId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(file.name).toLowerCase();
  return allowedTypes.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Constants
export const FILE_UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  imageTypes: ['jpg', 'jpeg', 'png'],
  documentTypes: ['pdf', 'doc', 'docx'],
};

export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const SERVICE_TYPES = {
  VISA: 'visa',
  DRIVING_LICENSE: 'driving-license',
  BUSINESS: 'business',
  TRAVEL: 'travel',
  ESIM: 'esim',
} as const;


// Utility function for combining class names (cn function)
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

