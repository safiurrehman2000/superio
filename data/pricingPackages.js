export const pricingPackages = [
  {
    id: 1,
    packageType: "Basic",
    price: "Free",
    tag: "",
    jobPosts: 30,
    stripePriceId: null, // Will be set when Stripe products are created
    features: [
      "30 job posting",
      "3 featured job",
      "Job displayed for 15 days",
      "Premium Support 24/7",
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    packageType: "Standard",
    price: "499",
    tag: "tagged",
    jobPosts: 40,
    stripePriceId: null, // Will be set when Stripe products are created
    features: [
      "40 job posting",
      "5 featured job",
      "Job displayed for 20 days",
      "Premium Support 24/7",
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    packageType: "Extended",
    price: "799",
    tag: "",
    jobPosts: 50,
    stripePriceId: null, // Will be set when Stripe products are created
    features: [
      "50 job posting",
      "10 featured job",
      "Job displayed for 60 days",
      "Premium Support 24/7",
    ],
    isActive: true,
    sortOrder: 3,
  },
];
