export const checkSubscriptionStatus = async (userId) => {
  if (!userId) {
    return { active: false, message: "No user ID provided" };
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
      throw new Error("Failed to fetch subscription status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { active: false, message: "Failed to check subscription status" };
  }
};

// New function to check subscription status with job posting limits
export const checkSubscriptionWithJobLimits = async (userId) => {
  if (!userId) {
    return {
      active: false,
      canPost: false,
      message: "No user ID provided",
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
      throw new Error("Failed to fetch subscription status");
    }

    const data = await response.json();

    // If no active subscription, return early
    if (!data.active) {
      return {
        active: false,
        canPost: false,
        message: "No active subscription",
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
      throw new Error("Failed to fetch job posting limits");
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
      message: "Failed to check subscription status",
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
        "You need an active subscription to post jobs. Please subscribe to a plan first.",
      subscriptionData,
    };
  }

  if (subscriptionData.remainingJobs <= 0) {
    return {
      canPost: false,
      message: `You have reached your job posting limit (${subscriptionData.jobLimit} jobs). Please upgrade your subscription to post more jobs.`,
      subscriptionData,
    };
  }

  return {
    canPost: true,
    message: `You can post ${subscriptionData.remainingJobs} more job(s) with your current subscription.`,
    subscriptionData,
  };
};

// Function to manually refresh subscription status (for debugging)
export const refreshSubscriptionStatus = async (userId) => {
  if (!userId) {
    return { success: false, message: "No user ID provided" };
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
      throw new Error("Failed to refresh subscription status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing subscription status:", error);
    return { success: false, message: "Failed to refresh subscription status" };
  }
};
