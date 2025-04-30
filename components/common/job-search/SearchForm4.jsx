"use client";

import { useRouter } from "next/navigation";

const SearchForm4 = () => {
  const router = useRouter();
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form onClick={handleSubmit}>
      <div className="row">
        {/* <!-- Form Group: Job Title --> */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12">
          <span className="icon flaticon-search-1"></span>
          <input
            type="text"
            name="job_title"
            placeholder="Job title, keywords, or company"
          />
        </div>

        {/* <!-- Form Group: Location --> */}
        <div className="form-group col-lg-3 col-md-6 col-sm-12 location">
          <span className="icon flaticon-map-locator"></span>
          <input type="text" name="location" placeholder="City or postcode" />
        </div>

        {/* <!-- Form Group: Salary Range (New) --> */}
        <div className="form-group col-lg-2 col-md-6 col-sm-12">
          <span className="icon flaticon-map-locator"></span>
          <input type="text" name="Province" placeholder="Province" />
        </div>

        {/* <!-- Form Group: Category --> */}
        <div className="form-group col-lg-2 col-md-6 col-sm-12 category">
          <span className="icon flaticon-briefcase"></span>
          <select className="chosen-single form-select">
            <option value="">All Categories</option>
            <option value="44">Accounting / Finance</option>
            <option value="106">Automotive Jobs</option>
            <option value="46">Customer</option>
            <option value="48">Design</option>
            <option value="47">Development</option>
            <option value="45">Health and Care</option>
            <option value="105">Marketing</option>
            <option value="107">Project Management</option>
          </select>
        </div>

        {/* <!-- Form Group: Submit Button --> */}
        <div className="form-group col-lg-2 col-md-6 col-sm-12 text-right">
          <button
            type="submit"
            className="theme-btn btn-style-one"
            onClick={() => router.push("/job-list-v6")}
          >
            Find Jobs
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm4;
