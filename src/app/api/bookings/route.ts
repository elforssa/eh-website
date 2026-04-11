import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/*
  RACE CONDITION FIX — Run this SQL in the Supabase SQL editor to create an atomic booking function:

  create or replace function book_slot(
    p_slot_id uuid,
    p_name text,
    p_email text,
    p_phone text,
    p_age_group text,
    p_goal text
  )
  returns json
  language plpgsql
  security definer
  as $$
  declare
    v_slot slots%rowtype;
    v_result json;
  begin
    -- Lock the slot row to prevent concurrent writes
    select * into v_slot from slots where id = p_slot_id for update;

    if not found then
      return json_build_object('error', 'Slot not found');
    end if;

    if v_slot.current_bookings >= v_slot.max_bookings then
      return json_build_object('error', 'This time slot is already full');
    end if;

    insert into bookings (slot_id, name, email, phone, age_group, goal)
    values (p_slot_id, p_name, p_email, p_phone, p_age_group, p_goal);

    update slots set current_bookings = current_bookings + 1 where id = p_slot_id;

    return json_build_object(
      'success', true,
      'date', v_slot.date,
      'time', v_slot.time
    );
  end;
  $$;

  Once that function exists, remove the manual check-then-insert below and call:
    const { data, error } = await supabaseAdmin.rpc('book_slot', { ... })
*/

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { slot_id, name, email, phone, age_group, goal } = body;

    // Input validation
    if (!slot_id || !name?.trim() || !email?.trim() || !phone?.trim() || !age_group) {
      return NextResponse.json({ error: 'All required fields must be filled in.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Use RPC if available (preferred — atomic, no race condition)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('book_slot', {
      p_slot_id: slot_id,
      p_name: name.trim(),
      p_email: email.trim().toLowerCase(),
      p_phone: phone.trim(),
      p_age_group: age_group,
      p_goal: goal?.trim() || null,
    });

    if (!rpcError && rpcData) {
      if (rpcData.error) {
        const status = rpcData.error.includes('full') ? 409 : 400;
        return NextResponse.json({ error: rpcData.error }, { status });
      }
      return NextResponse.json({
        success: true,
        bookedDate: rpcData.date,
        bookedTime: rpcData.time,
      });
    }

    // Fallback: manual check-then-insert (less safe under high concurrency)
    // Replace with RPC above by running the SQL in your Supabase dashboard.
    console.warn('RPC book_slot not found, falling back to manual insert:', rpcError?.message);

    const { data: slotData, error: slotError } = await supabaseAdmin
      .from('slots')
      .select('current_bookings, max_bookings, date, time')
      .eq('id', slot_id)
      .single();

    if (slotError || !slotData) {
      return NextResponse.json({ error: 'Invalid or unavailable slot.' }, { status: 400 });
    }

    if (slotData.current_bookings >= slotData.max_bookings) {
      return NextResponse.json({ error: 'Sorry, this time slot is already full.' }, { status: 409 });
    }

    const { error: insertError } = await supabaseAdmin.from('bookings').insert([{
      slot_id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age_group,
      goal: goal?.trim() || null,
    }]);

    if (insertError) {
      console.error('Booking insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('slots')
      .update({ current_bookings: slotData.current_bookings + 1 })
      .eq('id', slot_id);

    if (updateError) {
      console.error('Slot counter update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      bookedDate: slotData.date,
      bookedTime: slotData.time,
    });

  } catch (err) {
    console.error('API Error /bookings:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
