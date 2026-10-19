# Sadozai Motors Platform — Google Cloud Console & Workspace Redesign

Re-architect the entire Sadozai Motors dealership and ERP application into a unified, enterprise-grade platform inspired by **Google Cloud Console**, **Google Workspace (Drive/Gmail)**, and **Looker Studio**—combining crisp daylight ergonomics, dense tabular precision, instant slide-over inspection, and power-user keyboard workflows.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices have been confirmed from your answers and govern this redesign:

- **Confirmed Platform Aesthetic**: **Google Cloud Console & Workspace Hybrid** — A structured 3-pane application shell featuring a collapsible navigation rail, a unified Google-style top app bar with central Omnibox search and project/branch selector, high-density data tables (`36px–44px` row height), and a non-disruptive right-hand contextual inspector drawer.
- **Confirmed Color & Theme Posture**: **Crisp Daylight Surface with Google Blue (`#1A73E8`) & Adaptive Dark Mode** — Defaulting to an airy, high-contrast daylight workspace (`#F8FAFC` canvas, `#FFFFFF` elevated surfaces, `#E2E8F0` `1px` structural hairlines, `#1A73E8` primary action accent) with seamless switching to a calibrated Google Cloud Dark Console (`#0F141C` canvas, `#161B26` surfaces, `#8AB4F8` dark-mode accent).
- **Confirmed Google Platform Capabilities (All 5 Selected)**:
  1. **Global `Cmd+K` / `/` Omnibox Search & Command Palette** with instant query syntax (`status:available`, `origin:japan`, `make:toyota`), live FX calculator, and direct navigation.
  2. **Slide-Over Contextual Inspector Drawer & Split Views** so clicking any vehicle, customer lead, or customs container opens a right-hand detail panel (specs, 11-zone ultrasonic paint map, landed cost breakdown, and quick actions) without losing scroll position.
  3. **Google Looker Studio–Style Interactive Analytics & Cohort Charts** with interactive cross-filtering (clicking a vehicle make, customs port, or revenue cohort dynamically filters the live table below).
  4. **Keyboard Shortcut Engine & Multi-Select Batch Action Toolbar** supporting Gmail/Cloud Console chords (`g` then `d` for Dashboard, `g` then `i` for Inventory, `g` then `a` for Accounting, `j`/`k` row focus, `x` row selection, `?` shortcut cheat sheet modal) and a floating batch action bar (bulk status change, bulk price/Sarrafi recalculation, bulk CSV export, and side-by-side comparison).
  5. **Customizable Pinned Views & Saved Filter Presets** allowing operators to save, pin, and switch between custom multi-criteria workspace views (e.g., *"Showroom Ready Hybrids"*, *"Islam Qala Customs Hold"*, *"High-Margin Land Cruisers"*).

---

### 1. Overview & Core Concept

