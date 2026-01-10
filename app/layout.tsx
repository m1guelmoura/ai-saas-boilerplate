import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
const appName = "AI SaaS Boilerplate";
const appDescription = "Production-ready boilerplate for AI SaaS applications. Built with Next.js 14, TypeScript, Supabase, and Stripe. Launch your startup in minutes.";

export const metadata: Metadata = {
  title: {
    default: `${appName} - Launch Your Startup in Minutes`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "SaaS boilerplate",
    "Next.js",
    "TypeScript",
    "Supabase",
    "Stripe",
    "React",
    "startup",
    "boilerplate",
    "template",
  ],
  authors: [{ name: "AI SaaS Boilerplate Team" }],
  creator: "AI SaaS Boilerplate",
  publisher: "AI SaaS Boilerplate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    title: `${appName} - Launch Your Startup in Minutes`,
    description: appDescription,
    siteName: appName,
    images: [
      {
        url: `${baseUrl}/og-image.png`, // Placeholder - replace with actual OG image
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Launch Your Startup in Minutes`,
    description: appDescription,
    images: [`${baseUrl}/og-image.png`], // Placeholder - replace with actual OG image
    creator: "@yourtwitterhandle", // Update with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes for Google Search Console, Bing, etc.
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
