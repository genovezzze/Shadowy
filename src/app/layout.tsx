import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const neueHaas = localFont({
  src: [
    {
      path: "../../public/fonts/NeueHaasDisplayBold.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayLight.ttf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const neueHaasLight = localFont({
  src: "../../public/fonts/NeueHaasDisplayLight.ttf",
  weight: "300",
  style: "normal",
  variable: "--font-accent",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const siteUrl = getSiteUrl();
const title = "Shadowy - Padariet neredzamo darbu redzamu";
const description =
  "Shadowy palīdz padarīt neredzamo darbu redzamu: strukturēta darba iesniegšana, vadītāja izskatīšana un godīgāka slodzes pārvaldība.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/images/story/Black.svg" },
      {
        url: "/shadowy.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/images/story/Black.svg",
  },
  title: {
    default: title,
    template: "%s | Shadowy",
  },
  description,
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "_N_n1qi-G4kQ72xDD6_7WDP8zvXqNu8LII_bJt8BSa4",
    other: {
      "msvalidate.01": "BABED18F3B736165B0629C632C6DCE0B",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "lv_LV",
    url: "/",
    siteName: "Shadowy",
    title,
    description,
    images: [
      {
        url: "/images/shadowy-dashboard-wide.png",
        width: 1916,
        height: 821,
        alt: "Shadowy darba pārskats",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/images/shadowy-dashboard-wide.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="lv"
      className={`${inter.variable} ${neueHaas.variable} ${neueHaasLight.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="slate"
          enableSystem={false}
          themes={["light", "dark", "slate"]}
          value={{ light: "light", dark: "dark", slate: "slate" }}
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
