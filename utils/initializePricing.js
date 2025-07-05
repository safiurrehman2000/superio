import { initializeDefaultPricingPackages } from "@/APIs/pricing/pricing";

// Utility function to initialize pricing packages in the database
// Run this once to populate your Firebase Firestore with default pricing packages
export const initializePricingDatabase = async () => {
  try {
    console.log("Initializing pricing packages in database...");
    const result = await initializeDefaultPricingPackages();

    if (result.success) {
      console.log("✅ Pricing packages initialized successfully!");
      return { success: true };
    } else {
      console.error("❌ Failed to initialize pricing packages:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("❌ Error during initialization:", error);
    return { success: false, error: error.message };
  }
};

// You can call this function from your browser console or create an admin page
// Example usage in browser console:
// import { initializePricingDatabase } from './utils/initializePricing.js';
// initializePricingDatabase();
