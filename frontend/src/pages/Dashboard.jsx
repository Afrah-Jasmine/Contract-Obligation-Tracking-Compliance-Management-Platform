import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, FileText, HeartPulse, RefreshCw } from 'lucide-react';
import API from '../services/api';

const Metric = ({ label, value, detail, icon: Icon, tone }) => <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([API.get('/dashboard/summary'), API.get('/monitoring/expiries')]).then(([summary, expiry]) => { setData(summary.data); setRenewals(expiry.data.upcoming_renewals || []); }).catch(() => setError('Dashboard data is temporarily unavailable.')); }, []);
  const contracts = data?.contracts || {};
  const obligations = data?.obligations || {};
  const renewalsSummary = data?.renewals || {};
  const total = Object.values(contracts).reduce((sum, value) => sum + value, 0);
  const active = contracts.Active || contracts.active || 0;
  const pending = (contracts['Under Review'] || contracts.under_review || 0) + (contracts.Draft || contracts.draft || 0);
  const overdue = obligations.Overdue || obligations.overdue || 0;
  return <main className="page-shell dashboard-page"><div className="page-heading"><span className="eyebrow">Wednesday, September 16, 2026</span><h1>Good morning.</h1><p>Here is the health of your contract portfolio today.</p></div>{error && <div className="inline-error">{error}</div>}<div className="metrics-grid"><Metric label="Total contracts" value={data ? total : '-'} detail="Across your portfolio" icon={FileText} tone="blue" /><Metric label="Active contracts" value={data ? active : '-'} detail="Currently in force" icon={CheckCircle2} tone="green" /><Metric label="Pending approvals" value={data ? pending : '-'} detail="Need your attention" icon={Clock3} tone="amber" /><Metric label="Expiring / overdue" value={data ? (renewalsSummary.Expired || overdue) : '-'} detail="Requires follow-up" icon={AlertTriangle} tone="coral" /></div><div className="dashboard-grid"><section className="panel health-panel"><div className="section-heading"><div><span className="eyebrow">Portfolio overview</span><h2>Portfolio health</h2></div><span className="health-score"><HeartPulse size={16} /> Good</span></div><div className="health-bar"><span style={{ width: `${total ? Math.round((active / total) * 100) : 0}%` }} /></div><div className="health-legend"><span><i className="legend-dot green-dot" /> Active <b>{active}</b></span><span><i className="legend-dot amber-dot" /> Pending <b>{pending}</b></span><span><i className="legend-dot coral-dot" /> At risk <b>{overdue}</b></span></div><div className="health-summary"><strong>{total ? Math.round((active / total) * 100) : 0}%</strong><span>of your contracts are active and in good standing</span><ArrowUpRight size={18} /></div></section><section className="panel renewals-panel"><div className="section-heading"><div><span className="eyebrow">Next 90 days</span><h2>Renewals approaching</h2></div><RefreshCw size={18} color="#8f847b" /></div>{renewals.length === 0 ? <div className="empty-state compact"><CheckCircle2 size={22} /><span>No upcoming renewals found.</span></div> : renewals.slice(0, 4).map((item) => <div className="renewal-row" key={item.contract_id}><div className="renewal-icon"><FileText size={16} /></div><div><strong>{item.title}</strong><span>Contract #{item.contract_id}</span></div><time>{item.days_remaining === 0 ? 'Today' : `${item.days_remaining} days`}</time></div>)}</section></div></main>;
};

export default Dashboard;