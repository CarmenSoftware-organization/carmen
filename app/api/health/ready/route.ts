/**
 * Database Readiness Probe API Route
 * Comprehensive readiness check for load balancers
 */

import { NextRequest } from 'next/server'
import { handleReadiness } from '@/lib/db/health-endpoint'

export async function GET(request: NextRequest) {
  return handleReadiness(request)
}