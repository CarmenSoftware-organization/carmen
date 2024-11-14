import { Badge } from "@/components/ui/badge";

export enum BadgeStatus {
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
  key: BadgeStatus;
  Color: string;
}

export const StatusList: IBadgeColors[] = [
  { key: BadgeStatus.Open, Color: "bg-emerald-300 text-emerald-800" },
  { key: BadgeStatus.Closed, Color: "bg-slate-300 text-slate-800" },
  { key: BadgeStatus.Draft, Color: "bg-amber-200 text-amber-800" },
  { key: BadgeStatus.Sent, Color: "bg-sky-300 text-sky-800" },
  { key: BadgeStatus.Committed, Color: "bg-violet-300 text-violet-800" },
  { key: BadgeStatus.Saved, Color: "bg-teal-300 text-teal-800" },
  { key: BadgeStatus.Voided, Color: "bg-rose-300 text-rose-800" },
  { key: BadgeStatus.Approved, Color: "bg-green-300 text-green-800" },
  { key: BadgeStatus.Rejected, Color: "bg-red-300 text-red-800" },
  { key: BadgeStatus.Pending, Color: "bg-yellow-200 text-yellow-800" },
  { key: BadgeStatus.InProgress, Color: "bg-blue-300 text-blue-800" },
  { key: BadgeStatus.Completed, Color: "bg-lime-300 text-lime-800" },
  { key: BadgeStatus.Cancelled, Color: "bg-pink-300 text-pink-800" },
  { key: BadgeStatus.OnHold, Color: "bg-orange-200 text-orange-800" },
  { key: BadgeStatus.Delayed, Color: "bg-amber-300 text-amber-800" },
  { key: BadgeStatus.Partial, Color: "bg-yellow-300 text-yellow-800" },
  { key: BadgeStatus.Submitted, Color: "bg-cyan-300 text-cyan-800" },
  { key: BadgeStatus.Accepted, Color: "bg-emerald-300 text-emerald-800" },
  { key: BadgeStatus.SendBack, Color: "bg-rose-300 text-rose-800" },
  { key: BadgeStatus.Review, Color: "bg-amber-200 text-amber-800" },
  { key: BadgeStatus.Deleted, Color: "bg-rose-300 text-rose-800" },
  { key: BadgeStatus.Received  , Color: "bg-emerald-300 text-emerald-800" },
  { key: BadgeStatus.Active, Color: "bg-emerald-300 text-emerald-800" },
  { key: BadgeStatus.Inactive, Color: "bg-slate-300 text-slate-800" },
  { key: BadgeStatus.BelowMin, Color: "bg-destructive text-red-800" },
  { key: BadgeStatus.Reorder, Color: "bg-yellow-500 text-amber-800" },
  { key: BadgeStatus.OverMax, Color: "bg-blue-500 text-default-800" },
  { key: BadgeStatus.Normal, Color: "bg-green-500 text-gray-800" }, 

 
];

interface StatusBadgeProps {
  status : string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles : Record<string, string> = {
    Accept: 'bg-green-100 text-green-800',
    Reject: 'bg-red-100 text-red-800',
    Review: 'bg-yellow-100 text-yellow-800',
    Draft: 'bg-gray-100 text-gray-800',
    InProgress: 'bg-blue-100 text-blue-800',
    Complete: 'bg-emerald-100 text-emerald-800',
    Void: 'bg-slate-100 text-slate-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function CustomStatusBadge({
  children,
  badgeColor,
  status,
}: {
  children: React.ReactNode;
  badgeColor?: BadgeStatus;
  status?: string;
}) {
  if (status) {
    badgeColor = status as BadgeStatus;
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
