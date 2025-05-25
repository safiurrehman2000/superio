"use client";
import { setSelectedCategory } from "@/features/job/newJobSlice";
import { SECTORS } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Categories = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const jobs = useSelector((state) => state.newJob.jobs);
  const selectedCategory = useSelector(
    (state) => state.newJob.selectedCategory
  );
  const [categoryValue, setCategoryValue] = useState(selectedCategory || "");

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && jobs.length > 0) {
      setCategoryValue(urlCategory);
      dispatch(setSelectedCategory(urlCategory));
    }
  }, [searchParams, jobs, dispatch]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryValue(value);
    dispatch(setSelectedCategory(value));
  };

  return (
    <>
      <select
        className="form-select"
        value={categoryValue}
        onChange={handleCategoryChange}
      >
        <option value="">Choose a category</option>
        {SECTORS.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <span className="icon flaticon-briefcase"></span>
    </>
  );
};

export default Categories;
