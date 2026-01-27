import { user } from "@db/auth-schema";
import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const cashAccount = pgTable(
  "cash_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .notNull()
      .default("0.00"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("cash_account_userId_idx").on(table.userId)],
);

export const stock = pgTable(
  "stock",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticker: text("ticker").notNull().unique(),
    companyName: text("company_name").notNull(),
    totalVolume: bigint("total_volume", { mode: "number" }).notNull(),
    availableVolume: bigint("available_volume", { mode: "number" }).notNull(),
    initialPrice: decimal("initial_price", {
      precision: 10,
      scale: 4,
    }).notNull(),
    currentPrice: decimal("current_price", {
      precision: 10,
      scale: 4,
    }).notNull(),
    openingPrice: decimal("opening_price", { precision: 10, scale: 4 }),
    dayHigh: decimal("day_high", { precision: 10, scale: 4 }),
    dayLow: decimal("day_low", { precision: 10, scale: 4 }),
    previousClose: decimal("previous_close", { precision: 10, scale: 4 }),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("stock_ticker_idx").on(table.ticker)],
);

export const stockPriceHistory = pgTable(
  "stock_price_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stock.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 10, scale: 4 }).notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("price_history_stock_time_idx").on(table.stockId, table.recordedAt),
  ],
);

export const order = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stock.id, { onDelete: "cascade" }),
    orderType: text("order_type", { enum: ["buy", "sell"] }).notNull(),
    quantity: integer("quantity").notNull(),
    priceAtOrder: decimal("price_at_order", {
      precision: 10,
      scale: 4,
    }).notNull(),
    executedPrice: decimal("executed_price", { precision: 10, scale: 4 }),
    status: text("status", { enum: ["pending", "executed", "cancelled"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    executedAt: timestamp("executed_at"),
    cancelledAt: timestamp("cancelled_at"),
  },
  (table) => [
    index("order_userId_idx").on(table.userId),
    index("order_status_idx").on(table.status),
    index("order_stockId_idx").on(table.stockId),
  ],
);

export const portfolio = pgTable(
  "portfolio",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stock.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    averageBuyPrice: decimal("average_buy_price", {
      precision: 10,
      scale: 4,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_user_stock_idx").on(table.userId, table.stockId),
    index("portfolio_userId_idx").on(table.userId),
  ],
);

export const transaction = pgTable(
  "transaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => order.id),
    transactionType: text("transaction_type", {
      enum: ["buy", "sell", "deposit", "withdrawal"],
    }).notNull(),
    stockId: uuid("stock_id").references(() => stock.id),
    quantity: integer("quantity"),
    pricePerShare: decimal("price_per_share", { precision: 10, scale: 4 }),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_userId_idx").on(table.userId),
    index("transaction_type_idx").on(table.transactionType),
    index("transaction_createdAt_idx").on(table.createdAt),
  ],
);

export const marketSetting = pgTable("market_setting", {
  id: uuid("id").primaryKey().defaultRandom(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const marketHoliday = pgTable(
  "market_holiday",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    holidayDate: date("holiday_date").notNull().unique(),
    holidayName: text("holiday_name").notNull(),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("holiday_date_idx").on(table.holidayDate)],
);

export const cashAccountRelations = relations(cashAccount, ({ one }) => ({
  user: one(user, { fields: [cashAccount.userId], references: [user.id] }),
}));

export const stockRelations = relations(stock, ({ one, many }) => ({
  creator: one(user, { fields: [stock.createdBy], references: [user.id] }),
  priceHistory: many(stockPriceHistory),
  orders: many(order),
  portfolios: many(portfolio),
}));

export const stockPriceHistoryRelations = relations(
  stockPriceHistory,
  ({ one }) => ({
    stock: one(stock, {
      fields: [stockPriceHistory.stockId],
      references: [stock.id],
    }),
  }),
);

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
  stock: one(stock, { fields: [order.stockId], references: [stock.id] }),
  transaction: one(transaction),
}));

export const portfolioRelations = relations(portfolio, ({ one }) => ({
  user: one(user, { fields: [portfolio.userId], references: [user.id] }),
  stock: one(stock, { fields: [portfolio.stockId], references: [stock.id] }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
  order: one(order, { fields: [transaction.orderId], references: [order.id] }),
  stock: one(stock, { fields: [transaction.stockId], references: [stock.id] }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Stock = typeof stock.$inferSelect;
export type NewStock = typeof stock.$inferInsert;
export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;
export type Portfolio = typeof portfolio.$inferSelect;
export type Transaction = typeof transaction.$inferSelect;
export type CashAccount = typeof cashAccount.$inferSelect;
export type MarketSetting = typeof marketSetting.$inferSelect;
export type MarketHoliday = typeof marketHoliday.$inferSelect;
