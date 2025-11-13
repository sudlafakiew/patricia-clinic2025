'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Edit, Trash2, Gift, Calendar as CalendarIcon, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // Try to fetch from Supabase, fall back to mock data if unavailable
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      
      setCustomers(data || [])
    } catch (error: any) {
      console.warn('Supabase connection failed, using mock data:', error.message)
      // Import and use mock data
      const { getMockData } = await import('@/lib/mockData')
      setCustomers(getMockData('customers'))
      toast.success('ใช้ข้อมูลตัวอย่าง (ฐานข้อมูลไม่พร้อม)')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้ารายนี้?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบลูกค้าสำเร็จ')
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('เกิดข้อผิดพลาดในการลบลูกค้า')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ลูกค้า (CRM)</h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลลูกค้าและประวัติการใช้บริการ</p>
          </div>
          <button
            onClick={() => {
              setSelectedCustomer(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มลูกค้าใหม่</span>
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาลูกค้า (ชื่อ, เบอร์โทร, อีเมล)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {customer.birth_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>วันเกิด: {format(new Date(customer.birth_date), 'dd MMMM yyyy', { locale: th })}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Gift className="w-4 h-4 mr-2" />
                  <span>แต้มสะสม: {customer.loyalty_points} แต้ม</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">ยอดซื้อสะสม</p>
                    <p className="text-lg font-semibold text-primary-600">
                      ฿{Number(customer.total_spent).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowDetailModal(true)
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowModal(false)
            setSelectedCustomer(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedCustomer(null)
            fetchCustomers()
          }}
        />
      )}

      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCustomer(null)
          }}
        />
      )}
    </div>
  )
}

function CustomerModal({ customer, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    birth_date: customer?.birth_date || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
    loyalty_points: customer?.loyalty_points || 0
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', customer.id)

        if (error) throw error
        toast.success('แก้ไขข้อมูลลูกค้าสำเร็จ')
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([formData])

        if (error) throw error
        toast.success('เพิ่มลูกค้าสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">อีเมล</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label">วันเกิด</label>
              <input
                type="date"
                className="input"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">ที่อยู่</label>
              <textarea
                className="input"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">หมายเหตุ</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div>
              <label className="label">แต้มสะสม</label>
              <input
                type="number"
                className="input"
                value={formData.loyalty_points}
                onChange={(e) => setFormData({ ...formData, loyalty_points: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CustomerDetailModal({ customer, onClose }: any) {
  const [treatments, setTreatments] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerDetails()
  }, [])

  const fetchCustomerDetails = async () => {
    try {
      // Fetch treatments
      const { data: treatmentsData } = await supabase
        .from('treatments')
        .select(`
          *,
          services (name),
          staff (name)
        `)
        .eq('customer_id', customer.id)
        .order('treatment_date', { ascending: false })

      setTreatments(treatmentsData || [])

      // Fetch sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      setSales(salesData || [])
    } catch (error) {
      console.error('Error fetching customer details:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">ประวัติลูกค้า: {customer.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Treatment History */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการรักษา</h3>
            {loading ? (
              <p className="text-gray-500">กำลังโหลด...</p>
            ) : treatments.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีประวัติการรักษา</p>
            ) : (
              <div className="space-y-4">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{treatment.services?.name}</p>
                        <p className="text-sm text-gray-600">แพทย์/พนักงาน: {treatment.staff?.name}</p>
                        <p className="text-sm text-gray-600">
                          วันที่: {format(new Date(treatment.treatment_date), 'dd MMMM yyyy HH:mm', { locale: th })}
                        </p>
                        {treatment.notes && (
                          <p className="text-sm text-gray-600 mt-2">หมายเหตุ: {treatment.notes}</p>
                        )}
                      </div>
                      {(treatment.before_image_url || treatment.after_image_url) && (
                        <div className="flex space-x-2">
                          {treatment.before_image_url && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Before</p>
                              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                <Image className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                          )}
                          {treatment.after_image_url && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">After</p>
                              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                <Image className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sales History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการสั่งซื้อ</h3>
            {sales.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</p>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">฿{Number(sale.total_amount).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(sale.created_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                        </p>
                      </div>
                      <span className={`badge ${
                        sale.payment_status === 'completed' ? 'badge-success' : 
                        sale.payment_status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {sale.payment_status === 'completed' ? 'ชำระแล้ว' :
                         sale.payment_status === 'pending' ? 'รอชำระ' : 'คืนเงิน'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
