import { getFirebaseErrorMessage } from "@/utils/constants";
import { auth } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import { checkValidDetails } from "@/utils/validate";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const useSignUp = async (email, password) => {
  const emailErrors = checkValidDetails(email, password, "email");
  const passwordErrors = checkValidDetails(email, password, "password");
  const validationErrors = { ...emailErrors, ...passwordErrors };

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors };
  }

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
  const emailErrors = checkValidDetails(email, password, "email");
  const passwordErrors = checkValidDetails(email, password, "password");
  const validationErrors = { ...emailErrors, ...passwordErrors };

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, apiError: getFirebaseErrorMessage(error) };
  }
};
