import EmployerDashboardLayout from "../EmployerDashboardLayout";
import Notification from "./components/Notification";
import ProfileChart from "./components/ProfileChart";
import TopCardBlock from "./components/TopCardBlock";

const Index = () => {
  return (
    <EmployerDashboardLayout title="Dashboard Home!">
      <div className="row">
        <TopCardBlock />
      </div>
      {/* End .row top card block */}

      <div className="row">
        <div className="col-xl-7 col-lg-12">
          {/* <!-- Graph widget --> */}
          <div className="graph-widget ls-widget">
            <ProfileChart />
          </div>
          {/* End profile chart */}
        </div>
        {/* End .col */}

        <div className="col-xl-5 col-lg-12">
          {/* <!-- Notification Widget --> */}
          <div className="notification-widget ls-widget">
            <div className="widget-title">
              <h4>Notifications</h4>
            </div>
            <div className="widget-content">
              <Notification />
            </div>
          </div>
        </div>
        {/* End .col */}
      </div>
      {/* End .row profile and notificatins */}
    </EmployerDashboardLayout>
  );
};

export default Index;
