import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import ToastContainer from './ToastNotification';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const location = useLocation();
  const { toasts, removeToast } = useApp();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <div className="app-wrapper">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
