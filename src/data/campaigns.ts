import { Campaign } from "@/lib/types";

export const campaigns: Campaign[] = [
  {
    slug: "sell-broken-phone",
    title: "Sell your broken phone",
    headline: "Get a great offer — even if it’s old or broken.",
    offerText:
      "Nationwide collection available. We can arrange prepaid postage or a Royal Mail doorstep collection (where available).",
    primaryCta: "Get a free quote",
    leadKind: "campaign",
  },
];

export function getCampaignBySlug(slug: string) {
  return campaigns.find((c) => c.slug === slug) ?? null;
}
