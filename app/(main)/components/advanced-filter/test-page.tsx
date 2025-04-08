'use client'

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FilterBuilder, FilterCondition } from './filter-builder';

const testFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    config: {
      placeholder: 'Enter name...',
    },
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number' as const,
    config: {
      min: 0,
      max: 120,
      step: 1,
    },
  },
  {
    name: 'birthDate',
    label: 'Birth Date',
    type: 'date' as const,
  },
  {
    name: 'isActive',
    label: 'Is Active',
    type: 'boolean' as const,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'enum' as const,
    config: {
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' },
      ],
    },
  },
  {
    name: 'department',
    label: 'Department',
    type: 'lookup' as const,
    config: {
      options: [
        { label: 'Engineering', value: 'eng' },
        { label: 'Marketing', value: 'mkt' },
        { label: 'Sales', value: 'sales' },
        { label: 'Support', value: 'support' },
      ],
    },
  },
];

export default function TestPage() {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: uuidv4(),
      fieldName: testFields[0].name,
      fieldType: testFields[0].type,
      operator: 'equals',
      value: null,
    };
    setConditions([...conditions, newCondition]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Advanced Filter Builder Test</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <FilterBuilder
          conditions={conditions}
          fields={testFields}
          onChange={setConditions}
          onAddCondition={handleAddCondition}
        />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Current Filter State:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(conditions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 