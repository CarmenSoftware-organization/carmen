import StatusBadge, { BadgeStatus } from "@/components/ui/custom-status-badge";

export default function TestUI() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Object.values(BadgeStatus).map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <StatusBadge status={status} />
          </div>
        ))}
      </div>
    </div>
  );
}
