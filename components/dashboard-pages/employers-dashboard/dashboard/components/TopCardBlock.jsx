"use client";

import { useFetchApplications, useFetchEmployerJobs } from "@/APIs/auth/jobs";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const TopCardBlock = () => {
  const selector = useSelector((store) => store.user);
  const [jobCount, setJobCount] = useState(0);
  const { applications } = useFetchApplications(selector?.user?.uid);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch data if user ID exists
      if (!selector?.user?.uid) {
        console.warn("TopCardBlock: User ID is undefined, skipping data fetch");
        setJobCount(0);
        return;
      }

      try {
        const jobs = await useFetchEmployerJobs(selector.user.uid);
        setJobCount(jobs?.length || 0);
      } catch (error) {
        console.error("Error fetching jobs in TopCardBlock:", error);
        setJobCount(0);
      }
    };

    fetchData();
  }, [selector?.user?.uid]);

  const cardContent = [
    {
      id: 1,
      icon: "flaticon-briefcase",
      countNumber: jobCount,
      metaName: "Posted Jobs",
      uiClass: "ui-blue",
    },
    {
      id: 2,
      icon: "la-file-invoice",
      countNumber: applications?.length || 0,
      metaName: "Application",
      uiClass: "ui-red",
    },
    {
      id: 3,
      icon: "la-comment-o",
      countNumber: "74",
      metaName: "Messages",
      uiClass: "ui-yellow",
    },
  ];

  return (
    <>
      {cardContent.map((item) => (
        <div
          className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12"
          key={item.id}
        >
          <div className={`ui-item ${item.uiClass}`}>
            <div className="left">
              <i className={`icon la ${item.icon}`}></i>
            </div>
            <div className="right">
              <h4>{item.countNumber}</h4>
              <p>{item.metaName}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopCardBlock;
