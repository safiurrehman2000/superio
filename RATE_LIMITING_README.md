# Rate Limiting Implementation Guide

This guide explains how to implement and use rate limiting in your website to protect against abuse, DDoS attacks, and ensure fair usage of your API endpoints.

## Overview

The rate limiting system provides multiple layers of protection:

1. **Middleware-level rate limiting** - Applied automatically to all API routes
2. **API route-level rate limiting** - Granular control for specific endpoints
3. **Firestore-based persistence** - Rate limits persist across server restarts
4. **In-memory caching** - Fast performance for high-traffic scenarios

## Rate Limiting Types

### Pre-configured Rate Limiters

| Type          | Window     | Max Requests | Use Case                 | Storage   |
| ------------- | ---------- | ------------ | ------------------------ | --------- |
| `api`         | 15 minutes | 100          | General API endpoints    | In-memory |
| `auth`        | 15 minutes | 5            | Authentication endpoints | Firestore |
| `jobPosting`  | 1 hour     | 10           | Job posting operations   | Firestore |
| `application` | 1 hour     | 50           | Job applications         | Firestore |
| `email`       | 1 hour     | 20           | Email sending            | Firestore |
| `admin`       | 5 minutes  | 30           | Admin operations         | Firestore |

## Implementation Methods

### Method 1: Automatic Middleware Rate Limiting

Rate limiting is automatically applied to all API routes through the Next.js middleware. The system detects the route type and applies appropriate limits:

```javascript
// Automatically applied based on route patterns
'/api/auth' → auth rate limiting (5 requests/15min)
'/api/jobs' → jobPosting rate limiting (10 requests/hour)
'/api/admin' → admin rate limiting (30 requests/5min)
'/api/*' → general API rate limiting (100 requests/15min)
```

### Method 2: Decorator Pattern

Use the decorator pattern for clean, declarative rate limiting:

```javascript
// app/api/auth/login/route.js
import { rateLimitDecorators } from "@/utils/api-rate-limiter.js";

async function loginHandler(request) {
  // Your login logic here
  return Response.json({ message: "Login successful" });
}

export const POST = rateLimitDecorators.auth(loginHandler);
```

### Method 3: Manual Rate Limit Checking

For more control, manually check rate limits in your handlers:

```javascript
// app/api/jobs/route.js
import {
  checkRateLimitAndRespond,
  addRateLimitHeaders,
} from "@/utils/api-rate-limiter.js";

export async function POST(request) {
  // Check rate limit first
  const rateLimitResponse = await checkRateLimitAndRespond(
    request,
    "jobPosting"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Your job posting logic here
  const response = Response.json({ message: "Job posted successfully" });

  // Add rate limit headers
  addRateLimitHeaders(response, request, "jobPosting");

  return response;
}
```

### Method 4: Custom Rate Limiter

Create custom rate limiters for specific use cases:

```javascript
// utils/custom-rate-limiter.js
import RateLimiter from "@/utils/rate-limiter.js";

const customLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  useFirestore: true,
  collectionName: "customRateLimits",
});

// Use in your API route
const result = await customLimiter.checkRateLimit(request);
if (!result.allowed) {
  return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

## Response Headers

The rate limiting system automatically adds the following headers to responses:

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: When the rate limit window resets (ISO timestamp)
- `Retry-After`: Seconds to wait before retrying (when limit exceeded)

## Rate Limit Exceeded Response

When a rate limit is exceeded, the system returns a 429 status with:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 300 seconds.",
  "retryAfter": 300
}
```

## Configuration

### Customizing Rate Limits

Modify the rate limiters in `utils/rate-limiter.js`:

```javascript
export const rateLimiters = {
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    useFirestore: false,
  }),

  // Add your custom rate limiters here
  custom: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    useFirestore: true,
    collectionName: "customRateLimits",
  }),
};
```

### Route Configuration

Update route patterns in `utils/next-rate-limiter.js`:

