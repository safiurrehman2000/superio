"use client";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
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
  const pathname = usePathname();
  const { user, userType } = useSelector((state) => state.user);

  // Filter menu items based on user type and authentication status
  const filteredMenuData = mobileMenuData
    .map((item) => {
      // For Account section, filter items based on authentication status
      if (item.label === "Account") {
        return {
          ...item,
          items: item.items.filter((menuItem) => {
            if (user) {
              return menuItem.showWhenLoggedIn;
            } else {
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
    .filter(Boolean);

  const handleMenuItemClick = (menuItem, event) => {
    if (menuItem.isAction && menuItem.routePath === "delete-account") {
      event?.preventDefault();
      event?.stopPropagation();
      window.dispatchEvent(new CustomEvent("openDeleteAccountModal"));
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
                isActiveParentChaild(item.items, pathname)
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
                    isActiveLink(menuItem.routePath, pathname)
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
    </div>
  );
};

export default Index;
