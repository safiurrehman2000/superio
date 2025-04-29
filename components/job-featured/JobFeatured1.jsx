"use client";

import Link from "next/link";
import Image from "next/image";
import jobFeatured from "../../data/job-featured";
import Slider from "react-slick";
import { useState } from "react";

const JobFeatured1 = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState({});

  const toggleBookmark = (jobId) => {
    setBookmarkedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const settings = {
    dots: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    centerMode: true,
    centerPadding: "0px",
    arrows: false,
  };

  return (
    <div
      className="testimonial-carousel gap-x25 center-item-active slick-list-visible"
      data-aos="fade-up"
    >
      <Slider {...settings}>
        {jobFeatured.slice(0, 6).map((item) => (
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
                  <Link href={`/job-single-v1/${item.id}`}>
                    {item.jobTitle}
                  </Link>
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
                    {item.time}
                  </li>
                  <li>
                    <span className="icon flaticon-money"></span>
                    {item.salary}
                  </li>
                </ul>
                <ul className="job-other-info">
                  {item.jobType.map((val, i) => (
                    <li key={i} className={`${val.styleClass}`}>
                      {val.type}
                    </li>
                  ))}
                </ul>
                {/* TODO: button color green has to be implemented when a job is
                bookmarked */}
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
