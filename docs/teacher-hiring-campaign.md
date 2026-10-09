# English teacher hiring campaign

Light recruitment flow, separate from the CRM and from the receptionist flow.

- Landing page: `/recrutement-professeur-anglais` (noindex, header/footer hidden)
- Thank-you page: `/merci-candidature-professeur`
- Storage: Google Sheet only (no Supabase table). CVs go to the existing private bucket `job-application-cvs` under `teachers/<submissionKey>/`; the sheet holds a 90-day signed link.
- Video intro: applicant pastes a link (Drive, YouTube, Loom, Vimeo, Dropbox). Nothing is stored. Private Drive/YouTube/Vimeo links are rejected on submit (best-effort check).
- Meta: `SubmitApplication` is sent server-side (CAPI) after the sheet row is written, and in the browser from the thank-you page. Both use `event_id = submissionKey` so Meta dedupes them. The browser event only fires when a signed one-time cookie from a real submission is present, so direct visits and reloads never count.

## Environment variables (Vercel)

| Variable | Value |
| --- | --- |
| `GOOGLE_SHEETS_TEACHER_SPREADSHEET_ID` | ID of the Teacher Applications spreadsheet |
| `GOOGLE_SHEETS_TEACHER_SHEET` | Tab name, default `Applications` |
| `META_TEACHER_TEST_EVENT_CODE` | Optional, only while testing in Events Manager |

Reused from the receptionist flow: `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `JOB_APPLICATION_FORM_SECRET`, `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_GRAPH_API_VERSION`, Supabase keys. The service account needs Editor access to the spreadsheet.

## Sheet columns (A:AG, 33)

The header row is defined in `src/lib/teacher-applications/sheet-row.ts`. Columns Z:AC (Video Score, Final Score, Review Notes, Next Step) are left blank for manual review. Status is `TO_REVIEW` or `AUTO_REJECTED`; Knockout Reasons lists why (`CANNOT_COMMUTE`, `RATE_DECLINED`, `UNDER_THREE_YEARS`, `NO_CELTA`, `ENGLISH_BELOW_C1`). Automatic Score is out of 80.

## Ad URL parameters

`?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.id}}&utm_campaign_name={{campaign.name}}&utm_adset={{adset.id}}&utm_adset_name={{adset.name}}&utm_content={{ad.id}}&utm_ad_name={{ad.name}}&placement={{placement}}`

## Known limits of the light flow

- No retry queue: if Meta CAPI fails, only the browser event is received. If the sheet write fails the applicant sees an error and can resubmit (same submission key, deduped by column A).
- Concurrent submissions could in theory race the duplicate lookup; negligible at this volume.
- Abandoned CV uploads stay in the `teachers/` prefix.
- The Drive "is it public" check is best-effort; if it cannot tell, the application is accepted and the reviewer sees the link.

## Tests

`npm run test:teacher-applications`
