/**
 * Rate Limiting Utility
 * Supports both in-memory and Firestore-based rate limiting
 */

// Firebase Admin will be imported dynamically when needed
let db = null;

// In-memory store for rate limiting (for production, consider using Redis)
const rateLimitStore = new Map();

/**
 * Rate Limiter Class
 */
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
    this.maxRequests = options.maxRequests || 100; // 100 requests per window
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
    this.useFirestore = options.useFirestore || false;
    this.collectionName = options.collectionName || "rateLimits";
  }

  /**
   * Default key generator - uses IP address and user ID if available
   */
  defaultKeyGenerator(req) {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown";

    const userId = req.user?.uid || req.headers["x-user-id"] || "anonymous";
    return `${ip}:${userId}`;
  }

  /**
   * Check if request is within rate limit
   */
  async checkRateLimit(req) {
    const key = this.keyGenerator(req);

    if (this.useFirestore) {
      return await this.checkFirestoreRateLimit(key);
    } else {
      return this.checkMemoryRateLimit(key);
    }
  }

  /**
   * In-memory rate limiting
   */
  checkMemoryRateLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create rate limit data
    let rateLimitData = rateLimitStore.get(key);
    if (!rateLimitData) {
      rateLimitData = {
        requests: [],
        resetTime: now + this.windowMs,
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Clean old requests outside the window
    rateLimitData.requests = rateLimitData.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    // Check if limit exceeded
    if (rateLimitData.requests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitData.resetTime,
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
      };
    }

    // Add current request
    rateLimitData.requests.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - rateLimitData.requests.length,
      resetTime: rateLimitData.resetTime,
      retryAfter: 0,
    };
  }

  /**
   * Firestore-based rate limiting
   */
  async checkFirestoreRateLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Dynamically import Firebase Admin if not already loaded
      if (!db) {
        try {
          if (typeof window === "undefined") {
            // Server-side only
            const { db: firebaseDb } = await import("./firebase-admin.js");
            db = firebaseDb;
          } else {
            // Client-side, fallback to in-memory
            console.warn(
              "Firebase Admin not available on client-side, using in-memory rate limiting"
            );
            return this.checkMemoryRateLimit(key);
          }
        } catch (importError) {
          console.warn(
            "Firebase Admin import failed, falling back to in-memory rate limiting:",
            importError.message
          );
          return this.checkMemoryRateLimit(key);
        }
      }

      const docRef = db.collection(this.collectionName).doc(key);
      const doc = await docRef.get();

      let rateLimitData;
      if (doc.exists) {
        rateLimitData = doc.data();
        // Clean old requests outside the window
        rateLimitData.requests = rateLimitData.requests.filter(
          (timestamp) => timestamp > windowStart
        );
      } else {
        rateLimitData = {
          requests: [],
          resetTime: now + this.windowMs,
        };
      }

      // Check if limit exceeded
      if (rateLimitData.requests.length >= this.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitData.resetTime,
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
        };
      }

      // Add current request
      rateLimitData.requests.push(now);

      // Update Firestore
      await docRef.set(rateLimitData, { merge: true });

      return {
        allowed: true,
        remaining: this.maxRequests - rateLimitData.requests.length,
        resetTime: rateLimitData.resetTime,
        retryAfter: 0,
      };
    } catch (error) {
      console.error("Firestore rate limiting error:", error);
      // Fallback to allowing the request if Firestore fails
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
        retryAfter: 0,
      };
    }
  }

  /**
   * Clean up old rate limit data
   */
  async cleanup() {
    if (this.useFirestore) {
      await this.cleanupFirestore();
    } else {
      this.cleanupMemory();
    }
  }

  /**
   * Clean up in-memory store
   */
  cleanupMemory() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, data] of rateLimitStore.entries()) {
      data.requests = data.requests.filter(
        (timestamp) => timestamp > windowStart
      );
      if (data.requests.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Clean up Firestore rate limit data
   */
  async cleanupFirestore() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Ensure db is available
      if (!db) {
        try {
          if (typeof window === "undefined") {
            const { db: firebaseDb } = await import("./firebase-admin.js");
            db = firebaseDb;
          } else {
            return; // Skip cleanup on client-side
          }
        } catch (importError) {
          console.warn(
            "Firebase Admin import failed during cleanup:",
            importError.message
          );
          return;
        }
      }

      const snapshot = await db
        .collection(this.collectionName)
        .where("resetTime", "<", now)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error("Firestore cleanup error:", error);
    }
  }
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    useFirestore: false, // Use in-memory for better performance
  }),

  // Authentication rate limiting (stricter)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    useFirestore: true, // Use Firestore for persistence across server restarts
    collectionName: "authRateLimits",
  }),

  // Job posting rate limiting
  jobPosting: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 job posts per hour
    useFirestore: true,
    collectionName: "jobPostingRateLimits",
  }),

  // Application submission rate limiting
  application: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 applications per hour
    useFirestore: true,
    collectionName: "applicationRateLimits",
  }),

  // Email sending rate limiting
  email: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 emails per hour
    useFirestore: true,
    collectionName: "emailRateLimits",
  }),

  // Admin operations rate limiting
  admin: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30, // 30 admin operations per 5 minutes
    useFirestore: true,
    collectionName: "adminRateLimits",
  }),
};

/**
 * Middleware function for Express/Next.js API routes
 */
export function rateLimitMiddleware(type = "api") {
  const limiter = rateLimiters[type] || rateLimiters.api;

  return async (req, res, next) => {
    try {
      const result = await limiter.checkRateLimit(req);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", limiter.maxRequests);
      res.setHeader("X-RateLimit-Remaining", result.remaining);
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(result.resetTime).toISOString()
      );

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);
        return res.status(429).json({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Allow request to proceed if rate limiting fails
      next();
    }
  };
}

/**
 * Firestore security rules helper for rate limiting
 */
export function getFirestoreRateLimitRules() {
  return `
    // Rate limiting collections
    match /rateLimits/{docId} {
      allow read, write: if isAuthenticated();
    }
    
    match /authRateLimits/{docId} {
      allow read, write: if true; // Allow unauthenticated for auth endpoints
    }
    
    match /jobPostingRateLimits/{docId} {
      allow read, write: if isAuthenticated();
    }
    
    match /applicationRateLimits/{docId} {
      allow read, write: if isAuthenticated();
    }
    
    match /emailRateLimits/{docId} {
      allow read, write: if isAuthenticated();
    }
    
    match /adminRateLimits/{docId} {
      allow read, write: if isAdmin();
    }
  `;
}

/**
 * Cleanup function to run periodically
 */
export async function cleanupRateLimits() {
  for (const limiter of Object.values(rateLimiters)) {
    await limiter.cleanup();
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 60 * 60 * 1000);
}

export default RateLimiter;
