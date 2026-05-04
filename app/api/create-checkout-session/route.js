import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import { isEmployerCompanyProfileComplete } from '@/utils/isEmployerCompanyProfileComplete';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { priceId, userId, planId, source } = body;

    console.log('Creating Stripe session for userId:', userId);
    console.log('Price ID:', priceId, 'Plan ID:', planId, 'Source:', source);

    // Validate required fields
    if (!priceId || !userId || !planId) {
      console.error('Missing required fields:', { priceId, userId, planId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 },
      );
    }

    // Fetch user from Firestore to get existing stripeCustomerId
    let userDoc;
    try {
      userDoc = await adminDb.collection('users').doc(userId).get();
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 },
      );
    }

    const userData = userDoc.exists ? userDoc.data() : {};
    if (
      userData.userType === 'Employer' &&
      !isEmployerCompanyProfileComplete(userData)
    ) {
      return NextResponse.json(
        {
          error:
            'Complete your company profile (name, phone, location, company type, and description) before subscribing.',
        },
        { status: 400 },
      );
    }
    const stripeCustomerId = userData.stripeCustomerId || null;
    const userEmail = userData.email || null;
    const companyName = userData.company_name || null;
    const companyPhone = userData.phone || userData.phone_number || null;
    const companyLocation = userData.company_location || null;
    const origin = request.headers.get('origin');
    const isOnboarding = source === 'onboarding';
    const successUrl = isOnboarding
      ? `${origin}/onboard-order-completed?session_id={CHECKOUT_SESSION_ID}&source=onboarding`
      : `${origin}/success?session_id={CHECKOUT_SESSION_ID}&source=pricing`;
    const cancelUrl = isOnboarding
      ? `${origin}/onboard-pricing`
      : `${origin}/employers-dashboard/packages`;

    console.log('Creating Stripe session with URLs:', {
      successUrl,
      cancelUrl,
    });

    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
      console.log('Price validation successful:', {
        priceId: price.id,
        active: price.active,
        nickname: price.nickname,
        unitAmount: price.unit_amount,
        currency: price.currency,
      });

      if (!price.active) {
        return NextResponse.json(
          { error: 'Price is not active' },
          { status: 400 },
        );
      }

      if (price.currency !== 'eur') {
        return NextResponse.json(
          {
            error:
              'This plan uses a non-EUR Stripe price. Create EUR prices in Stripe and link them in admin, or contact support.',
          },
          { status: 400 },
        );
      }
    } catch (priceError) {
      console.error('Price validation failed:', priceError);
      return NextResponse.json(
        { error: `Invalid price ID: ${priceError.message}` },
        { status: 400 },
      );
    }

    const useAutomaticTax =
      process.env.STRIPE_CHECKOUT_AUTOMATIC_TAX === 'true';
    const vatTaxRateId = process.env.STRIPE_VAT_TAX_RATE_ID?.trim() || null;

    const allowCheckoutWithoutVat =
      process.env.STRIPE_ALLOW_CHECKOUT_WITHOUT_VAT === 'true';
    if (!useAutomaticTax && !vatTaxRateId && !allowCheckoutWithoutVat) {
      return NextResponse.json(
        {
          error:
            'Server configuration: set STRIPE_VAT_TAX_RATE_ID to your 21% Stripe Tax rate id (Dashboard → Product catalog → Tax rates → copy id like txr_...), or set STRIPE_CHECKOUT_AUTOMATIC_TAX=true if you use Stripe Tax. (Optional: STRIPE_ALLOW_CHECKOUT_WITHOUT_VAT=true to bypass for testing.)',
        },
        { status: 500 },
      );
    }

    if (!useAutomaticTax && vatTaxRateId) {
      try {
        const tr = await stripe.taxRates.retrieve(vatTaxRateId);
        if (!tr.active) {
          return NextResponse.json(
            {
              error:
                'The configured Stripe tax rate (STRIPE_VAT_TAX_RATE_ID) is inactive.',
            },
            { status: 400 },
          );
        }
      } catch (e) {
        return NextResponse.json(
          {
            error: `Invalid STRIPE_VAT_TAX_RATE_ID: ${e.message}`,
          },
          { status: 400 },
        );
      }
    }

    const lineItem = {
      price: priceId,
      quantity: 1,
    };
    if (!useAutomaticTax && vatTaxRateId) {
      lineItem.tax_rates = [vatTaxRateId];
    }

    let validStripeCustomerId = null;
    if (stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if (!customer.deleted) {
          validStripeCustomerId = stripeCustomerId;
        }
      } catch (customerError) {
        console.warn(
          'Stored Stripe customer is invalid, continuing without it:',
          {
            userId,
            stripeCustomerId,
            message: customerError.message,
          },
        );
      }
    }

    if (!validStripeCustomerId) {
      const createdCustomer = await stripe.customers.create({
        ...(userEmail ? { email: userEmail } : {}),
        ...(companyName ? { name: companyName } : {}),
        ...(companyPhone ? { phone: companyPhone } : {}),
        ...(companyLocation
          ? {
              address: {
                line1: companyLocation,
              },
            }
          : {}),
        metadata: {
          userId,
        },
      });
      validStripeCustomerId = createdCustomer.id;
    }

    // Keep invoice-relevant customer fields in sync for existing/new customers.
    if (validStripeCustomerId) {
      await stripe.customers.update(validStripeCustomerId, {
        ...(userEmail ? { email: userEmail } : {}),
        ...(companyName ? { name: companyName } : {}),
        ...(companyPhone ? { phone: companyPhone } : {}),
        ...(companyLocation
          ? {
              address: {
                line1: companyLocation,
              },
            }
          : {}),
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'bancontact'],
      line_items: [lineItem],
      allow_promotion_codes: true,
      tax_id_collection: {
        enabled: true,
        required: 'if_supported',
      },
      phone_number_collection: {
        enabled: true,
      },
      billing_address_collection: 'required',
      ...(useAutomaticTax
        ? {
            automatic_tax: {
              enabled: true,
            },
          }
        : {}),
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
      client_reference_id: userId, // your user ID
      metadata: {
        userId, // your user ID from your DB
        planId, // your plan ID from your DB
      },
      success_url: successUrl,
      cancel_url: cancelUrl,

      customer: validStripeCustomerId,
      customer_update: {
        name: 'auto',
        address: 'auto',
        shipping: 'auto',
      },
    });

    console.log('Stripe session created successfully:', session.id);

    // Fetch the session to get the customer ID
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
    if (sessionDetails.customer) {
      await adminDb.collection('users').doc(userId).update({
        stripeCustomerId: sessionDetails.customer,
      });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Detailed error in create-checkout-session:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });

    // Return more specific error messages based on error type
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Invalid request: ${error.message}` },
        { status: 400 },
      );
    } else if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Stripe authentication failed' },
        { status: 500 },
      );
    } else if (error.type === 'StripePermissionError') {
      return NextResponse.json(
        { error: 'Stripe permission denied' },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { error: `Error creating checkout session: ${error.message}` },
        { status: 500 },
      );
    }
  }
}
