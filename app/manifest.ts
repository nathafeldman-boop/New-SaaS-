import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F1",
    theme_color: "#FBF7F1",
    lang: "fr",
    categories: ["beauty", "lifestyle", "health"],
    icons: [
      { src: "/brand/mark.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/brand/logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
