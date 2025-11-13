'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { Plus, Calendar as CalendarIcon, Clock, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { th } from 'date-fns/locale'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customers (name, phone),
          services (name, duration_minutes),
          staff (name)
        `)
        .order('start_time', { ascending: true })

      if (viewMode === 'day') {
        query = query.eq('appointment_date', format(selectedDate, 'yyyy-MM-dd'))
      } else {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
        query = query
          .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
          .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'))
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error: any) {
      console.warn('Supabase connection failed, using mock data:', error.message)
      const { getMockData } = await import('@/lib/mockData')
      setAppointments(getMockData('appointments'))
      toast.success('ใช้ข้อมูลตัวอย่าง (ฐานข้อมูลไม่พร้อม)')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      pending: { label: 'รอยืนยัน', class: 'badge-warning' },
      confirmed: { label: 'ยืนยันแล้ว', class: 'badge-success' },
      cancelled: { label: 'ยกเลิก', class: 'badge-danger' },
      completed: { label: 'เสร็จสิ้น', class: 'badge-info' }
    }
    const { label, class: className } = statusMap[status] || statusMap.pending
    return <span className={`badge ${className}`}>{label}</span>
  }

  const updateStatus = async (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(
          { status } as Database['public']['Tables']['appointments']['Update']
        )
        .eq('id', id)

      if (error) throw error
      toast.success('อัพเดทสถานะสำเร็จ')
      fetchAppointments()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัพเดทสถานะ')
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบนัดหมายนี้?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ลบนัดหมายสำเร็จ')
      fetchAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('เกิดข้อผิดพลาดในการลบนัดหมาย')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">นัดหมาย</h1>
            <p className="text-gray-600 mt-1">จัดการตารางนัดหมายของคลินิก</p>
          </div>
          <button
            onClick={() => {
              setSelectedAppointment(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>สร้างนัดหมาย</span>
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="btn btn-secondary"
            >
              ←
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: th })}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="btn btn-secondary"
            >
              →
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="btn btn-secondary"
            >
              วันนี้
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('day')}
              className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            >
              รายวัน
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            >
              รายสัปดาห์
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ไม่มีนัดหมายในวันนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center text-primary-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-semibold">
                        {appointment.start_time} - {appointment.end_time}
                      </span>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ลูกค้า</p>
                      <p className="font-medium text-gray-900">{appointment.customers?.name}</p>
                      <p className="text-sm text-gray-600">{appointment.customers?.phone}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">บริการ</p>
                      <p className="font-medium text-gray-900">{appointment.services?.name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.services?.duration_minutes} นาที
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">พนักงาน</p>
                      <p className="font-medium text-gray-900">{appointment.staff?.name}</p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'confirmed')}
                      className="btn btn-primary text-sm"
                    >
                      ยืนยัน
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'completed')}
                      className="btn btn-primary text-sm"
                    >
                      เสร็จสิ้น
                    </button>
                  )}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'cancelled')}
                      className="btn btn-danger text-sm"
                    >
                      ยกเลิก
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false)
            setSelectedAppointment(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedAppointment(null)
            fetchAppointments()
          }}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

function AppointmentModal({ appointment, onClose, onSave, selectedDate }: any) {
  const [formData, setFormData] = useState({
    customer_id: appointment?.customer_id || '',
    service_id: appointment?.service_id || '',
    staff_id: appointment?.staff_id || '',
    appointment_date: appointment?.appointment_date || format(selectedDate, 'yyyy-MM-dd'),
    start_time: appointment?.start_time || '09:00',
    end_time: appointment?.end_time || '10:00',
    notes: appointment?.notes || ''
  })
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [customersRes, servicesRes, staffRes] = await Promise.all([
      supabase.from('customers').select('id, name').order('name'),
      supabase.from('services').select('id, name, duration_minutes').order('name'),
      supabase.from('staff').select('id, name').order('name')
    ])

    setCustomers(customersRes.data || [])
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      const [hours, minutes] = formData.start_time.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(hours)
      endDate.setMinutes(minutes + service.duration_minutes)
      
      setFormData({
        ...formData,
        service_id: serviceId,
        end_time: format(endDate, 'HH:mm')
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (appointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', appointment.id)

        if (error) throw error
        toast.success('อัพเดทนัดหมายสำเร็จ')
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert([formData])

        if (error) throw error
        toast.success('สร้างนัดหมายสำเร็จ')
      }
      onSave()
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกนัดหมาย')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {appointment ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">บริการ *</label>
              <select
                className="input"
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
              >
                <option value="">เลือกบริการ</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} นาที)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">พนักงาน/แพทย์ *</label>
              <select
                className="input"
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                required
              >
                <option value="">เลือกพนักงาน</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">วันที่ *</label>
              <input
                type="date"
                className="input"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">เวลาเริ่ม *</label>
              <input
                type="time"
                className="input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">เวลาสิ้นสุด *</label>
              <input
                type="time"
                className="input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
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
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : appointment ? 'อัพเดทนัดหมาย' : 'สร้างนัดหมาย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
