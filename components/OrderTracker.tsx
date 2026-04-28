'use client'

import { useEffect, useState } from 'react'
import { formatTime } from '@/lib/utils'

interface OrderTrackerProps {
  orderId: string
}

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const [status, setStatus] = useState<string>('pending')
  const [pickupTime, setPickupTime] = useState<string>('')

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch(`/api/orders/${orderId}`)
      const order = await response.json()
      setStatus(order.status)
      setPickupTime(formatTime(new Date(order.pickupTime)))
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  const steps = [
    { key: 'pending', label: 'Received' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Picked Up' },
  ]

  const currentStep = steps.findIndex(s => s.key === status)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {status === 'ready' ? 'Your Order is Ready!' : 'Order Status'}
        </h3>
        <p className="text-gray-500 mt-1">Pickup at {pickupTime}</p>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center mb-4 last:mb-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index < currentStep ? 'bg-green-500 text-white' :
              index === currentStep ? 'bg-amber-800 text-white animate-pulse' :
              'bg-gray-200 text-gray-500'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`ml-3 font-medium ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {status === 'ready' && (
        <div className="mt-6 p-4 bg-green-50 rounded-xl text-center">
          <p className="text-green-800 font-medium mb-2">
            Your order is ready!
          </p>
          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-green-300">
            <p className="text-xs text-gray-500 mb-1">Pickup Code</p>
            <p className="text-3xl font-bold text-green-700 tracking-widest">
              #{orderId.slice(-4).toUpperCase()}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Show this code at the counter
          </p>
        </div>
      )}
    </div>
  )
}