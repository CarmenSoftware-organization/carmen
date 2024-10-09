'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

interface SummaryPRTableProps {
  item: {
    currency: string;
    currencyRate: number;
    baseSubTotalPrice: number;
    subTotalPrice: number;
    baseNetAmount: number;
    netAmount: number;
    baseDiscAmount: number;
    discountAmount: number;
    baseTaxAmount: number;
    taxAmount: number;
    baseTotalAmount: number;
    totalAmount: number;
    discountRate: number;
    taxRate: number;
  };
  currencyBase: string;
  currencyCurrent: string;
}

export default function SummaryPRTable({ item, currencyBase, currencyCurrent }: SummaryPRTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const data = [
    {
      Label: "Subtotal Amount",
      localCurrency: currencyBase,
      localAmt: item.baseSubTotalPrice ?? 0,
      currentCurrency: currencyCurrent,
      currentAmt: item.subTotalPrice ?? 0,
    },{
        Label: "Discount Amount",
        localCurrency: currencyBase,
        localAmt: item.baseDiscAmount ?? 0,
        currentCurrency: currencyCurrent,
        currentAmt: item.discountAmount ?? 0,
      },{
        Label: "Net Amount",
        localCurrency: currencyBase,
        localAmt: item.baseNetAmount ?? 0,
        currentCurrency: currencyCurrent,
        currentAmt: item.netAmount ?? 0,
      },{
        Label: "Tax Amount",
        localCurrency: currencyBase,
        localAmt: item.baseTaxAmount ?? 0,
        currentCurrency: currencyCurrent,
        currentAmt: item.taxAmount ?? 0,
      },{
        Label: "Total Amount",
        localCurrency: currencyBase,
        localAmt: item.baseTotalAmount ?? 0,
        currentCurrency: currencyCurrent,
        currentAmt: item.totalAmount ?? 0,
      }
  ];

  const content = (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
            <TableHead className="text-right font-bold whitespace-nowrap">Total Amount</TableHead>
            <TableHead className="text-right text-gray-500 text-xs whitespace-nowrap hidden md:flex items-center justify-end w-full">Base Amount</TableHead>
            
          </TableRow>
        </TableHeader>
        <TableBody>

          {data.map((item) => (
                <TableRow key={item.Label}>
                <TableCell className="whitespace-nowrap">{item.Label}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">{item.currentCurrency} {item.currentAmt}</TableCell>
                <TableCell className="hidden md:block text-right text-xs text-gray-500 whitespace-nowrap">{item.localCurrency} {item.localAmt}</TableCell>
               
              </TableRow>
          ))}
        </TableBody> 
      </Table>
    </>
  );
  return <>{content}</>;

  // return (
  //   <Table>
  //     <TableHeader>
  //       <TableRow>
  //         <TableHead>Description</TableHead>
  //         <TableHead className="text-right">{localCurrency}</TableHead>
  //         <TableHead className="text-right">{currentCurrency}</TableHead>
  //       </TableRow>
  //     </TableHeader>
  //     <TableBody>
  //       <TableRow>
  //         <TableCell>Subtotal</TableCell>
  //         <TableCell className="text-right">
  //           <span className="text-xs">{formatCurrency(item.baseSubTotalPrice, localCurrency)}</span>
  //         </TableCell>
  //         <TableCell className="text-right">{formatCurrency(item.subTotalPrice, currentCurrency)}</TableCell>
  //       </TableRow>
  //       <TableRow>
  //         <TableCell>Discount ({item.discountRate}%)</TableCell>
  //         <TableCell className="text-right">
  //           <span className="text-xs">{formatCurrency(item.baseDiscAmount, localCurrency)}</span>
  //         </TableCell>
  //         <TableCell className="text-right">{formatCurrency(item.discountAmount, currentCurrency)}</TableCell>
  //       </TableRow>
  //       <TableRow>
  //         <TableCell>Net Amount</TableCell>
  //         <TableCell className="text-right">
  //           <span className="text-xs">{formatCurrency(item.baseNetAmount, localCurrency)}</span>
  //         </TableCell>
  //         <TableCell className="text-right">{formatCurrency(item.netAmount, currentCurrency)}</TableCell>
  //       </TableRow>
  //       <TableRow>
  //         <TableCell>Tax ({item.taxRate}%)</TableCell>
  //         <TableCell className="text-right">
  //           <span className="text-xs">{formatCurrency(item.baseTaxAmount, localCurrency)}</span>
  //         </TableCell>
  //         <TableCell className="text-right">{formatCurrency(item.taxAmount, currentCurrency)}</TableCell>
  //       </TableRow>
  //       <TableRow className="font-bold">
  //         <TableCell>Total Amount</TableCell>
  //         <TableCell className="text-right">
  //           <span className="text-xs">{formatCurrency(item.baseTotalAmount, localCurrency)}</span>
  //         </TableCell>
  //         <TableCell className="text-right">{formatCurrency(item.totalAmount, currentCurrency)}</TableCell>
  //       </TableRow>
  //     </TableBody>
  //   </Table>
  // );
}
