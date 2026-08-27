import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shadowy",
    short_name: "Shadowy",
    description:
      "Ātrs neredzamā darba pieraksts telefonā vai datorā",
    start_url: "/employee/smart-log",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "lv",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
