# Intro to SWE Project

A Next.js application with Supabase authentication and role-based routing (admin / student).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/Intro-to-SWE-Project.git
cd Intro-to-SWE-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your Supabase project

If you don't already have one, create a free project at [supabase.com](https://supabase.com/).

### 4. Set up environment variables

Create a `.env` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

To find these values:

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings > API**
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **publishable** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Copy the **service_role / secret** key → `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

> The service role key is only needed to seed the admin account. Never expose it to the client in production.

### 5. Run the database migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Open and run the file [`supabase/migrations/001_create_profiles.sql`](supabase/migrations/001_create_profiles.sql)

This creates:

- The `profiles` table (id, name, email, role, xp)
- Row Level Security policies
- A trigger that auto-creates a profile when a new user signs up
- A helper `is_admin()` function for admin-level RLS policies

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 7. Seed the admin account

With the dev server running, visit:

```
http://localhost:3000/api/seed
```

This creates a test admin account:

| Field    | Value            |
| -------- | ---------------- |
| Email    | `admin@test.com` |
| Password | `1234`           |

You can now sign in with these credentials and you'll be routed to the admin dashboard.

### 8. Create a student account

Use the **Sign Up** tab on the home page to register a new student account. The trigger from step 5 will automatically create a profile with the `student` role, and you'll be routed to the student dashboard.

## Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework
- [Supabase](https://supabase.com/) — Authentication & database
- [Tailwind CSS](https://tailwindcss.com/) — Styling
