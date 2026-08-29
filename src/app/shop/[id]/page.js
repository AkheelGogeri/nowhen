"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import Navbar from "../../Navbar";
import { useCart } from "../../CartContext";
import { useWishlist } from "../../WishlistContext";

function StarRow({ rating, size = 14, interactive = false, onRate }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? "#8B7A1E" : "none"}
          color={i < rating ? "#8B7A1E" : "#555"}
          onClick={interactive ? () => onRate(i + 1) : undefined}
          style={interactive ? { cursor: "pointer" } : undefined}
        />
      ))}
    </span>
  );
}

function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setAverage(data.average || 0);
    setCount(data.count || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !rating) {
      setError("Please add your name and a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setSubmitted(true);
      setName("");
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 pt-14" style={{ borderTop: "1px solid #1A1A1A" }}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <h2 className="text-lg tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Reviews
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs tracking-[0.2em] uppercase underline opacity-70 hover:opacity-100"
          >
            Write a review
          </button>
        )}
      </div>

      {!loading && count > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <StarRow rating={Math.round(average)} />
          <span className="text-xs opacity-60">
            {average.toFixed(1)} out of 5 ({count} review{count !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-10 max-w-sm">
          <StarRow rating={rating} size={20} interactive onRate={setRating} />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2.5 rounded outline-none text-sm"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
          />
          <textarea
            placeholder="Your review (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="px-4 py-2.5 rounded outline-none text-sm resize-none"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
          />
          {error && (
            <p className="text-xs" style={{ color: "#8B1E24" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 text-xs tracking-[0.2em] uppercase self-start px-6"
            style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {submitted && (
        <p className="text-xs mb-10" style={{ color: "#3E8B4A" }}>
          Thanks — your review will appear once approved.
        </p>
      )}

      {loading ? (
        <p className="text-xs opacity-50">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs opacity-50">No reviews yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6" style={{ borderBottom: "1px solid #1A1A1A" }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm">{review.name}</span>
                <StarRow rating={review.rating} />
              </div>
              <p className="text-[10px] opacity-40 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
              {review.comment && <p className="text-sm opacity-80">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProducts({ currentId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    async function fetchRelated() {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRelated(data.filter((p) => p.id !== Number(currentId)).slice(0, 4));
      }
    }
    fetchRelated();
  }, [currentId]);

  if (related.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto mt-20 pt-14" style={{ borderTop: "1px solid #1A1A1A" }}>
      <h2 className="text-lg tracking-[0.2em] uppercase text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {related.map((product) => {
          const image = (product.images && product.images[0]) || product.image;
          return (
            <Link key={product.id} href={`/shop/${product.id}`} className="flex flex-col items-center group">
              <div
                className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3"
                style={{ backgroundColor: "#111" }}
              >
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 767px) 45vw, 22vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-xs tracking-wide text-center opacity-80">{product.name}</p>
              <p className="text-sm font-semibold mt-1" style={{ color: "#8B1E24" }}>
                ₹{product.price}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen px-6 md:px-10 pt-28 pb-20" style={{ backgroundColor: "#000", color: "#F5F2EC" }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-2/3 rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
          <div className="h-6 w-24 rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
          <div className="h-24 w-full rounded animate-pulse mt-4" style={{ backgroundColor: "#141414" }} />
        </div>
      </div>
    </main>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [zoomStyle, setZoomStyle] = useState({});
  const [zooming, setZooming] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  function handleMouseMove(e) {
    if (!zooming) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  }

  function toggleZoom() {
    setZooming((prev) => !prev);
  }

  function handleAddToCart() {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size.");
      return;
    }
    setError("");
    addToCart(product, selectedSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <DetailSkeleton />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#000", color: "#F5F2EC" }}>
          <p className="text-sm opacity-60">Product not found.</p>
          <button
            onClick={() => router.push("/shop")}
            className="text-xs tracking-[0.2em] uppercase underline"
          >
            Back to Shop
          </button>
        </main>
      </>
    );
  }

  const images = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
  const outOfStock = product.in_stock === false;

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pb-20" style={{ backgroundColor: "#000", color: "#F5F2EC" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left — image gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-transform hover:scale-105"
                    style={{
                      border: i === activeImage ? "2px solid #8B1E24" : "1px solid #333",
                    }}
                  >
                    <Image src={img} alt="" fill sizes="64px" loading="lazy" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image with hover zoom */}
            <div
              className="flex-1 relative aspect-[4/5] rounded overflow-hidden"
              style={{ backgroundColor: "#111", cursor: zooming ? "zoom-out" : "zoom-in" }}
              onMouseMove={handleMouseMove}
              onClick={toggleZoom}
            >
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width: 767px) 90vw, 45vw"
                priority
                className="object-contain transition-transform duration-200"
                style={{
                  ...zoomStyle,
                  transform: zooming ? "scale(2)" : "scale(1)",
                }}
              />
              {!zooming && (
                <span
                  className="absolute bottom-3 right-3 text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded opacity-0 hover:opacity-100 md:opacity-70 transition-opacity"
                  style={{ backgroundColor: "rgba(13,13,13,0.7)", color: "#F5F2EC" }}
                >
                  Click to zoom
                </span>
              )}
            </div>
          </div>

          {/* Right — details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl tracking-wide">{product.name}</h1>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
              >
                <Heart
                  size={22}
                  fill={isWishlisted(product.id) ? "#8B1E24" : "none"}
                  color={isWishlisted(product.id) ? "#8B1E24" : "#F5F2EC"}
                />
              </button>
            </div>
            <p className="text-2xl font-semibold mb-2" style={{ color: "#8B1E24" }}>
              ₹{product.price}
            </p>
            {outOfStock && (
              <p className="text-xs tracking-[0.15em] uppercase mb-4" style={{ color: "#8B1E24" }}>
                Out of Stock
              </p>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-[0.15em] uppercase opacity-70 mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setError("");
                      }}
                      className="w-12 h-12 flex items-center justify-center text-xs tracking-wide rounded transition-all duration-150 hover:scale-105"
                      style={{
                        backgroundColor: selectedSize === size ? "#8B1E24" : "transparent",
                        border: "1px solid " + (selectedSize === size ? "#8B1E24" : "#333"),
                        color: "#F5F2EC",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs tracking-[0.15em] uppercase opacity-70 mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center rounded transition-colors hover:opacity-70"
                  style={{ border: "1px solid #333" }}
                >
                  −
                </button>
                <span className="text-sm w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center rounded transition-colors hover:opacity-70"
                  style={{ border: "1px solid #333" }}
                >
                  +
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs mb-4" style={{ color: "#8B1E24" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="hidden md:block py-4 text-xs tracking-[0.25em] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-4 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                backgroundColor: added ? "#1A1A1A" : "#8B1E24",
                color: "#F5F2EC",
                border: added ? "1px solid #8B1E24" : "1px solid transparent",
              }}
            >
              {outOfStock ? "Out of Stock" : added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            <div className="mt-2 md:mt-6 pt-6" style={{ borderTop: "1px solid #222" }}>
              <p className="text-xs tracking-[0.15em] uppercase opacity-50 mb-2">Details</p>
              <p className="text-sm opacity-80 leading-relaxed">
                {product.description || "Details coming soon."}
              </p>
            </div>
          </div>
        </div>

        <Reviews productId={id} />
        <RelatedProducts currentId={id} />
      </main>

      {/* Sticky mobile add-to-cart bar */}
      <div
        className="fixed bottom-0 left-0 w-full z-40 md:hidden px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: "#0D0D0D", borderTop: "1px solid #222" }}
      >
        <span className="text-sm font-semibold flex-shrink-0" style={{ color: "#8B1E24" }}>
          ₹{product.price}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-all disabled:opacity-40"
          style={{
            backgroundColor: added ? "#1A1A1A" : "#8B1E24",
            color: "#F5F2EC",
            border: added ? "1px solid #8B1E24" : "1px solid transparent",
          }}
        >
          {outOfStock ? "Out of Stock" : added ? "✓ Added" : "Add to Cart"}
        </button>
      </div>
    </>
  );
}
