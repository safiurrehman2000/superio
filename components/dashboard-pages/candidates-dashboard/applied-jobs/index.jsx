import CandidateDashboardLayout from "../CandidateDashboardLayout";
import JobListingsTable from "./components/JobListingsTable";

const index = () => {
  return (
    <CandidateDashboardLayout title="Applied jobs!">
      <div className="row">
        <div className="col-lg-12">
          {/* <!-- Ls widget --> */}
          <div className="ls-widget">
            <JobListingsTable />
          </div>
        </div>
      </div>
      {/* End .row */}
    </CandidateDashboardLayout>
  );
};

export default index;
