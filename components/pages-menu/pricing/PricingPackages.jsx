"use client";
import { getPricingPackages } from "@/APIs/pricing/pricing";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);
const INTERVAL_LABELS = {
  week: "weekly",
  month: "monthly",
  year: "yearly",
  one_time: "one-time",
};

const getPriceDurationLabel = (item) => {
  const normalizedInterval = item?.interval?.toLowerCase?.();
  if (normalizedInterval && INTERVAL_LABELS[normalizedInterval]) {
    return INTERVAL_LABELS[normalizedInterval];
  }

  const normalizedType = item?.packageType?.toLowerCase?.() || "";
  if (normalizedType.includes("bundle")) return "bundle";
  if (normalizedType.includes("one-time") || normalizedType.includes("onetime")) {
    return "one-time";
  }

  return "";
};
const PricingPackages = () => {
  const [pricingContent, setPricingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const selector = useSelector((store) => store.user);
  const handleSubmit = async (priceId, planId) => {
    console.log("selector.user.uid", selector?.user?.uid);

    // Check if user is authenticated
    if (!selector?.user?.uid) {
      alert("Please log in to purchase a subscription.");
      return;
    }

    setCheckoutLoadingId(planId);
    const stripe = await stripePromise;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, userId: selector.user?.uid, planId }),
      });

      // Log the response for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        const text = await response.text();
        console.error("Response text:", text);
        alert("Server error. Please try again later.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data.error);
        // Handle the error appropriately - you might want to show a toast or alert
        alert("Failed to create checkout session. Please try again.");
        return;
      }

      if (!data.sessionId) {
        console.error("No sessionId received from API");
        alert("Failed to create checkout session. Please try again.");
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        console.error(result.error);
        alert("Failed to redirect to checkout. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setCheckoutLoadingId(null);
    }
  };
  useEffect(() => {
    const fetchPricingPackages = async () => {
      try {
        setLoading(true);

        const result = await getPricingPackages();

        if (result.success) {
          if (result.data && result.data.length > 0) {
            console.log("Setting pricing content:", result.data);
            setPricingContent(result.data);
          } else {
            console.log("No pricing packages found in database");
            setPricingContent([]);
          }
        } else {
          console.warn("Failed to fetch from database:", result.error);
          setPricingContent([]);
        }
      } catch (err) {
        console.error("Error fetching pricing packages:", err);
        setError(err.message);
        setPricingContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPackages();
  }, []);

  // Simple function to upload pricing data to database
  // const uploadPricingToDB = async () => {
  //   try {
  //     setInitMessage("Uploading pricing data...");

  //     // Check if data already exists
  //     const packagesRef = collection(db, "pricingPackages");

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading pricing packages...</p>
      </div>
    );
  }

  if (error && pricingContent.length === 0) {
    return (
      <div className="error-container">
        <p>Error loading pricing packages. Please try again later.</p>
      </div>
    );
  }

  if (!loading && pricingContent.length === 0) {
    return (
      <div className="error-container">
        <p>No pricing packages found in database.</p>
        <p>Please check your Firebase database or upload pricing data.</p>
      </div>
    );
  }

  return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginTop: "20px",
    }}
  >
    <div className="pricing-tabs tabs-box wow fadeInUp">
      <div className="row">
        {pricingContent?.map((item) => (
          <div
            className={`pricing-table col-lg-4 col-md-6 col-sm-12 ${item.tag}`}
            key={item.id}
            style={{
              marginBottom: "30px",
            }}
          >
            <div
              className="inner-box"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,22,46,0.96) 0%, rgba(0,116,225,0.88) 100%)",
                borderRadius: "26px",
                padding: "40px 30px",
                border: "2px solid #ff8c42",
                boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                height: "100%",
                color: "#fff",
                overflow: "hidden",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 50px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "0 15px 40px rgba(0,0,0,0.25)";
              }}
            >
              {item.tag ? (
                <span
                  className="tag"
                  style={{
                    background: "#10e7dc",
                    color: "#072343",
                    fontWeight: "700",
                    padding: "8px 18px",
                    borderRadius: "30px",
                    fontSize: "13px",
                  }}
                >
                  Recommended
                </span>
              ) : (
                ""
              )}

              <div
                className="title"
                style={{
                  color: "#ff8c42",
                  fontWeight: "700",
                  fontSize: "28px",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                {item.packageType}
              </div>

              {item?.price === "Free" ? (
                <div
                  className="price"
                  style={{
                    color: "#fff",
                    fontSize: "42px",
                    fontWeight: "800",
                    marginBottom: "25px",
                  }}
                >
                  {item.price}
                </div>
              ) : (
                <div
                  className="price"
                  style={{
                    color: "#fff",
                    fontSize: "42px",
                    fontWeight: "800",
                    marginBottom: "25px",
                  }}
                >
                  €{item.price}{" "}
                  {getPriceDurationLabel(item) && (
                    <span
                      className="duration"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: "16px",
                        fontWeight: "400",
                      }}
                    >
                      / {getPriceDurationLabel(item)}
                    </span>
                  )}
                </div>
              )}

              <div className="table-content">
                <ul
                  style={{
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}
                >
                  {item.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        color: "#fff",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        padding: "14px 0",
                        fontSize: "15px",
                        lineHeight: "1.7",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        listStyle: "none",
                      }}
                    >
                      <span
                        style={{
                          color: "#ff8c42",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        ✓
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  width: "100%",
                  marginTop: "30px",
                  textAlign: "center",
                }}
              >
                <button
                  className="theme-btn btn-style-three"
                  style={{
                    margin: "auto",
                    opacity:
                      checkoutLoadingId === item?.id ? 0.7 : 1,
                    borderRadius: "14px",
                    padding: "14px 34px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  disabled={checkoutLoadingId !== null}
                  onClick={() => {
                    handleSubmit(item?.stripePriceId, item?.id);
                  }}
                >
                  {checkoutLoadingId === item?.id
                    ? "Bezig met laden..."
                    : "ADVERTEER"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default PricingPackages;