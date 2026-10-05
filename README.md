# School Ops

Frontend for a multi-tenant school operations platform focused on the day-to-day needs of Pakistani schools.

The application separates platform administration from tenant school workflows and provides role-aware access to student, attendance, fee, staff, academic, finance, reporting, and analytics modules.

## Current status

This repository contains the frontend application. It currently includes mock authentication and sample data for local development, alongside an Axios API client prepared for backend integration through `NEXT_PUBLIC_API_URL`.

## Product areas

- Tenant dashboard with operational summaries and charts
- Student records and related workflows
- Attendance management
- Fee collection and financial views
- Academic and examination workflows
- Staff and payroll areas
- Reports, analytics, notifications, and settings
- SaaS administration for platform-level workflows
- Role-aware navigation and route protection
- Printable and PDF-oriented reporting interfaces

## Technology

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 and Base UI
- TanStack Query and TanStack Table
- Zustand
- React Hook Form and Zod
- Axios
- Recharts
- React PDF

## Architecture

```text
src/app/(auth)/         Authentication routes
src/app/(saas-admin)/   Platform administration routes
src/app/(tenant)/       School tenant routes
src/components/         Domain and shared interface components
src/hooks/              Reusable application hooks
src/lib/                API, auth, permissions, validation, and utilities
src/providers/          Application providers
src/store/              Authentication and interface state
src/types/              Shared TypeScript models
src/middleware.ts       Authentication and role-aware route guards
```

Route middleware separates SaaS administrators from tenant users. Teacher access is restricted from fee, payroll, finance, and settings areas. Client requests use a shared Axios instance with authentication headers and centralized handling for expired sessions.

## Local development

Use a recent Node.js LTS release.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To connect the frontend to an API, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Without a configured backend, the included mock authentication and sample data support local interface development.

## Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Run the production server
npm run lint      # Run ESLint
```