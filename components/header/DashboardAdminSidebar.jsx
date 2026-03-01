"use client";

import { adminMenuData } from "@/utils/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { menuToggle } from "@/features/toggle/toggleSlice";
import { useSignOut } from "@/APIs/auth/auth";

const DashboardAdmin = () => {
  const { menu } = useSelector((state) => state.toggle);
  const pathname = usePathname();
  const dispatch = useDispatch();

  const menuToggleHandler = () => {
    dispatch(menuToggle());
  };

  return (
    <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
      <div className="pro-header text-end pb-0 mb-0 show-1023">
        <div className="fix-icon" onClick={menuToggleHandler}>
          <span className="flaticon-close"></span>
        </div>
      </div>

      <div className="sidebar-inner">
        <ul className="navigation">
          {adminMenuData.map((item) => (
            <li
              className={`${
                isActiveLink(item.routePath, pathname) ? "active" : ""
              } mb-1`}
              key={item.id}
              onClick={menuToggleHandler}
            >
              {item.name === "Uitloggen" ? (
                <Link
                  onClick={async (e) => {
                    e.preventDefault();
                    const { success } = await useSignOut();
                    if (success) {
                      window.location.href = item.routePath;
                    }
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
    </div>
  );
};

export default DashboardAdmin;
