'use client'

import { useEffect, useState } from 'react'
import { formatTime, formatPrice } from '@/lib/utils'

interface Props {
  onSwitchToKitchen: () => void
}

export default function CounterView({ onSwitchToKitchen }: Props) {
  const [shiftOpen, setShiftOpen] = useState(false)
  const [startCash, setStartCash] = useState('200')
  const [orders, setOrders] = useState<any[]>([])
  const [showCloseShift, setShowCloseShift] = useState(false)
  const [actualCash, setActualCash] = useState('')
  const [closeResult, setCloseResult] = useState<any>(null)

  useEffect(() => {
    checkShift()
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkShift = async () => {
    const res = await fetch('/api/shift')
    const data = await res.json()
    setShiftOpen(data.open)
  }

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    if (Array.isArray(data)) setOrders(data)
  }

  const openShift = async () => {
    await fetch('/api/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'open', startCash: parseFloat(startCash) })
    })
    setShiftOpen(true)
  }

  const closeShift = async () => {
    const res = await fetch('/api/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', actualCash: parseFloat(actualCash) })
    })
    const data = await res.json()
    setCloseResult(data)
    setShiftOpen(false)
    setShowCloseShift(false)
  }

  const processPayment = async (orderId: string, method: string) => {
    await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: method })
    })
    fetchOrders()
  }

  const readyOrders = orders.filter(o => o.status === 'ready' && o.paymentStatus === 'pending')
  const upcomingOrders = orders.filter(o => o.status === 'pending').slice(0, 4)

  // Shift closed screen
  if (!shiftOpen) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-4xl mb-4">☀️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Shift Closed</h1>
          <p className="text-gray-400 mb-6">Enter starting cash to begin the day</p>
          
          {closeResult && (
            <div className="bg-gray-700 rounded-xl p-4 mb-6 text-left">
              <p className="text-gray-300 text-sm mb-1">Previous shift summary:</p>
              <p className="text-white">Expected: {formatPrice(closeResult.expectedCash)}</p>
              <p className="text-white">Actual: {formatPrice(closeResult.actualCash || 0)}</p>
              <p className={`font-bold ${closeResult.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {closeResult.difference >= 0 ? 'Over' : 'Short'}: {formatPrice(Math.abs(closeResult.difference))}
              </p>
            </div>
          )}

          <input
            type="number"
            value={startCash}
            onChange={e => setStartCash(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white text-center text-2xl mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-800"
            placeholder="200"
          />
          <button
            onClick={openShift}
            className="w-full bg-amber-800 text-white py-4 rounded-xl font-semibold hover:bg-amber-900"
          >
            Open Shift
          </button>
        </div>
      </div>
    )
  }

  // Close shift screen
  if (showCloseShift) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
          <h2 className="text-white text-xl font-bold mb-4">🌙 Close Shift</h2>
          <p className="text-gray-400 text-sm mb-6">Count the cash in the drawer and enter the amount below.</p>
          
          <input
            type="number"
            value={actualCash}
            onChange={e => setActualCash(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white text-center text-2xl mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-800"
            placeholder="0.00"
            step="0.01"
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCloseShift(false)}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={closeShift}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700"
            >
              Close Shift
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main counter view
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold">Brew & Go</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToKitchen}
            className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-600"
          >
            🍳 Kitchen
          </button>
        </div>
      </div>

      {/* Ready for Pickup */}
      <div className="flex-1 overflow-auto p-4">
        <h2 className="text-white font-semibold text-lg mb-4">Ready for Pickup</h2>
        
        {readyOrders.map(order => (
          <div key={order.id} className="bg-gray-800 p-4 rounded-xl mb-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-white font-bold text-lg">{order.customerName || order.customerPhone}</p>
                <p className="text-gray-400 text-sm">
                  {order.items.map((item: any) => item.menuItem.name).join(', ')}
                </p>
                <p className="text-gray-500 text-xs mt-1">Pickup: {formatTime(new Date(order.pickupTime))}</p>
              </div>
              <div className="text-center">
                <div className="bg-green-900/50 rounded-lg px-3 py-2 border border-green-700/50">
                  <p className="text-green-300 text-xl font-bold tracking-wider">#{order.id.slice(-4).toUpperCase()}</p>
                </div>
                <p className="text-white text-xl font-bold mt-2">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => processPayment(order.id, 'card')}
                className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                💳 Card
              </button>
              <button
                onClick={() => processPayment(order.id, 'cash')}
                className="bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700"
              >
                💵 Cash
              </button>
            </div>
          </div>
        ))}

        {readyOrders.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl">
            <p className="text-gray-500">No orders ready</p>
            <p className="text-gray-600 text-sm">Mark orders as ready from the kitchen</p>
          </div>
        )}

        {/* Up Next */}
        {upcomingOrders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Up Next</h3>
            <div className="space-y-2">
              {upcomingOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center bg-gray-800/50 px-4 py-3 rounded-xl">
                  <div>
                    <span className="text-gray-300 text-sm font-medium">
                      {formatTime(new Date(order.pickupTime))} — {order.customerName || order.customerPhone}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {order.items.map((item: any) => item.menuItem.name).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 px-4 py-3 flex gap-2">
        <button
          onClick={() => setShowCloseShift(true)}
          className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600"
        >
          🔚 Close Shift
        </button>
        <a
          href="/staff/sales"
          className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 text-center"
        >
          📊 Sales
        </a>
      </div>
    </div>
  )
}