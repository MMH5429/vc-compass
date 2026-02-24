# Vektor — VC Intelligence Dashboard

A modern, dark-themed deal-flow and company intelligence platform for venture capital teams. Built with Vite, React, TypeScript, and shadcn/ui.

![Vektor Dashboard](https://img.shields.io/badge/Vektor-VC%20Intelligence-2563eb?style=for-the-badge&logo=zap)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

---

## Features

### Dashboard
- Live deal-flow overview with stat cards (companies, total raised, signals)
- Recent signal activity feed across all tracked companies
- Interactive stage distribution and industry breakdown charts — click any bar to filter the Companies view
- Signal type breakdown with proportional bars

### Companies
- Searchable, filterable, and sortable company table
- Filter by industry and stage with dismissible chip indicators
- Colour-coded stage badges (Seed, Series A, Series B, Series C)
- Company letter avatars, funding in monospace, signal type pills
- Save any search/filter combination for later re-use
- Paginated with page number buttons and result range display

### Company Profile
- Gradient letter avatar, domain link, description, and tags
- Meta strip: location, employees, founded, funding, stage, domain
- **Signals tab** — coloured left-border cards per signal type with clock timestamps
- **Notes tab** — compose area with `⌘+Enter` shortcut, hover-to-reveal delete
- **Enrichment tab** — one-click Clearbit enrichment: summary, bullet points, tech stack, social profiles, keywords, and derived signals

### Lists
- Create named collections with optional descriptions
- Add companies from any profile page
- Export any list as **CSV** or **JSON**
- Company rows show avatars, stage badges, funding, and hover-to-reveal remove button

### Saved Searches
- Save any Companies search + filter state
- Re-run with one click — navigates back to Companies with filters pre-applied
- Query shown as a styled chip, filters as colour-coded badges

### Global Search (`⌘K` / `Ctrl+K`)
- Quick navigation links when idle
- Full company search by name, domain, industry, or tag
- Results show avatar, name, domain, stage badge, and funding
- Keyboard shortcut footer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Charts | [Recharts](https://recharts.org) |
| Routing | [React Router v6](https://reactrouter.com) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Icons | [Lucide React](https://lucide.dev) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Persistence | Browser `localStorage` via custom hook |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vc-compass.git
cd vc-compass

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at **http://localhost:8080** by default.

### Other commands

```bash
npm run build        # Production build → dist/
npm run preview      # Preview the production build locally
npm run lint         # ESLint check
npm run test         # Run tests (Vitest)
```

---

## Project Structure

```
src/
├── components/
│   ├── AppLayout.tsx        # Sidebar navigation + global layout
│   ├── GlobalSearch.tsx     # ⌘K spotlight search
│   └── ui/                  # shadcn/ui primitives
├── data/
│   └── mockCompanies.ts     # 15 mock venture-backed companies
├── hooks/
│   └── useLocalStorage.ts   # Typed localStorage hook
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Tailwind merge utility
└── pages/
    ├── Dashboard.tsx        # Deal-flow overview
    ├── Companies.tsx        # Company table + filters
    ├── CompanyProfile.tsx   # Profile with signals, notes, enrichment
    ├── Lists.tsx            # Custom company collections
    └── SavedSearches.tsx    # Saved query management
```

---

## Roadmap

- [x] Real API enrichment (Clearbit + Hunter.io)
- [ ] Authentication and multi-user support
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Email digest of new signals
- [ ] CSV import for bulk company upload
- [ ] Custom signal types and tagging
- [ ] Pipeline kanban view

---

## License

MIT
