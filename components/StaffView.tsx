'use client'

import { useEffect, useState } from 'react'
import { formatTime, formatPrice } from '@/lib/utils'

export default function StaffView() {
  const [mode, setMode] = useState<'kitchen' | 'pos' | 'sales'>('kitchen')
  const [orders, setOrders] = useState<any[]>([])
  const [completedOrders, setCompletedOrders] = useState<any[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchSettings()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    const response = await fetch('/api/orders')
    const data = await response.json()
    setOrders(data)
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setPaused(data.paused)
  }

  const fetchCompletedOrders = async () => {
    const response = await fetch('/api/orders/completed')
    const data = await response.json()
    setCompletedOrders(data)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchOrders()
  }

  const processPayment = async (orderId: string, method: string) => {
    await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: method })
    })
    fetchOrders()
  }

  const togglePause = async () => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paused: !paused,
        message: paused ? '' : 'We are at capacity. Orders will resume shortly.'
      })
    })
    const data = await res.json()
    setPaused(data.paused)
  }

  const dailyTotal = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const cardTotal = completedOrders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0)
  const cashTotal = completedOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">Cafe Control</h1>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button onClick={() => setMode('kitchen')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'kitchen' ? 'bg-white text-gray-900' : 'text-gray-300'}`}>Queue</button>
              <button onClick={() => { setMode('pos'); fetchOrders() }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'pos' ? 'bg-white text-gray-900' : 'text-gray-300'}`}>POS</button>
              <button onClick={() => { setMode('sales'); fetchCompletedOrders() }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'sales' ? 'bg-white text-gray-900' : 'text-gray-300'}`}>Sales</button>
            </div>
            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paused ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {paused ? '⏸ PAUSED' : '⏸ Pause'}
            </button>
          </div>
        </div>
        {paused && (
          <div className="mt-2 bg-red-900/50 text-red-200 text-sm px-4 py-2 rounded-lg">
            Orders are paused. Customers cannot place new orders.
          </div>
        )}
      </div>

      {mode === 'kitchen' && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h2 className="text-white font-semibold mb-3">Now Making</h2>
              {orders.filter(o => o.status === 'preparing').map(order => (
                <div key={order.id} className="bg-gray-800 p-4 rounded-xl mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white font-medium">{order.customerName || order.customerPhone}</p>
                    <span className="text-xs bg-amber-800/50 text-amber-300 px-2 py-1 rounded-full">{formatTime(new Date(order.pickupTime))}</span>
                  </div>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="text-gray-300 text-sm mb-1">
                      <p className="font-medium">{item.menuItem.name}</p>
                    </div>
                  ))}
                  <button onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">Mark Ready</button>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3">Up Next</h2>
              {orders.filter(o => o.status === 'pending').slice(0, 5).map(order => (
                <div key={order.id} className="bg-gray-800 p-4 rounded-xl mb-3">
                  <div className="flex justify-between">
                    <p className="text-white font-medium">{order.customerName || order.customerPhone}</p>
                    <span className="text-xs text-gray-400">{order.source === 'counter' ? '🏪' : '🌐'}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Pickup: {formatTime(new Date(order.pickupTime))}</p>
                  {order.items.map((item: any) => (
                    <p key={item.id} className="text-gray-300 text-sm">{item.menuItem.name}</p>
                  ))}
                  <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full mt-2 bg-amber-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-900">Start Making</button>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3">Ready</h2>
              {orders.filter(o => o.status === 'ready').map(order => (
                <div key={order.id} className="bg-green-900/50 p-4 rounded-xl mb-3 border border-green-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium text-lg">{order.customerName || order.customerPhone}</p>
                      <p className="text-gray-300 text-sm">{order.items.map((item: any) => item.menuItem.name).join(', ')}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg px-3 py-2 text-center">
                      <p className="text-green-300 text-xl font-bold tracking-wider">#{order.id.slice(-4).toUpperCase()}</p>
                    </div>
                  </div>
                  {order.paymentStatus === 'pending' && <span className="text-yellow-400 text-xs">⏳ Awaiting payment</span>}
                  {order.paymentStatus === 'paid' && <span className="text-green-400 text-xs">✓ Paid · {order.paymentMethod}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'pos' && (
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-white font-semibold mb-4 text-lg">Collect Payment</h2>
          <p className="text-gray-400 text-sm mb-4">Customer shows their pickup code → match it → take payment</p>
          {orders.filter(o => o.status === 'ready' && o.paymentStatus === 'pending').map(order => (
            <div key={order.id} className="bg-gray-800 p-5 rounded-xl mb-4 border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-medium text-lg">{order.customerName || order.customerPhone}</p>
                  <p className="text-gray-400 text-sm mt-1">{order.items.map((item: any) => item.menuItem.name).join(', ')}</p>
                </div>
                <div className="bg-green-900/50 rounded-xl px-4 py-3 text-center border border-green-700/50">
                  <p className="text-green-300 text-2xl font-bold tracking-wider">#{order.id.slice(-4).toUpperCase()}</p>
                  <p className="text-green-400 text-xs mt-1">Pickup code</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total</span>
                <span className="text-white text-3xl font-bold">{formatPrice(order.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => processPayment(order.id, 'card')} className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">💳 Card</button>
                <button onClick={() => processPayment(order.id, 'cash')} className="bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700">💵 Cash</button>
              </div>
            </div>
          ))}
          {orders.filter(o => o.status === 'ready' && o.paymentStatus === 'pending').length === 0 && (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <p className="text-gray-400 text-lg mb-1">No orders awaiting payment</p>
              <p className="text-gray-500 text-sm">Orders will appear here when marked Ready</p>
            </div>
          )}
        </div>
      )}

      {mode === 'sales' && (
        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-5 rounded-xl">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Total Sales</p>
              <p className="text-white text-2xl font-bold">{formatPrice(dailyTotal)}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Card</p>
              <p className="text-blue-400 text-2xl font-bold">{formatPrice(cardTotal)}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Cash</p>
              <p className="text-green-400 text-2xl font-bold">{formatPrice(cashTotal)}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Orders</p>
              <p className="text-white text-2xl font-bold">{completedOrders.length}</p>
            </div>
          </div>
          <h2 className="text-white font-semibold mb-4">Today's Transactions</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 text-xs text-gray-400 font-medium uppercase tracking-wide">
              <span>Time</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Payment</span>
              <span className="text-right">Amount</span>
            </div>
            {completedOrders.map(order => (
              <div key={order.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700/50 text-sm hover:bg-gray-700/30 transition-colors">
                <span className="text-gray-300">{formatTime(new Date(order.updatedAt))}</span>
                <span className="text-white font-medium">{order.customerName || order.customerPhone}</span>
                <span className="text-gray-400 truncate">{order.items.map((item: any) => item.menuItem.name).join(', ')}</span>
                <span className={`font-medium ${order.paymentMethod === 'card' ? 'text-blue-400' : 'text-green-400'}`}>{order.paymentMethod?.toUpperCase()}</span>
                <span className="text-white text-right font-medium">{formatPrice(order.total)}</span>
              </div>
            ))}
            {completedOrders.length === 0 && (
              <div className="text-center py-12"><p className="text-gray-500">No transactions yet today</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}