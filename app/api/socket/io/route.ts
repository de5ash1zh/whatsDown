import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connections not supported in serverless',
    suggestion: 'Use polling fallback or external WebSocket service',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connections not supported in serverless',
    suggestion: 'Use polling fallback or external WebSocket service',
    timestamp: new Date().toISOString()
  });
}
