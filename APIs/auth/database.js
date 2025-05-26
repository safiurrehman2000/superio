import { auth, db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useUpdateIsFirstTime = async (id) => {
  try {
    await setDoc(doc(db, "users", id), { isFirstTime: false }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
};

export const useUpdateUserInfo = () => {
  const updateUserInfo = async (payload, userId, userType) => {
    try {
      // Validate inputs
      if (!payload || !userId) {
        throw new Error("Payload or user ID is missing");
      }

      let updateData = { ...payload };

      // Handle logo as base64
      if (payload.logo && payload.logo instanceof File) {
        const base64Logo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read logo file"));
          reader.readAsDataURL(payload.logo);
        });
        updateData.logo = base64Logo; // Store base64 string
      } else if (payload.logo === null) {
        updateData.logo = null; // Clear logo if removed
      }

      // Update user document
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          ...updateData,
          userType,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      successToast("User info updated successfully");
      return { success: true, message: "User info updated successfully" };
    } catch (error) {
      errorToast("Error updating user info" + "" + error);
      console.error("Error updating user info:", error);
      throw new Error(error.message || "Failed to update user info");
    }
  };

  return { updateUserInfo };
};

export const useGetUserById = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }

        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          throw new Error(`User with ID ${userId} not found`);
        }

        setData({
          id: userSnap.id,
          ...userSnap.data(),
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { data, loading, error };
};

export const reauthenticateUser = async (email, password) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error("Re-authentication failed: " + error.message);
    throw error;
  }
};

export const useDeleteUserAccount = async (userId) => {
  try {
    // Step 1: Delete user data from Firestore
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);

    const user = auth.currentUser;
    if (user && user.uid === userId) {
      await deleteUser(user);
    } else {
      errorToast("Error deleting user, please try again");
      throw new Error("No authenticated user found or userId mismatch");
    }
    successToast("User Successfully deleted");
  } catch (error) {
    errorToast("Error deleting user, please try again");
    console.error("Error deleting user:", error.message);
    throw error;
  }
};
