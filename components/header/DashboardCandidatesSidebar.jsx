"use client";

import Link from "next/link";
import "react-circular-progressbar/dist/styles.css";

import { isActiveLink } from "../../utils/linkActiveChecker";

import { candidateMenuData } from "@/utils/constants";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { menuToggle } from "../../features/toggle/toggleSlice";
import { useSignOut } from "@/APIs/auth/auth";
import { useState } from "react";
import { useDeleteUserAccount } from "@/APIs/auth/database";

const DashboardCandidatesSidebar = () => {
  const { menu } = useSelector((state) => state.toggle);
  const { push } = useRouter();
  const [showModal, setShowModal] = useState(false);
  const selector = useSelector((store) => store.user);

  const dispatch = useDispatch();
  // menu togggle handler
  const menuToggleHandler = () => {
    dispatch(menuToggle());
  };

  const handleDeleteProfile = () => {
    useDeleteUserAccount(selector.user.uid);
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
          {candidateMenuData.map((item) => (
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
        {/* End navigation */}
      </div>
      {/* Bootstrap Modal for Delete Confirmation */}
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal backdrop */}
      {showModal && <div className="modal-backdrop show fade"></div>}
    </div>
  );
};

export default DashboardCandidatesSidebar;
