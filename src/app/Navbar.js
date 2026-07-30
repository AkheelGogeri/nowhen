"use client";
import { useCart } from "./CartContext";

export default function Navbar() {
  const { cart } = useCart();

  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-5"
      style={{ backgroundColor: "#1A1A1A", color: "#F5F2EC" }}
    >
      <div className="text-xl tracking-widest">N | W</div>

      <div className="flex gap-8 text-sm tracking-wide">
        <a href="/" className="hover:opacity-70">HOME</a>
        <a href="/shop" className="hover:opacity-70">SHOP</a>
        <a href="/about" className="hover:opacity-70">ABOUT</a>
        <a href="/cart" className="hover:opacity-70">CART ({cart.length})</a>
      </div>
    </nav>
  );
}