import { BranchServiceKey } from "@/lib/types";
import { imageUrl } from "@/lib/image";

export type RepairBrand = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type RepairModel = {
  slug: string;
  title: string;
  subtitle: string;
};

export const repairBrands: RepairBrand[] = [
  {
    slug: "iphone",
    title: "iPhone",
    description: "Screen, battery, charging and water damage repairs.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a modern smartphone on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    slug: "samsung",
    title: "Samsung",
    description: "Galaxy repairs with quality parts and clear options.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a modern Android smartphone on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    slug: "ipad",
    title: "iPad",
    description: "Cracked screens, batteries, charging and diagnostics.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a tablet device on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    slug: "macbook",
    title: "MacBook",
    description: "Performance issues, batteries, charging and diagnostics.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a slim laptop on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    slug: "console",
    title: "Game consoles",
    description: "HDMI, overheating, fan noise and power issues.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a modern game console with controller on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
];

export const repairModelsByBrand: Record<string, RepairModel[]> = {
  iphone: [
    { slug: "iphone-15", title: "iPhone 15", subtitle: "Common repairs and upgrades" },
    { slug: "iphone-14", title: "iPhone 14", subtitle: "Screen, battery, diagnostics" },
    { slug: "iphone-13", title: "iPhone 13", subtitle: "Screen and battery repairs" },
    { slug: "iphone-12", title: "iPhone 12", subtitle: "Battery and charging faults" },
    { slug: "iphone-11", title: "iPhone 11", subtitle: "Fast fixes, fair pricing" },
  ],
  samsung: [
    { slug: "galaxy-s24", title: "Galaxy S24", subtitle: "Screen, battery, diagnostics" },
    { slug: "galaxy-s23", title: "Galaxy S23", subtitle: "Cracked screens and charging" },
    { slug: "galaxy-s22", title: "Galaxy S22", subtitle: "Battery and water damage" },
    { slug: "galaxy-a54", title: "Galaxy A54", subtitle: "Popular repairs and parts" },
  ],
  ipad: [
    { slug: "ipad-pro", title: "iPad Pro", subtitle: "Screen, battery, diagnostics" },
    { slug: "ipad-air", title: "iPad Air", subtitle: "Charging and screen repairs" },
    { slug: "ipad-10", title: "iPad (10th gen)", subtitle: "Common fixes, quick turnaround" },
  ],
  macbook: [
    { slug: "macbook-air", title: "MacBook Air", subtitle: "Battery and performance issues" },
    { slug: "macbook-pro", title: "MacBook Pro", subtitle: "Diagnostics and common faults" },
  ],
  console: [
    { slug: "ps5", title: "PlayStation 5", subtitle: "HDMI, overheating, power issues" },
    { slug: "xbox-series-x", title: "Xbox Series X", subtitle: "Power and overheating faults" },
    { slug: "nintendo-switch", title: "Nintendo Switch", subtitle: "Charging and joy-con issues" },
  ],
};

export const modelRepairActions: Array<{
  key: BranchServiceKey;
  title: string;
  description: string;
  imageUrl: string;
}> = [
  {
    key: "screen_repair",
    title: "Screen repair",
    description: "Cracked glass or touch issues replaced with quality parts.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a smartphone with a cracked glass screen on a neutral background, soft lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    key: "battery_replacement",
    title: "Battery replacement",
    description: "Stop rapid drain and restore everyday performance.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a phone battery module on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    key: "water_damage",
    title: "Water damage",
    description: "Diagnostics, cleaning, and best-effort recovery.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a smartphone with water droplets on a clean background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
  {
    key: "diagnostics",
    title: "Diagnostics",
    description: "Not sure what’s wrong? We’ll check and advise.",
    imageUrl: imageUrl(
      "Ultra realistic studio product photo of a technician tools kit on a white background, soft studio lighting, premium retail style, high detail",
      "square",
    ),
  },
];
