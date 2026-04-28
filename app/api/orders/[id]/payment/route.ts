import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { paymentMethod } = body
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { paymentStatus: 'paid', paymentMethod, status: 'completed' }
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}