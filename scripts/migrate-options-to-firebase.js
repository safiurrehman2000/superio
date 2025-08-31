const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Import your existing constants
const { STATES, SECTORS } = require("../utils/constants.js");

// Initialize Firebase Admin (you'll need to set up your service account)
// For now, we'll use the existing firebase-admin setup from your project
const { db } = require("../utils/firebase-admin.js");

async function migrateOptionsToFirebase() {
  try {
    console.log("Starting migration of options to Firebase...");

    // Migrate states
    console.log("Migrating states...");
    await db.collection("options").doc("states").set({
      items: STATES,
    });
    console.log(`✅ Migrated ${STATES.length} states`);

    // Migrate sectors
    console.log("Migrating sectors...");
    await db.collection("options").doc("sectors").set({
      items: SECTORS,
    });
    console.log(`✅ Migrated ${SECTORS.length} sectors`);

    console.log("🎉 Migration completed successfully!");
    console.log("\nYou can now:");
    console.log("1. Remove STATES and SECTORS from utils/constants.js");
    console.log(
      "2. Update your forms to fetch options from Firebase instead of constants"
    );
    console.log("3. Use the admin panel to manage these options");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateOptionsToFirebase();
