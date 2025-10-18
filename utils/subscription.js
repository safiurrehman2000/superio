export const checkSubscriptionStatus = async (userId) => {
  if (!userId) {
    return { active: false, message: "Geen gebruikers-ID opgegeven" };
  }

  try {
    const response = await fetch("/api/subscription-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Kon abonnementsstatus niet ophalen");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { active: false, message: "Kon abonnementsstatus niet controleren" };
  }
};

// New function to check subscription status with job posting limits
export const checkSubscriptionWithJobLimits = async (userId) => {
  if (!userId) {
    return {
      active: false,
      canPost: false,
      message: "Geen gebruikers-ID opgegeven",
      jobLimit: 0,
      jobsPosted: 0,
      remainingJobs: 0,
    };
  }

  try {
    const response = await fetch("/api/subscription-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Kon abonnementsstatus niet ophalen");
    }

    const data = await response.json();

    // If no active subscription, return early
    if (!data.active) {
      return {
        active: false,
        canPost: false,
        message: "Geen actief abonnement",
        jobLimit: 0,
        jobsPosted: 0,
        remainingJobs: 0,
      };
    }

    // Get job posting limits and current count
    const jobLimitsResponse = await fetch("/api/job-posting-limits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!jobLimitsResponse.ok) {
      throw new Error("Kon limieten voor vacatureplaatsing niet ophalen");
    }

    const jobLimitsData = await jobLimitsResponse.json();

    return {
      ...data,
      ...jobLimitsData,
      canPost: jobLimitsData.remainingJobs > 0,
    };
  } catch (error) {
    console.error("Error checking subscription with job limits:", error);
    return {
      active: false,
      canPost: false,
      message: "Kon abonnementsstatus niet controleren",
      jobLimit: 0,
      jobsPosted: 0,
      remainingJobs: 0,
    };
  }
};

// Function to validate if user can post a job
export const validateJobPostingPermission = async (userId) => {
  const subscriptionData = await checkSubscriptionWithJobLimits(userId);

  if (!subscriptionData.active) {
    return {
      canPost: false,
      message:
        "U heeft een actief abonnement nodig om vacatures te plaatsen. Abonneer u eerst op een pakket.",
      subscriptionData,
    };
  }

  if (subscriptionData.remainingJobs <= 0) {
    return {
      canPost: false,
      message: `U heeft uw limiet voor vacatureplaatsing bereikt (${subscriptionData.jobLimit} vacatures). Upgrade uw abonnement om meer vacatures te plaatsen.`,
      subscriptionData,
    };
  }

  return {
    canPost: true,
    message: `U kunt nog ${subscriptionData.remainingJobs} vacature(s) plaatsen met uw huidige abonnement.`,
    subscriptionData,
  };
};

// Function to manually refresh subscription status (for debugging)
export const refreshSubscriptionStatus = async (userId) => {
  if (!userId) {
    return { success: false, message: "Geen gebruikers-ID opgegeven" };
  }

  try {
    const response = await fetch("/api/refresh-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Kon abonnementsstatus niet vernieuwen");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing subscription status:", error);
    return { success: false, message: "Kon abonnementsstatus niet vernieuwen" };
  }
};
