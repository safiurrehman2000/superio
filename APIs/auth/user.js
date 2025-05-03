import { getFirebaseErrorMessage } from "@/utils/constants";
import { auth } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const useSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
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
