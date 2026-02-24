# NutaMigrate Appliance Plan

## Concept
Self-contained VM appliance that consultants drop onto any hypervisor at customer site.
No laptop dependencies, no tool installation — everything bundled.

## Target Formats
- **OVA** — VirtualBox, ESXi, Prism (all import natively)
- **QCOW2** — Nutanix AHV / KVM direct upload
- **VHD** — Hyper-V

## VM Specs
- **OS:** Alpine Linux (minimal footprint) or Ubuntu Server minimal
- **Resources:** 1 vCPU, 2GB RAM, 10GB disk
- **Image size:** ~2-3GB

## Bundled Components
- nginx (web UI)
- Node.js + proxy server (Prism/XenServer/SSH/WinRM connectivity)
- qemu-img (VHD→QCOW2 conversion, run on appliance itself)
- VirtIO driver ISOs (Windows Server 2012 R2, 2016, 2019, 2022, 2025)
- xe CLI tools (XenServer management)
- SSH client (source machine scanning)
- Self-signed TLS cert (HTTPS by default)

## Build Tooling
- **Packer** — automated VM image build from ISO
- **Provisioning:** Shell or Ansible script
- **CI:** GitHub Actions or local build script
- **Output:** `packer build` → OVA + QCOW2 + VHD

## First-Boot Experience
1. Boot VM → console shows IP address + setup URL
2. Open browser → `https://<appliance-ip>`
3. First-boot wizard: set admin password, configure network (DHCP or static)
4. Ready to use — connect to XenServer + Prism from web UI

## Architecture
```
┌─────────────────────────────────────┐
│         NutaMigrate Appliance       │
│                                     │
│  ┌──────────┐    ┌───────────────┐  │
│  │  nginx    │    │  proxy.js     │  │
│  │  :443     │───▶│  :3131        │  │
│  │  (Web UI) │    │  (API proxy)  │  │
│  └──────────┘    └───────┬───────┘  │
│                          │          │
│  ┌──────────┐    ┌───────▼───────┐  │
│  │ qemu-img │    │ Connections:  │  │
│  │ (convert) │    │ • XenServer  │  │
│  └──────────┘    │ • Prism      │  │
│                  │ • SSH/WinRM  │  │
│  ┌──────────┐    └───────────────┘  │
│  │ VirtIO   │                       │
│  │ ISOs     │                       │
│  └──────────┘                       │
└─────────────────────────────────────┘
```

## Advanced Features (future)
- Run qemu-img conversions ON the appliance (no separate conversion host needed)
- Direct VDI export from XenServer → convert → upload to Prism, all from appliance
- Progress dashboard showing transfer speeds and ETAs
- Multi-cluster support (migrate to multiple Nutanix clusters)
- Export migration report (PDF) for customer documentation

## When to Build
After NutaMigrate v2 is stable and tested on a real engagement.
Brian will say "let's wrap it up" — then we Packer it.
