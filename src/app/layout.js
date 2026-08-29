import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import Script from "next/script";
import Footer from "./Footer";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nowhen",
  description: "Nowhen — Outside of time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${bodoni.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
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