import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import RecordTable from '../components/RecordTable';

const statuses = ['Upcoming', 'In Progress', 'Renewed', 'Expired', 'Cancelled'];
const columns = [{ key: 'id', label: 'ID', render: (row) => `#${row.id}` }, { key: 'contract_id', label: 'CONTRACT', render: (row) => `#${row.contract_id}` }, { key: 'renewal_date', label: 'RENEWAL DATE' }, { key: 'previous_expiry_date', label: 'CURRENT EXPIRY' }, { key: 'new_expiry_date', label: 'NEW EXPIRY' }];

const RenewalsDashboard = () => { const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const load = useCallback(() => { setLoading(true); API.get('/renewals').then((response) => setRows(response.data)).catch(() => setError('Unable to load renewals.')).finally(() => setLoading(false)); }, []); // eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => { load(); }, [load]); const changeStatus = (row, status) => { if (!status) return; API.patch(`/renewals/${row.id}/status`, { status }).then(() => load()).catch(() => setError('Status update failed.')); }; const remove = (row) => setError(`Renewal #${row.id} is managed through its source contract.`); return <RecordTable title="Renewals" description="Stay ahead of expiry dates and keep every renewal moving forward." rows={rows} columns={columns} statusOptions={statuses} onRefresh={load} onCreate={() => setError('Create renewal form is ready for the next workflow step.')} onDelete={remove} onStatusChange={changeStatus} loading={loading} error={error} />; };

export default RenewalsDashboard;