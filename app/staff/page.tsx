'use client'

import { useState } from 'react'
import CounterView from '@/components/CounterView'
import KitchenView from '@/components/KitchenView'

export default function StaffPage() {
  const [role, setRole] = useState<'counter' | 'kitchen'>('counter')

  return (
    <>
      {role === 'counter' ? (
        <CounterView onSwitchToKitchen={() => setRole('kitchen')} />
      ) : (
        <KitchenView onSwitchToCounter={() => setRole('counter')} />
      )}
    </>
  )
}