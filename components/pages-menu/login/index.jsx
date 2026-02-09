import FormContent from "../../common/form/login/FormContent";

const index = () => {
  return (
    <>
      <div className="login-section">
        <div
          className="image-layer"
          style={{ backgroundImage: "url(/images/background/15.png)" }}
        ></div>
        <div className="outer-box">
          {/* <!-- Login Form --> */}
          <div className="login-form default-form">
            <FormContent />
          </div>
          {/* <!--End Login Form --> */}
        </div>
      </div>
      {/* <!-- End Info Section --> */}
    </>
  );
};

export default index;
