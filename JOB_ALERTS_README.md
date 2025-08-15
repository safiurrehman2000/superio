# Job Alert System for Flexijobber

This document describes the implementation of a periodic job alert email system for candidates in the Flexijobber platform.

## Overview

The job alert system allows candidates to:

- Set up personalized job alerts based on categories, locations, and keywords
- Receive periodic emails about new job opportunities that match their preferences
- Manage their alert preferences through a dedicated dashboard

## Architecture

### 1. Frontend Components

#### Job Alerts Management Page

- **Location**: `app/candidates-dashboard/job-alerts/page.jsx`
- **Component**: `components/dashboard-pages/candidates-dashboard/job-alerts/JobAlertsManager.jsx`
- **Features**:
  - Create, edit, and delete job alerts
  - Set frequency (daily, weekly, bi-weekly, monthly)
  - Choose job categories and locations
  - Add keywords for filtering
  - Toggle alert status (active/inactive)

#### Navigation Integration

- Added "Job Alerts" menu item to candidate dashboard sidebar
- **Location**: `utils/constants.js` (candidateMenuData array)

### 2. Backend Services

#### Firebase Cloud Function

- **Location**: `functions/index.js`
- **Function**: `sendJobAlerts`
- **Schedule**: Runs every 24 hours (configurable)
- **Features**:
  - Fetches all candidates with active job alerts
  - Queries recent jobs (last 7 days by default)
  - Filters jobs based on alert preferences
  - Sends personalized email alerts

#### API Endpoint for Testing

- **Location**: `app/api/send-job-alerts/route.js`
- **Purpose**: Manual triggering of job alerts for testing
- **Features**:
  - Test mode (no actual emails sent)
  - Send to specific user or all candidates
  - Detailed results and error reporting

### 3. Email Service

#### Email Templates

- **Location**: `utils/email-service.js`
- **Function**: `sendJobAlertEmail`
- **Template**: Uses existing EmailJS template with job-specific parameters
- **Content**:
  - Personalized greeting
  - Number of matching jobs found
  - List of job titles and companies (up to 10)
  - Call-to-action link to browse jobs

## Database Schema

### Job Alerts Collection

```
users/{userId}/jobAlerts/{alertId}
{
  frequency: "daily" | "weekly" | "biweekly" | "monthly",
  categories: string[], // Job categories/sectors
  locations: string[], // Preferred locations
  keywords: string, // Optional keywords
  status: "active" | "inactive",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Jobs Collection (existing)

```
jobs/{jobId}
{
  title: string,
  description: string,
  location: string,
  tags: string[], // Job categories
  status: "active" | "archived",
  createdAt: number,
  employerId: string,
  // ... other fields
}
```

## Configuration

### Environment Variables

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_pxzdz12
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_ze5clom
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=spX-U3xAiU17jg7yz
NEXT_PUBLIC_EMAILJS_JOB_ALERT_TEMPLATE_ID=template_ze5clom
```

### Firebase Configuration

- **Runtime**: Node.js 22
- **Memory**: 1GB (configurable in firebase.json)
- **Timeout**: 540 seconds
- **Schedule**: Every 24 hours (configurable)

## Usage

### For Candidates

1. **Access Job Alerts**:

   - Log in as a candidate
   - Navigate to "Job Alerts" in the dashboard sidebar

2. **Create Job Alert**:

   - Choose frequency (daily, weekly, bi-weekly, monthly)
   - Select job categories (optional)
   - Choose preferred locations (optional)
   - Add keywords (optional)
   - Click "Create Alert"

3. **Manage Alerts**:
   - View all created alerts in a table
   - Edit existing alerts
   - Toggle alert status (active/inactive)
   - Delete alerts

### For Developers

#### Testing Job Alerts

1. **Add Test Component** (temporary):

   ```jsx
   import JobAlertTestComponent from "@/components/debug/JobAlertTestComponent";

   // Add to any page for testing
   <JobAlertTestComponent />;
   ```

2. **Test Modes**:

   - **Test Mode**: Simulates the process without sending emails
   - **Live Mode**: Actually sends emails to users

3. **API Testing**:

   ```javascript
   // Test all users
   fetch("/api/send-job-alerts", {
     method: "POST",
     body: JSON.stringify({ testMode: true }),
   });

   // Send to specific user
   fetch("/api/send-job-alerts", {
     method: "POST",
     body: JSON.stringify({
       userId: "user123",
       testMode: false,
     }),
   });
   ```

#### Deploying Cloud Function

```bash
# Install dependencies
cd functions
yarn install

# Deploy function
firebase deploy --only functions:sendJobAlerts
```

## Features

### Smart Job Matching

- **Category Filtering**: Matches job tags with alert categories
- **Location Filtering**: Matches job location with alert locations
- **Date Filtering**: Only considers jobs from the last 7 days
- **Sorting**: Jobs sorted by creation date (newest first)
- **Limiting**: Maximum 20 jobs per alert, 10 in email

### Email Personalization

- Personalized greeting with user's name
- Dynamic job count in subject and body
- Curated list of matching jobs
- Professional formatting with company names

### Error Handling

- Graceful handling of missing user data
- Email sending failures don't break the process
- Detailed logging for debugging
- Rate limiting to avoid email service limits

### Performance Optimizations

- Batch processing of users
- Memory-efficient job filtering
- Configurable delays between emails
- Timeout handling for long-running operations

## Monitoring and Logging

### Cloud Function Logs

- Access via Firebase Console > Functions > Logs
- Detailed logging for each step of the process
- Error tracking and debugging information

### Email Delivery Tracking

- EmailJS response status tracking
- Success/failure counts
- Individual email delivery status

## Future Enhancements

### Potential Improvements

1. **Advanced Filtering**:

   - Salary range filtering
   - Job type filtering (full-time, part-time, contract)
   - Experience level matching

2. **Email Templates**:

   - Rich HTML templates with job cards
   - Direct apply buttons
   - Unsubscribe links

3. **Analytics**:

   - Click tracking on job links
   - Email open rate tracking
   - Alert effectiveness metrics

4. **User Preferences**:

   - Email frequency preferences
   - Time zone considerations
   - Multiple alert profiles per user

5. **Performance**:
   - Database indexing optimization
   - Caching strategies
   - Parallel processing for large user bases

## Troubleshooting

### Common Issues

1. **Cloud Function Deployment Fails**:

   - Check Node.js version compatibility
   - Verify Firebase project configuration
   - Check function timeout settings

2. **Emails Not Sending**:

   - Verify EmailJS configuration
   - Check email service limits
   - Review function logs for errors

3. **No Jobs Found**:

   - Verify job data structure
   - Check date filtering logic
   - Review category/location matching

4. **Performance Issues**:
   - Monitor function execution time
   - Check memory usage
   - Review database query optimization

### Debug Tools

- **JobAlertTestComponent**: For manual testing
- **API Endpoint**: For programmatic testing
- **Firebase Logs**: For function debugging
- **EmailJS Dashboard**: For email delivery tracking

## Security Considerations

1. **User Authentication**: Only authenticated candidates can create alerts
2. **Data Privacy**: User preferences stored securely in Firestore
3. **Email Security**: Uses EmailJS for secure email delivery
4. **Rate Limiting**: Built-in delays to prevent abuse
5. **Input Validation**: All user inputs validated and sanitized

## Support

For issues or questions about the job alert system:

1. Check the Firebase function logs
2. Review the test component for debugging
3. Verify EmailJS configuration
4. Test with the API endpoint

---

**Note**: This system is designed to be scalable and maintainable. The modular architecture allows for easy updates and enhancements as the platform grows.
