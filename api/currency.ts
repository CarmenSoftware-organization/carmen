import { db } from '@/db/db';
import { currencies, exchangeRates, exchangeRateHistory } from '@/db/schema/currency';
import { eq, and } from 'drizzle-orm';

export const currencyApi = {
  getAllCurrencies: async () => {
    return await db.select().from(currencies);
  },

  getCurrencyByCode: async (code: string) => {
    return await db.select().from(currencies).where(eq(currencies.code, code));
  },

  createCurrency: async (code: string, description: string) => {
    return await db.insert(currencies).values({ code, description });
  },

  updateCurrency: async (id: number, data: Partial<typeof currencies.$inferInsert>) => {
    return await db.update(currencies).set(data).where(eq(currencies.id, id));
  },

  deleteCurrency: async (id: number) => {
    return await db.delete(currencies).where(eq(currencies.id, id));
  },
};

export const exchangeRateApi = {
  getAllExchangeRates: async () => {
    return await db.select().from(exchangeRates);
  },

  getExchangeRate: async (baseCurrencyId: number, targetCurrencyId: number) => {
    return await db.select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.baseCurrencyId, baseCurrencyId),
          eq(exchangeRates.targetCurrencyId, targetCurrencyId)
        )
      );
  },

  createExchangeRate: async (baseCurrencyId: number, targetCurrencyId: number, rate: number) => {
    return await db.insert(exchangeRates).values({
      baseCurrencyId,
      targetCurrencyId,
      rate: rate.toString(), // Convert to string for DECIMAL type
      lastUpdated: new Date(),
    });
  },

  updateExchangeRate: async (id: number, rate: number) => {
    return await db.update(exchangeRates)
      .set({ rate: rate.toString(), lastUpdated: new Date() }) // Convert to string for DECIMAL type
      .where(eq(exchangeRates.id, id));
  },

  deleteExchangeRate: async (id: number) => {
    return await db.delete(exchangeRates).where(eq(exchangeRates.id, id));
  },

  getExchangeRateHistory: async (exchangeRateId: number) => {
    return await db.select()
      .from(exchangeRateHistory)
      .where(eq(exchangeRateHistory.exchangeRateId, exchangeRateId))
      .orderBy(exchangeRateHistory.timestamp);
  },

  addExchangeRateHistory: async (exchangeRateId: number, rate: number) => {
    return await db.insert(exchangeRateHistory).values({
      exchangeRateId,
      rate: rate.toString(), // Convert to string for DECIMAL type
      timestamp: new Date(),
    });
  },
};