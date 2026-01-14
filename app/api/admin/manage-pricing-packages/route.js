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
    const { name, price, currency, interval, features, jobLimit } =
      await request.json();

    // Validate required fields
    if (!name || !price || !interval || !jobLimit) {
      return NextResponse.json(
        { error: "Name, price, interval, and job limit are required" },
        { status: 400 }
      );
    }

    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Stripe configuration is missing" },
        { status: 500 }
      );
    }

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: name,
      description: "Pricing package for job postings",
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

    // Handle features - ensure it's properly formatted as an array
    let processedFeatures = [];
    if (features) {
      if (typeof features === "string" && features.trim()) {
        // Convert text area content to array
        processedFeatures = features
          .split("\n")
          .map((feature) => feature.trim())
          .filter((feature) => feature.length > 0);
      } else if (Array.isArray(features) && features.length > 0) {
        processedFeatures = features;
      }
    }

    // Create package in Firebase
    const packageData = {
      packageType: name, // Use packageType for consistency with existing data
      name, // Also store as name for new format
      price,
      currency: currency || "eur",
      interval,
      features: processedFeatures,
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
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });

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

    // Handle features - convert text area content to array
    let processedFeatures = [];
    if (features !== undefined) {
      if (typeof features === "string" && features.trim()) {
        // Convert text area content to array
        processedFeatures = features
          .split("\n")
          .map((feature) => feature.trim())
          .filter((feature) => feature.length > 0);
      } else if (Array.isArray(features) && features.length > 0) {
        processedFeatures = features;
      }
      updateData.features = processedFeatures;
    }

    // Update Firebase data
    if (name !== undefined) {
      updateData.name = name;
      updateData.packageType = name; // Update both fields for consistency
    }
    if (jobLimit !== undefined) {
      updateData.jobLimit = parseInt(jobLimit);
      updateData.jobPosts = parseInt(jobLimit); // Update both fields
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const newName =
      name !== undefined
        ? name
        : existingPackage.name || existingPackage.packageType;
    const newJobLimit =
      jobLimit !== undefined
        ? jobLimit
        : existingPackage.jobLimit || existingPackage.jobPosts;

    const needsStripePriceUpdate =
      price !== undefined ||
      currency !== undefined ||
      interval !== undefined ||
      !existingPackage.stripeProductId;

    const needsStripeProductUpdate =
      (name !== undefined || jobLimit !== undefined) &&
      existingPackage.stripeProductId;

    if (needsStripePriceUpdate) {
      const newPrice = price !== undefined ? price : existingPackage.price;
      const newCurrency = currency || existingPackage.currency || "eur";
      const newInterval = interval || existingPackage.interval || "month";

      if (!existingPackage.stripeProductId) {
        const stripeProduct = await stripe.products.create({
          name: newName,
          description: "Pricing package for job postings",
          metadata: {
            jobLimit: newJobLimit.toString(),
            interval: newInterval,
          },
        });

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(newPrice * 100),
          currency: newCurrency,
          recurring: {
            interval: newInterval,
          },
        });

        updateData.stripeProductId = stripeProduct.id;
        updateData.stripePriceId = stripePrice.id;
        updateData.price = newPrice;
        updateData.currency = newCurrency;
        updateData.interval = newInterval;
      } else {
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
          name: newName,
          description: "Pricing package for job postings",
          metadata: {
            jobLimit: newJobLimit.toString(),
            interval: newInterval,
          },
        });

        updateData.price = newPrice;
        updateData.currency = newCurrency;
        updateData.interval = newInterval;
        updateData.stripePriceId = stripePrice.id;
      }
    } else if (needsStripeProductUpdate) {
      // Only update product metadata (name, jobLimit) without creating new price
      await stripe.products.update(existingPackage.stripeProductId, {
        name: newName,
        description: "Pricing package for job postings",
        metadata: {
          jobLimit: newJobLimit.toString(),
          interval: existingPackage.interval || "month",
        },
      });
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
