export const getFirebaseErrorMessage = (error) => {
  let errorMessage = "Er is een fout opgetreden. Probeer het opnieuw.";
  switch (error.code) {
    // Registration/Sign-up errors
    case "auth/email-already-in-use":
      errorMessage = "Dit e-mailadres is al geregistreerd.";
      break;
    case "auth/invalid-email":
      errorMessage = "Voer een geldig e-mailadres in.";
      break;
    case "auth/weak-password":
      errorMessage = "Wachtwoord is te zwak. Gebruik een sterker wachtwoord.";
      break;
    case "auth/operation-not-allowed":
      errorMessage = "Deze bewerking is momenteel uitgeschakeld.";
      break;

    // Login errors
    case "auth/user-not-found":
      errorMessage = "Geen account gevonden met dit e-mailadres.";
      break;
    case "auth/wrong-password":
      errorMessage = "Onjuist wachtwoord. Probeer het opnieuw.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Te veel pogingen. Probeer het later opnieuw.";
      break;

    // Sign-out errors
    case "auth/network-request-failed":
      errorMessage =
        "Netwerkfout. Controleer uw verbinding en probeer het opnieuw.";
      break;

    // General errors
    case "auth/invalid-credential":
      errorMessage =
        "Ongeldige inloggegevens. Controleer uw e-mail en wachtwoord.";
      break;
    default:
      errorMessage = `Bewerking mislukt: ${error.message}`;
  }
  return errorMessage;
};

export const LOGO = "/images/logo-deflexijobber.png";

export const candidateMenuData = [
  {
    id: 2,
    name: "Mijn Profiel",
    icon: "la-user-tie",
    routePath: "/candidates-dashboard/my-profile",
    active: "",
  },

  {
    id: 4,
    name: "Gesolliciteerde Jobs",
    icon: "la-briefcase",
    routePath: "/candidates-dashboard/applied-jobs",
    active: "",
  },

  {
    id: 6,
    name: "Bewaarde Jobs",
    icon: "la-bookmark-o",
    routePath: "/candidates-dashboard/short-listed-jobs",
    active: "",
  },
  {
    id: 7,
    name: "CV Beheer",
    icon: "la la-file-invoice",
    routePath: "/candidates-dashboard/cv-manager",
    active: "",
  },
  {
    id: 8,
    name: "Job Meldingen",
    icon: "la-bell",
    routePath: "/candidates-dashboard/job-alerts",
    active: "",
  },
  {
    id: 10,
    name: "Wachtwoord Wijzigen",
    icon: "la-lock",
    routePath: "/candidates-dashboard/change-password",
    active: "",
  },
  {
    id: 11,
    name: "Uitloggen",
    icon: "la-sign-out",
    routePath: "/login",
    active: "",
  },
  {
    id: 12,
    name: "Profiel Verwijderen",
    icon: "la-trash",
    routePath: "/",
    active: "",
  },
];

export const adminMenuData = [
  {
    id: 1,
    name: "Admin",
    icon: "la-file-invoice",
    routePath: "/admin-dashboard/admin-dashboard",
    active: "",
  },
  {
    id: 2,
    name: "Jobs Bewerken",
    icon: "la-edit",
    routePath: "/admin-dashboard/edit-job-posts",
    active: "",
  },
  {
    id: 3,
    name: "Gebruikers Bewerken",
    icon: "la-users",
    routePath: "/admin-dashboard/edit-users",
    active: "",
  },
  {
    id: 4,
    name: "Job Plaatsen Voor Werkgever",
    icon: "la-paper-plane",
    routePath: "/admin-dashboard/post-job-for-employer",
    active: "",
  },
  {
    id: 5,
    name: "Opties Beheren",
    icon: "la-cog",
    routePath: "/admin-dashboard/manage-options",
    active: "",
  },
  {
    id: 6,
    name: "Prijzen Beheren",
    icon: "la-credit-card",
    routePath: "/admin-dashboard/manage-pricing",
    active: "",
  },
  {
    id: 7,
    name: "FAQ Beheren",
    icon: "la-question-circle",
    routePath: "/admin-dashboard/manage-faq",
    active: "",
  },
  {
    id: 8,
    name: "Uitloggen",
    icon: "la-sign-out",
    routePath: "/login",
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
    name: "Bedrijfsprofiel",
    icon: "la-user-tie",
    routePath: "/employers-dashboard/company-profile",
    active: "",
  },
  {
    id: 3,
    name: "Nieuwe Job Plaatsen",
    icon: "la-paper-plane",
    routePath: "/employers-dashboard/post-jobs",
    active: "",
  },
  {
    id: 4,
    name: "Jobs Beheren",
    icon: "la-briefcase",
    routePath: "/employers-dashboard/manage-jobs",
    active: "",
  },
  {
    id: 5,
    name: "Alle Sollicitanten",
    icon: "la-file-invoice",
    routePath: "/employers-dashboard/all-applicants",
    active: "",
  },

  {
    id: 7,
    name: "Pakketten",
    icon: "la-box",
    routePath: "/employers-dashboard/packages",
    active: "",
  },

  {
    id: 10,
    name: "Wachtwoord Wijzigen",
    icon: "la-lock",
    routePath: "/employers-dashboard/change-password",
    active: "",
  },
  {
    id: 11,
    name: "Uitloggen",
    icon: "la-sign-out",
    routePath: "/login",
    active: "",
  },
  {
    id: 12,
    name: "Profiel Verwijderen",
    icon: "la-trash",
    routePath: "/",
    active: "",
  },
];

