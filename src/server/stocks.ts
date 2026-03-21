import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, sql } from "drizzle-orm";
import { stockPrices, stocks } from "@/server/db/schema";
import { db } from "./db/init";

// NOTE: SQLite equivalent of LATERAL JOIN: subquery gets max timestamp per stock,
// then we join stock_prices again on that exact timestamp to get the full row.
export const getStocksWithLatestPrice = createServerFn().handler(async () => {
  const latestPerStock = db
    .select({
      stockId: stockPrices.stockId,
      maxTs: sql<string>`MAX(${stockPrices.timestamp})`.as("max_ts"),
    })
    .from(stockPrices)
    .where(eq(stockPrices.interval, "1d"))
    .groupBy(stockPrices.stockId)
    .as("latest_per_stock");

  return db
    .select({
      id: stocks.id,
      symbol: stocks.symbol,
      name: stocks.name,
      sector: stocks.sector,
      industry: stocks.industry,
      close: stockPrices.close,
      change: stockPrices.change,
      changePct: stockPrices.changePct,
      volume: stockPrices.volume,
      timestamp: stockPrices.timestamp,
    })
    .from(stocks)
    .leftJoin(latestPerStock, eq(latestPerStock.stockId, stocks.id))
    .leftJoin(
      stockPrices,
      and(
        eq(stockPrices.stockId, stocks.id),
        eq(stockPrices.interval, "1d"),
        eq(stockPrices.timestamp, latestPerStock.maxTs),
      ),
    )
    .orderBy(stocks.symbol);
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
