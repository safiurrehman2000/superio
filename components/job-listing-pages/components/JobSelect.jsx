"use client";
import {
  setSelectedDatePosted,
  setSelectedJobType,
} from "@/features/job/newJobSlice";
import { JOB_TYPE_OPTIONS } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";

export default function JobSelect() {
  const dispatch = useDispatch();
  const { selectedJobType, selectedDatePosted } = useSelector(
    (state) => state.newJob
  );

  const datePostedOptions = [
    { value: "", label: "Any Time" },
    { value: "today", label: "Today" },
    { value: "3days", label: "Last 3 Days" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
  ];

  const popularTags = [
    "remote",
    "urgent",
    "flexible",
    "manager",
    "developer",
    "designer",
    "marketing",
    "sales",
    "entry-level",
    "senior",
  ];

  return (
    <>
      <div className="showing-result">
        <div className="top-filters">
          <div className="form-group">
            <select
              className="chosen-single form-select"
              value={selectedJobType}
              onChange={(e) => dispatch(setSelectedJobType(e.target.value))}
            >
              <option value="">Job Type</option>
              {JOB_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {/* End job type filter */}

          <div className="form-group">
            <select
              className="chosen-single form-select"
              value={selectedDatePosted}
              onChange={(e) => dispatch(setSelectedDatePosted(e.target.value))}
            >
              {datePostedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* End date posted filter */}
        </div>
      </div>
    </>
  );
}
