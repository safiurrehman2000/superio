import { nextStep, prevStep } from "@/slices/stepperSlice";
import { useDispatch } from "react-redux";

const SocialNetworkBox = () => {
  const dispatch = useDispatch();

  const handleStep = () => {
    dispatch(nextStep());
  };
  const handleBack = () => {
    dispatch(prevStep());
  };
  return (
    <form className="default-form">
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Facebook</label>
          <input
            type="text"
            name="name"
            placeholder="www.facebook.com/Invision"
            required
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Twitter</label>
          <input type="text" name="name" placeholder="" required />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Linkedin</label>
          <input type="text" name="name" placeholder="" required />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Google Plus</label>
          <input type="text" name="name" placeholder="" required />
        </div>

        {/* <!-- Input --> */}
        <div
          className="form-group col-md-12"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <button onClick={handleBack} className="theme-btn btn-style-three">
            Back
          </button>
          <button onClick={handleStep} className="theme-btn btn-style-one">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

export default SocialNetworkBox;
