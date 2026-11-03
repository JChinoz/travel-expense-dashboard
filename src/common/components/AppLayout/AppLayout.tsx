import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageSwitcher } from '../PageSwitcher';

export function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Outlet />
      <PageSwitcher />
    </>
  );
}
