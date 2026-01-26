import { relations } from "drizzle-orm";
import { bigint, date, decimal, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const stocks = pgTable('stocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticker: varchar('ticker', { length: 10 }).unique().notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  totalVolume: bigint('total_volume', { mode: 'number' }).notNull(),
  availableVolume: bigint('available_volume', { mode: 'number' }).notNull(),
  initialPrice: decimal('initial_price', { precision: 10, scale: 4 }).notNull(),
  currentPrice: decimal('current_price', { precision: 10, scale: 4 }).notNull(),
  openingPrice: decimal('opening_price', { precision: 10, scale: 4 }),
  dayHigh: decimal('day_high', { precision: 10, scale: 4 }),
  dayLow: decimal('day_low', { precision: 10, scale: 4 }),
  previousClose: decimal('previous_close', { precision: 10, scale: 4 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const stockPriceHistory = pgTable('stock_price_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  stockId: uuid('stock_id').references(() => stocks.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 4 }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
}, (table) => [index('idx_price_history_stock_time').on(table.stockId, table.recordedAt)]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  stockId: uuid('stock_id').references(() => stocks.id, { onDelete: 'cascade' }),
  orderType: varchar('order_type', { length: 10 }).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtOrder: decimal('price_at_order', { precision: 10, scale: 4 }).notNull(),
  executedPrice: decimal('executed_price', { precision: 10, scale: 4 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  executedAt: timestamp('executed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
}, (table) => [index('idx_orders_user').on(table.userId), index('idx_orders_status').on(table.status)]);

export const portfolios = pgTable('portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  stockId: uuid('stock_id').references(() => stocks.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  averageBuyPrice: decimal('average_buy_price', { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [uniqueIndex('portfolio_user_stock_idx').on(table.userId, table.stockId)]);

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id),
  transactionType: varchar('transaction_type', { length: 20 }).notNull(),
  stockId: uuid('stock_id').references(() => stocks.id),
  quantity: integer('quantity'),
  pricePerShare: decimal('price_per_share', { precision: 10, scale: 4 }),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [index('idx_transactions_user').on(table.userId), index('idx_transactions_type').on(table.transactionType)]);

export const marketSettings = pgTable('market_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  settingKey: varchar('setting_key', { length: 50 }).unique().notNull(),
  settingValue: jsonb('setting_value').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const marketHolidays = pgTable('market_holidays', {
  id: uuid('id').primaryKey().defaultRandom(),
  holidayDate: date('holiday_date').unique().notNull(),
  holidayName: varchar('holiday_name', { length: 255 }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cashAccount: one(cashAccounts, { fields: [users.id], references: [cashAccounts.userId] }),
  orders: many(orders),
  portfolios: many(portfolios),
  transactions: many(transactions),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  stock: one(stocks, { fields: [orders.stockId], references: [stocks.id] }),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  user: one(users, { fields: [portfolios.userId], references: [users.id] }),
  stock: one(stocks, { fields: [portfolios.stockId], references: [stocks.id] }),
}));
