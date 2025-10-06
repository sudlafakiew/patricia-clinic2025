export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          email: string | null
          birth_date: string | null
          address: string | null
          notes: string | null
          loyalty_points: number
          total_spent: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone: string
          email?: string | null
          birth_date?: string | null
          address?: string | null
          notes?: string | null
          loyalty_points?: number
          total_spent?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string
          email?: string | null
          birth_date?: string | null
          address?: string | null
          notes?: string | null
          loyalty_points?: number
          total_spent?: number
        }
      }
      treatments: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          service_id: string
          staff_id: string
          treatment_date: string
          notes: string | null
          before_image_url: string | null
          after_image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          service_id: string
          staff_id: string
          treatment_date: string
          notes?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          service_id?: string
          staff_id?: string
          treatment_date?: string
          notes?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          service_id: string
          staff_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          service_id: string
          staff_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          service_id?: string
          staff_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          category: string | null
          is_package: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          duration_minutes: number
          category?: string | null
          is_package?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          category?: string | null
          is_package?: boolean
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          sku: string
          quantity: number
          min_quantity: number
          cost_price: number
          selling_price: number
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          sku: string
          quantity: number
          min_quantity?: number
          cost_price: number
          selling_price: number
          category?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          sku?: string
          quantity?: number
          min_quantity?: number
          cost_price?: number
          selling_price?: number
          category?: string | null
        }
      }
      sales: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          staff_id: string
          total_amount: number
          payment_method: 'cash' | 'credit_card' | 'transfer'
          payment_status: 'pending' | 'completed' | 'refunded'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          staff_id: string
          total_amount: number
          payment_method: 'cash' | 'credit_card' | 'transfer'
          payment_status?: 'pending' | 'completed' | 'refunded'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          staff_id?: string
          total_amount?: number
          payment_method?: 'cash' | 'credit_card' | 'transfer'
          payment_status?: 'pending' | 'completed' | 'refunded'
          notes?: string | null
        }
      }
      sale_items: {
        Row: {
          id: string
          created_at: string
          sale_id: string
          item_type: 'service' | 'product'
          item_id: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Insert: {
          id?: string
          created_at?: string
          sale_id: string
          item_type: 'service' | 'product'
          item_id: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Update: {
          id?: string
          created_at?: string
          sale_id?: string
          item_type?: 'service' | 'product'
          item_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
        }
      }
      staff: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          name: string
          position: string
          phone: string
          email: string | null
          commission_rate: number
          role: 'admin' | 'doctor' | 'staff'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          name: string
          position: string
          phone: string
          email?: string | null
          commission_rate?: number
          role?: 'admin' | 'doctor' | 'staff'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          name?: string
          position?: string
          phone?: string
          email?: string | null
          commission_rate?: number
          role?: 'admin' | 'doctor' | 'staff'
        }
      }
    }
  }
}