```javascript
export const rateLimitConfig = {
  "/api/auth": "auth",
  "/api/jobs": "jobPosting",
  "/api/custom": "custom", // Your custom route
  "/api": "api", // Default
};
```

## Firestore Collections

The system creates the following Firestore collections for rate limiting:

- `rateLimits` - General API rate limits
- `authRateLimits` - Authentication rate limits
- `jobPostingRateLimits` - Job posting rate limits
- `applicationRateLimits` - Application submission rate limits
- `emailRateLimits` - Email sending rate limits
- `adminRateLimits` - Admin operation rate limits

## Security Rules

The Firestore security rules allow:

- `authRateLimits`: Read/write for all users (including unauthenticated)
- `rateLimits`, `jobPostingRateLimits`, `applicationRateLimits`, `emailRateLimits`: Read/write for authenticated users
- `adminRateLimits`: Read/write for admin users only

## Performance Considerations

### In-Memory vs Firestore

- **In-memory**: Faster performance, lost on server restart
- **Firestore**: Persistent across restarts, slightly slower

Use in-memory for high-traffic endpoints and Firestore for critical operations.

### Cleanup

The system automatically cleans up old rate limit data:

- In-memory: Cleaned up every hour
- Firestore: Cleaned up every hour via scheduled function

## Monitoring and Analytics

### Rate Limit Metrics

Track rate limit usage by monitoring:

- 429 responses in your logs
- Rate limit headers in responses
- Firestore collection sizes

### Example Monitoring Query

```javascript
// Check rate limit usage
const rateLimitDoc = await db
  .collection("authRateLimits")
  .doc("ip:userId")
  .get();
if (rateLimitDoc.exists) {
  const data = rateLimitDoc.data();
  console.log(`User has ${data.requests.length} requests in current window`);
}
```

## Best Practices

### 1. Choose Appropriate Limits

- **Authentication**: Strict limits (5 requests/15min)
- **Job Posting**: Moderate limits (10 requests/hour)
- **General API**: Liberal limits (100 requests/15min)

### 2. Use Different Limits for Different User Types

```javascript
// Example: Different limits for premium users
const userType = req.user?.subscriptionType || "free";
const maxRequests = userType === "premium" ? 200 : 100;

const customLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: maxRequests,
});
```

### 3. Implement Graceful Degradation

```javascript
try {
  const result = await checkRateLimit(request, "api");
  if (!result.allowed) {
    // Return cached data or reduced functionality
    return Response.json({
      message: "Rate limit exceeded, showing cached data",
      data: cachedData,
    });
  }
} catch (error) {
  // Allow request to proceed if rate limiting fails
  console.error("Rate limiting error:", error);
}
```

### 4. Monitor and Adjust

Regularly review rate limit effectiveness:

- Are legitimate users hitting limits?
- Are limits preventing abuse effectively?
- Should limits be adjusted based on usage patterns?

## Troubleshooting

### Common Issues

1. **Rate limits too strict**: Increase `maxRequests` or `windowMs`
2. **Rate limits too lenient**: Decrease `maxRequests` or `windowMs`
3. **Performance issues**: Use in-memory storage for high-traffic endpoints
4. **Firestore errors**: Check security rules and permissions

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG_RATE_LIMITING=true
```

This will log rate limit checks and decisions to the console.

## Migration Guide

### From No Rate Limiting

1. Deploy the rate limiting utilities
2. Update middleware.js
3. Add Firestore security rules
4. Gradually apply to existing API routes

### From External Rate Limiting

1. Remove external rate limiting dependencies
2. Update API routes to use the new system
3. Configure appropriate limits
4. Test thoroughly
5. Monitor performance

## Support

For issues or questions about rate limiting:

1. Review the utility files in `utils/`
2. Monitor Firestore collections for rate limit data
3. Check server logs for rate limiting errors

## Security Considerations

- Rate limiting helps prevent brute force attacks
- Consider implementing CAPTCHA for repeated failures
- Monitor for unusual rate limit patterns
- Implement IP-based blocking for persistent abuse
- Use different limits for authenticated vs unauthenticated users
