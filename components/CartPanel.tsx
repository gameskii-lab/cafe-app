'use client'

import { useState, useEffect } from 'react'
import { useOrder } from '@/context/OrderContext'
import { formatPrice, formatTime, generatePickupSlots } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CartPanelProps {
  onClose: () => void
}

export default function CartPanel({ onClose }: CartPanelProps) {
  const { cart, removeFromCart, clearCart, setCurrentOrderId, setOrderPhone } = useOrder()
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [showAccountCta, setShowAccountCta] = useState(false)
  const [pin, setPin] = useState('')
  const [lastOrderId, setLastOrderId] = useState('')
  const [slots, setSlots] = useState<any[]>([])

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    const res = await fetch('/api/orders')
    const orders = await res.json()
    setSlots(generatePickupSlots(orders))
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const handlePlaceOrder = async () => {
    const cleanPhone = customerPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    if (!selectedSlot) {
      toast.error('Please select a pickup time')
      return
    }

    setIsPlacing(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: cleanPhone,
          customerName,
          pickupTime: selectedSlot.toISOString(),
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations
          }))
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed')
      }

      const order = await response.json()
      setCurrentOrderId(order.id)
      setOrderPhone(cleanPhone)
      setLastOrderId(order.id)
      clearCart()
      toast.success('Order placed!')
      setShowAccountCta(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    } finally {
      setIsPlacing(false)
    }
  }

  const handleCreateAccount = async () => {
    const cleanPhone = customerPhone.replace(/\D/g, '')
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error('Please enter a 4-digit PIN')
      return
    }

    try {
      await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          pin,
          name: customerName
        })
      })
      toast.success('Account created! Your number is now saved.')
      onClose()
    } catch (error) {
      toast.error('Failed to create account')
    }
  }

  if (showAccountCta) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-2xl">
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">☕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 mb-6">
              Your pickup code is <strong className="text-amber-800 text-xl">#{lastOrderId.slice(-4).toUpperCase()}</strong>
            </p>

            <div className="bg-amber-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Want faster checkout next time?</h3>
              <p className="text-sm text-gray-600 mb-4">We&apos;ll remember your usual order. Just a PIN to confirm.</p>
              
              <input
                type="text"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Create a 4-digit PIN"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-800 mb-3"
                maxLength={4}
              />
              
              <button
                onClick={handleCreateAccount}
                className="w-full bg-amber-800 text-white py-3 rounded-xl font-semibold hover:bg-amber-900 transition-colors mb-2"
              >
                Create Account
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
              <button onClick={onClose} className="mt-4 text-amber-800 font-medium hover:underline">Browse Menu</button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.customizations.size} &bull; {item.customizations.milk || 'No milk'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatPrice(item.price)}</span>
                      <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600 text-xl">&times;</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Used to look up your order at pickup</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Barista will call this name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>

                {!useCustomTime && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {slots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors relative ${
                          selectedSlot?.getTime() === slot.time.getTime()
                            ? 'bg-amber-800 text-white'
                            : slot.status === 'open'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : slot.status === 'busy'
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                : 'bg-red-50 text-red-500 line-through cursor-not-allowed'
                        }`}
                        disabled={slot.status === 'full'}
                      >
                        {formatTime(slot.time)}
                        {slot.status === 'busy' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <button onClick={() => setUseCustomTime(!useCustomTime)} className="text-sm text-amber-800 hover:underline mb-2">
                  {useCustomTime ? 'Show suggested times' : 'Or enter a custom time'}
                </button>

                {useCustomTime && (
                  <input
                    type="time"
                    value={selectedSlot ? new Date(selectedSlot.getTime() - selectedSlot.getTimezoneOffset() * 60000).toISOString().slice(11, 16) : ''}
                    onChange={e => {
                      if (e.target.value) {
                        const [hours, minutes] = e.target.value.split(':')
                        const now = new Date()
                        const customTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))
                        setSelectedSlot(customTime)
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent text-center text-lg"
                  />
                )}
              </div>

              <div className="sticky bottom-0 bg-white pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-amber-800">{formatPrice(total)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 text-center">Pay at the counter when you pick up</p>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className="w-full bg-amber-800 text-white py-4 rounded-2xl font-semibold hover:bg-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacing ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}