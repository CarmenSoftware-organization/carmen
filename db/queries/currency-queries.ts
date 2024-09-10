import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { currencies, exchangeRates, exchangeRateHistory } from '../schema/currency';

export const getCurrencies = async () => {
  return db.select().from(currencies);
};

export const getCurrencyByCode = async (code: string) => {
  return db.select().from(currencies).where(eq(currencies.code, code)).limit(1);
};

export const createCurrency = async (data: { code: string; name: string; active?: boolean }) => {
  return db.insert(currencies).values(data).returning();
};

export const updateCurrency = async (id: number, data: Partial<{ name: string; active: boolean }>) => {
  return db.update(currencies).set(data).where(eq(currencies.id, id)).returning();
};

export const getExchangeRates = async () => {
  return db.select().from(exchangeRates);
};

export const getExchangeRate = async (baseCurrencyId: number, targetCurrencyId: number) => {
  return db.select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrencyId, baseCurrencyId),
        eq(exchangeRates.targetCurrencyId, targetCurrencyId)
      )
    )
    .limit(1);
};

export const createExchangeRate = async (data: {
  baseCurrencyId: number;
  targetCurrencyId: number;
  rate: number;
  effectiveDate: Date;
}) => {
  return db.insert(exchangeRates).values(data).returning();
};

export const updateExchangeRate = async (id: number, data: { rate: number; effectiveDate: Date }) => {
  return db.update(exchangeRates).set(data).where(eq(exchangeRates.id, id)).returning();
};

export const getExchangeRateHistory = async (exchangeRateId: number) => {
  return db.select()
    .from(exchangeRateHistory)
    .where(eq(exchangeRateHistory.exchangeRateId, exchangeRateId))
    .orderBy(exchangeRateHistory.effectiveDate);
};

export const addExchangeRateHistory = async (data: {
  exchangeRateId: number;
  rate: number;
  effectiveDate: Date;
}) => {
  return db.insert(exchangeRateHistory).values(data).returning();
};