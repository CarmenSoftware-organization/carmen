'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { DropResult } from 'react-beautiful-dnd';

// Mock data for graphs
const inventoryLevelsData = [
  { category: 'Food', current: 5000, reorder: 3000 },
  { category: 'Beverages', current: 3000, reorder: 2000 },
  { category: 'Cleaning', current: 2000, reorder: 1500 },
  { category: 'Linen', current: 4000, reorder: 2500 },
  { category: 'Amenities', current: 1500, reorder: 1000 },
];

const inventoryValueData = [
  { month: 'Jan', value: 100000 },
  { month: 'Feb', value: 110000 },
  { month: 'Mar', value: 120000 },
  { month: 'Apr', value: 115000 },
  { month: 'May', value: 130000 },
  { month: 'Jun', value: 140000 },
];

const inventoryTurnoverData = [
  { name: 'Food', turnover: 12 },
  { name: 'Beverages', turnover: 8 },
  { name: 'Cleaning', turnover: 4 },
  { name: 'Linen', turnover: 6 },
  { name: 'Amenities', turnover: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for initial items
const initialItems: DashboardItem[] = [
  { id: 'item1', content: 'Inventory Levels by Category', type: 'inventoryLevels' },
  { id: 'item2', content: 'Inventory Value Over Time', type: 'inventoryValue' },
  { id: 'item3', content: 'Inventory Turnover Rate', type: 'inventoryTurnover' },
  { id: 'item4', content: 'Low Stock Alerts', type: 'text', data: '3 items below reorder point' },
  { id: 'item5', content: 'Expiring Items', type: 'text', data: '2 items expiring within 30 days' },
  { id: 'item6', content: 'Recent Transfers', type: 'text', data: '5 inter-location transfers in the last 24 hours' },
];

interface DashboardItem {
  id: string;
  content: string;
  type: 'inventoryLevels' | 'inventoryValue' | 'inventoryTurnover' | 'text';
  data?: string;
}

export default function InventoryManagementPage() {
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
      case 'inventoryLevels':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inventoryLevelsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current Level" />
              <Bar dataKey="reorder" fill="#82ca9d" name="Reorder Point" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'inventoryValue':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={inventoryValueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Inventory Value" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'inventoryTurnover':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={inventoryTurnoverData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="turnover"
                label={({ name, turnover }) => `${name}: ${turnover}`}
              >
                {inventoryTurnoverData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
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
      <h1 className="text-3xl font-bold mb-6">Inventory Management Dashboard</h1>
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