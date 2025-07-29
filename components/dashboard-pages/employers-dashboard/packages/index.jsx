import EmployerDashboardLayout from "../EmployerDashboardLayout";
import PackageDataTable from "./components/PackageDataTable";

const index = () => {
  return (
    <EmployerDashboardLayout title="Packages!">
      <div className="row">
        <div className="col-lg-12">
          <div className="ls-widget">
            <div className="tabs-box">
              <div className="widget-title">
                <h4>My Packages</h4>
              </div>
              {/* End widget-title */}

              <div className="widget-content">
                <div className="table-outer">
                  <PackageDataTable />
                </div>
              </div>
              {/* End widget-content */}
            </div>
          </div>
          {/* <!-- Ls widget --> */}
        </div>
      </div>
      {/* End .row */}
    </EmployerDashboardLayout>
  );
};

export default index;
