// import { ActionState } from '../types/action-types';

// export const getCurrencies = async (): Promise<ActionState<any[]>> => {
//   try {
//     const currencies = await currencyQueries.getCurrencies();
//     return { data: currencies, error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to fetch currencies' };
//   }
// };

// export const createCurrency = async (data: { code: string; name: string; active?: boolean }): Promise<ActionState<any>> => {
//   try {
//     const newCurrency = await currencyQueries.createCurrency(data);
//     return { data: newCurrency[0], error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to create currency' };
//   }
// };

// export const updateCurrency = async (id: number, data: Partial<{ name: string; active: boolean }>): Promise<ActionState<any>> => {
//   try {
//     const updatedCurrency = await currencyQueries.updateCurrency(id, data);
//     return { data: updatedCurrency[0], error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to update currency' };
//   }
// };

// export const getExchangeRates = async (): Promise<ActionState<any[]>> => {
//   try {
//     const rates = await currencyQueries.getExchangeRates();
//     return { data: rates, error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to fetch exchange rates' };
//   }
// };

// export const createExchangeRate = async (data: {
//   baseCurrencyId: number;
//   targetCurrencyId: number;
//   rate: number;
//   effectiveDate: Date;
// }): Promise<ActionState<any>> => {
//   try {
//     const newRate = await currencyQueries.createExchangeRate(data);
//     await currencyQueries.addExchangeRateHistory({
//       exchangeRateId: newRate[0].id,
//       rate: data.rate,
//       effectiveDate: data.effectiveDate,
//     });
//     return { data: newRate[0], error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to create exchange rate' };
//   }
// };

// export const updateExchangeRate = async (id: number, data: { rate: number; effectiveDate: Date }): Promise<ActionState<any>> => {
//   try {
//     const updatedRate = await currencyQueries.updateExchangeRate(id, data);
//     await currencyQueries.addExchangeRateHistory({
//       exchangeRateId: id,
//       rate: data.rate,
//       effectiveDate: data.effectiveDate,
//     });
//     return { data: updatedRate[0], error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to update exchange rate' };
//   }
// };

// export const getExchangeRateHistory = async (exchangeRateId: number): Promise<ActionState<any[]>> => {
//   try {
//     const history = await currencyQueries.getExchangeRateHistory(exchangeRateId);
//     return { data: history, error: null };
//   } catch (error) {
//     return { data: null, error: 'Failed to fetch exchange rate history' };
//   }
// };