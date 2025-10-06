# Patricia Clinic - System Architecture
## สถาปัตยกรรมระบบจัดการคลินิกเสริมความงาม

---

## 📋 ภาพรวมระบบ (System Overview)

Patricia Clinic เป็นระบบจัดการคลินิกเสริมความงามแบบครบวงจร (Full-Stack Beauty Clinic Management System) ที่ออกแบบมาเพื่อให้การบริหารจัดการคลินิกเป็นไปอย่างมีประสิทธิภาพ โดยครอบคลุมทุกด้านตั้งแต่การจัดการลูกค้า (CRM) การนัดหมาย การขาย สินค้าคงคลัง และการรายงาน

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts
- **State Management**: Zustand (for complex state)
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

### Backend & Database
- **BaaS**: Supabase
  - PostgreSQL Database
  - Authentication (Supabase Auth)
  - Storage (Supabase Storage)
  - Row Level Security (RLS)
  - Real-time subscriptions (optional)
  - Edge Functions (for notifications)

### Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Type Checking**: TypeScript

---

## 🗄️ Database Schema

### Core Tables

#### 1. **customers** (ลูกค้า)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- name: VARCHAR(255) - ชื่อลูกค้า
- phone: VARCHAR(20) - เบอร์โทรศัพท์
- email: VARCHAR(255) - อีเมล
- birth_date: DATE - วันเกิด
- address: TEXT - ที่อยู่
- notes: TEXT - หมายเหตุ
- loyalty_points: INTEGER - แต้มสะสม
- total_spent: DECIMAL - ยอดซื้อสะสม
```

#### 2. **staff** (พนักงาน)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- user_id: UUID (FK to auth.users)
- name: VARCHAR(255) - ชื่อพนักงาน
- position: VARCHAR(100) - ตำแหน่ง
- phone: VARCHAR(20) - เบอร์โทรศัพท์
- email: VARCHAR(255) - อีเมล
- commission_rate: DECIMAL - อัตราค่าคอมมิชชัน (%)
- role: VARCHAR(20) - บทบาท (admin/doctor/staff)
```

#### 3. **services** (บริการ)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- name: VARCHAR(255) - ชื่อบริการ
- description: TEXT - รายละเอียด
- price: DECIMAL - ราคา
- duration_minutes: INTEGER - ระยะเวลา (นาที)
- category: VARCHAR(100) - หมวดหมู่
- is_package: BOOLEAN - เป็นแพ็กเกจหรือไม่
```

#### 4. **products** (สินค้า)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- name: VARCHAR(255) - ชื่อสินค้า
- sku: VARCHAR(100) - รหัสสินค้า (Unique)
- quantity: INTEGER - จำนวนคงเหลือ
- min_quantity: INTEGER - จุดสั่งซื้อใหม่
- cost_price: DECIMAL - ราคาทุน
- selling_price: DECIMAL - ราคาขาย
- category: VARCHAR(100) - หมวดหมู่
```

#### 5. **appointments** (นัดหมาย)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- customer_id: UUID (FK to customers)
- service_id: UUID (FK to services)
- staff_id: UUID (FK to staff)
- appointment_date: DATE - วันที่นัดหมาย
- start_time: TIME - เวลาเริ่ม
- end_time: TIME - เวลาสิ้นสุด
- status: VARCHAR(20) - สถานะ (pending/confirmed/cancelled/completed)
- notes: TEXT - หมายเหตุ
```

#### 6. **treatments** (ประวัติการรักษา)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- customer_id: UUID (FK to customers)
- service_id: UUID (FK to services)
- staff_id: UUID (FK to staff)
- treatment_date: TIMESTAMP - วันเวลาที่รักษา
- notes: TEXT - หมายเหตุ
- before_image_url: TEXT - URL รูป Before
- after_image_url: TEXT - URL รูป After
```

