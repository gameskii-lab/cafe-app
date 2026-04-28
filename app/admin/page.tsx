'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: 'Espresso',
    image: '',
    available: true,
    // Simple toggles instead of JSON
    hasSizes: true,
    hasMilk: true,
    hasSweetness: true,
    hasTemperature: true,
    hasExtras: true
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/admin/menu')
    const data = await res.json()
    setItems(data)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setForm(prev => ({ ...prev, image: data.url }))
      toast.success('Image uploaded!')
    } catch (error) {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  const buildOptions = () => {
    const options: any = {}
    if (form.hasSizes) options.sizes = ['8oz', '12oz', '16oz']
    if (form.hasMilk) options.milk = ['Whole', 'Oat', 'Almond', 'Soy']
    if (form.hasSweetness) options.sweetness = ['None', 'Light', 'Medium', 'Sweet']
    if (form.hasTemperature) options.temperature = ['Hot', 'Iced']
    if (form.hasExtras) options.extras = ['Extra Shot (+$0.50)', 'Vanilla (+$0.50)', 'Caramel (+$0.50)', 'Whipped Cream (+$0.50)']
    return JSON.stringify(options)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePrice) {
      toast.error('Name and price are required')
      return
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        basePrice: parseFloat(form.basePrice),
        category: form.category,
        image: form.image,
        available: form.available,
        options: buildOptions()
      }

      if (editing) {
        await fetch(`/api/admin/menu/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        toast.success('Item updated!')
      } else {
        await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        toast.success('Item added!')
      }

      setShowForm(false)
      setEditing(null)
      resetForm()
      fetchItems()
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  const handleEdit = (item: any) => {
    const options = JSON.parse(item.options)
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice.toString(),
      category: item.category,
      image: item.image || '',
      available: item.available,
      hasSizes: !!options.sizes,
      hasMilk: !!options.milk,
      hasSweetness: !!options.sweetness,
      hasTemperature: !!options.temperature,
      hasExtras: !!options.extras
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item permanently?')) return
    await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
    toast.success('Item deleted')
    fetchItems()
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      basePrice: '',
      category: 'Espresso',
      image: '',
      available: true,
      hasSizes: true,
      hasMilk: true,
      hasSweetness: true,
      hasTemperature: true,
      hasExtras: true
    })
  }

  const categories = [...new Set(items.map((i: any) => i.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 Menu Manager</h1>
            <p className="text-sm text-gray-500">Manage your cafe listings</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900 py-2">🏪 Store</a>
            <a href="/staff" className="text-sm text-gray-600 hover:text-gray-900 py-2">☕ Staff</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Button */}
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm() }}
          className="w-full mb-6 bg-amber-800 text-white py-4 rounded-2xl font-semibold hover:bg-amber-900 transition-colors text-lg"
        >
          + Add New Item
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-6">
              {editing ? `✏️ Edit: ${editing.name}` : '🆕 New Menu Item'}
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  placeholder="e.g. Iced Latte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-white"
                >
                  <option>Espresso</option>
                  <option>Filter</option>
                  <option>Cold Brew</option>
                  <option>Tea</option>
                  <option>Pastries</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800"
                placeholder="e.g. Smooth espresso with steamed milk"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.basePrice}
                  onChange={e => setForm(prev => ({ ...prev, basePrice: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  placeholder="4.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-center text-sm text-gray-500 hover:border-amber-800 hover:text-amber-800 cursor-pointer transition-colors">
                      {uploading ? '⏳ Uploading...' : form.image ? '✅ Change photo' : '📷 Upload photo'}
                    </div>
                  </label>
                  {form.image && (
                    <img src={form.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={e => setForm(prev => ({ ...prev, available: e.target.checked }))}
                  className="w-5 h-5 rounded accent-amber-800"
                />
                <span className="text-sm font-medium text-gray-700">Available for ordering</span>
              </label>
            </div>

            {/* Customization Toggles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Customization Options
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasSizes}
                    onChange={e => setForm(prev => ({ ...prev, hasSizes: e.target.checked }))}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-gray-700">Size options</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasMilk}
                    onChange={e => setForm(prev => ({ ...prev, hasMilk: e.target.checked }))}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-gray-700">Milk choices</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasSweetness}
                    onChange={e => setForm(prev => ({ ...prev, hasSweetness: e.target.checked }))}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-gray-700">Sweetness level</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasTemperature}
                    onChange={e => setForm(prev => ({ ...prev, hasTemperature: e.target.checked }))}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-gray-700">Hot / Iced</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasExtras}
                    onChange={e => setForm(prev => ({ ...prev, hasExtras: e.target.checked }))}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-gray-700">Extra shots & syrups</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-amber-800 text-white py-3 rounded-xl font-semibold hover:bg-amber-900 transition-colors"
              >
                {editing ? '💾 Update Item' : '✅ Add Item'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menu List */}
        {categories.map(category => {
          const categoryItems = items.filter((i: any) => i.category === category)
          if (categoryItems.length === 0) return null

          return (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>{category === 'Espresso' ? '☕' : category === 'Pastries' ? '🥐' : category === 'Tea' ? '🍵' : category === 'Cold Brew' ? '🧊' : '📋'}</span>
                {category}
                <span className="text-sm text-gray-400 font-normal">({categoryItems.length})</span>
              </h3>
              <div className="space-y-2">
                {categoryItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex items-center bg-white p-4 rounded-xl shadow-sm border ${
                      item.available ? 'border-gray-100' : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    {/* Image */}
                    <div className="w-14 h-14 bg-gray-100 rounded-xl mr-4 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">
                          {item.category === 'Pastries' ? '🥐' : '☕'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        {!item.available && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex-shrink-0">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <p className="font-semibold text-gray-900">{formatPrice(item.basePrice)}</p>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-gray-400 text-lg mb-2">No menu items yet</p>
            <p className="text-gray-400 text-sm">Click "Add New Item" to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}