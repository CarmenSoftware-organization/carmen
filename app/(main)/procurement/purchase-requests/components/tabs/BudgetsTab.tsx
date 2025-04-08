import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BudgetData } from '@/lib/types'


// File: tabs/BudgetsTab.tsx

const budgetData: BudgetData[] = [
    {
        location: 'Food Store 1FB01',
        budgetCategory: 'Food & Beverage',
        totalBudget: 5000000,
        softCommitmentPR: 500000,
        softCommitmentPO: 750000,
        hardCommitment: 2000000,
        availableBudget: 1750000,
        currentPRAmount: 990000
      },
      {
        location: 'Food Store 1FB02',
        budgetCategory: 'Food & Beverage',
        totalBudget: 4000000,
        softCommitmentPR: 300000,
        softCommitmentPO: 500000,
        hardCommitment: 1500000,
        availableBudget: 1700000,
        currentPRAmount: 0
      },
]

export const BudgetsTab: React.FC = () => {
  return (
    <Table className="bg-white dark:bg-gray-800">
      <TableHeader className="bg-white dark:bg-gray-800">
        <TableRow >
          <TableHead className="w-[150px] text-white dark:text-gray-800">Location</TableHead>
          <TableHead className="w-[150px] text-white dark:text-gray-800">Budget Category</TableHead>
          <TableHead className="text-right text-white dark:text-gray-800">Total Budget</TableHead>
          <TableHead className="text-right text-white dark:text-gray-800">
            <div>Soft Commitment</div>
            <div className="font-normal text-xs text-white dark:text-gray-800">Dept. Head Approve PR</div>
          </TableHead>
          <TableHead className="text-right text-white dark:text-gray-800">
            <div>Soft Commitment</div>
            <div className="font-normal text-xs text-white dark:text-gray-800">PO</div>
          </TableHead>
          <TableHead className="text-right">
            <div>Hard Commitment</div>
            <div className="font-normal text-xs text-white dark:text-gray-800">Actual GL</div>
          </TableHead>
          <TableHead className="text-right text-white dark:text-gray-800">Available Budget</TableHead>
          <TableHead className="text-right text-white dark:text-gray-800">Current PR Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>

        {/* {budgetData.map((budget, index) => (
            <>
           { console.log(budget) }
            </>
        ))} */}

        {budgetData.map((budget, index) => (
          <TableRow key={index}>
            <TableCell>{budget.location}</TableCell>
            <TableCell>{budget.budgetCategory}</TableCell>
            <TableCell className="text-right">{budget.totalBudget.toLocaleString()}</TableCell>
            <TableCell className="text-right">{budget.softCommitmentPR.toLocaleString()}</TableCell>
            <TableCell className="text-right">{budget.softCommitmentPO.toLocaleString()}</TableCell>
            <TableCell className="text-right">{budget.hardCommitment.toLocaleString()}</TableCell>
            <TableCell className="text-right">{budget.availableBudget.toLocaleString()}</TableCell>
            <TableCell className="text-right">{budget.currentPRAmount.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