#### 7. **sales** (การขาย)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- customer_id: UUID (FK to customers)
- staff_id: UUID (FK to staff)
- total_amount: DECIMAL - ยอดรวม
- payment_method: VARCHAR(20) - วิธีชำระเงิน (cash/credit_card/transfer)
- payment_status: VARCHAR(20) - สถานะ (pending/completed/refunded)
- notes: TEXT - หมายเหตุ
```

#### 8. **sale_items** (รายการขาย)
```sql
- id: UUID (Primary Key)
- created_at: Timestamp
- sale_id: UUID (FK to sales)
- item_type: VARCHAR(20) - ประเภท (service/product)
- item_id: UUID - ID ของสินค้าหรือบริการ
- quantity: INTEGER - จำนวน
- unit_price: DECIMAL - ราคาต่อหน่วย
- subtotal: DECIMAL - ยอดรวม
```

---

## 🔐 Row Level Security (RLS)

### Policy Overview

#### Customers Table
- **SELECT**: อนุญาตให้ผู้ใช้ที่ authenticated ทั้งหมด
- **INSERT/UPDATE**: อนุญาตให้ผู้ใช้ที่ authenticated ทั้งหมด
- **DELETE**: อนุญาตเฉพาะ Admin เท่านั้น

#### Staff Table
- **SELECT**: อนุญาตให้ผู้ใช้ที่ authenticated ทั้งหมด
- **ALL**: อนุญาตเฉพาะ Admin เท่านั้น

#### Services Table
- **SELECT**: อนุญาตให้ผู้ใช้ที่ authenticated ทั้งหมด
- **ALL**: อนุญาตเฉพาะ Admin เท่านั้น

#### Products, Appointments, Treatments, Sales, Sale Items
- **ALL**: อนุญาตให้ผู้ใช้ที่ authenticated ทั้งหมด

### Example Policy
```sql
CREATE POLICY "Enable delete for admin users" ON customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid() 
      AND staff.role = 'admin'
    )
  );
```

---

## 🎯 Key Features Implementation

### 1. Dashboard (หน้าแรก)
**Location**: `/app/dashboard/page.tsx`

**Features**:
- สรุปยอดขายรายวัน/เดือน
- จำนวนลูกค้าใหม่
- ตารางนัดหมายวันนี้
- กราฟแสดงยอดขาย 7 วันที่ผ่านมา

**Data Flow**:
```
Component -> Supabase Client -> PostgreSQL
  ↓
Fetch sales, customers, appointments
  ↓
Calculate statistics
  ↓
Render charts & cards
```

### 2. Customer Management (CRM)
**Location**: `/app/customers/page.tsx`

**Features**:
- CRUD ข้อมูลลูกค้า
- แสดงแต้มสะสม
- ดูประวัติการรักษา (Before & After)
- ดูประวัติการซื้อ
- Birthday tracking

**Integration**:
- **Supabase Storage**: เก็บรูปภาพ Before/After
- **Edge Functions**: แจ้งเตือนวันเกิดอัตโนมัติ (ต้องตั้งค่าเพิ่มเติม)

### 3. Appointment Management
**Location**: `/app/appointments/page.tsx`

**Features**:
- ปฏิทินนัดหมาย (รายวัน/รายสัปดาห์)
- สร้างนัดหมายใหม่
- เปลี่ยนสถานะนัดหมาย
- คำนวณเวลาอัตโนมัติจากระยะเวลาบริการ

**Notification System** (ต้องตั้งค่า Edge Function):
```javascript
// Supabase Edge Function example
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // Send SMS/Line notification
  // Implementation with Line Notify or SMS provider
})
```

### 4. Service Management
**Location**: `/app/services/page.tsx`

**Features**:
- จัดการบริการและคอร์ส
- กำหนดราคา ระยะเวลา
- แยกประเภทบริการ
- สร้างแพ็กเกจ

### 5. Inventory Management
**Location**: `/app/products/page.tsx`

**Features**:
- ติดตามสต็อกสินค้า
- แจ้งเตือนสินค้าใกล้หมด
- คำนวณกำไร
- อัพเดทสต็อกอัตโนมัติเมื่อขาย

**Automatic Stock Update**:
```sql
CREATE TRIGGER trigger_update_product_quantity
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_quantity();
```

### 6. Sales & Reporting
**Location**: `/app/sales/page.tsx`

**Features**:
- สร้างบิลขาย
- เลือกสินค้า/บริการ
- คำนวณยอดรวมอัตโนมัติ
- รายงานยอดขาย
- คำนวณค่าคอมมิชชันพนักงาน
- กราฟวิเคราะห์

**Commission Calculation**:
```typescript
const commission = (saleAmount * staffCommissionRate) / 100
```

### 7. Staff Management
**Location**: `/app/staff/page.tsx`

**Features**:
- จัดการข้อมูลพนักงาน
- กำหนดอัตราค่าคอมมิชชัน
- กำหนดบทบาท (Admin/Doctor/Staff)
- ควบคุมสิทธิ์ผ่าน RLS

---

## 🔄 Data Flow Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ @supabase/supabase-js
         ↓
┌─────────────────┐
│  Supabase API   │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────────┐ ┌──────────┐
│PostgreSQL│ │ Storage  │
│Database  │ │(Images)  │
└──────────┘ └──────────┘
```

