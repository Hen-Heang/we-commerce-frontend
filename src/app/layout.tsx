import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "We Commerce — Shop, save, and sell",
  description:
    "We Commerce is a multi-vendor marketplace. Browse, save, and purchase products from sellers around you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* TanStack Query lives at the very top so every page can use useQuery */}
        <QueryProvider>{children}</QueryProvider>
        {/* Global toast portal — used by add-to-cart, checkout, etc. */}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
