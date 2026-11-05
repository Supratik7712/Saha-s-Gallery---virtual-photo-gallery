/**
 * Site-wide configuration for Saha Gallery.
 * Update these values to personalize the gallery (e.g. the real Instagram handle).
 */
export const site = {
  name: "Saha's Gallery",
  navLabel: "S.SAHA / 2026",
  tagline: "EXPERIENCE WHAT I SEE THROUGH MY LENS.\nA PART OF S.SAHA PHOTOGRAPHY.",
  intro: "",
  instagramHandle: "@S.SAHA_PHOTOGRAPHY",
  instagramUrl: "https://www.instagram.com/s.saha_photography/",
  /** Bondin "support me" page — viewers can leave a tip here. */
  supportUrl: "https://bondin.io/supratik/support",
  aboutHeading: "The One Behind the Lens",
  aboutBody: [
    "Hello, I am Supratik Saha, a photographer fascinated by the quiet tension of everyday moments. This gallery is my archive — a place where time slows down to the speed of a single exposure.",
    "Each image and video sequence is available for public download, a gift from my journey to yours. Beauty belongs to those who look long enough to find it.",
  ],
  footerNote: "BUILT FOR THE CURIOUS.",
  /** Only this account may access the Curator Studio. */
  curatorEmail: "supratiksaha2022s@gmail.com",
  contact: {
    email: "supratiksaha2022s@gmail.com",
    /** Leave empty to hide the phone row. */
    phone: "+91-7044752795",

    note: "Open to collaborations, editorial shoots, brand partnerships and creative experiments. Reach out and let's talk about the frame you have in mind.",
  },
} as const;

