// components/SearchBox.js
"use client";
import { setSearchTerm } from "@/features/job/newJobSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchBox = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const jobs = useSelector((state) => state.newJob.jobs);

  useEffect(() => {
    const urlSearchTerm = searchParams.get("job_title");
    if (urlSearchTerm && jobs.length > 0) {
      setSearchValue(urlSearchTerm);
      dispatch(setSearchTerm(urlSearchTerm));
    }
  }, [searchParams, jobs, dispatch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    dispatch(setSearchTerm(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      newParams.set("job_title", searchValue);
    } else {
      newParams.delete("job_title");
    }
    router.push(`?${newParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="search-box">
      <input
        type="text"
        name="listing-search"
        placeholder="Functie, sleutelwoorden, of bedrijf"
        value={searchValue}
        onChange={handleSearch}
      />
      <span className="icon flaticon-search-3"></span>
    </form>
  );
};

export default SearchBox;
