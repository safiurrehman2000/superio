/**
 * Dynamic Rate Limiter
 * Adjusts rate limits based on user type, subscription, and other factors
 */

import { RateLimiter } from "./rate-limiter.js";

/**
 * Get rate limit configuration based on user context
 */
export function getRateLimitConfig(userContext = {}) {
  const {
    isAuthenticated = false,
    userType = "anonymous",
    subscriptionType = "free",
    isAdmin = false,
  } = userContext;

  // Base configurations
  const baseConfigs = {
    // Anonymous users (strictest)
    anonymous: {
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
      jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 2 },
      application: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
      email: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
      api: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
    },

    // Free authenticated users
    free: {
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
      jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
      application: { windowMs: 60 * 60 * 1000, maxRequests: 30 },
      email: { windowMs: 60 * 60 * 1000, maxRequests: 15 },
      api: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
    },

    // Premium users
    premium: {
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
      jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
      application: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
      email: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
      api: { windowMs: 15 * 60 * 1000, maxRequests: 300 },
    },

    // Admin users
    admin: {
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 20 },
      jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
      application: { windowMs: 60 * 60 * 1000, maxRequests: 200 },
      email: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
      api: { windowMs: 15 * 60 * 1000, maxRequests: 500 },
    },
  };

  // Determine user tier
  let userTier = "anonymous";

  if (isAdmin) {
    userTier = "admin";
  } else if (isAuthenticated) {
    if (subscriptionType === "premium") {
      userTier = "premium";
    } else {
      userTier = "free";
    }
  }

  return baseConfigs[userTier];
}

/**
 * Create dynamic rate limiters based on user context
 */
export function createDynamicRateLimiters(userContext = {}) {
  const config = getRateLimitConfig(userContext);

  return {
    auth: new RateLimiter({
      ...config.auth,
      useFirestore: true,
      collectionName: "authRateLimits",
    }),

    jobPosting: new RateLimiter({
      ...config.jobPosting,
      useFirestore: true,
      collectionName: "jobPostingRateLimits",
    }),

    application: new RateLimiter({
      ...config.application,
      useFirestore: true,
      collectionName: "applicationRateLimits",
    }),

    email: new RateLimiter({
      ...config.email,
      useFirestore: true,
      collectionName: "emailRateLimits",
    }),

    api: new RateLimiter({
      ...config.api,
      useFirestore: false, // In-memory for performance
    }),
  };
}

/**
 * Get user context from request
 */
export function getUserContext(request) {
  // This is a simplified example - you'd implement your own user detection logic
  const authHeader = request.headers.get("authorization");
  const userType = request.headers.get("x-user-type") || "anonymous";
  const subscriptionType = request.headers.get("x-subscription-type") || "free";

  return {
    isAuthenticated: !!authHeader,
    userType,
    subscriptionType,
    isAdmin: userType === "admin",
  };
}

/**
 * Dynamic rate limiting decorator
 */
export function withDynamicRateLimit(handler, type = "api") {
  return async (request) => {
    try {
      // Get user context
      const userContext = getUserContext(request);

      // Create dynamic rate limiters
      const rateLimiters = createDynamicRateLimiters(userContext);
      const limiter = rateLimiters[type] || rateLimiters.api;

      // Check rate limit
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

      const result = await limiter.checkRateLimit(req);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: "Too Many Requests",
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
            userTier: getUserContext(request).userType,
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

      // Execute handler
      const response = await handler(request);

      // Add rate limit headers
      if (response instanceof Response) {
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
      console.error("Dynamic rate limiting error:", error);
      return await handler(request);
    }
  };
}

/**
 * Example usage with different user types
 */
export const dynamicRateLimitExamples = {
  // For anonymous users (strictest)
  anonymous: {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
    jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 2 },
    api: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
  },

  // For free users
  free: {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    api: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  },

  // For premium users
  premium: {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
    jobPosting: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
    api: { windowMs: 15 * 60 * 1000, maxRequests: 300 },
  },
};

export default withDynamicRateLimit;
