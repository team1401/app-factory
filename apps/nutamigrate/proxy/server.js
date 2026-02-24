'use strict';

/**
 * NutaMigrate Proxy Server — port 3131
 *
 * Handles:
 *  - Prism Element API (HTTPS, self-signed certs, Basic auth)
 *  - XenServer XML-RPC (session-based, full XML-RPC serialization)
 *  - SSH source machine scanning (Linux)
 *  - WinRM VirtIO check & deploy (Windows)
 */

const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { Client: SSHClient } = require('ssh2');

const app = express();
const PORT = 3131;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', app: 'NutaMigrate Proxy' });
});

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────

// Axios agent that ignores self-signed TLS certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function prismAxios(prismUrl, username, password) {
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  return axios.create({
    baseURL: prismUrl,
    httpsAgent,
    timeout: 30_000,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

// ─────────────────────────────────────────────
// PRISM ELEMENT v2 API PROXY
// ─────────────────────────────────────────────

async function prismGet(prismUrl, username, password, path) {
  const client = prismAxios(prismUrl, username, password);
  const r = await client.get(`/api/nutanix/v2.0/${path}`);
  return r.data;
}

app.post('/api/prism/clusters', async (req, res) => {
  try {
    const { prismUrl, username, password } = req.body;
    res.json(await prismGet(prismUrl, username, password, 'clusters/'));
  } catch (e) {
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

app.post('/api/prism/containers', async (req, res) => {
  try {
    const { prismUrl, username, password } = req.body;
    res.json(await prismGet(prismUrl, username, password, 'storage_containers/'));
  } catch (e) {
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

app.post('/api/prism/networks', async (req, res) => {
  try {
    const { prismUrl, username, password } = req.body;
    res.json(await prismGet(prismUrl, username, password, 'networks/'));
  } catch (e) {
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

app.post('/api/prism/images', async (req, res) => {
  try {
    const { prismUrl, username, password } = req.body;
    res.json(await prismGet(prismUrl, username, password, 'images/'));
  } catch (e) {
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

app.post('/api/prism/vms', async (req, res) => {
  try {
    const { prismUrl, username, password } = req.body;
    res.json(await prismGet(prismUrl, username, password, 'vms/'));
  } catch (e) {
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

// ─────────────────────────────────────────────
// XENSERVER XML-RPC ENGINE
// ─────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (tagName) => ['member', 'param'].includes(tagName),
  parseAttributeValue: false,
});

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function serializeValue(v) {
  if (v === null || v === undefined) return '<value><nil/></value>';
  if (typeof v === 'boolean') return `<value><boolean>${v ? 1 : 0}</boolean></value>`;
  if (typeof v === 'number') {
    return Number.isInteger(v)
      ? `<value><int>${v}</int></value>`
      : `<value><double>${v}</double></value>`;
  }
  if (Array.isArray(v)) {
    return `<value><array><data>${v.map(serializeValue).join('')}</data></array></value>`;
  }
  if (typeof v === 'object') {
    const members = Object.entries(v)
      .map(([k, val]) => `<member><name>${escapeXml(k)}</name>${serializeValue(val)}</member>`)
      .join('');
    return `<value><struct>${members}</struct></value>`;
  }
  return `<value><string>${escapeXml(String(v))}</string></value>`;
}

function buildXmlRpc(method, params) {
  const paramsXml = params.map((p) => `<param>${serializeValue(p)}</param>`).join('');
  return `<?xml version="1.0"?><methodCall><methodName>${escapeXml(method)}</methodName><params>${paramsXml}</params></methodCall>`;
}

/**
 * Recursively parse an XML-RPC <value> node as returned by fast-xml-parser.
 * The node is the JS object representation of a <value> element's children.
 */
function parseXmlRpcValue(node) {
  if (node === null || node === undefined) return null;
  if (typeof node !== 'object') return node; // bare string/number from parseTagValue

  // Detect typed value
  if ('string' in node) return String(node.string ?? '');
  if ('int' in node)    return parseInt(node.int, 10);
  if ('i4' in node)     return parseInt(node.i4, 10);
  if ('i8' in node)     return parseInt(node.i8, 10);
  if ('double' in node) return parseFloat(node.double);
  if ('boolean' in node) return node.boolean === 1 || node.boolean === '1' || node.boolean === true;
  if ('nil' in node)    return null;
  if ('base64' in node) return String(node.base64);
  if ('dateTime.iso8601' in node) return String(node['dateTime.iso8601']);

  if ('array' in node) {
    const raw = node.array?.data?.value;
    if (!raw) return [];
    return (Array.isArray(raw) ? raw : [raw]).map(parseXmlRpcValue);
  }

  if ('struct' in node) {
    const members = node.struct?.member;
    if (!members) return {};
    const result = {};
    const arr = Array.isArray(members) ? members : [members];
    for (const m of arr) {
      if (m && m.name !== undefined) {
        result[String(m.name)] = parseXmlRpcValue(m.value);
      }
    }
    return result;
  }

  // Fallback: plain text node
  if ('#text' in node) return String(node['#text']);
  return node;
}

async function xenCall(host, method, params) {
  const xml = buildXmlRpc(method, params);
  const url = `${host}/xmlrpc/v2`;

  const response = await axios.post(url, xml, {
    httpsAgent,
    timeout: 60_000,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    responseType: 'text',
    maxContentLength: 50 * 1024 * 1024, // XenServer can return very large records
  });

  const parsed = xmlParser.parse(response.data);
  const methodResponse = parsed?.methodResponse;

  // Fault?
  if (methodResponse?.fault) {
    const fault = parseXmlRpcValue(methodResponse.fault?.value);
    throw new Error(
      (typeof fault === 'object' ? fault?.faultString : String(fault)) || 'XenServer XML-RPC fault'
    );
  }

  const rawParam = methodResponse?.params?.param;
  const firstParam = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const value = parseXmlRpcValue(firstParam?.value);

  // XenServer wraps everything: { Status: 'Success'|'Failure', Value: ..., ErrorDescription: [...] }
  if (value && typeof value === 'object' && 'Status' in value) {
    if (value.Status === 'Failure') {
      const desc = value.ErrorDescription;
      throw new Error(Array.isArray(desc) ? desc.join(': ') : String(desc));
    }
    return value.Value !== undefined ? value.Value : value;
  }

  return value;
}

// XenServer routes
app.post('/api/xenserver/connect', async (req, res) => {
  try {
    const { host, username, password } = req.body;
    const session = await xenCall(host, 'session.login_with_password', [
      username, password, '2.0', 'nutamigrate',
    ]);
    // Also pull basic host info
    const hosts = await xenCall(host, 'host.get_all_records', [session]);
    const hostInfo = Object.values(hosts || {})[0] || {};
    res.json({
      session,
      host,
      hostInfo: {
        hostname: hostInfo.hostname || hostInfo.name_label || '',
        softwareVersion: hostInfo.software_version || {},
        cpuInfo: hostInfo.cpu_info || {},
        memory: hostInfo.memory_total,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/logout', async (req, res) => {
  try {
    const { host, session } = req.body;
    await xenCall(host, 'session.logout', [session]);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: true }); // best-effort
  }
});

app.post('/api/xenserver/vms', async (req, res) => {
  try {
    const { host, session } = req.body;
    const allRecords = await xenCall(host, 'VM.get_all_records', [session]);
    // Filter: exclude templates and Dom0
    const vms = {};
    for (const [ref, vm] of Object.entries(allRecords || {})) {
      if (!vm.is_a_template && !vm.is_control_domain) {
        vms[ref] = vm;
      }
    }
    res.json(vms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/vdis', async (req, res) => {
  try {
    const { host, session } = req.body;
    const records = await xenCall(host, 'VDI.get_all_records', [session]);
    // Filter out ISOs and CD drives
    const vdis = {};
    for (const [ref, vdi] of Object.entries(records || {})) {
      if (vdi.type !== 'User' && vdi.type !== 'user' && vdi.content_type !== 'iso') {
        // include all non-iso VDIs
      }
      vdis[ref] = vdi;
    }
    res.json(vdis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/vbds', async (req, res) => {
  try {
    const { host, session } = req.body;
    const records = await xenCall(host, 'VBD.get_all_records', [session]);
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/srs', async (req, res) => {
  try {
    const { host, session } = req.body;
    const records = await xenCall(host, 'SR.get_all_records', [session]);
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/networks', async (req, res) => {
  try {
    const { host, session } = req.body;
    const records = await xenCall(host, 'network.get_all_records', [session]);
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/hosts', async (req, res) => {
  try {
    const { host, session } = req.body;
    const records = await xenCall(host, 'host.get_all_records', [session]);
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/snapshot', async (req, res) => {
  try {
    const { host, session, vmRef, snapshotName } = req.body;
    const snapRef = await xenCall(host, 'VM.snapshot', [session, vmRef, snapshotName || `nutamigrate-snap-${Date.now()}`]);
    res.json({ snapRef });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/xenserver/mount-iso', async (req, res) => {
  try {
    const { host, session, vmRef, vdiRef } = req.body;
    // Find a CD VBD on this VM or create one
    const vbds = await xenCall(host, 'VM.get_VBDs', [session, vmRef]);
    let cdVbd = null;
    for (const vbdRef of (vbds || [])) {
      const vbd = await xenCall(host, 'VBD.get_record', [session, vbdRef]);
      if (vbd?.type === 'CD') { cdVbd = vbdRef; break; }
    }
    if (!cdVbd) {
      // Create a CD VBD
      cdVbd = await xenCall(host, 'VBD.create', [session, {
        VM: vmRef, VDI: vdiRef, userdevice: '3',
        bootable: false, mode: 'RO', type: 'CD',
        unpluggable: true, empty: false,
        other_config: {}, qos_algorithm_type: '', qos_algorithm_params: {},
      }]);
    } else {
      await xenCall(host, 'VBD.insert', [session, cdVbd, vdiRef]);
    }
    res.json({ ok: true, vbdRef: cdVbd });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// SSH SOURCE MACHINE SCANNER
// ─────────────────────────────────────────────

function sshScan(host, username, password, port) {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    const results = {};

    const commands = [
      ['hostname',    'hostname -f 2>/dev/null || hostname'],
      ['os',         'cat /etc/os-release 2>/dev/null || cat /etc/redhat-release 2>/dev/null || uname -a'],
      ['cpu_count',  'nproc --all 2>/dev/null || grep -c ^processor /proc/cpuinfo'],
      ['cpu_model',  'grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | xargs'],
      ['ram_mb',     "awk '/MemTotal/{print int($2/1024)}' /proc/meminfo"],
      ['disks',      'lsblk -d -b -o NAME,SIZE,TYPE --json 2>/dev/null || lsblk -d -b -o NAME,SIZE,TYPE 2>/dev/null'],
      ['disk_total', "df --block-size=1G --total 2>/dev/null | awk '/^total/{print $2}'"],
      ['interfaces', 'ip -j addr show 2>/dev/null'],
      ['ips',        "hostname -I 2>/dev/null || ip -4 addr | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'"],
      ['services',   "systemctl list-units --type=service --state=running --no-pager --plain 2>/dev/null | awk 'NR>1{print $1}' | head -30"],
      ['kernel',     'uname -r'],
    ];

    conn.on('ready', () => {
      let idx = 0;
      const runNext = () => {
        if (idx >= commands.length) { conn.end(); resolve(results); return; }
        const [key, cmd] = commands[idx++];
        conn.exec(cmd, (err, stream) => {
          if (err) { results[key] = ''; runNext(); return; }
          let out = '';
          stream.on('data', (d) => (out += d.toString()));
          stream.stderr.on('data', () => {});
          stream.on('close', () => { results[key] = out.trim(); runNext(); });
        });
      };
      runNext();
    });

    conn.on('error', reject);
    conn.connect({ host, port: port || 22, username, password, readyTimeout: 12_000 });
  });
}

function parseDiskGb(raw) {
  // Try JSON from lsblk --json
  try {
    const j = JSON.parse(raw);
    return Math.round(
      (j.blockdevices || [])
        .filter((d) => d.type === 'disk')
        .reduce((sum, d) => sum + (parseInt(d.size) || 0), 0) / 1e9
    );
  } catch {}
  // Plaintext lsblk
  let total = 0;
  for (const line of raw.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3 && parts[2] === 'disk') {
      total += parseInt(parts[1]) || 0;
    }
  }
  return Math.round(total / 1e9);
}

app.post('/api/scan', async (req, res) => {
  try {
    const { host, username, password, port = 22, type = 'linux' } = req.body;
    if (!host || !username) return res.status(400).json({ error: 'host and username required' });

    if (type !== 'linux') {
      return res.status(501).json({ error: 'WinRM scanning not supported. Use SSH (OpenSSH for Windows) or XenServer API import.' });
    }

    const data = await sshScan(host, username, password, port);

    // Parse OS
    const osPrettyMatch = data.os?.match(/PRETTY_NAME="([^"]+)"/);
    const osName = osPrettyMatch ? osPrettyMatch[1] : (data.os?.split('\n')[0] || '');

    // Parse RAM
    const ramGb = Math.round((parseInt(data.ram_mb) || 0) / 1024) || 1;

    // Parse CPU
    const vcpu = parseInt(data.cpu_count) || 1;

    // Parse disk
    let diskGb = parseDiskGb(data.disks);
    if (diskGb === 0) diskGb = parseInt(data.disk_total) || 0;

    // Parse IPs
    let ips = [];
    try {
      const j = JSON.parse(data.interfaces);
      ips = j.flatMap((iface) =>
        (iface.addr_info || [])
          .filter((a) => a.family === 'inet' && !a.local?.startsWith('127.'))
          .map((a) => a.local)
      );
    } catch {
      ips = (data.ips || '').split(/\s+/).filter((ip) => ip && !ip.startsWith('127.'));
    }

    const services = (data.services || '').split('\n').map((s) => s.trim()).filter(Boolean);

    res.json({
      hostname: data.hostname || host,
      os: osName,
      vcpu,
      ram_gb: ramGb,
      disk_gb: diskGb,
      ip: ips[0] || host,
      interfaces: ips,
      services,
      kernel: data.kernel || '',
      cpu_model: data.cpu_model || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// VIRTIO CHECK & DEPLOY (WinRM / OpenSSH)
// ─────────────────────────────────────────────

// WinRM helper — Basic auth, HTTP (port 5985)
// Full WinRM is complex; this implements shell-create + exec + receive
async function winrmRun(host, username, password, command, port = 5985) {
  const baseUrl = `http://${host}:${port}/wsman`;
  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  const uuid = () => crypto.randomUUID();

  const soapPost = async (action, body) => {
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
            xmlns:wsman="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd"
            xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell"
            xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/windows/shell">
  <s:Header>
    <wsa:To>${baseUrl}</wsa:To>
    <wsman:ResourceURI>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</wsman:ResourceURI>
    <wsa:ReplyTo><wsa:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address></wsa:ReplyTo>
    <wsa:Action>${action}</wsa:Action>
    <wsa:MessageID>uuid:${uuid()}</wsa:MessageID>
    <wsman:OperationTimeout>PT60S</wsman:OperationTimeout>
  </s:Header>
  <s:Body>${body}</s:Body>
</s:Envelope>`;
    const r = await axios.post(baseUrl, envelope, {
      headers: { Authorization: auth, 'Content-Type': 'application/soap+xml;charset=UTF-8' },
      responseType: 'text',
      timeout: 70_000,
    });
    return r.data;
  };

  // Create shell
  const createResp = await soapPost(
    'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create',
    '<rsp:Shell><rsp:InputStreams>stdin</rsp:InputStreams><rsp:OutputStreams>stdout stderr</rsp:OutputStreams></rsp:Shell>'
  );
  const shellMatch = createResp.match(/shellId[^>]*>([^<]+)</i) || createResp.match(/Shell><\S+>([^<]+)/);
  const shellId = shellMatch ? shellMatch[1] : null;
  if (!shellId) throw new Error('WinRM: could not create shell');

  let cmdOutput = '';
  try {
    // Run command
    const cmdResp = await soapPost(
      'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command',
      `<rsp:CommandLine><rsp:Command>${escapeXml(command)}</rsp:Command></rsp:CommandLine>`
    );
    const cmdIdMatch = cmdResp.match(/CommandId[^>]*>([^<]+)</i);
    const cmdId = cmdIdMatch ? cmdIdMatch[1] : null;

    if (cmdId) {
      // Receive output
      const rcvResp = await soapPost(
        'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
        `<rsp:Receive><rsp:DesiredStream CommandId="${cmdId}">stdout stderr</rsp:DesiredStream></rsp:Receive>`
      );
      // Decode base64 stdout blocks
      const stdoutMatches = rcvResp.matchAll(/<rsp:Stream Name="stdout"[^>]*>([^<]*)<\/rsp:Stream>/gi);
      for (const m of stdoutMatches) {
        if (m[1]) cmdOutput += Buffer.from(m[1], 'base64').toString('utf8');
      }
    }
  } finally {
    // Delete shell (best-effort)
    try {
      await soapPost('http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete', `<rsp:Shell><rsp:ShellId>${shellId}</rsp:ShellId></rsp:Shell>`);
    } catch {}
  }

  return cmdOutput;
}

app.post('/api/virtio/check', async (req, res) => {
  try {
    const { host, username, password, port = 5985, useSSH = false, sshPort = 22 } = req.body;

    let output = '';
    if (useSSH) {
      // Windows with OpenSSH
      const client = new SSHClient();
      output = await new Promise((resolve, reject) => {
        let buf = '';
        client.on('ready', () => {
          const cmd = 'powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -match \'VirtIO|vioscsi|viostor|netkvm\' } | Select-Object Status,FriendlyName | ConvertTo-Json"';
          client.exec(cmd, (err, stream) => {
            if (err) { client.end(); reject(err); return; }
            stream.on('data', (d) => (buf += d.toString()));
            stream.stderr.on('data', () => {});
            stream.on('close', () => { client.end(); resolve(buf); });
          });
        });
        client.on('error', reject);
        client.connect({ host, port: sshPort, username, password, readyTimeout: 12_000 });
      });
    } else {
      output = await winrmRun(host, username, password,
        'powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -match \'VirtIO|vioscsi|viostor|netkvm\' } | Select-Object Status,FriendlyName | ConvertTo-Json"',
        port
      );
    }

    const hasVirtio = /vioscsi|viostor|netkvm|virtio/i.test(output);
    let drivers = [];
    try { drivers = JSON.parse(output); if (!Array.isArray(drivers)) drivers = [drivers]; } catch {}

    res.json({ hasVirtio, drivers, raw: output.slice(0, 2000) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/virtio/deploy', async (req, res) => {
  try {
    const { host, username, password, isoPath, port = 5985, useSSH = false, sshPort = 22 } = req.body;
    if (!isoPath) return res.status(400).json({ error: 'isoPath required' });

    // Mount ISO and run silent install
    const cmd = `powershell -Command "
$iso = '${isoPath.replace(/'/g, "''")}'
if (Test-Path $iso) {
  $mount = Mount-DiskImage -ImagePath $iso -PassThru
  $drive = ($mount | Get-Volume).DriveLetter
  if ($drive) {
    $inf = Get-ChildItem -Path ($drive + ':\\') -Filter 'vioscsi.inf' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($inf) {
      & pnputil /add-driver $inf.FullName /install /subdirs
      Write-Output 'VirtIO drivers installed successfully'
    } else {
      Write-Output 'ERROR: Could not find vioscsi.inf in ISO'
    }
    Dismount-DiskImage -ImagePath $iso
  }
} else {
  Write-Output ('ERROR: ISO not found: ' + $iso)
}"`;

    let output = '';
    if (useSSH) {
      const client = new SSHClient();
      output = await new Promise((resolve, reject) => {
        let buf = '';
        client.on('ready', () => {
          client.exec(cmd, (err, stream) => {
            if (err) { client.end(); reject(err); return; }
            stream.on('data', (d) => (buf += d.toString()));
            stream.stderr.on('data', (d) => (buf += d.toString()));
            stream.on('close', () => { client.end(); resolve(buf); });
          });
        });
        client.on('error', reject);
        client.connect({ host, port: sshPort, username, password, readyTimeout: 12_000 });
      });
    } else {
      output = await winrmRun(host, username, password, cmd, port);
    }

    const success = /successfully/i.test(output);
    res.json({ success, output: output.slice(0, 2000) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 NutaMigrate Proxy running at http://localhost:${PORT}`);
  console.log(`   Prism:     POST /api/prism/{clusters|containers|networks|images|vms}`);
  console.log(`   XenServer: POST /api/xenserver/{connect|vms|vdis|srs|networks|snapshot|mount-iso}`);
  console.log(`   Scan:      POST /api/scan`);
  console.log(`   VirtIO:    POST /api/virtio/{check|deploy}`);
  console.log(`\nPress Ctrl+C to stop.\n`);
});
