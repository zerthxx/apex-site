import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { SessionGuard } from "@/components/ui/SessionGuard";
import { ChatBot } from "@/components/ui/ChatBot";
import { CrispChat } from "@/components/ui/CrispChat";
import { Geist, Geist_Mono, Syne, Inter } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://apexsite.fi"),
  verification: {
    google: "lS73-v0-IvVui-_lnoLJQfa7KEGZ5NKvmfQbRjtIthc",
  },
  title: {
    default: "Apex Site — Ohjelmistotalo Suomessa",
    template: "%s | Apex Site",
  },
  description:
    "Verkkosivut, verkkokaupat, mobiilisovellukset ja AI-ratkaisut yrityksellesi. Suomalainen ohjelmistotalo Helsingistä.",
  keywords: [
    "verkkosivut",
    "verkkokauppa",
    "mobiilisovellus",
    "ohjelmistokehitys",
    "AI-ratkaisut",
    "Helsinki",
    "Suomi",
    "ohjelmistotalo",
  ],
  authors: [{ name: "Apex Site Oy" }],
  creator: "Apex Site",
  publisher: "Apex Site",
  openGraph: {
    type: "website",
    locale: "fi_FI",
    siteName: "Apex Site",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Apex Site — Ohjelmistotalo Suomessa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@apexsite_fi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://apexsite.fi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fi"
      dir="ltr"
      className={`${syne.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Apex Site",
              url: "https://apexsite.fi",
              email: "info@apexsite.fi",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Helsinki",
                addressCountry: "FI",
              },
              areaServed: "FI",
              description:
                "Verkkosivut, verkkokaupat, mobiilisovellukset ja AI-ratkaisut yrityksellesi. Suomalainen ohjelmistotalo Helsingistä.",
              priceRange: "€€€",
              sameAs: ["https://apexsite.fi"],
            }),
          }}
        />
        <SessionGuard />
        <IntroOverlay />
        {children}
        <ChatBot />
        <CrispChat />
        <SpeedInsights />
      </body>
    </html>
  );
}
