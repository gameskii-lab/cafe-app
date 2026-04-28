import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerPhone, customerName, pickupTime, items } = body

    // Phone rate limiting (3 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000)
    const recentOrders = await prisma.order.count({
      where: {
        customerPhone,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentOrders >= 3) {
      return NextResponse.json({ 
        error: 'Too many orders from this number. Please wait.' 
      }, { status: 429 })
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const order = await prisma.order.create({
      data: {
        customerPhone,
        customerName: customerName || '',
        pickupTime: new Date(pickupTime),
        total,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            customizations: JSON.stringify(item.customizations),
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // Link to active shift
    const activeShift = await prisma.shift.findFirst({ where: { status: 'open' } })
    if (activeShift) {
      await prisma.order.update({
        where: { id: order.id },
        data: { shiftId: activeShift.id }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
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
      orderBy: { pickupTime: 'asc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json([])
  }
}