import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const runMigrations = async () => {
    console.log("⏳ Running migrations...");

    const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(connection);

    await migrate(db, { migrationsFolder: "./db/migrations" });

    await connection.end();

    console.log("✅ Migrations completed!");
    process.exit(0);
};

runMigrations().catch((err) => {
    console.error("❌ Migration failed!");
    console.error(err);
    process.exit(1);
});

