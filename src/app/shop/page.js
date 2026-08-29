"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Heart } from "lucide-react";
import Navbar from "../Navbar";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";

function ProductCard({ product, onAddToCart, index = 0 }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.image]
  ).filter(Boolean);

  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, paused]);

  function goPrev(e) {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
    setPaused(true);
  }

  function goNext(e) {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % images.length);
    setPaused(true);
  }

  const outOfStock = product.in_stock === false;

  function handleAddToCart(e) {
    e.stopPropagation();
    if (outOfStock) return;
    if (product.sizes && product.sizes.length > 0) {
      router.push(`/shop/${product.id}`);
      return;
    }
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="flex flex-col items-center w-full max-w-xs mx-auto fade-in-up"
      style={{ opacity: 0, animationDelay: `${Math.min(index, 10) * 70}ms` }}
    >
      <div
        className="relative w-full aspect-[4/5] rounded overflow-hidden group cursor-pointer"
        style={{ backgroundColor: "#111" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onClick={() => router.push(`/shop/${product.id}`)}
      >
        {images.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 22vw"
            className="object-contain transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0 }}
            loading={index < 4 ? "eager" : "lazy"}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: "rgba(13,13,13,0.6)", color: "#F5F2EC" }}
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: "rgba(13,13,13,0.6)", color: "#F5F2EC" }}
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === current ? "#8B1E24" : "rgba(245,242,236,0.4)",
                    width: i === current ? "18px" : "6px",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {outOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <span
              className="text-xs tracking-[0.2em] uppercase px-3 py-1.5 rounded"
              style={{ border: "1px solid #F5F2EC", color: "#F5F2EC" }}
            >
              Out of Stock
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: "rgba(13,13,13,0.6)" }}
        >
          <Heart size={16} fill={wishlisted ? "#8B1E24" : "none"} color={wishlisted ? "#8B1E24" : "#F5F2EC"} />
        </button>
      </div>

      <p className="mt-4 text-sm tracking-wide text-center">{product.name}</p>
      <p
        className="mt-1 text-lg font-semibold tracking-wide"
        style={{ color: "#8B1E24" }}
      >
        ₹{product.price}
      </p>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="mt-3 px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        style={{
          backgroundColor: added ? "#1A1A1A" : "#8B1E24",
          color: "#F5F2EC",
          border: added ? "1px solid #8B1E24" : "1px solid transparent",
        }}
      >
        {outOfStock
          ? "Out of Stock"
          : added
          ? "✓ Added"
          : product.sizes && product.sizes.length > 0
          ? "Select Size"
          : "Add to Cart"}
      </button>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <div
        className="relative w-full aspect-[4/5] rounded overflow-hidden animate-pulse"
        style={{ backgroundColor: "#141414" }}
      />
      <div className="mt-4 h-3 w-32 rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
      <div className="mt-2 h-4 w-16 rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
      <div className="mt-3 h-10 w-32 rounded animate-pulse" style={{ backgroundColor: "#141414" }} />
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function ShopContent() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  function setCategory(cat) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const filtered = products.filter((p) => {
    const matchesQuery = !query || p.name.toLowerCase().includes(query);
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-6 md:px-10 pt-28 pb-16"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        {categories.length > 0 && (
          <div className="max-w-6xl mx-auto flex items-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setCategory("")}
              className="text-xs tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-colors"
              style={{
                backgroundColor: !activeCategory ? "#8B1E24" : "transparent",
                border: `1px solid ${!activeCategory ? "#8B1E24" : "#333"}`,
                color: "#F5F2EC",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="text-xs tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-colors"
                style={{
                  backgroundColor: activeCategory === cat ? "#8B1E24" : "transparent",
                  border: `1px solid ${activeCategory === cat ? "#8B1E24" : "#333"}`,
                  color: "#F5F2EC",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 gap-4 flex-wrap">
          <p className="text-xs opacity-50 tracking-wide">
            {!loading &&
              (query
                ? `${sorted.length} result${sorted.length !== 1 ? "s" : ""} for “${searchParams.get("q")}”`
                : `${sorted.length} product${sorted.length !== 1 ? "s" : ""}`)}
          </p>

          {!loading && sorted.length > 0 && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs tracking-[0.15em] uppercase px-3 py-2 rounded outline-none"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-3xl opacity-30">✦</span>
            <p className="text-center text-sm opacity-60">
              {query ? "No products match your search." : "No products available yet."}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
            {sorted.map((product, index) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} index={index} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}