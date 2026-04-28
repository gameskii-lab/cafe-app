'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { useOrder } from '@/context/OrderContext'
import toast from 'react-hot-toast'

interface MenuItemType {
  id: string
  name: string
  basePrice: number
  options: string
}

interface CustomizationPanelProps {
  item: MenuItemType
  onClose: () => void
}

export default function CustomizationPanel({ item, onClose }: CustomizationPanelProps) {
  const { addToCart } = useOrder()
  const options = JSON.parse(item.options)
  const [selected, setSelected] = useState<Record<string, string>>({
    size: options.sizes?.[0] || 'Regular',
    milk: options.milk?.[0] || 'None',
    sweetness: options.sweetness?.[0] || 'None',
    temperature: options.temperature?.[0] || 'Hot',
  })
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const calculatePrice = () => {
    let price = item.basePrice
    selectedExtras.forEach(extra => {
      const match = extra.match(/\+\$(\d+\.?\d*)/)
      if (match) price += parseFloat(match[1])
    })
    return price
  }

  const handleAddToCart = () => {
    addToCart({
      menuItemId: item.id,
      name: item.name,
      quantity: 1,
      price: calculatePrice(),
      customizations: {
        ...selected,
        extras: selectedExtras
      }
    })
    toast.success(`Added ${item.name} to cart`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          {options.sizes && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="flex gap-2">
                {options.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelected(prev => ({ ...prev, size }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selected.size === size
                        ? 'bg-amber-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.milk && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Milk</label>
              <div className="flex flex-wrap gap-2">
                {options.milk.map((milk: string) => (
                  <button
                    key={milk}
                    onClick={() => setSelected(prev => ({ ...prev, milk }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selected.milk === milk
                        ? 'bg-amber-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {milk}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.sweetness && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sweetness</label>
              <div className="flex gap-2">
                {options.sweetness.map((level: string) => (
                  <button
                    key={level}
                    onClick={() => setSelected(prev => ({ ...prev, sweetness: level }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selected.sweetness === level
                        ? 'bg-amber-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.temperature && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
              <div className="flex gap-2">
                {options.temperature.map((temp: string) => (
                  <button
                    key={temp}
                    onClick={() => setSelected(prev => ({ ...prev, temperature: temp }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selected.temperature === temp
                        ? 'bg-amber-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.extras && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Extras</label>
              <div className="flex flex-wrap gap-2">
                {options.extras.map((extra: string) => (
                  <button
                    key={extra}
                    onClick={() => {
                      setSelectedExtras(prev =>
                        prev.includes(extra)
                          ? prev.filter(e => e !== extra)
                          : [...prev, extra]
                      )
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedExtras.includes(extra)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {extra}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <button
              onClick={handleAddToCart}
              className="w-full bg-amber-800 text-white py-4 rounded-2xl font-semibold hover:bg-amber-900 transition-colors"
            >
              Add to Order - {formatPrice(calculatePrice())}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}