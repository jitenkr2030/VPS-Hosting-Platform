import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VPS Hosting Platform - Cloud Server Management",
  description: "Professional VPS hosting platform with instant deployment, 24/7 monitoring, and scalable infrastructure. Manage your cloud servers with ease.",
  keywords: ["VPS", "Hosting", "Cloud Server", "Virtual Private Server", "Infrastructure", "Cloud Computing"],
  authors: [{ name: "VPS Hosting Platform" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "VPS Hosting Platform",
    description: "Professional VPS hosting with instant deployment and 24/7 monitoring",
    url: "https://vps-platform.com",
    siteName: "VPS Hosting Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VPS Hosting Platform",
    description: "Professional VPS hosting with instant deployment and 24/7 monitoring",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
