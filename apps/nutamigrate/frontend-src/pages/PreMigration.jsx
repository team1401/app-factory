import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Play, PlayCircle, HardDrive, Monitor, Info, Eye, EyeOff,
} from 'lucide-react';
import { useApp } from '../App';
import { api } from '../utils/api';
import { checkProxy, virtio as virtioApi } from '../utils/proxyApi';

const LS_CREDS = 'nutamigrate_premig_creds';

// ─── Status badge ─────────────────────────────────────────────────────────────

function VirtioStatusBadge({ status }) {
  const configs = {
    unknown:    { icon: '❓', label: 'Unknown',    cls: 'text-slate-400 bg-slate-800 border-slate-700' },
    checking:   { icon: '⟳', label: 'Checking…',  cls: 'text-yellow-400 bg-yellow-900/20 border-yellow-800 animate-pulse' },
    installed:  { icon: '✅', label: 'Installed',  cls: 'text-green-400 bg-green-900/20 border-green-800' },
    missing:    { icon: '⚠️', label: 'Missing',    cls: 'text-orange-400 bg-orange-900/20 border-orange-800' },
    deploying:  { icon: '🔄', label: 'Deploying…', cls: 'text-blue-400 bg-blue-900/20 border-blue-800 animate-pulse' },
    success:    { icon: '✅', label: 'Deployed!',  cls: 'text-green-400 bg-green-900/20 border-green-800' },
    error:      { icon: '✗',  label: 'Failed',     cls: 'text-red-400 bg-red-900/20 border-red-800' },
  };
  const c = configs[status] || configs.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium ${c.cls}`}>
      <span>{c.icon}</span>{c.label}
    </span>
  );
}

// ─── Credentials Modal ────────────────────────────────────────────────────────

function CredsModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { username: 'Administrator', password: '', port: 5985, useSSH: false, sshPort: 22 });
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-bg-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Windows Credentials</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            Credentials stored in localStorage. Use a migration service account with limited scope.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Username</label>
              <input className="input" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-8" type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" checked={form.useSSH}
                onChange={(e) => setForm({ ...form, useSSH: e.target.checked })}
                className="accent-primary" />
              Use OpenSSH instead of WinRM
            </label>
            {form.useSSH ? (
              <div>
                <label className="label">SSH Port</label>
                <input className="input w-28 font-mono" type="number" value={form.sshPort}
                  onChange={(e) => setForm({ ...form, sshPort: parseInt(e.target.value) })} />
              </div>
            ) : (
              <div>
                <label className="label">WinRM Port</label>
                <input className="input w-28 font-mono" type="number" value={form.port}
                  onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) })} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={() => onSave(form)} className="btn-primary">Save Credentials</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PreMigration() {
  const { activeProject } = useApp();
  const [proxyStatus, setProxyStatus] = useState('checking');
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [virtioIso, setVirtioIso] = useState(localStorage.getItem('nutamigrate_virtio_iso') || '');
  const [creds, setCreds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_CREDS)) || null; } catch { return null; }
  });
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [virtioStatus, setVirtioStatus] = useState({});   // { id: 'unknown' | 'checking' | 'installed' | 'missing' | 'deploying' | 'success' | 'error' }
  const [virtioErrors, setVirtioErrors] = useState({});   // { id: errorString }
  const [deployAll, setDeployAll] = useState(false);

  // Check proxy
  useEffect(() => {
    checkProxy().then((ok) => setProxyStatus(ok ? 'ok' : 'error'));
    const t = setInterval(() => checkProxy().then((ok) => setProxyStatus(ok ? 'ok' : 'error')), 15_000);
    return () => clearInterval(t);
  }, []);

  // Load machines
  useEffect(() => {
    if (!activeProject) return;
    setLoading(true);
    api.getMachines(activeProject.id).then((ms) => {
      setMachines(ms);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeProject?.id]);

  // Filter to Windows machines
  const windowsMachines = machines.filter((m) => {
    const os = (m.os || '').toLowerCase();
    const type = (m.source_type || '').toLowerCase();
    return type === 'physical_windows' || type === 'xenserver' ||
           /windows|server 20[01][0-9]|server 202/.test(os);
  });

  const saveCreds = (c) => {
    setCreds(c);
    localStorage.setItem(LS_CREDS, JSON.stringify(c));
    setShowCredsModal(false);
  };

  const saveIso = (v) => {
    setVirtioIso(v);
    localStorage.setItem('nutamigrate_virtio_iso', v);
  };

  const checkVirtio = useCallback(async (machine) => {
    if (!creds || !machine.ip) return;
    setVirtioStatus((s) => ({ ...s, [machine.id]: 'checking' }));
    setVirtioErrors((e) => ({ ...e, [machine.id]: '' }));
    try {
      const result = await virtioApi.check({
        host: machine.ip,
        username: creds.username,
        password: creds.password,
        port: creds.port || 5985,
        useSSH: creds.useSSH || false,
        sshPort: creds.sshPort || 22,
      });
      setVirtioStatus((s) => ({ ...s, [machine.id]: result.hasVirtio ? 'installed' : 'missing' }));
    } catch (e) {
      setVirtioStatus((s) => ({ ...s, [machine.id]: 'error' }));
      setVirtioErrors((ev) => ({ ...ev, [machine.id]: e.message }));
    }
  }, [creds]);

  const deployVirtio = useCallback(async (machine) => {
    if (!creds || !machine.ip || !virtioIso) return;
    setVirtioStatus((s) => ({ ...s, [machine.id]: 'deploying' }));
    setVirtioErrors((e) => ({ ...e, [machine.id]: '' }));
    try {
      const result = await virtioApi.deploy({
        host: machine.ip,
        username: creds.username,
        password: creds.password,
        port: creds.port || 5985,
        useSSH: creds.useSSH || false,
        sshPort: creds.sshPort || 22,
        isoPath: virtioIso,
      });
      setVirtioStatus((s) => ({ ...s, [machine.id]: result.success ? 'success' : 'error' }));
      if (!result.success) {
        setVirtioErrors((ev) => ({ ...ev, [machine.id]: result.output || 'Unknown error' }));
      }
    } catch (e) {
      setVirtioStatus((s) => ({ ...s, [machine.id]: 'error' }));
      setVirtioErrors((ev) => ({ ...ev, [machine.id]: e.message }));
    }
  }, [creds, virtioIso]);

  const checkAll = async () => {
    for (const m of windowsMachines) {
      await checkVirtio(m);
    }
  };

  const deployAllVms = async () => {
    setDeployAll(true);
    for (const m of windowsMachines.filter((m) => virtioStatus[m.id] === 'missing' || virtioStatus[m.id] === 'error' || !virtioStatus[m.id])) {
      await deployVirtio(m);
    }
    setDeployAll(false);
  };

  if (!activeProject) {
    return <div className="p-8 text-slate-500 text-center">Select a project to view pre-migration tasks.</div>;
  }

  const installedCount = Object.values(virtioStatus).filter((s) => s === 'installed' || s === 'success').length;
  const missingCount   = Object.values(virtioStatus).filter((s) => s === 'missing').length;
  const unknownCount   = windowsMachines.filter((m) => !virtioStatus[m.id] || virtioStatus[m.id] === 'unknown').length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Pre-Migration</h1>
          <p className="text-sm text-slate-400">{windowsMachines.length} Windows machines · VirtIO driver deployment</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCredsModal(true)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Shield size={14} />
            {creds ? `Creds: ${creds.username}` : 'Set Credentials'}
          </button>
        </div>
      </div>

      {/* Proxy warning */}
      {proxyStatus !== 'ok' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/20 border border-yellow-800 rounded text-xs text-yellow-400">
          <AlertTriangle size={13} />
          Proxy not connected — start proxy/server.js and enter its access token on the Connections page to enable VirtIO operations
        </div>
      )}

      {/* Status summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Windows VMs', value: windowsMachines.length, cls: 'text-slate-100' },
          { label: '✅ VirtIO OK', value: installedCount, cls: 'text-green-400' },
          { label: '⚠️ Missing', value: missingCount, cls: 'text-orange-400' },
          { label: '❓ Unknown', value: unknownCount, cls: 'text-slate-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card p-3 text-center">
            <div className="text-slate-500 text-xs mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Config row */}
      <div className="card p-4 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">VirtIO ISO Path (on target Windows machine)</label>
            <input
              className="input font-mono"
              value={virtioIso}
              onChange={(e) => saveIso(e.target.value)}
              placeholder="C:\Temp\virtio-win.iso  or  \\server\share\virtio-win.iso"
            />
            <div className="text-xs text-slate-500 mt-1">
              Download from <a href="https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/" className="text-primary hover:underline" target="_blank" rel="noreferrer">fedorapeople.org</a> and place on each source machine
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <div className="flex gap-2">
              <button
                onClick={checkAll}
                disabled={!creds || !proxyStatus === 'ok'}
                className="btn-secondary flex items-center gap-2 text-sm flex-1"
              >
                <RefreshCw size={14} /> Check All
              </button>
              <button
                onClick={deployAllVms}
                disabled={!creds || !virtioIso || proxyStatus !== 'ok' || deployAll}
                className="btn-primary flex items-center gap-2 text-sm flex-1"
              >
                <PlayCircle size={14} />
                {deployAll ? 'Deploying…' : 'Deploy All Missing'}
              </button>
            </div>
            {!creds && <div className="text-xs text-slate-500">Set credentials above to enable operations</div>}
          </div>
        </div>
      </div>

      {/* VM table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface">
              <tr>
                {['Machine', 'IP', 'OS', 'vCPU', 'RAM', 'Disk', 'Source', 'VirtIO Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-500">Loading…</td></tr>
              )}
              {!loading && windowsMachines.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Monitor size={32} className="text-slate-700 mx-auto mb-3" />
                    <div className="text-slate-500 text-sm">No Windows machines in this project.</div>
                    <div className="text-slate-600 text-xs mt-1">Add machines in Inventory, or import from XenServer in Connections.</div>
                  </td>
                </tr>
              )}
              {!loading && windowsMachines.map((m) => {
                const st = virtioStatus[m.id] || 'unknown';
                const err = virtioErrors[m.id] || '';
                const canDeploy = creds && m.ip && virtioIso && proxyStatus === 'ok' && !['deploying', 'checking'].includes(st);
                const canCheck  = creds && m.ip && proxyStatus === 'ok' && !['checking', 'deploying'].includes(st);

                return (
                  <React.Fragment key={m.id}>
                    <tr className="table-row">
                      <td className="table-cell">
                        <div className="font-mono font-semibold text-slate-100">{m.name}</div>
                        {m.notes && <div className="text-xs text-slate-500 truncate max-w-36">{m.notes}</div>}
                      </td>
                      <td className="table-cell font-mono text-slate-400 text-xs">{m.ip || <span className="text-red-400">no IP</span>}</td>
                      <td className="table-cell text-slate-300 text-xs">{m.os || '—'}</td>
                      <td className="table-cell font-mono text-slate-300 text-center text-xs">{m.vcpu}</td>
                      <td className="table-cell font-mono text-slate-300 text-xs">{m.ram_gb} GB</td>
                      <td className="table-cell font-mono text-slate-300 text-xs">{m.disk_gb} GB</td>
                      <td className="table-cell text-xs text-slate-400">
                        {m.source_type === 'xenserver' ? '🖥️ XenServer' : m.source_type === 'physical_windows' ? '💻 Physical' : m.source_type}
                      </td>
                      <td className="table-cell"><VirtioStatusBadge status={st} /></td>
                      <td className="table-cell">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => checkVirtio(m)}
                            disabled={!canCheck}
                            title="Check VirtIO driver status"
                            className="px-2 py-1 text-xs rounded bg-bg-elevated border border-bg-border text-slate-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                          >
                            {st === 'checking' ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                          </button>
                          {(st === 'missing' || st === 'unknown' || st === 'error') && (
                            <button
                              onClick={() => deployVirtio(m)}
                              disabled={!canDeploy}
                              title="Deploy VirtIO drivers"
                              className="px-2 py-1 text-xs rounded bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors flex items-center gap-1"
                            >
                              <Play size={10} /> Deploy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {err && (
                      <tr>
                        <td colSpan={9} className="px-4 pb-2">
                          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-1.5 font-mono truncate">
                            {err}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VirtIO notes */}
      <div className="card p-4 space-y-3 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 flex items-center gap-2"><Info size={13} /> VirtIO Driver Notes</div>
        <div className="space-y-1.5">
          <div>• <strong className="text-slate-200">Required drivers:</strong> vioscsi (storage), NetKVM (network), Balloon (memory management)</div>
          <div>• <strong className="text-slate-200">Install before migration</strong> — machines that boot on AHV without VirtIO will have no disk/network visibility</div>
          <div>• <strong className="text-slate-200">XenServer VMs</strong> — prefer using XenServer API to mount ISO via Connections → XenServer → VM → 📸 Snapshot, then start guest agent install</div>
          <div>• <strong className="text-slate-200">Physical Windows</strong> — ISO must already be on the machine at the path specified above</div>
          <div>• <strong className="text-slate-200">WinRM</strong> — must be enabled: <code className="bg-bg-base px-1 rounded font-mono">winrm quickconfig -y</code> on each machine</div>
          <div>• <strong className="text-slate-200">OpenSSH alternative</strong> — <code className="bg-bg-base px-1 rounded font-mono">Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0</code></div>
        </div>
      </div>

      {showCredsModal && (
        <CredsModal initial={creds} onClose={() => setShowCredsModal(false)} onSave={saveCreds} />
      )}
    </div>
  );
}
