import { renderOgImage, ogSize, ogContentType, ogAlt } from "@/lib/og-render";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = ogAlt;

export default function TwitterImage() {
  return renderOgImage();
}
