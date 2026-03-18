# PGTEK Skills Matrix
**Date:** 2026-03-17  
**URL:** http://100.97.65.28:3164  
**Container:** skills-matrix  
**Port:** 3164  

## Summary
Internal PGTEK tool for consultant skills tracking and SOW-based candidate matching. Built as a Node.js/Express/SQLite Docker app with a single-file embedded frontend.

## Features

### Consultant View (My Profile tab)
- Name/email lookup — no login wall, type to load or create profile
- Type-ahead search against 86 pre-loaded master skills across 9 categories
- Proficiency popover on each skill: Beginner / Intermediate / Advanced / Expert
- Years of experience per skill
- One-click cert chips for 14 certifications (Nutanix NCP/NCM, VMware VCP/VCAP, AWS SAA/SAP, Azure AZ-104/AZ-305, CCNA/CCNP/CCIE, Security+/Network+, PMP)
- Availability status: Available / On Project / Limited
- Auto-save with debounce (1s after last change)
- localStorage caching to restore last used profile on revisit

### Team Lead View (Team Search tab)
**Search Mode:**
- Multi-skill search with AND/OR logic toggle
- Filter by minimum proficiency level and availability
- Results ranked by match % with score bar
- Green chips for matched skills (with proficiency), red chips for missing skills
- CSV export

**SOW Match Mode:**
- Drag-and-drop zone for PDF, Word (.docx), or plain text
- Client-side parsing: pdf.js for PDFs, mammoth.js for Word docs
- Keyword extraction via regex pattern matching against full skills DB (aliases included)
- Extracted skills displayed as chips before results
- Consultants ranked by match percentage
- Same green/red chip format + CSV export

## Master Skills DB (86 skills)
- **HCI:** Nutanix AOS, Prism Central, Foundation, Files, Objects, Flow, Era, Mine, NC2, AHV, Dell VxRail, Azure Stack HCI
- **Virtualization:** VMware vSphere, vCenter, ESXi, NSX, vSAN, HCX, Hyper-V, KVM, Proxmox
- **Cloud:** AWS, Azure, GCP, Oracle Cloud, IBM Cloud, Terraform, Ansible, CloudFormation
- **Networking:** Cisco IOS, NX-OS, ACI, Juniper, Arista, Palo Alto, Fortinet, F5, SD-WAN, BGP, OSPF, VPN/IPSec
- **Storage:** Pure Storage, NetApp, Dell PowerStore, PowerScale, Unity, Cohesity, Rubrik, Veeam, Commvault, VAST Data
- **Compute:** Dell PowerEdge, HPE ProLiant, Lenovo ThinkSystem, Supermicro, Cisco UCS
- **OS/Platform:** Windows Server, RHEL, Ubuntu, SUSE, Active Directory, DNS, DHCP, PKI, Group Policy
- **Monitoring:** SolarWinds, Datadog, Splunk, Grafana, Prometheus, ServiceNow, Jira
- **Certifications:** 14 certs as separate chip category

## Tech Stack
- Backend: Node.js + Express + better-sqlite3
- Frontend: Single HTML file with embedded CSS/JS
- Docker: node:20-alpine, /data volume for persistent SQLite
- PDF parsing: pdf.js CDN (client-side)
- Word parsing: mammoth.js CDN (client-side)

## Design
- Notion/Linear aesthetic — clean whites, gray-50 background, blue accent (#1a56db)
- PGTEK branding in header
- Mobile responsive
- Smooth chip animations (keyframe in/out)
- Sticky header with live save indicator
