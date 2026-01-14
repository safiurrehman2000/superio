import { NextResponse } from "next/server";
import { db } from "@/utils/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET - Fetch all coupons
export async function GET(request) {
  try {
    const coupons = await stripe.coupons.list({
      limit: 100,
    });

    const promotionCodes = await stripe.promotionCodes.list({
      limit: 100,
    });

    const couponToPromoCodes = {};
    promotionCodes.data.forEach((promoCode) => {
      const couponId = promoCode.coupon.id;
      if (!couponToPromoCodes[couponId]) {
        couponToPromoCodes[couponId] = [];
      }
      couponToPromoCodes[couponId].push({
        id: promoCode.id,
        code: promoCode.code,
        active: promoCode.active,
        maxRedemptions: promoCode.max_redemptions,
        timesRedeemed: promoCode.times_redeemed,
        expiresAt: promoCode.expires_at,
      });
    });

    // Format the response
    const formattedCoupons = coupons.data.map((coupon) => ({
      id: coupon.id,
      name: coupon.name,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      currency: coupon.currency,
      duration: coupon.duration,
      durationInMonths: coupon.duration_in_months,
      maxRedemptions: coupon.max_redemptions,
      timesRedeemed: coupon.times_redeemed,
      redeemBy: coupon.redeem_by,
      valid: coupon.valid,
      created: coupon.created,
      metadata: coupon.metadata,
      promotionCodes: couponToPromoCodes[coupon.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedCoupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      name,
      percentOff,
      amountOff,
      currency,
      duration,
      durationInMonths,
      maxRedemptions,
      redeemBy,
      promoCode,
      maxPromoRedemptions,
    } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Stripe configuration is missing" },
        { status: 500 }
      );
    }

    if (!name || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required" },
        { status: 400 }
      );
    }

    if (!percentOff && !amountOff) {
      return NextResponse.json(
        { error: "Either percent off or amount off is required" },
        { status: 400 }
      );
    }

    if (amountOff && !currency) {
      return NextResponse.json(
        { error: "Currency is required when using amount off" },
        { status: 400 }
      );
    }

    // Validate duration
    if (!["once", "repeating", "forever"].includes(duration)) {
      return NextResponse.json(
        {
          error: "Invalid duration. Must be 'once', 'repeating', or 'forever'",
        },
        { status: 400 }
      );
    }

    // If duration is repeating, durationInMonths is required
    if (duration === "repeating" && !durationInMonths) {
      return NextResponse.json(
        { error: "Duration in months is required for repeating coupons" },
        { status: 400 }
      );
    }

    // Create the coupon object
    const couponData = {
      name,
      duration,
    };

    if (percentOff) {
      couponData.percent_off = parseFloat(percentOff);
    }

    if (amountOff) {
      couponData.amount_off = Math.round(parseFloat(amountOff) * 100); // Convert to cents
      couponData.currency = currency;
    }

    if (duration === "repeating" && durationInMonths) {
      couponData.duration_in_months = parseInt(durationInMonths);
    }

    if (maxRedemptions) {
      couponData.max_redemptions = parseInt(maxRedemptions);
    }

    if (redeemBy) {
      // Convert to Unix timestamp
      const redeemByDate = new Date(redeemBy);
      couponData.redeem_by = Math.floor(redeemByDate.getTime() / 1000);
    }

    // Create Stripe coupon
    const stripeCoupon = await stripe.coupons.create(couponData);

    // Create promotion code if provided
    let promoCodeData = null;
    if (promoCode) {
      const promoCodeConfig = {
        coupon: stripeCoupon.id,
        code: promoCode.toUpperCase(),
      };

      if (maxPromoRedemptions) {
        promoCodeConfig.max_redemptions = parseInt(maxPromoRedemptions);
      }

      if (redeemBy) {
        const redeemByDate = new Date(redeemBy);
        promoCodeConfig.expires_at = Math.floor(redeemByDate.getTime() / 1000);
      }

      const stripePromoCode = await stripe.promotionCodes.create(
        promoCodeConfig
      );

      promoCodeData = {
        id: stripePromoCode.id,
        code: stripePromoCode.code,
        active: stripePromoCode.active,
        maxRedemptions: stripePromoCode.max_redemptions,
        timesRedeemed: stripePromoCode.times_redeemed,
        expiresAt: stripePromoCode.expires_at,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        id: stripeCoupon.id,
        name: stripeCoupon.name,
        percentOff: stripeCoupon.percent_off,
        amountOff: stripeCoupon.amount_off,
        currency: stripeCoupon.currency,
        duration: stripeCoupon.duration,
        durationInMonths: stripeCoupon.duration_in_months,
        maxRedemptions: stripeCoupon.max_redemptions,
        timesRedeemed: stripeCoupon.times_redeemed,
        redeemBy: stripeCoupon.redeem_by,
        valid: stripeCoupon.valid,
        created: stripeCoupon.created,
        promotionCodes: promoCodeData ? [promoCodeData] : [],
      },
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon (limited updates - mainly metadata)
export async function PUT(request) {
  try {
    const { id, name, metadata } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata;
    }

    // Update the coupon (Note: Stripe only allows updating name and metadata)
    const updatedCoupon = await stripe.coupons.update(id, updateData);

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const promoCodeId = searchParams.get("promoCodeId");

    if (!id && !promoCodeId) {
      return NextResponse.json(
        { error: "Coupon ID or Promotion Code ID is required" },
        { status: 400 }
      );
    }

    // If deleting a promotion code
    if (promoCodeId) {
      await stripe.promotionCodes.update(promoCodeId, {
        active: false,
      });

      return NextResponse.json({
        success: true,
        message: "Promotion code deactivated successfully",
      });
    }

    // If deleting a coupon
    if (id) {
      // Delete the coupon from Stripe
      await stripe.coupons.del(id);

      return NextResponse.json({
        success: true,
        message: "Coupon deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
