'use client'

import { formatPrice } from '@/lib/utils'

interface MenuItemType {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  image?: string
  available: boolean
}

interface MenuCardProps {
  item: MenuItemType
  onSelect: (item: MenuItemType) => void
}

export default function MenuCard({ item, onSelect }: MenuCardProps) {
  return (
    <div 
      className={`flex items-center p-4 bg-white rounded-2xl shadow-sm transition-shadow mb-3 ${
        item.available ? 'hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={() => item.available && onSelect(item)}
    >
      <div className="w-14 h-14 bg-gray-100 rounded-xl mr-4 flex items-center justify-center overflow-hidden flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{item.category === 'Pastries' ? '🥐' : '☕'}</span>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          {!item.available && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Sold out</span>
          )}
        </div>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">{formatPrice(item.basePrice)}</p>
        {item.available && (
          <button className="text-sm text-blue-600 hover:text-blue-700">Customize</button>
        )}
      </div>
    </div>
  )
}