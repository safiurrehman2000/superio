"use client";
import { useDispatch, useSelector } from "react-redux";
import {
  addDatePosted,
  addJobTypeSelect,
  addSalary,
  addTag,
  clearTags,
} from "../../../features/filter/filterSlice";

export default function JobSelect() {
  const { jobList } = useSelector((state) => state.filter);
  const { jobTypeList, datePost, tags } = useSelector((state) => state.job);

  const dispatch = useDispatch();

  // Job type handler
  const jobTypeHandler = (e) => {
    dispatch(addJobTypeSelect(e.target.value));
  };

  // Date post handler
  const datePostHandler = (e) => {
    dispatch(addDatePosted(e.target.value));
  };

  // Salary handler
  const salaryHandler = (e) => {
    const data = JSON.parse(e.target.value);
    dispatch(addSalary(data));
  };

  // Tag handler
  const tagHandler = (tagValue) => {
    dispatch(addTag(tagValue));
  };

  // Clear tags handler
  const clearTagsHandler = () => {
    dispatch(clearTags());
  };

  return (
    <>
      <div className="showing-result">
        <div className="top-filters">
          <div className="form-group">
            <select
              onChange={jobTypeHandler}
              className="chosen-single form-select"
              value={jobList?.jobTypeSelect || ""}
            >
              <option value="">Job Type</option>
              {jobTypeList?.map((item) => (
                <option value={item.value} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {/* End job type filter */}

          <div className="form-group">
            <select
              onChange={datePostHandler}
              className="chosen-single form-select"
              value={jobList?.datePosted || ""}
            >
              {datePost?.map((item) => (
                <option value={item.value} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {/* End date posted filter */}

          <div className="form-group">
            <select
              onChange={salaryHandler}
              className="chosen-single form-select"
              value={
                JSON.stringify(jobList?.salary) ||
                JSON.stringify({ min: 0, max: 20000 })
              }
            >
              <option
                value={JSON.stringify({
                  min: 0,
                  max: 20000,
                })}
              >
                Salary estimate
              </option>
              <option
                value={JSON.stringify({
                  min: 0,
                  max: 5000,
                })}
              >
                0 - 5000
              </option>
              <option
                value={JSON.stringify({
                  min: 5000,
                  max: 10000,
                })}
              >
                5000 - 10000
              </option>
              <option
                value={JSON.stringify({
                  min: 10000,
                  max: 15000,
                })}
              >
                10000 - 15000
              </option>
              <option
                value={JSON.stringify({
                  min: 15000,
                  max: 20000,
                })}
              >
                15000 - 20000
              </option>
            </select>
          </div>
          {/* End salary estimate filter */}

          <div className="form-group">
            <select
              onChange={(e) => tagHandler(e.target.value)}
              className="chosen-single form-select"
              value={jobList?.tag[0] || ""} // Use the first selected tag or empty string if none
            >
              <option value="">All Tags</option>
              {tags?.map((tag) => (
                <option key={tag.id} value={tag.value}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          {/* End tag filter */}
        </div>
      </div>
    </>
  );
}
