import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __db: NodePgDatabase<typeof schema> | undefined;
}

function resolveProjectConnectionString(url: string | undefined) {
  if (!url) {
    throw new Error("DATABASE_URL is not set. This app's Digicraft-managed database is not configured.");
  }
  let dbName;
  try {
    dbName = new URL(url).pathname.replace(/^\//, "").split("?")[0];
  } catch {
    throw new Error("DATABASE_URL is malformed.");
  }
  if (!dbName.startsWith("proj_")) {
    throw new Error(
      "Refusing to connect: DATABASE_URL points at \"" + dbName + "\", not this project's database (a proj_* database is expected). This usually means an inherited or misconfigured DATABASE_URL."
    );
  }
  return url;
}

/**
 * Lazily construct the pool + Drizzle client on first query. Resolving the
 * connection string at import time throws during `next build` (DATABASE_URL is
 * only injected at runtime), which fails the production build. Deferring keeps
 * importing this module side-effect free.
 */
function getDb(): NodePgDatabase<typeof schema> {
  if (global.__db) return global.__db;
  const pool =
    global.__pgPool ??
    new Pool({
      connectionString: resolveProjectConnectionString(process.env.DATABASE_URL),
      // Resilience for long-idle apps: recycle idle clients, keep TCP alive so the
      // server/proxy doesn't silently drop connections, and don't hang forever.
      max: 10,
      idleTimeoutMillis: 30_000,
      keepAlive: true,
      connectionTimeoutMillis: 10_000,
    });

  // CRITICAL: without this handler, an error on an idle client (e.g. the DB
  // dropping a connection after inactivity) emits an 'error' on the pool that,
  // if unhandled, crashes the Node process and takes the whole app down. The pg
  // pool removes the bad client automatically; the next query opens a fresh one.
  pool.on('error', (err) => {
    console.error('[pg pool] idle client error (recovered):', err.message);
  });

  global.__pgPool = pool;
  global.__db = drizzle(pool, { schema });
  return global.__db;
}

// Proxy so existing `import { db }` call sites keep working unchanged, while the
// real client is only created when a query actually runs (runtime, not build).
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});
