"use client";
import Register from "../register/Register";
import FormContentModal from "./FormContentModal";

const LoginPopup = () => {
  // Function to close the modal after successful login
  const handleLoginSuccess = () => {
    console.log("Login success, attempting to close modal");
    if (typeof window !== "undefined") {
      const modalEl = document.getElementById("loginPopupModal");
      if (modalEl) {
        // Find and click the close button - Bootstrap will handle all cleanup
        const closeButton = modalEl.querySelector(
          'button[data-bs-dismiss="modal"]'
        );
        if (closeButton) {
          closeButton.click();
        } else {
          // Fallback: use Bootstrap modal API
          if (window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            if (modal) {
              modal.hide();
            }
          }
        }
      }
    }
  };

  const handleRegisterSuccess = () => {
    console.log("Registration success, attempting to close modal");
    if (typeof window !== "undefined") {
      const modalEl = document.getElementById("registerModal");
      if (modalEl) {
        // Find and click the close button - Bootstrap will handle all cleanup
        const closeButton = modalEl.querySelector(
          'button[data-bs-dismiss="modal"]'
        );
        if (closeButton) {
          closeButton.click();
        } else {
          // Fallback: use Bootstrap modal API
          if (window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            if (modal) {
              modal.hide();
            }
          }
        }
      }
    }
  };

  return (
    <>
      <div className="modal fade" id="loginPopupModal">
        <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable">
          <div className="modal-content">
            <button
              type="button"
              className="closed-modal"
              data-bs-dismiss="modal"
            ></button>
            {/* End close modal btn */}

            <div className="modal-body">
              {/* <!-- Login modal --> */}
              <div id="login-modal">
                {/* <!-- Login Form --> */}
                <div className="login-form default-form">
                  <FormContentModal onLoginSuccess={handleLoginSuccess} />
                </div>
                {/* <!--End Login Form --> */}
              </div>
              {/* <!-- End Login Module --> */}
            </div>
            {/* En modal-body */}
          </div>
          {/* End modal-content */}
        </div>
      </div>
      {/* <!-- Login Popup Modal --> */}

      <div className="modal fade" id="registerModal">
        <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable">
          <div className="modal-content">
            <button
              type="button"
              className="closed-modal"
              data-bs-dismiss="modal"
            ></button>
            {/* End close modal btn */}

            <div className="modal-body">
              {/* <!-- Login modal --> */}
              <div id="login-modal">
                {/* <!-- Login Form --> */}
                <div className="login-form default-form">
                  <Register onRegisterSuccess={handleRegisterSuccess} />
                </div>
                {/* <!--End Login Form --> */}
              </div>
              {/* <!-- End Login Module --> */}
            </div>
            {/* En modal-body */}
          </div>
          {/* End modal-content */}
        </div>
      </div>
      {/* <!-- Login Popup Modal --> */}
    </>
  );
};

export default LoginPopup;
