import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Server, Map, Terminal, CheckSquare, BookOpen,
  ChevronDown, Plus, Settings, AlertTriangle, Cpu, Database, RefreshCw,
  Plug, ShieldCheck,
} from 'lucide-react';
import { api } from './utils/api';
import { checkProxy } from './utils/proxyApi';

import Dashboard   from './pages/Dashboard';
import Inventory   from './pages/Inventory';
import Planner     from './pages/Planner';
import Scripts     from './pages/Scripts';
import Progress    from './pages/Progress';
import Guide       from './pages/Guide';
import Connections from './pages/Connections';
import PreMigration from './pages/PreMigration';

export const AppContext = createContext(null);
export function useApp() { return useContext(AppContext); }

const NAV_ITEMS = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/inventory',    icon: Server,          label: 'Inventory' },
  { path: '/connections',  icon: Plug,            label: 'Connections' },
  { path: '/planner',      icon: Map,             label: 'Planner' },
  { path: '/pre-migration',icon: ShieldCheck,     label: 'Pre-Migration' },
  { path: '/scripts',      icon: Terminal,        label: 'Scripts' },
  { path: '/progress',     icon: CheckSquare,     label: 'Progress' },
  { path: '/guide',        icon: BookOpen,        label: 'Guide' },
];

function ProjectSelector({ projects, activeProject, onSelect, onCreate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-bg-elevated border border-bg-border rounded-lg text-sm hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu size={14} className="text-primary flex-shrink-0" />
          <span className="truncate text-slate-200 font-medium">
            {activeProject ? activeProject.name : 'Select Project'}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-bg-border rounded-lg shadow-xl z-50 overflow-hidden">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-bg-base transition-colors flex items-center justify-between gap-2 ${activeProject?.id === p.id ? 'text-primary border-l-2 border-primary pl-[10px]' : 'text-slate-300'}`}
            >
              <span className="truncate">{p.name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{p.machine_count || 0}m</span>
            </button>
          ))}
          <button
            onClick={() => { onCreate(); setOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm text-primary hover:bg-bg-base transition-colors border-t border-bg-border flex items-center gap-2"
          >
            <Plus size={13} />
            New Project
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [projects, setProjects]           = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [proxyOnline, setProxyOnline]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const loadProjects = async () => {
    try {
      const ps = await api.getProjects();
      setProjects(ps);
      if (ps.length > 0 && !activeProject) setActiveProject(ps[0]);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  // Poll proxy status for header indicator
  useEffect(() => {
    checkProxy().then(setProxyOnline);
    const t = setInterval(() => checkProxy().then(setProxyOnline), 30_000);
    return () => clearInterval(t);
  }, []);

  const ctx = { projects, activeProject, setActiveProject, refreshProjects: loadProjects };

  return (
    <AppContext.Provider value={ctx}>
      <div className="flex h-screen overflow-hidden" style={{ background: '#070b14' }}>
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 flex flex-col border-r border-bg-border bg-bg-surface">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-bg-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 glow-primary">
                <Database size={16} className="text-bg-base font-bold" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100 leading-tight">NutaMigrate</div>
                <div className="text-xs text-slate-500 leading-tight">AHV Migration Assistant</div>
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div className="px-3 py-3 border-b border-bg-border">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Project</div>
            <ProjectSelector
              projects={projects}
              activeProject={activeProject}
              onSelect={setActiveProject}
              onCreate={() => setShowNewProject(true)}
            />
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary bg-opacity-15 text-primary border border-primary border-opacity-30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer info */}
          <div className="px-4 py-3 border-t border-bg-border">
            {activeProject && (
              <div className="text-xs text-slate-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>Machines</span>
                  <span className="text-slate-300">{activeProject.machine_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Complete</span>
                  <span className="text-green-400">{activeProject.completed_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Disk</span>
                  <span className="text-slate-300">{activeProject.total_disk_gb ? `${activeProject.total_disk_gb} GB` : '—'}</span>
                </div>
              </div>
            )}
            {/* Proxy status indicator */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">v2.0 · PGTEK</span>
              <span
                title={proxyOnline ? 'Proxy connected' : 'Proxy offline — start proxy/server.js'}
                className={`flex items-center gap-1 ${proxyOnline ? 'text-green-500' : 'text-slate-600'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${proxyOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
                {proxyOnline ? 'Proxy' : 'No proxy'}
              </span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw size={24} className="text-primary animate-spin" />
            </div>
          ) : (
            <Routes>
              <Route path="/"              element={<Dashboard onNewProject={() => setShowNewProject(true)} />} />
              <Route path="/inventory"     element={<Inventory />} />
              <Route path="/connections"   element={<Connections />} />
              <Route path="/planner"       element={<Planner />} />
              <Route path="/pre-migration" element={<PreMigration />} />
              <Route path="/scripts"       element={<Scripts />} />
              <Route path="/progress"      element={<Progress />} />
              <Route path="/guide"         element={<Guide />} />
            </Routes>
          )}
        </main>
      </div>

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={async (p) => {
            await loadProjects();
            setActiveProject(p);
            setShowNewProject(false);
            navigate('/inventory');
          }}
        />
      )}
    </AppContext.Provider>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', customer: '', source_type: 'xenserver',
    prism_ip: '', prism_container: '', ahv_network: '',
    xenserver_host: '', staging_path: '/staging', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.customer) { setError('Project name and customer are required'); return; }
    setSaving(true);
    try {
      const p = await api.createProject(form);
      onCreated(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-bg-border rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">New Migration Project</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-wave-red-bg border border-wave-red-ring rounded-md px-3 py-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Project Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="PGTEK-Customer-AHV-Migration" />
            </div>
            <div>
              <label className="label">Customer *</label>
              <input className="input" value={form.customer} onChange={(e) => setForm({...form, customer: e.target.value})} placeholder="Acme Corporation" />
            </div>
          </div>
          <div>
            <label className="label">Source Type</label>
            <select className="select" value={form.source_type} onChange={(e) => setForm({...form, source_type: e.target.value})}>
              <option value="xenserver">XenServer / Citrix Hypervisor</option>
              <option value="physical_windows">Physical Windows (P2V)</option>
              <option value="physical_linux">Physical Linux (P2V)</option>
              <option value="mixed">Mixed (XenServer + Physical)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prism Element IP</label>
              <input className="input" value={form.prism_ip} onChange={(e) => setForm({...form, prism_ip: e.target.value})} placeholder="10.0.0.1" />
            </div>
            <div>
              <label className="label">Storage Container</label>
              <input className="input" value={form.prism_container} onChange={(e) => setForm({...form, prism_container: e.target.value})} placeholder="default-container-XXXXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">AHV Network Name</label>
              <input className="input" value={form.ahv_network} onChange={(e) => setForm({...form, ahv_network: e.target.value})} placeholder="VLAN100" />
            </div>
            <div>
              <label className="label">XenServer Host IP</label>
              <input className="input" value={form.xenserver_host} onChange={(e) => setForm({...form, xenserver_host: e.target.value})} placeholder="10.0.0.10" />
            </div>
          </div>
          <div>
            <label className="label">Staging Path</label>
            <input className="input" value={form.staging_path} onChange={(e) => setForm({...form, staging_path: e.target.value})} placeholder="/staging" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none h-20" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Customer notes, special requirements..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
