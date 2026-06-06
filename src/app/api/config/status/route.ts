import { NextResponse } from 'next/server';
import { getProductionConfigStatus } from '@/lib/config';

export async function GET() {
  return NextResponse.json(getProductionConfigStatus());
}
