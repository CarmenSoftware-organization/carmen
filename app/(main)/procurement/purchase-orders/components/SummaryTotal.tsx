import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { PurchaseOrder } from "@/lib/types";

interface ISummaryTotalProps {
  poData: PurchaseOrder;
}

export default function SummaryTotal({ poData }: ISummaryTotalProps) {
  // Type casting to support both mock data and interface structure
  const poDataAny = poData as any;

  // Get currency code - prefer interface field, fallback to mock data field
  const currencyCode = poData.currency || poDataAny.currencyCode || 'THB';
  const baseCurrencyCode = poDataAny.baseCurrencyCode || 'THB';

  // Helper function to extract amount from Money type or direct number
  const getAmount = (moneyField: any, fallbackField?: any): number => {
    if (moneyField && typeof moneyField === 'object' && 'amount' in moneyField) {
      return moneyField.amount ?? 0;
    }
    return fallbackField ?? moneyField ?? 0;
  };

  const data = [
    {
      Label: "Subtotal Amount",
      localCurrency: baseCurrencyCode,
      localAmt: getAmount(poDataAny.baseSubtotal, poDataAny.baseSubTotalPrice),
      currentCurrency: currencyCode,
      currentAmt: getAmount(poData.subtotal, poDataAny.subTotalPrice),
    },
    {
      Label: "Discount Amount",
      localCurrency: baseCurrencyCode,
      localAmt: getAmount(poDataAny.baseDiscountAmount, poDataAny.baseDiscAmount),
      currentCurrency: currencyCode,
      currentAmt: getAmount(poData.discountAmount, poDataAny.discAmount),
    },
    {
      Label: "Net Amount",
      localCurrency: baseCurrencyCode,
      localAmt: getAmount(poDataAny.baseNetAmount),
      currentCurrency: currencyCode,
      currentAmt: getAmount(poDataAny.netAmount),
    },
    {
      Label: "Tax Amount",
      localCurrency: baseCurrencyCode,
      localAmt: getAmount(poDataAny.baseTaxAmount),
      currentCurrency: currencyCode,
      currentAmt: getAmount(poData.taxAmount),
    },
    {
      Label: "Total Amount",
      localCurrency: baseCurrencyCode,
      localAmt: getAmount(poDataAny.baseTotalAmount),
      currentCurrency: currencyCode,
      currentAmt: getAmount(poData.totalAmount),
    }
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
          <TableHead className="text-right font-bold whitespace-nowrap">Amount ({currencyCode})</TableHead>
          <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">Base Amount ({baseCurrencyCode})</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.Label}>
            <TableCell className="whitespace-nowrap">{item.Label}</TableCell>
            <TableCell className="text-right font-bold whitespace-nowrap">
              {item.currentAmt.toFixed(2)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right text-xs text-gray-500 whitespace-nowrap">
              {item.localAmt.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}