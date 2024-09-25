import { Badge } from "@/components/ui/badge";
import { Children } from "react";

export enum Status {
  Open = "Open",
  Closed = "Closed",
  Draft = "Draft",
  Sent = "Sent",
  Committed = "Committed",
  Saved = "Saved",
  Voided = "Voided",
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
  OnHold = "OnHold",
  Delayed = "Delayed",
  Partial = "Partial",
  Submitted = "Submitted",
  Accepted = "Accepted",
  SendBack = "SendBack",
  Review = "Review",
  Deleted = "Deleted",
  Received = "Received",
}

export interface IBadgeColors {
  key: Status;
  Color: string;
}

export const StatusList: IBadgeColors[] = [
  { key: Status.Open, Color: "bg-green-500 text-white" },
  { key: Status.Closed, Color: "bg-gray-500 text-white" },
  { key: Status.Draft, Color: "bg-yellow-500 text-black" },
  { key: Status.Sent, Color: "bg-blue-500 text-white" },
  { key: Status.Committed, Color: "bg-purple-500 text-white" },
  { key: Status.Saved, Color: "bg-teal-500 text-white" },
  { key: Status.Voided, Color: "bg-red-500 text-white" },
  { key: Status.Approved, Color: "bg-green-700 text-white" },
  { key: Status.Rejected, Color: "bg-red-700 text-white" },
  { key: Status.Pending, Color: "bg-yellow-700 text-black" },
  { key: Status.InProgress, Color: "bg-blue-700 text-white" },
  { key: Status.Completed, Color: "bg-green-900 text-white" },
  { key: Status.Cancelled, Color: "bg-red-900 text-white" },
  { key: Status.OnHold, Color: "bg-orange-500 text-black" },
  { key: Status.Delayed, Color: "bg-orange-700 text-black" },
  { key: Status.Partial, Color: "bg-yellow-500 text-white" },
  { key: Status.Submitted, Color: "bg-teal-700 text-white" },
  { key: Status.Accepted, Color: "bg-green-500 text-white" },
  { key: Status.SendBack, Color: "bg-red-500 text-white" },
  { key: Status.Review, Color: "bg-yellow-500 text-black" },
  { key: Status.Deleted, Color: "bg-red-500 text-white" },
  { key: Status.Received, Color: "bg-green-500 text-white" },
];

export default function StatusBadge({ status }: { status: string }) {
  return <CustomStatusBadge status={status}>{status}</CustomStatusBadge>;
}

function CustomStatusBadge({
  children,
  badgeColor,
  status,
}: {
  children: React.ReactNode;
  badgeColor?: Status;
  status?: string;
}) {
  if (status) {
    badgeColor = status as Status;
  }
  return (
    <Badge
      className={StatusList.find((color) => color.key === badgeColor)?.Color}
    >
      {children}
    </Badge>
  );
}
