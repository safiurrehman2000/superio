import { getFirebaseErrorMessage } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const sendVerificationCode = async (email, userType) => {
  try {
    const res = await fetch("/api/auth/send-verification-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userType }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, apiError: data.error || "Kon code niet verzenden" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const verifyAndRegister = async (email, password, userType, code) => {
  try {
    const res = await fetch("/api/auth/verify-and-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userType, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, apiError: data.error || "Registratie mislukt" };
    }
    return { success: true, repaired: data.repaired };
  } catch (error) {
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const ensureFirestoreProfile = async (user, userType) => {
  if (!user?.uid || !userType) return { success: false };
  try {
    const profileDoc = await getDoc(doc(db, "users", user.uid));
    const profileData = profileDoc.exists() ? profileDoc.data() : null;
    if (profileData?.email && profileData?.userType) {
      return { success: true, created: false };
    }

    const idToken = await user.getIdToken();
    const res = await fetch("/api/ensure-user-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ userType }),
    });
    const result = await res.json();
    return { success: res.ok, created: result.created };
  } catch (error) {
    console.error("ensureFirestoreProfile failed:", error);
    return { success: false };
  }
};

export const useLogIn = async (email, password, userTypeHint = null) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const pendingType =
      userTypeHint ||
      (typeof window !== "undefined"
        ? localStorage.getItem("registrationUserType")
        : null);

    if (pendingType === "Candidate" || pendingType === "Employer") {
      const repair = await ensureFirestoreProfile(
        userCredential.user,
        pendingType
      );
      if (repair.created) {
        successToast("Account hersteld. Welkom terug!");
      }
    }

    successToast("Login Successful");
    return { success: true, user: userCredential.user };
  } catch (error) {
    errorToast("Login Failed, please try again");
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const useSignOut = async () => {
  try {
    await signOut(auth);
    successToast("Signout Successful");
    return { success: true };
  } catch (error) {
    errorToast("Error signing out, please try again");
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const useForgetPassword = async (email) => {
  if (!email) {
    errorToast("Email is required");
    return { success: false, error: "Email is required" };
  }
  try {
    await sendPasswordResetEmail(auth, email);
    successToast("Password reset link sent to " + email);
    return { success: true };
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    errorToast(`${errorCode}: ${errorMessage}`);
    return { success: false, error: `${errorCode}: ${errorMessage}` };
  }
};

export const setAuthPersistence = async (rememberMe) => {
  const { setPersistence, browserLocalPersistence, browserSessionPersistence } =
    await import("firebase/auth");
  const { auth } = await import("@/utils/firebase");
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
};
