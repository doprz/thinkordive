import { auth } from "@lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.use("*", logger());

// Custom middleware to save the session and user in a context
// and also add validations for every route
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Custom middleware to only allow users with the admin role to access these routes
app.use("/api/admin/*", async (c, next) => {
  const user = c.get("user");

  if (!user || user.role !== "admin")
    return c.json({ error: "Forbidden" }, 403);
  await next();
});

// Example endpoint to test middleware and auth
app.get("/api/admin/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  return c.json({
    session,
    user,
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default app;
