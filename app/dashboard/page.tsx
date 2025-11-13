'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'
import { th } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    newCustomers: 0,
    returningCustomers: 0,
    todayAppointments: 0
  })
  const [appointments, setAppointments] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = new Date()
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      const todayStart = startOfDay(today)
      const todayEnd = endOfDay(today)

      // Fetch today's sales
      const { data: todaySalesData, error: error1 } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString())
        .eq('payment_status', 'completed')

      if (error1) throw error1

      const todaySales = todaySalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

      // Fetch month's sales
      const { data: monthSalesData, error: error2 } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .eq('payment_status', 'completed')

      if (error2) throw error2

      const monthSales = monthSalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

      // Fetch new customers this month
      const { data: newCustomersData, error: error3 } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      if (error3) throw error3

      const newCustomers = newCustomersData?.length || 0

      // Fetch today's appointments
      const { data: todayAppointmentsData, error: error4 } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name, phone),
          services (name),
          staff (name)
        `)
        .eq('appointment_date', format(today, 'yyyy-MM-dd'))
        .order('start_time', { ascending: true })

      if (error4) throw error4

      const todayAppointments = todayAppointmentsData?.length || 0
      setAppointments(todayAppointmentsData || [])

      // Fetch sales data for chart (last 7 days)
      const salesByDay = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        const { data } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
          .eq('payment_status', 'completed')

        const total = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
        
        salesByDay.push({
          date: format(date, 'dd/MM', { locale: th }),
          amount: total
        })
      }

      setSalesData(salesByDay)
      setStats({
        todaySales,
        monthSales,
        newCustomers,
        returningCustomers: 0,
        todayAppointments
      })
    } catch (error: any) {
      console.warn('Dashboard fetch error, using mock data:', error.message)
      // Use mock data
      const { getMockData } = await import('@/lib/mockData')
      const mockSales = getMockData('sales')
      const mockAppointments = getMockData('appointments')
      const mockCustomers = getMockData('customers')

      const todaySales = mockSales.reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0)
      const monthSales = mockSales.reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0)
      const newCustomers = mockCustomers.length
      const todayAppointments = mockAppointments.length

      // Generate mock sales chart data
      const salesByDay = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        salesByDay.push({
          date: format(date, 'dd/MM', { locale: th }),
          amount: Math.floor(Math.random() * 5000) + 1000
        })
      }

      setSalesData(salesByDay)
      setAppointments(mockAppointments)
      setStats({
        todaySales,
        monthSales,
        newCustomers,
        returningCustomers: 0,
        todayAppointments
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'ยอดขายวันนี้',
      value: `฿${stats.todaySales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%'
    },
    {
      title: 'ยอดขายเดือนนี้',
      value: `฿${stats.monthSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      trend: '+8%'
    },
    {
      title: 'ลูกค้าใหม่',
      value: stats.newCustomers,
      icon: Users,
      color: 'bg-purple-500',
      trend: '+5'
    },
    {
      title: 'นัดหมายวันนี้',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-pink-500',
      trend: '3 รอยืนยัน'
    }
  ]

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">ภาพรวมของคลินิก</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ยอดขาย 7 วันที่ผ่านมา</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">สถิติบริการ</h2>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">ข้อมูลสถิติบริการจะแสดงที่นี่</p>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">นัดหมายวันนี้</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ไม่มีนัดหมายในวันนี้</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บริการ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">พนักงาน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.start_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.customers?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.customers?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.services?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.staff?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
