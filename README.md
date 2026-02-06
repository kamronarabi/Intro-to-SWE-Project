# Intro to SWE Project

A Next.js application with Supabase authentication.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root of the project with the following keys:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

You can find these values in your Supabase project dashboard:

1. Go to [supabase.com](https://supabase.com/) and open your project
2. Navigate to **Project Settings** > **API**
3. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public** key (publishable key) and paste it as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 3. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

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
- [Radix UI](https://www.radix-ui.com/) — UI primitives
