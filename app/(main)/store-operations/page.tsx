'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for graphs
const stockReplenishmentData = [
  { day: 'Mon', value: 1200 },
  { day: 'Tue', value: 1500 },
  { day: 'Wed', value: 1800 },
  { day: 'Thu', value: 1600 },
  { day: 'Fri', value: 2000 },
  { day: 'Sat', value: 2200 },
  { day: 'Sun', value: 1900 },
];

const wastageByTypeData = [
  { name: 'Expired', value: 35 },
  { name: 'Damaged', value: 25 },
  { name: 'Overproduction', value: 20 },
  { name: 'Other', value: 20 },
];

const topStoreRequisitionsData = [
  { name: 'Store A', count: 50 },
  { name: 'Store B', count: 45 },
  { name: 'Store C', count: 40 },
  { name: 'Store D', count: 35 },
  { name: 'Store E', count: 30 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock dashboard items
const initialItems = [
  { id: 'item1', content: 'Stock Replenishment Trend', type: 'stockReplenishment' },
  { id: 'item2', content: 'Wastage by Type', type: 'wastageByType' },
  { id: 'item3', content: 'Top 5 Stores by Requisitions', type: 'topStoreRequisitions' },
  { id: 'item4', content: 'Pending Store Requisitions', type: 'text', data: '12 requisitions awaiting approval' },
  { id: 'item5', content: 'Stock Alerts', type: 'text', data: '5 items below reorder point across stores' },
  { id: 'item6', content: 'Efficiency Improvement', type: 'text', data: '7% improvement in store operations efficiency this month' },
];

export default function StoreOperationsPage() {
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
      case 'stockReplenishment':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stockReplenishmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Replenishment Value" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'wastageByType':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={wastageByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {wastageByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'topStoreRequisitions':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topStoreRequisitionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Requisition Count" />
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
      <h1 className="text-3xl font-bold mb-6">Store Operations Dashboard</h1>
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