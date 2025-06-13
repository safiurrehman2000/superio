"use client";

import { useGetRecentApplications } from "@/APIs/auth/database";
import { useSelector } from "react-redux";

const Notification = () => {
  const selector = useSelector((store) => store.user);
  const { applications, loading } = useGetRecentApplications(
    selector?.user?.uid
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (applications.length === 0) {
    return <div>No recent applications</div>;
  }

  return (
    <ul className="notification-list">
      {applications.map((application) => (
        <li
          key={application.id}
          className={application.status === "Accepted" ? "success" : ""}
        >
          <span className="icon flaticon-briefcase"></span>
          <strong>{application.candidateName}</strong> applied for a job
          <span className="colored"> {application.jobTitle}</span>
        </li>
      ))}
    </ul>
  );
};

export default Notification;
