import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ✅ Add display swap
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // ✅ Add display swap
});

// ✅ ADD: Professional Inter font as main font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaustubh Pawar | Data Analytics & Business Intelligence Professional",
  description: "Computer Science graduate specializing in data-driven business insights, dashboard development, and strategic analytics. Experienced in Tableau, Python, SQL, and business intelligence solutions.",
  keywords: ["Data Analytics", "Business Intelligence", "Tableau", "Python", "SQL", "Dashboard Development", "Business Strategy"],
  authors: [{ name: "Kaustubh Pawar", url: "https://kaustubhpawar.com" }],
  creator: "Kaustubh Pawar",
  metadataBase: new URL("https://kaustubhpawar.com"),
  openGraph: {
    title: "Kaustubh Pawar | Data Analytics Professional",
    description: "Computer Science graduate specializing in data-driven business insights and strategic analytics",
    url: "https://kaustubhpawar.com",
    siteName: "Kaustubh Pawar Portfolio",
    images: [
      {
        url: "/og-image.jpg", // ✅ ADD: Create this image
        width: 1200,
        height: 630,
        alt: "Kaustubh Pawar - Data Analytics Professional",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaustubh Pawar | Data Analytics Professional",
    description: "Computer Science graduate specializing in data-driven business insights",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* ✅ ADD: Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
