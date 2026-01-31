"use client";

import { useGetUploadedResumes } from "@/APIs/auth/resume";
import {
  addJobId,
  addUser,
  clearResumes,
  removeUser,
} from "@/slices/userSlice";
import { LOGO } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { authProtectedPublicRoutes, privateRoutes } from "@/utils/routes";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const RouteGuard = ({ children }) => {
  const selector = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useGetUploadedResumes(selector.user, selector.userType);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid, email } = user;
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Debug logging
        console.log("RouteGuard - User data:", userData);
        console.log("RouteGuard - isFirstTime:", userData.isFirstTime);
        console.log("RouteGuard - userType:", userData.userType);

        if (userData.userType === "Candidate") {
          // Restrict Candidate from Employer/Admin routes
          const employerPrefixes = [
            "/employers-dashboard",
            "/create-profile-employer",
            "/admin-dashboard",
          ];
          if (employerPrefixes.some((prefix) => pathname.startsWith(prefix))) {
            push("/candidates-dashboard/my-profile");
            setLoading(false);
            return;
          }

          dispatch(
            addUser({
              uid,
              email,
              userType: userData.userType || "Candidate",
              createdAt: userData.createdAt
                ? userData.createdAt.toDate().toISOString()
                : null,
              isFirstTime: userData.isFirstTime ?? false,
              name: userData.name || "",
              title: userData.title || "",
              phone_number: userData.phone_number || "",
              gender: userData.gender || "",
              age: userData.age || "",
              description: userData.description || "",
              logo: userData.logo || null,
            })
          );
        } else if (userData.userType === "Employer") {
          // Restrict Employer from Candidate/Admin routes
          const candidatePrefixes = [
            "/candidates-dashboard",
            "/create-profile-candidate",
            "/admin-dashboard",
          ];
          if (candidatePrefixes.some((prefix) => pathname.startsWith(prefix))) {
            push("/employers-dashboard/company-profile");
            setLoading(false);
            return;
          }
          dispatch(
            addUser({
              uid,
              email,
              userType: userData?.userType || "Employer",
              createdAt: userData?.createdAt
                ? userData.createdAt.toDate().toISOString()
                : null,
              isFirstTime: userData?.isFirstTime ?? false,
              hasPostedJob: userData?.hasPostedJob ?? false,
              logo: userData?.logo || null,
              company_name: userData?.company_name || "",
              phone: userData?.phone || "",
              website: userData?.website || "",
              company_type: userData?.company_type || [],
              description: userData?.description || "",
              company_location: userData?.company_location || "",
            })
          );
        } else if (userData.userType === "Admin") {
          // Restrict Admin from Candidate/Employer routes
          const nonAdminPrefixes = [
            "/candidates-dashboard",
            "/create-profile-candidate",
            "/employers-dashboard",
            "/create-profile-employer",
          ];
          if (nonAdminPrefixes.some((prefix) => pathname.startsWith(prefix))) {
            push("/admin-dashboard/admin-dashboard");
            setLoading(false);
            return;
          }
          dispatch(
            addUser({
              uid,
              email,
              userType: "Admin",
              createdAt: userData.createdAt
                ? userData.createdAt.toDate().toISOString()
                : null,
            })
          );
        }

        // Handle Candidate flow
        if (userData.userType === "Candidate") {
          if (searchParams.get("id")) {
            dispatch(addJobId(searchParams.get("id")));
          }
          if (userData.isFirstTime) {
            if (
              pathname !== "/create-profile-candidate" &&
              pathname !== "/contact" &&
              !pathname.startsWith("/blog-details")
            ) {
              push("/create-profile-candidate");
            }
          } else {
            if (searchParams.get("id")) {
              push(`/job-list/${searchParams.get("id")}`);
            } else if (
              pathname.startsWith("/create-profile") ||
              pathname === "/create-profile-candidate" ||
              pathname === "/create-profile-employer"
            ) {
              push("/");
            }
          }
        }
        // Handle Employer flow
        else if (userData.userType === "Employer") {
          // Treat as first-time only if Firestore says so and Redux hasn't been set to false (e.g. after skip)
          const isOnboardingRequired =
            (userData.isFirstTime ?? true) && selector.isFirstTime !== false;

          if (isOnboardingRequired) {
            // Store the last valid onboarding page
            const validOnboardingPages = [
              "/onboard-pricing",
              "/onboard-order-completed",
              "/escape-onboarding",
            ];
            const lastValidPage = validOnboardingPages.find(
              (page) => pathname === page
            );

            if (
              !lastValidPage &&
              pathname !== "/contact" &&
              !pathname.startsWith("/blog-details")
            ) {
              // If current page is not a valid onboarding page, redirect to the last valid page or default to pricing
              const lastPage =
                localStorage.getItem(`lastOnboardingPage_${uid}`) ||
                "/onboard-pricing";
              push(lastPage);
            } else {
              // If current page is valid, store it
              localStorage.setItem(`lastOnboardingPage_${uid}`, pathname);
            }
          } else if (
            !(userData.hasPostedJob ?? false) &&
            selector.hasPostedJob !== true
          ) {
            if (
              pathname !== "/create-profile-employer" &&
              pathname !== "/contact" &&
              !pathname.startsWith("/blog-details")
            ) {
              push("/create-profile-employer");
            }
          } else {
            if (
              pathname.startsWith("/create-profile") ||
              pathname === "/create-profile-candidate" ||
              pathname === "/create-profile-employer"
            ) {
              push("/employers-dashboard/dashboard");
            }
          }
        }
        // Redirect authenticated users away from auth-protected public routes
        if (authProtectedPublicRoutes.includes(pathname)) {
          push("/");
          setLoading(false);
          return;
        }
      } else {
        dispatch(removeUser());
        dispatch(clearResumes());

        if (selector.user?.uid) {
          localStorage.removeItem(`lastOnboardingPage_${selector.user.uid}`);
        }

        // Redirect unauthenticated users from private routes to login
        if (privateRoutes.some((route) => pathname.includes(route))) {
          push("/login");
          setLoading(false);
          return;
        }

        // Prevent unauthenticated users from accessing create-profile routes
        if (
          pathname.startsWith("/create-profile") ||
          pathname === "/create-profile-candidate" ||
          pathname === "/create-profile-employer"
        ) {
          push("/login");
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [push, pathname, selector?.userType, selector.isFirstTime, selector.hasPostedJob]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Image src={LOGO} width={250} height={250} alt="Loading Logo" />
      </div>
    );
  }

  return <div style={{ display: "contents" }}>{children}</div>;
};

export default RouteGuard;
