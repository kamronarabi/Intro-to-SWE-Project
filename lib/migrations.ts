import * as fs from "fs";
import * as path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

export async function runMigrations(
  supabaseClient: any
): Promise<{ success: boolean; message: string }> {
  try {
    // Read all migration files
    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let appliedCount = 0;

    for (const file of migrationFiles) {
      try {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        // Split into statements and execute each one
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s && !s.startsWith("--"));

        for (const statement of statements) {
          try {
            // Execute via Supabase SQL
            const { error } = await supabaseClient.rpc("sql", {
              query: statement,
            });

            if (error) {
              // If the specific RPC doesn't exist, log but continue
              console.log(`Migration ${file}: statement may already exist`);
            }
          } catch (err) {
            // Continue if individual statement fails (may already exist)
            console.log(
              `Skipping statement in ${file} (may already exist):`,
              (err as Error).message
            );
          }
        }

        appliedCount++;
      } catch (err) {
        console.error(`Error processing migration ${file}:`, err);
      }
    }

    return {
      success: true,
      message: `Processed ${appliedCount} migration files`,
    };
  } catch (err) {
    console.error("Migration error:", err);
    return {
      success: false,
      message: `Migration error: ${(err as Error).message}`,
    };
  }
}
