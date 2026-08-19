# Mobile Arcade Ad Landing Page — Requirements (Draft for CTO/CEO Approval)

## 1) Objective
Create a dedicated, high-conversion landing page for paid social campaigns that:
- Tracks which URL/campaign a visitor arrived from (attribution).
- Tracks how many unique visitors complete a single primary action (conversion).
- Captures device + condition details and media (photos required, optional short video).
- Provides confirmation via email and SMS.

Primary conversion event: **Lead submission (valuation/repair enquiry)**.

## 2) Success Metrics
- Conversion rate: sessions → lead submissions.
- Cost per lead: ad spend → lead submissions.
- Completion rate by step (device → make → model → condition → upload → submit).
- Upload completion and failure rate (by device/browser/network).

## 3) Landing Page UX Requirements
### 3.1 Page format
- A single landing page route (e.g. `/lp/device-trade-in` or `/campaigns/<slug>`).
- One unified **parallax scroll** background (high-resolution image).
- Minimal distractions (avoid global nav for campaign traffic; provide a small logo only).
- Clear value proposition and trust cues above the fold.
- One primary call to action: **complete the form**.

### 3.2 Media background
- Uses a high-resolution image from `public/…` (placeholder initially).
- Must support future replacement by uploading a new file to the repo (same path/name).
- Must be optimized for performance (responsive sizes, lazy-load below the fold).

## 4) Form Requirements (Front-End)
### 4.1 Fields and logic
1) Device type (radio, required):
   - Laptop
   - Phone
   - Tablet
   - Gaming
2) Device make (typeahead select, required)
3) Device model (typeahead select, required)
4) Condition (radio, required):
   - Brand New (Sealed)
   - Used
5) If condition = Used, show secondary condition (radio, required):
   - Cracked but working
   - Cracked and not working
   - Fair
   - Good
   - Excellent

### 4.2 Upload requirements
- Photos:
  - At least **1 photo required**, up to **5 photos maximum**.
  - Source: camera, photo library, or file browse (device dependent).
  - Allowed formats: JPG/PNG/HEIC (HEIC optional depending on browser support).
- Video:
  - Optional **1 video**.
  - Must be **MP4**, **≤ 10 seconds**.
  - If enforcing duration client-side is unreliable, validate on server and reject if longer.

### 4.3 File sizing strategy
- Best effort: compress images client-side to ≤ 1MB each.
- If compression fails or is unsupported: allow larger files and compress later in storage pipeline.

### 4.4 Validation and accessibility
- All required fields validated before submit.
- Clear error messaging per field.
- Accessible controls (keyboard navigation, labels, focus management).

## 5) Submission + Data Capture Requirements
### 5.1 Attribution capture
- Capture UTM parameters:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Persist UTMs during the session (and optionally across refresh using localStorage).
- Store UTMs with the lead record.

### 5.2 Analytics (chosen)
Implement **Firebase / GA4** tracking:
- Page view and session attribution based on UTM.
- Event tracking:
  - `lp_form_start`
  - `lp_step_complete` (device/make/model/condition/uploads)
  - `lp_submit_attempt`
  - `lp_submit_success`
  - `lp_submit_error` (with error code only, no PII)
- Conversion: mark `lp_submit_success` as a GA4 conversion event.

### 5.3 Backend destination (initial)
User stated: **Google Forms** for responses, plus uploads stored in Drive/Dropbox per submission.

Important constraint: public Google Forms cannot accept file uploads without forcing users to log in with a Google account (this is a Google Forms limitation). Sources:
- Google Forms forces sign-in when a form includes a file upload question: https://support.google.com/docs/community-guide/395355672/google-forms-why-your-respondents-are-being-forced-to-login
- “Public Google Forms can't accept file uploads” (file upload forces sign-in): https://www.ezfiledrop.com/articles/how-to-make-a-google-form-public

Because this campaign landing page must be frictionless, the recommended approach is:
- Store uploads in **S3-compatible storage** (phase 1), then optionally sync to Drive/Dropbox later.
- Store the structured lead payload in **Google Sheets** (via Apps Script webhook) or in a database, and optionally mirror to Google Forms/Sheets for team workflows.

