// File: tabs/DetailsTab.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, HashIcon, BuildingIcon, MapPinIcon } from "lucide-react";
import { PurchaseRequest, asMockPurchaseRequest } from "@/lib/types";
import { Requestor } from "@/lib/types";

interface DetailsTabProps {
  formData: PurchaseRequest;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseRequest>>;
  isDisabled: boolean;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({
  formData,
  setFormData,
  isDisabled,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const mockPrev = asMockPurchaseRequest(prev);
      return {
        ...prev,
        [name]: value,
        requestor: name.startsWith("requestor.")
          ? { ...mockPrev.requestor, [name.split(".")[1]]: value }
          : mockPrev.requestor,
      };
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { id: "requestor.name", label: "Requestor", icon: UserIcon },
        { id: "requestorId", label: "Requestor ID", icon: HashIcon },
        { id: "department", label: "Department", icon: BuildingIcon },
        { id: "location", label: "Location", icon: MapPinIcon },
        { id: "jobCode", label: "Job Code", icon: HashIcon },
      ].map(({ id, label, icon: Icon }) => (
        <div key={id} className="space-y-1">
          <Label
            htmlFor={id}
            className="text-[0.7rem] text-gray-500 flex items-center gap-2"
          >
            <Icon className="h-3 w-3" /> {label}
          </Label>
          <Input
            id={id}
            name={id}
            value={(() => {
              const fieldValue = formData[id as keyof PurchaseRequest];
              if (typeof fieldValue === "object" && fieldValue !== null) {
                const keys = id.split(".");
                if (keys.length > 1) {
                  const mockData = asMockPurchaseRequest(formData);
                  const parentKey = keys[0] as keyof typeof mockData;
                  const childKey = keys[1];
                  const parent = mockData[parentKey];
                  if (parent && typeof parent === 'object' && childKey in parent) {
                    return String((parent as Record<string, unknown>)[childKey] ?? '');
                  }
                }
                return '';
              }
              return String(fieldValue ?? '');
            })()}
            onChange={handleInputChange}
            disabled={isDisabled}
          />
        </div>
      ))}
    </div>
  );
};
