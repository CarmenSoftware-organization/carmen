import StockMovementContent from './stock-movement'
import { StockMovement } from '@/lib/types'

interface StockMovementTabProps {
  mode: string
  movements: StockMovement[]
}

export function StockMovementTab({ mode, movements }: StockMovementTabProps) {
  return <StockMovementContent />
}
