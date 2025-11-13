import { supabase } from './supabase'
import { getMockData } from './mockData'

interface QueryBuilder {
  select: (columns?: string) => QueryBuilder
  order: (column: string, options?: any) => QueryBuilder
  limit: (count: number) => QueryBuilder
  eq: (column: string, value: any) => QueryBuilder
  delete: () => QueryBuilder
  insert: (data: any[]) => QueryBuilder
  update: (data: any) => QueryBuilder
  single: () => Promise<{ data: any; error: any }>
}

export async function safeQuery(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  data?: any,
  options?: any
) {
  try {
    let query: any = supabase.from(table)

    if (operation === 'select') {
      query = query.select(data || '*')
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending !== false,
        })
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const result = await query
      if (result.error) throw result.error
      return { data: result.data, error: null }
    } else if (operation === 'insert') {
      const result = await query.insert(data)
      if (result.error) throw result.error
      return { data: result.data, error: null }
    } else if (operation === 'update') {
      let result: any = await query.update(data.record)
      if (options?.eq) {
        result = result.eq(options.eq.column, options.eq.value)
      }
      if (result.error) throw result.error
      return { data: result.data, error: null }
    } else if (operation === 'delete') {
      let result: any = await query.delete()
      if (options?.eq) {
        result = result.eq(options.eq.column, options.eq.value)
      }
      if (result.error) throw result.error
      return { data: result.data, error: null }
    }
  } catch (error: any) {
    // Fall back to mock data on error
    console.warn(`Database error for ${table}, using mock data:`, error.message)

    if (operation === 'select') {
      return { data: getMockData(table), error: null }
    }
  }

  return { data: null, error: new Error('Operation failed') }
}
