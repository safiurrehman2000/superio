"use client";
import { setLocationTerm } from "@/features/job/newJobSlice";
import { useDispatch } from "react-redux";

const LocationBox = () => {
  const dispatch = useDispatch();

  const handleLocationChange = (e) => {
    dispatch(setLocationTerm(e.target.value));
  };

  return (
    <>
      <input
        type="text"
        name="listing-search"
        placeholder="City or postcode"
        onChange={handleLocationChange}
        className="location-search-input"
      />
      <span className="icon flaticon-map-locator"></span>
    </>
  );
};

export default LocationBox;
