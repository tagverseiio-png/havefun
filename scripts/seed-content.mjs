/**
 * Static content for HavFun, extracted verbatim from the original hardcoded
 * components (see docs/DATA_INVENTORY.md). The seed script attaches the matching
 * base64 image (by `imageKey`) before writing each document to Firestore.
 */

export const site = {
  name: 'HavFun Trampoline Park',
  tagline: 'Where Thrills, Laughter, and Memories Take Flight.',
  address: 'MRTS Station, beside The, Subramaniam Colony, Bhuvaneshwari Nagar, Velachery, Chennai, Tamil Nadu 600042',
  phone: '7010180483',
  phoneE164: '+917010180483',
  email: 'havfuntrampolinepark@gmail.com',
  hours: 'Monday – Sunday: 10AM – 10PM',
  instagram: 'https://www.instagram.com/havfun_trampolinepark',
  website: 'https://havfuntrampolinepark.com',
  mapsEmbed:
    'https://maps.google.com/maps?q=MRTS+Station%2C+beside+The%2C+Subramaniam+Colony%2C+Bhuvaneshwari+Nagar%2C+Velachery%2C+Chennai%2C+Tamil+Nadu+600042&t=m&z=16&output=embed&iwloc=near',
  mapsUrl: 'https://maps.app.goo.gl/7bWh37gNPDeQJeQD7',
  weightLimitKg: 100,
  razorpayLink: 'https://razorpay.me/@vvpsentertainmentandadventure',
};

export const pricing = {
  bookingLink: 'https://calendly.com/havfuntrampolinepark',
  basic: { 30: 350, 60: 550 },
  offers: { weekdaySpecial: 99, offPeakDiscount: 0.3 },
  gripSocks: 80,
  gst: 0.05,
  hours: { weekdayOfferStart: 10, weekdayOfferEnd: 17, offPeakStartDay: 17 },
};

// Text only — each base64 image is its own doc (a single doc holding all 4
// would exceed Firestore's 1 MB cap). Images live in the `cafeImages` collection.
export const cafe = {
  heading: 'HavFun Cafe',
  intro:
    "Take a break from the action and recharge at our cozy snack lounge! Whether you're looking for a quick bite or a refreshing drink, we've got something for everyone.",
  categories: [
    { title: 'Snacks', desc: 'Savory meals & fresh sandwiches.' },
    { title: 'Drinks', desc: 'Craft mojitos & refreshing sodas.' },
  ],
};

export const cafeImages = [
  { id: 'cafe-drink', imageKey: 'cafe-drink', order: 1, alt: 'Cafe Drink' },
  { id: 'cafe-food', imageKey: 'cafe-food', order: 2, alt: 'Cafe Food' },
  { id: 'cafe-burger', imageKey: 'cafe-burger', order: 3, alt: 'Cafe Burger' },
  { id: 'cafe-seating', imageKey: 'cafe-seating', order: 4, alt: 'Cafe Seating' },
];

export const attractions = [
  { id: 'kids-zone', title: 'Kids Zone', imageKey: 'kids-zone', order: 1,
    description: 'A special area designed for the little ones, filled with soft play zones, mini slides, and interactive play structures for safe, endless fun.' },
  { id: 'foam-pits', title: 'Foam Pits', imageKey: 'foam-pits', order: 2,
    description: 'Dive headfirst into a soft pit filled with foam cubes, perfect for practicing aerial tricks with a soft landing.' },
  { id: 'slam-dunk-zone', title: 'Slam Dunk Zone', imageKey: 'slam-dunk-zone', order: 3,
    description: 'Live out your basketball dreams by jumping higher than ever and slam dunking like a pro. Bring out the Kobe Bryant in you!' },
  { id: 'wipe-out', title: 'Wipe Out', imageKey: 'wipe-out', order: 4,
    description: 'Test your agility and strength on our challenging obstacle course that will bring out the strength in you.' },
  { id: 'main-court', title: 'Main Court', imageKey: 'main-court', order: 5,
    description: 'Bounce freely across interconnected trampolines and practice your flips in an open space. A fun filled Activity.' },
  { id: 'spider-wall', title: 'Spider Wall', imageKey: 'spider-wall', order: 6,
    description: 'Stick, climb, and bounce off our Spider Wall! Suit up in special Velcro suits and leap onto the wall, sticking like a superhero.' },
];

