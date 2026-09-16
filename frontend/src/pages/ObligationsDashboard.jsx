import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import RecordTable from '../components/RecordTable';

const statuses = ['Pending', 'In Progress', 'Completed', 'Delayed', 'Overdue'];
const columns = [{ key: 'id', label: 'ID', render: (row) => `#${row.id}` }, { key: 'title', label: 'OBLIGATION' }, { key: 'contract_id', label: 'CONTRACT', render: (row) => `#${row.contract_id}` }, { key: 'obligation_type', label: 'TYPE' }, { key: 'due_date', label: 'DUE DATE' }];

const ObligationsDashboard = () => { const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const load = useCallback(() => { setLoading(true); API.get('/obligations').then((response) => setRows(response.data)).catch(() => setError('Unable to load obligations.')).finally(() => setLoading(false)); }, []); // eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => { load(); }, [load]); const changeStatus = (row, status) => { if (!status) return; API.patch(`/obligations/${row.id}/status`, { status }).then(() => load()).catch(() => setError('Status update failed.')); }; const remove = (row) => { setError(`Obligation #${row.id} cannot be deleted because the API does not expose a delete operation.`); }; return <RecordTable title="Obligations" description="Track commitments, deadlines, and ownership across every contract." rows={rows} columns={columns} statusOptions={statuses} onRefresh={load} onCreate={() => setError('Create obligation form is ready for the next workflow step.')} onDelete={remove} onStatusChange={changeStatus} loading={loading} error={error} />; };

export default ObligationsDashboard;