## 6) Confirmation Requirements (chosen: Email + SMS)
### 6.1 Offer experience (replaces “thank you”)
- After the form is submitted and the payload is accepted by the backend, the UI must show an **instant valuation offer modal** (not a generic thank-you).
- The modal displays:
  - Offer amount: **£[amount]**
  - Device summary: type/make/model + condition
  - Reference ID
  - What happens next (collection + payment)
- The modal includes delight UX:
  - animated count-up for the £ amount
  - confetti animation on reveal
- The modal includes two primary actions:
  1) **Accept £[amount] & book free collection**
  2) **Not happy with price**

Technical challenges and considerations:
- The “instant offer” requires a deterministic pricing function or pricing API that can return a quote quickly and consistently.
- If the pricing logic depends on images/video, the system must define whether:
  - pricing is based on the structured fields only (fast, consistent), or
  - pricing is “provisional” until media review (more accurate but less instant).
- The offer modal must be safe against tampering:
  - do not calculate the offer purely client-side
  - server should sign/return an immutable offer payload and store it with the lead
- Analytics:
  - track `lp_offer_shown`, `lp_offer_accepted`, `lp_offer_rejected`
  - record the offered amount and acceptance outcome (no PII in analytics)

### 6.2 Accept path (booking free collection)
- If the user accepts the offer:
  - the landing page transitions into a booking journey for **free collection**.
  - required fields include:
    - collection date selector
    - confirmation of terms and conditions
    - payout/bank details (or alternative payout methods if later added)

Technical challenges and considerations:
- Bank details are highly sensitive and increase compliance scope:
  - use HTTPS only, no logging of bank details, strict access controls
  - consider tokenization / third-party payout rails in a later phase
  - define retention policy and who can access the data operationally
- Anti-fraud requirements:
  - duplicate submissions
  - mismatched identity details
  - device ownership and eligibility checks
- Booking UX must be resilient:
  - allow re-open via link using reference ID
  - handle drop-off if the user abandons mid-journey

### 6.3 Reject path (“not happy with price” incentive)
- If the user presses “Not happy with price”:
  - show a lightweight incentive journey to salvage conversion.
  - suggested mechanic: a mini web game (e.g. **spin the wheel**) to unlock one of:
    - +£15 Mobile Arcade voucher
    - +£5 added for next-day collection booking
    - other controlled incentives

Technical challenges and considerations:
- Prevent abuse:
  - incentive outcomes must be generated server-side and stored against the lead
  - enforce one play per lead/session (rate limit + idempotency)
  - limit incentive inventory and cap total exposure per campaign/day
- Regulatory and UX clarity:
  - clearly label voucher vs cash uplift
  - include T&Cs and expiry for vouchers
- Analytics:
  - track `lp_offer_rejected`, `lp_game_started`, `lp_game_completed`, `lp_incentive_applied`
  - measure uplift in acceptance after incentive

### 6.2 Messaging
- Email confirmation:
  - Provider options: SendGrid (recommended), or GoDaddy SMTP (fallback).
- SMS confirmation via Twilio:
  - Must handle UK phone formatting.
  - Must avoid sending sensitive details in SMS.

## 7) Security, Privacy, and Compliance
- Consent banner (UK/EU): analytics only after consent (or configure GA4 consent mode).
- Do not store secrets client-side.
- Rate limiting + spam prevention:
  - Invisible turnstile/reCAPTCHA or honeypot field
  - IP-based throttling on submit endpoint
- File validation server-side:
  - Content-type checks, extension checks, max size, video format/time constraints.
- PII handling:
  - Encrypt at rest where possible
  - Restrict access to storage buckets
  - Retention policy for uploads (e.g., auto-delete after N days if no follow-up)

## 8) Non-Functional Requirements
- Performance: fast first paint (ad traffic is mobile-heavy).
- Reliability: uploads resilient to flaky networks (resume support optional).
- Observability:
  - error logging (sanitized)
  - upload failure monitoring

## 9) Delivery Plan (Phased)
### Phase 1 (MVP for ads)
- Landing page UI + form
- Uploads to S3 (photos required, optional MP4)
- Lead stored with UTMs
- GA4 event + conversion tracking
- Offer modal with accept/reject actions
- Email + SMS confirmation

### Phase 2 (Ops automation)
- Sync to Google Drive folders per lead (optional)
- Sync to Google Forms/Sheets if required for internal workflows
- Admin dashboard / lead review page
