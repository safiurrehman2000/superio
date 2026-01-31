import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import PostBoxForm from "@/components/dashboard-pages/employers-dashboard/post-jobs/components/PostBoxForm";
import SkipOnboardingLink from "@/components/common/SkipOnboardingLink";
import React from "react";

const page = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <BreadCrumb title="Post a New Job!" />
      <SkipOnboardingLink />
      <PostBoxForm />
    </div>
  );
};

export default page;
