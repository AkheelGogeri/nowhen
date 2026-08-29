"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const CartContext = createContext();
const STORAGE_KEY = "nowhen_cart";

function cartId(productId, size) {
  return `${productId}-${size || "nosize"}`;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, size = null, qty = 1) {
    const id = cartId(product.id, size);
    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === id);
      if (existing) {
        return prev.map((item) =>
          item.cartId === id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, selectedSize: size, cartId: id, qty }];
    });
  }

  function removeFromCart(cartId) {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }

  function updateQty(cartId, qty) {
    if (qty < 1) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, qty } : item)));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
