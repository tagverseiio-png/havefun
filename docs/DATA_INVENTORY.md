# HavFun — Current Data Inventory (pre-Firebase migration)

> Snapshot taken **2026-06-28** before migrating the backend to Firebase.
> Goal: capture every piece of data currently hardcoded in the app so it can be
> seeded into Firestore, and list the dynamic data the app *should* persist but
> currently doesn't.

---

## 0. Current architecture (before migration)

| Layer | What exists today |
|-------|-------------------|
| Frontend | Vite + React + TS + shadcn/ui + TanStack Query (Pages: `Index`, `Booking`, `Waiver`, `NotFound`) |
| Backend | `server/index.js` — Express 5 + Nodemailer. Two endpoints: `POST /api/contact`, `POST /api/waiver`. **Emails only — nothing is stored.** |
| DB | **None.** All content is hardcoded in components; all bookings/waivers are emailed and lost. |
| Payments | External Razorpay link (`https://razorpay.me/@vvpsentertainmentandadventure`) — not integrated |
| Booking calendar | Calendly link in `pricing-config.ts` + a **mock** slot generator (random availability) |

**Migration target:** Firebase project `havefun-9b5b2` (Firestore + Storage + Auth), frontend on Vercel.

---

## 1. Static content data (hardcoded → seed into Firestore)

### 1.1 Site / business info
Source: `Contact.tsx`, `About.tsx`, `FAQ.tsx`

| Field | Value |
|-------|-------|
| Business name | HavFun Trampoline Park |
| Address | 2nd floor, Velachery Service Road, Karnival food Street, Kora, Velachery, Chennai, Tamil Nadu 600042 |
| Phone | 7010180483 (`tel:+917010180483`) |
| Email | havfuntrampolinepark@gmail.com |
| Working hours | Monday–Sunday, 10 AM – 10 PM |
| Instagram | https://www.instagram.com/havfun_trampolinepark |
| Website | https://havfuntrampolinepark.com |
| Google Maps | https://maps.app.goo.gl/Yer8udFFQVCq5obz9 |
| Weight limit | 100 kg |
| Age note | Children below 6 have a designated zone |

→ Suggested Firestore: `settings/site` (single doc).

### 1.2 Pricing config
Source: `src/lib/pricing-config.ts` (also drives `Pricing.tsx`, `Waiver.tsx`, `Hero.tsx`)

```
bookingLink:            https://calendly.com/havfuntrampolinepark
basic.30:               ₹350   (30 min)
basic.60:               ₹550   (60 min)
offers.weekdaySpecial:  ₹99    (flat, Mon–Fri 10am–5pm)
offers.offPeakDiscount: 0.30   (30% off evenings/weekends)
gripSocks:              ₹80    (mandatory add-on, per person)
gst:                    0.05   (5%)
hours.weekdayOfferStart 10  (10 AM)
hours.weekdayOfferEnd   17  (5 PM)
hours.offPeakStartDay   17  (5 PM)
```
Pricing rule (`calculateBasePrice`):
- Weekday 10am–5pm → flat ₹99
- Weekend OR weekday after 5pm → base price − 30%
- Otherwise → base price

→ Suggested Firestore: `settings/pricing` (single doc). Keep the `calculateBasePrice`
logic in the frontend; only the numbers move to Firestore.

### 1.3 Attractions (6)
Source: `Attractions.tsx`

| Title | Image |
|-------|-------|
| Kids Zone | .../DSC08420-min-1024x683.jpg |
| Foam Pits | .../DSC08204-min-scaled.jpg |
| Slam Dunk Zone | .../DSC08368-min-scaled.jpg |
| Wipe Out | .../DSC08218-min-scaled.jpg |
| Main Court | .../DSC08259-min-scaled.jpg |
| Spider Wall | .../DSC08254-min-scaled.jpg |

(Descriptions are in the component — preserve verbatim when seeding.)
→ Firestore: `attractions/{id}` collection, fields `title`, `description`, `image`, `order`.

