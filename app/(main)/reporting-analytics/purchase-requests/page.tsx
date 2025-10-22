import { Metadata } from 'next'
import { PurchaseRequestListReport } from './components/purchase-request-list-report'

export const metadata: Metadata = {
  title: 'PR-001: Purchase Request List Report',
  description: 'Summary list of all Purchase Requests within specified date range',
}

export default function PurchaseRequestListReportPage() {
  return <PurchaseRequestListReport />
}
