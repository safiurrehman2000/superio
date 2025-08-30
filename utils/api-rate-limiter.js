/**
 * API Rate Limiting Utility
 * Helper functions for applying rate limiting in API route handlers
 */

import {
  checkServerRateLimit,
  createServerRateLimitResponse,
} from "./server-rate-limiter.js";
import { rateLimiters } from "./rate-limiter.js";

/**
 * Wrapper function to apply rate limiting to API route handlers
 */
export function withRateLimit(handler, type = "api") {
  return async (request) => {
    try {
      // Check rate limit
      const result = await checkServerRateLimit(request, type);

      if (!result.allowed) {
        const limiter = rateLimiters[type] || rateLimiters.api;
        return createServerRateLimitResponse(result, limiter);
      }

      // Add rate limit headers to the response
      const response = await handler(request);

      if (response instanceof Response) {
        const limiter = rateLimiters[type] || rateLimiters.api;
        response.headers.set(
          "X-RateLimit-Limit",
          limiter.maxRequests.toString()
        );
        response.headers.set(
          "X-RateLimit-Remaining",
          result.remaining.toString()
        );
        response.headers.set(
          "X-RateLimit-Reset",
          new Date(result.resetTime).toISOString()
        );
      }

      return response;
    } catch (error) {
      console.error("Rate limiting error in API route:", error);
      // Allow request to proceed if rate limiting fails
      return await handler(request);
    }
  };
}

/**
 * Rate limiting decorators for specific operations
 */
export const rateLimitDecorators = {
  // Authentication operations
  auth: (handler) => withRateLimit(handler, "auth"),

  // Job posting operations
  jobPosting: (handler) => withRateLimit(handler, "jobPosting"),

  // Application operations
  application: (handler) => withRateLimit(handler, "application"),

  // Email operations
  email: (handler) => withRateLimit(handler, "email"),

  // Admin operations
  admin: (handler) => withRateLimit(handler, "admin"),

  // General API operations
  api: (handler) => withRateLimit(handler, "api"),
};

/**
 * Helper function to check rate limit and return appropriate response
 */
export async function checkRateLimitAndRespond(request, type = "api") {
  const result = await checkServerRateLimit(request, type);

  if (!result.allowed) {
    const limiter = rateLimiters[type] || rateLimiters.api;
    return createServerRateLimitResponse(result, limiter);
  }

  return null; // No rate limit exceeded
}

/**
 * Helper function to add rate limit headers to response
 */
export function addRateLimitHeaders(response, request, type = "api") {
  const limiter = rateLimiters[type] || rateLimiters.api;

  // We need to check the rate limit again to get current remaining count
  // This is a simplified version - in practice, you might want to pass the result
  response.headers.set("X-RateLimit-Limit", limiter.maxRequests.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(Date.now() + limiter.windowMs).toISOString()
  );

  return response;
}

/**
 * Example usage patterns
 */
export const rateLimitExamples = {
  // Example 1: Using decorator pattern
  decoratorExample: `
    // In your API route file
    import { rateLimitDecorators } from '@/utils/api-rate-limiter.js';
    
    async function handler(request) {
      // Your API logic here
      return Response.json({ message: 'Success' });
    }
    
    export const GET = rateLimitDecorators.auth(handler);
    export const POST = rateLimitDecorators.jobPosting(handler);
  `,

  // Example 2: Manual rate limit checking
  manualExample: `
    // In your API route file
    import { checkRateLimitAndRespond } from '@/utils/api-rate-limiter.js';
    
    export async function POST(request) {
      // Check rate limit first
      const rateLimitResponse = await checkRateLimitAndRespond(request, 'jobPosting');
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      
      // Your API logic here
      const response = Response.json({ message: 'Job posted successfully' });
      
      // Add rate limit headers
      addRateLimitHeaders(response, request, 'jobPosting');
      
      return response;
    }
  `,

  // Example 3: Custom rate limit configuration
  customExample: `
    // In your API route file
    import { withRateLimit } from '@/utils/api-rate-limiter.js';
    
    async function handler(request) {
      // Your API logic here
      return Response.json({ message: 'Success' });
    }
    
    // Apply custom rate limiting
    export const POST = withRateLimit(handler, 'email');
  `,
};

export default withRateLimit;
