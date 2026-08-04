"use client";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useCart } from "../CartContext";

function ProductCard({ product, onAddToCart }) {
  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.image]
  ).filter(Boolean);

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

  function handleAddToCart() {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <div
        className="relative w-full aspect-[4/5] rounded overflow-hidden group"
        style={{ backgroundColor: "#111" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0 }}
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
        className="mt-3 px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: added ? "#1A1A1A" : "#8B1E24",
          color: "#F5F2EC",
          border: added ? "1px solid #8B1E24" : "1px solid transparent",
        }}
      >
        {added ? "✓ Added" : "Add to Cart"}
      </button>
    </div>
  );
}

export default function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-6 md:px-10 pt-28 pb-16"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >

        {loading ? (
          <p className="text-center text-sm opacity-60">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-sm opacity-60">No products available yet.</p>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}