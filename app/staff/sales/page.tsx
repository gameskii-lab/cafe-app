'use client'

import { useEffect, useState } from 'react'
import { formatTime, formatPrice } from '@/lib/utils'

export default function SalesPage() {
  const [shifts, setShifts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/shift/history')
      .then(res => res.json())
      .then(data => setShifts(data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-3">
        <a href="/staff" className="text-gray-300 text-sm hover:text-white">← Back</a>
        <h1 className="text-white font-semibold">Sales History</h1>
      </div>

      <div className="p-4 space-y-4">
        {shifts.map((shift: any) => (
          <div key={shift.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-white font-medium">
                  {new Date(shift.openedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-gray-400 text-xs">
                  {formatTime(new Date(shift.openedAt))} — {shift.closedAt ? formatTime(new Date(shift.closedAt)) : 'Open'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                shift.status === 'open' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300'
              }`}>
                {shift.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-gray-500 text-xs">Expected</p>
                <p className="text-white font-bold">{formatPrice(shift.expectedCash || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Actual</p>
                <p className="text-white font-bold">{formatPrice(shift.actualCash || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Diff</p>
                <p className={`font-bold ${(shift.difference || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {shift.difference != null ? formatPrice(shift.difference) : '—'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {shifts.length === 0 && (
          <p className="text-gray-500 text-center py-12">No shifts recorded yet</p>
        )}
      </div>
    </div>
  )
}