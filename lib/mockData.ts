// Mock data for development/testing when Supabase is unavailable
// Using in-memory storage so changes persist during the session
let mockDataStore = {
  customers: [
    {
      id: '1',
      name: 'สมชาย สิมะลี',
      phone: '081-234-5678',
      email: 'somchai@example.com',
      address: 'กรุงเทพมหานคร',
      total_spent: 15000,
      membership_tier: 'silver',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'สิรินทร์ วรรณสวาท',
      phone: '089-876-5432',
      email: 'sirintra@example.com',
      address: 'เชียงใหม่',
      total_spent: 25000,
      membership_tier: 'gold',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  staff: [
    {
      id: '1',
      name: 'นางสาวจิตรา ศรีสุข',
      position: 'beautician',
      phone: '081-111-1111',
      email: 'chitra@patricia.com',
      specialization: 'facial_treatment',
      status: 'active',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'นายศิวพร สกุณะ',
      position: 'therapist',
      phone: '089-222-2222',
      email: 'shivorn@patricia.com',
      specialization: 'massage_therapy',
      status: 'active',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  services: [
    {
      id: '1',
      name: 'ฟেเชียลบำรุง',
      description: 'บำรุงหน้าด้วยสินค้าพรีเมียม',
      price: 1500,
      duration_minutes: 60,
      category: 'facial',
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'นวดผ่อนคลาย',
      description: 'นวดผ่อนคลายกล้ามเนื้อทั้งตัว',
      price: 1200,
      duration_minutes: 90,
      category: 'massage',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ],
  products: [
    {
      id: '1',
      name: 'โลชั่นบำรุงผิว',
      category: 'lotion',
      price: 450,
      stock: 50,
      unit: 'bottle',
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'มาส์กหน้า',
      category: 'mask',
      price: 350,
      stock: 80,
      unit: 'pack',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ],
  appointments: [
    {
      id: '1',
      customer_id: '1',
      staff_id: '1',
      service_id: '1',
      appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      appointment_time: '10:00',
      status: 'confirmed',
      notes: 'ลูกค้าต้องการฟอกหน้า',
      created_at: new Date().toISOString(),
    },
  ],
  sales: [
    {
      id: '1',
      customer_id: '1',
      staff_id: '1',
      total_amount: 2500,
      payment_method: 'cash',
      status: 'completed',
      sale_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

export const getMockData = (table: string) => {
  return (mockDataStore as any)[table] ? JSON.parse(JSON.stringify((mockDataStore as any)[table])) : []
}

export const addMockRecord = (table: string, data: any) => {
  const records = (mockDataStore as any)[table]
  if (!records) return null
  
  const newRecord = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  records.push(newRecord)
  return newRecord
}

export const updateMockRecord = (table: string, id: string, data: any) => {
  const records = (mockDataStore as any)[table]
  if (!records) return null
  
  const index = records.findIndex((r: any) => r.id === id)
  if (index === -1) return null
  
  records[index] = {
    ...records[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return records[index]
}

export const deleteMockRecord = (table: string, id: string) => {
  const records = (mockDataStore as any)[table]
  if (!records) return null
  
  const index = records.findIndex((r: any) => r.id === id)
  if (index === -1) return null
  
  records.splice(index, 1)
  return true
}
