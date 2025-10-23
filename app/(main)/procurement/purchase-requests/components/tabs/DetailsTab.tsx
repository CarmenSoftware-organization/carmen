// File: tabs/DetailsTab.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, HashIcon, BuildingIcon, MapPinIcon } from "lucide-react";
import { PurchaseRequest } from "@/lib/types";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      requestor: name.startsWith("requestor.")
        ? { ...(prev as any).requestor, [name.split(".")[1]]: value }
        : (prev as any).requestor,
    }));
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
            value={
              typeof formData[id as keyof PurchaseRequest] === "object"
                ? (formData[id as keyof PurchaseRequest] as any)[
                    id.split(".")[1]
                  ]
                : String(formData[id as keyof PurchaseRequest])
            }
            onChange={handleInputChange}
            disabled={isDisabled}
          />
        </div>
      ))}
    </div>
  );
};
