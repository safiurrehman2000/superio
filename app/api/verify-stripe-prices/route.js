import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    // Get all pricing packages from database
    const packagesRef = adminDb.collection("pricingPackages");
    const packagesSnapshot = await packagesRef.get();

    const packages = [];
    packagesSnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Get all prices from Stripe
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    const results = {
      packages: packages.map((pkg) => ({
        id: pkg.id,
        packageType: pkg.packageType,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        hasStripePriceId: !!pkg.stripePriceId,
      })),
      stripePrices: prices.data.map((price) => ({
        id: price.id,
        productName: price.product.name,
        unitAmount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
      })),
      summary: {
        totalPackages: packages.length,
        packagesWithStripeId: packages.filter((p) => p.stripePriceId).length,
        packagesWithoutStripeId: packages.filter((p) => !p.stripePriceId)
          .length,
        totalStripePrices: prices.data.length,
      },
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error verifying Stripe prices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { packageId, stripePriceId } = await request.json();

    if (!packageId || !stripePriceId) {
      return NextResponse.json(
        { error: "Missing packageId or stripePriceId" },
        { status: 400 }
      );
    }

    // Update the package with the Stripe price ID
    await adminDb.collection("pricingPackages").doc(packageId).update({
      stripePriceId: stripePriceId,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Updated package ${packageId} with stripePriceId ${stripePriceId}`,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
