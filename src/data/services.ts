import { Service } from "@/lib/types";

export const services: Service[] = [
  {
    key: "repair",
    slug: "repair",
    title: "Repairs",
    summary:
      "Fast phone, tablet, laptop and console repairs with clear advice and fair pricing.",
    typicalTimeframe: "Often same day",
  },
  {
    key: "trade",
    slug: "trade",
    title: "Trade",
    summary:
      "Trade in or sell your device for a great price, with local drop-off or postage options.",
  },
  {
    key: "customise",
    slug: "customise",
    title: "Customise",
    summary:
      "Make it yours — cases, custom prints and practical add-ons made with care.",
  },
  {
    key: "screen_repair",
    slug: "screen-repair",
    title: "Screen repair",
    summary: "Cracked, flickering or unresponsive screens replaced with quality parts.",
    typicalTimeframe: "Often same day",
  },
  {
    key: "battery_replacement",
    slug: "battery-replacement",
    title: "Battery replacement",
    summary: "Fast battery swaps to restore performance and stop rapid drain.",
    typicalTimeframe: "Often same day",
  },
  {
    key: "water_damage",
    slug: "water-damage",
    title: "Water damage",
    summary: "Diagnostics and board-level cleaning to give your device the best chance.",
  },
  {
    key: "diagnostics",
    slug: "diagnostics",
    title: "Diagnostics",
    summary:
      "Not sure what’s wrong? We’ll diagnose and explain the options clearly.",
  },
  {
    key: "data_recovery",
    slug: "data-recovery",
    title: "Data recovery",
    summary: "Recover photos and important files when possible after damage or failure.",
  },
  {
    key: "laptop_repair",
    slug: "laptop-repair",
    title: "Laptop repair",
    summary:
      "Repairs for common laptop issues including batteries, charging and performance.",
  },
  {
    key: "console_repair",
    slug: "console-repair",
    title: "Console repair",
    summary: "Diagnostics and repairs for common console faults.",
  },
  {
    key: "3d_printed_case",
    slug: "3d-printed-case",
    title: "3D printed case",
    summary:
      "Custom cases and prototypes made locally — practical, personal, and built to last.",
  },
  {
    key: "buy_sell",
    slug: "buy-sell",
    title: "Buy & sell phones",
    summary: "Buy quality refurbished devices or sell your current phone with confidence.",
  },
  {
    key: "refurbished",
    slug: "refurbished",
    title: "Buy refurbished",
    summary: "Popular refurbished devices, ready to view on our online shop.",
  },
  {
    key: "accessories",
    slug: "accessories",
    title: "Buy accessories",
    summary: "Cases, chargers, cables and everyday essentials.",
  },
  {
    key: "explore",
    slug: "explore",
    title: "Explore all items",
    summary: "Browse the full catalogue on our online shop.",
  },
  {
    key: "products",
    slug: "products",
    title: "Browse in-stock products",
    summary:
      "Chargers, cables, accessories and gadgets — available in store and online.",
  },
  {
    key: "repair_van",
    slug: "repair-van",
    title: "At-home / office repair van",
    summary:
      "When you can’t come to us, we come to you for selected services (subject to availability).",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug) ?? null;
}
