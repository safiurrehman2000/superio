import Categories from "../components/Categories";
import JobSelect from "../components/JobSelect";
import LocationBox from "../components/LocationBox";
import SearchBox from "../components/SearchBox";
import "@/styles/customStyles.css";
const JobSearchForm = () => {
  return (
    <>
      <div className="job-search-form job-filter">
        <div className="row">
          <div className="form-group col-lg-4 col-md-12 col-sm-12">
            <SearchBox />
          </div>
          {/* <!-- Form Group --> */}

          <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
            <LocationBox />
          </div>
          {/* <!-- Form Group --> */}

          <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
            <Categories />
          </div>
          {/* <!-- Form Group --> */}

          <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
            <button type="submit" className="theme-btn btn-style-one">
              Find Jobs
            </button>
          </div>
          {/* <!-- Form Group --> */}
        </div>
      </div>

      <JobSelect />
    </>
  );
};

export default JobSearchForm;
