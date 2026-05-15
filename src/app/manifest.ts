import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "We Commerce",
    short_name: "WeCommerce",
    description: "Browse, save, and purchase products from sellers around you.",
    start_url: "/market",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#4338CA",
    categories: ["shopping"],
    icons: [
      {
        src: "/icons/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