---

## 🎨 UI/UX Design Principles

### Design System
- **Color Palette**: Primary Pink (#ec4899) with grayscale
- **Typography**: System fonts for better performance
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable card, button, input components

### Responsive Design
- **Mobile First**: ออกแบบเริ่มจาก Mobile
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### Accessibility
- Semantic HTML
- Proper color contrast
- Keyboard navigation support
- Screen reader friendly

---

## 🔧 Configuration & Environment

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Configuration
1. **Authentication**: Email/Password authentication enabled
2. **Storage Buckets**: 
   - `treatment-images`: สำหรับรูป Before/After
   - Public access for reading
3. **Edge Functions**: (Optional)
   - `send-birthday-notification`
   - `send-appointment-reminder`

---

## 📊 Performance Optimizations

### Frontend
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for modals
- **Caching**: Supabase query caching

### Database
- **Indexes**: Created on frequently queried columns
- **Connection Pooling**: Managed by Supabase
- **Query Optimization**: Proper joins and filtering

### Monitoring
- Real-time error tracking (dapat ditambahkan Sentry)
- Performance monitoring via Vercel Analytics
- Database query performance via Supabase Dashboard

---

## 🚀 Deployment

### Recommended Platform: Vercel

1. **Connect Repository**
2. **Set Environment Variables**
3. **Deploy**

```bash
# Build command
npm run build

# Start command
npm start
```

### Alternative: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔮 Future Enhancements

### Planned Features
1. **Line Notification Integration**: แจ้งเตือนผ่าน Line
2. **SMS Notifications**: แจ้งเตือนผ่าน SMS
3. **Birthday Auto-reminder**: ส่งข้อความวันเกิดอัตโนมัติ
4. **Advanced Analytics**: Dashboard วิเคราะห์ขั้นสูง
5. **Mobile App**: React Native หรือ Flutter
6. **Online Booking**: ระบบจองนัดหมายออนไลน์
7. **Payment Gateway**: รับชำระเงินออนไลน์
8. **Inventory Auto-order**: สั่งซื้อสินค้าอัตโนมัติ

### Scalability Considerations
- **Database Sharding**: แยก database เมื่อข้อมูลเยอะ
- **CDN**: ใช้ CDN สำหรับ static assets
- **Load Balancing**: กระจาย load เมื่อ traffic สูง
- **Microservices**: แยก service ตามฟังก์ชัน

---

## 📝 API Documentation

### Supabase Client Usage

#### Fetch Data
```typescript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Insert Data
```typescript
const { data, error } = await supabase
  .from('customers')
  .insert([{ name: 'John Doe', phone: '0812345678' }])
```

#### Update Data
```typescript
const { error } = await supabase
  .from('customers')
  .update({ name: 'Jane Doe' })
  .eq('id', customerId)
```

#### Delete Data
```typescript
const { error } = await supabase
  .from('customers')
  .delete()
  .eq('id', customerId)
```

#### Join Tables
```typescript
const { data, error } = await supabase
  .from('appointments')
  .select(`
    *,
    customers (name, phone),
    services (name),
    staff (name)
  `)
```

---

## 🛠️ Maintenance & Support

### Regular Tasks
- **Database Backup**: ทำ backup ทุกวัน (Supabase automatic)
- **Monitor Logs**: ตรวจสอบ error logs
- **Update Dependencies**: อัพเดท packages ทุกเดือน
- **Security Patches**: ติดตั้ง security updates

### Troubleshooting
- **Check Supabase Dashboard**: ดู logs และ metrics
- **Verify RLS Policies**: ตรวจสอบ permissions
- **Test Database Connection**: ทดสอบการเชื่อมต่อ
- **Clear Cache**: ล้าง browser cache

---

## 📞 Contact & Support

สำหรับคำถามหรือปัญหาเกี่ยวกับระบบ กรุณาติดต่อทีมพัฒนา

---

**สร้างโดย**: Patricia Clinic Development Team  
**เวอร์ชัน**: 1.0.0  
**อัพเดทล่าสุด**: 2025-10-06
