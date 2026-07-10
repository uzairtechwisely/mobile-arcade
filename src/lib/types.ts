export type BranchServiceKey =
  | "repair"
  | "screen_repair"
  | "battery_replacement"
  | "water_damage"
  | "diagnostics"
  | "data_recovery"
  | "laptop_repair"
  | "console_repair"
  | "trade"
  | "customise"
  | "3d_printed_case"
  | "buy_sell"
  | "refurbished"
  | "accessories"
  | "explore"
  | "products"
  | "repair_van";

export type FulfillmentMode = "in_shop" | "at_home" | "post";

export type Branch = {
  id: string;
  slug: string;
  name: string;
  address: string;
  postcode: string;
  phone?: string;
  whatsapp?: string;
  lat: number;
  lng: number;
  services: BranchServiceKey[];
  openingHoursText: string;
  walkInDiscountText?: string;
  isPlaceholder?: boolean;
};

export type Service = {
  key: BranchServiceKey;
  slug: string;
  title: string;
  summary: string;
  typicalTimeframe?: string;
};

export type Campaign = {
  slug: string;
  title: string;
  headline: string;
  offerText: string;
  primaryCta: string;
  leadKind: "campaign";
};

export type Poll = {
  slug: string;
  question: string;
  options: Array<{ key: string; label: string }>;
};
