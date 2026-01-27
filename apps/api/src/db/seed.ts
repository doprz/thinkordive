import { db } from "./setup";
import * as schema from "./schema";

const stocks = [
  { ticker: "AAPL", companyName: "Apple Inc.", totalVolume: 55_000_000, initialPrice: 255.5 },
  { ticker: "GOOGL", companyName: "Alphabet Inc. Class A", totalVolume: 26_000_000, initialPrice: 335.5 },
  { ticker: "GOOG", companyName: "Alphabet Inc. Class C", totalVolume: 18_000_000, initialPrice: 335.5 },
  { ticker: "MSFT", companyName: "Microsoft Corporation", totalVolume: 29_000_000, initialPrice: 470.2 },
  { ticker: "AMZN", companyName: "Amazon.com Inc.", totalVolume: 38_000_000, initialPrice: 238.4 },
  { ticker: "NVDA", companyName: "NVIDIA Corporation", totalVolume: 124_000_000, initialPrice: 186.4 },
  { ticker: "META", companyName: "Meta Platforms Inc.", totalVolume: 16_000_000, initialPrice: 672.3 },
  { ticker: "TSLA", companyName: "Tesla Inc.", totalVolume: 71_000_000, initialPrice: 435.2 },
  { ticker: "JPM", companyName: "JPMorgan Chase & Co.", totalVolume: 11_000_000, initialPrice: 301.0 },
  { ticker: "V", companyName: "Visa Inc.", totalVolume: 7_000_000, initialPrice: 328.5 },
];

const holidays2025 = [
  { date: "2025-01-01", name: "New Year's Day" },
  { date: "2025-01-20", name: "Martin Luther King Jr. Day" },
  { date: "2025-02-17", name: "Presidents' Day" },
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-05-26", name: "Memorial Day" },
  { date: "2025-06-19", name: "Juneteenth" },
  { date: "2025-07-04", name: "Independence Day" },
  { date: "2025-09-01", name: "Labor Day" },
  { date: "2025-11-27", name: "Thanksgiving Day" },
  { date: "2025-12-25", name: "Christmas Day" },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(schema.stockPriceHistory);
  await db.delete(schema.transaction);
  await db.delete(schema.order);
  await db.delete(schema.portfolio);
  await db.delete(schema.stock);
  await db.delete(schema.marketHoliday);
  await db.delete(schema.marketSetting);

  // Seed stocks
  console.log("Seeding stocks...");
  for (const s of stocks) {
    await db.insert(schema.stock).values({
      ticker: s.ticker,
      companyName: s.companyName,
      totalVolume: s.totalVolume,
      availableVolume: s.totalVolume,
      initialPrice: s.initialPrice.toString(),
      currentPrice: s.initialPrice.toString(),
      openingPrice: s.initialPrice.toString(),
      dayHigh: s.initialPrice.toString(),
      dayLow: s.initialPrice.toString(),
      previousClose: s.initialPrice.toString(),
    });
    console.log(`  ✓ ${s.ticker} - ${s.companyName}`);
  }

  // Seed market holidays
  console.log("\nSeeding market holidays...");
  for (const h of holidays2025) {
    await db.insert(schema.marketHoliday).values({
      holidayDate: h.date,
      holidayName: h.name,
    });
    console.log(`${h.date} - ${h.name}`);
  }

  // Seed default market settings
  console.log("\nSeeding market settings...");
  await db.insert(schema.marketSetting).values({
    settingKey: "market_hours",
    settingValue: {
      open: { hour: 9, minute: 30 },
      close: { hour: 16, minute: 0 },
      timezone: "America/New_York",
    },
  });
  console.log("Market hours configured (9:30 AM - 4:00 PM ET)");

  console.log("\nDatabase seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
