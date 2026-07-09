import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Allowed values for the ?s= source param. Anything else is recorded as null
// so a tampered/unknown query string can't pollute the analytics.
const ALLOWED_SOURCES = ['carte', 'whatsapp', 'recu', 'email'] as const;
type Source = (typeof ALLOWED_SOURCES)[number];

// Link-preview crawlers fetch the URL server-side (e.g. when we paste the link
// into WhatsApp), which would otherwise create fake scan rows. Skip logging
// for these — but always still redirect.
const BOT_UA = /WhatsApp|facebookexternalhit|Twitterbot|TelegramBot|Slackbot|LinkedInBot/i;

export async function GET(req: NextRequest) {
  const reviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!reviewUrl) {
    // Fail loudly: a silent homepage fallback would hide a misconfiguration
    // that sends everyone scanning a printed QR code to the wrong place.
    console.error('GOOGLE_REVIEW_URL is not set — /avis is redirecting to "/".');
    return NextResponse.redirect(new URL('/', req.url), 302);
  }

  const userAgent = req.headers.get('user-agent');

  // Skip the insert for preview bots and for requests with no user-agent.
  if (userAgent && !BOT_UA.test(userAgent)) {
    const rawSource = req.nextUrl.searchParams.get('s');
    const source: Source | null = ALLOWED_SOURCES.includes(rawSource as Source)
      ? (rawSource as Source)
      : null;

    // We await the insert (an un-awaited promise is dropped when an edge
    // function returns) but time it out at 1.5s and swallow every error so a
    // slow or failing Supabase can never block or break the redirect.
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        await supabaseAdmin
          .from('review_scans')
          .insert({
            source,
            user_agent: userAgent,
            referer: req.headers.get('referer'),
          })
          .abortSignal(AbortSignal.timeout(1500));
      }
    } catch (err) {
      console.error('review_scans log failed:', err);
    }
  }

  return NextResponse.redirect(reviewUrl, 302);
}
