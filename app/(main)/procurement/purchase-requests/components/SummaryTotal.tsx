import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table"
import { PurchaseRequest } from "@/lib/types"

interface ISummaryTotalProps {
  prData: PurchaseRequest
}

export default function SummaryTotal({ prData }: ISummaryTotalProps) {
  const data = [
    {
      Label: "Subtotal Amount",
      localCurrency: "THB", // Assuming THB as base currency, adjust if needed
      localAmt: prData.baseSubTotalPrice ?? 0,
      currentCurrency: prData.currency ?? "THB",
      currentAmt: prData.subTotalPrice ?? 0,
    },
    {
      Label: "Discount Amount",
      localCurrency: "THB",
      localAmt: prData.baseDiscAmount ?? 0,
      currentCurrency: prData.currency ?? "THB",
      currentAmt: prData.discountAmount ?? 0,
    },
    {
      Label: "Net Amount",
      localCurrency: "THB",
      localAmt: prData.baseNetAmount ?? 0,
      currentCurrency: prData.currency ?? "THB",
      currentAmt: prData.netAmount ?? 0,
    },
    {
      Label: "Tax Amount",
      localCurrency: "THB",
      localAmt: prData.baseTaxAmount ?? 0,
      currentCurrency: prData.currency ?? "THB",
      currentAmt: prData.taxAmount ?? 0,
    },
    {
      Label: "Total Amount",
      localCurrency: "THB",
      localAmt: prData.baseTotalAmount ?? 0,
      currentCurrency: prData.currency ?? "THB",
      currentAmt: prData.totalAmount ?? 0,
    }
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
          <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">Base Amount</TableHead>
          <TableHead className="text-right font-bold whitespace-nowrap">Total Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.Label}>
            <TableCell className="whitespace-nowrap">{item.Label}</TableCell>
            <TableCell className="hidden md:table-cell text-right text-xs text-gray-500 whitespace-nowrap">
              {item.localCurrency} {item.localAmt.toFixed(2)}
            </TableCell>
            <TableCell className="text-right font-bold whitespace-nowrap">
              {item.currentCurrency} {item.currentAmt.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}