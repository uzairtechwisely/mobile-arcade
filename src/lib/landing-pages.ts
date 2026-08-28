import { imageUrl } from "@/lib/image";

export type LandingPageConfig = {
  slug: string;
  title: string;
  navCtaLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  promoTitle: string;
  promoSubtitle: string;
  promoCtaLabel: string;
  promoImageUrl: string;
  steps: Array<{ title: string; body: string; imageUrl: string }>;
  faqs: Array<{ q: string; a: string }>;
  backgroundImageUrl: string;
};

export const landingPages: LandingPageConfig[] = [
  {
    slug: "trade-in",
    title: "Trade in | Mobile Arcade",
    navCtaLabel: "Get a quote",
    heroTitle: "Your old phone could be worth more than you think.",
    heroSubtitle:
      "Get an estimated value quickly and find out what your phone could be worth in today’s market. Secure, fast, and transparent.",
    promoTitle: "Get £75–£500",
    promoSubtitle: "when you trade in any phone",
    promoCtaLabel: "Find my phone value",
    promoImageUrl: imageUrl(
      "Ultra realistic premium studio product photo of two modern smartphones angled on a soft gray background, clean lighting, subtle shadow, high detail, retail advertisement style",
      "portrait_4_3",
    ),
    steps: [
      {
        title: "Get estimated value",
        body: "Tell us your device and condition to receive an instant estimate.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a hand holding a modern smartphone showing a clean valuation screen UI, bright natural lighting, minimal background, high detail",
          "landscape_4_3",
        ),
      },
      {
        title: "Mail it to Mobile Arcade",
        body: "Send it with your preferred postage service and we add that postage amount back after receipt.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a small parcel box with protective bubble wrap and shipping label on a clean desk, soft lighting, high detail, premium retail style",
          "landscape_4_3",
        ),
      },
      {
        title: "Inspection and payment",
        body: "We confirm the condition and pay you fast. No hidden fees.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a friendly technician inspecting a smartphone at a clean modern counter, bright lighting, high detail, trustworthy retail vibe",
          "landscape_4_3",
        ),
      },
    ],
    faqs: [
      {
        q: "How is my phone’s estimate calculated?",
        a: "The estimate is based on device type, make, model, and condition. Final offers may change after inspection if the condition differs from what was selected.",
      },
      {
        q: "Is the estimate online the final value?",
        a: "It’s an estimate. The final value is confirmed after we inspect the device in line with the condition you selected.",
      },
      {
        q: "Do I have to sell after receiving an estimate?",
        a: "No. You can decide after seeing the quote. If you accept, you can book free collection.",
      },
      {
        q: "Can I sell a damaged phone?",
        a: "Yes. Choose the closest matching condition. The final offer is still confirmed after inspection when the phone arrives.",
      },
      {
        q: "How and when will I be paid?",
        a: "Once the device passes inspection, we issue payment using the payout method selected during booking.",
      },
    ],
    backgroundImageUrl: imageUrl(
      "Ultra realistic abstract soft gradient background with blue and white light shapes, subtle texture, clean modern website hero background, high resolution",
      "landscape_16_9",
    ),
  },
  {
    slug: "christmas",
    title: "Christmas trade-in | Mobile Arcade",
    navCtaLabel: "Get my Xmas quote",
    heroTitle: "Christmas clean-out: turn old tech into cash.",
    heroSubtitle:
      "Quick online quote, free collection, fast payout. Perfect for holiday upgrades and gifts.",
    promoTitle: "Extra £15 voucher",
    promoSubtitle: "when you trade in before Christmas",
    promoCtaLabel: "Get Christmas quote",
    promoImageUrl: imageUrl(
      "Ultra realistic premium studio product photo of modern smartphones with subtle festive wrapping ribbon, clean blue background, retail advertisement style, high detail",
      "portrait_4_3",
    ),
    steps: [
      {
        title: "Tell us your device",
        body: "Select type, make, model and condition to get your quote.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a smartphone on a desk showing a simple form UI, minimal background, clean lighting, high detail",
          "landscape_4_3",
        ),
      },
      {
        title: "Book free collection",
        body: "Choose a date that suits you. We’ll collect it from your door.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a courier parcel pickup at a doorstep with a small box, clean modern look, daylight, high detail",
          "landscape_4_3",
        ),
      },
      {
        title: "Get paid fast",
        body: "We inspect and confirm. Then we pay out quickly and safely.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a payment confirmation on a smartphone screen, clean UI, bright lighting, high detail",
          "landscape_4_3",
        ),
      },
    ],
    faqs: [
      {
        q: "Do Christmas quotes expire?",
        a: "Yes. Offers are time-limited to protect against market changes. We’ll show expiry at checkout/booking.",
      },
      {
        q: "Is collection really free?",
        a: "Yes for qualifying campaigns. If that changes for your area, we’ll clearly show it before you confirm.",
      },
      {
        q: "What if my device condition differs?",
        a: "If condition is different on inspection, we’ll explain why and give you the option to accept or return the device.",
      },
    ],
    backgroundImageUrl: imageUrl(
      "Ultra realistic abstract soft gradient background in blue and white with a subtle festive bokeh effect, clean modern website background, high resolution",
      "landscape_16_9",
    ),
  },
];

export function getLandingPage(slug: string) {
  return landingPages.find((p) => p.slug === slug) ?? null;
}

export function getLandingSlugs() {
  return landingPages.map((p) => p.slug);
}
