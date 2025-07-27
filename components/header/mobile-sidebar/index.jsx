"use client";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { reauthenticateUser, useDeleteUserAccount } from "@/APIs/auth/database";
import { errorToast } from "@/utils/toast";
import CircularLoader from "../../circular-loading/CircularLoading";
import { InputField } from "../../inputfield/InputField";

import mobileMenuData from "../../../data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import {
  isActiveLink,
  isActiveParentChaild,
} from "../../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const Index = () => {
  const router = useRouter();
  const { user, userType } = useSelector((state) => state.user);
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
    if (!user) {
      errorToast("Please login to delete your account");
      return;
    }
    try {
      const { success } = await reauthenticateUser(
        user?.email,
        data?.password,
        setLoading
      );
      if (success) {
        await useDeleteUserAccount(user?.uid);
      }
    } catch (err) {
      console.error("Account deletion process failed:", err);
    }
  };

  // Filter menu items based on user type
  const filteredMenuData = mobileMenuData.filter((item) => {
    // If user is not logged in, show all sections except dashboard sections
    if (!user) {
      return (
        item.label !== "Employer Dashboard" &&
        item.label !== "Candidate Dashboard"
      );
    }

    // If user is logged in as candidate, hide employer dashboard
    if (userType === "Candidate") {
      return item.label !== "Employer Dashboard";
    }

    // If user is logged in as employer, hide candidate dashboard
    if (userType === "Employer") {
      return item.label !== "Candidate Dashboard";
    }

    // Default case: show all sections
    return true;
  });

  const handleMenuItemClick = (menuItem, event) => {
    if (menuItem.isAction && menuItem.routePath === "delete-account") {
      event?.preventDefault();
      event?.stopPropagation();
      setShowModal(true);
    } else {
      router.push(menuItem.routePath);
    }
  };

  return (
    <div
      className="offcanvas offcanvas-start mobile_menu-contnet"
      tabIndex="-1"
      id="offcanvasMenu"
      data-bs-scroll="true"
    >
      <SidebarHeader />
      {/* End pro-header */}
      <Sidebar>
        <Menu>
          {filteredMenuData.map((item) => (
            <SubMenu
              className={
                isActiveParentChaild(item.items, usePathname())
                  ? "menu-active"
                  : ""
              }
              label={item.label}
              key={item.id}
            >
              {item.items.map((menuItem, i) => (
                <MenuItem
                  onClick={(event) => handleMenuItemClick(menuItem, event)}
                  className={
                    isActiveLink(menuItem.routePath, usePathname())
                      ? "menu-active-link"
                      : ""
                  }
                  key={i}
                >
                  {menuItem.name}
                </MenuItem>
              ))}
            </SubMenu>
          ))}
        </Menu>
      </Sidebar>

      <SidebarFooter />

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
    </div>
  );
};

export default Index;
