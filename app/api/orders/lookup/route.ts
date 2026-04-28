import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    const order = await prisma.order.findFirst({
      where: {
        customerPhone: phone,
        status: {
          in: ['pending', 'preparing', 'ready']
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!order) {
      return NextResponse.json({ error: 'No active order found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}