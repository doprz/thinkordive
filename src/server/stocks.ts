import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, sql } from "drizzle-orm";
import { stockPrices } from "@/server/db/schema";
import { db } from "./db/init";

// Latest 1d candle per stock; uses DISTINCT ON for a single efficient query
export const getStocksWithLatestPrice = createServerFn().handler(async () => {
  const rows = await db.execute(sql`
    SELECT
      s.id, s.symbol, s.name, s.sector, s.industry,
      p.close, p.change, p.change_pct, p.volume, p.timestamp
    FROM stocks s
    LEFT JOIN LATERAL (
      SELECT close, change, change_pct, volume, timestamp
      FROM stock_prices
      WHERE stock_id = s.id AND interval = '1d'
      ORDER BY timestamp DESC
      LIMIT 1
    ) p ON true
    ORDER BY s.symbol ASC
  `);

  return rows.rows as {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    industry: string;
    close: string;
    change: string;
    change_pct: string;
    volume: number;
    timestamp: string;
  }[];
});

export type RangeKey = "1D" | "1W" | "1M" | "1Y";

export const RANGE_DAYS: Record<RangeKey, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "1Y": 365,
};

// 90-day 1d candles for the chart
export const getStockPriceHistory = createServerFn()
  .inputValidator((input: { stockId: string; range: RangeKey }) => input)
  .handler(async ({ data: { stockId, range } }) => {
    const since = new Date();
    since.setDate(since.getDate() - RANGE_DAYS[range]);

    return db
      .select({
        timestamp: stockPrices.timestamp,
        open: stockPrices.open,
        high: stockPrices.high,
        low: stockPrices.low,
        close: stockPrices.close,
        volume: stockPrices.volume,
      })
      .from(stockPrices)
      .where(
        and(
          eq(stockPrices.stockId, stockId),
          eq(stockPrices.interval, "1d"),
          gte(stockPrices.timestamp, since),
        ),
      )
      .orderBy(stockPrices.timestamp);
  });
