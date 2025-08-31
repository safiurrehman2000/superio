"use client";

import { useSectors } from "@/utils/hooks/useOptionsFromFirebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchForm4 = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    job_title: "",
    province: "",
    category: "",
  });

  // Fetch sectors from Firebase
  const { options: sectors, loading: sectorsLoading } = useSectors();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Construct query string
    const query = new URLSearchParams();
    if (searchParams.job_title)
      query.append("job_title", searchParams.job_title);
    if (searchParams.province) query.append("province", searchParams.province);
    if (searchParams.category) query.append("category", searchParams.category);

    router.push(`/job-list?${query.toString()}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Job Title */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12">
          <span className="icon flaticon-search-1"></span>
          <input
            type="text"
            name="job_title"
            placeholder="Job title, keywords, or company"
            value={searchParams.job_title}
            onChange={handleInputChange}
          />
        </div>

        {/* Province */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12">
          <span className="icon flaticon-map-locator"></span>
          <input
            type="text"
            name="province"
            placeholder="Province"
            value={searchParams.province}
            onChange={handleInputChange}
          />
        </div>

        {/* Category */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12 category">
          <span className="icon flaticon-briefcase"></span>
          <select
            className="chosen-single form-select"
            name="category"
            value={searchParams.category}
            onChange={handleInputChange}
            disabled={sectorsLoading}
          >
            <option value="">
              {sectorsLoading ? "Loading categories..." : "Choose a category"}
            </option>
            {sectors.map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12 text-right">
          <button type="submit" className="theme-btn btn-style-one">
            Find Jobs
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm4;
