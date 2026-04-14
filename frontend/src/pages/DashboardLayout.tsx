import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path) ? 'active' : '';

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <header className="header justify-between">
        <Link to="/dashboard" className="header-logo">
          <Calendar size={28} />
          John Doe
        </Link>
        <nav className="nav-links">
          <Link to="/dashboard/event-types" className={`nav-link ${isActive('/event-types')}`}>Event Types</Link>
          <Link to="/dashboard/availability" className={`nav-link ${isActive('/availability')}`}>Availability</Link>
          <Link to="/dashboard/meetings" className={`nav-link ${isActive('/meetings')}`}>Meetings</Link>
        </nav>
      </header>

      <main className="container pb-8" style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
