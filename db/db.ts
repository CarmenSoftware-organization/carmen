import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { currencies, exchangeRates, exchangeRateHistory } from './schema/currency';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

console.log('Database URL:', process.env.DATABASE_URL); // Add this line for debugging

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export const schema = {
  currencies,
  exchangeRates,
  exchangeRateHistory,
};