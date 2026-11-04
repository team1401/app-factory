/**
 * proxyApi — calls the local NutaMigrate proxy at http://localhost:3131
 * All calls POST JSON; credentials are included per-request.
 */

const PROXY = 'http://localhost:3131';
const TOKEN_KEY = 'nutamigrate_proxy_token';

/** Access token printed by the proxy at startup; required on every request. */
export function getProxyToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

export function setProxyToken(token) {
  try { localStorage.setItem(TOKEN_KEY, (token || '').trim()); } catch {}
}

function authHeaders() {
  return { 'X-NutaMigrate-Token': getProxyToken() };
}

async function post(path, body) {
  const res = await fetch(`${PROXY}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function checkProxy() {
  try {
    const r = await fetch(`${PROXY}/health`, { headers: authHeaders(), signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

// ─── Prism ──────────────────────────────────────────────────────────────────

export const prism = {
  clusters:   (creds) => post('/api/prism/clusters',   creds),
  containers: (creds) => post('/api/prism/containers', creds),
  networks:   (creds) => post('/api/prism/networks',   creds),
  images:     (creds) => post('/api/prism/images',     creds),
  vms:        (creds) => post('/api/prism/vms',        creds),

  /** Pull all Prism data at once */
  async fetchAll(creds) {
    const [clusters, containers, networks, images, vms] = await Promise.all([
      prism.clusters(creds),
      prism.containers(creds),
      prism.networks(creds),
      prism.images(creds),
      prism.vms(creds),
    ]);
    return { clusters, containers, networks, images, vms };
  },
};

// ─── XenServer ──────────────────────────────────────────────────────────────

export const xen = {
  connect:  (body) => post('/api/xenserver/connect',  body),
  logout:   (body) => post('/api/xenserver/logout',   body),
  vms:      (body) => post('/api/xenserver/vms',      body),
  vdis:     (body) => post('/api/xenserver/vdis',     body),
  vbds:     (body) => post('/api/xenserver/vbds',     body),
  srs:      (body) => post('/api/xenserver/srs',      body),
  networks: (body) => post('/api/xenserver/networks', body),
  hosts:    (body) => post('/api/xenserver/hosts',    body),
  snapshot: (body) => post('/api/xenserver/snapshot', body),
  mountIso: (body) => post('/api/xenserver/mount-iso', body),

  /** Pull everything needed for VM import */
  async fetchAll(host, session) {
    const base = { host, session };
    const [vms, vdis, vbds, srs, networks] = await Promise.all([
      xen.vms(base),
      xen.vdis(base),
      xen.vbds(base),
      xen.srs(base),
      xen.networks(base),
    ]);
    return { vms, vdis, vbds, srs, networks };
  },
};

/**
 * Compute total disk GB for a XenServer VM given vbds + vdis maps.
 * Returns 0 if no disks found.
 */
export function computeVmDiskGb(vm, vbds, vdis) {
  let totalBytes = 0;
  for (const vbdRef of vm.VBDs || []) {
    const vbd = vbds?.[vbdRef];
    if (!vbd || vbd.type === 'CD' || vbd.empty) continue;
    const vdi = vdis?.[vbd.VDI];
    if (vdi?.virtual_size) totalBytes += parseInt(vdi.virtual_size) || 0;
  }
  return Math.round(totalBytes / 1e9);
}

/**
 * Map a XenServer VM record to a NutaMigrate machine shape.
 */
export function xenVmToMachine(vmRef, vm, vbds, vdis, projectId) {
  const ramGb = Math.round((parseInt(vm.memory_dynamic_max) || 0) / 1073741824);
  const diskGb = computeVmDiskGb(vm, vbds, vdis);
  const vcpu = parseInt(vm.VCPUs_at_startup) || parseInt(vm.VCPUs_max) || 1;

  // Detect OS
  const label = (vm.name_label || '').toLowerCase();
  let osGuess = vm.name_label || '';
  let sourceType = 'xenserver';
  if (/win|2008|2012|2016|2019|2022/.test(label)) sourceType = 'xenserver';

  // Detect wave by power state
  const wave = vm.power_state === 'Running' ? 'green' : 'yellow';

  return {
    project_id: projectId,
    name: vm.name_label || vmRef.slice(-8),
    ip: '',
    os: osGuess,
    vcpu,
    ram_gb: ramGb || 1,
    disk_gb: diskGb || 20,
    wave,
    source_type: sourceType,
    machine_role: 'generic',
    notes: `XenServer UUID: ${vm.uuid || ''}. ${vm.name_description || ''}`.trim(),
    xen_ref: vmRef,
    xen_uuid: vm.uuid,
    xen_power_state: vm.power_state,
  };
}

// ─── SSH Scanner ─────────────────────────────────────────────────────────────

export function scan(body) {
  return post('/api/scan', body);
}

// ─── VirtIO ──────────────────────────────────────────────────────────────────

export const virtio = {
  check:  (body) => post('/api/virtio/check',  body),
  deploy: (body) => post('/api/virtio/deploy', body),
};
