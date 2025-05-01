"use client";

import Image from "next/image";
import Link from "next/link";
import { IoMdNotificationsOutline } from "react-icons/io";
import HeaderNavContent from "./HeaderNavContent";

const DefaulHeader2 = () => {
  return (
    // <!-- Main Header-->
    <header className="main-header bg-light">
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
                  src="/images/logo-deflexijobber.png"
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

        <div className="outer-box gap-2">
          {/* <!-- Add Listing --> */}
          <Link href="/candidates-dashboard/cv-manager" className="upload-cv">
            Upload your CV
          </Link>
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
          <div className="btn-box">
            <IoMdNotificationsOutline fontSize={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DefaulHeader2;
