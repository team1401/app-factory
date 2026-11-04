# NutaMigrate Proxy Server

Local proxy that runs on your workstation and lets NutaMigrate's browser UI reach:
- **Prism Element** (HTTPS with self-signed certs)
- **XenServer** (XML-RPC via HTTPS)
- **Source machines** via SSH (Linux scanning)
- **Windows machines** via WinRM or OpenSSH (VirtIO check/deploy)

## Quick Start

```bash
cd proxy/
npm install
node server.js
```

The proxy runs at **http://localhost:3131** and listens only on 127.0.0.1 (local only, never exposed to the network).

On startup it prints a random **access token**. Paste it into the proxy banner on the
NutaMigrate **Connections** page; the UI sends it in the `X-NutaMigrate-Token` header and
the proxy rejects requests without it (`401`).

| Env var | Default | Purpose |
|---------|---------|---------|
| `NUTAMIGRATE_UI_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated browser origins allowed to call the proxy (CORS + Origin check) |
| `NUTAMIGRATE_PROXY_TOKEN` | random per launch | Fixed access token instead of a random one |

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Proxy health check |
| POST | `/api/prism/clusters` | Prism cluster info |
| POST | `/api/prism/containers` | Storage containers |
| POST | `/api/prism/networks` | AHV networks |
| POST | `/api/prism/images` | Image catalog |
| POST | `/api/prism/vms` | Running VMs on Prism |
| POST | `/api/xenserver/connect` | Auth + get session ID |
| POST | `/api/xenserver/vms` | All VM records |
| POST | `/api/xenserver/vdis` | All VDI (disk) records |
| POST | `/api/xenserver/vbds` | Virtual block device records |
| POST | `/api/xenserver/srs` | Storage repositories |
| POST | `/api/xenserver/networks` | XenServer networks |
| POST | `/api/xenserver/hosts` | Host hardware info |
| POST | `/api/xenserver/snapshot` | Create VM snapshot |
| POST | `/api/xenserver/mount-iso` | Mount ISO to VM's CD drive |
| POST | `/api/scan` | SSH scan a Linux source machine |
| POST | `/api/virtio/check` | Check if VirtIO drivers installed (WinRM/SSH) |
| POST | `/api/virtio/deploy` | Silent-install VirtIO drivers (WinRM/SSH) |

## Request Body Patterns

### Prism calls
```json
{ "prismUrl": "https://10.0.0.1:9440", "username": "admin", "password": "xxx" }
```

### XenServer calls
```json
{ "host": "https://10.0.0.10", "session": "OpaqueRef:...", ...params }
```

### SSH scan
```json
{ "host": "10.0.0.50", "username": "root", "password": "xxx", "port": 22, "type": "linux" }
```

### VirtIO check/deploy
```json
{
  "host": "10.0.0.60",
  "username": "Administrator",
  "password": "xxx",
  "port": 5985,
  "useSSH": false,
  "isoPath": "C:\\VirtIO\\virtio-win.iso"
}
```

## Security Notes

- Every request needs the `X-NutaMigrate-Token` header; requests from origins not in `NUTAMIGRATE_UI_ORIGINS`, or with a `Host` other than `localhost:3131`/`127.0.0.1:3131`, get `403`
- `prismUrl` and XenServer `host` must be plain `http(s)://host[:port]`; SSH/WinRM `host` must be a bare hostname or IP

- ⚠️ Credentials sent in POST bodies are in plain text on localhost — keep proxy local only
- Prism/XenServer TLS certificates are verified (see **TLS Verification** below)
- Proxy binds to 127.0.0.1 only — never accessible from the network
- localStorage in the browser stores credentials with an AES-like encode — treat as convenience, not security

## TLS Verification

Prism and XenServer certificates are verified by default against the system CA store. Clusters with self-signed certs must be trusted explicitly via environment variables:

| Variable | Description |
|----------|-------------|
| `NUTAMIGRATE_TLS_CA_FILE` | PEM file(s) (comma-separated) of CA or self-signed server certs to trust, in addition to system CAs. Hostname/IP must match the cert. |
| `NUTAMIGRATE_TLS_FINGERPRINTS` | Comma-separated SHA-256 fingerprints of server certs to pin (`AB:CD:...` or plain hex). A pinned cert is accepted even if self-signed or the hostname doesn't match. |
| `NUTAMIGRATE_TLS_INSECURE=1` | Disable certificate verification entirely. Only for lab use — credentials can be intercepted by anyone on the network path. |

Get a server's fingerprint:

```bash
openssl s_client -connect 10.0.0.1:9440 </dev/null 2>/dev/null | openssl x509 -noout -fingerprint -sha256
```

Then start the proxy:

```bash
NUTAMIGRATE_TLS_FINGERPRINTS="AB:CD:...:EF" node server.js
```

The active mode is printed at startup and returned as `tlsMode` from `/health`.
