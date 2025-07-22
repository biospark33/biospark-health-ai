
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '30';
    
    const response = await fetch(`http://localhost:8004/health-journey/${params.userId}?days=${days}`);

    if (!response.ok) {
      throw new Error(`Health journey retrieval failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health journey error:', error);
    return NextResponse.json(
      { error: 'Health journey retrieval failed' },
      { status: 500 }
    );
  }
}
