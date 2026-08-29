"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getOffset(index, active, total) {
  let diff = index - active;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function cardStyle(offset, isMobile) {
  const spread = isMobile ? 130 : 240;
  const scaleStep = isMobile ? 0.16 : 0.22;
  const rotateStep = isMobile ? 18 : 28;

  const abs = Math.abs(offset);
  const hidden = abs > 2;

  return {
    transform: `translateX(${offset * spread}px) scale(${Math.max(1 - abs * scaleStep, 0.4)}) rotateY(${-offset * rotateStep}deg)`,
    zIndex: 10 - abs,
    opacity: hidden ? 0 : 1 - abs * 0.28,
    pointerEvents: hidden ? "none" : "auto",
  };
}

export default function FeaturedCarousel({ products }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const total = products.length;

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 640);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [total, paused]);

  if (total === 0) return null;

  function goPrev() {
    setActive((prev) => (prev - 1 + total) % total);
  }
  function goNext() {
    setActive((prev) => (prev + 1) % total);
  }

  return (
    <section
      className="relative py-20 px-6 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #3D0A10 0%, #1A0507 55%, #0D0D0D 100%)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2
        className="text-xl md:text-2xl tracking-[0.3em] uppercase text-center mb-14"
        style={{ color: "#F5F2EC", fontFamily: "var(--font-display)" }}
      >
        Featured Products
      </h2>

      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ height: isMobile ? 340 : 420, perspective: "1200px" }}
      >
        {total > 1 && (
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-0 sm:left-4 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{ backgroundColor: "rgba(245,242,236,0.12)", color: "#F5F2EC" }}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {products.map((product, index) => {
          const offset = getOffset(index, active, total);
          const style = cardStyle(offset, isMobile);
          const isActive = offset === 0;
          const image = (product.images && product.images[0]) || product.image;

          return (
            <div
              key={product.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                width: isMobile ? 170 : 240,
                ...style,
              }}
              onClick={() => !isActive && setActive(index)}
            >
              <Link
                href={`/shop/${product.id}`}
                className="block rounded-lg overflow-hidden"
                style={{
                  border: "1px solid rgba(245,242,236,0.15)",
                  boxShadow: isActive ? "0 20px 50px rgba(0,0,0,0.6)" : "0 10px 25px rgba(0,0,0,0.4)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div className="relative w-full aspect-[4/5]" style={{ backgroundColor: "#111" }}>
                  {image && (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="240px"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3" style={{ backgroundColor: "rgba(13,13,13,0.9)" }}>
                  <p className="text-xs tracking-wide truncate" style={{ color: "#F5F2EC" }}>
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "#D9727A" }}>
                    ₹{product.price}
                  </p>
                  {isActive && product.description && (
                    <p className="text-[10px] opacity-50 mt-1 line-clamp-2" style={{ color: "#F5F2EC" }}>
                      {product.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}

        {total > 1 && (
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-0 sm:right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{ backgroundColor: "rgba(245,242,236,0.12)", color: "#F5F2EC" }}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
