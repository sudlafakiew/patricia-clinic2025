'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Receipt as ReceiptIcon, Download, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { th } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchSales()
  }, [dateRange])

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name, phone),
          staff (name, commission_rate)
        `)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const salesData = data || []
      setSales(salesData)

      // Calculate stats
      const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      const completedSales = salesData.filter(s => s.payment_status === 'completed')
      const totalCompleted = completedSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      
      // Calculate commission
      const commissionData = salesData.reduce((acc: any, sale) => {
        const staffName = sale.staff?.name || 'Unknown'
        const commission = (Number(sale.total_amount) * (sale.staff?.commission_rate || 0)) / 100
        
        if (!acc[staffName]) {
          acc[staffName] = { name: staffName, total: 0, commission: 0 }
        }
        acc[staffName].total += Number(sale.total_amount)
        acc[staffName].commission += commission
        
        return acc
      }, {})

      setStats({
        totalSales,
        totalCompleted,
        salesCount: salesData.length,
        commissionData: Object.values(commissionData)
      })
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลการขาย')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      pending: { label: 'รอชำระ', class: 'badge-warning' },
      completed: { label: 'ชำระแล้ว', class: 'badge-success' },
      refunded: { label: 'คืนเงิน', class: 'badge-danger' }
    }
    const { label, class: className } = statusMap[status] || statusMap.pending
    return <span className={`badge ${className}`}>{label}</span>
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: any = {
      cash: 'เงินสด',
      credit_card: 'บัตรเครดิต',
      transfer: 'โอนเงิน'
    }
    return methodMap[method] || method
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบิลขายนี้?')) return

    try {
      // Delete sale items first
      await supabase.from('sale_items').delete().eq('sale_id', id)
      
      // Then delete the sale
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบบิลขายสำเร็จ')
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast.error('เกิดข้อผิดพลาดในการลบบิลขาย')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ขายและรายงาน</h1>
            <p className="text-gray-600 mt-1">จัดการการขายและดูรายงานยอดขาย</p>
          </div>
          <button
            onClick={() => {
              setSelectedSale(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>สร้างบิลขาย</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <input
              type="date"
              className="input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-gray-500">ถึง</span>
            <input
              type="date"
              className="input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <button
            onClick={fetchSales}
            className="btn btn-primary"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">ยอดขายทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900">฿{(stats.totalSales || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.salesCount || 0} บิล</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">ยอดชำระแล้ว</p>
          <p className="text-3xl font-bold text-green-600">฿{(stats.totalCompleted || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">รอชำระ</p>
          <p className="text-3xl font-bold text-yellow-600">
            ฿{((stats.totalSales || 0) - (stats.totalCompleted || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ยอดขายและค่าคอมมิชชันพนักงาน</h2>
          {stats.commissionData && stats.commissionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.commissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#ec4899" name="ยอดขาย" />
                <Bar dataKey="commission" fill="#14b8a6" name="คอมมิชชัน" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดค่าคอมมิชชัน</h2>
          {stats.commissionData && stats.commissionData.length > 0 ? (
            <div className="space-y-3">
              {stats.commissionData.map((staff: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    <span className="badge badge-success">
                      ฿{staff.commission.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ยอดขายรวม: ฿{staff.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">รายการขาย</h2>
          </div>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">พนักงาน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดรวม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ช่องทางชำระ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.customers?.name}</div>
                    <div className="text-sm text-gray-500">{sale.customers?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.staff?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ฿{Number(sale.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPaymentMethodLabel(sale.payment_method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.payment_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSale(sale)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SaleModal
          sale={selectedSale}
          onClose={() => {
            setShowModal(false)
            setSelectedSale(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedSale(null)
            fetchSales()
          }}
        />
      )}
    </div>
  )
}

function SaleModal({ sale, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    customer_id: sale?.customer_id || '',
    staff_id: sale?.staff_id || '',
    payment_method: sale?.payment_method || 'cash' as 'cash' | 'credit_card' | 'transfer',
    payment_status: sale?.payment_status || 'completed' as 'pending' | 'completed' | 'refunded',
    notes: sale?.notes || ''
  })
  const [items, setItems] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [customersRes, staffRes, servicesRes, productsRes] = await Promise.all([
      supabase.from('customers').select('id, name').order('name'),
      supabase.from('staff').select('id, name').order('name'),
      supabase.from('services').select('id, name, price').order('name'),
      supabase.from('products').select('id, name, selling_price').order('name')
    ])

    setCustomers(customersRes.data || [])
    setStaff(staffRes.data || [])
    setServices(servicesRes.data || [])
    setProducts(productsRes.data || [])

    // If editing, load existing sale items
    if (sale) {
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id)

      if (saleItems) {
        const itemsWithNames = saleItems.map((item: any) => ({
          ...item,
          name: item.item_type === 'service'
            ? servicesRes.data?.find(s => s.id === item.item_id)?.name || 'Unknown'
            : productsRes.data?.find(p => p.id === item.item_id)?.name || 'Unknown'
        }))
        setItems(itemsWithNames)
      }
    }
  }

  const addItem = (type: 'service' | 'product', id: string) => {
    const item = type === 'service'
      ? services.find(s => s.id === id)
      : products.find(p => p.id === id)

    if (item) {
      setItems([...items, {
        item_type: type,
        item_id: id,
        name: item.name,
        quantity: 1,
        unit_price: type === 'service' ? item.price : item.selling_price,
        subtotal: type === 'service' ? item.price : item.selling_price
      }])
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    newItems[index].subtotal = quantity * newItems[index].unit_price
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('กรุณาเพิ่มรายการสินค้าหรือบริการ')
      return
    }

    setSaving(true)

    try {
      if (sale) {
        // Update existing sale
        const { error: updateError } = await supabase
          .from('sales')
          .update({
            ...formData,
            total_amount: totalAmount
          })
          .eq('id', sale.id)

        if (updateError) throw updateError

        // Delete old items and create new ones
        await supabase.from('sale_items').delete().eq('sale_id', sale.id)

        const saleItems = items.map(item => ({
          sale_id: sale.id,
          item_type: item.item_type,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) throw itemsError
        toast.success('อัพเดทบิลขายสำเร็จ')
      } else {
        // Create new sale
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert([{
            ...formData,
            total_amount: totalAmount
          }])
          .select()
          .single()

        if (saleError) throw saleError

        // Create sale items
        const saleItems = items.map(item => ({
          sale_id: saleData.id,
          item_type: item.item_type,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) throw itemsError
        toast.success('สร้างบิลขายสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving sale:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกบิลขาย')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {sale ? 'แก้ไขบิลขาย' : 'สร้างบิลขายใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ลูกค้า *</label>
              <select
                className="input"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                <option value="">เลือกลูกค้า</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">พนักงาน *</label>
              <select
                className="input"
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                required
              >
                <option value="">เลือกพนักงาน</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">ช่องทางชำระเงิน *</label>
              <select
                className="input"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                required
              >
                <option value="cash">เงินสด</option>
                <option value="credit_card">บัตรเครดิต</option>
                <option value="transfer">โอนเงิน</option>
              </select>
            </div>

            <div>
              <label className="label">สถานะการชำระ *</label>
              <select
                className="input"
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                required
              >
                <option value="pending">รอชำระ</option>
                <option value="completed">ชำระแล้ว</option>
              </select>
            </div>
          </div>

          {/* Add Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">เพิ่มรายการ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">เพิ่มบริการ</label>
                <select
                  className="input"
                  onChange={(e) => {
                    if (e.target.value) {
                      addItem('service', e.target.value)
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="">เลือกบริการ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ฿{Number(service.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">เพิ่มสินค้า</label>
                <select
                  className="input"
                  onChange={(e) => {
                    if (e.target.value) {
                      addItem('product', e.target.value)
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="">เลือกสินค้า</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ฿{Number(product.selling_price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ราคา</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">รวม</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {item.item_type === 'service' ? 'บริการ' : 'สินค้า'}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ฿{item.unit_price.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                          ฿{item.subtotal.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right font-semibold text-gray-900">
                        ยอดรวมทั้งหมด:
                      </td>
                      <td className="px-4 py-2 text-lg font-bold text-primary-600">
                        ฿{totalAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="label">หมายเหตุ</label>
            <textarea
              className="input"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : sale ? 'อัพเดทบิลขาย' : 'สร้างบิลขาย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
