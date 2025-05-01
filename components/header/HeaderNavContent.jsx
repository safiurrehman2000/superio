"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  blogItems,
  candidateItems,
  employerItems,
} from "../../data/mainMenuData";
import {
  isActiveLink,
  isActiveParent,
  isActiveParentChaild,
} from "../../utils/linkActiveChecker";

import "@/styles/customStyles.css";

const HeaderNavContent = () => {
  const pathname = usePathname(); // Get the current pathname

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
              Home
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
              Find Jobs
            </Link>
          </li>
          {/* End findjobs menu items */}

          <li
            className={`${
              isActiveParent(employerItems, usePathname()) ||
              usePathname()?.split("/")[1] === "employers-dashboard"
                ? "current"
                : ""
            } dropdown`}
          >
            <span>Employers</span>
            <ul>
              {employerItems.map((item) => (
                <li className="dropdown" key={item.id}>
                  <span
                    className={
                      isActiveParentChaild(item.items, usePathname())
                        ? "current"
                        : ""
                    }
                  >
                    {item.title}
                  </span>
                  <ul>
                    {item.items.map((menu, i) => (
                      <li
                        className={
                          isActiveLink(menu.routePath, usePathname())
                            ? "current"
                            : ""
                        }
                        key={i}
                      >
                        <Link href={menu.routePath}>{menu.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li
                className={
                  usePathname()?.includes("/employers-dashboard")
                    ? "current"
                    : ""
                }
              >
                <Link href="/employers-dashboard/dashboard">
                  Employers Dashboard
                </Link>
              </li>
            </ul>
          </li>
          {/* End Employers menu items */}

          <li
            className={`${
              isActiveParent(candidateItems, usePathname()) ||
              usePathname()?.split("/")[1] === "candidates-dashboard"
                ? "current"
                : ""
                ? "current"
                : ""
            } dropdown`}
          >
            <span>Candidates</span>
            <ul>
              {candidateItems.map((item) => (
                <li className="dropdown" key={item.id}>
                  <span
                    className={
                      isActiveParentChaild(item.items, usePathname())
                        ? "current"
                        : ""
                    }
                  >
                    {item.title}
                  </span>
                  <ul>
                    {item.items.map((menu, i) => (
                      <li
                        className={
                          isActiveLink(menu.routePath, usePathname())
                            ? "current"
                            : ""
                        }
                        key={i}
                      >
                        <Link href={menu.routePath}>{menu.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li
                className={
                  usePathname()?.includes("/candidates-dashboard/")
                    ? "current"
                    : ""
                }
              >
                <Link href="/candidates-dashboard/dashboard">
                  Candidates Dashboard
                </Link>
              </li>
            </ul>
          </li>
          {/* End Candidates menu items */}

          <li className={`${pathname === "/pricing" ? "current" : ""}`}>
            <Link
              className={`header-nav-list ${
                pathname === "/pricing" ? "header-nav-border-b" : ""
              }`}
              href="/pricing"
            >
              Pricing
            </Link>
          </li>
          <li className={`${pathname === "/faq" ? "current" : ""}`}>
            <Link
              className={`header-nav-list ${
                pathname === "/faq" ? "header-nav-border-b" : ""
              }`}
              href="/faq"
            >
              FAQs
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default HeaderNavContent;
