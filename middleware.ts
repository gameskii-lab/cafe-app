import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store (resets on server restart — good enough for now)
const orderTracker = new Map<string, { count: number; resetAt: number }>()
const ipTracker = new Map<string, { count: number; resetAt: number }>()

export function middleware(request: NextRequest) {
  // Only apply to order creation
  if (request.nextUrl.pathname === '/api/orders' && request.method === 'POST') {
    
    // --- BOT DETECTION ---
    const userAgent = request.headers.get('user-agent') || ''
    const isBot = !userAgent || 
                  userAgent.includes('bot') || 
                  userAgent.includes('crawl') ||
                  userAgent.includes('python') ||
                  userAgent.includes('curl') ||
                  userAgent.length < 20

    if (isBot) {
      return NextResponse.json({ error: 'Blocked' }, { status: 403 })
    }

    // --- IP RATE LIMITING (1 order per 10 seconds per IP) ---
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const now = Date.now()
    const ipData = ipTracker.get(ip)
    
    if (ipData) {
      if (now < ipData.resetAt) {
        if (ipData.count >= 5) {
          return NextResponse.json({ 
            error: 'Too many orders. Please wait a moment.' 
          }, { status: 429 })
        }
        ipData.count++
      } else {
        ipTracker.set(ip, { count: 1, resetAt: now + 60000 }) // 1 min window
      }
    } else {
      ipTracker.set(ip, { count: 1, resetAt: now + 60000 })
    }

    // --- PHONE RATE LIMITING (3 orders per hour per phone) ---
    // We check this in the API layer since we need to parse the body
    // Middleware can't easily read request body in Next.js edge
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/orders/:path*',
}