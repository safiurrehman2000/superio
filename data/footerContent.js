module.exports = [
  {
    id: 1,
    title: "For Candidates",
    menuList: [
      { name: "Browse Jobs", route: "/job-list" },
      {
        name: "Candidate Dashboard",
        route: "/candidates-dashboard/my-profile",
      },
      { name: "Job Alerts", route: "/candidates-dashboard/job-alerts" },
      {
        name: "My Bookmarks",
        route: "/candidates-dashboard/short-listed-jobs",
      },
    ],
  },
  {
    id: 2,
    title: "For Employers",
    menuList: [
      { name: "Employer Dashboard", route: "/employers-dashboard/dashboard" },
      { name: "Add Job", route: "/employers-dashboard/post-jobs" },
      { name: "Job Packages", route: "/employers-dashboard/packages" },
      { name: "Manage Jobs", route: "/employers-dashboard/manage-jobs" },
    ],
  },
  {
    id: 3,
    title: "About Us",
    menuList: [
      { name: "About Us", route: "/about" },
      { name: "Blog", route: "/blog-list-v1" },
      { name: "Contact", route: "/contact" },
      { name: "FAQ", route: "/faq" },
    ],
  },
  {
    id: 4,
    title: "Resources",
    menuList: [
      { name: "Pricing", route: "/pricing" },
      { name: "Login", route: "/login" },
      { name: "Register", route: "/register" },
    ],
  },
];
