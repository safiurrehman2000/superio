import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      limit: 100,
      active: true,
    });

    const formattedPrices = prices.data.map((price) => ({
      id: price.id,
      nickname: price.nickname,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring,
      product: price.product,
      active: price.active,
      created: price.created,
    }));

    return NextResponse.json({
      success: true,
      prices: formattedPrices,
      count: formattedPrices.length,
    });
  } catch (error) {
    console.error("Error listing Stripe prices:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
      },
      { status: 500 }
    );
  }
}