### 1.4 Safety features (4)
Source: `Safety.tsx`

| Title | Icon image |
|-------|-----------|
| Trained Professionals | .../WhatsApp-Image-2024-10-08-at-4.17.20-PM3.jpeg1_.png |
| Safety Equipment | .../WhatsApp-Image-2024-10-08-at-4.17.20-PM3.png |
| First-Aid Ready | .../WhatsApp-Image-2024-10-08-at-4.17.20-PM2.jpeg.png |
| Clean and Sanitized | .../WhatsApp-Image-2024-10-08-at-4.17.20-PM11.png |

→ Firestore: `safetyFeatures/{id}`.

### 1.5 FAQs (6)
Source: `FAQ.tsx` — Q/A pairs (park hours, what to wear, age restrictions,
food/drinks, safety measures, weight limit). Preserve verbatim.
→ Firestore: `faqs/{id}`, fields `question`, `answer`, `order`.

### 1.6 Cafe section
Source: `Cafe.tsx` — two categories: **Snacks** ("Savory meals & fresh sandwiches"),
**Drinks** ("Craft mojitos & refreshing sodas"). 4 cafe images (DSC08314, DSC08409,
DSC08245-min1, DSC08382). "View Full Menu" button currently does nothing.
→ Firestore: `settings/cafe` or `cafeItems/{id}` if a real menu is added.

### 1.7 Gallery (6 active images)
Source: `ImageGallery.tsx` — each has `src`, `title`, `subtitle`:
DSC08204 (Foam Pit Fun / Soft Landings), DSC08368 (Slam Dunk / Sky High),
DSC08218 (Obstacle Course / Agility Test), DSC08259 (Main Court / Free Jump),
DSC08254 (Spider Wall / Sticky Situation), DSC08314 (HavFun Cafe / Refresh & Recharge).
→ Firestore: `gallery/{id}`.

### 1.8 Testimonials / videos
Source: `Testimonials.tsx` — 3 **local** videos with fake view counts:
`havefun01.mp4` (15.2K), `havefun02.mp4` (10.8K), `havefun03.mp4` (9.4K).
→ Firestore: `gallery` (type=video) or `settings/community`. Videos go to **Storage**, not Firestore.

### 1.9 Schedule stats (decorative)
Source: `Schedule.tsx` — "24+ Slots Daily", "98% Peak Efficiency", "100% Instant Sync",
"Guaranteed No Wait Time". Marketing copy, not real data. Optional to seed.

---

## 2. Media assets inventory

### 2.1 Remote images (hosted on havfuntrampolinepark.com)
Full list in `site_assets.md` (12 gallery images + logo + favicon + banner + 4 safety
icons + 2 remote videos). **These are hot-linked from WordPress.** For Firebase you'll
want to download → compress → re-host in Firebase Storage (or inline small ones in
Firestore as base64, per the ≤600 KB requirement below).

### 2.2 Local assets — `src/assets/` (⚠️ oversized, need compression)
| File | Size | Note |
|------|------|------|
| basketball-zone.png | 2.31 MB | used in Waiver |
| bubble-balls.png | 2.18 MB | used in Waiver |
| jungle-playground.png | 2.54 MB | used in Waiver |
| obstacle-zone.png | 1.76 MB | used in Waiver |
| trampoline-zone.png | 96 KB | used in Waiver |
| havefun01.mp4 | 2.85 MB | testimonial video |
| havefun02.mp4 | 7.08 MB | testimonial video |
| havefun03.mp4 | 2.93 MB | testimonial video |

