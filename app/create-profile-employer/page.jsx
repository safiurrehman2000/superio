import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import PostBoxForm from "@/components/dashboard-pages/employers-dashboard/post-jobs/components/PostBoxForm";
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
      {" "}
      <BreadCrumb title="Post a New Job!" />
      <PostBoxForm />
    </div>
  );
};

export default page;
