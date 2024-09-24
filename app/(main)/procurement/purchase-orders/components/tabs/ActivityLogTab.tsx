import React, { Children } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from "@/components/ui/custom-status-badge";

interface ActivityLog {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  details: string;
  timestamp: string;
}

interface ActivityLogTabProps {
  poData: any; // Replace 'any' with your PurchaseOrder type
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "/avatars/john-doe.png",
    },
    action: "Created",
    details: "Purchase Order created",
    timestamp: "2023-08-15 09:00 AM",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      avatar: "/avatars/jane-smith.png",
    },
    action: "Updated",
    details: "Added 2 new items to the order",
    timestamp: "2023-08-15 10:30 AM",
  },
  {
    id: "3",
    user: {
      name: "Mike Johnson",
      avatar: "/avatars/mike-johnson.png",
    },
    action: "Approved",
    details: "Purchase Order approved for processing",
    timestamp: "2023-08-16 02:15 PM",
  },
  {
    id: "4",
    user: {
      name: "Sarah Lee",
      avatar: "/avatars/sarah-lee.png",
    },
    action: "Updated",
    details: "Changed delivery date to 2023-08-30",
    timestamp: "2023-08-17 11:45 AM",
  },
  {
    id: "5",
    user: {
      name: "Tom Wilson",
      avatar: "/avatars/tom-wilson.png",
    },
    action: "Comment",
    details: 'Added comment: "Please expedite this order"',
    timestamp: "2023-08-18 03:30 PM",
  },
  {
    id: "6",
    user: {
      name: "Emily Brown",
      avatar: "/avatars/emily-brown.png",
    },
    action: "Updated",
    details: "Modified quantities for items ITEM001 and ITEM002",
    timestamp: "2023-08-19 10:00 AM",
  },
  {
    id: "7",
    user: {
      name: "John Doe",
      avatar: "/avatars/john-doe.png",
    },
    action: "Sent",
    details: "Purchase Order sent to vendor",
    timestamp: "2023-08-20 09:15 AM",
  },
];

export default function ActivityLogTab({ poData }: ActivityLogTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockActivityLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={log.user.avatar} alt={log.user.name} />
                  <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={
                    log.action === "Created"
                      ? "default"
                      : log.action === "Updated"
                      ? "secondary"
                      : log.action === "Approved"
                      ? "success"
                      : log.action === "Sent"
                      ? "outline"
                      : "default"
                  }
                >
                  {log.action}
                </StatusBadge>
              </TableCell>
              <TableCell>{log.details}</TableCell>
              <TableCell className="text-right">{log.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
