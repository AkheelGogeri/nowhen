"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart?.length || 0;

  const pathname = usePathname();

  const pageNames = {
    "/shop": "Shop",
    "/about": "About",
    "/contact": "Contact",
    "/cart": "Cart",
  };

  const currentPage = pageNames[pathname];

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-4"
      style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}
    >
      {/* Left — nav links (desktop) */}
      <div className="hidden md:flex items-center gap-8 flex-1">
        <Link
          href="/shop"
          className="text-sm tracking-[0.25em] uppercase hover:opacity-70 transition-opacity"
        >
          Shop
        </Link>
        <Link
          href="/about"
          className="text-sm tracking-[0.25em] uppercase hover:opacity-70 transition-opacity"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-sm tracking-[0.25em] uppercase hover:opacity-70 transition-opacity"
        >
          Contact
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden flex-1 flex justify-start"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Center — logo */}
      <Link href="/" className="flex-1 flex items-center justify-center gap-2">
        {currentPage && (
          <span
            className="text-lg md:text-xl tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentPage}
          </span>
        )}
        <Image
          src="/logo-nw.png"
          alt="Nowhen"
          width={80}
          height={26}
          className="h-6 md:h-7 w-auto"
          priority
        />
      </Link>

      {/* Right — icons */}
      <div className="flex items-center justify-end gap-6 flex-1">
        <button aria-label="Search" className="hover:opacity-70 transition-opacity">
          <Search size={24} />
        </button>
        <Link href="/account" aria-label="Account" className="hover:opacity-70 transition-opacity">
          <User size={24} />
        </Link>
        <Link
          href="/cart"
          aria-label="Cart"
          className="relative hover:opacity-70 transition-opacity"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full flex flex-col items-center gap-6 py-6 md:hidden"
          style={{ backgroundColor: "#0D0D0D", borderTop: "1px solid #333" }}
        >
          <Link
            href="/shop"
            className="text-sm tracking-[0.25em] uppercase"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm tracking-[0.25em] uppercase"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm tracking-[0.25em] uppercase"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}