import { getFirebaseErrorMessage } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import { sendWelcomeEmail } from "@/utils/email-service";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const useSignUp = async (email, password, userType) => {
  try {
    // SECURITY: Prevent admin creation during registration
    if (userType === "Admin") {
      console.error(
        "🚨 SECURITY ALERT: Attempted to create admin account during registration"
      );
      errorToast("Invalid user type selected");
      return { success: false, apiError: "Invalid user type" };
    }

    // Validate userType is one of the allowed types
    const allowedUserTypes = ["Candidate", "Employer"];
    if (!allowedUserTypes.includes(userType)) {
      console.error(
        "🚨 SECURITY ALERT: Invalid user type attempted:",
        userType
      );
      errorToast("Invalid user type selected");
      return { success: false, apiError: "Invalid user type" };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document with validated userType
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      userType: userType, // This is now guaranteed to be safe
      createdAt: new Date(),
      isFirstTime: true,
      // Add security metadata
      createdBy: "self_registration",
      lastUpdatedBy: "self_registration",
      lastUpdatedAt: new Date(),
    });

    // Send welcome email (don't block registration if email fails)
    try {
      await sendWelcomeEmail(user.email, user.email.split("@")[0], userType);
      console.log("Welcome email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("Welcome email failed to send:", emailError);
      // Continue with successful registration even if email fails
    }

    successToast("User Successfully Registered!");
    return { success: true, user: userCredential.user };
  } catch (error) {
    errorToast("Registration failed, Please try again");
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const useLogIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
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