- **What It Does**: Transforms Sadozai Motors from a traditional multi-page dealership website into a cohesive, zero-latency cloud operations platform for vehicle procurement, Islam Qala / Torghundi customs clearance, ultrasonic chassis inspection, showroom merchandising, CRM lead pipelines, and dual-currency (`USD` / `AFN`) Sarrafi treasury accounting.
- **Target Audience / Persona**: Dealership directors, import logistics coordinators, showroom sales agents, and Sarrafi accountants operating in English, Dari (`دری`), and Pashto (`پښتو`) who need rapid data triage, side-by-side inspection, and instant document generation.
- **Key Value**: Eliminates page-reload context switching by bringing Google Cloud Console's resource table + right-hand inspector pattern, Looker Studio's click-to-filter visual analytics, and Google Workspace's keyboard speed into every dealership workflow.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Workspace Shell & Project Switcher**: Users land in a unified Google Cloud–style shell with a top header housing the dealership branch/context switcher (*"Sadozai Motors · Herat HQ"*), the central Omnibox (`Cmd+K` or `/`), and right-side utility controls (Client Presentation Privacy Toggle, Live Sarrafi FXPopover, Language Switcher, Shortcut Help `?`, Theme Toggle, and Role Profile Switcher).
  2. **Pinned Views & Interactive Query Bar**: Above the inventory and ERP registries, users can click saved view tabs or apply structured filter tokens that render as removable query chips in the filter bar.
  3. **Split-View Resource Inspection**: Selecting any row or card in the Operations Cockpit, Inventory Fleet, CRM Desk, or Customs Logistics opens the **Contextual Inspector Drawer** on the right side of the viewport—allowing immediate inspection of VIN telemetry, 11-zone micrometer paint readings, customs Maktoub milestones, and one-click Sales Deed (`Qabala`) or WhatsApp dispatch.
  4. **Looker Studio Cross-Filtering**: In the Operations Cockpit and Accounting/CRM hubs, interactive bar, cohort, and margin breakdown charts act as live filters—clicking a segment (such as *Japan Imports*, *Hybrid Fleet*, or *In Transit*) filters the underlying dataset in real time with a clear *"Clear chart filter"* affordance.
  5. **Multi-Row Selection & Batch Operations**: Checking multiple vehicles or pressing `x` on focused rows reveals a Google Drive/Cloud Console action bar at the top of the table to update customs/lot statuses in bulk, compare selected vehicles, or export a custom manifest.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Utilitarian, high-trust **Google Cloud Console & Workspace Hybrid**—prioritizing clarity, structural `1px` borders, generous breathing room, and unmistakable interactive affordances.
  - **Color Palette & 60-30-10 Distribution**:
    - **60% Dominant Neutral Canvas**: Crisp Daylight `#F8FAFC` (Light) / Deep Console Slate `#0F141C` (Dark).
    - **30% Structural Surfaces & Hairlines**: Pure Surface `#FFFFFF` with `#E2E8F0` `1px` borders (Light) / Elevated Console `#161B26` with `#262F40` `1px` borders (Dark). Primary text in `#0F172A` (Light) / `#F1F5F9` (Dark); secondary metadata in `#475569` / `#94A3B8`.
    - **10% High-Intent Accent Budget**: Google Platform Blue `#1A73E8` (Light) / `#8AB4F8` (Dark) reserved strictly for primary CTAs, active navigation indicators, selected checkboxes, and focused inputs. Semantic states always pair color with explicit icons and labels: Nominal/Cleared Green (`#16A34A`), Customs/Hold Amber (`#D97706`), and Alert/Overdue Crimson (`#DC2626`).
  - **Typography & Hierarchy (2+1 Font Rule)**:
    - *Display & Navigation Structure*: `Plus Jakarta Sans` (SemiBold 600 / Bold 700, `text-wrap: balance` on headings) for clean geometric authority modeled after Google Sans.
    - *Body & Dense UI Controls*: `Public Sans` (Regular 400 / Medium 500) for crisp legibility at `12px–14px` across dense forms and tables, paired with `Vazirmatn` for Dari and Pashto RTL typography.
    - *Tabular Data & Telemetry*: `JetBrains Mono` with `font-variant-numeric: tabular-nums` enforced on all VINs, stock codes, USD/AFN prices, exchange rates, micrometer readings, and ledger balances.
  - **Component Styling & Spatial Rules**:
    - **Single-Elevation Depth**: Flat containers separated by `1px` structural borders; zero nested cards-within-cards and zero thick left accent borders (`border-l-4`).
    - **Zero-Pill Static Metadata**: Static attributes (year, fuel type, origin country, transmission, mileage) render as clean inline typography separated by `·` bullets; rounded interactive segments are reserved strictly for clickable filter controls and view switchers.
    - **High-Density Data Grids**: `40px` compact table rows, sticky column headers, right-aligned tabular numeric columns, and single-line `whitespace-nowrap` controls.

