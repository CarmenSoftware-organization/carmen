import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GoodsReceiveNoteMode,
  ExtraCost,
  CostType,
  CostDistributionMethod,
} from "@/lib/types";

interface ExtraCostsTabProps {
  mode: GoodsReceiveNoteMode;
  initialCosts: ExtraCost[];
  onCostsChange: (
    costs: ExtraCost[],
    distributionMethod: CostDistributionMethod
  ) => void;
}

export function ExtraCostsTab({
  mode,
  initialCosts,
  onCostsChange,
}: ExtraCostsTabProps) {
  const [costs, setCosts] = useState<ExtraCost[]>(initialCosts);
  const [newCostType, setNewCostType] = useState<CostType>("shipping");
  const [newCostAmount, setNewCostAmount] = useState("");
  const [distributionMethod, setDistributionMethod] =
    useState<CostDistributionMethod>(CostDistributionMethod.NET_AMOUNT);
  const [total, setTotal] = useState(0);

  const addCost = () => {
    if (newCostAmount) {
      const newCost: ExtraCost = {
        id: Date.now().toString(),
        type: newCostType,
        amount: parseFloat(newCostAmount),
        currency: "USD", // Assuming default currency, adjust as needed
        exchangeRate: 1, // Assuming default exchange rate, adjust as needed
        baseAmount: parseFloat(newCostAmount), // Assuming base amount is the same as amount
        baseCurrency: "USD", // Assuming default base currency, adjust as needed
      };
      const updatedCosts = [...costs, newCost];
      setCosts(updatedCosts);
      onCostsChange(updatedCosts, distributionMethod);
      setNewCostAmount("");
    }
  };

  const deleteCost = (id: string) => {
    const updatedCosts = costs.filter((cost) => cost.id !== id);
    setCosts(updatedCosts);
    onCostsChange(updatedCosts, distributionMethod);
  };

  const totalExtraCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  useEffect(() => {
    // Calculate and update totals, then notify parent
    const newTotal = costs.reduce((acc, cost) => acc + (cost.amount || 0), 0);
    setTotal(newTotal);
    onCostsChange(costs, distributionMethod);
  }, [costs, distributionMethod, onCostsChange]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Extra Costs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cost Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell>{cost.type}</TableCell>
              <TableCell>{cost.amount.toFixed(2)}</TableCell>
              <TableCell>
                {mode !== "view" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCost(cost.id)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {mode !== "view" && (
            <TableRow>
              <TableCell>
                <Select
                  value={newCostType}
                  onValueChange={(value: CostType) => setNewCostType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="handling">Handling</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button onClick={addCost}>Add</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex gap-6 w-full">
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            Cost Distribution Method
          </h3>
          <RadioGroup
            value={distributionMethod}
            onValueChange={(value: CostDistributionMethod) =>
              setDistributionMethod(value)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="net-amount" id="net-amount" />
              <Label htmlFor="net-amount">Net Amount</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quantity-ratio" id="quantity-ratio" />
              <Label htmlFor="quantity-ratio">Quantity Ratio</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">
            Total Extra Cost<br/> {totalExtraCost.toFixed(2)}
          </h3>
        </div>
      </div>
    </div>
  );
}
