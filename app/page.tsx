'use client'

import { useState, useEffect } from 'react'
import MenuCard from '@/components/MenuCard'
import CustomizationPanel from '@/components/CustomizationPanel'
import OrderTracker from '@/components/OrderTracker'
import CartPanel from '@/components/CartPanel'
import { useOrder } from '@/context/OrderContext'
import toast from 'react-hot-toast'

export default function Home() {
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCart, setShowCart] = useState(false)
  const [showLookup, setShowLookup] = useState(false)
  const [lookupPhone, setLookupPhone] = useState('')
  const { cart, currentOrderId, setCurrentOrderId, setOrderPhone } = useOrder()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const response = await fetch('/api/menu')
    const data = await response.json()
    setMenuItems(data)
  }

  const handleLookup = async () => {
    const cleanPhone = lookupPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      toast.error('Enter a valid phone number')
      return
    }
    
    const res = await fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone })
    })

    if (res.ok) {
      const order = await res.json()
      setCurrentOrderId(order.id)
      setOrderPhone(cleanPhone)
      setShowLookup(false)
      toast.success('Order found!')
    } else {
      toast.error('No active order found for that number')
    }
  }

  const categories = [...new Set(menuItems.map((item: any) => item.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-amber-800">Brew & Go</h1>
              <p className="text-sm text-gray-500">Order ahead, skip the line</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLookup(true)}
                className="text-sm text-amber-800 hover:text-amber-900 font-medium"
              >
                My Order
              </button>
              <button onClick={() => setShowCart(true)} className="relative p-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {currentOrderId ? (
          <OrderTracker orderId={currentOrderId} />
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {categories.map((category: string) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-800 whitespace-nowrap shadow-sm"
                >
                  {category}
                </button>
              ))}
            </div>

            <div>
              {menuItems.filter((item: any) => item.available).map((item: any) => (
                <MenuCard key={item.id} item={item} onSelect={setSelectedItem} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Order Lookup Modal */}
      {showLookup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Find My Order</h2>
              <button onClick={() => setShowLookup(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-gray-500 mb-4">Enter the phone number you used to place your order.</p>
            <input
              type="tel"
              value={lookupPhone}
              onChange={e => setLookupPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 mb-4 text-lg"
            />
            <button
              onClick={handleLookup}
              className="w-full bg-amber-800 text-white py-4 rounded-2xl font-semibold hover:bg-amber-900"
            >
              Find Order
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <CustomizationPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {showCart && (
        <CartPanel onClose={() => setShowCart(false)} />
      )}

      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="/staff"
          className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm opacity-50 hover:opacity-100 transition-opacity shadow-lg"
        >
          Staff
        </a>
      </div>
    </div>
  )
}