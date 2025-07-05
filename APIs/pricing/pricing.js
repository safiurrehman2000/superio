import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// Get all active pricing packages
export const getPricingPackages = async () => {
  try {
    const packagesRef = collection(db, "pricingPackages");

    // First, let's get all packages without filtering to see what's in the database
    const querySnapshot = await getDocs(packagesRef);
    const packages = [];

    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("All packages in database:", packages);

    // If no packages found, return empty array
    if (packages.length === 0) {
      return { success: true, data: [] };
    }

    // Filter for active packages if they have the isActive field
    const activePackages = packages.filter((pkg) => pkg.isActive !== false);

    // Sort by sortOrder if available
    const sortedPackages = activePackages.sort((a, b) => {
      const orderA = a.sortOrder || 0;
      const orderB = b.sortOrder || 0;
      return orderA - orderB;
    });

    return { success: true, data: sortedPackages };
  } catch (error) {
    console.error("Error fetching pricing packages:", error);
    return { success: false, error: error.message };
  }
};

// Get a specific pricing package by ID
export const getPricingPackageById = async (packageId) => {
  try {
    const packageRef = doc(db, "pricingPackages", packageId);
    const packageDoc = await getDoc(packageRef);

    if (packageDoc.exists()) {
      return {
        success: true,
        data: { id: packageDoc.id, ...packageDoc.data() },
      };
    } else {
      return { success: false, error: "Package not found" };
    }
  } catch (error) {
    console.error("Error fetching pricing package:", error);
    return { success: false, error: error.message };
  }
};

// Create a new pricing package (Admin only)
export const createPricingPackage = async (packageData) => {
  try {
    const packagesRef = collection(db, "pricingPackages");
    const newPackageRef = doc(packagesRef);

    await setDoc(newPackageRef, {
      ...packageData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id: newPackageRef.id };
  } catch (error) {
    console.error("Error creating pricing package:", error);
    return { success: false, error: error.message };
  }
};

// Update a pricing package (Admin only)
export const updatePricingPackage = async (packageId, updateData) => {
  try {
    const packageRef = doc(db, "pricingPackages", packageId);

    await updateDoc(packageRef, {
      ...updateData,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating pricing package:", error);
    return { success: false, error: error.message };
  }
};

// Delete a pricing package (Admin only)
export const deletePricingPackage = async (packageId) => {
  try {
    const packageRef = doc(db, "pricingPackages", packageId);
    await deleteDoc(packageRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting pricing package:", error);
    return { success: false, error: error.message };
  }
};
// Initialize default pricing packages (run once)
// export const initializeDefaultPricingPackages = async () => {
//   const defaultPackages = [
//     {
//       packageType: "Basic",
//       price: "Free",
//       tag: "",
//       features: [
//         "30 job posting",
//         "3 featured job",
//         "Job displayed for 15 days",
//         "Premium Support 24/7",
//       ],
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       packageType: "Standard",
//       price: "499",
//       tag: "tagged",
//       features: [
//         "40 job posting",
//         "5 featured job",
//         "Job displayed for 20 days",
//         "Premium Support 24/7",
//       ],
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       packageType: "Extended",
//       price: "799",
//       tag: "",
//       features: [
//         "50 job posting",
//         "10 featured job",
//         "Job displayed for 60 days",
//         "Premium Support 24/7",
//       ],
//       isActive: true,
//       sortOrder: 3,
//     },
//   ];

//   try {
//     const packagesRef = collection(db, "pricingPackages");

//     for (const packageData of defaultPackages) {
//       const newPackageRef = doc(packagesRef);
//       await setDoc(newPackageRef, {
//         ...packageData,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error initializing default pricing packages:", error);
//     return { success: false, error: error.message };
//   }
// };
