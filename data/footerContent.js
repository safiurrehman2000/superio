module.exports = [
  {
    id: 1,
    title: "Voor Kandidaten",
    menuList: [
      { name: "Zoek Vacatures", route: "/job-list" },
      {
        name: "Kandidaat Dashboard",
        route: "/candidates-dashboard/my-profile",
      },
      {
        name: "Vacature Waarschuwingen",
        route: "/candidates-dashboard/job-alerts",
      },
      {
        name: "Mijn Favorieten",
        route: "/candidates-dashboard/short-listed-jobs",
      },
    ],
  },
  {
    id: 2,
    title: "Voor Werkgevers",
    menuList: [
      { name: "Werkgever Dashboard", route: "/employers-dashboard/dashboard" },
      { name: "Vacature Toevoegen", route: "/employers-dashboard/post-jobs" },
      { name: "Vacature Pakketten", route: "/employers-dashboard/packages" },
      { name: "Beheer Vacatures", route: "/employers-dashboard/manage-jobs" },
    ],
  },
  {
    id: 3,
    title: "Over Ons",
    menuList: [
      { name: "Over Ons", route: "/about" },
      { name: "Blog", route: "/blog-list-v1" },
      { name: "Contact", route: "/contact" },
      { name: "FAQ", route: "/faq" },
      { name: "Wetgeving", route: "/term" },
    ],
  },
  {
    id: 4,
    title: "Hulpmiddelen",
    menuList: [
      { name: "Prijzen", route: "/pricing" },
      { name: "Inloggen", route: "/login" },
      { name: "Registreren", route: "/register" },
    ],
  },
];
