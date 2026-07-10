export function imageUrl(prompt: string, imageSize: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${encodeURIComponent(imageSize)}`;
}
