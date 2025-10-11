'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Package as PackageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลบริการ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบริการนี้?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบบริการสำเร็จ')
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('เกิดข้อผิดพลาดในการลบบริการ')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">บริการและคอร์ส</h1>
            <p className="text-gray-600 mt-1">จัดการบริการและแพ็กเกจของคลินิก</p>
          </div>
          <button
            onClick={() => {
              setSelectedService(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มบริการ</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    {service.is_package && (
                      <PackageIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  {service.category && (
                    <span className="badge badge-info text-xs">{service.category}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedService(service)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">ราคา</p>
                    <p className="text-xl font-bold text-primary-600">
                      ฿{Number(service.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">ระยะเวลา</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {service.duration_minutes} นาที
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ServiceModal
          service={selectedService}
          onClose={() => {
            setShowModal(false)
            setSelectedService(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedService(null)
            fetchServices()
          }}
        />
      )}
    </div>
  )
}

function ServiceModal({ service, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 30,
    category: service?.category || '',
    is_package: service?.is_package || false
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (service) {
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', service.id)

        if (error) throw error
        toast.success('แก้ไขบริการสำเร็จ')
      } else {
        const { error } = await supabase
          .from('services')
          .insert([formData])

        if (error) throw error
        toast.success('เพิ่มบริการสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving service:', error)
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
            {service ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ชื่อบริการ *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">หมวดหมู่</label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="เช่น ฉีด, เลเซอร์"
              />
            </div>

            <div>
              <label className="label">ราคา (บาท) *</label>
              <input
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">ระยะเวลา (นาที) *</label>
              <input
                type="number"
                className="input"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                required
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">รายละเอียด</label>
              <textarea
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_package}
                  onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">เป็นแพ็กเกจ/คอร์ส</span>
              </label>
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
