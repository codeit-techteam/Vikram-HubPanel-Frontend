# Vikram Hub Portal

Professional Logistics ERP frontend built with Next.js 15, React 19, and TypeScript.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS, ShadCN UI, Lucide Icons
- **State:** Zustand, TanStack React Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Tables:** TanStack Table
- **HTTP:** Axios (service placeholders)
- **Animation:** Framer Motion
- **Notifications:** React Hot Toast
- **Dates:** date-fns

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # UI, layout, tables, charts, forms
│   ├── services/         # API service placeholders (mock data)
│   ├── store/            # Zustand stores
│   ├── mock/             # Local JSON mock data
│   ├── types/            # TypeScript interfaces
│   ├── constants/        # Navigation, theme
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   └── utils/            # Helper functions
└── public/               # Static assets
```

## Features

- Fixed sidebar with collapsible navigation
- Top header with breadcrumbs, notifications, and user profile
- Dashboard with KPI cards and Recharts analytics
- Data tables with sorting, search, filters, pagination, export, column visibility
- Mock data layer for all logistics entities
- Service layer ready for backend API integration

## Mock Data

All API calls use local JSON files in `src/mock/`. Services in `src/services/` simulate async API calls with delays.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (placeholder) |
| `NEXT_PUBLIC_APP_NAME` | Application display name |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Theme

- Primary: `#FF6B00` (Orange)
- Background: White
- Enterprise logistics ERP design

## Backend Integration

When the backend is ready, update service files in `src/services/` to call real API endpoints via the configured Axios instance in `src/services/axios.ts`.
