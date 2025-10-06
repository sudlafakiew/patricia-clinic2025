'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบสินค้าสำเร็จ')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า')
    }
  }

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity)

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">สินค้าคงคลัง</h1>
            <p className="text-gray-600 mt-1">จัดการสต็อกสินค้าของคลินิก</p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มสินค้า</span>
          </button>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">แจ้งเตือนสินค้าใกล้หมด</h3>
              <p className="text-sm text-yellow-800">
                มีสินค้า {lowStockProducts.length} รายการที่ปริมาณต่ำกว่าจุดสั่งซื้อ
              </p>
              <ul className="mt-2 text-sm text-yellow-800 list-disc list-inside">
                {lowStockProducts.map(p => (
                  <li key={p.id}>{p.name} (เหลือ {p.quantity} ชิ้น)</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสสินค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อสินค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ราคาทุน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ราคาขาย</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">กำไร</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const profit = Number(product.selling_price) - Number(product.cost_price)
                const profitPercent = (profit / Number(product.cost_price)) * 100
                const isLowStock = product.quantity <= product.min_quantity

                return (
                  <tr key={product.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category && (
                        <span className="badge badge-info">{product.category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{Number(product.cost_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{Number(product.selling_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ฿{profit.toLocaleString()} ({profitPercent.toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false)
            setSelectedProduct(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}

function ProductModal({ product, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    quantity: product?.quantity || 0,
    min_quantity: product?.min_quantity || 10,
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    category: product?.category || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id)

        if (error) throw error
        toast.success('แก้ไขสินค้าสำเร็จ')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) throw error
        toast.success('เพิ่มสินค้าสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ชื่อสินค้า *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">รหัสสินค้า (SKU) *</label>
              <input
                type="text"
                className="input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">จำนวน *</label>
              <input
                type="number"
                className="input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>

            <div>
              <label className="label">จำนวนขั้นต่ำ *</label>
              <input
                type="number"
                className="input"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>

            <div>
              <label className="label">ราคาทุน (บาท) *</label>
              <input
                type="number"
                className="input"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">ราคาขาย (บาท) *</label>
              <input
                type="number"
                className="input"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">หมวดหมู่</label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="เช่น เซรั่ม, กันแดด, มาส์ก"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
