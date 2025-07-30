"use client";

import Link from "next/link";
import Image from "next/image";

import Slider from "react-slick";
import { useState } from "react";
import "slick-carousel/slick/slick.css"; // Ensure slick CSS is imported
import "slick-carousel/slick/slick-theme.css"; // Ensure slick theme CSS is imported
import { useGetJobListingPaginated } from "@/APIs/auth/jobs";

const JobFeatured1 = () => {
  const { data: jobFeatured, loading } = useGetJobListingPaginated({
    page: 1,
    limit: 6,
    status: "active",
  });
  const [bookmarkedJobs, setBookmarkedJobs] = useState({});

  const toggleBookmark = (jobId) => {
    setBookmarkedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const settings = {
    dots: true,
    speed: 2000,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    centerMode: false,
    arrows: false,
  };

  const jobsArray = Array.isArray(jobFeatured) ? jobFeatured : [];

  if (loading) {
    return <div>Loading featured jobs...</div>;
  }

  return (
    <div
      className="testimonial-carousel gap-x25 slick-list-visible"
      data-aos="fade-up"
    >
      <style jsx>{`
        .job-block {
          transition: transform 0.3s ease;
        }
        .job-block .inner-box {
          transition: transform 0.3s ease;
        }
        .job-block:hover .inner-box {
          transform: scale(1.1);
          z-index: 10;
          position: relative;
          border: 1px solid #0074e1;
        }
        .bookmark-btn.bookmarked {
          color: #fa5508;
        }
      `}</style>

      <Slider {...settings}>
        {jobsArray?.map((item) => (
          <div className="job-block" key={item.id}>
            <div className="inner-box">
              <div className="content">
                <span className="company-logo">
                  <Image
                    width={50}
                    height={49}
                    src={item.logo}
                    alt="item brand"
                  />
                </span>
                <h4>
                  <Link href={`/job-list/${item.id}`}>{item.jobTitle}</Link>
                </h4>
                <ul className="job-info">
                  <li>
                    <span className="icon flaticon-briefcase"></span>
                    {item.company}
                  </li>
                  <li>
                    <span className="icon flaticon-map-locator"></span>
                    {item.location}
                  </li>
                  <li>
                    <span className="icon flaticon-clock-3"></span>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </li>
                  <li>
                    <span className="icon flaticon-money"></span>
                    {item.salary || "Not specified"}
                  </li>
                </ul>
                <ul className="job-other-info">
                  {item.tags?.map((val, i) => (
                    <li
                      key={i}
                      className={`${
                        i % 3 === 0
                          ? "time"
                          : i % 3 === 1
                          ? "privacy"
                          : "required"
                      }`}
                    >
                      {val}
                    </li>
                  ))}
                </ul>
                <button
                  className={`bookmark-btn ${
                    bookmarkedJobs[item.id] ? "bookmarked" : ""
                  }`}
                  onClick={() => toggleBookmark(item.id)}
                  aria-label={
                    bookmarkedJobs[item.id] ? "Remove bookmark" : "Add bookmark"
                  }
                >
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default JobFeatured1;
