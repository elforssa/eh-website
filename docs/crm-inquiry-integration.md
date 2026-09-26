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

The accepted CRM form keys are `general_contact_v1`, `campaign_parent_lead_v1`,
and `campaign_adult_lead_v1`. The CRM endpoint must accept the canonical Origin and dedupe
requests by `request_key`. Do not expose a CRM credential to the browser.

The site key is always `english-hills-website`. The CRM must configure exactly
these three mappings before activating this revision. Old page-specific mapping
keys are not used. A new landing page using an existing schema needs no new CRM
mapping. A materially different schema should use a versioned new key.

## Education page and schema contract

Each page passes a `CrmWorkflow` config with `destination: "crm"`, a semantic
`formSchema`, and its page-specific defaults to its form. The existing layouts
remain separate, while `useInquirySubmission` provides UUID, attribution,
consent delivery, retries, duplicate-submit protection, and error handling.
The server validates canonical answers and sends only the CRM contract.

| Page | CRM schema | Program answer |
| --- | --- | --- |
| Contact | `general_contact_v1` | Visitor's selected interest |
| Summer Camp | `campaign_parent_lead_v1` | `Camp d'été` |
| Mise à niveau | `campaign_parent_lead_v1` | `Cours de mise à niveau` |
| Online English | `campaign_adult_lead_v1` | Visitor's selected format |

`general_contact_v1` uses contact name and a valid phone or email, with an
optional `program_interest` and required `message`. The parent schema requires
contact name, phone, and `program_interest`. It allows `learner_name`,
`learner_age`, `learner_ages`, `children_count`, `objective`, `current_level`,
`availability`, and `location_confirmed` when actually asked. Parent and learner
names are never inferred from one another. The adult schema uses contact name,
a valid phone or email, and `program_interest`; it allows `learner_type`,
`objective`, `current_level`, and `availability`.

Campaign schemas also pass through safe page-specific answer keys, such as
`school_type`, `biggest_difficulty`, `preferred_test_day`, `parent_goal`,
`job_role`, or `english_at_work`. These stay in CRM submission form answers even
when a mapping does not normalize them into a contact or lead field. Adding
such a question does **not** require a CRM mapping, migration, endpoint, or
new `form_key`. Create a versioned schema only when business meaning changes.
The CRM payload has no separate answer-label field; use readable snake-case
keys, and let the CRM use its configured label or readable key fallback.

The website rejects unsafe answers instead of silently dropping them: at most
30 keys, lowercase snake-case keys up to 64 characters, answer strings up to 2,000
characters (including `message` and flexible campaign answers), arrays of up to 10 strings of 200 characters
each, and finite bounded numbers. Technical, attribution, tracking, token,
identifier, browser metadata, and raw-payload keys are rejected as answers.
Attribution remains in the separate `attribution` object.

### How to add a student/customer campaign landing page

1. Create the page and declare `destination: "crm"` in its form configuration.
2. Choose `campaign_parent_lead_v1` or `campaign_adult_lead_v1` based on who is
   taking the course. Set the real `programInterest`, canonical visible questions,
   and any `extraQuestions` with readable labels and safe snake-case keys.
3. Render `CampaignLeadForm` with that configuration, or use the shared
   `useInquirySubmission` hook and `InquiryConsent` for bespoke form UI. Keep
   the UUID and attribution logic in the hook.
4. Launch with observed UTMs. The landing page URL and UTMs distinguish the
   campaign; do not encode the campaign or slug in `form_key`.

For example, an annual English page may set `formSchema:
"campaign_parent_lead_v1"` and `programInterest: "Anglais annuel"`. It uses
the same CRM mapping as Summer Camp. The actual `utm_campaign` and
`landing_page` still identify its acquisition source.

### How to add a temporary recruitment landing page

1. Declare `destination: "recruitment"`, `workflow:
   "temporary_hiring_lead"`, an actual role, and optional question labels.
