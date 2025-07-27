"use client";

import { useSignOut } from "@/APIs/auth/auth";
import {
  adminMenuData,
  candidateMenuData,
  employerMenuData,
  LOGO,
} from "@/utils/constants";
import { isActiveLink } from "@/utils/linkActiveChecker";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { reauthenticateUser, useDeleteUserAccount } from "@/APIs/auth/database";
import { errorToast } from "@/utils/toast";
import CircularLoader from "../circular-loading/CircularLoading";
import { InputField } from "../inputfield/InputField";
import HeaderNavContent from "./HeaderNavContent";

const DefaulHeader2 = () => {
  const selector = useSelector((store) => store.user);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      password: "",
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = async (data) => {
    if (!selector.user) {
      errorToast("Please login to delete your account");
      return;
    }
    try {
      const { success } = await reauthenticateUser(
        selector.user?.email,
        data?.password,
        setLoading
      );
      if (success) {
        await useDeleteUserAccount(selector.user?.uid);
      }
    } catch (err) {
      console.error("Account deletion process failed:", err);
    }
  };

  const logoSrc = selector.user?.logo
    ? selector.user.logo.startsWith("data:image")
      ? selector.user.logo // Already a Data URL
      : `data:image/jpeg;base64,${selector.user.logo}` // Prepend JPEG prefix
    : "/images/resource/company-6.png"; // Fallback image

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
              {selector.user?.logo ? (
                <Image
                  alt="avatar"
                  className="thumb"
                  src={logoSrc}
                  width={50}
                  height={50}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Image
                  alt="avatar"
                  className="thumb"
                  src="/images/resource/company-6.png"
                  width={50}
                  height={50}
                />
              )}
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
                    ) : item.name === "Delete Profile" ? (
                      <Link
                        onClick={(e) => {
                          e.preventDefault();
                          setShowModal(true);
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
            ) : selector.userType == "Employer" ? (
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
                    ) : item.name === "Delete Profile" ? (
                      <Link
                        onClick={(e) => {
                          e.preventDefault();
                          setShowModal(true);
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
                {adminMenuData?.map((item) => (
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
                    ) : item.name === "Delete Profile" ? (
                      <Link
                        onClick={(e) => {
                          e.preventDefault();
                          setShowModal(true);
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

      {/* Delete Account Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        id="deleteProfileModal"
        tabIndex="-1"
        aria-labelledby="deleteProfileModalLabel"
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteProfileModalLabel">
                Confirm Account Deletion
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </div>
            <FormProvider {...methods}>
              <form className="p-3" onSubmit={handleSubmit(onSubmit)}>
                <InputField
                  name="password"
                  fieldType="Password"
                  label="Enter your password to confirm"
                  required
                  placeholder={"Enter your password"}
                />
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${
                      loading ? "btn-style-three" : "btn btn-danger"
                    } `}
                    style={{ padding: "6px 12px" }}
                  >
                    {loading ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {" "}
                        <CircularLoader />{" "}
                        <p style={{ margin: 0, padding: 0 }}> Deleting.... </p>
                      </div>
                    ) : (
                      "Delete Account"
                    )}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop show fade"></div>}
    </header>
  );
};

export default DefaulHeader2;
