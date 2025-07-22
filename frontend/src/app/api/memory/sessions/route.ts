
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    
    const response = await fetch(`http://localhost:8004/sessions?user_id=${user_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Session creation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Session creation failed' },
      { status: 500 }
    );
  }
}
