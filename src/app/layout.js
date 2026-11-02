import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import Footer from "./Footer";
import { SITE_URL } from "@/lib/store";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Nowhen — oversized streetwear T-shirts designed to outlast trends. Shop the latest drop. Ships across India, UPI and cards accepted.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nowhen — Oversized Streetwear T-Shirts",
    template: "%s | Nowhen",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Nowhen",
    locale: "en_IN",
    title: "Nowhen — Oversized Streetwear T-Shirts",
    description: DESCRIPTION,
    images: [{ url: "/img1.jpeg", alt: "Nowhen" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${bodoni.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#000" }}>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
