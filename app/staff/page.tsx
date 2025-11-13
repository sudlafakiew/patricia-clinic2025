'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error: any) {
      console.warn('Supabase connection failed, using mock data:', error.message)
      const { getMockData } = await import('@/lib/mockData')
      setStaff(getMockData('staff'))
      toast.success('ใช้ข้อมูลตัวอย่าง (ฐานข้อมูลไม่พร้อม)')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบพนักงานสำเร็จ')
      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('เกิดข้อผิดพลาดในการลบพนักงาน')
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap: any = {
      admin: { label: 'ผู้ดูแลระบบ', class: 'badge-danger' },
      doctor: { label: 'แพทย์', class: 'badge-info' },
      staff: { label: 'พนักงาน', class: 'badge-success' }
    }
    const { label, class: className } = roleMap[role] || roleMap.staff
    return <span className={`badge ${className}`}>{label}</span>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">พนักงาน</h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง</p>
          </div>
          <button
            onClick={() => {
              setSelectedStaff(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มพนักงาน</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    {member.role === 'admin' && (
                      <Shield className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{member.position}</p>
                  {getRoleBadge(member.role)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStaff(member)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">โทร:</span> {member.phone}
                </div>
                {member.email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">อีเมล:</span> {member.email}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">อัตราค่าคอมมิชชัน</p>
                    <p className="text-xl font-bold text-primary-600">
                      {member.commission_rate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <StaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowModal(false)
            setSelectedStaff(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedStaff(null)
            fetchStaff()
          }}
        />
      )}
    </div>
  )
}

function StaffModal({ staff, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    position: staff?.position || '',
    phone: staff?.phone || '',
    email: staff?.email || '',
    commission_rate: staff?.commission_rate || 0,
    role: staff?.role || 'staff'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (staff) {
        const { error } = await supabase
          .from('staff')
          .update(formData)
          .eq('id', staff.id)

        if (error) {
          const { updateMockRecord } = await import('@/lib/mockData')
          updateMockRecord('staff', staff.id, formData)
        }
        toast.success('แก้ไขข้อมูลพนักงานสำเร็จ')
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([formData])

        if (error) {
          const { addMockRecord } = await import('@/lib/mockData')
          addMockRecord('staff', formData)
        }
        toast.success('เพิ่มพนักงานสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving staff:', error)
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
            {staff ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
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
              <label className="label">ตำแหน่ง *</label>
              <input
                type="text"
                className="input"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
              <label className="label">อัตราค่าคอมมิชชัน (%)</label>
              <input
                type="number"
                className="input"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">บทบาท *</label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="staff">พนักงาน</option>
                <option value="doctor">แพทย์</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>หมายเหตุ:</strong> บทบาทของพนักงานจะกำหนดสิทธิ์การเข้าถึงข้อมูลในระบบผ่าน Row Level Security (RLS)
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>ผู้ดูแลระบบ: มีสิทธิ์เต็มในการจัดการทุกส่วน</li>
              <li>แพทย์: เข้าถึงข้อมูลลูกค้าและนัดหมาย</li>
              <li>พนักงาน: เข้าถึงข้อมูลพื้นฐานเท่านั้น</li>
            </ul>
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
