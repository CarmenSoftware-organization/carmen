import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { PurchaseOrderItem } from "@/lib/types";

interface ISummaryProps {
  item: PurchaseOrderItem;
  currencyBase: string;
  currencyCurrent: string;
  exchangeRate?: string;
}

export default function SummaryTable({
  item,
  currencyBase,
  currencyCurrent,
  exchangeRate,
}: ISummaryProps) {
  // Extract Money type amounts or use mock data fields with proper type casting
  const getAmount = (field: any): number => {
    if (!field) return 0;
    return typeof field === 'object' && field !== null ? ((field as any).amount ?? 0) : (field as any ?? 0);
  };

  const data = [
    {
      Label: "Subtotal Amount",
      localCurrency: currencyBase,
      localAmt: (item as any).baseSubTotalPrice ?? 0,
      currentCurrency: currencyCurrent,
      currentAmt: (item as any).subTotalPrice ?? 0,
    },{
        Label: "Discount Amount",
        localCurrency: currencyBase,
        localAmt: (item as any).baseDiscAmount ?? getAmount(item.discountAmount),
        currentCurrency: currencyCurrent,
        currentAmt: getAmount(item.discountAmount),
      },{
        Label: "Net Amount",
        localCurrency: currencyBase,
        localAmt: (item as any).baseNetAmount ?? 0,
        currentCurrency: currencyCurrent,
        currentAmt: (item as any).netAmount ?? 0,
      },{
        Label: "Tax Amount",
        localCurrency: currencyBase,
        localAmt: (item as any).baseTaxAmount ?? getAmount(item.taxAmount),
        currentCurrency: currencyCurrent,
        currentAmt: getAmount(item.taxAmount),
      },{
        Label: "Total Amount",
        localCurrency: currencyBase,
        localAmt: (item as any).baseTotalAmount ?? getAmount(item.lineTotal),
        currentCurrency: currencyCurrent,
        currentAmt: getAmount(item.lineTotal),
      }
  ];

  const content = (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
            <TableHead className="text-right font-bold whitespace-nowrap">Total Amount ({currencyCurrent})</TableHead>
            <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:flex items-center justify-end w-full">Base Amount ({currencyBase})</TableHead>
            
          </TableRow>
        </TableHeader>
        <TableBody>

          {data.map((item) => (
                <TableRow key={item.Label}>
                <TableCell className="whitespace-nowrap">{item.Label}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">{item.currentAmt.toFixed(2)}</TableCell>
                <TableCell className="hidden md:block text-right text-xs text-gray-500 whitespace-nowrap">{item.localAmt.toFixed(2)}</TableCell>
               
              </TableRow>
          ))}
        </TableBody> 
      </Table>
    </>
  );
  return <>{content}</>;
}
