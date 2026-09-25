/**
 * Default product photos and "featured" picks applied when a model is first
 * created from a price list. Price uploads never overwrite an image or featured
 * flag that has since been set (e.g. from the admin panel), so this file only
 * seeds sensible defaults. Models with no photo fall back to the category icon.
 */

const IMAGE_RULES: Array<{ test: RegExp; image: string }> = [
  { test: /^apple iphone 17 pro/i, image: "/brand/models/iphone-17-pro-promax.webp" },
  { test: /^apple iphone (17e?|17)$/i, image: "/brand/models/iphone-17.webp" },
  { test: /^apple iphone air$/i, image: "/brand/models/iphone-air.webp" },
  { test: /^apple iphone 16 pro/i, image: "/brand/models/iphone-16-pro-promax.webp" },
  { test: /^apple iphone 16e$/i, image: "/brand/models/iphone-16e.webp" },
  { test: /^apple iphone 16( plus)?$/i, image: "/brand/models/iphone-16-16plus.webp" },
  { test: /^apple iphone 15 pro/i, image: "/brand/models/iphone-15-pro-promax.webp" },
  { test: /^apple iphone 15( plus)?$/i, image: "/brand/models/iphone-15-15plus.webp" },
  { test: /^apple iphone 14 pro/i, image: "/brand/models/iphone-14-pro-promax.webp" },
  { test: /^apple iphone 1[34]( plus| mini)?$/i, image: "/brand/models/iphone-13-14.webp" },
];

export function defaultImageFor(brand: string, model: string) {
  const label = `${brand} ${model}`;
  return IMAGE_RULES.find((rule) => rule.test.test(label))?.image ?? null;
}

export const DEFAULT_FEATURED_MODEL_IDS = new Set([
  "apple-iphone-17-pro-max",
  "apple-iphone-17",
  "apple-iphone-16-pro",
  "apple-iphone-15",
  "samsung-galaxy-s25-ultra",
  "samsung-galaxy-s24",
  "google-pixel-9-pro",
]);
