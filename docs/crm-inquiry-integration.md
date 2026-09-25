# Website CRM inquiry integration

The four education inquiry forms POST to `/api/crm-inquiry` on this website. The
website validates each form, then sends the canonical payload to the configured
CRM endpoint with `Origin: https://www.english-hills.com`. Browser code does not
call the CRM host. Recruitment, gallery access, and the admin registration flow
are separate.

## Configuration and activation

Configure these server-only variables before deployment:

- `CRM_INQUIRY_ENDPOINT=https://admin.english-hills.com/api/public/crm-inquiry`
- `CRM_WEBSITE_SITE_KEY=english-hills-website`
- `CRM_WEBSITE_RECEIPT_SECRET`: a random value of at least 32 characters

The accepted CRM form keys are `contact`, `summer_camp`, `online_english`, and
`mise_a_niveau`. The CRM endpoint must accept the canonical Origin and dedupe
requests by `request_key`. Do not expose a CRM credential to the browser.

The website responds successfully only after a 2xx CRM response. It retries
transient failures once using the identical payload and UUID. A browser retry
after an uncertain response also uses the identical payload and UUID until the
visitor changes a field. Neither the browser response nor the thank-you URL
contains CRM IDs. No student, enrollment, or payment API is called.

## Compatibility delivery

The existing campaign Meta CAPI `Lead` event remains best effort after CRM
acceptance, with the website request UUID as its event ID. Its failure or
timeout does not change the accepted response. The existing browser Pixel
`Lead` event runs only after a valid short-lived, signed, non-PII success
receipt is consumed on `/merci`. A direct `/merci` visit has no success proof
and emits no `Lead` event. Contact continues its inline success panel and does
not emit a new Meta `Lead` event.

The old Google Sheets code and Supabase `ad_leads` handler are retained but are
not invoked by these four forms. Sheets delivery is paused for CRM inquiries:
the current sheets have no `request_key` column or atomic deduplication, so
retrying after uncertain CRM responses could create duplicate sheet rows.
Re-enable Sheets only with a keyed, idempotent delivery design. The legacy
`/api/ad-leads` route remains available for rollback but should not receive
traffic from the updated forms.

## Attribution and privacy

Only observed supported attribution keys are sent. Campaign identifiers are
retained in browser storage for 30 days; a new campaign replaces the old
campaign values. Stored URLs have query strings removed and unknown paths
reduced to an origin. Form names, phone numbers, emails, messages, and learner
answers are never stored in `localStorage`. The old attribution key is removed
when an inquiry form loads. `_fbp` and `_fbc` are read from actual cookies;
`fbc` is never synthesized for the CRM.

All four forms have an unchecked required inquiry-consent checkbox with a
privacy-policy link. Location checkboxes remain separate. The campaign
honeypots are preserved and Contact has the same protection. Turnstile can be
added later if abuse warrants it; the CRM currently treats it as optional.

## Local verification

`npm run test:crm-browser-state` checks attribution expiry, replacement,
sanitization, browser storage, and UUID reuse/change. `npm run test:crm-inquiry`
starts a loopback-only mock CRM and Next server. It never calls the deployed CRM.
The latter checks payloads, errors, retry identity, timeout, honeypot, and
thank-you proof. Run both plus `npm run test:recruitment-audit`, `npm run lint`,
and `npm run build` before activation.
