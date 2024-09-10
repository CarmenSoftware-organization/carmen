import { NextApiRequest, NextApiResponse } from 'next';
import { currencyApi } from '@/api/currency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const currencies = await currencyApi.getAllCurrencies();
        res.status(200).json(currencies);
        break;
      case 'POST':
        const { code, description } = req.body;
        const newCurrency = await currencyApi.createCurrency(code, description);
        res.status(201).json(newCurrency);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}