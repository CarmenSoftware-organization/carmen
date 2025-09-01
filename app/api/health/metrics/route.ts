/**
 * Database Metrics API Route
 * Provides metrics in Prometheus format
 */

import { NextRequest } from 'next/server'
import { handleMetrics } from '@/lib/db/health-endpoint'

export async function GET(request: NextRequest) {
  return handleMetrics(request)
}