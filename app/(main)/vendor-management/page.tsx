'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Star, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Vendors",
    value: "86",
    description: "+3 this month",
    icon: Users,
  },
  {
    title: "Active Contracts",
    value: "45",
    description: "12 pending renewal",
    icon: DollarSign,
  },
  {
    title: "Average Rating",
    value: "4.5",
    description: "Based on 120 reviews",
    icon: Star,
  },
  {
    title: "On-Time Delivery",
    value: "92%",
    description: "Last 30 days",
    icon: Clock,
  },
  {
    title: "Total Spend",
    value: "$234.5K",
    description: "+12% from last month",
    icon: TrendingUp,
  }
];

export default function VendorManagementPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground mt-2">
            Overview of vendor performance and key metrics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Global Foods Supply", rating: 4.8, spend: "$45,234" },
                  { name: "Restaurant Depot", rating: 4.6, spend: "$32,123" },
                  { name: "Premium Distributors", rating: 4.5, spend: "$28,456" },
                ].map((vendor, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {vendor.rating}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{vendor.spend}</p>
                      <p className="text-xs text-muted-foreground">Monthly spend</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Contract Renewals", count: 5, status: "Due this week" },
                  { title: "Price Reviews", count: 8, status: "Pending approval" },
                  { title: "Performance Reviews", count: 3, status: "To be scheduled" },
                ].map((action, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.status}</p>
                    </div>
                    <div className="text-2xl font-bold">{action.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New vendor onboarded", details: "Global Foods Supply", time: "2 hours ago" },
                  { action: "Price list updated", details: "Restaurant Depot", time: "5 hours ago" },
                  { action: "Contract renewed", details: "Premium Distributors", time: "1 day ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex flex-col space-y-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}