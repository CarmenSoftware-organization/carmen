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
  Active = "Active",
  Inactive = "Inactive",
  BelowMin = "below-min",
  Reorder = "reorder",
  OverMax = "over-max",
  Normal = "normal",
}

export interface IBadgeColors {
  key: Status;
  Color: string;
}

export const StatusList: IBadgeColors[] = [
  { key: Status.Open, Color: "bg-emerald-300 text-emerald-800" },
  { key: Status.Closed, Color: "bg-slate-300 text-slate-800" },
  { key: Status.Draft, Color: "bg-amber-200 text-amber-800" },
  { key: Status.Sent, Color: "bg-sky-300 text-sky-800" },
  { key: Status.Committed, Color: "bg-violet-300 text-violet-800" },
  { key: Status.Saved, Color: "bg-teal-300 text-teal-800" },
  { key: Status.Voided, Color: "bg-rose-300 text-rose-800" },
  { key: Status.Approved, Color: "bg-green-300 text-green-800" },
  { key: Status.Rejected, Color: "bg-red-300 text-red-800" },
  { key: Status.Pending, Color: "bg-yellow-200 text-yellow-800" },
  { key: Status.InProgress, Color: "bg-blue-300 text-blue-800" },
  { key: Status.Completed, Color: "bg-lime-300 text-lime-800" },
  { key: Status.Cancelled, Color: "bg-pink-300 text-pink-800" },
  { key: Status.OnHold, Color: "bg-orange-200 text-orange-800" },
  { key: Status.Delayed, Color: "bg-amber-300 text-amber-800" },
  { key: Status.Partial, Color: "bg-yellow-300 text-yellow-800" },
  { key: Status.Submitted, Color: "bg-cyan-300 text-cyan-800" },
  { key: Status.Accepted, Color: "bg-emerald-300 text-emerald-800" },
  { key: Status.SendBack, Color: "bg-rose-300 text-rose-800" },
  { key: Status.Review, Color: "bg-amber-200 text-amber-800" },
  { key: Status.Deleted, Color: "bg-rose-300 text-rose-800" },
  { key: Status.Received  , Color: "bg-emerald-300 text-emerald-800" },
  { key: Status.Active, Color: "bg-emerald-300 text-emerald-800" },
  { key: Status.Inactive, Color: "bg-slate-300 text-slate-800" },
  { key: Status.BelowMin, Color: "bg-destructive text-red-800" },
  { key: Status.Reorder, Color: "bg-yellow-500 text-amber-800" },
  { key: Status.OverMax, Color: "bg-blue-500 text-default-800" },
  { key: Status.Normal, Color: "bg-green-500 text-gray-800" }, 

 
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
      className={`${
        StatusList.find((color) => color.key === badgeColor)?.Color
      } rounded-full`}
    >
      {children}
    </Badge>
  );
}
