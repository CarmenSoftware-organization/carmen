'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for graphs
const productionVolumeData = [
  { day: 'Mon', volume: 500 },
  { day: 'Tue', volume: 600 },
  { day: 'Wed', volume: 550 },
  { day: 'Thu', volume: 700 },
  { day: 'Fri', volume: 800 },
  { day: 'Sat', volume: 900 },
  { day: 'Sun', volume: 750 },
];

const qualityControlData = [
  { name: 'Passed', value: 92 },
  { name: 'Minor Issues', value: 6 },
  { name: 'Failed', value: 2 },
];

const topRecipesData = [
  { name: 'Recipe A', count: 150 },
  { name: 'Recipe B', count: 120 },
  { name: 'Recipe C', count: 100 },
  { name: 'Recipe D', count: 80 },
  { name: 'Recipe E', count: 70 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock dashboard items
const initialItems = [
  { id: 'item1', content: 'Production Volume', type: 'productionVolume' },
  { id: 'item2', content: 'Quality Control Results', type: 'qualityControl' },
  { id: 'item3', content: 'Top 5 Recipes Produced', type: 'topRecipes' },
  { id: 'item4', content: 'Batch Production', type: 'text', data: '3 batches currently in production' },
  { id: 'item5', content: 'Wastage Tracking', type: 'text', data: '2.5% production wastage this week' },
  { id: 'item6', content: 'Equipment Utilization', type: 'text', data: '85% average equipment utilization rate' },
];

export default function ProductionPage() {
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
      case 'productionVolume':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={productionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="#8884d8" name="Production Volume" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'qualityControl':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={qualityControlData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {qualityControlData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'topRecipes':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topRecipesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Production Count" />
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
      <h1 className="text-3xl font-bold mb-6">Production Dashboard</h1>
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