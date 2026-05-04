"use client";

import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import EmployerCompanyOnboardingStep from "@/components/onboarding/EmployerCompanyOnboardingStep";
import { LOGO } from "@/utils/constants";
import Image from "next/image";

export default function OnboardCompanyProfilePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <header className="header-shaddow">
        <div className="container-fluid">
          <div className="main-box">
            <div className="nav-outer">
              <div className="logo-box">
                <div className="logo text-center">
                  <Image
                    alt="brand"
                    src={LOGO}
                    width={154}
                    height={50}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <BreadCrumb title="Company information" />
      <EmployerCompanyOnboardingStep />
    </div>
  );
}
