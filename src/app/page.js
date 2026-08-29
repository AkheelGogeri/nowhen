"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import Navbar from "./Navbar";
import FeaturedCarousel from "./FeaturedCarousel";

const TRUST_BADGES = [
  { Icon: Truck, label: "Fast Shipping", desc: "Dispatched within 2–3 days" },
  { Icon: ShieldCheck, label: "Secure Payment", desc: "Powered by Razorpay" },
  { Icon: RotateCcw, label: "Easy Returns", desc: "Hassle-free exchanges" },
];

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews/recent");
        const data = await res.json();
        if (Array.isArray(data)) setRecentReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    }
    fetchReviews();
  }, []);

  const products = allProducts.slice(0, 8);
  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
  const featuredProducts = allProducts.filter((p) => p.featured);
  const carouselProducts = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 6);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const heroSlides = settings?.hero_slides || [];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#000" }}>
          <p className="text-sm opacity-40" style={{ color: "#F5F2EC" }}>Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Sliding track — all images side by side, track shifts left */}
        {heroSlides.length > 0 && (
          <div
            className="absolute inset-0 flex transition-transform ease-in-out"
            style={{
              width: `${heroSlides.length * 100}%`,
              transform: `translateX(-${currentImage * (100 / heroSlides.length)}%)`,
              transitionDuration: "900ms",
            }}
          >
            {heroSlides.map((slide, i) => (
              <div
                key={i}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / heroSlides.length}%` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center block md:hidden"
                  style={{ backgroundImage: `url('${slide.mobile}')` }}
                />
                <div
                  className="absolute inset-0 bg-cover bg-center hidden md:block"
                  style={{ backgroundImage: `url('${slide.desktop}')` }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0) 45%, rgba(13,13,13,0.85) 88%, rgba(13,13,13,0.97) 100%)",
          }}
        />

        {/* New Collection Launched + Shop Now button */}
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center fade-in-up"
          style={{ animationDelay: "1s", opacity: 0 }}
        >
          <p
            className="text-sm tracking-[0.4em] uppercase mb-4"
            style={{ color: "#F5F2EC" }}
          >
            {settings?.collection_text || "New Collection Launched"}
          </p>

          <Link
            href="/shop"
            className="group relative px-8 py-3 text-xs tracking-[0.3em] uppercase font-semibold overflow-hidden transition-colors duration-300"
            style={{ border: "1px solid #F5F2EC", color: "#F5F2EC" }}
          >
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">
              Shop Now
            </span>
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
              style={{ backgroundColor: "#F5F2EC" }}
            />
          </Link>
        </div>

        {/* Slideshow dots indicator */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    index === currentImage ? "#F5F2EC" : "rgba(245,242,236,0.3)",
                  width: index === currentImage ? "24px" : "8px",
                }}
              />
            ))}
          </div>
        )}

        {/* Small circular brand mark, bottom-left */}
        <div
          className="absolute bottom-8 left-8 z-10 flex items-center justify-center px-3 h-10 rounded-full border"
          style={{ borderColor: "rgba(245,242,236,0.4)", color: "#F5F2EC" }}
        >
          <span
            className="text-sm tracking-[0.15em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            N<span style={{ color: "#8B1E24" }}>|</span>W
          </span>
        </div>
      </main>

      {/* Moving banner */}
      <div
        className="w-full overflow-hidden py-4 border-y"
        style={{ backgroundColor: "#0D0D0D", borderColor: "#333" }}
      >
        <div className="marquee-track flex whitespace-nowrap w-max">
          {Array(8).fill(settings?.marquee_text || "WEAR THE MOMENT").map((text, i) => (
            <span
              key={i}
              className="mx-8 text-sm tracking-[0.4em] font-semibold"
              style={{ color: "#F5F2EC" }}
            >
              {text} ✦
            </span>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="w-full py-10 px-6 md:px-10" style={{ backgroundColor: "#000" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {TRUST_BADGES.map(({ Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon size={22} style={{ color: "#8B1E24" }} />
              <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "#F5F2EC" }}>
                {label}
              </p>
              <p className="text-xs opacity-50">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="py-16 px-6 md:px-10" style={{ backgroundColor: "#0D0D0D" }}>
          <h2
            className="text-xl md:text-2xl tracking-[0.2em] uppercase text-center mb-10"
            style={{ color: "#F5F2EC", fontFamily: "var(--font-display)" }}
          >
            Shop by Category
          </h2>
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="px-8 py-3 text-xs tracking-[0.25em] uppercase transition-colors duration-300 hover:bg-[#F5F2EC] hover:text-black"
                style={{ border: "1px solid #F5F2EC", color: "#F5F2EC" }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Arrivals */}
      {products.length > 0 && (
        <section className="py-16 px-6 md:px-10" style={{ backgroundColor: "#000" }}>
          <h2
            className="text-xl md:text-2xl tracking-[0.2em] uppercase text-center mb-10"
            style={{ color: "#F5F2EC", fontFamily: "var(--font-display)" }}
          >
            Latest Arrivals
          </h2>
      
          <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
            <div className="flex gap-5 pb-2" style={{ width: "max-content" }}>
              {products.map((product) => {
                const image = (product.images && product.images[0]) || product.image;
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="flex-shrink-0 w-48 md:w-56 group"
                  >
                    <div
                      className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3"
                      style={{ backgroundColor: "#111" }}
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="224px"
                        loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-xs tracking-wide" style={{ color: "#F5F2EC" }}>
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "#8B1E24" }}>
                      ₹{product.price}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products carousel */}
      <FeaturedCarousel products={carouselProducts} />

      {/* Customer reviews teaser */}
      {recentReviews.length > 0 && (
        <section className="py-16 px-6 md:px-10" style={{ backgroundColor: "#0D0D0D" }}>
          <h2
            className="text-xl md:text-2xl tracking-[0.2em] uppercase text-center mb-10"
            style={{ color: "#F5F2EC", fontFamily: "var(--font-display)" }}
          >
            What Customers Say
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReviews.map((review) => (
              <Link
                key={review.id}
                href={`/shop/${review.product_id}`}
                className="p-6 rounded flex flex-col gap-3 transition-colors hover:border-[#8B1E24]"
                style={{ border: "1px solid #222" }}
              >
                <span className="inline-flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "#8B7A1E" : "none"}
                      color={i < review.rating ? "#8B7A1E" : "#555"}
                    />
                  ))}
                </span>
                <p className="text-sm opacity-80 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <p className="text-xs opacity-50">
                  {review.name} · {review.product_name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Static banner */}
      <div
        className="w-full py-6 flex items-center justify-center"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <p
          className="text-sm md:text-base tracking-[0.5em] uppercase font-semibold"
          style={{ color: "#8B1E24" }}
        >
          {settings?.banner_text || "Outside of Time"}
        </p>
      </div>
    </>
  );
}