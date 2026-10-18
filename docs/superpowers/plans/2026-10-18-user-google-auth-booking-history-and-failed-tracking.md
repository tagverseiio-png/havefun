# User Google Auth, Profile Booking History, and Admin Failed Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 1-click Google customer authentication, customer `/profile` with booking history, and admin-side tracking/filtering of failed and abandoned booking attempts.

**Architecture:** Firebase Google Auth integrated via a global `AuthContext`. Bookings are initiated as `PENDING` in Firestore with the user's ID/email and updated to `SUCCESS` or `FAILED` (with error details) based on Razorpay checkout results. A new `/profile` page shows the customer's personal booking history, while `/admin` adds filters to inspect confirmed, pending, and failed bookings.

**Tech Stack:** React 18, Vite, TypeScript, Firebase Auth (GoogleAuthProvider), Firestore, Lucide React, Tailwind CSS, Sonner toasts.

**Spec:** [docs/superpowers/specs/2026-10-18-user-google-auth-booking-history-and-failed-tracking-design.md](file:///Users/user/Workspace/Projects/Strucureo_Projects/Harry_projects/havefun/docs/superpowers/specs/2026-10-18-user-google-auth-booking-history-and-failed-tracking-design.md)

## Global Constraints
- Google OAuth is the only authentication method for customers (no email/password signup forms).
- Customers can only read and view their own bookings; Admins retain full access to all bookings.
- No secrets exposed in client-side code (Firebase Web API keys and Razorpay Key ID are public; Razorpay Key Secret remains server-only).
- UI follows HavFun's dark neon aesthetics, glassmorphism, and responsive layout.

## Review Focus
- Unauthenticated user attempting to visit `/profile`: Must display friendly sign-in prompt instead of crashing or showing empty screen.
- Razorpay popup closed without paying: Booking document must remain `PENDING` so Admin can identify abandoned checkouts.
- Razorpay payment failure: Booking document must update to `FAILED` with descriptive error reason.
- User sign-out: Immediate local cache clearing so another user logging in does not see prior user's booking history.
- Network error during booking creation: Graceful error toast with retry guidance.

---

### Task 1: Global Authentication Context (`AuthContext.tsx`)

**Files:**
- Create: `src/context/AuthContext.tsx`
- Modify: `src/App.tsx:1-35`

**Interfaces:**
- Produces:
  ```typescript
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<User>;
    signOutUser: () => Promise<void>;
  }
  export const useAuth: () => AuthContextType;
  ```

- [ ] **Step 1: Create `src/context/AuthContext.tsx`**
  Implement `AuthProvider` using Firebase `GoogleAuthProvider`, `signInWithPopup`, and `onAuthStateChanged`. Export `useAuth` hook.

- [ ] **Step 2: Wrap application with `AuthProvider` in `src/App.tsx`**
  Import `AuthProvider` and wrap `<TooltipProvider>` / `<BrowserRouter>`.

- [ ] **Step 3: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/context/AuthContext.tsx src/App.tsx
  git commit -m "feat: add AuthContext with Google sign-in provider"
  ```

---

### Task 2: Submissions Schema & Firestore Queries (`submissions.ts`)

**Files:**
- Modify: `src/lib/submissions.ts:25-175`

**Interfaces:**
- Consumes: Firebase `db` from `@/lib/firebase`
- Produces:
  ```typescript
  export interface BookingInput {
    // existing fields...
    userId?: string;
    failureReason?: string;
    paymentStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED_REFUNDED' | 'COMPLETED';
  }
  export const listUserBookings: (userId: string, email?: string) => Promise<WithMeta<BookingInput>[]>;
  export const recordBookingAttempt: (data: BookingInput) => Promise<string>;
  export const updateBookingStatus: (id: string, status: BookingInput['paymentStatus'], details?: Partial<BookingInput>) => Promise<void>;
  ```

- [ ] **Step 1: Update `BookingInput` interface in `src/lib/submissions.ts`**
  Add `userId?: string` and `failureReason?: string`.

- [ ] **Step 2: Add `listUserBookings`, `recordBookingAttempt`, and `updateBookingStatus`**
  - `recordBookingAttempt`: Writes document to `bookings` collection with `serverTimestamp()`, returning document ID.
  - `updateBookingStatus`: Updates status and optional `failureReason`, `paymentId`, etc.
  - `listUserBookings`: Queries `bookings` where `userId == userId` or `userEmail == email`, sorted by `createdAt desc`.

- [ ] **Step 3: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/lib/submissions.ts
  git commit -m "feat: add user booking queries and attempt tracking functions"
  ```

---

### Task 3: Firestore Security Rules (`firestore.rules`)

**Files:**
- Modify: `firestore.rules:55-65`

**Interfaces:**
- Consumes: `request.auth.uid`, `request.auth.token.email`
- Produces: Updated security rules for `/bookings/{doc}`

- [ ] **Step 1: Update `/bookings/{doc}` security rules in `firestore.rules`**
  Allow customer read for own bookings:
  ```javascript
  match /bookings/{doc} {
    allow create: if request.resource.data.keys().hasAll(['date', 'time', 'duration']);
    allow read: if isAdmin() || 
      (request.auth != null && (
        resource.data.userId == request.auth.uid || 
        resource.data.userEmail == request.auth.token.email
      ));
    allow update: if isAdmin() || 
      (request.auth != null && resource.data.userId == request.auth.uid);
    allow delete: if isAdmin();
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add firestore.rules
  git commit -m "security: allow authenticated users to read their own bookings"
  ```

---

### Task 4: BookingAssistant Integration (`BookingAssistant.tsx`)

**Files:**
- Modify: `src/components/HavFun/BookingAssistant.tsx:100-210`

**Interfaces:**
- Consumes: `useAuth` from `@/context/AuthContext`, `recordBookingAttempt`, `updateBookingStatus` from `@/lib/submissions`

- [ ] **Step 1: Integrate `useAuth` into `BookingAssistant.tsx`**
  - Auto-populate `userDetails.name` and `userDetails.email` when `user` is logged in.
  - Display inline Google sign-in prompt if user is guest, or prompt Google login before opening payment.

- [ ] **Step 2: Capture `PENDING` booking before payment initiation**
  - Call `recordBookingAttempt` with `paymentStatus: 'PENDING'` and `userId: user?.uid`.
  - Store the created Firestore doc ID.

- [ ] **Step 3: Update status to `SUCCESS` or `FAILED`**
  - On payment verified: Call `updateBookingStatus(docId, 'SUCCESS', { paymentId: ... })`.
  - On `payment.failed`: Call `updateBookingStatus(docId, 'FAILED', { failureReason: response.error?.description })`.

- [ ] **Step 4: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/HavFun/BookingAssistant.tsx
  git commit -m "feat: record pending and failed bookings in BookingAssistant"
  ```

---

### Task 5: Navbar Google Authentication & Profile Dropdown

**Files:**
- Modify: `src/components/HavFun/Navbar.tsx:1-120`

**Interfaces:**
- Consumes: `useAuth` from `@/context/AuthContext`

- [ ] **Step 1: Add user profile / sign-in button to `Navbar.tsx`**
  - When logged out: "Sign In" button with Google icon that calls `signInWithGoogle()`.
  - When logged in: Profile avatar with user image/initials. Clicking opens a dropdown with:
    - User display name and email.
    - "My Bookings & Profile" linking to `/profile`.
    - "Sign Out" calling `signOutUser()`.

- [ ] **Step 2: Verify responsive design on mobile and desktop**
  Ensure button renders cleanly without cluttering the mobile menu.

- [ ] **Step 3: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/HavFun/Navbar.tsx
  git commit -m "feat: add Google sign-in and user profile dropdown to Navbar"
  ```

---

### Task 6: Customer Profile & Booking History Page (`Profile.tsx`)

**Files:**
- Create: `src/pages/Profile.tsx`
- Modify: `src/App.tsx:20-30`

**Interfaces:**
- Consumes: `useAuth` from `@/context/AuthContext`, `listUserBookings` from `@/lib/submissions`

- [ ] **Step 1: Create `src/pages/Profile.tsx`**
  - User header with Google avatar, name, email, and Sign Out button.
  - Filter tabs: **All**, **Upcoming**, **Past Visits**.
  - List of booking cards with:
    - Booking ID badge
    - Date, time, duration, and participant count
    - Amount paid
    - Status pill (`SUCCESS`, `PENDING`, `FAILED`, `CANCELLED_REFUNDED`)
  - Empty state with "Book Your Flight" button directing to `/booking`.

- [ ] **Step 2: Register `/profile` route in `src/App.tsx`**
  Add `<Route path="/profile" element={<Profile />} />`.

- [ ] **Step 3: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/Profile.tsx src/App.tsx
  git commit -m "feat: create customer profile and booking history page"
  ```

---

### Task 7: Admin Panel Tracking for Failed & Incomplete Bookings (`Admin.tsx`)

**Files:**
- Modify: `src/pages/Admin.tsx:240-420`

**Interfaces:**
- Consumes: `listBookings` from `@/lib/submissions`

- [ ] **Step 1: Add status filter tabs in Admin Bookings section**
  Add filter pills: `All`, `Confirmed (SUCCESS)`, `Pending / Abandoned (PENDING)`, `Failed (FAILED)`.

- [ ] **Step 2: Add failure details display in Bookings table**
  For bookings with `FAILED` or `PENDING` status:
  - Highlight status with distinct red (`FAILED`) or amber (`PENDING`) badges.
  - Display `failureReason` (e.g. `payment_risk_check_failed`, `cancelled_by_user`).
  - Keep customer phone and email clearly visible so admin can contact them.

- [ ] **Step 3: Verify build passes**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/Admin.tsx
  git commit -m "feat: add failed and abandoned booking tracking and filters to Admin panel"
  ```

---

### Task 8: End-to-End Verification & Production Deployment

- [ ] **Step 1: Build check**
  Run: `npm run build`
- [ ] **Step 2: Deploy Firestore Security Rules**
  Run: `npx firebase-tools deploy --only firestore:rules`
- [ ] **Step 3: Push changes to main**
  Run: `git push origin main`
- [ ] **Step 4: Verify live on browser**
  Test Google login, booking creation, profile history, and admin filters on `https://www.havfuntrampolinepark.com`.
