"use client";
import { addUser, isFirstTime, removeUser } from "@/slices/userSlice";
import { LOGO } from "@/utils/constants";
import { auth, db } from "@/utils/firebase";
import { privateRoutes } from "@/utils/routes";
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
        const { uid, email, displayName } = user;
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        console.log("userData.isFirstTime :>> ", userData.isFirstTime);
        dispatch(
          addUser({
            uid,
            email,
            userType: userData.userType || null,
            displayName,
          })
        );

        if (userData.isFirstTime) {
          push("/create-profile-candidate");
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
