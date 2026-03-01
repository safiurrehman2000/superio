'use client';

import Link from 'next/link';
import 'react-circular-progressbar/dist/styles.css';

import { isActiveLink } from '../../utils/linkActiveChecker';

import { candidateMenuData } from '@/utils/constants';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { menuToggle } from '../../features/toggle/toggleSlice';
import { useSignOut } from '@/APIs/auth/auth';

const DashboardCandidatesSidebar = () => {
  const { menu } = useSelector((state) => state.toggle);
  const pathname = usePathname();
  const dispatch = useDispatch();

  const menuToggleHandler = () => {
    dispatch(menuToggle());
  };

  return (
    <div className={`user-sidebar ${menu ? 'sidebar_open' : ''}`}>
      {/* Start sidebar close icon */}
      <div className='pro-header text-end pb-0 mb-0 show-1023'>
        <div className='fix-icon' onClick={menuToggleHandler}>
          <span className='flaticon-close'></span>
        </div>
      </div>
      {/* End sidebar close icon */}

      <div className='sidebar-inner'>
        <ul className='navigation'>
          {candidateMenuData.map((item) => (
            <li
              className={`${
                isActiveLink(item.routePath, pathname) ? 'active' : ''
              } mb-1`}
              key={item.id}
              onClick={menuToggleHandler}
            >
              {item.name === 'Uitloggen' ? (
                <Link
                  onClick={async (e) => {
                    e.preventDefault();
                    const { success } = await useSignOut();
                    if (success) {
                      window.location.href = item.routePath;
                    }
                  }}
                  href={item.routePath}
                >
                  <i className={`la ${item.icon}`}></i> {item.name}
                </Link>
              ) : item.name === 'Profiel Verwijderen' ? (
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent('openDeleteAccountModal'),
                    );
                  }}
                  href={item.routePath}
                >
                  <i className={`la ${item.icon}`}></i> {item.name}
                </Link>
              ) : (
                <Link href={item.routePath}>
                  <i className={`la ${item.icon}`}></i> {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardCandidatesSidebar;
