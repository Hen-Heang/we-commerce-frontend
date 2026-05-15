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
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
