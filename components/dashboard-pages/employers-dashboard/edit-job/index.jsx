import DefaulHeader2 from '@/components/header/DefaulHeader2';
import LoginPopup from '../../../common/form/login/LoginPopup';
import DashboardEmployerSidebar from '../../../header/DashboardEmployerSidebar';
import MobileMenu from '../../../header/MobileMenu';
import BreadCrumb from '../../BreadCrumb';
import CopyrightFooter from '../../CopyrightFooter';
import MenuToggler from '../../MenuToggler';
import EditEmployerJobForm from './components/EditEmployerJobForm';

const EditJobPage = () => {
  return (
    <div className='page-wrapper dashboard'>
      <LoginPopup />

      <DefaulHeader2 />

      <MobileMenu />

      <DashboardEmployerSidebar />

      <section className='user-dashboard'>
        <div className='dashboard-outer'>
          <BreadCrumb title='Vacature bewerken' />

          <MenuToggler />

          <div className='row'>
            <div className='col-lg-12'>
              <div className='ls-widget'>
                <div className='tabs-box'>
                  <div className='widget-title'>
                    <h4>Vacature bewerken</h4>
                  </div>

                  <div className='widget-content'>
                    <EditEmployerJobForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CopyrightFooter />
    </div>
  );
};

export default EditJobPage;
