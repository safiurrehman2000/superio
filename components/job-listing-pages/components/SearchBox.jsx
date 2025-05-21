// components/SearchBox.js
"use client";
import { setSearchTerm } from "@/features/job/newJobSlice";
import { useDispatch } from "react-redux";

const SearchBox = () => {
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <div className="search-box">
      <input
        type="text"
        name="listing-search"
        placeholder="Job title, keywords, or company"
        onChange={handleSearch}
      />
      <span className="icon flaticon-search-3"></span>
    </div>
  );
};

export default SearchBox;
