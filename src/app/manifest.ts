import type { MetadataRoute } from "next";

// Lets people add the app to their home screen or desktop with the shield icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MRBC Safety Team",
    short_name: "MRBC Safety",
    description: "Scheduling and safety information for the church safety team.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1225",
    theme_color: "#1e3a8a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
