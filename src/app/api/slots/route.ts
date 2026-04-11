import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch active slots with available capacity where date is >= today
    // Order by date and time
    const today = new Date().toISOString().split('T')[0];
    const { data: slots, error } = await supabase
      .from('slots')
      .select('id, date, time')
      .eq('is_active', true)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    // Since we can't do current_bookings < max_bookings directly in the basic match object unless we use RPC
    // We filter it out via RLS policy (the prompt's SQL schema explicitly set: USING (current_bookings < max_bookings))
    // So `data` will natively only contain slots that pass the RLS.

    // Group the slots by date naturally
    const grouped: Record<string, { id: string; time: string }[]> = {};
    if (slots) {
      slots.forEach((slot) => {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date].push({ id: slot.id, time: slot.time });
      });
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error('API Error /slots:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
