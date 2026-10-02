import modelImages from "../../../data/catalog/model-images.json";

/**
 * Default product photos and "featured" picks applied when a model is first
 * created from a price list. Price uploads never overwrite an image or featured
 * flag that has since been set (e.g. from the admin panel), so this file only
 * seeds sensible defaults. Models with no photo fall back to the category icon.
 *
 * New photos are added with scripts/import-model-images.mjs, which records them
 * in data/catalog/model-images.json (label -> url). The rules below predate that
 * file and cover the earlier iPhone and Pixel batches.
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
  { test: /^apple iphone 13 pro$/i, image: "/brand/models/iphone-13-pro.webp" },
  { test: /^apple iphone 13 pro max$/i, image: "/brand/models/iphone-13-pro-max.webp" },
  { test: /^apple iphone 12$/i, image: "/brand/models/iphone-12.webp" },
  { test: /^apple iphone 12 mini$/i, image: "/brand/models/iphone-12-mini.webp" },
  { test: /^apple iphone 12 pro$/i, image: "/brand/models/iphone-12-pro.webp" },
  { test: /^apple iphone 12 pro max$/i, image: "/brand/models/iphone-12-pro-max.webp" },
  { test: /^apple iphone 11$/i, image: "/brand/models/iphone-11.webp" },
  { test: /^apple iphone 11 pro$/i, image: "/brand/models/iphone-11-pro.webp" },
  { test: /^apple iphone 11 pro max$/i, image: "/brand/models/iphone-11-pro-max.webp" },
  { test: /^apple iphone se \((2nd|3rd) generation\)$/i, image: "/brand/models/iphone-se.webp" },

  { test: /^google pixel 6$/i, image: "/brand/models/pixel-6.webp" },
  { test: /^google pixel 6 pro$/i, image: "/brand/models/pixel-6-pro.webp" },
  { test: /^google pixel 6a$/i, image: "/brand/models/pixel-6a.webp" },
  { test: /^google pixel 7$/i, image: "/brand/models/pixel-7.webp" },
  { test: /^google pixel 7 pro$/i, image: "/brand/models/pixel-7-pro.webp" },
  { test: /^google pixel 7a$/i, image: "/brand/models/pixel-7a.webp" },
  { test: /^google pixel fold$/i, image: "/brand/models/pixel-fold.webp" },
  { test: /^google pixel 8$/i, image: "/brand/models/pixel-8.webp" },
  { test: /^google pixel 8 pro$/i, image: "/brand/models/pixel-8-pro.webp" },
  { test: /^google pixel 8a$/i, image: "/brand/models/pixel-8a.webp" },
  { test: /^google pixel 9$/i, image: "/brand/models/pixel-9.webp" },
  { test: /^google pixel 9 pro$/i, image: "/brand/models/pixel-9-pro.webp" },
  { test: /^google pixel 9 pro xl$/i, image: "/brand/models/pixel-9-pro-xl.webp" },
  { test: /^google pixel 9 pro fold$/i, image: "/brand/models/pixel-9-pro-fold.webp" },
  { test: /^google pixel 9a$/i, image: "/brand/models/pixel-9a.webp" },
  { test: /^google pixel 10$/i, image: "/brand/models/pixel-10.webp" },
  { test: /^google pixel 10 pro$/i, image: "/brand/models/pixel-10-pro.webp" },
  { test: /^google pixel 10 pro xl$/i, image: "/brand/models/pixel-10-pro-xl.webp" },
  { test: /^google pixel 10 pro fold$/i, image: "/brand/models/pixel-10-pro-fold.webp" },
  { test: /^google pixel 10a$/i, image: "/brand/models/pixel-10a.webp" },
];

const IMAGE_BY_LABEL: Record<string, string> = modelImages;

export function defaultImageFor(brand: string, model: string) {
  const label = `${brand} ${model}`;
  return (
    IMAGE_BY_LABEL[label.toLowerCase()] ??
    IMAGE_RULES.find((rule) => rule.test.test(label))?.image ??
    null
  );
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
