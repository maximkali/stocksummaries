import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Stock Summaries | AI-Powered Stock Digests",
  description: "Get AI-curated stock digests delivered to your inbox. Cut through the noise with personalized summaries of your watchlist powered by Grok AI.",
  keywords: ["stock", "investing", "AI", "digest", "newsletter", "Grok", "watchlist", "market"],
  authors: [{ name: "Stock Summaries" }],
  openGraph: {
    title: "Stock Summaries | AI-Powered Stock Digests",
    description: "Get AI-curated stock digests delivered to your inbox. Cut through the noise with personalized summaries of your watchlist.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Summaries | AI-Powered Stock Digests",
    description: "Get AI-curated stock digests delivered to your inbox. Cut through the noise with personalized summaries of your watchlist.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
