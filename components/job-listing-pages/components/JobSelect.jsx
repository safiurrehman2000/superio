"use client";
import {
  setMaxDistanceKm,
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
  const { selectedJobType, selectedDatePosted, maxDistanceKm } = useSelector(
    (state) => state.newJob
  );

  const datePostedOptions = [
    { value: "", label: "Elke tijd" },
    { value: "today", label: "Vandaag" },
    { value: "3days", label: "Laatste 3 Dagen" },
    { value: "week", label: "Laatste Week" },
    { value: "month", label: "Laatste Maand" },
  ];

  const distanceOptions = [
    { value: 0, label: "Elke afstand" },
    { value: 5, label: "Binnen 5 km" },
    { value: 10, label: "Binnen 10 km" },
    { value: 25, label: "Binnen 25 km" },
    { value: 50, label: "Binnen 50 km" },
    { value: 100, label: "Binnen 100 km" },
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

          <div className="form-group">
            <select
              className="chosen-single form-select"
              value={maxDistanceKm || 0}
              onChange={(e) =>
                dispatch(setMaxDistanceKm(Number(e.target.value)))
              }
            >
              {distanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* End distance filter */}
        </div>
      </div>
    </>
  );
}
