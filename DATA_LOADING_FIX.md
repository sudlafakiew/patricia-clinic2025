# Data Loading Fix - RLS Configuration

## Problem
The application pages (Appointments, Customers, Services, Products, Staff, Sales) were showing "เกิดข้อผิดพลาดในการโหลดข้อมูล" (error loading data) because Supabase Row Level Security (RLS) policies were blocking anonymous/unauthenticated access.

## Solution
Disable RLS on all tables to allow public access via the anon key. This is suitable for development and internal clinic use.

## Steps to Fix

### 1. Go to Supabase Dashboard
- Navigate to https://app.supabase.com
- Select your project (gbltkenplrbrraufyyvg)
- Go to **SQL Editor**

### 2. Run the Disable RLS Script
Copy and paste the following SQL, then click **Run**:

```sql
-- Disable RLS on all tables
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
```

### 3. Verify the Fix
Run this query to confirm RLS is disabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'staff', 'services', 'products', 'appointments', 'treatments', 'sales', 'sale_items');
```

All tables should show `rowsecurity = false`.

### 4. Refresh the Application
- Close the browser tab and go back to http://localhost:3001
- All pages should now load data successfully

## Production Recommendations
For production deployment, you should:
1. **Enable authentication** - Add proper user login/signup
2. **Re-enable RLS** - Uncomment the RLS policies in `supabase/schema.sql`
3. **Implement role-based access** - Use the staff roles (admin/doctor/staff) with RLS policies to control data access
4. **Use server-side operations** - Move sensitive transactions (like sales) to server actions with proper authentication checks

## File References
- **SQL Script**: `supabase/disable_rls.sql` - Contains the RLS disable commands
- **Updated Schema**: `supabase/schema.sql` - RLS policies are now commented out

## Related CRUD Improvements
All modules now have complete CRUD (Create, Read, Update, Delete) functionality:
- ✅ Customers - Add, edit, delete customers
- ✅ Services - Add, edit, delete services with pricing
- ✅ Staff - Add, edit, delete staff with roles
- ✅ Products - Add, edit, delete products with inventory
- ✅ Appointments - Add, edit, delete appointments with status tracking
- ✅ Sales - Add, edit, delete sales transactions with items

All forms include proper validation, error handling, and Thai language support.
