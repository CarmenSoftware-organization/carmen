
"use client"

import { Policy, ResourceType, AttributeCondition, Operator } from "@/types/abac";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PolicyWizardHeader } from "./policy-wizard-header";
import { PolicyConditionBuilder } from "./policy-condition-builder";
import { MOCK_ABAC_DATA } from "./abac-data";
import { Label } from "@/components/ui/label";

interface Step2ResourceProps {
  policy: Policy;
  setPolicy: (policy: Policy) => void;
}

export function Step2Resource({ policy, setPolicy }: Step2ResourceProps) {
  const handleResourceTypeChange = (resourceType: ResourceType) => {
    const newResourceCondition: AttributeCondition = {
        attribute: 'resourceType',
        operator: Operator.EQUALS,
        value: resourceType
    }
    setPolicy({ 
      ...policy, 
      target: { ...policy.target, resources: [newResourceCondition], actions: [] },
    });
  };

  const selectedResourceType = policy.target.resources?.[0]?.value as ResourceType | undefined;

  return (
    <div>
      <PolicyWizardHeader 
        icon="📄" 
        title="Step 2: What can they interact with?" 
        subtitle="Choose the type of item or data this rule will affect. This is the 'Resource'." 
      />
      <div className="space-y-4">
        <div>
          <Label className="font-semibold text-slate-700 block mb-1">This policy applies to the Resource Type*</Label>
          <Select onValueChange={handleResourceTypeChange} value={selectedResourceType}>
            <SelectTrigger className="w-full p-2 border border-slate-300 rounded-md bg-white">
                <SelectValue placeholder="-- Select a Resource Type --" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MOCK_ABAC_DATA.resourceTypes).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        {selectedResourceType && (
          <PolicyConditionBuilder
            title="Resource Conditions"
            subtitle={`Make the rule more specific by adding conditions about the ${selectedResourceType}.`}
            conditions={policy.target.resources?.slice(1) || []}
            onChange={newConditions => setPolicy({ ...policy, target: { ...policy.target, resources: [policy.target.resources![0], ...newConditions] } })}
            attributeSource={MOCK_ABAC_DATA.resourceTypes[selectedResourceType]?.attributes.reduce((acc, attr) => ({ ...acc, [attr]: [] }), {}) || {}}
          />
        )}
      </div>
    </div>
  );
}
