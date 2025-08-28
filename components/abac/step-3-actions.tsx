
"use client"

import { Policy, ResourceType } from "@/types/abac";
import { PolicyWizardHeader } from "./policy-wizard-header";
import { MOCK_ABAC_DATA } from "./abac-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Step3ActionsProps {
  policy: Policy;
  setPolicy: (policy: Policy) => void;
}

export function Step3Actions({ policy, setPolicy }: Step3ActionsProps) {
  const selectedResourceType = policy.target.resources?.[0]?.value as keyof typeof MOCK_ABAC_DATA.resourceTypes | undefined;
  const availableActions = selectedResourceType ? MOCK_ABAC_DATA.resourceTypes[selectedResourceType]?.actions || [] : [];

  const handleActionToggle = (action: string) => {
    const newActions = policy.target.actions?.includes(action)
      ? policy.target.actions.filter(a => a !== action)
      : [...(policy.target.actions || []), action];
    setPolicy({ ...policy, target: { ...policy.target, actions: newActions } });
  };

  return (
    <div>
      <PolicyWizardHeader 
        icon="✏️" 
        title="Step 3: What actions are they allowed to perform?" 
        subtitle="Specify the actions the user can perform on the resource defined in Step 2." 
      />
      
      {!selectedResourceType ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <div className="flex items-center">
            {/* Placeholder for AlertCircle icon */}
            <div className="mr-3 h-5 w-5 text-yellow-500">⚠️</div>
            <div>
              <p className="font-bold text-yellow-800">Please select a Resource Type</p>
              <p className="text-yellow-700">You must select a resource in Step 2 before you can choose actions.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="font-semibold text-slate-700 block mb-2">The user is <span className="text-green-600 font-bold">PERMITTED</span> to perform the following Action(s)*</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableActions.map(action => (
                <Label key={action} className="flex items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={policy.target.actions?.includes(action)}
                    onCheckedChange={() => handleActionToggle(action)}
                  />
                  <span className="ml-3 text-slate-700">{action}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
