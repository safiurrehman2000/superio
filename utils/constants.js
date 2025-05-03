export const getFirebaseErrorMessage = (error) => {
  let errorMessage = "An error occurred. Please try again.";
  switch (error.code) {
    // Registration/Sign-up errors
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
      errorMessage = "This operation is currently disabled.";
      break;

    // Login errors
    case "auth/user-not-found":
      errorMessage = "No account found with this email.";
      break;
    case "auth/wrong-password":
      errorMessage = "Incorrect password. Please try again.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many attempts. Please try again later.";
      break;

    // Sign-out errors
    case "auth/network-request-failed":
      errorMessage =
        "Network error. Please check your connection and try again.";
      break;

    // General errors
    case "auth/invalid-credential":
      errorMessage =
        "Invalid credentials. Please check your email and password.";
      break;
    default:
      errorMessage = `Operation failed: ${error.message}`;
  }
  return errorMessage;
};

export const LOGO = "/images/logo-deflexijobber.png";

export const menuData = [
  {
    id: 1,
    name: "Dashboard",
    icon: "la-home",
    routePath: "/employers-dashboard/dashboard",
    active: "active",
  },
  {
    id: 2,
    name: "Company Profile",
    icon: "la-user-tie",
    routePath: "/employers-dashboard/company-profile",
    active: "",
  },
  {
    id: 3,
    name: "Post a New Job",
    icon: "la-paper-plane",
    routePath: "/employers-dashboard/post-jobs",
    active: "",
  },
  {
    id: 4,
    name: "Manage Jobs",
    icon: "la-briefcase",
    routePath: "/employers-dashboard/manage-jobs",
    active: "",
  },
  {
    id: 5,
    name: "All Applicants",
    icon: "la-file-invoice",
    routePath: "/employers-dashboard/all-applicants",
    active: "",
  },
  {
    id: 6,
    name: "Shortlisted Resumes",
    icon: "la-bookmark-o",
    routePath: "/employers-dashboard/shortlisted-resumes",
    active: "",
  },
  {
    id: 7,
    name: "Packages",
    icon: "la-box",
    routePath: "/employers-dashboard/packages",
    active: "",
  },
  {
    id: 8,
    name: "Messages",
    icon: "la-comment-o",
    routePath: "/employers-dashboard/messages",
    active: "",
  },
  {
    id: 9,
    name: "Resume Alerts",
    icon: "la-bell",
    routePath: "/employers-dashboard/resume-alerts",
    active: "",
  },
  {
    id: 10,
    name: "Change Password",
    icon: "la-lock",
    routePath: "/employers-dashboard/change-password",
    active: "",
  },
  {
    id: 11,
    name: "Logout",
    icon: "la-sign-out",
    routePath: "/login",
    active: "",
  },
  {
    id: 12,
    name: "Delete Profile",
    icon: "la-trash",
    routePath: "/",
    active: "",
  },
];
