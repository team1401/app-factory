import React, { useState, useEffect, useCallback } from 'react';
import {
  Plug, RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Download, Server, Database, Network, HardDrive, Cpu, Layers,
  Terminal, Info, ArrowRight, GitBranch, Box,
} from 'lucide-react';
import { useApp } from '../App';
import { api } from '../utils/api';
import { checkProxy, getProxyToken, setProxyToken, prism as prismApi, xen as xenApi, xenVmToMachine, computeVmDiskGb } from '../utils/proxyApi';

// ─── Proxy status banner ─────────────────────────────────────────────────────

function ProxyBanner({ status, onRecheck }) {
  const [token, setToken] = useState(getProxyToken);
  if (status === 'ok') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg text-xs text-green-400">
        <CheckCircle size={13} />
        <span className="font-mono">Proxy connected at localhost:3131</span>
        <button onClick={onRecheck} className="ml-auto text-green-600 hover:text-green-400"><RefreshCw size={11} /></button>
      </div>
    );
  }
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-xs text-slate-400">
        <RefreshCw size={13} className="animate-spin" />
        <span>Checking proxy…</span>
      </div>
    );
  }
  return (
    <div className="px-4 py-3 bg-yellow-900/20 border border-yellow-800 rounded-lg text-xs space-y-2">
      <div className="flex items-center gap-2 text-yellow-400 font-semibold">
        <AlertTriangle size={13} />
        Proxy not connected — start it on your workstation and enter its access token
      </div>
      <div className="font-mono text-slate-400 space-y-0.5">
        <div>cd /path/to/nutamigrate/proxy</div>
        <div>npm install &amp;&amp; node server.js</div>
      </div>
      <div className="flex items-center gap-2">
        <input className="input font-mono text-xs flex-1" type="password" placeholder="Access token printed by the proxy"
          value={token} onChange={(e) => setToken(e.target.value)} />
        <button onClick={() => { setProxyToken(token); onRecheck(); }} className="btn-secondary text-xs py-1 flex items-center gap-1">
          <RefreshCw size={11} /> Save &amp; Retry
        </button>
      </div>
    </div>
  );
}

// ─── Reusable data table ──────────────────────────────────────────────────────