export const safetyFeatures = [
  { id: 'trained-professionals', title: 'Trained Professionals', imageKey: 'trained-professionals', order: 1,
    description: 'Certified instructors ensuring safe play and guidance throughout your visit.' },
  { id: 'safety-equipment', title: 'Safety Equipment', imageKey: 'safety-equipment', order: 2,
    description: 'Non-slip socks, padded walls, and premium springs for maximum safety.' },
  { id: 'first-aid-ready', title: 'First-Aid Ready', imageKey: 'first-aid-ready', order: 3,
    description: 'First-aid certified staff always available for immediate assistance.' },
  { id: 'clean-sanitized', title: 'Clean and Sanitized', imageKey: 'clean-sanitized', order: 4,
    description: 'Daily cleaning and strict hygiene protocols maintained throughout the park.' },
];

export const faqs = [
  { id: 'faq-1', order: 1, question: 'What are the park hours?',
    answer: 'Our trampoline park is open from 10 AM to 10 PM, Monday through Sunday.' },
  { id: 'faq-2', order: 2, question: 'What should I wear?',
    answer: "We recommend wearing comfortable athletic clothing and non-slip socks, which can be purchased at the park if you don't have your own." },
  { id: 'faq-3', order: 3, question: 'Are there age restrictions?',
    answer: 'We have designated areas for different age groups to ensure safety. Children below 6 years have their designated zone.' },
  { id: 'faq-4', order: 4, question: 'Can I bring food and drinks?',
    answer: 'Outside food and beverages are not allowed, but we have a snack bar offering a variety of refreshments.' },
  { id: 'faq-5', order: 5, question: 'What safety measures do you have in place?',
    answer: 'We prioritize safety with padded walls, non-slip socks, and regular equipment inspections. Our trained staff are always on hand to enforce safety rules and assist guests.' },
  { id: 'faq-6', order: 6, question: 'Is there a weight limit?',
    answer: 'Yes, our trampoline park has a weight limit of 100 kgs to ensure the safety of all guests. Please contact us for further details.' },
];

// Waiver step background images — doc id == waiver section id for easy lookup.
export const waiverImages = [
  { id: 'welcome', imageKey: 'trampoline-zone', order: 1 },
  { id: 'risks', imageKey: 'basketball-zone', order: 2 },
  { id: 'eligibility', imageKey: 'jungle-playground', order: 3 },
  { id: 'medical', imageKey: 'bubble-balls', order: 4 },
  { id: 'signature', imageKey: 'obstacle-zone', order: 5 },
];

export const gallery = [
  { id: 'g-foam-pit', imageKey: 'gallery-foam-pit', order: 1, title: 'Foam Pit Fun', subtitle: 'Soft Landings' },
  { id: 'g-slam-dunk', imageKey: 'gallery-slam-dunk', order: 2, title: 'Slam Dunk', subtitle: 'Sky High' },
  { id: 'g-obstacle', imageKey: 'gallery-obstacle', order: 3, title: 'Obstacle Course', subtitle: 'Agility Test' },
  { id: 'g-main-court', imageKey: 'gallery-main-court', order: 4, title: 'Main Court', subtitle: 'Free Jump' },
  { id: 'g-spider', imageKey: 'gallery-spider', order: 5, title: 'Spider Wall', subtitle: 'Sticky Situation' },
  { id: 'g-cafe', imageKey: 'gallery-cafe', order: 6, title: 'HavFun Cafe', subtitle: 'Refresh & Recharge' },
];
