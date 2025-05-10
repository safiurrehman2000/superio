"use client";

import { useSignOut } from "@/APIs/auth/auth";
import { candidateMenuData, employerMenuData, LOGO } from "@/utils/constants";
import { isActiveLink } from "@/utils/linkActiveChecker";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import HeaderNavContent from "./HeaderNavContent";

const DefaulHeader2 = () => {
  const selector = useSelector((store) => store.user);

  return (
    // <!-- Main Header-->
    <header className={`main-header header-shaddow `}>
      {/* <!-- Main box --> */}
      <div className="main-box">
        {/* <!--Nav Outer --> */}
        <div className="nav-outer">
          <div className="logo-box">
            <div className="logo">
              <Link href="/">
                <Image
                  width={154}
                  height={50}
                  src={LOGO}
                  alt="De Flexijobber Logo"
                />
              </Link>
            </div>
          </div>
          {/* End .logo-box */}

          <HeaderNavContent />
          {/* <!-- Main Menu End--> */}
        </div>
        {/* End .nav-outer */}
        {/* conditional rendering for if user is logged in or not */}
        {!selector?.user?.uid ? (
          <div className="outer-box gap-2">
            {/* <!-- Login/Register --> */}
            <div className="btn-box">
              <a
                href="#"
                className="theme-btn btn-style-three call-modal"
                data-bs-toggle="modal"
                data-bs-target="#loginPopupModal"
              >
                Login / Register
              </a>
              <Link
                href="/employers-dashboard/post-jobs"
                className="theme-btn btn-style-one"
              >
                Job Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="dropdown dashboard-option">
            <a
              className="dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <Image
                alt="avatar"
                className="thumb"
                src="/images/resource/company-6.png"
                width={50}
                height={50}
              />
              <span className="name">
                {selector?.user?.email?.split("@")[0]}
              </span>
            </a>

            {selector.userType == "Candidate" ? (
              <ul className="dropdown-menu">
                {candidateMenuData.map((item) => (
                  <li
                    className={`${
                      isActiveLink(item.routePath, usePathname())
                        ? "active"
                        : ""
                    } mb-1`}
                    key={item.id}
                  >
                    {item.name === "Logout" ? (
                      <Link
                        onClick={() => {
                          const { success } = useSignOut();
                        }}
                        href={item.routePath}
                      >
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </Link>
                    ) : (
                      <Link href={item.routePath}>
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="dropdown-menu">
                {employerMenuData.map((item) => (
                  <li
                    className={`${
                      isActiveLink(item.routePath, usePathname())
                        ? "active"
                        : ""
                    } mb-1`}
                    key={item.id}
                  >
                    {item.name === "Logout" ? (
                      <Link
                        onClick={() => {
                          const { success } = useSignOut();
                        }}
                        href={item.routePath}
                      >
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </Link>
                    ) : (
                      <Link href={item.routePath}>
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default DefaulHeader2;