function DataTable({ columns, rows, emptyMsg = 'No data' }) {
  if (!rows || rows.length === 0) {
    return <div className="text-center text-slate-500 text-xs py-8">{emptyMsg}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-bg-surface">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="table-header text-left px-3 py-2">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-bg-border hover:bg-bg-elevated transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 font-mono text-slate-300">
                  {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section tabs ─────────────────────────────────────────────────────────────

function SectionTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-bg-border pb-0 mb-0">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors border-b-2 ${
            active === t.key
              ? 'text-primary border-primary bg-primary/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${active === t.key ? 'bg-primary/20' : 'bg-bg-elevated'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── PRISM PANEL ─────────────────────────────────────────────────────────────

const LS_PRISM = 'nutamigrate_prism_creds';

function PrismPanel({ proxyOk }) {
  const { activeProject, refreshProjects } = useApp();
  const [creds, setCreds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PRISM)) || {}; } catch { return {}; }
  });
  const [form, setForm] = useState({
    prismUrl: creds.prismUrl || 'https://',
    username: creds.username || 'admin',
    password: creds.password || '',
  });
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [error, setError] = useState('');
  const [data, setData] = useState(creds.data || null);
  const [activeTab, setActiveTab] = useState('clusters');
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState('');

  const connect = async () => {
    if (!proxyOk) return;
    setStatus('connecting'); setError('');
    try {
      const result = await prismApi.fetchAll(form);
      setData(result);
      setStatus('connected');
      const saved = { ...form, data: result };
      localStorage.setItem(LS_PRISM, JSON.stringify(saved));
      setCreds(saved);
    } catch (e) {
      setStatus('error');
      setError(e.message);
    }
  };

  const disconnect = () => {
    setStatus('idle'); setData(null); setError('');
    localStorage.removeItem(LS_PRISM);
    setCreds({});
  };

  const applyToProject = async (container, network) => {
    if (!activeProject) return;
    setApplying(true); setApplyResult('');
    try {
      await api.updateProject(activeProject.id, { prism_container: container, ahv_network: network });
      await refreshProjects();
      setApplyResult(`✓ Applied container "${container}" + network "${network}" to project`);
    } catch (e) {
      setApplyResult(`✗ ${e.message}`);
    } finally {
      setApplying(false);
    }
  };

  const clusterRows = (data?.clusters?.entities || []).map((c) => ({
    name: c.name,
    version: c.version,
    nodes: c.num_nodes,
    storage: `${Math.round((c.storage_capacity_in_bytes || 0) / 1e12 * 10) / 10} TB`,
    free: `${Math.round((c.storage_free_in_bytes || 0) / 1e12 * 10) / 10} TB`,
  }));

  const containerRows = (data?.containers?.entities || []).map((c) => ({
    name: c.name,
    used: `${Math.round((c.usage_stats?.['storage.usage_bytes'] || 0) / 1e9)} GB`,
    max: c.max_capacity_bytes ? `${Math.round(c.max_capacity_bytes / 1e9)} GB` : '—',
    compression: c.compression_enabled ? '✓' : '—',
    dedupe: c.finger_print_on_write !== 'off' ? '✓' : '—',
  }));

  const networkRows = (data?.networks?.entities || []).map((n) => ({
    name: n.name,
    uuid: (n.uuid || '').slice(0, 12) + '…',
    vlan: n.vlan_id ?? '—',
    subnet: n.ip_config?.network_address || '—',
  }));

  const imageRows = (data?.images?.entities || []).map((im) => ({
    name: im.name,
    size: `${Math.round((im.image_file_size_in_bytes || 0) / 1e9 * 10) / 10} GB`,
    state: im.image_state || '—',
    type: im.image_type || '—',
  }));

  const vmRows = (data?.vms?.entities || []).map((v) => ({
    name: v.name,
    power: v.power_state,
    vcpu: v.num_vcpus,
    ram: `${Math.round((v.memory_capacity_in_bytes || 0) / 1e9)} GB`,
    ip: (v.vm_nics || [])[0]?.ip_address || '—',
  }));

  const tabs = [
    { key: 'clusters', label: 'Clusters', count: clusterRows.length },
    { key: 'containers', label: 'Containers', count: containerRows.length },
    { key: 'networks', label: 'Networks', count: networkRows.length },
    { key: 'images', label: 'Images', count: imageRows.length },
    { key: 'vms', label: 'AHV VMs', count: vmRows.length },
  ];

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Database size={14} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Prism Element</div>
            <div className="text-xs text-slate-500">Nutanix cluster API v2.0</div>
          </div>
        </div>
        {status === 'connected' && (
          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/20 border border-green-800 px-2 py-1 rounded-full">
            <CheckCircle size={11} /> Connected
          </span>
        )}
        {status === 'connecting' && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw size={11} className="animate-spin" /> Connecting…
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/20 border border-red-800 px-2 py-1 rounded-full">
            <XCircle size={11} /> Failed
          </span>
        )}
      </div>

      {/* Connection form */}
      {status !== 'connected' && (
        <div className="space-y-3">
          <div>
            <label className="label">Prism Element URL</label>
            <input className="input font-mono" value={form.prismUrl}
              onChange={(e) => setForm({ ...form, prismUrl: e.target.value })}
              placeholder="https://10.0.0.1:9440" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Username</label>
              <input className="input" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && connect()} />
            </div>
          </div>
          {error && <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-800">{error}</div>}
          <div className="flex gap-2">
            <button onClick={connect} disabled={!proxyOk || status === 'connecting'}
              className="btn-primary flex items-center gap-2">
              <Plug size={13} />
              {status === 'connecting' ? 'Connecting…' : 'Connect to Prism'}
            </button>
            {!proxyOk && <span className="text-xs text-slate-500 self-center">Start proxy first ↑</span>}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info size={11} />
            Credentials stored in localStorage. Self-signed certificates accepted via proxy.
          </div>
        </div>
      )}

      {/* Connected: data browser */}
      {status === 'connected' && data && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <button onClick={disconnect} className="btn-secondary text-xs py-1 flex items-center gap-1">
              <XCircle size={11} /> Disconnect
            </button>
            <button onClick={connect} className="btn-secondary text-xs py-1 flex items-center gap-1">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          <div className="mt-2">
            {activeTab === 'clusters' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Cluster' },
                  { key: 'version', label: 'Version' },
                  { key: 'nodes', label: 'Nodes' },
                  { key: 'storage', label: 'Total Storage' },
                  { key: 'free', label: 'Free' },
                ]}
                rows={clusterRows}
              />
            )}
            {activeTab === 'containers' && (
              <div className="space-y-3">
                <DataTable
                  columns={[
                    { key: 'name', label: 'Container' },
                    { key: 'used', label: 'Used' },
                    { key: 'max', label: 'Max' },
                    { key: 'compression', label: 'Compress' },
                    { key: 'dedupe', label: 'Dedupe' },
                    {
                      key: 'action', label: '',
                      render: (row) => activeProject ? (
                        <button
                          onClick={() => applyToProject(row.name, activeProject.ahv_network || '')}
                          className="text-[10px] text-primary hover:underline whitespace-nowrap"
                        >
                          ← Set as target
                        </button>
                      ) : null,
                    },
                  ]}
                  rows={containerRows}
                />
              </div>
            )}
            {activeTab === 'networks' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Network' },
                  { key: 'vlan', label: 'VLAN' },
                  { key: 'subnet', label: 'Subnet' },
                  { key: 'uuid', label: 'UUID' },
                  {
                    key: 'action', label: '',
                    render: (row) => activeProject ? (
                      <button
                        onClick={() => applyToProject(activeProject.prism_container || '', row.name)}
                        className="text-[10px] text-primary hover:underline whitespace-nowrap"
                      >
                        ← Set as target
                      </button>
                    ) : null,
                  },
                ]}
                rows={networkRows}
              />
            )}
            {activeTab === 'images' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Image' },
                  { key: 'type', label: 'Type' },
                  { key: 'size', label: 'Size' },
                  { key: 'state', label: 'State' },
                ]}
                rows={imageRows}
              />
            )}
            {activeTab === 'vms' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'VM' },
                  { key: 'power', label: 'State' },
                  { key: 'vcpu', label: 'vCPU' },
                  { key: 'ram', label: 'RAM' },
                  { key: 'ip', label: 'IP' },
                ]}
                rows={vmRows}
              />
            )}
          </div>

          {applyResult && (
            <div className={`text-xs px-3 py-2 rounded border ${applyResult.startsWith('✓') ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-red-400 bg-red-900/20 border-red-800'}`}>
              {applyResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── XENSERVER PANEL ─────────────────────────────────────────────────────────

const LS_XEN = 'nutamigrate_xen_creds';

function XenPanel({ proxyOk }) {
  const { activeProject, refreshProjects } = useApp();
  const [form, setForm] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_XEN)) || {};
      return { host: s.host || 'https://', username: s.username || 'root', password: s.password || '' };
    } catch { return { host: 'https://', username: 'root', password: '' }; }
  });
  const [session, setSession] = useState(null);
  const [hostInfo, setHostInfo] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [xenData, setXenData] = useState(null);
  const [activeTab, setActiveTab] = useState('vms');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [snapshotting, setSnapshotting] = useState({});

  const connect = async () => {
    if (!proxyOk) return;
    setStatus('connecting'); setError('');
    try {
      const res = await xenApi.connect({ host: form.host, username: form.username, password: form.password });
      setSession(res.session);
      setHostInfo(res.hostInfo);

      // Fetch all data
      const d = await xenApi.fetchAll(form.host, res.session);
      setXenData(d);
      setStatus('connected');

      localStorage.setItem(LS_XEN, JSON.stringify({
        host: form.host, username: form.username, password: form.password,
      }));
    } catch (e) {
      setStatus('error'); setError(e.message);
    }
  };

  const disconnect = async () => {
    if (session) { try { await xenApi.logout({ host: form.host, session }); } catch {} }
    setSession(null); setXenData(null); setStatus('idle'); setError('');
  };

  const refresh = async () => {
    if (!session) return;
    setStatus('connecting');
    try {
      const d = await xenApi.fetchAll(form.host, session);
      setXenData(d); setStatus('connected');
    } catch (e) { setStatus('error'); setError(e.message); }
  };

  // Build VM rows with disk info
  const vmRows = xenData ? Object.entries(xenData.vms || {}).map(([ref, vm]) => {
    const diskGb = computeVmDiskGb(vm, xenData.vbds, xenData.vdis);
    const ramGb = Math.round((parseInt(vm.memory_dynamic_max) || 0) / 1073741824);
    return { ref, vm, diskGb, ramGb };
  }) : [];

  const vdiRows = xenData ? Object.entries(xenData.vdis || {}).map(([ref, vdi]) => ({
    ref,
    name: vdi.name_label || '—',
    sizeGb: Math.round((parseInt(vdi.virtual_size) || 0) / 1e9),
    type: vdi.type || '—',
    srName: xenData.srs?.[vdi.SR]?.name_label || '—',
  })).filter((r) => r.sizeGb > 0) : [];

  const srRows = xenData ? Object.entries(xenData.srs || {}).map(([ref, sr]) => ({
    name: sr.name_label || '—',
    type: sr.type || '—',
    sizeGb: Math.round((parseInt(sr.physical_size) || 0) / 1e9),
    freeGb: Math.round((parseInt(sr.physical_size) - parseInt(sr.physical_utilisation) || 0) / 1e9),
    vdis: (sr.VDIs || []).length,
  })) : [];

  const netRows = xenData ? Object.entries(xenData.networks || {}).map(([ref, net]) => ({
    name: net.name_label || '—',
    bridge: net.bridge || '—',
    vifs: (net.VIFs || []).length,
    managed: net.managed ? '✓' : '—',
  })) : [];

  const tabs = [
    { key: 'vms', label: 'VMs', count: vmRows.length },
    { key: 'vdis', label: 'Disks', count: vdiRows.length },
    { key: 'srs', label: 'Storage', count: srRows.length },
    { key: 'networks', label: 'Networks', count: netRows.length },
  ];

  const importVms = async () => {
    if (!activeProject || !xenData) return;
    setImporting(true); setImportResult('');
    let created = 0, skipped = 0;
    try {
      for (const { ref, vm } of vmRows) {
        const machine = xenVmToMachine(ref, vm, xenData.vbds, xenData.vdis, activeProject.id);
        try {
          await api.createMachine(machine);
          created++;
        } catch {
          skipped++;
        }
      }
      await refreshProjects();
      setImportResult(`✓ Imported ${created} VMs${skipped ? ` (${skipped} skipped — duplicates)` : ''}`);
    } catch (e) {
      setImportResult(`✗ ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  const takeSnapshot = async (ref, vmName) => {
    setSnapshotting((s) => ({ ...s, [ref]: true }));
    try {
      const { snapRef } = await xenApi.snapshot({
        host: form.host, session,
        vmRef: ref,
        snapshotName: `nutamigrate-pre-${vmName}-${Date.now()}`,
      });
      alert(`Snapshot created: ${snapRef}`);
    } catch (e) {
      alert(`Snapshot failed: ${e.message}`);
    } finally {
      setSnapshotting((s) => ({ ...s, [ref]: false }));
    }
  };

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <GitBranch size={14} className="text-orange-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">XenServer / Citrix Hypervisor</div>
            <div className="text-xs text-slate-500">XML-RPC API · session-based auth</div>
          </div>
        </div>
        {status === 'connected' && (
          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/20 border border-green-800 px-2 py-1 rounded-full">
            <CheckCircle size={11} /> Connected
          </span>
        )}
        {status === 'connecting' && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw size={11} className="animate-spin" /> {xenData ? 'Refreshing…' : 'Connecting…'}
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/20 border border-red-800 px-2 py-1 rounded-full">
            <XCircle size={11} /> Failed
          </span>
        )}
      </div>

      {/* Connection form */}
      {status !== 'connected' && status !== 'connecting' && (
        <div className="space-y-3">
          <div>
            <label className="label">XenServer Host</label>
            <input className="input font-mono" value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })}
              placeholder="https://10.0.0.10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Username</label>
              <input className="input" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && connect()} />
            </div>
          </div>
          {error && <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-800">{error}</div>}
          <div className="flex gap-2">
            <button onClick={connect} disabled={!proxyOk}
              className="btn-primary flex items-center gap-2">
              <Plug size={13} />
              Connect to XenServer
            </button>
            {!proxyOk && <span className="text-xs text-slate-500 self-center">Start proxy first ↑</span>}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info size={11} />
            Uses XML-RPC API. Self-signed certificates accepted.
          </div>
        </div>
      )}

      {/* Connecting spinner */}
      {status === 'connecting' && !xenData && (
        <div className="flex items-center gap-3 py-6 justify-center text-slate-400 text-xs">
          <RefreshCw size={16} className="animate-spin text-primary" />
          Fetching VMs, disks, networks…
        </div>
      )}

      {/* Connected: data browser */}
      {status === 'connected' && xenData && (
        <div className="space-y-3">
          {/* Host summary */}
          {hostInfo && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-bg-elevated rounded px-3 py-2">
                <div className="text-slate-500 mb-0.5">Host</div>
                <div className="font-mono text-slate-200 truncate">{hostInfo.hostname || '—'}</div>
              </div>
              <div className="bg-bg-elevated rounded px-3 py-2">
                <div className="text-slate-500 mb-0.5">XenServer Version</div>
                <div className="font-mono text-slate-200">{hostInfo.softwareVersion?.product_version || hostInfo.softwareVersion?.platform_version || '—'}</div>
              </div>
              <div className="bg-bg-elevated rounded px-3 py-2">
                <div className="text-slate-500 mb-0.5">CPU Sockets</div>
                <div className="font-mono text-slate-200">{hostInfo.cpuInfo?.cpu_count || '—'}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-2">
              {activeProject && (
                <button onClick={importVms} disabled={importing}
                  className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                  <Download size={12} />
                  {importing ? 'Importing…' : `Import ${vmRows.length} VMs → Inventory`}
                </button>
              )}
              {!activeProject && <span className="text-xs text-slate-500">Select a project to import VMs</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={refresh} className="btn-secondary text-xs py-1 flex items-center gap-1"><RefreshCw size={11} /> Refresh</button>
              <button onClick={disconnect} className="btn-secondary text-xs py-1 flex items-center gap-1"><XCircle size={11} /> Disconnect</button>
            </div>
          </div>

          {importResult && (
            <div className={`text-xs px-3 py-2 rounded border ${importResult.startsWith('✓') ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-red-400 bg-red-900/20 border-red-800'}`}>
              {importResult}
            </div>
          )}

          <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          <div className="mt-2">
            {activeTab === 'vms' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-bg-surface">
                    <tr>
                      {['VM Name', 'UUID', 'State', 'vCPU', 'RAM', 'Disk', 'Actions'].map((h) => (
                        <th key={h} className="table-header text-left px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vmRows.map(({ ref, vm, diskGb, ramGb }) => (
                      <tr key={ref} className="border-t border-bg-border hover:bg-bg-elevated transition-colors">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-100">{vm.name_label}</td>
                        <td className="px-3 py-2 font-mono text-slate-500 text-[10px]">{(vm.uuid || '').slice(0, 12)}…</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${vm.power_state === 'Running' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                            {vm.power_state}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">{vm.VCPUs_at_startup}</td>
                        <td className="px-3 py-2 font-mono text-slate-300">{ramGb} GB</td>
                        <td className="px-3 py-2 font-mono text-slate-300">{diskGb} GB</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => takeSnapshot(ref, vm.name_label)}
                            disabled={!!snapshotting[ref]}
                            className="text-[10px] text-primary hover:underline disabled:opacity-50"
                          >
                            {snapshotting[ref] ? '…' : '📸 Snapshot'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {vmRows.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-slate-500">No VMs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'vdis' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'VDI Name' },
                  { key: 'sizeGb', label: 'Size (GB)', render: (r) => `${r.sizeGb} GB` },
                  { key: 'type', label: 'Type' },
                  { key: 'srName', label: 'Storage Repo' },
                ]}
                rows={vdiRows}
              />
            )}
            {activeTab === 'srs' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Storage Repo' },
                  { key: 'type', label: 'Type' },
                  { key: 'sizeGb', label: 'Size (GB)', render: (r) => `${r.sizeGb} GB` },
                  { key: 'freeGb', label: 'Free (GB)', render: (r) => `${r.freeGb} GB` },
                  { key: 'vdis', label: 'VDIs' },
                ]}
                rows={srRows}
              />
            )}
            {activeTab === 'networks' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Network' },
                  { key: 'bridge', label: 'Bridge' },
                  { key: 'vifs', label: 'VIFs' },
                  { key: 'managed', label: 'Managed' },
                ]}
                rows={netRows}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Connections() {
  const [proxyStatus, setProxyStatus] = useState('checking');

  const checkProxyStatus = useCallback(async () => {
    setProxyStatus('checking');
    const ok = await checkProxy();
    setProxyStatus(ok ? 'ok' : 'error');
  }, []);

  useEffect(() => { checkProxyStatus(); }, []);

  // Auto-recheck every 15s if not ok
  useEffect(() => {
    if (proxyStatus === 'ok') return;
    const t = setInterval(checkProxyStatus, 15_000);
    return () => clearInterval(t);
  }, [proxyStatus]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Connections</h1>
        <p className="text-sm text-slate-400">Connect to Prism Element and XenServer to pull live inventory and auto-populate migration data.</p>
      </div>

      <ProxyBanner status={proxyStatus} onRecheck={checkProxyStatus} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PrismPanel proxyOk={proxyStatus === 'ok'} />
        <XenPanel proxyOk={proxyStatus === 'ok'} />
      </div>

      {/* How it works callout */}
      <div className="card p-4 bg-bg-base">
        <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Recommended Workflow</div>
        <div className="flex items-start gap-3 text-xs text-slate-400 flex-wrap">
          {[
            { n: '1', t: 'Start proxy', d: 'node proxy/server.js on your laptop' },
            { n: '2', t: 'Connect XenServer', d: 'Authenticate + pull VM inventory' },
            { n: '3', t: 'Import VMs', d: 'Populates Inventory with real specs' },
            { n: '4', t: 'Connect Prism', d: 'Select target container + network' },
            { n: '5', t: 'Generate Scripts', d: 'Scripts use real UUIDs from XenServer' },
          ].map((step, i) => (
            <React.Fragment key={step.n}>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <div className="text-slate-200 font-medium">{step.t}</div>
                  <div className="text-slate-500">{step.d}</div>
                </div>
              </div>
              {i < 4 && <ArrowRight size={14} className="text-slate-700 mt-1 hidden xl:block" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
