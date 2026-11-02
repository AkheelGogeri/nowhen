import { getProduct, SITE_URL } from "@/lib/store";

// The product page is a client component (sizes, zoom, cart), so the
// server-side bits — link-preview metadata and Google's product data — live here.

function productImages(product) {
  return (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description =
    (product.description && product.description.slice(0, 155)) ||
    `${product.name} — ₹${product.price}. Oversized fit, ships across India.`;
  const images = productImages(product).slice(0, 4);

  return {
    title: `${product.name} — ₹${product.price}`,
    description,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      type: "website",
      siteName: "Nowhen",
      title: `${product.name} — ₹${product.price}`,
      description,
      url: `/shop/${product.id}`,
      images: images.map((url) => ({ url, alt: product.name })),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductLayout({ children, params }) {
  const { id } = await params;
  const product = await getProduct(id);

  const inStock =
    product &&
    product.in_stock !== false &&
    (product.stock_by_size && Object.keys(product.stock_by_size).length > 0
      ? Object.values(product.stock_by_size).some((n) => Number(n) > 0)
      : product.stock_qty == null || Number(product.stock_qty) > 0);

  // schema.org Product data lets Google show price and stock in search results.
  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productImages(product),
    description: product.description || undefined,
    brand: { "@type": "Brand", name: "Nowhen" },
    category: product.category || undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      {children}
    </>
  );
}
