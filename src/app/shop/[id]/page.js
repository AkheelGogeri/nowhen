"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../Navbar";
import { useCart } from "../../CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
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
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#000", color: "#F5F2EC" }}>
          <p className="text-sm opacity-60">Loading...</p>
        </main>
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 md:px-10 pt-28 pb-20" style={{ backgroundColor: "#000", color: "#F5F2EC" }}>
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
                    className="w-16 h-16 rounded overflow-hidden flex-shrink-0"
                    style={{
                      border: i === activeImage ? "2px solid #8B1E24" : "1px solid #333",
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
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
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-200"
                style={{
                  ...zoomStyle,
                  transform: zooming ? "scale(2)" : "scale(1)",
                }}
              />
            </div>
          </div>

          {/* Right — details */}
          <div className="flex flex-col">
            <h1 className="text-2xl tracking-wide mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold mb-6" style={{ color: "#8B1E24" }}>
              ₹{product.price}
            </p>

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
                      className="w-12 h-12 flex items-center justify-center text-xs tracking-wide rounded transition-colors"
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

            {error && (
              <p className="text-xs mb-4" style={{ color: "#8B1E24" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleAddToCart}
              className="py-4 text-xs tracking-[0.25em] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-4"
              style={{
                backgroundColor: added ? "#1A1A1A" : "#8B1E24",
                color: "#F5F2EC",
                border: added ? "1px solid #8B1E24" : "1px solid transparent",
              }}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #222" }}>
              <p className="text-xs tracking-[0.15em] uppercase opacity-50 mb-2">Details</p>
              <p className="text-sm opacity-80 leading-relaxed">
                Oversized 240 GSM printed T-shirt. Premium heavyweight cotton, built to last.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}