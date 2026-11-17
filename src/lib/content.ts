/**
 * Firestore content layer for HavFun.
 * Typed fetchers for the static content seeded by scripts/seed-firestore.mjs.
 * Images come back as base64 data URIs stored inline on each document.
 */
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  phoneE164: string;
  email: string;
  hours: string;
  instagram: string;
  website: string;
  mapsEmbed: string;
  mapsUrl?: string;
  weightLimitKg: number;
  razorpayLink: string;
  logo: string;
  banner: string;
  aboutImage: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: 'HavFun Trampoline Park',
  tagline: 'Where Thrills, Laughter, and Memories Take Flight.',
  address: '2nd floor, Velachery Service Road, Karnival food Street, Kora, Velachery, Chennai, Tamil Nadu 600042',
  phone: '7010180483',
  phoneE164: '+917010180483',
  email: 'havfuntrampolinepark@gmail.com',
  hours: 'Monday – Sunday: 10AM – 10PM',
  instagram: 'https://www.instagram.com/havfun_trampolinepark',
  website: 'https://havfuntrampolinepark.com',
  mapsEmbed:
    'https://maps.google.com/maps?q=2nd+floor%2C+Velachery+Service+Road%2C+Karnival+food+Street%2C+Kora%2C+Velachery%2C+Chennai%2C+Tamil+Nadu+600042&t=m&z=16&output=embed&iwloc=near',
  mapsUrl: 'https://maps.app.goo.gl/Yer8udFFQVCq5obz9',
  weightLimitKg: 100,
  razorpayLink: 'https://razorpay.me/@vvpsentertainmentandadventure',
  logo: '/logo.png',
  banner: 'https://images.unsplash.com/photo-1518605368461-1eb5d4e116e0?q=80&w=1600&auto=format&fit=crop',
  aboutImage: 'https://images.unsplash.com/photo-1551817958-c9aa14ffe524?q=80&w=1600&auto=format&fit=crop',
};

export interface PricingConfig {
  bookingLink: string;
  basic: Record<30 | 60, number>;
  offers: { weekdaySpecial: number; offPeakDiscount: number };
  gripSocks: number;
  gst: number;
  hours: { weekdayOfferStart: number; weekdayOfferEnd: number; offPeakStartDay: number };
}

export interface CafeContent {
  heading: string;
  intro: string;
  categories: { title: string; desc: string }[];
}

export interface Attraction { id: string; title: string; description: string; image: string; order: number; }
export interface SafetyFeature { id: string; title: string; description: string; icon: string; order: number; }
export interface Faq { id: string; question: string; answer: string; order: number; }
export interface GalleryItem { id: string; title: string; subtitle: string; image: string; order: number; type: string; }
export interface CafeImage { id: string; alt: string; image: string; order: number; }
export interface WaiverImage { id: string; image: string; order: number; }

async function getSettingsDoc<T>(id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, 'settings', id));
  if (id === 'site') {
      const data = snap.exists() ? snap.data() : {};
      const rawAddress = (data.address as string | undefined)?.trim();
      const rawEmbed = (data.mapsEmbed as string | undefined)?.trim();

      const address = (!rawAddress || rawAddress.includes('Mugalivakkam') || rawAddress.includes('MRTS Station'))
          ? DEFAULT_SITE_SETTINGS.address
          : rawAddress;

      const mapsEmbed = (!rawEmbed || rawEmbed.includes('Mugalivakkam') || rawEmbed.includes('0x3a5260d000632a69') || rawEmbed.includes('MRTS+Station'))
          ? DEFAULT_SITE_SETTINGS.mapsEmbed
          : rawEmbed;

      const mapsUrl = (!data.mapsUrl || data.mapsUrl.includes('7bWh37gNPDeQJeQD7'))
          ? DEFAULT_SITE_SETTINGS.mapsUrl
          : (data.mapsUrl as string);

      return {
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          address,
          mapsEmbed,
          mapsUrl,
          logo: data.logo || DEFAULT_SITE_SETTINGS.logo,
          banner: data.banner || DEFAULT_SITE_SETTINGS.banner,
          aboutImage: data.aboutImage || DEFAULT_SITE_SETTINGS.aboutImage
      } as T;
  }
  return snap.exists() ? (snap.data() as T) : null;
}

async function getOrderedCollection<T>(name: string): Promise<T[]> {
  const snap = await getDocs(query(collection(db, name), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

export const fetchSite = () => getSettingsDoc<SiteSettings>('site');
export const fetchPricing = () => getSettingsDoc<PricingConfig>('pricing');
export const fetchCafe = () => getSettingsDoc<CafeContent>('cafe');
export const fetchAttractions = () => getOrderedCollection<Attraction>('attractions');
export const fetchSafetyFeatures = () => getOrderedCollection<SafetyFeature>('safetyFeatures');
export const fetchFaqs = () => getOrderedCollection<Faq>('faqs');
export const fetchGallery = () => getOrderedCollection<GalleryItem>('gallery');
export const fetchCafeImages = () => getOrderedCollection<CafeImage>('cafeImages');
export const fetchWaiverImages = () => getOrderedCollection<WaiverImage>('waiverImages');
