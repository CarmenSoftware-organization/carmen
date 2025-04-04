'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for graphs
const purchaseOrderTrendData = [
  { month: 'Jan', value: 120000 },
  { month: 'Feb', value: 135000 },
  { month: 'Mar', value: 150000 },
  { month: 'Apr', value: 140000 },
  { month: 'May', value: 160000 },
  { month: 'Jun', value: 175000 },
];

const supplierDistributionData = [
  { name: 'Food Suppliers', value: 40 },
  { name: 'Beverage Suppliers', value: 25 },
  { name: 'Equipment Suppliers', value: 20 },
  { name: 'Linen Suppliers', value: 15 },
];

const topVendorsData = [
  { name: 'Vendor A', spend: 50000 },
  { name: 'Vendor B', spend: 40000 },
  { name: 'Vendor C', spend: 35000 },
  { name: 'Vendor D', spend: 30000 },
  { name: 'Vendor E', spend: 25000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DashboardItem {
  id: string;
  content: string;
  type: 'purchaseOrderTrend' | 'supplierDistribution' | 'topVendors' | 'text';
  data?: string;
}

// Mock dashboard items
const initialItems: DashboardItem[] = [
  { id: 'item1', content: 'Purchase Order Trend', type: 'purchaseOrderTrend' },
  { id: 'item2', content: 'Supplier Distribution', type: 'supplierDistribution' },
  { id: 'item3', content: 'Top 5 Vendors by Spend', type: 'topVendors' },
  { id: 'item4', content: 'Pending Approvals', type: 'text', data: '5 purchase orders awaiting approval' },
  { id: 'item5', content: 'Expiring Contracts', type: 'text', data: '3 supplier contracts expiring in 30 days' },
  { id: 'item6', content: 'Cost Savings', type: 'text', data: '8% cost savings achieved this quarter through negotiations' },
];

export default function ProcurementPage() {
  const [items, setItems] = useState<DashboardItem[]>(initialItems);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const renderDashboardItem = (item: DashboardItem) => {
    switch (item.type) {
      case 'purchaseOrderTrend':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={purchaseOrderTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="PO Value" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'supplierDistribution':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={supplierDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {supplierDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'topVendors':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVendorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spend" fill="#82ca9d" name="Spend" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'text':
        return <p>{item.data}</p>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Procurement Dashboard</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-4 rounded-lg shadow-md bg-white"
                    >
                      <h2 className="text-lg font-semibold mb-2">{item.content}</h2>
                      {renderDashboardItem(item)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}