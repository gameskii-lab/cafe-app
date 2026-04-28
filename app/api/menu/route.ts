import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}