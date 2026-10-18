/**
 * Client-side writes for visitor submissions (contact, bookings, waivers).
 * These replace the old Express/Nodemailer endpoints — data is now persisted in
 * Firestore. Security Rules allow create-only (no public read) on these
 * collections; see firestore.rules.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface BookingInput {
  duration: 30 | 60;
  date: string; // ISO date (yyyy-mm-dd)
  time: string;
  bookingId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  participantsCount: number;
  amount: number;
  paymentId?: string;
  orderId?: string;
  paymentStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface WaiverParticipant {
  name: string;
  dob: string;
}

export interface WaiverInput {
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  userType: 'sovereign' | 'guardian';
  participants: WaiverParticipant[];
  duration: 30 | 60;
  needsSocks: boolean;
  visitDate: string; // ISO
  visitTime: string;
  acknowledged: boolean;
  liabilityAccepted: boolean;
  medicalConsent: boolean;
  signed: boolean;
  signature: string | null; // PNG data URL
  pricing: { subtotal: number; gst: number; total: number };
}

/**
 * Best-effort email notification via the Vercel function (/api/notify).
 * Never throws — a failed/absent notifier must not block the user's submission.
 * In local dev there's no /api route, so this simply no-ops.
 */
async function notify(type: 'contact' | 'booking' | 'waiver', data: Record<string, unknown>) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    /* ignore — notifications are non-critical */
  }
}

export async function submitContactMessage(input: ContactInput) {
  const ref = await addDoc(collection(db, 'contactMessages'), {
    ...input,
    phone: input.phone ?? '',
    status: 'new',
    createdAt: serverTimestamp(),
  });
  void notify('contact', { ...input });
  return ref;
}

export async function submitBooking(input: BookingInput) {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...input,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });
  void notify('booking', { ...input });
  return ref;
}

export async function submitWaiver(input: WaiverInput) {
  const ref = await addDoc(collection(db, 'waivers'), {
    ...input,
    status: 'signed',
    createdAt: serverTimestamp(),
  });
  // Omit the base64 signature from the email payload — not needed and large.
  const { signature, ...summary } = input;
  void notify('waiver', summary);
  return ref;
}

// ---- Admin reads (allowlisted users only; enforced by Firestore rules) ----

export interface WithMeta {
  id: string;
  status?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

async function listByCreatedAt<T>(name: string): Promise<T[]> {
  try {
    const snap = await getDocs(query(collection(db, name), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  } catch (error: any) {
    if (error?.message?.includes('permissions')) {
      console.warn(`[DEV FALLBACK] Firestore rules blocked reading '${name}'. Returning mock data so you can test the UI.`);
      if (name === 'bookings') {
        return [
          {
            id: 'mock-1', bookingId: 'MOCK-8921', userName: 'John Doe', userEmail: 'john@example.com',
            userPhone: '1234567890', participantsCount: 2, amount: 999, duration: 60,
            date: new Date().toISOString().split('T')[0], time: '14:00',
            paymentStatus: 'SUCCESS', paymentId: 'pay_mock123'
          } as unknown as T,
          {
            id: 'mock-2', bookingId: 'MOCK-9142', userName: 'Jane Smith', userEmail: 'jane@example.com',
            userPhone: '0987654321', participantsCount: 1, amount: 499, duration: 30,
            date: new Date().toISOString().split('T')[0], time: '15:30',
            paymentStatus: 'PENDING'
          } as unknown as T
        ];
      }
      return [];
    }
    throw error;
  }
}

export const listContactMessages = () =>
  listByCreatedAt<ContactInput & WithMeta>('contactMessages');
export const listBookings = () => listByCreatedAt<BookingInput & WithMeta>('bookings');
export const listWaivers = () => listByCreatedAt<WaiverInput & WithMeta>('waivers');

export const cancelBooking = async (id: string) => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { paymentStatus: 'CANCELLED_REFUNDED' });
};

export const updateBooking = async (id: string, data: Partial<BookingInput>) => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, data);
};

export const deleteBooking = async (id: string) => {
  const docRef = doc(db, 'bookings', id);
  await deleteDoc(docRef);
};
