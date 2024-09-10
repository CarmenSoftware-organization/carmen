import { db } from './db';
import { sql } from 'drizzle-orm';
import { currencies, exchangeRates, exchangeRateHistory } from './schema/currency';

async function setup() {
  console.log('Setting up database...');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${currencies} (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${exchangeRates} (
      id SERIAL PRIMARY KEY,
      base_currency_id INTEGER NOT NULL,
      target_currency_id INTEGER NOT NULL,
      rate DECIMAL(10, 6) NOT NULL,
      last_updated TIMESTAMP NOT NULL,
      FOREIGN KEY (base_currency_id) REFERENCES currencies(id),
      FOREIGN KEY (target_currency_id) REFERENCES currencies(id)
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${exchangeRateHistory} (
      id SERIAL PRIMARY KEY,
      exchange_rate_id INTEGER NOT NULL,
      rate DECIMAL(10, 6) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      FOREIGN KEY (exchange_rate_id) REFERENCES exchange_rates(id)
    )
  `);

  console.log('Database setup complete.');
}

setup().catch(console.error);