import { LOGO } from "@/utils/constants";
import Image from "next/image";

const FormContent2 = () => {
  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <h3 className="text-center">Forgot Password</h3>
      {/* <!--Login Form--> */}
      <form method="post">
        <div className="form-group">
          <label>Type your email to reset your password</label>
          <input type="text" name="username" placeholder="Username" required />
        </div>
        {/* name */}

        <div className="form-group">
          <button
            className="theme-btn btn-style-one"
            type="submit"
            name="reset-password"
          >
            Send Reset Link
          </button>
        </div>
        {/* login */}
      </form>
      {/* End form */}

      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default FormContent2;
