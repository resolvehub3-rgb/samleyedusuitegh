# SamleyEduSuite Ghana — School Management System

> Production-grade multi-tenant School Management SaaS for Ghanaian private schools.

SamleyEduSuite gives Ghanaian private schools one simple platform to manage students, teachers, parents, attendance, academic performance, reports, communication, and payments.

## Features

- **Student Management** — Manage student records, classes, transfers, promotions, and academic history.
- **Teacher Management** — Manage teachers, class assignments, and subject assignments.
- **Parent Portal** — Parents can access their wards' progress, attendance, reports, and school information.
- **Attendance** — Teachers record attendance for authorized classes; administrators can monitor all attendance.
- **Academic Performance** — Manage student academic performance and results across subjects and terms.
- **Terminal Report Cards** — Generate professional terminal report cards at the end of each term.
- **School Payments** — Parents can make and monitor school payments through their portal.
- **Announcements** — Send important school announcements to all, parents, teachers, or specific classes.
- **Real-Time Notifications** — Keep parents, teachers, and administrators updated in realtime via Supabase Realtime.
- **Student Promotion & Transfer** — Move students between classes while preserving their academic history.
- **Teacher Reviews** — Parents can review their ward's assigned class teacher and submit comments.

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access — manage students, teachers, parents, classes, subjects, attendance, reports, payments, announcements, and school settings. |
| **Teacher** | View assigned classes, mark attendance, and view school announcements. |
| **Parent** | View ward progress, attendance, reports, payments, make payments, and submit teacher reviews. |
| **Super Admin** | Platform-level management — oversee all schools, users, subscriptions, and system settings. |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
- **Animations:** Motion (Framer Motion successor)
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd edusaas-ghana---school-management-system
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

You can find these values in your Supabase Dashboard under **Project Settings → API**.

### 4. Set up the database

Run the SQL schema in your Supabase SQL Editor:

- `src/lib/supabase-schema.sql` — Main application schema
- `src/lib/subscription-schema.sql` — Subscription tables
- `src/lib/superAdminSchema.sql` — Super admin tables

### 5. Start the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run TypeScript type checking (`tsc --noEmit`) |
| `pnpm clean` | Remove `dist/` and `server.js` |

## Deployment

The project is configured for [Vercel](https://vercel.com/). Push to your connected Git repository and Vercel will automatically build and deploy.

Make sure to set the following environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard & management views
│   │   ├── announcements/  # School announcements
│   │   ├── auth/           # Login, registration, invitation, password reset
│   │   ├── landing/        # Public landing page
│   │   ├── layout/         # Navbar & Sidebar
│   │   ├── parent/         # Parent portal views
│   │   ├── payments/       # Payment management
│   │   ├── reports/        # Academic results & terminal report cards
│   │   ├── reviews/        # Teacher reviews
│   │   ├── subscription/   # Subscription views
│   │   ├── super-admin/    # Super admin platform management
│   │   └── teacher/        # Teacher portal views
│   ├── context/            # React context providers (Auth, Theme, Notifications, etc.)
│   ├── lib/                # Supabase client, SQL schemas, utilities
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Entry point
├── public/                 # Static assets (logo, images)
├── scripts/                # Utility scripts
├── supabase-schema.sql     # Database schema
├── vercel.json             # Vercel deployment config
└── package.json
```

## License

Private — All rights reserved.
