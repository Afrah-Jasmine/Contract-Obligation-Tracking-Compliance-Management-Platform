import { useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

const formatValue = (value) => {
  if (!value) return '-';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return String(value).replaceAll('_', ' ');
};

const RecordTable = ({ title, description, rows, columns, statusOptions, onRefresh, onCreate, onDelete, onStatusChange, loading, error }) => {
  const [query, setQuery] = useState('');
  const filteredRows = useMemo(() => rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query.toLowerCase()))), [rows, query]);

  return <main className="page-shell">
    <div className="page-heading page-heading-row"><div><span className="eyebrow">Workspace / Records</span><h1>{title}</h1><p>{description}</p></div><button className="primary-button" onClick={onCreate}><Plus size={16} /> Create new</button></div>
    <section className="table-panel">
      <div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" aria-label="Search records" /></div><button className="secondary-button" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh</button></div>
      {error && <div className="inline-error">{error}</div>}
      <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={columns.length + 2} className="table-state">Loading live records...</td></tr> : filteredRows.length === 0 ? <tr><td colSpan={columns.length + 2} className="table-state">No records match your search.</td></tr> : filteredRows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : formatValue(row[column.key])}</td>)}<td><span className={`status-pill status-${String(row.status).toLowerCase().replaceAll(' ', '-')}`}>{formatValue(row.status)}</span></td><td><div className="row-actions"><button className="table-action" title="Edit record" onClick={() => onCreate(row)}><Pencil size={15} /></button><button className="table-action danger" title="Delete record" onClick={() => onDelete(row)}><Trash2 size={15} /></button><select className="status-select" value={row.status} onChange={(event) => onStatusChange(row, event.target.value)} aria-label={`Change status for record ${row.id}`}><option value="">Change status</option>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></td></tr>)}
      </tbody></table></div>
      <div className="table-footer">Showing {filteredRows.length} of {rows.length} records</div>
    </section>
  </main>;
};

export default RecordTable;