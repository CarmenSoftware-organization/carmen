"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'

interface SubtotalRowProps {
  label: string
  subtotals: Record<string, number>
  columns: {
    key: string
    label: string
    type: 'number' | 'currency' | 'text' | 'badge' | 'date' | 'actions'
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
    badgeColor?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline'
  }[]
}

export function SubtotalRow({ label, subtotals, columns }: SubtotalRowProps) {
  return (
    <TableRow className="bg-muted/50 font-medium">
      <TableCell className="font-semibold">
        {label}
      </TableCell>
      {columns.map((column) => {
        if (column.key === 'actions') return <TableCell key={column.key} />

        const value = subtotals[column.key]
        let displayValue: React.ReactNode = ''

        switch (column.type) {
          case 'currency':
            displayValue = formatCurrency(value || 0)
            break
          case 'number':
            displayValue = formatNumber(value || 0)
            break
          case 'badge':
            displayValue = value ? (
              <Badge variant={column.badgeVariant || 'secondary'}>
                {value}
              </Badge>
            ) : ''
            break
          default:
            displayValue = value?.toString() || ''
        }

        return (
          <TableCell key={column.key} className="font-medium">
            {displayValue}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

interface GroupHeaderProps {
  locationName: string
  itemCount: number
  isExpanded: boolean
  onToggle: () => void
  keyMetrics?: { label: string; value: string | number; type: 'currency' | 'number' | 'text' }[]
}

export function GroupHeader({ locationName, itemCount, isExpanded, onToggle, keyMetrics }: GroupHeaderProps) {
  return (
    <TableRow className="bg-slate-50 hover:bg-slate-100 border-b-2 border-slate-200">
      <TableCell colSpan={100} className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span className="font-semibold text-base">{locationName}</span>
            <Badge variant="outline" className="ml-2">
              {formatNumber(itemCount)} items
            </Badge>
          </div>

          {keyMetrics && keyMetrics.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {keyMetrics.map((metric, index) => {
                let displayValue: string
                switch (metric.type) {
                  case 'currency':
                    displayValue = formatCurrency(Number(metric.value))
                    break
                  case 'number':
                    displayValue = formatNumber(Number(metric.value))
                    break
                  default:
                    displayValue = metric.value.toString()
                }

                return (
                  <span key={index} className="whitespace-nowrap">
                    <span className="font-medium">{metric.label}:</span> {displayValue}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

interface GroupedTableProps<T> {
  groups: Array<{
    locationId: string
    locationName: string
    items: T[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>
  columns: {
    key: string
    label: string
    type: 'number' | 'currency' | 'text' | 'badge' | 'date' | 'actions'
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
    badgeColor?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline'
  }[]
  renderRow: (item: T) => React.ReactNode
  onToggleGroup: (locationId: string) => void
  showSubtotals?: boolean
  getGroupKeyMetrics?: (subtotals: Record<string, number>) => { label: string; value: string | number; type: 'currency' | 'number' | 'text' }[]
  grandTotals?: Record<string, number>
}

export function GroupedTable<T>({
  groups,
  columns,
  renderRow,
  onToggleGroup,
  showSubtotals = true,
  getGroupKeyMetrics,
  grandTotals
}: GroupedTableProps<T>) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <tbody key={group.locationId}>
              <GroupHeader
                locationName={group.locationName}
                itemCount={group.items.length}
                isExpanded={group.isExpanded}
                onToggle={() => onToggleGroup(group.locationId)}
                keyMetrics={getGroupKeyMetrics ? getGroupKeyMetrics(group.subtotals) : undefined}
              />

              {group.isExpanded && (
                <>
                  {group.items.map((item) => renderRow(item))}

                  {showSubtotals && (
                    <SubtotalRow
                      label={`Subtotal - ${group.locationName}`}
                      subtotals={group.subtotals}
                      columns={columns}
                    />
                  )}
                </>
              )}
            </tbody>
          ))}

          {grandTotals && (
            <tbody>
              <TableRow className="border-t-2 border-primary bg-primary/5">
                <TableCell colSpan={100} className="py-1" />
              </TableRow>
              <SubtotalRow
                label="Grand Total"
                subtotals={grandTotals}
                columns={columns}
              />
            </tbody>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Hook for managing grouped table state
export function useGroupedTable<T>(
  initialGroups: Array<{
    locationId: string
    locationName: string
    items: T[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>
) {
  const [groups, setGroups] = useState(initialGroups)

  const toggleGroup = (locationId: string) => {
    setGroups(prev =>
      prev.map(group =>
        group.locationId === locationId
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    )
  }

  const expandAll = () => {
    setGroups(prev => prev.map(group => ({ ...group, isExpanded: true })))
  }

  const collapseAll = () => {
    setGroups(prev => prev.map(group => ({ ...group, isExpanded: false })))
  }

  const calculateGrandTotals = (subtotalKeys: string[]): Record<string, number> => {
    const grandTotals: Record<string, number> = {}

    subtotalKeys.forEach(key => {
      grandTotals[key] = groups.reduce((sum, group) => sum + (group.subtotals[key] || 0), 0)
    })

    return grandTotals
  }

  return {
    groups,
    setGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    calculateGrandTotals
  }
}