// Shared by server and client components — keep this file free of DB imports.

// Percent saved when a product has a higher "compare at" (MRP) price set.
export function savingsPercent(product) {
  const was = Number(product?.compare_at_price);
  const now = Number(product?.price);
  if (!was || !now || was <= now) return 0;
  return Math.round(((was - now) / was) * 100);
}

// Shipping: a flat fee for a single tee, free from FREE_SHIPPING_MIN_ITEMS up.
export const SHIPPING_FEE = 49;
export const FREE_SHIPPING_MIN_ITEMS = 2;

export function shippingFee(itemCount) {
  return itemCount > 0 && itemCount < FREE_SHIPPING_MIN_ITEMS ? SHIPPING_FEE : 0;
}

// Discount for a validated offer against a cart. Bundle offers (min_items)
// give nothing until the cart has enough items. Used by the cart UI and the
// create-order API so the price shown is always the price charged.
export function offerDiscount(offer, subtotal, itemCount) {
  if (!offer) return 0;
  if (offer.min_items && itemCount < offer.min_items) return 0;
  return offer.discount_percent
    ? Math.round((subtotal * offer.discount_percent) / 100)
    : Math.min(offer.discount_amount, subtotal);
}

export function PriceTag({ product, className = "", style }) {
  const pct = savingsPercent(product);
  return (
    <span className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      <span style={{ color: "#8B1E24", ...style }}>₹{product.price}</span>
      {pct > 0 && (
        <>
          <span className="text-[0.75em] line-through opacity-50 font-normal">₹{product.compare_at_price}</span>
          <span className="text-[0.65em] tracking-wide uppercase font-semibold" style={{ color: "#3E8B4A" }}>
            {pct}% off
          </span>
        </>
      )}
    </span>
  );
}
