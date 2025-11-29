"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import "@/styles/customStyles.css";
import { useSelector } from "react-redux";

const HeaderNavContent = () => {
  const pathname = usePathname(); // Get the current pathname
  const selector = useSelector((store) => store.user);
  return (
    <>
      <nav className="nav main-menu">
        <ul className="navigation" id="navbar">
          {/* Home menu item */}
          <li className={`${pathname === "/" ? "current" : ""} `}>
            <Link
              className={`header-nav-list ${
                pathname === "/" ? "header-nav-border-b" : ""
              }`}
              href="/"
            >
              Startpagina
            </Link>
          </li>
          {/* End Home menu item */}

          <li className={`${pathname === "/job-list" ? "current" : ""} `}>
            <Link
              className={`header-nav-list ${
                pathname === "/job-list" ? "header-nav-border-b" : ""
              }`}
              href="/job-list"
            >
              Vacatures zoeken
            </Link>
          </li>
          {/* End findjobs menu items */}

          {selector.user && (
            <li className={`${pathname === "/pricing" ? "current" : ""}`}>
              <Link
                className={`header-nav-list ${
                  pathname.startsWith("/candidates-dashboard") ||
                  pathname.startsWith("/employers-dashboard")
                    ? "header-nav-border-b"
                    : ""
                }`}
                href={`${
                  selector.userType === "Candidate"
                    ? "/candidates-dashboard/my-profile"
                    : selector.userType === "Employer"
                    ? "/employers-dashboard/dashboard"
                    : selector?.userType === "Admin"
                    ? "/admin-dashboard/admin-dashboard"
                    : "/404"
                }`}
              >
                Dashboard
              </Link>
            </li>
          )}
          {/* End Candidates menu items */}

          <li className={`${pathname === "/pricing" ? "current" : ""}`}>
            <Link
              className={`header-nav-list ${
                pathname === "/pricing" ? "header-nav-border-b" : ""
              }`}
              href="/pricing"
            >
              Prijzen
            </Link>
          </li>
          <li className={`${pathname === "/faq" ? "current" : ""}`}>
            <Link
              className={`header-nav-list ${
                pathname === "/faq" ? "header-nav-border-b" : ""
              }`}
              href="/faq"
            >
              Veelgestelde vragen
            </Link>
          </li>
          <li className={`${pathname === "/term" ? "current" : ""}`}>
            <Link
              className={`header-nav-list ${
                pathname === "/term" ? "header-nav-border-b" : ""
              }`}
              href="/term"
            >
              Wetgeving
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default HeaderNavContent;
