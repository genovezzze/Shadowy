import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shadowy.lv";
const title = "Shadowy - Padariet neredzamo darbu redzamu";
const description =
  "Shadowy palīdz padarīt neredzamo darbu redzamu: strukturēta darba iesniegšana, vadītāja izskatīšana un godīgāka slodzes pārvaldība.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Shadowy",
  },
  description,
  alternates: {
    canonical: "/",
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
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Shadowy" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.png"],
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
      className={`${inter.variable} ${neueHaas.variable}`}
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
