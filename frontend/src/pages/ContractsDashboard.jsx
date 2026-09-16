import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import RecordTable from '../components/RecordTable';

const statuses = ['Draft', 'Under Review', 'Approved', 'Active', 'Expired', 'Terminated'];
const columns = [{ key: 'id', label: 'ID', render: (row) => `#${row.id}` }, { key: 'title', label: 'CONTRACT' }, { key: 'contract_number', label: 'NUMBER' }, { key: 'category', label: 'CATEGORY' }, { key: 'end_date', label: 'EXPIRY' }];

const ContractsDashboard = () => { const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const load = useCallback(() => { setLoading(true); API.get('/contracts/').then((response) => setRows(response.data)).catch(() => setError('Unable to load contracts.')).finally(() => setLoading(false)); }, []); // eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => { load(); }, [load]); const changeStatus = (row, status) => { if (!status) return; API.patch(`/contracts/${row.id}/status`, { status }).then(() => load()).catch(() => setError('Status update failed.')); }; const remove = (row) => { if (!window.confirm(`Delete contract #${row.id}?`)) return; API.delete(`/contracts/${row.id}`).then(() => load()).catch(() => setError('Delete failed.')); }; return <RecordTable title="Contracts" description="Manage the agreements that shape your business relationships." rows={rows} columns={columns} statusOptions={statuses} onRefresh={load} onCreate={() => setError('Create contract form is ready for the next workflow step.')} onDelete={remove} onStatusChange={changeStatus} loading={loading} error={error} />; };

export default ContractsDashboard;