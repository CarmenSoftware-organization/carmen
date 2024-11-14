import StockMovementContent from './stock-movement'

interface StockMovementTabProps {
  mode: string
  movements: any[] // Update this type based on your actual movement type
}

export function StockMovementTab({ mode, movements }: StockMovementTabProps) {
  return <StockMovementContent />
}
