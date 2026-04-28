import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { openedAt: 'desc' },
      take: 30
    })
    return NextResponse.json(shifts)
  } catch (error) {
    return NextResponse.json([])
  }
}