> **Firestore note:** a Firestore document has a hard **1 MB limit**. The requirement
> to compress images to ~**600 KB** is so they can be stored as base64 inside a
> Firestore doc with headroom (base64 inflates bytes ~33%, so 600 KB raw ≈ ~800 KB
> encoded — still under 1 MB). **Recommendation:** prefer **Firebase Storage** for
> images/videos and keep only the *URL* in Firestore. If inlining is required, the
> 4 PNGs above MUST be compressed (they're 2–2.5 MB now). Videos cannot be inlined —
> Storage only.

---

## 3. Dynamic data the app collects (currently NOT persisted — must move to Firestore)

### 3.1 Contact messages
Source: `Contact.tsx` → `POST /api/contact`
Fields: `name`, `email`, `phone` (optional), `message`. Currently emailed only.
→ Firestore: `contactMessages/{id}` + `createdAt`, `status`.

### 3.2 Bookings
Source: `BookingAssistant.tsx` — **entirely mock right now**:
- Slots `09:00`–`20:00` (30-min steps), capacity 30/slot, availability is `Math.random()`.
- Booking ID generated client-side (`HF-xxxx`), never saved.
- Double-booking check uses `localStorage` only.
Fields to capture: `duration` (30|60), `date`, `time`, `bookingId`, `status`, plus
customer link.
→ Firestore: `bookings/{id}` + a `slots`/availability model so capacity is real, not random.

### 3.3 Waivers (⚠️ legal records — highest priority to persist)
Source: `Waiver.tsx` → `POST /api/waiver` (emailed only, **not stored** = liability).
Captured `FormData`:
```
acknowledged, liabilityAccepted, medicalConsent (booleans)
name, email, phone, emergencyContact
signed (boolean)  + signature image from SignaturePad (NOT currently sent!)
participants: [{ name, dob, id }]
duration (30|60), needsSocks (bool)
visitDate, visitTime
userType: 'sovereign' | 'guardian'
```
Pricing is computed at submit (`calculateTotal`): base × participants + socks + 5% GST.
→ Firestore: `waivers/{id}` (store signature image in Storage, keep URL + timestamp).
   Link to `bookings` and a `customers` collection.

### 3.4 Payments
Currently a static Razorpay.me link — no record of who paid. Out of scope for the
data dump, but note: bookings/waivers should eventually carry a `paymentStatus`.

---

## 4. Hardcoded values that block deployment (fix during migration)

- `Contact.tsx` and `Waiver.tsx` both POST to **`http://localhost:5000`** — hardcoded.
  Must become an env-based URL or move to Firebase callable functions / direct SDK writes.
- `server/.env` holds SMTP creds (Gmail). On Firebase, email sending moves to a Cloud
  Function or a transactional provider.

---

## 5. Proposed Firestore collection map (summary)

```
settings/site            ← business info, hours, socials, map
settings/pricing         ← pricing-config numbers
settings/cafe            ← cafe categories + images
attractions/{id}         ← 6 zones
safetyFeatures/{id}      ← 4 items
faqs/{id}                ← 6 Q/A
gallery/{id}             ← images + videos (Storage URLs)
contactMessages/{id}     ← NEW, from contact form
customers/{id}           ← NEW, dedup by email/phone
bookings/{id}            ← NEW, real slots + capacity
slots/{date}             ← NEW, availability per day (replaces random mock)
waivers/{id}             ← NEW, legal record + signature URL
```

Storage buckets: `gallery/`, `attractions/`, `safety/`, `signatures/`, `videos/`.

---

## 6. Migration checklist (next steps)

- [ ] Confirm: inline images in Firestore (≤600 KB) vs. Firebase Storage + URL (recommended)
- [ ] Download all remote images from `site_assets.md` + compress local PNGs to ≤600 KB
- [ ] Add Firebase SDK to frontend; create `src/lib/firebase.ts` with provided config
- [ ] Write seed script to push sections 1.1–1.9 into Firestore
- [ ] Refactor components to read content from Firestore via TanStack Query
- [ ] Replace localhost endpoints: waiver/contact/booking → Firestore writes (or Cloud Functions)
- [ ] Persist signature image (Storage) + waiver doc
- [ ] Replace mock booking slots with real availability model
- [ ] Set Firestore security rules (public read for content, restricted write)
- [ ] Configure Vercel env vars + deploy
```
