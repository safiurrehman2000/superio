# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Superio is a Next.js-based job board platform that connects employers and job candidates. It features subscription-based job posting, user dashboards, Firebase integration, and Stripe payments. The platform serves both employers and candidates with separate dashboard experiences.

## Core Commands

### Development
```bash
# Start development server
yarn dev

# Start development server with HTTPS (for testing integrations)
yarn dev:https

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint
```

### Stripe Integration (Development)
```bash
# Listen to Stripe webhooks locally
yarn stripe:listen

# Test subscription deletion webhook
yarn stripe:trigger-delete-subscription

# Test subscription update webhook
yarn stripe:trigger-delete-updated
```

### Firebase Functions
```bash
# Navigate to functions directory
cd functions

# Deploy specific function
firebase deploy --only functions:sendJobAlerts

# Deploy all functions
firebase deploy --only functions
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 (React 18)
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **Payments**: Stripe integration
- **Styling**: Bootstrap 5.2.3 + Sass
- **State Management**: Redux Toolkit
- **Email**: EmailJS for notifications
- **Deployment**: Firebase Hosting

### Project Structure
```
├── app/                          # Next.js App Router pages
│   ├── (blog)/                  # Blog pages grouping
│   ├── (others)/                # Authentication & static pages
│   ├── admin-dashboard/         # Admin interface
│   ├── candidates-dashboard/    # Candidate dashboard pages
│   ├── employers-dashboard/     # Employer dashboard pages
│   ├── api/                     # API routes
│   └── layout.js                # Root layout
├── components/                  # Reusable React components
│   ├── dashboard-pages/         # Dashboard-specific components
│   ├── header/                  # Navigation components
│   ├── footer/                  # Footer components
│   └── ...
├── functions/                   # Firebase Cloud Functions
├── utils/                       # Utility functions and constants
├── data/                        # Static data files
├── styles/                      # Global styles and themes
├── features/                    # Redux slices
├── store/                       # Redux store configuration
└── public/                      # Static assets
```

### Key Architectural Patterns

#### User Types & Authentication
- Three user types: `Candidate`, `Employer`, `Admin`
- Firebase Authentication with custom user data in Firestore
- Route guards implemented via `RouteGuard.jsx`
- User state managed through Redux

#### Dashboard Architecture
- Separate dashboard layouts for each user type
- Dynamic imports used for dashboard pages to improve performance
- Sidebar navigation defined in `utils/constants.js`
- Header components vary based on user type

#### Subscription System
- Stripe-based subscription management
- Job posting limits enforced based on subscription tiers
- Webhook handling for subscription events
- Package tiers stored in Firebase (`pricingPackages` collection)

#### Job Alert System
- Cloud Function (`sendJobAlerts`) runs every 24 hours
- Personalized email alerts based on user preferences
- Job filtering by categories, locations, and keywords
- EmailJS integration for email delivery

## Database Schema

### Collections
```javascript
// Users
users/{uid} {
  userType: "Candidate" | "Employer" | "Admin",
  stripeSubscriptionId?: string,
  planId?: string,
  email: string,
  // ... profile fields
}

// Job Alerts (subcollection)
users/{uid}/jobAlerts/{alertId} {
  frequency: "daily" | "weekly" | "biweekly" | "monthly",
  categories: string[],
  locations: string[],
  keywords: string,
  status: "active" | "inactive"
}

// Jobs
jobs/{jobId} {
  title: string,
  description: string,
  location: string,
  tags: string[],
  employerId: string,
  status: "active" | "archived",
  createdAt: number
}

// Pricing Packages
pricingPackages/{packageId} {
  packageType: string,
  jobPosts: number,
  stripePriceId?: string,
  features: string[],
  isActive: boolean
}
```

## Development Guidelines

### Component Organization
- Dashboard components in `components/dashboard-pages/{userType}-dashboard/`
- Reusable UI components in respective feature folders
- Page components use dynamic imports for better performance

### State Management
- User authentication state in Redux (`features/user/userSlice.js`)
- Use `useSelector` and `useDispatch` for state access
- Keep component state minimal, prefer server state via Firebase

### Firebase Integration
- Configuration in `utils/firebase.js`
- Use Firebase v9+ modular SDK
- Firestore security rules enforce user type permissions
- Functions handle server-side business logic

### Stripe Integration
- API routes handle Stripe operations (`app/api/`)
- Webhooks process subscription events
- Client-side uses React Stripe.js components
- Test mode supported via environment variables

## Testing Job Alerts

The job alert system includes a test component for development:

```javascript
// Add to any page temporarily
import JobAlertTestComponent from "@/components/debug/JobAlertTestComponent";

// Test modes available:
// - Test mode: Simulates process without sending emails
// - Live mode: Actually sends emails
```

API testing:
```bash
# Test all users (safe mode)
curl -X POST http://localhost:3000/api/send-job-alerts \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'

# Send to specific user
curl -X POST http://localhost:3000/api/send-job-alerts \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "testMode": false}'
```

## Environment Variables

Required environment variables:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_EMAILJS_JOB_ALERT_TEMPLATE_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Key Features

### Subscription Management
- Multi-tier subscription system (Basic/Standard/Extended)
- Job posting limits based on subscription level
- Automatic subscription validation before job posting
- Stripe Customer Portal integration

### Job Alert System
- Automated daily job alerts via Cloud Functions
- Smart job matching based on user preferences
- Email templates with personalized content
- Configurable alert frequencies

### User Dashboards
- Role-based dashboard experiences
- Real-time subscription status display
- Job management for employers
- Application tracking for candidates

## Common Development Tasks

### Adding New Dashboard Page
1. Create page in `app/{userType}-dashboard/new-page/page.jsx`
2. Create component in `components/dashboard-pages/{userType}-dashboard/`
3. Add route to menu data in `utils/constants.js`
4. Implement with dynamic import for performance

### Modifying Subscription Logic
1. Update API routes in `app/api/` for new business rules
2. Modify validation functions in `utils/` directory
3. Update frontend components to reflect new logic
4. Test with Stripe test webhooks

### Adding Email Templates
1. Create template in EmailJS dashboard
2. Add template ID to environment variables
3. Update email service functions in `utils/email-service.js`
4. Test with job alert system

### Debugging Firebase Functions
1. Check Firebase Console > Functions > Logs
2. Use local testing with Firebase emulator
3. Verify environment variables in function config
4. Test API endpoints manually before deployment

This codebase emphasizes separation of concerns with clear user type boundaries, subscription-based business logic, and Firebase-first architecture for scalability.
