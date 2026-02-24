import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Upload, Trash2, Edit3, ChevronUp, ChevronDown, Filter,
  AlertTriangle, CheckCircle, Server, Save, X, Download,
  Wifi, RefreshCw, Eye, EyeOff, ScanLine,
} from 'lucide-react';
import { useApp } from '../App';
import { api } from '../utils/api';
import { checkProxy, scan as scanProxy } from '../utils/proxyApi';

const WAVES = ['green', 'yellow', 'red'];
const SOURCE_TYPES = ['xenserver', 'physical_windows', 'physical_linux'];
const ROLES = ['generic', 'dc', 'pki', 'database', 'web', 'fileserver'];
const OS_OPTIONS = ['Server 2022', 'Server 2019', 'Server 2016', 'Server 2012 R2', 'Ubuntu 22', 'Ubuntu 20', 'RHEL 8', 'RHEL 7', 'CentOS 7', 'Debian 11'];

const WAVE_DOT  = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' };
const WAVE_TEXT = { green: 'text-green-400', yellow: 'text-yellow-400', red: 'text-red-400' };
const WAVE_LABEL = { green: '🟢 Wave 1', yellow: '🟡 Wave 2', red: '🔴 Wave 3' };
const ROLE_ICONS = { dc: '🏛️', pki: '🔐', database: '🗄️', web: '🌐', fileserver: '📁', generic: '⚙️' };

const FLAG_COLORS = {
  domain_controller: 'text-red-400 bg-red-900/30',
  pki_server:        'text-orange-400 bg-orange-900/30',
  database:          'text-blue-400 bg-blue-900/30',
  end_of_life_os:    'text-yellow-400 bg-yellow-900/30',
  check_clustering:  'text-purple-400 bg-purple-900/30',
};

const LS_SCAN_CREDS = 'nutamigrate_scan_creds';

