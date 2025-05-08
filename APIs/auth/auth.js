import { getFirebaseErrorMessage } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const useSignUp = async (email, password, userType) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      userType: userType,
      createdAt: new Date(),
      isFirstTime: true,
    });
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