2. Render `TemporaryRecruitmentLeadForm`. It posts only to
   `/api/recruitment-leads`, which validates hiring data and appends to the
   dedicated temporary hiring Google Sheet. Configure the separate sheet ID
   and tab with columns A:G documented in `.env.example`.
3. Do not configure a CRM mapping or CRM fallback. Hiring records never use
   `/api/crm-inquiry`, CRM attribution, or CRM lead analytics.

The receptionist page keeps its existing `JobApplicationForm`,
`/api/job-applications`, Supabase delivery, and recruitment Sheet. That sheet
writer is tied to receptionist fields and CV links, so it is not reused for
temporary teacher campaigns. The external Facebook Lead Ads to Google Sheets
hiring workflow is unaffected.

Temporary hiring submits one request UUID per prepared submission and reuses
it after an uncertain response. The dedicated Sheet stores the UUID in column
A; the adapter checks that column before appending. Concurrent requests can
still race between lookup and append because Google Sheets has no atomic
unique key. Keep this limitation in mind for high-volume campaigns.

The website responds successfully only after a 2xx CRM response. It retries
transient failures once using the identical payload and UUID. A browser retry
after an uncertain response also uses the identical payload and UUID until the
visitor changes a field. Neither the browser response nor the thank-you URL
contains CRM IDs. No student, enrollment, or payment API is called.

## Compatibility delivery

The existing campaign Meta CAPI `Lead` event is disabled by default. The
server-only `CRM_LEGACY_META_CAPI_ENABLED` switch must be exactly `true` to
send it after CRM acceptance. Vercel preview is blocked even if the switch is
accidentally enabled there. Keep it `false` in preview and staging;
production may explicitly enable it temporarily to preserve measurement
during transition. When enabled, it remains best effort with the website
request UUID as its event ID. Its failure or timeout does not change the
accepted response. The existing browser Pixel
`Lead` event runs only after a valid short-lived, signed, non-PII success
receipt is consumed on `/merci`. A direct `/merci` visit has no success proof
and emits no `Lead` event. Contact continues its inline success panel and does
not emit a new Meta `Lead` event.

The old education Google Sheets code and Supabase `ad_leads` handler are retained but are
not invoked by these four forms. Sheets delivery is paused for CRM inquiries:
the current sheets have no `request_key` column or atomic deduplication, so
retrying after uncertain CRM responses could create duplicate sheet rows.
Re-enable education Sheets only with a keyed, idempotent delivery design. The legacy
`/api/ad-leads` route remains available for rollback but should not receive
traffic from the updated forms.

## Attribution and privacy

Only observed supported attribution keys are sent. Campaign identifiers are
retained in browser storage for 30 days; a new campaign replaces the old
campaign values. Stored URLs have query strings removed; same-site simple
single-segment campaign paths are retained, while external, complex, and
numeric-identity paths are reduced to an origin. Form names, phone numbers, emails, messages, and learner
answers are never stored in `localStorage`. The old attribution key is removed
when an inquiry form loads. `_fbp` and `_fbc` are read from actual cookies;
`fbc` is never synthesized for the CRM.

All four forms have an unchecked required inquiry-consent checkbox with a
privacy-policy link. Location checkboxes remain separate. The campaign
honeypots are preserved and Contact has the same protection. No Turnstile
validation or bypass was changed. A preview test works if CRM Turnstile
verification is unconfigured. If `TURNSTILE_SECRET_KEY` is configured in admin
production, preview-host tokens cannot meet the canonical `www` hostname
requirement; use another controlled activation/test method in that case.

## Local verification

`npm run test:crm-browser-state` checks attribution expiry, replacement,
sanitization, browser storage, and UUID reuse/change. `npm run test:crm-inquiry`
starts a loopback-only mock CRM and Next server. It never calls the deployed CRM.
The latter checks payloads, errors, retry identity, timeout, honeypot, and
thank-you proof. `npm run test:crm-flexible-answers` checks answer safety and the
Meta CAPI switch without any Meta request. Run these plus
`npm run test:recruitment-audit`, `npm run lint`,
and `npm run build` before activation.
