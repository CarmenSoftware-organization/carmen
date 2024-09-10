import { pgTable, text, integer, serial, boolean, decimal, timestamp } from 'drizzle-orm/pg-core';

export const currencies = pgTable('currencies', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  active: boolean('active').notNull().default(true),
});

export const exchangeRates = pgTable('exchange_rates', {
  id: serial('id').primaryKey(),
  baseCurrencyId: integer('base_currency_id').notNull().references(() => currencies.id),
  targetCurrencyId: integer('target_currency_id').notNull().references(() => currencies.id),
  rate: decimal('rate', { precision: 10, scale: 6 }).notNull(),
  lastUpdated: timestamp('last_updated').notNull(),
});

export const exchangeRateHistory = pgTable('exchange_rate_history', {
  id: serial('id').primaryKey(),
  exchangeRateId: integer('exchange_rate_id').notNull().references(() => exchangeRates.id),
  rate: decimal('rate', { precision: 10, scale: 6 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
});