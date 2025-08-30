/**
 * Server-Side Rate Limiting Utility
 * Safe for use in API routes (server-side only)
 */

import { rateLimiters } from "./rate-limiter.js";

/**
 * Server-side rate limiting middleware for API routes
 */
export function createServerRateLimitMiddleware(type = "api") {
  const limiter = rateLimiters[type] || rateLimiters.api;

  return async function serverRateLimitMiddleware(request) {
    try {
      // Create a mock req object for the rate limiter
      const req = {
        headers: Object.fromEntries(request.headers.entries()),
        url: request.url,
        method: request.method,
        // Extract IP from headers
        connection: {
          remoteAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown",
        },
      };

      const result = await limiter.checkRateLimit(req);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: "Too Many Requests",
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": result.retryAfter.toString(),
              "X-RateLimit-Limit": limiter.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            },
          }
        );
      }

      // Continue with the request
      const response = new Response();

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", limiter.maxRequests.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        result.remaining.toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(result.resetTime).toISOString()
      );

      return response;
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Allow request to proceed if rate limiting fails
      return new Response();
    }
  };
}

/**
 * Rate limiting configuration for different API routes
 */
export const serverRateLimitConfig = {
  // Authentication routes
  "/api/auth": "auth",
  "/api/login": "auth",
  "/api/register": "auth",
  "/api/forgot-password": "auth",

  // Job posting routes
  "/api/jobs": "jobPosting",
  "/api/post-job": "jobPosting",
  "/api/edit-job": "jobPosting",

  // Application routes
  "/api/applications": "application",
  "/api/apply": "application",

  // Email routes
  "/api/send-email": "email",
  "/api/contact": "email",

  // Admin routes
  "/api/admin": "admin",
  "/api/admin/users": "admin",
  "/api/admin/jobs": "admin",

  // Default for all other API routes
  "/api": "api",
};

/**
 * Enhanced server-side rate limiting middleware
 */
export function enhancedServerRateLimitMiddleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find the most specific matching route
  let rateLimitType = "api"; // default

  for (const [route, type] of Object.entries(serverRateLimitConfig)) {
    if (pathname.startsWith(route)) {
      rateLimitType = type;
      break;
    }
  }

  return createServerRateLimitMiddleware(rateLimitType)(request);
}

/**
 * Utility function to check rate limits in API route handlers
 */
export async function checkServerRateLimit(request, type = "api") {
  const limiter = rateLimiters[type] || rateLimiters.api;

  const req = {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
    connection: {
      remoteAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown",
    },
  };

  return await limiter.checkRateLimit(req);
}

/**
 * Response helper for rate limit exceeded
 */
export function createServerRateLimitResponse(result, limiter) {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": result.retryAfter.toString(),
        "X-RateLimit-Limit": limiter.maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
      },
    }
  );
}

export default enhancedServerRateLimitMiddleware;
