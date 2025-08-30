/**
 * Data Sanitization Utilities
 * Comprehensive sanitization for user inputs to prevent XSS, injection attacks, and data corruption
 */

// HTML entity mapping for XSS prevention
const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&lt;/",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== "string") return input;

  return input.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char]);
};

/**
 * Sanitize text content (removes HTML tags and escapes entities)
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeText = (input) => {
  if (typeof input !== "string") return input;

  // Remove HTML tags completely
  let sanitized = input.replace(/<[^>]*>/g, "");

  // If the text contains script tags, return empty string
  if (sanitized.toLowerCase().includes("script")) {
    return "";
  }

  // Escape HTML entities
  sanitized = sanitizeHtml(sanitized);

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== "string") return null;

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number or null if invalid
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== "string") return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Validate length (7-15 digits is reasonable for international numbers)
  if (digits.length < 7 || digits.length > 15) {
    return null;
  }

  return digits;
};

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== "string") return null;

  const sanitized = url.trim();

  // Add protocol if missing
  let urlWithProtocol = sanitized;
  if (!/^https?:\/\//i.test(sanitized)) {
    urlWithProtocol = "https://" + sanitized;
  }

  try {
    const urlObj = new URL(urlWithProtocol);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return null;
    }

    // Remove trailing slash for consistency
    let result = urlObj.toString();
    if (
      result.endsWith("/") &&
      result !== urlObj.protocol + "//" + urlObj.host + "/"
    ) {
      result = result.slice(0, -1);
    }

    return result;
  } catch {
    return null;
  }
};

/**
 * Sanitize name (removes special characters, limits length)
 * @param {string} name - Name to sanitize
 * @returns {string} - Sanitized name or null if invalid
 */
export const sanitizeName = (name) => {
  if (typeof name !== "string") return null;

  // Remove HTML tags first
  let sanitized = name.replace(/<[^>]*>/g, "");

  // If the name contains script tags, return null
  if (sanitized.toLowerCase().includes("script")) {
    return null;
  }

  // Remove special characters except spaces, hyphens, apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, "");

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Validate length (1-50 characters)
  if (sanitized.length < 1 || sanitized.length > 50) {
    return null;
  }

  return sanitized;
};

/**
 * Sanitize description/text content
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length allowed
 * @returns {string} - Sanitized text or null if invalid
 */
export const sanitizeDescription = (text, maxLength = 1000) => {
  if (typeof text !== "string") return null;

  // Remove HTML tags but preserve line breaks
  let sanitized = text.replace(/<[^>]*>/g, "");

  // If the text contains script tags, return null
  if (sanitized.toLowerCase().includes("script")) {
    return null;
  }

  // Escape HTML entities
  sanitized = sanitizeHtml(sanitized);

  // Normalize line breaks
  sanitized = sanitized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Trim and validate length
  sanitized = sanitized.trim();

  if (sanitized.length > maxLength) {
    return null;
  }

  return sanitized;
};

/**
 * Sanitize age (must be a valid number between 16-100)
 * @param {string|number} age - Age to sanitize
 * @returns {number} - Sanitized age or null if invalid
 */
export const sanitizeAge = (age) => {
  const num = parseInt(age, 10);

  if (isNaN(num) || num < 16 || num > 100) {
    return null;
  }

  return num;
};

/**
 * Sanitize array of strings
 * @param {Array} array - Array to sanitize
 * @param {Function} itemSanitizer - Function to sanitize each item
 * @returns {Array} - Sanitized array
 */
export const sanitizeArray = (array, itemSanitizer = sanitizeText) => {
  if (!Array.isArray(array)) return [];

  return array
    .map((item) => itemSanitizer(item))
    .filter((item) => item !== null && item !== undefined && item !== "");
};

/**
 * Sanitize object with specific field sanitizers
 * @param {Object} obj - Object to sanitize
 * @param {Object} fieldSanitizers - Object mapping field names to sanitizer functions
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj, fieldSanitizers) => {
  if (typeof obj !== "object" || obj === null) return {};

  const sanitized = {};

  for (const [key, sanitizer] of Object.entries(fieldSanitizers)) {
    if (obj.hasOwnProperty(key)) {
      const sanitizedValue = sanitizer(obj[key]);
      if (sanitizedValue !== null && sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"],
  } = options;

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" };
  }

  // Check file extension
  const extension = "." + file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: "Invalid file extension" };
  }

  return { valid: true, file };
};

/**
 * Sanitize form data based on field type
 * @param {Object} formData - Form data to sanitize
 * @param {Object} fieldTypes - Object mapping field names to their types
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData, fieldTypes) => {
  const sanitizers = {
    email: sanitizeEmail,
    phone: sanitizePhone,
    phone_number: sanitizePhone,
    name: sanitizeName,
    company_name: sanitizeName,
    title: sanitizeText,
    description: sanitizeDescription,
    website: sanitizeUrl,
    age: sanitizeAge,
    gender: (value) =>
      ["male", "female", "other"].includes(value?.toLowerCase())
        ? value.toLowerCase()
        : null,
    profile_visibility: (value) =>
      ["public", "private"].includes(value?.toLowerCase())
        ? value.toLowerCase()
        : null,
    company_type: (value) =>
      Array.isArray(value) ? sanitizeArray(value, sanitizeText) : null,
    company_location: sanitizeText,
    // Special sanitizer for user IDs and other identifiers
    userid: (value) =>
      typeof value === "string" && value.length > 0 ? value : null,
    employerid: (value) =>
      typeof value === "string" && value.length > 0 ? value : null,
    candidateid: (value) =>
      typeof value === "string" && value.length > 0 ? value : null,
  };

  const sanitized = {};

  for (const [field, value] of Object.entries(formData)) {
    const sanitizer = fieldTypes[field]
      ? sanitizers[fieldTypes[field]]
      : sanitizeText;
    if (sanitizer) {
      const sanitizedValue = sanitizer(value);
      if (sanitizedValue !== null && sanitizedValue !== undefined) {
        sanitized[field] = sanitizedValue;
      }
    }
  }

  return sanitized;
};

/**
 * Prevent NoSQL injection by sanitizing query parameters
 * @param {Object} query - Query object to sanitize
 * @returns {Object} - Sanitized query
 */
export const sanitizeQuery = (query) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    // Remove any object/array values that could be used for injection
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      // Filter out NoSQL injection operators
      if (
        typeof value === "string" &&
        !key.startsWith("$") &&
        !value.includes("$")
      ) {
        sanitized[key] = sanitizeText(value);
      } else if (typeof value === "number" || typeof value === "boolean") {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized search query
 */
export const sanitizeSearchQuery = (query) => {
  if (typeof query !== "string") return "";

  // Remove HTML tags first
  let sanitized = query.replace(/<[^>]*>/g, "");

  // If the query contains script tags, return empty string
  if (sanitized.toLowerCase().includes("script")) {
    return "";
  }

  // Remove special regex characters that could cause issues
  sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized.trim();
};
