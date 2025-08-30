/**
 * Request Sanitization Middleware
 * Automatically sanitizes incoming request data to prevent XSS and injection attacks
 */

import { sanitizeQuery, sanitizeSearchQuery } from "./sanitization.js";

/**
 * Middleware to sanitize request data
 * @param {Function} handler - The API route handler
 * @returns {Function} - Wrapped handler with sanitization
 */
export function withSanitization(handler) {
  return async (request, context) => {
    try {
      // Clone the request to avoid modifying the original
      const clonedRequest = request.clone();

      // Sanitize query parameters
      const url = new URL(request.url);
      const sanitizedQuery = sanitizeQuery(
        Object.fromEntries(url.searchParams)
      );

      // Create new URL with sanitized query parameters
      const sanitizedUrl = new URL(request.url);
      Object.entries(sanitizedQuery).forEach(([key, value]) => {
        sanitizedUrl.searchParams.set(key, value);
      });

      // Create new request with sanitized URL
      const sanitizedRequest = new Request(sanitizedUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        cache: request.cache,
        credentials: request.credentials,
        integrity: request.integrity,
        keepalive: request.keepalive,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        signal: request.signal,
      });

      // Call the original handler with sanitized request
      return await handler(sanitizedRequest, context);
    } catch (error) {
      console.error("Error in sanitization middleware:", error);
      return new Response(JSON.stringify({ error: "Invalid request data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

/**
 * Sanitize search parameters specifically
 * @param {URLSearchParams} searchParams - Search parameters to sanitize
 * @returns {Object} - Sanitized search parameters
 */
export function sanitizeSearchParams(searchParams) {
  const sanitized = {};

  for (const [key, value] of searchParams.entries()) {
    if (
      key.toLowerCase().includes("search") ||
      key.toLowerCase().includes("query")
    ) {
      sanitized[key] = sanitizeSearchQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize request body
 * @param {Object} body - Request body to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - Sanitized body or null if invalid
 */
export function validateRequestBody(body, schema) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    if (body.hasOwnProperty(field)) {
      const value = body[field];

      // Check required fields
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        return null;
      }

      // Apply type validation
      if (rules.type && typeof value !== rules.type) {
        return null;
      }

      // Apply length validation
      if (rules.minLength && value.length < rules.minLength) {
        return null;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return null;
      }

      // Apply pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return null;
      }

      // Apply custom validation
      if (rules.validate && !rules.validate(value)) {
        return null;
      }

      sanitized[field] = value;
    } else if (rules.required) {
      return null;
    }
  }

  return sanitized;
}

/**
 * Rate limiting helper
 * @param {string} identifier - Unique identifier for rate limiting
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
export function checkRateLimit(
  identifier,
  maxRequests = 100,
  windowMs = 60000
) {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a similar service
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const userRequests = global.rateLimitStore.get(identifier) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    (timestamp) => timestamp > windowStart
  );

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  global.rateLimitStore.set(identifier, recentRequests);

  return true;
}

/**
 * Security headers middleware
 * @param {Response} response - Response to add headers to
 * @returns {Response} - Response with security headers
 */
export function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);

  // Prevent XSS attacks
  headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Strict transport security
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Content security policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
