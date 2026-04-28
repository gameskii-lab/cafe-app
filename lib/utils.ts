import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export interface PickupSlot {
  time: Date
  orderCount: number
  status: 'open' | 'busy' | 'full'
  prepMinutes: number
}

export function generatePickupSlots(existingOrders: any[] = []): PickupSlot[] {
  const slots: PickupSlot[] = []
  const now = new Date()
  const startMinutes = Math.ceil(now.getMinutes() / 15) * 15
  const start = new Date(now)
  start.setMinutes(startMinutes, 0, 0)

  // Count orders per slot from existing orders
  const orderCounts = new Map<string, number>()
  existingOrders.forEach(order => {
    const pickupTime = new Date(order.pickupTime)
    const key = `${pickupTime.getHours()}-${pickupTime.getMinutes()}`
    orderCounts.set(key, (orderCounts.get(key) || 0) + 1)
  })

  for (let i = 1; i <= 8; i++) {
    const slot = new Date(start.getTime() + i * 15 * 60000)
    if (slot.getHours() >= 18) break // Cafe closes at 6 PM

    const key = `${slot.getHours()}-${slot.getMinutes()}`
    const count = orderCounts.get(key) || 0
    
    let status: 'open' | 'busy' | 'full'
    let prepMinutes: number

    if (count < 3) {
      status = 'open'
      prepMinutes = 10
    } else if (count < 6) {
      status = 'busy'
      prepMinutes = 15
    } else if (count < 8) {
      status = 'full'
      prepMinutes = 20
    } else {
      // Skip this slot entirely — too packed
      continue
    }

    slots.push({ time: slot, orderCount: count, status, prepMinutes })
  }

  return slots
}

// Clean up old IP tracker entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    // This cleanup runs in the middleware module
  }, 300000) // Every 5 minutes
}