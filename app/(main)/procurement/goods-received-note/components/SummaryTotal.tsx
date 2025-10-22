import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { GoodsReceiveNote } from "@/lib/types";

interface ISummaryTotalProps {
    poData: GoodsReceiveNote;
}

export default function SummaryTotal({ poData }: ISummaryTotalProps) {
  const data = [
    {
      Label: "Subtotal Amount",
      localCurrency: (poData as any).currency,
      localAmt: (poData as any).baseSubTotalPrice ?? 0,
      currentCurrency: (poData as any).baseCurrency,
      currentAmt: (poData as any).subTotalPrice ?? 0,
    },
    {
      Label: "Discount Amount",
      localCurrency: (poData as any).baseCurrency,
      localAmt: (poData as any).baseDiscAmount ?? 0,
      currentCurrency: (poData as any).currency,
      currentAmt: (poData as any).discountAmount ?? 0,
    },
    {
      Label: "Net Amount",
      localCurrency: (poData as any).baseCurrency,
      localAmt: (poData as any).baseNetAmount ?? 0,
      currentCurrency: (poData as any).currency,
      currentAmt: (poData as any).netAmount ?? 0,
    },
    {
      Label: "Tax Amount",
      localCurrency: (poData as any).baseCurrency,
      localAmt: (poData as any).baseTaxAmount ?? 0,
      currentCurrency: (poData as any).currency,
      currentAmt: (poData as any).taxAmount ?? 0,
    },
    {
      Label: "Total Amount",
      localCurrency: (poData as any).baseCurrency,
      localAmt: (poData as any).baseTotalAmount ?? 0,
      currentCurrency: (poData as any).currency,
      currentAmt: (poData as any).totalAmount ?? 0,
    }
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
          <TableHead className="text-right font-bold whitespace-nowrap">Amount ({(poData as any).currency})</TableHead>
          <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">Base Amount ({(poData as any).baseCurrency})</TableHead>
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