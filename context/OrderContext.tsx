'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  customizations: Record<string, any>
}

interface OrderContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
  currentOrderId: string | null
  setCurrentOrderId: (id: string | null) => void
  orderPhone: string
  setOrderPhone: (phone: string) => void
  orderStatus: string | null
  setOrderStatus: (status: string | null) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [orderPhone, setOrderPhone] = useState('')
  const [orderStatus, setOrderStatus] = useState<string | null>(null)

  // Persist order ID to localStorage
  useEffect(() => {
    if (currentOrderId) {
      localStorage.setItem('brewgo_orderId', currentOrderId)
      localStorage.setItem('brewgo_phone', orderPhone)
    }
  }, [currentOrderId, orderPhone])

  // Restore from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('brewgo_orderId')
    const savedPhone = localStorage.getItem('brewgo_phone')
    if (savedId) {
      // Verify order is still active
      fetch(`/api/orders/${savedId}`)
        .then(res => res.json())
        .then(order => {
          if (order.status && order.status !== 'completed') {
            setCurrentOrderId(savedId)
            if (savedPhone) setOrderPhone(savedPhone)
          } else {
            localStorage.removeItem('brewgo_orderId')
            localStorage.removeItem('brewgo_phone')
          }
        })
        .catch(() => {
          localStorage.removeItem('brewgo_orderId')
          localStorage.removeItem('brewgo_phone')
        })
    }
  }, [])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => [...prev, item])
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  return (
    <OrderContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      currentOrderId,
      setCurrentOrderId,
      orderPhone,
      setOrderPhone,
      orderStatus,
      setOrderStatus,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}