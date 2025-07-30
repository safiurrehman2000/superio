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
