"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";

const heroImages = ["/img1.jpeg", "/img3.jpeg"];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Slideshow background — all images stacked, only current one visible */}
        {heroImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: index === currentImage ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0) 55%, rgba(13,13,13,0.85) 90%, rgba(13,13,13,0.97) 100%)",
          }}
        />

        {/* New Collection Launched + Shop Now button */}
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center fade-in-up"
          style={{ animationDelay: "1s", opacity: 0 }}
        >
          <p
            className="text-sm tracking-[0.3em] uppercase mb-4"
            style={{ color: "#F5F2EC" }}
          >
            New Collection Launched
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentImage ? "#F5F2EC" : "rgba(245,242,236,0.3)",
                width: index === currentImage ? "24px" : "8px",
              }}
            />
          ))}
        </div>
      </main>

      {/* Moving banner — WEAR THE MOMENT */}
      <div
        className="w-full overflow-hidden py-4 border-y"
        style={{ backgroundColor: "#0D0D0D", borderColor: "#333" }}
      >
        <div className="marquee-track flex whitespace-nowrap w-max">
          {Array(8).fill("WEAR THE MOMENT").map((text, i) => (
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

      {/* Static banner — OUTSIDE OF TIME */}
      <div
        className="w-full py-6 flex items-center justify-center"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <p
          className="text-sm md:text-base tracking-[0.5em] uppercase font-semibold"
          style={{ color: "#8B1E24" }}
        >
          Outside of Time
        </p>
      </div>
    </>
  );
}