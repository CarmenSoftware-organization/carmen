
"use client"

import { Policy } from "@/types/abac";
import { PolicyWizardHeader } from "./policy-wizard-header";
import { PolicyConditionBuilder } from "./policy-condition-builder";
import { MOCK_ABAC_DATA } from "./abac-data";

interface Step4EnvironmentProps {
  policy: Policy;
  setPolicy: (policy: Policy) => void;
}

export function Step4Environment({ policy, setPolicy }: Step4EnvironmentProps) {
  return (
    <div>
      <PolicyWizardHeader 
        icon="🕒" 
        title="Step 4: Under what conditions?" 
        subtitle="Add contextual conditions. The rule only applies if these are met at the time of the action." 
      />
      <PolicyConditionBuilder
        title="Environmental Conditions"
        subtitle="These conditions relate to the context of the request, like time or location."
        conditions={policy.target.environment || []}
        onChange={newConditions => setPolicy({ ...policy, target: { ...policy.target, environment: newConditions } })}
        attributeSource={MOCK_ABAC_DATA.environmentAttributes}
      />
    </div>
  );
}
