"use client";
import {
  setSelectedDatePosted,
  setSelectedJobType,
} from "@/features/job/newJobSlice";
import { getJobTypeOptions } from "@/utils/constants";
import { useJobTypes } from "@/utils/hooks/useOptionsFromFirebase";
import { useDispatch, useSelector } from "react-redux";

export default function JobSelect() {
  const dispatch = useDispatch();
  const { options: jobTypes, loading: jobTypesLoading } = useJobTypes();
  const jobTypeOptions = getJobTypeOptions(jobTypes);
  const { selectedJobType, selectedDatePosted } = useSelector(
    (state) => state.newJob
  );

  const datePostedOptions = [
    { value: "", label: "Elke tijd" },
    { value: "today", label: "Vandaag" },
    { value: "3days", label: "Laatste 3 Dagen" },
    { value: "week", label: "Laatste Week" },
    { value: "month", label: "Laatste Maand" },
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
              disabled={jobTypesLoading}
            >
              <option value="">
                {jobTypesLoading ? "Laden..." : "Functie Type"}
              </option>
              {jobTypeOptions.map((type) => (
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
