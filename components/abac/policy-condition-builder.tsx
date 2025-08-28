
"use client"

import { AttributeCondition, Operator } from "@/types/abac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_ABAC_DATA } from "./abac-data";
import { PlusCircle, Trash2 } from "lucide-react";

interface PolicyConditionBuilderProps {
  conditions: AttributeCondition[];
  onChange: (conditions: AttributeCondition[]) => void;
  attributeSource: Record<string, string[]>;
  title?: string;
  subtitle?: string;
}

export function PolicyConditionBuilder({ 
  conditions, 
  onChange, 
  attributeSource, 
  title = "Conditions", 
  subtitle = "The rule only applies if these are met."
}: PolicyConditionBuilderProps) {

  const addCondition = () => {
    const newCondition: AttributeCondition = {
      attribute: Object.keys(attributeSource)[0],
      operator: Operator.EQUALS,
      value: ''
    };
    onChange([...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof AttributeCondition, value: any) => {
    onChange(conditions.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{subtitle}</p>
      <div className="space-y-3">
        {conditions.map((cond, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md border">
            <span className="text-sm font-semibold text-slate-500">{index === 0 ? 'IF' : 'AND'}</span>
            <Select 
              value={cond.attribute} 
              onValueChange={val => updateCondition(index, 'attribute', val)}
            >
              <SelectTrigger className="flex-grow text-sm">
                <SelectValue placeholder="Select an attribute..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(attributeSource).map(attr => <SelectItem key={attr} value={attr}>{attr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select 
              value={cond.operator} 
              onValueChange={val => updateCondition(index, 'operator', val)}
            >
              <SelectTrigger className="w-[150px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_ABAC_DATA.operators.string.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input 
              type="text" 
              value={cond.value} 
              onChange={e => updateCondition(index, 'value', e.target.value)} 
              placeholder="value" 
              className="flex-grow text-sm" 
            />
            <Button variant="ghost" size="icon" onClick={() => removeCondition(index)}>
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="link" onClick={addCondition} className="mt-4 flex items-center text-sm font-semibold">
        <PlusCircle className="h-4 w-4 mr-1" />
        Add another condition
      </Button>
    </div>
  );
}
