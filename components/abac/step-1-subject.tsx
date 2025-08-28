
"use client"

import { Policy } from "@/types/abac";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PolicyWizardHeader } from "./policy-wizard-header";
import { PolicyConditionBuilder } from "./policy-condition-builder";
import { MOCK_ABAC_DATA } from "./abac-data";

interface Step1SubjectProps {
  policy: Policy;
  setPolicy: (policy: Policy) => void;
}

export function Step1Subject({ policy, setPolicy }: Step1SubjectProps) {
  return (
    <div>
      <PolicyWizardHeader 
        icon="👤" 
        title="Step 1: Who does this rule apply to?" 
        subtitle="Define the user, role, or department this permission is for. This is the 'Subject'." 
      />
      
      <div className="space-y-4">
        <div>
          <Label className="font-semibold text-slate-700 block mb-1">Policy Name*</Label>
          <Input 
            type="text" 
            value={policy.name}
            onChange={e => setPolicy({ ...policy, name: e.target.value })}
            placeholder="e.g., Managers Approve Low-Value PRs"
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <Label className="font-semibold text-slate-700 block mb-1">Policy Description</Label>
          <Textarea 
            value={policy.description}
            onChange={e => setPolicy({ ...policy, description: e.target.value })}
            placeholder="Briefly explain what this policy does in plain English"
            className="w-full p-2 border border-slate-300 rounded-md h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <PolicyConditionBuilder
          title="Subject Conditions"
          subtitle="Define the conditions that target specific subjects."
          conditions={policy.target.subjects || []}
          onChange={newConditions => setPolicy({ ...policy, target: { ...policy.target, subjects: newConditions } })}
          attributeSource={MOCK_ABAC_DATA.subjectAttributes}
        />
      </div>
    </div>
  );
}
