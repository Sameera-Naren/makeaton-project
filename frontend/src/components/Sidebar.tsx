import { NavLink } from 'react-router-dom';

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Brightloop</h1>
        <p>Subscription Management</p>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} id="nav-home">
          <HomeIcon /> Dashboard
        </NavLink>

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>My Module</div>
        <NavLink to="/quotations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} id="nav-quotations">
          <FileTextIcon /> Quotations
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} id="nav-subscriptions">
          <RefreshIcon /> Subscriptions
        </NavLink>
      </nav>
    </aside>
  );
}
