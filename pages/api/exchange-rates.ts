import { NextApiRequest, NextApiResponse } from 'next';
import { exchangeRateApi } from '@/api/currency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const exchangeRates = await exchangeRateApi.getAllExchangeRates();
      res.status(200).json(exchangeRates);
      break;
    case 'POST':
      const { baseCurrencyId, targetCurrencyId, rate } = req.body;
      const newExchangeRate = await exchangeRateApi.createExchangeRate(baseCurrencyId, targetCurrencyId, rate);
      res.status(201).json(newExchangeRate);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}