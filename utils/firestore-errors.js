export function isFirestoreQuotaError(error) {
  if (!error) return false;
  if (error.code === 8 || error.code === "resource-exhausted") return true;
  const message = String(error.message || error.details || "").toLowerCase();
  return (
    message.includes("quota exceeded") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

export function quotaExceededResponse() {
  return Response.json(
    {
      success: false,
      error:
        "Database read quota exceeded. Please try again later or contact support.",
      code: "FIRESTORE_QUOTA_EXCEEDED",
    },
    { status: 503 },
  );
}
