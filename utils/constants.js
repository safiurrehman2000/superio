export const getFirebaseErrorMessage = (error) => {
  let errorMessage = "An error occurred during registration. Please try again.";
  switch (error.code) {
    case "auth/email-already-in-use":
      errorMessage = "This email is already registered.";
      break;
    case "auth/invalid-email":
      errorMessage = "Please enter a valid email address.";
      break;
    case "auth/weak-password":
      errorMessage = "Password is too weak. Please use a stronger password.";
      break;
    case "auth/operation-not-allowed":
      errorMessage = "Registration is currently disabled.";
      break;
    default:
      errorMessage = `Registration failed: ${error.message}`;
  }
  return errorMessage;
};
