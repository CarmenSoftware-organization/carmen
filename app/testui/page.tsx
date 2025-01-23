import StatusBadge, { StatusList } from "@/components/ui/custom-status-badge";

function StatusBadgeList() {
  return (
    <div className="flex gap-2">
      {StatusList.map((status) => (
        <StatusBadge key={status.key} status={status.key} />
      ))}
    </div>
  );
}

export default function TestUI() {
  return (
    <>
      <StatusBadgeList />
    </>
  );
}
