"use client";

import Link from "next/link";
import Image from "next/image";
import jobFeatured from "../../data/job-featured";
import Slider from "react-slick";
import { useState } from "react";
import "slick-carousel/slick/slick.css"; // Ensure slick CSS is imported
import "slick-carousel/slick/slick-theme.css"; // Ensure slick theme CSS is imported

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
    speed: 2000,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    centerMode: false,
    arrows: false,
  };

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
