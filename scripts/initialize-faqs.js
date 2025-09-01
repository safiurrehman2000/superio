const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} = require("firebase/firestore");

// Your Firebase config (you'll need to add this)
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-domain.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample categories
const sampleCategories = [
  { name: "General" },
  { name: "Account & Profile" },
  { name: "Job Posting" },
  { name: "Applications" },
  { name: "Payments & Billing" },
  { name: "Technical Support" },
];

// Sample FAQs
const sampleFAQs = [
  {
    heading: "How do I create an account?",
    content:
      "To create an account, click on the 'Register' button in the top right corner. Fill in your email, password, and select whether you're a job seeker or employer. Verify your email address to complete the registration process.",
    category: "General", // This will be updated with actual category ID
  },
  {
    heading: "How do I post a job?",
    content:
      "As an employer, you can post jobs by going to your dashboard and clicking 'Post New Job'. Fill in the job details including title, description, requirements, and location. Choose your pricing plan and submit for review.",
    category: "Job Posting",
  },
  {
    heading: "How do I apply for a job?",
    content:
      "Browse available jobs and click on any job that interests you. Click the 'Apply Now' button, upload your resume, and fill in any additional required information. Submit your application and track its status in your dashboard.",
    category: "Applications",
  },
  {
    heading: "How do I update my profile?",
    content:
      "Go to your dashboard and click on 'My Profile'. You can update your personal information, work experience, education, and skills. Don't forget to save your changes after making updates.",
    category: "Account & Profile",
  },
  {
    heading: "What payment methods do you accept?",
    content:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe. You can also set up automatic billing for subscription plans.",
    category: "Payments & Billing",
  },
  {
    heading: "How do I reset my password?",
    content:
      "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Click the link in your email to create a new password. Make sure to use a strong, unique password.",
    category: "Account & Profile",
  },
  {
    heading: "How long does job approval take?",
    content:
      "Job postings are typically reviewed within 24-48 hours during business days. We review for content quality, compliance with our guidelines, and accuracy. You'll receive an email notification once your job is approved or if any changes are needed.",
    category: "Job Posting",
  },
  {
    heading: "Can I edit a job after posting?",
    content:
      "Yes, you can edit your job postings. Go to your dashboard, find the job you want to edit, and click 'Edit'. Make your changes and submit. The updated job will go through a quick review process before going live again.",
    category: "Job Posting",
  },
  {
    heading: "How do I contact support?",
    content:
      "You can contact our support team through the contact form on our website, or email us directly at support@superio.com. We typically respond within 24 hours. For urgent issues, please include 'URGENT' in your subject line.",
    category: "Technical Support",
  },
  {
    heading: "What happens if my subscription expires?",
    content:
      "When your subscription expires, your job postings will be paused and you won't be able to post new jobs. You can renew your subscription at any time to reactivate your account and continue posting jobs.",
    category: "Payments & Billing",
  },
];

async function initializeFAQs() {
  try {
    console.log("🚀 Starting FAQ initialization...");

    // First, create categories
    const categoryIds = {};
    for (const category of sampleCategories) {
      const docRef = await addDoc(collection(db, "categories"), {
        name: category.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
        createdByEmail: "system@superio.com",
        lastUpdatedBy: "system",
        lastUpdatedAt: new Date(),
      });
      categoryIds[category.name] = docRef.id;
      console.log(`✅ Created category: ${category.name} (ID: ${docRef.id})`);
    }

    // Then, create FAQs with proper category IDs
    for (const faq of sampleFAQs) {
      const categoryId = categoryIds[faq.category];
      if (!categoryId) {
        console.warn(`⚠️ Category not found for: ${faq.category}`);
        continue;
      }

      await addDoc(collection(db, "faqs"), {
        heading: faq.heading,
        content: faq.content,
        category: categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
        createdByEmail: "system@superio.com",
        lastUpdatedBy: "system",
        lastUpdatedAt: new Date(),
      });
      console.log(`✅ Created FAQ: ${faq.heading}`);
    }

    console.log("🎉 FAQ initialization completed successfully!");
    console.log(
      `📊 Created ${sampleCategories.length} categories and ${sampleFAQs.length} FAQs`
    );
  } catch (error) {
    console.error("❌ Error initializing FAQs:", error);
  }
}

// Run the initialization
initializeFAQs();
