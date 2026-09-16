import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContractsDashboard from './pages/ContractsDashboard';
import ObligationsDashboard from './pages/ObligationsDashboard';
import RenewalsDashboard from './pages/RenewalsDashboard';
import ComplianceDashboard from './pages/ComplianceDashboard';
import ExportScreen from './pages/ExportScreen';
import Login from './pages/Login';
import { Bell, LogOut, User } from 'lucide-react';
import { getAccessToken } from './services/api';

const Placeholder = ({ title }) => <main className="page-shell"><div className="page-heading"><span className="eyebrow">Workspace</span><h1>{title}</h1><p>This workspace is ready for the next workflow module.</p></div><div className="empty-state"><Bell size={26} /><strong>{title} is coming into focus</strong><span>Connect this area to your operational workflow when its records are available.</span></div></main>;

function App() {
  const [token, setToken] = useState(getAccessToken());

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <header className="topbar">
            <span className="breadcrumb">ContractIQ <span>/</span> Workspace</span>
            <div className="topbar-actions"><button className="icon-button" title="Notifications"><Bell size={18} /></button><div className="user-chip"><span className="avatar"><User size={15} /></span> Administrator</div><button className="logout-button" onClick={handleLogout}><LogOut size={15} /> Logout</button></div>
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contracts" element={<ContractsDashboard />} />
            <Route path="/obligations" element={<ObligationsDashboard />} />
            <Route path="/renewals" element={<RenewalsDashboard />} />
            <Route path="/compliance" element={<ComplianceDashboard />} />
            <Route path="/exports" element={<ExportScreen />} />
            <Route path="/reports" element={<ExportScreen />} />
            <Route path="/notifications" element={<Placeholder title="Notifications" />} />
            <Route path="/audit-history" element={<Placeholder title="Audit History" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;