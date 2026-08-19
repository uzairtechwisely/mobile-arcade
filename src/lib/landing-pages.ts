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
      "Ultra realistic studio product photo of two modern smartphones on a clean light gray background, soft shadows, premium retail style, high detail",
      "portrait_4_3",
    ),
    steps: [
      {
        title: "Get estimated value",
        body: "Tell us your device and condition to receive an instant estimate.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a hand holding a smartphone showing a clean simple valuation screen, bright lighting, premium app UI look",
          "square",
        ),
      },
      {
        title: "Mail it to Mobile Arcade",
        body: "We’ll arrange free collection or postage based on your location.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a small parcel box and packaging materials on a desk, soft lighting, premium retail style",
          "square",
        ),
      },
      {
        title: "Inspection and payment",
        body: "We confirm the condition and pay you fast. No hidden fees.",
        imageUrl: imageUrl(
          "Ultra realistic photo of a friendly technician inspecting a phone at a counter in a clean modern shop, bright lighting",
          "square",
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
        a: "Yes. Choose the closest matching condition and upload at least one photo so we can review it properly.",
      },
      {
        q: "How and when will I be paid?",
        a: "Once the device passes inspection, we issue payment using the payout method selected during booking.",
      },
    ],
    backgroundImageUrl: imageUrl(
      "Ultra realistic cinematic photo of abstract soft gradient light shapes in blue and white, subtle texture, minimal background for a website hero, high resolution",
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
