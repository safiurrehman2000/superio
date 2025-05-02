"use client";

import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Form from "./FormContent";
import LoginWithSocial from "./LoginWithSocial";
import Image from "next/image";
import { LOGO } from "@/utils/constants";

const Register = () => {
  const { push } = useRouter();
  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <h3>Create your Flexijobber account</h3>

      <Tabs>
        <div className="form-group register-dual">
          <TabList className="btn-box row">
            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-user"></i> Candidate
              </button>
            </Tab>

            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-briefcase"></i> Employer
              </button>
            </Tab>
          </TabList>
        </div>
        {/* End .form-group */}

        <TabPanel>
          <Form />
        </TabPanel>
        {/* End cadidates Form */}

        <TabPanel>
          <Form />
        </TabPanel>
        {/* End Employer Form */}
      </Tabs>
      {/* End form-group */}

      <div className="bottom-box">
        <div className="text d-flex justify-content-center">
          Already have an account?&nbsp;
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              push("/login");
            }}
          >
            Login
          </div>
        </div>
        <div className="divider">
          <span>or</span>
        </div>
        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default Register;
