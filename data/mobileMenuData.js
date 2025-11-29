module.exports = [
  {
    id: 1,
    label: "Startpagina",
    items: [
      {
        name: "Startpagina",
        routePath: "/",
      },
    ],
  },
  {
    id: 2,
    label: "Vacatures",
    items: [
      {
        name: "Zoek Vacatures",
        routePath: "/job-list",
      },
    ],
  },

  {
    id: 5,
    label: "Pagina's",
    items: [
      {
        name: "Over Ons",
        routePath: "/about",
      },
      {
        name: "Prijzen",
        routePath: "/pricing",
      },
      {
        name: "Veelgestelde Vragen",
        routePath: "/faq",
      },
      {
        name: "Wetgeving",
        routePath: "/term",
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
        name: "Inloggen",
        routePath: "/login",
        showWhenLoggedOut: true,
      },
      {
        name: "Registreren",
        routePath: "/register",
        showWhenLoggedOut: true,
      },
      {
        name: "Uitloggen",
        routePath: "/login",
        showWhenLoggedIn: true,
        isAction: true,
      },
    ],
  },
  {
    id: 7,
    label: "Werkgever Dashboard",
    items: [
      {
        name: "Dashboard",
        routePath: "/employers-dashboard/dashboard",
      },
      {
        name: "Bedrijfsprofiel",
        routePath: "/employers-dashboard/company-profile",
      },
      {
        name: "Nieuwe Vacature Plaatsen",
        routePath: "/employers-dashboard/post-jobs",
      },
      {
        name: "Beheer Vacatures",
        routePath: "/employers-dashboard/manage-jobs",
      },
      {
        name: "Alle Sollicitanten",
        routePath: "/employers-dashboard/all-applicants",
      },
      {
        name: "Pakketten",
        routePath: "/employers-dashboard/packages",
      },
      {
        name: "Wachtwoord Wijzigen",
        routePath: "/employers-dashboard/change-password",
      },
      {
        name: "Account Verwijderen",
        routePath: "delete-account",
        isAction: true,
      },
    ],
  },
  {
    id: 8,
    label: "Kandidaat Dashboard",
    items: [
      {
        name: "Mijn Profiel",
        routePath: "/candidates-dashboard/my-profile",
      },
      {
        name: "Sollicitaties",
        routePath: "/candidates-dashboard/applied-jobs",
      },
      {
        name: "Favoriete Vacatures",
        routePath: "/candidates-dashboard/short-listed-jobs",
      },
      {
        name: "CV Beheer",
        routePath: "/candidates-dashboard/cv-manager",
      },
      {
        name: "Wachtwoord Wijzigen",
        routePath: "/candidates-dashboard/change-password",
      },
      {
        name: "Account Verwijderen",
        routePath: "delete-account",
        isAction: true,
      },
    ],
  },
];
