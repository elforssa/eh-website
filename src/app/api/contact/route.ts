import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/*
  Required Supabase table — run this SQL in the Supabase SQL editor:

  create table contact_submissions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    program text not null,
    message text not null,
    created_at timestamptz default now()
  );

  -- Enable Row Level Security (deny public reads, allow inserts via service key)
  alter table contact_submissions enable row level security;
*/

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, program, message } = body;

    if (!name?.trim() || !email?.trim() || !program?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('contact_submissions').insert([
      { name: name.trim(), email: email.trim().toLowerCase(), program, message: message.trim() },
    ]);

    if (error) {
      console.error('Contact submission insert error:', error);
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Error /contact:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
