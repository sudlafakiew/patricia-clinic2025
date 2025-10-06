'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Scissors, 
  Package, 
  Receipt, 
  UserCog,
  LogOut,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'ลูกค้า (CRM)', href: '/customers' },
  { icon: Calendar, label: 'นัดหมาย', href: '/appointments' },
  { icon: Scissors, label: 'บริการ', href: '/services' },
  { icon: Package, label: 'สินค้า', href: '/products' },
  { icon: Receipt, label: 'ขายและรายงาน', href: '/sales' },
  { icon: UserCog, label: 'พนักงาน', href: '/staff' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ')
    } else {
      toast.success('ออกจากระบบสำเร็จ')
      router.push('/login')
    }
  }

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Patricia Clinic</h1>
            <p className="text-xs text-gray-500">Beauty Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  )
}
