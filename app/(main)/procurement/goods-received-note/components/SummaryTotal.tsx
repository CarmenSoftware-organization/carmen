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
      localCurrency: poData.currency,
      localAmt: poData.baseSubTotalPrice ?? 0,
      currentCurrency: poData.baseCurrency,
      currentAmt: poData.subTotalPrice ?? 0,
    },
    {
      Label: "Discount Amount",
      localCurrency: poData.baseCurrency,
      localAmt: poData.baseDiscAmount ?? 0,
      currentCurrency: poData.currency,
      currentAmt: poData.discountAmount ?? 0,
    },
    {
      Label: "Net Amount",
      localCurrency: poData.baseCurrency,
      localAmt: poData.baseNetAmount ?? 0,
      currentCurrency: poData.currency,
      currentAmt: poData.netAmount ?? 0,
    },
    {
      Label: "Tax Amount",
      localCurrency: poData.baseCurrency,
      localAmt: poData.baseTaxAmount ?? 0,
      currentCurrency: poData.currency,
      currentAmt: poData.taxAmount ?? 0,
    },
    {
      Label: "Total Amount",
      localCurrency: poData.baseCurrency,
      localAmt: poData.baseTotalAmount ?? 0,
      currentCurrency: poData.currency,
      currentAmt: poData.totalAmount ?? 0,
    }
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
          <TableHead className="text-right font-bold whitespace-nowrap">Total Amount</TableHead>
          <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">Base Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.Label}>
            <TableCell className="whitespace-nowrap">{item.Label}</TableCell>
            <TableCell className="text-right font-bold whitespace-nowrap">
              {item.currentCurrency} {item.currentAmt.toFixed(2)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right text-xs text-gray-500 whitespace-nowrap">
              {item.localCurrency} {item.localAmt.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}