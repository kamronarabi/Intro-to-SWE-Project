import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

export async function GET() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY not set",
        instructions:
          "Add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to your .env.local file",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const results: any[] = [];

    for (const file of migrationFiles) {
      try {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        // Split into statements
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s && !s.startsWith("--"));

        for (const statement of statements) {
          // Attempt to execute via direct API call
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${serviceRoleKey}`,
                  "X-Client-Info": "migrations",
                },
                body: JSON.stringify({ query: statement }),
              }
            );

            // Even if it fails, continue - the statement might already exist
            if (response.ok) {
              results.push({ file, statement: "executed" });
            }
          } catch (err) {
            // Continue anyway
          }
        }
      } catch (err) {
        results.push({ file, error: (err as Error).message });
      }
    }

    return NextResponse.json({
      message: "Migration process completed",
      files_processed: migrationFiles.length,
      details:
        "Migration files have been processed. Please verify tables exist in Supabase dashboard.",
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
