# Mobile Arcade Ad Landing Page — System Architecture (Draft for CTO/CEO Approval)

## 1) Overview
We need a campaign landing page that reliably captures attribution (UTMs), tracks conversions (GA4), and handles uploads (photos/video) with minimal friction for mobile visitors.

Key constraints:
- Public Google Forms cannot accept file uploads without forcing Google login for respondents, which hurts conversion. Sources:
  - https://support.google.com/docs/community-guide/395355672/google-forms-why-your-respondents-are-being-forced-to-login
  - https://www.ezfiledrop.com/articles/how-to-make-a-google-form-public

Therefore, recommended architecture is a custom capture endpoint + S3 storage, while keeping an optional “export to Google” workflow for the team.

## 2) Proposed High-Level Architecture (Recommended)
### Components
- **Next.js (Mobile Arcade site)**
  - Campaign landing page route(s)
  - Client-side form + upload UI
  - GA4 tracking (Firebase/GA4)
- **API routes (Next.js server)**
  - Create lead
  - Create upload session (pre-signed URLs)
  - Finalize lead (attach uploaded asset keys)
- **Object Storage (S3-compatible)**
  - Store photos/videos in a per-lead prefix
  - Lifecycle rules for retention
- **Lead Store**
  - Option A: Redis/DB (for internal dashboard)
  - Option B: Google Sheets via Apps Script webhook (simple ops)
- **Notifications**
  - Twilio for SMS confirmation
  - SendGrid (or SMTP) for email confirmation

### Data Flow
1) Visitor arrives on landing page with UTMs.
2) Client stores UTMs in session storage and sends GA4 `page_view`.
3) User completes the form.
4) Client requests an upload session from API:
   - API returns pre-signed PUT URLs (1–5 images + optional 1 video).
5) Client uploads files directly to object storage via pre-signed URLs.
6) Client submits lead payload to API with:
   - device fields
   - UTMs
   - uploaded object keys
7) API validates payload, writes lead record, computes or retrieves an offer:
   - pricing based on structured fields (fast) or media-assisted (provisional)
   - stores the offer against the lead to prevent client tampering
8) Client receives offer payload and shows an offer modal:
   - animated reveal + confetti
   - actions: accept offer OR reject offer
9) If accepted:
   - client loads “book free collection” journey
   - booking endpoint stores collection date + payout details + T&Cs acceptance
   - notifications sent (SMS + email) async
10) If rejected:
   - client loads incentive mini-game (e.g. spin the wheel)
   - outcome generated server-side and stored against lead
   - optionally issues voucher code and/or collection upgrade credit
11) GA4 events emitted across offer and booking journey (conversion can be either offer accept or booking completed, depending on KPI choice).

## 3) Landing Page Routes and Attribution Strategy
### Routes
- Use campaign-specific URLs, e.g.:
  - `/lp/trade-in`
  - `/lp/repair-quote`
  - `/campaigns/<slug>`

### UTM strategy (chosen)
- Standard UTMs:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Store UTMs:
  - client (session/local storage)
  - server (persisted with lead)
- Track conversion per campaign using GA4 explorations + conversion reports.

## 4) Analytics Implementation (Firebase / GA4)
### Events
- `lp_form_start`
- `lp_step_complete` (step name as parameter)
- `lp_submit_attempt`
- `lp_submit_success` (conversion)
- `lp_submit_error` (error_code only)
 - `lp_offer_shown`
 - `lp_offer_accepted`
 - `lp_offer_rejected`
 - `lp_booking_started`
 - `lp_booking_completed`
 - `lp_game_started`
 - `lp_game_completed`
 - `lp_incentive_applied`

### Privacy / Consent
- Use a consent banner and only enable GA4 tracking after consent.
- Avoid sending PII to GA4 (no name/email/phone, no raw address).

## 5) Upload Handling and Validation
### Accepted files
- Images: JPEG/PNG (+HEIC optional), 1–5 required
- Video: optional MP4, ≤10 seconds

