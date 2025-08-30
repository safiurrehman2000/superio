"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  dismissBanner,
  showBanner,
} from "@/features/subscription/subscriptionBannerSlice";
import { IoClose } from "react-icons/io5";

const SubscriptionBanner = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible, isDismissed, showForEmployers, showForCandidates } =
    useSelector((state) => state.subscriptionBanner);
  const user = useSelector((state) => state.user.user);
  const [isMounted, setIsMounted] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check if current route is onboarding, pricing, or other pages where banner shouldn't show
  const isOnboardingRoute = useCallback(() => {
    const excludedRoutes = [
      "/create-profile-employer",
      "/create-profile-candidate",
      "/onboard-pricing",
      "/onboard-order-completed",
      "/register",
      "/login",
      "/pricing",
      "/success",
      "/shop",
      "/admin-dashboard",
    ];
    return excludedRoutes.some((route) => pathname.startsWith(route));
  }, [pathname]);

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async (userId) => {
    if (!userId) return false;

    try {
      setIsCheckingSubscription(true);
      const response = await fetch("/api/subscription-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.active || false;
      }
      return false;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    } finally {
      setIsCheckingSubscription(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Check if user is logged in and should see the banner
    if (user && !isDismissed && !isOnboardingRoute()) {
      const userType = user.userType || "Candidate";

      if (userType === "Employer" && showForEmployers) {
        // Check subscription status for employers
        checkSubscriptionStatus(user.uid).then((hasSubscription) => {
          setHasActiveSubscription(hasSubscription);

          // Only show banner if employer doesn't have active subscription
          if (!hasSubscription) {
            dispatch(showBanner());
          }
        });
      } else if (userType === "Candidate" && showForCandidates) {
        dispatch(showBanner());
      }
    }
  }, [
    user,
    isDismissed,
    showForEmployers,
    showForCandidates,
    dispatch,
    pathname,
    checkSubscriptionStatus,
  ]);

  // Re-check subscription status when user changes or pathname changes
  useEffect(() => {
    if (user?.uid && user?.userType === "Employer" && !isOnboardingRoute()) {
      checkSubscriptionStatus(user.uid).then((hasSubscription) => {
        setHasActiveSubscription(hasSubscription);

        // Hide banner if user now has active subscription
        if (hasSubscription && isVisible) {
          dispatch(dismissBanner());
        }
      });
    }
  }, [
    user?.uid,
    pathname,
    checkSubscriptionStatus,
    isVisible,
    dispatch,
    isOnboardingRoute,
  ]);

  const handleClose = () => {
    dispatch(dismissBanner());
  };

  const handleGetSubscription = () => {
    router.push("/pricing");
  };

  // Add CSS to push the header down when banner is visible
  React.useEffect(() => {
    if (isVisible && isMounted && user) {
      document.body.classList.add("subscription-banner-visible");
      return () => {
        document.body.classList.remove("subscription-banner-visible");
      };
    }
  }, [isVisible, isMounted, user]);

  // Don't render until mounted to avoid hydration issues
  // Also don't render if checking subscription or if user has active subscription
  if (
    !isMounted ||
    !isVisible ||
    !user ||
    isCheckingSubscription ||
    hasActiveSubscription ||
    isOnboardingRoute()
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0, // At the very top, below browser bar
        left: 0,
        right: 0,
        zIndex: 1000,
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #FA5508 0%, #f9ab00 100%)",
          color: "#ffffff",
          padding: "16px 24px",
          boxShadow: "0 2px 8px rgba(250, 85, 8, 0.2)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-50%",
            width: "200%",
            height: "200%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.3,
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "none",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <IoClose />
        </button>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⭐
            </div>
            <div>
              <h4
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                Upgrade Your Experience!
              </h4>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  opacity: 0.9,
                  lineHeight: "1.4",
                }}
              >
                Get access to premium features and boost your success
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              onClick={handleGetSubscription}
              style={{
                background: "#ffffff",
                color: "#FA5508",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#ffffff";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Get Subscription
            </button>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBanner;
