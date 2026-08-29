"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import Navbar from "../Navbar";
import { useWishlist } from "../WishlistContext";
import { useCart } from "../CartContext";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-4 sm:px-6 md:px-10 pt-28 pb-16"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <h1 className="text-2xl md:text-3xl tracking-widest mb-8 md:mb-10 text-center">WISHLIST</h1>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Heart size={28} className="opacity-30" />
            <p className="text-center text-sm opacity-60">Your wishlist is empty.</p>
            <Link href="/shop" className="text-xs tracking-[0.2em] uppercase underline mt-2">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {wishlist.map((product) => {
              const image = (product.images && product.images[0]) || product.image;
              const outOfStock = product.in_stock === false;
              return (
                <div key={product.id} className="flex flex-col items-center w-full max-w-xs mx-auto">
                  <Link href={`/shop/${product.id}`} className="w-full">
                    <div
                      className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3"
                      style={{ backgroundColor: "#111" }}
                    >
                      {image && (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 767px) 45vw, 22vw"
                          loading="lazy"
                          className="object-cover"
                        />
                      )}
                      {outOfStock && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
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
                    </div>
                  </Link>
                  <p className="text-sm tracking-wide text-center">{product.name}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "#8B1E24" }}>
                    ₹{product.price}
                  </p>

                  <div className="flex gap-2 mt-3 w-full">
                    {product.sizes && product.sizes.length > 0 ? (
                      <Link
                        href={`/shop/${product.id}`}
                        className="flex-1 py-2.5 text-[10px] tracking-[0.15em] uppercase font-semibold text-center"
                        style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
                      >
                        Select Size
                      </Link>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className="flex-1 py-2.5 text-[10px] tracking-[0.15em] uppercase font-semibold disabled:opacity-40"
                        style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label="Remove from wishlist"
                      className="px-3"
                      style={{ border: "1px solid #333" }}
                    >
                      <Heart size={14} fill="#8B1E24" color="#8B1E24" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