### Client-side (best effort)
- Compress images to ≤1MB when feasible.
- Provide progress UI for each file.

### Server-side validation (mandatory)
- Enforce max number of files.
- Enforce max size limits (configurable).
- Validate MIME type and extension.
- Validate MP4 duration (reject if >10s).
- Store files under a lead prefix:
  - `leads/<leadId>/images/<n>.<ext>`
  - `leads/<leadId>/video/video.mp4`

## 6) Google Forms / Drive / Dropbox Integration Options
### Option 1: Keep Google Forms (No uploads)
- Use Google Forms only for structured fields.
- Uploads handled separately (S3).
- Pros: easy ops, minimal engineering.
- Cons: data split across systems.

### Option 2: Google Sheets via Apps Script Webhook (Recommended “Google backend”)
- API calls Apps Script endpoint to append a row in a Google Sheet:
  - includes UTM fields + lead ID + storage links
- Pros: Google-native operations, no forced login, works with uploads stored elsewhere.
- Cons: requires Apps Script maintenance.

### Option 3: Drive/Dropbox folder per submission (Phase 2)
- After lead creation, a worker/job:
  - creates Drive/Dropbox folder
  - copies assets from S3 into that folder
  - stores share links in the lead row
- Pros: matches ops preference.
- Cons: more moving parts; must handle permissions and rate limits.

## 7) Email + SMS Confirmations (chosen)
### Email
- Prefer SendGrid for deliverability and webhook support (bounces, delivery status).
- Template includes:
  - lead reference ID
  - summary of device + condition
  - offer amount and next steps (collection booking)

### SMS (Twilio)
- Send short confirmation only (avoid sensitive info).
- Verify and format UK numbers.
- Add quiet hours policy if needed.

## 8) Offer, Booking, and Incentive Modules
### Offer calculation
- The offer must be produced server-side to avoid manipulation.
- Approach options:
  - deterministic rules engine (table-based pricing by make/model/condition)
  - pricing microservice (versioned models + audit trail)
- The API should return:
  - `offerId`, `leadId`, `amount`, `currency`, `expiresAt`, `termsVersion`
- Store the offer so the acceptance step can validate it later.

### Booking (collection + payout)
- Booking flow collects:
  - collection date/time window
  - bank details (or alternative payout method)
  - consent to terms
- Security scope is higher due to payout/bank data:
  - strict encryption at rest
  - least-privilege access controls
  - no PII in logs or analytics

### Incentive mini-game (spin the wheel)
- Results must be generated server-side with controls:
  - one play per lead/session
  - caps per campaign/day
  - audit trail of awarded incentives
- Possible outcomes:
  - voucher value (e.g. £15)
  - collection upgrade credit (e.g. +£5 for next-day collection)
  - consolation prize (e.g. free case/discount)

## 8) Security and Reliability
- Anti-spam:
  - hCaptcha/Turnstile or honeypot + rate limiting
- Secret management:
  - use Vercel env vars for API keys
- Storage security:
  - private bucket
  - short-lived pre-signed URLs
- Observability:
  - request IDs
  - structured logs (no PII)

## 9) Deployment (Vercel)
- Landing page shipped in the existing Next.js app.
- Environment variables on Vercel:
  - `NEXT_PUBLIC_GA4_ID` (or Firebase config if using Firebase SDK)
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
  - `SENDGRID_API_KEY` (or SMTP vars)
  - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
  - `UPLOAD_MAX_MB`, etc.

## 10) Open Decisions for Approval
- Final choice for “Google backend”:
  - Google Forms (no uploads) vs Apps Script to Sheets vs direct DB.
- Upload storage vendor:
  - AWS S3 vs Cloudflare R2 vs Backblaze B2 (all S3-compatible).
- Consent policy:
  - strict opt-in vs implied consent (recommend strict).
