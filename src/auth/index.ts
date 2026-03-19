import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/server/db/init";

// Cloudflare D1 database bindings are scoped to each request's `env` object,
// so we can't initialize auth at the module level - the db isn't available yet.
// Instead, we use a singleton so auth is only created once on the first request rather than re-instantiated on every call.
function createAuth() {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      openAPI(),
      admin(),
      tanstackStartCookies(), // Make sure this is the last plugin in the array
    ],
  });
}

// Singleton patternto ensure a single auth instance
let authInstance: ReturnType<typeof createAuth> | undefined;

export async function initAuth() {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
}