export const GENDERS = [
  { value: "male", label: "Man" },
  { value: "female", label: "Vrouw" },
  { value: "other", label: "Anders" },
];

export const STATES = [
  { value: "antwerp", label: "Antwerpen" },
  { value: "limburg", label: "Limburg" },
  { value: "east-flanders", label: "Oost-Vlaanderen" },
  { value: "flemish-brabant", label: "Vlaams-Brabant" },
  { value: "west-flanders", label: "West-Vlaanderen" },
];

export const SECTORS = [
  { value: "funeral-sector", label: "Uitvaartsector" },
  { value: "moving-sector", label: "Verhuissector" },
  { value: "power-supply", label: "Energievoorziening" },
  { value: "department-stores", label: "Warenhuizen" },
  { value: "independent-retail", label: "Zelfstandige detailhandel" },
  { value: "automotive-sector", label: "Autosector" },
  { value: "bakeries", label: "Bakkerijen" },
  { value: "cinemas", label: "Bioscopen" },
  { value: "buses-and-coaches", label: "Bussen en touringcars" },
  { value: "entertainment", label: "Entertainment" },
  { value: "event-sector", label: "Eventsector" },
  { value: "fashion-clothing", label: "Mode/Kledij" },
  { value: "food-products", label: "Handel in voedingsproducten" },
  { value: "hotel-sector", label: "Hotelsector" },
  { value: "real-estate-sector", label: "Vastgoedsector" },
  { value: "childcare", label: "Kinderopvang" },
  { value: "food-retail-trade", label: "Voedingsdetailhandel" },
  {
    value: "agriculture-and-horticulture",
    label: "Land- en tuinbouw",
  },
  {
    value: "medium-sized-food-companies",
    label: "Middelgrote voedingsbedrijven",
  },
  { value: "education", label: "Onderwijs" },
  { value: "driving-schools", label: "Rijscholen" },
  { value: "sport", label: "Sport" },
  {
    value: "sports-and-culture-in-the-flemish-community",
    label: "Sport en Cultuur in de Vlaamse Gemeenschap",
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
  { value: "yes", label: "Ja" },
  { value: "no", label: "Nee" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "english_speaking_job", label: "Engels sprekend werk" },
  { value: "flexijobber", label: "Flexijobber" },
  { value: "retired_people", label: "Ouderen" },
  { value: "student_job", label: "Student werk" },
];

export const formatString = (str) => {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const applyFilters = (state) => {
  const searchLower = state.searchTerm.toLowerCase();
  const locationLower = state.locationTerm.toLowerCase();
  const now = Date.now();

  let filteredJobs = state.jobs.filter((job) => {
    // Search filter
    const matchesSearch =
      searchLower === "" ||
      job.title.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      (job.tags &&
        job.tags.some((tag) => tag.toLowerCase().includes(searchLower)));

    // Location filter
    const formattedLocation = formatString(job.location || "").toLowerCase();
    const matchesLocation =
      locationLower === "" || formattedLocation.includes(locationLower);

    // Category filter
    const matchesCategory =
      state.selectedCategory === "" ||
      (job.tags && job.tags.includes(state.selectedCategory));

    // Job type filter
    const matchesJobType =
      state.selectedJobType === "" || job.jobType === state.selectedJobType;

    // Date posted filter
    let matchesDatePosted = true;
    if (state.selectedDatePosted) {
      const jobDate = parseInt(job.createdAt);
      const dayInMs = 24 * 60 * 60 * 1000;

      if (state.selectedDatePosted === "today") {
        matchesDatePosted = now - jobDate < dayInMs;
      } else if (state.selectedDatePosted === "3days") {
        matchesDatePosted = now - jobDate < 3 * dayInMs;
      } else if (state.selectedDatePosted === "week") {
        matchesDatePosted = now - jobDate < 7 * dayInMs;
      } else if (state.selectedDatePosted === "month") {
        matchesDatePosted = now - jobDate < 30 * dayInMs;
      }
    }

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesJobType &&
      matchesDatePosted
    );
  });

  // Then apply sorting if specified
  if (state.sortOrder === "asc") {
    filteredJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (state.sortOrder === "desc") {
    filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  state.filteredJobs = filteredJobs;
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
    createdAt: new Date(job.createdAt)?.toISOString(),
  }));
};

// Flex Orange – #FA5508
// Bright Aqua – #10E7DC
// Deep Blue – #0074E1

// Debounce utility
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
