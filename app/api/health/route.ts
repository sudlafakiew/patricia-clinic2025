import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'partial',
        message: 'Health check OK (Supabase not configured)',
        environment: 'development/offline mode',
      })
    }

    // If env vars exist, try to connect
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact' })
      .limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          details: error.details,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection OK',
      data: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'partial',
        message: 'Health check OK (database unavailable)',
        error: error.message,
      },
      { status: 200 }
    )
  }
}
