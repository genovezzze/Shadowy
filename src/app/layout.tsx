import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NavigationLoadingOverlay } from "@/components/ui/navigation-loading-overlay";
import { getSiteUrl } from "@/lib/site-url";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/Inter-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      // Without this, every font-bold (700) request in the app had no exact
      // face to match against - only 400 and 600 were registered - so the CSS
      // font-matching algorithm silently substituted the nearest available
      // weight (600) instead of synthesising bold, and every "bold" heading
      // rendered as semibold site-wide.
      path: "../../public/fonts/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      // A step past bold for the handful of spots - nav links at 14px - where
      // true 700 still reads as merely semibold at that size.
      path: "../../public/fonts/Inter-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const jetBrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Regular.woff",
  weight: "400",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const neueHaas = localFont({
  src: [
    {
      path: "../../public/fonts/NeueHaasDisplayMediu.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayLight.woff2",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const neueHaasLight = localFont({
  src: "../../public/fonts/NeueHaasDisplayLight.woff2",
  weight: "300",
  style: "normal",
  variable: "--font-accent",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// The pixel faces the hero headline dissolves through. Each is the same
// grid-based glyph set drawn with a different cell shape, so cycling them per
// character is what makes a word look like it is resolving out of pixels.
const geistPixelSquare = localFont({
  src: "../../public/fonts/GeistPixel-Square.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pixel-square",
  display: "block",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const geistPixelCircle = localFont({
  src: "../../public/fonts/GeistPixel-Circle.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pixel-circle",
  display: "block",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const geistPixelGrid = localFont({
  src: "../../public/fonts/GeistPixel-Grid.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pixel-grid",
  display: "block",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const geistPixelTriangle = localFont({
  src: "../../public/fonts/GeistPixel-Triangle.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pixel-triangle",
  display: "block",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const geistPixelLine = localFont({
  src: "../../public/fonts/GeistPixel-Line.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pixel-line",
  display: "block",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Keep the variables inline as well as in the generated Next.js classes.
// This prevents a stale development stylesheet from dropping the global font
// stack and falling all the way back to the browser's serif default.
const fontVariables = {
  "--font-sans": inter.style.fontFamily,
  "--font-display": neueHaas.style.fontFamily,
  "--font-accent": neueHaasLight.style.fontFamily,
  "--font-mono": jetBrainsMono.style.fontFamily,
  "--font-pixel-square": geistPixelSquare.style.fontFamily,
  "--font-pixel-circle": geistPixelCircle.style.fontFamily,
  "--font-pixel-grid": geistPixelGrid.style.fontFamily,
  "--font-pixel-triangle": geistPixelTriangle.style.fontFamily,
  "--font-pixel-line": geistPixelLine.style.fontFamily,
} as React.CSSProperties;

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
      className={`${inter.variable} ${neueHaas.variable} ${neueHaasLight.variable} ${jetBrainsMono.variable} ${geistPixelSquare.variable} ${geistPixelCircle.variable} ${geistPixelGrid.variable} ${geistPixelTriangle.variable} ${geistPixelLine.variable}`}
      style={fontVariables}
      suppressHydrationWarning
    >
      <body className="font-sans" style={{ fontFamily: inter.style.fontFamily }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="slate"
          enableSystem={false}
          themes={["light", "dark", "slate"]}
          value={{ light: "light", dark: "dark", slate: "slate" }}
        >
          {children}
          <Suspense fallback={null}>
            <NavigationLoadingOverlay />
          </Suspense>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
