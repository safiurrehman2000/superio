# Admin API Security Documentation

## Overview

All admin API routes are now protected with Firebase Authentication and require admin privileges. This ensures that only authenticated admin users can access sensitive administrative functions.

## Authentication Flow

### 1. Client-Side Authentication

- Admin users must be logged in with Firebase Auth
- The client automatically includes the Firebase ID token in API requests
- Token is refreshed automatically when needed

### 2. Server-Side Verification

- Each admin API route verifies the Firebase ID token
- Checks if the user exists in the database
- Validates that the user has `userType: "Admin"`
- Returns appropriate error responses for unauthorized access

## Protected Routes

### DELETE `/api/admin/delete-user`

- **Purpose**: Delete a user's Firebase Auth account and all related Firestore data
- **Authentication**: Required
- **Authorization**: Admin only
- **Parameters**: `userId` (query parameter)
- **Safety**: Prevents admin from deleting their own account

### PUT `/api/admin/update-user`

- **Purpose**: Update user data by admin
- **Authentication**: Required
- **Authorization**: Admin only
- **Body**: `{ userId, updateData }`
- **Safety**:
  - Prevents admin from updating their own account through this endpoint
  - Filters updateData to only allow specific fields
  - Adds audit trail (lastUpdatedBy, lastUpdatedAt)

### GET `/api/admin/list-users`

- **Purpose**: List users with pagination and filtering
- **Authentication**: Required
- **Authorization**: Admin only
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Users per page (default: 10, max: 50)
  - `userType`: Filter by user type
  - `search`: Search by email or name
  - `status`: Filter by subscription status

## Client-Side Usage

### Using the Admin Functions

```javascript
import {
  deleteUserCompletelyByAdmin,
  updateUserByAdminAPI,
  listUsersByAdmin,
} from "@/APIs/auth/admin";

// Delete a user
const result = await deleteUserCompletelyByAdmin("user123");
if (result.success) {
  console.log("User deleted successfully");
} else {
  console.error("Error:", result.error);
}

// Update a user
const updateResult = await updateUserByAdminAPI("user123", {
  name: "New Name",
  subscriptionStatus: "active",
});

// List users
const listResult = await listUsersByAdmin({
  page: 1,
  limit: 20,
  userType: "Employer",
  search: "john@example.com",
});
```

### Authentication Utilities

```javascript
import {
  getCurrentUserToken,
  isCurrentUserAdmin,
  getAuthenticatedHeaders,
} from "@/utils/auth-utils";

// Check if current user is admin
const isAdmin = await isCurrentUserAdmin();

// Get authentication headers for custom requests
const headers = await getAuthenticatedHeaders();
const response = await fetch("/api/admin/custom-endpoint", {
  method: "POST",
  headers,
  body: JSON.stringify(data),
});
```

## Security Features

### 1. Token Verification

- Firebase ID tokens are verified on every request
- Tokens are automatically refreshed when expired
- Invalid tokens result in 401 Unauthorized responses

### 2. Role-Based Access Control

- Only users with `userType: "Admin"` can access admin routes
- Non-admin users receive 403 Forbidden responses

### 3. Input Validation

- All required parameters are validated
- Update operations filter allowed fields
- Query parameters are sanitized and limited

### 4. Audit Trail

- Admin actions are logged with admin user information
- Update operations track who made the change and when

### 5. Safety Measures

- Admins cannot delete their own accounts through admin endpoints
- Admins cannot update their own accounts through admin endpoints
- Maximum limits on pagination to prevent abuse

## Error Handling

### Common Error Responses

```javascript
// 401 Unauthorized - No token or invalid token
{
  "success": false,
  "error": "Authorization header is required"
}

// 403 Forbidden - Not an admin
{
  "success": false,
  "error": "Access denied. Admin privileges required"
}

// 400 Bad Request - Invalid parameters
{
  "success": false,
  "error": "User ID is required"
}

// 404 Not Found - User doesn't exist
{
  "success": false,
  "error": "User not found"
}
```

## Best Practices

### 1. Always Check Authentication

```javascript
// Before making admin API calls
const isAdmin = await isCurrentUserAdmin();
if (!isAdmin) {
  // Show error or redirect
  return;
}
```

### 2. Handle Errors Gracefully

```javascript
const result = await deleteUserCompletelyByAdmin(userId);
if (!result.success) {
  // Show user-friendly error message
  errorToast(result.error);
  return;
}
```

### 3. Use Appropriate Limits

```javascript
// Don't request too many users at once
const result = await listUsersByAdmin({
  limit: 20, // Reasonable limit
  page: 1,
});
```

### 4. Log Admin Actions

```javascript
// Log important admin actions for audit purposes
console.log(`Admin ${adminEmail} performed action: ${action}`);
```

## Testing

### Testing Authentication

1. Try accessing admin routes without being logged in
2. Try accessing admin routes as a non-admin user
3. Verify that expired tokens are handled properly
4. Test with valid admin credentials

### Testing Authorization

1. Verify that only admin users can access admin routes
2. Test that non-admin users receive 403 responses
3. Verify that admins cannot delete/update their own accounts through admin endpoints

## Troubleshooting

### Common Issues

1. **"Authentication required" error**

   - User is not logged in
   - Firebase token has expired
   - Solution: Re-authenticate the user

2. **"Access denied" error**

   - User is not an admin
   - Solution: Check user's userType in Firestore

3. **"User not found" error**

   - The target user doesn't exist
   - Solution: Verify the user ID is correct

4. **Token refresh issues**
   - Firebase token refresh failed
   - Solution: Force user to log in again
