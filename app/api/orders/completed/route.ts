import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        updatedAt: {
          gte: today
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Sales fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}