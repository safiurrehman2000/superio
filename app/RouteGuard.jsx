"use client";
import { addUser, removeUser } from "@/slices/userSlice";
import { LOGO } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { authProtectedPublicRoutes, privateRoutes } from "@/utils/routes";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("loggedin :>> ");
        const { uid, email, displayName } = user;
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        dispatch(
          addUser({
            uid,
            email,
            userType: userData.userType || null,
            displayName,
          })
        );

        // Handle first-time users
        if (userData.isFirstTime) {
          if (pathname !== "/create-profile-candidate") {
            push("/create-profile-candidate");
            setLoading(false);
            return;
          }
        } else {
          // Prevent non-first-time users from accessing create-profile routes
          if (
            pathname.startsWith("/create-profile") ||
            pathname === "/create-profile-candidate" ||
            pathname === "/create-profile-employer"
          ) {
            push("/");
            setLoading(false);
            return;
          }
        }

        // Redirect authenticated users away from auth-protected public routes
        if (authProtectedPublicRoutes.includes(pathname)) {
          push("/");
          setLoading(false);
          return;
        }
      } else {
        console.log("loggedout :>> ");
        dispatch(removeUser());

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
  }, [dispatch, push, pathname, selector?.userType]);

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
