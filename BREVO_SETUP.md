# Brevo Email Integration Setup Guide

This guide will help you set up Brevo (formerly Sendinblue) for sending transactional emails in your Flexijobber application.

## 🚀 What is Brevo?

Brevo is a comprehensive email marketing and CRM platform that's perfect for:

- **Transactional emails** (job alerts, welcome emails, application confirmations)
- **Marketing emails** (newsletters, promotions)
- **SMS marketing**
- **Marketing automation**

## 📋 Prerequisites

1. A Brevo account (free tier available with 300 emails/day)
2. Your Next.js application running
3. Environment variables configured

## 🔧 Step 1: Create a Brevo Account

1. Go to [Brevo.com](https://www.brevo.com)
2. Sign up for a free account
3. Verify your email address

## 🔑 Step 2: Get Your API Key

1. Log into your Brevo dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create a new API key**
4. Give it a name (e.g., "Flexijobber Production")
5. Select **Full Access** or **Restricted Access** with email permissions
6. Copy the API key (it starts with `xkeysib-`)

## ⚙️ Step 3: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Brevo Configuration
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Flexijobber
BREVO_REPLY_TO_EMAIL=support@yourdomain.com

# Optional: Template IDs (if using Brevo templates)
BREVO_JOB_ALERT_TEMPLATE_ID=1
BREVO_WELCOME_TEMPLATE_ID=2
BREVO_APPLICATION_TEMPLATE_ID=3
```

## 📧 Step 4: Verify Your Sender Domain

1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Wait for verification (usually takes a few minutes)

## 🧪 Step 5: Test the Integration

### Option 1: Use the Test Page

1. Navigate to `/test-brevo` in your application
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox for the test email

### Option 2: Use the Debug Component

1. Add the `EmailTestComponent` to any page temporarily
2. Click "Test Brevo Email"
3. Check the results

### Option 3: Test Job Alerts

1. Create a job alert for a candidate
2. Run the job alerts API: `POST /api/send-job-alerts`
3. Check if emails are sent

## 📁 Files Created/Modified

### New Files:

- `utils/brevo-config.js` - Brevo configuration and email templates
- `utils/brevo-email-service.js` - Email sending functions
- `app/api/test-brevo/route.js` - Test API endpoint
- `components/debug/BrevoTestComponent.jsx` - Test component
- `app/test-brevo/page.jsx` - Test page

### Modified Files:

- `app/api/send-job-alerts/route.js` - Updated to use Brevo
- `components/debug/EmailTestComponent.jsx` - Added Brevo test button

## 🎯 Email Types Supported

### 1. Job Alert Emails

- **Function**: `sendJobAlertEmailBrevo()`
- **Trigger**: When new jobs match candidate preferences
- **Content**: Multiple job listings with details and apply links

### 2. Welcome Emails

- **Function**: `sendWelcomeEmailBrevo()`
- **Trigger**: When new users register
- **Content**: Welcome message with next steps

### 3. Application Confirmation Emails

- **Function**: `sendApplicationConfirmationBrevo()`
- **Trigger**: When candidates apply to jobs
- **Content**: Confirmation with job details

## 🔍 Troubleshooting

### Common Issues:

1. **"API key not found" error**

   - Check that `BREVO_API_KEY` is set correctly
   - Verify the API key in Brevo dashboard

2. **"Sender not verified" error**

   - Verify your sender domain in Brevo
   - Check DNS records are correct

3. **Emails not delivered**

   - Check spam folder
   - Verify sender email is correct
   - Check Brevo dashboard for delivery status

4. **Rate limiting**
   - Free tier: 300 emails/day
   - Check your Brevo account limits

### Debug Steps:

1. Check browser console for errors
2. Check server logs for API errors
3. Use the test components to isolate issues
4. Check Brevo dashboard for email status

## 📊 Monitoring

### Brevo Dashboard:

- **Activity Log**: See all sent emails
- **Statistics**: Delivery rates, open rates, click rates
- **Bounces**: Handle failed deliveries
- **Reports**: Detailed analytics

### Application Logs:

- Check console for email sending confirmations
- Monitor for API errors
- Track job alert processing

## 🚀 Production Deployment

1. **Environment Variables**: Ensure all Brevo variables are set in production
2. **Domain Verification**: Verify your production domain in Brevo
3. **Rate Limits**: Monitor email sending limits
4. **Monitoring**: Set up alerts for email failures

## 💰 Pricing

- **Free Tier**: 300 emails/day
- **Starter**: $25/month for 20,000 emails
- **Business**: $65/month for 100,000 emails
- **Enterprise**: Custom pricing

## 🔗 Useful Links

- [Brevo API Documentation](https://developers.brevo.com/)
- [Brevo Email Templates](https://app.brevo.com/templates)
- [Brevo Sender Verification](https://help.brevo.com/hc/en-us/articles/209467485-How-to-verify-your-sender-domain)
- [Brevo Best Practices](https://help.brevo.com/hc/en-us/articles/209467485-How-to-verify-your-sender-domain)

## ✅ Success Checklist

- [ ] Brevo account created
- [ ] API key generated and configured
- [ ] Environment variables set
- [ ] Sender domain verified
- [ ] Test email sent successfully
- [ ] Job alerts working
- [ ] Welcome emails working
- [ ] Application confirmations working
- [ ] Production deployment tested

---

**Need Help?** Check the troubleshooting section above or refer to Brevo's documentation.
