"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const WishlistContext = createContext();
const STORAGE_KEY = "nowhen_wishlist";

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  function isWishlisted(productId) {
    return wishlist.some((item) => item.id === productId);
  }

  function toggleWishlist(product) {
    setWishlist((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    );
  }

  function removeFromWishlist(productId) {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
