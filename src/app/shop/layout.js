// The shop page itself is a client component, so its metadata lives here.
export const metadata = {
  title: "Shop Oversized T-Shirts",
  description: "Shop Nowhen oversized streetwear T-shirts. Relaxed oversized fit, shipped across India.",
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({ children }) {
  return children;
}
