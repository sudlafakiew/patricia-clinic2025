-- Patricia Clinic Database Schema
-- ================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  birth_date DATE,
  address TEXT,
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  commission_rate DECIMAL(5, 2) DEFAULT 0,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'doctor', 'staff'))
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category VARCHAR(100),
  is_package BOOLEAN DEFAULT FALSE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT
);

-- Treatments table (treatment history)
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  treatment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  before_image_url TEXT,
  after_image_url TEXT
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'transfer')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  notes TEXT
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('service', 'product')),
  item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_treatments_customer ON treatments(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);

-- Row Level Security (RLS) Policies
-- RLS is DISABLED to allow public/anonymous access via anon key
-- For production, implement proper authentication and re-enable RLS with appropriate policies
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Customers policies (commented out - RLS disabled)
-- CREATE POLICY "Enable read access for all authenticated users" ON customers
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable insert for authenticated users" ON customers
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users" ON customers
--   FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable delete for admin users" ON customers
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM staff 
--       WHERE staff.user_id = auth.uid() 
--       AND staff.role = 'admin'
--     )
--   );

-- Staff policies (commented out - RLS disabled)
-- CREATE POLICY "Enable read access for all authenticated users" ON staff
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable all operations for admin users" ON staff
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM staff 
--       WHERE staff.user_id = auth.uid() 
--       AND staff.role = 'admin'
--     )
--   );

-- Services policies (commented out - RLS disabled)
-- CREATE POLICY "Enable read access for all authenticated users" ON services
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable all operations for admin users" ON services
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM staff 
--       WHERE staff.user_id = auth.uid() 
--       AND staff.role = 'admin'
--     )
--   );

-- Products policies (commented out - RLS disabled)
-- CREATE POLICY "Enable read access for all authenticated users" ON products
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable insert/update for authenticated users" ON products
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users" ON products
--   FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable delete for admin users" ON products
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM staff 
--       WHERE staff.user_id = auth.uid() 
--       AND staff.role = 'admin'
--     )
--   );

-- Appointments policies (commented out - RLS disabled)
-- CREATE POLICY "Enable all operations for authenticated users" ON appointments
--   FOR ALL USING (auth.role() = 'authenticated');

-- Treatments policies (commented out - RLS disabled)
-- CREATE POLICY "Enable all operations for authenticated users" ON treatments
--   FOR ALL USING (auth.role() = 'authenticated');

-- Sales policies (commented out - RLS disabled)
-- CREATE POLICY "Enable all operations for authenticated users" ON sales
--   FOR ALL USING (auth.role() = 'authenticated');

-- Sale items policies (commented out - RLS disabled)
-- CREATE POLICY "Enable all operations for authenticated users" ON sale_items
--   FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic updates
-- Update customer total_spent when sale is created
CREATE OR REPLACE FUNCTION update_customer_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET total_spent = total_spent + NEW.total_amount
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_total_spent
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_total_spent();

-- Update product quantity when sale item is created
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_type = 'product' THEN
    UPDATE products
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_quantity
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_quantity();

-- Sample data for testing
-- Insert sample staff (admin)
INSERT INTO staff (name, position, phone, email, commission_rate, role) VALUES
  ('แพทริเซีย คลินิก', 'ผู้จัดการ', '0812345678', 'admin@patriciaclinic.com', 0, 'admin'),
  ('ดร.สมชาย ใจดี', 'แพทย์', '0823456789', 'doctor@patriciaclinic.com', 10, 'doctor'),
  ('สมหญิง รักงาน', 'พนักงาน', '0834567890', 'staff@patriciaclinic.com', 5, 'staff');

-- Insert sample services
INSERT INTO services (name, description, price, duration_minutes, category, is_package) VALUES
  ('ฉีดโบท็อกซ์', 'ฉีดโบท็อกซ์เพื่อลดริ้วรอย', 5000, 30, 'ฉีด', FALSE),
  ('ฉีดฟิลเลอร์', 'ฉีดฟิลเลอร์เติมเต็มใบหน้า', 8000, 45, 'ฉีด', FALSE),
  ('เลเซอร์หน้าใส', 'เลเซอร์เพื่อผิวหน้าใสขึ้น', 3500, 60, 'เลเซอร์', FALSE),
  ('แพ็กเกจดูแลผิว VIP', 'รวมบริการดูแลผิวครบวงจร', 25000, 120, 'แพ็กเกจ', TRUE);

-- Insert sample products
INSERT INTO products (name, sku, quantity, min_quantity, cost_price, selling_price, category) VALUES
  ('เซรั่มวิตามินซี', 'SER-VIT-C-001', 50, 10, 450, 890, 'เซรั่ม'),
  ('ครีมกันแดด SPF50', 'SUN-SPF50-001', 30, 10, 350, 690, 'กันแดด'),
  ('มาส์กหน้า', 'MASK-HYD-001', 100, 20, 80, 150, 'มาส์ก');

-- Insert sample customers
INSERT INTO customers (name, phone, email, birth_date, loyalty_points) VALUES
  ('คุณสมศรี ใจดี', '0891234567', 'somsri@email.com', '1990-05-15', 100),
  ('คุณวิภา สวยงาม', '0892345678', 'wipa@email.com', '1985-08-20', 250);
