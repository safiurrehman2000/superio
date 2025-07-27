module.exports = [
  {
    id: 1,
    label: "Home",
    items: [
      {
        name: "Home Page",
        routePath: "/",
      },
    ],
  },
  {
    id: 2,
    label: "Job Listing",
    items: [
      {
        name: "Browse Jobs",
        routePath: "/job-list",
      },
    ],
  },

  {
    id: 5,
    label: "Pages",
    items: [
      {
        name: "About",
        routePath: "/about",
      },
      {
        name: "Pricing",
        routePath: "/pricing",
      },
      {
        name: "FAQ's",
        routePath: "/faq",
      },
      {
        name: "Contact",
        routePath: "/contact",
      },
    ],
  },
  {
    id: 6,
    label: "Account",
    items: [
      {
        name: "Login",
        routePath: "/login",
      },
      {
        name: "Register",
        routePath: "/register",
      },
    ],
  },
  {
    id: 7,
    label: "Employer Dashboard",
    items: [
      {
        name: "Dashboard",
        routePath: "/employers-dashboard/dashboard",
      },
      {
        name: "Company Profile",
        routePath: "/employers-dashboard/company-profile",
      },
      {
        name: "Post a New Job",
        routePath: "/employers-dashboard/post-jobs",
      },
      {
        name: "Manage Jobs",
        routePath: "/employers-dashboard/manage-jobs",
      },
      {
        name: "All Applicants",
        routePath: "/employers-dashboard/all-applicants",
      },
      {
        name: "Packages",
        routePath: "/employers-dashboard/packages",
      },
      {
        name: "Change Password",
        routePath: "/employers-dashboard/change-password",
      },
      {
        name: "Delete Account",
        routePath: "delete-account",
        isAction: true,
      },
    ],
  },
  {
    id: 8,
    label: "Candidate Dashboard",
    items: [
      {
        name: "My Profile",
        routePath: "/candidates-dashboard/my-profile",
      },
      {
        name: "Applied Jobs",
        routePath: "/candidates-dashboard/applied-jobs",
      },
      {
        name: "Shortlisted Jobs",
        routePath: "/candidates-dashboard/short-listed-jobs",
      },
      {
        name: "CV Manager",
        routePath: "/candidates-dashboard/cv-manager",
      },
      {
        name: "Change Password",
        routePath: "/candidates-dashboard/change-password",
      },
      {
        name: "Delete Account",
        routePath: "delete-account",
        isAction: true,
      },
    ],
  },
];