function WaveBadge({ wave }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
      wave === 'green' ? 'wave-green' : wave === 'yellow' ? 'wave-yellow' : 'wave-red'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${WAVE_DOT[wave]}`} />
      {WAVE_LABEL[wave]}
    </span>
  );
}

function FlagBadge({ flag }) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-mono ${FLAG_COLORS[flag] || 'text-slate-400 bg-slate-800'}`}>
      {flag.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Scan Credentials Modal ───────────────────────────────────────────────────

function ScanCredsModal({ onClose, onSave }) {
  const [creds, setCreds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_SCAN_CREDS)) || {}; } catch { return {}; }
  });
  const [form, setForm] = useState({
    linux_user: creds.linux_user || 'root',
    linux_pass: creds.linux_pass || '',
    linux_port: creds.linux_port || 22,
    win_user:   creds.win_user   || 'Administrator',
    win_pass:   creds.win_pass   || '',
    win_port:   creds.win_port   || 5985,
  });
  const [showPw, setShowPw] = useState(false);

  const save = () => {
    localStorage.setItem(LS_SCAN_CREDS, JSON.stringify(form));
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-bg-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Scan Credentials</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
            Stored in localStorage. Use a read-only service account where possible.
          </div>
          {/* Linux */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🐧 Linux (SSH)</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="label">User</label>
                <input className="input" value={form.linux_user} onChange={(e) => setForm({ ...form, linux_user: e.target.value })} />
              </div>
              <div className="col-span-1">
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input pr-7" type={showPw ? 'text' : 'password'}
                    value={form.linux_pass} onChange={(e) => setForm({ ...form, linux_pass: e.target.value })} />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2 text-slate-500"><EyeOff size={13} /></button>
                </div>
              </div>
              <div>
                <label className="label">Port</label>
                <input className="input font-mono" type="number" value={form.linux_port}
                  onChange={(e) => setForm({ ...form, linux_port: parseInt(e.target.value) })} />
              </div>
            </div>
          </div>
          {/* Windows — read-only for now */}
          <div className="opacity-50">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🪟 Windows (WinRM — use XenServer API or Pre-Migration tab)</div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scan Result Modal ────────────────────────────────────────────────────────

function ScanResultModal({ result, machine, onApply, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-bg-border rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Scan Results — {machine.name}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Hostname', value: result.hostname },
              { label: 'OS', value: result.os },
              { label: 'vCPU', value: result.vcpu },
              { label: 'RAM', value: `${result.ram_gb} GB` },
              { label: 'Disk', value: `${result.disk_gb} GB` },
              { label: 'IP', value: result.ip },
              { label: 'Kernel', value: result.kernel },
              { label: 'CPU Model', value: result.cpu_model },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-elevated rounded px-3 py-2">
                <div className="text-slate-500 mb-0.5">{label}</div>
                <div className="font-mono text-slate-200 text-xs truncate">{value || '—'}</div>
              </div>
            ))}
          </div>
          {result.services && result.services.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Running Services ({result.services.length})</div>
              <div className="bg-bg-base rounded px-3 py-2 font-mono text-xs text-slate-400 max-h-28 overflow-y-auto">
                {result.services.map((s, i) => <div key={i}>{s}</div>)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary">Discard</button>
            <button onClick={() => onApply(result)} className="btn-primary flex items-center gap-1">
              <CheckCircle size={13} /> Apply to {machine.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Machine Form ─────────────────────────────────────────────────────────────

function MachineForm({ machine, projectId, onSave, onCancel }) {
  const [form, setForm] = useState(machine || {
    project_id: projectId,
    name: '', ip: '', os: '', vcpu: 4, ram_gb: 8, disk_gb: 100,
    wave: 'green', source_type: 'xenserver', machine_role: 'generic', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const data   = { ...form, project_id: projectId };
      const result = machine?.id ? await api.updateMachine(machine.id, data) : await api.createMachine(data);
      onSave(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-base border border-primary border-opacity-40 rounded-xl p-4 space-y-3">
      {error && <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-800">{error}</div>}
      <div className="grid grid-cols-6 gap-3">
        <div>
          <label className="label">Name *</label>
          <input className="input font-mono" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CLPROD" />
        </div>
        <div>
          <label className="label">IP Address</label>
          <input className="input font-mono" value={form.ip || ''} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="10.1.2.100" />
        </div>
        <div>
          <label className="label">OS</label>
          <input list="os-options" className="input" value={form.os || ''} onChange={(e) => setForm({ ...form, os: e.target.value })} placeholder="Server 2019" />
          <datalist id="os-options">{OS_OPTIONS.map((o) => <option key={o} value={o} />)}</datalist>
        </div>
        <div>
          <label className="label">vCPU</label>
          <input className="input font-mono" type="number" min="1" max="128" value={form.vcpu} onChange={(e) => setForm({ ...form, vcpu: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="label">RAM (GB)</label>
          <input className="input font-mono" type="number" min="1" value={form.ram_gb} onChange={(e) => setForm({ ...form, ram_gb: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="label">Disk (GB)</label>
          <input className="input font-mono" type="number" min="1" value={form.disk_gb} onChange={(e) => setForm({ ...form, disk_gb: parseInt(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="label">Wave / Priority</label>
          <select className="select" value={form.wave} onChange={(e) => setForm({ ...form, wave: e.target.value })}>
            {WAVES.map((w) => <option key={w} value={w}>{WAVE_LABEL[w]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Source Type</label>
          <select className="select" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
            <option value="xenserver">XenServer VM</option>
            <option value="physical_windows">Physical Windows</option>
            <option value="physical_linux">Physical Linux</option>
          </select>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="select" value={form.machine_role} onChange={(e) => setForm({ ...form, machine_role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_ICONS[r]} {r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Notes</label>
          <input className="input" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special requirements..." />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-1"><X size={13} /> Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1">
          <Save size={13} /> {saving ? 'Saving...' : machine?.id ? 'Update' : 'Add Machine'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Inventory page ──────────────────────────────────────────────────────

export default function Inventory() {
  const { activeProject, refreshProjects } = useApp();
  const [machines, setMachines]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [filterWave, setFilterWave] = useState('all');
  const [filterOS, setFilterOS]     = useState('');
  const [sortField, setSortField]   = useState('wave');
  const [sortDir, setSortDir]       = useState('asc');
  const [importing, setImporting]   = useState(false);
  const [importError, setImportError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  // Scanning state
  const [proxyOk, setProxyOk]           = useState(false);
  const [showScanCreds, setShowScanCreds] = useState(false);
  const [scanCreds, setScanCreds]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_SCAN_CREDS)) || null; } catch { return null; }
  });
  const [scanning, setScanning]           = useState({}); // { id: bool }
  const [scanResult, setScanResult]       = useState(null); // { machine, result }
  const [scanAllActive, setScanAllActive] = useState(false);

  // Check proxy
  useEffect(() => {
    checkProxy().then(setProxyOk);
    const t = setInterval(() => checkProxy().then(setProxyOk), 20_000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const ms = await api.getMachines(activeProject.id);
      setMachines(ms);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); setShowAdd(false); setEditingId(null); }, [activeProject?.id]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...machines]
    .filter((m) => filterWave === 'all' || m.wave === filterWave)
    .filter((m) => !filterOS || (m.os || '').toLowerCase().includes(filterOS.toLowerCase()))
    .sort((a, b) => {
      const waveOrder = { green: 1, yellow: 2, red: 3 };
      let av = sortField === 'wave' ? waveOrder[a.wave] : a[sortField];
      let bv = sortField === 'wave' ? waveOrder[b.wave] : b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-slate-600" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const handleSave = (m) => {
    setMachines((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) { const a = [...prev]; a[idx] = m; return a; }
      return [...prev, m];
    });
    setShowAdd(false); setEditingId(null);
    refreshProjects();
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteMachine(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirm(null);
      refreshProjects();
    } catch (e) { console.error(e); }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;
    setImporting(true); setImportError('');
    try {
      await api.importCSV(activeProject.id, file);
      await load();
      refreshProjects();
    } catch (e) { setImportError(e.message); }
    finally { setImporting(false); e.target.value = ''; }
  };

  const downloadCSV = () => {
    const headers = ['name', 'ip', 'os', 'vcpu', 'ram_gb', 'disk_gb', 'wave', 'source_type', 'notes'];
    const rows = machines.map((m) => headers.map((h) => m[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activeProject.name}-inventory.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Scanning ─────────────────────────────────────────────────────────────

  const scanMachine = useCallback(async (machine) => {
    if (!scanCreds || !machine.ip) return;
    setScanning((s) => ({ ...s, [machine.id]: true }));
    try {
      const isLinux = machine.source_type === 'physical_linux' ||
        /ubuntu|debian|centos|rhel|fedora|linux/i.test(machine.os || '');
      const result = await scanProxy({
        host: machine.ip,
        username: scanCreds.linux_user,
        password: scanCreds.linux_pass,
        port: scanCreds.linux_port || 22,
        type: isLinux ? 'linux' : 'linux', // windows not yet supported via scan
      });
      setScanResult({ machine, result });
    } catch (e) {
      alert(`Scan failed for ${machine.name}: ${e.message}`);
    } finally {
      setScanning((s) => ({ ...s, [machine.id]: false }));
    }
  }, [scanCreds]);

  const applyScanResult = async (result) => {
    if (!scanResult) return;
    const { machine } = scanResult;
    const updated = {
      ...machine,
      os:      result.os      || machine.os,
      vcpu:    result.vcpu    || machine.vcpu,
      ram_gb:  result.ram_gb  || machine.ram_gb,
      disk_gb: result.disk_gb || machine.disk_gb,
      ip:      result.ip      || machine.ip,
      notes:   `${machine.notes ? machine.notes + ' | ' : ''}Scanned: ${result.hostname}`,
    };
    try {
      const saved = await api.updateMachine(machine.id, updated);
      handleSave(saved);
    } catch (e) { alert(`Update failed: ${e.message}`); }
    setScanResult(null);
  };

  const scanAll = async () => {
    setScanAllActive(true);
    const toScan = sorted.filter((m) => m.ip && m.source_type !== 'physical_windows');
    for (const m of toScan) {
      await scanMachine(m);
    }
    setScanAllActive(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const totalDisk = machines.reduce((s, m) => s + (m.disk_gb || 0), 0);
  const totalRAM  = machines.reduce((s, m) => s + (m.ram_gb  || 0), 0);

  if (!activeProject) return <div className="p-8 text-slate-500 text-center">Select a project to view inventory.</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Machine Inventory</h1>
          <p className="text-sm text-slate-400">{machines.length} machines · {totalDisk} GB disk · {totalRAM} GB RAM</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Scan controls */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${proxyOk ? 'bg-green-500' : 'bg-red-500'}`} title={proxyOk ? 'Proxy connected' : 'Proxy offline'} />
            <button
              onClick={() => setShowScanCreds(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm"
              title="Set SSH credentials for scanning"
            >
              <ScanLine size={13} />
              {scanCreds ? `Scan (${scanCreds.linux_user})` : 'Set Scan Creds'}
            </button>
            {scanCreds && proxyOk && (
              <button
                onClick={scanAll}
                disabled={scanAllActive}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                {scanAllActive ? <RefreshCw size={13} className="animate-spin" /> : <Wifi size={13} />}
                Scan All
              </button>
            )}
          </div>
          <button onClick={downloadCSV} className="btn-secondary flex items-center gap-2"><Download size={14} /> Export CSV</button>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleCSVImport} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={importing} className="btn-secondary flex items-center gap-2">
            <Upload size={14} /> {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Add Machine
          </button>
        </div>
      </div>

      {importError && (
        <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-800">{importError}</div>
      )}

      {/* Add form */}
      {showAdd && (
        <MachineForm projectId={activeProject.id} onSave={handleSave} onCancel={() => setShowAdd(false)} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-slate-500" />
        <div className="flex gap-1">
          {['all', ...WAVES].map((w) => (
            <button
              key={w}
              onClick={() => setFilterWave(w)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterWave === w ? 'bg-primary text-bg-base' : 'text-slate-400 hover:text-slate-200 bg-bg-elevated border border-bg-border'}`}
            >
              {w === 'all' ? 'All Waves' : WAVE_LABEL[w]}
            </button>
          ))}
        </div>
        <input
          className="input w-40 text-xs"
          placeholder="Filter by OS..."
          value={filterOS}
          onChange={(e) => setFilterOS(e.target.value)}
        />
        <span className="text-xs text-slate-500 ml-auto">{sorted.length} of {machines.length} machines</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface">
              <tr>
                {[
                  { label: 'Machine', field: 'name' },
                  { label: 'IP',      field: 'ip' },
                  { label: 'OS',      field: 'os' },
                  { label: 'vCPU',    field: 'vcpu' },
                  { label: 'RAM',     field: 'ram_gb' },
                  { label: 'Disk',    field: 'disk_gb' },
                  { label: 'Wave',    field: 'wave' },
                  { label: 'Type',    field: 'source_type' },
                  { label: 'Flags',   field: null },
                  { label: '',        field: null },
                ].map(({ label, field }) => (
                  <th key={label} className="table-header">
                    {field ? (
                      <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-slate-200">
                        {label} <SortIcon field={field} />
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-500">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Server size={32} className="text-slate-700 mx-auto mb-3" />
                    <div className="text-slate-500">No machines yet.</div>
                    <button onClick={() => setShowAdd(true)} className="btn-primary mt-3 text-sm">Add First Machine</button>
                  </td>
                </tr>
              ) : sorted.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className={`table-row ${m.xen_ref ? 'border-l-2 border-l-orange-500/40' : ''}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ROLE_ICONS[m.machine_role] || '⚙️'}</span>
                        <span className="font-mono font-semibold text-slate-100">{m.name}</span>
                        {m.xen_ref && <span className="text-[10px] text-orange-400 bg-orange-900/20 px-1 rounded">XEN</span>}
                      </div>
                      {m.notes && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-32">{m.notes}</div>}
                    </td>
                    <td className="table-cell font-mono text-slate-400 text-xs">{m.ip || '—'}</td>
                    <td className="table-cell text-slate-300 text-xs">{m.os || '—'}</td>
                    <td className="table-cell font-mono text-slate-300 text-center">{m.vcpu}</td>
                    <td className="table-cell font-mono text-slate-300 text-right">{m.ram_gb} GB</td>
                    <td className="table-cell font-mono text-slate-300 text-right">{m.disk_gb} GB</td>
                    <td className="table-cell"><WaveBadge wave={m.wave} /></td>
                    <td className="table-cell">
                      <span className="text-xs text-slate-400">
                        {m.source_type === 'xenserver' ? 'XenServer' : m.source_type === 'physical_windows' ? 'Phys Win' : 'Phys Linux'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(m.special_flags || []).map((f) => <FlagBadge key={f} flag={f} />)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 justify-end">
                        {/* SSH Scan button — Linux only */}
                        {m.source_type !== 'physical_windows' && proxyOk && scanCreds && m.ip && (
                          <button
                            onClick={() => scanMachine(m)}
                            disabled={!!scanning[m.id]}
                            title="SSH scan this machine"
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded hover:bg-bg-elevated disabled:opacity-40"
                          >
                            {scanning[m.id]
                              ? <RefreshCw size={13} className="animate-spin" />
                              : <Wifi size={13} />}
                          </button>
                        )}
                        <button
                          onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded hover:bg-bg-elevated"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-bg-elevated"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === m.id && (
                    <tr>
                      <td colSpan={10} className="px-4 pb-3">
                        <MachineForm machine={m} projectId={activeProject.id} onSave={handleSave} onCancel={() => setEditingId(null)} />
                      </td>
                    </tr>
                  )}
                  {deleteConfirm === m.id && (
                    <tr>
                      <td colSpan={10} className="px-4 pb-2">
                        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 rounded-lg px-4 py-2.5 text-sm">
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-red-300">Delete <strong>{m.name}</strong>? This removes all progress records too.</span>
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs py-1">Cancel</button>
                            <button onClick={() => handleDelete(m.id)} className="btn-danger text-xs py-1">Delete</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 text-xs">
        {[
          { label: 'Total Disk',    value: `${totalDisk} GB`,          sub: `~${Math.round(totalDisk * 1.1)} GB needed (with headroom)` },
          { label: 'Total RAM',     value: `${totalRAM} GB`,           sub: 'Required on AHV cluster' },
          { label: 'Windows VMs',   value: machines.filter((m) => (m.os||'').toLowerCase().includes('server') || (m.os||'').toLowerCase().includes('windows')).length, sub: 'Require VirtIO pre-install' },
          { label: 'Special Flags', value: machines.filter((m) => (m.special_flags||[]).length > 0).length, sub: 'Require extra care' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-3">
            <div className="text-slate-500 mb-1">{label}</div>
            <div className="text-lg font-bold font-mono text-slate-100">{value}</div>
            <div className="text-slate-600">{sub}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-600">
        <div className="font-semibold mb-1 text-slate-500">CSV Import Format:</div>
        <code className="font-mono text-xs">name,ip,os,vcpu,ram_gb,disk_gb,wave,source_type,notes</code>
        <span className="mx-2 text-slate-700">·</span>
        <code className="font-mono text-xs">wave</code>: green | yellow | red
        <span className="mx-2 text-slate-700">·</span>
        <code className="font-mono text-xs">source_type</code>: xenserver | physical_windows | physical_linux
        <span className="mx-2 text-slate-700">·</span>
        <span className="text-orange-400">Orange border = XenServer API import</span>
      </div>

      {/* Modals */}
      {showScanCreds && (
        <ScanCredsModal
          onClose={() => setShowScanCreds(false)}
          onSave={(c) => { setScanCreds(c); setShowScanCreds(false); }}
        />
      )}
      {scanResult && (
        <ScanResultModal
          machine={scanResult.machine}
          result={scanResult.result}
          onApply={applyScanResult}
          onClose={() => setScanResult(null)}
        />
      )}
    </div>
  );
}
