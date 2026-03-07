import { eq } from "drizzle-orm";
import { reset, seed } from "drizzle-seed";
import { auth } from "@/server/auth";
import type { NewStockPrice } from "@/server/db/schema";
import * as apiSchema from "@/server/db/schema";
import { user } from "./auth-schema";
import { db } from "./init";

// Require name, email, role, and tmppass fields; other fields optional
type BAUser = typeof user.$inferSelect;
type TestUser = Pick<BAUser, "name" | "email" | "role"> &
  Partial<Omit<BAUser, "name" | "email" | "role">> & {
    tmppass: string;
  };

const TEST_USERS = [
  {
    name: "Test Customer",
    email: "customer@thinkordive.local",
    tmppass: "password123",
    role: "customer",
  },
  {
    name: "Test Admin",
    email: "admin@thinkordive.local",
    tmppass: "password123",
    role: "admin",
  },
] as const satisfies TestUser[];

async function upsertUser(u: (typeof TEST_USERS)[number]): Promise<string> {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, u.email));

  if (existing) {
    console.log(`  ${u.email} already exists, skipping`);
    return existing.id;
  }

  const res = await auth.api.signUpEmail({
    body: { name: u.name, email: u.email, password: u.tmppass },
    headers: new Headers(),
  });

  console.log(`  Created user: ${u.email}`);
  return res.user.id;
}

async function setRole(
  userId: string,
  role: "customer" | "admin",
): Promise<void> {
  await db.update(user).set({ role }).where(eq(user.id, userId));
}

// Starting prices keyed by symbol so charts look real
const BASE_PRICES: Record<string, number> = {
  AAPL: 200,
  AMD: 155,
  AMZN: 195,
  AVGO: 175,
  CSCO: 52,
  GE: 165,
  GOOG: 175,
  GOOGL: 173,
  JPM: 210,
  MA: 300,
  META: 520,
  MSFT: 415,
  NFLX: 640,
  NVDA: 875,
  ORCL: 130,
  TSLA: 175,
  V: 275,
};

function generatePriceHistory(stockId: string, days = 90): NewStockPrice[] {
  const base = BASE_PRICES[stockId] ?? 100;
  // Volatility scales with base price
  const volatility = base * 0.015;

  const rows: NewStockPrice[] = [];
  let prev = base;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const drift = (Math.random() - 0.48) * volatility;
    const open = parseFloat((prev + drift * 0.3).toFixed(4));
    const close = parseFloat(
      (open + (Math.random() - 0.48) * volatility).toFixed(4),
    );
    const high = parseFloat(
      (Math.max(open, close) + Math.random() * volatility * 0.4).toFixed(4),
    );
    const low = parseFloat(
      (Math.min(open, close) - Math.random() * volatility * 0.4).toFixed(4),
    );
    const change = parseFloat((close - prev).toFixed(4));
    const changePct = parseFloat(((change / prev) * 100).toFixed(4));

    rows.push({
      stockId,
      interval: "1d",
      timestamp: date,
      open: open.toString(),
      high: high.toString(),
      low: low.toString(),
      close: close.toString(),
      volume: Math.floor(10_000_000 + Math.random() * 50_000_000),
      change: change.toString(),
      changePct: changePct.toString(),
    } satisfies NewStockPrice);

    prev = close;
  }

  return rows;
}

async function main(): Promise<void> {
  console.log("Seeding database...");

  console.log("[1/3] Users");
  const userIds: Record<string, string> = {};
  for (const u of TEST_USERS) {
    const id = await upsertUser(u);
    await setRole(id, u.role);
    userIds[u.role] = id;
  }

  console.log("[2/3] Stocks (drizzle-seed)");
  await reset(db, apiSchema);
  await seed(
    db,
    { stocks: apiSchema.stocks },
    { count: Object.keys(BASE_PRICES).length },
  ).refine((f) => ({
    stocks: {
      columns: {
        name: f.companyName({ isUnique: true }),
        symbol: f.valuesFromArray({
          values: Object.keys(BASE_PRICES),
          isUnique: true,
        }),
        description: f.loremIpsum(),
        sector: f.default({ defaultValue: "Example Sector" }),
      },
    },
  }));

  console.log("[3/3] Price history (manual random walk)");
  const seededStocks = await db
    .select({ id: apiSchema.stocks.id })
    .from(apiSchema.stocks);

  for (const { id } of seededStocks) {
    const rows = generatePriceHistory(id);
    // Insert in one batch per stock
    await db.insert(apiSchema.stockPrices).values(rows);
    console.log(`  ${id}: ${rows.length} candles`);
  }
  console.log("Done seeding database");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
