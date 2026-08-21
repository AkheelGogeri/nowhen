"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product, size = null) {
    setCart((prev) => [...prev, { ...product, selectedSize: size, cartId: `${product.id}-${size}-${Date.now()}` }]);
  }

  function removeFromCart(cartId) {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}