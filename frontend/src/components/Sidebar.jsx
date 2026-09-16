import { NavLink } from 'react-router-dom';
import { BarChart3, Bell, ClipboardCheck, FileText, History, LayoutDashboard, RefreshCw, ShieldCheck } from 'lucide-react';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Contracts', path: '/contracts', icon: FileText },
  { label: 'Obligations', path: '/obligations', icon: ClipboardCheck },
  { label: 'Renewals', path: '/renewals', icon: RefreshCw },
  { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Audit History', path: '/audit-history', icon: History },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">C</span><span>ContractIQ</span></div>
      <div className="sidebar-caption">Workspace</div>
      <nav className="sidebar-nav">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer"><span className="status-dot" /> Systems operational</div>
    </aside>
  );
};

export default Sidebar;