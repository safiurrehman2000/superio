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
            placeholder="Functie, sleutelwoorden, of bedrijf"
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
            placeholder="Provincie"
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
            placeholder="Kies een categorie"
            value={searchParams.category}
            onChange={handleInputChange}
            disabled={sectorsLoading}
          >
            <option value="">
              {sectorsLoading ? "Loading categories..." : "Kies een categorie"}
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
            Vacatures zoeken
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm4;
