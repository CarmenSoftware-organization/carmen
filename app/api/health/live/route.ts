/**
 * Database Liveness Probe API Route
 * Simple liveness check for Kubernetes/Docker
 */

import { NextRequest } from 'next/server'
import { handleLiveness } from '@/lib/db/health-endpoint'

export async function GET(request: NextRequest) {
  return handleLiveness(request)
}