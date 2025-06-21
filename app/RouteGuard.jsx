"use client";
import {
  useFetchEmployerJobs,
  useGetAppliedJobs,
  useGetSavedJobs,
} from "@/APIs/auth/jobs";
import { useGetUploadedResumes } from "@/APIs/auth/resume";
import {
  addJobId,
  addUser,
  clearAppliedJobs,
  clearResumes,
  removeUser,
  setEmployerJobs,
  setSavedJobs,
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

        if (userData.userType === "Candidate") {
          useGetAppliedJobs(user.uid, dispatch);
          const savedJobs = await useGetSavedJobs(user.uid);
          dispatch(setSavedJobs(savedJobs));
          dispatch(
            addUser({
              uid,
              email,
              userType: userData.userType || "Candidate",
              createdAt: userData.createdAt || null,
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
        } else {
          dispatch(
            addUser({
              uid,
              email,
              userType: userData?.userType || "Employer",
              createdAt: userData?.createdAt || null,
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
        }

        // Handle Candidate flow
        if (userData.userType === "Candidate") {
          if (searchParams.get("id")) {
            dispatch(addJobId(searchParams.get("id")));
          }
          if (userData.isFirstTime) {
            if (pathname !== "/create-profile-candidate") {
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
          if (userData.isFirstTime) {
            // Store the last valid onboarding page
            const validOnboardingPages = [
              "/onboard-pricing",
              "/onboard-cart",
              "/onboard-checkout",
              "/onboard-order-completed",
            ];
            const lastValidPage = validOnboardingPages.find(
              (page) => pathname === page
            );

            if (!lastValidPage) {
              // If current page is not a valid onboarding page, redirect to the last valid page or default to pricing
              const lastPage =
                localStorage.getItem("lastOnboardingPage") ||
                "/onboard-pricing";
              push(lastPage);
            } else {
              // If current page is valid, store it
              localStorage.setItem("lastOnboardingPage", pathname);
            }
          } else if (!userData.hasPostedJob) {
            if (pathname !== "/create-profile-employer") {
              push("/create-profile-employer");
            }
          } else {
            if (
              pathname.startsWith("/create-profile") ||
              pathname === "/create-profile-candidate" ||
              pathname === "/create-profile-employer"
            ) {
              push("/create-profile-employer");
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
        dispatch(clearAppliedJobs());
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
  }, [push, pathname, selector?.userType, selector.isFirstTime]);

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

  return children;
};

export default RouteGuard;
