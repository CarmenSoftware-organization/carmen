'use client'

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for graphs
const demandForecastData = [
  { day: 'Mon', forecast: 1000, actual: 950 },
  { day: 'Tue', forecast: 1200, actual: 1150 },
  { day: 'Wed', forecast: 1100, actual: 1050 },
  { day: 'Thu', forecast: 1300, actual: 1250 },
  { day: 'Fri', forecast: 1500, actual: 1600 },
  { day: 'Sat', forecast: 1800, actual: 1900 },
  { day: 'Sun', forecast: 1600, actual: 1700 },
];

const menuPerformanceData = [
  { name: 'Dish A', sales: 120, profit: 600 },
  { name: 'Dish B', sales: 80, profit: 480 },
  { name: 'Dish C', sales: 100, profit: 550 },
  { name: 'Dish D', sales: 60, profit: 420 },
  { name: 'Dish E', sales: 90, profit: 540 },
];

const inventoryPlanningData = [
  { category: 'Overstocked', value: 20 },
  { category: 'Optimal', value: 60 },
  { category: 'Understocked', value: 15 },
  { category: 'Stockout Risk', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DashboardItem {
  id: string;
  content: string;
  type: 'demandForecast' | 'menuPerformance' | 'inventoryPlanning' | 'text';
  data?: string;
}

// Mock dashboard items
const initialItems: DashboardItem[] = [
  { id: 'item1', content: 'Demand Forecast vs Actual', type: 'demandForecast' },
  { id: 'item2', content: 'Menu Performance', type: 'menuPerformance' },
  { id: 'item3', content: 'Inventory Planning Status', type: 'inventoryPlanning' },
  { id: 'item4', content: 'Recipe Updates', type: 'text', data: '3 recipes updated in the last week' },
  { id: 'item5', content: 'Upcoming Events', type: 'text', data: '2 major events scheduled next month' },
  { id: 'item6', content: 'Menu Engineering', type: 'text', data: '5 dishes identified for menu optimization' },
];

export default function OperationalPlanningPage() {
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
      case 'demandForecast':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={demandForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#8884d8" name="Forecast" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'menuPerformance':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={menuPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales" />
              <Bar yAxisId="right" dataKey="profit" fill="#82ca9d" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'inventoryPlanning':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={inventoryPlanningData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {inventoryPlanningData.map((entry, index) => (
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
      <h1 className="text-3xl font-bold mb-6">Operational Planning Dashboard</h1>
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