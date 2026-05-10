import { errorToast } from "./toast";

const postEmail = async (endpoint, payload) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let serverMessage = "Email request failed";
    try {
      const body = await response.json();
      if (body?.error) serverMessage = body.error;
    } catch {
      // No-op: fallback to default message
    }
    throw new Error(serverMessage);
  }

  const result = await response.json();
  return Boolean(result?.success);
};

export const sendWelcomeEmail = async (
  userEmail,
  userName = "",
  userType = "User"
) => {
  try {
    return await postEmail("/api/emails/welcome", {
      userEmail,
      userName,
      userType,
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
    errorToast(`Email error: ${error.message || "Unknown error"}`);
    return false;
  }
};

// Deprecated helper kept for compatibility. Job alerts now run server-side via Brevo.
export const sendJobAlertEmail = async () => true;

// Deprecated helper kept for compatibility. Use server routes + Brevo instead.
export const sendCustomEmail = async () => false;
