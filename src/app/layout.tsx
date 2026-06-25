import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://apexsite.fi"),
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
        url: "/og-default.jpg",
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
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
