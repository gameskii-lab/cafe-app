import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const shift = await prisma.shift.findFirst({
      where: { status: 'open' },
      include: {
        orders: {
          where: { paymentStatus: 'paid' },
          select: { total: true, paymentMethod: true }
        }
      }
    })

    if (!shift) {
      return NextResponse.json({ open: false })
    }

    const cashOrders = shift.orders.filter(o => o.paymentMethod === 'cash')
    const expectedCash = shift.startCash + cashOrders.reduce((sum, o) => sum + o.total, 0)

    return NextResponse.json({
      open: true,
      shift,
      expectedCash
    })
  } catch (error) {
    return NextResponse.json({ open: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, startCash, actualCash } = body

    if (action === 'open') {
      const shift = await prisma.shift.create({
        data: { startCash, status: 'open' }
      })
      return NextResponse.json({ shift })
    }

    if (action === 'close') {
      const shift = await prisma.shift.findFirst({ where: { status: 'open' } })
      if (!shift) return NextResponse.json({ error: 'No open shift' }, { status: 400 })

      // Calculate expected cash
      const paidOrders = await prisma.order.findMany({
        where: { shiftId: shift.id, paymentStatus: 'paid' }
      })
      const cashOrders = paidOrders.filter(o => o.paymentMethod === 'cash')
      const expectedCash = shift.startCash + cashOrders.reduce((sum, o) => sum + o.total, 0)
      const difference = (actualCash || 0) - expectedCash

      const closed = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          status: 'closed',
          closedAt: new Date(),
          expectedCash,
          actualCash,
          difference,
          endCash: actualCash
        }
      })

      return NextResponse.json({ shift: closed, expectedCash, difference })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}