"use client";

import { useDispatch, useSelector } from "react-redux";
import { setPagination } from "@/features/job/newJobSlice";

const ListingShowing = () => {
  const dispatch = useDispatch();
  const { filteredJobs, pagination } = useSelector((state) => state.newJob);
  const totalJobs = filteredJobs?.length || 0;
  const showingCount = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    totalJobs
  );
  const percentage = Math.min(100, (showingCount / totalJobs) * 100);

  const handleShowMore = () => {
    // If we're about to show all jobs, set itemsPerPage to Infinity
    if (pagination.itemsPerPage + 10 >= totalJobs) {
      dispatch(
        setPagination({
          ...pagination,
          itemsPerPage: Infinity,
          currentPage: 1,
        })
      );
    } else {
      const newItemsPerPage = pagination.itemsPerPage + 10;
      dispatch(
        setPagination({
          ...pagination,
          itemsPerPage: newItemsPerPage,
        })
      );
    }
  };

  if (pagination.itemsPerPage === Infinity || showingCount >= totalJobs) {
    return null;
  }

  return (
    <div className="ls-show-more">
      <p>
        Showing {showingCount} of {totalJobs} Jobs
      </p>
      <div className="bar">
        <span className="bar-inner" style={{ width: `${percentage}%` }}></span>
      </div>
      <button className="show-more" onClick={handleShowMore}>
        {totalJobs - showingCount <= 10
          ? "Show All"
          : `Show More (+${Math.min(10, totalJobs - showingCount)})`}
      </button>
    </div>
  );
};

export default ListingShowing;
