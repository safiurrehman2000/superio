"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { addUser, removeUser } from "@/slices/userSlice";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { privateRoutes, publicRoutes } from "@/utils/routes";
import Image from "next/image";
import { LOGO } from "@/utils/constants";
const RouteGuard = ({ children }) => {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("user :>> ", user);
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid, email, displayName }));

        // Redirect from public routes (e.g., /login, /register) to /
        if (publicRoutes.includes(pathname)) {
          push("/");
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, push, pathname]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Image src={LOGO} width={250} height={250} />
      </div>
    );
  }

  return children;
};

export default RouteGuard;
