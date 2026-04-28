import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone, pin, name } = await request.json()

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { phone } })

    if (existing) {
      // Link latest order to user
      const order = await prisma.order.findFirst({
        where: { customerPhone: phone },
        orderBy: { createdAt: 'desc' }
      })
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: existing.id }
        })
      }
      return NextResponse.json(existing)
    }

    // Create new user
    const user = await prisma.user.create({
      data: { phone, pin, name: name || '' }
    })

    // Link latest order
    const order = await prisma.order.findFirst({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' }
    })
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: user.id }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
  }
}