# Tuckit Admin Control Center — Comprehensive Agent Walkthrough & Operations Manual

> **Location:** `company level/docs/WALKTHROUGH.md`  
> **Last Updated:** 2026-08-17  
> **Status:** Active Production Replica (Frontend-First, 100% In-Memory Reactive State)

---

## 🚨 MANDATORY PROTOCOL FOR ALL AI AGENTS & CONTRIBUTORS

> [!IMPORTANT]
> **RULE 1: START OF SESSION — ALWAYS READ THIS FILE FIRST**  
> Before making any code modifications, architectural changes, or creating new features, any AI agent or engineer working on this repository **MUST** read this file (`company level/docs/WALKTHROUGH.md`) and `DESIGN.md` in full to understand the existing state, established architectural patterns, and design constraints.

> [!IMPORTANT]
> **RULE 2: END OF SESSION — ALWAYS UPDATE THIS LOG BEFORE PUSHING**  
> Before running `git push` to GitHub, you **MUST** append a comprehensive record to the [Changelog & Session Trajectory](#chronological-changelog--trajectory-history) section at the bottom of this file. The record must include:
> 1. **Session Date & Context**
> 2. **Previous State** (What was broken, missing, or in progress)
> 3. **Exact Changes Made** (Components modified/created, state logic added)
> 4. **Files Touched** (Clickable file links)
> 5. **Verification & Build Results** (`npm run build` verification output)
> 6. **Git Commit Hash**

---

## 1. Project Overview & Architecture

### Tech Stack
- **Framework:** React 18 + TypeScript + Vite 5 + Tailwind CSS v3
- **Routing:** `react-router-dom` v6 with SPA wildcard rewrites for Vercel (`vercel.json`), Netlify (`netlify.toml`), and static hosting (`public/_redirects`).
- **Icons:** `lucide-react`
- **State Architecture:** Client-side in-memory reactive stores (`AuthContext.tsx`, `RealtimeContext.tsx`) with zero external backend dependencies. Data is seeded from authentic production dataset (`mockData.ts`) containing 238 terminals, 191 sites across 20 Indian states, 143 internal admins, 125 roles, and 81 live telemetry alarms.

### Design System & Visual Philosophy
Strict adherence to `DESIGN.md` structural guidelines:
- **Brand Accent:** `#F97316` (Tuckit Orange) is the sole vibrant accent across the entire app. Never use Intercom's literal `#ff5600`.
- **Typography:** `Inter` (Google Fonts) using weight 500 for display/headings with negative letter-spacing, weight 400 for body text. `JetBrains Mono` for hardware codes/telemetry/timestamps.
- **Surfaces & Borders:** Flat zinc surfaces (`surface.canvas` `#F9FAFB`, `surface.1` `#FFFFFF`, `surface.2` `#F4F4F5`) with 1px hairline borders (`border-hairline` `#E4E4E7`). **No heavy shadows, no loud gradients, no decorative orbs.**
- **Radius Scale:** `xs` (4px), `sm` (6px for badges), `md` (8px for inputs/buttons), `lg` (12px for cards), `xl` (16px for modals/drawers).

---

## 2. Navigation IA & Route Structure

The console utilizes a **persistent vertical left sidebar rail** (256px wide, collapsible to 64px icon rail) organized into 4 logical groups:

| Group | Route | Label | Purpose |
|---|---|---|---|
| **Main** | `/dashboard` | Dashboard & Main View | Real-time booking table, PII masking toggles, quick date presets, export controls |
| | `/reports` | Reports & Analysis | Executive financial KPIs, source share analytics, 4 dedicated export cards |
| | `/device-status` | Device / Terminal Status | Full 238-terminal IoT kiosk status, network diagnostics, grid & list view pagination |
| | `/locker-status` | Locker Status | Interactive physical door grid, drawer door inspector, vacate/maintenance controls |
| | `/future-first` | Future First | Partner station telemetry (Solar wattage, Battery charge, RF signal dBm) |
| **PESIT Locker** | `/pesit-terminals` | PESIT Terminals | Campus kiosk cluster with tiered bulk solenoid release & credentials SMS |
| | `/pesit-students` | Student Management | Student roster, RFID card bindings, roll number search, allocation approvals |
| | `/pesit-managers` | Locker Managers | On-campus floor wardens and physical locker supervisors |
| **Revenue & Billing** | `/refund-requests` | Refund Requests | Pending customer refund queue with approval/rejection audit trail |
| | `/refund-history` | Refund History | Historical resolved refunds, gateway reference logs, settled amounts |
| | `/pricing` | Pricing Control | Dynamic tariff rules, base hourly rates, penalty slabs, promotional discounts |
| | `/state-gst` | State GST Config | Inter-state IGST vs. intra-state CGST/SGST tax slabs by jurisdiction |
| | `/staff-credit` | Staff Credit Request | Field executive pocket allowances and cash top-up approval queue |
| | `/staff-profiles` | Staff Profiles | Field technician cash-handling profiles and balance tracking |
| **User Management** | `/users` | Customers | Public customer registry, booking history count, verification status |
| | `/admins` | Internal Admins | Operations console staff, assigned role profiles, account active state |
| | `/employee-monitor` | Employee Monitor | Real-time staff audit stream, active IP addresses, last seen tracking |
| | `/roles` | Roles & RBAC | 2-column permission matrix across 4 category groups |
| | `/blacklist-history` | Block / Unblock History | User restriction logs, block reasons, unblock timestamps |
| | `/audit-logs` | Audit Logs | Immutable security event log (PII reveals, exports, reboots, force unlocks) |
| **System** | `/profile` | Profile | Operator account overview and security preferences |
| | `/alerts` | System Alerts | Real-time critical hardware alerts, remote reboot triggers, alarm acknowledgments |
| **Overlay** | N/A | Control Center Drawer | Global drawer for remote screen streams, AWS S3 OTA updates, batch terminal console |

---

## 3. Trust, Safety & Security Rules (P0 Guidelines)

1. **PII Masking by Default:**
   - Date of Birth (`b.dateOfBirth`) and Door Passcodes (`b.passcode`) **MUST** render masked (`••••-••-••` / `••••`) everywhere by default (table cells, modals, drawer inspectors).
   - Unmasking requires explicit operator action and automatically generates an audit log entry (`PII_REVEAL` or `PII_EXPORT_UNMASKED`).
2. **Destructive Action Friction:**
   - Any destructive action (door solenoid release, force unlock, reboot, bulk unlock, blacklist) **MUST** use `DestructiveActionModal.tsx`.
   - Reason field **MUST** start empty and be strictly required.
   - Bulk/Fleet actions require typed confirmation of the target kiosk code.
3. **Zero Artificial Slice Caps:**
   - Never use `.slice(0, 30)` or `.slice(0, 50)` on terminal dropdowns.
   - Always use `SearchableSelect.tsx` (combobox with type-ahead search) or pagination (`paginatedTerminals`).

---

## Chronological Changelog & Trajectory History

### [2026-08-17] — P3: shadcn Foundation, Semantic Status Tokens & Shared Primitives
- **Previous State:**
  - `npm run build` was **failing**: `The 'border-border' class does not exist`. The shadcn init had written CSS variables into `src/index.css` but never registered the matching colour keys in `tailwind.config.js`, so `@apply border-border` in the base layer had nothing to resolve against.
  - `src/index.css` carried a dead `@import "shadcn/tailwind.css"` — that file does not exist in `node_modules`.
  - Theme variables were authored in `oklch(...)`, which cannot accept Tailwind's `<alpha-value>` substitution, so every opacity modifier (`bg-muted/50`, `ring-foreground/10`, `ring-ring/50`) used by shadcn components would have silently failed.
  - `--primary` was set to `oklch(0.205 0 0)` (near-black) under a comment claiming "Tuckit orange accent", disagreeing with `tailwind.config.js` which set `primary` to `#F97316`.
  - Status pills were a hand-rolled colour `switch` in `components/common/StatusBadge.tsx`, duplicated in intent across 9 pages.
- **Changes Made:**
  - Installed 18 shadcn components (`card`, `badge`, `input`, `select`, `table`, `tabs`, `popover`, `sheet`, `dropdown-menu`, `tooltip`, `separator`, `scroll-area`, `skeleton`, `command`, `calendar`, `dialog`, `textarea`, `input-group`).
  - Rewrote all theme variables as **bare HSL triplets** (`25 95% 53%`) instead of `oklch(...)`, and registered every shadcn semantic key (`background`, `foreground`, `card`, `popover`, `muted`, `accent`, `destructive`, `secondary`, `border`, `input`, `ring`) in `tailwind.config.js` using the `hsl(var(--x) / <alpha-value>)` form. This is what unblocked the build and made opacity modifiers work.
  - Added a semantic status scale — `success`, `warning`, `danger`, `info`, `neutral`, each with `DEFAULT` / `bg` / `foreground` — in both light and `.dark` blocks.
  - **Corrected the status foregrounds for WCAG AA.** The conventional Tailwind `-700`-on-`-50` pairings measured 4.36:1 (success), 3.14:1 (warning) and 4.39:1 (neutral) at 12px — all below the 4.5:1 threshold. Darkened `--success-foreground`, `--warning-foreground` and `--neutral-foreground` only; the `--x` accent values (dots, border rails) are unchanged. All five variants now measure 5.5–7.4:1.
  - Set `--primary` to Tuckit orange (`25 95% 53%` = `#F97316`) so the CSS variable and the Tailwind key finally agree.
  - Ported `src/components/ui/card.tsx` from Tailwind **v4** syntax (`gap-(--card-spacing)`, `--spacing(4)`) to v3-legal arbitrary values, preserving the CSS-variable spacing behaviour and the public API.
  - Created `components/ui/status-badge.tsx` as the single source of truth (`STATUS_MAP`), covering all ~30 statuses the app actually renders — booking lifecycle, connectivity, locker state, approvals, alert severity, payment methods. `components/common/StatusBadge.tsx` is now a thin deprecated shim so all 9 existing call sites keep compiling.
  - Created `components/ui/stat-card.tsx` (`default` / `emphasis` tones with left accent rail) and `components/ui/data-table-cells.tsx` (`CellPrimary`, `CellSecondary`, `CellCode`, `CellAmount`, `CellSensitive`).
  - Wired the four Dashboard KPI tiles to `StatCard` — `Active lockers` → `emphasis/warning`, `Overdue alerts` → `emphasis/danger`.
- **Deliberate deviations from the brief:**
  - Brief specified HSL triplets with `hsl(var(--x))`; the repo was on OKLCH. Went with HSL because OKLCH breaks `<alpha-value>` — the brief's format was correct for this project and the repo's was not.
  - Brief's `fontFeatureSettings: { tabular: '"tnum"' }` was skipped: it is not a Tailwind v3 theme key and generates nothing. `tabular-nums` is already built in and is what the primitives use.
  - Brief's `STATUS_MAP` had 5 entries; shipping it verbatim would have turned every offline terminal grey. Populated with the full vocabulary instead.
  - Brief mapped `OVERDUE` to `danger`; the previous implementation used amber. Followed the brief — overdue is a problem, not a caution.
- **Known remaining work (NOT done in this pass):**
  - **Rule 1d (uppercase sweep) is incomplete.** 138 `uppercase` occurrences remain across 39 files; only the Dashboard KPI labels and the `StatusBadge` labels were converted to sentence case.
  - **17 of the 18 installed shadcn components still emit Tailwind v4 syntax** and will render unstyled under v3. Only `card.tsx` has been ported. Either port them on demand or migrate the project to Tailwind v4.
  - `data-table-cells.tsx` is built but not yet applied to any table.
- **Files Modified / Created:**
  - `company level/src/index.css`
  - `company level/tailwind.config.js`
  - `company level/src/components/ui/card.tsx` (ported v4 → v3)
  - `company level/src/components/ui/status-badge.tsx` (NEW)
  - `company level/src/components/ui/stat-card.tsx` (NEW)
  - `company level/src/components/ui/data-table-cells.tsx` (NEW)
  - `company level/src/components/common/StatusBadge.tsx` (now a deprecated shim)
  - `company level/src/pages/Dashboard.tsx`
- **Verification:** `npm run build` passed with 0 errors (990ms) after failing on entry. Token classes confirmed present in the emitted CSS; alpha modifier confirmed compiling to `hsl(var(--foreground) / .1)`; all 5 status variants measured in-browser at ≥5.5:1 contrast.

---

### [2026-08-17] — P2: Data Integrity, Metrics Honesty & URL-Synced Filter State
- **Previous State:**
  - Hardcoded static trends (`+14% vs last week`, `+24.8% vs last month`, `↓ -71%`, `+14% QoQ`, `+28% QoQ`) existed on Dashboard, Reports, and DeviceStatus KPI cards.
  - Filter state on Dashboard and multi-filter pages was local `useState` only, losing all filter configurations upon reload or navigation.
  - Quick date presets on Dashboard only fired a toast without setting date ranges or filtering data.
  - No ability to save or bookmark custom filter configurations.
- **Changes Made:**
  - Eliminated all fabricated trend percentages and directional arrows across `Dashboard.tsx`, `Reports.tsx`, and `DeviceStatus.tsx`. Replaced with genuine computed counts and honest metadata.
  - Verified and audited all action modals (`ForceUnlockModal`, `TerminalRebootModal`, `BlacklistUserModal`, `SmsUnlockModal`, `DestructiveActionModal`) to guarantee reason/justification fields start strictly empty with placeholder-only text.
  - Synchronized all 8 Dashboard filters, date range, active preset, and pagination to URL query parameters via `useSearchParams`.
  - Implemented working quick date range presets (`Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `This Month`, `This Year`) with real date calculation and active pill highlighting.
  - Built persistent **Saved Views** manager with `localStorage` backing, 5 built-in views, custom view naming, and one-click application.
  - Added URL search parameter synchronization across multi-filter pages: `Reports.tsx`, `RefundRequests.tsx`, `AuditLogs.tsx`, and `SystemAlerts.tsx`.
- **Files Modified / Created:**
  - `company level/src/pages/Dashboard.tsx`
  - `company level/src/pages/Reports.tsx`
  - `company level/src/pages/DeviceStatus.tsx`
  - `company level/src/pages/RefundRequests.tsx`
  - `company level/src/pages/AuditLogs.tsx`
  - `company level/src/pages/SystemAlerts.tsx`
  - `company level/src/components/control-center/ForceUnlockModal.tsx`
- **Verification:** `npm run build` passed with 0 errors (built in 811ms).

---

### [2026-08-17] — P1: Navigation IA & Design System Overhaul
- **Commit:** `83b4949`
- **Previous State:**
  - Horizontal top navbar with dropdown menus was cramped, caused horizontal overflow on medium screens, and lacked hierarchical clarity for 23 routes.
  - Components had inconsistent border radii (`rounded-2xl`, `rounded-3xl`), heavy drop shadows, and dark/colored background surfaces.
  - Login page featured heavy blur orbs and loud gradients inconsistent with `DESIGN.md`.
- **Changes Made:**
  - Built persistent left sidebar (`Sidebar.tsx`) with 4 collapsible groups, active left-accent bars, badge counters, and collapse toggle.
  - Built standalone mobile navigation drawer (`MobileNav.tsx`).
  - Redesigned `Layout.tsx` with horizontal sidebar offset and 48px sticky top bar featuring breadcrumbs and alert bell.
  - Upgraded `tailwind.config.js` and `index.css` with DESIGN.md surface/ink tokens, typography scale with paired letter-spacing, and radius scale.
  - Reskinned `StatusBadge.tsx` (`rounded-sm`, 500 weight), `Modal.tsx` (`rounded-xl`, hairline border, `shadow-card`), `Toast.tsx` (white surface, hairline border), `Drawer.tsx`, and `Login.tsx`.
- **Files Modified / Created:**
  - `company level/src/components/layout/Sidebar.tsx` (NEW)
  - `company level/src/components/layout/MobileNav.tsx` (NEW)
  - `company level/src/components/layout/Layout.tsx`
  - `company level/src/components/common/StatusBadge.tsx`
  - `company level/src/components/common/Modal.tsx`
  - `company level/src/components/common/Toast.tsx`
  - `company level/src/components/common/Drawer.tsx`
  - `company level/src/pages/Login.tsx`
  - `company level/tailwind.config.js`
  - `company level/src/index.css`
- **Verification:** `npm run build` passed with 0 errors (built in 824ms).

---

### [2026-08-16] — P0: Trust, Safety & Scale Fixes
- **Commits:** `84c7601`, `506c3aa`, `1a669f4`
- **Previous State:**
  - Passcodes and DOBs were visible in plain text in certain table cells and CSV exports.
  - Destructive modals had prefilled justification strings and inconsistent confirmation friction.
  - Terminal select dropdowns were capped with `.slice(0, 30)` and `.slice(0, 50)`, hiding 180+ terminals from operators.
- **Changes Made:**
  - Masked DOB and Passcodes by default in table, detail drawer, and CSV exports. Added export options modal with audit logging.
  - Created `DestructiveActionModal.tsx` with tiered friction (single, bulk, fleet), mandatory empty reason, and typed code confirmation.
  - Created `SearchableSelect.tsx` with type-ahead search and converted all capped terminal dropdowns.
  - Added full fleet pagination across `DeviceStatus.tsx` and `LockerStatus.tsx`.
- **Files Modified / Created:**
  - `company level/src/components/common/DestructiveActionModal.tsx` (NEW)
  - `company level/src/components/common/SearchableSelect.tsx` (NEW)
  - `company level/src/pages/Dashboard.tsx`
  - `company level/src/pages/DeviceStatus.tsx`
  - `company level/src/pages/LockerStatus.tsx`
  - `company level/src/pages/Reports.tsx`
  - `company level/src/pages/PESITTerminals.tsx`
  - `company level/src/components/control-center/ForceUnlockModal.tsx`
  - `company level/src/components/control-center/TerminalRebootModal.tsx`
  - `company level/src/components/control-center/SmsUnlockModal.tsx`
  - `company level/src/components/control-center/RemoteAssistanceModal.tsx`
  - `company level/src/components/modals/BlacklistUserModal.tsx`
  - `company level/src/context/RealtimeContext.tsx`
- **Verification:** `npm run build` passed with 0 errors.

---

### [2026-08-16] — Production Deployment Fixes (Vercel & Netlify SPA Wildcard Rewrites)
- **Commits:** `79c9112`, `a932cb8`
- **Previous State:**
  - Build failed on CI (`sh: tsc: command not found`).
  - Hard refresh on sub-routes (`/dashboard`, `/reports`, etc.) resulted in 404 Not Found on Vercel and Netlify.
- **Changes Made:**
  - Moved `typescript` and `vite` to production dependencies and added build hooks.
  - Added `vercel.json` rewrites (`"source": "/(.*)", "destination": "/index.html"`).
  - Added `netlify.toml` redirects (`from = "/*" to = "/index.html" status = 200`).
  - Added `company level/public/_redirects` (`/* /index.html 200`).
- **Files Modified / Created:**
  - `vercel.json`
  - `netlify.toml`
  - `company level/public/_redirects` (NEW)
  - `company level/vercel.json` (NEW)
  - `company level/package.json`
  - `package.json`

---

### [2026-08-15] — 1:1 Parity & Feature Expansion Pass
- **Commit:** `c95dbe2`
- **Changes Made:**
  - Implemented 1:1 replica of `Reports.tsx` (Executive KPI Summary, Source Share, 4 Export Cards, Column Customizer).
  - Implemented `FutureFirst.tsx` (Telemetry sensor stream, battery charge %, solar wattage, RF dBm).
  - Implemented `PESITTerminals.tsx`, `PESITStudents.tsx`, and `PESITManagers.tsx`.
  - Implemented `RefundHistory.tsx` with settled/pending KPI summary and gateway reference audit trail.
  - Implemented `Roles.tsx` with 2-column interactive RBAC matrix and role creation modal.
  - Implemented `SystemAlerts.tsx` with live telemetry alarm triage and remote reboot triggers.
  - Created Control Center IoT Simulator (Live touch screen remote stream, AWS S3 4-stage OTA pipeline, batch terminal execution console).
