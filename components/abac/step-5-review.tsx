
"use client"

import { Policy, AttributeCondition } from "@/types/abac";
import { PolicyWizardHeader } from "./policy-wizard-header";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Step5ReviewProps {
  policy: Policy;
  setPolicy: (policy: Policy) => void;
}

const ConditionSummary = ({ title, conditions, color }: { title: string, conditions: AttributeCondition[] | undefined, color: string }) => {
    if (!conditions || conditions.length === 0) return null;
    return (
        <div>
            <h5 className={`font-semibold ${color}`}>{title}</h5>
            <ul className="list-disc list-inside text-slate-600 pl-2">
                {conditions.map((c, i) => (
                    <li key={i}>
                        The <span className="font-medium">{c.attribute}</span> {c.operator} <span className="font-medium">"{c.value}"</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export function Step5Review({ policy, setPolicy }: Step5ReviewProps) {
    const { target, name, description, enabled } = policy;
    const subjectConditions = target.subjects;
    const resourceType = target.resources?.[0]?.value;
    const resourceConditions = target.resources?.slice(1);
    const actions = target.actions;
    const environmentConditions = target.environment;

    return (
        <div>
            <PolicyWizardHeader icon="✅" title="Step 5: Review and Save" subtitle="Please review the policy summary below. If everything is correct, enable and save the policy." />
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{name || "(Untitled Policy)"}</h3>
                    <p className="text-slate-600 italic">{description || "(No description provided)"}</p>
                </div>

                <div className="text-slate-700 space-y-4">
                    <p>
                        This policy applies to subjects where...
                    </p>
                    <p>
                        ...and allows the action(s) <span className="font-semibold text-green-600">{actions?.join(', ') || 'none'}</span>...
                    </p>
                    <p>
                        ...on a <span className="font-semibold text-purple-600">{resourceType || 'any resource'}</span>...
                    </p>
                </div>
                
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 border-b pb-2">IF ALL of the following conditions are met:</h4>
                    <ConditionSummary title="Subject Conditions" conditions={subjectConditions} color="text-blue-600" />
                    <ConditionSummary title="Resource Conditions" conditions={resourceConditions} color="text-purple-600" />
                    <ConditionSummary title="Environment Conditions" conditions={environmentConditions} color="text-teal-600" />
                </div>
                
                <div>
                    <Label htmlFor="enabled-switch" className="font-semibold text-slate-700 flex items-center cursor-pointer">
                        <Switch 
                            id="enabled-switch"
                            checked={enabled}
                            onCheckedChange={checked => setPolicy({...policy, enabled: checked})}
                            className="mr-2"
                        />
                        Enable this policy upon saving
                    </Label>
                </div>
            </div>
        </div>
    );
}
