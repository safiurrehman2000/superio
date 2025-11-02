"use client";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { reauthenticateUser, useDeleteUserAccount } from "@/APIs/auth/database";
import { errorToast } from "@/utils/toast";
import CircularLoader from "../../circular-loading/CircularLoading";
import { InputField } from "../../inputfield/InputField";
import { useSignOut } from "@/APIs/auth/auth";

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
      errorToast("Log in om uw account te verwijderen");
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

  // Filter menu items based on user type and authentication status
  const filteredMenuData = mobileMenuData
    .map((item) => {
      // For Account section, filter items based on authentication status
      if (item.label === "Account") {
        return {
          ...item,
          items: item.items.filter((menuItem) => {
            if (user) {
              // User is logged in - show items with showWhenLoggedIn flag
              return menuItem.showWhenLoggedIn;
            } else {
              // User is not logged in - show items with showWhenLoggedOut flag
              return menuItem.showWhenLoggedOut;
            }
          }),
        };
      }

      // For other sections, apply the existing filtering logic
      if (!user) {
        return item.label !== "Werkgever Dashboard" &&
          item.label !== "Kandidaat Dashboard"
          ? item
          : null;
      }

      if (userType === "Candidate") {
        return item.label !== "Werkgever Dashboard" ? item : null;
      }

      if (userType === "Employer") {
        return item.label !== "Kandidaat Dashboard" ? item : null;
      }

      return item;
    })
    .filter(Boolean); // Remove null items

  const handleMenuItemClick = (menuItem, event) => {
    if (menuItem.isAction && menuItem.routePath === "delete-account") {
      event?.preventDefault();
      event?.stopPropagation();
      setShowModal(true);
    } else if (menuItem.isAction && menuItem.name === "Uitloggen") {
      event?.preventDefault();
      event?.stopPropagation();
      useSignOut();
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
                Account Verwijdering Bevestigen
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Sluiten"
              ></button>
            </div>
            <div className="modal-body">
              Weet je zeker dat je je account wilt verwijderen? Deze actie kan
              niet ongedaan worden gemaakt.
            </div>
            <FormProvider {...methods}>
              <form className="p-3" onSubmit={handleSubmit(onSubmit)}>
                <InputField
                  name="password"
                  fieldType="Password"
                  label="Voer je wachtwoord in om te bevestigen"
                  required
                  placeholder={"Voer je wachtwoord in"}
                />
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Annuleren
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
                        <p style={{ margin: 0, padding: 0 }}>
                          {" "}
                          Verwijderen....{" "}
                        </p>
                      </div>
                    ) : (
                      "Account Verwijderen"
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
