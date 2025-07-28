import { NextResponse } from 'next/server';
import analyticsData from '@/lib/mock/price-management/rule-analytics.json';

export async function GET() {
  try {
    return NextResponse.json({
      testScenarios: analyticsData.testScenarios
    });
  } catch (error) {
    console.error('Error fetching test scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test scenarios' },
      { status: 500 }
    );
  }
}