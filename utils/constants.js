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

export const candidateMenuData = [
  {
    id: 1,
    name: "Dashboard",
    icon: "la-home",
    routePath: "/candidates-dashboard/dashboard",
    active: "active",
  },
  {
    id: 2,
    name: "My Profile",
    icon: "la-user-tie",
    routePath: "/candidates-dashboard/my-profile",
    active: "",
  },
  {
    id: 3,
    name: "My Resume",
    icon: "la la-file-invoice",
    routePath: "/candidates-dashboard/my-resume",
    active: "",
  },
  {
    id: 4,
    name: "Applied Jobs",
    icon: "la-briefcase",
    routePath: "/candidates-dashboard/applied-jobs",
    active: "",
  },
  {
    id: 5,
    name: "Job Alerts",
    icon: "la la-bell",
    routePath: "/candidates-dashboard/job-alerts",
    active: "",
  },
  {
    id: 6,
    name: "Shortlisted Jobs",
    icon: "la-bookmark-o",
    routePath: "/candidates-dashboard/short-listed-jobs",
    active: "",
  },
  {
    id: 7,
    name: "CV manager",
    icon: "la la-file-invoice",
    routePath: "/candidates-dashboard/cv-manager",
    active: "",
  },
  {
    id: 10,
    name: "Change Password",
    icon: "la-lock",
    routePath: "/candidates-dashboard/change-password",
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

export const employerMenuData = [
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

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const STATES = [
  { value: "antwerp", label: "Antwerp" },
  { value: "limburg", label: "Limburg" },
  { value: "east-flanders", label: "East Flanders" },
  { value: "flemish-brabant", label: "Flemish Brabant" },
  { value: "west-flanders", label: "West Flanders" },
];

export const SECTORS = [
  { value: "funeral-sector", label: "Funeral sector" },
  { value: "moving-sector", label: "Moving sector" },
  { value: "power-supply", label: "Power supply" },
  { value: "department-stores", label: "Department stores" },
  { value: "independent-retail", label: "Independent retail" },
  { value: "automotive-sector", label: "Automotive sector" },
  { value: "bakeries", label: "Bakeries" },
  { value: "cinemas", label: "Cinemas" },
  { value: "buses-and-coaches", label: "Buses and coaches" },
  { value: "entertainment", label: "Entertainment" },
  { value: "event-sector", label: "Event Sector" },
  { value: "fashion-clothing", label: "Fashion/Clothing" },
  { value: "food-products", label: "Trade in Food Products" },
  { value: "hotel-sector", label: "Hotel Sector" },
  { value: "real-estate-sector", label: "Real Estate Sector" },
  { value: "childcare", label: "Childcare" },
  { value: "food-retail-trade", label: "Food Retail Trade" },
  {
    value: "agriculture-and-horticulture",
    label: "Agriculture and Horticulture",
  },
  {
    value: "medium-sized-food-companies",
    label: "Medium Sized Food Companies",
  },
  { value: "education", label: "Education" },
  { value: "driving-schools", label: "Driving Schools" },
  { value: "sport", label: "Sport" },
  {
    value: "sports-and-culture-in-the-flemish-community",
    label: "Sports and Culture in the Flemish Community",
  },
];
export const AGE_OPTIONS = [
  { value: "18-25", label: "18-25" },
  { value: "26-35", label: "26-35" },
  { value: "36-45", label: "36-45" },
  { value: "46-55", label: "46-55" },
  { value: "56+", label: "56+" },
];

export const PROFILE_VISIBILITY_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "english_speaking_job", label: "English speaking job" },
  { value: "flexijobber", label: "Flexijobber" },
  { value: "retired_people", label: "Retired people" },
  { value: "student_job", label: "Student job" },
];

export const formatString = (str) => {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const transformJobData = (jobs) => {
  const findLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : formatString(value);
  };

  return jobs.map((job) => ({
    ...job,
    jobType: {
      value: job?.jobType,
      label: findLabel(JOB_TYPE_OPTIONS, job.jobType),
    },
    location: {
      value: job?.location,
      label: findLabel(STATES, job.location),
    },
    tags: job?.tags?.map((tag) => ({
      value: tag,
      label: findLabel(SECTORS, tag),
    })),
    // Convert createdAt to a Date object or ISO string
    createdAt: new Date(job.createdAt)?.toISOString(),
  }));
};

// Flex Orange – #FA5508
// Bright Aqua – #10E7DC
// Deep Blue – #0074E1
