import { NextResponse } from "next/server";
import { db } from "@/utils/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const packagesRef = db.collection("pricingPackages");
    const snapshot = await packagesRef.get();

    const packages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Normalize the data structure to handle both old and new formats
      const normalizedPackage = {
        id: doc.id,
        name: data.name || data.packageType, // Handle both field names
        packageType: data.packageType,
        description: data.description || "",
        price: data.price,
        currency: data.currency || "eur",
        interval: data.interval || "month",
        features: data.features || [],
        jobLimit: data.jobLimit || data.jobPosts || 0,
        jobPosts: data.jobPosts,
        stripeProductId: data.stripeProductId,
        stripePriceId: data.stripePriceId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        tag: data.tag || "",
        sortOrder: data.sortOrder || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      packages.push(normalizedPackage);
    });

    return NextResponse.json({ data: packages });
  } catch (error) {
    console.error("Error fetching pricing packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing packages" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, description, price, currency, interval, features, jobLimit } =
      await request.json();

    // Validate required fields
    if (!name || !price || !interval || !jobLimit) {
      return NextResponse.json(
        { error: "Name, price, interval, and job limit are required" },
        { status: 400 }
      );
    }

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description || "",
      metadata: {
        jobLimit: jobLimit.toString(),
        interval: interval,
      },
    });

    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: currency || "eur",
      recurring: {
        interval: interval, // monthly, yearly, etc.
      },
    });

    // Create package in Firebase
    const packageData = {
      packageType: name, // Use packageType for consistency with existing data
      name, // Also store as name for new format
      description: description || "",
      price,
      currency: currency || "eur",
      interval,
      features: features || [],
      jobLimit: parseInt(jobLimit),
      jobPosts: parseInt(jobLimit), // Store both for compatibility
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      isActive: true,
      tag: "", // Default tag
      sortOrder: 999, // Default sort order
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("pricingPackages").add(packageData);
    const newPackage = { id: docRef.id, ...packageData };

    return NextResponse.json({
      success: true,
      data: newPackage,
      message: "Pricing package created successfully with Stripe integration",
    });
  } catch (error) {
    console.error("Error creating pricing package:", error);

    // If Stripe creation failed, clean up any partial creation
    if (error.type === "StripeError") {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create pricing package" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      id,
      name,
      description,
      price,
      currency,
      interval,
      features,
      jobLimit,
      isActive,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    const packageRef = db.collection("pricingPackages").doc(id);
    const packageDoc = await packageRef.get();

    if (!packageDoc.exists) {
      return NextResponse.json(
        { error: "Pricing package not found" },
        { status: 404 }
      );
    }

    const existingPackage = packageDoc.data();
    const updateData = {
      updatedAt: new Date(),
    };

    // Update Firebase data
    if (name !== undefined) {
      updateData.name = name;
      updateData.packageType = name; // Update both fields for consistency
    }
    if (description !== undefined) updateData.description = description;
    if (features !== undefined) updateData.features = features;
    if (jobLimit !== undefined) {
      updateData.jobLimit = parseInt(jobLimit);
      updateData.jobPosts = parseInt(jobLimit); // Update both fields
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update Stripe if price or interval changed
    if (
      price !== undefined ||
      currency !== undefined ||
      interval !== undefined
    ) {
      const newPrice = price || existingPackage.price;
      const newCurrency = currency || existingPackage.currency;
      const newInterval = interval || existingPackage.interval;

      // Create new Stripe price
      const stripePrice = await stripe.prices.create({
        product: existingPackage.stripeProductId,
        unit_amount: Math.round(newPrice * 100),
        currency: newCurrency,
        recurring: {
          interval: newInterval,
        },
      });

      // Update Stripe product
      await stripe.products.update(existingPackage.stripeProductId, {
        name: name || existingPackage.name,
        description: description || existingPackage.description,
        metadata: {
          jobLimit: (jobLimit || existingPackage.jobLimit).toString(),
          interval: newInterval,
        },
      });

      updateData.price = newPrice;
      updateData.currency = newCurrency;
      updateData.interval = newInterval;
      updateData.stripePriceId = stripePrice.id;
    }

    await packageRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Pricing package updated successfully",
    });
  } catch (error) {
    console.error("Error updating pricing package:", error);
    return NextResponse.json(
      { error: "Failed to update pricing package" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    const packageRef = db.collection("pricingPackages").doc(id);
    const packageDoc = await packageRef.get();

    if (!packageDoc.exists) {
      return NextResponse.json(
        { error: "Pricing package not found" },
        { status: 404 }
      );
    }

    const packageData = packageDoc.data();

    // Archive the Stripe product (don't delete to preserve billing history)
    await stripe.products.update(packageData.stripeProductId, {
      active: false,
    });

    // Delete from Firebase
    await packageRef.delete();

    return NextResponse.json({
      success: true,
      message: "Pricing package deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pricing package:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing package" },
      { status: 500 }
    );
  }
}
