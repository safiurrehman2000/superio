import { db } from "@/utils/firebase";
import { collection, doc, updateDoc, getDocs } from "firebase/firestore";

// Utility function to update pricing packages with stripePriceId
// This should be run after creating Stripe products and prices
export const updatePricingPackagesWithStripeIds = async (
  stripePriceMapping
) => {
  try {
    const packagesRef = collection(db, "pricingPackages");
    const querySnapshot = await getDocs(packagesRef);

    const updatePromises = [];

    querySnapshot.forEach((docSnapshot) => {
      const packageData = docSnapshot.data();
      const packageType = packageData.packageType?.toLowerCase();

      // Find matching Stripe price ID from the mapping
      const stripePriceId = stripePriceMapping[packageType];

      if (stripePriceId) {
        const updatePromise = updateDoc(docSnapshot.ref, {
          stripePriceId: stripePriceId,
          updatedAt: new Date(),
        });
        updatePromises.push(updatePromise);
        console.log(
          `Updated ${packageType} package with stripePriceId: ${stripePriceId}`
        );
      } else {
        console.warn(
          `No Stripe price ID found for package type: ${packageType}`
        );
      }
    });

    await Promise.all(updatePromises);
    console.log("✅ All pricing packages updated successfully!");

    return { success: true };
  } catch (error) {
    console.error("❌ Error updating pricing packages:", error);
    return { success: false, error: error.message };
  }
};

// Example usage:
// const stripePriceMapping = {
//   'basic': 'price_1234567890', // Free tier might not have a Stripe price
//   'standard': 'price_1234567891',
//   'extended': 'price_1234567892'
// };
// await updatePricingPackagesWithStripeIds(stripePriceMapping);