- **Interactive Feedback & Motion**:
  - Compositor-only transitions (`transform`, `opacity`) settling within `150ms` (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Instant skeleton placeholders, clear empty states with one-click filter reset, and Google Workspace–style bottom-left snackbar notifications with undo/action links.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Slide-Over Contextual Inspector Drawer vs. Full-Page Navigation Only**
  - *Chosen Approach*: Provide a persistent, toggleable right-hand **Contextual Inspector Drawer** across the Cockpit, Inventory, Logistics, and CRM views while keeping dedicated full-page routes (`/vehicles/[id]`, `/vehicles/[id]/deed`, `/vehicles/[id]/settlement`) one click away.
  - *Why*: Mirrors Google Drive and Google Cloud Console—operators can inspect 10 vehicles or leads in rapid succession using mouse clicks or `j`/`k` arrow keys without losing their active filter state or scroll position.
  - *Alternatives Considered*: Opening centered modal dialogs (obscures the underlying table and prevents side-by-side scanning) or forcing full route transitions on every click (slows down multi-vehicle triage).

- **Decision 2: Unified Omnibox with Structured Filter Tokens**
  - *Chosen Approach*: Upgrade the top search bar into a Google Cloud–style **Omnibox** supporting both natural-language search and structured key-value tokens (`status:`, `make:`, `origin:`, `fuel:`, `price<`), synchronized directly with the Zustand filter store and command palette.
  - *Why*: Lets novices click suggested filter chips while power users type queries or execute calculator/FX conversions directly from the header.
  - *Alternatives Considered*: Separate disconnected search inputs on each page, which creates inconsistent filtering behavior.

- **Decision 3: Client-Side Optimistic Persistence + Prisma API Synchronization**
  - *Chosen Approach*: Keep all pinned views, selected batch rows, active inspector targets, and showroom records in the persisted Zustand store with background synchronization to Next.js Prisma API routes when a database is configured.
  - *Why*: Guarantees zero-latency UI response (`< 50ms`) for filtering, sorting, batch updates, and Looker cross-filtering while maintaining full backend compatibility.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD & WORKSPACE SHELL (ClientLayoutWrapper)                 │
│  ┌────────────────────┐  ┌────────────────────────────────────┐  ┌────────────────────┐  │
│  │ Collapsible Rail   │  │ Unified Top App Bar & Omnibox      │  │ Global Keyboard    │  │
│  │ • Fleet & Lot      │  │ • Branch Context Selector          │  │ Engine & Modals    │  │
│  │ • Commercial CRM   │  │ • Cmd+K / "/" Structured Omnibox   │  │ • g+d / g+i / g+a  │  │
│  │ • Treasury & Port  │  │ • Sarrafi FX, Client View, Role    │  │ • j/k Row Focus    │  │
│  │ • Pinned Presets   │  │ • "?" Keyboard Shortcut Cheat Sheet│  │ • "?" Help Dialog  │  │
│  └─────────┬──────────┘  └─────────────────┬──────────────────┘  └─────────┬──────────┘  │
└────────────┼───────────────────────────────┼───────────────────────────────┼─────────────┘
             │                               │                               │
             ▼                               ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                         ZUSTAND PLATFORM STORE (useShowroomStore)                        │
│  • Core Entities: vehicles, customers, invoices, vouchers, suppliers, expenses           │
│  • Workspace State: pinnedViews, activeViewId, selectedVehicleIds, inspectedEntity       │
│  • Cross-Filter State: activeChartFilter (dimension, value), omniboxTokens               │
└────────────┬───────────────────────────────────────────────┬─────────────────────────────┘
             │                                               │
             ▼                                               ▼
┌──────────────────────────────────────────────┐ ┌─────────────────────────────────────────┐
│        MAIN WORKSPACE VIEWPORT (Left/Center) │ │   CONTEXTUAL INSPECTOR DRAWER (Right)   │
│  ┌────────────────────────────────────────┐  │ │  • Quick Spec & Landed Cost Summary     │
│  │ Pinned Views Bar & Saved Filter Chips  │  │ │  • Interactive 11-Zone Paint Blueprint  │
│  ├────────────────────────────────────────┤  │ │  • Customs Maktoub & Container Stepper  │
│  │ Looker Studio Interactive Cohort Strip │  │ │  • Inline Status / Price Quick Edit     │
│  │ • Make Distribution • Port Pipeline    │  │ │  • Direct Links: Full Dossier, Qabala   │
│  │ • Revenue & Margin Waterfall           │  │ │    Deed, Sarrafi Settlement, WhatsApp   │
│  ├────────────────────────────────────────┤  │ └─────────────────────────────────────────┘
│  │ Multi-Select Batch Action Toolbar      │  │
│  │ • Bulk Status • Bulk FX Price • Export │  │
│  ├────────────────────────────────────────┤  │
│  │ High-Density Resource Table / Grid     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

- **Data Model & State Extensions**:
  - **Pinned Workspace Views (`PinnedView[]`)**: Stores `id`, `name`, `icon`, `isSystem`, and `filters` (`make`, `status`, `fuelType`, `originCountry`, `maxPrice`, `search`). Pre-seeded with practical dealership presets (*All Fleet*, *Showroom Ready*, *Islam Qala In-Transit*, *Hybrid & Electric*, *High-Margin Units*) plus user-created views.
  - **Batch Selection (`selectedVehicleIds: string[]`)**: Tracks checked vehicle rows across table and grid views to power bulk status updates, bulk price adjustments, bulk comparison, and filtered CSV exports.
  - **Contextual Inspector State (`inspectedVehicleId: string | null`, `inspectedCustomerId: string | null`)**: Controls the slide-over right-hand inspector drawer from any workspace screen.
  - **Looker Cross-Filter State (`chartFilter: { field: string; value: string } | null`)**: Allows clicking any bar, cohort segment, or status metric in the analytics strip to filter the active dataset immediately.

- **Interactive Component & State Mapping**:
  - **Omnibox & Command Palette**: Typing structured tokens (e.g., `origin:Japan`, `status:Available`, `fuel:Hybrid`) or selecting suggestions updates `filters` in `useShowroomStore`; typing math or currency expressions (e.g., `24500 * 70.5`) computes live USD/AFN Sarrafi conversions inline.
  - **Contextual Inspector Drawer**: Clicking a row's inspect button (or pressing `Enter` / `i` on a keyboard-focused row) sets `inspectedVehicleId`, sliding open the right-hand panel with tabs for *Overview & Pricing*, *11-Zone Paint Map*, and *Customs & Documents*, plus inline status mutation handlers.
  - **Batch Action Toolbar**: Selecting one or more checkboxes renders the sticky Google Cloud action bar with working handlers for *Change Status (Available / Reserved / In Transit / Sold)*, *Adjust Selling Price (%)*, *Add to Comparison*, and *Export Selected to CSV*.
  - **Keyboard Shortcut Listener**: Global listener (disabled when typing inside `<input>`, `<textarea>`, or `<select>`) handles two-key navigation chords (`g` + `d`/`i`/`a`/`l`/`c`), `/` to focus the Omnibox, `j`/`k` to step through rows, `x` to toggle selection on the focused row, `Escape` to close drawers/modals, and `?` to open the Keyboard Shortcuts reference modal.
