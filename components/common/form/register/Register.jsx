"use client";

import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Form from "./FormContent";
import LoginWithSocial from "./LoginWithSocial";

const Register = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <h3 className="text-center">Create your Flexijobber account</h3>

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
          <Form userType="Candidate" />
        </TabPanel>
        {/* End cadidates Form */}

        <TabPanel>
          <Form userType="Employer" />
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
              if (searchParams.get("id")) {
                push(`/login?id=${searchParams.get("id")}`);
              } else push("/login");
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
