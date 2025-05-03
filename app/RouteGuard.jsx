"use client";
import { addUser, removeUser } from "@/slices/userSlice";
import { LOGO } from "@/utils/constants";
import { auth } from "@/utils/firebase";
import { privateRoutes, publicRoutes } from "@/utils/routes";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const RouteGuard = ({ children }) => {
  const selector = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid, email, displayName }));

        // If user has no displayName, redirect to create-profile based on userType
        if (!displayName) {
          if (
            selector.userType === "Candidate" &&
            pathname !== "/create-profile-candidate"
          ) {
            push("/create-profile-candidate");
          } else if (
            selector.userType === "Employer" &&
            pathname !== "/create-profile-employer"
          ) {
            push("/create-profile-employer");
          }
        } else {
          // If user has a displayName, prevent access to create-profile routes
          if (
            pathname === "/create-profile" ||
            pathname === "/create-profile-candidate" ||
            pathname === "/create-profile-employer"
          ) {
            push("/");
          }
          // Redirect from public routes (e.g., /login, /register) to /
          else if (publicRoutes.includes(pathname)) {
            push("/");
          }
        }
      } else {
        dispatch(removeUser());
        // Redirect to /login for protected routes
        if (
          privateRoutes.some(
            (route) => pathname === route || pathname.startsWith(route)
          )
        ) {
          push("/login");
        }
        // Prevent unauthenticated users from accessing create-profile routes
        if (
          pathname === "/create-profile" ||
          pathname === "/create-profile-candidate" ||
          pathname === "/create-profile-employer"
        ) {
          push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, push, pathname, selector.userType]);

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
