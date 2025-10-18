// components/LocationBox.js
"use client";
import { setLocationTerm } from "@/features/job/newJobSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LocationBox = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const jobs = useSelector((state) => state.newJob.jobs);
  const [locationValue, setLocationValue] = useState("");

  useEffect(() => {
    const urlProvince = searchParams.get("province");
    if (urlProvince && jobs.length > 0) {
      setLocationValue(urlProvince);
      dispatch(setLocationTerm(urlProvince));
    }
  }, [searchParams, jobs, dispatch]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationValue(value);
    dispatch(setLocationTerm(value));
  };

  return (
    <>
      <input
        type="text"
        name="listing-search"
        placeholder="Stad of postcode"
        value={locationValue}
        onChange={handleLocationChange}
        className="location-search-input"
      />
      <span className="icon flaticon-map-locator"></span>
    </>
  );
};

export default LocationBox;
