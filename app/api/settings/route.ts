import { NextResponse } from 'next/server'

// Simple in-memory state (use database for production)
let ordersPaused = false
let pauseMessage = ''

export async function GET() {
  return NextResponse.json({ paused: ordersPaused, message: pauseMessage })
}

export async function POST(request: Request) {
  const body = await request.json()
  ordersPaused = body.paused
  pauseMessage = body.message || ''
  return NextResponse.json({ paused: ordersPaused, message: pauseMessage })
}