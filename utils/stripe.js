import { loadStripe } from "@stripe/stripe-js";

// Check if Stripe key is available
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn(
    "⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. Please add your Stripe publishable key to .env.local"
  );
  console.warn(
    "Example: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
  );
}

// Load Stripe with error handling
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

export default stripePromise;
