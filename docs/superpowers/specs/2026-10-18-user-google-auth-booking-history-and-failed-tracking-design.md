# User Google Auth, Profile Booking History, and Admin Failed Booking Tracking

## Overview
This feature introduces customer account management via Google OAuth (Firebase Auth), a dedicated Customer Profile & Booking History page (`/profile`), and enhanced booking analytics in the Admin Panel (`/admin`) to record and track both successful, pending/abandoned, and failed booking attempts.

---

## 1. User Authentication (Google OAuth Only)
### Requirements
- Customers sign in with their Google account using Firebase Auth (`GoogleAuthProvider`).
- No email/password or phone OTP forms for customers — 1-click Google popup only.
- Authentication state is shared across the entire application via `AuthContext` (`useAuth` hook).

### User Flow
1. **Navbar Integration:**
   - If not signed in: Displays a sleek "Sign in with Google" button with Google G icon.
   - If signed in: Displays user profile photo (avatar) with their first name. Clicking it opens a dropdown menu with:
     - "My Bookings & Profile" -> links to `/profile`
     - "Sign Out"
2. **Booking Flow Integration:**
   - Inside `BookingAssistant.tsx`, when selecting tickets, if the user is not signed in:
     - Displays an inline prompt: *"Sign in with Google to reserve tickets and view booking history"*.
     - Name and email fields are auto-filled and locked from the Google profile once signed in; phone number is prompted for WhatsApp/SMS notifications.
     - If user clicks "Pay & Book" while signed out, Google popup opens seamlessly before proceeding to payment.

---

## 2. Customer Profile & Booking History (`/profile`)
### Route: `/profile`
- Protected route: If a user visits `/profile` while signed out, prompts Google sign-in.
- **Header Section:**
  - Customer avatar (from Google), Display Name, Email, and Member Since date.
  - Sign-out button.
- **Booking History Section:**
  - Fetches all bookings where `userId == auth.currentUser.uid` or `userEmail == auth.currentUser.email`.
  - Filter tabs: **All**, **Upcoming**, **Past Visits**.
  - **Ticket Card Details:**
    - Booking ID (e.g. `HF-ABC123XYZ`)
    - Date & Time Slot (e.g. `Mon, Oct 19, 2026 - 10:00 AM`)
    - Duration (`30 Minutes` or `1 Hour`)
    - Number of Jumpers (`Participants: X`)
    - Total Amount Paid (e.g. `₹350`)
    - Payment Status Badge:
      - `SUCCESS` (Green)
      - `PENDING` (Amber / Yellow)
      - `FAILED` (Red / Destructive)
      - `CANCELLED_REFUNDED` (Orange)
    - Action: "Book Another Ticket" or "Contact Support".

---

## 3. Failed & Abandoned Booking Tracking in Admin
### Problem Solved
Currently, if a customer creates an order but closes the payment modal, gets a bank rejection, or experiences a gateway failure, no record is saved in Firestore. The Admin cannot see who attempted to book or reach out to assist them.

### Capture Lifecycle
1. **Initiation (`PENDING`):**
   - As soon as the Razorpay order is generated on the backend, a booking document is created in Firestore with:
     - `paymentStatus: 'PENDING'`
     - `userId`: `user.uid`
     - `userName`, `userEmail`, `userPhone`
     - `duration`, `date`, `time`, `amount`, `orderId`
     - `createdAt`: server timestamp
2. **Success (`SUCCESS`):**
   - When Razorpay callback returns successfully and server signature is verified, document is updated to:
     - `paymentStatus: 'SUCCESS'`
     - `paymentId`: `razorpay_payment_id`
3. **Failure (`FAILED`):**
   - If Razorpay triggers `payment.failed`, document is updated to:
     - `paymentStatus: 'FAILED'`
     - `failureReason`: error description (e.g., `payment_risk_check_failed`, `insufficient_funds`, `user_cancelled`)
   - If the user closes the checkout popup without paying, status remains `PENDING` (allowing admin to identify abandoned checkouts).

### Admin UI (`/admin -> Submissions -> Bookings`)
- **Status Filter Pills:** `All`, `Confirmed (Success)`, `Pending / Abandoned`, `Failed`.
- **Table Displays:**
  - Booking ID
  - Customer Name, Email, Phone
  - Slot (Date & Time)
  - Amount
  - Status badge (Color-coded)
  - Failure Note (tooltip or column showing reason for failure)
  - Actions: Delete, Edit Status, or Manual Check-in.

---

## 4. Firestore Security Rules
Update `firestore.rules` for the `/bookings` collection:
```javascript
match /bookings/{doc} {
  // Allow creation with valid fields
  allow create: if request.resource.data.keys().hasAll(['date', 'time', 'duration']);
  
  // Admins can read, update, delete everything
  // Customers can read their own bookings
  allow read: if isAdmin() || 
    (request.auth != null && (
      resource.data.userId == request.auth.uid || 
      resource.data.userEmail == request.auth.token.email
    ));

  // Customers can update their pending booking to failed or add client details
  allow update: if isAdmin() || 
    (request.auth != null && resource.data.userId == request.auth.uid);

  allow delete: if isAdmin();
}
```

---

## 5. Technical Implementation Details

### Files to Create
1. **`src/context/AuthContext.tsx`**:
   - Manages Firebase `onAuthStateChanged`.
   - Exports `user`, `loading`, `signInWithGoogle`, and `signOutUser`.
2. **`src/pages/Profile.tsx`**:
   - Full customer dashboard with Google user card, booking history list, and status pills.

### Files to Modify
1. **`src/App.tsx`**:
   - Wrap application with `AuthProvider`.
   - Add `/profile` route.
2. **`src/components/HavFun/Navbar.tsx`** (or main Header):
   - Add Google Sign-in / User Avatar dropdown button.
3. **`src/components/HavFun/BookingAssistant.tsx`**:
   - Integrate `useAuth` hook.
   - Auto-fill user name and email from Google auth.
   - Capture `PENDING` booking before payment and update to `SUCCESS` or `FAILED`.
4. **`src/lib/submissions.ts`**:
   - Add `userId` to `BookingInput`.
   - Add `getUserBookings(userId, userEmail)` function.
   - Add `updateBookingStatus(id, status, details)` helper.
5. **`src/pages/Admin.tsx`**:
   - Add status filter (`All`, `SUCCESS`, `PENDING`, `FAILED`).
   - Add failure reason badge / column.
6. **`firestore.rules`**:
   - Allow users to query their own bookings.

---

## 6. Verification & Test Plan
1. **Google Auth Verification:**
   - Test sign in with Google from Navbar.
   - Verify avatar and display name display.
   - Test sign out.
2. **Booking Flow Verification:**
   - Verify user details auto-fill in booking assistant when logged in.
   - Initiate payment, cancel popup, verify `FAILED` or `PENDING` booking appears in Firestore.
   - Complete payment and verify status updates to `SUCCESS`.
3. **Customer Profile Verification:**
   - Visit `/profile`.
   - Confirm customer's bookings are listed with correct dates, times, amounts, and statuses.
4. **Admin Dashboard Verification:**
   - Log into `/admin`.
   - Toggle filters: verify `FAILED` attempts display failure reason and customer contact info.
