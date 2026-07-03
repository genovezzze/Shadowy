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
        src: "/shadowy.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
