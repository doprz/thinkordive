import {
  bigint,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const stocks = pgTable("stocks", {
  id: text("id").primaryKey(), // e.g. "AAPL" — symbol as PK keeps joins readable
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  sector: text("sector"), // e.g. "Technology"
  industry: text("industry"), // e.g. "Consumer Electronics"
  logoUrl: text("logo_url"), // handy for dashboard cards
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const intervalEnum = pgEnum("price_interval", [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "1d",
  "1w",
]);

export const stockPrices = pgTable(
  "stock_prices",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    stockId: text("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    interval: intervalEnum("interval").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),

    // OHLCV - stored as numeric for precision (no float rounding)
    open: numeric("open", { precision: 18, scale: 4 }).notNull(),
    high: numeric("high", { precision: 18, scale: 4 }).notNull(),
    low: numeric("low", { precision: 18, scale: 4 }).notNull(),
    close: numeric("close", { precision: 18, scale: 4 }).notNull(),
    volume: bigint("volume", { mode: "number" }).notNull(),

    // Useful for dashboard snapshot cards
    change: numeric("change", { precision: 18, scale: 4 }), // close - prev_close
    changePct: numeric("change_pct", { precision: 8, scale: 4 }), // % change
  },
  (t) => [
    // Core query pattern: "give me all 1d candles for AAPL, ordered by time"
    index("stock_prices_stock_interval_ts_idx").on(
      t.stockId,
      t.interval,
      t.timestamp,
    ),
    // Enforce no duplicate candles for the same stock + interval + timestamp
    uniqueIndex("stock_prices_unique_candle_idx").on(
      t.stockId,
      t.interval,
      t.timestamp,
    ),
  ],
);

// Types
export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;
export type StockPrice = typeof stockPrices.$inferSelect;
export type NewStockPrice = typeof stockPrices.$inferInsert;
