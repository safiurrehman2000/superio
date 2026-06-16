import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isCheckoutSessionPaymentComplete } from "@/utils/checkoutPaymentStatus";
import { activateUserAccessFromCheckoutSession } from "@/utils/activateUserAccessFromCheckout";
import { deleteCached } from "@/utils/memory-cache";
import { processOneTimeCheckoutReceipt } from "@/utils/stripeReceiptSync";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { sessionId } = await request.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (isCheckoutSessionPaymentComplete(session)) {
      const userId =
        session.metadata?.userId || session.client_reference_id || null;

      if (userId) {
        await activateUserAccessFromCheckoutSession(stripe, session);
        deleteCached(`subscription-status:${userId}`);

        if (session.mode === "payment") {
          try {
            await processOneTimeCheckoutReceipt(stripe, session);
          } catch (receiptErr) {
            console.error("check-session: one-time receipt failed", receiptErr);
          }
        }
      }
    }

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
