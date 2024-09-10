'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for graphs
const inventoryTurnoverData = [
  { month: 'Jan', turnover: 2.5 },
  { month: 'Feb', turnover: 2.7 },
  { month: 'Mar', turnover: 3.0 },
  { month: 'Apr', turnover: 2.8 },
  { month: 'May', turnover: 3.2 },
  { month: 'Jun', turnover: 3.5 },
];

const supplierPerformanceData = [
  { name: 'On-time', value: 75 },
  { name: 'Late', value: 20 },
  { name: 'Defective', value: 5 },
];

const procurementSpendData = [
  { category: 'Food', spend: 50000 },
  { category: 'Beverages', spend: 30000 },
  { category: 'Cleaning', spend: 15000 },
  { category: 'Linen', spend: 20000 },
  { category: 'Amenities', spend: 10000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Mock dashboard items
const initialItems = [
  { id: 'item1', content: 'Inventory Turnover', type: 'inventoryTurnover' },
  { id: 'item2', content: 'Supplier Performance', type: 'supplierPerformance' },
  { id: 'item3', content: 'Procurement Spend', type: 'procurementSpend' },
  { id: 'item4', content: 'Stock Alerts', type: 'text', data: '3 items below reorder point' },
  { id: 'item5', content: 'Pending Orders', type: 'text', data: '7 orders awaiting delivery' },
  { id: 'item6', content: 'Waste Reduction', type: 'text', data: '12% reduction in food waste this month' },
];

export default function DashboardPage() {
  const [items, setItems] = useState(initialItems);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const renderDashboardItem = (item: any) => {
    switch (item.type) {
      case 'inventoryTurnover':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={inventoryTurnoverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="turnover" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'supplierPerformance':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={supplierPerformanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {supplierPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'procurementSpend':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={procurementSpendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spend" fill="#82ca9d" />
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
    <div className=" mx-auto p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">Hotel Supply Chain Dashboard</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 rounded-lg shadow-md bg-white"
                    >
                      <h2 className="text-lg font-semibold mb-3">{item.content}</h2>
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