"use client";

import { adminMenuData } from "@/utils/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { InputField } from "../inputfield/InputField";
import { menuToggle } from "@/features/toggle/toggleSlice";
import { useSignOut } from "@/APIs/auth/auth";
const DashboardAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { menu } = useSelector((state) => state.toggle);
  const [showModal, setShowModal] = useState(false);
  const selector = useSelector((store) => store.user);
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      password: "",
    },
  });
  const { handleSubmit } = methods;
  const dispatch = useDispatch();
  // menu togggle handler
  const menuToggleHandler = () => {
    dispatch(menuToggle());
  };

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

  return (
    <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
      {/* Start sidebar close icon */}
      <div className="pro-header text-end pb-0 mb-0 show-1023">
        <div className="fix-icon" onClick={menuToggleHandler}>
          <span className="flaticon-close"></span>
        </div>
      </div>
      {/* End sidebar close icon */}

      <div className="sidebar-inner">
        <ul className="navigation">
          {adminMenuData.map((item) => (
            <li
              className={`${
                isActiveLink(item.routePath, usePathname()) ? "active" : ""
              } mb-1`}
              key={item.id}
              onClick={menuToggleHandler}
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
      </div>
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
                Confirm Profile Deletion
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete your profile? This action cannot
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
                      "Delete Profile"
                    )}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop show fade"></div>}
    </div>
  );
};

export default DashboardAdmin;
